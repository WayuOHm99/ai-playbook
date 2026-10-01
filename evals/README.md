# Skill trigger evals

Checks whether an agent loads a vault skill for the messages that should trigger it, and ignores near-misses. Method from agentskills.io and Anthropic's skill-creator (should / should-not near-miss queries, several runs each); see `research/09` and `research/10`.

```bash
node scripts/run-trigger-evals.mjs --skill new-request --tool codex      # or --tool claude (needs `claude` CLI logged in)
node scripts/run-trigger-evals.mjs --skill handoff-pack --tool claude --runs 3
```
Each query runs in a throwaway fixture repo under `D:\ev\`, which is removed afterwards. Results are appended to `results.md`.

## Findings 2026-10-01 (Codex 0.157.1, gpt-6-luna)
- **Recall 0/8 for both skills**, before and after rewriting the descriptions with "Use when…" and Thai cue words. **Near-misses were 8/8 correct**, so no false triggers.
- **Detection is correct.** An explicit `$handoff-pack …` made Codex read `skills/handoff-pack/SKILL.md`, and the runner detects that.
- **Behaviour was still right without the skill.** For a mixed bug and idea message, Codex classified both items (P5 and P2), wrote `BACKLOG.md`, left the current ticket alone, and replied with the 8-part report. The rules in `instructions/core.md` carry the behaviour. This matches the superpowers ablation result: a skill can add little when the base instructions already cover it.
- **Practical rule:** in Codex, type `$new-request`, `$ship`, `$handoff-pack` or `$retro` when you want the full skill procedure.

## Not yet measured
- **Claude Code recall:** the `claude` CLI's login had expired during this run. Re-run with `--tool claude` after `claude` login.
- **Behaviour with vs without the skill, graded:** only one manual comparison so far.
