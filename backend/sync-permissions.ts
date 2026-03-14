import { db } from "./src/db";
import { roles } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function syncPermissions() {
    console.log("🚀 Syncing Default Permissions...");

    // 1. Super Admin
    await db.update(roles)
        .set({ permissions: ["*"] } as any)
        .where(eq(roles.code, "super_admin"));
    console.log("✅ Super Admin Permissions Updated (*)");

    // 2. Admin Prodi
    await db.update(roles)
        .set({
            permissions: [
                "dashboard:view",
                "materi:view",
                "materi:manage",
                "video:view",
                "video:manage",
                "exercise:view",
                "exercise:manage",
                "request:view",
                "request:manage",
                "responsi:view",
                "responsi:manage"
            ]
        } as any)
        .where(eq(roles.code, "admin"));
    console.log("✅ Admin Permissions Updated");

    // 3. Student
    await db.update(roles)
        .set({ permissions: ["dashboard:view", "responsi:view"] } as any)
        .where(eq(roles.code, "student"));
    console.log("✅ Student Permissions Updated");

    console.log("🎉 Sync Completed!");
    process.exit(0);
}

syncPermissions().catch(err => {
    console.error("❌ Sync Failed:", err);
    process.exit(1);
});
