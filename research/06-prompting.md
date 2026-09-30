# 06 - Prompting AI Coding Agents (research)

Date: 2026-09-30. Audience: Thai solo developer (hospital internal web systems) using Claude Code and Codex, mostly in Thai, with long / mixed / scope-expanding requests.
Tiers: **T1** = vendor official docs or primary paper; **T2** = respected practitioner / engineering blog; **T3** = secondary or community.
Source IDs like [A1] point to the tables in section 8. Quotes are kept under 15 words; everything else is paraphrase.
Confidence flag: **UNVERIFIED** = read only through a summarizing fetch, a secondary page, or a claim I could not cross-check. Treat those as leads, not facts.

---

## 1. Executive summary

1. **Vendors converged on the same core advice in 2026**: describe the outcome and the check, not the steps; give reasons; state scope explicitly; keep prompts lean. Anthropic [A1][A2][A3], OpenAI [O1][O2][O4] and Google [G1][G2] all say this in current guides.
2. **Verification is the highest-leverage element.** Anthropic's Claude Code guide opens with "give Claude a way to verify its work" [A2]. A test, build, or screenshot compare turns a session you must watch into one you can leave.
3. **Under-specification is the measured failure mode, not weak wording.** In one 2026 benchmark, 55.8-67.8% of agent runs on vague DevOps instructions crossed at least one boundary [P4]. Real users write casual, problem-only prompts (88% of real prompts vs 7% of benchmark items), costing about 6.4 points of resolution rate [P6]. Stating desired behavior and motivation helped most; reproduction steps and environment info helped little [P6].
4. **Shouting is obsolete.** Current models follow instructions precisely enough that ALL CAPS and blanket ALWAYS/NEVER over-trigger. OpenAI says to drop them [O1]. Anthropic says to use emphasis on one stubborn line only [A2] and to give the reason instead of a bare prohibition [A1].
5. **The new risk is over-eagerness, and each model family has its own dial.** Opus 5 and Sonnet 5.5 add unrequested tests, docs, and extra verification; Opus 5 over-verifies if told to verify; subagent spawning is over-used [A1][A4][A6]. Each guide ships a short scope-limiting paragraph you can paste.
6. **Effort is the main cost/speed knob and it changes behavior.** Low effort on Sonnet 5.5 may skip verification and check in more; xhigh/max may start self-review rounds. Anthropic reports about one third lower session cost on one coding test by telling the model not to launch reviewer sub-agents unprompted [A4].
7. **Context is the scarce resource.** Clear between unrelated tasks; after two failed corrections, restart with a better prompt [A2]. Rules files are not free: one study found repo context files did not generally raise success and added over 20% cost, but they help for non-standard practices [P1].
8. **Clarifying questions are double-edged.** Real sessions rarely include them (about 1.4% of turns, per a search-result summary of [P5], UNVERIFIED on the abstract), and structured clarification improves under-specified tasks [P2]. But clarification mode raised prompt-injection success sharply in one study (for example 1.8% to 34.0%) [P8], so ask questions against your own trusted context, not while ingesting untrusted content.
9. **Thai**: no rigorous Thai-specific coding-agent evaluation was found (**evidence gap**). Indirect evidence: agent tasks degrade roughly with the share of non-English input [P9], Chinese-prompted vibe coding was generally less successful than English [P10], Thai costs more tokens. Practical rule: **rules, skills, templates and structure in English; conversation and intent in Thai; code, paths, errors, identifiers verbatim.**
10. **Independent review beats self-review.** A fresh-context reviewer given the diff and criteria is recommended by Anthropic [A2]; research shows same-model self-verification is weak [P7][P11] and structured disagreement helps [P12]. Tell the reviewer to flag only correctness/requirement gaps, or it manufactures findings [A2].

---

## 2. Principles, ranked by impact

Ranking is my synthesis; each row lists the evidence and how it applies to a solo hospital-systems developer.

