# Decisions Log

Every decision here has a reason. If the reason changes, the decision can change.

---

## Decision 1 — The paper system is the reference

**Decision:** Every MVP decision is validated against four years of proven paper practice. If the paper system solved a problem a certain way, the app defaults to that. If it didn't solve a problem, the app doesn't either (yet).

**Reason:** The paper system is the only evidence we have that the workflow actually works. It replaces opinion with evidence and prevents designing features that were never needed.

**Caveats:**
- Copy the behavior, not the medium. Paper has affordances the app doesn't (whole-week visibility, deliberate erasing, physical presence). Translate those where relevant.
- It's evidence from one person. Fine for an MVP built for personal use. Not proof about other users.

**Exception:** Decision 1 (paper is the reference) does not apply to *invisible* fields — timestamps (`createdAt`, `completedAt`) and technical fields (`schemaVersion`). These exist for future functionality and cannot be backfilled later, so they're allowed even when paper was silent on them.

---

## Decision 2 — The vision: a canvas, not a tool

**Decision:** The long-term vision is that the app is a *platform* — a set of primitives the user composes into their own planning system. The user's imagination is the ceiling.

**Reason:** The paper version worked because it was personal and mine. The app should recreate that feeling — not by forcing a workflow, but by giving the user solid building blocks.

**This is the vision, NOT the MVP.** The MVP ships only primitives (user-created blocks named "buffer"), no automation.

---

## Decision 3 — Option A chosen for MVP scope

**Decision:** The MVP is the paper-system v1: dated blocks, goals, Today's View, tick-off, progress %, manual reschedule. Vision and roadmap documented. Platform features deferred to post-MVP.

**Reason:** Option A (paper v1) can ship in ~3 weeks. Option B (structure editor in MVP) pushes past the deadline. Option C (full platform) is incompatible with Nov 1.

**Six rules that keep the foundation buildable:**
1. Keep data logic out of the screen code — one data layer that never touches the DOM.
2. Store facts, calculate everything derived — progress % and counts are computed, never saved.
3. Flat collections linked by id, plus `schemaVersion`.
4. One date helper for all dates. Store as `YYYY-MM-DD` strings.
5. Render by looping over data — one render function per entity type.
6. Loading tolerates missing or extra fields — use defaults.

**Rule for extension:** Do not build unused hooks (no `cycleId` on blocks, no custom-fields object "just in case"). The six rules above ARE the extension points.

---

## Decision 4 — Blocks can be created without a date (supersedes old Decision 4)

**Decision:** `assignedDate` is optional. Blocks without it are called "unscheduled." They appear in the Organizer (goal detail), not in Today's View.

**Reason:**
- Defaulting to "today" bloats Today's View when the user batch-creates blocks without firm dates in mind.
- Allowing blank supports a passive drafting workflow: create blocks first, schedule later.
- Blocks without a date are still useful — they live in the goal until the user assigns them.

---

## Decision 5 — `targetDate` is out of the MVP

**Decision:** Goals do not have a target completion date in the MVP.

**Reason:** Paper was silent on goal-level deadlines. By Decision 1, silent means "not in the app."

---

## Decision 6 — Rollover is manual reschedule + user-created buffers

**Decision:** When a block is missed, it stays on its original date. It does NOT auto-move. The user deals with it by manually rescheduling (the same edit action already in the MVP) or by using a "buffer" block they created themselves.

**Reason:**
- On paper, moving a missed block is a deliberate act — you pick up a pen and write it on a new day. That deliberateness is the point.
- Auto-pile (moving everything to tomorrow) creates the anxiety problem we identified. Auto-distribute is a post-MVP feature that requires cycles to be meaningful.
- "Buffer blocks" are not a feature. They are a block the user names "buffer." By Decision 1, the app provides primitives; the user composes them.

**Post-MVP options this leaves open:**
- Automatic distribution (spread missed blocks across future days, raise the minimum)
- "Ahead/behind" counter
- These are additive, not replacements, of the manual approach.

---

## Decision 7 — Schema shape

**Decision:**
- Goals and blocks are stored as separate flat collections, linked by `goalId`.
- A `schemaVersion` number is saved alongside the data.
- Loading uses defaults for any missing field.

**Reason:** Flat collections let us add a Cycle entity later without touching any block. `schemaVersion` lets us migrate saved data forward. Defaults let old saved data work after new fields are added.

---

## Decision 8 — Block ordering uses an `order` field

