# Study Planner - MVP MUST Have features

## Foundation

**File Purpose:** This document defines the MINIMUM features required for the Study Planner to be functional, useful, and launchable. No Tier 1 feature can be cut. Tier 2 features may slip to post-MVP if the schedule requires it (see Decision 13).

**App Purpose:** It allows people to break huge goals into small scheduled actionable steps over a period of time.

**Ideal User:** People who have a Goal and want somewhere to implement their plan accomplishing it. They want to break their huge goals into small steps, capable of being taken daily, over a period of time.

**Main Principles:**
- Simple
- Free if possible
- Low Friction (Not too complicated for the user)
- Tailored specifically towards planning ahead

**Format: Use this to explain features**
- Concept: What is this thing?
- properties: What does it need?
- User Experience: How user interacts
- Questions: for later

---

## MUST HAVE features (non-Negotiatable)

### 1. 'Goals & Blocks" tab

**Concept:** Second tab which works as a control center for the user

**Properties:** 
- Has a "Create Goal button"
- Shows all the current goals and % of blocks completed in a My Goals list
- Goals can be created/edited/deleted
- Tasks can be organized via created/edited/scheduled/deleted

**User experience:** 
- User sees their current goals
- A "+ New Goal" option to create a goal
- User can create/schedule/edit/delete blocks

### 2. Goal Creation

**Concept:** Works like a folder to store blocks

**Properties:**
- Title (required)
- Edit/Delete buttons

**User Experience:**
- inside "Goals & Blocks" Tab
- User clicks "+ New Goal" button
- After saving, goal appears in "My Goals" list

**Questions for later:**

---

### 3. Task Decomposition (Adding Blocks)

**Concept:** Blocks are individual tasks that belong to a Goal

**Properties:**
- Block Title (required)
- Description (optional)
- Assigned Date (calendar picker, VERY IMPORTANT!)
- Link to parent Goal (goalId)
- Can Edit/Re-schedule/Delete

**User Experience:**
- After creating a goal user can add blocks
- "+ Add Block" button adds a new empty row
- Blocks are listed under the Goal
- User can delete a block before saving

**Questions for later:**

---

### 4. Today's View tab (The Core Experience)

**Concept:** The main screen — shows tasks assigned to today's date

**Properties:**
- Shows: Block Title, description, order
- Blocks are grouped by Goal they belong in

**User Experience:**
- This is the DEFAULT screen when user opens the app
- User sees everything they planned for TODAY immediately

**Questions for later:**
- What if there are no tasks for today?
- Should it show task scheduled for the future?

---

### 5. Task Completion (Checkbox)

**Concept:** User marks a task as "done"

**Properties:**
- Each block has a checkbox/complete toggle
- Completed status is saved

**User Experience:**
- User clicks checkbox next to a task
- Task visually changes (strikethrough or color change to grey)
- Satisfying visual feedback (green check or subtle animation)

**Questions for later:**
- Should completed tasks disappear from today's view?
- Should there be an "undo" for accidental completion?

---

### 6. Data Persistence (Saving)

**Concept:** Everything user creates stays saved even after closing the browser

**Properties:**
- Goals save (title, createdAt)
- Blocks save (title, description, assignedDate, order, isCompleted, completedAt, createdAt)
- Data persists across browser sessions

**User Experience:**
- User doesn't have to click "Save" manually
- Data saves automatically after every action
- When user reopens the app, everything is exactly as they left it

**Questions for later:**
- Do we need cloud backup?
- What if user clears browser cache?

---

### 7. Basic Navigation

**Concept:** User can switch between tabs

**User Experience:**
- "Today's view" tab (default) — shows today's tasks
- "Organizer" tab — for organizing Goals and Blocks
- "Settings" tab — for other stuff

**Questions for later:**
- What about past dates? Can the user view them?

---

### 8. Reorder Blocks
- Up/down buttons swap a block with its next neighbor in the goal (sorted by `order`).
- Does not change `assignedDate`.

---

### 9. Missed Block Visibility
- Missed blocks (past date, not complete) appear in Goals & Blocks with a quiet "missed" label.
- Today's View shows a one-line count, e.g. "2 missed", linking to Goals & Blocks.

---

### 10. Settings Tab
- Export backup (download or share)
- Import backup
- Request persistent storage
- Add-to-home-screen note
- FAQ
- About

---

### 11. Data Durability (Tier 1)
- Export/import file
- Share sheet for export
- Persistent storage request
- Add-to-home-screen note

---

### 12. Data Durability (Tier 2 — if schedule allows)
- Backup reminder banner
- Safety snapshot (previous state kept before import and goal delete)

---

## Success criteria

**User should be able to:**
- Create a Goal
- Break it into blocks
- schedule those blocks
- return on subsequent days
- see what they need to do
- complete blocks
- edit/reschedule/delete
- retain data in browser
- plan dates ahead

---

### Note(Oct 6)

The MVP is the paper-system v1 — dated blocks, goals, Today's View, tick-off, progress %, manual reschedule. The vision (utility platform with user-composed primitives) is documented in `DECISIONS.md` and does not change MVP scope. `estimatedMinutes` and `category` are cut from MVP (see DECISIONS.md #11). `order` is added. `assignedDate` is required. `targetDate` is out.

---

## Scope Lock (7 Oct 2026)

- `assignedDate` is required per block.
- `order` is added per block (matches paper's S.no column).
- `estimatedMinutes` and `category` are cut from MVP.
- `targetDate` is cut from MVP.
- Rollover is manual — missed blocks stay on their original date until user reschedules.
- See `docs/DECISIONS.md` for reasoning.