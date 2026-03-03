import { db } from "../db";
import { activityLogs } from "../db/schema";

export async function logActivity(
    userId: string | null,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Record<string, any>,
    ipAddress?: string
) {
    try {
        await db.insert(activityLogs).values({
            userId,
            action,
            entityType: entityType || null,
            entityId: entityId || null,
            details: details || null,
            ipAddress: ipAddress || null,
        });
    } catch (err) {
        console.error("Failed to log activity:", err);
    }
}
