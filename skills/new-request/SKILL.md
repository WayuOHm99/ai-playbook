---
name: new-request
description: Classify and route any new incoming request (bug, feedback, new idea, new requirement, "add this too", "make it world-class", audit request) before acting on it. Use when the user brings something new mid-project or starts a new project and it is not obvious which phase it belongs to.
---

# New request: classify, route, and name the next step

The user often sends long, mixed Thai messages that combine a bug, an idea and a new requirement. Split them, classify each part, and route it so nothing derails the current work. Rationale: `D:\ai-playbook\playbook\triage.md`.

## 1. Read state (read-only)
- Read the project's `AGENTS.md`, plus `STATE.md` and `BACKLOG.md` if they exist.
- If `STATE.md` is missing, work out the current ticket from the branch name, `git log -5 --oneline`, and open issues (`gh issue list --state open`, if the project uses GitHub Issues — see `AGENTS.md` or `docs/agents/issue-tracker.md`).
- Find the project's tracker: GitHub Issues if `AGENTS.md`/docs say so, otherwise `BACKLOG.md`. Use that one tracker for every class below.
- Find decision records: `DECISIONS.md`, `docs/decisions/`, `docs/adr/`, or the path named in `AGENTS.md`/`CONTEXT.md`.

## 2. Split
Break the message into separate items, one sentence each. A quality word like "ระดับโลก", "สวยๆ" or "ครบๆ" is not its own item: attach it to the item(s) it modifies and turn it into criteria (step 4).

## 3. Classify each item (first match wins)
- **P0** ongoing outage, data loss, or personal/patient data exposure. A single transient error with no data impact is P2, not P0.
- **P1** bug in the slice being built now.
- **P2** bug in shipped behaviour.
- **P3** feedback: doesn't meet agreed acceptance criteria.
- **P4** feedback or request that changes what an existing feature does. Also use P4 for a new capability inside an existing system that needs an external service, secrets, cost, or a new personal-data flow (e.g. LINE/email notifications, payments).
- **P5** nice-to-have or idea with none of the above.
- **P6** cleanup or tech debt.
- **P7** a new project or new system.

Before finalising, search the tracker and decision records: if the item was already decided, rejected or ticketed, quote it and link it. If the item refers to something you cannot find in this repo (a page, form or module), mark it "ต้องยืนยัน" rather than guessing.

## 4. Route — only actions that need no approval
- **P0:** stop other work, diagnose read-only (logs, recent commits), propose recovery. Any production change needs the user's yes.
- **P1/P3:** fix inside the current ticket (hand to `ship` if that flow is active).
- **P2:** try to reproduce read-only (read code, logs, run existing tests). Then draft a ticket with steps to reproduce and acceptance criteria. Create the issue only after the user approves. The failing test is written later, inside `/ship`.
- **P4:** draft the change: what changes, why, what it displaces, affected tickets, and external dependencies with current facts. For external services, check current official docs (use the `researcher` sub-agent). Ask for approval. Do not implement.
- **P5/P6:** draft a tracker entry: an issue with the project's triage labels, or one `BACKLOG.md` line (`date | source | sentence | class`) when there is no issue tracker. Create it after approval, then continue the current work.
- **P7:** propose a tier (demo / ใช้ภายใน / ใช้จริง) and start clarification with `grill-with-docs` inside a repo or `grill-me` outside one (fallback: `grilling`). Talk first; do not write code.
- **Quality words:** convert them into at most 5 checkable criteria (numbers, viewports, timings, error behaviour) and attach them to the related items for approval.

## 5. Push back once
For each item worth doing, name the main risk or a simpler alternative in one sentence. Flag conflicts with decisions.

## 6. Answer in Thai, in exactly this shape
```
## คัดแยกแล้ว
| # | เรื่อง | ประเภท | ทำเมื่อไหร่ | ไปที่ |
|---|---|---|---|---|
| 1 | ... | P2 บั๊กที่ส่งไปแล้ว | หลังงานปัจจุบัน | ร่าง Issue (รออนุมัติ) |

เกณฑ์แทน "<quality word>": 1) ... (only if the user used one)
❓ ต้องยืนยัน: <facts you could not find — omit if none>
⚠️ ข้อสังเกต: <risk / conflict / simpler alternative>
👉 ขั้นถัดไป: <one action the user can take, e.g. "ตอบ ok เพื่อเปิด Issue ข้อ 1 แล้ว /ship">
```
Use only these values in "ทำเมื่อไหร่": ตอนนี้ / หลังงานปัจจุบัน / หลังอนุมัติ / เก็บไว้ก่อน.