| # | Principle | Why (evidence) | Practical effect for you |
|---|---|---|---|
| 1 | **Attach a runnable check and a definition of done** | Claude Code guide: verification is the top tip, evidence beats assertion [A2]. Codex guide: goal / context / constraints / done-when [O4]. Claude Code's creator reportedly estimates 2-3x quality from a feedback loop [S1] (**UNVERIFIED**, secondary compilation). | End every request with "done when: `<command>` passes and you show the output". If no check exists, ask the agent to write one first (red/green TDD [S2]). |
| 2 | **State outcome, scope boundary, and the reason** | Context/motivation lets the model generalize [A1]; Fable 5 guide: give the reason, not only the request [A5]. OpenAI 5.5: outcome-first, drop process scaffolding [O1]. RealSWE: behavior + motivation raised success [P6]. | Say what the hospital-system user should experience, then "only touch X; anything else goes in Suggestions". |
| 3 | **Resolve ambiguity up front, but bounded** | Vague instructions gave 55.8-67.8% boundary-violating runs [P4]. A scaffold that separates "detect underspecification" from "execute" closed the gap to fully specified tasks [P2]. Claude Code: have Claude interview you, write SPEC.md, execute in a fresh session [A2]. | For requests over ~5 lines or with unclear targets: "ask at most N questions, then wait". For small clear tasks: just act. |
| 4 | **One task, one session; keep context clean** | Performance degrades as context fills; `/clear` between tasks; restart after 2 failed corrections [A2]. Aim for the smallest set of high-signal tokens [A3]. | Split mixed messages first (template T0). Never keep a polluted session hoping it recovers. |
| 5 | **Pick model + effort per task; do not prompt "think harder"** | Effort is the primary quality/latency/cost control [A7][A4]. Asking the model to think less in the prompt does not reliably work [A4]. Codex: medium for interactive, high/xhigh for long hard work [O5]. | See section 5. Set once at session start (cache reasons in 5.1). |
| 6 | **Add a short anti-over-engineering paragraph** | Multiple vendor snippets: no extra features, refactors, abstractions, unrequested tests [A1][A4][A5][A9][O2]. | Keep one reusable scope-guard block (in master template). |
| 7 | **Use independent review, not "double-check yourself"** | Opus 5 guide: remove explicit verify/double-check instructions, they over-verify [A6]. Claude Code recommends a fresh subagent reviewer for diffs [A2]. Papers: same-context self-review unreliable [P7][P11]; structured disagreement helps [P12]. | Self-verification = run the check (cheap). Review = separate session/subagent with diff + criteria only. |
| 8 | **Calm, literal, positive phrasing; no ALL CAPS** | OpenAI: remove excessive ALWAYS/NEVER [O1]. Google: direct, avoid persuasive language [G1][G2]. Anthropic: reason > bare rule; emphasis on one line only [A1][A2]. | Say what to do and why. One "IMPORTANT" on the one line that keeps being skipped. |
| 9 | **Keep persistent rules short, non-obvious, and tested** | Context files did not generally help and cost 20%+ more; useful for non-standard practices, not repo overviews [P1]. Prune CLAUDE.md; if a rule is skipped the file is too long [A2]. | Put in only what the agent cannot infer: commands, hospital-specific constraints, DB rules. |
| 10 | **Delegate with a full brief** | Each subagent needs objective, output format, tool/source guidance, boundaries; vague briefs cause duplicate work [A8]. Opus 5 delegates eagerly; cap it [A6]. | Use template T8; do not delegate what a few tool calls can do. |
| 11 | **Specify the report format** | Lead with outcome; write for a reader who did not watch [A5][A6]. Fable 5: audit each progress claim against a tool result [A5]. GPT-5.2: bounded response shapes [O2]. | Use the fixed report block in the master template. |
| 12 | **Ask for freshness and citations explicitly** | Sonnet 5.5 sometimes answers from memory when search would catch changes [A4]. OpenAI: retrieval budget and stop rule [O1]. | Use template T6. |

### 2.1 What changed versus older advice

| Older advice (2023-2025) | Current guidance (2026) | Source |
|---|---|---|
| CRITICAL / MUST / NEVER in caps to force compliance | Calm literal instructions; strong language over-triggers; drop blanket rules | [A1][A2][O1] |
| "Think step by step" / "double-check your work" | Adaptive thinking + effort; explicit re-check instructions add cost with no gain on Opus 5 | [A4][A6] |
| Be aggressively thorough, "use tools if in doubt" | Tools trigger appropriately now; remove anti-laziness prompting | [A1] |
| Long prescriptive step lists | Outcome + constraints + available evidence; start from the smallest prompt | [O1][A5][A3] |
| Big rules files and repo overviews | Only non-obvious instructions; verify by measurement | [P1][A2] |
| Prefilled responses, manual `budget_tokens` | Removed on newer models; use effort with adaptive thinking | [A1][A7] |
| "Can you suggest changes?" | Model may only suggest; use imperative "change X" for edits and "plan only, do not edit" when you want no edits | [A1][A4] |
| More agents = better | Multi-agent about 15x chat tokens; most coding is less parallelizable than research | [A8] |
| Stuff all context in | Long context degrades; clear, compact, subagent for investigation | [A2][A3] |

### 2.2 Model-family notes (as of 2026-09-30)

- **Anthropic.** Current docs list Fable 5.1, Mythos 5.1, Opus 5.5, Sonnet 5.5, Haiku 4.5 among others [A1]. Sonnet 5.5: start agentic coding at medium for well-specified tasks, high for harder; low may skip verification; at low/medium it may stop to check in; at xhigh/max it may add review rounds [A4]. Opus 5: verifies unprompted, may expand scope, delegates readily, verbose by default (effort does not shorten visible text) [A6]. Fable 5.x: strong instruction following; may end a turn with a promise instead of doing the work, or ask permission for already-requested steps; Anthropic supplies an anti-stall block [A5][A9].
- **OpenAI.** GPT-5.5 guide: treat as a new model, start from the smallest prompt, default effort medium, verbosity medium [O1]. GPT-5.2 guide: cap length, forbid feature creep, present 2-3 interpretations for ambiguity [O2]. Codex guide (gpt-5.3-codex): medium effort for interactive work; drop requests for upfront plans or status preambles because they cause premature stopping [O5]. A "GPT-6" guide page exists (Astra, 6.1 Sol, Luna): lean prompts, more clarification-seeking, "bias toward action" [O3] (**UNVERIFIED**: read only through a summarizer; the claimed 10-15% score gain with 41-66% fewer tokens must be checked on the page before relying on it).
- **Google Gemini 3.** Direct and precise, avoid persuasion, consistent XML or Markdown delimiters, big context first and question last, keep temperature at default, ask explicitly for verbosity or persona [G1][G2].

---

## 3. Master prompt template for coding tasks (annotated)

Use for any non-trivial change. Delete blocks that do not apply; a shorter prompt that keeps GOAL, SCOPE and DONE WHEN beats a long one that omits them. Keep the English labels; put your Thai content inside (see section 6).

