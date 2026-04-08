import { Elysia } from "elysia";
import { db } from "../db";
import { users, roles } from "../db/schema";
import { eq } from "drizzle-orm";

// Derives user from JWT token in Authorization header
export const authMiddleware = (app: Elysia) =>
    app.derive(async ({ headers, jwt, set }: any) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            throw new Error("Unauthorized: No token provided");
        }

        const token = authHeader.split(" ")[1];
        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            throw new Error("Unauthorized: Invalid token");
        }

        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: roles.code,
                roleId: users.roleId,
                prodiId: users.prodiId,
                nim: users.nim,
                permissions: roles.permissions,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.id, payload.sub as string))
            .limit(1);

        if (!user) {
            set.status = 401;
            throw new Error("Unauthorized: User not found");
        }

        return { user };
    });
