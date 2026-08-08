# Digby web UI — prototype

Round two. Andre picked Variant B ("Cascade" — sidebar, tabs, calendar,
table, chat check-in) from the first round and asked for three creative
evolutions of it rather than more unrelated concepts. All three now share
the same domain foundation and the same shared widgets (calendar, table,
chat check-in — see below) but reimagine the shell around them: tabs vs.
a single cockpit screen vs. a continuous scroll. Switchable live via a
`?variant=` URL param and the floating bottom bar, per this repo's own
[`prototype` skill](../../.claude/skills/prototype/UI.md).

**Not the MVP delivery artifact.** Per [issue #17](https://github.com/andrefabre/digby-virtual-assistant/issues/17)
the MVP is CLI/markdown; a richer UI is explicitly deferred. This exists to
make the current design tangible and to compare shapes, nothing more.

## Run it

No dependencies beyond Python's standard library.

```bash
python prototype/webapp/server.py
```

Then open http://127.0.0.1:8765 — flip between variants with the bottom bar,
the `←`/`→` keys, or by editing `?variant=A|B|C` in the address bar.

**No persistence.** All state (including check-ins) lives in memory in the
browser tab — a reload resets everything to the seed data in `data.js`. This
is deliberate: the question here is what the UI should look like, not
whether a backend works.

## The three variants

- **A — Command Center**: no sidebar, no tabs — everything that matters
  (streak + 14-day trend, Floor-risk per Category, this week's calendar,
  today's check-in) lives on one dense cockpit screen. New: a **Ctrl+K
  command palette** to jump straight to any commitment by typing, and a
  **Floor-risk** calculation (is each Category's hours-so-far pace on track
  to hit its Floor by Sunday?). Table and History open in a modal instead of
  a tab.
- **B — Cascade**: the validated baseline from round one, refined —
  persistent sidebar, Dashboard/Calendar/Table/Check-in/History as tabs.
  Now shows the same Floor-risk chip as the other two.
- **C — Timeline**: no sidebar, no tabs — one continuous scroll. Opens with
  a **Cascade zoom**: a bar showing where today sits on the Pathway's
  2026→2033 horizon, zoomed into a second bar for this week. Today / This
  week / Categories / History are stacked sections below, with a **scrollspy**
  (dots, right edge) to jump between them instead of navigating a menu.

All three mount the same three widgets rather than re-implementing them:
`calendar-widget.js` (the time-grid week view), `table-widget.js` (the
List/By Day/By Category switcher), and `checkin-chat.js` (the conversational
check-in engine, originally round one's Variant C, now used everywhere).
Only the shell — how you navigate, how much is visible at once, the primary
affordance — differs between them.

Round one's Momentum (tap-first phone card) and Conversation-as-a-whole-page
variants are retired now that B won; still recoverable from this branch's
git history (`git log -- prototype/webapp`) if worth revisiting.

## What's real vs. placeholder

- **Pathway/Destination**, the **Education Floor**, and the **escalation
  rule** (2 misses / 7 days in one Category → 15-minute Recovery Session)
  reflect actual decisions (ADR 0003, issue #30, issue #4).
- The other four Categories' Floors are marked **open** — see the `source`
  issue shown on each card.
- **Floor-risk** ("behind pace" / "on pace") is a real calculation off the
  in-memory state (hours done so far this week, projected to Sunday) — not
  a decided Digby feature, just this prototype asking "would this be
  useful?"
- The **Pathway zoom bar** (Timeline) uses 2026 as a start point for the
  visual only — that's this planning cycle's start, not a tracked start
  date for the Pathway itself, which CONTEXT.md doesn't define.
- The **Weekly Execution Plan**, 5-week history heatmap, and reason-code
  tally are sample data, seeded deterministically so they look the same
  every reload — not a real plan or real history.
- Reason codes are illustrative; CONTEXT.md requires one on every missed
  commitment but doesn't fix the vocabulary yet.
- The chat input placeholder, and clicking a Command Center search result,
  are decorative/stubbed — not wired to anything real.

## Capturing a decision

Once a variant (or a mix) is picked, fold that into the real design/build
path and leave the rest of this folder on this throwaway branch, per the
`prototype` skill's capture step. Don't promote this code straight to
production; it was written under prototype constraints (no tests, no error
handling beyond what keeps it running, no abstractions beyond the three
shared widgets).

## Research sources (round one)

- [9 Best Goal Tracking Apps for 2026](https://clickup.com/blog/goal-tracking-apps/)
- [14 Best Goal Tracker Apps for 2026 | Reclaim](https://reclaim.ai/blog/goal-tracker-apps)
- [11 best OKR software platforms to try in 2026](https://monday.com/blog/project-management/okr-software/)
- [Designing a Habit Tracker App — UX/UI Case Study](https://downloadfreebie.com/designing-a-habit-tracker-app-ux-ui-case-study/)
- [Heatmap Habit Tracker for Visual Habit Tracking](https://habitheat.com/heatmap-habit-tracker/)
