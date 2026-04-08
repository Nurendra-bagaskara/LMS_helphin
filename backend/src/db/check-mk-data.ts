import { db, client } from "./index";
import { mataKuliah, prodi } from "./schema";

async function checkMK() {
  const mkList = await db.select().from(mataKuliah);
  console.log("TOTAL_MK:", mkList.length);
  if (mkList.length > 0) {
    console.log("FIRST_MK:", JSON.stringify(mkList[0], null, 2));
  }
  
  const prodiList = await db.select().from(prodi);
  console.log("TOTAL_PRODI:", prodiList.length);
  if (prodiList.length > 0) {
    console.log("FIRST_PRODI:", JSON.stringify(prodiList[0], null, 2));
  }

  await client.end();
}

checkMK().catch(console.error);
