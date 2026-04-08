import { db, client } from "./index";
import { prodi, mataKuliah, users, roles } from "./schema";
import { eq } from "drizzle-orm";

async function deepAudit() {
  console.log("--- 1. ALL PRODIS ---");
  const prodis = await db.select().from(prodi);
  console.log(JSON.stringify(prodis, null, 2));

  console.log("\n--- 2. ALL MATA KULIAH (TOP 20) ---");
  const mks = await db.select({
    id: mataKuliah.id,
    name: mataKuliah.name,
    code: mataKuliah.code,
    prodiId: mataKuliah.prodiId
  }).from(mataKuliah).limit(20);
  console.log(JSON.stringify(mks, null, 2));

  console.log("\n--- 3. ALL USERS ---");
  const u = await db.select({
    email: users.email,
    prodiId: users.prodiId,
    role: roles.code
  }).from(users).innerJoin(roles, eq(users.roleId, roles.id));
  console.log(JSON.stringify(u, null, 2));

  await client.end();
}

deepAudit().catch(console.error);
