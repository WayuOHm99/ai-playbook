# State

Updated: 2026-10-06 | Branch: `refactor/workflow-skills` | PR: not opened

Current scope: replace the old five-skill backbone with Matt Pocock's latest 27 main Engineering/Productivity skills; retain experimental/misc source as reference; add the user's work style through a small central policy; keep personal notes files unchanged and disconnect all external references/automatic reads. Explicitly approved by the latest user scope and choice replies. Earlier five-skill-reduction plan is superseded.

Phase: architecture/implement. Base: `1cce2329e99c65de8c0f7d5c6c18f8cde257e905` (merged PR #6). Local main stays clean at `24bc111743f6089262c208393d784bd0a276da27`; no installation/sync/local-main update.

Acceptance criteria:
- 27 primary Matt skills form the main catalogue and workflow, retaining original names and invocation roles. Experimental/misc source is clearly reference-only, not in the active catalogue.
- Source commit and licence are pinned; personal behavior/permissions/verified-candidate/privacy protections come from one central layer with narrow skill-specific adjustments, not five competing workflows.
- Preserve all existing personal-note files; disconnect their external links and automatic reads. New personal working rules derive from this conversation, not those notes.
- Update entry points, templates and executable catalogue tooling consistently; keep previous tests/history truthful and label legacy eval coverage separately.
- Verify catalogue/source integrity, retained script regressions and a synthetic native Codex workflow using the final Matt architecture. No Claude live run, real histories, dependencies or global settings.

Current local work (not final): imported 27 main skills/83 files under `upstream/matt-pocock/source`, pinned `2b47ffcf2385995a536e43ddc9226e32cf9793d9`, manifest and byte checker. Latest queried upstream HEAD is `6fd947921b935b7e1e69293a200400f0fdd5c15f`; its only diff from that snapshot is experimental chief-of-staff. Latest published release/package is 1.3.1 (tag commit `24fe0ef7737efae15c87225755e9f6f5965e4888`). Refresh/reference import must freeze that newest commit before final delivery.

Superseded uncommitted work: rewrote the five old SKILL.md files to shorter versions and drafted setup/matt-pocock-adaptation.md around that plan. Restore/rebuild those edits for the new architecture rather than delivering them. Existing setup/skills-lock and setup answers edits may be rewritten as appropriate. All current work belongs to this agent; no other agent has changed tracked files.

Evidence so far: `.scratch/matt-update/skills-before.json`, captured source and checksum pass. Two healthy native Codex triage-only runs using old/reduced-five-skill drafts exist under `.scratch/workflow-trial/` and `revised/`; they are superseded baselines, not proof of the final Matt architecture. Revised triage code0/completed retained KEEP and appended CSV without implementation. Initial driver had a stream-finish listener race; it was fixed using stream/promises.finished. No implementation/receiver phases have run yet. Current launcher uses native Codex executable and existing default model/auth, --ephemeral --json --sandbox workspace-write; stdout/stderr stay ignored.

Next: build the new active catalogue/central style+policy and remove old runtime routes/personal-note references, adapt recursive lint/sync without actual installation, then rerun the trial against final architecture. Finish documentation and verification, commit a frozen candidate, independent review (max2 rounds per final scope), push feature PR and attach it. No new merge authorization yet.
