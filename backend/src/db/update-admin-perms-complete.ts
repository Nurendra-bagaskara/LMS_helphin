import { db, client } from "./index";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

async function updateAdminPermissions() {
  const [adminRole] = await db.select().from(roles).where(eq(roles.code, "admin")).limit(1);

  if (adminRole) {
    const currentPermissions = adminRole.permissions || [];
    
    const additionalPermissions = [
      "materi:view", "materi:manage",
      "bank_soal:view", "bank_soal:manage",
      "video:view", "video:manage",
      "responsi:view", "responsi:manage"
    ];

    const newPermissions = Array.from(new Set([...currentPermissions, ...additionalPermissions]));

    await db.update(roles).set({
      permissions: newPermissions
    }).where(eq(roles.id, adminRole.id));

    console.log("✅ Admin permissions updated comprehensively to include all management tools.");
  } else {
    console.log("❌ Admin role NOT found");
  }

  await client.end();
}

updateAdminPermissions().catch(console.error);
