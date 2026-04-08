import { db } from "./src/db";
import { materials } from "./src/db/schema";
import { eq, ilike } from "drizzle-orm";

const result = await db
    .select({
        id: materials.id,
        title: materials.title,
        fileUrl: materials.fileUrl
    })
    .from(materials)
    .where(ilike(materials.title, "%Modul 2%"))
    .limit(5);

console.log(JSON.stringify(result, null, 2));
process.exit(0);
