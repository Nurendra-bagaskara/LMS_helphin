import fs from "fs";
import { db, client } from "./index";
import { prodi, mataKuliah, users, roles } from "./schema";
import { eq } from "drizzle-orm";

async function fullAudit() {
  const result: any = {};

  // 1. All prodis
  result.prodis = await db.select({ id: prodi.id, name: prodi.name }).from(prodi);

  // 2. All mata kuliah with their prodi
  result.mataKuliah = await db
    .select({
      id: mataKuliah.id,
      name: mataKuliah.name,
      code: mataKuliah.code,
      prodiId: mataKuliah.prodiId,
      prodiName: prodi.name,
    })
    .from(mataKuliah)
    .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id));

  // 3. All users with roles and prodi
  result.users = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleCode: roles.code,
      roleName: roles.name,
      permissions: roles.permissions,
      prodiId: users.prodiId,
      prodiName: prodi.name,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(prodi, eq(users.prodiId, prodi.id));

  fs.writeFileSync("full_audit.json", JSON.stringify(result, null, 2));
  console.log("Full audit written to full_audit.json");
  console.log(`Prodis: ${result.prodis.length}`);
  console.log(`MataKuliah: ${result.mataKuliah.length}`);
  console.log(`Users: ${result.users.length}`);

  // Quick cross-check: for each user, how many MK match their prodiId?
  for (const u of result.users) {
    const matchingMK = result.mataKuliah.filter((mk: any) => mk.prodiId === u.prodiId);
    console.log(`  ${u.email} (${u.roleCode}) - prodiId: ${u.prodiId} - prodi: ${u.prodiName} - matching MK: ${matchingMK.length}`);
  }

  await client.end();
}

fullAudit().catch(console.error);
