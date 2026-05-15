import { Hono } from "hono";
import { db } from "../db";
import { videos, mataKuliah, prodi, users, responsi } from "../schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser, requirePermission } from "../auth";
import { logActivity } from "../logger";
import { cache, CACHE_TTL } from "../cache";
import { alias } from "drizzle-orm/pg-core";
import { sendSupportEmail } from "../mailer";

const uploader = alias(users, "uploader");

function extractYoutubeId(url: string): string | null {
    const patterns = [/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/, /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/, /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
}

function formatMillisToTime(millis: number): string {
    const totalSeconds = Math.floor(millis / 1000);
    const h = Math.floor(totalSeconds / 3600), m = Math.floor((totalSeconds % 3600) / 60), s = totalSeconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

async function fetchYouTubeChapters(videoId: string) {
    try {
        const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: { "User-Agent": "Mozilla/5.0" } });
        const html = await res.text();
        const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
        if (dataMatch) {
            const data = JSON.parse(dataMatch[1]);
            const markersMap = data?.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap;
            if (markersMap) {
                for (const map of markersMap) {
                    if (["DESCRIPTION_CHAPTERS", "MACRO_MARKERS_LIST", "AUTO_CHAPTERS"].includes(map.key)) {
                        const chapters = map.value?.chapters || [];
                        if (chapters.length > 0) return chapters.map((ch: any, idx: number) => ({ id: `yt-ch-${idx}`, time: formatMillisToTime(ch.chapterRenderer.timeRangeStartMillis), title: ch.chapterRenderer.title.simpleText, sortOrder: idx }));
                    }
                }
            }
        }
        return [];
    } catch { return []; }
}

