# Study Planner — Next Features (Post-MVP)

## Foundation

**File purpose:** Next features to be implemented after MVP. They should provide the highest value after non-essential features. They will be my next step after MVP.

**Priority Scale:** All the features should be categorized by the most value to the least.

**Format: Use this to explain features**
- Concept What is this thing?
- properties: What does it need?
- User Experience: How user interacts
- Questions: for later

---

## Next Features (Priority Order)

### 1. Cycle System
**Concept:** A container of blocks ordered chronologically, with dates auto-assigned based on order and a user-set minimum.

**Properties:**
- Cycle has: id, startDate, endDate, per-goal minimums
- Blocks belong to a cycle (derived from `assignedDate` range, or via new `cycleId` field)
- Order is chronological; dates are derived from order + minimum

**User Experience:**
- User creates a cycle (e.g., one week)
- User dumps all blocks into the cycle in any order
- App auto-assigns dates to the first N blocks based on the minimum
- When a block is completed, the line shifts forward and dates re-derive

**Why it matters:** The farther out you plan, the less accurate. Cycles force weekly re-planning. Also adds a natural feedback loop.

**Depends on:** Nothing from MVP breaking. Blocks must stay flat.

---

### 2. Automatic Missed-Block Distribution
**Concept:** When a block is missed, distribute it evenly across future days rather than piling it up.

**Requires:** Cycles to be meaningful (needs a range and a minimum to distribute within).

---

### 3. Ahead/Behind Counter
**Concept:** A single number showing how many blocks ahead or behind the user is for the current cycle.

**User Experience:** Displayed at the top of Today's View. Positive = ahead, negative = behind.

**Computed, not stored** — derived from completed blocks vs. minimum × elapsed days.

---

### 4. Custom Fields / Structure Editor
**Concept:** Users can define their own fields on goals and blocks.

**Warning:** This will require rewriting forms and screens to be dynamic. Data model stays intact.

---

### 5. Planning Day
**Concept:** A designated day at the end of each cycle for review and next-cycle planning.

**User Experience:** On the designated day, the app shows a "Planning Day" screen instead of (or alongside) Today's View.

---

### 6. Stats / Progress Views
**Concept:** Longer-horizon progress views — per-goal completion over time, streak tracking, etc.

**Depends on:** Sufficient data to be meaningful (i.e., weeks of use).