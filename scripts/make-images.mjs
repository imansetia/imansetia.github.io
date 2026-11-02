// Buat logo dan gambar pratinjau → public/
//
// Pemakaian:
//   npm run images   (juga otomatis dijalankan oleh `npm run dev` dan `npm run build`)
//
// Hasil (tidak di-commit, selalu dibuat ulang):
//   favicon.svg, favicon.ico, apple-touch-icon.png  logo "i." (huruf i + titik aksen)
//   og-id.jpg, og-en.jpg                           gambar pratinjau link 1200×630
//
// Teks diambil dari src/i18n/ui.ts dan poster dari film favorit, jadi gambar
// pratinjau ikut berubah bila isi situs berubah.
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { loadFont, layout, textSvg, measure, wrap } from './lib/glyphs.mjs';
import { ui } from '../src/i18n/ui.ts';

// Warna dari src/styles/tokens.css (tema terang).
const INK = '#1e2a26';
const INK_2 = '#3a4742';
const MUTED = '#56635d';
const BG = '#e9ece6';
const ACCENT = '#3b4ba8';

const serif = loadFont('newsreader/files/newsreader-latin-400-normal.woff');
const serifItalic = loadFont('newsreader/files/newsreader-latin-400-italic.woff');
const serifItalicBold = loadFont('newsreader/files/newsreader-latin-500-italic.woff');
const mono = loadFont('ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff');

// ---------- Logo: huruf "i" miring dengan titik biru, di kotak 64×64 ----------

function logoSvg({ frame }) {
  const letter = layout(serifItalicBold, 'i', 0, 0, 54);
  // Pusatkan huruf (agak ke kiri, memberi ruang untuk titik).
  const dx = 28 - (letter.box.x1 + letter.box.x2) / 2;
  const dy = 31 - (letter.box.y1 + letter.box.y2) / 2;
  const i = layout(serifItalicBold, 'i', dx, dy, 54);
  const r = 4.8;
  const dot = `<circle cx="${(i.box.x2 + 6).toFixed(2)}" cy="${(i.box.y2 - r).toFixed(2)}" r="${r}" fill="${ACCENT}"/>`;
  const background = frame
    ? `<rect width="64" height="64" rx="12" fill="${BG}"/>` +
      `<rect x="1.5" y="1.5" width="61" height="61" rx="10.5" fill="none" stroke="${INK}" stroke-width="3"/>`
    : `<rect width="64" height="64" fill="${BG}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${background}` +
    i.d.map((d) => `<path d="${d}" fill="${INK}"/>`).join('') +
    `${dot}</svg>\n`
  );
}

/** Berkas .ico berisi satu gambar PNG (didukung semua browser modern). */
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // cadangan
  header.writeUInt16LE(1, 2); // jenis: ikon
  header.writeUInt16LE(1, 4); // jumlah gambar
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // bidang warna
  header.writeUInt16LE(32, 12); // bit per piksel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // posisi data
  return Buffer.concat([header, png]);
}

const favicon = logoSvg({ frame: true });
writeFileSync('public/favicon.svg', favicon);
const png32 = await sharp(Buffer.from(favicon), { density: 300 }).resize(32, 32).png().toBuffer();
writeFileSync('public/favicon.ico', ico(png32, 32));
// iOS membulatkan sudut sendiri, jadi versi ini tanpa bingkai dan tanpa sudut bulat.
await sharp(Buffer.from(logoSvg({ frame: false })), { density: 600 })
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');

// ---------- Gambar pratinjau 1200×630 ----------

const W = 1200;
const H = 630;
const X = 72;

const favorites = JSON.parse(readFileSync('src/data/favorites.json', 'utf8'));
const films = JSON.parse(readFileSync('src/data/films.json', 'utf8'));
const posters = favorites
  .map(
    (fav) =>
      fav.poster ?? films.find((f) => f.title === fav.title && f.year === fav.year && f.poster)?.poster
  )
  .filter(Boolean);

async function ogImage(lang) {
  const t = ui[lang];
  const hello = `${t['home.hello']} `;
  // Kalimat pertama dari paragraf pembuka beranda.
  const lead = t['home.lead'].split(/(?<=\.)\s/)[0];
  const sections = [t['nav.films'], t['nav.books'], t['nav.notes']].join(' · ').toUpperCase();

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">`;
  svg += `<rect width="${W}" height="${H}" fill="${BG}"/>`;
  svg += textSvg(mono, 'IMANSETIA.PAGE', X, 104, 22, MUTED, 0.08);
  svg += `<rect x="${X}" y="128" width="${W - 2 * X}" height="2" fill="${INK}"/>`;

  const size = 80;
  const helloWidth = measure(serif, hello, size);
  const nameWidth = measure(serifItalic, 'Iman', size);
  svg += textSvg(serif, hello, X, 262, size, INK);
  svg += textSvg(serifItalic, 'Iman', X + helloWidth, 262, size, INK);
  svg += textSvg(serif, '.', X + helloWidth + nameWidth, 262, size, INK);

  wrap(serif, lead, 34, 560).forEach((line, i) => {
    svg += textSvg(serif, line, X, 336 + i * 46, 34, INK_2);
  });
  svg += textSvg(mono, sections, X, H - 62, 20, MUTED, 0.08);
  svg += '</svg>';

  // Deretan poster favorit di kanan bawah.
  const width = 110;
  const height = 165;
  const gap = 14;
  const top = H - 62 - height + 4;
  const left = W - X - width - (width + gap) * (posters.length - 1);
  const layers = await Promise.all(
    posters.map(async (poster, i) => ({
      input: await sharp(`public${poster}`).resize(width, height, { fit: 'cover' }).toBuffer(),
      left: left + i * (width + gap),
      top,
    }))
  );

  await sharp(Buffer.from(svg))
    .composite(layers)
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(`public/og-${lang}.jpg`);
}

await ogImage('id');
await ogImage('en');
console.log('Logo dan gambar pratinjau dibuat di public/.');
