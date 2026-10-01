# Skills cleanup proposal (APPLIED 2026-10-01: sections B1–B3, C1, C2; B4 plugins not applied)

Date: 2026-10-01. Source: `research/05-skills-inventory.md` (scan 2026-09-30) and `research/07-review.md`.
Goal: stop the "skill descriptions shortened to fit the listing budget" warnings so the lifecycle skills (grilling, tdd, code-review...) are always auto-discoverable with full descriptions.

## Principles
1. **Never delete.** "Retire" = move to a trash folder outside every scanned skills directory. Restore = move back.
2. **Manual-only** = add `disable-model-invocation: true` to the SKILL.md frontmatter. The skill stays available as `/name`, but its description stops costing listing budget (verify with `/context` before and after; I did not measure it).
3. Canonical store is `C:\Users\wayuo\.agents\skills`. Claude reaches Matt Pocock skills through junctions; Codex reads `~/.agents/skills` directly (confirmed in 07-review). So copies in `~\.codex\skills` that are identical to `.agents` are pure duplicates.
4. Edit the **Claude-only real copy** (`~\.claude\skills\<name>`) when the skill is a real folder there; that does not affect Codex. Edit the **`.agents` copy** only for junction-backed skills (affects Claude and Codex both; acceptable for the few listed).
5. Junction warning: move junctions with `Move-Item` (moves the link). Never `Remove-Item -Recurse` a junction, never delete the target.

## Trash location and backups (create once, outside all scanned folders)
```
C:\Users\wayuo\.skills-trash\2026-10-01\claude\      # things parked from ~\.claude\skills
C:\Users\wayuo\.skills-trash\2026-10-01\codex\       # things parked from ~\.codex\skills
C:\Users\wayuo\.skills-trash\2026-10-01\agents\      # things parked from ~\.agents\skills
C:\Users\wayuo\.skills-trash\2026-10-01\backup-skillmd\   # copy of each SKILL.md before editing
```

## A. KEEP auto-invoked (lifecycle core, about 13 in Claude)
No change. These are the only ones that should keep a model-visible description.

| Skill | Path (Claude sees via junction unless noted) | Lifecycle role |
|---|---|---|
| grilling | `~\.claude\skills\grilling` -> `.agents` | clarify (primitive behind /grill-me, /grill-with-docs) |
| domain-modeling | `~\.claude\skills\domain-modeling` | glossary + ADRs |
| research | `~\.claude\skills\research` | research |
| prototype | `~\.claude\skills\prototype` | spec/feasibility |
| tdd | `~\.claude\skills\tdd` | implement |
| diagnosing-bugs | `~\.claude\skills\diagnosing-bugs` | debug |
| code-review | `~\.claude\skills\code-review` | review (canonical; `implement` calls it) |
| codebase-design | `~\.claude\skills\codebase-design` | architecture vocabulary |
| resolving-merge-conflicts | `~\.claude\skills\resolving-merge-conflicts` | git |
| git-guardrails-claude-code | `~\.claude\skills\git-guardrails-claude-code` | safety (once per machine, keep discoverable) |
| writing-for-agents | `~\.claude\skills\writing-for-agents` | AGENTS.md / skill authoring |
| find-skills | `~\.claude\skills\find-skills` | discovery |
| hyperframes | `~\.claude\skills\hyperframes` (real folder) | sole video entry point; all other video skills say "Unclear -> /hyperframes" |

Already manual-only (20+ via `disable-model-invocation: true`; leave as is): ask-matt, claude-handoff, handoff, grill-me, grill-with-docs, implement, improve-codebase-architecture, loop-me, setup-matt-pocock-skills, setup-ts-deep-modules, teach, to-questionnaire, to-spec, to-tickets, triage, wait-what, wayfinder, writing-beats, writing-fragments, writing-shape.

## B. MANUAL-ONLY (domain skills used rarely)

