# Data Schema

The contract between the app's logic and its storage. Every function reads from this schema. Every saved object conforms to it.

**Version:** 1
**Last updated:** 7 October 2026

---

## Storage

Three localStorage keys, all managed only by the data adapter.

| Key | Purpose | Contains |
|-----|---------|----------|
| `studyPlanner` | The data bundle | `{ schemaVersion, goals, blocks }` |
| `studyPlanner_meta` | Device-specific state | `{ lastBackupAt, reminderDismissedUntil }` |
| `studyPlanner_prev` | Safety snapshot | Previous state, kept before import and before goal deletion |

**Why three keys:**
- `studyPlanner` — the user's data
- `studyPlanner_meta` — device state. Doesn't survive a new phone. So it can't live inside the export file (otherwise importing on a new phone would silently transfer another device's reminder timestamp).
- `studyPlanner_prev` — protects against your own bugs: bad imports, accidental goal deletes, migration mistakes. Lives in the same browser, so it doesn't protect against clearing data.

---

## Entity: Goal

A goal is a container. It names a larger objective that the user is working toward.

| Field	| Type	| Required | Default | Set by | Stored |
|-------|-------|----------|---------|--------|--------|
| `id`	| string | yes | generated | system | yes |
| `title` |	string | yes | — | user | yes |
| `createdAt` |	string (ISO datetime) | yes | new Date().toISOString()	system | system | yes |

ID format: `goal_<uuid>` where `<uuid>` comes from `crypto.randomUUID()`.

Example:

```json

     {
       "id": "goal_a3f8e1d2-...",
       "title": "Physics Exam Prep",
       "createdAt": "2026-10-07T14:30:00.000Z"
     }
```

---

## Entity: Block

A block is one small, actionable task. Every block belongs to a goal.

| Field | Type | Required | Default | Set by | Stored |
|-------|------|----------|---------|--------|--------|
| `id` | string | yes | generated | system | yes |
| `goalId` | string | yes | — | system (from parent goal) | yes |
| `title` | string | yes | — | user | yes |
| `description` | string | no | `""` | user | yes |
| `assignedDate` | string (`YYYY-MM-DD`) | yes | — | user | yes |
| `order` | integer | yes | highest existing in goal + 1 | system | yes |
| `isCompleted` | boolean | yes | `false` | user (via checkbox) | yes |
| `completedAt` | string (ISO datetime) \| null | yes | `null` | system | yes |
| `createdAt` | string (ISO datetime) | yes | `new Date().toISOString()` | system | yes |

**ID format:** `blk_<uuid>` where `<uuid>` comes from `crypto.randomUUID()`.

**`order` rules:**
- Assigned at creation: highest existing `order` in the same goal + 1.
- **`order` and `assignedDate` are independent facts.** There is no invariant linking them. Do not write code that compares them.
- Renumbered contiguously within a goal **only** when the user reorders (via up/down buttons).
- Gaps are allowed after a delete (e.g., orders 1, 2, 4 if 3 was deleted).
- `order` does not need to be unique across goals — only within a goal.

**Example:**

```json

     {
       "id": "blk_7c2b4a1f-...",
       "goalId": "goal_a3f8e1d2-...",
       "title": "Unit 2: Exercise 3",
       "description": "Solve Q1–10, page 45",
       "assignedDate": "2026-10-08",
       "order": 1,
       "isCompleted": false,
       "completedAt": null,
       "createdAt": "2026-10-07T14:31:00.000Z"
     }
```

---

## Save Rules

Save the entire `plannerData` object on every mutation (create goal, edit block, complete block, delete, etc.). This is a small data set; the cost of one `setItem` call is negligible.

---

## Import Rules

Import goes through `importAll(bundle)` in the data layer. Screens only call it.

1. **Parse inside try/catch.** Files can be corrupted or the wrong format entirely.
2. **Check `app === "study-planner"`.** Reject anything else with a clear message.
3. **Check `schemaVersion`.** If it's newer than the app's version, reject — otherwise old code silently mangles new data.
4. **Validate required fields and apply defaults.** Never trust the file's contents.
5. **Drop blocks whose `goalId` doesn't exist.** Warn the user how many were dropped.
6. **Confirm with counts before replacing:** "This replaces your 3 goals and 40 blocks with 5 goals and 80 blocks from the backup dated Oct 7." Counts make accidental overwrites obvious.
7. **Take a safety snapshot first.** Write the current state to `studyPlanner_prev` before replacing, so an accidental import can be undone.

---

## Load Rules

**When loading `plannerData` from localStorage:**

- If key doesn't exist → first-time user. Start with an empty object: `{ schemaVersion: 1, goals: [], blocks: [] }`.

- If key exists but JSON.parse fails → corrupted data. Log a warning, clear the key, start fresh (same self-healing pattern as Driver Calculator).

- If parsed successfully → for each goal and block, apply defaults for any missing fields (using the Default column above).

- If `schemaVersion` is missing → assume 1.

- If `schemaVersion` is greater than the app's current version → the user has opened the app on a newer device/session. Log a warning and proceed with defaults.

---

## Backup File Format and an Example

The export is a single JSON file containing user data plus metadata.

```json

 {
  "app": "study-planner",
  "exportedAt": "2026-10-07T14:35:00.000Z",
  "schemaVersion": 1,
  "goals": [...],
  "blocks": [...]
 }
```

## Complete Example — Physics Exam Prep

A user creates one goal ("Physics Exam Prep") and three blocks.

**Goal:**
```json
{
  "id": "goal_a3f8e1d2",
  "title": "Physics Exam Prep",
  "createdAt": "2026-10-07T14:30:00.000Z"
}
```

**Block:**

```json
[
  {
    "id": "blk_001",
    "goalId": "goal_a3f8e1d2",
    "title": "Unit 2: Exercise 3",
    "description": "Solve Q1–10, page 45",
    "assignedDate": "2026-10-08",
    "order": 1,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2026-10-07T14:31:00.000Z"
  },
  {
    "id": "blk_002",
    "goalId": "goal_a3f8e1d2",
    "title": "Unit 3: Exercise 1",
    "description": "Read examples 2–4",
    "assignedDate": "2026-10-08",
    "order": 2,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2026-10-07T14:32:00.000Z"
  },
  {
    "id": "blk_003",
    "goalId": "goal_a3f8e1d2",
    "title": "Unit 3: Exercise 2",
    "description": "Solve Q1–12",
    "assignedDate": "2026-10-09",
    "order": 3,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2026-10-07T14:33:00.000Z"
  }
]
```

**All Together:**

```json

{
  "schemaVersion": 1,
  "goals": [
    {
      "id": "goal_a3f8e1d2",
      "title": "Physics Exam Prep",
      "createdAt": "2026-10-07T14:30:00.000Z"
    }
  ],
  "blocks": [
    {
      "id": "blk_001",
      "goalId": "goal_a3f8e1d2",
      "title": "Unit 2: Exercise 3",
      "description": "Solve Q1–10, page 45",
      "assignedDate": "2026-10-08",
      "order": 1,
      "isCompleted": false,
      "completedAt": null,
      "createdAt": "2026-10-07T14:31:00.000Z"
    },
    {
      "id": "blk_002",
      "goalId": "goal_a3f8e1d2",
      "title": "Unit 3: Exercise 1",
      "description": "Read examples 2–4",
      "assignedDate": "2026-10-08",
      "order": 2,
      "isCompleted": false,
      "completedAt": null,
      "createdAt": "2026-10-07T14:32:00.000Z"
    },
    {
      "id": "blk_003",
      "goalId": "goal_a3f8e1d2",
      "title": "Unit 3: Exercise 2",
      "description": "Solve Q1–12",
      "assignedDate": "2026-10-09",
      "order": 3,
      "isCompleted": false,
      "completedAt": null,
      "createdAt": "2026-10-07T14:33:00.000Z"
    }
  ]
}

```

### Derived from this data (not stored):

- Physics progress: 0/3 = 0%

- Today (if today is 2026-10-08): blk_001 and blk_002, sorted by order (1 then 2)

- Missed blocks: none (all dates ≥ today)

- Today's blocks grouped by goal: Physics Exam Prep → two blocks
