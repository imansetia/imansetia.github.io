// Unduh sampul buku → public/covers/
//
// Pemakaian:
//   npm run sync:covers
//
// Urutan sumber untuk buku yang belum punya sampul:
//   1. Open Library berdasarkan ISBN (bila ada ISBN).
//   2. Halaman buku itu di Goodreads (gambar og:image), yaitu sampul edisi yang Iman rak-kan.
//      Ini juga menolong buku tanpa ISBN dan buku Indonesia yang tidak ada di Open Library.
// Gambar dari Goodreads diperkecil ke lebar 330px supaya ukurannya setara Open Library.
// Bila tidak ketemu di mana pun, buku memakai kotak garis putus-putus.
//
// RSS Goodreads tidak bisa diakses (dicek November 2026: 404), jadi buku baru
// tetap masuk lewat impor CSV ulang.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { download, fetchText, sleep } from './lib/http.mjs';

const BOOKS = 'src/data/books.json';
const COVER_WIDTH = 330;

if (!existsSync(BOOKS)) {
  console.log(`${BOOKS} belum ada; lewati.`);
  process.exit(0);
}

async function fromOpenLibrary(book, dest) {
  if (!book.isbn) return false;
  // `default=false` membuat Open Library membalas 404 bila sampul tidak ada.
  const url = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
  return download(url, dest);
}

async function fromGoodreads(book, dest) {
  const html = await fetchText(book.goodreadsUrl);
  const image = html?.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  // Buku tanpa sampul di Goodreads memakai gambar "nophoto"; lewati.
  if (!image || /nophoto/i.test(image)) return false;

  const temp = `${dest}.tmp`;
  if (!(await download(image, temp))) return false;
  try {
    await sharp(temp).resize({ width: COVER_WIDTH, withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(dest);
    return true;
  } catch (error) {
    console.warn(`  Gagal memproses sampul ${book.title}: ${error.message}`);
    return false;
  } finally {
    rmSync(temp, { force: true });
  }
}

const books = JSON.parse(readFileSync(BOOKS, 'utf8'));
const missing = books.filter((book) => !book.cover);
const counts = { openLibrary: 0, goodreads: 0 };

for (const book of missing) {
  const path = `/covers/${book.id}.jpg`;
  const dest = `public${path}`;
  if (await fromOpenLibrary(book, dest)) {
    counts.openLibrary++;
  } else if (await fromGoodreads(book, dest)) {
    counts.goodreads++;
  } else {
    console.warn(`  Sampul tidak ditemukan: ${book.title}`);
    continue;
  }
  book.cover = path;
  // Beri jeda kecil supaya tidak membebani server.
  await sleep(500);
}

const found = counts.openLibrary + counts.goodreads;
if (found > 0) writeFileSync(BOOKS, JSON.stringify(books, null, 2) + '\n');
console.log(
  `${missing.length} buku tanpa sampul dicek; ${found} sampul ditemukan ` +
    `(${counts.openLibrary} Open Library, ${counts.goodreads} Goodreads).`
);
