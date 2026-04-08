import { Elysia, t } from "elysia";
import { db } from "../db";
import { exercises, mataKuliah, prodi, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requireProdiAccessOrAdmin } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const exerciseRoutes = new Elysia({ prefix: "/exercises" })
    .use(authMiddleware)

    // LIST
    .get("/", async ({ query }: any) => {
        let conditions: any[] = [];
        if (query.prodiId) conditions.push(eq(exercises.prodiId, query.prodiId));
        if (query.mataKuliahId) conditions.push(eq(exercises.mataKuliahId, query.mataKuliahId));
        if (query.tahunAjaran) conditions.push(eq(exercises.tahunAjaran, query.tahunAjaran));

        const result = await db
            .select({
                id: exercises.id,
                title: exercises.title,
                subject: exercises.subject,
                description: exercises.description,
                googleFormUrl: exercises.googleFormUrl,
                mataKuliahId: exercises.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                tahunAjaran: exercises.tahunAjaran,
                prodiId: exercises.prodiId,
                prodiName: prodi.name,
                uploaderName: users.name,
                createdAt: exercises.createdAt,
            })
            .from(exercises)
            .leftJoin(mataKuliah, eq(exercises.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(exercises.prodiId, prodi.id))
            .leftJoin(users, eq(exercises.createdBy, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(exercises.createdAt);

        return { success: true, data: result };
    })

    // GET BY ID
    .get("/:id", async ({ params, set }: any) => {
        const [e] = await db
            .select({
                id: exercises.id,
                title: exercises.title,
                subject: exercises.subject,
                description: exercises.description,
                googleFormUrl: exercises.googleFormUrl,
                mataKuliahId: exercises.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                tahunAjaran: exercises.tahunAjaran,
                prodiId: exercises.prodiId,
                prodiName: prodi.name,
                uploaderName: users.name,
                createdAt: exercises.createdAt,
            })
            .from(exercises)
            .leftJoin(mataKuliah, eq(exercises.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(exercises.prodiId, prodi.id))
            .leftJoin(users, eq(exercises.createdBy, users.id))
            .where(eq(exercises.id, params.id))
            .limit(1);

        if (!e) {
            set.status = 404;
            return { success: false, message: "Exercise not found" };
        }
        return { success: true, data: e };
    })

    // CREATE
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requireRole("admin", "super_admin")({ user, set });

            const prodiId = body.prodiId || user.prodiId;
            if (!prodiId) {
                set.status = 400;
                return { success: false, message: "prodiId is required" };
            }

            if (!requireProdiAccessOrAdmin(prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot create exercise for other prodi" };
            }

            const [created] = await db
                .insert(exercises)
                .values({
                    title: body.title,
                    subject: body.subject || null,
                    description: body.description || null,
                    googleFormUrl: body.googleFormUrl,
                    mataKuliahId: body.mataKuliahId || null,
                    tahunAjaran: body.tahunAjaran || null,
                    prodiId,
                    createdBy: user.id,
                })
                .returning();

            await logActivity(user.id, "create_exercise", "exercise", created.id);

            set.status = 201;
            return { success: true, data: created };
        },
        {
            body: t.Object({
                title: t.String({ minLength: 1 }),
                subject: t.Optional(t.String()),
                description: t.Optional(t.String()),
                googleFormUrl: t.String({ minLength: 1 }),
                mataKuliahId: t.Optional(t.String()),
                tahunAjaran: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // UPDATE
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requireRole("admin", "super_admin")({ user, set });

            const [existing] = await db
                .select()
                .from(exercises)
                .where(eq(exercises.id, params.id))
                .limit(1);

            if (!existing) {
                set.status = 404;
                return { success: false, message: "Exercise not found" };
            }

            if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot edit exercise from other prodi" };
            }

            const updateData: any = {};
            if (body.title) updateData.title = body.title;
            if (body.subject !== undefined) updateData.subject = body.subject;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.googleFormUrl) updateData.googleFormUrl = body.googleFormUrl;
            if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;
            if (body.tahunAjaran) updateData.tahunAjaran = body.tahunAjaran;

            const [updated] = await db
                .update(exercises)
                .set(updateData)
                .where(eq(exercises.id, params.id))
                .returning();

            await logActivity(user.id, "update_exercise", "exercise", params.id);
            return { success: true, data: updated };
        },
        {
            body: t.Object({
                title: t.Optional(t.String()),
                subject: t.Optional(t.String()),
                description: t.Optional(t.String()),
                googleFormUrl: t.Optional(t.String()),
                mataKuliahId: t.Optional(t.String()),
                tahunAjaran: t.Optional(t.String()),
            }),
        }
    )

    // DELETE
    .delete("/:id", async ({ user, params, set }: any) => {
        requireRole("admin", "super_admin")({ user, set });

        const [existing] = await db
            .select()
            .from(exercises)
            .where(eq(exercises.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Exercise not found" };
        }

        if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
            set.status = 403;
            return { success: false, message: "Cannot delete exercise from other prodi" };
        }

        await db.delete(exercises).where(eq(exercises.id, params.id));
        await logActivity(user.id, "delete_exercise", "exercise", params.id);

        return { success: true, message: "Exercise deleted" };
    });
