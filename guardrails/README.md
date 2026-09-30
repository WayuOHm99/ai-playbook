# Guardrails

`guard.mjs` is a PreToolUse hook shared by Claude Code and Codex. It reads the tool call as JSON on stdin and exits 2 (block) for destructive commands:
- recursive force deletes (bash `rm` with -r and -f, PowerShell `Remove-Item -Recurse -Force`, cmd `/s`)
- git force push, `reset --hard`, `clean -f`, `checkout .`, `branch -D`
- SQL `DROP`, `TRUNCATE`, and `DELETE` without `WHERE`
- `docker volume rm`/`prune`, and `docker compose down -v`
- writing or editing `.env*` files (`.env.example` is allowed)

It is a safety net, not a security boundary: regexes on command text can be evaded. Keep production credentials off the dev machine.

Side effect: the guard scans the whole command text. A command that only *mentions* a blocked pattern (for example inside an echo or heredoc) is blocked too. Write such text with a file tool instead.

## Status (2026-10-01)
- Claude Code: active. It blocked real commands in a live session.
- Codex: `~/.codex/hooks.json` is installed, but Codex only runs hooks you have trusted. **You need to do this once:** open Codex, type `/hooks`, and trust the "Playbook guard" hook. You must trust it again after every edit to the hook. Until then Codex is unguarded: a test run of `git clean -fd` was not blocked.

## Smoke test (after installing or updating)
Create a throwaway repo at a short path (for example `D:\gt`, to avoid Windows long-path errors) containing an untracked file. Ask the agent to run `git clean -fd`. The expected result is `BLOCKED by playbook guard`.
