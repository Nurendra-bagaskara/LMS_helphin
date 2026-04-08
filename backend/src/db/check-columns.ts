import { db, client } from "./index";
import { sql } from "drizzle-orm";

async function checkColumns() {
  const res = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'responsi' ORDER BY ordinal_position`
  );
  console.log("Responsi columns:", JSON.stringify(res));
  await client.end();
}

checkColumns();
