# Review candidate checks

`review-candidate.mjs` is the read-only Git check used by Matt `code-review` and central delivery policy. Run it from the ticket worktree after committing all ticket files, new tests and tracked bookkeeping:

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

For the CI entry point and its scope, see [repository CI](../setup/repository-ci.md). It runs the maintained Node roots and both synthetic Windows sync suites, rejects skipped/incomplete results and probes failure detection using owned source copies. Workflow/runner/security behavior is documented there; existing commands below remain available for targeted checks.

Run from the vault root with Node.js and Git installed; no package installation is needed:

```powershell
node --test scripts/review-candidate.test.mjs
node --test scripts/lib/eval-workspace.test.mjs
node --test scripts/lib/manual-evals.test.mjs
node --test scripts/lib/manual-evals-followup.test.mjs
node --test scripts/lib/history-review.test.mjs
node --test guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync.test.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync-catalog.test.ps1
node --test scripts/skill-catalog.test.mjs scripts/matt-snapshot.test.mjs
node scripts/check-matt-snapshot.mjs
node scripts/lint-skills.mjs --strict --repo-only
git diff --check
```

Candidate tests create isolated Git repositories under `.scratch/review-candidate-tests/` and remove only their own generated fixture directories. They cover uncommitted/new/staged files, committed tests in the diff, ignored evidence, stale review, frozen and diverged bases, filenames with whitespace, CLI success/error results, and local submodules hidden by Git configuration. Submodule fixtures use local file transport only, without a network or global configuration changes.

Skill lint recursively discovers leaf SKILL.md folders, checks frontmatter, links, invocation policy and optional catalog.json. --strict fails repository issues only. --repo-only skips installed-home reads; default installation drift is reported separately, and --strict-installations opts into failing drift. Do not sync merely to make a branch check green.

New catalogue tests cover nested/flat discovery, roles, duplicate names, links and separate synthetic installation drift. Three recursive sync cases test named leaf installation, duplicate refusal before writes and linked-source refusal. Four snapshot cases check primary/reference inventory, byte drift, unexpected files, categories/counts and traversal metadata. All use isolated synthetic fixtures; upstream skill code is never executed by the checker.

These deterministic checks prove script behavior, not the entire Matt workflow. Source-only trial evidence and limits are in [the final architecture trial](../evals/workflow-trial-2026-10-06.md). Installation is a separate task.

## Manual skill sync

Run `scripts/sync.ps1` only as a separately authorized installation task. Recursive discovery installs each leaf skill by name, never category folders or upstream references. Claude gets real copies in `~/.claude/skills`; Codex gets junctions in `~/.agents/skills`. Claude copies use `robocopy /E`: destination-only files and directories are retained, including files removed or renamed in the source. Matching source paths can still overwrite local edits. Keep personal notes under distinct names; inspect obsolete files yourself rather than relying on sync to remove them. This is an additive copy, not an exact mirror.

When replacing a Claude destination junction, sync removes only the link and copies into a real directory; its old target is left intact. Codex's existing real paths are moved under `~/.ai-playbook-backups/<timestamp>/<name>` before a junction is installed. Sub-agent files with matching names are updated in place. Sync does not install global AI rules or guard hooks, but it **can change global Git `core.longpaths` to `true`** when needed. Skill lint remains warn-only. Robocopy codes below 8 are accepted; codes 8 and above stop sync.

[`Microsoft's robocopy reference`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/robocopy) documents `/E`, `/MIR` (`/E` plus `/PURGE`) and the failure-code threshold; checked 2026-10-05.

`sync.test.ps1` executes a copy of the actual script with synthetic vaults/homes under `.scratch/sync-tests/run-<guid>/`. It uses real robocopy and junctions for file behavior, and stubbed robocopy for exit-code cases. Git and Node calls are stubbed in the child script's scope; no installed skills, global configuration, real agent CLI or network are touched. Tests cover new installs, destination-only nested/empty folders, repeated updates, removed upstream files, replacement of a Claude junction without touching its target, Thai/space paths, and success/failure codes. Fixtures are retained for inspection, with no recursive cleanup. This suite does not prove the real installed environment or live Claude/Codex behavior.

## Eval fixture isolation

Both eval runners use `lib/eval-workspace.mjs` to allocate a unique `run-<random>` root under `D:/ev` (or `--fixture-root <parent>`). Each case gets its own child directory. Cleanup waits for child close, checks canonical paths, original directory identity and the ownership marker, and refuses a replaced/junction root. It never removes the shared parent or reuses a previous run. Failed timeout process-tree termination retains the owned root and stops further execution.

`eval-workspace.test.mjs` exercises real files and Windows junctions with fake workers: simultaneous runs using the same job id, preservation of unrelated/prior files, rejected workers, delayed active jobs, and refused cleanup after ownership/path changes. No agent login or model quota is required.

## Manual skill evals

See [`evals/README.md`](../evals/README.md) for cases, rubrics, options, limits and legacy-mode migration. `run-manual-evals.mjs --list` has no side effects. Live Codex execution requires `--live --codex-bin <native executable or Node CLI entry point>`; it uses existing installed skills without sync or installation. Claude live testing remains deferred.

`manual-evals.test.mjs` tests execution health, successful loading evidence, six synthetic cases, behavior failures, safe stdin, missing executables, real exit codes and Windows timeout/descendant termination. Fake agent events verify the runner/grader, not actual model skill quality. Both runners return pass/fail/inconclusive and never treat execution errors as passes. Historical auto-trigger results are preserved; new JSON output is separate and does not append to them.

`manual-evals-followup.test.mjs` covers truncated continuations after an earlier successful turn, missing/empty final-turn replies, manual and legacy grader results, `sed` actions before rule loading, and the running manual CLI's exit-2/report/cleanup behavior with a fake truncated stream. It adds regressions without editing the existing tests.

## Selected history for retro

`extract-history.mjs` now requires explicit session files and produces a private draft for human review. With no arguments it stops instead of scanning home history. Only a specifically reviewed digest can be released for analysis. Commands, privacy limits and migration from old date-wide extracts are in [history-privacy.md](history-privacy.md).

`history-review.test.mjs` uses synthetic Claude/Codex JSONL only. It covers selection isolation, common identifier/secret reduction, metadata omission, date/noise/tool filtering, replay dedupe, limits, private output/link checks, digest/confirmation gates, changed-content rejection and the running CLI. It does not read real home history or prove complete anonymization or live retro lesson quality.
