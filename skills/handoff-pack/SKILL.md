---
name: handoff-pack
description: Save the full working state to committed files before /clear, compaction, ending the day, quota exhaustion, or switching between Claude Code and Codex, so the next agent continues from files instead of the user copy-pasting. Also use at the start of a session when the user says "ต่อจาก Codex/Claude" or "ทำต่อจากเมื่อวาน" to load a handoff.
---

# Handoff pack: continue from files, not from copy-paste

The user used to relay long reports between Codex and Claude by hand and lost context after `/clear` and compaction. Handoffs live in committed files on the working branch, so they survive and are visible from any worktree or tool.

## Writing a handoff (end of session)
1. Never on the default branch. On a feature branch, update two files in the repo root:
   - `STATE.md` (create from `D:/ai-playbook/templates/project/STATE.md` if missing): phase, ticket, branch, last commit, **pushed: yes/no (upstream)**; done (with evidence), in progress, next action (one concrete step); decisions and assumptions; commands verified to work, including a **fast verify command (<2 min)** next to the full one; environment problems.
   - `HANDOFF.md`: goal, fences ("do not touch …"), open review findings as a table (id | severity | status | fixing commit) with full text (compaction loses them otherwise), and the exact tool-agnostic prompt the next agent should run.
   - Every claim needs an evidence pointer: commit hash, `file:line`, or command + result.
2. Commit work in progress together with both files: `wip: handoff <ticket> — <one line>`. If the tree contains changes you did not make, list them instead of committing them. Push only if the branch already tracks a remote.
3. Reply in Thai, one line per item, ending with the exact sentence to type in the other tool, e.g. `อ่าน STATE.md กับ HANDOFF.md บน branch fix/12-kpi แล้วทำต่อ`.

## Receiving a handoff (start of session)
1. Check out or open the branch named by the user (or the newest branch with a `wip: handoff` commit), then read `AGENTS.md`, `STATE.md`, `HANDOFF.md`.
2. Verify before trusting: `git status`, `git log -3`, and the fast verify command (the full one only if the change is risky or the user asks; say which you ran). Reports are claims; the repo is the truth.
3. Summarise in Thai in ≤5 lines what you found, flag mismatches with the handoff, and propose the next action. Continue if it is inside the autonomy contract; if the next action is an approval gate (push, PR, issue, hard stop), stop after the summary and ask. Delete `HANDOFF.md` in the commit that finishes the ticket.
