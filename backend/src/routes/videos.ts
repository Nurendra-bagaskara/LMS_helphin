import { Elysia, t } from "elysia";
import { db } from "../db";
import { videos, mataKuliah, prodi, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { logActivity } from "../utils/logger";
import { alias } from "drizzle-orm/pg-core";

const uploader = alias(users, "uploader");

// Helper: convert YouTube URL to embed ID (strip direct access)
function extractYoutubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Helper: format milliseconds to MM:SS or HH:MM:SS
function formatMillisToTime(millis: number): string {
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Helper: fetch YouTube chapters by scraping the video page
async function fetchYouTubeChapters(videoId: string): Promise<{ id: string; time: string; title: string; sortOrder: number }[]> {
    try {
        const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const html = await res.text();

        // Method 1: Parse ytInitialData for chapter markers
        const dataMatch = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
        if (dataMatch) {
            try {
                const data = JSON.parse(dataMatch[1]);
                const markersMap = data?.playerOverlays?.playerOverlayRenderer?.decoratedPlayerBarRenderer?.decoratedPlayerBarRenderer?.playerBar?.multiMarkersPlayerBarRenderer?.markersMap;
                
                if (markersMap) {
                    for (const map of markersMap) {
                        if (map.key === "DESCRIPTION_CHAPTERS" || map.key === "MACRO_MARKERS_LIST" || map.key === "AUTO_CHAPTERS") {
                            const chapters = map.value?.chapters || [];
                            if (chapters.length > 0) {
                                return chapters.map((c: any, idx: number) => ({
                                    id: `yt-ch-${idx}`,
                                    time: formatMillisToTime(c.chapterRenderer.timeRangeStartMillis),
                                    title: c.chapterRenderer.title.simpleText,
                                    sortOrder: idx,
                                }));
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to parse ytInitialData chapters:", e);
            }
        }

        // Method 2: Fall back to parsing description for timestamp patterns
        const descMatch = html.match(/"shortDescription":"(.*?)"/);
        if (descMatch) {
            const desc = descMatch[1].replace(/\\n/g, "\n");
            const regex = /(?:^|\n)(((\d{1,2}:)?\d{2}:\d{2}))\s+(.+)/g;
            let match;
            const chapters: { id: string; time: string; title: string; sortOrder: number }[] = [];
            let idx = 0;
            while ((match = regex.exec(desc)) !== null) {
                chapters.push({
                    id: `yt-desc-${idx}`,
                    time: match[1],
                    title: match[4].trim(),
                    sortOrder: idx,
                });
                idx++;
            }
            if (chapters.length > 0) return chapters;
        }

        return [];
    } catch (e) {
        console.error("Failed to fetch YouTube chapters:", e);
        return [];
    }
}

export const videoRoutes = new Elysia({ prefix: "/videos" })
    .use(authMiddleware)

    // ==================== LIST VIDEOS ====================
    .get("/", async ({ user, query, set }: any) => {
        requirePermission("video:view")({ user, set });

        let conditions: any[] = [];

        // Prodi-scoping: Non-super-admins see their own prodi, BUT students see all to support cross-prodi
        if (!user.permissions?.includes("*") && user.role !== "student") {
            if (!user.prodiId) {
                set.status = 403;
                return { success: false, message: "User has no assigned prodi" };
            }
            conditions.push(eq(videos.prodiId, user.prodiId));
        } else if (query.prodiId) {
            conditions.push(eq(videos.prodiId, query.prodiId));
        }

        if (query.type) conditions.push(eq(videos.type, query.type));
        if (query.mataKuliahId) conditions.push(eq(videos.mataKuliahId, query.mataKuliahId));
        if (query.tahunAjaran) conditions.push(eq(videos.tahunAjaran, query.tahunAjaran));

        const result = await db
            .select({
                id: videos.id,
                title: videos.title,
                description: videos.description,
                youtubeUrl: videos.youtubeUrl,
                type: videos.type,
                mataKuliahId: videos.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                tahunAjaran: videos.tahunAjaran,
                prodiId: videos.prodiId,
                prodiName: prodi.name,
                uploaderName: uploader.name,
                createdAt: videos.createdAt,
            })
            .from(videos)
            .leftJoin(mataKuliah, eq(videos.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(videos.prodiId, prodi.id))
            .leftJoin(uploader, eq(videos.uploadedBy, uploader.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(videos.createdAt);

        // Replace YouTube URL with embed URL
        const safeResult = result.map((v) => {
            const embedId = extractYoutubeId(v.youtubeUrl);
            return {
                ...v,
                youtubeUrl: undefined, // hide raw URL
                embedUrl: embedId
                    ? `https://www.youtube.com/embed/${embedId}`
                    : null,
            };
        });

        return { success: true, data: safeResult };
    })

    // ==================== GET BY ID ====================
    .get("/:id", async ({ user, params, set }: any) => {
        requirePermission("video:view")({ user, set });

        const [v] = await db
            .select({
                id: videos.id,
                title: videos.title,
                description: videos.description,
                youtubeUrl: videos.youtubeUrl,
                type: videos.type,
                mataKuliahId: videos.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                tahunAjaran: videos.tahunAjaran,
                prodiId: videos.prodiId,
                prodiName: prodi.name,
                uploaderName: uploader.name,
                createdAt: videos.createdAt,
            })
            .from(videos)
            .leftJoin(mataKuliah, eq(videos.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(videos.prodiId, prodi.id))
            .leftJoin(uploader, eq(videos.uploadedBy, uploader.id))
            .where(eq(videos.id, params.id))
            .limit(1);

        if (!v) {
            set.status = 404;
            return { success: false, message: "Video not found" };
        }

        // Access check: Admins can only see their own prodi videos, but students can see all for cross-prodi support
        if (!user.permissions?.includes("*") && user.role !== "student" && v.prodiId !== user.prodiId) {
            set.status = 403;
            return { success: false, message: "Forbidden: Cannot access videos from other prodi" };
        }

        const embedId = extractYoutubeId(v.youtubeUrl);
        const canManage = user.permissions?.includes("*") || user.permissions?.includes("video:manage");
        return {
            success: true,
            data: {
                ...v,
                youtubeUrl: canManage ? v.youtubeUrl : undefined, // Only expose raw URL to managers
                embedUrl: embedId ? `https://www.youtube.com/embed/${embedId}` : null,
            },
        };
    })

    // ==================== CREATE ====================
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("video:manage")({ user, set });

            const prodiId = body.prodiId || user.prodiId;
            if (!prodiId) {
                set.status = 400;
                return { success: false, message: "prodiId is required" };
            }

            // Access check
            if (!user.permissions?.includes("*") && prodiId !== user.prodiId) {
                set.status = 403;
                return { success: false, message: "Forbidden: Cannot add video for other prodi" };
            }

            const [created] = await db
                .insert(videos)
                .values({
                    title: body.title,
                    description: body.description || null,
                    youtubeUrl: body.youtubeUrl,
                    type: body.type || "recording",
                    mataKuliahId: body.mataKuliahId || null,
                    tahunAjaran: body.tahunAjaran || null,
                    prodiId,
                    uploadedBy: user.id,
                })
                .returning();

            await logActivity(user.id, "create_video", "video", created.id, {
                title: body.title,
            });

            set.status = 201;
            return { success: true, data: created };
        },
        {
            body: t.Object({
                title: t.String({ minLength: 1 }),
                description: t.Optional(t.String()),
                youtubeUrl: t.String({ minLength: 1 }),
                type: t.Optional(t.Union([t.Literal("recording"), t.Literal("live")])),
                mataKuliahId: t.Optional(t.String()),
                tahunAjaran: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // ==================== UPDATE ====================
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("video:manage")({ user, set });

            const [existing] = await db
                .select()
                .from(videos)
                .where(eq(videos.id, params.id))
                .limit(1);

            if (!existing) {
                set.status = 404;
                return { success: false, message: "Video not found" };
            }

            // Access check
            if (!user.permissions?.includes("*") && existing.prodiId !== user.prodiId) {
                set.status = 403;
                return { success: false, message: "Forbidden: Cannot edit video from other prodi" };
            }

            const updateData: any = {};
            if (body.title) updateData.title = body.title;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.youtubeUrl) updateData.youtubeUrl = body.youtubeUrl;
            if (body.type) updateData.type = body.type;
            if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;
            if (body.tahunAjaran) updateData.tahunAjaran = body.tahunAjaran;
            if (body.prodiId) {
                // Access check for new prodiId
                if (!user.permissions?.includes("*") && body.prodiId !== user.prodiId) {
                    set.status = 403;
                    return { success: false, message: "Forbidden: Cannot move video to other prodi" };
                }
                updateData.prodiId = body.prodiId;
            }

            const [updated] = await db
                .update(videos)
                .set(updateData)
                .where(eq(videos.id, params.id))
                .returning();

            await logActivity(user.id, "update_video", "video", params.id);
            return { success: true, data: updated };
        },
        {
            body: t.Object({
                title: t.Optional(t.String()),
                description: t.Optional(t.String()),
                youtubeUrl: t.Optional(t.String()),
                type: t.Optional(t.Union([t.Literal("recording"), t.Literal("live")])),
                mataKuliahId: t.Optional(t.String()),
                tahunAjaran: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // ==================== DELETE ====================
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("video:manage")({ user, set });

        const [existing] = await db
            .select()
            .from(videos)
            .where(eq(videos.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Video not found" };
        }

        // Access check
        if (!user.permissions?.includes("*") && existing.prodiId !== user.prodiId) {
            set.status = 403;
            return { success: false, message: "Forbidden: Cannot delete video from other prodi" };
        }

        await db.delete(videos).where(eq(videos.id, params.id));
        await logActivity(user.id, "delete_video", "video", params.id);

        return { success: true, message: "Video deleted" };
    })

    // ==================== GET CHAPTERS (from YouTube) ====================
    .get("/:id/chapters", async ({ params, set }: any) => {
        // Fetch the video to get its YouTube URL
        const [v] = await db
            .select({ youtubeUrl: videos.youtubeUrl })
            .from(videos)
            .where(eq(videos.id, params.id))
            .limit(1);

        if (!v) {
            set.status = 404;
            return { success: false, message: "Video not found" };
        }

        const ytId = extractYoutubeId(v.youtubeUrl);
        if (!ytId) {
            return { success: true, data: [] };
        }

        const chapters = await fetchYouTubeChapters(ytId);
        return { success: true, data: chapters };
    });
