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

## Day 2 — Schema Design & Durability Layer
**Date:** 7 October 2026
**Time spent:** ~5 hours (Driver 1h + Planner 4h)

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
- **Decision 8:** Changed as per Decision 15
- **Decision 15:** Decided that blocks will be ordered via `order`, making them independent of `assignedDate`. An arrow up and down button for ordering.
