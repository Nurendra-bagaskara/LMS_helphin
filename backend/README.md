# 🐬 HelPhin LMS Backend API

Backend API untuk **HelPhin Learning Management System** — platform LMS untuk himpunan mahasiswa.

**Tech Stack:** ElysiaJS (Bun) · Drizzle ORM · PostgreSQL

---

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── index.ts                 # Entry point — server & route registration
│   ├── db/
│   │   ├── index.ts             # Database connection (postgres.js + Drizzle)
│   │   ├── schema.ts            # Drizzle ORM table definitions
│   │   └── seed.ts              # Database seeder (Super Admin + sample data)
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── rbac.ts              # Role-Based Access Control guards
│   ├── routes/
│   │   ├── auth.ts              # POST /auth/register, /login, /refresh, GET /me
│   │   ├── users.ts             # User management (Super Admin CRUD)
│   │   ├── fakultas.ts          # Fakultas CRUD
│   │   ├── prodi.ts             # Prodi CRUD
│   │   ├── mata-kuliah.ts       # Mata Kuliah CRUD
│   │   ├── materials.ts         # Material CRUD + file upload/download
│   │   ├── videos.ts            # Video CRUD (YouTube embed control)
│   │   ├── responsi.ts          # Responsi schedule CRUD
│   │   ├── exercises.ts         # Exercise CRUD (Google Form links)
│   │   ├── requests.ts          # Material request/saran (student → admin)
│   │   ├── activity-logs.ts     # Activity logs (Super Admin only)
│   │   └── dashboard.ts         # Role-based dashboard stats
│   └── utils/
│       └── logger.ts            # Activity logging utility
├── uploads/                     # Uploaded material files (auto-created)
├── drizzle/                     # Generated migration files
├── .env                         # Environment variables
├── .env.example                 # Template
├── drizzle.config.ts            # Drizzle Kit config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Bun** ≥ 1.0 → [Install Bun](https://bun.sh)
- **PostgreSQL** ≥ 14, running locally

### Step 1: Install Dependencies

```bash
cd backend
bun install
```

### Step 2: Setup Database

Buat database PostgreSQL:

```sql
CREATE DATABASE helphin_lms;
```

### Step 3: Configure Environment

Edit file `.env` sesuaikan dengan konfigurasi PostgreSQL kamu:

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/helphin_lms
JWT_SECRET=your-secret-key-here
PORT=3000
```

### Step 4: Run Migrations

```bash
bun run db:generate
bun run db:migrate
```

### Step 5: Seed Database

```bash
bun run db:seed
```

Ini akan membuat:
- **Super Admin** → `superadmin@helphin.com` / `superadmin123`
- **Admin IF** → `admin.if@helphin.com` / `admin123`
- **Student IF** → `student.if@helphin.com` / `student123`
- Sample Fakultas, Prodi, dan Mata Kuliah

### Step 6: Start Server

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000`

---

## 📋 API Endpoints

Base URL: `http://localhost:3000/api`

### Auth

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/api/auth/register` | Public | Register student baru |
| POST | `/api/auth/login` | Public | Login (semua role) |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Auth | Get current user info |

### User Management

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/users` | Super Admin | List semua user (filter: role, prodiId) |
| POST | `/api/users` | Super Admin | Buat akun Admin |
| PATCH | `/api/users/:id` | Super Admin | Update user |
| DELETE | `/api/users/:id` | Super Admin | Hapus user |

### Fakultas

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/fakultas` | Auth | List semua fakultas |
| GET | `/api/fakultas/:id` | Auth | Get fakultas by ID |
| POST | `/api/fakultas` | Super Admin | Buat fakultas |
| PATCH | `/api/fakultas/:id` | Super Admin | Update fakultas |
| DELETE | `/api/fakultas/:id` | Super Admin | Hapus fakultas |

### Prodi

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/prodi` | Auth | List prodi (filter: fakultasId) |
| GET | `/api/prodi/:id` | Auth | Get prodi by ID |
| POST | `/api/prodi` | Super Admin | Buat prodi |
| PATCH | `/api/prodi/:id` | Super Admin | Update prodi |
| DELETE | `/api/prodi/:id` | Super Admin | Hapus prodi |

