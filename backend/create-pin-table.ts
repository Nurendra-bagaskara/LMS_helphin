import { db, client } from "./src/db/index";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🛠️ Creating pinned_mata_kuliah table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS pinned_mata_kuliah (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                mata_kuliah_id UUID NOT NULL REFERENCES mata_kuliah(id) ON DELETE CASCADE,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log("✅ Table created successfully!");
    } catch (e) {
        console.error("❌ Error creating table:", e);
    } finally {
        await client.end();
    }
}

main();
