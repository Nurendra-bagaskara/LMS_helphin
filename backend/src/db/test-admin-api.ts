import { db, client } from "./index";
import { users, roles, mataKuliah, materials, prodi } from "./schema";
import { eq, count, desc } from "drizzle-orm";

async function simulate() {
  const [admin] = await db
    .select({
      id: users.id,
      name: users.name,
      prodiId: users.prodiId,
      role: roles.code
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, "admin.if@helphin.com"))
    .limit(1);

  if (!admin) {
    console.log("Admin not found!");
    return;
  }

  console.log("=== ADMIN:", admin.name, "Prodi:", admin.prodiId, "===");

  const mataKuliahTerpopuler = await db
    .select({
        id: mataKuliah.id,
        name: mataKuliah.name,
        materialCount: count(materials.id)
    })
    .from(mataKuliah)
    .leftJoin(materials, eq(materials.mataKuliahId, mataKuliah.id))
    .where(eq(mataKuliah.prodiId, admin.prodiId || ""))
    .groupBy(mataKuliah.id, mataKuliah.name)
    .orderBy(desc(count(materials.id)))
    .limit(5);

  console.log("== ADMIN DASHBOARD TERPOPULER ==");
  console.log(mataKuliahTerpopuler);

  await client.end();
}

simulate().catch(console.error);
