---
destination:
  statement: >
    Unrestricted Practising Certificate held, working as an employed or
    contracted specialist practitioner in a Legal Tech role, with Exegesis
    running as a revenue-generating product business. Not an Incorporated
    Legal Practice.
  by: "2033-12"
  certainty: fixed
  age: 55
milestones:
  - label: Bachelor of IT, double major
    by: "2028-12"
    certainty: fixed
  - label: Accelerated JD, full-time, alongside full-time work
    from: "2029-01"
    to: "2030-12"
    certainty: fixed
  - label: PLT / GDLP
    by: "2031-06"
    certainty: estimate
  - label: Supreme Court admission — Restricted certificate
    by: "2031-06"
    certainty: estimate
  - label: Supervised Legal Practice (24 months)
    from: "2031-06"
    to: "2033-06"
    certainty: estimate
  - label: Unrestricted Practising Certificate
    by: "2033-06"
    certainty: estimate
  - label: Destination reached
    by: "2033-12"
    certainty: fixed
---

# The Pathway

The long-range arc above the yearly layer — the multi-year Destination every
Category's yearly outcomes derive from. There is exactly one Pathway. See
[CONTEXT.md](../CONTEXT.md) for the glossary entry and
[ADR 0003](./adr/0003-destination-employed-practitioner-2033.md) for the
reasoning behind it.

This file is the canonical, machine-readable record. The frontmatter above
is what Digby reads; the table below is the same facts for a human. Keep
them in sync by hand until something generates one from the other.

## Destination

By the end of 2033: hold an **Unrestricted Practising Certificate**, work as
an **employed or contracted specialist practitioner** in a Legal Tech role,
and run **Exegesis as a revenue-generating product business**. Age 55.

Not an Incorporated Legal Practice — that stays available as a choice after
2033, but it is not part of the Destination.

## Milestones

| When | Milestone | Certainty |
| --- | --- | --- |
| → end 2028 | Bachelor of IT, double major | Fixed |
| 2029 – 2030 | Accelerated JD, full-time, alongside full-time work | Fixed |
| ~H1 2031 | PLT / GDLP | Estimate |
| ~mid 2031 | Supreme Court admission — Restricted certificate | Estimate |
| mid 2031 – mid 2033 | Supervised Legal Practice (24 months) | Estimate |
| ~mid 2033 | Unrestricted Practising Certificate | Estimate |
| **end 2033** | **Destination reached.** Age 55. | Fixed |

**Fixed** dates are set by enrolment or plan and are within Andre's control.
**Estimate** dates depend on external scheduling — PLT intake and the
admission ceremony are set by others, per ADR 0003. That uncertainty is why
the Destination itself targets end of 2033 rather than the mid-2033 date the
milestones alone would suggest: the gap is buffer, not slack.
