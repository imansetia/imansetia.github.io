# DESIGN.md — Redesign imansetia.page

Brief ini adalah sumber kebenaran untuk redesign situs pribadi **imansetia.page**.
Dirumuskan bersama pemilik situs (Iman Setia Halawa) sebelum implementasi. Baca seluruhnya
sebelum menulis kode. Kalau ada yang bertentangan dengan kondisi repo, **tanyakan dulu ke Iman**,
jangan menebak.

Catatan untuk Claude Code: Iman masih pemula dalam coding. Jelaskan langkah dengan bahasa
sederhana (bahasa Indonesia), kerjakan bertahap, dan minta Iman mengecek preview sebelum lanjut.

---

## 1. Ringkasan

- **Apa:** website personal Iman — mahasiswa S-1 Ilmu Hukum, Universitas Sumatera Utara (Medan) —
  yang memuat "perpustakaan" pribadi: film yang ditonton, buku yang dibaca, dan catatan/tulisan.
- **Arah visual:** gabungan dua arah yang disetujui:
  - dari **Jurnal hangat**: tipografi serif (Newsreader), palet sage + indigo, nada personal;
  - dari **Arsip**: struktur katalog — seksi bernomor (`01 / BERANDA`), label mono huruf kapital,
    garis tipis, tabel "log" seperti kartu katalog.
- **Nada:** tenang, jujur, personal. Bukan portofolio korporat, bukan blog generik.
- **Benang merah konten:** film favorit Iman hampir semuanya tentang keadilan (Capernaum,
  Incendies, Parasite, The Hunt, Hope, The Battle of Algiers) — nyambung dengan studi hukumnya.
- **Larangan:** jangan meniru tampilan Goodreads (krem + cokelat) maupun Letterboxd.
  Palet di bawah sudah dipilih untuk menghindari itu.

## 2. Situs lama — yang dibuang

Situs sekarang adalah template berisi placeholder. Buang:
- Bio palsu ("designer and archivist", "Jakarta"), "Indexed 1998–2026", "Edition No. 04".
- Gambar `picsum.photos`.
- Fitur 3D "drag to rotate / tilt".
- Link mati (GitHub/LinkedIn ke halaman utama, anchor `#` tanpa tujuan).
- Semua judul buku/film/catatan contoh yang bukan milik Iman.

Pertahankan: konsep arsip, seksi "Now/Sekarang", dark mode.

## 3. Stack & hosting

- **Astro** (versi stabil terbaru), output statis.
- Hosting tetap **GitHub Pages**, deploy via GitHub Actions (`withastro/action`).
- Domain **imansetia.page** (registrar Name.com, DNS di Cloudflare — **jangan diubah**).
  Pastikan `public/CNAME` berisi `imansetia.page` supaya domain tidak lepas saat deploy.
- Sebelum mulai: **audit repo yang ada** (struktur, branch Pages, file CNAME, setting Pages) dan
  laporkan ke Iman. Kerjakan redesign di branch baru, bukan langsung di `main`.
- JavaScript seminimal mungkin (hanya toggle tema & bahasa). Tidak perlu framework UI.
- Font di-self-host via `@fontsource` (Newsreader, IBM Plex Mono), bukan link Google Fonts.

## 4. Design tokens

Definisikan sebagai CSS custom properties di `src/styles/tokens.css`.

### Warna — terang (default)

| Token | Nilai | Pemakaian |
|---|---|---|
| `--bg` | `#E9ECE6` | latar halaman (sage pucat) |
| `--surface` | `#DDE2DA` | kartu "Sekarang", blok tersorot |
| `--ink` | `#1E2A26` | teks utama, garis seksi |
| `--ink-2` | `#3A4742` | teks sekunder, deskripsi |
| `--muted` | `#56635D` | label mono, tanggal, meta |
| `--rule` | `#BCC5BC` | garis antar-baris |
| `--dash` | `#8F9B92` | garis putus-putus placeholder / state kosong |
| `--accent` | `#3B4BA8` | link, rating bintang |
| `--accent-hover` | `#26337A` | hover link |
| `--poster-1..5` | `#4B5A8F`, `#2F3B33`, `#3B4BA8`, `#56635D`, `#1E2A26` | blok poster cadangan bila gambar tidak ada |

### Warna — gelap

