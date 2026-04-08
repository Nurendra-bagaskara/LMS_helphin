import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE responsi ADD COLUMN IF NOT EXISTS live_chat_link VARCHAR(500)`);
    console.log("Success adding live_chat_link");
  } catch (e) {
    console.error(e);
  }
}

main();
