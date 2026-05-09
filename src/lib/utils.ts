import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware class merge. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Generate slug per spec: `/{id}-judul-content.html` (id required, slug from title). */
export function buildContentSlug(id: string | number, title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `/${id}-${base || 'konten'}.html`;
}

/** Parse `/{id}-...html` slugs back into the numeric/string id. */
export function parseContentSlug(slug: string): string | null {
  const m = slug.match(/^\/?(\d+|[A-Za-z0-9]+)-[^/]+\.html$/);
  return m?.[1] ?? null;
}
