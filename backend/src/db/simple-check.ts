import { db } from "./index";
import { sql } from "drizzle-orm";

async function check() {
    const prodiCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'prodi'`);
    console.log("PRODI:", prodiCols.map((c: any) => c.column_name).join(", "));
    
    const usersCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
    console.log("USERS:", usersCols.map((c: any) => c.column_name).join(", "));
    
    process.exit(0);
}

check();
