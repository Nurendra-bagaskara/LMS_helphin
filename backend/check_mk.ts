import { db } from "./src/db";
import { mataKuliah, prodi } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const allMk = await db.select().from(mataKuliah);
  console.log("Mata Kuliah in DB:", JSON.stringify(allMk, null, 2));
  
  const allProdi = await db.select().from(prodi);
  console.log("Prodi in DB:", JSON.stringify(allProdi, null, 2));
}

check();