Situs **selalu terbuka terang**; `prefers-color-scheme` tidak diikuti. Mode gelap hanya lewat
tombol tema (`data-theme="dark"` di `<html>`), pilihan disimpan di `localStorage` (dibungkus
try/catch). Script kecil di `<head>` membaca `localStorage` sebelum render supaya tidak ada
kedipan tema.

| Token | Nilai |
|---|---|
| `--bg` | `#121816` |
| `--surface` | `#1A2220` |
| `--ink` | `#E3E8E2` |
| `--ink-2` | `#BAC4BD` |
| `--muted` | `#8E9A93` |
| `--rule` | `#2C3632` |
| `--dash` | `#4A5651` |
| `--accent` | `#9AA8F0` |
| `--accent-hover` | `#C3CCF7` |

Semua pasangan teks/latar di atas lolos kontras WCAG AA (≥ 4.5:1). Jangan menambah warna baru
tanpa mengecek kontras.

### Tipografi

- **Serif (judul & isi):** Newsreader — 400, 500, 400 italic.
- **Mono (label, navigasi, tanggal, rating, meta):** IBM Plex Mono — 400, 500.
- Label mono selalu HURUF KAPITAL, `letter-spacing: 0.08–0.1em`.
- Italic dipakai untuk judul karya (film/buku) dan aksen nama ("Halo, saya *Iman*.").

| Peran | Desktop | Mobile | Font |
|---|---|---|---|
| H1 beranda | 76px / 1.04 | 44px | Newsreader 400 |
| H2 seksi | 40px | 30px | Newsreader 400 |
| Judul kartu / catatan | 28–30px | 24px | Newsreader (italic untuk judul karya) |
| Intro / lead | 23px / 1.55 | 19px | Newsreader |
| Isi | 19–20px / 1.6 | 18px | Newsreader |
| Label mono | 12px | 12px | IBM Plex Mono, caps, tracking 0.1em |
| Nav | 13px | 13px | IBM Plex Mono, caps |

### Layout & spasi

- Kontainer: `max-width: 1120px`, padding samping `24px` (16px di HP).
- Pola **seksi**: `border-top: 1px solid var(--ink)`, padding `32px` atas / `72px` bawah.
  Baris kepala seksi: label mono `0N / NAMA` di kiri, link mono `LIHAT SEMUA →` di kanan.
- Baris tabel/log: `border-bottom: 1px solid var(--rule)`, padding `14px 0`.
- Radius kecil saja: kartu 4px, poster 2px.
- Tanpa gradien, tanpa bayangan tebal, tanpa emoji, tanpa kartu dengan border kiri berwarna.
- Responsif: semua baris flex `flex-wrap`, grid poster turun dari 5 kolom → 3 → 2 di HP.
  Tabel log di HP menjadi dua baris per entri (tanggal + rating di atas, judul di bawah).

## 5. Struktur halaman & routing

Bahasa default **Inggris** di root, Indonesia di `/id/`. Pakai i18n bawaan Astro
(`defaultLocale: 'en'`, `locales: ['en','id']`, `prefixDefaultLocale: false`).
**Tidak ada** pengalihan otomatis berdasarkan bahasa browser.

| Halaman | EN | ID |
|---|---|---|
| Beranda | `/` | `/id/` |
| Tontonan (katalog film) | `/films/` | `/id/tontonan/` |
| Bacaan (rak buku) | `/books/` | `/id/bacaan/` |
| Catatan (daftar) | `/notes/` | `/id/catatan/` |
| Satu catatan | `/notes/[slug]/` | `/id/catatan/[slug]/` |
| Tentang | `/about/` | `/id/tentang/` |

`hreflang` `x-default` menunjuk versi Inggris. Alamat lama tetap hidup lewat `redirects` di
`astro.config.mjs`: `/tontonan/`, `/bacaan/`, `/catatan/…`, `/tentang/` → `/id/…`, dan
`/en/…` (versi Inggris lama) → alamat Inggris di root. (Perubahan November 2026; sebelumnya
Indonesia di root dan Inggris di `/en/`.)

Teks antarmuka (menu, label, judul seksi, halaman Tentang) diterjemahkan lewat satu file kamus
`src/i18n/ui.ts`. **Catatan tidak wajib diterjemahkan**: tiap catatan punya `lang`, dan tampil di
kedua versi bahasa dengan label bahasanya (`ID` / `EN`). Bila catatan punya terjemahan,
hubungkan lewat frontmatter `translationOf`.

