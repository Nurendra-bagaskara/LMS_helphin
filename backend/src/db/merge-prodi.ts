import { db, client } from "./index";
import { prodi, mataKuliah, users, activityLogs, materials, videos, materialRequests, exercises, responsi } from "./schema";
import { eq, or, like } from "drizzle-orm";

async function mergeProdi() {
  console.log("--- MERGING DUPLICATE S1 INFORMATIKA PRODI ---");

  // Find all prodis named "S1 Informatika" (case insensitive approach or precise match)
  const allInformatika = await db.select().from(prodi).where(like(prodi.name, "%Informatika%"));
  
  if (allInformatika.length <= 1) {
    console.log("No duplicates found or less than 2 S1 Informatika prodis. Current count:", allInformatika.length);
    await client.end();
    return;
  }

  // We want to keep the one that currently has the most data, or arbitrarily pick the first one and move everything.
  // In our previous check, the student's prodi had 11 courses. Let's find that one to be the PRIMARY.
  let primaryProdi = allInformatika[0];
  let secondaryProdis = [];

  for (const p of allInformatika) {
    const mkCount = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, p.id));
    console.log(`Prodi ${p.id} (${p.name}) has ${mkCount.length} courses.`);
    if (mkCount.length >= 11) {
       primaryProdi = p;
    }
  }

  secondaryProdis = allInformatika.filter(p => p.id !== primaryProdi.id);

  console.log(`\n=> PRIMARY PRODI: ${primaryProdi.id} (${primaryProdi.name})`);
  
  for (const sec of secondaryProdis) {
    console.log(`=> MERGING Secondary Prodi: ${sec.id} into Primary...`);

    // 1. Update Mata Kuliah
    await db.update(mataKuliah).set({ prodiId: primaryProdi.id }).where(eq(mataKuliah.prodiId, sec.id));
    
    // 2. Update Users (Admins, Students)
    await db.update(users).set({ prodiId: primaryProdi.id }).where(eq(users.prodiId, sec.id));

    // 3. Update Materials
    await db.update(materials).set({ prodiId: primaryProdi.id }).where(eq(materials.prodiId, sec.id));

    // 4. Update Videos
    await db.update(videos).set({ prodiId: primaryProdi.id }).where(eq(videos.prodiId, sec.id));

    // 5. Update Material Requests
    await db.update(materialRequests).set({ prodiId: primaryProdi.id }).where(eq(materialRequests.prodiId, sec.id));

    // 6. Update Exercises
    await db.update(exercises).set({ prodiId: primaryProdi.id }).where(eq(exercises.prodiId, sec.id));

    // 7. Update Responsi
    await db.update(responsi).set({ prodiId: primaryProdi.id }).where(eq(responsi.prodiId, sec.id));

    // 8. Delete the duplicate prodi
    await db.delete(prodi).where(eq(prodi.id, sec.id));
    console.log(`   Deleted duplicate prodi ${sec.id}`);
  }

  console.log("--- MERGE COMPLETE ---");
  await client.end();
}

mergeProdi().catch(console.error);
