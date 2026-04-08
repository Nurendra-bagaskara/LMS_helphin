import { db, client } from "./index";
import { users, roles } from "./schema";
import { eq } from "drizzle-orm";
// We don't even need elysia jwt, we can just use jsonwebtoken or similar, or just fetch via the backend index.js running locally since it's hard to sign Elysia JWT programmatically outside the app lifecycle if we don't init it.

// Wait, I can just write a quick route in a test server, or just query the DB exactly as the routes do to see the difference!

async function simulate() {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: roles.code,
      prodiId: users.prodiId,
      permissions: roles.permissions,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, "bagas121.helphian@gmail.com"))
    .limit(1);

  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("=== USER:", user.email, "Prodi:", user.prodiId, "===");

  // 1. Simulate what /api/dashboard/stats?view=student does for this user:
  const { mataKuliah, prodi } = await import("./schema");
  
  const studentMataKuliah = await db
    .select({
      id: mataKuliah.id,
      name: mataKuliah.name,
    })
    .from(mataKuliah)
    .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
    .where(eq(mataKuliah.prodiId, user.prodiId || ""));

  console.log("== DASHBOARD STATS QUERY RESULT ==");
  console.log(`Count: ${studentMataKuliah.length}`);
  console.log(studentMataKuliah);

  // 2. Simulate what /api/mata-kuliah does for this user:
  let conditions: any[] = [];
  if (!user.permissions?.includes("*")) {
     conditions.push(eq(mataKuliah.prodiId, user.prodiId || ""));
  }

  const mkResult = await db
    .select({
      id: mataKuliah.id,
      name: mataKuliah.name,
    })
    .from(mataKuliah)
    .leftJoin(prodi, eq(mataKuliah.prodiId, prodi.id))
    .where(conditions.length > 0 ? conditions[0] : undefined);

  console.log("== MATA-KULIAH API QUERY RESULT ==");
  console.log(`Count: ${mkResult.length}`);
  console.log(mkResult);

  await client.end();
}

simulate().catch(console.error);