### Mata Kuliah

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/mata-kuliah` | Auth | List matkul (filter: prodiId) |
| GET | `/api/mata-kuliah/:id` | Auth | Get matkul by ID |
| POST | `/api/mata-kuliah` | Admin/SA | Buat matkul (own prodi) |
| PATCH | `/api/mata-kuliah/:id` | Admin/SA | Update matkul (own prodi) |
| DELETE | `/api/mata-kuliah/:id` | Admin/SA | Hapus matkul (own prodi) |

### Materials

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/materials` | Auth | List materi (filter: prodiId, mataKuliahId, tahunAjaran, search) |
| GET | `/api/materials/:id` | Auth | Get materi by ID |
| POST | `/api/materials` | Admin/SA | Upload materi (multipart/form-data) |
| PATCH | `/api/materials/:id` | Admin/SA | Update metadata materi (own prodi) |
| DELETE | `/api/materials/:id` | Admin/SA | Hapus materi + file (own prodi) |
| GET | `/api/materials/:id/download` | Auth | Download file materi |

### Videos

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/videos` | Auth | List video (filter: prodiId, type, mataKuliahId, tahunAjaran) |
| GET | `/api/videos/:id` | Auth | Get video by ID (embed URL only) |
| POST | `/api/videos` | Admin/SA | Tambah video YouTube |
| PATCH | `/api/videos/:id` | Admin/SA | Update video (own prodi) |
| DELETE | `/api/videos/:id` | Admin/SA | Hapus video (own prodi) |

### Responsi

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/responsi` | Auth | List responsi (filter: prodiId, status) |
| GET | `/api/responsi/:id` | Auth | Get responsi by ID |
| POST | `/api/responsi` | Admin/SA | Buat jadwal responsi |
| PATCH | `/api/responsi/:id` | Admin/SA | Update responsi (own prodi) |
| DELETE | `/api/responsi/:id` | Admin/SA | Hapus responsi (own prodi) |

### Exercises (Latihan Soal)

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/exercises` | Auth | List latihan soal (filter: prodiId, mataKuliahId, tahunAjaran) |
| GET | `/api/exercises/:id` | Auth | Get latihan soal by ID |
| POST | `/api/exercises` | Admin/SA | Buat latihan soal (Google Form) |
| PATCH | `/api/exercises/:id` | Admin/SA | Update latihan soal (own prodi) |
| DELETE | `/api/exercises/:id` | Admin/SA | Hapus latihan soal (own prodi) |

### Material Requests (Saran)

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/requests` | Auth | List saran (role-filtered) |
| POST | `/api/requests` | Student | Submit saran materi |
| DELETE | `/api/requests/:id` | Admin/SA | Hapus saran |

### Activity Logs

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/activity-logs` | Super Admin | List logs (filter: userId, action, entityType, dateFrom, dateTo) |

### Dashboard

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/dashboard/stats` | Auth | Stats sesuai role |

---

## 🧪 Testing Guide (curl)

### 1. Login sebagai Super Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@helphin.com","password":"superadmin123"}'
```

Simpan `accessToken` dari response untuk digunakan di request berikutnya.

### 2. Login sebagai Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.if@helphin.com","password":"admin123"}'
```

### 3. Login sebagai Student

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student.if@helphin.com","password":"student123"}'
```

### 4. Register Student Baru

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso",
    "email": "budi@student.com",
    "password": "password123",
    "prodiId": "<PRODI_ID>"
  }'
```

### 5. Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 6. Buat Admin (Super Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <SA_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin SI",
    "email": "admin.si@helphin.com",
    "password": "admin123",
    "prodiId": "<PRODI_SI_ID>"
  }'
```

### 7. List Fakultas

```bash
curl http://localhost:3000/api/fakultas \
  -H "Authorization: Bearer <TOKEN>"
```

### 8. List Prodi (filter by fakultas)

```bash
curl "http://localhost:3000/api/prodi?fakultasId=<FAKULTAS_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### 9. List Mata Kuliah (filter by prodi)

