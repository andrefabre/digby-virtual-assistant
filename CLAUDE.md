# Digby

A life-management assistant for a single user (Andre). It holds a planning cascade — long-range Pathway down to weekly commitments — and runs a daily accountability loop across five goal Categories.

**This repo is currently in design, not build.** Decisions are being worked through a wayfinder map before implementation resumes. Do not start build work without checking the map first.

## Read these before doing anything

| File | Why |
| --- | --- |
| [CONTEXT.md](./CONTEXT.md) | The glossary. Every domain term, and what *not* to call it. Challenge any wording that conflicts with it. |
| [docs/adr/](./docs/adr/) | Decisions already made, with the reasoning and the rejected alternatives. **ADRs are immutable** — never edit one, supersede it. See [docs/adr/README.md](./docs/adr/README.md). Check the status line; superseded ones point at their replacement. |
| [Wayfinder map #2](https://github.com/andrefabre/digby-virtual-assistant/issues/2) | Destination, decisions so far, open fog, and what is out of scope. |

The user's own view of all this is `13-strategic-plans/DIGBY-MODEL-INDEX.md` in the Obsidian workspace at `C:\Users\andre\Documents\Obsidian_Domain_Workspace\Domain_Workspace`. **Keep it current** — it is the only view he sees without leaving Obsidian, and it is where he resumes from.

## Working style he has asked for

- **One question at a time.** Multiple questions at once are bewildering. Wait for the answer before the next.
- **Look facts up; ask only for decisions.** If it is in the filesystem, go and read it. The decisions are his.
- **Say which step you are on and what is left.** He has been burned by sessions that produced a document of scattered answers to unordered questions. Announce the layer, the Category, and the remaining sequence.
- **Refer to tickets by name, not number.** A wall of `#42, #43` is illegible.
- **Give a recommendation with every question**, and the evidence behind it — capped at **three bullets**. If a fourth feels necessary, the question is too big; split it.
- **Short answers, plain words.** Aim for under 150 words per turn. No preamble, no restating what he just said, no summarising what you are about to say. Prefer everyday words over domain jargon, and never invent a term when a plain phrase works. Long-form detail belongs in the ticket or the ADR, not in chat — he reads those separately.
- **Do not record thoughts as decisions.** When he says "these are thoughts for discussion", ticket it — do not write it into an ADR.

Use `/grill-with-docs` for design sessions — grilling plus domain-modeling, so the glossary and ADRs stay current as decisions land.

## Repo conventions

- **Issue tracker:** GitHub Issues via `gh`. See [docs/agents/issue-tracker.md](./docs/agents/issue-tracker.md), whose "Wayfinding operations" section covers maps, child tickets, blocking and frontier queries.
- **Labels:** [docs/agents/triage-labels.md](./docs/agents/triage-labels.md).
- **Domain docs:** single-context layout, see [docs/agents/domain.md](./docs/agents/domain.md).
- `gh` is installed but **not on PATH** — use `C:\Program Files\GitHub CLI\gh.exe`, or prepend that directory.
- `pytest` is **not installed** in the active interpreter, so tests cannot currently be run.

## Two traps in this codebase

**The existing Python predates the current model.** `digby/core/plan_tasks.py` and `digby/agents/digby_agent.py` are built on a goals/milestones/tasks shape with Google Gemini, no Categories, and `datetime.now()` throughout. The design has since moved to five Categories, a Pathway cascade, Floors, and Claude-first orchestration. Expect to rework rather than extend, and check the map before building against it.

**"Phase" is contested.** It means both a package of delivery work (used across the business folders) and a date-bounded study period (used only in the Q3-Q4 strategic plan). Do not use it unqualified until [issue #35](https://github.com/andrefabre/digby-virtual-assistant/issues/35) resolves.

## Never

- Author or edit his university assignment submissions. The study-tutor agent in the Obsidian workspace has a hard academic-integrity rule; it applies here too.
- Push, or commit to `main`, without asking.
- Write to the Obsidian workspace without saying which files. It *is* under version control now (git, local-only, auto-committing every 30 min via the obsidian-git plugin), so there is an undo — but say what you touched anyway.