Toggle `ID / EN` di header pindah ke halaman padanan, bukan ke beranda.

## 6. Komponen

- `Header` — kiri: "Iman Setia" (Newsreader italic 26px, link ke beranda). Kanan: nav mono
  TONTONAN · BACAAN · CATATAN · TENTANG, toggle `ID / EN`, toggle tema (tombol ikon, ada
  `aria-label`). Garis bawah `1px var(--ink)`. Di HP nav turun ke baris kedua (wrap), tanpa
  hamburger.
- `SectionHeader` — label `0N / NAMA` + link opsional di kanan.
- `NowCard` — dua varian:
  - *Terakhir ditonton*: poster 96px, label mono, judul italic, "Sutradara, Tahun · tonton ulang"
    bila rewatch, kutipan ulasan Iman bila ada, rating.
  - *Sedang dibaca*: sama, untuk buku. **Kartu disembunyikan otomatis bila kosong.**
- `PosterCard` — poster rasio 2:3; bila gambar tidak ada, blok warna `--poster-n` dengan nomor
  mono di atas dan judul italic di bawah. Di bawahnya: "Sutradara, Tahun" dan rating mono.
- `LogRow` — tanggal (`DD.MM.YYYY`, mono) · judul (serif) · tahun (mono) · rating (mono, accent).
- `BookCard` / `BookRow` — sampul 2:3 (atau placeholder garis putus-putus) + judul italic + penulis.
- `NoteItem` — tanggal + label bahasa di kolom kiri (mono), judul (28px) + 2 kalimat ringkasan.
- `Rating` — bintang `★` dan `½` dari angka 0.5–5. Sertakan teks tersembunyi untuk pembaca layar
  ("4,5 dari 5"). Entri tanpa rating: tampilkan `—`.
- `Footer` — `© 2026 IMAN SETIA HALAWA` + link EMAIL · GITHUB · LETTERBOXD · GOODREADS.

## 7. Beranda — urutan & isi

1. **01 / BERANDA**
   - H1: `Halo, saya *Iman*.` (EN: `Hi, I'm *Iman*.`)
   - Lead: "Mahasiswa hukum di Universitas Sumatera Utara, Medan. Di sini saya mencatat film yang
     membekas, buku yang saya selesaikan, dan pikiran yang belum sempat rapi."
   - Baris meta mono: `MEDAN, ID · {n} FILM TERCATAT · {n} BUKU TERCATAT · SINKRON: LETTERBOXD · GOODREADS`
     (angka dihitung otomatis dari data).
2. **02 / SEKARANG** — kanan atas: `ENTRI TERAKHIR: {tanggal}`. Dua `NowCard` berdampingan
   (bertumpuk di HP).
3. **03 / TONTONAN** — H2 "Film yang membekas", subjudul italic
   "Hampir semuanya tentang keadilan: siapa yang dilindungi hukum, dan siapa yang tidak."
   *(kalimat usulan — Iman boleh mengganti)*. Grid 5 `PosterCard` favorit, lalu label
   `LOG TERBARU` dan 6 `LogRow` terbaru. Link `LIHAT SEMUA {n} →`.
4. **04 / BACAAN** — H2 "Rak buku", 4 buku terbaru dari rak *read*. Link `RAK LENGKAP →`.
5. **05 / CATATAN** — 3 catatan terbaru. Link `ARSIP →`. Bila belum ada catatan, sembunyikan
   seksi ini (jangan tampilkan placeholder di situs live).
6. **06 / PROYEK** — satu kalimat: "Eksperimen teknologi saya ada di botchan.tech." (link).
7. **Footer.**

## 8. Halaman lain

- **Tontonan:** H1 + jumlah film. Filter sederhana (tahun ditonton, rating) via query/anchor —
  opsional, jangan pakai library. Tampilan default: grid poster dikelompokkan per tahun ditonton,
  dengan toggle ke tampilan tabel `LogRow`. Tiap entri link ke halaman film di Letterboxd.
- **Bacaan:** rak *Sedang dibaca* (bila ada) di atas, lalu *Sudah dibaca*. Genre favorit Iman
  (dari profil Goodreads): klasik, kriminal, sejarah, misteri, puisi, thriller.
