# Legacy five-skill evals

> **Installed-state note (2026-10-07):** The legacy five skills were removed from this machine on 2026-10-06. Four of them (`new-request`, `handoff-pack`, `choose-stack`, `ship`) no longer have installed copies to target. `retro` now resolves to the active Matt-derived `retro`, so a live `retro-bootstrap` run would grade that skill, not the legacy one. Do not run the live legacy commands below; the case files and runner regressions are kept as history. Current real-work evidence: [real-work trial](real-work-trial-2026-10-07.md) and [chain trial](chain-trial-2026-10-07.md).

Retained as historical cases and runner regressions. The old skills are no longer the active catalogue. Live commands below deliberately target legacy installed copies and must not be used to certify the current 27 Matt skills. Current architecture evidence: [workflow trial](workflow-trial-2026-10-06.md), [repository quickstart](quickstart-trial-2026-10-06.md), and [multi-ticket trial](multi-ticket-trial-2026-10-06.md). To repeat the join-graph case, use the [multi-ticket scenario](multi-ticket-scenario.md); it is a source-only manual evaluation with explicit limits.

The prior five vault skills had `disable-model-invocation: true`. Current evals explicitly invoke `$skill-name` in Codex; automatic-trigger recall is a historical experiment, not a quality target for manual-only skills.

## Preserved legacy manual cases

Run from the vault root. List cases or test the grader without an agent, login, model quota, installation or network:

```powershell
node scripts/run-manual-evals.mjs --list
node --test scripts/lib/manual-evals.test.mjs scripts/lib/manual-evals-followup.test.mjs scripts/lib/eval-workspace.test.mjs
```

| Case | Coverage | Observable checks |
|---|---|---|
| `new-request` | Triage behavior | P5 idea/P4 pagination classification, P4 pending approval, one unsorted row appended with prior BACKLOG intact, no implementation or commit |
| `handoff-write` | Writer behavior | STATE/HANDOFF committed on a feature branch, clean tree, required progress/goal/fence/continuation fields, fresh fast-test evidence, unresolved bug and next regression, no push |
| `handoff-receive` | Receiver behavior | Supplied handoff read, successful git status/log and fast test with a nonzero test count, summary <=5 lines, files/HEAD unchanged |
| `choose-stack-bootstrap` | Bootstrap only | Skill/core/project rules loaded, no files/HEAD change, no research or delegation |
| `retro-bootstrap` | Bootstrap only | Same loading/read-only checks; no extractor or raw history reads |
| `ship-bootstrap` | Bootstrap only | Same loading/read-only checks; stops before implementing/delivery |

Every case requires a successful completed read of the skill, core and AGENTS, with matching document content. A prompt/path mention, failed read or command-start event does not count. All three reads must precede actions: only simple read commands are exempt, while unknown executables (including `node -e`/`python -c`) count as potential writes. All `sed` forms count as actions because scripts can write even without `-i`; read-only sed commands used before loading the rules may therefore fail this conservative gate. A changed fixture with no action evidence is inconclusive because ordering is unobservable. Successful CLI execution and a complete JSON event stream are prerequisites; loading alone cannot pass a behavioral case.

The checks are conservative heuristics over command events and snapshots, not a semantic judge or proof that every instruction was followed. They can reject an equivalent command form or a skill loaded by a future CLI through another mechanism. The writer prompt specifies field labels to make the required handoff content machine-checkable; this is a constrained case, not a test of every valid prose format. Bootstrap cases do **not** measure choose-stack research/scoring/ADR, retro lesson quality/history handling, or full ship reproduction/review/delivery. The receiver uses an independent supplied handoff, so writer failure cannot make receiver coverage disappear.

## Optional live Codex run

Live execution is opt-in and uses **already installed** skills. It consumes model quota and may use the CLI's existing authentication/settings. It never installs/syncs skills or changes a model default. Choose a model supported by your account using `--model`; omission retains the CLI default.

