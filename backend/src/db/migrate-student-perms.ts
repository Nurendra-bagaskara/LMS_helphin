import { db } from "./index";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

async function migratePermissions() {
    console.log("--- MIGRATION START: STUDENT PERMISSIONS ---");
    
    // 1. Ambil data role student
    const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);
    
    if (!studentRole) {
        console.error("Role student tidak ditemukan!");
        process.exit(1);
    }
    
    // 2. Tentukan izin baru (View Only permissions)
    const currentPerms = (studentRole.permissions as string[]) || [];
    const newPerms = [
        "dashboard:view",
        "matkul:view",
        "materi:view",
        "video:view",
        "responsi:view",
        "exercise:view",
        "bank_soal:view",
        "request:view"
    ];
    
    // Gabungkan dengan izin yang sudah ada tanpa duplikat
    const mergedPerms = Array.from(new Set([...currentPerms, ...newPerms]));
    
    console.log(`Menambahkan izin ke role: ${studentRole.name}`);
    console.log(`Izin lama: ${JSON.stringify(currentPerms)}`);
    console.log(`Izin baru: ${JSON.stringify(mergedPerms)}`);
    
    // 3. Update database
    await db.update(roles)
        .set({ permissions: mergedPerms })
        .where(eq(roles.id, studentRole.id));
    
    console.log("✅ Migrasi Berhasil! Role student sekarang sudah punya izin melihat data.");
    console.log("--- MIGRATION END ---");
    process.exit(0);
}

migratePermissions().catch(err => {
    console.error("Migrasi Gagal:", err);
    process.exit(1);
});
