import { db } from "./index";
import { sql } from "drizzle-orm";

async function forceMigrateMatkul() {
    console.log("--- MATKUL FORCE MIGRATION START ---");
    try {
        // Drop code column (if exists)
        await db.execute(sql`ALTER TABLE "mata_kuliah" DROP COLUMN IF EXISTS "code"`);
        console.log("✅ Kolom 'code' berhasil dihapus dari tabel mata_kuliah!");
        
        // Add cover_url column (if not exists)
        await db.execute(sql`ALTER TABLE "mata_kuliah" ADD COLUMN IF NOT EXISTS "cover_url" text`);
        console.log("✅ Kolom 'cover_url' berhasil ditambahkan ke tabel mata_kuliah!");
    } catch (e) {
        console.error("Gagal:", String(e));
    }
    console.log("--- MATKUL FORCE MIGRATION END ---");
    process.exit(0);
}

forceMigrateMatkul();
