# State

Updated: 2026-10-05 | Branch: `fix/manual-skill-evals`

Current ticket: F7 — replace automatic-trigger quality scoring with scoped manual skill evals (approved).
Route: P2, shipped evaluator bug. Phase: review. Next action: user reviews the PR after verification and independent review pass.
Base: `00c41f2a3063e557f5e1507ab6a53dfda0aa14c0`.

Acceptance criteria:
- Explicit Codex invocation cases cover all five skills; new-request and handoff writer/receiver grade scoped behavior, while choose-stack/retro/ship are labeled bootstrap-only.
- Require completed successful skill/core/project-rule reads with content; check fixture files/HEAD and workflow-specific outcomes rather than path mentions alone.
- Errors, timeout, auth/limits and malformed/incomplete events are inconclusive, never passes; report both total and scored denominators with meaningful exit codes.
- Use owned isolated fixtures and stdin without shell interpolation; retain fixtures if process-tree termination fails. No installation or global settings changes.
- Preserve historical auto-trigger query data/results; gate and document the legacy mode separately from current manual evaluation.

Verification evidence (2026-10-05):
- Reproduced baseline bug using a fake CLI with exit 9: old runner reported a near-miss pass at 100%. `.scratch/ship-F7/baseline-error.txt`.
- `node --test scripts/review-candidate.test.mjs scripts/lib/eval-workspace.test.mjs scripts/lib/manual-evals.test.mjs guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs`: 48 Node test entries pass (including 17 new F7 tests). `.scratch/ship-F7/node-tests.txt`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync.test.ps1`: 14 pass; synthetic homes/vaults only, Git/Node calls stubbed. `.scratch/ship-F7/sync-tests.txt`.
- `node scripts/lint-skills.mjs --strict` passes; installed copies match, no sync performed. `.scratch/ship-F7/lint.txt`. `git diff --check` passes.
- Running manual CLI with a deterministic fake agent: 6/6 cases pass, shared-parent sentinel retained and owned fixtures cleaned. `.scratch/ship-F7/app-report.json`, `app-stderr.txt`, `fake-codex.mjs`. Fake events exercise grading and real synthetic Git/files; they are not model skill-quality scores.
- Real Node processes verify literal Thai/shell metacharacter stdin, missing binary, exit 9, timeout and spawned-descendant termination on Windows. Failed-termination retention is tested by injection.

Decision: use strict observable loading evidence plus case-specific checks; missing loading evidence in a healthy complete trace is a failure, execution/trace problems are inconclusive. Percentages over all cases expose lost coverage; the separate scored rate is null when no case can be scored. Reports persist only rubric fields/reasons. Legacy execution is opt-in and sequential; its old concurrency flag is retired.

Scope fences: no skill bodies/versions, installed skills, settings, hooks/CI, dependencies, existing test files or local-main update. Do not run real history extraction. F8 history privacy is separate.

Not tested: new live Codex/Claude model runs (Claude remains skipped at the user's request), POSIX process trees, equivalent CLI event/read-command forms, full choose-stack research/ADR, retro lesson quality, full ship delivery or model ablation. The grader uses conservative heuristics and snapshots, not complete semantic verification. Prior live trials remain separate historical evidence.
