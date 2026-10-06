---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

## Playbook context (adaptation)

Before acting, resolve the playbook root: use the explicit `Playbook root: <absolute checkout>` in the project's AGENTS.md first; otherwise use this skill's containing checkout (following its junction), then D:/ai-playbook as a fallback. Read `instructions/core.md` and `instructions/working-style.md` from that root. An unavailable explicitly bound checkout is BLOCKED; do not silently load a different installed version. Those documents govern permissions, privacy, checkpoints and delivery; the steps below govern this skill's task. Resolve helper skills through that root's `skills/catalog.json`: use the Skill tool only when its registered source matches that checkout, otherwise read the listed file explicitly. User-invoked helpers are suggestions for the human, not automatic calls.

Call the Skill tool with "grilling".
