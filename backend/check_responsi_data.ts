import { db } from "./src/db";
import { responsi } from "./src/db/schema";

async function checkResponsi() {
    const allResponsi = await db.select().from(responsi);
    console.log(JSON.stringify(allResponsi, null, 2));
    process.exit(0);
}

checkResponsi().catch(err => {
    console.error(err);
    process.exit(1);
});
