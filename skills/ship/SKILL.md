---
name: ship
description: Take one approved ticket (GitHub issue number, BACKLOG item, or a short scoped task) from start to an open pull request in one run - worktree branch, reproduce-first test, implementation, real-app verification, independent review with at most two fix rounds, push of the feature branch, PR, and a Thai delivery report. Invoke explicitly with /ship.
disable-model-invocation: true
metadata:
  version: "1.4.1"
---

# Ship one ticket end-to-end

One command, one ticket, one pull request, one report. The user approves at two points only: the scope box (skipped when the ticket already has acceptance criteria) and the merge (always theirs). Hard stops and the report format come from `D:\ai-playbook\instructions\core.md`.

## Before any action
Read `D:/ai-playbook/instructions/core.md`, then the project's `AGENTS.md` and `CONTRIBUTING.md` if present. Apply their scope, approval and reporting rules before using tools that change state. Existing user approval covers the actions it explicitly includes; ask only for required actions outside that approval. If core cannot be read, report the missing path and continue read-only diagnosis only; do not commit, push or change files until it is available.

## Project rules win
Read `AGENTS.md` and `CONTRIBUTING.md` first. Many repos define their own delivery flow: an end-to-end skill (e.g. `finish-issue`), branch/commit/PR naming, issue binding, CHANGELOG entries, screenshots for UI changes. If the project has its own end-to-end skill, run it and add only what it lacks from this one (reproduce-first, verifier, capped review, Thai report). Follow the project wherever rules differ and say so in the report.

## 0. Load and check
- Read `STATE.md` (if missing: branch, `git log -5`, open issues) and the ticket (`gh issue view <n>` or the BACKLOG row) plus any linked spec.
- `git fetch`; find the default branch (`git symbolic-ref refs/remotes/origin/HEAD`); the main checkout must have a clean `git status`. If not, stop and report what's dirty.
- No acceptance criteria? Write a scope box (Do / Don't / Done when, ≤5 checkable criteria) and ask once. Otherwise continue without asking.
- Name the biggest risk or a simpler approach in one sentence. If the ticket needs a hard stop (see core: migration, non-local DB, auth, personal data, dependency, editing existing tests, conflict with a decision), stop and ask now, not halfway.
- If the project requires issue binding and there is no issue: draft it and ask; creating an issue is not a hard stop on the user's own repo, but it is on someone else's.

## 1. Branch in a worktree
`git worktree add -b <type>/<issue>-<slug> D:\wt\<project>-<issue> origin/<default>` (short path — Windows long paths break git and npm). Install dependencies there with the project's install command. Create or update `STATE.md`: ticket, branch, phase = implement.

## 2. Reproduce, then implement test-first
Bugs start with a reproduction test using worst-case data (longest numbers, Thai text, narrowest supported screen) — even when comments or old reports say it is already fixed (the pilot found a "fixed" clipping bug still failing at 320px). Confirm the test fails for the right reason, then fix. If it passes before any change, the deliverable is the regression test alone; say so. Take the test seams from the ticket's acceptance criteria; do not stop to ask the user to confirm seams (the `tdd` skill may ask — answer from the criteria). Keep the diff inside the ticket; anything else goes to `BACKLOG.md`. Retry an approach at most twice.

## 3. Verify
Run the project's full verify command (from `AGENTS.md`, e.g. `npm run verify`). Then prove the behaviour in the running app: delegate to the `verifier` sub-agent (or do it yourself for tiny changes) with the acceptance criteria; save evidence under `.scratch/ship-<issue>/` (git-ignored). UI changes need phone-width and desktop checks and before/after screenshots if the project asks for them.

## 4. Commit a review candidate, then review (max 2 rounds)
1. Update `STATE.md` (phase = review, next action = user reviews PR after verification and review pass) and finish all ticket changes and verification. Stage only your ticket's files, including new tests and `STATE.md`, then make a local commit using the project's message format. Keep evidence under a git-ignored path; if unrelated changes remain, report them instead of staging them. This commit is local: push comes later.
2. In the ticket worktree run `node D:/ai-playbook/scripts/review-candidate.mjs --base origin/<default>`. It rejects uncommitted/untracked work or an empty diff. Save its successful JSON output under `.scratch/ship-<issue>/candidate.json`. Record the returned **base**, **mergeBase** and **candidate** SHAs; use those frozen SHAs throughout this review, even if a remote branch moves.
3. Delegate to the `reviewer` sub-agent: ticket, acceptance criteria, candidate JSON and its exact `diffCommand` (`git diff --ignore-submodules=none <mergeBase-SHA> <candidate-SHA> --`). This keeps Git configuration from hiding submodule changes. The reviewer must report the SHAs it actually checked. A review of an empty diff or a different SHA does not count.
4. Fix BLOCKERs and cheap SHOULD-FIXes. After any change, re-run full verify and the affected running-app acceptance checks, update evidence, and commit the fixes before capturing and reviewing the new candidate. Use the original frozen base SHA for later captures. Any change to `STATE.md`, BACKLOG, tests or code creates a new candidate too; record known deferred findings before the final candidate commit. After round 2: an open BLOCKER means stop and report BLOCKED; other findings go to the report. Defer any new tracked backlog entry to follow-up work instead of adding an unreviewed commit or a third round. Never weaken tests or checks to pass review.

## 5. Check the reviewed candidate, push the feature branch, open the PR
All tracked bookkeeping, including `STATE.md`, must already be in the reviewed candidate. Immediately before pushing run `node D:/ai-playbook/scripts/review-candidate.mjs --base <saved-base-SHA> --expect <reviewed-candidate-SHA>`. Require a clean worktree, the exact reviewed HEAD, reviewer results for that SHA, and verification evidence for that version. The script checks Git identity only: it cannot certify the review or tests. If anything changed after review, return to verification and review within the two-round cap, or report BLOCKED. Do not make a new commit after this check and call it reviewed.

Push only the feature branch (`git push -u origin <branch>`) and open a PR (`gh pr create`). Report the reviewed commit SHA in the PR. Use the project's PR template if it has one; otherwise this body (adapted from Matt Pocock's `pr` skill): **Summary** (what and why, 2–3 lines), **Evidence** (screenshots first, then test names and command results per acceptance criterion), **Merge danger** (one-way or two-way door, blast radius: which users/data are affected if it is wrong, how to roll back), **Not tested**. If the remote belongs to someone else and the user hasn't asked for a PR there, stop before pushing and show the PR text instead. Never merge, never push to the default branch, never deploy.

