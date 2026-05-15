import { Hono } from "hono";
import { db } from "../db";
import { users, roles, otps } from "../schema";
import { eq, or, and, desc } from "drizzle-orm";
import { signJwt, verifyJwt } from "../jwt";
import { logActivity } from "../logger";
import { sendOTP } from "../mailer";
import bcrypt from "bcryptjs";

const auth = new Hono();

// REGISTER
auth.post("/register", async (c) => {
    const body = await c.req.json();
    const { name, email, password, prodiId, nim } = body;

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) return c.json({ success: false, message: "Email already registered" }, 409);

    if (nim) {
        const [existingNim] = await db.select().from(users).where(eq(users.nim, nim)).limit(1);
        if (existingNim) return c.json({ success: false, message: "NIM already registered" }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const [studentRole] = await db.select().from(roles).where(eq(roles.code, "student")).limit(1);

    const [insertedUser] = await db.insert(users).values({
        name, email, nim: nim || null, passwordHash,
        roleId: studentRole?.id || null, prodiId: prodiId || null,
    }).returning({ id: users.id });

    const [newUser] = await db.select({
        id: users.id, name: users.name, email: users.email,
        role: roles.code, permissions: roles.permissions, prodiId: users.prodiId,
    }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(eq(users.id, insertedUser.id)).limit(1);

    const accessToken = await signJwt({ sub: newUser.id, role: newUser.role, exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60 });
    const refreshToken = await signJwt({ sub: newUser.id, type: "refresh", exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });
    await logActivity(newUser.id, "register", "user", newUser.id);

    return c.json({ success: true, message: "Registration successful", data: { user: newUser, accessToken, refreshToken } }, 201);
});

// LOGIN
auth.post("/login", async (c) => {
    const body = await c.req.json();
    const identity = (body.email || body.identifier || "").trim();
    const { password } = body;

    const [user] = await db.select({
        id: users.id, name: users.name, email: users.email,
        role: roles.code, permissions: roles.permissions,
        prodiId: users.prodiId, nim: users.nim, passwordHash: users.passwordHash,
    }).from(users).leftJoin(roles, eq(users.roleId, roles.id))
      .where(or(eq(users.email, identity), eq(users.nim, identity))).limit(1);

    if (!user) return c.json({ success: false, message: "Invalid email or password" }, 401);

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return c.json({ success: false, message: "Invalid email or password" }, 401);

    const accessToken = await signJwt({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60 });
    const refreshToken = await signJwt({ sub: user.id, type: "refresh", exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });

    const ip = c.req.header("x-forwarded-for") || "unknown";
    await logActivity(user.id, "login", "user", user.id, undefined, ip);

    return c.json({
        success: true, message: "Login successful",
        data: {
            user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions, prodiId: user.prodiId, nim: user.nim },
            accessToken, refreshToken,
        },
    });
});

// REFRESH TOKEN
auth.post("/refresh", async (c) => {
    const { refreshToken } = await c.req.json();
    const payload = await verifyJwt(refreshToken);
    if (!payload || payload.type !== "refresh") return c.json({ success: false, message: "Invalid refresh token" }, 401);

    const [user] = await db.select({ id: users.id, role: roles.code })
        .from(users).leftJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.id, payload.sub as string)).limit(1);
    if (!user) return c.json({ success: false, message: "User not found" }, 401);

    const newAccessToken = await signJwt({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60 });
    const newRefreshToken = await signJwt({ sub: user.id, type: "refresh", exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 });

    return c.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
});

// GET ME
auth.get("/me", async (c) => {
    const authHeader = c.req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) return c.json({ success: false, message: "Unauthorized" }, 401);

    const payload = await verifyJwt(authHeader.split(" ")[1]);
    if (!payload) return c.json({ success: false, message: "Invalid token" }, 401);

    const [user] = await db.select({
        id: users.id, name: users.name, email: users.email,
        role: roles.code, permissions: roles.permissions,
        prodiId: users.prodiId, nim: users.nim, createdAt: users.createdAt,
    }).from(users).leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, payload.sub as string)).limit(1);

    if (!user) return c.json({ success: false, message: "User not found" }, 404);
    return c.json({ success: true, data: user });
});

// FORGOT PASSWORD
auth.post("/forgot-password", async (c) => {
    const { identifier } = await c.req.json();
    const trimmed = identifier.trim();

    const [user] = await db.select().from(users)
        .where(or(eq(users.email, trimmed), eq(users.nim, trimmed))).limit(1);
    if (!user) return c.json({ success: false, message: "Email atau NIM tidak terdaftar" }, 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await db.insert(otps).values({ identifier: user.email, otp, expiresAt });

    const emailSent = await sendOTP(user.email, otp, user.name);
    await logActivity(user.id, "forgot_password_request", "user", user.id);

    if (!emailSent) return c.json({ success: false, message: "Gagal mengirim email OTP. Silakan coba lagi nanti." }, 500);
    return c.json({ success: true, message: "Kode OTP telah dikirim ke email terdaftar", data: { email: user.email } });
});

// VERIFY OTP
auth.post("/verify-otp", async (c) => {
    const { email, otp } = await c.req.json();
    const [record] = await db.select().from(otps)
        .where(and(eq(otps.identifier, email), eq(otps.otp, otp)))
        .orderBy(desc(otps.createdAt)).limit(1);

    if (!record) return c.json({ success: false, message: "Kode OTP salah atau tidak ditemukan" }, 400);
    if (new Date() > record.expiresAt) return c.json({ success: false, message: "Kode OTP telah kedaluwarsa" }, 400);
    return c.json({ success: true, message: "OTP Valid" });
});

// RESET PASSWORD
auth.post("/reset-password", async (c) => {
    const { email, otp, newPassword } = await c.req.json();
    const [record] = await db.select().from(otps)
        .where(and(eq(otps.identifier, email), eq(otps.otp, otp)))
        .orderBy(desc(otps.createdAt)).limit(1);

    if (!record || new Date() > record.expiresAt)
        return c.json({ success: false, message: "Sesi verifikasi tidak valid atau kedaluwarsa" }, 400);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [updated] = await db.update(users).set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.email, email)).returning({ id: users.id });
    if (!updated) return c.json({ success: false, message: "User tidak ditemukan" }, 404);

    await db.delete(otps).where(eq(otps.identifier, email));
    await logActivity(updated.id, "reset_password", "user", updated.id);

    return c.json({ success: true, message: "Password berhasil diatur ulang. Silakan login kembali." });
});

export default auth;
