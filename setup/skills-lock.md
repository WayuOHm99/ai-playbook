# Skills lock: where every third-party skill came from

`npx skills` keeps the machine-readable lock at `C:\Users\wayuo\.agents\.skill-lock.json` (version 3, with a folder hash per skill). This file is the human summary plus the skills that lock does not cover. Update both when installing, updating or removing a third-party skill (see `setup/skill-intake.md`).

| Source | Skills | Installed via | Location | Reviewed | Notes |
|---|---|---|---|---|---|
| github.com/mattpocock/skills | 35 | `npx skills` (lock has hashes) | `~/.agents/skills`, junctions in `~/.claude/skills` | 2026-10-01 (research/09) | Upstream pending rename CONTEXT.md → GLOSSARY.md; read CHANGELOG before updating. |
| github.com/heygen-com/hyperframes | 18 | `npx skills` | `~/.agents/skills` + real copies in `~/.claude/skills` | not reviewed (UNVERIFIED) | 17 set manual-only 2026-10-01; `hyperframes` stays auto. |
| github.com/vercel-labs/skills | 1 (`find-skills`) | `npx skills` | `~/.agents/skills` | not reviewed | |
| github.com/softaworks/agent-toolkit | 1 (`requirements-clarity`) | `npx skills` | `~/.agents/skills` | not reviewed | Set manual-only 2026-10-01; overlaps `grilling`. |
| Cloudflare skills | 11 | unknown (not in the npx lock) | real folders in `~/.claude/skills` and `~/.agents/skills` | not reviewed (UNVERIFIED source) | Set manual-only 2026-10-01. |
| Claude plugins (`engineering`, `operations`, `data`, …) | ~60 | Claude plugin marketplaces / Cowork sync | `~/.claude/plugins` | not reviewed | Disable unused plugins from the app's plugin settings (setup/skills-cleanup-proposal.md B4). |
| Vault skills (`new-request`, `ship`, `handoff-pack`, `retro`) | 4 | `scripts/sync.ps1` | copies in `~/.claude/skills`, junctions in `~/.agents/skills` | own | Versions in each SKILL.md `metadata.version`; history in `skills/CHANGELOG.md`. |

Parked (moved, not deleted) on 2026-10-01: 29 duplicate Codex copies and 20 Cursor built-ins → `C:\Users\wayuo\.skills-trash\2026-10-01\`.
