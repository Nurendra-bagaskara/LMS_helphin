import { db, client } from "./index";
import { mataKuliah, prodi, users, roles } from "./schema";
import { eq, like } from "drizzle-orm";

async function investigate() {
  console.log("=== ALL PRODI ===");
  const allProdis = await db.select().from(prodi);
  console.log(JSON.stringify(allProdis, null, 2));

  console.log("\n=== ALL MATA KULIAH ===");
  const allMKs = await db.select({
    id: mataKuliah.id,
    name: mataKuliah.name,
    code: mataKuliah.code,
    prodiId: mataKuliah.prodiId,
    prodiName: prodi.name
  }).from(mataKuliah).leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id));
  console.log(JSON.stringify(allMKs, null, 2));

  console.log("\n=== CURRENT USERS (Relevant ones) ===");
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    prodiId: users.prodiId,
    role: roles.code
  }).from(users).leftJoin(roles, eq(users.roleId, roles.id));
  console.log(JSON.stringify(allUsers, null, 2));

  await client.end();
}

investigate().catch(console.error);