```text
<task>
GOAL (outcome, not steps):
  <One or two sentences: what the user of the system can do/see afterwards.>
  (Thai is fine here.)

WHY (reason / who it is for):
  <Business or clinical-workflow reason. Lets the agent make the right judgment calls.>

CONTEXT (point, don't paste):
  - Start from: @path/to/file, and follow the existing pattern in @path/to/similar_file
  - Symptom / current behavior: <exact error text, screenshot, URL>
  - Facts the code will not tell you: <DB, auth, deployment, hospital-specific rules>
  - Data safety: use only synthetic/test data; never read or print real patient data.

SCOPE:
  IN:  <files / modules / behaviors>
  OUT: everything else. If you notice something else worth doing, do not do it;
       list it under "Suggestions" in your report.

CONSTRAINTS:
  - <e.g. no new dependencies; keep current framework; keep DB schema unchanged>
  - Reversible local actions are fine. Ask first before: deleting data, dropping tables,
    force-pushing, changing shared infrastructure, running migrations on non-dev data.

DONE WHEN (verifiable):
  1. <command> passes (e.g. npm test -- <pattern>, npm run build, npm run lint).
  2. <specific behavior demonstrated, e.g. "empty form shows the Thai validation message">.
  3. Show the actual command output as evidence in your report.
  If no check exercises this, write the smallest one first (see it fail, then pass).

WORKING STYLE:
  - Ambiguity: make routine judgment calls yourself and state them as assumptions.
    Ask me only if different readings would lead to materially different work.
  - If my request seems mistaken or a better approach exists, say so in a sentence,
    then continue with the task as asked.
  - Keep changes minimal: no refactors, abstractions, extra configurability, or new
    tests beyond what the behaviors above require.
  - Remove any temporary files you create.

REPORT FORMAT (reply in Thai; keep code, paths, identifiers, error text in original):
  1. Outcome in one sentence (done / partly done / blocked).
  2. What changed (files, one line each).
  3. Evidence: commands run and results (say explicitly if something was NOT verified).
  4. Assumptions you made.
  5. Suggestions / found-but-not-touched (bullets, not done).
</task>
```

### Annotations

| Block | Reason | Source |
|---|---|---|
| GOAL as outcome | Current models do better with a destination than a route | [O1][A5] |
| WHY | Lets the model connect the task to relevant knowledge; stating motivation measurably helped | [A1][A5][P6] |
| CONTEXT via `@file` pointers | Claude Code reads referenced files itself; pointing at an example pattern beats describing it | [A2] |
| Symptom + exact error | Symptom + likely location + what "fixed" looks like is Anthropic's bug framing | [A2] |
| Data safety line | Author judgment for a hospital setting, not a research finding | (none) |
| SCOPE IN/OUT + Suggestions | Turns drive-by fixes into end-of-report suggestions | [A5][A4] |
| "Ask first" list | Reversibility guidance; without it agents may take hard-to-reverse actions | [A1] |
| DONE WHEN + evidence | Verification loop; evidence beats assertion | [A2][A5] |
| Failing check first | Red/green TDD: highest-leverage short instruction per Willison | [S2] |
| Ambiguity policy | Routine calls yourself, ask only when readings diverge; keep the "materially different" clause or the agent may stop asking when it should | [A6][A5] |
| "Say so, then continue as asked" | Keeps pushback without derailing | [A6] |
| Minimal changes | Overengineering guard | [A1][A5] |
| Report format | Outcome first; audit claims against tool results | [A5][O2] |

**Model and effort are not in the prompt.** Set them in the tool (`/model`, `/effort` in Claude Code; reasoning effort in Codex). Do not write "think very hard" [A4].

---

## 4. Templates

Fill in the `<...>` parts. Keep the Thai/English mix; only the labels are English.

### T0. Triage a long, mixed, scope-expanding message (use FIRST)

This is my synthesis of Anthropic's scope, ideas-vs-action, and interview guidance [A2][A4][A5]; it is not a published template.

```text
Below is a long message from me with several requests, ideas, and complaints mixed together.
Do NOT start implementing.

1. Split it into four lists:
   A. Concrete tasks (each: one-line goal + a possible check).
   B. Questions I asked (answer them; do not change code).
   C. Ideas / "maybe later" (record only; do not do).
   D. Constraints and preferences I stated.
2. Mark dependencies and suggest an order. Mark which tasks fit one session and which need a plan first.
3. Ask me at most 5 questions, only where different answers lead to materially different work.
   Put them last. If none are needed, say so.
4. Save the result to TASKS.md and stop. I will choose which item to run next.

<paste my Thai message here>
```

Follow-up: start a **fresh session per task**, pointing at `TASKS.md` item N [A2].

### T1. New project kickoff

```text
I want to build <brief description> for <who: e.g. ward nurses / billing staff> to <outcome>.
Interview me in detail with your question tool, one topic at a time. Cover: users and workflows,
data model, roles/permissions, integration with existing hospital systems, audit/logging,
failure and edge cases, performance, deployment, and what is OUT of scope.
Skip obvious questions; dig into hard parts I may not have considered.
Stop after at most <10> questions, then write SPEC.md with:
  - Objective and non-goals
  - Tech stack and commands (build, test, lint, run)
  - Project structure
  - Boundaries in three tiers: Always / Ask first / Never
  - Milestones, each with a verifiable "done when"
  - Open questions and assumptions
Write no application code in this session.
```

Basis: Claude Code interview pattern [A2]; Osmani's six spec areas and three-tier boundaries [S3]. Then execute milestone 1 in a fresh session with the master template. A good spec names files/interfaces, states out-of-scope, and ends with an end-to-end check [A2]. A structured spec preamble reduced defects in all five models in one pre-registered study [P16].

### T2. Bug report

