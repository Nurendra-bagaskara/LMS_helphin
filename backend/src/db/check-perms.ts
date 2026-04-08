import { db } from "./index";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

async function checkPermissions() {
    console.log("--- PERMISSION CHECK START ---");
    
    const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);
    
    if (studentRole) {
        console.log(`Role: ${studentRole.name} (${studentRole.code})`);
        console.log(`Permissions: ${JSON.stringify(studentRole.permissions)}`);
        
        const perms = studentRole.permissions as string[];
        if (perms.includes("matkul:view")) {
            console.log("✅ Role student punya izin 'matkul:view'");
        } else {
            console.log("❌ Role student TIDAK PUNYA izin 'matkul:view'!");
        }
    } else {
        console.log("Role student tidak ditemukan!");
    }
    
    console.log("--- PERMISSION CHECK END ---");
    process.exit(0);
}

checkPermissions();
