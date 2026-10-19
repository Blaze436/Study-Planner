# Study Planner

A personal planning app that turns large goals into small, scheduled tasks, so
the answer to "what should I do today?" is already on the screen.

Built as a long-term foundation inspired by a four-year paper planning system.
The app provides flexible primitives (goals, tasks, dates, order) rather than
prescribing a rigid workflow.

**Live:** https://blaze436.github.io/Study-Planner/

**Status:** v1.0.0 MVP. Code-complete.

## Features

- **Goals & Tasks:** Create goals, break them into tasks, and schedule them.
- **Today's View:** See only what's due today, grouped by goal.
- **Missed Tasks:** Past-due tasks appear in a collapsible section, not an anxiety wall.
- **Reordering:** Move tasks up or down within a goal.
- **Durability:** Export/import JSON backups, share-sheet export on mobile, and a single-slot safety snapshot before destructive actions.
- **Local-first:** No accounts, no analytics, no servers.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no framework. Data is stored
in the browser's `localStorage`. Backup export is available in Settings.

## Running it

Open `index.html` in a browser. That's it.

## Known Limitations

- **Phone Testing:** The share sheet, download location, and import file picker are untested on a real phone (though fallbacks exist for each).
- **Data Loss Risk:** Data lives in one browser on one device. Browsers can clear storage, so export regularly.
- **No Cloud Sync:** Backups must be transferred manually.

## Privacy

There are no analytics scripts in this app. Nothing leaves your device.

## Project layout

- `index.html` — markup for all views
- `css/styles.css` — styles
- `js/date.js` — date helpers
- `js/storage.js` — localStorage adapter
- `js/data.js` — domain logic and derived getters
- `js/screens.js` — DOM rendering
- `js/main.js` — startup and event wiring
- `docs/` — design decisions, data schema, and paper-system notes
- `DEV_LOG.md` — development log

## Design notes

The paper system this app is based on is documented in `docs/PAPER_SYSTEM.md`.
Every design decision has a reason and is recorded in `docs/DECISIONS.md`.
