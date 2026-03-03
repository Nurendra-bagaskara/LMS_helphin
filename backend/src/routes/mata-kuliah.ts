import { Elysia, t } from "elysia";
import { db } from "../db";
import { mataKuliah, prodi } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission, requireProdiAccessOrAdmin } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const mataKuliahRoutes = new Elysia({ prefix: "/mata-kuliah" })
    .use(authMiddleware)

    // LIST (with prodi name, filterable by prodiId)
    .get("/", async ({ query, user, set }: any) => {
        requirePermission("matkul:view")({ user, set });

        let conditions: any[] = [];

        // Data scoping: non-super-admins only see their own prodi
        if (!user.permissions.includes("*")) {
            conditions.push(eq(mataKuliah.prodiId, user.prodiId));
        } else if (query.prodiId) {
            conditions.push(eq(mataKuliah.prodiId, query.prodiId));
        }

        const result = await db
            .select({
                id: mataKuliah.id,
                name: mataKuliah.name,
                code: mataKuliah.code,
                prodiId: mataKuliah.prodiId,
                prodiName: prodi.name,
                createdAt: mataKuliah.createdAt,
            })
            .from(mataKuliah)
            .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
            .where(conditions.length > 0 ? conditions[0] : undefined); // Simplified for single filter

        return { success: true, data: result };
    })

    // GET BY ID
    .get("/:id", async ({ params, set }: any) => {
        const [mk] = await db
            .select({
                id: mataKuliah.id,
                name: mataKuliah.name,
                code: mataKuliah.code,
                prodiId: mataKuliah.prodiId,
                prodiName: prodi.name,
                createdAt: mataKuliah.createdAt,
            })
            .from(mataKuliah)
            .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
            .where(eq(mataKuliah.id, params.id))
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
                    code: body.code,
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
                code: t.String({ minLength: 1 }),
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
            if (body.code) updateData.code = body.code;

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
                code: t.Optional(t.String()),
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
