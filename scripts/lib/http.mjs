// Fungsi bantu jaringan untuk script sinkron. Semua fungsi "aman gagal":
// bila server tidak bisa dihubungi, kembalikan null/false, bukan melempar error.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const TIMEOUT = 20_000;
const HEADERS = { 'User-Agent': 'imansetia.page sync (+https://imansetia.page)' };

/** Ambil teks dari URL. null bila gagal. */
export async function fetchText(url, headers = {}) {
  try {
    const res = await fetch(url, { headers: { ...HEADERS, ...headers }, signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) {
      console.warn(`  ${res.status} ${url}`);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.warn(`  Gagal mengambil ${url}: ${error.message}`);
    return null;
  }
}

/** Ambil JSON dari URL. null bila gagal. */
export async function fetchJson(url, headers = {}) {
  const text = await fetchText(url, headers);
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** Unduh gambar ke `dest`. true bila berhasil (atau file sudah ada). */
export async function download(url, dest) {
  if (existsSync(dest)) return true;
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT) });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.startsWith('image/')) return false;
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch (error) {
    console.warn(`  Gagal mengunduh ${url}: ${error.message}`);
    return false;
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
