import { db, client } from "./index";
import { mataKuliah, users, prodi } from "./schema";
import { eq, count } from "drizzle-orm";

async function research() {
  const [student] = await db.select().from(users).where(eq(users.email, "student.if@helphin.com")).limit(1);
  if (!student) {
    console.log("Student not found!");
    await client.end();
    return;
  }
  
  console.log("STUDENT_ID:", student.id);
  console.log("STUDENT_PRODI_ID:", student.prodiId);
  
  const studentProdi = student.prodiId 
    ? await db.select().from(prodi).where(eq(prodi.id, student.prodiId)).limit(1)
    : [];
  console.log("STUDENT_PRODI_NAME:", studentProdi[0]?.name || "N/A");

  const matchingMK = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, student.prodiId || ""));
  console.log("MATCHING_MK_COUNT:", matchingMK.length);
  
  const allProdi = await db.select().from(prodi);
  console.log("AVAILABLE_PRODIS:", JSON.stringify(allProdi, null, 2));

  const allMK = await db.select().from(mataKuliah).limit(5);
  console.log("SAMPLE_MK:", JSON.stringify(allMK, null, 2));

  await client.end();
}

research().catch(console.error);
