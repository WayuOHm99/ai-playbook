# State

Updated: 2026-10-05 | Branch: `fix/retro-history-privacy` | PR: pending

Current ticket: F8 — reduce private information entering retro analysis through explicit session selection and human review.
Route: P2, existing extractor privacy bug. Phase: review. Next action: user reviews the PR after verification and independent review pass.
Frozen base: `40b1d4b971245c4cab8ccaad491c032c9f9754dc` (merged PR #5).

Acceptance criteria:
- No automatic home-history discovery: require 1–5 explicit files, or use a user-supplied process summary in retro.
- Filter supported secrets/identifiers before writing a bounded private draft; exclude unselected files, noise and tool output.
- Omit original source filenames, session IDs and project paths from evidence; retain only generic ordinals and operational metadata.
- Require actual human approval of the inspected draft's current digest before analysis; release refilters edits and detects changed draft/released content.
- Prove behavior with synthetic fixtures only; preserve existing tests, installed skills/settings and the clean local main.

Verification evidence (2026-10-05):
- Original extractor copied into an isolated synthetic home reproduced the bug: secrets masked, but name/HN/phone remained and an unselected session was included. `.scratch/ship-F8/baseline-result.json` and `baseline/`. No real history was read.
- `node --test scripts/review-candidate.test.mjs scripts/lib/eval-workspace.test.mjs scripts/lib/manual-evals.test.mjs scripts/lib/manual-evals-followup.test.mjs scripts/lib/history-review.test.mjs guardrails/guard.test.mjs scripts/lib/dedupe-sessions.test.mjs`: 74/74 Node entries pass, including 17 new F8 tests. `.scratch/ship-F8/node-tests.txt`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/sync.test.ps1`: 14/14 pass with synthetic homes/vaults and stubbed Git/Node. `.scratch/ship-F8/sync-tests.txt`. No real sync ran.
- Running extractor CLI acceptance: 8/8 operations have expected success/denial statuses. Selection isolation, metadata-only stdout, quoted provenance masking, no analysis before review, stale digest rejection, release refiltering and post-release modification rejection pass. `.scratch/ship-F8/app-report.json` and `verify-app.mjs`. Approval is simulated in fixtures; this does not prove real human review.
- `node scripts/lint-skills.mjs --strict`: exit 1, exactly two expected installed-copy drift warnings for retro, zero other warnings. Retro frontmatter/version/manual-only flags, guide links and approval/metadata gates pass focused checks. `.scratch/ship-F8/lint.txt` and `contract-report.json`. Global copies remain untouched as requested.
- `git diff --check` passes. Local main remains clean at `24bc111743f6089262c208393d784bd0a276da27`; remote base is PR #5's merge. No checkout/pull/fast-forward or skill installation.

Decision: prefer a short process summary; otherwise explicitly selected text goes to a new private `_inbox/` or `.scratch/` draft, the human inspects/reduces it, and only the approved digest is released. Regex filtering is best-effort. A receipt checks content integrity and CLI confirmation; it cannot authenticate a human or enforce approval outside the skill. Do not describe this as complete anonymization.

Review round 1 found a BLOCKER at candidate `3bd75bc5bb8778ab889479718c3808053848955d`: structural omission did not mask selected filenames, /srv project paths or session UUIDs mentioned inside quote text. Fixed by collecting known provenance in memory before processing quotes, escaping literal values, then masking before generic redaction/truncation. A regression covers Codex metadata arriving later, Claude sessionId, path variants and regex characters in filenames; a separate test bounds provenance values. A copied frozen round-1 module reproduced all three leaks with synthetic input; current code masks all three and retains the process note. `.scratch/ship-F8/provenance-reproduction.json`. Round 2 must review the new frozen candidate before push. `.scratch/ship-F8/review-round1.md`.

Limits/risks: unlabelled names, unusual formats, clinical/contextual details and combinations can remain in the private draft. Human review is required. Exact original provenance is masked at capture but deliberately not persisted; release uses the general filter, so human edits must also remove any reintroduced identifiers. Ignored drafts are not encrypted or automatically removed. Filtering may remove useful context. Output directory metadata can include a local username if the checkout is under a user folder. Filesystem checks reject ordinary links/invalid manifests but do not protect against hostile concurrent host changes. Partial release is retained for manual inspection; no automatic cleanup/overwrite.

Scope fences: only extractor, its new modules/tests, retro 1.2.0 and related documentation/bookkeeping. No new dependencies, CI/hooks, auth/production systems, existing-test edits, actual personal/patient/history data, installed copies/settings or local-main updates. The old no-selection CLI flow now intentionally returns exit 2; older installs stay unchanged until separately authorized.

Not tested: live retro lesson quality, real Codex/Claude histories or models, complete identifier removal, hostile concurrent filesystem mutation, or user identity verification. Claude live testing remains skipped. No new backlog item is required for these stated limits.