**Decision:** Each block has an `order` field — its position within its goal. `order` is the primary sort for the goal view. `assignedDate` is a separate, independent fact that determines which day the block appears in Today's View.

**Reason:**
- Paper v1 had S.no as an explicit column, separate from Date. The cycle version made order primary and derived dates. The same relationship carries into the app.
- If dates sorted the goal view, rescheduling a missed block would reshuffle the sequence. With order-primary, a missed Unit 2 moved to tomorrow still sits before Unit 3 in the goal.
- It makes the MVP compatible with future cycles (cycles derive dates from order + minimum).

**Mechanics:**
- New blocks get `order` = highest existing `order` in that goal + 1.
- `order` is renumbered contiguously within a goal only when the user reorders.
- Gaps allowed after a delete.
- **`order` and `assignedDate` are independent. No invariant exists between them.** Do not write code that compares them.

**Not in MVP:** A sort toggle in the goal view. Paper had one ordering; the second sort goes to `MVP_NEXT.md`.

---

## Decision 9 — Missed tasks appear in a collapsed section

**Decision:** Missed tasks (past date, not complete) appear in a **collapsible "Missed" section** at the top of Today's View. It's collapsed by default. Each row shows the task's goal and original date. Each row can be rescheduled from within that section.

**Wording:** Use "Missed," never "Overdue."

**Reason:** Paper didn't hide missed tasks — the unticked row sat on a visible page. But paper also didn't punish. This preserves visibility without the anxiety wall of an overdue list. The section is collapsed to avoid dominating the screen on days with a lot of catch-up.

**Post-MVP option:** A one-line count at the top of Today's View ("2 missed") linking to the Organizer.

---

## Decision 10 — MVP display defaults

These are defaults for the first code implementation. Revisit after launch.

- **Block ordering (Goals & Blocks):** Primary sort by `order` within each goal. `assignedDate` is displayed on each row but does not affect sort order.
- **Today's View grouping:** Grouped by goal (in goal `createdAt` order). Within each group, sorted by `order`.
- **Editing completed blocks:** Allowed. Same edit action as uncompleted blocks.
- **Completed tasks in Today's View:** Stay visible with strikethrough and reduced opacity.
- **Zero-block goal:** Allowed. Shows "No blocks yet" instead of a percentage (avoids division by zero).
- **Empty Today's View:** Simple message ("No tasks today" + optional preview of upcoming).
- **Unticking a completed block:** `isCompleted` → `false`, `completedAt` → `null`.

---

## Decision 11 — Fields cut from MVP

**Decision:** `estimatedMinutes` is cut. `category` is cut.

**Reason (estimatedMinutes):** Paper had no estimate column. Blocks were "small and equal steps," so estimates were never needed. Adding an optional field later is cheap.

**Reason (category):** In paper, "Subject" was essentially the goal itself (one goal per subject). A goal-level category is redundant with the goal structure.

**Kept:** `createdAt` and `completedAt`. Timestamps cannot be backfilled; future stats depend on them.

*Note: this reverses a field from the original MVP_MUST. If category turns out to be needed for filtering goals, it's a one-line addition later.*

---

## Decision 12 — Deleting a goal deletes its blocks

**Decision:** Deleting a goal deletes its blocks. When a user deletes a goal, all blocks belonging to that goal are deleted too, after a confirmation dialog. Blocks cannot exist without a goal in the MVP.

**Reason:** Paper "crossed out the pages" — the goal and its blocks went together. Confirmation prevents accidental loss. Orphan blocks add a UI decision (where do they show?) that isn't worth solving for MVP.

---

## Decision 13 — Data durability

**Decision:** The MVP includes a durability stack built on top of localStorage. The stack ships in two tiers.

**Reason:** This app's core value is irreplaceable user effort. Losing data costs the user hours of planning work. localStorage alone is not sufficient.

### Tier 1 — Ships in MVP

| Option | Effort | Protects against |
|--------|--------|------------------|
| Export / import file | ~3h | Clearing data, new phone, lost device |
| Share sheet for export | ~1h | Backups lost in Downloads folder nobody opens |
| Persistent storage request | ~30 min | Browser evicting data (request, not guarantee) |
| Add-to-home-screen note + first-run note (text only) | ~20 min | Safari's 7-day cleanup of browsing data; users not knowing data lives on their phone |

### Tier 2 — Ships in MVP if schedule allows, else post-MVP

