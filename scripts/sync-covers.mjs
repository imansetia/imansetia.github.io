// Unduh sampul buku dari Open Library (berdasarkan ISBN) → public/covers/
//
// Pemakaian:
//   npm run sync:covers
//
// RSS Goodreads tidak bisa diakses (dicek November 2026: 404), jadi buku baru
// tetap masuk lewat impor CSV ulang. Script ini hanya melengkapi sampul buku yang
// punya ISBN dan belum punya gambar. Buku tanpa sampul memakai kotak garis putus-putus.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { download, sleep } from './lib/http.mjs';

const BOOKS = 'src/data/books.json';

if (!existsSync(BOOKS)) {
  console.log(`${BOOKS} belum ada; lewati.`);
  process.exit(0);
}

const books = JSON.parse(readFileSync(BOOKS, 'utf8'));
const missing = books.filter((book) => book.isbn && !book.cover);
let found = 0;

for (const book of missing) {
  // `default=false` membuat Open Library membalas 404 bila sampul tidak ada.
  const url = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
  const path = `/covers/${book.id}.jpg`;
  if (await download(url, `public${path}`)) {
    book.cover = path;
    found++;
  }
  // Open Library membatasi jumlah permintaan; beri jeda kecil.
  await sleep(300);
}

if (found > 0) writeFileSync(BOOKS, JSON.stringify(books, null, 2) + '\n');
console.log(`${missing.length} buku tanpa sampul dicek; ${found} sampul ditemukan.`);
