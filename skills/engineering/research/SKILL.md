---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

## Playbook context (adaptation)

Before acting, resolve the playbook root: use the explicit `Playbook root: <absolute checkout>` in the project's AGENTS.md first; otherwise use this skill's containing checkout (following its junction), then D:/ai-playbook as a fallback. Read `instructions/core.md` and `instructions/working-style.md` from that root. An unavailable explicitly bound checkout is BLOCKED; do not silently load a different installed version. Those documents govern permissions, privacy, checkpoints and delivery; the steps below govern this skill's task. Resolve helper skills through that root's `skills/catalog.json`: use the Skill tool only when its registered source matches that checkout, otherwise read the listed file explicitly. User-invoked helpers are suggestions for the human, not automatic calls.

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.
