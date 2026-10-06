# Open Questions

Questions not yet resolved. Revisit as needed — but not before the MVP ships, unless they block the MVP.

---

## Blocking for MVP

*(Currently empty — MVP scope is locked as of Oct 6.)*

---

## Post-MVP (revisit after Nov 1)

1. **App name.** Current working title: "Study Planner." Too narrow — the app is already general-purpose. Candidates: Steady, Stride, Trek, Goal Planner. Decide after launch.

2. **The cycle/date mechanic.** (Clarified Oct 6.) In the cycle version, blocks stood in a line in chronological order. Dates were auto-assigned based on order + the minimum. When a block was completed, the line shifted forward and dates re-derived. The user never manually assigned dates — the cycle did.
   - This is why cycles are so powerful: dates are a consequence, not a commitment.
   - This is post-MVP. But the schema must stay compatible with it.
   - Future work: a Cycle entity that holds its own date range and per-goal minimums. Blocks stay flat; cycle membership derived from `assignedDate` range.

3. **Public/private repo toggle.** The repo is private during planning. Before deploying (like Driver Calculator), it must be flipped to public for free GitHub Pages. Set a reminder.

4. **Block ordering within a goal.** When a goal has many blocks, how are they displayed? By `assignedDate` (chronological) or by user-defined order? Paper used chronological. Lean: chronological.

5. **Empty Today's View.** When the user opens the app on a day with no scheduled blocks:
   - Post-MVP option A: "You're ahead of schedule!" with a preview of upcoming blocks.
   - Post-MVP option B: just an empty state message.
   - MVP: simple empty state text.

6. **Completed tasks in Today's View.** Do they disappear or stay with a strikethrough?
   - Paper: they stayed with a tick. Lean: keep them visible with visual distinction.

7. **Undo for accidental completion.** A missed checkbox click is annoying. Post-MVP: undo button, or a brief undo toast. MVP: no.

8. **Block editing after completion.** Can a completed block be edited? Deleted?
   - Lean: yes, but this needs a UI decision.

---

## Ideas log

New ideas go here, not into scope documents. If an idea survives the MVP launch and still feels right, it graduates to `MVP_NEXT.md`.