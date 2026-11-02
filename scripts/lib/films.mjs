// Fungsi bersama untuk membaca dan menulis src/data/films.json.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const FILMS = 'src/data/films.json';

/** Kunci satu film (bukan satu tontonan): judul + tahun. */
export const filmKey = (title, year) => `${title}|${year}`;

export function readFilms() {
  return existsSync(FILMS) ? JSON.parse(readFileSync(FILMS, 'utf8')) : [];
}

/** Terbaru dulu; film tanpa tanggal di akhir, urut judul. */
export function writeFilms(films) {
  films.sort(
    (a, b) =>
      (b.watchedDate ?? '').localeCompare(a.watchedDate ?? '') || a.title.localeCompare(b.title)
  );
  writeFileSync(FILMS, JSON.stringify(films, null, 2) + '\n');
}
