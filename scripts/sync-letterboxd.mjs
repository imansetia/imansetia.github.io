// Sinkron rutin film dari RSS Letterboxd → src/data/films.json + public/posters/
//
// Pemakaian:
//   npm run sync:letterboxd
//
// RSS hanya memuat ±50 entri diary terakhir, jadi impor CSV tetap dipakai untuk
// riwayat lama. Entri dicocokkan lewat judul + tahun + tanggal tonton; entri baru
// ditambahkan, entri lama dilengkapi (ID TMDB, poster, rating, ulasan terbaru).
// Bila RSS tidak bisa diambil, data lama dibiarkan dan script selesai tanpa error.
import { download, fetchText } from './lib/http.mjs';
import { filmKey, readFilms, writeFilms } from './lib/films.mjs';

const RSS = 'https://letterboxd.com/solsticebay/rss/';
// Ukuran poster yang diunduh: 460×690 cukup tajam untuk grid di layar retina.
const POSTER_SIZE = '0-460-0-690';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text) =>
  text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, code) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match;
    return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  });

const tag = (xml, name) => xml.match(new RegExp(String.raw`<${name}(?:\s[^>]*)?>([\s\S]*?)</${name}>`))?.[1].trim();

/** Ulasan = paragraf deskripsi selain gambar poster, "Watched on …", dan peringatan spoiler. */
function reviewFrom(description) {
  const paragraphs = [...description.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1].trim())
    .filter((p) => !p.startsWith('<img') && !/^Watched on /.test(p) && !/^This review may contain spoilers/.test(p))
    .map((p) => decode(p.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')).trim())
    .filter(Boolean);
  return paragraphs.join('\n\n') || undefined;
}

function parseItem(xml) {
  const title = tag(xml, 'letterboxd:filmTitle');
  const watchedDate = tag(xml, 'letterboxd:watchedDate');
  // Item tanpa judul film/tanggal (mis. daftar) dilewati.
  if (!title || !watchedDate) return null;

  const description = (tag(xml, 'description') ?? '').replace(/^<!\[CDATA\[|\]\]>$/g, '');
  const link = tag(xml, 'link') ?? '';
  const rating = tag(xml, 'letterboxd:memberRating');
  const tmdbId = tag(xml, 'tmdb:movieId');

  return {
    guid: tag(xml, 'guid')?.split('-').pop(),
    title: decode(title),
    year: Number(tag(xml, 'letterboxd:filmYear')),
    watchedDate,
    rewatch: tag(xml, 'letterboxd:rewatch') === 'Yes',
    rating: rating ? Number(rating) : null,
    tmdbId: tmdbId ? Number(tmdbId) : null,
    review: reviewFrom(description),
    // ".../solsticebay/film/baby-driver/1/" → slug "baby-driver"
    slug: link.match(/\/film\/([^/]+)/)?.[1],
    posterUrl: description.match(/<img src="([^"]+)"/)?.[1].replace(/0-\d+-0-\d+-crop/, `${POSTER_SIZE}-crop`),
  };
}

const xml = await fetchText(RSS);
if (!xml) {
  console.log('RSS Letterboxd tidak bisa diambil; films.json tidak diubah.');
  process.exit(0);
}

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => parseItem(m[1])).filter(Boolean);
let films = readFilms();
const before = JSON.stringify(films);
let added = 0;
let posters = 0;

for (const item of items) {
  const key = filmKey(item.title, item.year);

  // Poster disimpan per film (bukan per tontonan), jadi tonton ulang memakai file yang sama.
  let poster;
  if (item.slug && item.posterUrl) {
    const path = `/posters/${item.slug}.jpg`;
    if (await download(item.posterUrl, `public${path}`)) poster = path;
  }

  let entry = films.find(
    (film) => filmKey(film.title, film.year) === key && film.watchedDate === item.watchedDate
  );

  if (!entry) {
    entry = {
      id: `lb${item.guid}`,
      title: item.title,
      year: item.year,
      rating: item.rating,
      watchedDate: item.watchedDate,
      rewatch: item.rewatch,
      letterboxdUrl: item.slug ? `https://letterboxd.com/film/${item.slug}/` : RSS,
      tmdbId: null,
    };
    films.push(entry);
    added++;
    // Film yang tadinya tercatat "watched" tanpa tanggal kini punya entri bertanggal.
    films = films.filter((film) => !(filmKey(film.title, film.year) === key && !film.watchedDate));
  }

  entry.rating = item.rating;
  entry.rewatch = item.rewatch;
  if (item.review) entry.review = item.review;

  // ID TMDB, poster, dan sutradara berlaku untuk semua entri film yang sama.
  for (const film of films.filter((f) => filmKey(f.title, f.year) === key)) {
    if (item.tmdbId) film.tmdbId = item.tmdbId;
    if (poster && !film.poster) {
      film.poster = poster;
      posters++;
    }
  }
}

if (JSON.stringify(films) === before) {
  console.log(`${items.length} entri RSS dibaca; tidak ada perubahan.`);
} else {
  writeFilms(films);
  console.log(`${items.length} entri RSS dibaca: ${added} entri baru, ${posters} poster ditambahkan.`);
}
