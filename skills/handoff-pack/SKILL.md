---
name: handoff-pack
description: Save the full working state to files before /clear, compaction, ending the day, quota exhaustion, or switching between Claude Code and Codex, so the next agent continues from files instead of the user copy-pasting. Also use at the start of a session when the user says "ต่อจาก Codex/Claude" to load a handoff.
---

# Handoff pack: continue from files, not from copy-paste

The user used to relay long reports between Codex and Claude by hand, and lost context after `/clear` and compaction. This skill replaces that.

## Writing a handoff (end of session)
1. Commit work in progress on the current branch with a `wip:` message (never on `main`, never push unless the branch already tracks a remote and the user allowed pushing). If the tree has changes you did not make, list them instead of committing them.
2. Update `STATE.md` in the project root (create from `D:\ai-playbook\templates\project\STATE.md` if missing):
   - phase, current ticket, branch, last commit hash
   - what is done (with evidence), what is in progress, what is next (one concrete action)
   - open review findings not yet fixed (paste them in full — they are lost on compaction otherwise)
   - decisions made this session and assumptions to confirm
   - commands verified to work (run/test/verify) and anything broken in the environment
3. If handing to the other tool, also write `.scratch/handoff-<YYYYMMDD-HHMM>.md` with: goal, constraints/fences ("do not touch ..."), exact next prompt the receiver should run. Keep `.scratch/` git-ignored.
4. Reply in Thai with one line per item and the exact sentence the user should type in the other tool, e.g. `อ่าน STATE.md และ .scratch/handoff-20261001-1830.md แล้วทำต่อ`.

## Receiving a handoff (start of session)
1. Read `AGENTS.md`, `STATE.md`, the newest `.scratch/handoff-*.md`.
2. Verify before trusting: `git status`, `git log -3`, run the verify command. Reports are not the source of truth; the repo is.
3. Summarise in Thai in ≤5 lines what you found, flag any mismatch with the handoff, and propose the next action. Continue if the next action is inside the autonomy contract.
