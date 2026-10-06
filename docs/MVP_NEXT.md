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

**Concept:** A container of blocks ordered chronologically. Dates are auto-assigned based on block order and a user-set minimum.

**Properties:**
- Cycle has: id, startDate, endDate, per-goal minimums
- Blocks belong to a cycle via explicit membership — either `cycleId` on the block, or an ordered list inside the Cycle record
- **Dates are derived** from order + minimum, not assigned by the user

**User Experience:**
- User creates a cycle (e.g., one week)
- User dumps blocks into the cycle in any order
- App auto-assigns dates to the first N blocks based on the minimum
- When a block is completed, the line shifts forward and dates re-derive
- A planning day at the end of each cycle to review and plan the next

**Why it matters:** The farther out you plan, the less accurate. Cycles force weekly re-planning.

**Depends on:** Blocks must stay flat. `order` field should exist (see DECISIONS.md). Automatic rollover is opt-in, so users on manual flow aren't affected.

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