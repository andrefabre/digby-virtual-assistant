---
status: accepted
date: 2026-09-11
---

# The Cascade's mid-layer is six months, not a quarter; Sprint is dropped

Issue #3 settled the Cascade as yearly → quarterly → weekly, before the five
Categories or the Legal Tech convergence existed. Practice had already
drifted away from it: a semester runs 4-5 months and can never fit inside a
3-month quarter, and the live plan (`13-strategic-plans/2026-Q3-Q4/`) is
already organised as six months, saying so in its own words — "broader than
Q2 (six months, not three)."

## The decision

- **The Cascade's mid-layer is six months, one per calendar half** —
  Jan-Jun and Jul-Dec — named **Q1/Q2 Plan** and **Q3/Q4 Plan**. Not an
  actual quarter; the name is kept from existing usage despite spanning
  two. This partially supersedes issue #3.
- **The boundary is the calendar half, not the academic year.** It
  happens to fit cleanly: Semester 1 exams finish in June, Semester 2
  exams finish late November/early December — each semester lands
  inside one calendar half without the plan needing to track semester
  start dates itself.
- **Sprint is dropped from the Cascade entirely.** Weeks roll straight
  up to the six-month plan; no two-week layer sits between them. The
  term is reserved for future delivery/build work (e.g. a product
  Phase), kept deliberately separate so it doesn't recreate the
  collision "Phase" just had (ADR from issue #35).

## Consequences

- `CONTEXT.md` gains **Q1/Q2 Plan** / **Q3/Q4 Plan** as the canonical
  mid-layer term, and narrows **Sprint** to delivery/build work only,
  explicitly excluded from the Cascade.
- Business's Review Gates (Sep 14, ~Nov 1, Dec 31 — ADR 0007) don't
  align to these half-year boundaries. Left as-is; nothing here requires
  moving them.
- Layer 3 (representing the current operating period) can now proceed
  once the study-period naming (issue #42) also lands.
