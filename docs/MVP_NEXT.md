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

### Cloud Sync / Accounts

**Concept:** User creates an account. Data syncs across devices automatically. No manual backups.

**Why it's first priority post-MVP:** Solves the durability problem permanently. localStorage + export is a bridge to this.

**Effort:** High. Requires a backend (auth + database). Not compatible with the 3-week MVP timeline.

**Depends on:** Data schema stability (so migrations are one-time). The schema we ship in v1 must survive this.

---

### Silent File Backups (File System Access API)

**Concept:** Once the user picks a backup folder, the app writes backups automatically — no download prompt.

**Limitation:** Works only on desktop Chrome. Not on iOS Safari or Firefox. So it's a bonus, not a replacement for the share sheet.

**Effort:** ~4h.

---

### Readable CSV Export

**Concept:** Alongside the JSON backup, export a human-readable CSV of goals and blocks. If the app ever dies, the user still has their data readable in Excel/Sheets.

**Effort:** ~1h.

---

### PWA (Installable App)

**Concept:** Manifest + service worker. Users can install to home screen and use offline.

**Bonus:** Installed PWAs get better storage persistence behavior on iOS.

**Effort:** ~3h.

### Cycle System

**Concept:** A container of blocks ordered chronologically. Dates are auto-assigned based on block order and a user-set minimum.

**Properties:**
- Cycle has: id, startDate, endDate, per-goal minimums
- Blocks belong via explicit membership — either `cycleId` on blocks, or an ordered list inside the Cycle
- **Dates are derived** from order + minimum. Not assigned by the user.

**User Experience:**
- User creates a cycle (e.g., one week)
- User dumps blocks into the cycle in any order
- App auto-assigns dates to the first N blocks based on the minimum
- Completing a block shifts the line forward; dates re-derive
- A planning day at the end of each cycle

**Why it matters:** The farther out you plan, the less accurate. Cycles force weekly re-planning.

**Depends on:** Blocks stay flat. `order` field exists. Automatic rollover (if added) must be opt-in.

---

### Automatic Missed-Block Distribution
**Concept:** When a block is missed, distribute it evenly across future days rather than piling it up.

**Requires:** Cycles to be meaningful (needs a range and a minimum to distribute within).

---

### Ahead/Behind Counter
**Concept:** A single number showing how many blocks ahead or behind the user is for the current cycle.

**User Experience:** Displayed at the top of Today's View. Positive = ahead, negative = behind.

**Computed, not stored** — derived from completed blocks vs. minimum × elapsed days.

---

### Custom Fields / Structure Editor
**Concept:** Users can define their own fields on goals and blocks.

**Warning:** This will require rewriting forms and screens to be dynamic. Data model stays intact.

---

### Planning Day
**Concept:** A designated day at the end of each cycle for review and next-cycle planning.

**User Experience:** On the designated day, the app shows a "Planning Day" screen instead of (or alongside) Today's View.

---

### Stats / Progress Views
**Concept:** Longer-horizon progress views — per-goal completion over time, streak tracking, etc.

**Depends on:** Sufficient data to be meaningful (i.e., weeks of use).