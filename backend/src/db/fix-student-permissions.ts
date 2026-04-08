import { db, client } from "./index";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

async function fixStudentPermissions() {
  const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);

  if (studentRole) {
    const newPermissions = [
      "dashboard:view",
      "matkul:view",
      "materi:view",
      "video:view",
      "responsi:view",
      "bank_soal:view"
    ];

    await db.update(roles).set({
      permissions: newPermissions
    }).where(eq(roles.id, studentRole.id));

    console.log("✅ Student permissions updated to:", newPermissions);
  } else {
    console.log("❌ Student role NOT found");
  }

  await client.end();
}

fixStudentPermissions().catch(console.error);
