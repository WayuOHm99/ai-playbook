---
name: retro
description: Review recent Claude Code and Codex sessions and propose at most three evidence-backed lessons for the playbook vault (pitfalls, wins, rule or hook changes). Run by hand at the end of a ticket or week, or from the weekly scheduled report. Writes nothing without the user's approval.
disable-model-invocation: true
metadata:
  version: "1.1.1"
---

# Retro: turn recent sessions into at most three lessons

## Before any action
Read `D:/ai-playbook/instructions/core.md`, then the project's `AGENTS.md` and `CONTRIBUTING.md` if present. Apply their scope, approval and reporting rules before using tools that change state. Existing user approval covers the actions it explicitly includes; ask only for required actions outside that approval. If core cannot be read, report the missing path and continue read-only analysis only; do not run the extractor or write lessons/candidates until it is available.

Rules adapted from robertantolin/claude-retro-skill and netresearch/retro-skill (`D:/ai-playbook/research/10-skill-libraries-community.md` §5). Goal: the vault improves from real evidence without drifting or filling with noise.

## 1. Gather (read-only)
1. Run `node D:/ai-playbook/scripts/extract-history.mjs` (default: last 7 days; pass `--since YYYY-MM-DD` to widen). It writes secret-masked files to `D:/ai-playbook/_inbox/history-extract/<date>/`. Read only those files, never the raw `.jsonl` transcripts — raw transcripts can contain pasted keys or patient data.
2. Read `D:/ai-playbook/me/pitfalls.md`, `me/wins.md`, and `_inbox/retro-candidates.md` (one-off observations from earlier runs; create it if missing).
3. Optionally `git log --since` in the projects that appear, for evidence.

## 2. What counts as evidence
Only these:
- **User correction**: the user had to repeat, rephrase or override the agent, and a concrete change would have prevented it.
- **Repeated manual work**: the user typed the same kind of instruction in 2+ sessions (e.g. the same fence, the same setup answer).
- **Rework loop**: the same fix/review cycle ran 3+ times, or a bug came back.
- **Clear win**: a pattern the user explicitly approved that finished cleanly.
- **Missing check**: a rule in `core.md` or `AGENTS.md` was broken, and no hook, test or script enforces it. Propose the check, not more prose.
- **Instruction bloat**: `instructions/core.md` or a project `AGENTS.md` is over ~200 lines. Propose what to cut or move into a skill.

A pattern seen once goes to `_inbox/retro-candidates.md` (date, one line, evidence pointer) and waits for a second sighting in a later run. Cite every finding as `<file>:<line>` of the extract, or a commit hash.

## 3. Propose — at most 3
Choose the three with the highest impact. For each, pick the strongest enforcement that fits, preferring mechanisms over prose:

| Destination | When |
|---|---|
| hook / guard rule / script (`guardrails/`, `scripts/`) | the mistake is mechanical and must never happen |
| skill change (`skills/<name>/SKILL.md` Gotchas) | it happens inside a specific workflow |
| `me/pitfalls.md` or `me/wins.md` | a personal habit to remember |
| project `BACKLOG.md` | it is project work, not a process lesson |
| `instructions/core.md` | only as a proposed diff; core rules change rarely |

`me/pitfalls.md` holds at most 20 entries. If adding would exceed that, the first proposal must be which entry to merge or remove.

## 4. Ask, then apply
Show the proposals in Thai:
```
## Retro <date range>  (sessions: N, prompts: M)
1. <lesson> — หลักฐาน: <file:line>, <file:line>
   เสนอ: <destination + exact change>
2. ...
บันทึกไว้รอเจอซ้ำ: <k> เรื่อง (ใน _inbox/retro-candidates.md)
ตอบ: "ok 1,3" เพื่อบันทึก หรือ "ไม่" เพื่อข้าม
```
Apply only the numbers the user approves, in one commit in the vault: `retro: <date> — <short summary>`. Never write to `instructions/core.md`, `guardrails/` or settings without an explicit yes for that item. If the user approved nothing, write nothing except the candidates file.
