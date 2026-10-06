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

### What's next
- **Day 2:** Final schema in `docs/data_schema.md`, add `order` to block definition, apply the cut fields, move defaults into `DECISIONS.md`
- **Driver app parallel track:** Session 2 — write bilingual hints, English FAQ, create UTM links, request to join Facebook groups
- **Ongoing:** Protect the schedule — no redefinition of MVP scope before launch