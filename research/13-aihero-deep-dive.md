# 13 — aihero.dev deep dive (2026-10-02)

This is the researcher sub-agent's report, saved by the main session. Pages were read through a summarising fetch tool, so quotes may be paraphrased. Re-open a source before relying on a figure.

Tiers: T1 = official docs. T2 = Matt Pocock's own site or repo, treated as a primary source for his own work. T3 = other.

## 1. Summary

- **The site.** aihero.dev is Matt Pocock's site, with 191 URLs in its sitemap. All agentic-coding content is free; workshops and cohorts are paid.
- **The repo is ahead of the site.** `mattpocock/skills` (MIT, 274,506 stars, last push 2026-09-29) has 37 skills on main. The `/skills` page is still v1.2 (2026-08-05) and uses old names (`/to-prd`, `/to-issues`, `/domain-model`), while main already has v1.3 content (merged 2026-09-29, not yet tagged). Trust the repo.
- **His approach rests on three ideas:**
  - keep context in the "smart zone";
  - grill until both sides understand the same thing before building;
  - let feedback loops (tests, types, hooks) keep the agent in check.
- **Most useful for you:** `grill-with-docs`, `tdd`, `diagnosing-bugs`, `wait-what`, `prototype`, `to-questionnaire`, `wizard`.
- **Already covered by the vault, so use the vault's version:** `implement`, `implement-spec`, `handoff`, `retro`, `pr`, `research`, `git-guardrails-claude-code`.

## 2. Site map

| Section | Free or paid | Notes |
|---|---|---|
| Home, `/llms.txt`, `/sitemap.xml` (191 URLs), `/api/search?q=` | free | Every page has a `.md` twin |
| `/skills` + 25 `/skills-<name>` pages | free | Install with `npx skills@latest add mattpocock/skills`. Pages are v1.2. No pages yet for `retro`, `pr` or `implement-spec`. |
| About 77 articles (2024-11 to 2026-09) | free | The agentic-coding ones are in §3 |
| AI Coding Dictionary (71 entries) | free | Entry pages returned 404 in the fetch tool (UNVERIFIED) |
| Workshops: AI Coding Crash Course (~60 lessons), AI SDK v6 ($149) | paid | Not needed; the free material is enough |
| Cohorts (AI Coding for Real Engineers, 2 weeks) | paid | |
| Newsletter, RSS | UNVERIFIED | Returned 404 in the fetch tool |

## 3. Articles on agentic coding (all free)

