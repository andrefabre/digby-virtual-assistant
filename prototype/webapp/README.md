# Digby web UI — prototype

Three structurally different takes on a Digby home screen, switchable live
via a `?variant=` URL param and the floating bottom bar — per this repo's
own [`prototype` skill](../../.claude/skills/prototype/UI.md). Sub-shape B
(new throwaway route): Digby has no existing app to embed these into yet.

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

Researched against two categories of prior art: OKR/goal-cascade tools
(weekly check-ins wired to visible progress, alignment trees) and habit
trackers (streaks, heatmaps, a tap-first daily loop) — see sources below.

- **A — Momentum** (habit-tracker derived): single-column phone-card layout,
  one big daily-completion ring, tap-to-check-off rows, streak front and
  center, GitHub-style heatmap for history.
- **B — Cascade** (OKR-dashboard derived): persistent sidebar, KPI stat
  tiles, an explicit Pathway → Category → Floor tree, dense select-driven
  tables for planning and check-in.
- **C — Conversation** (chat-first): Digby leads, today's commitments are
  revealed one at a time as quick-reply questions, and the Pathway/Category
  model is tucked behind a slide-over instead of always on screen.

## What's real vs. placeholder

- **Pathway/Destination**, the **Education Floor**, and the **escalation
  rule** (2 misses / 7 days in one Category → 15-minute Recovery Session)
  reflect actual decisions (ADR 0003, issue #30, issue #4).
- The other four Categories' Floors are marked **open** — see the `source`
  issue shown on each card.
- The **Weekly Execution Plan**, 5-week history heatmap, and reason-code
  tally are sample data, seeded deterministically so they look the same
  every reload — not a real plan or real history.
- Reason codes are illustrative; CONTEXT.md requires one on every missed
  commitment but doesn't fix the vocabulary yet.
- The chat input in Variant C and the sidebar "search" affordances (if any)
  are decorative — not wired up.

## Capturing a decision

Once a variant (or a mix — "the header from B with the ring from A") is
picked, fold that into the real design/build path and leave the rest of
this folder on this throwaway branch, per the `prototype` skill's capture
step. Don't promote this code straight to production; it was written under
prototype constraints (no tests, no error handling, no abstractions).

## Research sources

- [9 Best Goal Tracking Apps for 2026](https://clickup.com/blog/goal-tracking-apps/)
- [14 Best Goal Tracker Apps for 2026 | Reclaim](https://reclaim.ai/blog/goal-tracker-apps)
- [11 best OKR software platforms to try in 2026](https://monday.com/blog/project-management/okr-software/)
- [Designing a Habit Tracker App — UX/UI Case Study](https://downloadfreebie.com/designing-a-habit-tracker-app-ux-ui-case-study/)
- [Heatmap Habit Tracker for Visual Habit Tracking](https://habitheat.com/heatmap-habit-tracker/)
