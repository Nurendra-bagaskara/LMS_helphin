import { db, client } from "./index";
import { users, mataKuliah, roles } from "./schema";
import { eq } from "drizzle-orm";

async function check() {
  const [u] = await db.select().from(users).where(eq(users.email, "yy.helphian@gmail.com")).limit(1);
  const prodiId = u.prodiId;
  console.log("PRODI ID:", prodiId);
  const m = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, prodiId || ""));
  console.log("MATKULS in student's prodi:", m.length);
  
  const [admin] = await db.select().from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(eq(roles.code, "admin")).limit(1);
  if(admin) {
    console.log("ADMIN PRODI ID:", admin.users.prodiId);
    const mAdmin = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, admin.users.prodiId || ""));
    console.log("MATKULS in admin's prodi:", mAdmin.length);
  }
  
  await client.end();
}

check().catch(console.error);
