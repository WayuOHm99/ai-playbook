# Repository-only quickstart trial — 2026-10-06

Status: **onboarding/task verification passed; record before final delivery review**. This covers the guide and one bounded synthetic ticket, not all 27 skills or installed invocation. Final frozen review/publication receipts belong to ignored evidence and the PR body to avoid an unreviewed bookkeeping commit.

Approved scope: guide/prompt, minimal neutral project example, source-binding and fresh-context use. No installation/sync/global changes/local-main update, live Claude, real histories, CI or external project writes. Previous Matt migration merged as [PR7](https://github.com/WayuOHm99/ai-playbook/pull/7); this is a new scope.

Acceptance:
- A fresh agent can verify the supplied checkout/revision, read the required source documents and recommend the next action without editing the project in onboarding.
- The same agent follows the guide's approved-ticket prompt, preserves the source binding, adds a public-behavior regression, observes the assertion before implementation and runs the approved criteria.
- Code/new tests/state are committed as a clean candidate before independent review. No installed-skill substitute, remote, dependency or settings change is needed.

## Method

Extracted the two text prompts directly from setup/quickstart-repo.md and filled their placeholders. Two app subagents started with `fork_turns=none`, receiving the prompt/guide and bounded ownership only. One ran read-only onboarding then the separately authorized implement continuation; the other received the startup prompt with an intentionally mismatched revision. This is a **fresh-context app agent trial**, not a native CLI event/health trial or a new sidebar chat. Existing model/settings remained in effect. No installed-source comparison or Claude run was performed.

The approved synthetic project had an absolute path containing spaces, copied neutral tracker/domain config and a ticket for the running `node bytes.mjs <bytes>` interface. Original code divided by1000 and printed1.02KiB for1024bytes; expected binary unit uses1024. Only bytes.mjs, new public CLI tests and STATE were allowed to change. Existing BACKLOG/project rules/ticket/config had to remain unchanged. No prior tests were present in this fixture.

## Results

| Check | Observed result |
|---|---|
| Bound source | Playbook checkout `D:/wt/ai-playbook-quickstart`, trial revision `d0f3aff5577f33671190bd6023c0dd234da89266`; HEAD matched and status was clean during onboarding/implementation |
| Valid onboarding | Read bound core/style/catalogue/ask-matt and phase reference, then project rules/state/ticket/config; recommended implement for an already approved ticket without repeating setup/triage |
| Read-only phase | Parent observed clean project at seed `3d79071bb3da60ea2a469ce3c344cc98da2e85ec`, no remote, no onboarding implementation or test files |
| Mismatched revision | Expected `ffffffffffffffffffffffffffffffffffffffff`; agent checked actual HEAD, reported BLOCKED and stopped before loading runtime/project context or making changes; did not substitute installed skills or repair the supplied pin |
| RED before implementation | `node --test bytes.cli.test.mjs` exit1, actual1.02KiB vs expected1.00KiB assertion; recorded code SHA-256 equals original seed code, and the regression hash is identical in targeted RED/GREEN records |
| GREEN and acceptance | Targeted test exit0; five independent literals0→0.00KiB,512→0.50KiB,1024→1.00KiB,1536→1.50KiB,2048→2.00KiB all matched through the public CLI; plain `node --test` passed5/5, no skips |
| Committed candidate | `501865b7b8f36be9e322b2e0c2537e415706df61` against seed above; clean feature branch, no remote, diff only STATE.md, bytes.cli.test.mjs, bytes.mjs; capture occurred after commit |
| Independent parent verification | Re-ran all five literals and plain tests, checked original-code/regression hashes, clean status, no remote, out-of-scope diff empty and exact --expect candidate identity: PASS |
| Repository checks | Catalogue27 and raw source38skills/109files passed; link audit found no broken local targets or external personal-note path references; personal-file Git objects unchanged |

Execution used Windows and existing Node24.18.0. App agent reads/actions are reported by their results and inspected project state; no native CLI JSON completion statistics are inferred from them. Hash/timestamp records plus assertion logs support the claimed test order; they are evidence, not tamper-proof attestation.

The final guide/starter content is unchanged from the tested draft revision; report/state bookkeeping is committed afterward. The trial pin records the checkout at execution time. A later session still must check its actual root/revision: updating that checkout does not silently update an existing project's pin.

## Limits and next work

This proves the source-only guide can bootstrap a configured small project, refuse a wrong revision and drive one approved CLI ticket to a committed candidate with verification. It does not certify automatic skill discovery/slash commands, every template combination, missing-root/dirty-checkout/conflicting-binding cases, fresh project setup interview, all27skills, native CLI sandbox behavior, Claude, production, UI, real-history privacy or remote handoff. Scratch ticket/evidence transport remains explicitly described in the guide.

Existing runtime/scripts/skills/upstream and test files are unchanged; the previous85Node/17sync results remain migration evidence, not newly rerun results here. The documentation scope used source/link/diff checks and the five new synthetic behavior tests. Broader behavior coverage and GitHub CI remain separate next work. Raw histories/transcripts stay out of public reporting; fixtures and small synthetic command evidence remain ignored under `.scratch/quickstart-trial/`.
