---
status: accepted
date: 2026-09-11
---

# Career gets no weekly Floor; the portfolio site splits by function, not by folder

Career's remaining work — JSO applications and the portfolio site — doesn't
fit the hours-per-week Floor shape the other Categories use. Forcing one on
would either sit unused most weeks or get gamed to "spend" it.

## The decision

- **No weekly Floor for Career.** JSO application materials (resume,
  selection-criteria responses, STAR stories, referee) are already
  pre-prepared per the PLAN's JSO Application Operating Model. The only
  remaining work — adjusting responses to the new ad and submitting within
  5 business days — is event-triggered, not steady. Digby tracks nothing
  while waiting and creates a new task when the role re-advertises.
- **The portfolio site splits by function, not by repo.** It currently
  serves two purposes in one codebase: a career portfolio (experience,
  projects, a LinkedIn link for employers) and Exegesis service pages
  (exegete.com.au). The career half sits under Career (~2h of tweaks
  remaining, ad hoc, no allocation); the business half sits under Business,
  tracked with the Exegesis/doors work (#33). Whether the two eventually
  live in separate repos is a build decision, out of scope for Category
  ownership — shared CSS/layout is a real cost against splitting them.
- **Networking stays under Career, parked.** One file, no current
  workstream, no allocation.
- **No long-range Career progression target beyond JSO.** Role positions
  past JSO aren't decided; re-evaluate early 2027 rather than commit to a
  target now.
- **The casual-work contingency has no fixed trigger.** It depends on
  three facts not yet known — Sem 1 2027 unit selection, a conversation
  with the employer, and the hours needed at the casual rate (~$50/hr,
  ~$10/hr above current) to hold income steady. Recorded as an open
  manual decision, not something Digby prompts toward on a date or count.

## Consequences

- `docs/categories.md`'s Career entry carries `floor: none` with the
  reasoning, rather than a number that would otherwise look like an
  oversight next to the other four Categories.
- Business (#33) inherits an explicit input: the portfolio site's service
  pages, once that ticket is worked.