| Option | Effort | Protects against |
|--------|--------|------------------|
| Backup reminder banner | ~1h | Forgetting to back up |
| Safety snapshot (previous state kept before import and goal delete) | ~1.5h | Your own bugs and mistakes |

### Why export is not "automatic"

Browsers cannot write files silently. "Automatic backup" means **automatically prepared, one tap to save.** The share sheet makes this two taps: generate → send to WhatsApp/email/Drive. On phones, this is the difference between backups that exist and backups that don't.

### Cut rule

At the end of week 2, if the build is behind: Tier 2 slips to post-MVP. Tier 1 doesn't.

---

## Decision 14 (Revised) — Hamburger Drawer Navigation

**Decision:** Primary navigation is a hamburger menu icon in the top-left of every screen. Tapping it slides a drawer ~70% from the left, showing:
- Today's Tasks
- Organizer
- Settings

**Reason:**
- The Calculator's fixed 3-tab layout assumes a small, stable set of destinations. This app will grow.
- A drawer lets us add tabs without redesigning the navigation.
- It matches common patterns (Slack, Gmail, Google apps).

**Tradeoff:** Lower discoverability than a fixed tab bar. Mitigation: first-run tooltip or a visible "Today" label near the hamburger on the initial screen.

---

## Decision 15 — Reorder mechanics

**Decision:** Users reorder blocks within a goal using up/down buttons that swap a block with its neighbor, "neighbor" means the next block in sorted order, not order minus 1 (gaps exist). Drag-and-drop is post-MVP.

**Reason:**
- Up/down works reliably on all phones; drag-and-drop is finicky on mobile and harder to build.
- Reordering is a primitive the user composes with — it belongs in MVP per the vision.
- Up/down buttons are ~1.5h of work; drag-and-drop is ~3h.

**Mechanics:**
- When the user taps ↑ on a block, that block swaps `order` with the block immediately above it in the same goal.
- Renumber contiguously after each swap to keep `order` tidy.
- Reorder does not change `assignedDate`. The two fields are independent.

---

## Decision 16 — "Task" is the user-facing word for blocks

**Decision:** The schema and code call them "blocks." The UI calls them "tasks."

**Reason:** "Block" is a developer term. Users understand "task" instantly. Keeping a separate term for internal use means we can rename the user-facing word without touching the schema.

---

## Decision 17 — No default "General" goal; guided empty state

**Decision:** The app does NOT auto-create a "General" goal on first run. Instead:
- Empty Today's View shows: "No goals yet. Create your first goal to get started."
- The `+` button on empty Today's View opens the goal form.
- Once goals exist, `+` opens the task form with a required goal picker.
- Inside a goal detail, `+` opens the task form with that goal pre-selected.

**Reason:**
- No magic data the user didn't create.
- Guided onboarding teaches the app's core concept (goals come before tasks).
- Preserves the vision: everything is user-composed.

**Tradeoff:** Slightly more friction on first task. Offset by the empty state clearly directing the user.

---

## Decision 18 — UI defaults

**Task creation:**
- `+` on Today's View defaults the date to **today**.
- "Add Task" inside a goal detail defaults the date to **blank** (unscheduled).

**Today's View layout:**
- Task rows show title (bold) and description (smaller, muted, below title) if present.
- Date format: "Oct 9, 2026" (from `formatDateForDisplay`).
- Goal groups are always expanded; only goals with at least one task today appear.

**Task form:**
- Shows a "Remove date" option when a date is set.
- The `⋮` Delete option only appears when **editing** an existing task (not creating).

**First-run banner:**
- Shown at top of Today's Tasks on first launch.
- Dismissible.
- Dismissal stored in `studyPlanner_meta.firstRunDismissed = true`.

**State model:**
- `plannerData` lives in `data.js` as a single variable.
- `initData()` loads it from storage.
- `getData()` returns the current in-memory object.
- All getters take `plannerData` as a parameter (pure).
- All mutations return `{ success: true, data }` or `{ success: false, error }`.

---

## Decision 19 — Cut order and checkpoint

**Cut order (first to be cut if behind):**
1. Backup reminder banner (~1h)
2. Safety snapshot (~1.5h)
3. Share sheet for export (~1h) — download fallback stays
4. Reorder buttons (~2h)
5. Visual polish (always last)

**Checkpoint:** End of **October 19**. If Goals, Tasks, and Today's View aren't working by then, the cut starts. Tier 1 features don't get cut.

**Reason:** Cutting is easier when it's a pre-committed sequence, not an in-the-moment decision.