import { db, client } from "./index";
import { mataKuliah, users, prodi } from "./schema";
import { eq, inArray } from "drizzle-orm";

async function fixMismatch() {
  console.log("--- STARTING DATA PATCH ---");

  // 1. Dapatkan prodiId student "Informatika" yang benar
  const [student] = await db.select().from(users).where(eq(users.email, "student.if@helphin.com")).limit(1);
  if (!student || !student.prodiId) {
    console.log("❌ Student with correct prodiId not found!");
    await client.end();
    return;
  }

  const correctProdiId = student.prodiId;
  console.log("📍 Correct Prodi ID for student:", correctProdiId);

  // 2. Dapatkan semua ID prodi yang namanya "Informatika" secara case-insensitive
  const informatikaProdis = await db.select().from(prodi);
  const otherProdiIds = informatikaProdis
    .filter(p => p.name.toLowerCase().includes("informatika") && p.id !== correctProdiId)
    .map(p => p.id);

  if (otherProdiIds.length === 0) {
    console.log("✅ No other 'Informatika' prodi records found to fix.");
  } else {
    console.log(`🔍 Found ${otherProdiIds.length} other prodi records for 'Informatika'.`);
    console.log("IDs to migrate from:", otherProdiIds);

    // 3. Masukkan semua matkul dari prodi 'salah' ke prodi 'benar'
    const updatedMK = await db.update(mataKuliah)
      .set({ prodiId: correctProdiId })
      .where(inArray(mataKuliah.prodiId, otherProdiIds));

    console.log("✨ Updated mata_kuliah records to use the correct prodiId.");
  }

  // 4. Pastikan juga matkul yang prodiId-nya NULL (jika ada) di-fix (opsional)
  // ...

  console.log("✅ Data patch completed successfully!");
  await client.end();
}

fixMismatch().catch(console.error);