```text
BUG (Thai ok):
  Symptom: <what the user sees; exact error text / screenshot>
  Where: <URL, screen, file or module if known>
  Steps to reproduce: <numbered, or "unknown">
  Expected vs actual: <one line each>
  Since when / what changed: <deploy, commit, data change, or unknown>
  Impact: <who is blocked, how often>

TASK: find the root cause, fix it, verify it.
1) Write a failing test or reproducible script that shows the bug.
2) Fix the cause, not the symptom (do not suppress errors or special-case test inputs).
3) Run the check and show output. 4) Run nearby existing tests for regressions.
SCOPE: only the fix. Report other bugs you see; do not fix them.
If you cannot reproduce it, say what you tried and what you need; do not guess a fix.
```

Basis: symptom + location + failing test first [A2]; root-cause and no-hard-coding guidance [A1]; unrequested-fix suppression [A5].

### T3. Feature request

```text
FEATURE: <name>
User story: As <role>, I need <capability> so that <benefit>. (Thai ok)
Acceptance criteria (each checkable):
  1. <given / when / then>
  2. <...>
Follow the existing pattern in @<similar feature file>. No new libraries unless unavoidable (ask first).
Out of scope: <list>. Nice-to-haves go in "Suggestions", not in the diff.
If the change touches more than 3 files or the approach is unclear: first give me a short plan
(files, approach, risks, how you will test) and wait for my "go". Otherwise implement directly.
Done when: criteria are covered by tests or a demonstrated run; build/lint/test pass; show output.
```

Basis: plan only when uncertain or multi-file; skip if you could describe the diff in one sentence [A2]; reference an existing pattern [A2]; scope guard [A4].

### T4. Feedback on the agent's output

```text
Feedback on your last result:
  Keep: <what is right>
  Wrong: <what is wrong, with evidence: error text / screenshot / test output>
  Why I expected otherwise: <expectation and reason>
Fix only that; touch nothing I did not mention.
Then re-run <check> and show the output.
```

Rules: correct early [A2]. **After two corrections of the same issue, stop**: `/clear`, restate the goal with what you learned, start over [A2]. When you want understanding only, say "explain only, do not edit"; a described problem should get an assessment, not a fix [A5].

### T5. Full-system audit (read-only)

```text
AUDIT (read-only: do not modify, delete, or format any file; do not run migrations).
System: <name, stack>. Focus: <security | data integrity | performance | maintainability | all>.
A finding counts if it affects correctness, security, patient-data protection, availability,
or a stated requirement. Report EVERYTHING that meets this bar; do not pre-filter by severity
(I will filter afterwards). Do not report style preferences.
Method: read code and config; run only existing read-only commands (tests, linters, dependency audit).
Cite file:line for every finding. Do not claim anything about a file you did not open.
Output table: ID | area | finding | evidence (file:line) | severity (H/M/L) | confidence | suggested fix (one line, not applied).
End with: what you did NOT check, and the 5 highest-value fixes in order.
```

Basis: report everything, filter in a separate pass, because severity-only prompts make Opus 5 under-report [A6]; read-before-claiming grounding [A1]; report gaps not style [A2]. For a large repo, use one subagent per module, each returning a summary [A2][A8].

### T6. Research with sources and freshness

```text
RESEARCH QUESTION: <question>. Today's date: <YYYY-MM-DD>. Decision it feeds: <what I will decide>.
Success = an answer I can act on, backed by primary sources.
Rules:
  - Use search/fetch for anything that may have changed since your training (versions, prices,
    limits, policies, APIs), even if you feel sure.
  - Prefer primary sources: official docs, vendor engineering blogs, papers, standards.
    Tier every source: T1 primary / T2 respected practitioner / T3 other.
  - For each claim give URL, author or org, and publication/last-updated date. Never invent a URL.
    If you cannot open a source, mark the claim UNVERIFIED.
  - Quote under 15 words; otherwise paraphrase.
  - Keep competing hypotheses and a confidence level (high/med/low); say where sources disagree.
  - Stop when more searching would not change the conclusion; state why you stopped.
Output: 1) answer in <=10 lines, 2) evidence table (claim | source | date | tier),
3) what remains unknown, 4) what would change your mind.
```

Basis: Anthropic research guidance (success criteria, multi-source verification, competing hypotheses, confidence tracking, notes file) [A1]; freshness snippet [A4]; OpenAI retrieval budget, stop rules, citations [O1][O2].

### T7. Critique / pushback (disagree with me, red-team, pre-mortem)

```text
Act as a skeptical senior reviewer. My plan / design / decision: <paste or @file>.
Do not be agreeable.
1. Restate the plan in two sentences so I can confirm you understood it.
2. Steel-man the strongest alternative I did not choose.
3. Pre-mortem: assume this failed badly in 6 months (or in production at the hospital).
   List the 5 most likely causes, ranked by likelihood x impact, each with its earliest warning sign.
4. Red-team: list the assumptions I rely on that could be false, and a cheap test for each.
5. Verdict: proceed / proceed with changes / stop, plus the single change that most reduces risk.
Ground every point in the files or sources I gave you, cited. If my premise is wrong, say so directly
and explain why; do not soften it. Do not edit any files.
```

Notes: Opus 5's default is to say so in a sentence and continue [A6]; use this template when the disagreement itself is the deliverable. Research shows models can detect a false premise and still agree (open-weight models only, so **applicability to frontier agents is UNVERIFIED**) [P13]; ask for a verdict with evidence rather than "is this OK?". A reviewer told to find gaps needs a bar ("only gaps affecting correctness or stated requirements") [A2].

### T8. Delegation to a sub-agent

