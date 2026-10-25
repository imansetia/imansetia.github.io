/**
 * ============================================================================
 * IMAN SETIA'S LIBRARY — ARCHIVE DATA (JSON)
 * ============================================================================
 * HOW TO ADD OR EDIT ITEMS:
 *
 * 1. FAVORITE BOOKS (`ARCHIVE_DATA.books`):
 *    Copy an existing object inside the `books` array and update:
 *    - `id`: Unique string identifier (e.g., "06")
 *    - `title`: Book title
 *    - `author`: Author's name
 *    - `cover`: Image path or URL (2:3 ratio recommended, e.g., 400x600px)
 *
 * 2. FAVORITE FILMS (`ARCHIVE_DATA.films`):
 *    Copy an existing object inside the `films` array and update:
 *    - `id`: Unique string identifier (e.g., "06")
 *    - `title`: Film title
 *    - `year`: Release year (and optional director name)
 *    - `poster`: Image path or URL (2:3 ratio recommended, e.g., 400x600px)
 *
 * 3. CURRENT ROTATION (`ARCHIVE_DATA.currently`) & NOTES (`ARCHIVE_DATA.notes`):
 *    Edit the fields below to update the "Currently Reading/Watching" cards
 *    and the "Latest Notes" rows on the homepage.
 * ============================================================================
 */

const ARCHIVE_DATA = {
  currently: [
    {
      label: "CURRENTLY READING",
      status: "PAGE 142 OF 288",
      title: "The Rings of Saturn",
      creator: "W.G. Sebald · 1995",
      image: "https://picsum.photos/seed/sebald-saturn/400/600?grayscale",
      alt: "Cover of The Rings of Saturn by W.G. Sebald",
      note: "Tracing a walking tour of the Suffolk coast where memory, empire, and quiet devastation blur into a hypnotic literary labyrinth."
    },
    {
      label: "CURRENTLY WATCHING",
      status: "35MM RESTORATION",
      title: "La Notte",
      creator: "Dir. Michelangelo Antonioni · 1961",
      image: "https://picsum.photos/seed/antonioni-notte/400/600?grayscale",
      alt: "Poster of La Notte directed by Michelangelo Antonioni",
      note: "Architectural framing and emotional drift across twenty-four hours in postwar Milan. Every shadow feels deliberate."
    }
  ],

  books: [
    {
      id: "01",
      title: "In Praise of Shadows",
      author: "Jun’ichirō Tanizaki",
      cover: "https://picsum.photos/seed/tanizaki-shadows/400/600?grayscale"
    },
    {
      id: "02",
      title: "Invisible Cities",
      author: "Italo Calvino",
      cover: "https://picsum.photos/seed/calvino-cities/400/600?grayscale"
    },
    {
      id: "03",
      title: "Água Viva",
      author: "Clarice Lispector",
      cover: "https://picsum.photos/seed/lispector-agua/400/600?grayscale"
    },
    {
      id: "04",
      title: "The Book of Disquiet",
      author: "Fernando Pessoa",
      cover: "https://picsum.photos/seed/pessoa-disquiet/400/600?grayscale"
    },
    {
      id: "05",
      title: "Dept. of Speculation",
      author: "Jenny Offill",
      cover: "https://picsum.photos/seed/offill-speculation/400/600?grayscale"
    }
  ],

  films: [
    {
      id: "01",
      title: "In the Mood for Love",
      year: "2000 · Wong Kar-wai",
      poster: "https://picsum.photos/seed/itmfl-2000/400/600?grayscale"
    },
    {
      id: "02",
      title: "Yi Yi",
      year: "2000 · Edward Yang",
      poster: "https://picsum.photos/seed/yiyi-2000/400/600?grayscale"
    },
    {
      id: "03",
      title: "Paris, Texas",
      year: "1984 · Wim Wenders",
      poster: "https://picsum.photos/seed/paristexas-1984/400/600?grayscale"
    },
    {
      id: "04",
      title: "Portrait of a Lady on Fire",
      year: "2019 · Céline Sciamma",
      poster: "https://picsum.photos/seed/portrait-2019/400/600?grayscale"
    },
    {
      id: "05",
      title: "Close-Up",
      year: "1990 · Abbas Kiarostami",
      poster: "https://picsum.photos/seed/closeup-1990/400/600?grayscale"
    }
  ],

  notes: [
    {
      number: "01",
      title: "On the Tactile Weight of Clothbound Paperbacks and Faded Marginalia",
      date: "OCT 12, 2026",
      datetime: "2026-10-12",
      href: "#note-01"
    },
    {
      number: "02",
      title: "Acoustic Silence in Edward Yang’s Taipei: Listening to Modernist Rooms",
      date: "SEP 24, 2026",
      datetime: "2026-09-24",
      href: "#note-02"
    },
    {
      number: "03",
      title: "Why I Keep a Physical Index Card Catalog Beside a Digital Database",
      date: "AUG 19, 2026",
      datetime: "2026-08-19",
      href: "#note-03"
    }
  ]
};

