// Kamus teks antarmuka dan peta rute untuk dua bahasa.
// Tambah teks baru di kedua bahasa sekaligus; TypeScript akan protes bila ada yang terlewat.

export type Lang = 'id' | 'en';

export const ui = {
  id: {
    'site.description':
      'Situs pribadi Iman Setia Halawa: film yang ditonton, buku yang dibaca, dan catatan.',

    'nav.label': 'Navigasi utama',
    'nav.films': 'Tontonan',
    'nav.books': 'Bacaan',
    'nav.notes': 'Catatan',
    'nav.about': 'Tentang',
    'lang.label': 'Pilih bahasa',
    'theme.toDark': 'Ganti ke tema gelap',
    'theme.toLight': 'Ganti ke tema terang',

    'rating.of': '{n} dari 5',
    'rating.none': 'tanpa rating',
    'date.none': 'Tanpa tanggal',
    'poster.alt': 'Poster {title} ({year})',
    'cover.alt': 'Sampul {title}',
    'draft': 'Draft',

    'home.label': '01 / Beranda',
    'home.hello': 'Halo, saya',
    'home.lead':
      'Mahasiswa hukum di Universitas Sumatera Utara, Medan. Di sini saya mencatat film yang membekas, buku yang saya selesaikan, dan pikiran yang belum sempat rapi.',
    'home.place': 'Medan, ID',
    'home.filmCount': '{n} film tercatat',
    'home.bookCount': '{n} buku tercatat',
    'home.sync': 'Sinkron: Letterboxd · Goodreads',
    'now.label': '02 / Sekarang',
    'now.latest': 'Entri terakhir: {date}',
    'now.watched': 'Terakhir ditonton',
    'now.reading': 'Sedang dibaca',
    'now.rewatch': 'tonton ulang',
    'films.label': '03 / Tontonan',
    'films.seeAll': 'Lihat semua {n}',
    'films.heading': 'Film yang membekas',
    'films.subtitle':
      'Hampir semuanya tentang keadilan: siapa yang dilindungi hukum, dan siapa yang tidak.',
    'films.recent': 'Log terbaru',
    'books.label': '04 / Bacaan',
    'books.fullShelf': 'Rak lengkap',
    'books.heading': 'Rak buku',
    'notes.label': '05 / Catatan',
    'notes.archive': 'Arsip',
    'projects.label': '06 / Proyek',
    'projects.text': 'Eksperimen teknologi saya ada di',

    'filmsPage.title': 'Tontonan',
    'filmsPage.heading': 'Film yang saya tonton',
    'filmsPage.description': 'Katalog film yang ditonton Iman Setia, disinkronkan dari Letterboxd.',
    'filmsPage.meta': '{n} film tercatat · sumber: Letterboxd',
    'filmsPage.views': 'Pilih tampilan',
    'filmsPage.grid': 'Grid',
    'filmsPage.table': 'Tabel',
    'filmsPage.tableLabel': 'Semua film dalam tabel',
    'filmsPage.group': '{year} · {n} film',

    'booksPage.title': 'Bacaan',
    'booksPage.heading': 'Rak buku',
    'booksPage.description': 'Rak buku Iman Setia, disinkronkan dari Goodreads.',
    'booksPage.meta': '{n} buku tercatat · sumber: Goodreads',
    'booksPage.genres': 'Genre favorit: klasik, kriminal, sejarah, misteri, puisi, thriller.',
    'booksPage.reading': 'Sedang dibaca · {n}',
    'booksPage.read': 'Sudah dibaca · {n}',

    'notesPage.title': 'Catatan',
    'notesPage.heading': 'Catatan',
    'notesPage.description': 'Catatan dan tulisan Iman Setia, dalam bahasa Indonesia dan Inggris.',
    'notesPage.meta': '{n} catatan',
    'notesPage.filter': 'Filter bahasa',
    'notesPage.all': 'Semua',
    'notesPage.empty': 'Belum ada catatan.',
    'note.back': 'Kembali ke arsip catatan',
    'note.readIn.id': 'Baca dalam bahasa Indonesia',
    'note.readIn.en': 'Read in English',

    'about.title': 'Tentang',
    'about.heading': 'Tentang saya',
    'about.description':
      'Tentang Iman Setia Halawa, mahasiswa hukum di Universitas Sumatera Utara.',
    'about.bio': 'Bio',
    'about.bioText': '[BIO — beberapa kalimat tentang diri Iman, ditulis sendiri oleh Iman.]',
    'about.education': 'Pendidikan',
    'about.degree': 'S-1 Ilmu Hukum',
    'about.school': 'Universitas Sumatera Utara, Medan · [TAHUN MASUK]',
    'about.interests': 'Minat',
    'about.interestsText': 'Hukum, film, buku, dan teknologi.',
    'about.interestsMore': '[Kalimat tambahan tentang minat, opsional.]',
    'about.contact': 'Kontak',
  },
  en: {
    'site.description':
      'Personal site of Iman Setia Halawa: films watched, books read, and notes.',

    'nav.label': 'Main navigation',
    'nav.films': 'Films',
    'nav.books': 'Books',
    'nav.notes': 'Notes',
    'nav.about': 'About',
    'lang.label': 'Choose language',
    'theme.toDark': 'Switch to dark theme',
    'theme.toLight': 'Switch to light theme',

    'rating.of': '{n} out of 5',
    'rating.none': 'no rating',
    'date.none': 'Undated',
    'poster.alt': 'Poster for {title} ({year})',
    'cover.alt': 'Cover of {title}',
    'draft': 'Draft',

    'home.label': '01 / Home',
    'home.hello': "Hi, I'm",
    'home.lead':
      'Law student at Universitas Sumatera Utara, Medan. Here I keep track of films that stayed with me, books I have finished, and thoughts not yet put in order.',
    'home.place': 'Medan, ID',
    'home.filmCount': '{n} films logged',
    'home.bookCount': '{n} books logged',
    'home.sync': 'Synced: Letterboxd · Goodreads',
    'now.label': '02 / Now',
    'now.latest': 'Latest entry: {date}',
    'now.watched': 'Last watched',
    'now.reading': 'Currently reading',
    'now.rewatch': 'rewatch',
    'films.label': '03 / Films',
    'films.seeAll': 'See all {n}',
    'films.heading': 'Films that stayed with me',
    'films.subtitle':
      'Almost all of them are about justice: who the law protects, and who it does not.',
    'films.recent': 'Recent log',
    'books.label': '04 / Books',
    'books.fullShelf': 'Full shelf',
    'books.heading': 'Bookshelf',
    'notes.label': '05 / Notes',
    'notes.archive': 'Archive',
    'projects.label': '06 / Projects',
    'projects.text': 'My tech experiments live at',

    'filmsPage.title': 'Films',
    'filmsPage.heading': 'Films I have watched',
    'filmsPage.description': 'Catalogue of films watched by Iman Setia, synced from Letterboxd.',
    'filmsPage.meta': '{n} films logged · source: Letterboxd',
    'filmsPage.views': 'Choose view',
    'filmsPage.grid': 'Grid',
    'filmsPage.table': 'Table',
    'filmsPage.tableLabel': 'All films as a table',
    'filmsPage.group': '{year} · {n} films',

    'booksPage.title': 'Books',
    'booksPage.heading': 'Bookshelf',
    'booksPage.description': "Iman Setia's bookshelf, synced from Goodreads.",
    'booksPage.meta': '{n} books logged · source: Goodreads',
    'booksPage.genres': 'Favourite genres: classics, crime, history, mystery, poetry, thriller.',
    'booksPage.reading': 'Currently reading · {n}',
    'booksPage.read': 'Read · {n}',

    'notesPage.title': 'Notes',
    'notesPage.heading': 'Notes',
    'notesPage.description': 'Notes and writing by Iman Setia, in Indonesian and English.',
    'notesPage.meta': '{n} notes',
    'notesPage.filter': 'Filter by language',
    'notesPage.all': 'All',
    'notesPage.empty': 'No notes yet.',
    'note.back': 'Back to the notes archive',
    'note.readIn.id': 'Baca dalam bahasa Indonesia',
    'note.readIn.en': 'Read in English',

    'about.title': 'About',
    'about.heading': 'About me',
    'about.description': 'About Iman Setia Halawa, a law student at Universitas Sumatera Utara.',
    'about.bio': 'Bio',
    'about.bioText': '[BIO — a few sentences about Iman, written by Iman.]',
    'about.education': 'Education',
    'about.degree': 'Bachelor of Laws (S-1 Ilmu Hukum)',
    'about.school': 'Universitas Sumatera Utara, Medan · [YEAR STARTED]',
    'about.interests': 'Interests',
    'about.interestsText': 'Law, film, books, and technology.',
    'about.interestsMore': '[An extra sentence about interests, optional.]',
    'about.contact': 'Contact',
  },
} as const;

