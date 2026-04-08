import postgres from "postgres";

async function run() {
    try {
        const client = postgres("postgres://postgres:12345678@localhost:5439/helphin_lms");
        console.log("Adding mata_kuliah_id column...");
        await client`ALTER TABLE responsi ADD COLUMN mata_kuliah_id UUID REFERENCES mata_kuliah(id) ON DELETE CASCADE`;
        console.log("Added.");
        process.exit(0);
    } catch(e) {
        console.error("FAIL:", e.message);
        process.exit(1);
    }
}
run();
