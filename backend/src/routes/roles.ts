import { Elysia, t } from "elysia";
import { db } from "../db";
import { roles } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const roleRoutes = new Elysia({ prefix: "/roles" })
    .use(authMiddleware)

    // ==================== LIST ROLES ====================
    .get("/", async ({ user, set }: any) => {
        requireRole("super_admin")({ user, set });

        const result = await db.select().from(roles).orderBy(desc(roles.createdAt));
        return { success: true, data: result };
    })

    // ==================== GET ROLE BY ID ====================
    .get("/:id", async ({ user, params, set }: any) => {
        requireRole("super_admin")({ user, set });

        const [role] = await db.select().from(roles).where(eq(roles.id, params.id)).limit(1);
        if (!role) {
            set.status = 404;
            return { success: false, message: "Role not found" };
        }

        return { success: true, data: role };
    })

    // ==================== CREATE ROLE ====================
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requireRole("super_admin")({ user, set });

            const { name, code, permissions } = body;

            // Check if code already exists
            const [existing] = await db
                .select()
                .from(roles)
                .where(eq(roles.code, code))
                .limit(1);

            if (existing) {
                set.status = 409;
                return { success: false, message: "Role code already exists" };
            }

            const [newRole] = await db
                .insert(roles)
                .values({ name, code, permissions: permissions || [] })
                .returning();

            await logActivity(user.id, "create_role", "role", newRole.id, { name, code });

            set.status = 201;
            return { success: true, message: "Role created", data: newRole };
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                code: t.String({ minLength: 1 }),
                permissions: t.Optional(t.Array(t.String())),
            }),
        }
    )

    // ==================== UPDATE ROLE ====================
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            try {
                requireRole("super_admin")({ user, set });

                const { name, code, permissions } = body;
                const updateData: any = {};
                if (name) updateData.name = name;
                if (code) updateData.code = code;
                if (permissions) updateData.permissions = permissions;

                if (code) {
                    // Check if code exists in other roles
                    const [existing] = await db
                        .select()
                        .from(roles)
                        .where(eq(roles.code, code))
                        .limit(1);

                    if (existing && String(existing.id) !== String(params.id)) {
                        set.status = 409;
                        return { success: false, message: "Role code already exists" };
                    }
                }

                if (Object.keys(updateData).length === 0) {
                    return { success: true, message: "No changes made" };
                }

                const [updated] = await db
                    .update(roles)
                    .set(updateData)
                    .where(eq(roles.id, params.id))
                    .returning();

                if (!updated) {
                    set.status = 404;
                    return { success: false, message: "Role not found" };
                }

                await logActivity(user.id, "update_role", "role", params.id, body);

                return { success: true, message: "Role updated", data: updated };
            } catch (error: any) {
                console.error("PATCH /roles/:id error:", error);
                throw error;
            }
        },
        {
            body: t.Object({
                name: t.Optional(t.String()),
                code: t.Optional(t.String()),
                permissions: t.Optional(t.Array(t.String())),
            }),
        }
    )

    // ==================== DELETE ROLE ====================
    .delete("/:id", async ({ user, params, set }: any) => {
        requireRole("super_admin")({ user, set });

        // Prevent deleting original roles if needed (optional)
        const [role] = await db.select().from(roles).where(eq(roles.id, params.id)).limit(1);
        if (role && ["super_admin", "admin", "student"].includes(role.code)) {
            set.status = 400;
            return { success: false, message: "Cannot delete system default roles" };
        }

        const [deleted] = await db
            .delete(roles)
            .where(eq(roles.id, params.id))
            .returning();

        if (!deleted) {
            set.status = 404;
            return { success: false, message: "Role not found" };
        }

        await logActivity(user.id, "delete_role", "role", params.id, { code: deleted.code });

        return { success: true, message: "Role deleted" };
    });
