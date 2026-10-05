---
name: handoff-pack
description: Use when a work session is ending or moving - the user is stopping for the day, about to /clear or compact, running out of quota or context, switching between Claude Code and Codex, or starting a session that continues earlier work (Thai cues: เลิกงาน, พักงาน, เก็บงาน, จะ /clear, โควตาใกล้หมด, context ใกล้เต็ม, สลับไป Codex/Claude, ต่อจาก Codex/Claude, ทำต่อจากเมื่อวาน). Saves or loads state in committed STATE.md and HANDOFF.md. Do not use for README, CHANGELOG, PR descriptions or handing a system over to IT.
disable-model-invocation: true
metadata:
  version: "1.2.1"
---

# Handoff pack: continue from files, not from copy-paste

## Before any action
Read `D:/ai-playbook/instructions/core.md`, then the project's `AGENTS.md` and `CONTRIBUTING.md` if present. Apply their scope, approval and reporting rules before using tools that change state. Existing user approval covers the actions it explicitly includes; ask only for required actions outside that approval. If core cannot be read, report the missing path and continue read-only diagnosis only; do not write handoff files, commit or push until it is available.

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
3. Summarise in Thai in ≤5 lines what you found, flag mismatches with the handoff, and propose the next action. Continue within core's autonomy contract and existing approval. Push or PR creation inside an approved `ship`/delivery flow does not need approval again; ask only for actions not yet authorised (including issue creation or other hard stops). Delete `HANDOFF.md` before the final candidate commit that finishes the ticket, so review covers that deletion too.
