### `date.js` — Local date helpers
**`getTodayString()`**

- Inputs: none
- Output: `"YYYY-MM-DD"` string for **today in local time**
- Changes: nothing
- Note: Built from `getFullYear()`, `getMonth() + 1`, `getDate()`. **Never** `toISOString()`.

**`formatDateForDisplay(dateStr)`**

- Inputs: `"2026-10-08"` or `null`
- Output: `"Oct 8, 2026"` or `"—"` for null
- Changes: nothing
- Note: For UI display only.

---

### `storage.js` — localStorage adapter
**`loadAll()`**

- Inputs: none
- Output: canonical `plannerData` = `{ schemaVersion, goals, blocks }`
- Changes: reads `studyPlanner`; if missing, returns empty object with `schemaVersion: 1`. If parse fails, logs and returns empty. If `schemaVersion` is newer, sets internal `locked = true` and returns what's there for display (but not editable).
- Note: Applies defaults. Uses the Validation Rule from `data_schema.md` — drops records missing `title`, `goalId` (for blocks), or `id` (for goals).

**`saveAll(plannerData)`**

- Inputs: the in-memory `plannerData` object
- Output: `true` on success, `false` if locked
- Changes: writes to `studyPlanner` via `setItem`
- Note: **Refuses to write when `locked === true`.** This is the protection against overwriting newer data.

**`isLocked()`**

- Inputs: none
- Output: `true` / `false`
- Note: Used by screens to show the "data is locked" banner.

**`loadMeta()` / `saveMeta(meta)`**

- Inputs: none / meta object
- Output: meta object / `true`
- Note: `studyPlanner_meta` key. Device state only.

**`exportAll(plannerData)`**

- Inputs: current plannerData
- Output: a backup bundle object `{ app, exportedAt, schemaVersion, goals, blocks }`
- Changes: none (pure transform)
- Note: Screens then trigger download or share.

**`importAll(bundle)`**

- Inputs: parsed bundle object
- Output: `{ success: true, newData }` or `{ success: false, reason }`
- Changes: **Replaces** current plannerData with the validated/migrated bundle. Also takes a safety snapshot if Tier 2 is built.
- Note: Full validation per `data_schema.md` Import Rules.

**`migrate(bundle)`**

- Inputs: bundle with older `schemaVersion`
- Output: canonical `plannerData` shape
- Note: Empty for v1 (nothing to migrate yet). Add future migrations here.

---

### `data.js` — Business logic
All of these read/write the in-memory `plannerData` and call `saveAll()` at the end.

**`createGoal(title)`**

- Inputs: title string
- Output: the new goal object
- Changes: adds to `plannerData.goals`. Saves.
- Decision: 12 (blocks belong to goals).

**`updateGoal(goalId, newTitle)`**

- Changes: finds and updates goal title. Saves.

**`deleteGoal(goalId)`**

- Changes: removes goal from `goals`, removes ALL blocks whose `goalId` matches. Saves.
- Decision: 12 (cascade delete).

**`createBlock(goalId, title, description, assignedDate)`**

- Inputs: goalId, title (required), description (optional), assignedDate (may be `null`)
- Output: the new block object
- Changes: adds to `plannerData.blocks` with new `id`, `order` = max order in goal + 1, `isCompleted = false`, `completedAt = null`, `createdAt` = now. Saves.

**`updateBlock(blockId, { title, description, assignedDate })`**

- Changes: updates only the provided fields. **Does NOT change `order`.** Saves.
- Note: Rescheduling = setting `assignedDate`. Same function.

**`deleteBlock(blockId)`**

- Changes: removes block. Does NOT renumber siblings (gaps allowed per Decision 8). Saves.

**`toggleBlockComplete(blockId)`**

- Changes: flips `isCompleted`. If now true, sets `completedAt = new Date().toISOString()`. If now false, `completedAt = null`. Saves.
- Decision: 10 (untick rule).

**`reorderBlock(blockId, direction)`**

- Inputs: blockId, direction = `"up"` | `"down"`
- Changes: swaps `order` with the immediate neighbor in sorted order. Renumbers contiguously in that goal. Saves.
- Decision: 15.

---

### Derived getters — no side effects
**`getTodayBlocks(plannerData)`**

- Output: blocks where `assignedDate === getTodayString()`, grouped by goal, sorted by `order` within each goal
- Note: Does NOT mutate.

**`getMissedBlocks(plannerData)`**

- Output: blocks where `assignedDate !== null && assignedDate < today && !isCompleted`

**`getUnscheduledBlocks(plannerData, goalId)`**

- Output: blocks where `assignedDate === null` for that goal

**`getGoalProgress(plannerData, goalId)`**

- Output: `{ completed, total, percent }` — computed, never stored
- Decision: 10 (zero-block goal shows "No tasks yet")

**`getAllGoalsSorted(plannerData)`**

- Output: goals sorted by `createdAt`

**`getBlocksForGoal(plannerData, goalId)`**

- Output: blocks for that goal, sorted by `order`

---

### `screens/` — DOM-only (not data.js)
One file per screen, or one `ui.js` with a section per screen.

- `renderTodayView()` — calls `getTodayBlocks()`, `getMissedBlocks()`, loops and renders
- `renderOrganizer()` — calls `getAllGoalsSorted()`, renders list
- `renderGoalDetail(goalId)` — calls `getBlocksForGoal()` and `getUnscheduledBlocks()`
- `renderGoalForm(goalId?)` — new or edit
- `renderBlockForm(goalId, blockId?)` — new or edit
- `renderSettings()` — export/import/FAQ/about
- Also: `attachEventListeners()` at startup, wiring buttons to data-layer functions
