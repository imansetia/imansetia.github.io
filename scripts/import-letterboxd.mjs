// Impor awal film dari export Letterboxd → src/data/films.json
//
// Pemakaian:
//   npm run import:letterboxd -- <folder-export-letterboxd>
//
// Membaca diary.csv (satu baris per tontonan), reviews.csv (teks ulasan), dan
// watched.csv (link ke halaman film). Film di watched.csv yang tidak punya entri
// diary tetap diimpor dengan `watchedDate: null`, rating diambil dari ratings.csv.
// Field tambahan yang sudah ada di films.json (poster, director, tmdbId) dipertahankan.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readCsv } from './lib/csv.mjs';

const folder = process.argv[2];
if (!folder || !existsSync(join(folder, 'diary.csv'))) {
  console.error('Folder export Letterboxd tidak ditemukan (harus berisi diary.csv).');
  console.error('Contoh: npm run import:letterboxd -- letterboxd-solsticebay-2026-11-02-04-00-utc');
  process.exit(1);
}

const OUTPUT = 'src/data/films.json';
const key = (name, year) => `${name}|${year}`;
const optional = (file) => (existsSync(join(folder, file)) ? readCsv(join(folder, file)) : []);

const diary = readCsv(join(folder, 'diary.csv'));
const reviews = optional('reviews.csv');
const watched = optional('watched.csv');
const ratings = optional('ratings.csv');

const filmUrls = new Map(watched.map((row) => [key(row.Name, row.Year), row['Letterboxd URI']]));
const reviewTexts = new Map(
  reviews.map((row) => [key(row.Name, row.Year) + '|' + row['Watched Date'], row.Review.trim()])
);

const existing = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, 'utf8')) : [];
const previous = new Map(existing.map((film) => [film.id, film]));

const films = diary.map((row) => {
  const id = row['Letterboxd URI'].split('/').pop();
  const watchedDate = row['Watched Date'] || row.Date;
  const review = reviewTexts.get(key(row.Name, row.Year) + '|' + watchedDate);
  const old = previous.get(id) ?? {};

  return {
    id,
    title: row.Name,
    year: Number(row.Year),
    ...(old.director && { director: old.director }),
    rating: row.Rating ? Number(row.Rating) : null,
    watchedDate,
    rewatch: row.Rewatch === 'Yes',
    ...(review && { review }),
    letterboxdUrl: filmUrls.get(key(row.Name, row.Year)) ?? row['Letterboxd URI'],
    tmdbId: old.tmdbId ?? null,
    ...(old.poster && { poster: old.poster }),
  };
});

// Film yang ditandai "watched" tanpa entri diary: tanggal tonton tidak diketahui.
const inDiary = new Set(diary.map((row) => key(row.Name, row.Year)));
const ratingValues = new Map(ratings.map((row) => [key(row.Name, row.Year), row.Rating]));

for (const row of watched) {
  if (inDiary.has(key(row.Name, row.Year))) continue;
  const id = row['Letterboxd URI'].split('/').pop();
  const rating = ratingValues.get(key(row.Name, row.Year));
  const old = previous.get(id) ?? {};

  films.push({
    id,
    title: row.Name,
    year: Number(row.Year),
    ...(old.director && { director: old.director }),
    rating: rating ? Number(rating) : null,
    watchedDate: null,
    rewatch: false,
    letterboxdUrl: row['Letterboxd URI'],
    tmdbId: old.tmdbId ?? null,
    ...(old.poster && { poster: old.poster }),
  });
}

// Terbaru dulu; film tanpa tanggal di akhir, urut judul.
films.sort(
  (a, b) =>
    (b.watchedDate ?? '').localeCompare(a.watchedDate ?? '') || a.title.localeCompare(b.title)
);
writeFileSync(OUTPUT, JSON.stringify(films, null, 2) + '\n');

const undated = films.filter((film) => !film.watchedDate).length;
const withReview = films.filter((film) => film.review).length;
console.log(
  `${films.length} entri ditulis ke ${OUTPUT}: ${films.length - undated} dari diary, ` +
    `${undated} tanpa tanggal (${withReview} dengan ulasan).`
);
