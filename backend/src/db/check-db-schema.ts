import { db } from "./index";
import { sql } from "drizzle-orm";

async function checkSchema() {
    console.log("--- DB SCHEMA CHECK START ---");
    
    const tables = ["users", "prodi", "responsi", "mata_kuliah"];
    
    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = ${table}
        `);
        console.log(JSON.stringify(result, null, 2));
    }
    
    console.log("\n--- DB SCHEMA CHECK END ---");
    process.exit(0);
}

checkSchema().catch(err => {
    console.error(err);
    process.exit(1);
});
