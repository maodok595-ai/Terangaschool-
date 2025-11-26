# TERANGASCHOOL - Educational Platform

## Overview

TERANGASCHOOL is a comprehensive Learning Management System (LMS) designed for French-speaking students from primary school through higher education (Primaire, Collège, Lycée, and SIEM). The platform provides access to PDF course materials and live teaching sessions via video conferencing, connecting students with qualified teachers.

**Author:** Maodo Ka

The application is built as a full-stack web application with a React-based frontend and Express backend, supporting three user roles: students, teachers, and administrators. Students can browse and access courses, teachers can create and manage educational content, and administrators oversee the platform including teacher approvals.

## Admin Credentials (Secured)

- Admin credentials are stored securely in environment variables:
  - `ADMIN_EMAIL` - The admin email address
  - `ADMIN_PASSWORD` - The admin password
- These are read from environment variables in `server/routes.ts` and the admin user is created automatically on startup
- For Render deployment, these must be configured in the Render dashboard environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design follows Material Design principles with LMS aesthetics
- Theme system supporting light/dark modes with system preference detection
- Inter font family from Google Fonts for typography

**State Management Strategy:**
- Server state managed via TanStack Query with query invalidation patterns
- Form state handled by React Hook Form with Zod validation
- Authentication state cached in React Query with 5-minute stale time
- Local UI state managed with React hooks (useState, useContext)

**Navigation & Redirects (IMPORTANT):**
- All post-authentication redirects use `window.location.replace()` for reliability in production
- ProtectedPage component uses `useEffect` with `window.location.href` for redirects
- This ensures redirects work reliably on both Replit and Render deployments

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Separate entry points for development (index-dev.ts) and production (index-prod.ts)
- Development mode integrates Vite middleware for hot module replacement
- Production mode serves pre-built static assets

**Authentication & Session Management:**
- Custom email/password authentication with bcryptjs for password hashing
- Role selection during login (student, teacher, admin)
- PostgreSQL-backed session storage via connect-pg-simple
- HTTP-only cookies for session tokens with 7-day TTL
- Role-based access control middleware (isAuthenticated, isTeacher, isAdmin)
- `trust proxy` enabled for production (required for Render and other proxied platforms)

**File Upload System:**
- Multer middleware for handling PDF course uploads
- Local filesystem storage in /uploads directory
- 50MB file size limit enforced
- PDF-only file type validation

**API Design:**
- RESTful endpoints under /api prefix
- Role-based route protection
- JSON request/response format
- Error handling with appropriate HTTP status codes
- Health check endpoint at `/api/health` for deployment monitoring

### Data Storage

**Database:**
- PostgreSQL via standard `pg` driver (compatible with Render, Neon, and other providers)
- Drizzle ORM for type-safe database operations
- SSL configuration enabled automatically in production

**Schema Design:**
- Users table with role (student/teacher/admin) and teacher status (pending/approved/rejected)
- Courses table for PDF materials with teacher relationship
- LiveCourses table for scheduled video sessions with Jitsi integration
- Enrollments table for student course registrations
- Sessions table managed by connect-pg-simple (NOT in Drizzle schema)

**Database Patterns:**
- Drizzle schema defined in shared/schema.ts for type sharing between frontend/backend
- Storage layer abstraction (storage.ts) providing repository-like interface
- Zod schemas generated from Drizzle tables for runtime validation
- Relational queries joining teachers with courses/live courses

### External Dependencies

**Video Conferencing:**
- Jitsi Meet for live teaching sessions
- Unique room IDs generated using crypto.randomBytes
- URL format: https://meet.jit.si/{roomId}
- Room IDs stored in database with format: edurenfort_{hex}

**Database Service:**
- Standard PostgreSQL (works with Render, Neon, or any PostgreSQL provider)
- SSL configuration enabled in production
- DATABASE_URL environment variable for connection string

**Third-Party Libraries:**
- date-fns for date manipulation and formatting (French locale)
- Radix UI primitives for accessible component foundations
- Lucide React for icon system
- Tailwind CSS for utility-first styling
- Class Variance Authority (CVA) for component variant management

**Development Tools:**
- Replit-specific Vite plugins for error overlay and dev banner
- ESBuild for production bundling
- TypeScript compiler for type checking
- Drizzle Kit for schema migrations

## Deployment

### Replit Deployment
- Runs in development mode with hot reload
- Uses `npm run dev` command
- Database connection without SSL

### Render Deployment

**Build Process:**
1. `scripts/build.sh` - Builds frontend with Vite and backend with esbuild
2. `scripts/start.sh` - Syncs database and starts production server

**Environment Variables (Required):**
- `NODE_ENV=production`
- `PORT=10000`
- `SESSION_SECRET` (auto-generated)
- `DATABASE_URL` (from Render PostgreSQL)

**Important Render Configuration:**
- Health check path: `/api/health`
- Trust proxy enabled for session cookies
- SSL enabled for database connection
- Static files served from `dist/public`

