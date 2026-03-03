import { db, client } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function reset() {
    console.log("🔒 Resetting superadmin password...");
    try {
        const passwordHash = await Bun.password.hash("superadmin123", {
            algorithm: "bcrypt",
            cost: 10,
        });

        await db.update(users)
            .set({ passwordHash })
            .where(eq(users.email, "superadmin@helphin.com"));

        console.log("✅ Superadmin password reset to 'superadmin123'");
    } catch (e) {
        console.error("Reset failed:", e);
    } finally {
        await client.end();
        process.exit(0);
    }
}

reset();
