# State

Updated: 2026-10-05 | Branch: `docs/current-workflow-guide`

Current ticket: F5/F6 — align current guard guidance and repair the start-here page (approved).
Phase: review. Next action: user reviews the pull request after documentation verification and independent review pass.
Base: `883cdee564114092cba42721e30ddc79c6705d83`.

Acceptance criteria:
- One intact start-here introduction/quick start, with correct Claude slash and Codex dollar examples.
- Start-here, README and skills-lock list all five actual vault skills.
- Active guidance treats the playbook guard as optional/uninstalled, not an automatic gate; points to its current status.
- Historical reports keep their original bodies with dated status notices; local navigation links resolve.

Verification evidence (2026-10-05):
- One-off documentation checker: baseline 19 pass, 16 fail/missing updates; fixed 35/35 pass. Covers duplicate/corrupt quick start, dollar examples, skill lists/counts, active guard guidance, preserved historical bodies, fenced blocks and relative links/anchors. Logs: `.scratch/ship-F5-F6/docs-baseline.json`, `.scratch/ship-F5-F6/docs-check.json`.
- `node scripts/lint-skills.mjs --strict` and `git diff --check` pass; diff touches Markdown only.
- GitHub GFM render: one page title, intact Claude slash quick start and all five Codex dollar examples; evidence `.scratch/ship-F5-F6/render-check.json`, `start-here-rendered.html`.
- Checker lives outside the repo and is saved with evidence, not added as a new production script or committed test. No new dependencies.

Decision: dated notices distinguish historical findings from current policy; original report/changelog bodies remain intact. Project-specific required hooks still follow that project's rules.

Scope fences: no skill behavior/version, scripts, existing tests, dependencies, CI/hooks, installed skills, global settings or local-main update. F7 eval modernization and F8 history privacy stay outside this ticket. No automatic guard installation.

Not tested: live Claude/Codex invocation, installed guard behavior or external source links. No code changed; unchanged application/unit suites were not rerun for this documentation-only ticket.