**Pre-deployment Database Setup:**
If you get "sid is in primary key" error, run in Render Shell:
```bash
DROP TABLE IF EXISTS sessions CASCADE;
npx drizzle-kit push
```

## File Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components (Navbar, ThemeToggle, etc.)
│   │   ├── hooks/        # Custom hooks (useAuth, use-toast)
│   │   ├── lib/          # Utilities (queryClient, constants)
│   │   ├── pages/        # Page components (Login, Register, Dashboard, etc.)
│   │   └── App.tsx       # Main app with routing
│   └── index.html
├── server/               # Backend Express application
│   ├── app.ts            # Express app setup
│   ├── auth.ts           # Authentication middleware and routes
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   ├── index-dev.ts      # Development entry point
│   └── index-prod.ts     # Production entry point
├── shared/
│   └── schema.ts         # Drizzle schema and types
├── scripts/
│   ├── build.sh          # Production build script
│   └── start.sh          # Production start script
├── render.yaml           # Render deployment configuration
├── vite.config.render.ts # Vite config for Render builds
└── uploads/              # PDF file storage
```

## Recent Changes (November 2025)

1. **Database Driver Migration:** Changed from @neondatabase/serverless to standard pg driver for compatibility with Render and other PostgreSQL providers

2. **Session Management Fix:** Removed sessions table from Drizzle schema - now managed entirely by connect-pg-simple

3. **Production Redirect Fix:** All navigation redirects now use `window.location.replace()` instead of wouter's `setLocation()` for reliability in production

4. **Session Configuration:** Added `trust proxy` and `proxy: true` for production session handling behind reverse proxies

5. **ProtectedPage Component:** Rewritten to use `useEffect` with `window.location.href` for reliable authentication checks in production

6. **Role Selection UI:** Changed from tabs to radio buttons with emojis for role selection (Étudiant, Professeur, Administrateur)

7. **Production Path Resolution:** Updated server/index-prod.ts to use multiple fallback paths for finding the public directory

8. **Teacher Validation Removed:** Teachers are now automatically approved upon registration - no admin validation required

9. **Database URL Fallback:** Both db.ts and auth.ts now support RENDER_DATABASE_URL as fallback if DATABASE_URL is not set

10. **Session Security:** SESSION_SECRET is now logged as a warning if not set in production (strongly recommended to set it)

11. **Admin Dashboard Access:** Admins can now access the teacher dashboard and create courses/lives (isTeacher middleware allows admin role)

12. **Scripts Cleanup:** Removed automatic session table drop from start.sh to preserve user sessions between deployments

13. **Service Worker API Cache Fix:** Updated sw.js to completely bypass caching for all `/api/` routes. Previously, some API routes were being cached with cacheFirst strategy, causing stale data issues after mutations.

14. **CRUD Operations Complete:** Added full CRUD functionality:
    - PATCH routes for courses and live-courses (edit functionality)
    - DELETE routes for courses, live-courses, and users
    - Edit modals in TeacherDashboard with pre-filled forms
    - Proper React Query invalidation on all mutations

15. **React Query Configuration:** Updated queryClient to use:
    - staleTime: 30 seconds (was Infinity, causing cache issues)
    - refetchOnMount: true
    - refetchOnWindowFocus: true

## Known Limitations

### Ephemeral File Storage on Render
**Important:** Render uses ephemeral filesystem by default. This means uploaded PDF files in the `/uploads` directory will be lost on each redeploy or restart.

**Solutions:**
1. **Render Disk (Recommended):** Attach a Render Disk volume mounted at `./uploads` for persistent storage
2. **External Storage:** Migrate to S3, Cloudinary, or another object storage service and store public URLs
3. **Database Storage:** For smaller files, consider storing files as base64 in the database (not recommended for large PDFs)

To attach a Render Disk:
1. Go to your Render Dashboard
2. Select your web service
3. Go to "Disks" tab
4. Add a new disk mounted at `/uploads`

## Render Deployment Troubleshooting

### If the app doesn't work on Render:

1. **Check the logs in Render Dashboard** - Look for any error messages

2. **Verify environment variables:**
   - NODE_ENV=production
   - PORT=10000
   - SESSION_SECRET (should be auto-generated)
   - DATABASE_URL (from Render PostgreSQL)

3. **If sessions don't persist:**
   - Run in Render Shell: `DROP TABLE IF EXISTS sessions CASCADE;`
   - Then: `npx drizzle-kit push`
   - Restart the service

4. **If static files aren't served:**
   - Check that dist/public folder exists after build
   - Verify vite.config.render.ts is being used

5. **If API calls fail:**
   - Check that /api/health returns 200
   - Verify DATABASE_URL is correctly set
   - Check SSL configuration in db.ts

### Manual Deployment Steps:
```bash
# In Render Shell
chmod +x scripts/build.sh scripts/start.sh
./scripts/build.sh
./scripts/start.sh
```
