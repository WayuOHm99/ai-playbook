---
name: implement-spec
description: "Implement the result of /to-spec and /to-tickets in code."
disable-model-invocation: true
---

## Playbook context (adaptation)

Before acting, resolve the playbook root: use the explicit `Playbook root: <absolute checkout>` in the project's AGENTS.md first; otherwise use this skill's containing checkout (following its junction), then D:/ai-playbook as a fallback. Read `instructions/core.md` and `instructions/working-style.md` from that root. An unavailable explicitly bound checkout is BLOCKED; do not silently load a different installed version. Those documents govern permissions, privacy, checkpoints and delivery; the steps below govern this skill's task. Resolve helper skills through that root's `skills/catalog.json`: use the Skill tool only when its registered source matches that checkout, otherwise read the listed file explicitly. User-invoked helpers are suggestions for the human, not automatic calls.

### Local adjustment

Use existing approved tracker/spec pointers, including local files. Assign each writer bounded ownership and say they are not alone; integrate only this task's branches. Preserve integration and worker worktrees unless cleanup was explicitly authorized. Follow core's frozen candidate and review limit before delivery.

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

The goal is the entire spec implemented on a single **integration branch**, with every ticket resolved the way the issue tracker closes work.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, prepare a local PR body linking the spec and tickets. Publish it only after the verified candidate gate in steps 7–8; an early draft stays local.

4. Use **implementer subagents** to implement each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch before reporting done

5. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, verify the integrated acceptance criteria and required checks, update tracked state, and commit all ticket/test/bookkeeping files. Capture the frozen candidate JSON and call `code-review` on that candidate. Fix review findings in a single **implementer subagent** within core's two-round limit, then reverify and review the new candidate against the original frozen base.

8. After review passes, stop and report the verdict unless the request asks for delivery. With a delivery request, run core's pre-push `--expect` identity gate, push the exact reviewed candidate, verify the remote SHA and publish the prepared PR (or update an existing one). Report pending merge separately; resolve tickets only when the configured tracker's closure event has actually occurred. For a local tracker, record verified completion without a remote push.

9. Record the integration/worker worktrees and their branches for recovery. Cleanup follows core authorization.
