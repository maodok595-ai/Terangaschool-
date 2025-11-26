import {
  users,
  courses,
  liveCourses,
  enrollments,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type LiveCourse,
  type InsertLiveCourse,
  type Enrollment,
  type InsertEnrollment,
  type CourseWithTeacher,
  type LiveCourseWithTeacher,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, sql, ilike, isNull, not, gte, lte } from "drizzle-orm";

interface TeacherWithStats extends User {
  courseCount?: number;
  liveCount?: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: { email: string; password: string; firstName: string; lastName: string; role: string; teacherStatus?: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserRole(id: string, role: string, teacherStatus?: string): Promise<User | undefined>;
  getPendingTeachers(): Promise<User[]>;
  getApprovedTeachers(): Promise<TeacherWithStats[]>;
  approveTeacher(id: string): Promise<User | undefined>;
  rejectTeacher(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  getCourses(filters?: { search?: string; level?: string; subject?: string; teacherId?: string }): Promise<CourseWithTeacher[]>;
  getCourse(id: number): Promise<CourseWithTeacher | undefined>;
  createCourse(course: InsertCourse & { pdfUrl: string; pdfFileName?: string }): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  incrementCourseViews(id: number): Promise<void>;
  getTeacherCourses(teacherId: string): Promise<Course[]>;

  getLiveCourses(filters?: { status?: string; level?: string; subject?: string; teacherId?: string }): Promise<LiveCourseWithTeacher[]>;
  getLiveCourse(id: number): Promise<LiveCourseWithTeacher | undefined>;
  createLiveCourse(liveCourse: InsertLiveCourse & { jitsiRoomId: string; jitsiUrl: string }): Promise<LiveCourse>;
  updateLiveCourse(id: number, liveCourse: Partial<InsertLiveCourse>): Promise<LiveCourse | undefined>;
  deleteLiveCourse(id: number): Promise<boolean>;
  startLive(id: number): Promise<LiveCourse | undefined>;
  endLive(id: number): Promise<LiveCourse | undefined>;
  getTeacherLiveCourses(teacherId: string): Promise<LiveCourse[]>;

  getEnrollment(studentId: string, courseId?: number, liveCourseId?: number): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getStudentEnrollments(studentId: string): Promise<Enrollment[]>;

  getStudentStats(studentId: string): Promise<{ totalCourses: number; upcomingLives: number; studyHours: number; enrolledCourses: number }>;
  getTeacherStats(teacherId: string): Promise<{ totalCourses: number; totalLives: number; totalViews: number; totalStudents: number }>;
  getAdminStats(): Promise<{ totalUsers: number; totalTeachers: number; pendingTeachers: number; totalCourses: number; totalLives: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: { email: string; password: string; firstName: string; lastName: string; role: string; teacherStatus?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as any,
        teacherStatus: userData.teacherStatus as any,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserRole(id: string, role: string, teacherStatus?: string): Promise<User | undefined> {
    const updateData: Partial<UpsertUser> = { role: role as any, updatedAt: new Date() };
    if (teacherStatus) {
      updateData.teacherStatus = teacherStatus as any;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPendingTeachers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, "teacher"), eq(users.teacherStatus, "pending")));
  }

  async getApprovedTeachers(): Promise<TeacherWithStats[]> {
    const teachers = await db
      .select()
      .from(users)
      .where(and(eq(users.role, "teacher"), eq(users.teacherStatus, "approved")))
      .orderBy(desc(users.createdAt));

    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        const [courseStats] = await db
          .select({ count: sql<number>`count(*)` })
          .from(courses)
          .where(eq(courses.teacherId, teacher.id));
        
        const [liveStats] = await db
          .select({ count: sql<number>`count(*)` })
          .from(liveCourses)
          .where(eq(liveCourses.teacherId, teacher.id));

        return {
          ...teacher,
          courseCount: Number(courseStats?.count) || 0,
          liveCount: Number(liveStats?.count) || 0,
        };
      })
    );

