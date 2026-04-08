import { db, client } from "./index";
import { mataKuliah, prodi, users, roles } from "./schema";
import { eq } from "drizzle-orm";

async function diagnose() {
  console.log("--- PRODI ---");
  const prodiList = await db.select().from(prodi);
  console.log(JSON.stringify(prodiList, null, 2));

  console.log("--- MATA KULIAH ---");
  const mkList = await db.select().from(mataKuliah).limit(10);
  console.log(JSON.stringify(mkList, null, 2));

  console.log("--- CURRENT USERS ---");
  const userList = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    prodiId: users.prodiId,
    role: roles.code
  }).from(users).leftJoin(roles, eq(users.roleId, roles.id));
  console.log(JSON.stringify(userList, null, 2));

  await client.end();
}

diagnose();
