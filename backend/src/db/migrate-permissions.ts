import { db, client } from "./index";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("🚀 Starting permissions migration...");
    try {
        // 1. Add column if not exists (using raw SQL for safety)
        await db.execute(sql`
            ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "permissions" JSONB DEFAULT '[]'::jsonb NOT NULL;
        `);
        console.log("✅ Column 'permissions' ensured.");

        // 2. Define default permissions
        const permsMap = {
            super_admin: ["*"],
            admin: [
                "dashboard:view",
                "akun:view",
                "akun:manage",
                "prodi:view",
                "prodi:manage",
                "responsi:view",
                "responsi:manage",
                "matkul:view",
                "matkul:manage",
                "materi:view",
                "materi:manage",
                "video:view",
                "video:manage",
                "exercise:view",
                "exercise:manage",
            ],
            student: ["dashboard:view", "responsi:view"]
        };

        // 3. Update existing roles
        for (const [code, perms] of Object.entries(permsMap)) {
            await db.execute(sql`
                UPDATE "roles" 
                SET "permissions" = ${JSON.stringify(perms)}::jsonb 
                WHERE "code" = ${code}
            `);
            console.log(`✅ Updated permissions for role: ${code}`);
        }

        console.log("🎉 Migration completed successfully!");
    } catch (e) {
        console.error("❌ Migration failed:", e);
    } finally {
        await client.end();
        process.exit(0);
    }
}

migrate();
