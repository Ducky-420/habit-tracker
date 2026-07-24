# iOS Liquid Glass Habit Tracker v2

A high-performance, offline-first PWA inspired by native iOS 27 glassmorphism — dark violet glass cards, ambient glow, and a full habit-history view. Built with vanilla JavaScript, zero runtime dependencies, and no build step.

**Live app:** https://habit-tracker-v2-one.vercel.app

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%20Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

## Architecture & tech stack

No framework, no bundler, no npm dependencies at runtime — just:

- **Vanilla JavaScript (ES6 Modules)** — app logic split into small, focused modules loaded natively via `<script type="module">`, no build step required
- **CSS Custom Properties & `backdrop-filter`** — the entire glass aesthetic (blur, saturation, layered borders, ambient glow) is driven by CSS variables in a single design-tokens file
- **Service Worker API** — cache-first-with-network-refresh strategy over a versioned app-shell cache for full offline support
- **`localStorage` persistence** — habits, streaks, and settings are saved on every mutation and rehydrated on load

### Project structure

```
.
├── index.html                    # App shell — tab sections, nav, modal mount point
├── manifest.json                 # PWA manifest (icons, theme colors, display mode)
├── sw.js                         # Service worker — app-shell caching for offline use
├── vercel.json                   # Static deployment config (no build step)
├── icon.svg                      # Source app icon (Streak Ring design, 1024×1024)
├── css/
│   └── glass-tokens.css          # Design tokens + shared glass/typography primitives
├── js/
│   ├── app.js                    # Entry point — routing, state, render orchestration
│   ├── storage.js                # localStorage persistence, import/export, icon/theme data
│   └── components/
│       ├── Header.js             # Dashboard summary card + progress rings
│       ├── HabitCard.js          # Collapsed/expanded habit row, weekly pill & mosaic views
│       ├── HabitModal.js         # Add/Edit Habit full-screen sheet
│       └── Settings.js           # Data backup, appearance, and app info panel
└── _legacy_v1/                   # Archived Vite + React v1 build (kept for reference only)
```

This is the **Option A modular layout**: each component is an independent ES module exporting a `render*()` function and a `bind*Events()` function, composed together in `js/app.js` with no shared framework runtime.

## Key features

- **Weekly Pill rows** — a 7-day per-habit strip with count badges and a glow state for completed days
- **Scorecard Mosaic** — a dense 14-column, 56-day micro-grid view as an alternate density mode, toggled per-user in Settings
- **Compact icon picker** — a collapsible sub-sheet inside the habit editor with a 6-column Lucide icon grid, so picking a symbol never leaves the modal
- **Curated themes & categories** — nine gradient color themes and nine organizational categories, assignable per habit from pill/swatch selectors
- **Flexible targets** — Daily, N×-per-day, or N×-per-week goals, plus an optional personal goal counter
- **JSON data import/export** — one-tap export of all habits to a downloadable `.json` file, and import from a previously exported file, both from Settings
- **Offline PWA support** — installable to the home screen, works fully offline via the service worker, and never resets your data on refresh

## Local development

No build step is required — it's a static site. Any local static server works:

```bash
npx serve .
```

Or with VS Code's **Live Server** extension: right-click `index.html` → **Open with Live Server**.

Then open the printed `http://localhost:...` URL. Opening `index.html` directly via `file://` also renders the app, but installing as a PWA and testing the service worker requires serving it over `http://localhost` or `https`.

## Deploying

The project deploys as-is to any static host. `vercel.json` at the repo root pins the project to a static build (`framework: null`, no build command) so Vercel serves `index.html` directly instead of searching for a Node/Vite pipeline:

```bash
npx vercel --prod
```

## Installing on your phone

**iOS (Safari):**
1. Open the [live app](https://habit-tracker-v2-one.vercel.app) in Safari
2. Tap the **Share** icon
3. Tap **Add to Home Screen**
4. Confirm — the app now opens full-screen, with no browser chrome, and works offline

**Android (Chrome):**
1. Open the [live app](https://habit-tracker-v2-one.vercel.app) in Chrome
2. Tap the **⋮** menu
3. Tap **Add to Home screen** (or **Install app**, if prompted automatically)
4. Confirm
