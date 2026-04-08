import { db, client } from "./index";
import { prodi, mataKuliah, responsi, fakultas, users, roles } from "./schema";
import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting student dashboard seeding...");

  try {
    // 1. Get or create Fakultas
    let fakultasId: string;
    const [existingFakultas] = await db.select().from(fakultas).limit(1);
    if (existingFakultas) {
      fakultasId = existingFakultas.id;
      console.log(`✅ Using existing fakultas: ${existingFakultas.name}`);
    } else {
      const [newFak] = await db.insert(fakultas).values({
        name: "Fakultas Informatika",
        universityName: "Telkom University",
      }).returning();
      fakultasId = newFak.id;
      console.log(`✨ Created new fakultas: ${newFak.name}`);
    }

    // 2. Get or create Prodi
    let prodiId: string;
    const [existingProdi] = await db.select().from(prodi).limit(1);
    if (existingProdi) {
      prodiId = existingProdi.id;
      console.log(`✅ Using existing prodi: ${existingProdi.name}`);
    } else {
      const [newProdi] = await db.insert(prodi).values({
        name: "S1 Informatika",
        fakultasId: fakultasId,
        description: "Program Studi S1 Informatika",
      }).returning();
      prodiId = newProdi.id;
      console.log(`✨ Created new prodi: ${newProdi.name}`);
    }

    // 3. Create Mata Kuliah (skip if exists)
    const subjects = [
      { name: "Algoritma Pemrograman", code: "CS101" },
      { name: "Kalkulus IA", code: "MA101" },
      { name: "Statistika Informatika", code: "SI201" },
      { name: "Kecerdasan Buatan", code: "AI301" },
      { name: "Struktur Data", code: "CS201" },
      { name: "Sistem Operasi", code: "CS202" },
      { name: "Basis Data", code: "CS203" },
      { name: "Jaringan Komputer", code: "CS301" },
    ];

    const createdMatkul: any[] = [];
    for (const s of subjects) {
      const [existing] = await db.select().from(mataKuliah).where(eq(mataKuliah.name, s.name)).limit(1);
      if (!existing) {
        const [newMk] = await db.insert(mataKuliah).values({
          name: s.name,
          code: s.code,
          prodiId: prodiId,
        }).returning();
        createdMatkul.push(newMk);
        console.log(`✨ Created mata kuliah: ${s.name}`);
      } else {
        createdMatkul.push(existing);
        console.log(`✅ Mata kuliah exists: ${s.name}`);
      }
    }

    // 4. Delete old seed responsi then create new ones
    console.log("🗑️ Clearing old seed responsi...");
    await db.delete(responsi).where(
      sql`${responsi.title} LIKE 'Responsi %'`
    );

    const kalkulusId = createdMatkul.find(m => m.name.includes("Kalkulus"))?.id;
    const algoId = createdMatkul.find(m => m.name.includes("Algoritma"))?.id;
    const statId = createdMatkul.find(m => m.name.includes("Statistika"))?.id;
    const aiId = createdMatkul.find(m => m.name.includes("Kecerdasan"))?.id;

    const responsiData = [
      {
        title: "Responsi Kalkulus IA - Persiapan UTS",
        description: "Membahas soal-soal turunan dan integral",
        speaker: "Zafra Michale",
        topic: "Turunan & Integral",
        scheduleDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // Tomorrow
        durationMinutes: 90,
        meetingLink: "https://zoom.us/j/123456789",
        status: "upcoming" as const,
        mataKuliahId: kalkulusId,
        prodiId: prodiId,
      },
      {
        title: "Responsi Algoritma - Array & Pointer",
        description: "Latihan implementasi pointer pada C++",
        speaker: "Afra Dev",
        topic: "Pointer & Memory Management",
        scheduleDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days
        durationMinutes: 120,
        meetingLink: "https://zoom.us/j/987654321",
        status: "upcoming" as const,
        mataKuliahId: algoId,
        prodiId: prodiId,
      },
      {
        title: "Responsi Statistika - Distribusi Normal",
        description: "Latihan soal p-value dan z-score",
        speaker: "Michale Pro",
        topic: "Probability & Distribution",
        scheduleDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days
        durationMinutes: 90,
        meetingLink: "https://zoom.us/j/555666777",
        status: "upcoming" as const,
        mataKuliahId: statId,
        prodiId: prodiId,
      },
      {
        title: "Responsi Kecerdasan Buatan - Neural Network",
        description: "Latihan forward/backward propagation",
        speaker: "Dr. Nexta",
        topic: "Neural Network Basics",
        scheduleDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        durationMinutes: 120,
        meetingLink: "https://zoom.us/j/111222333",
        status: "upcoming" as const,
        mataKuliahId: aiId,
        prodiId: prodiId,
      },
    ];

    for (const r of responsiData) {
      try {
        await db.insert(responsi).values(r);
        console.log(`✨ Created responsi: ${r.title}`);
      } catch (e: any) {
        console.log(`⚠️ Could not create responsi "${r.title}": ${e.message || e}`);
      }
    }

    // 5. Connect Super Admin to this prodi for easy testing
    const [saRole] = await db.select().from(roles).where(eq(roles.code, "super_admin")).limit(1);
    if (saRole) {
      await db.update(users)
        .set({ prodiId: prodiId })
        .where(eq(users.roleId, saRole.id));
      console.log("👤 Connected all super admins to the seeded prodi for testing.");
    }

    console.log("\n🎉 Seeding complete!");
    console.log(`   Prodi: ${prodiId}`);
    console.log(`   Mata Kuliah: ${createdMatkul.length}`);
    console.log(`   Responsi: ${responsiData.length} created`);
  } catch (err) {
    console.error("❌ Error:", err);
  }

  await client.end();
  process.exit(0);
}

seed();
