# 02 - Tool mechanics: Claude Code vs OpenAI Codex (verified 2026-09-30/10-01)

> **Historical snapshot:** Findings and recommendations below belong to the date shown; they do not describe today's installed configuration.
> **Guard update (2026-10-05):** The playbook guard was removed at the user's request, and manual sync does not install it. See [guard status](../guardrails/README.md) and the [current workflow](../00-start-here.md).

Scope: shared "playbook vault" at `D:\ai-playbook` used by Claude Code (Desktop Code tab, CLI, VS Code) and Codex (CLI, VS Code). Windows 11.
Research was read-only. The only things executed: `--version`, `codex doctor`, `codex features list`, `codex execpolicy check` against a temp rules file, and a regex test of the guard script in a scratch folder. Nothing in the recommended setup (section 10) has been applied.
Legend: [DOC] = official doc fetched; [LOCAL] = observed on this machine; **UNVERIFIED** = not confirmed.
Caveat: doc pages were read through a summarising fetch tool. Where a summary looked wrong (e.g. the settings-reference examples for `permissions.deny` and `hooks`, which I discarded) I used the dedicated pages instead.

## 0. Key findings (read this first)

1. **Codex already loads `~/.agents/skills`.** [LOCAL] The newest Codex session log lists skill roots `r0=~/.codex/skills`, `r1=~/.agents/skills`, `r2=~/.codex/skills/.system`, plus plugin caches. tdd, grilling, research, create-hook etc. are in the session's skill list from `r1`. [DOC] agrees (USER scope is `$HOME/.agents/skills`). The premise "Codex lacks tdd/to-spec/triage" is only true of `~/.codex/skills`. to-spec, triage, to-tickets and wayfinder are *not in Codex's implicit skill list* because each has `agents/openai.yaml` with `policy.allow_implicit_invocation: false` (they are the "manual only" skills; Claude equivalent is `disable-model-invocation: true`). Explicit `$to-spec` should still work [DOC], not tested.
2. **Claude Code does NOT read `~/.agents/skills`** [DOC: skills page lists enterprise, `~/.claude/skills`, project, nested, `--add-dir`, plugin, claude.ai]. Hence the existing 37 junctions `~/.claude/skills/<name>` -> `~/.agents/skills/<name>`.
3. **Cleanest skill sharing = one canonical folder + per-skill directory junctions.** Junctions need no admin/Developer Mode and Claude Code follows them [LOCAL proof: 37 already work; DOC: symlinked skill folders followed].
4. **Sub-agents on Sonnet at high effort (Claude):** `model: sonnet` + `effort: high` in the agent's frontmatter. `sonnet` currently resolves to Sonnet 5.5 (default effort medium), so the `effort: high` line is required; the `modelSettings.claude-sonnet-5` entry in your settings does not cover Sonnet 5.5 (`claude-sonnet-5-5`). Do not set `CLAUDE_CODE_EFFORT_LEVEL` (it overrides frontmatter). No env var exists for subagent effort.
5. **Codex cannot run Sonnet.** Equivalent: custom agent TOML with `model = "gpt-6-luna"` (fast/cheap) or `gpt-6-sol`, `model_reasoning_effort = "high"`. Local model cache lists: gpt-6-astra (frontier, your main), gpt-6-sol (previous workhorse), gpt-6-luna (fast, affordable), gpt-5.6-*, gpt-5.5 (legacy). The doc example slug `gpt-6.1-sol` is NOT in the local model list; use local slugs.
6. **Guardrails that hold in bypass mode:** Claude: `permissions.deny` rules "block in every mode, including bypassPermissions" [DOC]; a PreToolUse hook exiting 2 "stops the tool call before permission rules are evaluated" [DOC]. Codex: hooks have "no separate full-access exemption" [DOC]; `.rules` are prefix-only (proved locally: `git push origin main --force` does not match `["git","push","--force"]`). Use hooks as the real layer, deny/rules as a cheap second layer. Whether Claude hooks fire in bypassPermissions is not stated in one sentence in the docs; the hooks page says PreToolUse runs "for every tool". **UNVERIFIED by live test, so run the smoke test in section 10.6.**
7. **Instruction single source of truth:** Claude `~/.claude/CLAUDE.md` containing an `@` import of the shared file (user-scope imports load without approval dialog). Codex `~/.codex/AGENTS.md` cannot import (no `@import` documented, **UNVERIFIED**), and on this machine it cannot be a link to D: (file symlinks need admin/Dev Mode; hardlinks cannot cross C: to D:). Recommendation: generated copy via a sync script, with a header marking it generated.
8. Current state is unguarded: Claude bypass + no deny rules/hooks; Codex `danger-full-access` + no forbidden rules + no hooks; `~/.codex/AGENTS.md` empty; no `~/.claude/CLAUDE.md`.

## 1. Verified local state [LOCAL]

