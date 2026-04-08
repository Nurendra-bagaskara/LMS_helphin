import { db } from "./src/db";
import { users, mataKuliah, roles } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const admin = await db.select().from(users).where(eq(users.email, "admin.if@helphin.com")).limit(1);
  console.log("Admin User:", JSON.stringify(admin, null, 2));
  
  if (admin.length > 0) {
    const mk = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, admin[0].prodiId)).limit(10);
    console.log("Mata Kuliah for this Prodi:", JSON.stringify(mk, null, 2));
  }
}

check();
