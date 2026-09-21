# LIHCC Cath Lab Discharge Guide (PWA)

A lightweight, installable Progressive Web App that gives cardiac catheterization
(Cath Lab) patients a clear, mobile-friendly discharge and home-care guide.

## Features

- **Emergency & care-team guidance** — clearly separated "call 911" vs. "call your
  care team" checklists.
- **Puncture-site aware wound care** — pick groin, wrist, arm, or neck access and
  see the matching wound-care instructions.
- **Interactive checklists** — tap items to mark them done; progress is saved to
  the device (`localStorage`).
- **Personal medication tracker** — add/remove medications for quick reference,
  saved locally on the device only.
- **Offline support** — a service worker precaches the app shell so the guide is
  still available without a network connection, with an offline indicator banner.
- **Installable** — includes a web app manifest and icons so the guide can be
  added to a phone's home screen like a native app.

This app is for patient education only and does not replace instructions given
by your care team at discharge.

## Project structure

```
index.html              Markup for the guide, organized into sections/cards
css/styles.css           Styling (mobile-first, responsive)
js/app.js                Checklist persistence, puncture-site selector,
                         medication tracker, install prompt, offline banner
manifest.webmanifest     PWA manifest (name, icons, theme colors, display mode)
service-worker.js        Offline caching (cache-first with network fallback)
icons/                   App icons (192, 512, and maskable 512 PNGs)
```

No build step or dependencies are required — it's plain HTML/CSS/JS so it can be
hosted from any static file server.

## Running locally

```bash
# from the repository root
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a browser. Because service workers
require a secure context, `localhost` works for local testing; deploy over
HTTPS in production so the offline/install features work for patients.

## Installing as an app

On a supported mobile or desktop browser, open the deployed URL and either use
the in-page "Install App" button (Chrome/Edge/Android) or your browser's
"Add to Home Screen" option (iOS Safari) to install the guide.
