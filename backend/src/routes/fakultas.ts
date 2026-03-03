import { Elysia, t } from "elysia";
import { db } from "../db";
import { fakultas } from "../db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const fakultasRoutes = new Elysia({ prefix: "/fakultas" })
    .use(authMiddleware)

    // LIST
    .get("/", async () => {
        const result = await db.select().from(fakultas);
        return { success: true, data: result };
    })

    // GET BY ID
    .get("/:id", async ({ params, set }: any) => {
        const [f] = await db.select().from(fakultas).where(eq(fakultas.id, params.id)).limit(1);
        if (!f) {
            set.status = 404;
            return { success: false, message: "Fakultas not found" };
        }
        return { success: true, data: f };
    })

    // CREATE (Super Admin)
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("fakultas:manage")({ user, set });

            const [created] = await db
                .insert(fakultas)
                .values({ name: body.name, universityName: body.universityName || "Telkom University" })
                .returning();

            await logActivity(user.id, "create_fakultas", "fakultas", created.id);

            set.status = 201;
            return { success: true, data: created };
        },
        { body: t.Object({ name: t.String({ minLength: 1 }), universityName: t.Optional(t.String()) }) }
    )

    // UPDATE (Super Admin)
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("fakultas:manage")({ user, set });

            const [updated] = await db
                .update(fakultas)
                .set({ name: body.name, ...(body.universityName && { universityName: body.universityName }) })
                .where(eq(fakultas.id, params.id))
                .returning();

            if (!updated) {
                set.status = 404;
                return { success: false, message: "Fakultas not found" };
            }

            await logActivity(user.id, "update_fakultas", "fakultas", params.id);
            return { success: true, data: updated };
        },
        { body: t.Object({ name: t.Optional(t.String({ minLength: 1 })), universityName: t.Optional(t.String()) }) }
    )

    // DELETE (Super Admin)
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("fakultas:manage")({ user, set });

        const [deleted] = await db
            .delete(fakultas)
            .where(eq(fakultas.id, params.id))
            .returning();

        if (!deleted) {
            set.status = 404;
            return { success: false, message: "Fakultas not found" };
        }

        await logActivity(user.id, "delete_fakultas", "fakultas", params.id);
        return { success: true, message: "Fakultas deleted" };
    });
