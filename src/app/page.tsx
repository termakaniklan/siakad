import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-700 dark:text-brand-400">
            SIAKAD
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

      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="container py-20 md:py-28">
          <p className="text-sm uppercase tracking-widest text-brand-100">
            Sistem Informasi Akademik
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Platform akademik enterprise untuk sekolah Indonesia
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-brand-100">
            CMS sekolah, PPDB, CBT, RBAC, dan notifikasi multi-channel — semua dalam satu
            Progressive Web App yang aman, modular, dan siap produksi.
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
                Lihat PPDB
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">Fitur Utama</h2>
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
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} SIAKAD Sekolah Indonesia. Open source untuk pendidikan.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/kontak" className="hover:text-brand-700 dark:hover:text-brand-400">
              Kontak
            </Link>
            <Link href="/profil" className="hover:text-brand-700 dark:hover:text-brand-400">
              Tentang
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
