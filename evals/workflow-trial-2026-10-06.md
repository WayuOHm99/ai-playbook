# Matt architecture verification — 2026-10-06

Status: **verification record before final delivery review**. This report records the final 27-skill architecture separately from legacy five-skill evals. Source pin: `6fd947921b935b7e1e69293a200400f0fdd5c15f`; package 1.3.1 plus main fixes. Independent review/push receipts belong to the frozen candidate evidence and PR body, so this tracked report does not create a later unreviewed bookkeeping commit.

## Evidence boundaries

- Catalogue lint is repository-only; raw snapshot integrity covers 38 source skills/109 files, including 11 reference-only entries. Neither proves model behavior or complete safety of experimental instructions.
- Existing Node regressions and 14 synthetic sync cases protect previous script behavior. New catalogue/snapshot regressions test recursive names/roles/integrity; fake agents test graders, not skill quality.
- Native Codex trial uses the final bound checkout in a synthetic CLI project with no remote, dependencies, installed-skill changes or real histories. Default auth/model stays unchanged. Execution errors, quota, timeout or incomplete streams are INCONCLUSIVE, never pass.
- Two previous triage-only trials used old/reduced five-skill drafts and are superseded baselines, not final architecture proof. Claude live runs remain deferred by the user.

## Staged native trial rubric

1. Human-invoke ask-matt via its bound source. Reproduce 60 minutes → 01:60, retain prior KEEP backlog row, append deferred CSV idea, route approved duration ticket to implement. Code/tests/HEAD stay unchanged.
2. Human-invoke implement, resolve tdd from the bound catalogue, observe a new public CLI regression red for 60 before implementation, then verify literal outputs 0→00:00, 59→00:59, 60→01:00, 125→02:05, 1440→24:00. Stop at an explicitly invoked committed handoff checkpoint with evidence/scope/pushed=no.
3. Fresh receiver reads handoff/core/style/project rules, rechecks Git and tests, consumes handoff and commits bookkeeping before capturing a frozen candidate. Capture alone is not review approval.
4. Independent Standards/Spec review and pre-push identity gate validate that exact candidate before delivery. This project has no remote and is not pushed.

Raw traces stay ignored under `.scratch/workflow-trial/matt/`; public reporting includes health/results and limitations only. A supervised test of the fixture is separate evidence and cannot fill missing native-agent stages.

## Deterministic verification

| Check | Result | What it proves |
|---|---|---|
| All Node test files under scripts/guardrails | **85/85 passed**, none skipped | Prior regressions retained plus seven catalogue and four snapshot cases; includes two aggregate legacy files reporting 64 guard and 3 dedupe internal assertions |
| Existing sync fixtures | **14/14 passed** | Additive copy/junction/robocopy behavior preserved with synthetic homes only |
| New recursive sync fixtures | **3/3 passed** | Named leaf install; reference/category exclusion; duplicate/link refusal before writes |
| New catalogue tests against the old linter | **exit 1**, expected failures | Prior flat discovery cannot discover Engineering/Productivity leaves; updated linter passes the same new cases |
| `lint-skills --strict --repo-only` | **PASS**, 27 active skills | Names, paths, links and 16 user/11 model invocation policies; no installed-home comparison |
| `check-matt-snapshot` | **PASS**, 38 skills/109 files | Exact bytes/Git blob/SHA-256 and full primary/reference inventory |
| External-reference/local-link audit | **PASS** | No external personal-note path references or broken local Markdown targets; original personal-file Git objects and worktree diff unchanged |

Existing tests were not edited. Source scripts/templates were stored, not run; no package/tool installation, sync into real homes or global configuration changes were performed. Local main remains clean at `24bc111743f6089262c208393d784bd0a276da27`.

## Native execution and environment limit

- **ask-matt intake: PASS.** Healthy completed native run, code 0, 25 events/10 successful commands. Read the bound skill/core/style/catalogue, reproduced 01:60, preserved KEEP and appended only CSV. HEAD, code and tests stayed unchanged.
- **Initial implement run: healthy but checkpoint BLOCKED.** Code 0, 60 events/15 successful commands. Observed the real assertion RED (`01:60` vs `01:00`) before code change; five literal tests then passed. Default sandbox test-runner pipes/isolation returned EPERM, so file-backed CLI output and invocation-only test isolation enabled actual testing; neither environment failure was counted as behavioral RED. The run reported `.git/index.lock` permission denial and did not claim a commit or delivery.
- **Git-writable continuation: PASS for implementation/checkpoint.** Ephemeral native run with per-run `danger-full-access` sandbox, same approved fixture and default model/auth, no permanent settings. Code 0, 41 events/14 successful commands; plain `node --test` passed 5/5 with default isolation and no NODE_OPTIONS, direct literals passed again. Checkpoint committed as `484884c` (`wip: handoff TL1`), clean tree, no remote/push.
- **Fresh receiver: PASS.** Healthy ephemeral native run, code 0, 26 events/9 successful commands. Read handoff/bound policy, checked Git/status/log and reran the five tests, consumed HANDOFF and committed state before capture. Frozen candidate `fed20c54546a6cdc579da5cd1489798c2e22ff73` against seed `d7729aa5a88479152ff4026a27e26d67ed4539f8`; clean tree, no remote. Candidate contains code, new tests, state and preserved backlog. The continuation completes the blocked stage; it does not retroactively turn the initial sandbox run into a full pass.

Event/state assessment confirms completed bound-policy reads, the actual assertion before the CLI edit, the committed checkpoint, receiver verification, unchanged backlog entry, consumed handoff and exact candidate identity. Parent separately reran plain `node --test`: five passed. Independent Spec/Standards review follows on the frozen trial and playbook candidates; capture is not a verdict.

The staged prompt explicitly supplies scope, seams and literals. This is a constrained synthetic CLI trial, not proof of autonomous setup/research/stack choices, every one of the 27 skills, a UI, production data, real deployment, or installed versions. Claude live testing and real history remain untested by instruction. Script fixtures/grader checks remain separate from native behavior.
