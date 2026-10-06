# Minimal project example for repository-only use

Use after the project has opted into [the quickstart](../../setup/quickstart-repo.md). Replace every placeholder. The example supplies project navigation and local tracker/domain choices; it does not install skills, choose a technology stack, create labels remotely or modify global configuration.

For a new project, draft these files then write only within the approved initialization scope. For an existing project, merge the relevant pointers into its canonical AGENTS/config; preserve existing rules. Copying the example requires ordinary file access to the project and an explicit playbook checkout/revision.

| File | Purpose |
|---|---|
| [AGENTS.md](AGENTS.md) | Bound playbook path/revision, project commands and scope |
| [STATE.md](STATE.md) | Current ticket, approval, evidence and next action |
| [issue-tracker.md](docs/agents/issue-tracker.md) | Local Markdown tracker for a small same-checkout task |
| [triage-labels.md](docs/agents/triage-labels.md) | Canonical roles recorded locally |
| [domain.md](docs/agents/domain.md) | GLOSSARY/ADR paths; create contents when needed |

These files assume a Git repo and tools already available to the chosen project. Record the actual fast/full commands; an absent runtime requires a human decision, not an automatic dependency install. No app implementation or dummy glossary is supplied.

The local tracker uses Matt's `.scratch/<feature>/spec.md` and one file per ticket under `.scratch/<feature>/issues/`. Choose this only for same-checkout work. Confirm an existing `.gitignore` policy; do not overwrite it. For a persistent/shared tracker use the project's existing tracker or configure another approved one with Matt setup. A remote receiver must be able to access referenced spec/ticket/evidence; a committed STATE alone is insufficient.

Before use, inspect the drafted files: root/revision placeholders replaced, verify commands work, scope and delivery rights explicit, no copied hospital/stack facts that the project has not confirmed. The larger [project templates](../project/README.md) remain available when the project needs operations and handover documentation.