```text
OBJECTIVE: <one sentence: the question to answer or unit to produce>.
WHY IT MATTERS: <how the result will be used; what decision depends on it>.
INPUTS: start at <paths / URLs / prior findings>. Do not re-derive: <facts already established>.
BOUNDARIES: read-only | may edit only <paths>. Do not touch <paths>. No new dependencies.
No subagents of your own. Budget: <e.g. about 15 tool calls>.
METHOD HINTS: <preferred tools, e.g. rg for search, run test file X>.
OUTPUT (return only this, <=300 words):
  1. Result in 3 lines. 2. Evidence: file:line or command + result.
  3. What you did not check. 4. Follow-ups worth doing (not done).
```

Basis: objective, output format, tool/source guidance and boundaries prevent duplicate work [A8]; Opus 5 damping guidance, do not delegate what a few tool calls can finish [A6]; low effort suits simple subagents [A7]; subagents return summaries so main context stays clean [A2].

### T9. Independent review of a finished diff (fresh session or subagent)

```text
You did not write this change. Review the diff of <branch or @files> against <PLAN.md / acceptance criteria>.
Check: every requirement is implemented, listed edge cases have tests, nothing outside scope changed,
tests actually exercise the change. Run the named checks yourself.
Report gaps that affect correctness or stated requirements only; label anything else "optional".
Table: finding | evidence | requirement violated | confidence.
```

Basis: Claude Code adversarial-review section, including the warning that a reviewer asked for gaps will find some [A2]; independent, evidence-grounded review and the false-consensus failure mode [P12].

---

## 5. Model and effort selection

Model names come from current vendor docs as fetched 2026-09-30. Check pricing pages for ratios. Every vendor says: **sweep on your own tasks; effort names do not mean the same thing across models** [A4][A7].

| Task | Model tier | Effort | Notes / source |
|---|---|---|---|
| Quick edit, typo, rename, clear small fix | Sonnet-class / Codex medium; skip plan mode | low-medium | If you can describe the diff in one sentence, skip the plan [A2]. Low effort may skip verification, so keep a DONE-WHEN command [A4]. |
| Well-specified feature | Sonnet 5.5 (Opus-class for large multi-file) | medium; high if harder | Anthropic: medium for well-specified agentic coding, high for harder/longer [A4]. |
| Planning, architecture, ambiguous multi-file change | Opus/Fable-class | high; xhigh only with measured gain | Reserve Opus for architectural decisions and multi-step reasoning [A10]. |
| Long autonomous run (30+ min), migration | Opus/Fable-class | xhigh | Anthropic lists xhigh for long-running agentic coding; much higher token use [A7]. Give a stop condition and a check. |
| Hard debugging (cause unknown) | Opus/Fable-class | high | Provide a failing repro first [A2]. |
| Code review / audit | Opus-class, fresh context | low-medium first pass, deeper later | Opus 5 keeps accuracy at lower effort; "fast pass at review time, thorough later" [A6]. Ask to report everything, filter after [A6]. |
| Codebase search, log digging, doc fetching | Haiku-class subagent | low | Delegate verbose ops to subagents; simple subagents can use Haiku [A10][A7]. |
| Research with web | Model with search | medium-high | Low effort makes some models search less [A9]; add "check what may have changed" [A4]. |
| Structured JSON reasoning answers | adaptive thinking | high (or xhigh) | Sonnet 5.5 may skip thinking at low; add "think the problem through" [A4]. |
| Codex interactive coding | Codex-tuned model | medium; high/xhigh for long hard tasks | [O5][O4] |

### 5.1 Efficiency rules (tokens, cost, time)

1. **Effort before prompt hacks.** Lower effort is the supported way to cut thinking; "think less" instructions do not reliably work [A4]. On Opus 5 effort changes thinking volume, not visible response length; ask for brevity in the text [A6].
2. **Set model and effort at session start.** Each model has its own prompt cache; switching models, or on most models effort, forces a full uncached re-read [A11]. On Opus 5.5, Sonnet 5.5 and Fable 5.1 with API key or subscription, effort changes keep the cache [A11]. `opusplan` toggling counts as a model switch [A11].
3. **No heavy scaffolding on small tasks.** Multi-agent used about 15x chat tokens in Anthropic's research system and pays off only for high-value, parallelizable work; most coding tasks are less parallelizable [A8]. Agent teams use about 7x tokens [A10].
4. **Cap subagents** in the prompt or config: Opus 5 spawns readily and Sonnet 5.5 at xhigh/max may launch reviewers; forbidding unrequested reviewer sub-agents cut one coding test's cost by about a third [A4][A6].
5. **Keep context small**: `/clear` between tasks; `/compact <what to keep>` at natural breaks; specific prompts avoid broad scanning; move rare instructions from CLAUDE.md into skills; prefer CLI tools over MCP servers; use hooks to filter huge outputs [A10][A11].
6. **Cache facts to plan around**: main-conversation TTL is one hour on a Claude subscription within plan usage, five minutes on API keys unless set; subagents default to five minutes; editing CLAUDE.md mid-session does not apply until `/clear`, `/compact` or restart [A11]. Consequence: batch related work while the session is warm; after a long break, start fresh from `TASKS.md` or a summary instead of resuming a huge context.
7. **Verbosity**: Opus 5 writes longer documents and narrates more, so add "match document length to what the task needs" [A6]; Fable 5.1 writes fewer progress updates, so ask for them if wanted [A9].
8. **Do not add ritual verification on models that self-verify** (Opus 5), but always supply the check command [A6][A2].

---

## 6. Thai vs English

### 6.1 Evidence found and its limits