export type UiKey = keyof (typeof ui)['id'];

/** Ambil fungsi penerjemah untuk satu bahasa. `{n}` dsb. diganti dengan nilai `vars`. */
export function useTranslations(lang: Lang) {
  return (key: UiKey, vars: Record<string, string | number> = {}) =>
    (ui[lang][key] as string).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

/** Bahasa halaman saat ini, dari i18n Astro. */
export function langOf(currentLocale: string | undefined): Lang {
  return currentLocale === 'en' ? 'en' : 'id';
}

export const otherLang = (lang: Lang): Lang => (lang === 'id' ? 'en' : 'id');

// Halaman padanan di kedua bahasa (DESIGN.md bagian 5).
export const routes = {
  home: { id: '/', en: '/en/' },
  films: { id: '/tontonan/', en: '/en/films/' },
  books: { id: '/bacaan/', en: '/en/books/' },
  notes: { id: '/catatan/', en: '/en/notes/' },
  about: { id: '/tentang/', en: '/en/about/' },
} as const;

export type Page = keyof typeof routes;

export const notePath = (lang: Lang, slug: string) => `${routes.notes[lang]}${slug}/`;

/** Format angka: 4.5 → "4,5" (ID) atau "4.5" (EN). */
export const formatNumber = (lang: Lang, value: number) =>
  lang === 'id' ? String(value).replace('.', ',') : String(value);
