import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function checkColumn() {
  try {
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responsi' AND column_name = 'pembahasan_link';
    `);
    console.log("Column check result:", result);
    if (result.length === 0) {
      console.log("CRITICAL: Column 'pembahasan_link' is MISSING in the database.");
    } else {
      console.log("Column 'pembahasan_link' exists.");
    }
  } catch (e) {
    console.error("Error checking column:", e);
  } finally {
    process.exit();
  }
}

checkColumn();
