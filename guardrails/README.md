# Guardrails

## Status (2026-10-05): not installed

The user asked to remove the playbook guard from both tools. It is no longer in `~/.claude/settings.json`, and `~/.codex/hooks.json` was deleted. `scripts/sync.ps1` does not install it. The vault's approval rules are agent instructions; this hook does not enforce them unless explicitly installed.

`guard.mjs` is an optional PreToolUse hook for Claude Code and Codex. When installed, it reads the tool call as JSON on stdin and exits 2 (block) for:
- recursive force deletes (bash `rm` with -r and -f, PowerShell `Remove-Item`/`rm`/`ri`/`del` with -Recurse -Force, cmd `/s`, `find -delete`)
- force push, deleting remote branches, pushing to `main`/`master`, merging PRs with `gh`
- `reset --hard`, `clean -f`, discarding all changes, `branch -D`, `stash clear/drop`
- SQL `DROP`, `TRUNCATE`, and `DELETE` without `WHERE`, **only when the command runs a SQL client** (so commit messages mentioning "truncate" pass)
- `docker volume rm`/`prune`, `docker system prune --volumes`, and `docker compose … down -v`
- writing, reading, or force-adding `.env*` files (`.env.example` is allowed)

It is a safety net, not a security boundary. Command-text regexes can be evaded, for example by a script that deletes internally. A bare `git push` while on `main` is not caught. Keep production credentials off the dev machine.

## Test after every change
```bash
node D:/ai-playbook/guardrails/guard.test.mjs
```
64 cases (44 must block, 20 must pass), last run 2026-10-01: 64/64.

The guard scans the whole command text. A shell command that only *mentions* a blocked pattern, such as a heredoc or `node -e` containing one, is blocked too. Agents should write such text with a file tool instead.

## Enable by hand

To enable it again by hand:
- **Claude Code:** run `node D:/ai-playbook/scripts/merge-claude-settings.mjs` (adds only this hook).
- **Codex:** create `~/.codex/hooks.json` with a PreToolUse hook that runs `node D:/ai-playbook/guardrails/guard.mjs`, then trust it with `/hooks`.

## Smoke test (after installing or updating)
1. Make a throwaway repo at a short path (for example `D:\gt`) that contains one untracked file.
2. Ask the agent to run `git clean -fd`.
3. Expect `BLOCKED by playbook guard`.
