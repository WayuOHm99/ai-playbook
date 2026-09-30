# 07 — Review of Phase 1 (2026-10-01)

Self-review of research 01–06 and history notes h1–h3, with independent spot-checks.

## Independently verified (by the main session, not the sub-agents)

| Claim | Result | Source |
|---|---|---|
| Subagent frontmatter supports `model: sonnet` + `effort: high` | ✅ confirmed (`effort`: low/medium/high/xhigh/max) | https://code.claude.com/docs/en/sub-agents |
| Codex reads `~/.agents/skills` and repo `.agents/skills` | ✅ confirmed | https://learn.chatgpt.com/docs/build-skills (redirect from developers.openai.com/codex/skills) |
| bypassPermissions = "Isolated containers and VMs only"; deny rules block in every mode | ✅ confirmed | https://code.claude.com/docs/en/permission-modes |
| Versions: TypeScript 7.0.2, Vue 3.5.43, Vite 8.3.1, Playwright 1.63.0, Kysely 0.29.6, Node 24.21.0 LTS | ✅ confirmed via npm registry / nodejs.org; Vitest is now 5.0.3 (report said 5.0.2); Express is 5.2.1 | npm view, nodejs.org/dist/index.json |

## New finding missed by all reports
- Claude Code v2.1.283 (installed) makes **auto mode** the default starting mode: a classifier reviews risky actions instead of the user. This is a safer replacement for bypass mode that still avoids constant prompts. Recommend: auto mode + deny rules + guard hooks, instead of bypass.

## Errors / contradictions to resolve
1. User said "solo", but hospital history shows a collaborator's upstream repo and the agent inferred an internship. Affects Git flow (PR review) and handover. → ask user.
2. Secret scanner (regex) caught 1 of ≥5 leaks. Replace with gitleaks; also scan project git histories (not done yet).
3. `03-stack` lists links inline, not in a sources table; Thai legal PDFs could not be read (glyphs lost); SUTH CII designation unknown.
4. ~70 claims across reports marked UNVERIFIED; many pages read through a summarising fetch tool — numbers are approximate.

## Omissions
- Not analyzed: Cursor, Antigravity, Gemini CLI, Copilot histories; claude.ai / ChatGPT exports.
- 155 unique skills installed; history shows "skill descriptions shortened to 2% context budget" warnings → auto-invocation degraded. Pruning/disabling unused skills is required, not optional.
- Run-Performance handles athletes' health data and Garmin credentials → PDPA s.26 sensitive data; outside hospital scope but a real risk.
- Windows long paths broke worktree cleanup ≥6 times → `git config --global core.longpaths true` in setup.
- Usage-limit strategy: this phase hit limits twice. Playbook needs quota rules (Sonnet sub-agents, ≤4 in parallel, write results to files incrementally, resume via message).
- Freshness: Node 26 becomes LTS 2026-10-28 — versions will age; monthly re-verify task needed.
- GitHub account billing lock previously broke CI → ops risk to document.
- Pilot B may already be fixed; fallback = candidate A.
