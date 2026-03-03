import { Elysia, t } from "elysia";
import { db } from "../db";
import { materialRequests, prodi, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { logActivity } from "../utils/logger";

export const requestRoutes = new Elysia({ prefix: "/requests" })
    .use(authMiddleware)

    // ==================== LIST REQUESTS ====================
    // Admin: sees requests for their prodi
    // Super Admin: sees all requests
    // Student: sees their own requests
    .get("/", async ({ user, query }: any) => {
        let conditions: any[] = [];

        if (user.role === "student") {
            conditions.push(eq(materialRequests.studentId, user.id));
        } else if (user.role === "admin") {
            conditions.push(eq(materialRequests.prodiId, user.prodiId));
        }
        // super_admin sees all

        if (query.prodiId && user.role === "super_admin") {
            conditions.push(eq(materialRequests.prodiId, query.prodiId));
        }

        const result = await db
            .select({
                id: materialRequests.id,
                title: materialRequests.title,
                subject: materialRequests.subject,
                description: materialRequests.description,
                studentId: materialRequests.studentId,
                studentName: users.name,
                prodiId: materialRequests.prodiId,
                prodiName: prodi.name,
                createdAt: materialRequests.createdAt,
            })
            .from(materialRequests)
            .leftJoin(users, eq(materialRequests.studentId, users.id))
            .leftJoin(prodi, eq(materialRequests.prodiId, prodi.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(materialRequests.createdAt);

        return { success: true, data: result };
    })

    // ==================== SUBMIT SARAN (Student only) ====================
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requireRole("student")({ user, set });

            const prodiId = body.prodiId || user.prodiId;
            if (!prodiId) {
                set.status = 400;
                return { success: false, message: "prodiId is required" };
            }

            const [created] = await db
                .insert(materialRequests)
                .values({
                    title: body.title,
                    subject: body.subject || null,
                    description: body.description || null,
                    studentId: user.id,
                    prodiId,
                })
                .returning();

            await logActivity(user.id, "submit_request", "material_request", created.id);

            set.status = 201;
            return {
                success: true,
                message: "Saran kamu telah dikirim dan akan dipertimbangkan oleh Admin. Terima kasih!",
                data: created,
            };
        },
        {
            body: t.Object({
                title: t.String({ minLength: 1 }),
                subject: t.Optional(t.String()),
                description: t.Optional(t.String()),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // ==================== DELETE REQUEST (Admin/Super Admin cleanup) ====================
    .delete("/:id", async ({ user, params, set }: any) => {
        requireRole("admin", "super_admin")({ user, set });

        const [existing] = await db
            .select()
            .from(materialRequests)
            .where(eq(materialRequests.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Request not found" };
        }

        if (user.role === "admin" && user.prodiId !== existing.prodiId) {
            set.status = 403;
            return { success: false, message: "Cannot delete request from other prodi" };
        }

        await db.delete(materialRequests).where(eq(materialRequests.id, params.id));
        await logActivity(user.id, "delete_request", "material_request", params.id);

        return { success: true, message: "Request deleted" };
    });
