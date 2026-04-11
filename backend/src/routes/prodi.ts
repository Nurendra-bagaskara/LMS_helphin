import { Elysia, t } from "elysia";
import { db } from "../db";
import { prodi, fakultas } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission } from "../middleware/rbac";
import { logActivity } from "../utils/logger";
import { cache, CACHE_TTL } from "../utils/cache";

export const prodiRoutes = new Elysia({ prefix: "/prodi" })
    // LIST (with fakultas name) - PUBLIC for registration
    .get("/", async ({ query }: any) => {
        const cacheKey = `prodi:list:${query.fakultasId || 'all'}`;
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        const result = await db
            .select({
                id: prodi.id,
                name: prodi.name,
                description: prodi.description,
                fakultasId: prodi.fakultasId,
                fakultasName: fakultas.name,
                universityName: fakultas.universityName,
                logoUrl: prodi.logoUrl,
                createdAt: prodi.createdAt,
            })
            .from(prodi)
            .leftJoin(fakultas, eq(prodi.fakultasId, fakultas.id))
            .where(query.fakultasId ? eq(prodi.fakultasId, query.fakultasId) : undefined);

        const response = { success: true, data: result };
        cache.set(cacheKey, response, CACHE_TTL.MEDIUM);
        return response;
    })

    .use(authMiddleware)

    // GET BY ID
    .get("/:id", async ({ params, set }: any) => {
        const [p] = await db
            .select({
                id: prodi.id,
                name: prodi.name,
                description: prodi.description,
                fakultasId: prodi.fakultasId,
                fakultasName: fakultas.name,
                universityName: fakultas.universityName,
                logoUrl: prodi.logoUrl,
                createdAt: prodi.createdAt,
            })
            .from(prodi)
            .leftJoin(fakultas, eq(prodi.fakultasId, fakultas.id))
            .where(eq(prodi.id, params.id))
            .limit(1);

        if (!p) {
            set.status = 404;
            return { success: false, message: "Prodi not found" };
        }
        return { success: true, data: p };
    })

    // CREATE (Super Admin)
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("prodi:manage")({ user, set });

            const [created] = await db
                .insert(prodi)
                .values({
                    name: body.name,
                    description: body.description || null,
                    logoUrl: body.logoUrl || null,
                    fakultasId: body.fakultasId,
                })
                .returning();

            await logActivity(user.id, "create_prodi", "prodi", created.id);
            cache.invalidate("prodi");

            set.status = 201;
            return { success: true, data: created };
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                description: t.Optional(t.String()),
                logoUrl: t.Optional(t.String()),
                fakultasId: t.String(),
            }),
        }
    )

    // UPDATE (Super Admin)
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("prodi:manage")({ user, set });

            const updateData: any = {};
            if (body.name) updateData.name = body.name;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
            if (body.fakultasId) updateData.fakultasId = body.fakultasId;

            const [updated] = await db
                .update(prodi)
                .set(updateData)
                .where(eq(prodi.id, params.id))
                .returning();

            if (!updated) {
                set.status = 404;
                return { success: false, message: "Prodi not found" };
            }

            await logActivity(user.id, "update_prodi", "prodi", params.id);
            cache.invalidate("prodi");
            return { success: true, data: updated };
        },
        {
            body: t.Object({
                name: t.Optional(t.String()),
                description: t.Optional(t.String()),
                logoUrl: t.Optional(t.String()),
                fakultasId: t.Optional(t.String()),
            }),
        }
    )

    // DELETE (Super Admin)
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("prodi:manage")({ user, set });

        const [deleted] = await db
            .delete(prodi)
            .where(eq(prodi.id, params.id))
            .returning();

        if (!deleted) {
            set.status = 404;
            return { success: false, message: "Prodi not found" };
        }

        await logActivity(user.id, "delete_prodi", "prodi", params.id);
        cache.invalidate("prodi");
        return { success: true, message: "Prodi deleted" };
    });
