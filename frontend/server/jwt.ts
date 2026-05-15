import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "helphin-lms-jwt-secret-key-2026";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function signJwt(payload: Record<string, any>): Promise<string> {
    return await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(payload.exp ? new Date(payload.exp * 1000) : "12h")
        .sign(secret);
}

export async function verifyJwt(token: string): Promise<any | null> {
    try {
        const { payload } = await jose.jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}
