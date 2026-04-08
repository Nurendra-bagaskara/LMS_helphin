import { db } from "./src/db";
import { eq } from "drizzle-orm";
import { responsi, mataKuliah } from "./src/db/schema";

async function run() {
    const prodiId = "bcfa102f-b44c-47df-baa4-c28f6e729930";
    const query = db
        .select({
            id: responsi.id,
            title: responsi.title,
            scheduleDate: responsi.scheduleDate,
            status: responsi.status,
            mataKuliahName: mataKuliah.name
        })
        .from(responsi)
        .leftJoin(mataKuliah, eq(responsi.mataKuliahId, mataKuliah.id))
        .where(eq(responsi.prodiId, prodiId as string))
        .orderBy(responsi.scheduleDate)
        .limit(5);
        
    console.log("SQL:", query.toSQL());
    
    try {
        await query;
        console.log("SUCCESS");
    } catch(e) {
        console.error("FAIL:", e);
    }
    process.exit(0);
}
run();
