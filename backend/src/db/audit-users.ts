import { db, client } from "./index";
import { users, roles, prodi } from "./schema";
import { eq } from "drizzle-orm";

async function checkUsers() {
  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: roles.code,
    prodiId: users.prodiId,
    prodiName: prodi.name
  }).from(users)
  .leftJoin(roles, eq(users.roleId, roles.id))
  .leftJoin(prodi, eq(users.prodiId, prodi.id));

  console.log("ALL_USERS_COUNT:", allUsers.length);
  console.log("USERS_DETAILS:", JSON.stringify(allUsers, null, 2));

  await client.end();
}

checkUsers().catch(console.error);