| Date | Article (aihero.dev/…) | Advice you can act on |
|---|---|---|
| 2026-03-16 | my-7-phases-of-ai-development | Idea (grill) → research → prototype → PRD → tickets → execution → QA |
| 2026-03-16 | 5-agent-skills-i-use-every-day | grill-me → to-spec → to-tickets → tdd → improve-codebase-architecture weekly, because a messy codebase makes agents produce bad code |
| 2026-03-11 | ways-ai-coding-has-rewired-my-brain | Test at module boundaries. Use pre-commit, CI and type checks as friction. Try several UIs on a throwaway route. Avoid running agents in parallel. |
| 2026-03-23 | my-grill-me-skill-has-gone-viral | Grill one branch of the design tree at a time, each question with a recommended answer. A typical session is about 45 minutes. |
| 2026-05-25 | things-people-get-wrong-with-grill-me-and-grill-with-docs | Keep the scope small. Steer the conversation yourself. Use a frontier model for grilling. If a question can't be settled by talking: grill → prototype → grill again. Write decisions to a doc before `/clear`. |
| 2026-05-05 | grill-with-docs | Grow the glossary word by word. ADRs only for decisions that are hard to reverse, real trade-offs, or confusing without context. Usually 0–2 per session. |
| 2026-05-05 | burn-through-your-backlog-with-my-triage-skill | Issues pass through 5 states. Reproduce before `ready-for-agent`. Briefs describe behaviour, not line numbers. Propose, then wait for a yes. |
| 2026-01-22 | tracer-bullets | Build a thin vertical slice through every layer and test it before adding auth or logging. Start a new context between slices. |
| 2026-02-26 | how-to-make-codebases-ai-agents-love | Deep modules with small interfaces. You own the boundaries ("grey box"); the agent works inside them. |
| 2026-01-18 | a-complete-guide-to-agents-md | Keep AGENTS.md as small as possible. Use progressive disclosure. Don't list file paths that change. Remove contradictions. |
| 2026-02-24 | never-run-claude-init | `/init` output bloats and goes stale; the file system is the documentation |
| 2026-01-13 | my-agents-md-file-for-building-plans-you-actually-read | Two rules: plans must be very short, and end with a list of open questions |
| 2026-01-16 | essential-ai-coding-feedback-loops-for-type-script-projects | tsc, Vitest, Husky pre-commit, lint-staged, a dev server the agent can reach, CI |
| 2026-02-25 / 02-10 | hooks to enforce the right CLI / stop dangerous git | A PreToolUse hook with exit 2 blocks reliably; instructions only make things less likely. His git hook blocks every `git push`, which conflicts with `/ship`. |
| 2026-01-08 / 01-22 | Ralph articles | AFK loops need a Docker sandbox plus feedback loops; restart the context each loop |
| 2026-07-07 | how-to-kill-the-bloat-in-claude-codes-system-prompt | Measure with `/context` first. The flag names he gives are UNVERIFIED against the official docs. |
| 2025-10-28 | creating-the-perfect-claude-code-status-line | Show branch, changes and context % so you know when to start fresh |
| 2025-11-17 | personal-software-is-insane-in-the-age-of-ai | Let AI do repetitive work, but do the thinking yourself |
| 2026-09-17 | Pragmatic Engineer interview (external, T2) | Split context to stay in the smart zone. "Tracer bullets" works as a leading word. Beginners still need fundamentals. |

## 4. Every skill on main (2026-10-02): verdict for you

**Engineering**

