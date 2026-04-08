import { db, client } from "./index";
import { mataKuliah, prodi, users } from "./schema";
import { eq } from "drizzle-orm";

async function verify() {
  const mks = await db.select().from(mataKuliah).where(eq(mataKuliah.code, "IF1001"));
  console.log("IF1001:", JSON.stringify(mks, null, 2));

  const [student] = await db.select().from(users).where(eq(users.email, "yy.helphian@gmail.com")).limit(1);
  console.log("STUDENT_STATUS:", JSON.stringify(student, null, 2));

  if (mks[0] && student) {
    console.log("MK_PRODI_ID:", mks[0].prodiId);
    console.log("ST_PRODI_ID:", student.prodiId);
    console.log("MATCH?:", mks[0].prodiId === student.prodiId);
    
    // Count all mks with that prodiId
    const allMatching = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, student.prodiId || ""));
    console.log("ALL_MATCHING_COUNT:", allMatching.length);
  }

  await client.end();
}

verify().catch(console.error);
