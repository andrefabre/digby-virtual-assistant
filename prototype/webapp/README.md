# Digby web UI — prototype

A throwaway local prototype exploring what a web UI on top of Digby's
current domain model could look like: the Pathway/Destination, the five
Categories with their Floors, a Weekly Execution Plan, and a daily check-in.

**This is not the MVP delivery artifact.** Per [issue #17](https://github.com/andrefabre/digby-virtual-assistant/issues/17)
the MVP is a CLI/markdown accountability loop; a richer UI is explicitly
deferred. This exists to make the current design tangible, nothing more.

It does not touch `digby/` (the legacy Gemini-based goals/milestones/tasks
code, which predates the current five-Category model — see the "traps"
section in the repo's `CLAUDE.md`), and does not read from or write to the
real Obsidian planning workspace.

## What's real vs. placeholder

- **Pathway/Destination** and the **Education Floor** reflect actual
  decisions (ADR 0003, issue #30).
- The other four Categories' Floors are marked **open** because they
  haven't been decided yet — see the `source` issue linked on each card.
- The **Weekly Execution Plan** shown is sample data, not a real plan.
- **Reason codes** are illustrative; CONTEXT.md requires a Reason Code on
  every missed commitment but doesn't fix the vocabulary yet.

## Run it

No dependencies beyond Python's standard library.

```bash
python prototype/webapp/server.py
```

Then open http://127.0.0.1:8765

Data lives in `prototype/webapp/data.json` and is rewritten on check-in —
delete/reset the file to start over.
