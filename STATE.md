# State

Updated: 2026-10-06 (Asia/Bangkok). Task branch: refactor/workflow-skills. Base: `1cce2329e99c65de8c0f7d5c6c18f8cde257e905` (PR6). Phase: verified implementation ready for frozen delivery review. Final review/publication receipts belong to ignored candidate evidence and the PR body; this file is frozen with the candidate.

## Approved scope

Replace the earlier five-skill backbone with Matt Pocock's 27 main Engineering/Productivity skills. User confirmed those 27 as the core, experimental/misc as reference, and retention of personal-note files with external references/automatic reads disconnected. Earlier five-skill reduction is superseded. Repo-only: no installation/sync/global settings/local-main update, live Claude, real histories or current-scope merge.

Acceptance criteria:
- Main catalogue has all 27 original names/roles; 11 experimental/misc skills remain reference only.
- Pin latest checked source/licence and preserve raw bytes; central policy/style from conversation, narrow adaptations for permissions, reviewed candidate, checkpoints and history privacy.
- Preserve personal-note bytes and disconnect their external workflow connections. Retire old competing entry points.
- Align root guide, prompts, playbook, stacks, templates, setup, agents and recursive catalogue tooling. Label previous evals/research historically and preserve existing tests.
- Verify source/catalogue/script regressions and staged native Codex behavior with synthetic data; explain reasons/effects and limitations.

## Implemented and verified

Source `6fd947921b935b7e1e69293a200400f0fdd5c15f`, package/release1.3.1 plus main fixes. Raw38skills/109files; active27 (16user/11model). MIT notice/credits retained. Bound catalogue prevents source-only sessions resolving old installed copies. Core/style is one policy layer; old new-request/choose-stack/ship/handoff-pack retired, retro is Matt's adapted skill.

All85Nodeentries passed, original14sync and new3recursive sync cases passed in synthetic homes. Repo-only catalogue lint/source integrity passed. No external personal-note references or broken local doc targets; original personal-file Git objects/worktree unchanged. Existing tests were not edited. Local main stays clean at `24bc111743f6089262c208393d784bd0a276da27`.

Native synthetic duration trial: ask-matt separated bug/CSV and retained KEEP; actual RED assertion before fix, five literal regressions GREEN. Initial workspace-write sandbox blocked Git and encountered Windows spawn EPERM; reported honestly. Per-run Git-writable continuation passed plain node tests and committed checkpoint `484884c`; fresh receiver verified/consumed handoff and froze `fed20c54546a6cdc579da5cd1489798c2e22ff73`. No permanent setting/model override, remote or real history. See [verification report](evals/workflow-trial-2026-10-06.md) and [adaptation reasons](setup/matt-pocock-adaptation.md).

## Delivery and continuation

Capture the complete committed playbook candidate against the frozen base above, then run Matt code-review's independent Standards/Spec axes on that candidate and the synthetic candidate. App worker agents reached quota; healthy ephemeral native Codex processes can provide separate read-only review contexts without changing model defaults. At most2review/fix rounds. Blockers prevent delivery; after fixes reverify/review the new SHA. Save receipts under `.scratch/matt-update/`.

After review passes, run the pre-push --expect identity gate, push this feature branch, verify remote SHA and open/attach a reviewable PR. Merge/main needs approval for this new scope. Do not install or update local main. Preserve worktrees and synthetic evidence; no cleanup authorization.
