# SIAKAD — Sistem Informasi Akademik Sekolah (PWA)

[![CI](https://github.com/termakaniklan/siakad/actions/workflows/ci.yml/badge.svg)](https://github.com/termakaniklan/siakad/actions/workflows/ci.yml)
[![CodeQL](https://github.com/termakaniklan/siakad/actions/workflows/codeql.yml/badge.svg)](https://github.com/termakaniklan/siakad/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SIAKAD adalah platform Sistem Informasi Akademik berbasis **Progressive Web App
(PWA)** untuk sekolah di Indonesia. Aplikasi ini memadukan **CMS publik**, **PPDB
online**, **manajemen akademik** (kelas, mata pelajaran, jadwal, kehadiran,
nilai), **CBT/ujian online berbasis anti-cheat**, **portal siswa/orang tua/guru**,
serta panel administrasi yang granular dengan model peran (RBAC) yang lengkap.

> **Status repo:** kerangka _production-ready foundation_ — modul inti lengkap,
> beberapa halaman admin tersedia sebagai placeholder yang siap diisi tanpa
> mengubah arsitektur.

---

## Daftar Isi

0. [Screenshots](#screenshots)
1. [Pendahuluan & Tujuan](#1-pendahuluan--tujuan)
2. [Fitur Utama](#2-fitur-utama)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Stack Teknologi](#4-stack-teknologi)
5. [Persyaratan Server](#5-persyaratan-server)
6. [Instalasi (Pengembangan)](#6-instalasi-pengembangan)
7. [Instalasi Produksi (Docker)](#7-instalasi-produksi-docker)
8. [Konfigurasi `.env`](#8-konfigurasi-env)
9. [Migrasi & Seeder Database](#9-migrasi--seeder-database)
10. [Skema Database (ERD Ringkas)](#10-skema-database-erd-ringkas)
11. [Hak Akses & Role (RBAC)](#11-hak-akses--role-rbac)
12. [Keamanan & Hardening](#12-keamanan--hardening)
13. [Multi-Database (MariaDB/Postgres/Oracle/MSSQL)](#13-multi-database)
14. [Backup & Restore](#14-backup--restore)
15. [CI/CD, Pengujian, & Observability](#15-cicd-pengujian--observability)
16. [Troubleshooting & FAQ](#16-troubleshooting--faq)
17. [Lisensi & Kontribusi](#17-lisensi--kontribusi)

---

## Screenshots

> Tangkapan layar berikut diambil dari aplikasi yang berjalan lokal dengan data demo
> (`npm run db:seed-demo`).

### Halaman Depan (Homepage)

| Hero & Navbar | Galeri & Fitur |
|:---:|:---:|
| ![Homepage Hero](https://app.devin.ai/attachments/70ae1767-9304-40e1-81e9-4abf7302deda/01-homepage-hero.png) | ![Homepage Gallery](https://app.devin.ai/attachments/808cc37d-4083-4f35-b14f-a6f5f3fe5cd3/02-homepage-gallery.png) |

### Halaman Login

| Login dengan captcha & background AI |
|:---:|
| ![Login](https://app.devin.ai/attachments/079d550f-64cc-4091-b9f4-f35736aab191/03-login.png) |

### CBT / Ujian Online

| Lobby — Daftar Ujian Aktif | Soal — Navigasi & Timer |
|:---:|:---:|
| ![CBT Lobby](https://app.devin.ai/attachments/401c37a3-fb36-4d01-8214-4eae632d7d70/04-cbt-lobby.png) | ![CBT Soal](https://app.devin.ai/attachments/ec5c99af-e7fd-4c0d-a9b0-35fb10ca9b7e/05-cbt-soal.png) |

### Kehadiran / Absensi

| Rekap Admin (harian, tren 7 hari, per kelas) | Riwayat Siswa (progress bar, tabel) |
|:---:|:---:|
| ![Absensi Admin](https://app.devin.ai/attachments/e8f54c0e-fada-40e5-863f-f930be036656/06-absensi-admin.png) | ![Absensi Siswa](https://app.devin.ai/attachments/69984d77-9839-4abc-82ee-13905754a9eb/07-absensi-siswa.png) |

---

## 1. Pendahuluan & Tujuan

**Audien**: SD/SMP/SMA/SMK negeri & swasta yang membutuhkan satu platform terintegrasi —
mulai dari _website resmi_ hingga _portal akademik_, _PPDB online_, dan _ujian berbasis
komputer_.

**Tujuan inti**:

- Menggantikan paket aplikasi terpisah (CMS + SIAKAD + CBT) dengan satu sistem terpadu.
- Memenuhi standar keamanan dan privasi data peserta didik (UU PDP, UU ITE).
- Berfungsi penuh secara **offline-friendly** lewat PWA (install ke home screen,
  cache shell, push notifikasi, fallback offline page).
- Dapat dipasang di server kelas sederhana (1 vCPU / 2 GB RAM minimal) hingga skala
  Kabupaten (multi-instance di belakang load balancer).

## 2. Fitur Utama

### 2.1 CMS Publik

- Beranda dengan hero / slider configurable.
- Berita & pengumuman dengan kategori, tag, draf, slug `/{id}-judul.html`, RSS-ready.
- Halaman dinamis (Profil, Visi-Misi, Sejarah, Kontak) dengan editor rich-text.
- Galeri foto / video dengan kategori, lightbox.
- Modul Prestasi & Testimoni.
- PPDB landing page yang otomatis menampilkan jadwal pendaftaran aktif.
- SEO: sitemap.xml, robots.txt, OpenGraph, schema.org, structured data.
- Multibahasa (id-ID, en-US) — _bahasa default_ Indonesia.

### 2.2 PPDB Online

- Wizard multi-step (Identitas, Orang Tua/Wali, Alamat, Kontak, Konfirmasi).
- **Auto-save draft** ke `localStorage` — pengisi tidak kehilangan data jika
  jaringan terputus.
- Dropdown **wilayah Indonesia berjenjang** (Provinsi → Kabupaten → Kecamatan →
  Kelurahan) lewat endpoint `/api/wilayah/*`.
- Upload dokumen (akta, KK, foto) dengan **validasi MIME + ekstensi + magic-byte** dan
  pemeriksaan ukuran maksimum.
- Validasi NIK / NISN yang opsional (modul terpisah dapat ditambahkan).
- Status pengajuan: `submitted → verified → accepted/rejected → enrolled`.

### 2.3 Manajemen Akademik

- Tahun ajaran, semester aktif.
- Kelas, mata pelajaran, jadwal pelajaran, mapping wali kelas / guru pengampu.
- Pendaftaran siswa (enrollment) per tahun ajaran.
- Kehadiran harian/per pertemuan, rekap bulanan.
- Pelanggaran (poin) dengan kategori dan jenjang sanksi.
- Nilai (formatif, sumatif, ujian, akhir) dengan rumus yang dapat dikonfigurasi.
- Materi & tugas yang dapat diunggah guru.

### 2.4 CBT (Computer-Based Test)

- Bank soal (MCQ, esai, gambar, kombinasi) dengan tagging level kesulitan.
- Konfigurasi per ujian: durasi, jumlah soal, acak soal, acak jawaban, batas tab-switch.
- **Anti-cheat**:
  - Wajib fullscreen (deteksi `fullscreenchange`).
  - Deteksi tab-switch (`visibilitychange`); auto-submit setelah `n` pelanggaran.
  - Auto-submit ketika waktu habis (event server-driven _and_ client timer).
  - Logging IP/UserAgent/timestamp tiap percobaan.
  - Status hasil dapat ditandai `flagged` untuk review manual.
- **Auto-grading** untuk MCQ; esai masuk antrian review manual.
- **Auto-save jawaban** ke `localStorage` — hilangnya koneksi tidak menghapus jawaban.

### 2.5 Portal Pengguna

- Siswa: jadwal, nilai, ujian aktif, kehadiran, materi, pengumuman.
- Orang tua / wali: melihat data anak yang ditautkan.
- Guru: input nilai, kehadiran, unggah materi, jadwal, soal.

### 2.6 Notifikasi

- Email (SMTP, Nodemailer) dengan template HTML.
- WhatsApp (driver Twilio / Meta Cloud API / Fonnte / custom).
- Web Push (Service Worker + VAPID — placeholder VAPID key disediakan).
- Antrian latar via **BullMQ** (redis-backed) dengan retry + DLQ.

### 2.7 PWA

- `manifest.webmanifest` + ikon adaptif (192/512/maskable).
- Service worker (`public/sw.js`) — strategy network-first untuk navigasi,
  stale-while-revalidate untuk static assets, fallback `/offline.html`.
- Web Push handler.
- App shortcuts (Login, PPDB, Berita).

## 3. Arsitektur Sistem

```
┌───────────┐     ┌─────────────────────────────────────────────┐
│  Browser  │ ←─► │  Nginx (TLS, rate-limit, headers, gzip)     │
│  (PWA)    │     └────────────────┬────────────────────────────┘
└───────────┘                      │
                              ┌────▼────┐         ┌────────────┐
                              │ Next.js │ ──────► │   Redis    │
                              │  app    │         │ (cache +   │
                              │ (App R.)│         │  queue +   │
                              └─┬─────┬─┘         │ rate-limit)│
                                │     │           └────┬───────┘
                                │     │                │
                                │  ┌──▼──────────────┐ │
                                │  │ BullMQ worker   │◄┘
                                │  │ (notif/audit)   │
                                │  └─────┬───────────┘
                                │        │
                       ┌────────▼────────▼─────────┐
                       │   MariaDB (Prisma 7 ORM)  │
                       └───────────────────────────┘
```

**Layered design (modular monolith)**:

```
src/
├── app/                # Next.js App Router (UI + API routes)
│   ├── (admin)/        # Authenticated admin panel (RBAC enforced)
│   ├── (auth)/         # Login, password reset
│   ├── (public)/       # CMS public pages
│   ├── (siswa)/        # Student/parent portal
│   ├── api/            # REST API routes (JSON, CSRF, rate-limit aware)
│   └── cbt/            # CBT runtime UI
├── modules/            # Domain modules (auth, rbac, ppdb, cbt, cms, payment, notification)
│   └── <domain>/
│       ├── components/ # UI components specific to the domain
│       ├── service.ts  # Business logic (pure / IO-aware)
│       └── repository  # Repository pattern over Prisma (where useful)
├── shared/             # Cross-cutting concerns
│   ├── config/env.ts   # Validated env (zod)
│   ├── db/prisma.ts    # Prisma singleton + driver adapter
│   ├── cache/          # Redis client
│   ├── queue/          # BullMQ producer + worker
│   ├── security/       # captcha, csrf, headers, passwords, rate-limit, sanitize, signed-url, upload
│   └── logger/         # pino (JSON logs, redaction)
├── components/ui/      # Generic UI primitives (button, card, input, label)
└── middleware.ts       # Edge middleware (security headers, route guard hints)
```

## 4. Stack Teknologi

| Layer       | Tooling                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Runtime     | Node.js **22.12.0+**                                                                              |
| Framework   | **Next.js 15** (App Router, React 19, standalone build, Edge middleware)                          |
| Bahasa      | TypeScript 5.x (`strict` + `noUncheckedIndexedAccess` + `noImplicitAny`)                          |
| ORM         | **Prisma 7.8** + driver adapter `@prisma/adapter-mariadb`                                         |
| Database    | **MariaDB 11** (utama) — kompatibel ke Postgres/Oracle/MSSQL via swap provider Prisma             |
| Cache/Queue | **Redis 7** (ioredis) + **BullMQ 5**                                                              |
| Auth        | **iron-session** (cookie session) + **jose** (JWT API), **argon2id** untuk hash password          |
| UI          | TailwindCSS 3, shadcn/ui base, Radix primitives, lucide icons, dark/light theme via `next-themes` |
| Validasi    | **zod**                                                                                           |
| Sanitisasi  | DOMPurify (isomorphic-dompurify)                                                                  |
| Mail        | nodemailer                                                                                        |
| Payment     | Midtrans (server-key + webhook signature) — driver siap, key opsional                             |
| Logging     | pino (JSON) + pino-pretty (dev)                                                                   |
| Testing     | Vitest (unit + integration), Playwright config (E2E), Lighthouse CI siap diaktifkan               |
| CI          | GitHub Actions (`ci.yml`, `codeql.yml`)                                                           |
| Container   | Multi-stage Dockerfile + docker-compose (app, worker, mariadb, redis, nginx)                      |

## 5. Persyaratan Server

### Minimum (sekolah kecil, < 500 user)

- 1 vCPU, **2 GB RAM**, 20 GB SSD
- MariaDB 11 / MySQL 8
- Redis 7
- Nginx 1.24+ atau Traefik 3+
- TLS dari Let's Encrypt

### Direkomendasikan (sekolah besar / multi-cabang)

- 2–4 vCPU, **4–8 GB RAM**, 50 GB SSD
- MariaDB / Postgres dengan **read-replica** (set `DATABASE_READ_URL`)
- Redis Sentinel / Cluster
- CDN di depan Nginx (Cloudflare / BunnyCDN) untuk asset statis
- Object storage S3-compatible (Wasabi / Cloudflare R2 / MinIO) untuk lampiran

### Browser yang Didukung

- Chromium ≥ 120, Firefox ≥ 115, Safari ≥ 16, Edge ≥ 120
- Service worker memerlukan HTTPS di produksi.

## 6. Instalasi (Pengembangan)

```bash
# 1. Clone
git clone https://github.com/termakaniklan/siakad.git
cd siakad

# 2. Install Node.js 22.x (via Volta / nvm) lalu:
npm ci

# 3. Salin .env contoh
cp .env.example .env

# 4. Jalankan MariaDB & Redis (paling mudah lewat Docker)
docker run -d --name siakad-db   -e MARIADB_ROOT_PASSWORD=rootpw \
  -e MARIADB_DATABASE=siakad -e MARIADB_USER=siakad -e MARIADB_PASSWORD=siakad \
  -p 3306:3306 mariadb:11
docker run -d --name siakad-redis -p 6379:6379 redis:7-alpine

# 5. Generate Prisma client + migrasi awal
npm run prisma:generate
npm run prisma:migrate -- --name init

# 6. Seed data awal (super admin, role/permission, sample school, wilayah sample)
npm run db:seed

# 7. Jalankan dev server
npm run dev    # → http://localhost:3000

# 8. (Opsional) Worker BullMQ di terminal terpisah
npm run queue:worker
```

**Akun super admin default** (dari seeder): `superadmin / SuperAdmin123!`
**Wajib diganti pada login pertama (paksa via flag `mustChangePassword`)**.

## 7. Instalasi Produksi (Docker)

```bash
# Build + jalankan stack lengkap (app, worker, mariadb, redis, nginx)
cp .env.example .env
# Edit .env: ganti SEMUA secret, set APP_URL, DATABASE_URL, REDIS_URL, MAIL_*

docker compose build
docker compose up -d

# Migrasi pertama kali
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts

# Buka https://your-domain (Nginx menerminasi TLS — sediakan cert di deploy/nginx/certs)
```

Layanan yang berjalan:

| Service   | Port (host) | Catatan                                                 |
| --------- | ----------- | ------------------------------------------------------- |
| `nginx`   | 80, 443     | Reverse proxy + TLS + rate-limit + security headers     |
| `app`     | 3000        | Next.js standalone (langsung diakses kalau tanpa Nginx) |
| `worker`  | —           | BullMQ consumer untuk notif & job latar                 |
| `mariadb` | 3306        | Data persistent volume `mariadb_data`                   |
| `redis`   | 6379        | Persistent volume `redis_data`                          |

Lihat `docker-compose.yml`, `Dockerfile`, dan `deploy/nginx/` untuk konfigurasi rinci.

## 8. Konfigurasi `.env`

Semua variabel **divalidasi** oleh `src/shared/config/env.ts` (zod schema). Aplikasi
gagal start kalau ada nilai wajib yang kosong. Daftar lengkap dengan default:

| Variabel                       | Wajib | Default                      | Keterangan                                           |
| ------------------------------ | :---: | ---------------------------- | ---------------------------------------------------- |
| `NODE_ENV`                     |   ✔   | `development`                | `development` / `test` / `production`                |
| `APP_URL`                      |   ✔   | `http://localhost:3000`      | URL canonical (untuk OAuth, email, push)             |
| `APP_NAME`                     |       | `SIAKAD Sekolah Indonesia`   | Nama tampil di UI                                    |
| `APP_TIMEZONE`                 |       | `Asia/Jakarta`               | Zona waktu default                                   |
| `DATABASE_URL`                 |   ✔   | —                            | Connection string MariaDB / MySQL                    |
| `DATABASE_READ_URL`            |       | —                            | Read-replica (opsional)                              |
| `AUTH_SESSION_SECRET`          |   ✔   | —                            | ≥ 32 byte base64 (`openssl rand -base64 48`)         |
| `AUTH_JWT_SECRET`              |   ✔   | —                            | Beda dari session secret                             |
| `AUTH_SESSION_TTL_HOURS`       |       | `8`                          | TTL cookie sesi                                      |
| `AUTH_REMEMBER_ME_TTL_DAYS`    |       | `30`                         | TTL "ingat saya"                                     |
| `CAPTCHA_TTL_SECONDS`          |       | `180`                        | Masa berlaku captcha                                 |
| `CAPTCHA_HMAC_SECRET`          |   ✔   | —                            | HMAC penanda token captcha                           |
| `REDIS_URL`                    |   ✔   | `redis://localhost:6379/0`   | Cache + queue + rate-limit                           |
| `STORAGE_DRIVER`               |       | `local`                      | `local` / `s3`                                       |
| `STORAGE_LOCAL_DIR`            |       | `./storage`                  | Direktori unggahan lokal                             |
| `S3_*`                         |       | —                            | Endpoint, bucket, kunci akses                        |
| `MAIL_HOST` / `MAIL_PORT` / …  |       | —                            | SMTP server                                          |
| `WA_PROVIDER`                  |       | `disabled`                   | `disabled` / `twilio` / `meta` / `fonnte` / `custom` |
| `PAYMENT_PROVIDER`             |       | `disabled`                   | `disabled` / `midtrans`                              |
| `MIDTRANS_SERVER_KEY` / `*KEY` |       | —                            | Kunci Midtrans                                       |
| `RATE_LIMIT_LOGIN_PER_MINUTE`  |       | `5`                          | Per (IP × identifier) per menit                      |
| `RATE_LIMIT_API_PER_MINUTE`    |       | `120`                        | Per user                                             |
| `FEATURE_MFA_TOTP`             |       | `false`                      | Aktifkan TOTP 2FA (admin/guru)                       |
| `FEATURE_PUSH_NOTIFICATIONS`   |       | `true`                       | Service worker push                                  |
| `FEATURE_PWA`                  |       | `true`                       | Manifest + service worker                            |
| `LOG_LEVEL`                    |       | `info`                       | Pino level                                           |
| `PINO_PRETTY`                  |       | `true` (dev), `false` (prod) | Pretty printer                                       |

Salinan `.env.example` selalu sinkron — gunakan sebagai referensi otoritatif.

## 9. Migrasi & Seeder Database

```bash
# Migrasi pengembangan
npm run prisma:migrate            # menjalankan prisma migrate dev
# Migrasi produksi (idempotent)
npm run prisma:deploy

# Seeder baseline (RBAC, super-admin, sample wilayah)
npm run db:seed

# Seeder demo lengkap (60+ entitas; idempotent)
npm run db:seed-demo
```

Seeder baseline (`prisma/seed.ts`) memastikan:

1. Seluruh **permission** dari katalog `src/modules/rbac/permissions.ts`.
2. **Role default** (`super_admin`, `admin`, `kepala_sekolah`, `guru`, `wali_kelas`,
   `siswa`, `orang_tua`) dengan ikatan permission.
3. **Super admin** awal (email `admin@siakad.local`), wajib ganti password.
4. **Sample school**, **menu publik**, **setting global**, dan **sample wilayah**
   (Provinsi DKI Jakarta + sebagian kabupaten/kecamatan/kelurahan).

Seeder demo (`prisma/seed-demo.ts`) — _idempotent_, aman dijalankan ulang —
mengisi puluhan dummy data agar UI terlihat hidup untuk demo / dokumentasi:

| Entitas | Jumlah | Catatan |
|---|---|---|
| **Berita** | 30 | publikasi 30 hari ke belakang |
| **Galeri** | 24 | gambar yang di-generate AI (Pollinations) |
| **Pengumuman** | 4 | 1 pinned banner + 3 pengumuman |
| **Mata Pelajaran** | 12 | MTK, BIN, BIG, FIS, KIM, BIO, EKO, SOS, SEJ, INF, PJOK, PAI |
| **Guru** | 18 | 6 di antaranya menjadi wali kelas |
| **Kelas** | 6 | X IPA-1, X IPS-1, XI IPA-1, XI IPS-1, XII IPA-1, XII IPS-1 |
| **Siswa** | 120 | 20 / kelas, NIS `2025xxxx` |
| **Jadwal** | 12 | 2 jadwal per kelas (Senin & Rabu) |
| **Absensi** | ~1.680 | 14 hari × 120 siswa, status pseudo-random deterministik |
| **Ujian CBT** | 5 | masing-masing 10 soal pilihan ganda |
| **Pendaftar PPDB** | 6 | berbagai status (`submitted`, `verified`, dst.) |

Akun demo:

| Role | Username | Password |
|---|---|---|
| Super Admin | `superadmin` | `ChangeMe!2026` |
| Siswa (mis. siswa001) | `siswa001` | `Siswa!2026` |
| Guru (mis. guru01) | `guru01` | `Guru!2026` |

Untuk gambar AI di galeri / hero / login background, jalankan:

```bash
python3 scripts/generate-images.py     # gratis, tanpa API key (Pollinations.ai)
```

Skrip akan menulis ke `public/img/{hero,gallery,news}/`. Apabila proses dilewati,
seeder akan menggunakan placeholder URL agar UI tetap utuh.

Untuk dataset wilayah penuh (38 provinsi, ribuan kelurahan), gunakan dump publik
seperti [emsifa/api-wilayah-indonesia](https://github.com/emsifa/api-wilayah-indonesia)
dan jalankan importer custom — schema kami sudah kompatibel.

## 10. Skema Database (ERD Ringkas)

```
User ─┬─ Role (M2M) ─┬─ Permission (M2M)
      │
      ├─ UserSession (1:N)        ─ trace login & logout
      ├─ LoginAttempt (1:N)       ─ untuk brute-force protection
      ├─ AuditLog (1:N as actor)  ─ semua aksi sensitif
      ├─ NotificationOutbox (1:N)
      └─ Student (1:1 optional)   ─ data identitas siswa

AcademicYear ─┬─ Class (1:N) ─┬─ Enrollment (1:N) → Student
              │               └─ Schedule (1:N) → Subject + Teacher
              ├─ Subject (1:N)
              └─ Exam (1:N) ─┬─ Question (1:N) ─┬─ Choice (1:N)
                              └─ ExamAttempt (1:N) ─┬─ ExamAnswer (1:N)
                                                    └─ proctor counters

PpdbApplication ─ optional → Student (jika diterima)

Province → Regency → District → Village  (cascading wilayah)

Announcement / News / Page / GalleryItem / Setting / MenuItem  (CMS)

PaymentTransaction (Midtrans) ─ trace per invoice
```

Skema lengkap di [`prisma/schema.prisma`](prisma/schema.prisma) (≈100 model).

Konvensi:

- **UUID string ID** (mudah diporting antar DB).
- **Soft-delete** (`deletedAt: DateTime?`) di entitas master.
- `createdAt` / `updatedAt` di setiap model.
- Index eksplisit di kolom join, slug, status, dan timestamp.
- Tidak menggunakan tipe vendor-specific (TINYINT/JSON khusus MySQL) — gunakan
  `String`, `Boolean`, `Json` Prisma yang netral.

## 11. Hak Akses & Role (RBAC)

Aplikasi memakai **RBAC + permission catalog** terpusat di
[`src/modules/rbac/permissions.ts`](src/modules/rbac/permissions.ts) sehingga setiap
permission punya kode tunggal (mis. `user.manage`, `grade.input`, `cbt.run`).

### Role Default

| Code             | Cakupan                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `super_admin`    | Seluruh permission. Hanya 1 akun, dilindungi seeder.                                       |
| `admin`          | Semua permission kecuali `permission.manage` & `backup.manage`.                            |
| `kepala_sekolah` | Lihat semua data akademik & laporan; tidak mengubah data master sistem.                    |
| `guru`           | Input nilai/kehadiran/materi, kelola soal & ujian yang dibuatnya, lihat siswa di kelasnya. |
| `wali_kelas`     | `guru` + akses penuh ke kelas perwaliannya, rekap kehadiran & nilai.                       |
| `siswa`          | Lihat jadwal, nilai, materi, ujian aktif, kehadiran milik sendiri.                         |
| `orang_tua`      | Lihat data anak yang ditautkan + pengumuman.                                               |

Helper di code:

```ts
import { hasAnyPermission, authorize } from '@/modules/rbac/policy';
import { getPrincipal } from '@/modules/auth/principal';

const principal = await getPrincipal();
authorize(principal, PERMISSIONS.GRADE_INPUT); // melempar 403 kalau tidak berwenang
```

## 12. Keamanan & Hardening

Defense-in-depth diterapkan pada **edge**, **app**, **DB**, dan **operasional**.

### 12.1 Autentikasi

- **Argon2id** untuk hash password (memory-hard, tahan GPU).
- **Captcha** (kombinasi math + alfanumerik 10 karakter) — mandatory pada form login & PPDB.
- **Rate limiting**: `5 percobaan/menit/identifier` + `20 percobaan/menit/IP` (Redis-backed).
- **Brute-force protection**: lockout sementara setelah ambang yang dikonfigurasi.
- **MFA TOTP** (opsional, flag `FEATURE_MFA_TOTP`).
- **Session hybrid**: cookie iron-session (httpOnly, secure, sameSite=lax) + JWT API.
- **Audit log** tiap aksi sensitif (login, logout, perubahan role, ekspor data).

### 12.2 Header & Transport

- CSP ketat (`script-src 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`).
- HSTS (`max-age=63072000; includeSubDomains; preload`).
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`.
- Cookie `Secure; HttpOnly; SameSite=Lax`.
- TLS 1.2+ saja (Nginx config).

### 12.3 Input / Output

- Semua input divalidasi via **zod** (struktur + jenis + batas).
- HTML rich-text disanitasi via DOMPurify (`src/shared/security/sanitize.ts`).
- File upload: validasi MIME, ekstensi, magic-byte, ukuran maks, dan virus-scan
  hook (`src/shared/security/upload.ts`).
- CSRF token util untuk form non-API (`src/shared/security/csrf.ts`).

### 12.4 Penyimpanan Data

- Password tidak pernah dilog (pino redact list).
- Token / session secret hanya dari `.env` (lihat `src/shared/config/env.ts`).
- File tersimpan di luar webroot saat `STORAGE_DRIVER=local`; akses via signed URL.
- Backup terenkripsi (lihat §14).

### 12.5 Checklist Pre-Production

- [ ] Ganti `AUTH_SESSION_SECRET` & `AUTH_JWT_SECRET` (≥ 48 byte base64).
- [ ] Ganti default password super admin pada login pertama.
- [ ] Aktifkan TLS (Let's Encrypt) di Nginx.
- [ ] Atur `Content-Security-Policy` non-`unsafe-inline` saat memasang nonce
      (helper sudah disiapkan di `src/middleware.ts`).
- [ ] Pastikan `Cache-Control: no-store` untuk respon yang berisi PII.
- [ ] Audit log dialirkan ke SIEM eksternal (Loki / ELK).
- [ ] Backup harian + restore drill bulanan (lihat §14).

## 13. Multi-Database

Skema dirancang **portabel** ke MariaDB, MySQL, PostgreSQL, Oracle, dan MSSQL:

1. Hindari `@db.TinyInt`, `@db.Json` MySQL-only — gunakan `Boolean` & `Json` umum.
2. Tidak memakai stored procedure / trigger; semua logic di aplikasi.
3. Tidak memakai `AUTO_INCREMENT` — primary key UUID via `cuid()`/`uuid()`.
4. ID FK selalu eksplisit dengan index manual.

Untuk migrasi:

```bash
# PostgreSQL
# 1. Ubah prisma/schema.prisma datasource.provider menjadi "postgresql"
# 2. Update DATABASE_URL → postgresql://user:pass@host:5432/db
# 3. Pasang adapter:    npm i @prisma/adapter-pg pg
# 4. Update src/shared/db/prisma.ts → gunakan PrismaPg adapter
# 5. npx prisma migrate dev
```

Contoh adapter swap ada pada komentar di `src/shared/db/prisma.ts`. MSSQL & Oracle
mengikuti pola serupa — gunakan adapter resmi Prisma yang relevan.

## 14. Backup & Restore

```bash
# Backup MariaDB (logical, terkompres + terenkripsi)
docker compose exec mariadb mariadb-dump -u root -p"$DB_ROOT_PASSWORD" --single-transaction --routines siakad \
  | gzip | openssl enc -aes-256-cbc -salt -pbkdf2 -out siakad-$(date +%F).sql.gz.enc

# Restore
openssl enc -d -aes-256-cbc -pbkdf2 -in siakad-2025-01-01.sql.gz.enc \
  | gunzip | docker compose exec -T mariadb mariadb -u root -p"$DB_ROOT_PASSWORD" siakad

# Backup file uploads (jika STORAGE_DRIVER=local)
tar -czf storage-$(date +%F).tar.gz storage/
```

Atur cron / systemd timer harian; rotasi backup minimal 30 hari, lakukan **restore
drill** ke environment staging tiap bulan.

## 15. CI/CD, Pengujian, & Observability

### CI

GitHub Actions workflow tersedia di:

- `.github/workflows/ci.yml` — `format:check`, `lint`, `typecheck`, `test`, `build`.
- `.github/workflows/codeql.yml` — analisis statis JS/TS keamanan.

Jalankan lokal sebelum push:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

### Testing

| Lapis      | Tooling                                      | Lokasi                                                       |
| ---------- | -------------------------------------------- | ------------------------------------------------------------ |
| Unit       | Vitest                                       | `tests/*.test.ts` + `src/**/*.test.ts`                       |
| Integrasi  | Vitest + sqlite/in-memory adapter (opsional) | siapkan di `tests/integration`                               |
| E2E        | Playwright                                   | siapkan di `tests/e2e` (folder dapat dibuat saat dibutuhkan) |
| Lighthouse | `lhci`                                       | siapkan workflow tambahan saat go-live                       |

```bash
npm test            # one-shot
npm run test:watch  # watch mode
```

### Observability

- Log JSON via **pino** (key sensitif diredact otomatis).
- Healthcheck: `GET /api/health` mengembalikan status DB + Redis.
- Metrics Prometheus dapat ditambahkan via library `prom-client` (slot disediakan
  di `src/shared/logger`).

## 16. Troubleshooting & FAQ

### "Validation failed for env" saat start

Variabel wajib (`AUTH_SESSION_SECRET`, `AUTH_JWT_SECRET`, `DATABASE_URL`,
`REDIS_URL`, `CAPTCHA_HMAC_SECRET`) belum di-set / terlalu pendek. Lihat §8.

### "Prisma datasource property url is no longer supported"

Anda menjalankan Prisma 7. URL dipindah ke `prisma.config.ts` (sudah disiapkan di
repo). Pastikan `DATABASE_URL` ada di `.env` saat menjalankan migrasi.

### Login gagal terus walau password benar

- Periksa `AUTH_SESSION_SECRET` (cookie tidak akan tervalidasi kalau secret berubah).
- Periksa rate limit di Redis (kunci `rl:login:*`); reset dengan `redis-cli FLUSHDB`
  pada **redis dev**.
- Pastikan jam server akurat (NTP) — JWT punya `iat` dan akan ditolak kalau drift > 60s.

### CBT auto-submit padahal saya tidak pindah tab

Tab-switch terhitung saat fokus berpindah (alert OS, ekstensi popup). Atur
`maxTabSwitches` lebih longgar pada konfigurasi ujian, atau matikan
`fullscreenRequired` untuk ujian non-formal.

### Service worker tidak update setelah deploy

`public/sw.js` di-cache 0 detik, tapi browser tetap menunggu reload pertama. Klik
"Reload" dua kali atau buka `chrome://serviceworker-internals` → Update.

### FAQ

- **Q:** Bisakah menjalankan tanpa Redis?
  **A:** Tidak disarankan — rate limit, captcha throttle, dan queue
  bergantung pada Redis. Untuk dev, gunakan `redis:7-alpine` lewat Docker.
- **Q:** Bagaimana mendaftarkan VAPID untuk push notif?
  **A:** Generate key (`npx web-push generate-vapid-keys`), simpan ke `.env`, lalu
  daftarkan endpoint di service worker (slot tersedia).
- **Q:** Apakah aman dipakai di sekolah negeri?
  **A:** Ya — desain mengikuti UU PDP (data minimization, audit log, hak akses
  granular). Tetap lakukan audit hukum lokal sebelum go-live.

## 17. Lisensi & Kontribusi

- **Lisensi**: MIT (lihat [`LICENSE`](LICENSE)).
- **Code style**: Prettier + ESLint (next/core-web-vitals).
  Jalankan `npm run format` sebelum commit.
- **Commit**: gunakan [Conventional Commits](https://www.conventionalcommits.org/).
- **Pull request**: jelaskan _why_ (bukan hanya _what_), lampirkan screenshot UI,
  dan pastikan CI hijau.

Issue & PR sangat diterima — terutama untuk:

- Importer wilayah Indonesia lengkap (38 provinsi, ribuan kelurahan).
- Driver WhatsApp tambahan (Wablas, Wapanels, Wati, dll).
- Tema CMS publik (multi-template) dan _block editor_ MDX.
- Adaptasi Madrasah / Pesantren (kurikulum + jenjang khusus).

Selamat membangun ekosistem akademik yang aman, modern, dan mudah dipakai —
**Selamat datang di SIAKAD!** 🎓
