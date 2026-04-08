import { db, client } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log("Tables:", result.rows.map((r: any) => r.table_name));
    } catch (e) {
        console.error("Error checking tables:", e);
    } finally {
        await client.end();
        process.exit(0);
    }
}

main();
