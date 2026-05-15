import { Context } from "hono";
import { db } from "./db";
import { users, roles } from "./schema";
import { eq } from "drizzle-orm";
import { verifyJwt } from "./jwt";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    roleId: string | null;
    prodiId: string | null;
    nim: string | null;
    permissions: string[];
};

export async function getAuthUser(c: Context): Promise<AuthUser | null> {
    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const payload = await verifyJwt(token);
    if (!payload) return null;

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

    if (!user) return null;
    return user as AuthUser;
}

export function requireRole(...requiredRoles: string[]) {
    return (user: AuthUser | null) => {
        if (!user) throw new Error("Unauthorized");
        if (!requiredRoles.includes(user.role)) {
            throw new Error(`Forbidden: Requires role ${requiredRoles.join(" or ")}`);
        }
    };
}

export function requirePermission(...requiredPermissions: string[]) {
    return (user: AuthUser | null) => {
        if (!user) throw new Error("Unauthorized");
        const perms = (user.permissions as string[]) || [];
        if (perms.includes("*")) return;
        const has = requiredPermissions.every(p => perms.includes(p));
        if (!has) throw new Error(`Forbidden: Requires permissions ${requiredPermissions.join(" and ")}`);
    };
}

export function requireProdiAccessOrAdmin(prodiId: string | null, user: AuthUser): boolean {
    const perms = (user.permissions as string[]) || [];
    if (perms.includes("*")) return true;
    if (!prodiId) return false;
    return user.prodiId === prodiId;
}
