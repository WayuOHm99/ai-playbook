<!--
TEMPLATE. Copy to the project root, replace every <placeholder>, delete these comments.
Keep under 120 lines. Test each line: "if removed, would the agent make a mistake?" If no, delete it.
Facts that change often belong in code/config or STATE.md, not here.
-->
# <Project name> - agent rules

## Purpose
<One or two sentences: what this system does, for whom (department/role), and why it exists.>
Owner (hospital side): <name, unit>. Developer: <name>.

## Tier
<demo | internal | production>  <!-- see stacks/hospital-web.md section 3. Do only what this tier requires; do not over-build. -->
Data: <synthetic only | staff/asset data | other>. **Patient or health data is never stored here** unless an ADR says DPO approved it.

## Stack
<!-- Delete rows that do not apply. Versions live in package.json; do not copy them here. -->
- Web: Vue 3 + Vite + Tailwind + TanStack Query. API: Express 5 + zod. DB: MySQL 8.4. Tests: Vitest + Playwright + axe.
- Language: <TypeScript for new code | JS>. Node: <24>.
- Deviations from the house stack: <none | see DECISIONS.md #n>

## Commands
<!-- Exact commands that work today. Update when they change. -->
| Purpose | Command |
|---|---|
| Install | `npm install` |
| Run (dev) | `<npm run dev:api>` and `<npm run dev:web>`; details in RUN.md |
| Unit/component tests | `<npm test>` |
| Full verify (must be green before handoff) | `<npm run verify>` |
| DB-backed verify | `<npm run verify:db>` |
| Lint / typecheck | `<npm run lint>` / `<npm run typecheck>` |

## Conventions
- Structure: <api features in `apps/api/src/<feature>/`; shared business rules only in `packages/domain/`>.
- API routes: validate input with zod, handle errors through the shared error layer, never return raw DB errors.
- UI: use the `ui/` kit and semantic tokens; no raw Tailwind colors in views.
- UI text is Thai, plain words. Code, comments and commit messages: <English | Thai>.
- File names: ASCII, kebab-case (Vue components PascalCase). Rename with `git mv`.
- Commits: Conventional Commits. Branch: `<type>/<issue>-<short-desc>`. One PR per issue. Worktrees: `D:\wt\<project>-<ticket>`.
- A file move is its own commit; never mix with behavior change.

## Scope fences: never touch without asking
- `<database/migrations/*>` (existing files), production config, `.env*`, `deploy/`, backups.
- `<packages/domain/*>` rules about <fiscal year | money | ...>: read `docs/decisions/` first.
- Existing tests: do not edit, skip, or delete (except the new tests of the current ticket).
- Anything outside the current ticket. Log it in BACKLOG.md instead.

## Global rules
Hard stops, triage, push policy (feature branch + PR allowed; merge/main/deploy = ask), retry limit (2), definition of done and report format: `D:\ai-playbook\instructions\core.md` (not loaded automatically: paste the parts you want into this file, or tell the agent to read it). Project-specific additions only:
- Project DoD extras: `<npm run verify>` green (and `verify:db` if DB touched); docs updated if behavior, commands or config changed (RUN.md / HANDOVER.md / ADR / CHANGELOG).

## Overrides for installed third-party skills
Some Matt Pocock skills act without asking. In this repo the global rules win over them:
- `to-spec`, `to-tickets`, `wayfinder`, `triage`: draft issues and labels, show them, and publish them (or apply `ready-for-agent`) only after the user says yes. Never mark an issue touching personal data, auth or migrations `ready-for-agent`.
- `diagnosing-bugs`: for a bug in shipped behaviour (P2), stop after reproduce + diagnosis and draft the ticket; fix only inside an approved ticket or `/ship`.
- `tdd`: take the test seams from the ticket's acceptance criteria instead of asking the user to confirm them.
- `code-review`: report findings as BLOCKER / SHOULD-FIX / COULD-FIX; at most 2 fix rounds.
- `prototype`: scratch databases must be local (Docker or SQLite), never a shared or real one.
- Session handoff: use `handoff-pack` (committed `STATE.md` + `HANDOFF.md`), not `handoff` (writes to a temp folder).

## Constraints
<!-- Confirmed external constraints only (who confirmed, date). Prompt 01-E reads this section. Delete rows that do not apply. -->
- Hosting: <where it may run; who confirmed>
- Data access: <what data/systems the app may read; what is off limits>
- Hospital IT policy: <network, accounts, software install, backup rules>
- Other: <budget, deadlines, vendor limits>

## Where state lives
- Current phase, ticket, next action: `STATE.md` (update at the end of every session).
- Ideas and feedback inbox: `BACKLOG.md` (agent appends P5/P6 rows directly). Approved work: GitHub Issues (`<owner/repo>`, use `gh`; agent drafts, creates after approval) <or BACKLOG rows with Triage = now if no Issues>.
- Handoff between sessions/tools: committed `STATE.md` + `HANDOFF.md` on the feature branch (`wip: handoff`), via `/handoff-pack`.
- Decisions: `DECISIONS.md` <or `docs/decisions/` ADRs>. Domain terms: `CONTEXT.md/GLOSSARY.md`.
- Run locally: `RUN.md`. Handover to hospital IT: `HANDOVER.md`.
- Before starting: read STATE.md, then the ticket, then only the docs it points to.
