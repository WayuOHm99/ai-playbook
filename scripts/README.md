# Review candidate checks

`review-candidate.mjs` is the read-only Git check used by `/ship`. Run it from the ticket worktree after committing all ticket files, new tests and tracked bookkeeping:

```powershell
node D:/ai-playbook/scripts/review-candidate.mjs --base origin/main
```

Replace `origin/main` with the project's actual default branch. Save the successful JSON in a git-ignored evidence directory. It contains the resolved base, merge-base, candidate SHA, changed files and the pinned command to give the reviewer. Capture stops with exit code 1 if the worktree has modified, staged or untracked files, the base is invalid, or the diff is empty. Ignored evidence files are allowed.

After verification and review pass, immediately before pushing:

```powershell
node D:/ai-playbook/scripts/review-candidate.mjs --base <saved-base-SHA> --expect <reviewed-candidate-SHA>
```

Use the exact SHA values from the saved JSON. New commits require verification and review again; use the original base SHA rather than a moving branch ref. The helper reads Git only. It does not commit, stage, clean, push, run tests or certify a reviewer verdict.

## Tests

Run from the vault root with Node.js and Git installed; no package installation is needed:

```powershell
node --test scripts/review-candidate.test.mjs
node --test guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs
node scripts/lint-skills.mjs --strict
git diff --check
```

Candidate tests create isolated Git repositories under `.scratch/review-candidate-tests/` and remove only their own generated fixture directories. They cover uncommitted/new/staged files, committed tests in the diff, ignored evidence, stale review, frozen and diverged bases, filenames with whitespace, and CLI success/error results.

Skill lint also compares the vault with installed copies. A feature branch that changes skills will report expected installation drift until those changes are installed. Record that separately from syntax failures; do not synchronize global skills merely to make a branch check green.

These deterministic checks do not prove an agent follows the entire `/ship` workflow or loads core in a live Claude/Codex session. That needs a separate behavioral trial after installation.
