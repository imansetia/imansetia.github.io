// Membaca data JSON dan menyediakan fungsi bantu untuk halaman.
import { getCollection } from 'astro:content';
import filmsData from '../data/films.json';
import booksData from '../data/books.json';
import favoritesData from '../data/favorites.json';

export interface Film {
  id: string;
  title: string;
  year: number;
  director?: string;
  rating: number | null;
  watchedDate: string | null; // YYYY-MM-DD; null bila hanya ditandai "watched" tanpa diary
  rewatch: boolean;
  review?: string;
  letterboxdUrl: string;
  tmdbId: number | null;
  poster?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year?: number;
  rating?: number | null;
  shelf: 'read' | 'currently-reading' | 'to-read';
  dateRead?: string; // YYYY-MM-DD
  isbn?: string;
  goodreadsUrl: string;
  cover?: string;
}

export interface Favorite {
  title: string;
  year: number;
  director?: string;
  letterboxdUrl: string;
  poster?: string;
}

export const films = filmsData as Film[];
export const books = booksData as Book[];
export const favorites = favoritesData as Favorite[];

/** Film terbaru lebih dulu; film tanpa tanggal di akhir. */
export function filmsByDate(): Film[] {
  return [...films].sort((a, b) => (b.watchedDate ?? '').localeCompare(a.watchedDate ?? ''));
}

/** Entri log yang punya tanggal tonton, terbaru lebih dulu. */
export function datedFilms(): Film[] {
  return filmsByDate().filter((film) => film.watchedDate);
}

/** Jumlah film berbeda (tonton ulang tidak dihitung dua kali). */
export function filmCount(): number {
  return new Set(films.map((film) => `${film.title}|${film.year}`)).size;
}

/** Buku di rak "read", terbaru lebih dulu. */
export function readBooks(): Book[] {
  return books
    .filter((book) => book.shelf === 'read')
    .sort((a, b) => (b.dateRead ?? '').localeCompare(a.dateRead ?? ''));
}

export function currentlyReading(): Book | undefined {
  return books.find((book) => book.shelf === 'currently-reading');
}

/** Rating film favorit diambil dari log bila filmnya pernah dicatat. */
export function ratingFor(title: string, year: number): number | null {
  const entry = filmsByDate().find((film) => film.title === title && film.year === year);
  return entry?.rating ?? null;
}

/** Tanggal entri paling baru di antara film dan buku. */
export function latestEntryDate(): string | undefined {
  const dates = [...films.map((f) => f.watchedDate ?? ''), ...books.map((b) => b.dateRead ?? '')];
  return dates.filter(Boolean).sort().at(-1);
}

/** Catatan terbaru lebih dulu. Draft hanya tampil saat `npm run dev`. */
export async function notesByDate() {
  const notes = await getCollection('notes', ({ data }) => import.meta.env.DEV || !data.draft);
  return notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export type Note = Awaited<ReturnType<typeof notesByDate>>[number];

/** Rute satu catatan, dipakai getStaticPaths di versi ID dan EN. */
export async function noteStaticPaths() {
  const notes = await notesByDate();
  return notes.map((note) => {
    // Terjemahan: catatan yang ditunjuk `translationOf`, atau yang menunjuk ke catatan ini.
    const translation = notes.find(
      (other) =>
        other.id !== note.id &&
        (other.id === note.data.translationOf || other.data.translationOf === note.id)
    );
    return { params: { slug: note.id }, props: { note, translation } };
  });
}

/** "2026-10-28" → "28.10.2026" */
export function formatDate(value: string | Date): string {
  const iso = typeof value === 'string' ? value : value.toISOString().slice(0, 10);
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Nilai ISO "YYYY-MM-DD" untuk atribut datetime. */
export function isoDate(value: string | Date): string {
  return typeof value === 'string' ? value : value.toISOString().slice(0, 10);
}