| Skill | Verdict | When and how it fits the vault |
|---|---|---|
| grill-with-docs | USE DAILY | For P4/P7 and unclear features, after `new-request`. ADRs go to `docs/decisions/`. No patient data in the glossary. |
| domain-modeling | USE DAILY (via grill-with-docs) | After the update it will create GLOSSARY.md on its own |
| grilling | USE DAILY (dependency) | Every question comes with a recommended answer. Don't answer "ตามแนะนำ" to a whole round (see §7). |
| tdd | USE DAILY | Inside `/ship` step 2. Seams come from the acceptance criteria (override in the template). |
| diagnosing-bugs | USE DAILY (bug days) | For P2, stop after phase 2 and draft a ticket. For P1, use it inside `/ship`. |
| wizard | USE SOMETIMES | Setting up `.env`, secrets or a database: you type keys hidden and they never enter chat (fixes pitfall #5). It's bash, so it needs Git Bash (UNVERIFIED on this machine). |
| prototype | USE SOMETIMES | Whenever UI design keeps looping (the login page was redesigned 6 times). Synthetic data or a local DB only. |
| improve-codebase-architecture | USE SOMETIMES | Monthly per repo, read-only. Findings become P6 in BACKLOG. |
| codebase-design | USE SOMETIMES | Together with tdd or grill, not on its own |
| code-review | USE SOMETIMES | `/ship` uses `reviewer`. Use this one for large diffs, in a new session. |
| to-spec, to-tickets | USE SOMETIMES | Only for work spanning more than one session. Draft first, publish after a yes. |
| triage | USE SOMETIMES | Weekly sweep of `needs-triage` issues. Live messages go to `new-request`. |
| setup-matt-pocock-skills | USE SOMETIMES | Once per repo, using `setup/matt-pocock-setup-answers.md` |
| ask-matt | SKIP | Use `00-start-here.md` |
| wayfinder | SKIP | Revisit for a system too big for one spec |
| implement | SKIP | `/ship` covers it |
| implement-spec (new) | SKIP | No cap on parallel agents, no `D:\wt` rule. Revisit at 4+ independent tickets. |
| retro (new) | SKIP | Reads raw logs (secrets and patient-data risk). Use the vault's `/retro`. |
| pr (new) | SKIP | Already merged into `/ship` step 5 (Merge danger) |
| research | SKIP | Doesn't enforce dates, tiers or UNVERIFIED. Use the `researcher` sub-agent. |

**Productivity**

| Skill | Verdict | When |
|---|---|---|
| wait-what | USE DAILY | When you're confused. Ask it to reply in Thai (UNVERIFIED whether the skill keeps the language). |
| grill-me | USE SOMETIMES | Topics outside a repo |
| to-questionnaire | USE SOMETIMES | Questions only a department, IT or the DPO can answer. You send it yourself (hard stop 8). |
| writing-for-agents | USE SOMETIMES | When editing skills, core.md or AGENTS.md |
| teach | USE SOMETIMES | Learning the basics, outside hospital repos |
| handoff | SKIP | Use `handoff-pack` |

**In-progress and misc:** `setup-pre-commit` is USE SOMETIMES (typecheck and lint-staged only, never E2E). Skip these:
- `claude-handoff`
- `loop-me`
- `setup-ts-deep-modules` (adds a dependency)
- `writing-*`
- `git-guardrails-claude-code` (conflicts with `/ship`; guard.mjs already covers it)
- `migrate-to-shoehorn`
- `scaffold-exercises`

`resolving-merge-conflicts` was deleted upstream in 1.3 but is still installed here. Totals: engineering 20, productivity 7, in-progress 6, misc 4, so 37.

## 5. Matt's workflow (`ask-matt`, main)

1. setup-matt-pocock-skills
2. grill-with-docs
3. prototype if a question can't be settled by talking, then back to grill
4. to-spec
5. to-tickets
6. implement or implement-spec, with tdd inside
7. code-review
8. pr
9. retro

Other entry points: triage, diagnosing-bugs, wayfinder.

At each phase boundary, try these in order: continue → `/clear` → handoff → sub-agent → `/compact`.

## 6. One daily workflow for you (Matt's skills + vault, no duplication)

1. Start the session as `core.md` says: `STATE.md`, `git status`, and check context %.
2. Any new message → `/new-request`.
3. P2 bug → `diagnosing-bugs` phases 1–2 only, then draft a ticket and wait for approval.
4. P7 new system → `/choose-stack`, then `/grill-with-docs`.
5. P4 or an unclear feature → `/grill-with-docs` until done. If it can't be settled: `/prototype` (synthetic data) or `/to-questionnaire` (ask the owner). Past ~100 questions, the scope is too big; split it.
6. Output: a ticket with acceptance criteria (draft → yes → create the issue). For work spanning several sessions: `/to-spec` → `/to-tickets`.
7. Once decisions are in files, `/clear` is safe.
8. `/ship #N`.
9. You merge.
10. End of day: `/handoff-pack`. Weekly: `/retro`. Monthly per repo: `/improve-codebase-architecture`.
11. When confused: `/wait-what`. For secrets or provisioning: `/wizard`.

**When two overlap:**

| Use this | Not this | Notes |
|---|---|---|
| handoff-pack | handoff | |
| vault `/retro` | Matt's retro | |
| `/ship` step 5 | pr | |
| `/ship` | implement, implement-spec | |
| `reviewer` inside `/ship` | code-review | Use code-review for large diffs in a new session |
| `researcher` | research | |
| new-request | triage | new-request for live messages, triage for the issue queue |
| grill-with-docs in a repo | grill-me | grill-me is for topics outside a repo |
| guard.mjs | git-guardrails | |

## 7. Ideas that change how you prompt and plan

| Idea | What to change | Source (T2) |
|---|---|---|
| Smart zone / dumb zone | Split work into phases and decide at each boundary: continue → clear → handoff → sub-agent → compact. A local `PHASE-BOUNDARIES.md` says about 150k tokens is still fine. | aihero search "smart zone"; why-the-anthropic-ralph-plugin-sucks (2026-01-22) |
| Tracer bullets | Ask for a thin, fully working path first. Each ticket should say what can be demoed when it's done. | tracer-bullets (2026-01-22) |
| Leading words | Short terms the model knows ("tracer bullet", "deep module") instead of long explanations | skills-writing-for-agents; Pragmatic Engineer |
| Deep modules + grey box | You design the interface (route or service); the agent fills it in; test at the boundary | how-to-make-codebases-ai-agents-love (2026-02-26) |
| Ubiquitous language | GLOSSARY.md maps Thai hospital term → English identifier → meaning, with no patient data | grill-with-docs; repo README |
| Grill in rounds with recommended answers | Answer one round at a time. Over ~200 questions means the scope is too big. | skills-grill-me; 2026-05-25 |
| Every decision becomes code or a doc | Never `/clear` before writing the spec, ADR, glossary or STATE | 2026-05-25; skills-handoff |
| Feedback loops before AFK | Types, tests and pre-commit keep the agent in check | essential-ai-coding-feedback-loops; Ralph tips |
| Short plans plus open questions | Add as a plan rule | my-agents-md-file… (2026-01-13) |
| Small AGENTS.md; hard rules as hooks | Remove anything the agent can discover itself | a-complete-guide-to-agents-md; hooks article |
| Don't delegate your thinking | You decide interfaces and trade-offs | personal-software-is-insane… |

Contradictions and open questions:

- Matt says not to run agents in parallel (2026-03) but allows two parallel grilling sessions (2026-05). For you: parallel only for planning sessions, at most 2.
- `git-guardrails` blocks every push, which conflicts with `/ship`.
- UNVERIFIED: the system-prompt flag names, the 4 changelog posts, the dictionary pages, newsletter/RSS, and the course syllabus.

**Risks you didn't ask about**

- Answering "ตามแนะนำ" to a whole grill round approves about 40 decisions unread, including one-way ones (schema, auth, naming, patient data).
- Matt's material assumes bash, TypeScript and some background. You're on Windows with Vue, Express and JS/TS, so check Git Bash before relying on `wizard`.
- Stars measure adoption, not fit. Every skill should still pass `setup/skill-intake.md`.

## 8. Top 10 changes for the vault

1. **`00-start-here.md`:**
   - add the daily flow (§6) and the "when two overlap" table;
   - point the `/research` row to the `researcher` sub-agent;
   - add rows for `/wait-what`, `/prototype`, `/to-questionnaire`, `/wizard`.
2. **`skills/handoff-pack/SKILL.md`:**
   - add a phase-boundary check: continue → `/clear` → handoff-pack → sub-agent → `/compact`;
   - `/clear` only once decisions are in files.
3. **`me/pitfalls.md` #5:** use `/wizard` for entering secrets (test on Windows first).
4. **`skills/new-request/SKILL.md`:** add routes for unclear UI (→ `prototype`), owner questions (→ `to-questionnaire`), P7 (→ `choose-stack` before grill), and grill past ~100 questions (→ split scope).
5. **Status line showing context %:** use the built-in `/statusline` (T1: code.claude.com/docs/en/statusline). Needs approval.
6. **`setup/skills-cleanup-proposal.md`:** add the SKIP list and turn those skills off reversibly (`skillOverrides`), measuring with `/context`. Needs approval.
7. **`templates/project/AGENTS.md`, three lines:**
   - short plans ending with open questions;
   - the GLOSSARY format;
   - "ตามแนะนำ" is fine only for reversible items; one-way items wait.
8. **`stacks/hospital-web.md`:** add a section on code structure agents work well with: deep module per feature, tests at the boundary, fast feedback loops, and no E2E in pre-commit.
9. **`playbook/lifecycle.md`:** add a monthly `/improve-codebase-architecture` per repo, read-only, with findings as P6 in BACKLOG.
10. **`playbook/out-of-scope.md` (new):** record deliberately rejected items (Ralph on hospital repos, implement-spec, wayfinder, claude-handoff, the paid course) with conditions for revisiting.

## Sources
- https://www.aihero.dev/ , /sitemap.xml , /llms.txt , /skills and the article URLs in §3 (accessed 2026-10-02)
- https://raw.githubusercontent.com/mattpocock/skills/main/README.md , /CHANGELOG.md , /skills/engineering/ask-matt/SKILL.md
- https://api.github.com/repos/mattpocock/skills , https://api.github.com/repos/mattpocock/skills/git/trees/main?recursive=1
- https://code.claude.com/docs/en/statusline
- https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock (2026-09-17)
