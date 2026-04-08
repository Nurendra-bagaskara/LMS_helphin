import { db, client } from "./index";
import { mataKuliah, prodi } from "./schema";
import { eq, or } from "drizzle-orm";

async function findMK() {
  const mkList = await db.select({
    id: mataKuliah.id,
    name: mataKuliah.name,
    code: mataKuliah.code,
    prodiId: mataKuliah.prodiId,
    prodiName: prodi.name
  }).from(mataKuliah)
  .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
  .where(or(
    eq(mataKuliah.code, "IF1001"),
    eq(mataKuliah.code, "IF1002"),
    eq(mataKuliah.code, "IF2001")
  ));

  console.log("FOUND_MK:", JSON.stringify(mkList, null, 2));

  if (mkList.length > 0) {
    const pId = mkList[0].prodiId;
    console.log("PRODI_ID_FROM_MK:", pId);
    if (pId) {
      const p = await db.select().from(prodi).where(eq(prodi.id, pId));
      console.log("PRODI_DETAILS:", JSON.stringify(p, null, 2));
    }
  }

  await client.end();
}

findMK().catch(console.error);
