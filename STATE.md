# State

Updated:2026-10-06 (Asia/Bangkok). Branch:ci/repository-checks. Frozen base:78feb96e6045a0edc1fd23f5f04f11383d2763e5 (merged PR9). Phase: final local checks/probes passed; ready for frozen review then actual PR-run verification. Post-review/cloud/publication receipts stay ignored or in PR body, avoiding unreviewed bookkeeping commits.

## Current approved scope

The user approved the researched engineering recommendation to add repository CI. Do: GitHub-hosted Windows PR/mainpush/manual checks; official SHA-pinned actions, exact tested Node, read-only contents token/no persisted credentials/cache; one local/CI check entry point; old deterministic tests preserved; synthetic failure/skip probes; reviewed feature PR and real Actions validation. Don't: installed skills/sync/global settings/local-main update, live Claude, real data/history/personal-note reads, old-test edits, new package dependencies on this machine, deploy/auto-merge or branch-protection/settings changes. Keep worktrees/probe fixtures. Approval derives from this conversation.

Done when:
- Every PR and main push can run the hosted Windows workflow; primary official refs/inputs inspected, restricted permissions, bounded timeout/concurrency, no path filtering or ignored main-step failures.
- Same entry point checks27skill catalogue, frozen38skill/109file source, all maintained Node test roots (current85entries, zero skipped/TODO/cancelled/failed), both14+3Windows synthetic sync suites and pending/committed-range whitespace. No installed environment/live agents.
- Owned source copies exclude personal notes; invalid catalogue and a NEW skipped test make the actual entry point exit1 with expected diagnostics. Process/timeout/other errors are not negative success. Parent probe success means both expected failures were caught, not a top-level broken Actions run.
- Clean committed full candidate receives independent Spec/Standards review against the base above (max2rounds), exact pre-push/remote identity verified; actual PR cloud job/steps/logs/checkout identities verified separately after reviewed publication. Missing/failed/cancelled/skipped evidence stays pending/failed.
- Operational guide explains coverage/limits, runner updates, source selection and merge protection separately. Main merge requires current-scope authorization; required-check settings remain next work after real results/support are established.

## Prior completed delivery

PR7 merged ff4aefe89bb1e18f448b21b91138c22f8cf19ea6: Matt27active/11reference architecture/privacy. PR8 merged d54e68a42eac2d7edf80c5da0f7d79517ac66c06: source-only quickstart/starter and bounded task5/5. PR9 merged78feb96e6045a0edc1fd23f5f04f11383d2763e5: three-ticket nonconflicting join,10CLI literals/11tests, both review axes PASS and local tickets verified-complete. All merged trees matched reviewed candidates. Worktrees retained; no installation/local-main update. These synthetic agent trials do not certify every skill/environment.

## Implementation and verification

Entry point:scripts/ci-checks.ps1. Negative/skip probes:scripts/ci-failure-probe.mjs. Workflow:.github/workflows/repository-checks.yml. Operations/primary-source rationale:setup/repository-ci.md. Existing tests/skills/upstream/personal files unchanged. First local entry-point run passed85/85Node entries, zero skips/TODO/cancelled, Windows14+3sync cases. Both actual child probes exited1 with catalogue-role mismatch and no-skips diagnostic; skipped child showed85pass/1skip and was rejected. Retained initial probe:.scratch/ci-failure-probe/run-sRnfT9. Committed-range whitespace logic was subsequently made explicit and the final entry point reran successfully85/85Node and14+3Windows cases with zero skips; final two expected-failure probes also passed. Exact local commands/exits/full logs:.scratch/ci/local-checks.{json,log} and local-probes.{json,log}; final probe fixture:.scratch/ci-failure-probe/run-MluAqM.

Source refs checked2026-10-06: official checkoutv7.0.1 SHA3d3c42e5aac5ba805825da76410c181273ba90b1, setup-nodev7.0.0 SHA820762786026740c76f36085b0efc47a31fe5020; published action definitions/inputs/release notes inspected, not a full bundled-code audit. Actions enabled/all actions allowed as read-only observed; no settings changed. Node24.18.0 matches local tested runtime. Hosted windows-2025 image family is not an immutable OS pin. Local optional YAML parser was unavailable; no package installed, authoritative workflow parsing/execution must be demonstrated by GitHub after publication.

## Recovery and next action

Current checkout:D:/wt/ai-playbook-ci. Scope/evidence/review prompts and receipts:.scratch/ci/. Probe fixtures:.scratch/ci-failure-probe/. Preserve all owned trees/branches. Final local checks completed. Commit/capture, review and exact feature publication, then wait for actual cloud results in the same task. Final cloud receipt/run links/identity go to ignored evidence/PR body. CI tests only deterministic infrastructure behavior; live model/Claude/production/installed invocation/real-history coverage remains separate. Adding CI does not itself enforce merge protection. Local main stays clean at24bc111743f6089262c208393d784bd0a276da27.
