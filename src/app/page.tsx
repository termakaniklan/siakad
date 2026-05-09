import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildContentSlug } from '@/lib/utils';
import { prisma } from '@/shared/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const FEATURES: Array<{ title: string; description: string }> = [
  {
    title: 'CMS Sekolah Lengkap',
    description: 'Atur halaman, berita, galeri, pengumuman, dan profil sekolah lewat dashboard.',
  },
  {
    title: 'PPDB Online',
    description: 'Multi-step form, autosave draft, upload dokumen, validasi realtime.',
  },
  {
    title: 'CBT Anti-Cheat',
    description: 'Fullscreen lock, deteksi tab-switch, autosave jawaban, randomisasi soal.',
  },
  {
    title: 'RBAC Granular',
    description: 'Permission-based access untuk Admin, Guru, Wali Kelas, Siswa, Orang Tua.',
  },
  {
    title: 'PWA Offline-Ready',
    description: 'Installable, offline shell, push notification, app shortcuts.',
  },
  {
    title: 'Notifikasi Multi-Channel',
    description: 'Email SMTP + WhatsApp gateway + in-app, dipantau via queue BullMQ.',
  },
];

async function safeNews() {
  return prisma.newsPost
    .findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    })
    .catch(() => [] as Array<Awaited<ReturnType<typeof prisma.newsPost.findFirst>>>);
}

async function safeAnnouncements() {
  return prisma.announcement
    .findMany({
      where: { deletedAt: null, publishedAt: { not: null } },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 4,
    })
    .catch(() => []);
}

async function safeSchoolProfile() {
  return prisma.schoolProfile.findFirst({ where: { id: 'default-school' } }).catch(() => null);
}

async function safeGallery() {
  return prisma.galleryItem
    .findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { order: 'asc' },
      take: 8,
    })
    .catch(() => []);
}

export default async function HomePage() {
  const [news, announcements, school, gallery] = await Promise.all([
    safeNews(),
    safeAnnouncements(),
    safeSchoolProfile(),
    safeGallery(),
  ]);

  const heroBg = '/img/hero/hero-2.jpg';
  const schoolName = school?.name ?? 'SMA Negeri Contoh';

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-brand-700 dark:text-brand-400"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
              SK
            </span>
            <span>SIAKAD</span>
          </Link>
          <nav className="hidden gap-6 text-sm md:flex">
            <Link href="/berita" className="hover:text-brand-700 dark:hover:text-brand-400">
              Berita
            </Link>
            <Link href="/profil" className="hover:text-brand-700 dark:hover:text-brand-400">
              Profil
            </Link>
            <Link href="/galeri" className="hover:text-brand-700 dark:hover:text-brand-400">
              Galeri
            </Link>
            <Link href="/ppdb" className="hover:text-brand-700 dark:hover:text-brand-400">
              PPDB
            </Link>
            <Link href="/kontak" className="hover:text-brand-700 dark:hover:text-brand-400">
              Kontak
            </Link>
          </nav>
          <div className="flex gap-2">
            <Link href="/login">
              <Button size="sm" variant="outline">
                Masuk
              </Button>
            </Link>
            <Link href="/ppdb">
              <Button size="sm">Daftar PPDB</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-600 to-brand-900"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative hero */}
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
          aria-hidden
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-tr from-brand-900/85 via-brand-800/70 to-transparent"
        />
        <div className="container py-20 md:py-28">
          <p className="text-sm uppercase tracking-widest text-brand-100">
            Sistem Informasi Akademik · {school?.level ?? 'SMA'}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Selamat datang di {schoolName}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-50">
            {school?.visionText ??
              'Mencetak generasi unggul, berkarakter Pancasila, berdaya saing global, dan peduli lingkungan.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Masuk ke Dashboard
              </Button>
            </Link>
            <Link href="/ppdb">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Daftar PPDB Online
              </Button>
            </Link>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 text-sm md:grid-cols-4">
            <div>
              <dt className="text-brand-100/80">Siswa Aktif</dt>
              <dd className="mt-1 text-2xl font-bold">120+</dd>
            </div>
            <div>
              <dt className="text-brand-100/80">Guru</dt>
              <dd className="mt-1 text-2xl font-bold">18</dd>
            </div>
            <div>
              <dt className="text-brand-100/80">Mata Pelajaran</dt>
              <dd className="mt-1 text-2xl font-bold">12</dd>
            </div>
            <div>
              <dt className="text-brand-100/80">Tahun Ajaran</dt>
              <dd className="mt-1 text-2xl font-bold">2025/26</dd>
            </div>
          </dl>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="border-y border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="container py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">
              Pengumuman Terbaru
            </p>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100"
                >
                  <span aria-hidden>{a.isPinned ? '📌' : '•'}</span>
                  <span>
                    <strong>{a.title}</strong>
                    <span className="ml-2 text-amber-800/70 dark:text-amber-200/70">
                      {a.body.slice(0, 110)}
                      {a.body.length > 110 ? '…' : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="container py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Berita Sekolah</h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
              Liputan terbaru kegiatan akademik dan ekstrakurikuler.
            </p>
          </div>
          <Link
            href="/berita"
            className="hidden text-sm font-medium text-brand-700 hover:underline dark:text-brand-400 sm:block"
          >
            Lihat semua →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.length === 0 && (
            <p className="text-sm text-slate-500">Belum ada berita yang dipublikasikan.</p>
          )}
          {news.map((p) => (
            <Card key={p!.id} className="overflow-hidden">
              {p!.coverImageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element -- editorial */
                <img src={p!.coverImageUrl} alt={p!.title} className="h-40 w-full object-cover" />
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2 text-base">{p!.title}</CardTitle>
                <CardDescription>
                  {p!.publishedAt ? new Date(p!.publishedAt).toLocaleDateString('id-ID') : '—'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                <p className="line-clamp-3">{p!.excerpt ?? p!.content.slice(0, 160)}</p>
                <Link
                  className="mt-4 inline-block text-brand-700 hover:underline dark:text-brand-400"
                  href={`/berita${buildContentSlug(p!.numericId, p!.title)}`}
                >
                  Baca selengkapnya →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900/50">
          <div className="container py-16">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">Galeri Kegiatan</h2>
                <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
                  Dokumentasi visual kegiatan akademik, olahraga, seni, dan ekstrakurikuler.
                </p>
              </div>
              <Link
                href="/galeri"
                className="hidden text-sm font-medium text-brand-700 hover:underline dark:text-brand-400 sm:block"
              >
                Buka galeri lengkap →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((g) => (
                <figure
                  key={g.id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- gallery thumb */}
                  <img
                    src={g.thumbnailUrl ?? g.imageUrl ?? '/icons/icon-512.png'}
                    alt={g.title}
                    className="h-36 w-full object-cover"
                  />
                  <figcaption className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                    {g.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">Fitur Utama Sistem</h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Dirancang untuk kebutuhan operasional sekolah dari hari pertama hingga skala ribuan siswa.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Konfigurasi lewat panel admin tanpa redeploy.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="container flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold">{schoolName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {school?.address ?? 'Jl. Pendidikan No. 1, Jakarta'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {school?.phone ?? '+62-21-0000-0000'} ·{' '}
              {school?.email ?? 'info@sekolah-contoh.sch.id'}
            </p>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {schoolName}. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </main>
  );
}
