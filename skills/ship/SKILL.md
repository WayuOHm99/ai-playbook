---
name: ship
description: Take one approved ticket (GitHub issue number, BACKLOG item, or a short scoped task) from start to an open pull request in one run - worktree branch, reproduce-first test, implementation, real-app verification, independent review with at most two fix rounds, push of the feature branch, PR, and a Thai delivery report. Invoke explicitly with /ship.
disable-model-invocation: true
metadata:
  version: "1.3.0"
---

# Ship one ticket end-to-end

One command, one ticket, one pull request, one report. The user approves at two points only: the scope box (skipped when the ticket already has acceptance criteria) and the merge (always theirs). Hard stops and the report format come from `D:\ai-playbook\instructions\core.md`.

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

## 4. Review (max 2 rounds)
Delegate to the `reviewer` sub-agent: ticket, acceptance criteria, `git diff origin/<default>...HEAD`. Fix BLOCKERs and cheap SHOULD-FIXes, re-run verify, review again. After round 2: an open BLOCKER means stop and report BLOCKED; other findings go to the report and `BACKLOG.md`. Never weaken tests or checks to pass review.

## 5. Commit, push the feature branch, open the PR
Commit using the project's message format, including the updated `STATE.md` (phase = review, next action = user reviews PR). Push only the feature branch (`git push -u origin <branch>`) and open a PR (`gh pr create`). Use the project's PR template if it has one; otherwise this body (adapted from Matt Pocock's `pr` skill): **Summary** (what and why, 2–3 lines), **Evidence** (screenshots first, then test names and command results per acceptance criterion), **Merge danger** (one-way or two-way door, blast radius: which users/data are affected if it is wrong, how to roll back), **Not tested**. If the remote belongs to someone else and the user hasn't asked for a PR there, stop before pushing and show the PR text instead. Never merge, never push to the default branch, never deploy.

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
| "Pushing to main is faster for a one-line fix." | Feature branch + PR only. The guard will block it anyway. |

## Red flags — stop and re-read the ticket
- The diff touches files the ticket never mentions.
- You are editing an existing test, a migration, auth code, `.env`, or CI.
- You have run the same failing command three times.
- You are about to claim "done" without a command output or screenshot to show.
