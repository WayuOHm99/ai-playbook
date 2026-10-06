# <Project name> — project rules

Playbook root: <absolute checkout path>
Playbook revision: <full Git commit SHA>

Before any project write, verify the bound playbook HEAD equals that revision and its Git status is clean; command failure, missing root or mismatch is BLOCKED. Read instructions/core.md, instructions/working-style.md and skills/catalog.json from that root. Resolve skill names by the catalogue; installed copies cannot substitute for this binding. Policy is loaded because this project explicitly opts in.

Purpose: <what this project does and who uses it>.
Data for development/testing: <synthetic-only or explicitly approved data scope>.
Existing project conventions and approved spec/ADRs take precedence over example defaults. No technology stack is selected by this file.

## Commands

- Fast verify: <exact working command>.
- Full verify: <exact working command>.
- Run locally: <exact working command and fixture mode, if applicable>.

## Agent skills

- Issue tracker: local Markdown; see docs/agents/issue-tracker.md. External publishing is not authorized by this choice.
- Triage roles: see docs/agents/triage-labels.md.
- Domain: see docs/agents/domain.md. Read the relevant glossary/ADRs when they exist.

## Scope and continuation

Read STATE.md and its ticket/spec pointers before working. Keep the current ticket's Do / Don't / Done when and approvals explicit. Preserve existing tests and unrelated files; new ideas append to the project's BACKLOG.md when present.
Use a feature branch/worktree for implementation. Commit all ticket/test/state files before frozen code-review. Delivery rights: <local reviewed candidate only or explicitly named feature remote/PR>. Merge, deployment and installation/global changes follow core and specific user authorization.
For handoff, commit STATE/HANDOFF with verification, branch/SHA, next action and push/access status. Local scratch tickets/evidence need an approved transfer mechanism when the receiver cannot access this checkout.
