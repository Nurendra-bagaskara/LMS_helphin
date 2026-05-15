import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/helphin_lms";

// Serverless-optimized: reuse connection across invocations
const globalForDb = globalThis as unknown as { client: ReturnType<typeof postgres> };

if (!globalForDb.client) {
    globalForDb.client = postgres(connectionString, {
        max: 5,
        idle_timeout: 20,
        connect_timeout: 10,
        max_lifetime: 60 * 30,
        prepare: false,
    });
}

export const client = globalForDb.client;
export const db = drizzle(client, { schema });