    return teachersWithStats;
  }

  async approveTeacher(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ teacherStatus: "approved", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async rejectTeacher(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ teacherStatus: "rejected", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getCourses(filters?: { search?: string; level?: string; subject?: string; teacherId?: string }): Promise<CourseWithTeacher[]> {
    let query = db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        subject: courses.subject,
        level: courses.level,
        pdfUrl: courses.pdfUrl,
        pdfFileName: courses.pdfFileName,
        thumbnailUrl: courses.thumbnailUrl,
        teacherId: courses.teacherId,
        isPublished: courses.isPublished,
        viewCount: courses.viewCount,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: users,
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .where(eq(courses.isPublished, true))
      .orderBy(desc(courses.createdAt));

    const conditions = [eq(courses.isPublished, true)];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(courses.title, `%${filters.search}%`),
          ilike(courses.description, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.level) {
      conditions.push(eq(courses.level, filters.level as any));
    }

    if (filters?.subject) {
      conditions.push(eq(courses.subject, filters.subject as any));
    }

    if (filters?.teacherId) {
      conditions.push(eq(courses.teacherId, filters.teacherId));
    }

    const results = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        subject: courses.subject,
        level: courses.level,
        pdfUrl: courses.pdfUrl,
        pdfFileName: courses.pdfFileName,
        thumbnailUrl: courses.thumbnailUrl,
        teacherId: courses.teacherId,
        isPublished: courses.isPublished,
        viewCount: courses.viewCount,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: users,
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .where(and(...conditions))
      .orderBy(desc(courses.createdAt));

    return results.map(r => ({
      ...r,
      teacher: r.teacher!,
    })) as CourseWithTeacher[];
  }

  async getCourse(id: number): Promise<CourseWithTeacher | undefined> {
    const [result] = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        subject: courses.subject,
        level: courses.level,
        pdfUrl: courses.pdfUrl,
        pdfFileName: courses.pdfFileName,
        thumbnailUrl: courses.thumbnailUrl,
        teacherId: courses.teacherId,
        isPublished: courses.isPublished,
        viewCount: courses.viewCount,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        teacher: users,
      })
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .where(eq(courses.id, id));

    if (!result) return undefined;

    return {
      ...result,
      teacher: result.teacher!,
    } as CourseWithTeacher;
  }

  async createCourse(course: InsertCourse & { pdfUrl: string; pdfFileName?: string }): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course as any).returning();
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updated;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return true;
  }

  async incrementCourseViews(id: number): Promise<void> {
    await db
      .update(courses)
      .set({ viewCount: sql`${courses.viewCount} + 1` })
      .where(eq(courses.id, id));
  }

  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.teacherId, teacherId))
      .orderBy(desc(courses.createdAt));
  }

  async getLiveCourses(filters?: { status?: string; level?: string; subject?: string; teacherId?: string }): Promise<LiveCourseWithTeacher[]> {
    const conditions: any[] = [];

    if (filters?.status === "live") {
      conditions.push(eq(liveCourses.isActive, true));
      conditions.push(eq(liveCourses.isEnded, false));
    } else if (filters?.status === "upcoming") {
      conditions.push(eq(liveCourses.isActive, false));
      conditions.push(eq(liveCourses.isEnded, false));
      conditions.push(gte(liveCourses.scheduledAt, new Date()));
    } else if (filters?.status === "past") {
      conditions.push(eq(liveCourses.isEnded, true));
    }

    if (filters?.level) {
      conditions.push(eq(liveCourses.level, filters.level as any));
    }

    if (filters?.subject) {
      conditions.push(eq(liveCourses.subject, filters.subject as any));
    }

    if (filters?.teacherId) {
      conditions.push(eq(liveCourses.teacherId, filters.teacherId));
    }

    const results = await db
      .select({
        id: liveCourses.id,
        title: liveCourses.title,
        description: liveCourses.description,
        subject: liveCourses.subject,
        level: liveCourses.level,
        teacherId: liveCourses.teacherId,
        jitsiRoomId: liveCourses.jitsiRoomId,
        jitsiUrl: liveCourses.jitsiUrl,
        scheduledAt: liveCourses.scheduledAt,
        duration: liveCourses.duration,
        isActive: liveCourses.isActive,
        isEnded: liveCourses.isEnded,
        maxParticipants: liveCourses.maxParticipants,
        createdAt: liveCourses.createdAt,
        updatedAt: liveCourses.updatedAt,
        teacher: users,
      })
      .from(liveCourses)
      .leftJoin(users, eq(liveCourses.teacherId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(liveCourses.scheduledAt));

    return results.map(r => ({
      ...r,
      teacher: r.teacher!,
    })) as LiveCourseWithTeacher[];
  }

  async getLiveCourse(id: number): Promise<LiveCourseWithTeacher | undefined> {
    const [result] = await db
      .select({
        id: liveCourses.id,
        title: liveCourses.title,
        description: liveCourses.description,
        subject: liveCourses.subject,
        level: liveCourses.level,
        teacherId: liveCourses.teacherId,
        jitsiRoomId: liveCourses.jitsiRoomId,
        jitsiUrl: liveCourses.jitsiUrl,
        scheduledAt: liveCourses.scheduledAt,
        duration: liveCourses.duration,
        isActive: liveCourses.isActive,
        isEnded: liveCourses.isEnded,
        maxParticipants: liveCourses.maxParticipants,
        createdAt: liveCourses.createdAt,
        updatedAt: liveCourses.updatedAt,
        teacher: users,
      })
      .from(liveCourses)
      .leftJoin(users, eq(liveCourses.teacherId, users.id))
      .where(eq(liveCourses.id, id));

    if (!result) return undefined;

    return {
      ...result,
      teacher: result.teacher!,
    } as LiveCourseWithTeacher;
  }

  async createLiveCourse(liveCourse: InsertLiveCourse & { jitsiRoomId: string; jitsiUrl: string }): Promise<LiveCourse> {
    const [newLive] = await db.insert(liveCourses).values(liveCourse as any).returning();
    return newLive;
  }

  async updateLiveCourse(id: number, liveCourse: Partial<InsertLiveCourse>): Promise<LiveCourse | undefined> {
    const [updated] = await db
      .update(liveCourses)
      .set({ ...liveCourse, updatedAt: new Date() })
      .where(eq(liveCourses.id, id))
      .returning();
    return updated;
  }

  async deleteLiveCourse(id: number): Promise<boolean> {
    await db.delete(liveCourses).where(eq(liveCourses.id, id));
    return true;
  }

  async startLive(id: number): Promise<LiveCourse | undefined> {
    const [updated] = await db
      .update(liveCourses)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(liveCourses.id, id))
      .returning();
    return updated;
  }

  async endLive(id: number): Promise<LiveCourse | undefined> {
    const [updated] = await db
      .update(liveCourses)
      .set({ isActive: false, isEnded: true, updatedAt: new Date() })
      .where(eq(liveCourses.id, id))
      .returning();
    return updated;
  }

  async getTeacherLiveCourses(teacherId: string): Promise<LiveCourse[]> {
    return await db
      .select()
      .from(liveCourses)
      .where(eq(liveCourses.teacherId, teacherId))
      .orderBy(desc(liveCourses.scheduledAt));
  }

  async getEnrollment(studentId: string, courseId?: number, liveCourseId?: number): Promise<Enrollment | undefined> {
    const conditions = [eq(enrollments.studentId, studentId)];
    if (courseId) conditions.push(eq(enrollments.courseId, courseId));
    if (liveCourseId) conditions.push(eq(enrollments.liveCourseId, liveCourseId));

    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(...conditions));
    return enrollment;
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment as any).returning();
    return newEnrollment;
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId));
  }

  async getStudentStats(studentId: string): Promise<{ totalCourses: number; upcomingLives: number; studyHours: number; enrolledCourses: number }> {
    const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.isPublished, true));
    const [liveCount] = await db.select({ count: sql<number>`count(*)` }).from(liveCourses).where(and(eq(liveCourses.isEnded, false), gte(liveCourses.scheduledAt, new Date())));
    const [enrolledCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments).where(eq(enrollments.studentId, studentId));

    return {
      totalCourses: Number(courseCount?.count) || 0,
      upcomingLives: Number(liveCount?.count) || 0,
      studyHours: 0,
      enrolledCourses: Number(enrolledCount?.count) || 0,
    };
  }

  async getTeacherStats(teacherId: string): Promise<{ totalCourses: number; totalLives: number; totalViews: number; totalStudents: number }> {
    const [courseStats] = await db
      .select({ count: sql<number>`count(*)`, views: sql<number>`sum(${courses.viewCount})` })
      .from(courses)
      .where(eq(courses.teacherId, teacherId));

    const [liveCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(liveCourses)
      .where(eq(liveCourses.teacherId, teacherId));

    return {
      totalCourses: Number(courseStats?.count) || 0,
      totalLives: Number(liveCount?.count) || 0,
      totalViews: Number(courseStats?.views) || 0,
      totalStudents: 0,
    };
  }

  async getAdminStats(): Promise<{ totalUsers: number; totalTeachers: number; pendingTeachers: number; totalCourses: number; totalLives: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [teacherCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, "teacher"), eq(users.teacherStatus, "approved")));
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, "teacher"), eq(users.teacherStatus, "pending")));
    const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(courses);
    const [liveCount] = await db.select({ count: sql<number>`count(*)` }).from(liveCourses);

    return {
      totalUsers: Number(userCount?.count) || 0,
      totalTeachers: Number(teacherCount?.count) || 0,
      pendingTeachers: Number(pendingCount?.count) || 0,
      totalCourses: Number(courseCount?.count) || 0,
      totalLives: Number(liveCount?.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