- **Catatan:** daftar `NoteItem` urut tanggal, filter bahasa (Semua / ID / EN).
- **Satu catatan:** lebar baca ±680px, Newsreader 20px/1.65, tanggal + bahasa di atas, link
  ke terjemahan bila ada, link kembali ke arsip.
- **Tentang:** bio, pendidikan (S-1 Ilmu Hukum USU), minat (hukum, film, buku, teknologi),
  link ke botchan.tech, kontak. Teks ditulis Iman (kunci `about.*` di `src/i18n/ui.ts`):
  - Bio (ID): "Saya Iman Setia Halawa, mahasiswa hukum di Universitas Sumatera Utara. Di kelas
    saya belajar bagaimana hukum seharusnya bekerja; lewat film dan buku saya melihat apa yang
    terjadi ketika ia gagal. Cerita yang paling lama tinggal di kepala saya hampir selalu tentang
    itu: seorang anak yang menggugat orang tuanya, keluarga yang terbelah perang, orang yang
    dituduh tanpa bukti. Situs ini catatan dari keduanya."
  - Bio (EN): "I'm Iman Setia Halawa, a law student at Universitas Sumatera Utara. In class I
    learn how the law is supposed to work; through films and books I see what happens when it
    fails. The stories that stay with me longest are almost always about that: a child who sues
    his parents, a family torn apart by war, a man accused without proof. This site is a record
    of both."
  - Kalimat minat (ID): "Eksperimen teknologi saya, dari situs web sampai agen AI, saya
    kumpulkan di botchan.tech." / (EN): "My tech experiments, from websites to AI agents, live
    at botchan.tech."
  - Tahun masuk: masih placeholder `[TAHUN MASUK]` / `[YEAR STARTED]`.

## 9. Data

Semua data disimpan sebagai JSON di repo (`src/data/`), sehingga build tetap jalan walau
sumber luar sedang mati.

### Film — Letterboxd (username `solsticebay`)
- **Impor awal:** Iman mengunduh export dari Letterboxd (Settings → Data → Export).
  Script `scripts/import-letterboxd.mjs` membaca `diary.csv` (+ `reviews.csv` untuk teks ulasan)
  → `src/data/films.json`.
- **Sinkron rutin:** `scripts/sync-letterboxd.mjs` membaca RSS
  `https://letterboxd.com/solsticebay/rss/` (sudah dicek: publik, berisi judul, tahun, rating,
  `watchedDate`, `rewatch`, ID TMDB, URL poster, teks ulasan). Gabungkan ke `films.json` tanpa
  duplikat (kunci: `guid`, atau `filmTitle + watchedDate`). RSS hanya memuat ±50 entri terakhir —
  karena itu impor CSV tetap perlu.
- **Poster:** unduh gambar poster dari URL di RSS ke `public/posters/` saat sinkron (jangan
  hotlink). Untuk entri lama dari CSV tanpa poster: opsional pakai TMDB API dengan secret
  `TMDB_API_KEY`; bila tidak ada, pakai blok poster cadangan.
- **Favorit:** tidak ada di RSS — atur manual di `src/data/favorites.json`. Isi awal (minta
  Iman konfirmasi): Capernaum, Incendies, Parasite, The Hunt (2012), Hope (2013).
- Bentuk entri: `{ id, title, year, director?, rating, watchedDate, rewatch, review?, letterboxdUrl, tmdbId, poster? }`.

### Buku — Goodreads (user ID `201369776`)
- **Impor awal:** export CSV (My Books → Import and export) → `scripts/import-goodreads.mjs`
  → `src/data/books.json`.
- **Sinkron rutin:** RSS rak `https://www.goodreads.com/review/list_rss/201369776?shelf=read`
  (dan `?shelf=currently-reading`) **sudah dicek 2 dan 4 November 2026: tidak bisa diakses (404)**,
  padahal profil publik. Karena itu buku baru masuk lewat impor CSV ulang, dan sinkron hanya
  melengkapi sampul (`scripts/sync-covers.mjs`).
- **Sampul:** diunduh ke repo (`public/covers/{id}.jpg`) saat sinkron, tidak di-hotlink. Urutan
  sumber: (1) Open Library via ISBN (`https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg`);
  (2) bila tidak ada, gambar `og:image` dari halaman buku di Goodreads (sampul edisi yang
  di-rak-kan, diperkecil ke lebar 330px) — dipakai untuk buku tanpa ISBN dan buku Indonesia
  yang tidak ada di Open Library; (3) bila tetap tidak ada → placeholder garis putus-putus.
