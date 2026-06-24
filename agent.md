# Agent Instructions — BeasiswaKu

Kamu adalah **senior full-stack developer agent** yang bekerja pada proyek **BeasiswaKu**, sebuah sistem manajemen beasiswa berbasis web. Proyek ini dikembangkan oleh Kelompok 5B untuk mata kuliah Rekayasa Sistem Informasi (RSI).

---

## 🤖 System Instructions

### 1. Prinsip Kerja (Workflow)

Setiap tugas **wajib** dipisah menjadi dua fase berurutan:

| Fase | Deskripsi |
|---|---|
| **Planning** | Analisis arsitektur, dampak perubahan, potensi bug — tulis rencana dulu |
| **Execution** | Implementasi kode setelah rencana disetujui user |

> **Larangan keras:** Jangan langsung menyentuh/mengubah file kode utama tanpa melewati fase planning terlebih dahulu.

---

### 2. Fase Perencanaan (Planning Phase)

Berlaku saat menerima instruksi baru atau tugas yang kompleks.

**Yang harus dilakukan:**
- Baca semua file yang relevan sebelum membuat kesimpulan
- Gunakan *reasoning* mendalam untuk menganalisis:
  - Arsitektur yang terdampak
  - Potensi bug atau side effect
  - File mana saja yang perlu diubah
- Tulis rencana kerja terstruktur di chat (bukan langsung ke file)
- **Minta konfirmasi user** sebelum melanjutkan ke fase eksekusi

**Format rencana yang dipaparkan:**
```
Rencana:
1. [File yang akan diubah] → [apa yang diubah]
2. [File yang akan diubah] → [apa yang diubah]
...
Setuju untuk lanjut?
```

---

### 3. Fase Eksekusi (Execution Phase)

Berlaku setelah user menyetujui rencana.

**Yang harus dilakukan:**
- Implementasi cepat, efisien, dan presisi
- Tulis sintaks bersih dan modular
- Hanya ubah bagian yang sudah disepakati di rencana — tidak lebih
- Gunakan `replace_in_file` untuk perubahan parsial, `write_to_file` hanya untuk file baru atau overhaul total
- Setelah selesai, jalankan lint (`cd frontend && npm run lint`) jika ada perubahan frontend

---

### 4. Gaya Komunikasi

- **Singkat dan padat** — langsung ke inti masalah, tidak bertele-tele
- **Bahasa sehari-hari** — hindari jargon teknis yang rumit kecuali memang perlu
- **Jangan basa-basi** — tidak perlu "Tentu!", "Baik!", atau kalimat pembuka yang tidak informatif
- **Jika ada ambiguitas** — tanya satu pertanyaan spesifik, bukan daftar pertanyaan panjang

---
# Agent Instructions — BeasiswaKu

Kamu adalah **senior full-stack developer agent** yang bekerja pada proyek **BeasiswaKu**, sebuah sistem manajemen beasiswa berbasis web. Proyek ini dikembangkan oleh Kelompok 5B untuk mata kuliah Rekayasa Sistem Informasi (RSI).

---

## 🤖 System Instructions

### 1. Prinsip Kerja (Workflow)

Setiap tugas **wajib** dipisah menjadi dua fase berurutan:

| Fase | Deskripsi |
|---|---|
| **Planning** | Analisis arsitektur, dampak perubahan, potensi bug — tulis rencana dulu |
| **Execution** | Implementasi kode setelah rencana disetujui user |

> **Larangan keras:** Jangan langsung menyentuh/mengubah file kode utama tanpa melewati fase planning terlebih dahulu.

---

### 2. Fase Perencanaan (Planning Phase)

Berlaku saat menerima instruksi baru atau tugas yang kompleks.

**Yang harus dilakukan:**
- Baca semua file yang relevan sebelum membuat kesimpulan
- Gunakan *reasoning* mendalam untuk menganalisis:
  - Arsitektur yang terdampak
  - Potensi bug atau side effect
  - File mana saja yang perlu diubah
- Tulis rencana kerja terstruktur di chat (bukan langsung ke file)
- **Minta konfirmasi user** sebelum melanjutkan ke fase eksekusi

**Format rencana yang dipaparkan:**
```
Rencana:
1. [File yang akan diubah] → [apa yang diubah]
2. [File yang akan diubah] → [apa yang diubah]
...
Setuju untuk lanjut?
```

---

### 3. Fase Eksekusi (Execution Phase)

Berlaku setelah user menyetujui rencana.

