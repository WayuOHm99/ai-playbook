# Project templates: which file to copy when

Copy into the root of a new project, replace every `<placeholder>`, delete the HTML comments. English on purpose (agents read these); write project-specific facts in the language the team uses.

| File | Copy when | Who writes / updates | Notes |
|---|---|---|---|
| `AGENTS.md` | **Day 1, every project** | Human drafts, agent may propose edits | Canonical rules for Claude Code and Codex. Under 120 lines. Declare the **tier** (see `stacks/hospital-web.md` section 3). |
| `CLAUDE.md` | Day 1 | Nobody | One line: `@AGENTS.md`. Claude Code reads it; Codex reads AGENTS.md directly. Do not symlink on Windows. |
| `STATE.md` | Day 1 | **Agent, end of every session** | Phase, ticket, next action, blockers, last verified commands. Overwrite, do not append. |
| `BACKLOG.md` | Day 1 | Anyone, agent for mid-task ideas | Inbox only; agent appends P5/P6 rows directly. Approved items move to GitHub Issues (agent drafts, creates after approval) or get Triage = now if the project has no Issues. Never lets an idea change the current ticket. |
| `DECISIONS.md` | First hard-to-reverse choice, or first deviation from the house stack | Human decides, agent drafts | Small projects. Large ones: `docs/decisions/` ADRs (as suth does) and skip this file. |
| `RUN.md` | As soon as someone else (or a fresh agent) must start the app | Developer, agent verifies commands | Windows-first. Must be tested by running it. |
| `.gitignore` | Day 1 | Nobody (add project-specific lines) | Ignores `.env*` (keeps `.env.example`), `.scratch/` (bulk evidence only), build and test output. |
| `.gitattributes` | Day 1 | Nobody | `eol=lf` by default, CRLF for `.ps1`/`.bat`, binary images. Prevents line-ending noise in diffs on Windows. |
| `HANDOFF.md` | Created by Matt `handoff` plus core checkpoint policy on the task branch | Agent | Goal, scope, authorization, verified candidate SHA/evidence, open findings and next skills. Commit with `STATE.md`; receiver verifies the repo. Retire only under project rules. |
| `HANDOVER.md` | **Start of tier 2 (internal use)**, finish before internship ends | Developer + agent; hospital IT reviews | Bus-factor document. No secret values, only locations. Test with a fresh agent as new maintainer. |

## Order for a new project
1. Choose this workflow for the new repo; copy `AGENTS.md`, `CLAUDE.md`, `STATE.md`, `BACKLOG.md`, replacing placeholders. Do not overwrite an existing project's rules.
2. `RUN.md` once the app starts.
3. `DECISIONS.md` (or ADR folder) at first real decision.
4. `HANDOVER.md` when moving to tier 2; fill the restore-drill table before tier 2 go-live.

## Related
- Stack, tiers, ops, PDPA checklist: `../../stacks/hospital-web.md`
- Issue tracker / labels / docs layout for the Matt Pocock skills: `../../setup/matt-pocock-setup-answers.md` (writes `docs/agents/*.md`; do not duplicate here)
- Matt main flow: [lifecycle](../../playbook/lifecycle.md); central policy/style: [core](../../instructions/core.md), [working style](../../instructions/working-style.md).
- Existing project with richer docs: retain its own rules and configured domain paths. Add or migrate files only under that project's explicit scope; new repos use `GLOSSARY.md`.
