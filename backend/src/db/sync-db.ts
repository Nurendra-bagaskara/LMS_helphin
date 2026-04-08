import { db, client } from "./index";
import { users, roles } from "./schema";
import { eq, sql } from "drizzle-orm";

async function sync() {
    console.log("🔄 Memulai sinkronisasi database...");

    // 1. Pastikan ENUMs ada (menggunakan SQL mentah)
    try {
        console.log("🛠️  Memeriksa enums...");
        await db.execute(sql`DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_type') THEN
                CREATE TYPE video_type AS ENUM ('recording', 'live');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'responsi_status') THEN
                CREATE TYPE responsi_status AS ENUM ('upcoming', 'live', 'completed');
            END IF;
        END $$;`);
    } catch (e) { console.error("Error creating enums:", e); }

    // 2. Buat tabel-tabel yang hilang secara manual jika belum ada
    console.log("🛠️  Memastikan tabel material_requests...");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS material_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        description TEXT,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        prodi_id UUID REFERENCES prodi(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    console.log("🛠️  Memastikan tabel bank_soal...");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS bank_soal (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(500) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        tahun_ajaran VARCHAR(20) NOT NULL,
        mata_kuliah_id UUID REFERENCES mata_kuliah(id) ON DELETE CASCADE,
        prodi_id UUID REFERENCES prodi(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    console.log("🛠️  Memastikan tabel exercises...");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        description TEXT,
        google_form_url VARCHAR(500) NOT NULL,
        mata_kuliah_id UUID REFERENCES mata_kuliah(id) ON DELETE CASCADE,
        tahun_ajaran VARCHAR(20),
        prodi_id UUID REFERENCES prodi(id) ON DELETE CASCADE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    console.log("🛠️  Memastikan tabel activity_logs...");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id UUID,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    // 3. Pastikan kolom NIM ada di tabel users (tambahan)
    console.log("🛠️  Memeriksa kolom NIM...");
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS nim VARCHAR(50) UNIQUE`);

    console.log("🛠️  Memastikan tabel otps...");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        identifier VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);

    // 4. Sinkronisasi Roles & Permissions
    console.log("🛠️  Mensinkronisasi Roles & Permissions...");
    const availableRoles = [
        { code: "super_admin", name: "Super Admin", permissions: ["*"] },
        { 
            code: "admin", 
            name: "Admin Prodi", 
            permissions: [
                "dashboard:view", 
                "prodi:view", "prodi:edit", 
                "matkul:view", "matkul:manage",
                "materi:view", "materi:manage", 
                "video:view", "video:manage", 
                "bank_soal:view", "bank_soal:manage",
                "responsi:view", "responsi:manage",
                "log:view"
            ] 
        },
        { code: "student", name: "Student", permissions: ["dashboard:view", "matkul:view", "materi:view", "video:view", "responsi:view", "exercise:view", "bank_soal:view", "request:view"] }
    ];

    for (const r of availableRoles) {
        const [existing] = await db.select().from(roles).where(eq(roles.code, r.code)).limit(1);
        if (existing) {
            await db.update(roles).set({ 
                name: r.name, 
                permissions: r.permissions 
            }).where(eq(roles.id, existing.id));
        } else {
            await db.insert(roles).values({
                name: r.name,
                code: r.code,
                permissions: r.permissions
            });
        }
    }

    // 5. Migrasi data role lama di users ke role_id (jika role_id null)
    console.log("🛠️  Melakukan migrasi users.role_id...");
    const allUsers = await db.select().from(users);
    const superAdminRole = (await db.select().from(roles).where(eq(roles.code, "super_admin")).limit(1))[0];
    const adminRole = (await db.select().from(roles).where(eq(roles.code, "admin")).limit(1))[0];
    const studentRole = (await db.select().from(roles).where(eq(roles.code, "student")).limit(1))[0];

    for (const u of allUsers) {
        if (!u.roleId) {
            // Check legacy role column if it exists in data
            const legacyRole = (u as any).role || "student";
            let targetRoleId = studentRole.id;
            if (legacyRole === "super_admin") targetRoleId = superAdminRole.id;
            else if (legacyRole === "admin") targetRoleId = adminRole.id;
            
            await db.update(users).set({ roleId: targetRoleId }).where(eq(users.id, u.id));
        }
    }

    console.log("✅ Sinkronisasi database selesai!");
    await client.end();
}

sync().catch(err => {
    console.error("❌ Sinkronisasi gagal:", err);
    process.exit(1);
});