### B1. Cloudflare (11), real folders in `~\.claude\skills`
Edit each `C:\Users\wayuo\.claude\skills\<name>\SKILL.md`: add `disable-model-invocation: true` inside the frontmatter. Reversible: delete that line (original saved in `backup-skillmd`).
`agents-sdk`, `cloudflare`, `cloudflare-email-service`, `cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `sandbox-sdk`, `turnstile-spin`, `web-perf`, `workers-best-practices`, `wrangler`.
Why: hospital on-prem work does not use Cloudflare; only RubricLens does. `/cloudflare`, `/wrangler` still work when typed.

### B2. HyperFrames / video (17), real folders in `~\.claude\skills`
Same edit on `C:\Users\wayuo\.claude\skills\<name>\SKILL.md`:
`faceless-explainer`, `figma`, `general-video`, `hyperframes-animation`, `hyperframes-audio`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-registry`, `hyperframes-studio`, `media-use`, `motion-graphics`, `music-to-video`, `pr-to-video`, `product-launch-video`, `slideshow`.
(`hyperframes` itself stays auto, section A. Option for even more savings: make it manual too and type `/hyperframes` when needed.)

### B3. Other domain
| Skill | Path to edit | Note |
|---|---|---|
| developing-with-streamlit | `~\.claude\skills\developing-with-streamlit\SKILL.md` (real) | Streamlit only for analyst tools (see stacks/hospital-web.md section 8) |
| scaffold-exercises | `~\.agents\skills\scaffold-exercises\SKILL.md` (Claude reaches it by junction, so this edit is shared) | course authoring, not hospital work |
| migrate-to-shoehorn | `~\.agents\skills\migrate-to-shoehorn\SKILL.md` (shared) | rare test refactor |
| setup-pre-commit | `~\.agents\skills\setup-pre-commit\SKILL.md` (shared) | once per repo |
| wizard | `~\.agents\skills\wizard\SKILL.md` (shared) | rare; call `/wizard` |
| requirements-clarity | `~\.agents\skills\requirements-clarity\SKILL.md` (shared) | unknown origin, model-invoked, competes with `grilling` (05 section 5). Make manual, or retire (section D). |

