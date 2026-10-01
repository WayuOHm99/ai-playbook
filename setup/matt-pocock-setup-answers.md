# Pre-answered `/setup-matt-pocock-skills` (hospital web projects)

Purpose: run `/setup-matt-pocock-skills` in any new repo and answer every question from this file, so you never decide again. Based on the skill's own SKILL.md (`C:\Users\wayuo\.agents\skills\setup-matt-pocock-skills\SKILL.md`) and on what `D:\suth-helpdesk-assets` already did (`docs/agents/*.md`).

> **Glossary file name (decided 2026-10-01).** Matt's upstream skills are renaming `CONTEXT.md` to `GLOSSARY.md` (pending changeset `rename-context-to-glossary`, see `research/09`). Until that release is installed here, keep `CONTEXT.md`. When you update Matt's skills (`npx skills update`) to a version whose CHANGELOG mentions the rename, run `git mv CONTEXT.md GLOSSARY.md` in each repo in the same session. Vault files accept either name.

## How to use
1. Open the new repo in Claude Code (repo must have a GitHub remote and `gh auth status` must be OK).
2. Copy the **Kick-off message** below as your first message, then run `/setup-matt-pocock-skills`.
3. When it asks Section A/B/C, it will already have the answers; just say "yes, as pre-answered".
4. Review the draft it shows (step 3 of the skill), then let it write.

## Kick-off message (paste before or with the command)
```
Use my pre-answered setup. Do not ask me the questions; apply these and show me the drafts.
- Issue tracker: GitHub Issues via gh for this repo (PRs as a request surface: no).
- Triage labels: keep the five defaults exactly (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). Yes.
- Domain docs: single-context. CONTEXT.md at root; ADRs in docs/decisions/ (NOT docs/adr/), numbered NNNN-title.md.
- Edit AGENTS.md for the "## Agent skills" block. CLAUDE.md contains only "@AGENTS.md"; do not add anything to CLAUDE.md.
- Write docs/agents/issue-tracker.md, triage-labels.md, domain.md from the skill's templates, adapting domain.md to docs/decisions/.
- Language: write the docs/agents files in English unless the repo is already Thai (then Thai, like suth).
- Then print the gh label commands for me to run; do not create labels yourself without asking.
```

## Answers by question

### Step 1 Explore (what it will look for; expected results in a fresh project)
| It checks | Expected in our projects | Action |
|---|---|---|
| `git remote -v` | GitHub remote `origin` | confirm repo name; if no remote, stop and create the repo first (do not fall back to local markdown) |
| `AGENTS.md` / `CLAUDE.md` | both exist, from `templates/project/` | see "File to edit" below |
| `CONTEXT.md`, `docs/adr/` | none yet in a new project | proceed silently; `/domain-modeling` creates them lazily |
| `docs/agents/` | none | create |
| `.scratch/` | none | do not create |
| `triage` skill installed | yes (manual-only, junction in `~\.claude\skills`) | Section B runs, with the answer below |
| Monorepo signals | `apps/*` + `packages/domain` workspaces in the house layout | **Ignore: still single-context.** The house layout is one domain, one team. Only choose multi-context if two genuinely different business domains live in one repo |

### Section A: Issue tracker
**Answer: GitHub.** Uses `gh` CLI. Template: `issue-tracker-github.md`.
- "PRs as a request surface": **no** (leave default). Internal hospital repos get no external PRs.
- Issue language: match the team. suth writes issues in Thai; new repos: Thai title and body are fine, keep commands and labels in English.
- Repo slug goes in the doc: `<owner>/<repo>` (suth: `saritrungj/suth-helpdesk-assets`).
- Private vs public: check with `gh repo view --json visibility`. Hospital code should be private unless the owner agreed; never put hospital data in issues (synthetic examples only).

### Section B: Triage labels
**Answer: yes, keep the defaults.** One row each, label string equal to the role name:

