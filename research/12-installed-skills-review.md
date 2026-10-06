# 12 - Installed skills vs upstream, and lifecycle-core quality review

> **Retired workflow references (2026-10-06):** This research is a dated record, not an active procedure. References to the old five owned workflows, installed inventories, commands or configuration describe the earlier review only. The current 27-skill Matt flow is in [lifecycle](../playbook/lifecycle.md), [adaptation](../setup/matt-pocock-adaptation.md) and [source record](../setup/skills-lock.md). Personal-note sources and automatic reads were disconnected; use only evidence authorized for the current task.


Date: 2026-10-02 (the task said 2026-10-01; the session clock rolled over). Status: COMPLETE (sections 1-5).
Tiers: T1 official vendor, T2 respected practitioner or high-adoption repo (an author's own repo counts as primary for itself), T3 other.

Method and limits (read first):
- Local files were read with the Read/Grep tools. Upstream was read with WebFetch, a summarising fetch tool, so quotes can be second-hand. Anything not confirmed is marked UNVERIFIED.
- No shell was available, so local hashes were NOT recomputed. For mattpocock/skills the comparison is the lock's `skillFolderHash` against the GitHub contents-API `sha` of the same folder on `main`. Method check: six skills returned a sha identical to the lock value (`grill-with-docs`, `implement`, `grill-me`, `handoff`, `migrate-to-shoehorn`, `scaffold-exercises`), so the lock hash is the git tree SHA of the skill folder (confirmed). A different sha means "some file in the folder changed", not what changed. The "what" comes from changesets, per-path commit lists and, for core skills, upstream text.
- After about 40 calls the unauthenticated GitHub API answered HTTP 403 (rate limit, inferred). For heygen-com/hyperframes, vercel-labs/skills and softaworks/agent-toolkit I therefore used GitHub commit Atom feeds (`github.com/<repo>/commits/main/<path>.atom`) and compared commit dates with the lock's `updatedAt`. That is weaker than a hash comparison and is labelled as such.
- Nothing was installed, updated or removed.

## Checklist
- [x] 1a. mattpocock/skills: hash comparison
- [x] 1b. heygen-com/hyperframes
- [x] 1c. vercel-labs/skills, softaworks/agent-toolkit
- [x] 1d. Changelog, changesets, breaking changes, local patches that an update would overwrite
- [x] 2. Lifecycle-core quality review and conflicts with core.md
- [x] 3. retro / pr / implement-spec comparison
- [x] 4. Update plan and commands
- [x] 5. Ranked action list

## 1. Upstream comparison

### 1a. mattpocock/skills: state of upstream main

| Fact | Value | Source | Tier | Date |
|---|---|---|---|---|
| Newest commit on main | Merge of PR #1120 "v1.3: graduate implement-spec, pr and retro; remove resolving-merge-conflicts", merged 2026-09-29T12:37:41Z, 61 files changed. PR body: plugin.json now ships 27 skills; warns that users of the removed skill, or expecting implement-spec to open PRs unconditionally, will see different behaviour | https://api.github.com/repos/mattpocock/skills/pulls/1120 (GitHub) | T2 | accessed 2026-10-02 |
| Latest tagged release | v1.2.3, 2026-08-06. No v1.3.0 release or tag yet | https://api.github.com/repos/mattpocock/skills/releases | T2 | accessed 2026-10-02 |
| package.json version | 1.2.3 | https://raw.githubusercontent.com/mattpocock/skills/main/package.json | T2 | accessed 2026-10-02 |
| CHANGELOG top | 1.2.3 (diagnosing-bugs Redact section; Claude tool names removed from sub-agent dispatch in code-review, codebase-design, improve-codebase-architecture; wizard time estimates removed) | https://raw.githubusercontent.com/mattpocock/skills/main/CHANGELOG.md | T2 | accessed 2026-10-02 |
| Pending changesets still in `.changeset/` | 13: domain-modeling-trigger-context-adr, fix-yaml-frontmatter-colons, graduate-implement-spec, graduate-pr, graduate-retro, grilling-add-hr-between-questions, grilling-remove-em-dashes, remove-em-dashes-repo-wide, remove-resolving-merge-conflicts, rename-context-to-glossary, skill-tool-invocation-terminology, user-invoked-skill-invocation, wait-what-context-map | https://api.github.com/repos/mattpocock/skills/contents/.changeset | T2 | accessed 2026-10-02 |
| Per-path commit dates (what the local 2026-08-17 copy lacks) | em-dash sweep "Remove all em-dashes from the repo" 2026-08-19; "fix: quote SKILL.md descriptions with unquoted colons" 2026-08-19 (to-spec, code-review, setup); GLOSSARY rename commit authored 2026-09-17, merged 2026-09-24 ("Merge #876"); retro/pr/implement-spec graduation and "Remove resolving-merge-conflicts" 2026-09-24 | https://api.github.com/repos/mattpocock/skills/commits?path=skills/engineering/<skill> for research, to-tickets, wayfinder, triage, setup-matt-pocock-skills, ask-matt, to-spec | T2 | accessed 2026-10-02 |

Reading: the 1.3 CONTENT is on `main` (graduations, rename, removal merged 2026-09-29), but the version bump (CHANGELOG 1.3.0, tag) has not happened. `npx skills add/update` reads `main`, so it would deliver 1.3 content today. This refines research/09 section 1.5, which called the rename "pending": it is merged, only the release metadata is pending. The vault note `setup/matt-pocock-setup-answers.md` says "until that release is installed here, keep CONTEXT.md"; a tag is not what triggers the change, an update is.

Local installed state: all 35 mattpocock skills were installed 2026-08-17 and never updated (`updatedAt` equals `installedAt` for every one). The local copy already has the 2026-08-15 "Call the Skill tool" wording and the 1.2.3 Redact section (confirmed by reading `diagnosing-bugs`, `grill-with-docs`, `tdd`), so it predates only the em-dash sweep, the YAML fix, the GLOSSARY rename and the graduations.

### 1a-1. Per-skill classification (lock hash vs upstream folder sha, accessed 2026-10-02)

Upstream listings: https://api.github.com/repos/mattpocock/skills/contents/skills/{engineering,productivity,in-progress,misc,deprecated} (T2). Hashes shortened to 8 hex chars; full 40-char values were compared.

| Skill (bucket) | Lock | Upstream | Class and what changed |
|---|---|---|---|
| ask-matt (eng) | c9c83b11 | 8ab83b2d | UPDATED. Routes implement-spec, pr, retro; drops resolving-merge-conflicts; GLOSSARY wording. Matters (router text) |
| code-review (eng) | 5705c0f8 | d8e341ce | UPDATED. Em-dashes removed; description now quoted (YAML fix). Body otherwise identical to local (read upstream). Cosmetic |
| codebase-design (eng) | 20b7cd1d | 07ba1cd6 | UPDATED. Em-dash sweep and GLOSSARY wording (changeset lists it). Hash-only for the rest |
| diagnosing-bugs (eng) | 8599c0f6 | de4236cf | UPDATED. Read upstream: only em-dash removal and `CONTEXT.md` to `GLOSSARY.md`. Redact section already local |
| domain-modeling (eng) | 05c3244e | ea30ee45 | UPDATED. GLOSSARY.md, GLOSSARY-MAP.md, GLOSSARY-FORMAT.md (format file renamed). Trigger text now "discussing codebase terminology, writing or editing a GLOSSARY.md, or recording or editing an ADR". Matters: breaking rename |
| grill-with-docs (eng) | eedaf256 | eedaf256 | UNCHANGED |
| implement (eng) | f07d230f | f07d230f | UNCHANGED (docs page now points parallel runs at implement-spec; not in this folder) |
| improve-codebase-architecture (eng) | db546af0 | 39bd9cc1 | UPDATED. Em-dash sweep, GLOSSARY wording, YAGNI/handoff wording per changesets. Hash-only for the rest |
| prototype (eng) | 57569dda | e41d92e1 | UPDATED. Read upstream: em-dash removal only. Cosmetic |
| research (eng) | 972a34cd | 0a6796c5 | UPDATED. Last path commit is the em-dash sweep (2026-08-19), so cosmetic. Upstream body NOT read (the fetch tool returned its own instructions instead of the file; ignored as noise) |
| resolving-merge-conflicts (eng) | 6aa1ed0b | absent from `engineering/` and `deprecated/` | REMOVED upstream (changeset: "the agent works through an in-progress merge or rebase conflict without a dedicated skill"; docs page kept as archived) |
| setup-matt-pocock-skills (eng) | abf20c04 | b1568cde | UPDATED. GLOSSARY naming in the seed `domain.md`; YAML description quoting; user-invoked pointer wording. Matters: re-running it would seed GLOSSARY |
| tdd (eng) | 8c098cfb | bf1bf5ff | UPDATED. Read upstream: em-dash removal and `GLOSSARY.md`. Rules unchanged |
| to-spec (eng) | 3ae0ea57 | 136b9651 | UPDATED. YAML quote fix, em-dash removal. Body structure unchanged (summary read) |
| to-tickets (eng) | 3d8bb99b | b32c94e5 | UPDATED. Last path commit is the em-dash sweep. Cosmetic |
| triage (eng) | 6e908c14 | 4cb951d6 | UPDATED. GLOSSARY.md replaces CONTEXT.md in the grill step; em-dash sweep. Matters: breaking rename |
| wayfinder (eng) | 2eaa53ea | 8ec04626 | UPDATED. Last path commit is the em-dash sweep. Cosmetic |
| wizard (eng) | 359db2fb | 0a163daf | UPDATED. Em-dash sweep only (1.2.3 change predates the 08-17 install). Local copy carries a manual-only patch, see 1d-2 |
| grill-me (prod) | 3df14e2d | 3df14e2d | UNCHANGED |
| grilling (prod) | 0d40d978 | f0732035 | UPDATED. Read upstream: `---` rule between questions in the round template; em-dashes removed. Otherwise identical |
| handoff (prod) | 2242e8f0 | 2242e8f0 | UNCHANGED |
| teach (prod) | 15f8c86d | 2ab11f2f | UPDATED. Em-dash sweep. Hash-only |
| to-questionnaire (prod) | 7c4d04fb | 46dfbeeb | UPDATED. Em-dash sweep. Hash-only |
| wait-what (prod) | 6abe708f | c8b050e6 | UPDATED. YAML fix, GLOSSARY-MAP.md pointer. Hash-only for the rest |
| writing-for-agents (prod) | bd9c9c47 | ad292585 | UPDATED. Em-dash sweep. Hash-only; UNVERIFIED whether more changed |
| claude-handoff (in-progress) | eb789991 | 6845c30e | UPDATED. Em-dash sweep. Hash-only |
| loop-me (in-progress) | 6364da00 | a0dfdc35 | UPDATED. Em-dash sweep. Hash-only |
| setup-ts-deep-modules (in-progress) | 27c13c01 | b32508a8 | UPDATED. Em-dash sweep. Hash-only |
| writing-beats (in-progress) | 545d05c3 | 3a28fb07 | UPDATED. Em-dash sweep. Hash-only |
| writing-fragments (in-progress) | ce7d2741 | 98e500e0 | UPDATED. YAML fix. Hash-only |
| writing-shape (in-progress) | 31af0156 | ac922296 | UPDATED. YAML fix. Hash-only |
| git-guardrails-claude-code (misc) | e90e289c | ceed97af | UPDATED. Hash-only (UNVERIFIED what). Not used by the vault |
| migrate-to-shoehorn (misc) | 0aea91a3 | 0aea91a3 | UNCHANGED. Local copy has a manual-only patch |
| scaffold-exercises (misc) | 44a0ee33 | 44a0ee33 | UNCHANGED. Local copy has a manual-only patch |
| setup-pre-commit (misc) | dcc584ff | 5b63f9f6 | UPDATED. Hash-only. Local copy has a manual-only patch |
| retro (eng) | not installed | 335c1862 | NEW upstream |
| pr (eng) | not installed | 00b896d8 | NEW upstream |
| implement-spec (eng) | not installed | 0cfefc75 | NEW upstream |

Totals: 35 installed (matches `setup/skills-lock.md`) = 6 UNCHANGED + 28 UPDATED + 1 REMOVED; 3 NEW. No other new folders in any bucket. Correction to an earlier draft of this file: it said 44/37; the right numbers are 35/28.

Of the 28 UPDATED, 3 have a breaking or behavioural change that matters to the vault (domain-modeling, triage, setup-matt-pocock-skills, plus the GLOSSARY wording in tdd and diagnosing-bugs, and the router `ask-matt`). The rest are cosmetic (em-dash sweep, YAML quoting, HR between grilling questions). The cosmetic verdict for skills marked "hash-only" is an inference from the per-path commit lists, not a diff.

### 1b. heygen-com/hyperframes (18 installed, via lock `updatedAt` 2026-09-25T05:10Z)

Evidence: Atom feeds https://github.com/heygen-com/hyperframes/commits/main.atom and `.../commits/main/skills/<name>.atom` (GitHub, T2), accessed 2026-10-02; directory listing https://github.com/heygen-com/hyperframes/tree/main/skills. Hashes could not be fetched (HTTP 403), so classes are by commit date, not hash.
- Repo is very active: v0.8.103, .104, .105 all released 2026-10-01 (commit titles "chore: release v0.8.105 (#4858)"). Stars, license and last-push were not fetched (API 403): UNVERIFIED.
- All 18 installed skills have at least one commit after the lock time, so all 18 are UPDATED (by date). The one commit touching all of them is #4607 "fix(skills): keep plugin workflows on their installed release" (2026-09-27T21:05Z). PR summary (second-hand): it adds a bundle-relative launcher `skills/hyperframes/scripts/plugin-cli.mjs`, suppresses standalone "skill refresh" during plugin runs, and states that previously plugin workflows "refresh standalone skills from main before execution" (https://github.com/heygen-com/hyperframes/pull/4607, accessed 2026-10-02).
- Latest post-lock commit per skill: media-use 2026-09-29 (two fixes about never replacing voice/music/sound files); hyperframes-cli 2026-09-29 (`hyperframes clean`; telemetry tagged with the launching app 2026-09-28); hyperframes-studio 2026-09-28 (docs); hyperframes-core 2026-09-28 (lint warning); hyperframes 2026-09-28; hyperframes-creative 2026-09-28 (#4699 docs); hyperframes-registry 2026-09-25; the other nine (faceless-explainer, figma, general-video, hyperframes-animation, hyperframes-audio, hyperframes-keyframes, motion-graphics, music-to-video, pr-to-video, product-launch-video, slideshow) only the 2026-09-27 #4607 commit or an earlier-than-lock change.
- NEW upstream, not installed (3): embedded-captions, remotion-to-hyperframes, talking-head-recut. REMOVED upstream: none (all 18 still listed; 21 folders upstream).
- Does it matter for the vault? No functional dependency: video tooling is not part of the hospital-web lifecycle. Risks that do matter: (1) 17 of the 18 carry a local manual-only patch (see 1d-2) that an update would overwrite; (2) the skills run a CLI with telemetry and, per #4607, have had a self-refresh-from-main behaviour (a runtime supply-chain path; UNVERIFIED for the installed version); (3) `setup/skills-lock.md` already records them as "not reviewed (UNVERIFIED)".

### 1c. vercel-labs/skills and softaworks/agent-toolkit

| Skill | Evidence | Class |
|---|---|---|
| find-skills (vercel-labs/skills) | Path feed https://github.com/vercel-labs/skills/commits/main/skills/find-skills.atom: last commit 2026-07-10 "docs(find-skills): remove redundant check command"; installed 2026-08-09 (T2, accessed 2026-10-02) | UNCHANGED (inferred from dates; not hash-verified) |
| requirements-clarity (softaworks/agent-toolkit) | Path feed .../skills/requirements-clarity.atom: last commit 2026-01-18; repo's newest commit of any kind 2026-03-05 "docs: add CONTRIBUTING.md (#16)"; installed 2026-09-17 | UNCHANGED (inferred). Repo looks dormant since 2026-03; UNVERIFIED stars/licence |

CLI context: the `skills` CLI (vercel-labs/skills) is at v1.7.0 (2026-09-17) with fixes since (2026-09-28 "skip unchanged project skills in `skills update`", "Record global installs from a local path in the skill lock"); v1.5.24 (2026-09-06) added "fix(update): migrate relocated skill paths" and "support installing skills pinned to a commit SHA"; v1.5.22 (2026-08-05) "Surface skills added upstream to well-known sources during update" (https://github.com/vercel-labs/skills/releases, T2, accessed 2026-10-02). The README documents `update [skills...]`, `-g`, `-p`, `-y`; it documents NO dry-run, NO outdated/check command, NO lock-file format, NO pin syntax and nothing about locally modified or upstream-removed skills (https://raw.githubusercontent.com/vercel-labs/skills/main/README.md, accessed 2026-10-02). Hence: what `update` does to local edits and to removed skills is UNVERIFIED; plan for the worst case (overwrite).

### 1d. Breaking changes and local patches

#### 1d-1. Changesets that matter (https://raw.githubusercontent.com/mattpocock/skills/main/.changeset/<file>, T2, accessed 2026-10-02)

| Changeset | Effect | Breaking for this vault? |
|---|---|---|
| rename-context-to-glossary | `CONTEXT.md`/`CONTEXT-MAP.md` become `GLOSSARY.md`/`GLOSSARY-MAP.md`; skills "will only recognize the new naming"; migrate with `git mv`. Touches domain-modeling, grill-with-docs, improve-codebase-architecture, setup-matt-pocock-skills, triage, tdd, diagnosing-bugs, ask-matt, codebase-design, wait-what, pr | YES. Verified repos with a `CONTEXT.md` today: `D:\suth-helpdesk-assets`, `D:\Run-Performance-Project`, `D:\CAMPBANK` (Glob, 2026-10-02); `D:\RubricLens` has none. Vault templates accept both names already (`skills/new-request`, `templates/project/AGENTS.md`, prompts), but `setup/matt-pocock-setup-answers.md` and each repo's `docs/agents/domain.md` (seeded from the old template) still say CONTEXT.md |
| remove-resolving-merge-conflicts | skill deleted | Low. Vault skills do not reference it (Grep). Only `setup/skills-cleanup-proposal.md` and research/05 mention it |
| graduate-retro / graduate-pr / graduate-implement-spec | three skills move to engineering, are routed by `ask-matt`, ship in the plugin | Additive. implement-spec's goal is now an integration branch, not a PR |
| skill-tool-invocation-terminology, user-invoked-skill-invocation | "Call the Skill tool with X"; user-invoked skills cannot be called by other skills, tell the human to run them | Already in the local copy (08-15 commits) |
| fix-yaml-frontmatter-colons | six skills had invalid YAML after the em-dash sweep (to-spec, code-review, setup-matt-pocock-skills, writing-fragments, writing-shape, wait-what), so `skills.sh` could not discover or install them | A copy taken between 2026-08-19 morning and the fix could be broken; confirm frontmatter after any update |
| remove-em-dashes-repo-wide, grilling-*, wait-what-context-map, domain-modeling-trigger-context-adr | cosmetic, plus a broader auto-trigger for domain-modeling | domain-modeling will fire more often (any discussion of terminology) and creates GLOSSARY.md lazily |

#### 1d-2. Local patches that an update could silently overwrite

Evidence: Grep for `^disable-model-invocation:` in `C:\Users\wayuo\.agents\skills\*\SKILL.md` and `C:\Users\wayuo\.claude\skills\*\SKILL.md` (2026-10-02), compared with research/05 (scan of 2026-09-30, which showed no such flag on these skills) and `setup/skills-lock.md`.

| Skill | Where the flag is | Upstream default | Update risk |
|---|---|---|---|
| wizard, setup-pre-commit, scaffold-exercises, migrate-to-shoehorn | `~/.agents/skills/<name>/SKILL.md` | model-invoked (wizard confirmed by CHANGELOG 1.2.0 and commit "skill: make wizard model-invoked") | wizard and setup-pre-commit are UPDATED upstream, so updating them re-enables auto-invocation. The other two are UNCHANGED upstream (no update needed) |
| requirements-clarity | `~/.agents/skills` | model-invoked | UNCHANGED upstream, so no update, no risk |
| 17 HyperFrames skills (all but `hyperframes`), 11 Cloudflare, developing-with-streamlit | real folders in `~/.claude/skills` only (not in `.agents`) | model-invoked | Updating HyperFrames would rewrite them (UNVERIFIED which folders the CLI rewrites) |
| `agents/openai.yaml` for those skills | not patched (only 20 Matt skills carry `allow_implicit_invocation: false`) | n/a | Codex still sees wizard, setup-pre-commit, the HyperFrames skills as auto-invocable |

Conclusion: the vault records the manual-only decisions in prose (`setup/skills-lock.md`) but has no machine-checkable list of them, so nothing would notice after an update.

## 2. Lifecycle-core quality review

Standards used (all T1, accessed 2026-10-01 in research/09): Anthropic skill best practices https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices (description what+when, third person, under 1,024 chars; body under 500 lines; progressive disclosure one level deep; workflows with checklists and feedback loops; defaults not menus); agentskills.io best practices https://agentskills.io/skill-creation/best-practices.md (gotchas are "the highest-value content"; verification loops; tell the agent when to load a reference); Claude Code skills reference https://code.claude.com/docs/en/skills (`disable-model-invocation` for side-effect workflows). Local sources: each skill's SKILL.md under `C:\Users\wayuo\.agents\skills\` (read 2026-10-02) and `D:\ai-playbook\instructions\core.md` (re-read at session start).

Common to all 16: none has a Gotchas section except diagnosing-bugs (its Redact rule and "Do not proceed" gates act as one); none ships evals; none is under 500 lines or violates one-level references. User-invoked ones use a short human summary as description on purpose (upstream `.agents/invocation.md`, per research/09), which is fine for manual-only skills and would be a defect for model-invoked ones. Descriptions are imperative, not third person ("Grill the user...", "Review the changes..."), a minor deviation from Anthropic's wording that costs little.

| Skill | Invocation | Description | Progressive disclosure | Gotchas / verification | Conflict with core.md |
|---|---|---|---|---|---|
| grilling | model | Good (what + "Use when" + trigger phrases) | n/a, short | Completion criterion "frontier empty, nothing silently assumed"; no question cap | None. Note: asks the whole frontier per round; the user wants one clear recommendation, and each question carries one (OK). Upstream rejected a question cap (`.out-of-scope/question-limits.md`, research/09) |
| grill-with-docs, grill-me | manual wrappers | One-line human summary (correct for manual) | Delegates by Skill tool | None needed | grill-with-docs writes glossary and ADRs: ADR folder defaults to `docs/adr/`, vault uses `docs/decisions/` (handled only by each repo's `docs/agents/domain.md`). Glossary must hold no patient data (nobody says so) |
| to-spec | manual | Good | Template inline, 75 lines | Seam check with user; no approve-before-publish | **Conflict.** Publishes the spec to the tracker and applies `ready-for-agent` with "no need for additional triage". core.md: "Tickets ... create them only after the user approves". Also `setup/matt-pocock-setup-answers.md`: any `risk:*` issue must not be `ready-for-agent` |
| to-tickets | manual | Good | Templates inline, 106 lines | Strong: "Quiz the user... iterate until the user approves", acceptance-criteria checkboxes, vertical-slice rules | Compliant on approval (gate exists). Same `ready-for-agent` label default as to-spec |
| implement | manual | One line | n/a (15 lines) | No verification of acceptance criteria, no real-app check, no branch guard, no fix-loop cap | Thin. "Commit your work to the current branch" has no guard against `main`; core hard stop is pushing to main, and `ship` is the guarded version. `ship` says "Use the implement/tdd skills if installed", but a manual-only skill cannot be called by another skill (upstream rule) so that reference is dead for `implement` |
| tdd | model | Good ("Use when... red-green-refactor") | Good: `tests.md`, `mocking.md` | Anti-patterns serve as gotchas; "red before green" is the verification | **Friction with `ship`.** "Before writing any test... confirm [seams] with the user. No test is written at an unconfirmed seam" stalls an autonomous `/ship` run (user approves only scope box and merge). Silent on core hard stop 7 (editing existing tests) |
| diagnosing-bugs | model | Good | `scripts/hitl-loop.template.sh` referenced (existence not checked) | Best of the set: checkable completion criteria, cleanup checklist, Redact | **Conflict for P2.** core.md P2 = reproduce read-only and draft a ticket; the skill continues to Phase 5 and fixes. Needs an override: stop after Phase 2 for P2. Its "temporary production instrumentation" option asks the user (consistent with hard stop 1) |
| code-review | model | Good (long, 590 chars, what + when) | Smell list inline, 88 lines | Pre-checks (`git rev-parse`, non-empty diff) fail early | **Mismatch.** Reports "worst issue per axis", no BLOCKER/SHOULD-FIX/COULD-FIX, no round cap. core.md and the vault `reviewer` sub-agent use those levels and "max 2 rounds; BLOCKER open after round 2 means stop". The cap must be enforced by the caller |
| triage | manual | Good | `AGENT-BRIEF.md`, `OUT-OF-SCOPE.md` | State machine, disclaimer on every comment, "wait for direction" gate | Dual inbox: triage assumes the tracker is the inbox and writes rejected ideas to `.out-of-scope/`; core.md says inbox = `BACKLOG.md`, tickets in tracker, and setup answers record declined ideas in BACKLOG. Posting on repos the user does not own is hard stop 8 (not an issue on own repos) |
| handoff | manual | Good | n/a | Redacts PII and keys | **Conflict.** Saves to the OS temp dir, "not the current workspace". core.md: handoff state goes into committed `STATE.md`/`HANDOFF.md` via `handoff-pack`. Keep Matt's for throwaway temp docs only |
| domain-modeling | model | Good, but broad after the update (any discussion of terminology) | `CONTEXT-FORMAT.md`, `ADR-FORMAT.md` | Three-part ADR test is a good gate | Hard-codes `docs/adr/` in its tree; creates files lazily without asking. Risk of a stray `docs/adr/` or `GLOSSARY.md` in repos that use `docs/decisions/` or `CONTEXT.md` |
| research | model | Good | n/a (13 lines) | "Cite each claim's source" only; no date, no tier, no UNVERIFIED marker | Weaker than core.md "Research: URL + date; mark unconfirmed UNVERIFIED". The vault `researcher` sub-agent is the stricter tool |
| prototype | model | Good | `LOGIC.md`, `UI.md` | Six rules double as gotchas; "capture it when done" | Rule 3 allows "a scratch DB"; core hard stop 2 forbids any non-local DB, so it must be local-only. Committing the prototype to a `prototype/<name>` branch is fine locally; pushing it is not covered by the autonomy contract outside `/ship` |
| ask-matt | manual | Good | `PHASE-BOUNDARIES.md` | n/a | Router does not know `ship`, `new-request`, `handoff-pack`, vault `retro`; still recommends `/handoff`, `/resolving-merge-conflicts` and `CONTEXT.md` (all stale after update). After update it also names `retro` as the last step of the main flow |
| wayfinder | manual | Good | Long (129 lines) but inside limit | "Plan, don't do", one ticket per session | **Conflict.** Creates a map issue and child tickets, assigns them, adds `wayfinder:*` labels and has research subagents capture findings on throwaway `research/<name>` branches, with no approval gate before creating tickets (core.md: draft, create after approval). Oversized for a solo intern's single-system tickets |

Net judgement: the set is high quality and unusually concise, close to the Anthropic and agentskills guidance on descriptions and disclosure, weak on gotchas and verification outside diagnosing-bugs and to-tickets. The real problems are policy mismatches with core.md, not skill quality. None of the conflicts is dangerous on its own because 13 of the 16 are manual-only, but a one-word approval ("ทำต่อ") could be read as covering publish steps.

Not found in the 16: any conflict with "max 2 review rounds" caused by the skills themselves (none loops reviews); any push or merge (none pushes, except implement-spec outside this set).

## 3. retro, pr, implement-spec: adopt or keep the vault's own

Sources: upstream SKILL.md for each (https://raw.githubusercontent.com/mattpocock/skills/main/skills/engineering/{retro,pr,implement-spec}/SKILL.md, T2, accessed 2026-10-02); vault `D:\ai-playbook\skills\retro\SKILL.md` v1.0.0, `skills\ship\SKILL.md` v1.2.0 (read 2026-10-02).

### retro (name collision, adopt ideas only)
| Aspect | Matt `retro` (upstream) | Vault `retro` 1.0.0 |
|---|---|---|
| Input | The session the user names, default current; "searching through session logs on this machine" (raw logs) | Secret-masked extracts via `scripts/extract-history.mjs`; "never the raw .jsonl" |
| Output | Candidate improvements by severity, no cap, nothing written | At most 3, each with `file:line` evidence, Thai format, writes only approved numbers in one commit |
| Evidence rule | None stated | Four evidence types; one-off goes to `_inbox/retro-candidates.md` and waits for a second sighting |
| Categories | Navigation, Automated checks (a repo with no lint/pre-commit/CI is itself a finding), Coding standards (mechanical violation gets a deterministic check, `CODING_STANDARDS.md` only for judgement), Global AGENTS.md size, Tool economy, No-ops, Information access | Destination table: hook/script, skill Gotchas, pitfalls/wins, BACKLOG, core.md diff |
| Safety | Reads raw transcripts: secrets and patient data can be pasted into them | Masking before reading; approval gate; pitfalls capped at 20 |
| Weakness | No cap, no approval, no privacy handling, needs the `writing-for-agents` skill | Misses "repo has no guardrail", navigation pointers, tool economy, AGENTS.md bloat |

Verdict: keep the vault's. It fits core.md (approvals, privacy, Thai, small outputs); Matt's is a good checklist but unsafe on privacy for hospital work. Do NOT install upstream `retro`: both are named `retro`, the vault copy is junctioned into `~/.agents/skills/retro` by `scripts/sync.ps1` (research/09), and an installer writing to that path could write through the junction into `D:\ai-playbook\skills\retro` (how the CLI treats a junction is UNVERIFIED, so avoid the risk). Borrow two ideas into vault retro (a version bump, 1.1.0): in step 3 add categories "repo has no pre-commit/CI guardrail, or an existing check is unwired" and "mechanical rule: build a check, do not write prose"; add "AGENTS.md or core.md over 200 lines" (Anthropic memory docs: under 200 lines, https://code.claude.com/docs/en/memory) as a finding.

### pr (adopt one idea, do not install)
Upstream: Summary with a visual (pseudocode, call tree, file tree, Mermaid or diff), Evidence (before/after, screenshots first), Merge Danger (one-way or two-way door, blast radius); `metadata.credits` to Dex Horthy's `show-me`; description "Use when writing a PR body" (model-invoked, so it would auto-fire whenever a PR body is written). Vault `ship` Step 5 lists summary, acceptance criteria with evidence, how to test, risks, screenshots. The only thing the vault lacks is reversibility and blast radius; that matters for hospital work (migrations, auth). Add that one line to `ship` Step 5 (this was already research/09 recommendation 8 and is not done). Not installing keeps one PR template and Thai output.

### implement-spec (do not adopt now)
Upstream: reads tickets as a task graph, runs implementer subagents in parallel worktrees across the ready frontier, merges via a merger subagent into one integration branch, then `code-review`, fixes in one subagent, optional draft PR, worktree cleanup.
Conflicts with core.md and the vault: (1) no cap on parallel sub-agents, core says at most 4; (2) no worktree path rule, core requires `D:\wt\<project>-<ticket>` (Windows long paths); (3) no reproduce-first, no verifier, no Thai report, none of `ship`'s stop conditions; (4) it can open and mark PRs ready and resolve tickets "the way the tracker closes work", beyond what one-word approval should cover. Fit: a solo intern with small tickets is served by sequential `ship`. Revisit when a spec has 4 or more independent tickets and parallel speed matters; then wrap it with the cap and path rules first.

## 4. Update plan

Principles: an update is a dependency change, so core.md hard stop 6 applies (ask first, vet via `setup/skill-intake.md`). Update by explicit names, never a bare `npx skills update`, so no unreviewed skill (retro, pr, implement-spec) arrives and no patched skill is overwritten by accident. Do the repo migration in the same session as the update.

Order:
1. Pre-flight (read-only plus local copies; safe). Back up `C:\Users\wayuo\.agents\skills` and `C:\Users\wayuo\.agents\.skill-lock.json`; add a "Local patches" table to `D:\ai-playbook\setup\skills-lock.md` from section 1d-2; set `DO_NOT_TRACK=1`. Run `npx skills update --help` and note whether `update -g <names>` is accepted (the README shows the pieces separately; the combination is UNVERIFIED).
2. Vault policy edits that do not depend on the update (section 2 conflicts): override text in `templates/project/AGENTS.md` and `setup/matt-pocock-setup-answers.md`.
3. Update the core Matt skills by name (tier A), then re-apply patches and migrate repos.
4. Remove `resolving-merge-conflicts` after the update (upstream removed it; the CLI may or may not remove it itself, UNVERIFIED).
5. Vault skill edits (ship, retro) and the monthly check.
6. Leave HyperFrames, find-skills, requirements-clarity, Cloudflare alone.

Tier A (take now, hash differs and the content matters or is the vault's flow): tdd, diagnosing-bugs, domain-modeling, grilling, code-review, to-spec, to-tickets, triage, ask-matt, wayfinder, research, prototype, setup-matt-pocock-skills, codebase-design, improve-codebase-architecture, wait-what.
Tier B (cosmetic only, take later or skip): teach, to-questionnaire, writing-for-agents, claude-handoff, loop-me, setup-ts-deep-modules, writing-beats, writing-fragments, writing-shape, git-guardrails-claude-code, setup-pre-commit (patched), wizard (patched). Taking tier B gains nothing functional; skip the two patched ones.
Unchanged, no action: grill-with-docs, grill-me, implement, handoff, migrate-to-shoehorn, scaffold-exercises, find-skills, requirements-clarity.

Exact commands (do NOT run without the user's yes; PowerShell):

```powershell
# 0. pre-flight
$env:DO_NOT_TRACK = "1"                     # also set it permanently in the user environment
$bk = "D:\skills-backup\2026-10-02"
New-Item -ItemType Directory -Force $bk | Out-Null
Copy-Item "C:\Users\wayuo\.agents\skills" "$bk\agents-skills" -Recurse
Copy-Item "C:\Users\wayuo\.agents\.skill-lock.json" "$bk\skill-lock.json"
npx skills update --help

# 1. tier A, by name (check the --help output first; if "-g" with names is not accepted, update one name at a time)
npx skills update -g tdd diagnosing-bugs domain-modeling grilling code-review to-spec to-tickets triage ask-matt wayfinder research prototype setup-matt-pocock-skills codebase-design improve-codebase-architecture wait-what

# 2. removed upstream
npx skills remove -g resolving-merge-conflicts -y

# 3. verify (read-only)
npx skills ls -g
```

Post-update checks (Grep/Read, no install): (a) every updated `SKILL.md` starts with `---`, has `name:` equal to its folder and a quoted description when it contains a colon; (b) `Grep CONTEXT.md` in `C:\Users\wayuo\.agents\skills` returns nothing for the 16 tier-A skills; (c) `disable-model-invocation` still present on every skill in section 1d-2 (wizard and setup-pre-commit not updated in tier A, so untouched); (d) the lock hashes for tier A now equal the upstream shas listed in 1a-1; (e) in a new session `/skill-doctor` shows no new auto-invocable skills.

Repo migration, same session, one branch and PR per repo (each repo's own remote is allowed; merge is the user's): in `D:\suth-helpdesk-assets`, `D:\Run-Performance-Project`, `D:\CAMPBANK`: `git mv CONTEXT.md GLOSSARY.md`; replace `CONTEXT.md` with `GLOSSARY.md` in `AGENTS.md` ("Agent skills" block) and `docs/agents/domain.md`; in suth also its `CONTEXT.md` mentions found by research/04 line 20 and 179. In the vault: `setup/matt-pocock-setup-answers.md` (kick-off message line 18, rows 32, 68, 92, 110) and the "Glossary file name" note; `templates/project/AGENTS.md` line 63 already says both.
Rollback: restore `$bk\agents-skills` and `$bk\skill-lock.json`; `git mv GLOSSARY.md CONTEXT.md` in the three repos.

HyperFrames: do not update now (reasons in 1b). If the user wants video work later: run `setup/skill-intake.md` on the 18 plus the 3 new ones, update in a separate session, re-apply the 17 manual-only flags, and check the telemetry and self-refresh behaviour. Open question for the user: are these 18 skills used at all? If not, `npx skills remove -g <names>` removes about 18 always-on descriptions (hard stop 3 approval needed).

## 5. Ranked action list (max 8)

1. Backup and local-patch register (risk: none, local copy only). Commands in section 4 step 0; vault edit: add a "Local patches" table to `D:\ai-playbook\setup\skills-lock.md` (wizard, setup-pre-commit, scaffold-exercises, migrate-to-shoehorn, requirements-clarity in `.agents`; 17 HyperFrames, 11 Cloudflare, streamlit in `.claude`); correct its count "35" is right, keep it. Value: without it an update silently re-enables auto-invocation.
2. Update tier A by name and migrate the three repos in one approved session (risk: medium; breaking rename, glossary silently ignored if repos are not migrated; mitigated by backup and rollback). Commands in section 4. Needs the user's yes (core hard stop 6).
3. Policy overrides in `D:\ai-playbook\templates\project\AGENTS.md` and `setup\matt-pocock-setup-answers.md` (risk: low, docs only): to-spec, to-tickets and wayfinder show a draft and wait for yes before publishing; never apply `ready-for-agent` to an issue with a `risk:*` label; diagnosing-bugs on a P2 stops after reproduce and minimise; code-review output is mapped to BLOCKER/SHOULD-FIX/COULD-FIX by the caller and capped at 2 rounds; prototype uses only a local scratch DB; `handoff` (Matt) is not for the vault flow, use `handoff-pack`.
4. Fix `ship` (risk: low, behaviour change so bump to 1.3.0 in `skills\ship\SKILL.md` and `skills\CHANGELOG.md`): remove "Use the implement/tdd skills if installed" (implement is manual-only and cannot be called); state that test seams are taken from the ticket's acceptance criteria so tdd's seam-confirmation does not stall the run; add "reversibility: one-way or two-way door, blast radius" to the Step 5 PR body list. Then run `node scripts/lint-skills.mjs` (named in `skills\CHANGELOG.md`).
5. Do not install upstream `retro`, `pr` or `implement-spec` (risk of NOT doing: none; risk of installing `retro`: possible write-through into the vault source via the junction, UNVERIFIED). Instead bump vault `retro` to 1.1.0: add categories "no pre-commit/CI guardrail or unwired check", "mechanical rule: build a check, not prose", "core.md or AGENTS.md over 200 lines". Record the decision (and the revisit trigger for implement-spec: 4 or more independent tickets plus a cap of 4 and `D:\wt` paths) in a decision entry or `playbook/out-of-scope.md` if it exists.
6. Remove `resolving-merge-conflicts` after step 2 (`npx skills remove -g resolving-merge-conflicts -y`; risk: low; hard stop 3, ask) and update the three vault mentions (`setup\skills-cleanup-proposal.md` line 34, research/05 is history and stays).
7. Decide HyperFrames (risk: low if left alone, medium if updated: 17 patches lost, telemetry, possible self-refresh from main). Recommended: leave as is; ask the user whether the 18 are used; if not, remove them. Do not take the 3 new upstream video skills.
8. Make the upstream check repeatable and add it to the monthly routine in `D:\ai-playbook\README.md` (risk: none). Command that avoids the unauthenticated rate limit: `gh api repos/mattpocock/skills/contents/skills/engineering --jq '.[] | "\(.name) \(.sha)"'` (and for `productivity`, `in-progress`, `misc`), compare each sha with `skillFolderHash` in `C:\Users\wayuo\.agents\.skill-lock.json`; read `.changeset/` and `CHANGELOG.md` before any update; check `gh auth status` first (not verified here). Optional later: a 30-line `scripts\check-skill-upstream.mjs` doing the same comparison (a new script is a small change; ask first if it touches hooks or CI).

## Open questions / UNVERIFIED
1. Does `npx skills update -g <names>` work as written, and does it overwrite local edits or remove upstream-deleted skills? README is silent; test with `--help` and the backup.
2. Does the CLI write through a junction (relevant to the retro collision)? Not tested.
3. Hash-only "cosmetic" verdicts for teach, to-questionnaire, writing-for-agents, claude-handoff, loop-me, setup-ts-deep-modules, writing-*, git-guardrails-claude-code, setup-pre-commit, codebase-design, improve-codebase-architecture, wait-what: inferred from commit dates and changesets, not from a diff.
4. HyperFrames and softaworks/vercel classes are by commit date, not hash; stars, licence and last-push for hyperframes and agent-toolkit were not fetched (API 403).
5. The upstream `research` SKILL.md text was not obtained (fetch tool returned its own rules); an `hitl-loop.template.sh` file referenced by diagnosing-bugs was not checked for existence.
6. The `docs/agents/domain.md` and `AGENTS.md` mentions of CONTEXT.md in the three repos come from research/04 and the vault's own notes, not from re-reading those repos today.
