import { Elysia, t } from "elysia";
import { db } from "../db";
import { videos, mataKuliah, prodi } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

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

export const videoRoutes = new Elysia({ prefix: "/videos" })
    .use(authMiddleware)

    // ==================== LIST VIDEOS ====================
    .get("/", async ({ user, query, set }: any) => {
        requirePermission("video:view")({ user, set });

        let conditions: any[] = [];

        // Prodi-scoping: Non-super-admins can only see their own prodi videos
        if (!user.permissions?.includes("*")) {
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
                createdAt: videos.createdAt,
            })
            .from(videos)
            .leftJoin(mataKuliah, eq(videos.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(videos.prodiId, prodi.id))
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
                createdAt: videos.createdAt,
            })
            .from(videos)
            .leftJoin(mataKuliah, eq(videos.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(videos.prodiId, prodi.id))
            .where(eq(videos.id, params.id))
            .limit(1);

        if (!v) {
            set.status = 404;
            return { success: false, message: "Video not found" };
        }

        // Access check
        if (!user.permissions?.includes("*") && v.prodiId !== user.prodiId) {
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
    });
