---
status: accepted
date: 2026-09-11
---

# Business carries no Floor through 2026; the Sep 14 gate's stated shape was already overtaken by events

Business is gated on Proof (ADR 0002) and was already named lowest priority
of the five 2026 workstreams after the analytics stack broke before any
Door signal could be measured. The wayfinder ticket's Sep 14 review-gate
framing needed correcting against what had actually happened, not just a
Floor number.

## The decision

- **No Floor for Business through end of 2026.** Reviewed Jan 2027, when
  ~6 weeks of Break exist before Sem 1 2027 — matching the pattern set for
  Career (#32): work that can't be protected shouldn't pretend to be a
  commitment.
- **One placeholder line stays in the Weekly Execution Plan**, not
  per-Pillar, so small ad-hoc momentum has somewhere to go without
  implying a schedule.
- **The Sep 14 gate already happened, early, on Jul 25** — it found the
  analytics instrumentation broken (Umami's free tier gone), not an
  absence of demand. No per-Pillar kill/adjust/scale call was possible
  then and still isn't.
- **The two remaining 2026 gates get a binary shape, not a traction
  threshold:** ~Nov 1 asks only "is analytics working again?"; Dec 31
  asks only "is analytics collecting for all doors?" Real per-Pillar
  kill/adjust/scale decisions wait for the **Jan 2027 review**, once a
  real monitoring window finally exists.
- **No long-range revenue/customer/date target through 2030.** Deferred
  until a Pillar is actually chosen to proceed with — setting a number
  now would be inventing a target with no data behind it.
- **Zero Stripe sales recorded to date** (3 products live on DRMO,
  Pillar 1). Not tracked as its own metric — it folds into the Jan 2027
  analytics review with everything else.

## Consequences

- `docs/categories.md`'s Business entry now distinguishes the two
  remaining 2026 gates from the Jan 2027 review where real decisions
  land, so the wayfinder ticket's original Sep-14-as-decision-point
  framing doesn't get carried forward as fact.
- The portfolio site's business half (exegete.com.au services, split
  from Career in ADR 0006) is recorded here as a Business content item.
