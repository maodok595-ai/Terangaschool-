# TERANGASCHOOL - Educational Platform

## Overview

TERANGASCHOOL is a comprehensive Learning Management System (LMS) designed for French-speaking students from primary school through higher education (Primaire, Collège, Lycée, and SIEM). The platform provides access to PDF course materials and live teaching sessions via video conferencing, connecting students with qualified teachers.

**Author:** Maodo Ka

The application is built as a full-stack web application with a React-based frontend and Express backend, supporting three user roles: students, teachers, and administrators. Students can browse and access courses, teachers can create and manage educational content, and administrators oversee the platform including teacher approvals.

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
- Design follows Material Design principles with LMS aesthetics inspired by Coursera and Notion
- Theme system supporting light/dark modes with system preference detection
- Inter font family from Google Fonts for typography

**State Management Strategy:**
- Server state managed via TanStack Query with query invalidation patterns
- Form state handled by React Hook Form with Zod validation
- Authentication state cached in React Query with 5-minute stale time
- Local UI state managed with React hooks (useState, useContext)

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server and API routing
- Separate entry points for development (index-dev.ts) and production (index-prod.ts)
- Development mode integrates Vite middleware for hot module replacement
- Production mode serves pre-built static assets

**Authentication & Session Management:**
- Replit Auth integration using OpenID Connect (OIDC) strategy
- Passport.js for authentication middleware
- PostgreSQL-backed session storage via connect-pg-simple
- HTTP-only cookies for session tokens with 7-day TTL
- Role-based access control middleware (isAuthenticated, isTeacher, isAdmin)

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

### Data Storage

**Database:**
- PostgreSQL via Neon serverless platform (@neondatabase/serverless)
- Drizzle ORM for type-safe database operations
- WebSocket support for serverless PostgreSQL connections

**Schema Design:**
- Users table with role (student/teacher/admin) and teacher status (pending/approved/rejected)
- Courses table for PDF materials with teacher relationship
- LiveCourses table for scheduled video sessions with Jitsi integration
- Enrollments table for student course registrations
- Sessions table for Express session storage

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

**Authentication Provider:**
- Replit OIDC for user authentication
- Token refresh mechanism for session extension
- User profile data (name, email, image) synced from OIDC provider

**Database Service:**
- Neon PostgreSQL serverless database
- Connection pooling via @neondatabase/serverless Pool
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