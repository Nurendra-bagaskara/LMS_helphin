import { db } from "./index";
import { users, mataKuliah, prodi } from "./schema";
import { eq } from "drizzle-orm";

async function deepDiagnose() {
    console.log("--- DEEP DIAGNOSIS START ---");
    
    // 1. Ambil data Gasgas
    const [user] = await db.select().from(users).where(eq(users.email, "bagaskara636@gmail.com")).limit(1);
    if (!user) { console.log("User not found"); return; }
    
    console.log(`User's Prodi ID: ${user.prodiId}`);
    
    // 2. Ambil SEMUA mata kuliah dan tampilkan Prodi ID-nya
    const allMatkul = await db.select({
        id: mataKuliah.id,
        name: mataKuliah.name,
        prodiId: mataKuliah.prodiId
    }).from(mataKuliah);
    
    console.log(`Total Matkul di DB: ${allMatkul.length}`);
    
    allMatkul.forEach(m => {
        const match = m.prodiId === user.prodiId ? "✅ MATCH" : "❌ MISMATCH";
        console.log(`- ${m.name} (Prodi ID: ${m.prodiId}) -> ${match}`);
    });
    
    console.log("--- DEEP DIAGNOSIS END ---");
    process.exit(0);
}

deepDiagnose();
