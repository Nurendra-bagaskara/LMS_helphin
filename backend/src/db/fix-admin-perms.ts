import { db, client } from "./index";
import { roles } from "./schema";
import { eq, or } from "drizzle-orm";

async function fixAdminPermissions() {
  const [adminRole] = await db.select().from(roles).where(eq(roles.code, "admin")).limit(1);

  if (adminRole) {
    const currentPermissions = adminRole.permissions || [];
    
    // Ensure admin has matkul permissions
    const additionalPermissions = [
      "matkul:view", 
      "matkul:manage"
    ];

    const newPermissions = Array.from(new Set([...currentPermissions, ...additionalPermissions]));

    await db.update(roles).set({
      permissions: newPermissions
    }).where(eq(roles.id, adminRole.id));

    console.log("✅ Admin permissions updated to include matkul:view and matkul:manage");
  } else {
    console.log("❌ Admin role NOT found");
  }

  await client.end();
}

fixAdminPermissions().catch(console.error);
