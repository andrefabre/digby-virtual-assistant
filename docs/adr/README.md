# Architecture Decision Records

## ADRs are immutable

**Once written, an ADR's body is never edited.** It records what was decided on a date and why. That does not change, even when the decision does.

Earlier practice was to amend ADRs in place — warning banners, ⚠️ markers mid-document, italic corrections inside sentences that still stated the old position. Reading one document meant holding three versions of the truth and diffing them yourself. That is what this rule exists to stop.

The cause was asking one file to do two jobs that pull opposite ways: **be the history of why an alternative was rejected**, and **be the current statement of what is true**. History must never change. Current truth must always be current.

## When a decision changes

Write a **new ADR** that supersedes the old one in full, and make it self-contained — restate any part of the old decision that still holds, so a reader never has to assemble the truth from two documents.

Then touch the old ADR in exactly two places, and nowhere else:

1. Frontmatter: `status: superseded by ADR-NNNN`, plus a `superseded:` date.
2. One line directly under the frontmatter pointing at the new ADR.

The body below stays exactly as it was written.

Partial supersession does not exist. If part of an ADR is wrong, the whole ADR is superseded and the surviving parts are restated in the new one.

## Where current truth lives

| File | Holds |
| --- | --- |
| `CONTEXT.md` | The glossary — every term, and what not to call it |
| `13-strategic-plans/DIGBY-MODEL-INDEX.md` (Obsidian) | Where things stand, and what is next |
| `docs/adr/` | Why each decision was made, and what was rejected |

The first two are always current and are rewritten freely. ADRs are history and are not.

**Where two ADRs conflict, the later one wins.** A live ADR may point at a superseded one; follow the pointer on that ADR to the current version.

## Writing one

Keep it short. A single paragraph is a valid ADR. Sequential numbering, `NNNN-slug.md`. Only add *Considered Options* when the rejected alternatives are worth remembering, and *Consequences* when the downstream effects are not obvious.

Only write an ADR when all three are true: the decision is hard to reverse, a future reader would otherwise wonder why, and there were real alternatives.
