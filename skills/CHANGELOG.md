# Vault skills changelog

Version lives in each skill's `metadata.version`. Bump it with every behaviour change and add a line here. After a change, run `node scripts/lint-skills.mjs` and, for description changes, `node scripts/run-trigger-evals.mjs --skill <name>` (results in `evals/results.md`).

## 2026-10-05
- **ship 1.4.1**: use the helper's exact pinned diff command with `--ignore-submodules=none`; reviewer definitions call out child-commit review. Two new local-submodule regression cases reproduce dirty work being accepted and committed pointer changes disappearing when Git configuration hides submodules.
- **ship 1.4.0**: commit all ticket changes and new tests before review; freeze base, merge-base and candidate SHAs; require the same clean candidate before push. New `scripts/review-candidate.mjs` rejects dirty work, empty diffs and stale reviewed commits. The helper checks Git identity, not the review verdict or test results.
- **All five vault skills explicitly load `instructions/core.md` before acting**: new-request 1.2.1, choose-stack 1.2.1, handoff-pack 1.2.1, retro 1.1.1 and ship 1.4.0. Missing core permits read-only work only. Existing approval is reused within its scope.
- **Reviewer definitions (Claude and Codex)** now require the pinned candidate diff and report the reviewed SHAs. Later commits require a new review.
- Regression checks: `node --test scripts/review-candidate.test.mjs`; usage and limits in `scripts/README.md`.

## 2026-10-03
- **All vault skills are now manual-only** (`disable-model-invocation: true` plus `agents/openai.yaml` with `allow_implicit_invocation: false`): new-request 1.2.0, handoff-pack 1.2.0, choose-stack 1.2.0. Nothing from the vault runs unless the user types the skill name.
- **The vault no longer installs global rules.** Removed `~/.claude/CLAUDE.md`, emptied `~/.codex/AGENTS.md`, deleted the two scheduled tasks and the post-commit auto-sync hook. `sync.ps1` now installs only skills, sub-agents and the guard hook, and is run by hand.

## 2026-10-02
- **choose-stack 1.1.0** (new, auto-invoked; 1.1.0 applies the first live test: core-feature risk step, /50 scoring, non-interactive assumptions, PDPA s.28 check, snippets are not sources)
  - Stack decisions are analysed fresh for each project.
  - Steps: constraints table, then 2–3 candidates (one house default and one from outside the vault), then fresh research from primary sources, then weighted scoring, then a recommendation with "would change if" conditions and feasibility items, then an ADR.
  - `stacks/*.md` are now evidence and defaults, not a fixed menu.
- **ship 1.3.0**
  - Test seams come from the acceptance criteria, so the run doesn't stall when `tdd` asks.
  - The PR body adds Evidence and Merge danger (one- or two-way door, blast radius, rollback), adapted from Matt Pocock's `pr` skill.
  - Removed the dead reference to `implement`.
- **retro 1.1.0**: added two evidence kinds: a rule with no enforcing check, and instruction files over ~200 lines.

## 2026-10-01
- **ship 1.2.0**
  - Added a "Project rules win" section, so the project's own `finish-issue`/CONTRIBUTING flow takes precedence.
  - Bugs are now reproduced first with worst-case data. In the pilot, a "fixed" bug still failed at 320px.
  - Worktrees go under `D:\wt`, and feature-branch push + PR is part of the run.
  - Manual-only in both tools: `disable-model-invocation` for Claude and `agents/openai.yaml` for Codex.
  - Added "Excuses and rebuttals" and "Red flags" sections.
- **new-request 1.1.0**
  - Inbox is `BACKLOG.md` and tickets are GitHub Issues.
  - Added the P0/P2 boundary, and external integrations are now P4.
  - Added a fixed vocabulary for "ทำเมื่อไหร่" and a `❓ ต้องยืนยัน` line.
  - The description now starts with "Use when" and includes Thai cues and a "Do not use for" clause.
  - Added "Excuses and rebuttals" and "Red flags" sections.
  - Trigger evals in Codex: recall 0/8 and near-miss 8/8. Behaviour is covered by the core rules, so type `$new-request` in Codex.
- **handoff-pack 1.1.0**
  - The handoff is now committed as `STATE.md` + `HANDOFF.md` (previously an ignored `.scratch` file).
  - Added fields for pushed/upstream and a fast verify command, plus a findings table and evidence pointers.
  - The receiver now stops at approval gates.
  - Rewrote the description.
  - Trigger evals in Codex: recall 0/8 and near-miss 8/8.
- **retro 1.0.0** (new)
  - Reads secret-masked extracts and makes at most 3 proposals, each with `file:line` evidence.
  - A one-off observation waits for a second sighting.
  - `me/pitfalls.md` is capped at 20 entries.
  - Writes nothing without the user's approval.
  - A weekly report-only scheduled task runs it.

## 2026-09-30
- new-request 1.0.0, ship 1.0.0, handoff-pack 1.0.0: initial versions.