| Item | Finding |
|---|---|
| Versions | Claude Code 2.1.283; codex-cli 0.157.1 (0.159.2 available, `codex doctor`) |
| `~/.claude/CLAUDE.md` | absent |
| `~/.codex/AGENTS.md` | present, **0 bytes** (Codex skips empty files [DOC]) |
| Custom agents / hooks | none: no `~/.claude/agents`, no `~/.codex/agents`, no `~/.codex/hooks.json`, no `hooks` key in Claude settings |
| `~/.claude/skills` | 69 entries: 37 junctions -> `C:\Users\wayuo\.agents\skills\<name>`; ~30 real dirs (hyperframes*, cloudflare*, wrangler, etc. from plugins/installers); `synced`, `.trash` |
| `~/.agents/skills` | 87 real dirs, includes Cursor-style ones (create-hook, create-rule, create-skill, create-subagent, review-bugbot, statusline, shell, sdk, update-cursor-settings...). 27 of 87 have `disable-model-invocation: true`; those carry `agents/openai.yaml` with `allow_implicit_invocation: false` |
| `~/.codex/skills` | 34 entries: `.system` (bundled imagegen, openai-docs, plugin-creator, skill-creator, skill-installer), 29 that duplicate names in `~/.agents/skills`, and 5 Codex-only (`hatch-pet` (disabled in config), `open-code-review`, `open-code-review-delegate`, `playwright`, `.system`) |
| Codex skill list in live session | r1 (`~/.agents/skills`) supplied 67 unique skills, r0 (`~/.codex/skills`) 32, plus many plugin-cache roots (285 unique entries). Duplicated names therefore consume listing budget twice (dedupe behaviour **UNVERIFIED**) |
| `~/.claude/settings.json` | `model: opus`, `effortLevel: medium`, `modelSettings` for claude-sonnet-5 (high), claude-opus-5 (medium), claude-opus-5-5 (medium), `cleanupPeriodDays: 365`, `skipDangerousModePermissionPrompt: true`, `switchModelsOnFlag: true`, `agentPushNotifEnabled: true`, `autoUpdatesChannel: latest`, `enabledPlugins: {}`, extra marketplace `claude-plugins-official`. No permissions, hooks, env |
| `~/.codex/config.toml` | `model = "gpt-6-astra"`, `model_reasoning_effort = "high"`, `sandbox_mode = "danger-full-access"`, `approvals_reviewer = "user"`, `[windows] sandbox = "unelevated"`, ~40 `[projects.*] trust_level = "trusted"` including `d:\` and `c:\users\wayuo` (so anything under D: is trusted, which means project-scoped `.codex/` hooks/config would load), plugins from bundled/primary-runtime/`claude-cowork` marketplaces, MCP `node_repl` and `stitch` (HTTP; its API key header is configured in the file: treat as secret, not printed), one `[[skills.config]]` disabling hatch-pet |
| `~/.codex/rules/default.rules` | 30 KB of auto-added `allow` prefix rules; zero `forbidden` |
| Claude transcripts | `~/.claude/projects/<project>/<session>.jsonl`, 22 projects, 185 files; `.last-cleanup` = 2026-09-29 |
| Codex sessions | `~/.codex/sessions/YYYY/MM/DD/rollout-<ts>-<uuid>.jsonl`: 450 files, **1.32 GB**, no auto-prune evidence; plus `archived_sessions/`, `session_index.jsonl`, `history.jsonl`, sqlite state DBs. `codex doctor` warns about rollouts in state DB and a stale app-server socket |
| Codex feature flags | `hooks` stable/on, `multi_agent` stable/on, `multi_agent_v2` stable/off, `memories` stable/**off**, `skill_search` on, `plugins` on, `goals` on, `guardian_approval` on |
| Windows | Developer Mode not enabled (registry key absent), so file symlinks need admin; Node v24.18.0, Python 3.14.6, git 2.56 present; `core.symlinks` unset |
| `D:\ai-playbook` | git repo exists; `.gitignore` excludes `_inbox/`, `.env*` (except `.env.example`), zips |
| Plugin format | `~/.codex/plugins/cache/claude-cowork/<plugin>/` contains BOTH `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` plus `skills/`, and the marketplace file is `.agents/plugins/marketplace.json`. Shows dual-format plugins are practical |

## 2. Comparison tables per question

### Q1. Instruction files

| | Claude Code | Codex |
|---|---|---|
| Files | `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`, `.claude/rules/*.md` (optional `paths:` frontmatter), managed `C:\Program Files\ClaudeCode\CLAUDE.md` | `~/.codex/AGENTS.override.md` else `~/.codex/AGENTS.md`; per directory git-root to cwd: `AGENTS.override.md`, else `AGENTS.md`, else `project_doc_fallback_filenames` |
| Reads the other tool's file? | Yes since v2.1.277: reads `AGENTS.md` **only if no CLAUDE.md/CLAUDE.local.md in cwd or above** (user `~/.claude/CLAUDE.md` does not count). Setting "Project instructions" = `claude-md-and-agents-md` reads both (via `/config` or `pluginConfigs."agents-md@builtin".options.instructionFiles`). Does not read `AGENTS.override.md`, `AGENTS.local.md`, `.agents/` | Only `AGENTS.md`/override, unless you add `project_doc_fallback_filenames = ["CLAUDE.md"]` (fallback applies per directory only when AGENTS.md is absent) |
| Imports | `@path`, relative to the containing file or absolute, recursive max 4 hops, skipped inside code spans/blocks; user-scope imports need no approval; project imports outside cwd need a one-time approval | none documented (**UNVERIFIED**) |
| Precedence | All concatenated; root to cwd; closer to cwd read last; nested subdirectory files load on demand when files there are read. Conflicts are not resolved (model may pick either) | Concatenated root to cwd; closer files later; one file per directory; rebuilt every run |
| Size | Target < 200 lines/file; files > 4 MiB skipped; startup warning when too long. Auto-memory `MEMORY.md` capped at 200 lines / 25 KB | `project_doc_max_bytes` default 32 KiB combined; further files dropped once reached |
| Enforced? | No, context only; use hooks/deny for enforcement | No, same |
| Sub-agents | Non-fork subagents load the CLAUDE.md hierarchy (and AGENTS.md) unless `omitClaudeMd: true`; Explore/Plan skip them | Not documented (**UNVERIFIED**) |
| Sources | code.claude.com/docs/en/memory | learn.chatgpt.com/docs/agent-configuration/agents-md |

Single-source recommendation: write the shared rules once in `D:\ai-playbook\instructions\core.md`. Claude: `~/.claude/CLAUDE.md` = one line `@D:/ai-playbook/instructions/core.md` plus Claude-only lines. Codex: `~/.codex/AGENTS.md` = generated copy. Keep each under 200 lines and under 32 KiB. For repos, commit an `AGENTS.md` and a `CLAUDE.md` whose first line is `@AGENTS.md` (doc-recommended; symlinks are discouraged on Windows by the Claude docs).

### Q2. Skills

| | Claude Code | Codex |
|---|---|---|
| Format | `SKILL.md` + YAML frontmatter; follows agentskills.io. Extra fields: `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `effort`, `context: fork`, `agent`, `paths`, `hooks`, `when_to_use`, `arguments`, `shell`... | `SKILL.md` with `name`, `description`; optional `agents/openai.yaml` (`interface`, `policy.allow_implicit_invocation` default true, `dependencies.tools`) |
| Directories | `~/.claude/skills/<n>/` (personal), `.claude/skills/<n>/` (project, nested ones load lazily), `--add-dir` dirs' `.claude/skills`, plugin skills, enterprise, claude.ai synced (`~/.claude/skills/synced`). **Not `~/.agents/skills`** | Repo: `$CWD/.agents/skills`, parent dirs, `$REPO_ROOT/.agents/skills`; user `~/.agents/skills`; admin `/etc/codex/skills`; bundled system; plus `~/.codex/skills` and plugin caches [LOCAL proof, doc omits `~/.codex/skills`] |
| Auto-invocation | Description in listing; model loads body when relevant. Off per skill with `disable-model-invocation: true` or `skillOverrides`. Listing text per skill capped at 1,536 chars; listing shares a char budget (`skillListingBudgetFraction`, `SLASH_COMMAND_TOOL_CHAR_BUDGET`); `/skill-doctor` shows cost | Implicit by description; list capped at ~2% of context or 8,000 chars [DOC]; off with `allow_implicit_invocation: false`. Explicit: `$skill` (CLI), `/skills` |
| Limits | spec: name <= 64 chars lowercase/digits/hyphens matching dir name, description <= 1024, body < 500 lines/5k tokens advised | same spec |
| Junction/symlink | Symlinked skill folders followed, same target loaded once [DOC]; 37 junctions work [LOCAL] | "supports symlinked skill folders" [DOC]; junction-to-Codex untested (**UNVERIFIED**, but `~/.agents/skills` itself is real dirs) |
| Live reload | yes, watches skill dirs within the session | auto-detect; restart if not shown |
| Disable one | `skillOverrides` in settings | `[[skills.config]] path=...\SKILL.md enabled=false` (restart) |
| Sources | code.claude.com/docs/en/skills; agentskills.io/specification | learn.chatgpt.com/docs/build-skills.md |

Portability rule: keep frontmatter to spec fields (`name`, `description`, optional `license`, `compatibility`, `metadata`) plus Claude-only fields you actually need; put Codex policy in `agents/openai.yaml`. Current skills already do this (27 skills carry both).

### Q3. Sub-agents / custom agents

| | Claude Code | Codex |
|---|---|---|
| Definition | Markdown + YAML frontmatter in `~/.claude/agents/*.md` (user), `.claude/agents/*.md` (project), plugin `agents/`, `--agents '{json}'`, managed. Priority: managed > `--agents` > project > user > plugin | TOML file per agent in `~/.codex/agents/*.toml` or `.codex/agents/*.toml`; required `name`, `description`, `developer_instructions`; any config key allowed (`model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, `skills.config`) |
| Fields | `name`, `description`, `tools`, `disallowedTools`, `model` (sonnet/opus/haiku/fable/full id/inherit), `effort` (low/medium/high/xhigh/max), `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `omitClaudeMd`, `isolation: worktree`, `color` | see left |
| Invocation | Auto-delegation by description; `@agent-<name>`; "use the X subagent"; `claude --agent X` or `"agent": "X"` in settings for the whole session; skill with `context: fork` + `agent:` | Ask in prompt ("spawn one agent per point, use reviewer"); skills/AGENTS.md can instruct delegation. Built-ins `default`, `worker`, `explorer`; custom with same name overrides |
| Model precedence | per-call `model` > definition `model` > `CLAUDE_CODE_SUBAGENT_MODEL` > main model. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` makes the env var win. Same-family alias (`opus` while main is opus) runs on main's exact model | definition `model` else `[agents] default_subagent_model` else parent |
| Effort | frontmatter `effort` overrides session effort, but not `CLAUDE_CODE_EFFORT_LEVEL`; `maxEffortLevel` can cap. No subagent-effort env var | `model_reasoning_effort` in the agent TOML, or `[agents] default_subagent_reasoning_effort` |
| Permissions | If main is bypass/acceptEdits/auto, subagent inherits that mode and ignores its own `permissionMode` | Inherit parent sandbox/approval; agent file `sandbox_mode` can tighten |
| Limits | nesting depth 3 (env `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`), max 20 concurrent, background by default since v2.1.195-ish | `[agents] max_concurrent_threads_per_session`; `multi_agent` flag on locally |
| Sources | code.claude.com/docs/en/sub-agents, model-config | learn.chatgpt.com/docs/agent-configuration/subagents.md, config-reference.md |

### Q4. Hooks / guardrails / sandbox

| | Claude Code | Codex |
|---|---|---|
| Events | SessionStart, Setup, SessionEnd, UserPromptSubmit, UserPromptExpansion, Stop, StopFailure, **PreToolUse**, PostToolUse, PostToolUseFailure, PostToolBatch, PermissionRequest, PermissionDenied, Notification, SubagentStart/Stop, TaskCreated/Completed, TeammateIdle, Worktree*, CwdChanged, FileChanged, InstructionsLoaded, ConfigChange, Pre/PostCompact, Pre/PostModelSwitch, Elicitation* | PreToolUse, PermissionRequest, PostToolUse, PreCompact, PostCompact, UserPromptSubmit, SubagentStop, Stop, Interrupt, SessionStart, SessionEnd, SubagentStart |
| Location | `~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json`, plugin `hooks/hooks.json`, skill/agent frontmatter, managed | `~/.codex/hooks.json` or `[hooks]` in `~/.codex/config.toml`; project `.codex/hooks.json`/`config.toml` (only when project trusted); plugins |
| Types | command (shell or exec form with `args`), http, mcp_tool, prompt, agent | command (`command`, `commandWindows`, `timeout`, `statusMessage`) |
| Block | exit 2 + stderr, or JSON `hookSpecificOutput.permissionDecision: "deny"`; matcher on tool name; `if: "Bash(rm *)"` filter; Windows: `"shell":"powershell"` or exec form `command:"node", args:[...]` | exit 2 + stderr, or same deny JSON; matcher regex on tool name (`^Bash$`, `apply_patch`/`Edit`/`Write` for edits, MCP tools) |
| Trust | project hooks need workspace trust | non-managed hooks are hash-trusted; new/changed hooks skipped until reviewed in `/hooks`; `--dangerously-bypass-hook-trust` exists |
| In bypass/full-access | Deny rules apply in every mode; blocking hook precedes permission rules; bypass also skips protected-path prompts. Hook-in-bypass statement not explicit: **UNVERIFIED live** | "no separate full-access exemption for hooks" [DOC] |
| Static rules | `permissions.deny/ask/allow`; deny > ask > allow; `Read(.env)`, `Edit(**/.env)` path rules (Windows drive paths as `//c/**`); Bash rules are "not a security boundary" (wrappers, other forms evade) | `~/.codex/rules/*.rules` Starlark `prefix_rule(pattern=[...], decision="allow|prompt|forbidden")`, most restrictive wins; **prefix-only** (LOCAL-tested); whether enforced under `danger-full-access` **UNVERIFIED** |
| Sandbox / modes | Modes: default(Manual), acceptEdits, plan, auto (classifier; default in interactive terminal/VS Code from v2.1.283), dontAsk, bypassPermissions. Bash sandbox only macOS/Linux/WSL2. `permissions.disableBypassPermissionsMode: "disable"` (managed) | `sandbox_mode` read-only / workspace-write / danger-full-access; `approval_policy` on-request / never / granular (untrusted retired); `--yolo`; `[windows] sandbox = unelevated|elevated`; `.git`, `.codex`, `.agents` protected in writable roots; network off by default in workspace-write |
| Sources | code.claude.com/docs/en/hooks, permissions, permission-modes | learn.chatgpt.com/docs/hooks.md, agent-configuration/rules.md, agent-approvals-security.md |

