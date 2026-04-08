import { db, client } from "./index";
import { prodi, mataKuliah } from "./schema";
import { like } from "drizzle-orm";

async function checkProdi() {
  const pList = await db.select().from(prodi).where(like(prodi.name, "%Informatika%"));
  console.log("PRODI_LIST_COUNT:", pList.length);
  console.log("PRODI_DETAILS:", JSON.stringify(pList, null, 2));

  for (const p of pList) {
    const mk = await db.select().from(mataKuliah).where(like(mataKuliah.prodiId, p.id));
    console.log(`MK_COUNT_FOR_PRODI_${p.name}:`, mk.length);
  }

  await client.end();
}

checkProdi().catch(console.error);
