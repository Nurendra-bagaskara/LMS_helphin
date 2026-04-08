import { db } from "./index";
import { users, mataKuliah, prodi } from "./schema";
import { eq } from "drizzle-orm";

async function diagnose() {
    console.log("--- DIAGNOSIS START ---");
    
    // 1. Cek user Gasgas
    const [user] = await db.select().from(users).where(eq(users.email, "bagaskara636@gmail.com")).limit(1);
    
    if (!user) {
        console.log("User Gasgas tidak ditemukan!");
        return;
    }
    
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Prodi ID User: ${user.prodiId}`);
    
    // 2. Cek nama Prodi
    if (user.prodiId) {
        const [p] = await db.select().from(prodi).where(eq(prodi.id, user.prodiId)).limit(1);
        console.log(`Nama Prodi: ${p?.name || "Tidak ditemukan"}`);
        
        // 3. Cek jumlah Matkul di Prodi tersebut
        const matkuls = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, user.prodiId));
        console.log(`Jumlah Matkul di Prodi ini: ${matkuls.length}`);
        
        if (matkuls.length === 0) {
            console.log("⚠️ PERINGATAN: Prodi ini memang belum punya mata kuliah.");
        }
    } else {
        console.log("⚠️ PERINGATAN: User ini tidak punya Prodi ID (null).");
    }
    
    console.log("--- DIAGNOSIS END ---");
    process.exit(0);
}

diagnose();
