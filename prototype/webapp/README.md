# Digby web UI — prototype

**Verdict: Command Center.** Two rounds of exploration, following this
repo's own [`prototype` skill](../../.claude/skills/prototype/UI.md), landed
on a cockpit-style dashboard — no sidebar, no tabs, everything that matters
on one screen. This folder now holds only that design.

**Not the MVP delivery artifact.** Per [issue #17](https://github.com/andrefabre/digby-virtual-assistant/issues/17)
the MVP is CLI/markdown; a richer UI is explicitly deferred. This is
exploratory input for whenever that work is prioritized — not a commitment
to build it now.

## Run it

No dependencies beyond Python's standard library.

```bash
python prototype/webapp/server.py
```

Then open http://127.0.0.1:8765

**No persistence.** All state (including check-ins) lives in memory in the
browser tab — a reload resets everything to the seed data in `data.js`.

## What it looks like

Top to bottom:

1. **A row of 4 cards** — KPIs (streak + 14-day trend), View Plan, Categories,
   History. View Plan and History are compact teasers (a stat summary / a
   mini heatmap thumbnail) that open the full detail in a modal on click.
2. **This week's Calendar** — a Mon–Sun time grid, full width.
3. **Check-in** — the conversational quick-reply flow, full width.

Plus a **Ctrl+K command palette** (header search box) to jump straight to
any commitment by typing, and a **Floor-risk** chip on each Category (is
this week's hours-so-far pace on track to hit the Floor by Sunday?).

## How it's built

- `data.js` — seed data + in-memory store (pathway, categories, the
  week's commitments, demo history) and derived state (streak, escalations,
  floor risk, pathway progress).
- `viz.js` — small SVG chart primitives (heatmap, sparkline, horizontal bar).
- `checkin-chat.js`, `calendar-widget.js`, `table-widget.js` — the three
  reusable content widgets Command Center mounts (chat check-in, the
  calendar grid, and the List/By Day/By Category table switcher inside the
  View Plan modal).
- `command-center.js` — the shell: layout, command palette, modals.
- `app.js` — boots it: subscribes to the store, renders on every change.

## What's real vs. placeholder

- **Pathway/Destination**, the **Education Floor**, and the **escalation
  rule** (2 misses / 7 days in one Category → 15-minute Recovery Session)
  reflect actual decisions (ADR 0003, issue #30, issue #4).
- The other four Categories' Floors are marked **open** — see the `source`
  issue shown on each card.
- **Floor-risk** ("behind pace" / "on pace") is a real calculation off the
  in-memory state — not a decided Digby feature, just this prototype asking
  "would this be useful?"
- The **Weekly Execution Plan**, 5-week history heatmap, and reason-code
  tally are sample data, seeded deterministically so they look the same
  every reload — not a real plan or real history.
- Reason codes are illustrative; CONTEXT.md requires one on every missed
  commitment but doesn't fix the vocabulary yet.
- The chat input placeholder and clicking a search result are
  decorative/stubbed — not wired to anything real.

## How we got here

Two rounds, three variants each, per the `prototype` skill:

**Round one** (structurally different concepts): Momentum (habit-tracker
derived — tap-to-check phone card, streak, heatmap), Cascade (OKR-dashboard
derived — sidebar, tabs, Pathway→Category→Floor tree), Conversation
(chat-first — Digby leads, one commitment revealed at a time). Andre picked
**Cascade**.

**Round two** (creative evolutions of Cascade, features welcome): Command
Center (cockpit, no chrome, command palette, floor-risk), a refined Cascade,
and Timeline (single continuous scroll with a Pathway-to-2033 zoom bar and a
scrollspy). Andre picked **Command Center**, then iterated on its layout
directly (card order, equal-height row, View Plan/History as modal teasers)
until it looked right in a real browser.

All of that — every round-one and round-two variant, and the layout
iterations in between — is preserved in this branch's git history
(`git log -- prototype/webapp`), per the skill's rule that the full set of
variants is the primary source and belongs on the throwaway branch, not the
bin.

## Research sources (round one)

- [9 Best Goal Tracking Apps for 2026](https://clickup.com/blog/goal-tracking-apps/)
- [14 Best Goal Tracker Apps for 2026 | Reclaim](https://reclaim.ai/blog/goal-tracker-apps)
- [11 best OKR software platforms to try in 2026](https://monday.com/blog/project-management/okr-software/)
- [Designing a Habit Tracker App — UX/UI Case Study](https://downloadfreebie.com/designing-a-habit-tracker-app-ux-ui-case-study/)
- [Heatmap Habit Tracker for Visual Habit Tracking](https://habitheat.com/heatmap-habit-tracker/)
