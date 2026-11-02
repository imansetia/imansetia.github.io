// Ubah teks menjadi garis SVG (path) memakai font situs dari @fontsource, supaya
// logo dan gambar pratinjau tampil sama di mana pun tanpa bergantung font komputer.
import { readFileSync } from 'node:fs';
import opentype from 'opentype.js';

export function loadFont(file) {
  const buffer = readFileSync(`node_modules/@fontsource/${file}`);
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

// Path data ditulis sendiri: toPathData() opentype.js kadang menulis "NaN" untuk
// koordinat tertentu, sehingga huruf hilang saat digambar.
const num = (v) => String(Math.round(v * 100) / 100);
function toD(path) {
  return path.commands
    .map((c) => {
      if (c.type === 'Z') return 'Z';
      if (c.type === 'Q') return `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`;
      if (c.type === 'C') return `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`;
      return `${c.type}${num(c.x)} ${num(c.y)}`;
    })
    .join('');
}

/**
 * Susun teks huruf demi huruf (kerning dari font, `spacing` dalam em).
 * Mengembalikan path per huruf, lebar total, dan kotak tinta (bounding box).
 */
export function layout(font, text, x, y, size, spacing = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((ch) => font.charToGlyph(ch));
  const paths = [];
  let cursor = x;
  glyphs.forEach((glyph, i) => {
    paths.push(glyph.getPath(cursor, y, size));
    const kern = i < glyphs.length - 1 ? font.getKerningValue(glyph, glyphs[i + 1]) || 0 : 0;
    cursor += (glyph.advanceWidth + kern) * scale + spacing * size;
  });

  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const path of paths) {
    const b = path.getBoundingBox();
    if (b.x1 === b.x2) continue; // spasi
    box.x1 = Math.min(box.x1, b.x1);
    box.y1 = Math.min(box.y1, b.y1);
    box.x2 = Math.max(box.x2, b.x2);
    box.y2 = Math.max(box.y2, b.y2);
  }
  return { d: paths.map(toD).filter(Boolean), width: cursor - x - spacing * size, box };
}

/** Lebar teks dalam piksel. */
export const measure = (font, text, size, spacing = 0) => layout(font, text, 0, 0, size, spacing).width;

/** Elemen SVG untuk teks, satu <path> per huruf. */
export function textSvg(font, text, x, y, size, fill, spacing = 0) {
  const paths = layout(font, text, x, y, size, spacing).d.map((d) => `<path d="${d}"/>`);
  return `<g fill="${fill}">${paths.join('')}</g>`;
}

/** Bungkus teks menjadi beberapa baris selebar `maxWidth`. */
export function wrap(font, text, size, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(font, next, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  return [...lines, line];
}