## 6. Hand back
Finish with the Thai delivery report from `core.md` plus the PR link (or the prepared PR text). The one next action is usually "review and merge PR #…".

## Stop conditions
Stop and report BLOCKED (what you tried, what you need) when: a hard stop is required; verify fails after two changed approaches; the acceptance criteria cannot be verified; the fix needs changes outside the ticket; or ~60 tool calls pass without progress.

## Excuses and rebuttals
These come from real sessions (`me/pitfalls.md`). If you catch yourself thinking the left column, do the right one.

| Excuse | Rebuttal |
|---|---|
| "The code comment says it's already fixed." | Reproduce with worst-case data. The pilot's "fixed" clipping bug still failed at 320px. |
| "While I'm here I'll also tidy this up." | That's P6. Add it to `BACKLOG.md`; the diff stays inside the ticket. |
| "The reviewer found more, one more round." | Max 2 rounds. Non-blockers go to the report. Rounds 6–10 happened before and wasted days. |
| "Tests are flaky, I'll loosen this assertion." | Never weaken a test to get green. Report BLOCKED with the evidence. |
| "The user said ทำต่อ, so I'll keep going past the PR." | One-word approval covers the last proposed step only. Merge and deploy are always theirs. |
| "Pushing to main is faster for a one-line fix." | Feature branch + PR only. The optional guard is not installed; follow core's approval rules. |

## Red flags — stop and re-read the ticket
- The diff touches files the ticket never mentions.
- You are editing an existing test, a migration, auth code, `.env`, or CI.
- You have run the same failing command three times.
- You are about to claim "done" without a command output or screenshot to show.
