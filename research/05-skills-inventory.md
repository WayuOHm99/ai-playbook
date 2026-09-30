# 05 - Skills Inventory (Claude Code / Codex / Cursor / project-local)

Scanned 2026-09-30 on this Windows machine. Read-only scan; the scanner and table generator were PowerShell scripts in the session scratchpad (`scan.ps1`, `gen.ps1`). Hashes are the first 8 hex chars of SHA-1 over SKILL.md.

## 1. Counts

| Location | Skills (folders with SKILL.md) | Notes |
|---|---|---|
| `C:\Users\wayuo\.claude\skills` | **67** | 37 are **junctions** into `.agents\skills` (the Matt Pocock set plus find-skills, wizard, etc.); 30 are real folders (11 Cloudflare, 18 HyperFrames/HeyGen, 1 Streamlit). `.trash` (1 entry) ignored. `synced\` is a Cowork sync bucket with no SKILL.md. |
| `C:\Users\wayuo\.agents\skills` | **87** | All real folders (canonical store). Superset of the Claude folder plus 20 Cursor built-ins. |
| `C:\Users\wayuo\.codex\skills` | **33** + 6 in `.system` | All real copies (no links). 27 are byte-identical to `.agents`, 2 differ by one branding line, 4 are Codex-only (hatch-pet, open-code-review, open-code-review-delegate, playwright). |
| `C:\Users\wayuo\.claude\plugins` | **62** | 31 in the official marketplace (25 plugin skills + 6 channel-plugin skills), 31 in Cowork "synced" plugins (engineering 10, data 10, operations 9, cowork-plugin-management 2). Name duplicates: `access` and `configure` x3 (discord/imessage/telegram). |
| `D:\suth-helpdesk-assets` | **2** | `.agents\skills\finish-issue`, `apps\web\.claude\skills\run-web`. Also 3 Claude subagents in `.claude\agents`. |
| `D:\CAMPBANK` | 0 | Only `.cursor\rules\*.mdc` (no-guessing, ticket-cleanup). |
| `D:\RubricLens` | 0 | Only `.claude\settings.local.json`. |

**Unique skill names: 155** (99 unique non-plugin folder names, plus plugin skill names; `code-review` exists both as a Matt skill and as `engineering:code-review`, with different content). Total SKILL.md files scanned: 257.
`disable-model-invocation: true` is set on 26 skills in `.agents` (20 of them are visible in Claude via junction): these only run when you type the slash command.

Structural facts:
- `.agents\skills` is the **canonical shared store**. Claude sees the Matt Pocock skills only through junctions to it; Codex has none of the Matt skills.
- Real (non-linked) duplicates of the Cloudflare and HyperFrames skills exist in three places (`.claude`, `.agents`, `.codex`). They are byte-identical except two (see section 7), so this is drift risk, not a functional conflict.
- The 20 "Cursor built-in" skills in `.agents` (automate, autopilot, canvas, create-*, loop, review*, shell, ...) have their text rebranded from Cursor to "Codex" but still reference `.cursor/` paths and `@cursor/sdk`. They are not visible to Claude Code.

## 2. Full inventory (non-plugin, per unique folder)

Origin is inferred from folder name, content and known repos (the files carry no provenance metadata). "Copies identical?" compares SKILL.md hashes across Claude / Agents / Codex / Project locations. "Last modified" is the newest SKILL.md timestamp.

| Skill | Origin | Purpose | Locations | Copies identical? | Link vs real | Last modified | Frontmatter notes | Phase |
|---|---|---|---|---|---|---|---|---|
| agents-sdk | Cloudflare | Build AI agents on Cloudflare Workers using the Agents SDK. Load when creating stateful agents, durable workflows, real-time WebSocket ap... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare) |
| ask-matt | Matt Pocock / aihero.dev | Ask which skill or flow fits your situation. A router over the skills in this repo. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | meta |
| automate | Cursor built-in | Use this skill to create Codex Automations. | Agents | n/a (single) | real folder(s) | 7 |  | meta |
| autopilot | Cursor built-in | Keep a PR merge-ready by triaging comments, resolving clear conflicts, and fixing CI in a loop. | Agents | n/a (single) | real folder(s) | 7 |  | review; maintenance (PR upkeep) |
| canvas | Cursor built-in | A Codex Canvas is a live React app that the user can open beside the chat. You MUST use a canvas when the agent produces a standalone a... | Agents | n/a (single) | real folder(s) | 7 | metadata=surfaces: | handover/docs (visual) |
| claude-handoff | Matt Pocock / aihero.dev | Hand the current conversation off to a fresh background agent that picks up the work immediately. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true; argument-hint="What will the next session be used for?" | session handoff |
| cloudflare | Cloudflare | Comprehensive Cloudflare platform skill covering Workers, Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize, Agents SDK), feature fl... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare); deploy |
| cloudflare-email-service | Cloudflare | Send and receive transactional emails with Cloudflare Email Service (Email Sending + Email Routing). Use when building email sending (Wor... | Agents, Claude, Codex | NO: Codex=21E7F424 Claude=21E7F424 Agents=F38E5932 | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare) |
| cloudflare-one | Cloudflare | Guides Cloudflare One Zero Trust and SASE work across Access, Gateway, WARP, Tunnel, Cloudflare WAN, DLP, CASB, device posture, and ident... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare); security |
| cloudflare-one-migrations | Cloudflare | Plans migrations from Zscaler ZIA/ZPA, Palo Alto, legacy VPN, SWG, or SASE stacks to Cloudflare One. Use for migration assessments, polic... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare); planning |
| code-review | Matt Pocock / aihero.dev | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's ... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | review |
| codebase-design | Matt Pocock / aihero.dev | Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportuni... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | architecture |
| create-hook | Cursor built-in | Create Codex hooks. Use when you want to create a hook, write hooks.json, add hook scripts, or automate behavior around agent events. | Agents | n/a (single) | real folder(s) | 7 |  | meta |
| create-rule | Cursor built-in | Create Codex rules for persistent AI guidance. Use when you want to create a rule, add coding standards, set up project conventions, co... | Agents | n/a (single) | real folder(s) | 7 |  | meta |
| create-skill | Cursor built-in | Create Codex Agent Skills. Use when authoring a new skill or asking about SKILL.md structure. | Agents | n/a (single) | real folder(s) | 7 |  | meta |
| create-subagent | Cursor built-in | Create custom subagents for specialized AI tasks. Use when you want to create a new type of subagent, set up task-specific agents, conf... | Agents | n/a (single) | real folder(s) | 7 | disable-model-invocation=true | meta |
| developing-with-streamlit | Streamlit (likely official) | Use for ALL Streamlit tasks: creating, editing, debugging, beautifying, styling, theming, optimizing, or deploying Streamlit apps. Also c... | Agents, Claude | yes | Claude=real; others real | 2026-05-14 | allowed-tools=Bash(python ${CLAUDE_SKILL_DIR}/scripts/discover.py:*) Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/discover.py:*) | domain (Streamlit) |
| diagnosing-bugs | Matt Pocock / aihero.dev | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/thr... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | debug; performance |
| domain-modeling | Matt Pocock / aihero.dev | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or ed... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | clarify; architecture; docs |
| durable-objects | Cloudflare | Create and review Cloudflare Durable Objects. Use when building stateful coordination (chat rooms, multiplayer games, booking systems), i... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare) |
| faceless-explainer | HyperFrames / HeyGen | Turn arbitrary text — an article, notes, a topic, a brief — into a faceless explainer video: there is no site or footage to capture, so t... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| figma | HyperFrames / HeyGen | Import Figma content into a HyperFrames composition — rendered assets, brand tokens, components, storyboard sections → reconstructed moti... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-23 |  |  |
| find-skills | Vercel skills CLI (likely) | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that ... | Agents, Claude | yes | Claude=junction; others real | 2026-08-09 |  | meta |
| finish-issue | Project-local (custom) | Drives an approved issue through implementation, regression and Standards/Spec review to human handoff or an explicitly authorized end-to... | Project | n/a (single) | real folder(s) | 6 | disable-model-invocation=true | implement; review; handover |
| general-video | HyperFrames / HeyGen | Author or edit a custom HyperFrames composition when no specialized workflow fits, or when BRIEF.md sets flow: companion. Use for longer ... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| git-guardrails-claude-code | Matt Pocock / aihero.dev | Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user ... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | scaffold; security (safety) |
| grill-me | Matt Pocock / aihero.dev | A relentless interview to sharpen a plan or design. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | clarify |
| grill-with-docs | Matt Pocock / aihero.dev | A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | clarify; docs |
| grilling | Matt Pocock / aihero.dev | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' t... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | clarify |
| handoff | Matt Pocock / aihero.dev | Compact the current conversation into a handoff document for another agent to pick up. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true; argument-hint="What will the next session be used for?" | session handoff |
| hatch-pet | OpenAI curated (Codex) | Create, repair, validate, visually QA, and package Codex-compatible v2 animated pets from character art, generated images, company or pro... | Codex | n/a (single) | real folder(s) | 0 |  | domain (Codex pets) |
| hyperframes | HyperFrames / HeyGen | Mandatory entry point: read this first for any request to make, create, edit, animate, or render a video, animation, or motion graphic, i... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-animation | HyperFrames / HeyGen | All animation knowledge for HyperFrames — atomic motion rules, multi-phase scene blueprints, scene transitions, broader motion-design tec... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-audio | HyperFrames / HeyGen | Use when audio already placed in a HyperFrames composition needs to be mixed: fade-in/fade-out, crossfade, track gain or volume, volume a... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-cli | HyperFrames / HeyGen | Use the HyperFrames CLI development loop: init, add, catalog, capture, lint, check, snapshot, compare, grade-compare, preview, play, pres... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-core | HyperFrames / HeyGen | The HyperFrames composition contract — build one renderable project. Use for composition structure, the `data-*` timing attributes, `clas... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-creative | HyperFrames / HeyGen | Non-animation creative direction for HyperFrames videos. Use for design spec (frame.md / design.md) handling, palettes, typography, narra... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-keyframes | HyperFrames / HeyGen | Use when a HyperFrames composition needs a punch-in, punch-out, zoom, reframe, Ken Burns treatment, camera move, visual match/whip handof... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-registry | HyperFrames / HeyGen | Search, install, and wire registry blocks and components into HyperFrames compositions. Use BEFORE hand-building any named visual — whene... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| hyperframes-studio | HyperFrames / HeyGen | Use when building or editing a HyperFrames project that people open in Studio: how the timeline should be laid out so it reads well (one ... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| imagegen | OpenAI (Codex system) | Generate or edit raster images when the task benefits from AI-created bitmap visuals such as photos, illustrations, textures, sprites, mo... | Codex.system | n/a (single) | real folder(s) | 3 |  | domain (images) |
| implement | Matt Pocock / aihero.dev | Implement a piece of work based on a spec or set of tickets. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | implement; TDD |
| improve-codebase-architecture | Matt Pocock / aihero.dev | Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | architecture; maintenance |
| loop | Cursor built-in | Run a prompt or skill in this session on a recurring or variable interval (e.g. /loop 5m /foo). | Agents | n/a (single) | real folder(s) | 7 |  | meta; maintenance (recurring) |
| loop-me | Matt Pocock / aihero.dev | Grill me about specs for the workflows I want to build, within this workspace. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true; argument-hint="A workflow to design, or nothing to go find one" | meta (workflow spec) |
| media-use | HyperFrames / HeyGen | Agent Media OS, the single skill for every media need in a HyperFrames project. Resolve BGM, SFX, image, icon, brand logo, voice, color g... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| migrate-to-shoehorn | Matt Pocock / aihero.dev | Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tes... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | maintenance; TDD |
| migrate-to-skills | Cursor built-in | Convert 'Applied intelligently' Codex rules (.cursor/rules/*.mdc) and slash commands (.cursor/commands/*.md) to Agent Skills format (.c... | Agents | n/a (single) | real folder(s) | 7 | disable-model-invocation=true | meta |
| motion-graphics | HyperFrames / HeyGen | A short, design-led motion graphic where motion is the message — kinetic typography, stat count-up, chart/data-viz hit, logo sting / bran... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| music-to-video | HyperFrames / HeyGen | Turn a music track (an audio file, a video to pull audio from, or a track generated from a mood brief) into a beat-synced video — lyric v... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| onboard | Cursor built-in | Use /onboard for a focused Codex onboarding flow that learns basic preferences, picks a first goal, and routes the user to the right ne... | Agents | n/a (single) | real folder(s) | 7 | disable-model-invocation=true | meta |
| open-code-review | alibaba/open-code-review | Performs AI-powered code review on Git changes using the `ocr` CLI from alibaba/open-code-review. Use when the user asks to review code, ... | Codex | n/a (single) | real folder(s) | 7 | metadata=author: alibaba; license=Apache-2.0 | review |
| open-code-review-delegate | alibaba/open-code-review | Delegation mode for open-code-review (OCR). Instead of OCR calling an LLM endpoint, this skill instructs the host agent to perform the co... | Codex | n/a (single) | real folder(s) | 7 | metadata=author: alibaba; license=Apache-2.0 | review |
| openai-docs | OpenAI (Codex system) | Use for Codex models/pricing, scheduled tasks, skills, settings, setup, troubleshooting, customization, automations, and self-knowledge—i... | Codex.system | n/a (single) | real folder(s) | 3 | metadata=short-description: "Codex models/pricing, scheduled tasks, skills, settings, setup, troubleshooting, and self-knowledge; OpenAI APIs and ChatGPT Work. 'You'/'this app' means Codex only." | research; meta |
| playwright | OpenAI curated (Codex) | Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction... | Codex | n/a (single) | real folder(s) | 2 |  | debug; TDD (browser QA) |
| plugin-creator | OpenAI (Codex system) | Create and scaffold plugin directories for Codex with a required `.codex-plugin/plugin.json`, optional plugin folders/files, valid manife... | Codex.system | n/a (single) | real folder(s) | 3 |  | meta |
| pr-to-video | HyperFrames / HeyGen | Turn a GitHub pull request (a PR URL, owner/repo#N, or 'this PR' in a checked-out repo) into a code-change explainer video — changelog, f... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| product-launch-video | HyperFrames / HeyGen | Turn a product or marketing URL, pasted script, or brief into a product launch / promo video — SaaS promos, feature reveals, product demo... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| prototype | Matt Pocock / aihero.dev | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels rig... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | research; spec |
| rename-chat | Cursor built-in | Rename the current chat to match its focus. Use only when the user invokes /rename-chat. Optional text after the command steers the title. | Agents | n/a (single) | real folder(s) | 7 | disable-model-invocation=true | meta |
| requirements-clarity | unknown | Clarify ambiguous requirements through focused dialogue before implementation. Use when requirements are unclear, features are complex (>... | Agents, Claude | yes | Claude=junction; others real | 2026-09-17 |  | clarify; spec |
| research | Matt Pocock / aihero.dev | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user want... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | research |
| resolving-merge-conflicts | Matt Pocock / aihero.dev | Use when you need to resolve an in-progress git merge/rebase conflict. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | implement; maintenance |
| review | Cursor built-in | Review code changes with the Bugbot or Security Review subagent. | Agents | n/a (single) | real folder(s) | 7 | disable-model-invocation=true | review; security |
| review-agent | OpenAI (Codex system) | Perform a read-only, defect-first review of a specified code change and return every actionable finding. Use when another agent delegates... | Codex.system | n/a (single) | real folder(s) | 3 |  | review |
| review-bugbot | Cursor built-in | Review code changes with Bugbot subagent. | Agents | n/a (single) | real folder(s) | 7 |  | review |
| review-security | Cursor built-in | Review code changes with Security Review subagent. | Agents | n/a (single) | real folder(s) | 7 |  | security |
| run-web | Project-local (custom) | Build, run, and drive the @suth/web Vue 3 SPA (login, dashboard, asset/print/expense screens). Use when asked to start the web app, take ... | Project | n/a (single) | real folder(s) | 8 |  | implement (run/verify app) |
| sandbox-sdk | Cloudflare | Build sandboxed applications for secure code execution. Load when building AI code execution, code interpreters, CI/CD systems, interacti... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare) |
| scaffold-exercises | Matt Pocock / aihero.dev | Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffol... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | domain (course authoring) |
| sdk | Cursor built-in | Guide users building apps, scripts, CI pipelines, or automations on top of the Codex SDK - TypeScript (`@cursor/sdk`) or Python (`curso... | Agents | n/a (single) | real folder(s) | 7 |  | domain (Cursor SDK) |
| setup-matt-pocock-skills | Matt Pocock / aihero.dev | Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once befor... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | scaffold; meta |
| setup-pre-commit | Matt Pocock / aihero.dev | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-c... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | scaffold; maintenance |
| setup-ts-deep-modules | Matt Pocock / aihero.dev | Wire dependency-cruiser into a TypeScript repo so each package is a deep module — implementation hidden in subfolders, reachable only thr... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | scaffold; architecture |
| shell | Cursor built-in | Runs the rest of a /shell request as a literal shell command. Use only when the user explicitly invokes /shell and wants the following ... | Agents | n/a (single) | real folder(s) | 7 | disable-model-invocation=true | meta |
| skill-creator | OpenAI (Codex system) | Create or update a Codex skill with appropriately scoped instructions and any needed supporting resources. | Codex.system | n/a (single) | real folder(s) | 3 | metadata=short-description: Create or update a skill | meta |
| skill-installer | OpenAI (Codex system) | Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, ... | Codex.system | n/a (single) | real folder(s) | 3 | metadata=short-description: Install curated skills from openai/skills or other repos | meta |
| slideshow | HyperFrames / HeyGen | Author a HyperFrames slideshow — a presentation, pitch deck, or interactive deck with discrete slides, fragment reveals, branching, hotsp... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-09-25 |  |  |
| split-to-prs | Cursor built-in | Split current work into small reviewable PRs. Use when the user asks to split a chat, set of changes, branch, or PR. | Agents | n/a (single) | real folder(s) | 7 |  | review; handover |
| statusline | Cursor built-in | Configure a custom status line in the CLI. Use when the user mentions status line, statusline, statusLine, CLI status bar, prompt foote... | Agents | n/a (single) | real folder(s) | 7 |  | meta |
| tdd | Matt Pocock / aihero.dev | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integr... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | TDD; implement |
| teach | Matt Pocock / aihero.dev | Teach the user a new skill or concept, within this workspace. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true; argument-hint="What would you like to learn about?" | domain (learning) |
| to-questionnaire | Matt Pocock / aihero.dev | Turn a decision you can't fully answer into a questionnaire for someone else to fill in. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | clarify; intake |
| to-spec | Matt Pocock / aihero.dev | Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you've alrea... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | spec |
| to-tickets | Matt Pocock / aihero.dev | Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the ... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | tickets/planning |
| triage | Matt Pocock / aihero.dev | Move issues and external PRs through a state machine of triage roles — categorise, verify, grill if needed, and write agent-ready briefs. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | intake/triage |
| turnstile-spin | Cloudflare | Set up Cloudflare Turnstile end-to-end in a project. Scan the codebase, create the widget via the Cloudflare API, embed it where user req... | Agents, Claude, Codex | NO: Codex=AFCCDCC3 Claude=AFCCDCC3 Agents=C8AFE66A | Claude=real; others real | 2026-08-17 |  | domain (Cloudflare); security |
| update-cli-config | Cursor built-in | View and modify Codex CLI configuration settings in ~/.cursor/cli-config.json. Use when the user wants to change CLI settings, configur... | Agents | n/a (single) | real folder(s) | 7 | metadata=surfaces: | meta |
| update-cursor-settings | Cursor built-in | Modify Codex/VSCode user settings in settings.json. Use when you want to change editor settings, preferences, configuration, themes, fo... | Agents | n/a (single) | real folder(s) | 7 | metadata=surfaces: | meta |
| wait-what | Matt Pocock / aihero.dev | Stop. That last message did not land — re-pitch it. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | clarify (repair) |
| wayfinder | Matt Pocock / aihero.dev | Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | tickets/planning; architecture |
| web-perf | Cloudflare | Analyzes web performance using Chrome DevTools MCP. Measures Core Web Vitals (LCP, INP, CLS) and supplementary metrics (FCP, TBT, Speed I... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | performance |
| wizard | Matt Pocock / aihero.dev | Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting... | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | deploy; scaffold (human steps) |
| workers-best-practices | Cloudflare | Reviews and authors Cloudflare Workers code against production best practices. Load when writing new Workers, reviewing Worker code, conf... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | review; domain (Cloudflare) |
| wrangler | Cloudflare | Cloudflare Workers CLI for deploying, developing, and managing Workers, KV, R2, D1, Vectorize, Hyperdrive, Workers AI, Containers, Queues... | Agents, Claude, Codex | yes | Claude=real; others real | 2026-08-17 |  | deploy; domain (Cloudflare) |
| writing-beats | Matt Pocock / aihero.dev | Writing, exploit — assemble raw material into a journey of beats, grounding each term before a beat leans on it. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | domain (writing) |
| writing-for-agents | Matt Pocock / aihero.dev | Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 |  | meta; docs |
| writing-fragments | Matt Pocock / aihero.dev | Writing, explore — mine raw fragments, no structure yet. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | domain (writing) |
| writing-shape | Matt Pocock / aihero.dev | Writing, exploit — shape raw material into an article, paragraph by paragraph. | Agents, Claude | yes | Claude=junction; others real | 2026-08-17 | disable-model-invocation=true | domain (writing) |


## 3. Plugin skills (Claude only; Anthropic)

Sources: `C:\Users\wayuo\.claude\plugins\marketplaces\claude-plugins-official` (real folders, modified 2026-09-26) and `...\plugins\synced\<workspace>\` (Cowork-synced knowledge-work plugins, 2026-09-23/26). All are real folders, none linked.

| Plugin | Skill | Purpose | Modified | Phase |
|---|---|---|---|---|
| discord | access | Manage Discord channel access — approve pairings, edit allowlists, set DM/group policy. Use when the user a... | 2026-09-26 | domain (chat channels) |
| discord | configure | Set up the Discord channel — save the bot token and review access policy. Use when the user pastes a Discor... | 2026-09-26 | domain (chat channels) |
| imessage | access | Manage iMessage channel access — approve pairings, edit allowlists, set DM/group policy. Use when the user ... | 2026-09-26 | domain (chat channels) |
| imessage | configure | Check iMessage channel setup and review access policy. Use when the user asks to configure iMessage, asks "... | 2026-09-26 | domain (chat channels) |
| telegram | access | Manage Telegram channel access — approve pairings, edit allowlists, set DM/group policy. Use when the user ... | 2026-09-26 | domain (chat channels) |
| telegram | configure | Set up the Telegram channel — save the bot token and review access policy. Use when the user pastes a Teleg... | 2026-09-26 | domain (chat channels) |
| claude-code-setup | claude-automation-recommender | Analyze a codebase and recommend Claude Code automations (hooks, subagents, skills, plugins, MCP servers). ... | 2026-09-26 | meta |
| claude-md-management | claude-md-improver | Audit and improve CLAUDE.md files in repositories. Use when user asks to check, audit, update, improve, or ... | 2026-09-26 | meta; docs |
| claude-security | claude-security | Claude Security: scan the codebase (the whole repository or a scoped part of it), scan changes (this branch... | 2026-09-26 | security |
| cwc-makers | cardputer-buddy | Iterate on the Cardputer-Adv MicroPython app bundle (Claude Buddy, Snake, Hello) after the device is alread... | 2026-09-26 | meta / domain |
| cwc-makers | m5-onboard | End-to-end onboarding for a freshly-plugged-in M5Stack ESP32 device (Cardputer, Cardputer-Adv, Core, CoreS3... | 2026-09-26 | meta / domain |
| example-plugin | example-command | An example user-invoked skill that demonstrates frontmatter options and the skills/<name>/SKILL.md layout | 2026-09-26 | meta / domain |
| example-plugin | example-skill | This skill should be used when the user asks to "demonstrate skills", "show skill format", "create a skill ... | 2026-09-26 | meta / domain |
| frontend-design | frontend-design | Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Help... | 2026-09-26 | implement (UI) |
| hookify | writing-rules | This skill should be used when the user asks to "create a hookify rule", "write a hook rule", "configure ho... | 2026-09-26 | domain (chat channels) |
| math-olympiad | math-olympiad | Solve competition math problems (IMO, Putnam, USAMO, AIME) with adversarial verification that catches the e... | 2026-09-26 | domain (chat channels) |
| mcp-server-dev | build-mcp-app | This skill should be used when the user wants to build an "MCP app", add "interactive UI" or "widgets" to a... | 2026-09-26 | domain (chat channels) |
| mcp-server-dev | build-mcp-server | This skill should be used when the user asks to "build an MCP server", "create an MCP", "make an MCP integr... | 2026-09-26 | domain (chat channels) |
| mcp-server-dev | build-mcpb | This skill should be used when the user wants to "package an MCP server", "bundle an MCP", "make an MCPB", ... | 2026-09-26 | domain (chat channels) |
| playground | playground | Creates interactive HTML playgrounds — self-contained single-file explorers that let users configure someth... | 2026-09-26 | prototype |
| plugin-dev | agent-development | This skill should be used when the user asks to "create an agent", "add an agent", "write a subagent", "age... | 2026-09-26 | domain (chat channels) |
| plugin-dev | command-development | This skill should be used when the user asks to "create a slash command", "add a command", "write a custom ... | 2026-09-26 | domain (chat channels) |
| plugin-dev | hook-development | This skill should be used when the user asks to "create a hook", "add a PreToolUse/PostToolUse/Stop hook", ... | 2026-09-26 | domain (chat channels) |
| plugin-dev | mcp-integration | This skill should be used when the user asks to "add MCP server", "integrate MCP", "configure MCP in plugin... | 2026-09-26 | domain (chat channels) |
| plugin-dev | plugin-settings | This skill should be used when the user asks about "plugin settings", "store plugin configuration", "user-c... | 2026-09-26 | domain (chat channels) |
| plugin-dev | plugin-structure | This skill should be used when the user asks to "create a plugin", "scaffold a plugin", "understand plugin ... | 2026-09-26 | domain (chat channels) |
| plugin-dev | skill-development | This skill should be used when the user wants to "create a skill", "add a skill to plugin", "write a new sk... | 2026-09-26 | domain (chat channels) |
| project-artifact | project-artifact | Generate and publish a project status artifact — an opinionated, tabbed status page for a project too big f... | 2026-09-26 | handover/docs |
| receipts | receipts | Generate a personal Claude Code usage & impact report ("receipts") from this machine's local session transc... | 2026-09-26 | meta |
| session-report | session-report | Generate an explorable HTML report of Claude Code session usage (tokens, cache, subagents, skills, expensiv... | 2026-09-26 | meta |
| skill-creator | skill-creator | Create new skills, modify and improve existing skills, and measure skill performance. Use when users want t... | 2026-09-26 | meta |
| cowork-plugin-management~g2 | cowork-plugin-customizer | Customize a Claude Code plugin for a specific organization's tools and workflows. Use when: customize plugi... | 2026-09-23 | meta / domain |
| cowork-plugin-management~g2 | create-cowork-plugin | Guide users through creating a new plugin from scratch in a cowork session. Use when users want to create a... | 2026-09-23 | meta / domain |
| data | analyze | Answer data questions -- from quick lookups to full analyses. Use when looking up a single metric, investig... | 2026-09-26 | domain (data) |
| data | build-dashboard | Build an interactive HTML dashboard with charts, filters, and tables. Use when creating an executive overvi... | 2026-09-26 | domain (data) |
| data | create-viz | Create publication-quality visualizations with Python. Use when turning query results or a DataFrame into a... | 2026-09-26 | domain (data) |
| data | data-context-extractor | Generate or improve a company-specific data analysis skill by extracting tribal knowledge from analysts. BO... | 2026-09-26 | domain (data) |
| data | data-visualization | Create effective data visualizations with Python (matplotlib, seaborn, plotly). Use when building charts, c... | 2026-09-26 | domain (data) |
| data | explore-data | Profile and explore a dataset to understand its shape, quality, and patterns. Use when encountering a new t... | 2026-09-26 | domain (data) |
| data | sql-queries | Write correct, performant SQL across all major data warehouse dialects (Snowflake, BigQuery, Databricks, Po... | 2026-09-26 | domain (data) |
| data | statistical-analysis | Apply statistical methods including descriptive stats, trend analysis, outlier detection, and hypothesis te... | 2026-09-26 | domain (data) |
| data | validate-data | QA an analysis before sharing -- methodology, accuracy, and bias checks. Use when reviewing an analysis bef... | 2026-09-26 | domain (data) |
| data | write-query | Write optimized SQL for your dialect with best practices. Use when translating a natural-language data need... | 2026-09-26 | domain (data) |
| engineering | architecture | Create or evaluate an architecture decision record (ADR). Use when choosing between technologies (e.g., Kaf... | 2026-09-26 | architecture |
| engineering | code-review | Review code changes for security, performance, and correctness. Trigger with a PR URL or diff, "review this... | 2026-09-26 | review |
| engineering | debug | Structured debugging session — reproduce, isolate, diagnose, and fix. Trigger with an error message or stac... | 2026-09-26 | debug |
| engineering | deploy-checklist | Pre-deployment verification checklist. Use when about to ship a release, deploying a change with database m... | 2026-09-26 | deploy |
| engineering | documentation | Write and maintain technical documentation. Trigger with "write docs for", "document this", "create a READM... | 2026-09-26 | handover/docs |
| engineering | incident-response | Run an incident response workflow — triage, communicate, and write postmortem. Trigger with "we have an inc... | 2026-09-26 | maintenance; debug |
| engineering | standup | Generate a standup update from recent activity. Use when preparing for daily standup, summarizing yesterday... | 2026-09-26 | handover |
| engineering | system-design | Design systems, services, and architectures. Trigger with "design a system for", "how should we architect",... | 2026-09-26 | architecture |
| engineering | tech-debt | Identify, categorize, and prioritize technical debt. Trigger with "tech debt", "technical debt audit", "wha... | 2026-09-26 | maintenance |
| engineering | testing-strategy | Design test strategies and test plans. Trigger with "how should we test", "test strategy for", "write tests... | 2026-09-26 | TDD; planning |
| operations | capacity-plan | Plan resource capacity — workload analysis and utilization forecasting. Use when heading into quarterly pla... | 2026-09-26 | domain (ops) |
| operations | change-request | Create a change management request with impact analysis and rollback plan. Use when proposing a system or p... | 2026-09-26 | deploy; planning |
| operations | compliance-tracking | Track compliance requirements and audit readiness. Trigger with "compliance", "audit prep", "SOC 2", "ISO 2... | 2026-09-26 | security; domain |
| operations | process-doc | Document a business process — flowcharts, RACI, and SOPs. Use when formalizing a process that lives in some... | 2026-09-26 | domain (ops) |
| operations | process-optimization | Analyze and improve business processes. Trigger with "this process is slow", "how can we improve", "streaml... | 2026-09-26 | domain (ops) |
| operations | risk-assessment | Identify, assess, and mitigate operational risks. Trigger with "what are the risks", "risk assessment", "ri... | 2026-09-26 | planning; security |
| operations | runbook | Create or update an operational runbook for a recurring task or procedure. Use when documenting a task that... | 2026-09-26 | handover/docs; deploy |
| operations | status-report | Generate a status report with KPIs, risks, and action items. Use when writing a weekly or monthly update fo... | 2026-09-26 | handover/docs |
| operations | vendor-review | Evaluate a vendor — cost analysis, risk assessment, and recommendation. Use when reviewing a new vendor pro... | 2026-09-26 | domain (ops) |


## 4. Lifecycle phase map

Canonical picks are in **bold**; the rest are alternatives or specialists.

| Phase | Skills |
|---|---|
| Intake / triage | **triage** (issues/PRs you did not write), to-questionnaire (intake from someone else), engineering:incident-response (production incidents) |
| Clarify | **grill-with-docs** (in a repo) / **grill-me** (no repo), both wrapping `grilling`; domain-modeling; requirements-clarity; wait-what (repair) |
| Research | **research** (background agent, cited MD file), prototype (runnable answer), openai-docs (Codex only), find-skills |
| Spec | **to-spec**; requirements-clarity (light alternative) |
| Tickets / planning | **to-tickets**; wayfinder (huge foggy efforts); operations:change-request; engineering:testing-strategy |
| Architecture | **codebase-design** (vocabulary), improve-codebase-architecture (survey), domain-modeling (glossary/ADR), engineering:architecture (ADR), engineering:system-design, setup-ts-deep-modules |
| Scaffold | setup-matt-pocock-skills (once per repo), setup-pre-commit, git-guardrails-claude-code, setup-ts-deep-modules |
| Implement | **implement** (drives tdd, then code-review, then commits), frontend-design plugin, resolving-merge-conflicts, finish-issue (suth only), run-web (suth only) |
| TDD | **tdd**, migrate-to-shoehorn, playwright (Codex, browser flows) |
| Debug | **diagnosing-bugs**; engineering:debug (lighter alternative) |
| Review | **code-review** (Standards + Spec, fixed point), simplify (built-in), review / review-bugbot (Cursor), open-code-review (Codex, alibaba), review-agent (Codex system), workers-best-practices (Cloudflare code) |
| Security | claude-security (plugin scan), security-review (built-in), review-security (Cursor), suth `security-reviewer` subagent, turnstile-spin, cloudflare-one |
| Performance | web-perf; diagnosing-bugs (perf regressions) |
| Deploy | wrangler, cloudflare, engineering:deploy-checklist, operations:change-request, wizard (human-only steps) |
| Handover / docs | engineering:documentation, operations:runbook, operations:process-doc, operations:status-report, engineering:standup, project-artifact, canvas (Codex), split-to-prs |
| Maintenance | improve-codebase-architecture, engineering:tech-debt, autopilot (Cursor PR upkeep), loop / schedule (recurring), setup-pre-commit |
| Session handoff | **handoff** (portable file), claude-handoff (spawns `claude --bg` agent), consolidate-memory / import-memory (Anthropic built-in) |
| Meta | ask-matt (router), writing-for-agents, skill-creator, create-skill, find-skills, loop-me, claude-automation-recommender, update-config |
| Domain-specific | Cloudflare (11), HyperFrames/video (18), Streamlit, data plugin (10), operations plugin, writing-beats/fragments/shape, teach, scaffold-exercises, hatch-pet, imagegen |

## 5. Overlaps that confuse auto-invocation, with a canonical pick

| Job | Competing skills | Recommendation |
|---|---|---|
| Interview / stress-test a plan | grill-me, grill-with-docs, grilling, requirements-clarity, loop-me | `grilling` is the primitive and the only one of the trio with model invocation enabled. `grill-me` and `grill-with-docs` are 2-line wrappers with `disable-model-invocation: true`. **Canonical: `/grill-with-docs` in a repo, `/grill-me` otherwise.** `requirements-clarity` is not from Matt, is model-invoked, and triggers on "unclear requirements", so it competes with grilling: set disable-model-invocation on it or delete it. `loop-me` is a workflow-spec grilling variant, keep manual-only. |
| Code review | Matt `code-review` (Standards + Spec, parallel subagents), `engineering:code-review` (plugin: security/perf/correctness), Cursor `review` / `review-bugbot` / `review-security`, Codex `open-code-review`, Codex `review-agent`, built-in `security-review`, `simplify` | **Canonical for Claude: Matt `code-review`** (it is what `implement` calls). Keep `security-review` / `claude-security` for security and `simplify` for cleanup. Ambiguity risk: `code-review` vs `engineering:code-review` share a name, so invoke the unqualified one. Cursor review skills and `open-code-review` are harness-specific; keep them out of Claude. |
| Recurring / looping | built-in `loop`, Cursor `loop` (in .agents, not visible to Claude), `schedule`, `loop-me`, `automate` (Cursor) | Different jobs: `loop` repeats a prompt on an interval; `schedule` creates cloud cron routines; `loop-me` designs a workflow spec (manual). **Canonical: built-in `loop` and `schedule`.** Collision only matters if `.agents\loop` were ever linked into Claude, so do not link it. |
| Handoff | handoff, claude-handoff, ask-matt's phase-boundary advice | **`handoff`** for new harness/dir/colleague; `claude-handoff` only when you want an immediate background Claude agent. Both manual-only, so no auto conflict. Note `handoff` writes to the OS temp dir, not the vault; copy durable handoffs into `D:\ai-playbook`. |
| Bug diagnosis | diagnosing-bugs, engineering:debug, playwright (UI repro) | **`diagnosing-bugs`** (feedback loop first). `engineering:debug` is a generic fallback. |
| Architecture | codebase-design, improve-codebase-architecture, engineering:architecture, engineering:system-design | codebase-design = vocabulary, improve-codebase-architecture = survey, engineering:architecture = ADR writing (overlaps domain-modeling's ADR duty). **Canonical for ADRs: `domain-modeling`** (matches the CONTEXT.md/ADR layout set up by the setup skill). |
| Docs / handover | engineering:documentation, operations:runbook, process-doc, project-artifact, canvas | No Matt equivalent. Pick per artifact: documentation for code, runbook for repeatable ops, project-artifact for a status page. |
| Skill authoring | skill-creator (plugin), create-skill (Cursor), writing-for-agents (Matt), plugin-dev:skill-development | **Canonical: `writing-for-agents` for style, `skill-creator` for scaffolding/evals.** |
| Video routing | hyperframes (entry) plus 9+ specialists | Not a real overlap: `hyperframes` is the mandatory router and the others say "Unclear -> /hyperframes". |
| Cloudflare | cloudflare, wrangler, workers-best-practices, durable-objects, agents-sdk, ... | Descriptions are mostly disjoint; `cloudflare` is the broad one and may pre-empt narrower ones. Keep. |

Context-cost note: the Cloudflare (11) and HyperFrames (18) groups are the bulk of model-visible descriptions in Claude. Consider moving them to per-project installs if triggers misfire.

## 6. Gaps

| Need | Current state | Suggestion |
|---|---|---|
| Deploy / release | Only Cloudflare-specific (wrangler, cloudflare), `engineering:deploy-checklist`, `operations:change-request` | Add a generic `release` / `ship` skill (build, tag, deploy, verify, rollback) with `finish-issue`-style checkpoints. |
| Release notes / changelog | None (only `pr-to-video`, which makes a video) | Add `release-notes` (from merged tickets/commits). |
| Handover to a human / client | `handoff` is agent-to-agent; `engineering:documentation` is generic | Add a `handover-pack` skill (README, runbook, access list, known issues), relevant to the suth/CAMPBANK repos. |
| Security audit | `claude-security` plugin, built-in `security-review`, suth `security-reviewer` subagent | Adequate; not consolidated across repos. Add dependency/secret audit only if needed. |
| Backup / restore | Nothing | Add a `backup-restore` skill (DB, uploads, env, vault); `operations:runbook` can template it. |
| Retro / lessons learned | Nothing (post-mortems live inside diagnosing-bugs and incident-response) | Add `retro`, feeding back into CONTEXT.md / ADRs. |
| DB / data-migration safety | Only project-local `domain-guardian` subagent (suth) | Generalise into a skill if reused across repos. |
| Per-repo setup | CAMPBANK and RubricLens have no skills; suth has 2 | Run `/setup-matt-pocock-skills` per repo; `to-spec`, `to-tickets`, `triage`, `wayfinder` all depend on it. |
| Stale trash | `.claude\skills\.trash` holds 1 entry | Ignore or purge manually. |

## 7. Claude vs Codex differences

| Aspect | Claude Code | Codex |
|---|---|---|
| Matt Pocock engineering skills (about 34) | Present via junctions to `.agents\skills` | **Absent** (no grilling, to-spec, to-tickets, implement, tdd, code-review, triage...). Codex cannot run the main flow unless they are linked in. |
| Cloudflare + HyperFrames | Real copies, 29 skills | Real copies, same 29; 27 identical to `.agents` |
| Drift | `cloudflare-email-service` and `turnstile-spin` match Codex's copy, but the `.agents` copy differs by one line (says "Codex" where the others say "Claude Code" / `.claude/skills`), a rebranding artefact | Same as Claude |
| Review | Matt code-review, simplify, security-review, plugins | `open-code-review` (+delegate) using alibaba's `ocr` CLI, and system `review-agent` (read-only, defect-first) |
| Browser / UI QA | Chrome MCP tools (not skills) | `playwright` skill |
| System / built-in | Built-ins (simplify, loop, schedule, update-config, claude-api...) plus 62 plugin skills | `.system`: imagegen, openai-docs, plugin-creator, review-agent, skill-creator, skill-installer (2026-09-23). Extra: hatch-pet |
| Cursor bundle in `.agents` | Not visible | Not in `.codex\skills` either; only readable by tools that scan `.agents\skills` |
| Manual-only skills | 20 visible | n/a for the missing set |

Project-local: `finish-issue` sits in suth's `.agents\skills` (visible to Codex/Cursor-style scanners, not to Claude Code), while `run-web` sits in `apps\web\.claude\skills` (Claude only). To use `finish-issue` in Claude, add a junction under `.claude\skills`.

## 8. Matt Pocock's intended workflow chain (from the SKILL.md bodies)

Bodies read: `ask-matt` (router) plus `PHASE-BOUNDARIES.md`, `grilling`, `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`, `triage`, `wayfinder`, `diagnosing-bugs`, `improve-codebase-architecture`, `handoff`, `claude-handoff`, `research`, `prototype`, `loop-me`, `setup-matt-pocock-skills`. (Read in whole or in the opening sections; the long ones were skimmed.)

**Precondition:** `/setup-matt-pocock-skills`, once per repo: picks the issue tracker (GitHub, GitLab or local markdown), the triage label vocabulary, and where `CONTEXT.md` / ADRs live. `to-spec`, `to-tickets`, `triage` and `wayfinder` tell you to run it if it is missing.

**Main flow (idea to ship):**
1. `/grill-with-docs` = `grilling` + `domain-modeling`. Rounds of numbered questions, each with a recommended answer; facts are found by sub-agents, decisions are yours; it writes the `CONTEXT.md` glossary and ADRs. (`/grill-me` is the same but stateless.)
2. Optional detour when a question needs a runnable answer: `/handoff` out, `/prototype` (logic HTML demo or UI variants; throwaway, kept on a `prototype/<name>` branch), `/handoff` back.
3. Multi-session build: `/to-spec` (synthesis only, no interview: problem, solution, user stories, decisions, test seams; published with `ready-for-agent`), then `/to-tickets` (tracer-bullet vertical slices with explicit blocking edges, quizzed with you; wide refactors are the exception). Single-session build: go straight to `/implement`.
4. `/implement` per ticket, `/clear` between tickets. It uses `/tdd` at pre-agreed seams (typecheck often, single test files, full suite once), then `/code-review` (Standards + Spec, parallel sub-agents), then commits.
Keep steps 1-3 in one context window (the "smart zone", about 150k tokens); compact only at phase boundaries.

**On-ramps:**
- `/triage`: raw issues and PRs written by others go through a state machine into agent-ready briefs. Do not triage `to-tickets` output.
- `/diagnosing-bugs`: build a tight red feedback loop first, then fix with a regression test; hands off to improve-codebase-architecture if there is no seam to lock the bug down.
- `/wayfinder`: for a huge foggy effort, chart a map issue with decision tickets (plan, don't do), then hand off to `/to-spec` and continue on the main flow.

**Health and vocabulary:** `/improve-codebase-architecture` (find deepening opportunities, then grill one) built on `/codebase-design` (module, interface, depth, seam, adapter, leverage, locality); `/domain-modeling` (glossary + ADRs).

**Standalone:** `/research` (background agent, cited MD file), `/to-questionnaire` (outbound interview for someone else), `/wizard` (human-only steps as an interactive bash script), `/wait-what` (re-pitch a message that did not land), `/teach`, `/writing-for-agents`, `/resolving-merge-conflicts`, `/loop-me` (design workflows), writing trio (`writing-fragments` to `writing-beats` to `writing-shape`).

**Phase-boundary decision tree** (`PHASE-BOUNDARIES.md`), first yes wins: 1) Continue if the next phase needs this one as a primary source or fits in the smart zone; 2) `/clear` if the context is disposable; 3) `/handoff` only for a new harness, directory, colleague or mid-phase fork; 4) subagent if it can run AFK (e.g. review); 5) otherwise `/compact` (the default, not the first reach).

**Project-local extension:** suth's `finish-issue` (manual-only) extends this chain. It drives an approved issue through the tdd loop, regression checks and Standards/Spec review to a human handoff, keeps a checkpoint file, and refuses to edit on `main`. The suth subagents (`check-runner`, `domain-guardian`, `security-reviewer`) plug into the review step.

## 9. Recommendations (short)
1. Keep `.agents\skills` as the single source; convert the 30 real Claude copies (and Codex copies) of Cloudflare/HyperFrames/Streamlit skills to junctions, or delete the ones you do not need, to stop drift.
2. Neutralise `requirements-clarity` (model-invoked, unknown origin) so it does not compete with `grilling`.
3. Do not link Cursor built-ins into Claude: `loop` and `review` would collide with built-ins.
4. Run `/setup-matt-pocock-skills` in CAMPBANK and RubricLens before using the main flow there.
5. Fill gaps: release-notes, handover-pack, backup-restore, generic release/deploy, retro.
