import { db } from "./src/db/index";
import { sql } from "drizzle-orm";

async function run() {
    try {
        const res = await db.execute(sql`
            SELECT mk.id, mk.name,
            (
                COALESCE((SELECT COUNT(*) FROM materials WHERE mata_kuliah_id = mk.id), 0) +
                COALESCE((SELECT COUNT(*) FROM videos WHERE mata_kuliah_id = mk.id), 0) +
                COALESCE((SELECT COUNT(*) FROM bank_soal WHERE mata_kuliah_id = mk.id), 0) +
                COALESCE((SELECT COUNT(*) FROM exercises WHERE mata_kuliah_id = mk.id), 0) +
                COALESCE((SELECT COUNT(*) FROM responsi WHERE mata_kuliah_id = mk.id), 0)
            ) as "materialCount"
            FROM mata_kuliah mk
            ORDER BY "materialCount" DESC
            LIMIT 5
        `);
        console.log("Rows:", res);
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

run();
