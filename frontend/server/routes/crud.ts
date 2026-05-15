import { Hono } from "hono";
import { db } from "../db";
import { fakultas, prodi, roles, materialRequests, exercises, activityLogs, users, mataKuliah } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUser, requirePermission, requireRole, requireProdiAccessOrAdmin } from "../auth";
import { logActivity } from "../logger";
import { cache, CACHE_TTL } from "../cache";

// ===================== FAKULTAS =====================
export const fakultasRoutes = new Hono();
fakultasRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const result = await db.select().from(fakultas);
    return c.json({ success: true, data: result });
});
fakultasRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [f] = await db.select().from(fakultas).where(eq(fakultas.id, c.req.param("id"))).limit(1);
    if (!f) return c.json({ success: false, message: "Fakultas not found" }, 404);
    return c.json({ success: true, data: f });
});
fakultasRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("fakultas:manage")(user);
    const body = await c.req.json();
    const [created] = await db.insert(fakultas).values({ name: body.name, universityName: body.universityName || "Telkom University" }).returning();
    await logActivity(user!.id, "create_fakultas", "fakultas", created.id);
    return c.json({ success: true, data: created }, 201);
});
fakultasRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("fakultas:manage")(user);
    const body = await c.req.json();
    const [updated] = await db.update(fakultas).set({ name: body.name, ...(body.universityName && { universityName: body.universityName }) }).where(eq(fakultas.id, c.req.param("id"))).returning();
    if (!updated) return c.json({ success: false, message: "Fakultas not found" }, 404);
    await logActivity(user!.id, "update_fakultas", "fakultas", c.req.param("id"));
    return c.json({ success: true, data: updated });
});
fakultasRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("fakultas:manage")(user);
    const [deleted] = await db.delete(fakultas).where(eq(fakultas.id, c.req.param("id"))).returning();
    if (!deleted) return c.json({ success: false, message: "Fakultas not found" }, 404);
    await logActivity(user!.id, "delete_fakultas", "fakultas", c.req.param("id"));
    return c.json({ success: true, message: "Fakultas deleted" });
});

