---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

## Playbook context (adaptation)

Before acting, resolve the playbook root: use the explicit `Playbook root: <absolute checkout>` in the project's AGENTS.md first; otherwise use this skill's containing checkout (following its junction), then D:/ai-playbook as a fallback. Read `instructions/core.md` and `instructions/working-style.md` from that root. An unavailable explicitly bound checkout is BLOCKED; do not silently load a different installed version. Those documents govern permissions, privacy, checkpoints and delivery; the steps below govern this skill's task. Resolve helper skills through that root's `skills/catalog.json`: use the Skill tool only when its registered source matches that checkout, otherwise read the listed file explicitly. User-invoked helpers are suggestions for the human, not automatic calls.

### Local adjustment

The approved acceptance criteria determine the seams; continue without asking the same design question again. Verify running behavior as well as relevant checks. Update STATE.md, commit every ticket/test/bookkeeping file on a feature branch, then run code-review on the frozen candidate. Any review fix creates a new candidate and repeats affected verification; final delivery follows core.

When the request asks for delivery (for example "ส่งมอบ", "ทำจนเปิด PR", "implement and ship"), carry the chain through in the same run instead of stopping after review: fix BLOCKER findings within core's two review/fix rounds, rerunning affected checks and reviewing each new candidate against the original base, and disclose lesser findings as follow-up; an unresolved BLOCKER after round two is BLOCKED; pass the `review-candidate.mjs --expect` gate; push the feature branch and verify the remote SHA; open or update the PR with pr; then report and stop at the merge gate. Ask the user only for missing decisions or authorization. Without a delivery request, stop after code-review and report the verdict.

Implement the work described by the user in the spec or tickets.

Call the Skill tool with "tdd" where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once checks pass, commit all work and call the Skill tool with "code-review" to review the frozen candidate.
