# Open Questions

Questions not yet resolved. Revisit as needed — but not before the MVP ships, unless they block the MVP.

---

## Blocking for MVP

**Missed block visibility.**
Today's View shows only today's blocks, so a missed block on a past date becomes invisible. Resolution (MVP):
- Missed blocks show in **Goals & Blocks** with a quiet "missed" label.
- Today's View shows at most a one-line count, like "2 missed," linking there.
- No wall of overdue tasks. No auto-move.

---

## Post-MVP (revisit after Nov 1)

1. **App name.** Current working title: "Study Planner." Too narrow. Candidates: Steady, Stride, Trek, Goal Planner. Decide after launch.

2. **The cycle/date mechanic.** (Clarified Oct 6.) In the cycle version, blocks stood in a line in chronological order. Dates were auto-assigned based on order + minimum. **Dates are derived from the cycle — so cycle membership cannot be derived from dates.** Cycles need explicit membership: either a `cycleId` on blocks, or an ordered list inside the Cycle record. Post-MVP.

3. **Repo visibility.** The repo is private during planning. Flip to public before deploying. Set a reminder.

4. **Block ordering within a goal.** By `assignedDate` (chronological) or by user-defined order? Paper v1 used S.no — an explicit order. The `order` field is justified now (see DECISIONS.md).

5. **Empty Today's View.** When the user opens the app on a day with no scheduled blocks: "You're ahead of schedule!" with preview of upcoming blocks, or just an empty state message? Lean: simple empty state text for MVP.

6. **Completed tasks in Today's View.** Do they disappear or stay with a strikethrough? Lean: keep them visible with visual distinction.

7. **Undo for accidental completion.** Post-MVP: undo button or brief undo toast. Not in MVP.

8. **Editing completed blocks.** Can a completed block be edited or deleted? Lean: yes, but needs a UI decision.

---

## Tasks (not questions)

- [ ] Flip repo to public before deploy.
- [ ] Decide which planning docs ship publicly (PAPER_SYSTEM.md is personal — may exclude).
- [ ] Register domain? (skip — not needed for MVP, driver app precedent)

---

## Ideas log

New ideas go here, not into scope documents. If an idea survives launch and still feels right, it graduates to `MVP_NEXT.md`.