| Role | Label | Hospital-project meaning |
|---|---|---|
| needs-triage | `needs-triage` | new feedback/bug from staff, not yet evaluated |
| needs-info | `needs-info` | waiting on the requesting department / hospital IT / DPO |
| ready-for-agent | `ready-for-agent` | fully specified, safe for an AFK agent (no patient data, no auth/migration risk) |
| ready-for-human | `ready-for-human` | needs a human: auth, permissions, migration, production, patient-data questions |
| wontfix | `wontfix` | declined on purpose; also record in `BACKLOG.md` "Declined ideas" |

Create them once per repo (run yourself, after the agent prints them):
```powershell
gh label create needs-triage     --color FBCA04 --description "Needs evaluation"            --force
gh label create needs-info       --color D4C5F9 --description "Waiting on reporter/IT/DPO"  --force
gh label create ready-for-agent  --color 0E8A16 --description "Specified; safe for AFK agent" --force
gh label create ready-for-human  --color 1D76DB --description "Needs a human decision/action" --force
gh label create wontfix          --color FFFFFF --description "Will not be actioned"       --force
```
Optional extra labels (not part of the skill; use only if you want them, they map to the BACKLOG risk flags): `risk:patient-data`, `risk:auth`, `risk:migration`, `type:bug`, `type:feature`. Any issue with a `risk:*` label must not be `ready-for-agent`. `/wayfinder` creates its own `wayfinder:*` labels when used.

### Section C: Domain docs
**Answer: single-context**, without asking.
- `CONTEXT.md` at repo root: glossary of Thai hospital terms and domain words (department names, asset, fiscal year...). Created lazily by `/grill-with-docs` -> `/domain-modeling`.
- ADRs: **`docs/decisions/`** (this differs from the skill's default `docs/adr/`; suth already uses it and its `docs/agents/domain.md` says so). Files `NNNN-short-title.md`, statuses Accepted / Superseded by NNNN, old ADRs never edited.
- So edit the seed `domain.md`: replace every `docs/adr/` with `docs/decisions/`, and the example tree accordingly. Delete the multi-context half of the file.
- `DECISIONS.md` from `templates/project/` is for tiny projects only. If you use `docs/decisions/`, do not also keep `DECISIONS.md` (delete it or make it a one-line pointer).

### Step 3/4: File to edit (important)
The skill says "if `CLAUDE.md` exists, edit it". In our template `CLAUDE.md` is only `@AGENTS.md`, so **the block must go in `AGENTS.md`**. Answer when it asks: "Edit AGENTS.md; CLAUDE.md stays as `@AGENTS.md`." Update the existing `## Agent skills` block in place if present; do not duplicate it.

## Drafts it should produce

### `## Agent skills` block for AGENTS.md
```markdown
## Agent skills

### Issue tracker

Issues live in GitHub Issues (`<owner>/<repo>`); use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Standard five roles, label strings identical to the role names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the root; ADRs in `docs/decisions/` (not `docs/adr/`). See `docs/agents/domain.md`.
```
(suth's existing block has the same three sub-sections in Thai; keep it as is there.)

### `docs/agents/issue-tracker.md`
Seed file `issue-tracker-github.md` from the skill folder, unchanged except: the repo slug line, and "PRs as a request surface: **no**". Keep the Wayfinding section.

### `docs/agents/triage-labels.md`
Seed `triage-labels.md` unchanged (the right-hand column already equals the defaults). Optionally add the "Hospital-project meaning" column from the table above.

### `docs/agents/domain.md`
Seed `domain.md`, single-context only, with `docs/decisions/` paths (see Section C).

## Expected results checklist
- [ ] `AGENTS.md` has one `## Agent skills` block; `CLAUDE.md` unchanged
- [ ] `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md` exist
- [ ] `gh label list` shows the five labels
- [ ] `/to-spec`, `/to-tickets`, `/triage`, `/wayfinder` no longer ask to run setup
- [ ] No `CONTEXT.md` or ADR created yet (that is correct)

## Re-running
Only to switch trackers or start over. Otherwise edit `docs/agents/*.md` directly. For an existing repo that already has these files (suth), do not re-run.

## Note for Codex
Codex does not have the Matt Pocock skills installed (`~\.codex\skills` has none; it only sees `~\.agents\skills`, where they do exist as real folders, so check that Codex lists them). The `docs/agents/*.md` files are plain Markdown and work for both agents, since `AGENTS.md` is the shared file.