```powershell
node scripts/run-manual-evals.mjs --live --case new-request --codex-bin '<absolute path to codex.exe or codex.js>' --output .scratch/manual-new-request.json
```

`--case all` is the default. `--fixture-root <parent>` overrides `D:/ev`; `--timeout-ms <positive integer>` overrides 240000 ms per case. Cases run sequentially. Windows requires a native `.exe` or Node `.js`/`.mjs` CLI entry point, not an npm `.cmd`/`.ps1` shell shim. Prompts go through stdin and never through shell interpolation. Codex runs with `--ephemeral --json --sandbox workspace-write`. Synthetic fixtures have local Git identity, no remote or dependencies, and scoped AGENTS instructions. Keep output under ignored `.scratch/`; reports contain case IDs, coverage, booleans and error reasons, not raw transcripts/replies.

The user lifted the Claude deferral on 2026-10-07 and Claude Code was used on two real tasks (linked above), but the manual runner still supports Codex only. Deterministic tests of the legacy Claude event parser do not prove a live Claude run.

## Outcomes and cleanup

- `pass`: healthy completed execution and all checks pass.
- `fail`: healthy completed execution, with missing loading evidence or a failed behavior check.
- `inconclusive`: timeout, process/spawn error, signal, nonzero exit, auth/limit error, agent failure, malformed/incomplete events or unavailable fixture observation. Never counted as a pass.

Codex traces must end in `turn.completed`, with a nonempty completed agent message from that final turn. An earlier successful turn or reply cannot validate an unfinished continuation. Blank trailing lines are allowed; other events after completion are conservatively treated as incomplete.

Summary reports total/pass/fail/inconclusive, a pass rate over **all** cases, and a separate scored-only rate. A denominator of zero is JSON `null`, not a percentage. Exit codes: 0 = all passed, 1 = conclusive failures, 2 = any inconclusive result or configuration error.

Each invocation owns a unique `D:/ev/run-<random>/` root and a separate fixture per case. Normal cleanup waits for child `close`, then validates the absolute/canonical path, original directory identity and owner marker. Other runs, the shared parent and interrupted leftovers are preserved. Timeout requests process-tree termination (`taskkill /T /F` on Windows, a detached process group on POSIX). If termination fails, retain the entire run, report its path and mark remaining cases inconclusive instead of cleaning it. Abrupt host termination can leave a run behind. Windows timeout/descendant behavior is tested with real Node child processes; live agent process trees and POSIX behavior remain unverified.

## Historical automatic-trigger experiment

`new-request.json`, `handoff-pack.json` and [`results.md`](results.md) preserve the original should/should-not data and scores. The old runner could score a nonzero CLI exit as a successful near-miss, so those rows are not current assurance. New runs do not append to or mix modes in that file.

Only use the legacy mode deliberately, with both opt-in flags and an explicit CLI entry point:

```powershell
node scripts/run-trigger-evals.mjs --legacy-trigger --live --skill new-request --cli-bin '<absolute path to codex.exe or codex.js>' --output .scratch/legacy-trigger.json
```

`--tool codex|claude` (default Codex), `--runs <positive integer>`, `--model`, `--fixture-root`, `--timeout-ms` and `--output` are supported. The old `--concurrency` option is retired; execution is sequential so process termination/retention has one clear owner. Legacy Codex uses completed successful read evidence; Claude requires an exact Skill tool name paired with a successful tool result and final success event. CLI/event failures are inconclusive. This mode measures loading, not workflow correctness.

## Historical findings 2026-10-01 (Codex 0.157.1, gpt-6-luna)

These observations used the older grader and are retained for context:

- Recall was 0/8 for both skills before and after description rewrites; reported near-misses were 8/8.
- Explicit `$handoff-pack` caused a skill read in one manual trial. The original detection only matched a path; today's grader also requires successful completed execution and document content.
- A mixed bug/idea message had useful triage behavior even without skill loading; the core instructions already cover part of that behavior.
- Automatic recall and one comparison do not establish the quality of today's manual workflow.
