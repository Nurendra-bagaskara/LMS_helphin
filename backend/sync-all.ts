import { db, client } from "./src/db";
import { users, roles } from "./src/db/schema";
import { eq, isNull, inArray, notInArray } from "drizzle-orm";

async function syncAll() {
    console.log("🔄 Starting full sync of roles and permissions...");

    // 1. Define default roles with permissions
    const defaultRoles = [
        {
            name: "Super Admin",
            code: "super_admin",
            permissions: ["*"]
        },
        {
            name: "Admin Prodi",
            code: "admin",
            permissions: [
                "dashboard:view",
                "akun:view",
                "akun:manage",
                "prodi:view",
                "prodi:manage",
                "matkul:view",
                "matkul:manage",
                "materi:view",
                "materi:manage",
                "video:view",
                "video:manage",
                "responsi:view",
                "responsi:manage",
                "log:view"
            ]
        },
        {
            name: "Student",
            code: "student",
            permissions: ["dashboard:view", "matkul:view", "responsi:view"]
        },
    ];

    // 2. Upsert roles
    for (const roleDef of defaultRoles) {
        const [existing] = await db
            .select()
            .from(roles)
            .where(eq(roles.code, roleDef.code))
            .limit(1);

        if (!existing) {
            console.log(`✨ Creating missing role: ${roleDef.name} (${roleDef.code})`);
            await db.insert(roles).values(roleDef as any);
        } else {
            console.log(`✅ Role exists, updating permissions: ${roleDef.code}`);
            await db.update(roles)
                .set({ permissions: roleDef.permissions } as any)
                .where(eq(roles.code, roleDef.code));
        }
    }

    // 3. Get fresh role map
    const allRoles = await db.select().from(roles);
    const roleMap = new Map(allRoles.map(r => [r.code, r.id]));
    const roleIds = allRoles.map(r => r.id);

    // 4. Fix orphaned users
    // A user is orphaned if roleId is NULL OR roleId points to a non-existent role
    console.log("🔍 Checking for orphaned users...");

    // We can't easily check "not in array" if the array is empty, but it's not empty now.
    const orphanedUsers = await db
        .select()
        .from(users)
        .where(isNull(users.roleId));

    // Handle users with missing roleId
    for (const user of orphanedUsers) {
        let targetCode = "student";
        if (user.email.includes("superadmin")) targetCode = "super_admin";
        else if (user.email.includes("admin")) targetCode = "admin";

        const targetId = roleMap.get(targetCode);
        if (targetId) {
            await db.update(users)
                .set({ roleId: targetId })
                .where(eq(users.id, user.id));
            console.log(`👤 Reconnected user ${user.email} to role ${targetCode}`);
        }
    }

    // Special case: check if any user has a roleId that is not in our known list
    // This happens if roles were deleted and recreated with new UUIDs
    const allUsers = await db.select().from(users);
    for (const user of allUsers) {
        if (user.roleId && !roleIds.includes(user.roleId)) {
            console.log(`⚠️ User ${user.email} has invalid roleId. Fixing...`);
            let targetCode = "student";
            if (user.email.includes("superadmin")) targetCode = "super_admin";
            else if (user.email.includes("admin")) targetCode = "admin";

            const targetId = roleMap.get(targetCode);
            if (targetId) {
                await db.update(users)
                    .set({ roleId: targetId })
                    .where(eq(users.id, user.id));
                console.log(`👤 Reconnected user ${user.email} to role ${targetCode}`);
            }
        }
    }

    console.log("🎉 Full synchronization complete!");
    await client.end();
    process.exit(0);
}

syncAll().catch(err => {
    console.error("❌ Sync failed:", err);
    process.exit(1);
});