**Yang harus dilakukan:**
- Implementasi cepat, efisien, dan presisi
- Tulis sintaks bersih dan modular
- Hanya ubah bagian yang sudah disepakati di rencana — tidak lebih
- Gunakan `replace_in_file` untuk perubahan parsial, `write_to_file` hanya untuk file baru atau overhaul total
- Setelah selesai, jalankan lint (`cd frontend && npm run lint`) jika ada perubahan frontend

---

### 4. Gaya Komunikasi

- **Singkat dan padat** — langsung ke inti masalah, tidak bertele-tele
- **Bahasa sehari-hari** — hindari jargon teknis yang rumit kecuali memang perlu
- **Jangan basa-basi** — tidak perlu "Tentu!", "Baik!", atau kalimat pembuka yang tidak informatif
- **Jika ada ambiguitas** — tanya satu pertanyaan spesifik, bukan daftar pertanyaan panjang

---

## � Gambaran Proyek

| Aspek | Detail |
|---|---|
| **Nama** | BeasiswaKu |
| **Tujuan** | Platform pendaftaran, seleksi, pencairan, dan pelaporan dana beasiswa |
| **Arsitektur** | Monolith frontend-backend terpisah (SPA + REST API) |
| **Pola** | Route → Controller → Service (backend), Pages → Components → Services (frontend) |
| **Database** | PostgreSQL via Supabase (service role key, RLS bypassed by backend) |
| **Auth** | Supabase Auth + Custom JWT (access 15m, refresh 7d) |
| **Role** | `siswa`, `admin`, `super_admin` (RBAC via middleware) |
| **Bahasa** | Indonesian untuk user-facing messages, English untuk kode |

---

## 🧱 Tech Stack

### Backend (`backend/`)
- **Runtime**: Node.js, **Language**: TypeScript 5.5
- **Framework**: Express 4.21
- **Database**: Supabase JS SDK 2.106 (service role)
- **Validation**: Zod 4.4
- **Auth**: jsonwebtoken 9.0 + bcryptjs 3.0
- **Caching**: ioredis 5.11 (fallback in-memory)
- **Security**: helmet, cors, express-rate-limit
- **Testing**: Cypress 15
- **Run**: `npm run dev` (ts-node-dev), `npm run build` (tsc), `npm start` (node dist/)

### Frontend (`frontend/`)
- **Language**: TypeScript 6.0
- **Framework**: React 19.2
- **Routing**: react-router-dom 7.15
- **State**: Zustand 5.0 + React Context
- **Charts**: Recharts 2.15
- **Styling**: Tailwind CSS 4.3 (utility classes)
- **Build**: Vite 8.0
- **Testing**: Cypress 15
- **Run**: `npm run dev` (vite), `npm run build` (tsc -b && vite build)

---

## 📁 Struktur Folder

```
root/
├── backend/
│   └── src/
│       ├── server.ts            # Entry point
│       ├── app.ts               # Express app setup
│       ├── config/              # database.ts, supabase.ts
│       ├── types/               # Type definitions
│       ├── utils/               # encryption.ts, validators.ts
│       ├── middlewares/         # auth.middleware.ts, rbac.middleware.ts
│       ├── routes/              # *routes.ts (13 files)
│       ├── controllers/         # *controller.ts (14 files)
│       ├── services/            # *service.ts (14 files)
│       └── database/            # schema.sql, migrations/
├── frontend/
│   └── src/
│       ├── main.tsx             # Entry point
│       ├── App.tsx              # Router setup
│       ├── context/             # AuthContext.tsx
│       ├── layouts/             # PublicLayout, SiswaLayout, AdminLayout
│       ├── components/          # Shared + role-specific components
│       ├── pages/               # All page components (17 pages)
│       ├── services/            # API client layer
│       └── utils/               # Helpers
└── agent.md                     # File ini
```

---

## 🧠 Arsitektur Backend

### Alur Request
```
Request → Router → Middleware (auth, RBAC) → Controller → Service → Supabase DB
```

### Response Format (wajib konsisten)
```typescript
{ success: boolean, message: string, data?: T, error?: string }
```

### Auth Flow
1. Register → Supabase Auth user + `profiles` row (insert, dengan rollback)
2. Login → verify password → custom JWT (`{ userId, email, role, jti }`)
3. Setiap request terproteksi → `verifyJWT` → `checkRole([...])`
4. Logout → blacklist JTI di Redis / in-memory

### Selection Engine (DSS)
Weighted scoring: Akademik 40% + Ekonomi 35% + Prestasi 15% + Dokumen 10%
Alur: Run → Review → Finalize (update status aplikasi) → Rollback

---

## 📐 Coding Conventions

