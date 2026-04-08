import { db, client } from "./index";
import { mataKuliah, prodi, users } from "./schema";
import { eq, or } from "drizzle-orm";

async function checkDetails() {
  const codes = ["IF1001", "IF1002", "IF2001"];
  const mks = await db.select({
    id: mataKuliah.id,
    name: mataKuliah.name,
    code: mataKuliah.code,
    prodiId: mataKuliah.prodiId,
  }).from(mataKuliah).where(or(
    eq(mataKuliah.code, codes[0]),
    eq(mataKuliah.code, codes[1]),
    eq(mataKuliah.code, codes[2])
  ));

  console.log("=== TARGET MATKUL ===");
  console.log(JSON.stringify(mks, null, 2));

  if (mks.length > 0) {
    const pId = mks[0].prodiId;
    const p = await db.select().from(prodi).where(eq(prodi.id, pId || ""));
    console.log("=== PRODI OF TARGET MATKUL ===");
    console.log(JSON.stringify(p, null, 2));

    const currentStudent = await db.select({
      email: users.email,
      prodiId: users.prodiId,
      prodiName: prodi.name
    }).from(users).leftJoin(prodi, eq(users.prodiId, prodi.id)).where(or(
      eq(users.email, "student.if@helphin.com"),
      eq(users.email, "yy.helphian@gmail.com")
    ));
    console.log("=== CURRENT STUDENTS INFO ===");
    console.log(JSON.stringify(currentStudent, null, 2));
  }
  
  await client.end();
}

checkDetails().catch(console.error);
