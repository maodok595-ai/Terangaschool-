import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: string;
  }
}

export async function setupAuth(app: Express) {
  // Require SESSION_SECRET in production for security
  const sessionSecret = process.env.SESSION_SECRET;
  
  // In production, SESSION_SECRET is required for security
  if (process.env.NODE_ENV === 'production' && !sessionSecret) {
    console.error("FATAL: SESSION_SECRET is required in production. Please set it in your environment variables.");
    // Use a secure fallback but log the warning prominently
    console.error("Using a generated fallback session secret. This is NOT secure for production!");
  }
  
  const finalSessionSecret = sessionSecret || "edurenfort-secret-key-" + Math.random().toString(36).substring(2);

  // Trust first proxy (required for Render and other platforms behind proxies)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Support both DATABASE_URL and RENDER_DATABASE_URL for flexibility
  const databaseUrl = process.env.DATABASE_URL || process.env.RENDER_DATABASE_URL;
  
  const poolConfig: any = {
    connectionString: databaseUrl,
  };
  
  // Add SSL configuration for production (required by Render)
  if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = {
      rejectUnauthorized: false
    };
  }
  
  const pool = new Pool(poolConfig);

  const sessionStore = new PgSession({
    pool: pool as any,
    tableName: "sessions",
    createTableIfMissing: true,
  });

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(
    session({
      store: sessionStore,
      secret: finalSessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: isProduction, // Trust the reverse proxy
      cookie: {
        httpOnly: true,
        secure: isProduction, // Use secure cookies in production (HTTPS)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax", // Same-site policy (frontend and backend on same domain)
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      // Block admin registration - admins can only be created by other admins
      if (role === "admin") {
        return res.status(403).json({ message: "L'inscription en tant qu'administrateur n'est pas autorisée" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Teachers are automatically approved (no validation required)
      let teacherStatus: string | undefined;
      if (role === "teacher") {
        teacherStatus = "approved";
      }

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        teacherStatus,
      });

      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Validate that the selected role matches the user's actual role
      if (role && role !== user.role) {
        const roleNames: Record<string, string> = {
          student: "étudiant",
          teacher: "professeur",
          admin: "administrateur"
        };
        const actualRoleName = roleNames[user.role] || user.role;
        return res.status(403).json({ 
          message: `Ce compte est un compte ${actualRoleName}. Veuillez sélectionner le bon rôle.` 
        });
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Déconnexion réussie" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  next();
};

export const isTeacher: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return res.status(403).json({ message: "Accès réservé aux enseignants" });
  }

  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }

  next();
};

export async function createAdminUser(email: string, password: string) {
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    console.log("Admin user already exists");
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await storage.createUser({
    email,
    password: hashedPassword,
    firstName: "Admin",
    lastName: "Principal",
    role: "admin",
  });

  console.log("Admin user created successfully");
  return admin;
}