// ===================== VIDEOS =====================
export const videoRoutes = new Hono();
videoRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("video:view")(user);
    let conditions: any[] = [];
    const { type, mataKuliahId, tahunAjaran, prodiId: qProdiId } = c.req.query();
    if (!user!.permissions?.includes("*") && user!.role !== "student") { if (!user!.prodiId) return c.json({ success: false, message: "User has no assigned prodi" }, 403); conditions.push(eq(videos.prodiId, user!.prodiId)); }
    else if (qProdiId) conditions.push(eq(videos.prodiId, qProdiId));
    if (type) conditions.push(eq(videos.type, type as any));
    if (mataKuliahId) conditions.push(eq(videos.mataKuliahId, mataKuliahId));
    if (tahunAjaran) conditions.push(eq(videos.tahunAjaran, tahunAjaran));
    const cacheKey = `videos:list:${user!.prodiId || 'all'}:${mataKuliahId || 'all'}:${type || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) return c.json(cached);
    const result = await db.select({ id: videos.id, title: videos.title, description: videos.description, youtubeUrl: videos.youtubeUrl, type: videos.type, mataKuliahId: videos.mataKuliahId, mataKuliahName: mataKuliah.name, tahunAjaran: videos.tahunAjaran, prodiId: videos.prodiId, prodiName: prodi.name, uploaderName: uploader.name, createdAt: videos.createdAt })
        .from(videos).leftJoin(mataKuliah, eq(videos.mataKuliahId, mataKuliah.id)).leftJoin(prodi, eq(videos.prodiId, prodi.id)).leftJoin(uploader, eq(videos.uploadedBy, uploader.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(videos.createdAt);
    const safeResult = result.map(v => { const eId = extractYoutubeId(v.youtubeUrl); return { ...v, youtubeUrl: undefined, embedUrl: eId ? `https://www.youtube.com/embed/${eId}` : null }; });
    const response = { success: true, data: safeResult };
    cache.set(cacheKey, response, CACHE_TTL.DASHBOARD);
    return c.json(response);
});
videoRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("video:view")(user);
    const [v] = await db.select({ id: videos.id, title: videos.title, description: videos.description, youtubeUrl: videos.youtubeUrl, type: videos.type, mataKuliahId: videos.mataKuliahId, mataKuliahName: mataKuliah.name, tahunAjaran: videos.tahunAjaran, prodiId: videos.prodiId, prodiName: prodi.name, uploaderName: uploader.name, createdAt: videos.createdAt })
        .from(videos).leftJoin(mataKuliah, eq(videos.mataKuliahId, mataKuliah.id)).leftJoin(prodi, eq(videos.prodiId, prodi.id)).leftJoin(uploader, eq(videos.uploadedBy, uploader.id))
        .where(eq(videos.id, c.req.param("id"))).limit(1);
    if (!v) return c.json({ success: false, message: "Video not found" }, 404);
    if (!user!.permissions?.includes("*") && user!.role !== "student" && v.prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    const eId = extractYoutubeId(v.youtubeUrl);
    const canManage = user!.permissions?.includes("*") || user!.permissions?.includes("video:manage");
    return c.json({ success: true, data: { ...v, youtubeUrl: canManage ? v.youtubeUrl : undefined, embedUrl: eId ? `https://www.youtube.com/embed/${eId}` : null } });
});
videoRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("video:manage")(user);
    const body = await c.req.json();
    const prodiId = body.prodiId || user!.prodiId;
    if (!prodiId) return c.json({ success: false, message: "prodiId is required" }, 400);
    if (!user!.permissions?.includes("*") && prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    const [created] = await db.insert(videos).values({ title: body.title, description: body.description || null, youtubeUrl: body.youtubeUrl, type: body.type || "recording", mataKuliahId: body.mataKuliahId || null, tahunAjaran: body.tahunAjaran || null, prodiId, uploadedBy: user!.id }).returning();
    await logActivity(user!.id, "create_video", "video", created.id);
    cache.invalidate("videos"); cache.invalidate("matkul");
    return c.json({ success: true, data: created }, 201);
});
videoRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("video:manage")(user);
    const body = await c.req.json();
    const [existing] = await db.select().from(videos).where(eq(videos.id, c.req.param("id"))).limit(1);
    if (!existing) return c.json({ success: false, message: "Video not found" }, 404);
    if (!user!.permissions?.includes("*") && existing.prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.youtubeUrl) updateData.youtubeUrl = body.youtubeUrl;
    if (body.type) updateData.type = body.type;
    if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;
    if (body.tahunAjaran) updateData.tahunAjaran = body.tahunAjaran;
    if (body.prodiId) { if (!user!.permissions?.includes("*") && body.prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403); updateData.prodiId = body.prodiId; }
    const [updated] = await db.update(videos).set(updateData).where(eq(videos.id, c.req.param("id"))).returning();
    await logActivity(user!.id, "update_video", "video", c.req.param("id"));
    cache.invalidate("videos");
    return c.json({ success: true, data: updated });
});
videoRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("video:manage")(user);
    const [existing] = await db.select().from(videos).where(eq(videos.id, c.req.param("id"))).limit(1);
    if (!existing) return c.json({ success: false, message: "Video not found" }, 404);
    if (!user!.permissions?.includes("*") && existing.prodiId !== user!.prodiId) return c.json({ success: false, message: "Forbidden" }, 403);
    await db.delete(videos).where(eq(videos.id, c.req.param("id")));
    await logActivity(user!.id, "delete_video", "video", c.req.param("id"));
    cache.invalidate("videos"); cache.invalidate("matkul");
    return c.json({ success: true, message: "Video deleted" });
});
videoRoutes.get("/:id/chapters", async (c) => {
    const [v] = await db.select({ youtubeUrl: videos.youtubeUrl }).from(videos).where(eq(videos.id, c.req.param("id"))).limit(1);
    if (!v) return c.json({ success: false, message: "Video not found" }, 404);
    const ytId = extractYoutubeId(v.youtubeUrl);
    if (!ytId) return c.json({ success: true, data: [] });
    const chapters = await fetchYouTubeChapters(ytId);
    return c.json({ success: true, data: chapters });
});

