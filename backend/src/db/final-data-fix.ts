import { db, client } from "./index";
import { prodi, mataKuliah, users, roles } from "./schema";
import { eq, or, like } from "drizzle-orm";

async function finalFix() {
  console.log("--- FINAL DATA FIX START ---");

  // 1. Temukan prodi yang PUNYA matkul IF1001 (dari screenshot user)
  const [mk] = await db.select().from(mataKuliah).where(eq(mataKuliah.code, "IF1001")).limit(1);
  if (!mk || !mk.prodiId) {
    console.log("❌ Mata kuliah IF1001 tidak ditemukan di DB!");
    await client.end();
    return;
  }
  const targetProdiId = mk.prodiId;
  console.log("🎯 Target Prodi ID (yang berisi data matkul):", targetProdiId);

  // 2. Pastikan nama prodi tersebut adalah "S1 Informatika" agar tampilan hero banner benar
  await db.update(prodi)
    .set({ name: "S1 Informatika" })
    .where(eq(prodi.id, targetProdiId));
  console.log("✅ Updated prodi name to 'S1 Informatika'");

  // 3. Update SEMUA user role 'student' (atau spesifik akun user) agar pindah ke prodi ini
  // Ini untuk memastikan siapapun yang login sebagai student Informatika bisa melihat datanya
  const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);
  if (studentRole) {
    const updatedUsers = await db.update(users)
      .set({ prodiId: targetProdiId })
      .where(eq(users.roleId, studentRole.id));
    console.log(`✅ Updated students to point to prodi ${targetProdiId}`);
  }

  // 4. Update Super Admin juga agar saat preview student dashboard datanya muncul
  const [adminRole] = await db.select().from(roles).where(like(roles.code, "%admin%")).limit(5);
  // Just update the main super admin
  await db.update(users)
    .set({ prodiId: targetProdiId })
    .where(or(
      eq(users.email, "superadmin@helphin.com"),
      eq(users.email, "admin.if@helphin.com")
    ));
  console.log("✅ Updated admin users prodiId for preview consistency.");

  console.log("--- FINAL DATA FIX COMPLETED ---");
  await client.end();
}

finalFix().catch(console.error);
