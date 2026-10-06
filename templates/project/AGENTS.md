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
- Existing tests: follow the central policy and this ticket's authorized scope; never skip or weaken checks to get green.
- Anything outside the current ticket. Log it in BACKLOG.md instead.

## Shared policy
Playbook root: <absolute checkout path; replace before use>

Read instructions/core.md and instructions/working-style.md from that root when this project has opted into the playbook. They own scope, approval, privacy, verified candidate SHA, checkpoints and reporting. These are instructions, not installed enforcement. Project-specific additions only:
- Project DoD extras: `<npm run verify>` green (and `verify:db` if DB touched); docs updated if behavior, commands or config changed (RUN.md / HANDOVER.md / ADR / CHANGELOG).

## Matt workflow and project additions
Use `ask-matt` → `grill-with-docs` (with `research`/`prototype` as needed) → `to-spec` → `to-tickets` → `implement` per ticket or `implement-spec` for the task graph → `tdd` → `code-review` → `pr` → `retro`. Keep Matt's names and invocation roles. Core policy applies throughout; project additions:
- `to-spec`, `to-tickets`, `wayfinder`, `triage`: draft tracker changes first and publish within the user's authorization. Do not ask again for an already approved concrete change. An issue awaiting approval for personal data/auth/migration is not `ready-for-agent`.
- `diagnosing-bugs`: for a bug in shipped behaviour (P2), stop after reproduce + diagnosis and draft the ticket; fix only inside the approved scope with `implement`/`tdd`.
- `tdd`: take the test seams from the ticket's acceptance criteria instead of asking the user to confirm them.
- `code-review`: report findings as BLOCKER / SHOULD-FIX / COULD-FIX; at most 2 fix rounds.
- `prototype`: scratch databases must be local (Docker or SQLite), never a shared or real one.
- `handoff`: keep Matt's portable summary, with committed `STATE.md` + `HANDOFF.md` under the central checkpoint policy before switching harness or directory.

## Constraints
<!-- Confirmed external constraints only (who confirmed, date). Prompt 01-E reads this section. Delete rows that do not apply. -->
- Hosting: <where it may run; who confirmed>
- Data access: <what data/systems the app may read; what is off limits>
- Hospital IT policy: <network, accounts, software install, backup rules>
- Other: <budget, deadlines, vendor limits>

## Where state lives
- Current phase, task/ticket or integration task graph, verified SHA, evidence, authorization and next action: `STATE.md` (update at the end of every session).
- Ideas and feedback inbox: `BACKLOG.md` (agent appends P5/P6 rows directly). Approved work: GitHub Issues (`<owner/repo>`, use `gh`; agent drafts, creates after approval) <or BACKLOG rows with Triage = now if no Issues>.
- Handoff between harnesses/directories: Matt `handoff` plus committed `STATE.md` + `HANDOFF.md` on the task branch, following core checkpoint policy. The receiver verifies branch, SHA, working tree and evidence before continuing.
- Decisions: `DECISIONS.md` <or `docs/decisions/` ADRs>. Domain terms: `GLOSSARY.md`.
- Run locally: `RUN.md`. Handover to hospital IT: `HANDOVER.md`.
- Before starting: read STATE.md, then the ticket, then only the docs it points to.