| Finding | Source | Tier | Strength for you |
|---|---|---|---|
| Claude reaches about 91-98% of English on translated MMLU for most listed languages (Sonnet 4.5); **Thai is not in the table**; nearest proxies Indonesian 97.3%, Korean 96.7% | [A12] | T1 | Weak: knowledge benchmark, older models, no Thai row. |
| Anthropic advice: state the response language explicitly; use native scripts, not transliteration | [A12] | T1 | Direct and usable. |
| Agent benchmarks degrade outside English (up to 16% on GAIA-style tasks); the SWE-Bench variant stays near baseline; degradation correlates with the share of non-English tokens in the input | [P9] (search-result summary; Thai not confirmed among its 11 languages) | T1 paper, **UNVERIFIED details** | Suggests English-dominant, code-heavy input helps. |
| Chinese prompts for vibe coding generally had lower success than English across tested models; token cost effects were model-dependent | [P10] (preliminary) | T1 paper | Analogous, not Thai. |
| Code generation from Chinese/Hindi/Spanish/Italian vs English prompts: English was not always best; results vary by model and language; comments and strings often mix languages | [P14] | T1 paper | Penalty is model-specific; not Thai. |
| Casual phrasing had small, model-dependent effects; missing information mattered more | [P6] | T1 paper | Say more (behavior, motivation); do not agonize over polish. |
| Non-Latin scripts cost more tokens; a blog quoted about 2.7x input / 2.0x output for Thai on Claude | [X1] (T3, **UNVERIFIED**); peer paper [P15] covers Bengali, Hindi etc., **not Thai** | T3 | Assume Thai costs noticeably more; measure with a token counter. |
| Head-to-head Thai vs English prompts for Claude Code or Codex | none found | n/a | **Evidence gap**; recommendations below are engineering judgment. |

### 6.2 Recommended practice (judgment based on the above)

1. **Persistent instructions in English**: CLAUDE.md / AGENTS.md, skills, this vault's templates, system-prompt snippets, subagent briefs. Cheaper tokens, vendor snippets are tested in English, and rules are read every turn so cost multiplies [A2][A11].
2. **Conversation in Thai is fine** for intent, business rules and feedback. Stating the WHY (motivation) is what measurably helps, in whichever language you express it best [P6].
3. **Keep verbatim, never translate or transliterate**: code, identifiers, paths, error messages, commands, SQL, routes, library names. Use native Thai script for Thai text [A12].
4. **Glossary once**: put ambiguous hospital terms in CLAUDE.md with an English gloss and table name, e.g. `ใบสั่งยา = medication order (table med_orders)`.
5. **Structure in English, content in Thai**: labels like GOAL / SCOPE / DONE WHEN make intent parseable and make long mixed messages easier to triage (T0).
6. **State the reply language and the code-comment/commit language explicitly** (e.g. "Reply in Thai; code, comments and commit messages in English") [A12][P14].
7. **User-facing strings** (UI text, validation messages): specify the exact Thai literals in requirements/tests; do not let the agent invent UI copy; tests assert exact strings.
8. **A/B once per model generation**: rerun the same real task with an English-scaffold prompt vs Thai-only and keep the winner; results are model-dependent [P10][P14].
9. **Token check**: count a typical Thai prompt with the vendor's token-count tool before deciding translation is worth it; for long reusable text, translate once and store in English.

---

## 7. Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| ALL CAPS, "CRITICAL", blanket ALWAYS/NEVER | Over-triggers; buries real priorities | Calm sentence + reason; emphasis on one line only [A1][A2][O1] |
| Vague verbs: "improve", "clean up", "make it better" | Broad scanning, scope drift, boundary violations [P4] | Name the behavior and the check |
| One message with 8 asks and ideas mixed in | Agent does all; ideas become work; context fills | Triage (T0), one session per task [A2] |
| "Can you suggest...?" when you want edits (or the reverse) | Model does exactly the literal thing | "Change X" vs "plan only, do not edit" [A1][A4] |
| No verification method | You become the test loop | DONE-WHEN command + evidence [A2] |
| Telling Opus 5 to verify/double-check every step | Over-verification, extra tokens | Supply the check command; drop the ritual [A6] |
| Reviewer told "only high-severity" | Literal following, under-reporting | "Report everything, I filter" [A6] |
| Reviewer told "find gaps" with no bar | Manufactures findings, over-engineering | "Only gaps affecting correctness or requirements" [A2] |
| Correcting the same mistake 3+ times in one session | Context polluted with failed attempts | `/clear`, restate with lessons [A2] |
| Huge CLAUDE.md / repo overviews | Rules ignored; cost 20%+ up, no success gain [P1] | Non-obvious rules only; skills for rare workflows [A2] |
| "Investigate X" with no scope | Reads hundreds of files | Scope narrowly or use a subagent [A2] |
| Agents/teams for small tasks | 7-15x tokens [A8][A10] | Work directly; cap delegation [A6] |
| Switching model/effort mid-task | Cache rebuilt, slower and costlier [A11] | Decide at start; per-message effort where supported [A7] |
| Asking the agent to reproduce its reasoning in the answer | Can trigger reasoning-extraction refusals on newer Claude models [A4][A5] | Ask for evidence and assumptions instead |
| Trusting the agent's "done" | Unverified or fabricated progress claims | "Audit each claim against a tool result" [A5]; check yourself |
| Letting the agent ask questions while ingesting untrusted web/repo content | Clarification mode raised injection success in one study [P8] | Do ingestion read-only; clarify separately |
| Real patient data in prompts or fixtures | Privacy/compliance risk (author judgment) | Synthetic data only; state it in CONTEXT |
| Translating identifiers or errors into Thai | Breaks matching and search | Keep verbatim [A12] |

---

## 8. Sources

"current (fetched 2026-09-30)" = living docs page with no fixed date. URLs are exactly those I opened or saw in search results; none invented. (S) = read only through a summarizing fetch.

