#!/usr/bin/env bash
#
# SIAKAD — bootstrap monolith baremetal di Linux / macOS.
#
# Asumsi: MariaDB & Redis SUDAH terpasang dan berjalan (lihat README §6.2).
# Script ini:
#   1. memvalidasi prasyarat (node, npm, mariadb client, redis-cli)
#   2. memprovisi database + user MariaDB (idempotent)
#   3. menyalin .env dari .env.example bila belum ada
#   4. menjalankan npm ci, prisma generate, prisma migrate deploy, seed
#
# Penggunaan:
#   bash scripts/setup-baremetal.sh                     # interaktif (akan tanya seed)
#   SEED=demo bash scripts/setup-baremetal.sh           # non-interaktif + seed demo
#   SEED=minimal bash scripts/setup-baremetal.sh        # non-interaktif + seed minimal
#   SEED=none bash scripts/setup-baremetal.sh           # skip seed (mis. pada upgrade)
#
# Env override (opsional, default mengikuti .env.example):
#   DB_NAME=siakad DB_USER=siakad DB_PASSWORD=siakad DB_HOST=127.0.0.1 DB_PORT=3306
#
set -euo pipefail

cd "$(dirname "$0")/.."

ts() { date +'%H:%M:%S'; }
log() { printf '\033[1;34m[%s]\033[0m %s\n' "$(ts)" "$*"; }
warn() { printf '\033[1;33m[%s] WARN\033[0m %s\n' "$(ts)" "$*"; }
err() { printf '\033[1;31m[%s] ERR\033[0m %s\n' "$(ts)" "$*" >&2; }

# ---------- 1. Validasi prasyarat ----------
log "Memeriksa prasyarat..."
missing=0
for bin in node npm; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    err "  - '$bin' tidak ditemukan di PATH"; missing=1
  fi
done
if ! command -v mariadb >/dev/null 2>&1 && ! command -v mysql >/dev/null 2>&1; then
  err "  - 'mariadb' / 'mysql' client tidak ditemukan; pasang dulu MariaDB 11 (lihat README §6.2)"
  missing=1
fi
if ! command -v redis-cli >/dev/null 2>&1; then
  warn "  - 'redis-cli' tidak ditemukan — pastikan Redis sudah jalan di host"
fi
if [ "$missing" -ne 0 ]; then
  err "Pasang dulu prasyarat di atas lalu jalankan kembali script ini."
  exit 1
fi

node_major=$(node -p "process.versions.node.split('.')[0]")
if [ "$node_major" -lt 20 ]; then
  err "Node.js ${node_major}.x terlalu lawas (minimal 20.10, rekomendasi 22.x)."
  exit 1
fi
log "  Node $(node -v) ✓"
log "  npm  $(npm -v) ✓"

# ---------- 2. Provisi database ----------
DB_NAME="${DB_NAME:-siakad}"
DB_USER="${DB_USER:-siakad}"
DB_PASSWORD="${DB_PASSWORD:-siakad}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

log "Memprovisi database MariaDB '${DB_NAME}' (user '${DB_USER}')..."
MARIADB_CLI=$(command -v mariadb || command -v mysql)
SQL=$(cat <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL
)

# Coba dulu tanpa sudo (jika user lokal punya akses), fallback ke sudo.
if echo "$SQL" | "$MARIADB_CLI" -u root --host "$DB_HOST" --port "$DB_PORT" 2>/dev/null; then
  log "  Provisi DB sukses (tanpa sudo)."
elif echo "$SQL" | sudo "$MARIADB_CLI" -u root 2>/dev/null; then
  log "  Provisi DB sukses (via sudo)."
else
  warn "Tidak bisa provisi otomatis. Jalankan manual sebagai root MariaDB:"
  warn "$SQL"
  warn "Lanjut tanpa provisi (asumsikan DB sudah siap)."
fi

# Smoke test koneksi
if "$MARIADB_CLI" -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_NAME" -e "SELECT 1;" >/dev/null 2>&1; then
  log "  Koneksi DB sebagai '${DB_USER}' ✓"
else
  err "Tidak bisa connect ke ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}."
  err "Periksa password atau host MariaDB sebelum melanjutkan."
  exit 1
fi

# ---------- 3. .env ----------
if [ ! -f .env ]; then
  cp .env.example .env
  log "  Membuat .env dari .env.example. EDIT FILE INI sebelum production!"
else
  log "  .env sudah ada (tidak ditimpa)."
fi

# ---------- 4. npm install + Prisma + seed ----------
log "Menjalankan npm ci..."
npm ci --no-audit --no-fund

log "Menjalankan prisma generate..."
npm run prisma:generate

log "Menjalankan prisma migrate deploy..."
npm run prisma:deploy

# Default seed = tanya. Atur env SEED untuk non-interaktif.
SEED="${SEED:-}"
if [ -z "$SEED" ]; then
  echo
  echo "Pilih seed:"
  echo "  1) Minimal       — hanya RBAC + akun super admin (npm run db:seed)"
  echo "  2) Demo          — minimal + ~120 siswa/18 guru/120 ortu/5 ujian (npm run db:seed-demo)"
  echo "  3) Skip"
  read -rp "Pilihan [1/2/3]: " choice
  case "$choice" in
    1) SEED=minimal ;;
    2) SEED=demo ;;
    *) SEED=none ;;
  esac
fi

case "$SEED" in
  minimal) log "Menjalankan db:seed..."; npm run db:seed ;;
  demo)    log "Menjalankan db:seed-demo..."; npm run db:seed-demo ;;
  none)    log "Skip seed sesuai pilihan." ;;
  *)       warn "SEED='${SEED}' tidak dikenal; skip." ;;
esac

cat <<'DONE'

────────────────────────────────────────
 Setup baremetal selesai. Langkah berikutnya:

   npm run dev                # mode pengembangan, http://localhost:3000
   npm run build && npm start # mode produksi (standalone) di port 3000
   npm run queue:worker       # worker BullMQ (terminal terpisah)

 Akun default (gantilah pada login pertama):
   superadmin / ChangeMe!2026
   siswa001   / Siswa!2026     (hanya ada bila seed=demo)
   guru01     / Guru!2026      (hanya ada bila seed=demo)
   ortu001    / OrangTua!2026  (hanya ada bila seed=demo)

 Untuk produksi, lihat README §7.1 (systemd unit + Nginx reverse proxy).
────────────────────────────────────────
DONE
