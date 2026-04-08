import { db, client } from "./src/db";
import { pinnedMataKuliah } from "./src/db/schema";
import { sql } from "drizzle-orm";

async function main() {
    try {
        // Test 1: Check if table exists
        const tableCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'pinned_mata_kuliah'
            ) as exists
        `);
        console.log("Table exists:", tableCheck);

        // Test 2: Try a simple select
        const rows = await db.select().from(pinnedMataKuliah).limit(1);
        console.log("Select OK, rows:", rows);

        // Test 3: Try inserting with a test (we'll rollback)
        console.log("Schema columns:", Object.keys(pinnedMataKuliah));
        
    } catch (e: any) {
        console.error("ERROR:", e.message);
        console.error("FULL:", e);
    } finally {
        await client.end();
    }
}

main();
