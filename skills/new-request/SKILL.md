---
name: new-request
description: Classify and route any new incoming request (bug, feedback, new idea, new requirement, "add this too", "make it world-class", audit request) before acting on it. Use when the user brings something new mid-project or starts a new project and it is not obvious which phase it belongs to.
---

# New request: classify, route, and name the next step

The user often sends long, mixed messages that combine a bug, an idea and a new requirement. Your job is to split them, classify each part, and route it so nothing derails the current work. Details and rationale: `D:\ai-playbook\playbook\triage.md`.

## Steps

1. **Read state.** Read the project's `AGENTS.md`, `STATE.md` and `BACKLOG.md` if they exist, and `git status`. Know the current ticket before judging anything.

2. **Split.** Break the message into separate items (one sentence each). Mixed messages are normal; do not treat them as one task.

3. **Classify each item** using the first matching class:
   - P0 production down / data loss / personal or patient data exposure
   - P1 bug in the slice being built now
   - P2 bug in shipped behaviour
   - P3 feedback: doesn't meet agreed acceptance criteria
   - P4 feedback: changes what the feature should do (requirement change)
   - P5 new idea / nice-to-have / "world-class" / "add this too"
   - P6 cleanup or debt
   - P7 new project or new system (not part of current work)
   Check `BACKLOG.md` and decision records first: if the item was already decided or rejected, quote that decision.

4. **Route**:
   - P0 → stop other work, diagnose read-only, propose recovery; ask before any production change.
   - P1/P3 → fix now inside the current ticket (hand off to `ship` if the ticket flow is active).
   - P2 → reproduce with a failing test or script, then open a ticket (GitHub Issue if the project uses it, otherwise `BACKLOG.md`), then suggest `/ship` for it.
   - P4 → draft the spec delta (what changes, why, what it displaces, which tickets are affected) and ask for approval. Do not implement yet.
   - P5/P6 → append one line to `BACKLOG.md` (date, source, sentence, class) and return to the current work. If the user insists on "world-class", convert it into ≤5 checkable criteria and put those in the backlog item.
   - P7 → start the lifecycle at phase 0–2: propose a tier (demo / ใช้ภายใน / ใช้จริง) and run `grill-with-docs` (inside a repo) or `grill-me` (outside a repo). Talk first; do not write code.

5. **Push back once.** For each item worth doing, name the main risk or the simpler alternative in one sentence. If an item conflicts with a decision, say so.

6. **Answer in Thai** with this format, and nothing else:

```
## คัดแยกแล้ว
| # | เรื่อง | ประเภท | ทำเมื่อไหร่ | ไปที่ |
|---|---|---|---|---|
| 1 | ... | P2 บั๊กที่ส่งไปแล้ว | หลังงานปัจจุบัน | Issue #.. |

⚠️ ข้อสังเกต: <risk / conflict / simpler alternative>
👉 ขั้นถัดไป: <one action, ideally a command the user can type, e.g. `/ship #42`>
```

Only perform the actions that don't need approval (backlog lines, reproduction, read-only diagnosis). Everything else waits for the user's yes.
