# SIAKAD — Sistem Informasi Akademik Sekolah (PWA)

<!-- Tech stack & versi terpasang. Versi diambil dari `package.json`, `docker-compose.yml`, dan field `engines`. -->

**Runtime & framework**

[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A520.10-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=000)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-manifest%20%2B%20SW-5A0FC8?logo=pwa&logoColor=white)](public/manifest.webmanifest)

**Data & cache**

[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![MariaDB](https://img.shields.io/badge/MariaDB-11-003545?logo=mariadb&logoColor=white)](https://mariadb.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-E0234E?logo=bull&logoColor=white)](https://docs.bullmq.io)
[![ioredis](https://img.shields.io/badge/ioredis-5-DC382D?logo=redis&logoColor=white)](https://github.com/redis/ioredis)

**UI & styling**

[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-base-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![Lucide](https://img.shields.io/badge/Lucide-0.453-F56565?logo=lucide&logoColor=white)](https://lucide.dev)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38?logo=react&logoColor=white)](https://zustand-demo.pmnd.rs)

**Auth & security**

[![Argon2id](https://img.shields.io/badge/Argon2id-hash-3C3C3D?logo=keepassxc&logoColor=white)](https://github.com/ranisalt/node-argon2)
[![iron-session](https://img.shields.io/badge/iron--session-8-2E2E2E?logo=auth0&logoColor=white)](https://github.com/vvo/iron-session)
[![JOSE / JWT](https://img.shields.io/badge/JOSE%20JWT-5-D63AFF?logo=jsonwebtokens&logoColor=white)](https://github.com/panva/jose)
[![Zod](https://img.shields.io/badge/Zod-3-3E67B1?logo=zod&logoColor=white)](https://zod.dev)
[![DOMPurify](https://img.shields.io/badge/DOMPurify-3-1F8A70?logo=cure53&logoColor=white)](https://github.com/cure53/DOMPurify)

**Notifikasi & worker**

[![Nodemailer](https://img.shields.io/badge/Nodemailer-6-22B573?logo=minutemailer&logoColor=white)](https://nodemailer.com)
[![Pino](https://img.shields.io/badge/Pino-9-687634?logo=pino&logoColor=white)](https://getpino.io)

**Tooling, CI & infra**

[![Vitest](https://img.shields.io/badge/Vitest-2-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=000)](https://prettier.io)
[![Docker](https://img.shields.io/badge/Docker-multistage-2496ED?logo=docker&logoColor=white)](Dockerfile)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-app%20%2B%20worker%20%2B%20db%20%2B%20redis%20%2B%20nginx-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Nginx](https://img.shields.io/badge/Nginx-1.27-009639?logo=nginx&logoColor=white)](deploy/nginx/nginx.conf)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%20%2B%20CodeQL-2088FF?logo=githubactions&logoColor=white)](.github/workflows)

**Status repo**

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
7. [Instalasi Produksi (Baremetal &amp; Docker)](#7-instalasi-produksi-baremetal--docker)
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

|                      Hero & Navbar                      |                        Galeri & Fitur                         |
| :-----------------------------------------------------: | :-----------------------------------------------------------: |
| ![Homepage Hero](docs/screenshots/01-homepage-hero.png) | ![Homepage Gallery](docs/screenshots/02-homepage-gallery.png) |

### Halaman Login

|  Login dengan captcha & background AI   |
| :-------------------------------------: |
| ![Login](docs/screenshots/03-login.png) |

### CBT / Ujian Online

|           Lobby — Daftar Ujian Aktif            |            Soal — Navigasi & Timer            |
| :---------------------------------------------: | :-------------------------------------------: |
| ![CBT Lobby](docs/screenshots/04-cbt-lobby.png) | ![CBT Soal](docs/screenshots/05-cbt-soal.png) |

### Kehadiran / Absensi

|      Rekap Admin (harian, tren 7 hari, per kelas)       |           Riwayat Siswa (progress bar, tabel)           |
| :-----------------------------------------------------: | :-----------------------------------------------------: |
| ![Absensi Admin](docs/screenshots/06-absensi-admin.png) | ![Absensi Siswa](docs/screenshots/07-absensi-siswa.png) |

### Portal Orang Tua / Wali

> Login sebagai `ortu001 / OrangTua!2026` (akun demo dibuat otomatis oleh
> `npm run db:seed-demo`, satu akun orang tua per siswa, total 120 akun).

|        Dashboard — anak, kehadiran 14 hari, ujian mendatang        |                          Ujian & Pengumuman                          |
| :----------------------------------------------------------------: | :------------------------------------------------------------------: |
| ![Orang Tua Dashboard](docs/screenshots/08-orangtua-dashboard.png) | ![Orang Tua Pengumuman](docs/screenshots/09-orangtua-pengumuman.png) |

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
- **Navigasi otomatis di-filter RBAC**: setiap item menu di sidebar diuji terhadap
  `principal.roleCodes` & `principal.permissionCodes` sebelum dirender.
  Item yang tersembunyi tetap diblokir di sisi server (layout guard + permission
  check) sehingga manipulasi DOM tidak membuka rute terlarang.
- **Post-login redirect by role**: super_admin/admin/operator → `/admin`,
  guru/wali_kelas → `/guru`, siswa → `/siswa`, orang_tua → `/orangtua`.

### 2.6 Profil & Branding

- **Profil pengguna** (`/akun/profil`): semua role dapat mengubah foto profil,
  nama lengkap, telepon, dan password sendiri. Foto disimpan ke
  `public/uploads/avatars/<uuid>.<ext>` setelah lolos validasi **magic-byte**
  (PNG/JPG/WebP/GIF), batas **2 MB**, dengan rate-limit 5 upload/menit/user.
  Ganti password mewajibkan password lama, ditambah otomatis mengakhiri seluruh
  sesi pengguna lain.
- **Reset password** (`/reset-password`): tautan "Lupa password?" tersedia di
  form login. Token ditandatangani HMAC, berlaku 15 menit, single-use; respons
  selalu generik untuk mencegah enumerasi akun. Konfirmasi token mengakhiri
  semua sesi aktif user tersebut.
- **Branding admin** (`/admin/sistem/branding`): admin/super_admin dapat
  mengubah favicon, background login, logo, judul situs, dan warna utama.
  Favicon & background otomatis dirender di `app/layout.tsx` (metadata) dan
  halaman login (`<img>` background). Setiap perubahan masuk ke `AuditLog`.

### 2.7 Notifikasi

- Email (SMTP, Nodemailer) dengan template HTML.
- WhatsApp (driver Twilio / Meta Cloud API / Fonnte / custom).
- Web Push (Service Worker + VAPID — placeholder VAPID key disediakan).
- Antrian latar via **BullMQ** (redis-backed) dengan retry + DLQ.

### 2.8 PWA

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

### 4.1 Ringkasan

| Layer       | Tooling                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| Runtime     | Node.js **22.12.0+** (`engines.node >= 20.10`)                                           |
| Framework   | **Next.js 15** (App Router, React 19, Server Actions, standalone build, Edge middleware) |
| Bahasa      | **TypeScript 5.6** (`strict` + `noUncheckedIndexedAccess` + `noImplicitAny`)             |
| ORM         | **Prisma 7.8** + driver adapter `@prisma/adapter-mariadb`                                |
| Database    | **MariaDB 11** (utama) — kompatibel ke Postgres/Oracle/MSSQL via swap provider Prisma    |
| Cache/Queue | **Redis 7** (ioredis) + **BullMQ 5**                                                     |
| Auth        | **iron-session** (cookie session) + **jose** (JWT API), **argon2id** untuk hash password |
| UI          | TailwindCSS 3, shadcn/ui base, Radix primitives, lucide-react ikon, dark/light theme     |
| Validasi    | **zod**                                                                                  |
| Sanitisasi  | DOMPurify (isomorphic-dompurify) — anti-XSS untuk konten kaya CMS                        |
| Mail        | nodemailer (SMTP)                                                                        |
| Payment     | Midtrans (server-key + webhook signature) — driver siap, key opsional                    |
| Logging     | pino (JSON) + pino-pretty (dev)                                                          |
| State       | TanStack Query 5 (server cache) + Zustand 5 (UI state)                                   |
| Testing     | Vitest (unit + integration), Playwright config (E2E), Lighthouse CI siap diaktifkan      |
| CI          | GitHub Actions (`ci.yml`, `codeql.yml`)                                                  |
| Container   | Multi-stage Dockerfile + docker-compose (app, worker, mariadb, redis, nginx)             |

### 4.2 Dependencies (Aplikasi)

Semua versi mengacu pada `package.json` di repo ini.

#### Web framework & UI

| Paket                                    | Versi    | Fungsi                                                          |
| ---------------------------------------- | -------- | --------------------------------------------------------------- |
| `next`                                   | ^15.5.0  | Framework full-stack (App Router, RSC, Server Actions, Edge MW) |
| `react`, `react-dom`                     | ^19.0.0  | UI runtime                                                      |
| `tailwindcss`, `autoprefixer`, `postcss` | ^3.4.14  | Utility-first styling                                           |
| `tailwind-merge`                         | ^2.5.4   | Resolusi konflik class Tailwind                                 |
| `class-variance-authority`               | ^0.7.0   | Varian komponen (button, badge, dsb.)                           |
| `clsx`                                   | ^2.1.1   | Komposisi className kondisional                                 |
| `lucide-react`                           | ^0.453.0 | Ikon SVG terstandar                                             |
| `prettier-plugin-tailwindcss`            | ^0.6.8   | Auto-sort kelas Tailwind                                        |

#### State, data fetching, validasi

| Paket                   | Versi   | Fungsi                                            |
| ----------------------- | ------- | ------------------------------------------------- |
| `@tanstack/react-query` | ^5.59.0 | Cache server-side untuk client components         |
| `zustand`               | ^5.0.0  | UI state ringan (sidebar, drawer, dsb.)           |
| `zod`                   | ^3.23.8 | Validasi runtime untuk semua API + form           |
| `uuid` + `@types/uuid`  | ^10.0.0 | Generator ID portable (untuk file storage / dsb.) |

#### Database, queue, cache

| Paket                      | Versi   | Fungsi                                           |
| -------------------------- | ------- | ------------------------------------------------ |
| `@prisma/client`, `prisma` | 7.8.0   | ORM type-safe + migrasi                          |
| `@prisma/adapter-mariadb`  | 7.8.0   | Adapter native untuk MariaDB                     |
| `mariadb`                  | ^3.4.0  | Driver MariaDB (di-wrap oleh adapter Prisma)     |
| `ioredis`                  | ^5.4.1  | Redis client (rate-limit + cache + queue)        |
| `bullmq`                   | ^5.21.0 | Queue worker (notifikasi email/WA, ekspor, dsb.) |

#### Keamanan & autentikasi

| Paket                                                   | Versi   | Fungsi                                                           |
| ------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `argon2`                                                | ^0.41.1 | Hash password Argon2id (parameter OWASP 2024)                    |
| `iron-session`                                          | ^8.0.4  | Cookie session terenkripsi (AEAD), HTTP-only, SameSite=Lax       |
| `jose`                                                  | ^5.9.4  | JWT (HS256) untuk akses API + signed token reset password (HMAC) |
| `dompurify`, `isomorphic-dompurify`, `@types/dompurify` | ^3.x    | Sanitasi HTML CMS (anti-XSS, anti-tag berbahaya)                 |

#### Notifikasi

| Paket                             | Versi   | Fungsi                                   |
| --------------------------------- | ------- | ---------------------------------------- |
| `nodemailer`, `@types/nodemailer` | ^6.9.15 | Driver email (SMTP / mailtrap / Mailpit) |

#### Logging

| Paket         | Versi   | Fungsi                                  |
| ------------- | ------- | --------------------------------------- |
| `pino`        | ^9.4.0  | Structured logging (JSON, low overhead) |
| `pino-pretty` | ^11.2.2 | Pretty print untuk development          |

### 4.3 DevDependencies

| Paket                              | Versi   | Fungsi                                          |
| ---------------------------------- | ------- | ----------------------------------------------- |
| `typescript`                       | ^5.6.3  | Type-checker (`tsc --noEmit`)                   |
| `@types/node`                      | ^22.7.5 | Tipe Node.js                                    |
| `@types/react`, `@types/react-dom` | ^19.0.0 | Tipe React 19                                   |
| `eslint`, `eslint-config-next`     | ^9.13.0 | Linter (Next.js + TypeScript-aware)             |
| `prettier`                         | ^3.3.3  | Formatter kode + Markdown                       |
| `tsx`                              | ^4.19.1 | Eksekusi TypeScript untuk seeder & queue worker |
| `vitest`                           | ^2.1.3  | Unit & integration tests (jsdom + node env)     |

### 4.4 Infrastruktur (di luar npm)

| Komponen       | Versi             | Catatan                                                                      |
| -------------- | ----------------- | ---------------------------------------------------------------------------- |
| Node.js        | ≥ 20.10 (rec. 22) | Runtime aplikasi & worker; mode utama = baremetal/monolith                   |
| MariaDB        | 11.4              | Database utama (port 3306 baik di baremetal maupun docker-compose)           |
| Redis          | 7                 | Cache + queue + rate-limit (port 6379)                                       |
| Nginx          | 1.24+             | Reverse proxy + TLS termination + rate-limit zone (opsional di pengembangan) |
| Docker         | ≥ 24              | **Opsional**, hanya untuk jalur Docker Compose (§7.2)                        |
| docker-compose | v2 plugin         | **Opsional**, hanya untuk jalur Docker Compose (§7.2)                        |

### 4.5 GitHub Actions / CI

| Workflow                       | Pipeline                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`     | install → `prisma generate` → `format:check` → `lint` → `typecheck` → `vitest run` → `next build` |
| `.github/workflows/codeql.yml` | CodeQL static analysis (JavaScript/TypeScript)                                                    |

### 4.6 Skrip npm

| Skrip                                                                          | Tujuan                                                                               |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `npm run dev`                                                                  | Mode development (hot reload)                                                        |
| `npm run build`                                                                | Build produksi (standalone)                                                          |
| `npm run start`                                                                | Jalankan build produksi                                                              |
| `npm run lint`                                                                 | ESLint                                                                               |
| `npm run typecheck`                                                            | `tsc --noEmit`                                                                       |
| `npm run test`                                                                 | Vitest run                                                                           |
| `npm run format`                                                               | Prettier write                                                                       |
| `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:deploy` | Tools Prisma                                                                         |
| `npm run db:seed`                                                              | Seed minimal (RBAC + akun super admin)                                               |
| `npm run db:seed-demo`                                                         | Seed minimal **+** dummy demo (siswa, guru, kelas, ujian, berita, galeri, orang tua) |
| `npm run queue:worker`                                                         | Worker BullMQ untuk notifikasi & job background                                      |

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

SIAKAD dijalankan sebagai **monolith baremetal** — semua komponen (Node, MariaDB,
Redis) berjalan langsung di OS host tanpa Docker. Jalur Docker Compose dijelaskan
terpisah di §7.2.

### 6.1 Prasyarat

| Komponen | Versi minimum     | Cara cek                                    |
| -------- | ----------------- | ------------------------------------------- |
| Node.js  | 20.10 (rek. 22.x) | `node -v`                                   |
| npm      | 10.x              | `npm -v`                                    |
| MariaDB  | 11.x              | `mariadbd --version` atau `mysql --version` |
| Redis    | 7.x               | `redis-server --version`                    |
| git      | 2.40+             | `git --version`                             |

> **Tips Node**: pasang via [Volta](https://volta.sh) (`volta install node@22`) atau
> [nvm](https://github.com/nvm-sh/nvm) (`nvm install 22 && nvm use 22`). Hindari
> Node bawaan distro yang sering tertinggal.

### 6.2 Instal MariaDB &amp; Redis langsung di host

<details><summary><strong>Ubuntu / Debian</strong> (apt)</summary>

```bash
# MariaDB 11
sudo apt-get update
sudo apt-get install -y mariadb-server mariadb-client
sudo systemctl enable --now mariadb
sudo mariadb-secure-installation    # set root password, harden defaults

# Redis 7
sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server
```

</details>

<details><summary><strong>RHEL / Rocky / AlmaLinux</strong> (dnf)</summary>

```bash
sudo dnf install -y mariadb-server redis
sudo systemctl enable --now mariadb redis
sudo mariadb-secure-installation
```

</details>

<details><summary><strong>macOS</strong> (Homebrew)</summary>

```bash
brew install mariadb redis
brew services start mariadb
brew services start redis
```

</details>

<details><summary><strong>Windows</strong> (winget / installer)</summary>

```powershell
winget install MariaDB.Server
winget install Redis.Redis        # atau pakai Memurai sebagai pengganti Redis di Windows
```

Daftarkan keduanya sebagai service (MariaDB installer menyertakan opsi
"Install as service"; Memurai langsung jadi service Windows).

</details>

### 6.3 Buat database &amp; user aplikasi

Jalankan satu kali, sesuaikan password (samakan dengan `DATABASE_URL` di `.env`):

```bash
sudo mariadb -u root <<'SQL'
CREATE DATABASE IF NOT EXISTS siakad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'siakad'@'localhost' IDENTIFIED BY 'siakad';
GRANT ALL PRIVILEGES ON siakad.* TO 'siakad'@'localhost';
FLUSH PRIVILEGES;
SQL
```

Smoke test koneksi:

```bash
mysql -u siakad -psiakad -h 127.0.0.1 siakad -e "SELECT 1;"
redis-cli ping       # → PONG
```

> Tersedia helper opsional: `bash scripts/setup-baremetal.sh` — script ini hanya
> wrapper untuk SQL di atas + `npm ci` + `prisma migrate deploy` + `db:seed-demo`.

### 6.4 Bootstrap aplikasi

```bash
# 1. Clone
git clone https://github.com/termakaniklan/siakad.git
cd siakad

# 2. Pasang dependency aplikasi
npm ci

# 3. Salin .env contoh, lalu sesuaikan DATABASE_URL / secret di editor
cp .env.example .env
$EDITOR .env        # set AUTH_*_SECRET dengan: openssl rand -base64 48

# 4. Generate Prisma client + apply migrasi
npm run prisma:generate
npm run prisma:deploy        # = prisma migrate deploy (idempotent)

# 5. Seed data awal (RBAC + akun super admin)
npm run db:seed
# ATAU langsung dengan dummy demo (~120 siswa / 18 guru / 120 ortu / 6 kelas / 5 ujian)
npm run db:seed-demo

# 6. Jalankan dev server
npm run dev          # → http://localhost:3000

# 7. (Opsional) Worker BullMQ di terminal terpisah
npm run queue:worker
```

**Akun super admin default** (dari seeder): `superadmin / ChangeMe!2026`
**Wajib diganti pada login pertama** (paksa via flag `mustChangePassword`).
Akun demo lain dari `db:seed-demo`: `siswa001 / Siswa!2026`,
`guru01 / Guru!2026`, `ortu001 / OrangTua!2026`.

## 7. Instalasi Produksi (Baremetal &amp; Docker)

Pilih salah satu — keduanya didukung. **Mode default = baremetal/monolith**;
Docker Compose disediakan sebagai alternatif praktis.

### 7.1 Produksi Baremetal / Monolith (rekomendasi)

Cocok bila Anda punya 1 server (VPS / bare-metal / VM) dan ingin menghindari
overhead Docker. Asumsi Ubuntu 22.04 LTS / Debian 12.

#### Langkah singkat

```bash
# A. Pasang prasyarat OS (lihat §6.2 untuk distro lain)
sudo apt-get update
sudo apt-get install -y mariadb-server mariadb-client redis-server nginx git curl
sudo systemctl enable --now mariadb redis-server nginx
sudo mariadb-secure-installation

# Node 22 via Nodesource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# B. Buat user OS terpisah untuk menjalankan aplikasi (best practice)
sudo useradd --system --create-home --shell /bin/bash siakad
sudo -iu siakad

# C. Clone & build (sebagai user siakad)
git clone https://github.com/termakaniklan/siakad.git ~/app
cd ~/app
cp .env.example .env
$EDITOR .env        # lihat §8 — wajib set AUTH_*_SECRET, CAPTCHA_HMAC_SECRET, MAIL_*
npm ci
npm run prisma:generate
npm run build

# D. Provisi database (sebagai root MariaDB di terminal terpisah)
sudo mariadb -u root <<'SQL'
CREATE DATABASE siakad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'siakad'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON siakad.* TO 'siakad'@'localhost';
FLUSH PRIVILEGES;
SQL
# (Jangan lupa sinkronkan password ini dengan DATABASE_URL di /home/siakad/app/.env)

# E. Apply migrasi + seed awal
cd ~/app
npm run prisma:deploy
npm run db:seed
```

#### Menjalankan sebagai service systemd

Buat unit file `/etc/systemd/system/siakad.service`:

```ini
[Unit]
Description=SIAKAD PWA (Next.js standalone)
After=network.target mariadb.service redis-server.service

[Service]
Type=simple
User=siakad
Group=siakad
WorkingDirectory=/home/siakad/app
EnvironmentFile=/home/siakad/app/.env
ExecStart=/usr/bin/node /home/siakad/app/.next/standalone/server.js
Restart=on-failure
RestartSec=5
# Hardening
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=/home/siakad/app/storage /home/siakad/app/.next

[Install]
WantedBy=multi-user.target
```

Worker BullMQ di `/etc/systemd/system/siakad-worker.service`:

```ini
[Unit]
Description=SIAKAD background worker (BullMQ)
After=network.target redis-server.service mariadb.service siakad.service

[Service]
Type=simple
User=siakad
Group=siakad
WorkingDirectory=/home/siakad/app
EnvironmentFile=/home/siakad/app/.env
ExecStart=/usr/bin/npx tsx src/shared/queue/worker.ts
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Aktifkan:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now siakad siakad-worker
sudo systemctl status siakad
journalctl -u siakad -f       # tail log
```

> **Alternatif PM2**: bila lebih familiar, `npm i -g pm2` lalu
> `pm2 start ".next/standalone/server.js" --name siakad` dan
> `pm2 start "npx tsx src/shared/queue/worker.ts" --name siakad-worker`,
> akhiri dengan `pm2 save && pm2 startup`.

#### Nginx sebagai reverse proxy + TLS

Salin contoh konfigurasi yang sudah disediakan di `deploy/nginx/conf.d/default.conf`
ke `/etc/nginx/sites-available/siakad.conf`, sesuaikan `server_name` dan path
sertifikat (mis. Let's Encrypt via `certbot --nginx`), lalu:

```bash
sudo ln -s /etc/nginx/sites-available/siakad.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Selesai — buka `https://siakad.sekolahanda.sch.id`.

### 7.2 Produksi via Docker Compose (alternatif)

Cocok bila Anda **tidak mau menyentuh OS** sama sekali — semua komponen
ter-encapsulate di container. Stack: `app` + `worker` + `mariadb` + `redis` +
`nginx`. **Hanya `.env` yang perlu Anda ubah**, sisanya sudah otomatis.

#### Prasyarat

- Docker Engine ≥ 24
- Docker Compose v2 plugin (`docker compose version`)

#### Langkah

```bash
# 1. Clone & masuk repo
git clone https://github.com/termakaniklan/siakad.git
cd siakad

# 2. Salin .env contoh & sesuaikan
cp .env.example .env
$EDITOR .env

# 3. Build + jalankan stack lengkap (idempotent)
docker compose up -d --build

# 4. Apply migrasi DB + seed awal (jalankan satu kali setelah container hidup)
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed     # atau: npm run db:seed-demo

# 5. Buka https://your-domain
#    Nginx (di container) menerminasi TLS — taruh cert .pem + .key di deploy/nginx/certs
```

Berhenti / restart:

```bash
docker compose stop                # stop tanpa hilangkan data
docker compose down                # stop + hapus container (volume MariaDB/Redis tetap aman)
docker compose logs -f app worker  # tail log gabungan
```

#### Variabel `.env` yang **wajib** Anda set untuk mode Docker Compose

| Variabel              | Dipakai oleh               | Catatan                                               |
| --------------------- | -------------------------- | ----------------------------------------------------- |
| `APP_URL`             | `app`, `worker`            | URL publik (mis. `https://siakad.sekolahanda.sch.id`) |
| `AUTH_SESSION_SECRET` | `app`, `worker`            | `openssl rand -base64 48`                             |
| `AUTH_JWT_SECRET`     | `app`, `worker`            | Beda dari session secret                              |
| `CAPTCHA_HMAC_SECRET` | `app`                      | `openssl rand -base64 32`                             |
| `DB_NAME`             | `mariadb`, `app`, `worker` | Nama database (default: `siakad`)                     |
| `DB_USER`             | `mariadb`, `app`, `worker` | User aplikasi (default: `siakad`)                     |
| `DB_PASSWORD`         | `mariadb`, `app`, `worker` | **Wajib diganti dari default `siakad`**               |
| `DB_ROOT_PASSWORD`    | `mariadb`                  | Root MariaDB; backup script juga memakai ini          |
| `MAIL_*`              | `app`, `worker`            | SMTP untuk reset password & notifikasi                |

Semua variabel lain (`DATABASE_URL`, `REDIS_URL`) **otomatis dirakit** oleh
`docker-compose.yml` dari `DB_*` di atas + nama service internal. Anda boleh
meng-override `DATABASE_URL` di `.env` jika butuh parameter spesifik
(mis. `?sslmode=require`).

#### Layanan yang berjalan

| Service   | Port (host) | Catatan                                                 |
| --------- | ----------- | ------------------------------------------------------- |
| `nginx`   | 80, 443     | Reverse proxy + TLS + rate-limit + security headers     |
| `app`     | 3000        | Next.js standalone (langsung diakses kalau tanpa Nginx) |
| `worker`  | —           | BullMQ consumer untuk notif & job latar                 |
| `mariadb` | 3306        | Data persistent volume `mariadb_data`                   |
| `redis`   | 6379        | Persistent volume `redis_data`                          |

Lihat `docker-compose.yml`, `Dockerfile`, dan `deploy/nginx/` untuk konfigurasi rinci.

#### Troubleshooting build Docker

- **`Failed to load config file "/app" ... Cannot resolve environment variable: DATABASE_URL`**
  pada langkah `RUN npx prisma generate`: sudah diperbaiki di `prisma.config.ts`
  (membaca `process.env.DATABASE_URL ?? ''` alih-alih helper strict `env()`).
  Pastikan Anda berada di branch `main` terbaru sebelum `docker compose build`.
- **Healthcheck `mariadb` lama menjadi healthy**: tingkatkan `start_period` di
  `docker-compose.yml` bila host lambat (mis. Raspberry Pi). Migrasi awal sebaiknya
  baru dijalankan setelah `docker compose ps` menunjukkan `(healthy)`.
- **Mengganti port host**: ubah blok `ports:` di `docker-compose.yml` (mis.
  `"8080:80"`) lalu `docker compose up -d` ulang.

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

| Entitas            | Jumlah | Catatan                                                     |
| ------------------ | ------ | ----------------------------------------------------------- |
| **Berita**         | 30     | publikasi 30 hari ke belakang                               |
| **Galeri**         | 24     | gambar yang di-generate AI (Pollinations)                   |
| **Pengumuman**     | 4      | 1 pinned banner + 3 pengumuman                              |
| **Mata Pelajaran** | 12     | MTK, BIN, BIG, FIS, KIM, BIO, EKO, SOS, SEJ, INF, PJOK, PAI |
| **Guru**           | 18     | 6 di antaranya menjadi wali kelas                           |
| **Kelas**          | 6      | X IPA-1, X IPS-1, XI IPA-1, XI IPS-1, XII IPA-1, XII IPS-1  |
| **Siswa**          | 120    | 20 / kelas, NIS `2025xxxx`                                  |
| **Orang Tua**      | 120    | 1 akun per siswa (`ortu001` … `ortu120`), `ParentLink` siap |
| **Jadwal**         | 12     | 2 jadwal per kelas (Senin & Rabu)                           |
| **Absensi**        | ~1.680 | 14 hari × 120 siswa, status pseudo-random deterministik     |
| **Ujian CBT**      | 5      | masing-masing 10 soal pilihan ganda                         |
| **Pendaftar PPDB** | 6      | berbagai status (`submitted`, `verified`, dst.)             |

Akun demo:

| Role                     | Username     | Password        |
| ------------------------ | ------------ | --------------- |
| Super Admin              | `superadmin` | `ChangeMe!2026` |
| Siswa (mis. siswa001)    | `siswa001`   | `Siswa!2026`    |
| Guru (mis. guru01)       | `guru01`     | `Guru!2026`     |
| Orang Tua (mis. ortu001) | `ortu001`    | `OrangTua!2026` |

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

### Matriks CRUD per Role

Berikut ringkasan operasi yang diizinkan per role pada entitas inti. Tanda **C/R/U/D** = Create/Read/Update/Delete. **Self** berarti hanya pada record milik sendiri; **Class** berarti hanya pada kelas/mapel yang diampu; **Linked** berarti hanya pada anak yang ditautkan via `ParentLink`.

| Entitas / Modul                                             | Super Admin | Admin    | Operator | Guru / Wali Kelas | Siswa        | Orang Tua    |
| ----------------------------------------------------------- | ----------- | -------- | -------- | ----------------- | ------------ | ------------ |
| Pengguna (`User`)                                           | C/R/U/D     | C/R/U/D  | R        | —                 | R (self)     | R (self)     |
| Profil sendiri (foto + data)                                | U (self)    | U (self) | U (self) | U (self)          | U (self)     | U (self)     |
| Role / Permission                                           | C/R/U/D     | R        | R        | —                 | —            | —            |
| Tahun Ajaran / Kelas / Mapel                                | C/R/U/D     | C/R/U/D  | R        | R                 | R            | R            |
| Jadwal Pelajaran                                            | C/R/U/D     | C/R/U/D  | C/R/U    | R (Class)         | R (self)     | R (Linked)   |
| Nilai (`Grade`)                                             | R           | R        | R        | C/R/U (Class)     | R (self)     | R (Linked)   |
| Kehadiran (`AttendanceMark`)                                | R/U         | R/U      | C/R/U    | C/R/U (Class)     | R (self)     | R (Linked)   |
| Materi (`MaterialUpload`)                                   | R           | R        | R        | C/R/U/D (Class)   | R (Class)    | —            |
| Pelanggaran (`Violation`)                                   | R           | R        | R        | C/R/U (Class)     | R (self)     | R (Linked)   |
| Bank Soal / `Exam`                                          | C/R/U/D     | C/R/U/D  | R        | C/R/U/D (own)     | R (taken)    | —            |
| Pengambilan Ujian (`ExamAttempt`)                           | R           | R        | R        | R (Class)         | C/R (self)   | R (Linked)   |
| Berita (`NewsPost`)                                         | C/R/U/D     | C/R/U/D  | C/R/U    | R                 | R            | R            |
| Galeri (`GalleryItem`)                                      | C/R/U/D     | C/R/U/D  | C/R/U    | R                 | R            | R            |
| Pengumuman (`Announcement`)                                 | C/R/U/D     | C/R/U/D  | C/R/U    | R (audience)      | R (audience) | R (audience) |
| PPDB Applications                                           | C/R/U/D     | C/R/U/D  | R/U      | —                 | R (self)     | —            |
| Settings / Branding (favicon, login bg, judul, warna utama) | C/R/U/D     | C/R/U/D  | R        | —                 | —            | —            |
| Audit Log                                                   | R           | R        | —        | —                 | —            | —            |

Penegakan:

1. **Layout-level guard** — setiap route group memiliki `layout.tsx` yang memanggil `getPrincipal()` lalu redirect kalau role tidak diizinkan (mis. siswa coba buka `/admin` → dipindah ke `/siswa`).
2. **Permission-level guard** — setiap server action / API route memanggil `hasAnyPermission(principal, PERMISSIONS.X)` sebelum memproses.
3. **Ownership / scope guard** — query Prisma membatasi `where` ke `principal.userId` (siswa), `homeroomTeacherId` / `teacherId` (guru), atau `ParentLink` (orang tua). Resource ID dari URL **tidak pernah** dipakai mentah; semuanya divalidasi `zod` lalu dijoin ke kepemilikan untuk mencegah IDOR.
4. **Audit log** — seluruh write action (create / update / delete) menulis `AuditLog` dengan `actorUserId` yang diresolved dari prinsipal, bukan dari payload request.

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

### Baremetal

```bash
# Backup MariaDB (logical, terkompres + terenkripsi)
mariadb-dump -u root -p"$DB_ROOT_PASSWORD" --single-transaction --routines siakad \
  | gzip | openssl enc -aes-256-cbc -salt -pbkdf2 -out siakad-$(date +%F).sql.gz.enc

# Restore
openssl enc -d -aes-256-cbc -pbkdf2 -in siakad-2025-01-01.sql.gz.enc \
  | gunzip | mariadb -u root -p"$DB_ROOT_PASSWORD" siakad

# Backup file uploads (jika STORAGE_DRIVER=local)
tar -czf storage-$(date +%F).tar.gz storage/
```

### Docker Compose

```bash
# Backup
docker compose exec -T mariadb mariadb-dump -u root -p"$DB_ROOT_PASSWORD" \
  --single-transaction --routines siakad \
  | gzip | openssl enc -aes-256-cbc -salt -pbkdf2 -out siakad-$(date +%F).sql.gz.enc

# Restore
openssl enc -d -aes-256-cbc -pbkdf2 -in siakad-2025-01-01.sql.gz.enc \
  | gunzip | docker compose exec -T mariadb mariadb -u root -p"$DB_ROOT_PASSWORD" siakad
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
  bergantung pada Redis. Pasang baremetal lewat `apt install redis-server`
  (Debian/Ubuntu) atau `brew install redis` (macOS). Lihat §6.2.
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
