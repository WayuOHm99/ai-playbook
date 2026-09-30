---
name: ship
description: Take one ticket (GitHub issue number, BACKLOG item, or a short scoped task) from start to an open pull request in one run - branch, test-first implementation, real-app verification, independent review with at most two fix rounds, PR, and a Thai delivery report. Use when the user says /ship, "ทำให้จบ", "ทำต่อ" with a ready ticket, or asks to finish a ticket end-to-end.
---

# Ship one ticket end-to-end

One command, one ticket, one pull request, one report. The user approves only at two points: the scope box (skipped when the ticket already has acceptance criteria) and the merge (always theirs). Rules that always apply: `D:\ai-playbook\instructions\core.md` (autonomy contract, hard stops, report format).

## 0. Load and check
- Read `AGENTS.md`, `STATE.md`, the ticket (`gh issue view <n>` or the BACKLOG line) and any spec it links.
- `git status` must be clean and `main` up to date. If not, stop and report what's dirty.
- If the ticket has no acceptance criteria, write a scope box (Do / Don't / Done when, ≤5 checkable criteria) and ask once. If it has criteria, continue without asking.
- Name the biggest risk or a simpler approach in one sentence. If the ticket conflicts with a decision record or needs a hard-stop action (migration, auth, personal data, new dependency, editing existing tests), stop and ask now, not halfway.

## 1. Branch
Create a short branch (`fix/<n>-<slug>` or `feat/<n>-<slug>`) or a worktree with a short path. Update `STATE.md`: current ticket, phase = implement.

## 2. Implement test-first
Use the `implement` skill if installed (it drives `tdd`); otherwise: write a failing test that expresses the acceptance criterion, confirm it fails for the right reason, make it pass, refactor. Bugs start with a reproduction test. Keep the diff inside the ticket; anything else goes to `BACKLOG.md`. Retry a failing approach at most twice, then change approach or stop.

## 3. Verify
Run the project's full verify command (from `AGENTS.md`, e.g. `npm run verify`) — tests, typecheck, lint, build. Then prove the behaviour in the running app: delegate to the `verifier` sub-agent (or do it yourself for tiny changes) with the acceptance criteria; collect evidence (screenshots, command output) under `.scratch/ship-<n>/` or the project's evidence folder. UI tickets need a phone-width and desktop check.

## 4. Review (max 2 rounds)
Delegate to the `reviewer` sub-agent with: ticket text, acceptance criteria, `git diff main...HEAD`. It reports Spec and Standards findings as BLOCKER / SHOULD-FIX / COULD-FIX. Fix BLOCKERs (and cheap SHOULD-FIXes), re-run verify, and review again. After round 2 stop fixing: remaining non-blockers go to the report and `BACKLOG.md`. Never weaken tests or checks to pass review.

## 5. Commit and PR
Commit with a clear message referencing the ticket. Push the branch and open a PR (`gh pr create`) whose body has: summary, acceptance criteria with evidence, how to test, risks. Do not merge. Do not deploy.

## 6. Hand back
Update `STATE.md` (ticket status = PR open, next action = user reviews/merges PR #..., then next ticket). Finish with the Thai delivery report from `core.md` (ผลลัพธ์ / ที่ขอ vs ที่ได้ / สิ่งที่เจอ / ความเสี่ยงที่คุณไม่ได้ถาม / สิ่งที่ตัดสินใจแทน / ยังไม่ได้ทำ / ตรวจอย่างไร / ขั้นถัดไป) plus the PR link.

## Stop conditions
Stop and report BLOCKED (with what you tried and what you need) when: a hard stop is required; verify fails after two changed approaches; the acceptance criteria cannot be verified; the fix needs changes outside the ticket; or you've spent more than ~60 tool calls without progress.