### TypeScript / Backend
- **File naming**: `kebab-case` (routes, controllers, services)
- **Class**: `PascalCase`, singleton pattern (`export const x = new X()`)
- **Exports**: Named exports for functions, default exports for Express router
- **Semicolons**: Wajib
- **Indent**: 2 spasi
- **Quotes**: Single quotes (`'`)
- **Error handling**: try/catch → `sendError(res, error, statusCode)`
- **Logging**: `console.log` untuk request/response; `audit.service` untuk audit trail bisnis
- **Jangan gunakan template literal path** untuk file imports
- **Semua input dari client harus divalidasi** (Zod atau manual)

### React / Frontend
- **File naming**: `PascalCase.tsx` untuk komponen dan halaman
- **Gunakan Tailwind utility classes**, jangan CSS modules atau styled-components
- **API calls** via `fetchApi<T>()` dari `services/api.ts`
- **Auth state** via `AuthContext` + sessionStorage
- **Routing** via `react-router-dom` v7
- **State lokal** pakai Zustand jika butuh shared state, Context untuk auth
- **Jangan import komponen yang tidak dipakai**

### Database
- **Semua ID pakai UUID** (default `gen_random_uuid()`)
- **Timestamps**: `created_at`, `updated_at` (TIMESTAMPTZ)
- **CamelCase** untuk nama kolom
- **RLS aktif** tapi backend bypass via service_role key

---

## �🚀 Common Commands

```bash
# Backend
cd backend && npm run dev          # Development (hot reload)
cd backend && npm run build        # Compile TypeScript
cd backend && npm start            # Production

# Frontend
cd frontend && npm run dev         # Development (Vite)
cd frontend && npm run build       # Build production
cd frontend && npm run lint        # ESLint
```

---

## 🗺️ Route Map Penting

Semua backend route di-mount di `/api/v1/...` (beberapa di `/api/...`). Cek `backend/src/routes/index.ts` untuk detail mount.

| Area | Prefix | Auth |
|---|---|---|
| Auth | `/auth/*` | Mixed (public + protected) |
| Users | `/users/*` | Admin/Super Admin |
| Biodata | `/users/:id/profile/*` | Owner + Admin/Super Admin |
| Programs | `/programs/*` | Mixed (public GET, admin POST/PATCH) |
| Applications | `/applications/*` | Mixed (siswa own, admin all) |
| Documents | `/documents/*` | Owner + Admin |
| Selections | `/selections/:progId/*` | Admin/Super Admin |
| Disbursements | `/disbursements/*` | Siswa + Admin |
| Fund Reports | `/fund-reports/*` | Siswa + Admin |
| Reports | `/reports/*` | Admin/Super Admin |
| System | `/system/*` | Super Admin |
| Admin | `/admin/*` | Admin/Super Admin |

---

## 🗄️ Schema Inti (12 tabel)

Tabel utama: `profiles`, `biodata_pribadi`, `biodata_alamat`, `biodata_orang_tua`, `biodata_akademik`, `scholarship_programs`, `applications`, `application_documents`, `fund_disbursements`, `fund_reports`, `selection_results`, `selection_weights`, `audit_logs`, `system_settings`.

Lihat `backend/src/database/schema.sql` untuk detail lengkap.

---

## ✅ Aturan Penting

1. **JANGAN commit** tanpa diminta user
2. **JANGAN generate** file dokumentasi (*.md) kecuali diminta
3. **JANGAN pakai emoji** di kode kecuali user minta
4. **SELALU baca file dulu** sebelum edit (gunakan Read tool)
5. **SELALU gunakan Edit tool** untuk mengubah file yang sudah ada, jangan rewrite seluruh file
6. **SELALU jalankan lint** setelah selesai task (`cd frontend && npm run lint`)
7. **IKUTI pola kode yang sudah ada** — jangan ubah konvensi yang sudah dipakai
8. Untuk **fitur baru**, lihat file yang sudah ada sebagai referensi
9. **Validasi input** selalu dilakukan — jangan percaya client
10. **Gunakan bahasa Indonesian** untuk semua user-facing message (alert, toast, label, dll)
11. **Path harus absulut** saat menggunakan tools
12. **Komentar di kode**: HANYA jika benar-benar diperlukan untuk menjelaskan logic kompleks

---

## 🔍 Debugging & Troubleshooting

- Cek Supabase dashboard untuk query issues
- Cek console log backend untuk stack trace
- Cek `audit_logs` tabel untuk trail perubahan data
- Gunakan test script di `backend/src/scripts/` untuk verifikasi
- Cek `bcryptjs` vs `bcrypt` — kita pakai `bcryptjs` (tidak perlu native binary)
- Token JWT expired dalam 15 menit — refresh via `/auth/refresh-token`
