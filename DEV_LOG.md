# Study Planner — Development Log

## Day 1 — Paper Audit & MVP Scope Lock
**Date:** 6 October 2026
**Time spent:** ~5 hours

### What I did
- Confirmed the existing private repo (`study-planner`) and reorganized files into `docs/` and `specs/` folders
- Created `docs/PAPER_SYSTEM.md` — a 10-question audit documenting my 4-year paper system
- Answered all 10 questions in my own words, describing what I actually do (not what the app should do)
- Consulted with the Architect to review the audit and settle conflicts
- Locked the MVP scope as **Option A** (paper v1 + foundation discipline, not the platform/utility version)
- Wrote `docs/DECISIONS.md` with 11 decisions, each with reasoning
- Wrote `docs/OPEN_QUESTIONS.md` with post-MVP items and one blocking item (missed block visibility)
- Corrected a factual error in my own brief: cycles **do** have dates (derived from order + minimum), not "no dates"
- Corrected the Architect's claim that cycle membership could be derived from `assignedDate` — under the queue model, dates are derived from the cycle, so cycle membership must be explicit
- Added `order` field to blocks — justified by paper v1's S.no column, not a "just in case" hook
- Cut `estimatedMinutes` and `category` from MVP — paper had neither
- Kept `createdAt` and `completedAt` — timestamps can't be backfilled
- Resolved missed-block visibility with a quiet approach (label in Goals & Blocks, count in Today's View)
- Documented the six foundational rules that will keep the codebase buildable long-term

### What worked
- The paper audit answered questions I didn't know I had. Writing it down forced clarity that just "thinking about it" never produced.
- The "paper is the reference" principle resolved several open questions mechanically — no debate needed.
- Option A became obviously right once the three options were laid out side-by-side.
- The Architect pushed back on things I hadn't considered (target date out of MVP, `schemaVersion` field, one date helper).
- The queue model of cycles (blocks stand in a line, dates are derived from order + minimum) clarified both the MVP and post-MVP picture.

### What I learned
- **The paper version is the only spec I need.** Four years of iteration produced answers that no book on productivity could have taught me. When I got confused, going back to "what does paper do?" cut through everything.
- **Distinguishing primitives from automations is the key design skill.** A primitive is something the user composes by hand (a block named "buffer"). An automation is something the app runs on their behalf (auto-distribution, ahead/behind counter). The MVP ships primitives only.
- **"Cheap to add later" vs "expensive to add later" is the test for what belongs in the schema now.** New optional fields: cheap. New entities: cheap. Changing what an existing field means: expensive. Nesting data you'll later untangle: expensive.
- **Copy the behavior, not the medium.** Paper has affordances the app doesn't (physical presence, deliberate erasing, whole-week visibility). Translating the behavior — like keeping manual rollover because moving a block on paper is deliberate — matters more than copying the look.

### What confused me
- Initially struggled to explain how cycles interact with dates. Writing it down helped clarify: dates are *derived* from order, not assigned. This corrected both my own brief and the Architect's suggestion.
- The question "is this in MVP or post-MVP?" kept coming up. The rule that helped: if paper v1 did it, it's MVP. If paper did it later, it's post-MVP. If paper never did it, it's not in scope.
- Almost forgot to start `DEV_LOG.md` — remembered after seeing the Driver Calculator's log.

### Design decisions locked in (references)
- **Decision 1:** Paper system is the reference (behavior, not medium)
- **Decision 2:** Long-term vision is a canvas for personal systems (not MVP scope)
- **Decision 3:** Option A — paper v1 for MVP, utility features post-MVP
- **Decision 4:** `assignedDate` required in MVP
- **Decision 5:** `targetDate` out of MVP
- **Decision 6:** Manual rollover + user-created buffer blocks (no auto-move)
- **Decision 7:** Flat collections, `schemaVersion`, defaults on load
- **Decision 8:** `order` field on blocks (paper's S.no column)
- **Decision 9:** Missed blocks visible but not aggressive
- **Decision 10:** MVP display defaults (ordering, empty states, completed visibility)
- **Decision 11:** Cut `estimatedMinutes` and `category`

### The six foundational rules (for the whole project)
1. Data logic lives separate from screen code
2. Store facts, calculate everything derived
3. Flat collections linked by id + `schemaVersion`
4. One date helper, `YYYY-MM-DD` strings
5. Render by looping over data
6. Loading tolerates missing or extra fields

---

## Day 2 — Schema Design & Durability Layer
**Date:** 7 October 2026
**Time spent:** ~6 hours (Driver 1h + Planner 4h + Post-commit cleanup 1h)

### What I did
**Driver app:**
- Confirmed GA4 custom dimension "Ride Platform" registered with parameter `ride_platform`
- Archived the old "Platform" dimension (superseded by Ride Platform)
- Wrote `texts_en.md` with 9 field hints and 11 FAQ entries
- Created `utm_links.md` with 7 channel-specific links (verified working via DebugView)
- Sent join requests to 10 Facebook driver groups
- Logged Day 2 in `POST_DEV.md`

**Study Planner:**
- Archived `data_model.md` → `data_model_SUPERSEDED.md` with header
- Updated `MVP_MUST.md` with scope lock (assignedDate required, order added, estimatedMinutes and category cut)
- Fixed cycle explanation in `OPEN_QUESTIONS.md` and `MVP_NEXT.md`
- Added exception to Decision 1 for invisible fields (timestamps, schemaVersion)
- Learned about the timezone trap: `toISOString()` returns UTC, wrong for Karachi between midnight and 5 AM
- Wrote `docs/data_schema.md` v1 with goals, blocks, derived values, complete example, load rules
- Made Decision 12: deleting a goal deletes its blocks (paper crossed out pages together)
- Made **Decision 13: data durability** after realizing localStorage alone is too risky for an app with irreplaceable user effort
- Designed the durability stack: three localStorage keys, export/import file, share sheet, persistent storage request
- Updated `MVP_NEXT.md` with cloud sync (priority 1), File System Access, CSV export, PWA

### What worked
- The paper system principle (Decision 1) resolved most schema questions mechanically — no debate needed
- The Architect's durability framework (Tier 1 vs Tier 2 with a cut rule) made the decision manageable
- Realizing the browser can't write files silently was important — "automatic backup" had to be reframed as "one-tap backup"
- The three-key storage model (data / meta / prev snapshot) cleanly separates concerns
- Making the export file carry `app: "study-planner"` and `exportedAt` prevents accidental wrong-file imports

### What I learned
- **The timezone trap:** `new Date().toISOString().split("T")[0]` returns yesterday's date between midnight and 5 AM Karachi time. Must build "today" from local year/month/day.
- **Browsers cannot silently write files.** "Automatic backup" is impossible. The honest version is "prepared, one tap to save."
- **The share sheet matters more than downloads on mobile.** Users don't open Downloads folders. They do send things to themselves on WhatsApp.
- **Three storage keys separate different concerns:** user data, device state, safety snapshot. Mixing them causes bugs when the user moves to a new device.
- **Data durability is a design decision, not an implementation detail.** It shapes the schema and the load/import rules.
- **Safety snapshot protects against my own bugs,** not against user mistakes or data loss. It's a "prev state" rollback, not a backup.

### What confused me
- Initially wanted "automatic backups" — had to work through why that isn't possible in a browser
- Brief uncertainty about whether device state (lastBackupAt) belongs in the export file — resolved by thinking about what happens if a user imports on a different device

### Design decisions locked in (references)
- **Decision 12:** Deleting a goal deletes its blocks (with confirmation)
- **Decision 13:** Data durability — Tier 1 in MVP, Tier 2 if schedule allows
- Three-key storage model
- Export file format includes `app` and `exportedAt`, excludes device state
- Import rules: parse inside try/catch, reject newer schema versions, drop orphan blocks, confirm with counts
- **Decision 8:** Updated — order is primary sort, `assignedDate` is independent. Cross-referenced with Decision 15 for reordering mechanics.
- **Decision 15:** Decided that blocks will be ordered via `order`, making them independent of `assignedDate`. An arrow up and down button for ordering.
- **Decision 14:** Settings tab added — 3-tab navigation (Today's View / Goals & Blocks / Settings)
- **Section D dry-run completed:** Confirmed the schema handles goal creation, missed blocks, reschedule, future cycle extension, and goal deletion. No field meanings need to change to accommodate cycles.

### Post-commit review
Architect flagged inconsistencies after commit. Fixed:
- Destructive load rule (newer schema version)
- Missing required-field rules (drops records, warns user)
- Decision 10 vs Decision 8 contradiction
- MVP_MUST no longer matched the actual MVP features
- Privacy FAQ was falsely claiming no data is sent
- POST_DEV counts now honest (external drivers: 0)
- Various small formatting/wording fixes

---

## Day 3 — Live App Polish + Schema Completion + Cut Order
**Date:** 8 October 2026
**Time spent:** ~5 hours (Driver 1.5h + Planner 3.5h)

### What I did

**Driver app:**
- Fixed privacy wording in `texts_en.md` — now correctly states that settings stay on device but anonymous usage data goes to Google Analytics
- Added all 9 field hints below their inputs (Details tab: 4; Calculate tab: 5)
- Built FAQ in Settings using native `<details>` / `<summary>` — 11 entries, zero JavaScript needed
- Added share-button UTM rule to `utm_links.md` (`share_button` medium, `in_app` campaign)
- Created `groups.md` to track joined groups and their promotion rules
- Joined ~23 Facebook driver groups across Karachi, Lahore, Islamabad, and Pakistan-wide
- Left initial comments in approved groups to build credibility before launch (no link, no app mention)
- Verified FAQ behavior on phone — no sideways scroll, native expand/collapse works
- Updated `POST_DEV.md` with group status snapshot and launch strategy

**Study Planner:**
- **Schema cleanup:** Rewrote the Required-Field Rule (goal drops on missing `id`/`title`; block drops on missing `title`/`goalId`; `assignedDate` is now optional). Defined `saveLocked` flag mechanism for the "do not overwrite newer data" rule. Marked Import Rule 8 and `studyPlanner_prev` as Tier 2.
- **Decisions added:** Revised Decision 4 (assignedDate now optional — reverses original), Revised Decision 14 (hamburger drawer navigation, not fixed tabs), added Decision 17 ("Task" is the user-facing word for blocks)
- **MVP_MUST.md fixes:** Fixed the Oct 6 note contradiction (`assignedDate` required → optional). Confirmed Scope Lock reflects current state.
- **OPEN_QUESTIONS.md:** Cleared all blocking items. Remaining: app name, cycle/date mechanic, undo, editing completed blocks
- **DECISIONS.md encoding:** Noticed `‚Äî` substitution for `—` — noted for future fix
- **Annotated wireframes:** Reviewed original hand-drawn sketches against current decisions. Marked out-of-date elements (Organizer → Goals & Blocks, category/time cut, sorted by `order` not date, "Overdue" → "Missed"). Confirmed full-screen forms, no confirmation for block deletes, edit-form-only reschedule, simple empty state.
- **Generated AI-rendered wireframe references** for portfolio documentation — three images: New Task form, Organizer (goals list), Today's Tasks (with missed section, completed styling, floating +). Noted AI hallucinated a "General" group that doesn't exist in MVP — to be excluded from coding reference.
- **Decision 16 recorded:** UI defaults — full-screen block form, no block-delete confirmation, edit-form-only reschedule, simple empty state, first-run note at top of Today's Tasks
- **Decision 17 recorded:** "Task" is the user-facing word; "block" stays internal to schema
- **Decision 18 recorded:** `assignedDate` optional — supersedes Decision 4
- **FUNCTION_LIST.md written:** Full data-layer API surface — `date.js` (2 functions), `storage.js` (8 functions), `data.js` (8 mutations + 6 derived getters), `screens.js` (6 render functions + event wiring). This is the contract for the entire build.
- **Project skeleton created:** `css/styles.css`, `js/date.js`, `js/storage.js`, `js/data.js`, `js/screens.js`, `js/main.js`, plus `index.html` referencing them in load order
- **Cut order decided:** If behind by Oct 19 checkpoint: backup reminder banner → safety snapshot → share sheet → reorder buttons → visual polish

### What worked
- Writing the FUNCTION_LIST.md before coding clarified several ambiguities I hadn't noticed (e.g., updateBlock never touches `order`, deleteBlock doesn't renumber)
- The `<details>` / `<summary>` approach for the FAQ was the right call — zero JS, works on every phone
- Reviewing the original sketches against decisions caught a "General" group concept that had silently crept in but wasn't in the schema
- The AI-generated wireframes helped visualize the target look — good for portfolio documentation
- Discovering the assignedDate-required question through the sketch review was important — it forced a real decision instead of inheriting a default

### What I learned
- **The paper system is a spec, not a suggestion.** Decision 4's reversal (assignedDate optional) came directly from noticing that my sketches defaulted to "today" but my paper system didn't. This is Decision 1 working as intended.
- **Naming matters twice.** "Blocks" for the schema, "Tasks" for the user. Keeping them separate means future UI renames don't touch the schema. Small decision, big flexibility.
- **Validation rules must be checked in two places.** Rule 5 in Import and the block line in Load Rules both needed updating for assignedDate nullable. Easy to miss one.
- **HTML structure isn't optional.** I initially wrote `index.html` with only script tags and no doctype/head/body. Browsers would load it in "quirks mode" and behave unpredictably. Always start with the full skeleton.
- **Filename mismatch fails silently.** `data_local.js` vs `date.js` — the browser would just 404 the missing file and every date function would break at runtime. Checking the console for load confirmations catches this.

### What confused me
- The distinction between "saving" and "locking" for newer schema versions. The mechanism (a `saveLocked` flag) wasn't obvious until I wrote it into the schema.
- Which decisions belong in `DECISIONS.md` vs `OPEN_QUESTIONS.md`. Resolved by rule: decided = DECISIONS; undecided = OPEN_QUESTIONS. Resolved items move from one to the other.
- Whether to redraw or annotate the sketches — decided annotate because it shows iteration, which is better portfolio documentation.

### Design decisions locked in (references)
- **Decision 4 (revised):** assignedDate optional — blocks can exist unscheduled
- **Decision 14 (revised):** Hamburger drawer navigation
- **Decision 17 (was 16):** "Task" is the user-facing term
- **Decision 18:** Assigned date nullable — direct consequence of Decision 1 (paper is the reference)
- **Cut order:** banner → snapshot → share → reorder → polish
- **Checkpoint:** Oct 19 — Goals, Blocks, Today's View must work by then, or cuts start

**Note (Oct 9):** The FUNCTION_LIST.md was drafted with AI assistance. I reviewed the structure and reasoning with the Architect, but I don't yet understand every function at the implementation level. I'll learn each one as I code it — same method for the entire build. Honest labeling matters more than pretending.

---

## Day 4 — First Coding Slice: Add Goal + Persistence
**Date:** 9 October 2026
**Time spent:** ~6 hours (Driver 1.5h + Planner 4.5h)

### What I did

**Driver app:**
- Added ⓘ hint toggles next to all 9 field labels (Details + Calculate screens)
- Built the Urdu FAQ section in Settings using `lang="ur" dir="rtl"` — all 11 entries
- Created `texts_ur.md` with the complete Urdu translation
- Decision: skipped the Help link on Calculate screen — bottom nav already provides one-tap access to Settings

**Study Planner — first real code:**
- Wrote `getTodayString()` and `formatDateForDisplay()` in `date.js` (local time, never UTC)
- Wrote `loadAll()` and `saveAll()` in `storage.js` — self-healing on corrupted data
- Wrote `generateId()`, `initData()`, `getData()`, `createGoal()`, `getAllGoalsSorted()` in `data.js`
- Wrote `renderGoalList()` in `screens.js` — uses `textContent`, never `innerHTML`
- Wrote startup + button wiring in `main.js`
- Replaced `index.html` with minimal skeleton: input + button + list container

### What worked
- The full slice works end-to-end: add goal → refresh → still there
- All 7 verification tests pass
- Console shows all 5 files loading in correct order
- LocalStorage contains correct JSON with schemaVersion, goals array
- `<b>test</b>` renders as plain text — XSS protection confirmed
- Empty title rejected with alert

### What I learned
- **The state-to-render loop in practice:** user action → data-layer function → mutate in-memory `plannerData` → `saveAll()` → re-render from data. No direct DOM-to-data communication.
- **`textContent` over `innerHTML`** is non-negotiable. `innerHTML` would execute user-provided HTML/JS — a real security issue since backups can be imported from files.
- **Fresh empty objects:** `makeEmptyData()` returns a new object each call, not a shared one. Avoids state leaking between calls.
- **Sorting a copy:** `[...data.goals].sort(...)` — spreading first so the original array isn't mutated by `.sort()`.
- **Local date function vs. UTC:** `getTodayString()` uses `getFullYear()`, `getMonth() + 1`, `getDate()` — never `toISOString()`.

### What confused me
- The "1 issue" in the browser console — turned out to be a favicon 404, not a bug.
- Had to remember to remove the test `console.log("initData:...")` line that also re-called `initData()`.

### Design decisions confirmed
- All six foundational rules (from Decision 3) hold:
  1. ✅ Data logic separate from screens — searched `date.js`, `storage.js`, `data.js` for `document.` — empty
  2. ✅ Store facts, calculate derived — only createdAt stored on goals, no derived values
  3. ✅ Flat collections + schemaVersion
  4. ✅ One date helper, `YYYY-MM-DD`
  5. ✅ Render by looping
  6. ✅ Loads tolerate missing fields

  **Note (Oct 10):** The Day 4 log above was written before I did the Block 0 carryover work. Adding it here so the log stays append-only.

### Block 0 Carryover (Oct 9 evening, ~45 min)
- Added Decisions 17 (no default "General" goal), 18 (UI defaults), 19 (cut order + checkpoint)
- Added "Drafted with AI assistance..." honesty line to `FUNCTION_LIST.md`
- Cleaned up `data_schema.md`: fixed the "Required-Field Repair Rules" naming, removed duplicated `studyPlanner_meta` row, added `firstRunDismissed` to meta key
- Updated `utm_links.md`: campaign is `launch` for external channels, `in_app` for the share button
- Synced `texts_en.md` with the live `index.html` (HTML wins where they diverge)

**Written myself vs. explained by tutor/Architect:**
- **Written myself:** all JS files, HTML edits for hints/FAQ/hint toggles, Urdu translations read and corrected
- **Explained by Architect:** the concept of "return a fresh empty object each time" and "why spread before sorting"

**Rule 6 (loading tolerates missing fields) — status: PARTIALLY DONE.** Top-level shape only (`goals` and `blocks` are checked with `Array.isArray`). Deep field-level defaulting is deferred to `normalizeData()` in Block 2 of Day 5.

---

## Day 5 — Planner Slice 2: Edit, Delete, Data Hygiene
**Date:** 10 October 2026
**Time spent:** ~7 hours total (Driver 1.5h + Planner 5.5h, including debugging detours)

### What I did

**Driver app:** see `POST_DEV.md` Day 5.

**Study Planner:**
- Rewrote `createGoal` to check the save result (copy-then-save pattern)
- Hardened `storage.js`: `getItem` now inside `try`; corrupted data saved to `studyPlanner_corrupt` before clearing
- Wrote `normalizeData(raw)` — pure function, validates goals and blocks against the schema, drops invalid records with counts
- Updated `initData` to call `normalizeData`
- Added `getBlocksForGoal`, `updateGoal`, `deleteGoal`
- Added Rename and Delete buttons to each goal row in `renderGoalList`
- Delete uses a count-aware `confirm()`: "Delete X and its N tasks?"

### What worked
- Copy-then-save pattern: memory never diverges from storage
- `normalizeData` is pure — no storage, no DOM, testable in isolation
- Corrupted data backed up before clearing
- Cascade delete works: goal + blocks removed together

### What I learned
- **Copy-then-save vs. undo pattern.** Chose copy-then-save because the old memory is preserved until the save succeeds.
- **The adapter/meaning separation.** `storage.js` doesn't know what a "goal" is. `data.js` doesn't know about localStorage.
- **Never trust stored data.** Even data the app wrote itself can be edited, corrupted, or from an older version.
- **Test code never lives in source files.** Ran into a real debugging trap: I had left a `Storage.prototype.setItem` override in `data.js` as a "simulated storage failure" for testing. That override runs on every page load and silently makes every save fail. Took me a while to notice because I had already "fixed it" in my head but not in the file. The rule now: test code goes in the console, run once, then reload the page to clear it.

### What confused me
- Where `normalizeData` should live — resolved: `data.js`, because it's about meaning, not storage.
- The chaos caused by the leftover test override — saw "Save failed: Error: full" on every action. The error message was correct; I just didn't realize it was still in the file.

---

## Day 6 — Planner Slice 3: Detail View, Edit, Delete
**Date:** 11 October 2026
**Time spent:** ~7 hours (Driver 3h + Planner 3h + GA4 setup 1h)

### What I did

**Driver app:**
- Added favicon via favicon.io (yellow taxi emoji)
- Built a Google Form for user feedback, linked from Settings
- Wrote the Facebook in-app browser banner — detects `FBAN|FBAV` in user agent, shows once, dismissible
- Fixed share message bidi rendering (Urdu + English on separate lines)
- Fixed share fallback variable bug
- Cleaned `utm_links.md` duplicate row
- Messaged admins of top 5 launch groups with an Urdu-language, non-promotional pitch
- Wrote two image-post drafts to `docs/image_posts.md`

**Study Planner:**
- Added `createBlock(goalId, title, description, assignedDate)` — validates goal exists, title not empty; auto-assigns `order`
- Added `toggleBlockComplete(blockId)` — flips `isCompleted`, sets or clears `completedAt`
- Added `updateBlock(blockId, updates)` and `deleteBlock(blockId)`
- Built the goal detail view: separate container with Back button, task list, add-task form
- Rewrote `screens.js` to use `showView()` for switching between the goal list and goal detail
- Wired the Add Task form (title, description, optional date)

**GA4:**
- Customized Reports Snapshot with 4 cards
- Created "Platform breakdown" exploration showing how many calculations per platform
- Discovered `(not set)` rows are pre-registration events — expected, not a bug

### What worked
- Detail view navigation works cleanly
- Checkbox in the task list toggles completion and re-renders
- Date picker accepts empty (unscheduled) or a value
- The Exploration confirmed platform tracking works: Bykea 14, inDrive 5, Custom 3, Yango 2
- Admin outreach landed better in Urdu with a warm tone than my earlier English version

### What I learned
- **Test code never lives in source files.** The `Storage.prototype.setItem` override from Block 2 was still in `data.js` and silently broke every save. The error message was correct — I just didn't see it. Rule now firm: tests go in the console.
- **GA4 custom dimensions don't backfill.** Events fired before registration show as `(not set)`. The 21 `(not set)` rows are pre-Oct-7 events. Not a problem.
- **GA4 custom dimensions don't appear in Report card picker immediately.** 24-48 hour propagation. The Exploration sees them right away.
- **`updateBlock` uses "in" checks (`"title" in updates`)** so it merges only the fields the caller provides, without accidentally nulling the others.

### What confused me
- Couldn't find the "User agent override" location in DevTools for testing the FB banner (resolved: Chrome's device toolbar has it under "Custom").
- Spent time searching for the Ride platform card in the Reports snapshot — doesn't exist yet due to GA4 lag.

---

## Day 7 — Today's View + Launch Day (Driver App)
**Date:** 12 October 2026
**Time spent:** ~5 hours (Code 3h + Launch activity 2h)

### What I did

**Study Planner:**
- Wrote `getTodayBlocks(data)` — returns today's tasks grouped by goal, only for goals that have at least one task today
- Rebuilt `index.html` with a third view: `todayView` (now the default landing screen)
- Added navigation links: "See all goals →" (from Today) and "← Today's View" (from the goals list)
- Rebuilt `showView()` to hide three views instead of two
- Wrote `renderTodayView()` — grouped task rendering with checkboxes, strikethrough on complete, and both empty states ("No goals yet" and "No tasks today")
- Changed `main.js` to call `renderTodayView()` on startup instead of `renderGoalList()`
- Added the delete-task button and inline edit mode (from the earlier phases)
- Tested all states: no goals, goals with no today tasks, goals with today tasks, ticking, persistence

**Driver app (code fixes):**
- Guarded `saveSettingsToStorage` and `loadSettingsFromStorage` in try/catch
- Added a save-failure message so a failed save no longer looks like success
- Fixed the Urdu share message (correction: پیٹرول not پٹرول)
- Made the Facebook in-app banner bilingual (English + Urdu)
- Added `id="feedbackLink"` to the feedback anchor in HTML — fixed the console error

**Driver app (launch):**
- Posted the Urdu introduction + 3 real screenshots (Details, Calculate, Results) to the approved group and 5 groups with no rule against links
- Logged the launch in `POST_DEV.md`
- Decided to pivot the video plan — one 60-second hybrid video instead of two scenario videos
- Drafted the Urdu and English captions, the AI voiceover scripts, and the carousel structure

### What worked
- Today's View shows exactly what's due and nothing else — it's the real "core experience" the MVP doc described
- Real screenshots (not mockups) look trustworthy and can't be second-guessed
- The approved-group post reached a couple of real visitors in the first hour — expected pace, not a viral moment
- The multi-group posting strategy (vary the intro, space posts apart, respect the group rules) is right for avoiding admin flags
- Pivoting the video from 2 scenarios to 1 hybrid was correct — easier to land, more useful to a first-time viewer

### What I learned
- **Launch is a trickle, not an event.** One post in one group gets you 2-5 visitors, not hundreds. Ten posts get you 20-50. That's normal for a first launch and there's nothing wrong with it.
- **Launching across groups needs admin etiquette.** Approved groups can accept a launch post; groups with no rules can too; groups with "no promotion" rules require waiting for admin approval. Being rejected by an admin is data, not a failure.
- **The 393 PKR example is more useful than the 500 PKR example.** It has a 3 km dead distance that viewers can see — the "hidden cost" story lands better than the simple 500/302 one.
- **Today's View needs both empty states.** "No goals yet" (onboarding) and "No tasks today" (accomplishment) are two different user moments. Handling them separately respects the user's situation.

### What confused me
- The ride platform card still doesn't appear in the Reports snapshot editor (still inside GA4's 24-48h propagation window). The Exploration shows it fine — that's the one that matters right now.
- The launch log I set up initially was too granular — tracking every group name and timestamp became friction. Simplified it to a broader format that tracks activity, numbers, and decisions.

### Design decisions locked in
- **Today's View is the default landing screen.** Goals list is one click away.
- **Two empty states in Today's View.** Onboarding vs. accomplishment.
- **One hybrid video**, not two scenario videos. Recording tomorrow.
- **Launch runs across multiple days**, not one big event. Groups will receive posts as admins approve them.
- **Launch log is broad**, not granular. Track numbers, decisions, and next steps — not every action.

