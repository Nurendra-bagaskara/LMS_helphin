import { Elysia, t } from "elysia";
import { db } from "../db";
import { materials, mataKuliah, prodi, users } from "../db/schema";
import { eq, and, ilike } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole, requirePermission, requireProdiAccessOrAdmin } from "../middleware/rbac";
import { logActivity } from "../utils/logger";
import { join } from "path";
import { existsSync, mkdirSync, unlinkSync } from "fs";

const UPLOAD_DIR = join(import.meta.dir, "../../uploads");

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const materialRoutes = new Elysia({ prefix: "/materials" })
    .use(authMiddleware)

    // ==================== LIST MATERIALS ====================
    .get("/", async ({ query, user, set }: any) => {
        requirePermission("materi:view")({ user, set });

        let conditions: any[] = [];

        // Data scoping: non-super-admins only see their own prodi
        if (!user.permissions.includes("*")) {
            conditions.push(eq(materials.prodiId, user.prodiId));
        } else if (query.prodiId) {
            conditions.push(eq(materials.prodiId, query.prodiId));
        }

        if (query.mataKuliahId) conditions.push(eq(materials.mataKuliahId, query.mataKuliahId));
        if (query.tahunAjaran) conditions.push(eq(materials.tahunAjaran, query.tahunAjaran));
        if (query.search) conditions.push(ilike(materials.title, `%${query.search}%`));

        const result = await db
            .select({
                id: materials.id,
                title: materials.title,
                description: materials.description,
                fileUrl: materials.fileUrl,
                fileType: materials.fileType,
                tahunAjaran: materials.tahunAjaran,
                mataKuliahId: materials.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                prodiId: materials.prodiId,
                prodiName: prodi.name,
                uploadedBy: materials.uploadedBy,
                createdAt: materials.createdAt,
            })
            .from(materials)
            .leftJoin(mataKuliah, eq(materials.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(materials.prodiId, prodi.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(materials.createdAt);

        return { success: true, data: result };
    })

    // ==================== GET BY ID ====================
    .get("/:id", async ({ params, set }: any) => {
        const [m] = await db
            .select({
                id: materials.id,
                title: materials.title,
                description: materials.description,
                fileUrl: materials.fileUrl,
                fileType: materials.fileType,
                tahunAjaran: materials.tahunAjaran,
                mataKuliahId: materials.mataKuliahId,
                mataKuliahName: mataKuliah.name,
                prodiId: materials.prodiId,
                prodiName: prodi.name,
                uploadedBy: materials.uploadedBy,
                createdAt: materials.createdAt,
            })
            .from(materials)
            .leftJoin(mataKuliah, eq(materials.mataKuliahId, mataKuliah.id))
            .leftJoin(prodi, eq(materials.prodiId, prodi.id))
            .where(eq(materials.id, params.id))
            .limit(1);

        if (!m) {
            set.status = 404;
            return { success: false, message: "Material not found" };
        }
        return { success: true, data: m };
    })

    // ==================== UPLOAD MATERIAL (Admin / Super Admin) ====================
    .post(
        "/",
        async ({ user, body, set }: any) => {
            requirePermission("materi:manage")({ user, set });

            const prodiId = body.prodiId || user.prodiId;
            if (!prodiId) {
                set.status = 400;
                return { success: false, message: "prodiId is required" };
            }

            if (!requireProdiAccessOrAdmin(prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot upload material for other prodi" };
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
                .insert(materials)
                .values({
                    title: body.title,
                    description: body.description || null,
                    fileUrl: `/uploads/${fileName}`,
                    fileType,
                    tahunAjaran: body.tahunAjaran,
                    mataKuliahId: body.mataKuliahId,
                    prodiId,
                    uploadedBy: user.id,
                })
                .returning();

            await logActivity(user.id, "upload_material", "material", created.id, {
                title: body.title,
            });

            set.status = 201;
            return { success: true, message: "Material uploaded", data: created };
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
            requirePermission("materi:manage")({ user, set });

            const [existing] = await db
                .select()
                .from(materials)
                .where(eq(materials.id, params.id))
                .limit(1);

            if (!existing) {
                set.status = 404;
                return { success: false, message: "Material not found" };
            }

            if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
                set.status = 403;
                return { success: false, message: "Cannot edit material from other prodi" };
            }

            const updateData: any = { updatedAt: new Date() };
            if (body.title) updateData.title = body.title;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.tahunAjaran) updateData.tahunAjaran = body.tahunAjaran;
            if (body.mataKuliahId) updateData.mataKuliahId = body.mataKuliahId;

            const [updated] = await db
                .update(materials)
                .set(updateData)
                .where(eq(materials.id, params.id))
                .returning();

            await logActivity(user.id, "update_material", "material", params.id);
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
        requirePermission("materi:manage")({ user, set });

        const [existing] = await db
            .select()
            .from(materials)
            .where(eq(materials.id, params.id))
            .limit(1);

        if (!existing) {
            set.status = 404;
            return { success: false, message: "Material not found" };
        }

        if (!requireProdiAccessOrAdmin(existing.prodiId, user)) {
            set.status = 403;
            return { success: false, message: "Cannot delete material from other prodi" };
        }

        // Delete file from disk
        try {
            const filePath = join(UPLOAD_DIR, existing.fileUrl.replace("/uploads/", ""));
            if (existsSync(filePath)) unlinkSync(filePath);
        } catch { }

        await db.delete(materials).where(eq(materials.id, params.id));
        await logActivity(user.id, "delete_material", "material", params.id);

        return { success: true, message: "Material deleted" };
    })

    // ==================== DOWNLOAD ====================
    .get("/:id/download", async ({ params, set, user }: any) => {
        const [m] = await db
            .select()
            .from(materials)
            .where(eq(materials.id, params.id))
            .limit(1);

        if (!m) {
            set.status = 404;
            return { success: false, message: "Material not found" };
        }

        const filePath = join(UPLOAD_DIR, m.fileUrl.replace("/uploads/", ""));
        if (!existsSync(filePath)) {
            set.status = 404;
            return { success: false, message: "File not found on disk" };
        }

        await logActivity(user.id, "download_material", "material", params.id);

        return new Response(Bun.file(filePath), {
            headers: {
                "Content-Disposition": `attachment; filename="${m.fileUrl.split("/").pop()}"`,
            },
        });
    });
