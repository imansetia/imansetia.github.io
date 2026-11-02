// Impor awal buku dari export Goodreads → src/data/books.json
//
// Pemakaian:
//   npm run import:goodreads -- <goodreads_library_export.csv>
//
// Hanya rak "read" dan "currently-reading" yang diimpor; "to-read" dilewati.
// Ulasan dan catatan pribadi dari Goodreads sengaja tidak diimpor.
// Field `cover` yang sudah ada di books.json dipertahankan.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readCsv } from './lib/csv.mjs';

const file = process.argv[2];
if (!file || !existsSync(file)) {
  console.error('File export Goodreads tidak ditemukan.');
  console.error('Contoh: npm run import:goodreads -- goodreads_library_export.csv');
  process.exit(1);
}

const OUTPUT = 'src/data/books.json';
const SHELVES = ['read', 'currently-reading'];

// Goodreads menulis ISBN sebagai ="0061124265"
const cleanIsbn = (value) => value.replace(/[="]/g, '').trim();
// "Inferno (Robert Langdon, #4)" → "Inferno"
const cleanTitle = (value) => value.replace(/\s*\([^()]*#\d+(\.\d+)?\)\s*$/, '').trim();
// "Dan    Brown" → "Dan Brown"
const cleanName = (value) => value.replace(/\s+/g, ' ').trim();
// "2024/01/15" → "2024-01-15"
const cleanDate = (value) => value.trim().replaceAll('/', '-');

const existing = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, 'utf8')) : [];
const previous = new Map(existing.map((book) => [book.id, book]));

const books = readCsv(file)
  .filter((row) => SHELVES.includes(row['Exclusive Shelf']))
  .map((row) => {
    const id = row['Book Id'];
    const year = Number(row['Original Publication Year'] || row['Year Published']) || undefined;
    const rating = Number(row['My Rating']) || null;
    const isbn = cleanIsbn(row.ISBN13) || cleanIsbn(row.ISBN) || undefined;
    const old = previous.get(id) ?? {};

    return {
      id,
      title: cleanTitle(row.Title),
      author: cleanName(row.Author),
      ...(year && { year }),
      rating,
      shelf: row['Exclusive Shelf'],
      ...(row['Date Read'] && { dateRead: cleanDate(row['Date Read']) }),
      ...(isbn && { isbn }),
      goodreadsUrl: `https://www.goodreads.com/book/show/${id}`,
      ...(old.cover && { cover: old.cover }),
    };
  });

writeFileSync(OUTPUT, JSON.stringify(books, null, 2) + '\n');

const counts = SHELVES.map((shelf) => `${books.filter((b) => b.shelf === shelf).length} ${shelf}`);
console.log(`${books.length} buku ditulis ke ${OUTPUT} (${counts.join(', ')}).`);