```bash
curl "http://localhost:3000/api/mata-kuliah?prodiId=<PRODI_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### 10. Upload Material (Admin)

```bash
curl -X POST http://localhost:3000/api/materials \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "title=Modul Kalkulus BAB 1" \
  -F "description=Limit dan Turunan" \
  -F "tahunAjaran=2025/2026" \
  -F "mataKuliahId=<MATKUL_ID>" \
  -F "file=@/path/to/file.pdf"
```

### 11. List Materials (filter by matkul + tahun ajaran)

```bash
curl "http://localhost:3000/api/materials?mataKuliahId=<ID>&tahunAjaran=2025/2026" \
  -H "Authorization: Bearer <TOKEN>"
```

### 12. Download Material

```bash
curl -O http://localhost:3000/api/materials/<MATERIAL_ID>/download \
  -H "Authorization: Bearer <TOKEN>"
```

### 13. Tambah Video (Admin)

```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Responsi Kalkulus #1",
    "description": "Pembahasan soal limit",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "type": "recording",
    "mataKuliahId": "<MATKUL_ID>",
    "tahunAjaran": "2025/2026"
  }'
```

### 14. List Videos (embed URLs returned, raw URL hidden)

```bash
curl "http://localhost:3000/api/videos?prodiId=<PRODI_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

### 15. Buat Jadwal Responsi (Admin)

```bash
curl -X POST http://localhost:3000/api/responsi \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Responsi Kalkulus Minggu 5",
    "speaker": "Asisten Lab",
    "topic": "Integral",
    "scheduleDate": "2026-03-01T09:00:00Z",
    "durationMinutes": 90,
    "status": "upcoming"
  }'
```

### 16. Buat Latihan Soal (Admin)

```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Latihan Soal Kalkulus BAB 1",
    "subject": "Kalkulus",
    "googleFormUrl": "https://forms.google.com/d/example123",
    "mataKuliahId": "<MATKUL_ID>",
    "tahunAjaran": "2025/2026"
  }'
```

### 17. Submit Saran Materi (Student)

```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Request: Modul Integral Lanjut",
    "subject": "Kalkulus",
    "description": "Mohon ditambahkan modul integral dari buku referensi Anton"
  }'
```

### 18. View Activity Logs (Super Admin)

```bash
curl "http://localhost:3000/api/activity-logs?limit=20" \
  -H "Authorization: Bearer <SA_TOKEN>"
```

### 19. View Dashboard Stats

```bash
# Super Admin — total students, courses, prodi, fakultas teraktif, mahasiswa teraktif
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <SA_TOKEN>"

# Admin — prodi stats
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Student — latest materials, upcoming responsi, my requests
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

### 20. Cross-Prodi Access (Student)

Student dari Prodi IF mengakses materi dari Prodi SI:

```bash
curl "http://localhost:3000/api/materials?prodiId=<PRODI_SI_ID>" \
  -H "Authorization: Bearer <STUDENT_IF_TOKEN>"
```

### 21. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

---

## 📌 Key Design Decisions

| Feature | Implementation |
|---------|---------------|
| **Video Access Control** | YouTube URLs stored in DB, but API returns only embed URLs (`/embed/<id>`). Raw YouTube links never exposed to frontend. |
| **Material Request** | One-way submission — student sends saran, gets confirmation. No status tracking (bukan approval workflow). |
| **File Upload** | Files stored in `uploads/` directory, served via static plugin. |
| **RBAC** | Middleware-level check + per-resource ownership validation (admin can only edit own prodi). |
| **Activity Logging** | Automatic logging on all CRUD actions, viewable only by Super Admin. |
| **Cross-Prodi Read** | All authenticated users can read materials/videos from any prodi. Write restricted to own prodi. |

---

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `bun run dev` | Start dev server (auto-reload) |
| `start` | `bun run start` | Start production server |
| `db:generate` | `bun run db:generate` | Generate Drizzle migration files |
| `db:migrate` | `bun run db:migrate` | Apply migrations to database |
| `db:seed` | `bun run db:seed` | Seed database with sample data |
| `db:studio` | `bun run db:studio` | Open Drizzle Studio (DB GUI) |
