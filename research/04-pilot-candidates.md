# 04 - Pilot candidates: suth-helpdesk-assets

> **Retired workflow references (2026-10-06):** This research is a dated record, not an active procedure. References to the old five owned workflows, installed inventories, commands or configuration describe the earlier review only. The current 27-skill Matt flow is in [lifecycle](../playbook/lifecycle.md), [adaptation](../setup/matt-pocock-adaptation.md) and [source record](../setup/skills-lock.md). Personal-note sources and automatic reads were disconnected; use only evidence authorized for the current task.


Prepared 2026-09-30. Read-only investigation of `D:\suth-helpdesk-assets`. Nothing in the repo was modified. Only `git`/`gh` read commands and the pure unit tests for `packages/domain` and `apps/web` were run. `apps/api` tests were skipped by instruction.

## 1. Project state snapshot

| Item | Finding |
|---|---|
| Product | SUTH hospital printer/copier register, meter readings and lease-cost system. The repo is named "helpdesk-assets", but CONTEXT.md scopes "machine" to printers and copiers, not all IT assets. |
| Stack | npm workspaces: `apps/api` (CommonJS Express + MySQL), `apps/web` (Vue 3 + Vite + Tailwind + TanStack Query), `packages/domain` (shared business rules). Docker Compose MySQL 8.4 plus phpMyAdmin. |
| Branch / tree | `main`, in sync with `origin/main` at `71ca979` (merge of PR #224, 2026-09-25). Working tree clean. `dev-api.log` and `dev-web.log` exist but are git-ignored. No stashes. |
| History | 323 commits, first on 2026-07-03. Near-daily activity through 2026-09-24/25. Idle for about 5 days. |
| GitHub | `saritrungj/suth-helpdesk-assets`, public. **0 open issues, 0 open PRs.** The latest closed issues are #221, #214, #213, #212. Latest PRs are #219 to #224, all merged. |
| Branches | Local and remote `fix/flaky-fullscreen-drawer-test` are stale. Remote head is `23073a4`, already merged via PR #223, and was never cleaned up. |
| Worktrees | `D:/suth-main` (detached at `e4d6611`, 2026-09-24, PR #205) and `D:/suth-prod` (detached at `71ca979`). Their purpose is not documented in the repo. The audit report says production was deployed at `44152bc`, so whether `suth-prod` reflects a later redeploy is unverified. |
| Tests run today | `packages/domain`: 41/41 pass (0.3 s). `apps/web` vitest: **37 files, 316 tests, all pass** (~38 s; one worker spawn per file). `apps/api`: not run (34 `*.test.js` files exist). |
| E2E | About 40 Playwright specs in `apps/web/e2e`, split into three projects. `fixture` mocks `/api/*` itself, needs no DB, and runs in `npm run verify` and pre-push. `db` needs API + DB and runs via `npm run verify:db` (temp MySQL in Docker, ports 3317/3310/5310). `manual` runs on demand. |
| Skips | No `it.skip`/`.only`/`.todo` in unit tests. E2E `test.skip(...)` calls are conditional (no service running, writes not allowed, data-dependent month) and are by design. No TODO/FIXME/HACK markers in source. |
| Quality gates | Only `.githooks/pre-push` (installed by `npm prepare`): blocks pushes to `main`, runs `git diff --check`, then `npm run verify` (tests, build, bundle budget, fixture e2e, fixture check). **No GitHub Actions, by decision.** No linter or typecheck (audit: known debt). |
| Docs drift found | `AGENTS.md` says "no CONTEXT.md yet", but `CONTEXT.md` exists (2026-09-21) and `docs/agents/domain.md` points to it. All 318 relative Markdown links across 75 docs resolve. |
| Known open items (from 2026-09-24 audit, status section) | F09 (LAN/HTTPS access, waiting on owner), F12 (logout does not revoke the JWT, P3), F13 (`/dashboard/monthly-kpi` payload grows with years, P3), F14 (contract SUTH192/2568 has no rent/VAT, owner must check), F15 (6 devices with unverified installation, admin to check). Other listed debt: `ExecutiveDashboard.vue` at 621 lines and no linter. |

Largest source files: `PrintTransactions.vue` 1307 lines, `import/session-service.js` 1103, `devices/controller.js` 871, `UiDataTable.vue` 725, `ExecutiveDashboard.vue` 621.

## 2. How work, progress, backlog and decisions are tracked

- **Backlog and specs**: GitHub Issues, via the `gh` CLI (`docs/agents/issue-tracker.md`). Issues are written in Thai. Labels follow five triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`); `ready-for-agent` is the only one seen in recent use. Pull requests are not used as a triage channel.
- **Flow**: Issue -> branch `<type>/<issue>-<short-desc>` -> Conventional Commits (`feat|fix|docs|refactor|test|chore|db`) -> PR that references the issue -> merge commit. Recent history is one PR per issue, with `Merge pull request #N` commits. The commit type `db` exists for schema work.
- **Progress log for users**: `CHANGELOG.md` (Keep a Changelog, Thai, about 100 KB). It lists user-visible changes under `[Unreleased]` and must be updated in the same round as the PR. It is explicitly not a `git log` substitute.
- **Decisions**: 37 ADRs in `docs/decisions/` (`README.md` index with statuses `Accepted` and `Superseded by ADR-XXXX`). Old ADRs are never edited; a new one supersedes them. An ADR must be written at decision time for anything hard to reverse. AGENTS.md says to read the ADRs before touching fiscal-year, month or money logic.
- **Docs**: Diataxis layout (`docs/README.md`, explanation/how-to/reference/decisions/agents/reports). One source of truth per fact; link instead of copying. Glossary of Thai domain terms in root `CONTEXT.md`.
- **Reports**: point-in-time audits live in `docs/reports/` (currently `system-audit-2026-09-24.md`, with a status-after-remediation section).
- **Agent tooling in repo**: `.agents/skills/finish-issue` (approved-issue -> implement -> review -> handoff, with a checkpoint at `output/finish-issue/<n>/checkpoint.md`), `.claude/agents/` (check-runner, domain-guardian, security-reviewer), `docs/agents/review-workflow.md` (bug loop must be red first, three-pass review), `docs/agents/subagents.md`.
- **Multi-session rule**: each concurrent session gets its own git worktree (`git worktree add -b <branch> D:/suth-worktrees/<n>-<name> origin/main`, then `npm ci`).
- **Off-repo state**: `D:\suth-data` holds production runbook, backups, import sessions and secrets (not read). Release notes are kept there per the audit report.

## 3. Canonical-copy finding

| Path | State |
|---|---|
| `D:\suth-helpdesk-assets` | **Canonical.** Remote `github.com/saritrungj/suth-helpdesk-assets`, `main` = `origin/main` = `71ca979` (2026-09-25), clean tree, npm workspace layout, all current docs. |
| `D:\treadmill-sprint\suth-helpdesk-assets` | **Stale clone of the same remote.** Same origin URL. Last local commit `b20d171` (2026-07-21), and its remote-tracking `origin/main` is `ab1cba0` (2026-07-27). The live remote `main` is at `71ca979`. Old layout (`backend/`, `frontend/`, no `apps/`), commit messages just "update latest changes". It has extra remote branches (`fix-handoff`, `oom-update-2026-07-16`) that are not on the live remote's branch list and no longer exist there. No unique unpushed work (0 commits ahead of its tracking ref). Treat as archival; do not work there. |
| `D:\SUTH-Hospital-IT-Asset-Management` | **Gone** (path does not exist). No reference to that name in the current README, docs or AGENTS.md. The GitHub repo was created 2026-07-03, so it was probably the original local name before the rename. |
| `D:\suth-main`, `D:\suth-prod` | Detached worktrees of the canonical repo (see section 1), not separate copies. |
| `D:\suth-lean-ci`, `D:\suth-verify-chore64` | Not git repos; each contains only `node_modules` (leftover scratch dirs). |
| `D:\suth-data` | Not a repo; data/secrets/backups. Never commit from or read secrets in it. |

Conclusion: use `D:\suth-helpdesk-assets` only. For a pilot, create the branch in a worktree, not by switching in the main folder.

## 4. User prompt history (paraphrased)

The extract runs to 2026-09-24. The user works mostly with Codex, and also hands work between Claude Code and Gemini.

- **Style of direction**: mostly short approvals ("go ahead", "follow your recommendation", "do it and close it out"). The user expects the agent to recommend, decide the sensible order and finish, not to ask many questions. Repeated "don't guess" instructions.
- **Handoffs**: agents are given a PR/issue handover with a prior agent's report and told to re-verify it against the current repo. Reports often note that the previous agent's claims must not be trusted blindly. A closing report format (commit, issue closed, branch removed, main synced, tree clean, what was not deployed) is what the user pastes back.
- **Recurring complaints**: visual quality (colors, backgrounds, logo clarity/distortion, layout polish), plain-language wording on screen ("use simpler words"), and bugs that appear on real data (stuck fiscal year, unlinked pages, dead buttons).
- **Priorities**: correctness of money and fiscal-year figures; an executive view that answers a question on one page; audits done thoroughly with evidence; keeping the register, import and dashboard flows consistent.
- **Latest unfinished threads (2026-09-23/24)**: (a) a request for a full end-to-end audit of the running system with the real data (done, produced the audit report and PRs #214 to #224); (b) the question of how to deliver/hand over the finished system to the hospital, which appears unanswered in the history; (c) a request to remove the artifacts the earlier work created; (d) delivery documents (progress-deck / report) for the project, updated to the latest status.
- **Working conventions implied**: Thai for issues, commits and UI; a bell-drawer for alerts; one visual standard; decisions recorded as ADRs.

## 5. Pilot candidates

Selection criteria: 1 to 3 hours agent time, real value, covers clarify, spec, tests, implement, review, browser verify and handover notes, low risk, and verifiable without touching production data. All three below can be verified with the `fixture` e2e project (no DB) plus vitest. Only Candidate C needs the optional DB-backed run.

### Candidate A - Split `ExecutiveDashboard.vue` into a behavior-preserving composable and sections

**Evidence**
- The 2026-09-24 audit lists "`ExecutiveDashboard.vue` about 560 lines with two modes" as technical debt (P3). It is now 621 lines and holds around 60 computed values, route-query canonicalization, two data queries and both view modes.
- Pure logic already sits in tested siblings (`dashboard-view.js`, `dashboard-kpi.js`, `comparison.js`, `executive-report.js`, each with `*.test.js`). The route/query state, `settledStats`/`settledTable` handling and the derived text are not covered directly.
- The repo already has the rule and workflow for this exact task shape: moves and behavior changes must be separate commits (AGENTS.md, CONTRIBUTING.md).

**Scope in**
- Characterization tests first (vitest, mounting with mocked queries) for route-query canonicalization and the derived model/stat selection.
- Extract the query/state logic into a composable under `apps/web/src/components/` or `apps/web/src/composables/` (folder named by role, per AGENTS.md), then reduce the SFC to layout. One commit for the move, one for any test changes.
- Update `CHANGELOG.md` only if a user-visible change occurs (expected: none, so state "no change").

**Scope out**
- Any visual, wording or behavior change. No API, schema or domain rule change. No new dependency. No changes to `PrintTransactions.vue`.

**Acceptance criteria**
1. Existing 316 web tests and the fixture e2e project (`comparison-state`, `print-comparison`, `ui-consistency`, `axe-fixture` and any others touching `/dashboard`) pass unchanged.
2. New characterization tests written before the move fail if the query canonicalization or scope handling is broken (demonstrate by a local mutation, then revert).
3. `ExecutiveDashboard.vue` drops below about 350 lines; no Tailwind raw color classes introduced.
4. Browser check on the fixture build: `/dashboard?fy=...` and `?by=fiscalYear` in light and dark mode look identical, before and after (screenshots kept in the handover).
5. Handover note lists commits, checks run, and what was not tested (real data, production).

**Risks**
- Subtle reactivity/ordering regressions (the code has deliberate placeholder-data and "settled" snapshots to avoid flicker). Mitigation: characterization tests plus before/after screenshots.
- Merge conflicts with any parallel dashboard work: none open now.

**Files likely touched**
`apps/web/src/components/ExecutiveDashboard.vue`, a new composable file plus its test, possibly `dashboard-route.js` (currently no test), `docs/explanation/architecture.md` only if structure text goes stale.

### Candidate B - Confirm and fix number truncation in the dashboard KPI cards at phone width, with a regression test

**Evidence**
- The audit (section 8 and the quick wins list) says numbers in the cards are cut off on mobile. The status table does not mark it closed, and later UI work (#213, #219, #221) changed the cards, so the bug may already be gone or changed.
- The user complains about visual polish and reports issues on real data (long baht figures with thousands separators are the likely case).
- Existing e2e already sets 320 and 390 px viewports in `ui-consistency.spec.js` and `report-workflow.spec.js`, so the harness exists. `login.spec.js` uses 320/390/768/1440 as a template.

**Scope in**
- Step 1 of the pilot is reproduction: render the dashboard KPI cards (`UiStat`/`UiMetric`) with worst-case long values (for example 9-digit baht, 7-digit pages, Thai labels) at 320/390 px and measure overflow.
- If it reproduces: a red fixture e2e assertion (element scroll width vs client width for each card value), then a fix using design tokens only, in both light and dark theme.
- If it does not reproduce: the deliverable is the regression test plus a note closing the audit item. This is a valid outcome and also tests how the agent handles "claim not confirmed".

**Scope out**
- Redesign of cards, new tokens unless AGENTS.md's rule requires one, other pages, chart components.

**Acceptance criteria**
1. A new fixture-project e2e spec covers the cards at 320 and 390 px with long values, in light and dark theme, and fails on the pre-fix code (or is documented as passing if the bug is already fixed).
2. No horizontal page scroll at 320 px and no clipped digits in any card; axe fixture spec still passes.
3. No raw Tailwind color classes; only semantic tokens (ADR-0008).
4. Screenshots at 320/390 in both themes in the handover.
5. `CHANGELOG.md` line added under `Unreleased` only if the fix changes what users see.

**Risks**
- Rendering differences between Playwright's Chromium and real phones; text metrics vary with the Anuphan Thai font (already bundled as a dependency, so deterministic in the fixture build).
- Aesthetic judgment: the user is sensitive to visual quality. Keep to the smallest change and show before/after.

**Files likely touched**
`apps/web/src/components/ExecutiveDashboard.vue` and/or `apps/web/src/ui/UiStat.vue` / `UiMetric.vue`, a new spec in `apps/web/e2e/`, `docs/reference/accessibility.md` only if a rule is added. Fixtures in `apps/web/e2e/comparison-fixture.js` can supply the long values.

### Candidate C - `/dashboard/monthly-kpi` payload diet (audit F13) with a field-usage guard

**Evidence**
- Audit F13: the endpoint returned about 2.0 MB for a whole fiscal year (155 KB compressed) at 32 fields per row, growing with years. It is a `SELECT m.*` plus joined columns in `apps/api/src/dashboard/reports.js`.
- A comment in `apps/web/src/api/queries.js` records that an earlier unfiltered use of this endpoint cost 11.6 MB for 5 years and 300 devices; a separate `/print-transactions/months` endpoint was added to avoid it. The overview page still refetches every 5 minutes.
- Caveat: the owner marked F13 "P3, not worth it yet" because there is only one fiscal year of data. Value is therefore preventive, and the pilot is low priority for the product but medium-good for exercising the DB-touching lifecycle.

**Scope in**
- Inventory which row fields the web actually reads (`report-rows.js`, `comparison.js`, `dashboard-kpi.js`, export code, e2e fixtures).
- Replace `m.*` with an explicit column list covering only consumed fields; keep field names and units unchanged (money in satang/DECIMAL rules per ADR-0022).
- Add a guard test that fails when a web consumer reads a field missing from the endpoint's list (static field inventory or contract test against the fixtures).

**Scope out**
- Pagination, caching changes, new endpoints, schema or view changes (`v_monthly_kpi`), any query semantics.

**Acceptance criteria**
1. Response rows contain exactly the agreed fields; a documented before/after size for the seed data.
2. All unit tests, fixture e2e, and `npm run verify:db` (which spins its own temp MySQL on isolated ports) pass. Because it touches an API path, AGENTS.md requires a health check and an authenticated flow check.
3. `docs/reference/api.md` updated to match.
4. Browser verification of `/dashboard`, `/compare` and CSV/Excel export on the temp DB build.

**Risks**
- Silent removal of a field used by an export or a less-visited page. The guard test and the DB-backed e2e are the mitigation.
- Requires Docker for `verify:db`; if Docker is unavailable the pilot loses its strongest check. API tests read `.env`, so the agent must use the temp-DB script rather than the developer DB.
- Touches the money-reporting path, so ADR-0022/0017/0037 must be read first.

**Files likely touched**
`apps/api/src/dashboard/reports.js`, a new test near it, `apps/web/src/components/report-rows.js` / `comparison.js` (read-only inventory, unlikely to change), `docs/reference/api.md`, `CHANGELOG.md` (likely "no user-visible change").

## 6. Recommendation

**Recommend Candidate B, with Candidate A as the runner-up.**

Why B:
- It is the only candidate whose first step is a genuine clarify-and-reproduce step against an uncertain claim (the audit's status is stale), which tests whether the playbook stops agents from "fixing" a bug they have not reproduced. This matches the user's repeated instruction not to guess.
- It cleanly exercises every lifecycle phase: clarify (which cards, which values, which viewports), spec (acceptance criteria above), tests (a red fixture e2e first, per `docs/agents/review-workflow.md`), implement (token-only CSS), review (Standards, Spec, robustness), real browser verification (screenshots at 320/390 in both themes), and handover notes.
- It needs no DB, Docker, migration, auth or secret; it stays inside the `fixture` project and vitest, which run in pre-push. Risk is low.
- The user cares about visual quality, so the result is something they will notice and can judge.

Why not A first: it is very safe and a good test of the "move commit is not a behavior commit" rule, but it has weak product value and little to verify in the browser beyond "nothing changed". Why not C first: it has the weakest product need (owner deferred it), and it depends on Docker for its strongest check.

Preconditions before any implementation session: run `git status` and confirm clean `main`; create or bind a GitHub issue (none are open); create the branch in its own worktree (for example `fix/<issue>-kpi-card-mobile-digits` under `D:/suth-worktrees/`), then run `npm ci` there.

## 7. Repo-specific rules an agent must follow

Authority and git
1. Never edit or commit on `main`. Check `git status` and the branch first. If asked to implement and `main` is clean, create or bind an issue and a branch `<type>/<issue>-<short-desc>` without asking again; on any other branch, continue only if it clearly belongs to the work, otherwise stop.
2. Commit, push, merge and branch deletion require an explicit instruction, except when the user says to close/finish the work end-to-end, which authorizes one bundle (commit, push branch, open PR that cites the issue, merge, sync main, exact-branch cleanup). That bundle does not cover schema/migration changes, auth/permission/secret changes, deletion or overwrite of business data, or any production deploy; those need separate approval.
3. Conventional Commits, imperative subject, no trailing period; types `feat|fix|docs|refactor|test|chore|db`, `!` for breaking. A commit that moves files must not change behavior; use separate commits. Rename with `git mv`.
4. Review-only requests mean review only; do not edit unless asked.
5. Concurrent sessions: one git worktree per issue (`D:/suth-worktrees/<n>-<name>`), `npm ci` in each; never switch branches in a folder another session uses. Shared resources: web port 5173, dev API port 3000, `verify:db` ports 3317/3310/5310.
6. No direct pushes to `main` (pre-push hook blocks it). `--no-verify` and `SKIP_VERIFY=1` exist but are not to be used without a stated reason.
7. Only preserve and touch what is in the issue scope; keep the user's existing changes.

Reading before editing
8. Read `AGENTS.md`, `docs/README.md`, then `docs/explanation/domain.md` for feature/rule work, `docs/explanation/architecture.md` for structure/API boundaries, `docs/how-to/` for environment/schema/import work, and **all relevant ADRs before touching fiscal year, month or money logic** (Thai fiscal year Oct-Sep; months stored in Common Era; invoice-line rounding once, in satang).
9. Use the terms in `CONTEXT.md` exactly (for example "machine", "meter", "raw pages" vs "net pages", "invoice amount"); do not substitute synonyms. Note AGENTS.md says no CONTEXT.md exists; that line is stale.
10. Any hard-to-reverse decision needs a new ADR at decision time (next number after 0037; never edit an old ADR, supersede it).

Code structure
11. `packages/domain` is the only home for shared business rules; never duplicate them.
12. API: feature folders named by capability under `apps/api/src/`; no `routes/` or `controllers/` folders; mount in `index.js`. Every route uses `asyncHandler`, throws `ApiError` helpers, validates input with `validate({ body, query, params })`, uses `db.withTransaction()` and sets `Cache-Control` via `shared/cache.js`. Never return raw DB error messages.
13. No second path into the database: everything reads/writes through the HTTP API. Any AI-callable tool must be read-only (ADR-0012). The QA/dev bootstrap harness is the only documented exception.
14. Web: layers `design/` (CSS only), `ui/` (no domain words, no API calls), `app/`, `api/` (TanStack Query for shared reads; writes use axios directly), `lib/` (no API calls), `views/` and `components/` (business code, use `ui/` and `design/` only). **No raw Tailwind color classes** (`bg-gray-50`, `text-blue-600`); use semantic tokens (`bg-surface`, `text-brand-ink`), adding a token in `design/tokens.css` if needed.
15. Style: 2-space indent; backend CommonJS with semicolons; frontend ES modules with Vue `<script setup>`, PascalCase components, camelCase identifiers.
16. File names: ASCII only, kebab-case, no spaces, no names differing only by case; Vue components PascalCase; root files uppercase by convention.
17. Migrations are ordered, need review and approval, and fresh-schema and migration paths must both be tested, especially for the Oct-Sep fiscal boundary.

Testing and verification
18. Choose checks per `docs/how-to/verify-changes.md`. Reproduction goes red first for bugs; do not weaken assertions or use retries to hide failures. New tests sit next to the module and are named `*.test.js` or `*.spec.js`.
19. Safe locally without DB: `npm test --workspace packages/domain`, `npm test --workspace @suth/web`, and the fixture e2e project. `npm run verify` runs the full gate (tests, build, bundle budget, fixture e2e). Do not run `apps/api` tests or `db` e2e against a developer database. The `db` project writes to the database and must only run through `npm run verify:db` (temp MySQL) or an explicitly approved isolated QA target with `SUTH_E2E_ALLOW_WRITES=1`.
20. Backend change needs a health check (`GET /api/health`) and an authenticated flow check. Do not run servers, Docker, migrations or DB commands unless the task explicitly permits it.
21. Run `git diff --check`; no debug markers or temporary artifacts in the diff. Update `CHANGELOG.md` under `Unreleased` for user-visible changes in the same round as the PR (Thai).
22. Always report what was not tested and residual risks.

Safety
23. Secrets (`JWT_SECRET`, MySQL credentials) live in environment variables. Never read or print `D:\suth-data\secrets`. Validate CSV/XLSX before import. The production database and the deployed instance are off limits without explicit approval.
24. Text shown to users is Thai, in plain wording (the user has repeatedly asked for simpler words); check `docs/reference/ui-words.md` before adding labels.

Workflow aids present in the repo
25. `.agents/skills/finish-issue/SKILL.md` for approved-issue completion (checkpoint at `output/finish-issue/<n>/checkpoint.md`, ignored by git), `docs/agents/review-workflow.md` for the three-pass review (standards, spec, security/robustness), and the `.claude/agents/` reviewers (`check-runner`, `domain-guardian`, `security-reviewer`). The main session is the only code author.