### B4. Claude plugins (disable whole plugin; reversible with `/plugin` enable)
Per-skill control inside a plugin is not possible without editing the plugin cache (overwritten on sync), so work at plugin level. I did not verify the exact UI path for Cowork-synced plugins; check `/plugin` and Claude desktop plugin settings, then confirm with `/context`.
| Plugin (skills) | Proposal | Reason |
|---|---|---|
| data (10) | disable | analytics/BI skills; not in hospital web workflow; long descriptions |
| cowork-plugin-management (2) | disable | Cowork admin only |
| example-plugin (2), cwc-makers (2), math-olympiad (1) | disable | demo / hardware / competition math |
| discord, imessage, telegram (6: access, configure x3) | disable unless a channel is actually used | duplicate names `access`/`configure` |
| mcp-server-dev (3), plugin-dev (7), hookify (1) | disable; enable on demand when building plugins/MCP | rarely used; 11 descriptions |
| engineering (10), operations (9) | **keep for now** | useful gaps for hospital work: `engineering:documentation`, `deploy-checklist`, `incident-response`, `operations:runbook`, `change-request`, `compliance-tracking`, `risk-assessment` |
| frontend-design, claude-md-management, claude-code-setup, claude-security, playground, project-artifact, receipts, session-report, skill-creator | keep | small, useful |
If truncation persists after everything else, the next step is disabling `engineering` (its code-review/debug/architecture overlap Matt's) and calling the 4 useful ones via `operations`.

## C. RETIRE DUPLICATES (move to trash, never delete)

### C1. `~\.codex\skills` copies of `.agents` skills (29: 27 identical + 2 with a one-line branding diff), Codex already reads `~\.agents\skills`
Move `C:\Users\wayuo\.codex\skills\<name>` to `...\.skills-trash\2026-10-01\codex\<name>`:
`agents-sdk`, `cloudflare`, `cloudflare-email-service`, `cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `faceless-explainer`, `figma`, `general-video`, `hyperframes`, `hyperframes-animation`, `hyperframes-audio`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-registry`, `hyperframes-studio`, `media-use`, `motion-graphics`, `music-to-video`, `pr-to-video`, `product-launch-video`, `sandbox-sdk`, `slideshow`, `turnstile-spin`, `web-perf`, `workers-best-practices`, `wrangler` (the two that differ are `cloudflare-email-service` and `turnstile-spin`; the `.agents` copy is canonical, so they are covered too).
Caveat: before moving, confirm Codex really lists skills from `~\.agents\skills` on this machine (07-review says docs confirm it). Test: move one, start Codex, check it still sees `/hyperframes`.
**Keep in `.codex\skills`** (Codex-only): `hatch-pet`, `open-code-review`, `open-code-review-delegate`, `playwright`. Keep `.codex\skills\.system\*`.
Also consider making the Cloudflare/HyperFrames skills manual for Codex (Codex uses `agents/openai.yaml` with `policy.allow_implicit_invocation: false`; I have not verified this, check Codex skills docs first).

### C2. Cursor built-ins in `~\.agents\skills` (20, not visible to Claude; clutter Codex/Cursor listings, reference `.cursor/` paths)
Move `C:\Users\wayuo\.agents\skills\<name>` to `...\.skills-trash\2026-10-01\agents\cursor-builtins\<name>`:
`automate`, `autopilot`, `canvas`, `create-hook`, `create-rule`, `create-skill`, `create-subagent`, `loop`, `migrate-to-skills`, `onboard`, `rename-chat`, `review`, `review-bugbot`, `review-security`, `sdk`, `shell`, `split-to-prs`, `statusline`, `update-cli-config`, `update-cursor-settings`.
Confirm first that you do not use Cursor on this machine (history for Cursor was not analyzed). If you do, park only the ones that collide with Claude/Codex built-ins: `loop`, `review`, `shell`, `statusline`.

### C3. Stale
`C:\Users\wayuo\.claude\skills\.trash\1790436204690-26736-KYNaQI`: already a trash entry; leave.

## D. OVERLAPS: pick canonical (from 05 section 5)
| Job | Canonical | Others |
|---|---|---|
| Interview / stress-test | `grilling` via `/grill-with-docs` (repo) or `/grill-me` | `requirements-clarity` -> manual/retire; `loop-me` already manual |
| Code review | Matt `code-review` (what `implement` calls) | `engineering:code-review` same name, invoke unqualified; Cursor review skills parked (C2); `open-code-review` Codex-only |
| ADRs | `domain-modeling` | `engineering:architecture` (manual use only) |
| Bug diagnosis | `diagnosing-bugs` | `engineering:debug` fallback |
| Skill authoring | `writing-for-agents` (style) + `skill-creator` (scaffold) | Cursor `create-skill` parked |
| Recurring | built-in `loop`, `schedule` | Cursor `loop` parked (C2) so it never collides |
| Handoff | `handoff` (manual) | `claude-handoff` manual |
| Project-local | suth `finish-issue` (`D:\suth-helpdesk-assets\.agents\skills`) and `run-web` (`apps\web\.claude\skills`) | unchanged; to use `finish-issue` in Claude add a junction under `.claude\skills` of that repo |

## E. Apply script (for later, after you approve; DO NOT run as part of this proposal)
```powershell
# Review each block. Dry run first: add -WhatIf to Move-Item.
$d='2026-10-01'; $t="C:\Users\wayuo\.skills-trash\$d"
'claude','codex','agents','backup-skillmd' | % { New-Item -ItemType Directory -Force "$t\$_" | Out-Null }

function Set-Manual($skillMd) {                      # reversible: backup then insert one frontmatter line
  $name = Split-Path (Split-Path $skillMd) -Leaf
  Copy-Item $skillMd "$t\backup-skillmd\$name.SKILL.md"
  $c = Get-Content $skillMd -Raw -Encoding UTF8
  if ($c -notmatch '(?m)^disable-model-invocation:') {
    $c = $c -replace '^(---\r?\n)', "`$1disable-model-invocation: true`n"   # first frontmatter delimiter only
    [IO.File]::WriteAllText($skillMd, $c, (New-Object Text.UTF8Encoding $false))
  }
}
$claude='C:\Users\wayuo\.claude\skills'; $agents='C:\Users\wayuo\.agents\skills'
$b1='agents-sdk','cloudflare','cloudflare-email-service','cloudflare-one','cloudflare-one-migrations','durable-objects','sandbox-sdk','turnstile-spin','web-perf','workers-best-practices','wrangler'
$b2='faceless-explainer','figma','general-video','hyperframes-animation','hyperframes-audio','hyperframes-cli','hyperframes-core','hyperframes-creative','hyperframes-keyframes','hyperframes-registry','hyperframes-studio','media-use','motion-graphics','music-to-video','pr-to-video','product-launch-video','slideshow','developing-with-streamlit'
($b1+$b2) | % { Set-Manual "$claude\$_\SKILL.md" }
'scaffold-exercises','migrate-to-shoehorn','setup-pre-commit','wizard','requirements-clarity' | % { Set-Manual "$agents\$_\SKILL.md" }

# C1 duplicates in .codex
$dup='agents-sdk','cloudflare','cloudflare-email-service','cloudflare-one','cloudflare-one-migrations','durable-objects','faceless-explainer','figma','general-video','hyperframes','hyperframes-animation','hyperframes-audio','hyperframes-cli','hyperframes-core','hyperframes-creative','hyperframes-keyframes','hyperframes-registry','hyperframes-studio','media-use','motion-graphics','music-to-video','pr-to-video','product-launch-video','sandbox-sdk','slideshow','turnstile-spin','web-perf','workers-best-practices','wrangler'
$dup | % { Move-Item "C:\Users\wayuo\.codex\skills\$_" "$t\codex\$_" }
# C2 Cursor built-ins
New-Item -ItemType Directory -Force "$t\agents\cursor-builtins" | Out-Null
'automate','autopilot','canvas','create-hook','create-rule','create-skill','create-subagent','loop','migrate-to-skills','onboard','rename-chat','review','review-bugbot','review-security','sdk','shell','split-to-prs','statusline','update-cli-config','update-cursor-settings' | % { Move-Item "$agents\$_" "$t\agents\cursor-builtins\$_" }
```
**Restore any item:** `Move-Item "$t\codex\<name>" "C:\Users\wayuo\.codex\skills\<name>"` (same pattern for agents) or copy `backup-skillmd\<name>.SKILL.md` back over the edited SKILL.md.

## F. Verify after applying
1. Restart Claude Code; run `/context` and confirm no "descriptions shortened" warning and the A-list descriptions are intact.
2. Type `/cloudflare`, `/hyperframes-core`: manual skills must still run.
3. Start Codex; confirm `hyperframes` and `cloudflare` still appear (from `.agents`) and `playwright` still works.
4. Record the before/after counts in `research/05-skills-inventory.md` (a new dated note; do not overwrite).
5. Expected result: model-visible skills drop from about 155 unique to roughly 13 core + 28 plugin + built-ins. If budget is still tight, disable the `engineering` plugin (section B4) and consider raising the listing budget setting (not verified; check Claude Code settings docs).

## G. Gaps to fill later (not part of the cleanup)
Generic `release`/`ship`, `release-notes`, `handover-pack`, `backup-restore`, `retro` (05 section 6). The project templates in `templates/project/` (HANDOVER.md, RUN.md) cover the first two needs as documents until skills exist.
