---
name: choose-stack
description: Use when starting a new project or system, choosing or changing a framework, database, hosting, auth, mobile or video tooling, or when the user asks "use X or Y" / "stack อะไรดี" / "ควรใช้อะไรทำ". Analyses the requirement and constraints, researches current options from primary sources, compares 2-3 candidates with trade-offs, and recommends one with an ADR. Do not use for picking a small library inside an already-chosen stack.
disable-model-invocation: true
metadata:
  version: "1.2.1"
---

# Choose a stack: analyse, research, recommend

## Before any action
Read `D:/ai-playbook/instructions/core.md`, then the project's `AGENTS.md` and `CONTRIBUTING.md` if present. Apply their scope, approval and reporting rules before using tools that change state. Existing user approval covers the actions it explicitly includes; ask only for required actions outside that approval. If core cannot be read, report the missing path and continue read-only research only; do not write an ADR or change files until it is available.

The vault's `stacks/*.md` files are **evidence and house defaults, not the answer**. Every project gets a fresh decision that starts from its own constraints. A default wins only when it actually fits.

## 1. Constraints first
Fill this table from the request, `AGENTS.md`, `me/profile.md` and existing code. Ask the user only for rows you cannot infer, at most 5 questions in one message. If you cannot ask (non-interactive run), state each assumption and list it under "ต้องยืนยันก่อนเริ่ม":

| Constraint | Why it decides things |
|---|---|
| Data: public / staff personal / patient or health (PDPA s.26) | Sensitive data → on-prem or a provider with a Thai/approved region; rules out many free clouds |
| Where it may run: hospital server / any cloud / user's devices | On-prem → Docker, no managed-only services |
| Users and devices: how many, phone/desktop, offline needed? | PWA vs native, sync, scale |
| Tier: demo / ใช้ภายใน / ใช้จริง, and deadline | How much to build; see `playbook/lifecycle.md` |
| Who maintains it after the user (handover) | Prefer boring, popular, typed, well-documented |
| Budget: free tiers only? commercial use? | Free-tier terms (e.g. non-commercial only), pause rules, limits |
| What the user and agents already know | Reuse beats novelty; check `stacks/` and the user's repos |

Then name the **core-feature risk**: the 1–2 product decisions that can invalidate any stack (for example check-in by rotating QR vs GPS vs biometric; device camera or offline needs; access to another system's data). Decide or flag these before comparing frameworks. They often matter more than the framework.

## 2. Candidates
- List 2–3 realistic candidates. Always include the closest house default from `stacks/` (read it for versions, gotchas and why), and at least one option that is not in the vault, so the vault cannot become an echo chamber.
- Run a "do nothing new" check: can an existing system, a spreadsheet plus form, or an existing repo of the user's do the job?

## 3. Research — current and primary
Use the `researcher` sub-agent (or the `research` skill). For each candidate, gather with URL and date:
- the current stable version, and whether it was released in the last 6 months;
- licence, and pricing or free-tier terms;
- data region and where data is processed;
- known breaking changes and peer-dependency conflicts;
- Windows dev support;
- how well AI coding agents handle it: popularity and documentation quality.

For cloud or SaaS options holding personal data, check where data is processed (PDPA s.28 cross-border transfer). Search-result snippets alone are not primary sources: open at least the vendor or endoflife.date page for the recommended option. Mark anything unconfirmed UNVERIFIED. Facts that a vault recipe states but you did not re-check today do not count as current.

## 4. Compare and recommend
Score each candidate 1–5 on: fit to constraints (weight 3), maintainability by one person plus agents (2), data and compliance fit (3), cost and lock-in (1), time to first working version (1). The maximum is 50. Show the per-criterion breakdown on one line under the table. Then present in Thai:

```
## เลือก stack: <ระบบ>
ข้อจำกัดที่ใช้ตัดสิน: <3-5 บรรทัด>
ความเสี่ยงของฟีเจอร์หลัก: <การตัดสินใจระดับผลิตภัณฑ์ที่สำคัญกว่า framework>
| ตัวเลือก | คะแนน /50 | เด่น | เสี่ยง |
แนะนำ: <ตัวเลือก> เพราะ <1-2 ประโยค>
จะเปลี่ยนคำแนะนำถ้า: <เงื่อนไขที่ทำให้อีกตัวดีกว่า>
ต้องยืนยันก่อนเริ่ม (feasibility, เรียงจากเช็กง่ายสุดก่อน ข้อแรกเป็น spike บนเครื่องจริง): <API/สิทธิ์/บัญชี/ข้อมูล>
แหล่งข้อมูล: <URL + วันที่>
```
Push back if the user's preferred option scores clearly worse: say why in one sentence.

## 5. Record
After the user approves, write an ADR in the project's `DECISIONS.md` (or `docs/decisions/`) with context, options, decision, consequences and "revisit when". If this is a new kind of project likely to repeat, propose (do not write without approval) a new or updated `stacks/<type>.md` recipe based on the research.

## Gotchas
- A feasibility check comes before scaffolding. The user's mobile "platform" was built before data access was checked, and was abandoned.
- Name and domain are decided once, before the first deploy. One project was renamed 5 times in 2 days.
- Pinned versions age monthly. The monthly freshness task re-checks `stacks/`, so trust today's research over the file.
