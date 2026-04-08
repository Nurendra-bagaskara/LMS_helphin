import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, roles, otps } from "../db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { logActivity } from "../utils/logger";
import { sendOTP } from "../utils/mailer";

export const authRoutes = new Elysia({ prefix: "/auth" })
    // ==================== REGISTER (Student) ====================
    .post(
        "/register",
        async ({ body, set, jwt }: any) => {
            const { name, email, password, prodiId, nim } = body;

            // Check if email or nim already exists
            const [existing] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existing) {
                set.status = 409;
                return { success: false, message: "Email already registered" };
            }

            if (nim) {
                const [existingNim] = await db
                    .select()
                    .from(users)
                    .where(eq(users.nim, nim))
                    .limit(1);

                if (existingNim) {
                    set.status = 409;
                    return { success: false, message: "NIM already registered" };
                }
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
                    nim: nim || null,
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
                exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
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
                nim: t.Optional(t.String()),
                password: t.String({ minLength: 6 }),
                prodiId: t.Optional(t.String()),
            }),
        }
    )

    // ==================== LOGIN ====================
    .post(
        "/login",
        async ({ body, set, jwt, request }: any) => {
            const identity = (body.email || body.identifier || "").trim();
            const { password } = body;

            console.log(`[AUTH] Login attempt for: "${identity}"`);

            const [user] = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    role: roles.code,
                    permissions: roles.permissions,
                    prodiId: users.prodiId,
                    nim: users.nim,
                    passwordHash: users.passwordHash,
                })
                .from(users)
                .leftJoin(roles, eq(users.roleId, roles.id))
                .where(
                    or(eq(users.email, identity), eq(users.nim, identity))
                )
                .limit(1);

            if (!user) {
                console.log(`[AUTH] User "${identity}" NOT found in database.`);
                set.status = 401;
                return { success: false, message: "Invalid email or password" };
            }

            console.log(`[AUTH] User found: ${user.email} (Role: ${user.role})`);

            const validPassword = await Bun.password.verify(password, user.passwordHash);
            if (!validPassword) {
                console.log(`[AUTH] Password for "${identity}" is INVALID.`);
                set.status = 401;
                return { success: false, message: "Invalid email or password" };
            }

            console.log(`[AUTH] Login SUCCESS for: ${user.email}`);

            const accessToken = await jwt.sign({
                sub: user.id,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
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
                        nim: user.nim,
                    },
                    accessToken,
                    refreshToken,
                },
            };
        },
        {
            body: t.Object({
                email: t.Optional(t.String({ format: "email" })),
                identifier: t.Optional(t.String()), // Can be email or nim
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
                exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
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
                nim: users.nim,
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
    })
    
    // ==================== FORGOT PASSWORD (OTP) ====================
    .post(
        "/forgot-password",
        async ({ body, set }: any) => {
            const identifier = body.identifier.trim();

            // 1. Check if user exists (Email or NIM)
            const [user] = await db
                .select()
                .from(users)
                .where(or(eq(users.email, identifier), eq(users.nim, identifier)))
                .limit(1);

            if (!user) {
                set.status = 404;
                return { success: false, message: "Email atau NIM tidak terdaftar" };
            }

            // 2. Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // 3. Save OTP to DB
            await db.insert(otps).values({
                identifier: user.email, // Always store email for identifying OTP
                otp,
                expiresAt,
            });

            // 4. Send Email
            await sendOTP(user.email, otp, user.name);

            await logActivity(user.id, "forgot_password_request", "user", user.id);

            return { 
                success: true, 
                message: "Kode OTP telah dikirim ke email terdaftar",
                data: { email: user.email } // Frontend will need this for Next steps
            };
        },
        {
            body: t.Object({
                identifier: t.String({ minLength: 1 }),
            }),
        }
    )

    // ==================== VERIFY OTP ====================
    .post(
        "/verify-otp",
        async ({ body, set }: any) => {
            const { email, otp } = body;

            // Get the latest OTP for this email
            const [record] = await db
                .select()
                .from(otps)
                .where(and(eq(otps.identifier, email), eq(otps.otp, otp)))
                .orderBy(desc(otps.createdAt))
                .limit(1);

            if (!record) {
                set.status = 400;
                return { success: false, message: "Kode OTP salah atau tidak ditemukan" };
            }

            if (new Date() > record.expiresAt) {
                set.status = 400;
                return { success: false, message: "Kode OTP telah kedaluwarsa" };
            }

            return { success: true, message: "OTP Valid" };
        },
        {
            body: t.Object({
                email: t.String({ format: "email" }),
                otp: t.String({ length: 6 }),
            }),
        }
    )

    // ==================== RESET PASSWORD ====================
    .post(
        "/reset-password",
        async ({ body, set }: any) => {
            const { email, otp, newPassword } = body;

            // 1. Re-verify OTP for security (prevent direct access to reset)
            const [record] = await db
                .select()
                .from(otps)
                .where(and(eq(otps.identifier, email), eq(otps.otp, otp)))
                .orderBy(desc(otps.createdAt))
                .limit(1);

            if (!record || new Date() > record.expiresAt) {
                set.status = 400;
                return { success: false, message: "Sesi verifikasi tidak valid atau kedaluwarsa" };
            }

            // 2. Hash new password
            const passwordHash = await Bun.password.hash(newPassword, {
                algorithm: "bcrypt",
                cost: 10,
            });

            // 3. Update User
            const [updated] = await db
                .update(users)
                .set({ passwordHash, updatedAt: new Date() })
                .where(eq(users.email, email))
                .returning({ id: users.id });

            if (!updated) {
                set.status = 404;
                return { success: false, message: "User tidak ditemukan" };
            }

            // 4. Delete used OTPs for this email
            await db.delete(otps).where(eq(otps.identifier, email));

            await logActivity(updated.id, "reset_password", "user", updated.id);

            return { success: true, message: "Password berhasil diatur ulang. Silakan login kembali." };
        },
        {
            body: t.Object({
                email: t.String({ format: "email" }),
                otp: t.String({ length: 6 }),
                newPassword: t.String({ minLength: 6 }),
            }),
        }
    );
