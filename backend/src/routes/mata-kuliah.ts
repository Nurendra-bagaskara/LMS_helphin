import { Elysia, t } from "elysia";
import { db } from "../db";
import { mataKuliah, prodi, materials, pinnedMataKuliah, videos, responsi, exercises, bankSoal } from "../db/schema";
import { eq, count, sql, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission, requireProdiAccessOrAdmin } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const mataKuliahRoutes = new Elysia({ prefix: "/mata-kuliah" })
    .use(authMiddleware)

    // LIST (with prodi name, filterable by prodiId)
    .get("/", async ({ query, user, set }: any) => {
        requirePermission("matkul:view")({ user, set });

        let conditions: any[] = [];

        // Data scoping: if prodiId is explicitly provided, use it (allows cross-prodi browsing)
        // Otherwise, non-super-admins default to their own prodi
        if (query.prodiId) {
            conditions.push(eq(mataKuliah.prodiId, query.prodiId));
        } else if (!user.permissions.includes("*")) {
            conditions.push(eq(mataKuliah.prodiId, user.prodiId));
        }

        console.log(`[MATKUL] Fetching for user: ${user.name} (Role: ${user.role}, Prodi: ${user.prodiId})`);

        const result = await db
            .select({
                id: mataKuliah.id,
                name: mataKuliah.name,
                coverUrl: mataKuliah.coverUrl,
                prodiId: mataKuliah.prodiId,
                prodiName: prodi.name,
                createdAt: mataKuliah.createdAt,
                materialCount: sql<number>`CAST(count(DISTINCT ${materials.id}) + count(DISTINCT ${videos.id}) + count(DISTINCT ${responsi.id}) + count(DISTINCT ${exercises.id}) + count(DISTINCT ${bankSoal.id}) AS INTEGER)`,
                isPinned: sql<boolean>`CASE WHEN ${pinnedMataKuliah.id} IS NOT NULL THEN true ELSE false END`,
            })
            .from(mataKuliah)
            .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
            .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
            .leftJoin(videos, eq(videos.mataKuliahId, mataKuliah.id))
            .leftJoin(responsi, eq(responsi.mataKuliahId, mataKuliah.id))
            .leftJoin(exercises, eq(exercises.mataKuliahId, mataKuliah.id))
            .leftJoin(bankSoal, eq(bankSoal.mataKuliahId, mataKuliah.id))
            .leftJoin(
                pinnedMataKuliah, 
                and(
                    eq(pinnedMataKuliah.mataKuliahId, mataKuliah.id),
                    eq(pinnedMataKuliah.userId, user.id)
                )
            )
            .where(conditions.length > 0 ? conditions[0] : undefined)
            .groupBy(
                mataKuliah.id, 
                mataKuliah.name, 
                mataKuliah.coverUrl, 
                mataKuliah.prodiId, 
                prodi.name, 
                mataKuliah.createdAt,
                pinnedMataKuliah.id
            );

        console.log(`[MATKUL] Result: Found ${result.length} Mata Kuliah records.`);
        
        return { success: true, data: result };
    })

    // TOGGLE PIN - must be BEFORE /:id route to prevent route conflict
    .post("/:id/pin", async ({ params, user, set }: any) => {
        try {
            const userId = user?.id;
            const mataKuliahId = params?.id;
            
            console.log(`[API PIN] Toggle attempt - User: ${userId}, MK: ${mataKuliahId}`);
            
            if (!userId || !mataKuliahId) {
                set.status = 400;
                return { success: false, message: "Missing userId or mataKuliahId" };
            }

            // Check if already pinned using raw SQL
            const existingPins = await db.execute(
                sql`SELECT id FROM pinned_mata_kuliah WHERE user_id = ${userId} AND mata_kuliah_id = ${mataKuliahId} LIMIT 1`
            );

            if (existingPins.length > 0) {
                // Unpin - delete
                await db.execute(
                    sql`DELETE FROM pinned_mata_kuliah WHERE user_id = ${userId} AND mata_kuliah_id = ${mataKuliahId}`
                );
                console.log(`[API PIN] Unpinned course ${mataKuliahId} for user ${userId}`);
                return { success: true, message: "Mata Kuliah unpinned", isPinned: false };
            } else {
                // Pin - insert
                await db.execute(
                    sql`INSERT INTO pinned_mata_kuliah (id, user_id, mata_kuliah_id, created_at) VALUES (gen_random_uuid(), ${userId}, ${mataKuliahId}, NOW())`
                );
                console.log(`[API PIN] Pinned course ${mataKuliahId} for user ${userId}`);
                return { success: true, message: "Mata Kuliah pinned", isPinned: true };
            }
        } catch (error: any) {
            console.error("[API PIN] Error:", error?.message || error);
            set.status = 500;
            return { 
                success: false, 
                message: error?.message || "Internal server error",
            };
        }
    })

    // GET BY ID
    .get("/:id", async ({ params, set }: any) => {
        const [mk] = await db
            .select({
                id: mataKuliah.id,
                name: mataKuliah.name,
                coverUrl: mataKuliah.coverUrl,
                prodiId: mataKuliah.prodiId,
                prodiName: prodi.name,
                createdAt: mataKuliah.createdAt,
                materialCount: sql<number>`CAST(count(DISTINCT ${materials.id}) + count(DISTINCT ${videos.id}) + count(DISTINCT ${responsi.id}) + count(DISTINCT ${exercises.id}) + count(DISTINCT ${bankSoal.id}) AS INTEGER)`,
            })
            .from(mataKuliah)
            .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
            .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
            .leftJoin(videos, eq(videos.mataKuliahId, mataKuliah.id))
            .leftJoin(responsi, eq(responsi.mataKuliahId, mataKuliah.id))
            .leftJoin(exercises, eq(exercises.mataKuliahId, mataKuliah.id))
            .leftJoin(bankSoal, eq(bankSoal.mataKuliahId, mataKuliah.id))
            .where(eq(mataKuliah.id, params.id))
            .groupBy(mataKuliah.id, prodi.id)
            .limit(1);

        if (!mk) {
            set.status = 404;
            return { success: false, message: "Mata Kuliah not found" };
        }
        return { success: true, data: mk };
    })

    // CREATE (Admin own prodi / Super Admin)
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("matkul:manage")({ user, set });

            if (!requireProdiAccessOrAdmin(body.prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot create mata kuliah for other prodi" };
            }

            const [created] = await db
                .insert(mataKuliah)
                .values({
                    name: body.name,
                    coverUrl: body.coverUrl || null,
                    prodiId: body.prodiId,
                })
                .returning();

            await logActivity(user.id, "create_mata_kuliah", "mata_kuliah", created.id);

            set.status = 201;
            return { success: true, data: created };
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                coverUrl: t.Optional(t.String()),
                prodiId: t.String(),
            }),
        }
    )

    // UPDATE (Admin own prodi / Super Admin)
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("matkul:manage")({ user, set });

            // Check ownership
            const [existing] = await db
                .select()
                .from(mataKuliah)
                .where(eq(mataKuliah.id, params.id))
                .limit(1);

            if (!existing) {
                set.status = 404;
                return { success: false, message: "Mata Kuliah not found" };
            }

            if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot edit mata kuliah from other prodi" };
            }

            const updateData: any = {};
            if (body.name) updateData.name = body.name;
            if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl;
            if (body.prodiId) {
                if (!requireProdiAccessOrAdmin(body.prodiId, user)) {
                    set.status = 403;
                    return { success: false, message: "Cannot move mata kuliah to other prodi" };
                }
                updateData.prodiId = body.prodiId;
            }

            const [updated] = await db
                .update(mataKuliah)
                .set(updateData)
                .where(eq(mataKuliah.id, params.id))
                .returning();

            await logActivity(user.id, "update_mata_kuliah", "mata_kuliah", params.id);
            return { success: true, data: updated };
        },
        {
            body: t.Object({
                name: t.Optional(t.String()),
                coverUrl: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // DELETE (Admin own prodi / Super Admin)
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("matkul:manage")({ user, set });

        const [existing] = await db
            .select()
            .from(mataKuliah)
            .where(eq(mataKuliah.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Mata Kuliah not found" };
        }

        if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
            set.status = 403;
            return { success: false, message: "Cannot delete mata kuliah from other prodi" };
        }

        await db.delete(mataKuliah).where(eq(mataKuliah.id, params.id));
        await logActivity(user.id, "delete_mata_kuliah", "mata_kuliah", params.id);

        return { success: true, message: "Mata Kuliah deleted" };
    });
