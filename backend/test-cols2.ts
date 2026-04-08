import postgres from "postgres";

async function run() {
    try {
        console.log("Connecting to PG port 5439...");
        const client = postgres("postgres://postgres:12345678@localhost:5439/helphin_lms");
        const columns = await client`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;
        console.log("Users columns 5439:" + columns.map(c => c.column_name).join(", "));
        process.exit(0);
    } catch(e) {
        console.error("FAIL 5439:", e);
        process.exit(1);
    }
}
run();
