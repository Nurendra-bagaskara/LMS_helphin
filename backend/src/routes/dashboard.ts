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
    bankSoal,
    responsi,
    roles,
} from "../db/schema";
import { eq, count, desc, sql, and } from "drizzle-orm";

import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
    .get("/test-admin", async ({}) => {
        try {
            const cols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'responsi'`);
            return {
                message: "OK, NO CRASH",
                cols: cols
            }
        } catch(e) {
            return { error: String(e), stack: (e as Error).stack };
        }
    })
    .use(authMiddleware)

    .get("/stats", async ({ user, set, query }: any) => {
        requirePermission("dashboard:view")({ user, set });

        const viewAs = query?.view; // ?view=student to force student view

        // ==================== SUPER ADMIN DASHBOARD ====================
        if (user.permissions.includes("*") && viewAs !== "student") {
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
            
            const [totalRequests] = await db
                .select({ count: count() })
                .from(materialRequests);
            
            const [totalExercises] = await db
                .select({ count: count() })
                .from(exercises);

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

            // Mahasiswa teraktif (Global)
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
            
            // Mata Kuliah Terpopuler (Global, Sum all content)
            const mataKuliahTerpopuler = await db.execute(sql`
                SELECT mk.id, mk.name,
                (
                    COALESCE((SELECT COUNT(*) FROM materials WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM videos WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM bank_soal WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM exercises WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM responsi WHERE mata_kuliah_id = mk.id), 0)
                ) as "materialCount"
                FROM mata_kuliah mk
                ORDER BY "materialCount" DESC
                LIMIT 5
            `);

            return {
                success: true,
                data: {
                    totalStudents: totalStudents.count,
                    totalCourses: totalCourses.count,
                    totalProdi: totalProdi.count,
                    totalMaterials: totalMaterials.count,
                    totalVideos: totalVideos.count,
                    totalRequests: totalRequests.count,
                    totalExercises: totalExercises.count,
                    fakultasTeraktif: aktivitasFakultas,
                    mahasiswaTeraktif: mahasiswaTeraktif,
                    mataKuliahTerpopuler: mataKuliahTerpopuler as any,
                    role: "super_admin"
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
                .innerJoin(roles, eq(users.roleId, roles.id))
                .where(
                    and(
                        prodiId ? eq(users.prodiId, prodiId) : sql`TRUE`,
                        eq(roles.code, "student")
                    )
                );


            const [coursesCount] = await db
                .select({ count: count() })
                .from(mataKuliah)
                .where(prodiId ? eq(mataKuliah.prodiId, prodiId) : sql`TRUE`);



            const [pendingRequests] = await db
                .select({ count: count() })
                .from(materialRequests)
                .where(prodiId ? eq(materialRequests.prodiId, prodiId) : sql`TRUE`);

            const [exercisesCount] = await db
                .select({ count: count() })
                .from(exercises)
                .where(prodiId ? eq(exercises.prodiId, prodiId) : sql`TRUE`);






            const upcomingResponsi = await db
                .select({
                    id: responsi.id,
                    title: responsi.title,
                    scheduleDate: responsi.scheduleDate,
                    status: responsi.status,
                    mataKuliahName: mataKuliah.name
                })
                .from(responsi)
                .leftJoin(mataKuliah, eq(responsi.mataKuliahId, mataKuliah.id))
                .where(eq(responsi.prodiId, prodiId))
                .orderBy(responsi.scheduleDate)
                .limit(5);

            // Hitung metrik Content Completeness
            const allMatkulM = await db.select({ id: materials.mataKuliahId }).from(materials).where(prodiId ? eq(materials.prodiId, prodiId) : undefined);
            const allMatkulV = await db.select({ id: videos.mataKuliahId }).from(videos).where(prodiId ? eq(videos.prodiId, prodiId) : undefined);
            const allMatkulE = await db.select({ id: exercises.mataKuliahId }).from(exercises).where(prodiId ? eq(exercises.prodiId, prodiId) : undefined);
            
            const setM = new Set(allMatkulM.map(i => i.id).filter(id => id !== null));
            const setV = new Set(allMatkulV.map(i => i.id).filter(id => id !== null));
            const setE = new Set(allMatkulE.map(i => i.id).filter(id => id !== null));

            const activeMatkulSet = new Set([
                ...Array.from(setM),
                ...Array.from(setV),
                ...Array.from(setE)
            ]);
            
            const activeMatkulCount = activeMatkulSet.size;

            const contentCompleteness = {
                totalCourses: coursesCount.count,
                activeCourses: activeMatkulCount,
                withMaterial: setM.size,
                withVideo: setV.size,
                withExercise: setE.size
            };


            // Mahasiswa teraktif (Prodi specific, Students only)
            const mahasiswaTeraktif = await db
                .select({
                    userId: users.id,
                    userName: users.name,
                    userEmail: users.email,
                    activityCount: count(activityLogs.id),
                })
                .from(activityLogs)
                .innerJoin(users, eq(activityLogs.userId, users.id))
                .innerJoin(roles, eq(users.roleId, roles.id))
                .where(
                    and(
                        eq(users.prodiId, prodiId),
                        eq(roles.code, "student")
                    )
                )
                .groupBy(users.id, users.name, users.email)
                .orderBy(desc(count(activityLogs.id)))
                .limit(10);
            
            // Mata Kuliah Terpopuler (Prodi specific, Sum all content)
            const mataKuliahTerpopuler = await db.execute(sql`
                SELECT mk.id, mk.name,
                (
                    COALESCE((SELECT COUNT(*) FROM materials WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM videos WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM bank_soal WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM exercises WHERE mata_kuliah_id = mk.id), 0) +
                    COALESCE((SELECT COUNT(*) FROM responsi WHERE mata_kuliah_id = mk.id), 0)
                ) as "materialCount"
                FROM mata_kuliah mk
                WHERE mk.prodi_id = ${prodiId}
                ORDER BY "materialCount" DESC
                LIMIT 5
            `);

            // Prodi name
            const [p] = await db.select({ name: prodi.name }).from(prodi).where(eq(prodi.id, prodiId)).limit(1);

            return {
                success: true,
                data: {
                    totalStudents: studentsCount.count,
                    totalCourses: coursesCount.count,
                    totalMaterials: materialsCount.count,
                    totalVideos: videosCount.count,
                    totalRequests: pendingRequests.count,
                    totalExercises: exercisesCount.count,
                    totalProdi: 1, // Specific to one prodi
                    upcomingResponsi,
                    mahasiswaTeraktif,
                    mataKuliahTerpopuler: mataKuliahTerpopuler as any,
                    prodiName: p?.name || "",
                    contentCompleteness,
                    role: "admin"
                },
            };

        }

        // ==================== STUDENT DASHBOARD ====================
        // This block also handles super_admin/admin with ?view=student
        if (user.role === "student" || viewAs === "student") {
            // For Super Admin / Admin, we might need a default prodiId if they don't have one
            const effectiveProdiId = user.prodiId;
            
            // Latest materials
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
                .where(effectiveProdiId ? eq(materials.prodiId, effectiveProdiId) : undefined)
                .orderBy(desc(materials.createdAt))
                .limit(5);

            // Upcoming responsi (across all prodi/matkul as requested)
            const upcomingResponsi = await db
                .select({
                    id: responsi.id,
                    title: responsi.title,
                    description: responsi.description,
                    speaker: responsi.speaker,
                    topic: responsi.topic,
                    scheduleDate: responsi.scheduleDate,
                    durationMinutes: responsi.durationMinutes,
                    meetingLink: responsi.meetingLink,
                    status: responsi.status,
                    mataKuliahId: responsi.mataKuliahId,
                    mataKuliahName: mataKuliah.name,
                    prodiId: responsi.prodiId,
                    prodiName: prodi.name,
                })
                .from(responsi)
                .leftJoin(prodi, eq(responsi.prodiId, prodi.id))
                .leftJoin(mataKuliah, eq(responsi.mataKuliahId, mataKuliah.id))
                .where(eq(responsi.status, "upcoming"))
                .orderBy(responsi.scheduleDate)
                .limit(10);

            // Mata Kuliah for student's prodi
            const studentMataKuliah = effectiveProdiId
                ? await db
                    .select({
                        id: mataKuliah.id,
                        name: mataKuliah.name,
                        coverUrl: mataKuliah.coverUrl,
                        prodiId: mataKuliah.prodiId,
                        prodiName: prodi.name,
                        materialCount: count(materials.id),
                    })
                    .from(mataKuliah)
                    .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
                    .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
                    .where(eq(mataKuliah.prodiId, effectiveProdiId))
                    .groupBy(mataKuliah.id, prodi.id)
                : await db
                    .select({
                        id: mataKuliah.id,
                        name: mataKuliah.name,
                        coverUrl: mataKuliah.coverUrl,
                        prodiId: mataKuliah.prodiId,
                        prodiName: prodi.name,
                        materialCount: count(materials.id),
                    })
                    .from(mataKuliah)
                    .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
                    .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
                    .groupBy(mataKuliah.id, prodi.id)
                    .limit(12); // Fallback for super admin

            // Get prodi name
            let prodiName = "";
            if (effectiveProdiId) {
                const [p] = await db
                    .select({ name: prodi.name })
                    .from(prodi)
                    .where(eq(prodi.id, effectiveProdiId))
                    .limit(1);
                prodiName = p?.name || "";
            } else if (user.permissions.includes("*")) {
                prodiName = "Seluruh Kampus";
            }

            return {
                success: true,
                data: {
                    latestMaterials,
                    upcomingResponsi,
                    mataKuliah: studentMataKuliah,
                    prodiName,
                    role: user.role
                },
            };
        }

        return { success: false, message: "Unknown role" };
    })
    .get("/test-bug", async ({ set }: any) => {
        try {
            const user = {
                id: "test-admin",
                role: "admin",
                permissions: ["dashboard:view", "prodi:view"],
                prodiId: null // test with null
            };
            
            const prodiId = user.prodiId;
            const [materialsCount] = await db
                .select({ count: count() })
                .from(materials)
                .where(eq(materials.prodiId, prodiId as any));

            return { success: true, data: materialsCount };
        } catch (e) {
            console.error("TEST BUG ERROR:", e);
            set.status = 500;
            return { success: false, error: String(e), stack: (e as Error).stack };
        }
    });
