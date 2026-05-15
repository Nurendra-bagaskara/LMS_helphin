import { Hono } from "hono";
import { db } from "../db";
import { users, prodi, roles } from "../schema";
import { eq, and, ne } from "drizzle-orm";
import { getAuthUser, requireRole, requirePermission } from "../auth";
import { logActivity } from "../logger";
import bcrypt from "bcryptjs";

const userRoutes = new Hono();

// UPDATE SELF PROFILE
userRoutes.patch("/profile", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const body = await c.req.json();
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.nim) {
        const [existing] = await db.select().from(users).where(and(eq(users.nim, body.nim), ne(users.id, user.id))).limit(1);
        if (existing) return c.json({ success: false, message: "NIM already taken" }, 409);
        updateData.nim = body.nim;
    }
    if (body.email) {
        const [existing] = await db.select().from(users).where(and(eq(users.email, body.email), ne(users.id, user.id))).limit(1);
        if (existing) return c.json({ success: false, message: "Email already taken" }, 409);
        updateData.email = body.email;
    }
    if (body.password) updateData.passwordHash = await bcrypt.hash(body.password, 10);
    updateData.updatedAt = new Date();
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, user.id))
        .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId, jabatan: users.jabatan, prodiId: users.prodiId, nim: users.nim });
    if (!updated) return c.json({ success: false, message: "User not found" }, 404);
    await logActivity(user.id, "update_profile", "user", user.id);
    return c.json({ success: true, message: "Profile updated", data: updated });
});

// LIST USERS
userRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    requireRole("super_admin")(user);
    const { roleId, prodiId } = c.req.query();
    let conditions: any[] = [];
    if (roleId) conditions.push(eq(users.roleId, roleId));
    if (prodiId) conditions.push(eq(users.prodiId, prodiId));
    if (!user!.permissions.includes("*") && user!.prodiId) conditions.push(eq(users.prodiId, user!.prodiId));
    const result = await db.select({ id: users.id, name: users.name, email: users.email, role: roles.code, roleId: users.roleId, jabatan: users.jabatan, prodiId: users.prodiId, createdAt: users.createdAt })
        .from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(users.createdAt);
    return c.json({ success: true, data: result });
});

// CREATE USER
userRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("akun:manage")(user);
    const body = await c.req.json();
    const { name, email, password, prodiId, jabatan, roleId } = body;
    if (!user!.permissions.includes("*") && prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    if (prodiId) { const [p] = await db.select().from(prodi).where(eq(prodi.id, prodiId)).limit(1); if (!p) return c.json({ success: false, message: "Prodi not found" }, 400); }
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) return c.json({ success: false, message: "Email already registered" }, 409);
    const passwordHash = await bcrypt.hash(password, 10);
    const [newAdmin] = await db.insert(users).values({ name, email, passwordHash, roleId: roleId || null, jabatan: jabatan || null, prodiId: prodiId || null })
        .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId, jabatan: users.jabatan, prodiId: users.prodiId, createdAt: users.createdAt });
    await logActivity(user!.id, "create_admin", "user", newAdmin.id, { email });
    return c.json({ success: true, message: "Admin created", data: newAdmin }, 201);
});

// GET SINGLE USER
userRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    requireRole("super_admin")(user);
    const id = c.req.param("id");
    const [u] = await db.select({ id: users.id, name: users.name, email: users.email, role: roles.code, roleId: users.roleId, jabatan: users.jabatan, prodiId: users.prodiId, createdAt: users.createdAt })
        .from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, id)).limit(1);
    if (!u) return c.json({ success: false, message: "User not found" }, 404);
    return c.json({ success: true, data: u });
});

// UPDATE USER
userRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("akun:manage")(user);
    const id = c.req.param("id");
    const body = await c.req.json();
    const [targetUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser) return c.json({ success: false, message: "User not found" }, 404);
    if (!user!.permissions.includes("*") && targetUser.prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.roleId !== undefined) updateData.roleId = body.roleId;
    if (body.prodiId !== undefined) updateData.prodiId = body.prodiId;
    if (body.jabatan !== undefined) updateData.jabatan = body.jabatan;
    if (body.password) updateData.passwordHash = await bcrypt.hash(body.password, 10);
    updateData.updatedAt = new Date();
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, id))
        .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId, jabatan: users.jabatan, prodiId: users.prodiId });
    if (!updated) return c.json({ success: false, message: "User not found" }, 404);
    await logActivity(user!.id, "update_user", "user", id);
    return c.json({ success: true, message: "User updated", data: updated });
});

// DELETE USER
userRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("akun:manage")(user);
    const id = c.req.param("id");
    const [targetUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser) return c.json({ success: false, message: "User not found" }, 404);
    if (!user!.permissions.includes("*") && targetUser.prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    if (id === user!.id) return c.json({ success: false, message: "Cannot delete yourself" }, 400);
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id, email: users.email });
    if (!deleted) return c.json({ success: false, message: "User not found" }, 404);
    await logActivity(user!.id, "delete_user", "user", id, { email: deleted.email });
    return c.json({ success: true, message: "User deleted" });
});

export default userRoutes;
