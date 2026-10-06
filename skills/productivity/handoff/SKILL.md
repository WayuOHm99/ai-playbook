---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

## Playbook context (adaptation)

Before acting, resolve the playbook root: use the explicit `Playbook root: <absolute checkout>` in the project's AGENTS.md first; otherwise use this skill's containing checkout (following its junction), then D:/ai-playbook as a fallback. Read `instructions/core.md` and `instructions/working-style.md` from that root. An unavailable explicitly bound checkout is BLOCKED; do not silently load a different installed version. Those documents govern permissions, privacy, checkpoints and delivery; the steps below govern this skill's task. Resolve helper skills through that root's `skills/catalog.json`: use the Skill tool only when its registered source matches that checkout, otherwise read the listed file explicitly. User-invoked helpers are suggestions for the human, not automatic calls.

### Local adjustment

For a project continuation, use core's Context and handoff policy: committed STATE.md/HANDOFF.md are the checkpoint. Report branch, commit and push/access status. A portable temporary copy may point to that checkpoint when changing harness/directory; it is not the sole project state. The receiver verifies status/log and the fast test before continuing.

Write a handoff document summarising the current conversation so a fresh agent can continue the work. For project work save the committed checkpoint described above; for a non-project transfer save a portable document in the OS temporary directory (`$TMPDIR`, else `/tmp`; `%TEMP%` on Windows).

Include a "suggested skills" section in the document, naming which skills the next agent should call the Skill tool for.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
