import { db, client } from "./index";
import { prodi, mataKuliah, users, materials, videos, responsi, exercises, materialRequests } from "./schema";
import { eq, or } from "drizzle-orm";

async function mergeAllProdi() {
  console.log("--- STARTING MERGE ---");

  // Get the real S1 Informatika (the one with the correct fakultas, df04ea50-0112-47cb-a379-98137681fdb3)
  const masterProdiId = "df04ea50-0112-47cb-a379-98137681fdb3";
  // The test prodi that accidentally held 11 courses and some users: a2aacbe7-2962-4a88-badb-324574629e6d
  const oldProdiId = "a2aacbe7-2962-4a88-badb-324574629e6d";

  // Check if oldProdiId still exists
  const [oldP] = await db.select().from(prodi).where(eq(prodi.id, oldProdiId));
  if (oldP) {
    console.log(`Found old prodi: ${oldP.name}. Merging all its data into master Prodi: ${masterProdiId}`);

    // Update everything
    await db.update(mataKuliah).set({ prodiId: masterProdiId }).where(eq(mataKuliah.prodiId, oldProdiId));
    await db.update(users).set({ prodiId: masterProdiId }).where(eq(users.prodiId, oldProdiId));
    await db.update(materials).set({ prodiId: masterProdiId }).where(eq(materials.prodiId, oldProdiId));
    await db.update(videos).set({ prodiId: masterProdiId }).where(eq(videos.prodiId, oldProdiId));
    await db.update(exercises).set({ prodiId: masterProdiId }).where(eq(exercises.prodiId, oldProdiId));
    await db.update(responsi).set({ prodiId: masterProdiId }).where(eq(responsi.prodiId, oldProdiId));
    await db.update(materialRequests).set({ prodiId: masterProdiId }).where(eq(materialRequests.prodiId, oldProdiId));

    // Delete the old prodi
    await db.delete(prodi).where(eq(prodi.id, oldProdiId));
    console.log("✅ Data merged and duplicate prodi deleted.");
  } else {
    console.log("Old prodi not found. Ensuring all users point to master prodi just in case.");
    // Just force all students and admins who might be orphaned to the master prodi
    await db.update(users).set({ prodiId: masterProdiId }).where(
      or(
        eq(users.email, "yy.helphian@gmail.com"),
        eq(users.email, "admin.if@helphin.com"),
        eq(users.email, "student.if@helphin.com"),
        eq(users.email, "superadmin@helphin.com"),
        eq(users.email, "bagas121.helphian@gmail.com")
      )
    );
  }

  // Rename master to ensure it's S1 Informatika
  await db.update(prodi).set({ name: "S1 Informatika" }).where(eq(prodi.id, masterProdiId));
  console.log("✅ Ensured master prodi is named S1 Informatika.");

  await client.end();
}

mergeAllProdi().catch(console.error);