// ===================== RESPONSI =====================
export const responsiRoutes = new Hono();
responsiRoutes.get("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("responsi:view")(user);
    let conditions: any[] = [];
    const { mataKuliahId, status, prodiId: qProdiId } = c.req.query();
    if (!user!.permissions?.includes("*") && user!.role !== "student") conditions.push(eq(responsi.prodiId, user!.prodiId!));
    else if (qProdiId) conditions.push(eq(responsi.prodiId, qProdiId));
    if (mataKuliahId) conditions.push(eq(responsi.mataKuliahId, mataKuliahId));
    if (status) conditions.push(eq(responsi.status, status as any));
    const result = await db.select({ id: responsi.id, title: responsi.title, description: responsi.description, speaker: responsi.speaker, topic: responsi.topic, scheduleDate: responsi.scheduleDate, durationMinutes: responsi.durationMinutes, meetingLink: responsi.meetingLink, requestMaterialLink: responsi.requestMaterialLink, communityLink: responsi.communityLink, liveChatLink: responsi.liveChatLink, status: responsi.status, mataKuliahId: responsi.mataKuliahId, mataKuliahName: mataKuliah.name, prodiId: responsi.prodiId, prodiName: prodi.name, createdAt: responsi.createdAt })
        .from(responsi).leftJoin(mataKuliah, eq(responsi.mataKuliahId, mataKuliah.id)).leftJoin(prodi, eq(responsi.prodiId, prodi.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(responsi.scheduleDate);
    return c.json({ success: true, data: result });
});
responsiRoutes.get("/:id", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const [r] = await db.select({ id: responsi.id, title: responsi.title, description: responsi.description, speaker: responsi.speaker, topic: responsi.topic, scheduleDate: responsi.scheduleDate, durationMinutes: responsi.durationMinutes, meetingLink: responsi.meetingLink, requestMaterialLink: responsi.requestMaterialLink, communityLink: responsi.communityLink, liveChatLink: responsi.liveChatLink, status: responsi.status, mataKuliahId: responsi.mataKuliahId, mataKuliahName: mataKuliah.name, prodiId: responsi.prodiId, prodiName: prodi.name, createdAt: responsi.createdAt })
        .from(responsi).leftJoin(mataKuliah, eq(responsi.mataKuliahId, mataKuliah.id)).leftJoin(prodi, eq(responsi.prodiId, prodi.id))
        .where(eq(responsi.id, c.req.param("id"))).limit(1);
    if (!r) return c.json({ success: false, message: "Responsi not found" }, 404);
    return c.json({ success: true, data: r });
});
responsiRoutes.post("/", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("responsi:manage")(user);
    const body = await c.req.json();
    const prodiId = body.prodiId || user!.prodiId;
    const [created] = await db.insert(responsi).values({ title: body.title, description: body.description || null, speaker: body.speaker || null, topic: body.topic || null, scheduleDate: new Date(body.scheduleDate), durationMinutes: body.durationMinutes || null, meetingLink: body.meetingLink || null, requestMaterialLink: body.requestMaterialLink || null, communityLink: body.communityLink || null, liveChatLink: body.liveChatLink || null, status: body.status || "upcoming", mataKuliahId: body.mataKuliahId || null, prodiId, createdBy: user!.id }).returning();
    await logActivity(user!.id, "create_responsi", "responsi", created.id);
    cache.invalidate("matkul");
    return c.json({ success: true, data: created }, 201);
});
responsiRoutes.patch("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("responsi:manage")(user);
    const body = await c.req.json();
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.speaker !== undefined) updateData.speaker = body.speaker;
    if (body.topic !== undefined) updateData.topic = body.topic;
    if (body.scheduleDate) updateData.scheduleDate = new Date(body.scheduleDate);
    if (body.durationMinutes !== undefined) updateData.durationMinutes = body.durationMinutes;
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink;
    if (body.requestMaterialLink !== undefined) updateData.requestMaterialLink = body.requestMaterialLink;
    if (body.communityLink !== undefined) updateData.communityLink = body.communityLink;
    if (body.liveChatLink !== undefined) updateData.liveChatLink = body.liveChatLink;
    if (body.status) updateData.status = body.status;
    if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;
    const [updated] = await db.update(responsi).set(updateData).where(eq(responsi.id, c.req.param("id"))).returning();
    if (!updated) return c.json({ success: false, message: "Responsi not found" }, 404);
    await logActivity(user!.id, "update_responsi", "responsi", c.req.param("id"));
    return c.json({ success: true, data: updated });
});
responsiRoutes.delete("/:id", async (c) => {
    const user = await getAuthUser(c);
    requirePermission("responsi:manage")(user);
    await db.delete(responsi).where(eq(responsi.id, c.req.param("id")));
    await logActivity(user!.id, "delete_responsi", "responsi", c.req.param("id"));
    cache.invalidate("matkul");
    return c.json({ success: true, message: "Responsi deleted" });
});

// ===================== SUPPORT =====================
export const supportRoutes = new Hono();
supportRoutes.post("/send", async (c) => {
    const user = await getAuthUser(c);
    if (!user) return c.json({ success: false, message: "Unauthorized" }, 401);
    const { subject, category, message } = await c.req.json();
    let emailSent = false;
    try { emailSent = await sendSupportEmail(user.name, user.email, subject, category, message); } catch {}
    await logActivity(user.id, "send_support_ticket", "support", undefined, { subject, category, emailSent });
    if (!emailSent) return c.json({ success: true, message: "Laporan berhasil tercatat! Namun email notifikasi gagal dikirim." });
    return c.json({ success: true, message: "Laporan berhasil dikirim! Tim kami akan meninjau dan merespons melalui email." });
});
