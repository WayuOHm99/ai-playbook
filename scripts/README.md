# Review candidate checks

`review-candidate.mjs` is the read-only Git check used by `/ship`. Run it from the ticket worktree after committing all ticket files, new tests and tracked bookkeeping:

```powershell
node D:/ai-playbook/scripts/review-candidate.mjs --base origin/main
```

Replace `origin/main` with the project's actual default branch. Save the successful JSON in a git-ignored evidence directory. It contains the resolved base, merge-base, candidate SHA, changed files and the pinned command to give the reviewer. Capture stops with exit code 1 if the worktree has modified, staged or untracked files (including submodules), the base is invalid, or the diff is empty. Ignored evidence files are allowed. Both status and diff force `--ignore-submodules=none` so Git configuration cannot hide child work or pointer changes. A submodule pointer diff still needs review of the child's referenced commits.

After verification and review pass, immediately before pushing:

```powershell
node D:/ai-playbook/scripts/review-candidate.mjs --base <saved-base-SHA> --expect <reviewed-candidate-SHA>
```

Use the exact SHA values from the saved JSON. New commits require verification and review again; use the original base SHA rather than a moving branch ref. The helper reads Git only. It does not commit, stage, clean, push, run tests or certify a reviewer verdict.

## Tests

Run from the vault root with Node.js and Git installed; no package installation is needed:

```powershell
node --test scripts/review-candidate.test.mjs
node --test scripts/lib/eval-workspace.test.mjs
node --test guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync.test.ps1
node scripts/lint-skills.mjs --strict
git diff --check
```

Candidate tests create isolated Git repositories under `.scratch/review-candidate-tests/` and remove only their own generated fixture directories. They cover uncommitted/new/staged files, committed tests in the diff, ignored evidence, stale review, frozen and diverged bases, filenames with whitespace, CLI success/error results, and local submodules hidden by Git configuration. Submodule fixtures use local file transport only, without a network or global configuration changes.

Skill lint also compares the vault with installed copies. A feature branch that changes skills will report expected installation drift until those changes are installed. Record that separately from syntax failures; do not synchronize global skills merely to make a branch check green.

These deterministic checks do not prove an agent follows the entire `/ship` workflow or loads core in a live Claude/Codex session. That needs a separate behavioral trial after installation.

## Manual skill sync

Run `scripts/sync.ps1` by hand after editing vault skills. Claude gets real copies in `~/.claude/skills`; Codex gets junctions in `~/.agents/skills`. Claude copies use `robocopy /E`: destination-only files and directories are retained, including files removed or renamed in the source. Matching source paths can still overwrite local edits. Keep personal notes under distinct names; inspect obsolete files yourself rather than relying on sync to remove them. This is an additive copy, not an exact mirror.

When replacing a Claude destination junction, sync removes only the link and copies into a real directory; its old target is left intact. Codex's existing real paths are moved under `~/.ai-playbook-backups/<timestamp>/<name>` before a junction is installed. Sub-agent files with matching names are updated in place. Sync does not install global AI rules or guard hooks, but it **can change global Git `core.longpaths` to `true`** when needed. Skill lint remains warn-only. Robocopy codes below 8 are accepted; codes 8 and above stop sync.

[`Microsoft's robocopy reference`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy) documents `/E`, `/MIR` (`/E` plus `/PURGE`) and the failure-code threshold; checked 2026-10-05.

`sync.test.ps1` executes a copy of the actual script with synthetic vaults/homes under `.scratch/sync-tests/run-<guid>/`. It uses real robocopy and junctions for file behavior, and stubbed robocopy for exit-code cases. Git and Node calls are stubbed in the child script's scope; no installed skills, global configuration, real agent CLI or network are touched. Tests cover new installs, destination-only nested/empty folders, repeated updates, removed upstream files, replacement of a Claude junction without touching its target, Thai/space paths, and success/failure codes. Fixtures are retained for inspection, with no recursive cleanup. This suite does not prove the real installed environment or live Claude/Codex behavior.

## Eval fixture isolation

`run-trigger-evals.mjs` uses `lib/eval-workspace.mjs` to allocate a unique `run-<random>` root under `D:/ev` (or `--fixture-root <parent>`). Each job gets its own child directory. Cleanup removes only the current run after every active worker settles, checks canonical paths, original directory identity and the ownership marker, and refuses a replaced/junction root. A worker with a child error waits for `close` before rejecting. It never removes the shared parent or reuses a previous run.

`eval-workspace.test.mjs` exercises real files and Windows junctions with fake workers: simultaneous runs using the same job id, preservation of unrelated/prior files, rejected workers, delayed active jobs, and refused cleanup after ownership/path changes. No agent login or model quota is required. This does not change the trigger grader or prove live CLI timeout/process-tree behavior.
