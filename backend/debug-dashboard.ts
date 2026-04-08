import { db } from "./src/db";
import { mataKuliah, materials, videos, bankSoal, exercises } from "./src/db/schema";
import { sql, desc } from "drizzle-orm";

async function run() {
    const results = await db
        .select({
            id: mataKuliah.id,
            name: mataKuliah.name,
            totalContent: sql<number>`(
                COALESCE((SELECT COUNT(*) FROM ${materials} WHERE ${materials.mataKuliahId} = ${mataKuliah.id}), 0) +
                COALESCE((SELECT COUNT(*) FROM ${videos} WHERE ${videos.mataKuliahId} = ${mataKuliah.id}), 0) +
                COALESCE((SELECT COUNT(*) FROM ${bankSoal} WHERE ${bankSoal.mataKuliahId} = ${mataKuliah.id}), 0) +
                COALESCE((SELECT COUNT(*) FROM ${exercises} WHERE ${exercises.mataKuliahId} = ${mataKuliah.id}), 0)
            )`.mapWith(Number)
        })
        .from(mataKuliah)
        .orderBy(desc(sql`3`)) // Assuming id, name, totalContent
        .limit(10);

    console.log("Dashboard Results:", JSON.stringify(results, null, 2));
    process.exit(0);
}

run().catch(console.error);
