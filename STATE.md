# State

Updated: 2026-10-05 | Branch: `fix/eval-workspace-isolation`

Current ticket: F3 — isolate trigger eval fixtures and limit cleanup (approved).
Phase: review. Next action: review the pull request after verification and independent review pass.
Base: `35aea1869f49421e5f49a1750b3787468ff8b165`.

Acceptance criteria:
- Each invocation owns a unique run root; identical job IDs across runs do not collide.
- Cleanup removes only the current owned root, preserving unrelated and prior-run files.
- Check canonical paths, directory identity and ownership before deletion; refuse replaced/junction roots.
- Wait for active jobs before cleanup after a worker failure.

Verification evidence (2026-10-05):
- `node --test scripts/lib/eval-workspace.test.mjs scripts/review-candidate.test.mjs guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs` — eval lifecycle 16, candidate 13, guard 64, dedupe 3 pass; log: `.scratch/ship-F3/unit-tests.txt`.
- Runner smoke with stubbed spawn: baseline reproduces shared deletion; patched success/error preserve other work and clean only the owned run; delayed close after error retains the active fixture. Evidence: `.scratch/ship-F3/runner-smoke-results.json`.
- `node --check` runner/helper, `node scripts/lint-skills.mjs --strict`, and `git diff --check` — pass.

Not tested: real Claude/Codex trigger runs, process-tree timeout/forced termination, or trigger-grading correctness. The grader and historical eval results are unchanged. Interrupted/unowned roots are retained rather than deleted speculatively.
Scope fences: no dependency, global settings, CI/hook, sync, or historical-results changes.
