import { Elysia, t } from "elysia";
import { db } from "../db";
import { responsi, videos, prodi } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission, requireProdiAccessOrAdmin } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const responsiRoutes = new Elysia({ prefix: "/responsi" })
    .use(authMiddleware)

    // LIST
    .get("/", async ({ query, user, set }: any) => {
        requirePermission("responsi:view")({ user, set });
        let conditions: any[] = [];
        if (query.prodiId) conditions.push(eq(responsi.prodiId, query.prodiId));
        if (query.mataKuliahId) conditions.push(eq(responsi.mataKuliahId, query.mataKuliahId));
        if (query.status) conditions.push(eq(responsi.status, query.status));

        const result = await db
            .select({
                id: responsi.id,
                title: responsi.title,
                description: responsi.description,
                speaker: responsi.speaker,
                topic: responsi.topic,
                scheduleDate: responsi.scheduleDate,
                durationMinutes: responsi.durationMinutes,
                meetingLink: responsi.meetingLink,
                requestMaterialLink: responsi.requestMaterialLink,
                communityLink: responsi.communityLink,
                status: responsi.status,
                mataKuliahId: responsi.mataKuliahId,
                prodiId: responsi.prodiId,
                prodiName: prodi.name,
                createdBy: responsi.createdBy,
                createdAt: responsi.createdAt,
            })
            .from(responsi)
            .leftJoin(prodi, eq(responsi.prodiId, prodi.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(responsi.scheduleDate);

        return { success: true, data: result };
    })

    // GET BY ID
    .get("/:id", async ({ params, set, user }: any) => {
        requirePermission("responsi:view")({ user, set });
        const [r] = await db
            .select({
                id: responsi.id,
                title: responsi.title,
                description: responsi.description,
                speaker: responsi.speaker,
                topic: responsi.topic,
                scheduleDate: responsi.scheduleDate,
                durationMinutes: responsi.durationMinutes,
                meetingLink: responsi.meetingLink,
                requestMaterialLink: responsi.requestMaterialLink,
                communityLink: responsi.communityLink,
                status: responsi.status,
                mataKuliahId: responsi.mataKuliahId,
                prodiId: responsi.prodiId,
                prodiName: prodi.name,
                createdBy: responsi.createdBy,
                createdAt: responsi.createdAt,
            })
            .from(responsi)
            .leftJoin(prodi, eq(responsi.prodiId, prodi.id))
            .where(eq(responsi.id, params.id))
            .limit(1);

        if (!r) {
            set.status = 404;
            return { success: false, message: "Responsi not found" };
        }
        return { success: true, data: r };
    })

    // CREATE (Admin / Super Admin)
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("responsi:manage")({ user, set });

            const prodiId = body.prodiId || user.prodiId;
            if (!prodiId) {
                set.status = 400;
                return { success: false, message: "prodiId is required" };
            }

            if (!requireProdiAccessOrAdmin(prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot create responsi for other prodi" };
            }

            const [created] = await db
                .insert(responsi)
                .values({
                    title: body.title,
                    description: body.description || null,
                    speaker: body.speaker || null,
                    topic: body.topic || null,
                    scheduleDate: new Date(body.scheduleDate),
                    durationMinutes: body.durationMinutes || null,
                    meetingLink: body.meetingLink || null,
                    requestMaterialLink: body.requestMaterialLink || null,
                    communityLink: body.communityLink || null,
                    status: body.status || "upcoming",
                    mataKuliahId: body.mataKuliahId || null,
                    prodiId,
                    createdBy: user.id,
                })
                .returning();

            await logActivity(user.id, "create_responsi", "responsi", created.id);

            set.status = 201;
            return { success: true, data: created };
        },
        {
            body: t.Object({
                title: t.String({ minLength: 1 }),
                description: t.Optional(t.String()),
                speaker: t.Optional(t.String()),
                topic: t.Optional(t.String()),
                scheduleDate: t.String(),
                durationMinutes: t.Optional(t.Number()),
                meetingLink: t.Optional(t.String()),
                requestMaterialLink: t.Optional(t.String()),
                communityLink: t.Optional(t.String()),
                status: t.Optional(
                    t.Union([
                        t.Literal("upcoming"),
                        t.Literal("live"),
                        t.Literal("completed"),
                    ])
                ),
                mataKuliahId: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // UPDATE
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("responsi:manage")({ user, set });

            const [existing] = await db
                .select()
                .from(responsi)
                .where(eq(responsi.id, params.id))
                .limit(1);

            if (!existing) {
                set.status = 404;
                return { success: false, message: "Responsi not found" };
            }

            if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot edit responsi from other prodi" };
            }

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
            if (body.mataKuliahId !== undefined) updateData.mataKuliahId = body.mataKuliahId;
            if (body.status) updateData.status = body.status;

            const [updated] = await db
                .update(responsi)
                .set(updateData)
                .where(eq(responsi.id, params.id))
                .returning();

            await logActivity(user.id, "update_responsi", "responsi", params.id);
            return { success: true, data: updated };
        },
        {
            body: t.Object({
                title: t.Optional(t.String()),
                description: t.Optional(t.String()),
                speaker: t.Optional(t.String()),
                topic: t.Optional(t.String()),
                scheduleDate: t.Optional(t.String()),
                durationMinutes: t.Optional(t.Number()),
                meetingLink: t.Optional(t.Nullable(t.String())),
                requestMaterialLink: t.Optional(t.Nullable(t.String())),
                communityLink: t.Optional(t.Nullable(t.String())),
                status: t.Optional(
                    t.Union([
                        t.Literal("upcoming"),
                        t.Literal("live"),
                        t.Literal("completed"),
                    ])
                ),
                mataKuliahId: t.Optional(t.Nullable(t.String())),
            }),
        }
    )

    // DELETE
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("responsi:manage")({ user, set });

        const [existing] = await db
            .select()
            .from(responsi)
            .where(eq(responsi.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Responsi not found" };
        }

        if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
            set.status = 403;
            return { success: false, message: "Cannot delete responsi from other prodi" };
        }

        await db.delete(responsi).where(eq(responsi.id, params.id));
        await logActivity(user.id, "delete_responsi", "responsi", params.id);

        return { success: true, message: "Responsi deleted" };
    });
