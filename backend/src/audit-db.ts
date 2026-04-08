import { db } from './src/db';
import { users, roles, prodi, mataKuliah } from './src/db/schema';
import { count, eq } from 'drizzle-orm';

async function check() {
  const p = await db.select().from(prodi);
  console.log('PRODI:', JSON.stringify(p, null, 2));

  const r = await db.select().from(roles);
  console.log('ROLES:', JSON.stringify(r, null, 2));

  const u = await db.select({
    id: users.id,
    name: users.name,
    prodiId: users.prodiId,
    roleId: users.roleId
  }).from(users).limit(10);
  console.log('USERS SNIPPET:', JSON.stringify(u, null, 2));

  const mk = await db.select({
    id: mataKuliah.id,
    name: mataKuliah.name,
    prodiId: mataKuliah.prodiId
  }).from(mataKuliah).limit(10);
  console.log('MATKUL SNIPPET:', JSON.stringify(mk, null, 2));
}

check().catch(console.error);
