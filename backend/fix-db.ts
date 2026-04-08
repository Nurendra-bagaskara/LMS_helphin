import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function addColumn() {
  try {
    console.log("Starting column addition...");
    await db.execute(sql`ALTER TABLE responsi ADD COLUMN IF NOT EXISTS pembahasan_link VARCHAR(500);`);
    console.log("SUCCESS: Column 'pembahasan_link' added successfully!");

    // Double check
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responsi' AND column_name = 'pembahasan_link';
    `);
    console.log("Verification result:", result);
  } catch (e) {
    console.error("Error adding column:", e);
  } finally {
    process.exit();
  }
}

addColumn();
