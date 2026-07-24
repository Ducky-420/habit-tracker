# iOS Liquid Glass Habit Tracker v2

A modern, offline-capable habit tracking PWA styled after Apple's iOS 27 Liquid Glass aesthetic — dark violet glassmorphism, ambient glow, and a full-history heatmap. Built with plain HTML, CSS, and JavaScript — no framework, no build step.

**Live app:** https://habit-tracker-v2-one.vercel.app

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

## Features

- **iOS 27 Liquid Glass theme** — dark violet glassmorphic cards with layered blur, specular highlights, and ambient glow, built entirely from CSS `backdrop-filter` and gradients
- **7×8 heatmap grid** — a fixed 56-day (8-week) completion history per habit, rendered as a proper grid that never collapses on mobile
- **Standalone PWA** — installable to your home screen on iOS and Android, works fully offline via a service worker with cache-first-with-network-refresh
- **Local storage persistence** — every habit, streak, and toggle is saved to `localStorage` and rehydrated on load, so nothing resets on refresh
- **Full habit editor** — icon picker, curated color themes, categories, flexible targets (daily / N×-per-day / N×-per-week), and optional personal goals
- **Floating glass navigation** — a bottom tab bar (Dashboard / Habits / Stats / Settings) with a glowing active state and a habit-adding FAB

## Tech stack

Vanilla HTML5, CSS3, and JavaScript — no framework, no bundler, no dependencies at runtime. Icons are loaded from the [Lucide](https://lucide.dev) static icon set via CSS masking. Deployed as a static site on [Vercel](https://vercel.com).

## Project structure

```
.
├── index.html      # Full app shell — markup, styles, and app logic
├── manifest.json   # PWA manifest (name, icons, theme colors, display mode)
├── sw.js           # Service worker — app-shell caching for offline use
├── icon.svg        # Source app icon (Streak Ring design, 1024×1024)
├── icon-192.png    # Rasterized icon for broader launcher support
├── icon-512.png    # Rasterized icon for broader launcher support
├── maskable-512.png
└── apple-touch-icon.png
```

## Running locally

No build step is required — it's a static site. Any local server works, for example:

```bash
npx serve .
```

Then open the printed `http://localhost:...` URL in your browser. Opening `index.html` directly via `file://` also works, but installing as a PWA and testing the service worker requires it to be served over `http://localhost` or `https`.

## Deploying

The project deploys as-is to any static host. On Vercel:

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