- Bentuk entri: `{ id, title, author, year?, rating?, shelf, dateRead?, isbn?, goodreadsUrl, cover? }`.

### Catatan
- Astro content collection `src/content/notes/*.md`.
- Frontmatter: `title`, `date`, `lang` (`id` | `en`), `summary`, `translationOf?`, `draft?`.

### Otomatisasi
- Sinkron Letterboxd & Goodreads berjalan **sekali sehari**, bukan per jam
  (`.github/workflows/sync.yml`, `cron: '17 22 * * *'` UTC ≈ 05:17 WIB), plus `workflow_dispatch`
  untuk pemicu manual dari tab Actions. Urutannya: `npm run sync` → poster (`public/posters/`)
  dan sampul (`public/covers/`) diunduh ke repo → commit `src/data/*.json` & gambar baru ke `main`
  bila ada perubahan → jalankan workflow deploy.
- Script sinkron harus aman gagal: bila fetch error, biarkan data lama dan jangan gagalkan build.

## 10. Aksesibilitas & performa

- HTML semantik (`header`, `nav`, `main`, `section`, `article`, `footer`), satu `h1` per halaman.
- Focus ring terlihat jelas (outline 2px `--accent`).
- `alt` pada poster/sampul: "Poster {judul} ({tahun})".
- `lang="id"` / `lang="en"` di `<html>` sesuai versi; catatan berbahasa lain diberi `lang` sendiri.
- Gambar: `loading="lazy"`, ukuran eksplisit, format teroptimasi (Astro `<Image>`).
- Target Lighthouse ≥ 95 untuk Performance, Accessibility, Best Practices, SEO.
- Meta OG dasar + `sitemap` (`@astrojs/sitemap`) + `hreflang` antar-bahasa.

## 11. Konten yang harus disiapkan Iman

- [ ] File export Letterboxd & Goodreads.
- [ ] Alamat email yang mau ditampilkan.
- [x] Teks halaman Tentang (ID dan EN).
- [ ] Tahun masuk kuliah (halaman Tentang).
- [ ] Konfirmasi 5 film favorit dan kalimat subjudul seksi Tontonan.
- [ ] (Opsional) 1–3 catatan pertama.

Sampai diisi, pakai placeholder berkurung siku, mis. `[EMAIL]`, dan **jangan** mengarang isi.

## 12. Tahapan kerja (untuk Claude Code)

Kerjakan berurutan. Di akhir tiap tahap: jalankan `npm run dev`, minta Iman cek di browser,
lalu commit dengan pesan yang jelas.

0. **Audit repo** — laporkan struktur sekarang & cara deploy. Buat branch `redesign`.
1. **Fondasi** — scaffold Astro, `tokens.css`, font, `BaseLayout`, `Header`, `Footer`, toggle tema.
2. **Beranda statis** — semua komponen beranda dengan data contoh di JSON (pakai daftar film
   dari bagian 9).
3. **Impor data** — script impor CSV Letterboxd & Goodreads; beranda membaca data asli.
4. **Halaman lain** — Tontonan, Bacaan, Catatan (+ satu catatan contoh berstatus `draft`), Tentang.
5. **Dwibahasa** — i18n, kamus UI, rute `/en/`, toggle bahasa.
6. **Sinkron & poster** — script RSS, unduh poster/sampul.
7. **Deploy** — workflow GitHub Pages + `CNAME`; uji di branch dulu, lalu merge ke `main`
   setelah Iman setuju.
8. **Jadwal** — workflow sinkron harian.

## 13. Daftar periksa akhir

- [ ] Tidak ada sisa teks/gambar template lama.
- [ ] Semua link hidup (tidak ada `href="#"`).
- [ ] Tampilan benar di lebar 360px, 768px, 1280px; terang & gelap.
- [ ] Seksi kosong (Sedang dibaca, Catatan) tersembunyi otomatis.
- [ ] `imansetia.page` tetap tersambung setelah deploy (CNAME ada, HTTPS aktif).
- [ ] Build tetap sukses walau RSS tidak bisa diakses.
