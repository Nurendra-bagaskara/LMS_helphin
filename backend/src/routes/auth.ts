import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, roles } from "../db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "../utils/logger";

export const authRoutes = new Elysia({ prefix: "/auth" })
    // ==================== REGISTER (Student) ====================
    .post(
        "/register",
        async ({ body, set, jwt }: any) => {
            const { name, email, password, prodiId } = body;

            // Check if email already exists
            const [existing] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existing) {
                set.status = 409;
                return { success: false, message: "Email already registered" };
            }

            const passwordHash = await Bun.password.hash(password, {
                algorithm: "bcrypt",
                cost: 10,
            });

            // Get student role ID
            const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);

            const [insertedUser] = await db
                .insert(users)
                .values({
                    name,
                    email,
                    passwordHash,
                    roleId: studentRole?.id || null,
                    prodiId: prodiId || null,
                })
                .returning({ id: users.id });

            // Fetch user with role code for JWT and response
            const [newUser] = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: roles.code,
                    permissions: roles.permissions,
                    prodiId: users.prodiId,
                })
                .from(users)
                .leftJoin(roles, eq(users.roleId, roles.id))
                .where(eq(users.id, insertedUser.id))
                .limit(1);

            const accessToken = await jwt.sign({
                sub: newUser.id,
                role: newUser.role,
                exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 min
            });

            const refreshToken = await jwt.sign({
                sub: newUser.id,
                type: "refresh",
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
            });

            await logActivity(newUser.id, "register", "user", newUser.id);

            set.status = 201;
            return {
                success: true,
                message: "Registration successful",
                data: {
                    user: newUser,
                    accessToken,
                    refreshToken,
                },
            };
        },
        {
            body: t.Object({
                name: t.String({ minLength: 1 }),
                email: t.String({ format: "email" }),
                password: t.String({ minLength: 6 }),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // ==================== LOGIN ====================
    .post(
        "/login",
        async ({ body, set, jwt, request }: any) => {
            const { email, password } = body;

            const [user] = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: roles.code,
                    permissions: roles.permissions,
                    prodiId: users.prodiId,
                    passwordHash: users.passwordHash,
                })
                .from(users)
                .leftJoin(roles, eq(users.roleId, roles.id))
                .where(eq(users.email, email))
                .limit(1);

            if (!user) {
                set.status = 401;
                return { success: false, message: "Invalid email or password" };
            }

            const validPassword = await Bun.password.verify(password, user.passwordHash);
            if (!validPassword) {
                set.status = 401;
                return { success: false, message: "Invalid email or password" };
            }

            const accessToken = await jwt.sign({
                sub: user.id,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 15 * 60,
            });

            const refreshToken = await jwt.sign({
                sub: user.id,
                type: "refresh",
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            });

            const ip = request?.headers?.get("x-forwarded-for") || "unknown";
            await logActivity(user.id, "login", "user", user.id, undefined, ip);

            return {
                success: true,
                message: "Login successful",
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions,
                        prodiId: user.prodiId,
                    },
                    accessToken,
                    refreshToken,
                },
            };
        },
        {
            body: t.Object({
                email: t.String({ format: "email" }),
                password: t.String({ minLength: 1 }),
            }),
        }
    )

    // ==================== REFRESH TOKEN ====================
    .post(
        "/refresh",
        async ({ body, set, jwt }: any) => {
            const { refreshToken } = body;

            const payload = await jwt.verify(refreshToken);
            if (!payload || payload.type !== "refresh") {
                set.status = 401;
                return { success: false, message: "Invalid refresh token" };
            }

            const [user] = await db
                .select({ id: users.id, role: roles.code })
                .from(users)
                .leftJoin(roles, eq(users.roleId, roles.id))
                .where(eq(users.id, payload.sub as string))
                .limit(1);

            if (!user) {
                set.status = 401;
                return { success: false, message: "User not found" };
            }

            const newAccessToken = await jwt.sign({
                sub: user.id,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 15 * 60,
            });

            const newRefreshToken = await jwt.sign({
                sub: user.id,
                type: "refresh",
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            });

            return {
                success: true,
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                },
            };
        },
        {
            body: t.Object({
                refreshToken: t.String(),
            }),
        }
    )

    // ==================== GET CURRENT USER ====================
    .get("/me", async ({ headers, jwt, set }: any) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            return { success: false, message: "Unauthorized" };
        }

        const token = authHeader.split(" ")[1];
        const payload = await jwt.verify(token);
        if (!payload) {
            set.status = 401;
            return { success: false, message: "Invalid token" };
        }

        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: roles.code,
                permissions: roles.permissions,
                prodiId: users.prodiId,
                createdAt: users.createdAt,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.id, payload.sub as string))
            .limit(1);

        if (!user) {
            set.status = 404;
            return { success: false, message: "User not found" };
        }

        return { success: true, data: user };
    });
