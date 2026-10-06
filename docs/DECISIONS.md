# Decisions Log

Every decision here has a reason. If the reason changes, the decision can change.

---

## Decision 1 — The paper system is the reference

**Decision:** Every MVP decision is validated against four years of proven paper practice. If the paper system solved a problem a certain way, the app defaults to that. If it didn't solve a problem, the app doesn't either (yet).

**Reason:** The paper system is the only evidence we have that the workflow actually works. It replaces opinion with evidence and prevents designing features that were never needed.

**Caveats:**
- Copy the behavior, not the medium. Paper has affordances the app doesn't (whole-week visibility, deliberate erasing, physical presence). Translate those where relevant.
- It's evidence from one person. Fine for an MVP built for personal use. Not proof about other users.

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

## Decision 4 — `assignedDate` is required in the MVP

**Decision:** Every block must have an `assignedDate`.

**Reason:** Paper v1 required a date for every block. The cycle version derived dates, but that's a post-MVP concept.

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

**Decision:** Each block has an `order` field — its position within its goal.

**Reason:** Paper v1 had S.no as an explicit column. By Decision 1 (paper is the reference), this justifies including `order` now, not as a "just-in-case" hook. It also makes future cycle migration easy: when cycles arrive, `schemaVersion` lets us compute dates from `order`.

---

## Decision 9 — Missed blocks are visible but not aggressive

**Decision:** A missed block stays on its original date (Decision 6). It appears in Goals & Blocks with a quiet "missed" label. Today's View shows only a one-line count ("2 missed") linking to Goals & Blocks.

**Reason:** Paper didn't hide missed blocks — the unticked row sat on a visible page. But paper also didn't punish. This preserves visibility without the anxiety wall of an overdue list.

---

## Decision 10 — MVP display defaults

These are defaults for the first code implementation. Revisit after launch.

- **Block ordering (Goals & Blocks):** Chronological by `assignedDate`, then by `order`.
- **Completed tasks in Today's View:** Stay visible with strikethrough and reduced opacity.
- **Zero-block goal:** Allowed. Shows "No blocks yet" instead of a percentage (avoids division by zero).
- **Empty Today's View:** Simple message ("No tasks today" + optional preview of upcoming).

---

## Decision 11 — Fields cut from MVP

**Decision:** `estimatedMinutes` is cut. `category` is cut.

**Reason (estimatedMinutes):** Paper had no estimate column. Blocks were "small and equal steps," so estimates were never needed. Adding an optional field later is cheap.

**Reason (category):** In paper, "Subject" was essentially the goal itself (one goal per subject). A goal-level category is redundant with the goal structure.

**Kept:** `createdAt` and `completedAt`. Timestamps cannot be backfilled; future stats depend on them.

*Note: this reverses a field from the original MVP_MUST. Flag in your head — if category turns out to be needed for filtering goals, it's a one-line addition later.*