# State

Updated: 2026-10-05 | Branch: `fix/sync-preserve-destination`

Current ticket: F4 — preserve destination-only files during manual skill sync (approved).
Phase: review. Next action: user reviews the pull request after verification and independent review pass.
Base: `24bc111743f6089262c208393d784bd0a276da27`.

Acceptance criteria:
- Preserve destination-only files and nested/empty directories in Claude skill copies.
- Keep copying source files and updating same-name files on repeated sync.
- Retain existing junction replacement behavior without changing its old target; propagate robocopy failure codes.
- Document retained obsolete files, same-name overwrite behavior and the existing global core.longpaths side effect.

Verification evidence (2026-10-05):
- Baseline regression suite: 12 pass, 2 fail because `/MIR` deletes local/removed-upstream files; log: `.scratch/ship-F4/sync-baseline.txt`.
- Fixed suite: 14 cases pass on Windows PowerShell 5.1 and PowerShell 7; real script/robocopy/junctions in synthetic vaults/homes, with stubbed Git/Node and stubbed copy exit-code cases; logs: `.scratch/ship-F4/sync-windows-powershell.txt`, `.scratch/ship-F4/sync-pwsh.txt`.
- Existing Node suites: eval lifecycle 16, candidate 13, guard 64, dedupe 3 pass; log: `.scratch/ship-F4/node-tests.txt`. Total distinct logical checks including sync: 110.
- PowerShell parser, strict skill lint and `git diff --check` pass.

Decision: additive `/E` copy preserves destination-only files rather than mirroring. Same-name local edits may still be overwritten; removed/renamed upstream files are retained for manual inspection. No automatic backup/purge mechanism was added.

Scope fences: do not run sync against the user's installed skills or mutate global settings; no dependency, existing-test, CI/hook, skill-content, eval or historical-results changes. Git longpaths behavior is disclosed, not changed.

Not tested: real installed-home sync, actual global Git updates or lint invocation from sync (stubbed in fixtures), live Claude/Codex, access-denied/retry behavior and partial-copy recovery.
