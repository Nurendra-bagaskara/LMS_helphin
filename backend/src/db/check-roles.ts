import { db, client } from "./index";
import { roles } from "./schema";

async function check() {
  const r = await db.select().from(roles);
  console.log("ROLES:", JSON.stringify(r, null, 2));
  await client.end();
}

check().catch(console.error);
