import { db, client } from "./index";
import { users, roles } from "./schema";
import { eq, isNull } from "drizzle-orm";

async function syncRoles() {
    console.log("🔄 Synchronizing roles...");

    // 1. Ensure default roles exist
    const defaultRoles = [
        { name: "Super Admin", code: "super_admin" },
        { name: "Admin Prodi", code: "admin" },
        { name: "Student", code: "student" },
    ];

    for (const roleDef of defaultRoles) {
        const [existing] = await db
            .select()
            .from(roles)
            .where(eq(roles.code, roleDef.code))
            .limit(1);

        if (!existing) {
            console.log(`✨ Creating role: ${roleDef.name} (${roleDef.code})`);
            await db.insert(roles).values(roleDef);
        } else {
            console.log(`✅ Role exists: ${roleDef.code}`);
        }
    }

    // 2. Fetch all roles to get their IDs
    const allRoles = await db.select().from(roles);
    const roleMap = new Map(allRoles.map((r) => [r.code, r.id]));

    // 3. Update existing users who have roleId = null
    // Note: Since 'role' column is gone from schema, we can't easily read it via Drizzle
    // unless we use a raw query if the column still physically exists.

    console.log("🔍 Checking for users with missing roleId...");
    const usersWithoutRole = await db
        .select()
        .from(users)
        .where(isNull(users.roleId));

    if (usersWithoutRole.length > 0) {
        console.log(`⚠️ Found ${usersWithoutRole.length} users with missing roleId.`);

        // Attempt to find a 'super_admin' or similar to assign or just student as default
        const studentId = roleMap.get("student");
        const adminId = roleMap.get("admin");
        const superAdminId = roleMap.get("super_admin");

        for (const user of usersWithoutRole) {
            let targetRoleId = studentId;

            // Heuristic based on name or email if possible, or just default to student
            if (user.email.includes("superadmin")) targetRoleId = superAdminId;
            else if (user.email.includes("admin")) targetRoleId = adminId;

            if (targetRoleId) {
                await db.update(users)
                    .set({ roleId: targetRoleId })
                    .where(eq(users.id, user.id));
                console.log(`✅ Updated user ${user.email} with roleId for ${targetRoleId === superAdminId ? 'super_admin' : targetRoleId === adminId ? 'admin' : 'student'}`);
            }
        }
    }

    console.log("🎉 Role synchronization complete!");
    await client.end();
    process.exit(0);
}

syncRoles().catch((err) => {
    console.error("❌ Sync failed:", err);
    process.exit(1);
});
