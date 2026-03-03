import { Elysia } from "elysia";
import { db } from "../db";
import { activityLogs, users } from "../db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";

export const activityLogRoutes = new Elysia({ prefix: "/activity-logs" })
    .use(authMiddleware)

    // LIST (Super Admin only)
    .get("/", async ({ user, set, query }: any) => {
        requireRole("super_admin")({ user, set });

        let conditions: any[] = [];

        if (query.userId) conditions.push(eq(activityLogs.userId, query.userId));
        if (query.action) conditions.push(eq(activityLogs.action, query.action));
        if (query.entityType) conditions.push(eq(activityLogs.entityType, query.entityType));
        if (query.dateFrom) conditions.push(gte(activityLogs.createdAt, new Date(query.dateFrom)));
        if (query.dateTo) conditions.push(lte(activityLogs.createdAt, new Date(query.dateTo)));

        const limit = Math.min(parseInt(query.limit || "50"), 200);
        const offset = parseInt(query.offset || "0");

        const result = await db
            .select({
                id: activityLogs.id,
                userId: activityLogs.userId,
                userName: users.name,
                userEmail: users.email,
                userRole: users.role,
                action: activityLogs.action,
                entityType: activityLogs.entityType,
                entityId: activityLogs.entityId,
                details: activityLogs.details,
                ipAddress: activityLogs.ipAddress,
                createdAt: activityLogs.createdAt,
            })
            .from(activityLogs)
            .leftJoin(users, eq(activityLogs.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(activityLogs.createdAt))
            .limit(limit)
            .offset(offset);

        return { success: true, data: result, meta: { limit, offset } };
    });
