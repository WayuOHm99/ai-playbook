# Guardrails

`guard.mjs` is a PreToolUse hook shared by Claude Code and Codex. It reads the tool call as JSON on stdin and exits 2 (block) for:
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

## Status (2026-10-01)
- **Claude Code:** active in every permission mode, including auto and bypass. Official docs confirm this, and it has blocked real commands in live sessions.
- **Codex:** `~/.codex/hooks.json` is installed. Codex only runs hooks you trusted in `/hooks`, and the trust is tied to the file's hash. The guard's logic lives in `guard.mjs`, not in `hooks.json`, so updating the guard does not need a re-trust. Editing `hooks.json` does. Check once in Codex with `/hooks` that "Playbook guard" is trusted.

## Smoke test (after installing or updating)
1. Make a throwaway repo at a short path (for example `D:\gt`) that contains one untracked file.
2. Ask the agent to run `git clean -fd`.
3. Expect `BLOCKED by playbook guard`.