/**
 * ============================================================================
 * DOM RENDERING FUNCTIONS
 * ============================================================================
 */

/**
 * Safely escapes strings before inserting into HTML templates
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Renders the "Currently Reading & Watching" side-by-side cards
 */
function renderCurrently(items) {
  const container = document.getElementById("currently-grid");
  if (!container || !Array.isArray(items)) return;

  container.innerHTML = items
    .map(
      (item) => `
      <article class="currently-card">
        <div class="currently-card-header">
          <span class="mono-label">${escapeHTML(item.label)}</span>
          <span class="mono-label">${escapeHTML(item.status)}</span>
        </div>
        <div class="currently-card-body">
          <img
            src="${escapeHTML(item.image)}"
            alt="${escapeHTML(item.alt)}"
            class="currently-thumb"
            loading="lazy"
            width="400"
            height="600"
          />
          <div class="currently-info">
            <h2 class="currently-title">${escapeHTML(item.title)}</h2>
            <p class="currently-creator">${escapeHTML(item.creator)}</p>
            <p class="currently-note">${escapeHTML(item.note)}</p>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

/**
 * Renders the 5 Favorite Books into #books-grid
 */
function renderBooks(books) {
  const container = document.getElementById("books-grid");
  if (!container || !Array.isArray(books)) return;

  container.innerHTML = books
    .map(
      (book) => `
      <article class="archive-item" role="listitem">
        <div class="archive-cover-wrap">
          <img
            src="${escapeHTML(book.cover)}"
            alt="Book cover of ${escapeHTML(book.title)} by ${escapeHTML(book.author)}"
            class="archive-cover"
            loading="lazy"
            width="400"
            height="600"
          />
        </div>
        <div class="archive-meta-top">
          <span class="archive-index">VOL. ${escapeHTML(book.id)}</span>
        </div>
        <h3 class="archive-title">${escapeHTML(book.title)}</h3>
        <p class="archive-subtitle">${escapeHTML(book.author)}</p>
      </article>
    `
    )
    .join("");
}

/**
 * Renders the 5 Favorite Films into #films-grid
 */
function renderFilms(films) {
  const container = document.getElementById("films-grid");
  if (!container || !Array.isArray(films)) return;

  container.innerHTML = films
    .map(
      (film) => `
      <article class="archive-item" role="listitem">
        <div class="archive-cover-wrap">
          <img
            src="${escapeHTML(film.poster)}"
            alt="Film poster for ${escapeHTML(film.title)} (${escapeHTML(film.year)})"
            class="archive-cover"
            loading="lazy"
            width="400"
            height="600"
          />
        </div>
        <div class="archive-meta-top">
          <span class="archive-index">REEL ${escapeHTML(film.id)}</span>
        </div>
        <h3 class="archive-title">${escapeHTML(film.title)}</h3>
        <p class="archive-subtitle">${escapeHTML(film.year)}</p>
      </article>
    `
    )
    .join("");
}

/**
 * Renders the Latest Notes rows into #notes-list
 */
function renderNotes(notes) {
  const container = document.getElementById("notes-list");
  if (!container || !Array.isArray(notes)) return;

  container.innerHTML = notes
    .map(
      (note) => `
      <article class="note-row" role="listitem">
        <a href="${escapeHTML(note.href)}" class="note-link">
          <span class="note-number mono-label">${escapeHTML(note.number)}</span>
          <h3 class="note-title">${escapeHTML(note.title)}</h3>
          <time class="note-date mono-label" datetime="${escapeHTML(note.datetime)}">${escapeHTML(note.date)}</time>
        </a>
      </article>
    `
    )
    .join("");
}

/**
 * ============================================================================
 * THEME TOGGLE (Light / Dark Mode)
 * ============================================================================
 */
function initThemeToggle() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const toggleLabel = document.getElementById("theme-toggle-label");
  const STORAGE_KEY = "iman_library_theme";

  // Check saved theme or fallback to default light theme
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const initialTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";

    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", String(isDark));
    }
    if (toggleLabel) {
      toggleLabel.textContent = isDark ? "LIGHT MODE" : "DARK MODE";
    }

    // Notify book3d.js so Three.js scene lighting updates immediately
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { theme }
      })
    );
  }

  applyTheme(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  }
}

/**
 * ============================================================================
 * GENTLE FADE-IN ON SCROLL
 * ============================================================================
 */
function initScrollReveal() {
  const fadeElements = document.querySelectorAll(".fade-in");
  if (!fadeElements.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    fadeElements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    }
  );

  fadeElements.forEach((el) => observer.observe(el));
}

/**
 * ============================================================================
 * INITIALIZE APPLICATION
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  renderCurrently(ARCHIVE_DATA.currently);
  renderBooks(ARCHIVE_DATA.books);
  renderFilms(ARCHIVE_DATA.films);
  renderNotes(ARCHIVE_DATA.notes);

  initThemeToggle();
  initScrollReveal();
});
