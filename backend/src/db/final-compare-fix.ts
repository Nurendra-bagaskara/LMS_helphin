import { db, client } from "./index";
import { mataKuliah, users } from "./schema";
import { eq } from "drizzle-orm";

async function compare() {
  const [mk] = await db.select().from(mataKuliah).where(eq(mataKuliah.code, "IF1001")).limit(1);
  const [st] = await db.select().from(users).where(eq(users.email, "yy.helphian@gmail.com")).limit(1);

  if (mk && st) {
    const mkP = mk.prodiId;
    const stP = st.prodiId;
    console.log(`MK_P: [${mkP}] (len: ${mkP?.length})`);
    console.log(`ST_P: [${stP}] (len: ${stP?.length})`);
    console.log("EXACT MATCH:", mkP === stP);
    
    if (mkP !== stP) {
       console.log("Updating Mata Kuliah to match Student's Prodi ID...");
       await db.update(mataKuliah).set({ prodiId: stP }).where(eq(mataKuliah.prodiId, mkP || ""));
       console.log("Update done.");
    }
  }
  await client.end();
}

compare().catch(console.error);