// ===================== PRODI =====================
export const prodiRoutes = new Hono();
// LIST - public for registration
prodiRoutes.get("/", async (c) => {
    const fakultasId = c.req.query("fakultasId");
    const cacheKey = `prodi:list:${fakultasId || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return c.json(cached);
    const result = await db.select({ id: prodi.id, name: prodi.name, description: prodi.description, fakultasId: prodi.fakultasId, fakultasName: fakultas.name, universityName: fakultas.universityName, logoUrl: prodi.logoUrl, createdAt: prodi.createdAt })
        .from(prodi).leftJoin(fakultas, eq(prodi.fakultasId, fakultas.id)).where(fakultasId ? eq(prodi.fakultasId, fakultasId) : undefined);
    const response = { success: true, data: result };
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);
    return c.json(response);
});
prodiRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [p] = await db.select({ id: prodi.id, name: prodi.name, description: prodi.description, fakultasId: prodi.fakultasId, fakultasName: fakultas.name, universityName: fakultas.universityName, logoUrl: prodi.logoUrl, createdAt: prodi.createdAt })
        .from(prodi).leftJoin(fakultas, eq(prodi.fakultasId, fakultas.id)).where(eq(prodi.id, c.req.param("id"))).limit(1);
    if (!p) return c.json({ success: false, message: "Prodi not found" }, 404);
    return c.json({ success: true, data: p });
});
prodiRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("prodi:manage")(user);
    const body = await c.req.json();
    const [created] = await db.insert(prodi).values({ name: body.name, description: body.description || null, logoUrl: body.logoUrl || null, fakultasId: body.fakultasId }).returning();
    await logActivity(user!.id, "create_prodi", "prodi", created.id);
    cache.invalidate("prodi");
    return c.json({ success: true, data: created }, 201);
});
prodiRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("prodi:manage")(user);
    const body = await c.req.json();
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.fakultasId) updateData.fakultasId = body.fakultasId;
    const [updated] = await db.update(prodi).set(updateData).where(eq(prodi.id, c.req.param("id"))).returning();
    if (!updated) return c.json({ success: false, message: "Prodi not found" }, 404);
    await logActivity(user!.id, "update_prodi", "prodi", c.req.param("id"));
    cache.invalidate("prodi");
    return c.json({ success: true, data: updated });
});
prodiRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("prodi:manage")(user);
    const [deleted] = await db.delete(prodi).where(eq(prodi.id, c.req.param("id"))).returning();
    if (!deleted) return c.json({ success: false, message: "Prodi not found" }, 404);
    await logActivity(user!.id, "delete_prodi", "prodi", c.req.param("id"));
    cache.invalidate("prodi");
    return c.json({ success: true, message: "Prodi deleted" });
});

// ===================== ROLES =====================
export const rolesRoutes = new Hono();
rolesRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const result = await db.select().from(roles);
    return c.json({ success: true, data: result });
});
rolesRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [r] = await db.select().from(roles).where(eq(roles.id, c.req.param("id"))).limit(1);
    if (!r) return c.json({ success: false, message: "Role not found" }, 404);
    return c.json({ success: true, data: r });
});
rolesRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("role:manage")(user);
    const body = await c.req.json();
    const [created] = await db.insert(roles).values({ name: body.name, code: body.code, permissions: body.permissions || [] }).returning();
    await logActivity(user!.id, "create_role", "role", created.id);
    return c.json({ success: true, data: created }, 201);
});
rolesRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("role:manage")(user);
    const body = await c.req.json();
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.code) updateData.code = body.code;
    if (body.permissions) updateData.permissions = body.permissions;
    const [updated] = await db.update(roles).set(updateData).where(eq(roles.id, c.req.param("id"))).returning();
    if (!updated) return c.json({ success: false, message: "Role not found" }, 404);
    await logActivity(user!.id, "update_role", "role", c.req.param("id"));
    return c.json({ success: true, data: updated });
});
rolesRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("role:manage")(user);
    const [deleted] = await db.delete(roles).where(eq(roles.id, c.req.param("id"))).returning();
    if (!deleted) return c.json({ success: false, message: "Role not found" }, 404);
    await logActivity(user!.id, "delete_role", "role", c.req.param("id"));
    return c.json({ success: true, message: "Role deleted" });
});

// ===================== REQUESTS =====================
export const requestsRoutes = new Hono();
requestsRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    let conditions: any[] = [];
    if (!user.permissions.includes("*")) conditions.push(eq(materialRequests.prodiId, user.prodiId!));
    const result = await db.select({ id: materialRequests.id, title: materialRequests.title, subject: materialRequests.subject, description: materialRequests.description, studentId: materialRequests.studentId, studentName: users.name, prodiId: materialRequests.prodiId, prodiName: prodi.name, createdAt: materialRequests.createdAt })
        .from(materialRequests).leftJoin(users, eq(materialRequests.studentId, users.id)).leftJoin(prodi, eq(materialRequests.prodiId, prodi.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(desc(materialRequests.createdAt));
    return c.json({ success: true, data: result });
});
requestsRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const body = await c.req.json();
    const [created] = await db.insert(materialRequests).values({ title: body.title, subject: body.subject || null, description: body.description || null, studentId: user.id, prodiId: body.prodiId || user.prodiId! }).returning();
    await logActivity(user.id, "create_request", "request", created.id);
    return c.json({ success: true, data: created }, 201);
});
requestsRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [deleted] = await db.delete(materialRequests).where(eq(materialRequests.id, c.req.param("id"))).returning();
    if (!deleted) return c.json({ success: false, message: "Request not found" }, 404);
    await logActivity(user.id, "delete_request", "request", c.req.param("id"));
    return c.json({ success: true, message: "Request deleted" });
});

// ===================== EXERCISES =====================
export const exercisesRoutes = new Hono();
exercisesRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("latihan:view")(user);
    const { mataKuliahId, prodiId: qProdiId } = c.req.query();
    let conditions: any[] = [];
    if (!user!.permissions.includes("*") && user!.role !== "student") conditions.push(eq(exercises.prodiId, user!.prodiId!));
    else if (qProdiId) conditions.push(eq(exercises.prodiId, qProdiId));
    if (mataKuliahId) conditions.push(eq(exercises.mataKuliahId, mataKuliahId));
    const result = await db.select({ id: exercises.id, title: exercises.title, subject: exercises.subject, description: exercises.description, googleFormUrl: exercises.googleFormUrl, mataKuliahId: exercises.mataKuliahId, mataKuliahName: mataKuliah.name, tahunAjaran: exercises.tahunAjaran, prodiId: exercises.prodiId, prodiName: prodi.name, createdAt: exercises.createdAt })
        .from(exercises).leftJoin(mataKuliah, eq(exercises.mataKuliahId, mataKuliah.id)).leftJoin(prodi, eq(exercises.prodiId, prodi.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(exercises.createdAt);
    return c.json({ success: true, data: result });
});
exercisesRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [e] = await db.select({ id: exercises.id, title: exercises.title, subject: exercises.subject, description: exercises.description, googleFormUrl: exercises.googleFormUrl, mataKuliahId: exercises.mataKuliahId, mataKuliahName: mataKuliah.name, tahunAjaran: exercises.tahunAjaran, prodiId: exercises.prodiId, prodiName: prodi.name, createdAt: exercises.createdAt })
        .from(exercises).leftJoin(mataKuliah, eq(exercises.mataKuliahId, mataKuliah.id)).leftJoin(prodi, eq(exercises.prodiId, prodi.id))
        .where(eq(exercises.id, c.req.param("id"))).limit(1);
    if (!e) return c.json({ success: false, message: "Exercise not found" }, 404);
    return c.json({ success: true, data: e });
});
exercisesRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("latihan:manage")(user);
    const body = await c.req.json();
    const prodiId = body.prodiId || user!.prodiId;
    if (!requireProdiAccessOrAdmin(prodiId, user!)) return c.json({ success: false, message: "Forbidden" }, 403);
    const [created] = await db.insert(exercises).values({ title: body.title, subject: body.subject || null, description: body.description || null, googleFormUrl: body.googleFormUrl, mataKuliahId: body.mataKuliahId || null, tahunAjaran: body.tahunAjaran || null, prodiId, createdBy: user!.id }).returning();
    await logActivity(user!.id, "create_exercise", "exercise", created.id);
    return c.json({ success: true, data: created }, 201);
});
exercisesRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("latihan:manage")(user);
    const body = await c.req.json();
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.googleFormUrl) updateData.googleFormUrl = body.googleFormUrl;
    if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;
    if (body.tahunAjaran) updateData.tahunAjaran = body.tahunAjaran;
    const [updated] = await db.update(exercises).set(updateData).where(eq(exercises.id, c.req.param("id"))).returning();
    if (!updated) return c.json({ success: false, message: "Exercise not found" }, 404);
    await logActivity(user!.id, "update_exercise", "exercise", c.req.param("id"));
    return c.json({ success: true, data: updated });
});
exercisesRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("latihan:manage")(user);
    await db.delete(exercises).where(eq(exercises.id, c.req.param("id")));
    await logActivity(user!.id, "delete_exercise", "exercise", c.req.param("id"));
    return c.json({ success: true, message: "Exercise deleted" });
});

// ===================== ACTIVITY LOGS =====================
export const activityLogsRoutes = new Hono();
activityLogsRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("log:view")(user);
    const result = await db.select({ id: activityLogs.id, userId: activityLogs.userId, userName: users.name, action: activityLogs.action, entityType: activityLogs.entityType, entityId: activityLogs.entityId, details: activityLogs.details, ipAddress: activityLogs.ipAddress, createdAt: activityLogs.createdAt })
        .from(activityLogs).leftJoin(users, eq(activityLogs.userId, users.id)).orderBy(desc(activityLogs.createdAt)).limit(200);
    return c.json({ success: true, data: result });
});
