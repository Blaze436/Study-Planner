# Study Planner

A personal planning app that turns large goals into small, scheduled tasks, so
the answer to "what should I do today?" is already on the screen.

Built as a long-term foundation inspired by a four-year paper planning system.
The app provides flexible primitives (goals, tasks, dates, order) rather than
prescribing a rigid workflow.

**Status:** In active development. The MVP is not complete yet.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no framework. Data is stored
in the browser's `localStorage`. Backup export is available in Settings.

## Running it

Open `index.html` in a browser. That's it.

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