### 8.1 Anthropic / Claude

| ID | Title | Org / author | Date | Tier | URL | Used for |
|---|---|---|---|---|---|---|
| A1 | Prompting best practices | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices | Clarity, reasons, tool use, overeagerness, hallucination, subagents, research, autonomy |
| A2 | Best practices for Claude Code | Anthropic | current | T1 | https://code.claude.com/docs/en/best-practices | Verify, explore-plan-code, interview, /clear, review subagent, failure patterns |
| A3 | Effective context engineering for AI agents | Anthropic Applied AI team (Rajasekaran, Dixon, Ryan, Hadfield) | 2025-09-29 | T1 | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Altitude, minimal tokens, JIT retrieval, compaction, notes |
| A4 | Prompting Claude Sonnet 5.5 | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5 | Effort, initiative/scope snippets, verification, search freshness |
| A5 | Prompting Claude Fable 5 | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 | Instruction following, boundaries, claim auditing, give the reason |
| A6 | Prompting Claude Opus 5 | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 | Over-verification, scope, subagent control, review severity |
| A7 | Effort | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/effort | Effort levels per model, cache interaction |
| A8 | How we built our multi-agent research system | Anthropic Engineering | 2025-06-13 | T1 | https://www.anthropic.com/engineering/multi-agent-research-system | Delegation brief, effort scaling, 4x / 15x tokens |
| A9 | Prompting Claude Fable 5.1 | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 | Finish-the-task, scope snippets, low-effort search |
| A10 | Manage costs effectively (Claude Code) | Anthropic | current | T1 | https://code.claude.com/docs/en/costs | Model choice, subagents, context, hooks, team cost |
| A11 | How Claude Code uses prompt caching | Anthropic | current | T1 | https://code.claude.com/docs/en/prompt-caching | Cache invalidation, TTL, model/effort switching |
| A12 | Multilingual support | Anthropic | current | T1 | https://platform.claude.com/docs/en/build-with-claude/multilingual-support | Relative language performance (no Thai row), language instruction, native script |

### 8.2 OpenAI

| ID | Title | Org | Date | Tier | URL | Used for |
|---|---|---|---|---|---|---|
| O1 | GPT-5.5 prompt guidance (S) | OpenAI | current; model released 2026-04-23 per a T3 encyclopedia snippet | T1 | https://developers.openai.com/api/docs/guides/prompt-guidance?model=gpt-5.5 | Outcome-first, smallest prompt, drop ALWAYS/NEVER, defaults |
| O2 | GPT-5.2 Prompting Guide (S) | OpenAI Cookbook | undated in fetch | T1 | https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-2_prompting_guide | Verbosity caps, scope drift, ambiguity, citations |
| O3 | Prompt guidance, GPT-6 family page (S) | OpenAI | undated in fetch | T1, **UNVERIFIED details** | https://developers.openai.com/api/docs/guides/prompt-guidance | Lean prompts, clarification-seeking tendency |
| O4 | Codex best practices (redirects to learn.chatgpt.com) (S) | OpenAI | current | T1 | https://learn.chatgpt.com/guides/best-practices | Goal / Context / Constraints / Done-when; AGENTS.md; plan mode |
| O5 | Codex Prompting Guide (S) | OpenAI Cookbook | current (the summarizer gave a wrong year; ignored) | T1 | https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide | Medium effort, less-is-more, autonomy, final message |
| O6 | Prompting (ChatGPT/Codex) (S) | OpenAI | current | T1 | https://learn.chatgpt.com/docs/prompting | Goal / context / output / boundaries |
| O7 | GPT-5.5 prompting guide (commentary) | Simon Willison | 2026-04-25 | T2 | https://simonwillison.net/2026/apr/25/gpt-5-5-prompting-guide/ | Confirms official URL; treat as new family, not drop-in |

### 8.3 Google

| ID | Title | Org / author | Date | Tier | URL | Used for |
|---|---|---|---|---|---|---|
| G1 | Prompt design strategies (S) | Google (ai.google.dev) | current | T1 | https://ai.google.dev/gemini-api/docs/prompting-strategies | Direct/precise, delimiters, context-then-question, temperature, agentic dimensions |
| G2 | Gemini 3 Prompting: Best Practices for General Usage (S) | Philipp Schmid | 2025-11-19 | T2 | https://www.philschmid.de/gemini-3-prompt-practices | Directness over persuasion; changes from 2.5 |

### 8.4 Practitioners

| ID | Title | Author | Date | Tier | URL | Used for |
|---|---|---|---|---|---|---|
| S1 | Boris Cherny tips (secondary compilation) | Compiled from Boris Cherny, Claude Code creator | 2026 (Jan and later) | T3, **UNVERIFIED** (2-3x claim) | https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-boris-13-tips-03-jan-26.md | Verification, plan mode, parallel sessions |
| S2 | Red/green TDD (Agentic Engineering Patterns) (S) | Simon Willison | 2026 (series announced 2026-02-23) | T2 | https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/ | Test-first as a short prompt |
| S3 | How to write a good spec for AI agents (S) | Addy Osmani | 2026-01-13 | T2 | https://addyosmani.com/blog/good-spec/ | Six spec areas, three-tier boundaries, modular prompts |

### 8.5 Papers (arXiv, 2025-2026)

