import { db } from "./index";
import { roles } from "./schema";
import { eq } from "drizzle-orm";

async function fixStudentPerms() {
    console.log("--- FIX START: STUDENT PERMISSION NAME ---");
    
    const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);
    
    if (!studentRole) {
        console.error("Role student not found!");
        process.exit(1);
    }
    
    let perms = (studentRole.permissions as string[]) || [];
    
    // Replace 'material:view' with 'materi:view' if exists
    if (perms.includes("material:view")) {
        perms = perms.map(p => p === "material:view" ? "materi:view" : p);
        console.log("Found 'material:view', changing to 'materi:view'...");
    } else if (!perms.includes("materi:view")) {
        perms.push("materi:view");
        console.log("Adding 'materi:view' to student role...");
    } else {
        console.log("'materi:view' already exists correctly.");
    }
    
    // Remove duplicates just in case
    const finalPerms = Array.from(new Set(perms));
    
    await db.update(roles)
        .set({ permissions: finalPerms })
        .where(eq(roles.id, studentRole.id));
    
    console.log("✅ Student permissions fixed!");
    process.exit(0);
}

fixStudentPerms().catch(console.error);
