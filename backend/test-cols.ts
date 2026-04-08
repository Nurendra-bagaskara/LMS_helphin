import postgres from "postgres";
const sql = postgres("postgres://postgres:12345678@localhost:5439/helphin_lms");
async function run() {
    const columns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users';
    `;
    console.log("Users columns:", columns.map(c => c.column_name));
    process.exit(0);
}
run();
