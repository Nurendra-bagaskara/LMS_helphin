import { Elysia } from "elysia";
import { db } from "../db";
import {
    users,
    materials,
    videos,
    prodi,
    fakultas,
    mataKuliah,
    activityLogs,
    materialRequests,
    exercises,
    responsi,
    roles,
} from "../db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
    .use(authMiddleware)

    .get("/stats", async ({ user, set }: any) => {
        requirePermission("dashboard:view")({ user, set });

        // ==================== SUPER ADMIN DASHBOARD ====================
        if (user.permissions.includes("*")) {
            // Total counts
            const [totalStudents] = await db
                .select({ count: count() })
                .from(users)
                .innerJoin(roles, eq(users.roleId, roles.id))
                .where(eq(roles.code, "student"));

            const [totalCourses] = await db
                .select({ count: count() })
                .from(mataKuliah);

            const [totalProdi] = await db
                .select({ count: count() })
                .from(prodi);

            const [totalMaterials] = await db
                .select({ count: count() })
                .from(materials);

            const [totalVideos] = await db
                .select({ count: count() })
                .from(videos);

            // Fakultas teraktif: count activity logs per prodi -> per fakultas
            const aktivitasFakultas = await db
                .select({
                    fakultasId: fakultas.id,
                    fakultasName: fakultas.name,
                    activityCount: count(activityLogs.id),
                })
                .from(activityLogs)
                .leftJoin(users, eq(activityLogs.userId, users.id))
                .leftJoin(prodi, eq(users.prodiId, prodi.id))
                .leftJoin(fakultas, eq(prodi.fakultasId, fakultas.id))
                .groupBy(fakultas.id, fakultas.name)
                .orderBy(desc(count(activityLogs.id)))
                .limit(5);

            // Mahasiswa teraktif
            const mahasiswaTeraktif = await db
                .select({
                    userId: users.id,
                    userName: users.name,
                    userEmail: users.email,
                    prodiName: prodi.name,
                    activityCount: count(activityLogs.id),
                })
                .from(activityLogs)
                .innerJoin(users, eq(activityLogs.userId, users.id))
                .innerJoin(roles, eq(users.roleId, roles.id))
                .leftJoin(prodi, eq(users.prodiId, prodi.id))
                .where(eq(roles.code, "student"))
                .groupBy(users.id, users.name, users.email, prodi.name)
                .orderBy(desc(count(activityLogs.id)))
                .limit(10);

            return {
                success: true,
                data: {
                    totalStudents: totalStudents.count,
                    totalCourses: totalCourses.count,
                    totalProdi: totalProdi.count,
                    totalMaterials: totalMaterials.count,
                    totalVideos: totalVideos.count,
                    fakultasTeraktif: aktivitasFakultas,
                    mahasiswaTeraktif: mahasiswaTeraktif,
                },
            };
        }

        // ==================== ADMIN DASHBOARD ====================
        if (user.role === "admin" || (user.permissions.includes("prodi:manage") && !user.permissions.includes("*"))) {
            const prodiId = user.prodiId;

            const [materialsCount] = await db
                .select({ count: count() })
                .from(materials)
                .where(eq(materials.prodiId, prodiId));

            const [videosCount] = await db
                .select({ count: count() })
                .from(videos)
                .where(eq(videos.prodiId, prodiId));

            const [studentsCount] = await db
                .select({ count: count() })
                .from(users)
                .where(eq(users.prodiId, prodiId));

            const [pendingRequests] = await db
                .select({ count: count() })
                .from(materialRequests)
                .where(eq(materialRequests.prodiId, prodiId));

            const [exercisesCount] = await db
                .select({ count: count() })
                .from(exercises)
                .where(eq(exercises.prodiId, prodiId));

            const upcomingResponsi = await db
                .select()
                .from(responsi)
                .where(eq(responsi.prodiId, prodiId))
                .orderBy(responsi.scheduleDate)
                .limit(5);

            return {
                success: true,
                data: {
                    totalMaterials: materialsCount.count,
                    totalVideos: videosCount.count,
                    totalStudents: studentsCount.count,
                    totalRequests: pendingRequests.count,
                    totalExercises: exercisesCount.count,
                    upcomingResponsi,
                },
            };
        }

        // ==================== STUDENT DASHBOARD ====================
        if (user.role === "student") {
            // Latest materials from own prodi
            const latestMaterials = await db
                .select({
                    id: materials.id,
                    title: materials.title,
                    fileType: materials.fileType,
                    prodiName: prodi.name,
                    createdAt: materials.createdAt,
                })
                .from(materials)
                .leftJoin(prodi, eq(materials.prodiId, prodi.id))
                .orderBy(desc(materials.createdAt))
                .limit(5);

            // Upcoming responsi
            const upcomingResponsi = await db
                .select({
                    id: responsi.id,
                    title: responsi.title,
                    scheduleDate: responsi.scheduleDate,
                    status: responsi.status,
                    prodiName: prodi.name,
                })
                .from(responsi)
                .leftJoin(prodi, eq(responsi.prodiId, prodi.id))
                .where(eq(responsi.status, "upcoming"))
                .orderBy(responsi.scheduleDate)
                .limit(5);

            // My requests
            const myRequests = await db
                .select()
                .from(materialRequests)
                .where(eq(materialRequests.studentId, user.id))
                .orderBy(desc(materialRequests.createdAt))
                .limit(5);

            return {
                success: true,
                data: {
                    latestMaterials,
                    upcomingResponsi,
                    myRequests,
                },
            };
        }

        return { success: false, message: "Unknown role" };
    });
