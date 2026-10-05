# State

Updated: 2026-10-05 | Branch: `fix/manual-skill-evals` | PR: #5

Current ticket: F7 follow-up — close the two final-review false-pass paths (explicitly approved after draft PR #5).
Route: P2, evaluator bug. Phase: review. Next action: user reviews and merges PR #5 after verification and independent review pass.
Frozen PR base: `00c41f2a3063e557f5e1507ab6a53dfda0aa14c0`.
Follow-up starts from: `996f75308035cb62c103284771717b747885dc62`.

Acceptance criteria:
- A truncated continuation after an earlier successful turn is inconclusive in manual/legacy grading; the running manual CLI returns exit 2 and no pass.
- A successful trace ends in turn.completed and has its own nonempty final-turn reply; a valid second completed turn and blank trailing lines remain supported.
- Every sed form counts as a potential write for read-before-action ordering, including -i, --in-place, script writes and shell-wrapped/prefixed commands; ordinary reads still pass.
- Add separate regression tests, document conservative limits, preserve existing tests/query/history data, and change no installed skills, settings, dependencies or local main.

Verification evidence (2026-10-05):
- New regression suite before implementation: 0/6 pass, 6 fail for the two known false-pass paths. `.scratch/ship-F7-followup/reproduction.txt`.
- Also reproduced a sed write hidden before a PowerShell read wrapper; anchored wrapper recognition now keeps preceding actions. `.scratch/ship-F7-followup/sed-wrapper-reproduction.txt`.
- `node --test scripts/review-candidate.test.mjs scripts/lib/eval-workspace.test.mjs scripts/lib/manual-evals.test.mjs scripts/lib/manual-evals-followup.test.mjs guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs`: 57/57 Node entries pass, including 6 new follow-up and 20 original F7 tests. `.scratch/ship-F7-followup/node-tests.txt`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync.test.ps1`: 14/14 pass, synthetic homes/vaults only and stubbed Git/Node calls. `.scratch/ship-F7-followup/sync-tests.txt`. No actual sync ran.
- `node scripts/lint-skills.mjs --strict` and `git diff --check` pass. Installed copies match without installation. `.scratch/ship-F7-followup/lint.txt`.
- Running manual CLI with a fake agent: 6/6 normal cases still pass using real synthetic Git/files; parent sentinel retained and owned fixtures cleaned. `.scratch/ship-F7-followup/app-report.json`, `app-stderr.txt`, `fake-codex.mjs`.
- New running-CLI regression confirms a truncated fake stream reports inconclusive, 0 passed, scored rate null and exit 2; parent sentinel survives. Evidence retained by the new tests under `.scratch/manual-eval-followup-tests/`.
- Original F7 evidence remains under `.scratch/ship-F7/`, including baseline exit-9 false pass reproduction and real Windows timeout/descendant test evidence.

Decision: require terminal success and the final turn's own reply; never borrow an earlier reply/completion. Treat all sed commands as potential writes because scripts can write without in-place flags. This intentionally rejects read-only sed before rule loading; documented as a conservative limit, not a semantic shell parser. Only a leading PowerShell wrapper can be unwrapped.

Scope fences: no skill bodies/versions, installed skills, settings, hooks/CI, dependencies, existing test files or local-main update. No real history extraction. F8 privacy remains separate. This bounded follow-up is the user's approved next step after the earlier two-round review; independent review covers the new candidate.

Not tested: new live Codex/Claude model runs (Claude stays skipped), POSIX/live-agent process trees, equivalent/future CLI event/command forms, full choose-stack research/ADR, retro lesson quality or full ship delivery. The evaluator uses conservative observable checks and labeled bootstrap cases, not complete semantic verification. Fake-agent scores test the runner/grader, not model quality.