Note on auto mode: Claude docs say auto mode blocks destructive git and `rm -rf` on unresolved variables, but it is not your current mode (you use bypass). Consider `auto` instead of bypass for normal work; it is the documented middle ground and the default on v2.1.283 for interactive terminals/VS Code.

### Q5. Plugins, marketplaces, skills ecosystem

| | Claude Code | Codex |
|---|---|---|
| Unit | Plugin = skills + agents + hooks + MCP + LSP + output styles; `.claude-plugin/plugin.json` | Plugin = skills + MCP + hooks + apps/extensions; `.codex-plugin/plugin.json` |
| Marketplace | `/plugin marketplace add owner/repo|url|path`; `/plugin install x@mkt`; shell `claude plugin ...`; scopes user/project/local; official `claude-plugins-official`; auto-update on for official only; `claude plugin details`, `claude plugin eval` (v2.1.263+) | `/plugins` browser; `codex plugin`; `[marketplaces.*]` and `[plugins."x@mkt"]` in config.toml; repo marketplace file `.agents/plugins/marketplace.json` [LOCAL] |
| Cross-tool | Desktop, CLI, VS Code share plugins | Codex here already consumes Claude-format plugins from `claude-cowork` marketplace [LOCAL] (dual manifests) |
| Security | "A plugin can run hooks and MCP servers, so read the pane before you install" | hooks hash-trusted |
| Sources | code.claude.com/docs/en/discover-plugins | learn.chatgpt.com/docs/plugins.md (thin; format details **UNVERIFIED**; the fetch of build-plugins.md hit the usage limit) |

