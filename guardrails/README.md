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
64 cases (43 must block, 21 must pass), last run 2026-10-07: 64/64.

The guard scans the whole command text. A shell command that only *mentions* a blocked pattern, such as a heredoc or `node -e` containing one, is blocked too. Agents should write such text with a file tool instead.

## Enable by hand

To enable it again by hand:
- **Claude Code:** run `node D:/ai-playbook/scripts/merge-claude-settings.mjs` (adds only this hook).
- **Codex:** create `~/.codex/hooks.json` with a PreToolUse hook that runs `node D:/ai-playbook/guardrails/guard.mjs`, then trust it with `/hooks`.

## Smoke test (after installing or updating)
1. Make a throwaway repo at a short path (for example `D:\gt`) that contains one untracked file.
2. Ask the agent to run `git clean -fd`.
3. Expect `BLOCKED by playbook guard`.

## Prompt secret scan (optional, Claude Code only)

`prompt-secret-scan.mjs` is a separate UserPromptSubmit hook. It blocks a prompt before it is sent when the text matches a known credential shape: Anthropic/OpenAI-style keys, GitHub, AWS, Google and Slack tokens, JWTs, private key blocks, a password inside a connection URL, or a labelled value such as `password: ...` / `รหัสผ่านคือ ...`, including a quoted label as in JSON or a Python dict (`"password": "..."`). Every labelled value in the prompt is checked, so a placeholder earlier in the text does not hide a real value later. Placeholders and variable names (`<DB_PASSWORD>`, `${TOKEN}`, `process.env.X`, `your_db_password`) pass; a real value that merely starts with `Your` or `Example` does not. The block message never repeats the matched text.

Limits: it only knows these patterns. A bare password or PIN with no label is not detected, so it reduces accidental pastes and does not replace the habit of using variable names. Codex is not covered.

Enable by adding to `~/.claude/settings.json` (user approval required, see core policy):

```json
"hooks": { "UserPromptSubmit": [ { "hooks": [ { "type": "command", "command": "node", "args": ["D:/ai-playbook/guardrails/prompt-secret-scan.mjs"], "timeout": 10 } ] } ] }
```

The hook reads the script from this checkout, so the checkout must be on a branch that contains it. Test: `node --test guardrails/prompt-secret-scan.test.mjs` (36 cases, samples are assembled from fragments).