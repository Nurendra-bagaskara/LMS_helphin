import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, prodi, roles } from "../db/schema";
import { eq, and, ne } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const userRoutes = new Elysia({ prefix: "/users" })
    .use(authMiddleware)

    // ==================== UPDATE SELF PROFILE ====================
    .patch(
        "/profile",
        async ({ user, body, set }: any) => {
            if (!user) {
                set.status = 401;
                return { success: false, message: "Unauthorized" };
            }

            const updateData: any = {};
            if (body.name) updateData.name = body.name;
            if (body.email) {
                // Check if email belongs to someone else
                const [existing] = await db
                    .select()
                    .from(users)
                    .where(and(eq(users.email, body.email), ne(users.id, user.id)))
                    .limit(1);
                
                if (existing) {
                    set.status = 409;
                    return { success: false, message: "Email already taken" };
                }
                updateData.email = body.email;
            }
            if (body.password) {
                updateData.passwordHash = await Bun.password.hash(body.password, {
                    algorithm: "bcrypt",
                    cost: 10,
                });
            }
            updateData.updatedAt = new Date();

            const [updated] = await db
                .update(users)
                .set(updateData)
                .where(eq(users.id, user.id))
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    roleId: users.roleId,
                    jabatan: users.jabatan,
                    prodiId: users.prodiId,
                });

            if (!updated) {
                set.status = 404;
                return { success: false, message: "User not found" };
            }

            await logActivity(user.id, "update_profile", "user", user.id);

            return { success: true, message: "Profile updated", data: updated };
        },
        {
            body: t.Object({
                name: t.Optional(t.String({ minLength: 1 })),
                email: t.Optional(t.String({ format: "email" })),
                password: t.Optional(t.String({ minLength: 6 })),
            }),
        }
    )

    // ==================== LIST USERS (Super Admin) ====================
    .get("/", async ({ user, set, query }: any) => {
        requireRole("super_admin")({ user, set });

        const { roleId, prodiId } = query;
        let conditions: any[] = [];
        if (roleId) conditions.push(eq(users.roleId, roleId));
        if (prodiId) conditions.push(eq(users.prodiId, prodiId));

        // Data scoping: If user is not super_admin and has prodiId, restrict to their prodi
        if (!user.permissions.includes("*") && user.prodiId) {
            conditions.push(eq(users.prodiId, user.prodiId));
        }

        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: roles.code,
                roleId: users.roleId,
                jabatan: users.jabatan,
                prodiId: users.prodiId,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(users.createdAt);

        return { success: true, data: result };
    })

    // ==================== CREATE ADMIN (Super Admin) ====================
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("akun:manage")({ user, set });

            const { name, email, password, prodiId, jabatan, roleId } = body;

            // Data Scoping: If not super_admin, can only create for their own prodi
            if (!user.permissions.includes("*")) {
                if (prodiId !== user.prodiId) {
                    set.status = 403;
                    return { success: false, message: "Forbidden: You can only create users in your own prodi" };
                }
            }

            // Validate prodi exists
            if (prodiId) {
                const [p] = await db.select().from(prodi).where(eq(prodi.id, prodiId)).limit(1);
                if (!p) {
                    set.status = 400;
                    return { success: false, message: "Prodi not found" };
                }
            }

            // Check email uniqueness
            const [existing] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existing) {
                set.status = 409;
                return { success: false, message: "Email already registered" };
            }

            const passwordHash = await Bun.password.hash(password, {
                algorithm: "bcrypt",
                cost: 10,
            });

            const [newAdmin] = await db
                .insert(users)
                .values({
                    name,
                    email,
                    passwordHash,
                    roleId: roleId || null,
                    jabatan: jabatan || null,
                    prodiId: prodiId || null,
                })
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    roleId: users.roleId,
                    jabatan: users.jabatan,
                    prodiId: users.prodiId,
                    createdAt: users.createdAt,
                });

            await logActivity(user.id, "create_admin", "user", newAdmin.id, { email });

            set.status = 201;
            return { success: true, message: "Admin created", data: newAdmin };
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                email: t.String({ format: "email" }),
                password: t.String({ minLength: 6 }),
                jabatan: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
                roleId: t.Optional(t.String()),
            }),
        }
    )
    // ==================== GET SINGLE USER (Super Admin) ====================
    .get("/:id", async ({ user, params, set }: any) => {
        requireRole("super_admin")({ user, set });

        const [u] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: roles.code,
                roleId: users.roleId,
                jabatan: users.jabatan,
                prodiId: users.prodiId,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.id, params.id))
            .limit(1);

        if (!u) {
            set.status = 404;
            return { success: false, message: "User not found" };
        }

        return { success: true, data: u };
    })

    // ==================== UPDATE USER (Super Admin) ====================
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("akun:manage")({ user, set });

            // 1. Fetch the user to be updated to check their prodi
            const [targetUser] = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
            if (!targetUser) {
                set.status = 404;
                return { success: false, message: "User not found" };
            }

            // 2. Data Scoping: If not super_admin, must be same prodi
            if (!user.permissions.includes("*")) {
                if (targetUser.prodiId !== user.prodiId) {
                    set.status = 403;
                    return { success: false, message: "Forbidden: You can only manage users in your own prodi" };
                }
            }

            const updateData: any = {};
            if (body.name) updateData.name = body.name;
            if (body.email) updateData.email = body.email;
            if (body.roleId !== undefined) updateData.roleId = body.roleId;
            if (body.prodiId !== undefined) updateData.prodiId = body.prodiId;
            if (body.jabatan !== undefined) updateData.jabatan = body.jabatan;
            if (body.password) {
                updateData.passwordHash = await Bun.password.hash(body.password, {
                    algorithm: "bcrypt",
                    cost: 10,
                });
            }
            updateData.updatedAt = new Date();

            const [updated] = await db
                .update(users)
                .set(updateData)
                .where(eq(users.id, params.id))
                .returning({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    roleId: users.roleId,
                    jabatan: users.jabatan,
                    prodiId: users.prodiId,
                });

            if (!updated) {
                set.status = 404;
                return { success: false, message: "User not found" };
            }

            await logActivity(user.id, "update_user", "user", params.id);

            return { success: true, message: "User updated", data: updated };
        },
        {
            body: t.Object({
                name: t.Optional(t.String()),
                email: t.Optional(t.String()),
                password: t.Optional(t.String()),
                jabatan: t.Optional(t.Nullable(t.String())),
                prodiId: t.Optional(t.Nullable(t.String())),
                roleId: t.Optional(t.Nullable(t.String())),
            }),
        }
    )

    // ==================== DELETE USER (Super Admin) ====================
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("akun:manage")({ user, set });

        // 1. Fetch the user to be deleted
        const [targetUser] = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
        if (!targetUser) {
            set.status = 404;
            return { success: false, message: "User not found" };
        }

        // 2. Data Scoping
        if (!user.permissions.includes("*")) {
            if (targetUser.prodiId !== user.prodiId) {
                set.status = 403;
                return { success: false, message: "Forbidden: You can only manage users in your own prodi" };
            }
        }

        // Prevent self-deletion
        if (params.id === user.id) {
            set.status = 400;
            return { success: false, message: "Cannot delete yourself" };
        }

        const [deleted] = await db
            .delete(users)
            .where(eq(users.id, params.id))
            .returning({ id: users.id, email: users.email });

        if (!deleted) {
            set.status = 404;
            return { success: false, message: "User not found" };
        }

        await logActivity(user.id, "delete_user", "user", params.id, {
            email: deleted.email,
        });

        return { success: true, message: "User deleted" };
    });
