import { db, client } from "./index";
import { prodi, mataKuliah, users } from "./schema";
import { eq } from "drizzle-orm";

async function check() {
  const p = await db.select().from(prodi);
  console.log("ALL PRODIS:");
  for (const pr of p) {
     const mks = await db.select().from(mataKuliah).where(eq(mataKuliah.prodiId, pr.id));
     const usrs = await db.select().from(users).where(eq(users.prodiId, pr.id));
     console.log(`- [${pr.id}] ${pr.name} (fakultas: ${pr.fakultasId}). Courses: ${mks.length}, Users: ${usrs.length}`);
  }
  await client.end();
}

check().catch(console.error);
