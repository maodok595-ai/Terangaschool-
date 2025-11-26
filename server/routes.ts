import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isTeacher, isAdmin, createAdminUser } from "./auth";
import { createCourseSchema, createLiveCourseSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF sont autorisés"));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

function generateJitsiRoomId(): string {
  return `edurenfort_${randomBytes(8).toString("hex")}`;
}

function generateJitsiUrl(roomId: string): string {
  return `https://meet.jit.si/${roomId}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  await setupAuth(app);

  // Create admin user with error handling using environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (adminEmail && adminPassword) {
    try {
      await createAdminUser(adminEmail, adminPassword);
      console.log("Admin user check completed");
    } catch (error) {
      console.error("Failed to create admin user:", error);
      console.log("The admin user will be created once the database is properly synced");
    }
  } else {
    console.log("ADMIN_EMAIL or ADMIN_PASSWORD not set - skipping admin user creation");
  }

  app.post("/api/become-teacher", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { specialization, bio } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "teacher") {
        return res.status(400).json({ message: "Already a teacher" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ message: "Admins cannot become teachers" });
      }

      const updatedUser = await storage.upsertUser({
        id: userId,
        email: user.email,
        role: "teacher",
        teacherStatus: "approved",
        specialization,
        bio,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error becoming teacher:", error);
      res.status(500).json({ message: "Failed to submit teacher application" });
    }
  });

  app.get("/api/courses", async (req, res) => {
    try {
      const { search, level, subject, limit } = req.query;
      let courses = await storage.getCourses({
        search: search as string,
        level: level as string,
        subject: subject as string,
      });

      if (limit) {
        courses = courses.slice(0, parseInt(limit as string));
      }

      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      await storage.incrementCourseViews(id);

      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", isAuthenticated, isTeacher, upload.single("pdf"), async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { title, description, subject, level } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const validation = createCourseSchema.safeParse({ title, description, subject, level });
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      const pdfUrl = `/uploads/${req.file.filename}`;
      const course = await storage.createCourse({
        title,
        description,
        subject,
        level,
        teacherId: userId,
        pdfUrl,
        pdfFileName: req.file.originalname,
        isPublished: true,
      } as any);

      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = parseInt(req.params.id);

      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.teacherId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this course" });
      }

      await storage.deleteCourse(id);
      res.json({ message: "Course deleted" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  app.get("/api/live-courses", async (req, res) => {
    try {
      const { status, level, subject, upcoming, limit } = req.query;
      let liveCourses = await storage.getLiveCourses({
        status: upcoming === "true" ? "upcoming" : (status as string),
        level: level as string,
        subject: subject as string,
      });

      if (limit) {
        liveCourses = liveCourses.slice(0, parseInt(limit as string));
      }

      res.json(liveCourses);
    } catch (error) {
      console.error("Error fetching live courses:", error);
      res.status(500).json({ message: "Failed to fetch live courses" });
    }
  });

  app.get("/api/live-courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const liveCourse = await storage.getLiveCourse(id);

      if (!liveCourse) {
        return res.status(404).json({ message: "Live course not found" });
      }

      res.json(liveCourse);
    } catch (error) {
      console.error("Error fetching live course:", error);
      res.status(500).json({ message: "Failed to fetch live course" });
    }
  });

  app.post("/api/live-courses", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { title, description, subject, level, scheduledAt, duration } = req.body;

      const validation = createLiveCourseSchema.safeParse({ 
        title, 
        description, 
        subject, 
        level, 
        scheduledAt,
        duration: duration || 60 
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      const jitsiRoomId = generateJitsiRoomId();
      const jitsiUrl = generateJitsiUrl(jitsiRoomId);

      const liveCourse = await storage.createLiveCourse({
        title,
        description,
        subject,
        level,
        teacherId: userId,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        jitsiRoomId,
        jitsiUrl,
        maxParticipants: 100,
      } as any);

      res.status(201).json(liveCourse);
    } catch (error) {
      console.error("Error creating live course:", error);
      res.status(500).json({ message: "Failed to create live course" });
    }
  });

  app.post("/api/live-courses/:id/start", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = parseInt(req.params.id);

      const liveCourse = await storage.getLiveCourse(id);
      if (!liveCourse) {
        return res.status(404).json({ message: "Live course not found" });
      }

      if (liveCourse.teacherId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await storage.startLive(id);
      res.json(updated);
    } catch (error) {
      console.error("Error starting live:", error);
      res.status(500).json({ message: "Failed to start live" });
    }
  });

  app.post("/api/live-courses/:id/end", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = parseInt(req.params.id);

      const liveCourse = await storage.getLiveCourse(id);
      if (!liveCourse) {
        return res.status(404).json({ message: "Live course not found" });
      }

      if (liveCourse.teacherId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updated = await storage.endLive(id);
      res.json(updated);
    } catch (error) {
      console.error("Error ending live:", error);
      res.status(500).json({ message: "Failed to end live" });
    }
  });

  app.delete("/api/live-courses/:id", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const id = parseInt(req.params.id);

      const liveCourse = await storage.getLiveCourse(id);
      if (!liveCourse) {
        return res.status(404).json({ message: "Live course not found" });
      }

      if (liveCourse.teacherId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this live" });
      }

      await storage.deleteLiveCourse(id);
      res.json({ message: "Live course deleted" });
    } catch (error) {
      console.error("Error deleting live course:", error);
      res.status(500).json({ message: "Failed to delete live course" });
    }
  });

  app.get("/api/stats/student", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getStudentStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/teacher", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getTeacherStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/admin", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/teacher/courses", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const courses = await storage.getTeacherCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/teacher/live-courses", isAuthenticated, isTeacher, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const liveCourses = await storage.getTeacherLiveCourses(userId);
      res.json(liveCourses);
    } catch (error) {
      console.error("Error fetching teacher live courses:", error);
      res.status(500).json({ message: "Failed to fetch live courses" });
    }
  });

  app.get("/api/admin/pending-teachers", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const teachers = await storage.getPendingTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching pending teachers:", error);
      res.status(500).json({ message: "Failed to fetch pending teachers" });
    }
  });

  app.post("/api/admin/teachers/:id/approve", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.approveTeacher(id);
      if (!user) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error approving teacher:", error);
      res.status(500).json({ message: "Failed to approve teacher" });
    }
  });

  app.post("/api/admin/teachers/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.rejectTeacher(id);
      if (!user) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error rejecting teacher:", error);
      res.status(500).json({ message: "Failed to reject teacher" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/courses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const courses = await storage.getCourses({});
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/admin/live-courses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const liveCourses = await storage.getLiveCourses({});
      res.json(liveCourses);
    } catch (error) {
      console.error("Error fetching live courses:", error);
      res.status(500).json({ message: "Failed to fetch live courses" });
    }
  });

  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await storage.getApprovedTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  }, express.static(uploadsDir));

  app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  });

  const httpServer = createServer(app);

  return httpServer;
}
