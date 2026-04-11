import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { join } from "path";
import { existsSync } from "fs";
import { cache } from "./utils/cache";

// Routes
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { fakultasRoutes } from "./routes/fakultas";
import { prodiRoutes } from "./routes/prodi";
import { mataKuliahRoutes } from "./routes/mata-kuliah";
import { materialRoutes } from "./routes/materials";
import { videoRoutes } from "./routes/videos";
import { responsiRoutes } from "./routes/responsi";
import { exerciseRoutes } from "./routes/exercises";
import { bankSoalRoutes } from "./routes/bank-soal";
import { requestRoutes } from "./routes/requests";
import { roleRoutes } from "./routes/roles";
import { activityLogRoutes } from "./routes/activity-logs";
import { dashboardRoutes } from "./routes/dashboard";
import { supportRoutes } from "./routes/support";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
    // ==================== PLUGINS ====================
    .use(cors({
        origin: process.env.CORS_ORIGIN || true,
        credentials: true,
    }))
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET || "helphin-lms-jwt-secret-key-2026",
        })
    )
    // ==================== STATIC FILES ====================
    .get("/uploads/*", ({ params, set, query }: any) => {
        const path = decodeURIComponent(params["*"]);
        const filePath = join(import.meta.dir, "../uploads", path);
        if (existsSync(filePath)) {
            if (query.download) {
                set.headers["Content-Disposition"] = `attachment; filename="${path.split("/").pop()}"`;
            }
            return Bun.file(filePath);
        }
        set.status = 404;
        return { success: false, message: "File not found" };
    })

    // ==================== ERROR HANDLER ====================
    .onError(({ code, error, set }) => {
        if (code === "VALIDATION") {
            set.status = 400;
            return {
                success: false,
                message: "Validation error",
                errors: error.message,
            };
        }

        const errMessage = error instanceof Error ? error.message : String(error);

        if (errMessage.startsWith("Unauthorized")) {
            set.status = 401;
            return { success: false, message: errMessage };
        }
        if (errMessage.startsWith("Forbidden")) {
            set.status = 403;
            return { success: false, message: errMessage };
        }
        console.error("Unhandled error:", error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        set.status = 500;
        return {
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        };
    })

    // ==================== HEALTH CHECK ====================
    .get("/", () => ({
        success: true,
        message: "🐬 HelPhin LMS API is running!",
        version: "1.0.0",
        docs: "See README.md for API documentation",
    }))

    .get("/health", () => ({
        status: "ok",
        timestamp: new Date().toISOString(),
        cacheSize: cache.size,
    }))

    // ==================== API ROUTES ====================
    .group("/api", (app) =>
        app
            .use(authRoutes)
            .use(userRoutes)
            .use(fakultasRoutes)
            .use(prodiRoutes)
            .use(mataKuliahRoutes)
            .use(materialRoutes)
            .use(videoRoutes)
            .use(responsiRoutes)
            .use(exerciseRoutes)
            .use(bankSoalRoutes)
            .use(requestRoutes)
            .use(roleRoutes)
            .use(activityLogRoutes)
            .use(dashboardRoutes)
            .use(supportRoutes)
    )

    // ==================== START ====================
    .listen(PORT);

console.log(`
╔══════════════════════════════════════╗
║   🐬 HelPhin LMS Backend API        ║
║   Running on: http://localhost:${PORT}  ║
║   Mode: ${process.env.NODE_ENV || "development"}                  ║
╚══════════════════════════════════════╝
`);

export type App = typeof app;
