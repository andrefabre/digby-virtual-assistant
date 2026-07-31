# Agent instructions

See [CLAUDE.md](./CLAUDE.md) for the full operating brief — what to read first, working style, and the traps in this codebase. This file covers tooling conventions only.

## Domain model

- [CONTEXT.md](./CONTEXT.md) — the glossary. Challenge wording that conflicts with it.
- [docs/adr/](./docs/adr/) — decisions, with reasoning and rejected alternatives. Check each status line.

## Agent skills

### Issue tracker

GitHub Issues, managed with `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default Matt Pocock label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
