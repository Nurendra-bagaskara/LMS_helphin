import { Elysia, t } from "elysia";
import { db } from "../db";
import { bankSoal, mataKuliah, prodi, users } from "../db/schema";
import { eq, and, ilike } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requirePermission, requireProdiAccessOrAdmin } from "../middleware/rbac";
import { logActivity } from "../utils/logger";
import { join } from "path";
import { existsSync, mkdirSync, unlinkSync } from "fs";

const UPLOAD_DIR = join(import.meta.dir, "../../uploads/bank-soal");

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const bankSoalRoutes = new Elysia({ prefix: "/bank-soal" })
    .use(authMiddleware)

    // ==================== LIST BANK SOAL ====================
    .get("/", async ({ query, user, set }: any) => {
        requirePermission("bank_soal:view")({ user, set });

        let conditions: any[] = [];

        // Data scoping: non-super-admins see their own prodi, BUT students see all for cross-prodi
        if (!user.permissions.includes("*") && user.role !== "student") {
            conditions.push(eq(bankSoal.prodiId, user.prodiId));
        } else if (query.prodiId) {
            conditions.push(eq(bankSoal.prodiId, query.prodiId));
        }

        if (query.mataKuliahId) conditions.push(eq(bankSoal.mataKuliahId, query.mataKuliahId));
        if (query.tahunAjaran) conditions.push(eq(bankSoal.tahunAjaran, query.tahunAjaran));
        if (query.search) conditions.push(ilike(bankSoal.title, `%${query.search}%`));

        const result = await db
            .select({
                id: bankSoal.id,
                title: bankSoal.title,
                description: bankSoal.description,
                fileUrl: bankSoal.fileUrl,
                fileType: bankSoal.fileType,
                tahunAjaran: bankSoal.tahunAjaran,
                mataKuliahId: bankSoal.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                prodiId: bankSoal.prodiId,
                prodiName: prodi.name,
                uploadedBy: bankSoal.uploadedBy,
                createdAt: bankSoal.createdAt,
            })
            .from(bankSoal)
            .leftJoin(mataKuliah, eq(bankSoal.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(bankSoal.prodiId, prodi.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(bankSoal.createdAt);

        return { success: true, data: result };
    })

    // ==================== GET BY ID ====================
    .get("/:id", async ({ params, set }: any) => {
        const [m] = await db
            .select({
                id: bankSoal.id,
                title: bankSoal.title,
                description: bankSoal.description,
                fileUrl: bankSoal.fileUrl,
                fileType: bankSoal.fileType,
                tahunAjaran: bankSoal.tahunAjaran,
                mataKuliahId: bankSoal.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                prodiId: bankSoal.prodiId,
                prodiName: prodi.name,
                uploaderName: users.name,
                uploadedBy: bankSoal.uploadedBy,
                createdAt: bankSoal.createdAt,
            })
            .from(bankSoal)
            .leftJoin(mataKuliah, eq(bankSoal.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(bankSoal.prodiId, prodi.id))
            .leftJoin(users, eq(bankSoal.uploadedBy, users.id))
            .where(eq(bankSoal.id, params.id))
            .limit(1);

        if (!m) {
            set.status = 404;
            return { success: false, message: "Bank Soal not found" };
        }
        return { success: true, data: m };
    })

    // ==================== UPLOAD BANK SOAL (Admin / Super Admin) ====================
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("bank_soal:manage")({ user, set });

            const prodiId = body.prodiId || user.prodiId;
            if (!prodiId) {
                set.status = 400;
                return { success: false, message: "prodiId is required" };
            }

            if (!requireProdiAccessOrAdmin(prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot upload bank soal for other prodi" };
            }

            // Handle file upload
            const file = body.file;
            if (!file) {
                set.status = 400;
                return { success: false, message: "File is required" };
            }

            const fileName = `${Date.now()}-${file.name}`;
            const filePath = join(UPLOAD_DIR, fileName);
            const fileBuffer = await file.arrayBuffer();
            await Bun.write(filePath, fileBuffer);

            const fileType = file.name.split(".").pop() || "unknown";

            const [created] = await db
                .insert(bankSoal)
                .values({
                    title: body.title,
                    description: body.description || null,
                    fileUrl: `/uploads/bank-soal/${fileName}`,
                    fileType,
                    tahunAjaran: body.tahunAjaran,
                    mataKuliahId: body.mataKuliahId,
                    prodiId,
                    uploadedBy: user.id,
                })
                .returning();

            await logActivity(user.id, "upload_bank_soal", "bank_soal", created.id, {
                title: body.title,
            });

            set.status = 201;
            return { success: true, message: "Bank Soal uploaded", data: created };
        },
        {
            body: t.Object({
                title: t.String({ minLength: 1 }),
                description: t.Optional(t.String()),
                tahunAjaran: t.String({ minLength: 1 }),
                mataKuliahId: t.String(),
                prodiId: t.Optional(t.String()),
                file: t.File(),
            }),
        }
    )

    // ==================== UPDATE (Admin own prodi / Super Admin) ====================
    .patch(
        "/:id",
        async ({ user, params, body, set }: any) => {
            requirePermission("bank_soal:manage")({ user, set });

            const [existing] = await db
                .select()
                .from(bankSoal)
                .where(eq(bankSoal.id, params.id))
                .limit(1);

            if (!existing) {
                set.status = 404;
                return { success: false, message: "Bank Soal not found" };
            }

            if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot edit bank soal from other prodi" };
            }

            const updateData: any = { updatedAt: new Date() };
            if (body.title) updateData.title = body.title;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.tahunAjaran) updateData.tahunAjaran = body.tahunAjaran;
            if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;

            const [updated] = await db
                .update(bankSoal)
                .set(updateData)
                .where(eq(bankSoal.id, params.id))
                .returning();

            await logActivity(user.id, "update_bank_soal", "bank_soal", params.id);
            return { success: true, data: updated };
        },
        {
            body: t.Object({
                title: t.Optional(t.String()),
                description: t.Optional(t.String()),
                tahunAjaran: t.Optional(t.String()),
                mataKuliahId: t.Optional(t.String()),
            }),
        }
    )

    // ==================== DELETE (Admin own prodi / Super Admin) ====================
    .delete("/:id", async ({ user, params, set }: any) => {
        requirePermission("bank_soal:manage")({ user, set });

        const [existing] = await db
            .select()
            .from(bankSoal)
            .where(eq(bankSoal.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Bank Soal not found" };
        }

        if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
            set.status = 403;
            return { success: false, message: "Cannot delete bank soal from other prodi" };
        }

        // Delete file from disk
        try {
            const filePath = join(UPLOAD_DIR, existing.fileUrl.replace("/uploads/bank-soal/", ""));
            if (existsSync(filePath)) unlinkSync(filePath);
        } catch { }

        await db.delete(bankSoal).where(eq(bankSoal.id, params.id));
        await logActivity(user.id, "delete_bank_soal", "bank_soal", params.id);

        return { success: true, message: "Bank Soal deleted" };
    })

    // ==================== DOWNLOAD ====================
    .get("/:id/download", async ({ params, set, user }: any) => {
        const [m] = await db
            .select()
            .from(bankSoal)
            .where(eq(bankSoal.id, params.id))
            .limit(1);

        if (!m) {
            set.status = 404;
            return { success: false, message: "Bank Soal not found" };
        }

        const filePath = join(UPLOAD_DIR, m.fileUrl.replace("/uploads/bank-soal/", ""));
        if (!existsSync(filePath)) {
            set.status = 404;
            return { success: false, message: "File not found on disk" };
        }

        await logActivity(user.id, "download_bank_soal", "bank_soal", params.id);

        return new Response(Bun.file(filePath), {
            headers: {
                "Content-Disposition": `attachment; filename="${m.fileUrl.split("/").pop()}"`,
            },
        });
    })

    // ==================== PREVIEW ====================
    .get("/:id/preview", async ({ params, set, user }: any) => {
        const [m] = await db
            .select()
            .from(bankSoal)
            .where(eq(bankSoal.id, params.id))
            .limit(1);

        if (!m) {
            set.status = 404;
            return { success: false, message: "Bank Soal not found" };
        }

        const filePath = join(UPLOAD_DIR, m.fileUrl.replace("/uploads/bank-soal/", ""));
        if (!existsSync(filePath)) {
            set.status = 404;
            return { success: false, message: "File not found on disk" };
        }

        await logActivity(user.id, "preview_bank_soal", "bank_soal", params.id);

        return new Response(Bun.file(filePath), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${m.fileUrl.split("/").pop()}"`,
            },
        });
    });
