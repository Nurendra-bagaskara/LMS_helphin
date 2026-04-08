import { db } from "./src/db";
import { users } from "./src/db/schema";
import postgres from "postgres";

async function run() {
    try {
        console.log("Connecting to standard PG port 5432...");
        const client = postgres("postgres://postgres:12345678@localhost:5432/helphin_lms");
        const res = await client`SELECT * FROM users LIMIT 10`;
        console.log("USERS in DB:", res);
        process.exit(0);
    } catch (e) {
        console.error("PORT 5432 FAIL:", e);
        try {
            console.log("Connecting to PG port 5439...");
            const client2 = postgres("postgres://postgres:12345678@localhost:5439/helphin_lms");
            const res2 = await client2`SELECT * FROM users LIMIT 10`;
            console.log("USERS in DB 5439:", res2);
            process.exit(0);
        } catch (e2) {
            console.error("PORT 5439 FAIL:", e2);
        }
    }
}
run();
