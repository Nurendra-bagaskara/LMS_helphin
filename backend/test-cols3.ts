import postgres from "postgres";

async function run() {
    try {
        const client = postgres("postgres://postgres:12345678@localhost:5439/helphin_lms");
        const cols = await client`SELECT column_name FROM information_schema.columns WHERE table_name = 'responsi'`;
        console.log("Cols 5439:", cols.map(c => c.column_name).join(", "));
        process.exit(0);
    } catch(e) {
        console.error("FAIL:", e);
    }
}
run();
