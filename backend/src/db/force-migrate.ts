import { db } from "./index";
import { sql } from "drizzle-orm";

async function forceMigrate() {
    console.log("--- FORCE MIGRATION START ---");
    try {
        await db.execute(sql`ALTER TABLE "prodi" ADD COLUMN IF NOT EXISTS "logo_url" text`);
        console.log("✅ Kolom 'logo_url' berhasil didaftarkan di tabel prodi!");
    } catch (e) {
        console.error("Gagal:", String(e));
    }
    console.log("--- FORCE MIGRATION END ---");
    process.exit(0);
}

forceMigrate();
