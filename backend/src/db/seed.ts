import { db, client } from "./index";
import { users, fakultas, prodi, mataKuliah, roles } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Seeding database...");

    // 1. Create Default Roles
    const [superAdminRole] = await db.insert(roles).values({ name: "Super Admin", code: "super_admin", permissions: ["*"] }).returning();
    const [adminRole] = await db.insert(roles).values({ name: "Admin Prodi", code: "admin", permissions: ["dashboard:view", "prodi:view", "prodi:edit", "matkul:view", "matkul:manage", "materi:view", "materi:edit", "video:view", "video:edit", "responsi:view", "responsi:edit"] }).returning();
    const [studentRole] = await db.insert(roles).values({ name: "Student", code: "student", permissions: ["dashboard:view", "matkul:view", "materi:view", "video:view", "responsi:view", "bank_soal:view"] }).returning();
    console.log("✅ Roles created");

    // 2. Create Fakultas
    const [fakultasRekayasa] = await db
        .insert(fakultas)
        .values({ name: "Fakultas Rekayasa Industri" })
        .returning();

    const [fakultasInformatika] = await db
        .insert(fakultas)
        .values({ name: "Fakultas Informatika" })
        .returning();

    console.log("✅ Fakultas created");

    // 3. Create Prodi
    const [prodiIF] = await db
        .insert(prodi)
        .values({
            name: "S1 Informatika",
            description: "Program Studi Informatika",
            fakultasId: fakultasInformatika.id,
        })
        .returning();

    const [prodiSI] = await db
        .insert(prodi)
        .values({
            name: "S1 Sistem Informasi",
            description: "Program Studi Sistem Informasi",
            fakultasId: fakultasInformatika.id,
        })
        .returning();

    const [prodiTI] = await db
        .insert(prodi)
        .values({
            name: "S1 Teknik Industri",
            description: "Program Studi Teknik Industri",
            fakultasId: fakultasRekayasa.id,
        })
        .returning();

    console.log("✅ Prodi created");

    // 4. Create Mata Kuliah
    await db.insert(mataKuliah).values([
        { name: "Kalkulus", prodiId: prodiIF.id },
        { name: "Algoritma & Pemrograman", prodiId: prodiIF.id },
        { name: "Basis Data", prodiId: prodiIF.id },
        { name: "Kalkulus", prodiId: prodiSI.id },
        { name: "Manajemen Basis Data", prodiId: prodiSI.id },
        { name: "Statistika Industri", prodiId: prodiTI.id },
    ]);


    console.log("✅ Mata Kuliah created");

    // 5. Create Super Admin
    const passwordHash = await Bun.password.hash("superadmin123", {
        algorithm: "bcrypt",
        cost: 10,
    });

    await db.insert(users).values({
        name: "Super Admin",
        email: "superadmin@helphin.com",
        passwordHash,
        roleId: superAdminRole.id,
        prodiId: null,
    });

    console.log("✅ Super Admin created (email: superadmin@helphin.com, password: superadmin123)");

    // 6. Create sample Admin
    const adminPasswordHash = await Bun.password.hash("admin123", {
        algorithm: "bcrypt",
        cost: 10,
    });

    await db.insert(users).values({
        name: "Admin Informatika",
        email: "admin.if@helphin.com",
        passwordHash: adminPasswordHash,
        roleId: adminRole.id,
        prodiId: prodiIF.id,
    });

    console.log("✅ Sample Admin created (email: admin.if@helphin.com, password: admin123)");

    // 7. Create sample Student
    const studentPasswordHash = await Bun.password.hash("student123", {
        algorithm: "bcrypt",
        cost: 10,
    });

    await db.insert(users).values({
        name: "Mahasiswa IF",
        email: "student.if@helphin.com",
        passwordHash: studentPasswordHash,
        roleId: studentRole.id,
        prodiId: prodiIF.id,
    });

    console.log("✅ Sample Student created (email: student.if@helphin.com, password: student123)");

    console.log("\n🎉 Seeding complete!");
    await client.end();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