| ID | Title | Authors | Date | Tier | URL | Finding used |
|---|---|---|---|---|---|---|
| P1 | Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? | Gloaguen, Mundler, Muller, Raychev, Vechev | 2026-02-12 (rev. 2026-06-23) | T1 | https://arxiv.org/abs/2602.11988 | No general success gain, 20%+ cost; useful for non-standard practices |
| P2 | Ask or Assume? Uncertainty-Aware Clarification-Seeking in Coding Agents | Edwards, Schuster | 2026-03-27 (rev. 2026-09-07) | T1 | https://arxiv.org/abs/2603.26233 | Decoupled underspecification detection; 69.40% resolve; gap closed |
| P3 | ClarEval: A Benchmark for Evaluating Clarification Skills of Code Agents | Li, Wu, Chang | 2026-02-27 | T1 | https://arxiv.org/abs/2603.00187 | Strong coders often lack clarification skill |
| P4 | Coding Agents Are Guessing: Measuring Action-Boundary Violations in Underspecified DevOps Instructions | Ji et al. | 2026-07-02 | T1 | https://arxiv.org/abs/2607.02294 | 55.8-67.8% boundary-violating runs; blast-radius warnings help little |
| P5 | SWE-chat: Coding Agent Interactions From Real Users in the Wild | Baumann et al. | 2026-04-22 | T1 | https://arxiv.org/abs/2604.20779 | 6,000 sessions; 44% of agent code survives to commits; users push back in about 44% of interactions; rare clarification (about 1.4% of turns, **UNVERIFIED**) |
| P6 | RealSWE: A Compositional Evaluation of Coding Agents under Realistic User Requests | Kim et al. | 2026-08-28 | T1 | https://arxiv.org/abs/2608.27831 | Real prompts casual and problem-only; -6.4 pp; behavior + motivation help most |
| P7 | Self-Authored Verification Is Unreliable in Heuristic Self-Improving Agents | (authors not verified) | 2026 (ID 2607.24300) | T1, **UNVERIFIED** (title/snippet only) | https://arxiv.org/pdf/2607.24300 | Self-authored verification unreliable |
| P8 | ASPI: Seeking Ambiguity Clarification Amplifies Prompt Injection Vulnerability in LLM Agents | Sehwag et al. | 2026-05-17 | T1 | https://arxiv.org/abs/2605.17324 | Injection success e.g. 1.8% to 34.0% (o3) in clarification mode |
| P9 | MAPS: A Multilingual Benchmark for Agent Performance and Security | Hofman et al. | 2025-05-21 (rev. 2026-02-10) | T1 | https://arxiv.org/abs/2505.15935 | Performance and security degrade outside English; Thai not confirmed |
| P10 | Chinese Language Is Not More Efficient Than English in Vibe Coding | Ren et al. | 2026-04-06 | T1 (preliminary) | https://arxiv.org/abs/2604.14210 | Chinese prompts generally lower success; token savings model-dependent |
| P11 | When AI Reviews Its Own Code: Recursive Self-Training Collapse | (not verified) | 2026 (ID 2606.28438) | T1, **UNVERIFIED** (snippet only) | https://arxiv.org/html/2606.28438v1 | Self-review needs exogenous verification |
| P12 | Adversarial Review: Structured Disagreement for Grounded Agentic Code Review | Qiu, Gill | 2026-08-16 (ICML 2026 DL4C workshop) | T1 | https://arxiv.org/abs/2608.18167 | Evidence-grounded disagreement over team size; false-consensus failure |
| P13 | LLMs Know They're Wrong and Agree Anyway: The Shared Sycophancy-Lie Circuit | Pandey | 2026 (ID 2604.19117) | T1, open-weight models only | https://arxiv.org/abs/2604.19117 | Models can detect false claims yet agree |
| P14 | LLMs for Code Generation from Multilingual Prompts: A Curated Benchmark and a Study on Code Quality | Afrin et al. | 2026-07-16 | T1 | https://arxiv.org/abs/2607.14816 | English not always best; mixed-language comments/strings |
| P15 | Measuring the Tokenization Premium: A Cost Audit for Underserved Language Communities | Roy, Roy, Patel | 2026-08-10 | T1 (no Thai) | https://arxiv.org/abs/2608.09046 | Tokenization premium exists (Bengali 1.56x GPT-4o tokens); Thai not covered |
| P16 | Specification Before Generation: A Pre-Registered, Five-Model Paired Evaluation of a Specification Frame | Dhuri | 2026-09-20 | T1 (single author) | https://arxiv.org/abs/2609.23270 | Spec preamble reduced defects in all five models on 50 backend tasks (Bandit medium+ 53 vs 11) |
| P17 | Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model | Jarmak | 2026-08-14 | T1 (monograph) | https://arxiv.org/abs/2608.13867 | Many "model failures" originate in the harness/environment |

### 8.6 Other (T3, context only)

| ID | Title | URL | Note |
|---|---|---|---|
| X1 | "How Your LLM Costs 5X More If You Don't Speak English" | https://medium.com/@programmerraja/how-your-llm-costs-5x-more-if-you-dont-speak-english-e65912a870e0 | Source of Thai token-premium figures; **UNVERIFIED** |

---

## 9. Gaps and follow-ups

1. **No Thai coding-agent evaluation found.** Suggested own experiment: run 10 real tasks Thai-only vs English-scaffold-with-Thai-content on your main model; compare success, turns, cost.
2. **Thai token premium on current Claude/OpenAI tokenizers is unmeasured here.** Use each vendor's token-count tool on typical prompts.
3. **Read directly before relying on:** the GPT-6 page numbers (O3), the Codex guide date (O5), and P7/P11 (seen by title/snippet only).
4. **Sycophancy prompt effects on frontier agents** are not established by these sources; test T7 on a plan you know is flawed.
5. Claude Code features named above (`/goal`, `/verify`, `/effort`, `/batch`, `/compact`) are from docs as fetched; check your installed version.
