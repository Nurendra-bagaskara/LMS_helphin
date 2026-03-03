// Role-Based Access Control guard
// Usage: requireRole("super_admin") or requireRole("admin", "super_admin")
export function requireRole(...roles: string[]) {
    return ({ user, set }: any) => {
        if (!user) {
            set.status = 401;
            throw new Error("Unauthorized");
        }
        if (!roles.includes(user.role)) {
            set.status = 403;
            throw new Error(`Forbidden: Requires role ${roles.join(" or ")}`);
        }
    };
}

// Permission-Based Access Control guard
// Usage: requirePermission("akun:manage")
export function requirePermission(...requiredPermissions: string[]) {
    return ({ user, set }: any) => {
        if (!user) {
            set.status = 401;
            throw new Error("Unauthorized");
        }

        const userPermissions = (user.permissions as string[]) || [];

        // super_admin with "*" permission has access to everything
        if (userPermissions.includes("*")) return;

        const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));

        if (!hasPermission) {
            set.status = 403;
            throw new Error(`Forbidden: Requires permissions ${requiredPermissions.join(" and ")}`);
        }
    };
}

// Check if user owns the resource (same prodi) or has super permission
export function hasProdiAccess(user: any, targetProdiId: string | null): boolean {
    const userPermissions = (user.permissions as string[]) || [];
    if (userPermissions.includes("*")) return true;

    // If target prodi is null, it's global data, usually only super admin can manage
    if (!targetProdiId) return false;

    // Check if user belongs to the prodi
    return user.prodiId === targetProdiId;
}

// Check if user owns the resource (same prodi) or is super_admin (legacy support)
export function requireProdiAccessOrAdmin(prodiId: string, user: any): boolean {
    const userPermissions = (user.permissions as string[]) || [];
    if (userPermissions.includes("*")) return true;
    if (user.prodiId === prodiId) return true;
    return false;
}
