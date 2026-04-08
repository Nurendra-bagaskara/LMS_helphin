import postgres from "postgres";

async function run() {
    try {
        const client = postgres("postgres://postgres:12345678@localhost:5432/helphin_lms");
        console.log("Adding mata_kuliah_id column to 5432...");
        await client`ALTER TABLE responsi ADD COLUMN IF NOT EXISTS mata_kuliah_id UUID REFERENCES mata_kuliah(id) ON DELETE CASCADE`;
        console.log("Added 5432.");
    } catch(e) {
        console.error("FAIL 5432:", e.message);
    }
    try {
        const client = postgres("postgres://postgres:12345678@localhost:5439/helphin_lms");
        console.log("Adding mata_kuliah_id column to 5439...");
        await client`ALTER TABLE responsi ADD COLUMN IF NOT EXISTS mata_kuliah_id UUID REFERENCES mata_kuliah(id) ON DELETE CASCADE`;
        console.log("Added 5439.");
    } catch(e) {
        console.error("FAIL 5439:", e.message);
    }
    process.exit(0);
}
run();