`npx skills` (vercel-labs/skills, https://github.com/vercel-labs/skills; skills.sh directory): `npx skills add <owner/repo> [-g] [-a claude-code -a codex] [-s name] [--copy] [-y]`, `list`, `find`, `remove`, `update`, `init`. Installs one canonical copy and symlinks into each agent's dir (recommended) or copies. Its documented Codex global path (`~/.codex/skills`) differs from the Codex doc (`~/.agents/skills`), and its symlinks need Developer Mode/admin on Windows (use `--copy`, or install to a scratch dir and junction yourself). Collects anonymous telemetry unless `DISABLE_TELEMETRY=1` / `DO_NOT_TRACK=1`. Treat third-party skills as executable supply chain: read SKILL.md and scripts before enabling. agentskills.io = the open spec both tools follow (fields in Q2).

### Q6. MCP servers (solo dev, hospital web apps)

| Server | Why | Claude Code | Codex | Cautions |
|---|---|---|---|---|
| GitHub (`https://api.githubcopilot.com/mcp/`) | PRs/issues | `claude mcp add --scope user --transport http github https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer ${GITHUB_TOKEN}"` or OAuth via `/mcp` | `[mcp_servers.github] url="https://api.githubcopilot.com/mcp/" bearer_token_env_var="GITHUB_TOKEN"` (key names per Codex MCP doc) | fine-grained PAT, single repo, read-only header `X-MCP-Readonly: true` unless writing; you may not need it if `gh` CLI suffices |
| Playwright (`@playwright/mcp@latest`) | UI verification | `claude mcp add playwright -- cmd /c npx @playwright/mcp@latest` (Windows `cmd /c` note [DOC]) | `[mcp_servers.playwright] command="npx" args=["@playwright/mcp@latest"]` (Codex also ships a `playwright` skill) | "not a security boundary"; use `--isolated --headless --allowed-origins "http://localhost:*"` style flags; never point at hospital production/PHI; persistent profile lives under `%USERPROFILE%\AppData\Local\ms-playwright` |
| Context7 (`https://mcp.context7.com/mcp`, tools resolve-library-id, query-docs) | version-correct library docs | `claude mcp add --transport http context7 https://mcp.context7.com/mcp --header "Authorization: Bearer ${CONTEXT7_API_KEY}"` | `[mcp_servers.context7] command="npx" args=["-y","@upstash/context7-mcp"] env_vars=["CONTEXT7_API_KEY"]` (from Codex MCP doc) | community-contributed docs, may be wrong/injected; free tier w/o key |
| Sentry hosted (`https://mcp.sentry.dev/mcp/{org}/{project}`, OAuth) | error triage | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp/<org>/<project>` then `claude mcp login sentry` | `codex mcp add sentry --url ...` then `codex mcp login sentry` | error payloads can contain PHI and injection text; hosted SaaS for hospital data is a policy question |
| Self-hosted alternative: GlitchTip (Sentry-API compatible) | keeps data on your server | community MCPs `hffmnnj/mcp-server-glitchtip`, `nikitatsym/glitchtip-mcp`; GlitchTip has a built-in MCP behind `GLITCHTIP_ENABLE_MCP` (from web search, **UNVERIFIED** against GlitchTip docs) | same | review community server code before use |
| Database | schema/query help | Supabase hosted `https://mcp.supabase.com/mcp?project_ref=<id>&read_only=true` (you already have a Supabase MCP in Claude); generic Postgres: `@bytebase/dbhub` with a read-only role (Claude doc example) | `codex mcp add supabase --url ...` + `codex mcp login supabase` | dev/staging only, read-only role, never production/PHI; prompt injection via DB content is the main risk per Supabase's own docs |

Config facts: Claude scopes local/project/user; `.mcp.json` supports `${VAR}` and `${VAR:-default}`; credential-named vars like `NPM_TOKEN` read empty, use your own names; project `.mcp.json` servers need approval; `claude mcp login/logout`; Desktop Code tab also reads `claude_desktop_config.json`. Codex: `[mcp_servers.<name>]` with `command/args/env/env_vars` or `url/bearer_token_env_var/http_headers/env_http_headers`, `enabled_tools`/`disabled_tools`, `startup_timeout_sec` (10), `tool_timeout_sec` (60), project `.codex/config.toml` only for trusted projects. Keep the token out of `config.toml` (your `stitch` entry stores its key header in the file; prefer `env_http_headers`).

### Q7. Session history and memory

| | Claude Code | Codex |
|---|---|---|
| Transcripts | `~/.claude/projects/<project>/<session>.jsonl`; prompts in `~/.claude/history.jsonl`; shared by CLI, Desktop, VS Code (`claude --resume`, `/resume`) | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`, `session_index.jsonl`, `history.jsonl`, sqlite state; `codex resume [--last]`, `codex fork`, `archive/unarchive/delete` |
| Retention | `cleanupPeriodDays`: default 30, minimum 1 (0 is a validation error), applies to transcripts, tool-result images, orphaned worktrees, teams task dirs; **does not** delete auto-memory, `history.jsonl`. You set 365. Desktop/Cowork transcripts kept unless `desktopSessionCleanupPeriodDays`. Transcripts unencrypted and contain any secret a tool printed | No documented auto-delete; 450 files/1.32 GB locally; `[history] persistence=save-all|none`, `max_bytes` [DOC config-reference] |
| Memory | Auto memory on by default: `~/.claude/projects/<project>/memory/MEMORY.md` (first 200 lines/25 KB loaded) + topic files; `autoMemoryEnabled`, `autoMemoryDirectory`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY`; subagent `memory:` field | `~/.codex/memories/` via `[features] memories` (currently **false** locally), `memories.generate_memories`, `use_memories`; redacts secrets |
| Privacy note | Hospital work: lower `cleanupPeriodDays` for repos handling PHI; `claude project purge` | `history.persistence="none"` option; add your own cleanup of rollouts |

### Q8. 2026 changes that matter (Claude weekly digest [DOC], Codex local flags)

- Claude Code: auto mode (Mar, research) became default permission mode for interactive terminal/VS Code in v2.1.283; `AGENTS.md` native read (v2.1.277) and `/import`; subagents background by default and can nest (Jun-Jul); fork mode default on (Aug); agent teams still **experimental**, need `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, CLI only (not Desktop); dynamic workflows/`ultracode` (May); agent view `claude agents`; `/goal`; routines (research preview, cloud, schedule/API/GitHub triggers, `/schedule`; Desktop "Local" scheduled tasks run on your PC); cross-session messaging; `--safe-mode`; `fallbackModel`; `modelSettings` per-model effort; `maxEffortLevel`; `/doctor prompt-audit`, `/skill-doctor`; `claude plugin eval`; plugin zip/URL loading; models Sonnet 5.5 / Opus 5.5 / Fable 5.1 (1M context).
- Codex: hooks stable, multi_agent stable, `multi_agent_v2`/`memories` off, plugins + remote plugins, `skill_search`, goals, guardian auto-review, Windows sandbox modes `unelevated|elevated|mxc`, scheduled tasks/cloud (docs list `automations`, `cloud`, not fetched).
- Practical: hold off on agent teams (token-heavy, experimental); use plain subagents; consider routines only for non-PHI repos.

## 3. Recommended setup (NOT executed). Paths use D:\ai-playbook as canonical store

### 3.1 Layout
```
D:\ai-playbook\
  instructions\core.md         # shared rules (<200 lines)
  instructions\claude-extra.md # Claude-only additions (optional)
  skills\<name>\SKILL.md       # canonical skills (agentskills.io frontmatter)
  agents\claude\*.md           # Claude sub-agent definitions
  agents\codex\*.toml          # Codex custom agents
  guardrails\guard.mjs         # shared PreToolUse hook (tested, see 3.5)
  guardrails\forbidden.rules   # Codex prefix rules
  scripts\sync.ps1             # idempotent linker/copier (3.7)
```

### 3.2 Instructions
Claude `C:\Users\wayuo\.claude\CLAUDE.md`:
```
@D:/ai-playbook/instructions/core.md
@D:/ai-playbook/instructions/claude-extra.md
```
(user-scope file, so no external-import dialog; verify with `/memory` or `/context`).
Codex: `sync.ps1` writes `C:\Users\wayuo\.codex\AGENTS.md` = "GENERATED from D:\ai-playbook, edit there" header + `core.md` content. Do not use a symlink (needs admin) or hardlink (C:/D: cross-volume). Re-run the script after edits; optionally call it from a git post-commit hook in the vault.
Per project: commit `AGENTS.md`; add `CLAUDE.md` containing `@AGENTS.md`.

### 3.3 Skills (robust, non-breaking)
1. Backup first: copy `~/.agents/skills`, `~/.claude/skills`, `~/.codex/skills` to a dated folder.
2. Move the skills you own into `D:\ai-playbook\skills\<name>` (keep `~/.agents/skills` as the install target for third-party `npx skills` content until migrated).
3. For each canonical skill create junctions (no admin needed):
```powershell
New-Item -ItemType Junction -Path C:\Users\wayuo\.claude\skills\<name> -Target D:\ai-playbook\skills\<name>
New-Item -ItemType Junction -Path C:\Users\wayuo\.agents\skills\<name> -Target D:\ai-playbook\skills\<name>
```
   Claude gets it via `~/.claude/skills`, Codex via `~/.agents/skills` (already scanned). Existing 37 junctions can be re-pointed one at a time (`(Get-Item path).Delete()` only removes the junction, not the target; do NOT use `Remove-Item -Recurse` on a junction).
4. Leave `~/.claude/skills/synced`, `.trash`, plugin-installed real dirs and `~/.codex/skills/.system` alone. Do not junction the whole `skills` folder.
5. Then retire the 29 duplicates in `~/.codex/skills` (move to `.trash`) so Codex lists each skill once; keep `playwright`, `open-code-review*`, `.system`.
6. Manual-only skills: keep `disable-model-invocation: true` in frontmatter AND `agents/openai.yaml` `policy.allow_implicit_invocation: false`.
7. Validate each shared skill with `skills-ref validate` (agentskills.io) and check `/skills` in Claude, `/skills` in Codex.

### 3.4 Sub-agents: Sonnet at high effort
Claude `D:\ai-playbook\agents\claude\worker.md`, junctioned or copied to `C:\Users\wayuo\.claude\agents\worker.md` (directory junction `~\.claude\agents` -> vault folder is fine since the dir does not exist yet):
```markdown
---
name: worker
description: Delegated implementation, refactor, test-fixing and research tasks with a clear scope. Use for well-specified subtasks.
model: sonnet
effort: high
---
You are a focused implementation sub-agent. Follow the repo's CLAUDE.md/AGENTS.md. Report what changed, what you verified, and anything you could not verify.
```
To pin the exact model instead of the alias: `model: claude-sonnet-5-5`. To force ALL delegated/teammate/workflow agents to Sonnet (Explore, general-purpose included) add to `~/.claude/settings.json`:
```json
{ "env": { "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet" } }
```
(add `"CLAUDE_CODE_SUBAGENT_MODEL_FORCE": "1"` only if you also want to override agents that pick their own model). Built-in agents without an `effort` field still inherit the session effort (medium); if you want high there too, run the main session with `effortLevel: high` or define your own named agents. Add to `modelSettings`: `"claude-sonnet-5-5": {"effortLevel": "high"}` so that Sonnet 5.5 as a main model also defaults to high. Do not set `CLAUDE_CODE_EFFORT_LEVEL`.
Also add a line in core.md: "Delegate bounded subtasks to the `worker` sub-agent."

Codex `C:\Users\wayuo\.codex\agents\worker.toml` (or `.codex/agents/` per project):
```toml
name = "worker"
description = "Delegated implementation and test-fixing with a clear scope."
model = "gpt-6-luna"            # closest to Sonnet-tier: fast/affordable. Use gpt-6-sol for harder work
model_reasoning_effort = "high"
developer_instructions = """
Follow AGENTS.md. Keep scope tight. Report changes, verification, and gaps.
"""
```
Global defaults in `~/.codex/config.toml` (alternative to per-agent files):
```toml
[agents]
default_subagent_model = "gpt-6-luna"
default_subagent_reasoning_effort = "high"
max_concurrent_threads_per_session = 4
```
Codex sub-agents are only spawned when the prompt or AGENTS.md says so.

### 3.5 Guardrails (shared hook, tested with 30 sample inputs)
`D:\ai-playbook\guardrails\guard.mjs` (regex logic verified in scratch; live-hook behaviour not yet):
```js
#!/usr/bin/env node
// Shared PreToolUse guard for Claude Code and Codex. Reads hook JSON on stdin.
// Exit 2 + stderr message = block (works in both tools, in every permission mode).
import { readFileSync } from 'node:fs';

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8')); } catch { process.exit(0); }

const tool = String(input.tool_name || '');
const ti = input.tool_input || {};
const cmd = typeof ti.command === 'string' ? ti.command : (Array.isArray(ti.command) ? ti.command.join(' ') : '');
const blob = JSON.stringify(ti);

const shellRules = [
  [/\brm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r|-r\s+-f|-f\s+-r|--recursive\b[^\n]*--force|--force\b[^\n]*--recursive)/i, 'rm -rf'],
  [/\bRemove-Item\b[^\n]*-Recurse[^\n]*-Force|\bRemove-Item\b[^\n]*-Force[^\n]*-Recurse|\b(ri|del|rd|rmdir)\b[^\n]*\/s\b/i, 'recursive delete (PowerShell/cmd)'],
  [/\bgit\s+push\b[^\n]*(\s--force(?![-\w])|\s-f\b|\s\+[\w\/.-]+)/i, 'git push --force'],
  [/\bgit\s+reset\s+--hard\b/i, 'git reset --hard'],
  [/\bgit\s+clean\b[^\n]*-[a-z]*f/i, 'git clean -f'],
  [/\bgit\s+(checkout|restore)\s+(--\s+)?\.(\s|$)/i, 'git checkout/restore . (discard all changes)'],
  [/\bgit\s+branch\s+-D\b/i, 'git branch -D'],
  [/\bDROP\s+(TABLE|DATABASE|SCHEMA|VIEW|ROLE|USER)\b/i, 'SQL DROP'],
  [/\bTRUNCATE\b/i, 'SQL TRUNCATE'],
  [/\bDELETE\s+FROM\b(?![^;]*\bWHERE\b)/i, 'SQL DELETE without WHERE'],
  [/\bdocker\s+volume\s+(rm|prune)\b/i, 'docker volume rm/prune'],
  [/\bdocker\s+system\s+prune\b[^\n]*--volumes/i, 'docker system prune --volumes'],
  [/\bdocker[\s-]+compose\s+down\b[^\n]*(\s-v\b|--volumes)/i, 'docker compose down -v'],
  [/(>>?|\btee\b(\s+-a)?|Set-Content|Add-Content|Out-File|\bcp\b|\bmv\b|\bcopy\b|\bmove\b)[^\n|;&]*(^|[\s"'\/\\])\.env(\.(?!example\b|sample\b|template\b)[\w.-]+)?(\s|"|'|$)/i, 'writing a .env file'],
];

function envPath(p) {
  const base = String(p || '').split(/[\\/]/).pop().toLowerCase();
  return /^\.env(\..+)?$/.test(base) && !/\.(example|sample|template)$/.test(base);
}

let reason = null;
if (/^(Bash|PowerShell|shell|local_shell|exec_command|shell_command)$/i.test(tool) || cmd) {
  for (const [re, name] of shellRules) if (re.test(cmd)) { reason = name; break; }
}
if (!reason && /^(Write|Edit|MultiEdit|NotebookEdit|apply_patch)$/i.test(tool)) {
  if (envPath(ti.file_path) || envPath(ti.path) || envPath(ti.notebook_path)) reason = 'editing a .env file';
  else if (/\*\*\* (Add|Update|Delete) File: [^\n"]*\.env(?!\.(example|sample|template))(\.[\w.-]+)?(\\n|\s|")/i.test(blob)) reason = 'patching a .env file';
}
if (reason) {
  process.stderr.write(`BLOCKED by playbook guard: ${reason}. Ask the user to run this themselves or to approve an explicit exception.\n`);
  process.exit(2);
}
process.exit(0);
```
Test results: blocks rm -rf/-fr, Remove-Item -Recurse -Force, git push --force/-f/+ref, reset --hard, DROP/TRUNCATE/DELETE without WHERE, docker volume rm, compose down -v, `>> .env`, `Set-Content .env`, Write/Edit `.env`/`.env.local`, apply_patch on `.env`; allows `git push`, `--force-with-lease`, `git reset --soft`, `DELETE ... WHERE`, `docker compose down`, `.env.example`. Known limits: regex on command text only (obfuscation, scripts that delete internally, `python -c` evade); fails open on unparsable input; the apply_patch tool_input shape in Codex is **UNVERIFIED** (script scans the serialised input for patch headers).

Claude `~/.claude/settings.json` additions (exec form avoids Windows shell quoting):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell|Write|Edit|MultiEdit|NotebookEdit",
        "hooks": [
          { "type": "command", "command": "node", "args": ["D:/ai-playbook/guardrails/guard.mjs"] }
        ]
      }
    ]
  },
  "permissions": {
    "deny": [
      "Edit(**/.env)", "Edit(**/.env.*)", "Write(**/.env)", "Write(**/.env.*)",
      "Read(**/.env)", "Read(**/.env.*)",
      "Bash(git push --force *)", "Bash(git push -f *)", "Bash(git reset --hard *)",
      "Bash(rm -rf *)", "Bash(docker volume rm *)"
    ]
  }
}
```
(`.env.example` is also matched by `Read/Edit(**/.env.*)`; add `Read(!**/.env.example)` after them if you want to keep reading it. Bash deny patterns are fragile per the docs; the hook is the real layer. Drop the `Read` denies if you need Claude to read `.env` for debugging. Merge with the existing file; do not overwrite.)

Codex `C:\Users\wayuo\.codex\hooks.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^(Bash|apply_patch|Edit|Write)$",
        "hooks": [
          {
            "type": "command",
            "command": "node D:/ai-playbook/guardrails/guard.mjs",
            "commandWindows": "node D:\\ai-playbook\\guardrails\\guard.mjs",
            "timeout": 10,
            "statusMessage": "Playbook guard"
          }
        ]
      }
    ]
  }
}
```
Then open `/hooks` in Codex and trust it (hash-trusted; edits re-require trust). Codex `C:\Users\wayuo\.codex\rules\forbidden.rules` (second layer, prefix-only; tested syntax):
```python
prefix_rule(pattern=["git","push",["--force","-f"]], decision="forbidden", justification="no force push")
prefix_rule(pattern=["git","reset","--hard"], decision="forbidden", justification="no hard reset")
prefix_rule(pattern=["rm",["-rf","-fr"]], decision="forbidden", justification="no recursive delete")
prefix_rule(pattern=["docker","volume",["rm","prune"]], decision="forbidden", justification="no volume deletion")
```
Check with `codex execpolicy check --rules <file> -- git push --force origin main`. Whether rules load from files other than `default.rules` and apply under `danger-full-access` is **UNVERIFIED**; putting them in `default.rules` is the documented path but that file is auto-edited by Codex (append, do not replace).
Posture suggestion (optional, your call): Codex `sandbox_mode = "workspace-write"` + `approval_policy = "on-request"`/`granular`, Claude `auto` mode instead of bypass; keeps hooks as defence in depth.

### 3.6 Smoke tests (do once after setup)
Claude (bypass mode session): ask it to run `git push --force origin nonexistent` in a scratch repo and to `echo x >> .env` in a temp dir; expect "BLOCKED by playbook guard". Also run `claude --debug` or add an `InstructionsLoaded`/`PreToolUse` log line if nothing happens. Codex: same two prompts in a scratch git repo; expect the hook's stderr. If either tool does not block in full-access/bypass, treat the hook as inactive and switch that tool to a stricter mode.

### 3.7 sync.ps1 outline (idempotent)
1. copy `instructions\core.md` with generated header to `~\.codex\AGENTS.md` (skip write if unchanged);
2. for each folder in `skills\`: ensure junction in `~\.claude\skills` and `~\.agents\skills` (if a real dir of same name exists, rename it to `<name>.bak-<date>` first, never delete);
3. ensure `~\.claude\agents` and `~\.codex\agents` contain the vault agent files (junction of the folder or copies);
4. print a report of duplicates between `~\.codex\skills` and `~\.agents\skills`.

## 4. Risks and open questions

- Bypass/full-access + no hooks today: one bad command can delete data; hooks are the only non-bypassable layer and must be smoke-tested (section 3.6).
- Hook matchers and regexes are not a security boundary; hospital data repos should additionally use least-privilege DB roles and no production credentials on the dev machine.
- Codex `AGENTS.md` copy can drift from the vault; mark it generated and run sync.
- Junction hazards: `Remove-Item -Recurse` on a junction can traverse the target in older PowerShell; delete junctions with `(Get-Item $p).Delete()` or `cmd /c rmdir`. `git` inside the vault should not track the junction copies.
- Duplicate skill names across `~/.codex/skills`, `~/.agents/skills` and plugins waste the listing budget and may shadow each other (Codex dedupe rules **UNVERIFIED**).
- Frontmatter extras (`disable-model-invocation`, `effort`, `context`) are Claude-only; Codex's handling of unknown keys is **UNVERIFIED** (current skills with them load in Codex).
- Claude `sonnet` alias drifts with releases (now 5.5); pin with a full id if reproducibility matters. Sonnet 5.5 default effort is medium.
- `CLAUDE_CODE_SUBAGENT_MODEL` without FORCE is overridden by per-agent/per-call models; with FORCE it overrides everything.
- Agent teams are experimental and, when enabled, named subagents launch as teammates (token cost); leave disabled.
- Transcripts may contain PHI or secrets (unencrypted); `cleanupPeriodDays: 365` keeps them a year; Codex rollouts (1.32 GB) have no documented expiry.
- `stitch` MCP key sits in `config.toml` in plain text; third-party MCP servers/skills/plugins are prompt-injection and supply-chain surface.
- Codex docs reference model slugs (`gpt-6.1-sol`) that are absent from the local model cache; docs and binary versions differ (0.157.1 installed, 0.159.2 available).
- Unread due to usage limit: learn.chatgpt.com/docs/build-plugins.md; Codex cloud/automations pages; `hooks-guide` Claude page.

## 5. Sources (all fetched 2026-09-30 unless noted; no dated "last updated" stamp was shown on the pages)

| Topic | URL |
|---|---|
| Claude memory/CLAUDE.md/AGENTS.md/auto memory | https://code.claude.com/docs/en/memory |
| Claude skills | https://code.claude.com/docs/en/skills |
| Claude sub-agents | https://code.claude.com/docs/en/sub-agents |
| Claude hooks | https://code.claude.com/docs/en/hooks |
| Claude permissions | https://code.claude.com/docs/en/permissions |
| Claude permission modes (bypass) | https://code.claude.com/docs/en/permission-modes |
| Claude settings reference | https://code.claude.com/docs/en/settings-reference |
| Claude .claude directory / retention | https://code.claude.com/docs/en/claude-directory |
| Claude model config / effort | https://code.claude.com/docs/en/model-config |
| Claude agent teams | https://code.claude.com/docs/en/agent-teams |
| Claude routines | https://code.claude.com/docs/en/routines |
| Claude MCP | https://code.claude.com/docs/en/mcp |
| Claude plugins | https://code.claude.com/docs/en/discover-plugins |
| Claude Desktop / VS Code | https://code.claude.com/docs/en/desktop ; https://code.claude.com/docs/en/vs-code |
| Claude what's new (weekly digest, through W37 2026) | https://code.claude.com/docs/en/whats-new |
| Codex AGENTS.md | https://learn.chatgpt.com/docs/agent-configuration/agents-md (redirect from developers.openai.com/codex/guides/agents-md) |
| Codex docs index | https://learn.chatgpt.com/llms.txt |
| Codex skills | https://learn.chatgpt.com/docs/build-skills.md |
| Codex subagents | https://learn.chatgpt.com/docs/agent-configuration/subagents.md |
| Codex hooks | https://learn.chatgpt.com/docs/hooks.md |
| Codex rules | https://learn.chatgpt.com/docs/agent-configuration/rules.md |
| Codex approvals/sandbox | https://learn.chatgpt.com/docs/agent-approvals-security.md |
| Codex MCP | https://learn.chatgpt.com/docs/extend/mcp.md |
| Codex memories | https://learn.chatgpt.com/docs/customization/memories.md |
| Codex plugins | https://learn.chatgpt.com/docs/plugins.md |
| Codex config reference | https://learn.chatgpt.com/docs/config-file/config-reference.md |
| Codex session storage (third-party, web search result, treat as secondary) | https://codex.danielvaughan.com/2026/06/05/codex-cli-session-lifecycle-archive-resume-fork-compact-management/ |
| Agent Skills spec | https://agentskills.io/specification |
| npx skills | https://github.com/vercel-labs/skills |
| GitHub MCP | https://github.com/github/github-mcp-server |
| Playwright MCP | https://github.com/microsoft/playwright-mcp |
| Context7 | https://github.com/upstash/context7 |
| Sentry MCP | https://mcp.sentry.dev/ |
| Supabase MCP | https://supabase.com/docs/guides/getting-started/mcp |
| GlitchTip MCP (search result only) | https://github.com/hffmnnj/mcp-server-glitchtip ; https://github.com/nikitatsym/glitchtip-mcp |
| Local evidence | `claude --version`, `codex --version/doctor/features list/execpolicy check`, `~/.codex/models_cache.json`, newest `~/.codex/sessions/2026/09/30/rollout-*.jsonl` skill-roots block, `~/.claude/settings.json`, `~/.codex/config.toml` |
