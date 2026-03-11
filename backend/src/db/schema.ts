import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    jsonb,
    pgEnum,
} from "drizzle-orm/pg-core";

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum("user_role", [
    "super_admin",
    "admin",
    "student",
]);

export const videoTypeEnum = pgEnum("video_type", ["recording", "live"]);

export const responsiStatusEnum = pgEnum("responsi_status", [
    "upcoming",
    "live",
    "completed",
]);

// ==================== TABLES ====================

// Roles
export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 255 }).notNull().unique(), // e.g., 'super_admin', 'admin', 'student'
    permissions: jsonb("permissions").default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fakultas
export const fakultas = pgTable("fakultas", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    universityName: varchar("university_name", { length: 255 }).default("Telkom University"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prodi
export const prodi = pgTable("prodi", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    fakultasId: uuid("fakultas_id")
        .references(() => fakultas.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    roleId: uuid("role_id").references(() => roles.id, { onDelete: "set null" }),
    jabatan: varchar("jabatan", { length: 255 }),
    prodiId: uuid("prodi_id").references(() => prodi.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mata Kuliah
export const mataKuliah = pgTable("mata_kuliah", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    prodiId: uuid("prodi_id")
        .references(() => prodi.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Materials
export const materials = pgTable("materials", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    fileType: varchar("file_type", { length: 50 }).notNull(),
    tahunAjaran: varchar("tahun_ajaran", { length: 20 }).notNull(),
    mataKuliahId: uuid("mata_kuliah_id")
        .references(() => mataKuliah.id, { onDelete: "cascade" })
        .notNull(),
    prodiId: uuid("prodi_id")
        .references(() => prodi.id, { onDelete: "cascade" })
        .notNull(),
    uploadedBy: uuid("uploaded_by")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Videos
export const videos = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    youtubeUrl: varchar("youtube_url", { length: 500 }).notNull(),
    type: videoTypeEnum("type").notNull().default("recording"),
    mataKuliahId: uuid("mata_kuliah_id")
        .references(() => mataKuliah.id, { onDelete: "cascade" }),
    tahunAjaran: varchar("tahun_ajaran", { length: 20 }),
    prodiId: uuid("prodi_id")
        .references(() => prodi.id, { onDelete: "cascade" })
        .notNull(),
    uploadedBy: uuid("uploaded_by")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Responsi
export const responsi = pgTable("responsi", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    speaker: varchar("speaker", { length: 255 }),
    topic: varchar("topic", { length: 255 }),
    scheduleDate: timestamp("schedule_date").notNull(),
    durationMinutes: integer("duration_minutes"),
    meetingLink: varchar("meeting_link", { length: 500 }),
    requestMaterialLink: varchar("request_material_link", { length: 500 }),
    communityLink: varchar("community_link", { length: 500 }),
    status: responsiStatusEnum("status").notNull().default("upcoming"),
    mataKuliahId: uuid("mata_kuliah_id")
        .references(() => mataKuliah.id, { onDelete: "cascade" }),
    prodiId: uuid("prodi_id")
        .references(() => prodi.id, { onDelete: "cascade" })
        .notNull(),
    createdBy: uuid("created_by")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Material Requests (Saran)
export const materialRequests = pgTable("material_requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    description: text("description"),
    studentId: uuid("student_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    prodiId: uuid("prodi_id")
        .references(() => prodi.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exercises
export const exercises = pgTable("exercises", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }),
    description: text("description"),
    googleFormUrl: varchar("google_form_url", { length: 500 }).notNull(),
    mataKuliahId: uuid("mata_kuliah_id")
        .references(() => mataKuliah.id, { onDelete: "cascade" }),
    tahunAjaran: varchar("tahun_ajaran", { length: 20 }),
    prodiId: uuid("prodi_id")
        .references(() => prodi.id, { onDelete: "cascade" })
        .notNull(),
    createdBy: uuid("created_by")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity Logs
export const activityLogs = pgTable("activity_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: uuid("entity_id"),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
