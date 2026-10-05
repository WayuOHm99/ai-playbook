# Skill trigger evals

Checks whether an agent loads a vault skill for the messages that should trigger it, and ignores near-misses. Method from agentskills.io and Anthropic's skill-creator (should / should-not near-miss queries, several runs each); see `research/09` and `research/10`.

```bash
node scripts/run-trigger-evals.mjs --skill new-request --tool codex      # or --tool claude (needs `claude` CLI logged in)
node scripts/run-trigger-evals.mjs --skill handoff-pack --tool claude --runs 3
```
Each invocation creates its own short fixture root, `D:\ev\run-<random>\`, with a separate child for each query. Only that owned root is cleaned up after all active jobs finish, including when a worker rejects. The shared `D:\ev\` parent, other runs and leftovers from interrupted runs are never removed. Results are appended to `results.md`.

Use `--fixture-root <parent-directory>` to select another parent. Cleanup checks the absolute path, canonical path, original directory identity and per-run ownership marker before recursive deletion, and refuses a replaced or linked root. A child error is retained until its `close` event; an error alone does not prove the process has stopped. A forcibly terminated process can leave its run behind; later runs do not reuse or delete it.

Filesystem regression tests run without Claude/Codex or network access:

```bash
node --test scripts/lib/eval-workspace.test.mjs
```

This patch isolates fixture storage and cleanup only. The trigger scoring and historical results below are unchanged; they do not measure today's manual-only workflow or its output quality.

## Findings 2026-10-01 (Codex 0.157.1, gpt-6-luna)
- **Recall 0/8 for both skills**, before and after rewriting the descriptions with "Use when…" and Thai cue words. **Near-misses were 8/8 correct**, so no false triggers.
- **Detection is correct.** An explicit `$handoff-pack …` made Codex read `skills/handoff-pack/SKILL.md`, and the runner detects that.
- **Behaviour was still right without the skill.** For a mixed bug and idea message, Codex classified both items (P5 and P2), wrote `BACKLOG.md`, left the current ticket alone, and replied with the 8-part report. The rules in `instructions/core.md` carry the behaviour. This matches the superpowers ablation result: a skill can add little when the base instructions already cover it.
- **Practical rule:** in Codex, type `$new-request`, `$ship`, `$handoff-pack` or `$retro` when you want the full skill procedure.

## Not yet measured
- **Claude Code recall:** the `claude` CLI's login had expired during this run. Re-run with `--tool claude` after `claude` login.
- **Behaviour with vs without the skill, graded:** only one manual comparison so far.
