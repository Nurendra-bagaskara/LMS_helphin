import { Hono } from "hono";
import { db } from "../db";
import { mataKuliah, prodi, materials, pinnedMataKuliah, videos, responsi, exercises, bankSoal } from "../schema";
import { eq, count, sql, and } from "drizzle-orm";
import { getAuthUser, requirePermission, requireProdiAccessOrAdmin } from "../auth";
import { logActivity } from "../logger";
import { cache, CACHE_TTL } from "../cache";

const mkRoutes = new Hono();

// LIST
mkRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("matkul:view")(user);
    let conditions: any[] = [];
    const qProdiId = c.req.query("prodiId");
    if (qProdiId) conditions.push(eq(mataKuliah.prodiId, qProdiId));
    else if (!user!.permissions.includes("*")) conditions.push(eq(mataKuliah.prodiId, user!.prodiId!));

    const cacheKey = `matkul:list:${user!.id}:${qProdiId || 'default'}`;
    const cached = cache.get(cacheKey);
    if (cached) return c.json(cached);

    const result = await db.select({
        id: mataKuliah.id, name: mataKuliah.name, coverUrl: mataKuliah.coverUrl,
        prodiId: mataKuliah.prodiId, prodiName: prodi.name, createdAt: mataKuliah.createdAt,
        materialCount: sql<number>`CAST(count(DISTINCT ${materials.id}) + count(DISTINCT ${videos.id}) + count(DISTINCT ${responsi.id}) + count(DISTINCT ${exercises.id}) + count(DISTINCT ${bankSoal.id}) AS INTEGER)`,
        isPinned: sql<boolean>`CASE WHEN ${pinnedMataKuliah.id} IS NOT NULL THEN true ELSE false END`,
    }).from(mataKuliah)
      .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
      .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
      .leftJoin(videos, eq(videos.mataKuliahId, mataKuliah.id))
      .leftJoin(responsi, eq(responsi.mataKuliahId, mataKuliah.id))
      .leftJoin(exercises, eq(exercises.mataKuliahId, mataKuliah.id))
      .leftJoin(bankSoal, eq(bankSoal.mataKuliahId, mataKuliah.id))
      .leftJoin(pinnedMataKuliah, and(eq(pinnedMataKuliah.mataKuliahId, mataKuliah.id), eq(pinnedMataKuliah.userId, user!.id)))
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .groupBy(mataKuliah.id, mataKuliah.name, mataKuliah.coverUrl, mataKuliah.prodiId, prodi.name, mataKuliah.createdAt, pinnedMataKuliah.id);

    const response = { success: true, data: result };
    cache.set(cacheKey, response, CACHE_TTL.DASHBOARD);
    return c.json(response);
});

// TOGGLE PIN
mkRoutes.post("/:id/pin", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const mataKuliahId = c.req.param("id");
    const existingPins = await db.execute(sql`SELECT id FROM pinned_mata_kuliah WHERE user_id = ${user.id} AND mata_kuliah_id = ${mataKuliahId} LIMIT 1`);
    if (existingPins.length > 0) {
        await db.execute(sql`DELETE FROM pinned_mata_kuliah WHERE user_id = ${user.id} AND mata_kuliah_id = ${mataKuliahId}`);
        return c.json({ success: true, message: "Mata Kuliah unpinned", isPinned: false });
    } else {
        await db.execute(sql`INSERT INTO pinned_mata_kuliah (id, user_id, mata_kuliah_id, created_at) VALUES (gen_random_uuid(), ${user.id}, ${mataKuliahId}, NOW())`);
        return c.json({ success: true, message: "Mata Kuliah pinned", isPinned: true });
    }
});

// GET BY ID
mkRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [mk] = await db.select({
        id: mataKuliah.id, name: mataKuliah.name, coverUrl: mataKuliah.coverUrl,
        prodiId: mataKuliah.prodiId, prodiName: prodi.name, createdAt: mataKuliah.createdAt,
        materialCount: sql<number>`CAST(count(DISTINCT ${materials.id}) + count(DISTINCT ${videos.id}) + count(DISTINCT ${responsi.id}) + count(DISTINCT ${exercises.id}) + count(DISTINCT ${bankSoal.id}) AS INTEGER)`,
    }).from(mataKuliah).leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
      .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
      .leftJoin(videos, eq(videos.mataKuliahId, mataKuliah.id))
      .leftJoin(responsi, eq(responsi.mataKuliahId, mataKuliah.id))
      .leftJoin(exercises, eq(exercises.mataKuliahId, mataKuliah.id))
      .leftJoin(bankSoal, eq(bankSoal.mataKuliahId, mataKuliah.id))
      .where(eq(mataKuliah.id, c.req.param("id"))).groupBy(mataKuliah.id, prodi.id).limit(1);
    if (!mk) return c.json({ success: false, message: "Mata Kuliah not found" }, 404);
    return c.json({ success: true, data: mk });
});

// CREATE
mkRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("matkul:manage")(user);
    const body = await c.req.json();
    if (!requireProdiAccessOrAdmin(body.prodiId, user!)) return c.json({ success: false, message: "Forbidden" }, 403);
    const [created] = await db.insert(mataKuliah).values({ name: body.name, coverUrl: body.coverUrl || null, prodiId: body.prodiId }).returning();
    await logActivity(user!.id, "create_mata_kuliah", "mata_kuliah", created.id);
    cache.invalidate("matkul");
    return c.json({ success: true, data: created }, 201);
});

// UPDATE
mkRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("matkul:manage")(user);
    const body = await c.req.json();
    const [existing] = await db.select().from(mataKuliah).where(eq(mataKuliah.id, c.req.param("id"))).limit(1);
    if (!existing) return c.json({ success: false, message: "Mata Kuliah not found" }, 404);
    if (!requireProdiAccessOrAdmin(existing.prodiId, user!)) return c.json({ success: false, message: "Forbidden" }, 403);
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.coverUrl !== undefined) updateData.coverUrl = body.coverUrl;
    if (body.prodiId) { if (!requireProdiAccessOrAdmin(body.prodiId, user!)) return c.json({ success: false, message: "Forbidden" }, 403); updateData.prodiId = body.prodiId; }
    const [updated] = await db.update(mataKuliah).set(updateData).where(eq(mataKuliah.id, c.req.param("id"))).returning();
    await logActivity(user!.id, "update_mata_kuliah", "mata_kuliah", c.req.param("id"));
    cache.invalidate("matkul");
    return c.json({ success: true, data: updated });
});

// DELETE
mkRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("matkul:manage")(user);
    const [existing] = await db.select().from(mataKuliah).where(eq(mataKuliah.id, c.req.param("id"))).limit(1);
    if (!existing) return c.json({ success: false, message: "Mata Kuliah not found" }, 404);
    if (!requireProdiAccessOrAdmin(existing.prodiId, user!)) return c.json({ success: false, message: "Forbidden" }, 403);
    await db.delete(mataKuliah).where(eq(mataKuliah.id, c.req.param("id")));
    await logActivity(user!.id, "delete_mata_kuliah", "mata_kuliah", c.req.param("id"));
    cache.invalidate("matkul");
    return c.json({ success: true, message: "Mata Kuliah deleted" });
});

export default mkRoutes;
