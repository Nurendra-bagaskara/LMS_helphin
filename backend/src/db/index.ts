import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/helphin_lms";

const client = postgres(connectionString, {
    max: 20,                    // Max 20 connections in pool (Neon free tier limit)
    idle_timeout: 20,           // Close idle connections after 20s
    connect_timeout: 10,        // Timeout koneksi 10 detik
    max_lifetime: 60 * 30,      // Recycle connections setiap 30 menit
    prepare: false,             // Disable prepared statements (required for Neon pooler)
});
export const db = drizzle(client, { schema });
export { client };

