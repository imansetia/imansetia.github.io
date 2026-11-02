// (Opsional) Lengkapi poster dan sutradara dari TMDB → films.json, favorites.json, public/posters/
//
// Pemakaian:
//   npm run sync:tmdb   (key dibaca dari file .env: TMDB_API_KEY=...)
//
// Hanya berjalan bila ada TMDB_API_KEY (API key v3 atau "API Read Access Token" v4).
// Tanpa key, script selesai tanpa mengubah apa pun. Gunanya untuk film lama dari CSV
// yang tidak muncul di RSS sehingga belum punya poster, dan untuk mengisi sutradara.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { download, fetchJson, sleep } from './lib/http.mjs';
import { filmKey, readFilms, writeFilms } from './lib/films.mjs';

const KEY = process.env.TMDB_API_KEY?.trim();
if (!KEY) {
  console.log('TMDB_API_KEY tidak ada; sinkron TMDB dilewati.');
  process.exit(0);
}

const FAVORITES = 'src/data/favorites.json';
const API = 'https://api.themoviedb.org/3';
// Token v4 berbentuk JWT (diawali "eyJ") dikirim lewat header; key v3 lewat parameter.
const isToken = KEY.startsWith('eyJ');
const headers = isToken ? { Authorization: `Bearer ${KEY}` } : {};

function api(path, params = {}) {
  const query = new URLSearchParams({ ...params, ...(!isToken && { api_key: KEY }) });
  return fetchJson(`${API}${path}?${query}`, headers);
}

async function findId(title, year) {
  const result = await api('/search/movie', { query: title, year: String(year) });
  return result?.results?.[0]?.id ?? null;
}

const films = readFilms();
const favorites = existsSync(FAVORITES) ? JSON.parse(readFileSync(FAVORITES, 'utf8')) : [];
const before = JSON.stringify([films, favorites]);

// Kumpulkan film unik (judul + tahun) yang belum lengkap, dari log dan favorit.
const groups = new Map();
for (const film of [...films, ...favorites]) {
  const key = filmKey(film.title, film.year);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(film);
}

let posters = 0;
let directors = 0;

for (const entries of groups.values()) {
  if (entries.every((film) => film.poster && film.director)) continue;

  const { title, year } = entries[0];
  const tmdbId = entries.find((film) => film.tmdbId)?.tmdbId ?? (await findId(title, year));
  if (!tmdbId) {
    console.warn(`  Tidak ditemukan di TMDB: ${title} (${year})`);
    continue;
  }

  const movie = await api(`/movie/${tmdbId}`, { append_to_response: 'credits' });
  if (!movie) continue;

  const director = movie.credits?.crew
    ?.filter((person) => person.job === 'Director')
    .map((person) => person.name)
    .join(', ');

  let poster = entries.find((film) => film.poster)?.poster;
  if (!poster && movie.poster_path) {
    const path = `/posters/tmdb-${tmdbId}.jpg`;
    if (await download(`https://image.tmdb.org/t/p/w500${movie.poster_path}`, `public${path}`)) {
      poster = path;
    }
  }

  for (const film of entries) {
    if ('tmdbId' in film) film.tmdbId = tmdbId;
    if (poster && !film.poster) {
      film.poster = poster;
      posters++;
    }
    if (director && !film.director) {
      film.director = director;
      directors++;
    }
  }
  await sleep(100);
}

if (JSON.stringify([films, favorites]) === before) {
  console.log('Sinkron TMDB: tidak ada perubahan.');
} else {
  writeFilms(films);
  writeFileSync(FAVORITES, JSON.stringify(favorites, null, 2) + '\n');
  console.log(`Sinkron TMDB: ${posters} poster dan ${directors} sutradara ditambahkan.`);
}
