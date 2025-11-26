import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Note: The sessions table is managed by connect-pg-simple, not Drizzle
// It will be created automatically when the app starts

// User roles enum
export const UserRole = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Teacher status enum
export const TeacherStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type TeacherStatusType = (typeof TeacherStatus)[keyof typeof TeacherStatus];

// Education levels enum
export const EducationLevel = {
  PRIMAIRE: "primaire",
  COLLEGE: "college",
  LYCEE: "lycee",
  SIEM: "siem",
} as const;

export type EducationLevelType = (typeof EducationLevel)[keyof typeof EducationLevel];

// Subjects enum
export const Subject = {
  MATHEMATIQUES: "mathematiques",
  FRANCAIS: "francais",
  ANGLAIS: "anglais",
  PHYSIQUE: "physique",
  CHIMIE: "chimie",
  SVT: "svt",
  HISTOIRE_GEO: "histoire_geo",
  PHILOSOPHIE: "philosophie",
  INFORMATIQUE: "informatique",
  ECONOMIE: "economie",
} as const;

export type SubjectType = (typeof Subject)[keyof typeof Subject];

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").default("").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").$type<UserRoleType>().default("student").notNull(),
  teacherStatus: varchar("teacher_status").$type<TeacherStatusType>(),
  bio: text("bio"),
  specialization: varchar("specialization"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table (PDF courses)
export const courses = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject").$type<SubjectType>().notNull(),
  level: varchar("level").$type<EducationLevelType>().notNull(),
  pdfUrl: varchar("pdf_url").notNull(),
  pdfFileName: varchar("pdf_file_name"),
  thumbnailUrl: varchar("thumbnail_url"),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live courses table (Jitsi sessions)
export const liveCourses = pgTable("live_courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject").$type<SubjectType>().notNull(),
  level: varchar("level").$type<EducationLevelType>().notNull(),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  jitsiRoomId: varchar("jitsi_room_id").notNull().unique(),
  jitsiUrl: varchar("jitsi_url").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // in minutes
  isActive: boolean("is_active").default(false),
  isEnded: boolean("is_ended").default(false),
  maxParticipants: integer("max_participants").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course enrollments (students enrolled in courses)
export const enrollments = pgTable("enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  studentId: varchar("student_id").notNull().references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  liveCourseId: integer("live_course_id").references(() => liveCourses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  liveCourses: many(liveCourses),
  enrollments: many(enrollments),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

export const liveCoursesRelations = relations(liveCourses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [liveCourses.teacherId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  liveCourse: one(liveCourses, {
    fields: [enrollments.liveCourseId],
    references: [liveCourses.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertLiveCourseSchema = createInsertSchema(liveCourses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  jitsiRoomId: true,
  jitsiUrl: true,
  isActive: true,
  isEnded: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type LiveCourse = typeof liveCourses.$inferSelect;
export type InsertLiveCourse = z.infer<typeof insertLiveCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

// Extended types with relations
export type CourseWithTeacher = Course & { teacher: User };
export type LiveCourseWithTeacher = LiveCourse & { teacher: User };

// Validation schemas for forms
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(6, "Confirmez le mot de passe"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["student", "teacher", "admin"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const registerTeacherSchema = z.object({
  specialization: z.string().min(2, "La spécialisation est requise"),
  bio: z.string().min(10, "La bio doit contenir au moins 10 caractères"),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  subject: z.enum([
    "mathematiques", "francais", "anglais", "physique", 
    "chimie", "svt", "histoire_geo", "philosophie", 
    "informatique", "economie"
  ]),
  level: z.enum(["primaire", "college", "lycee", "siem"]),
});

export const createLiveCourseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  subject: z.enum([
    "mathematiques", "francais", "anglais", "physique", 
    "chimie", "svt", "histoire_geo", "philosophie", 
    "informatique", "economie"
  ]),
  level: z.enum(["primaire", "college", "lycee", "siem"]),
  scheduledAt: z.string().min(1, "La date est requise"),
  duration: z.number().min(15).max(180).default(60),
});
