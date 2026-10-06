# Multi-ticket workflow scenario

Use this bounded case to evaluate the bound `to-spec` → `to-tickets` → `implement-spec` workflow. It is a manual agent exercise, not a deterministic test of model quality. Pair with the [observed run](multi-ticket-trial-2026-10-06.md). It neither installs skills nor needs an external tracker.

## Setup and approval boundary

Use a newly approved synthetic project, existing Node/Git, a feature integration branch and local ignored tracker. Pin the absolute playbook checkout/full commit, verify clean HEAD, read its core/style/catalogue, then invoke the selected skills from those listed source paths. Keep original project rules and tests. Record all project/worker paths and branches; cleanup is a separate decision.

Supply the scenario requirements and approve the existing CLI seam and proposed join graph before tests/dispatch. In an automated synthetic run the driver may supply the known approvals; label that explicitly. Such a run does not test a real human interview, quiz/granularity negotiation or permission flow. Local tracker publication means one spec and three separate ticket files, not external issue writes.

The smallest fixture has a `shop.mjs` dispatcher with `help`, `subtotal`, `discount`, `checkout`, and three ES modules whose initial exported functions throw `Not implemented: <name>`. The dispatcher takes cart JSON or numeric arguments, prints JSON on success, exits1 on a thrown error. Add an existing help test before starting and commit this seed. Each worker owns only its assigned module/new CLI test; the coordinator owns tracked STATE. Confirm configured tracker/domain pointers before invoking implementation.

## Requirements and expected behavior

Cart items use integer `unitCents` and `quantity`; percentage is integer0..100. Small valid inputs only. Discounts round down to whole cents. Checkout composes the subtotal and discount rules and emits `{subtotalCents, discountCents, totalCents}`. Preserve help. Invalid/unsafe input, taxes, payment, storage, UI, API, CSV, dependencies and external writes are outside this case.

Fix independent expectations before implementation:

| Public CLI arguments after `node shop.mjs` | Expected JSON |
|---|---|
| `subtotal '[]'` | `0` |
| `subtotal '[{"unitCents":199,"quantity":2},{"unitCents":250,"quantity":1}]'` | `648` |
| `subtotal '[{"unitCents":75,"quantity":3}]'` | `225` |
| `discount 199 15` | `29` |
| `discount 648 0` | `0` |
| `discount 648 100` | `648` |
| `checkout '[{"unitCents":199,"quantity":2},{"unitCents":250,"quantity":1}]' 15` | `{"subtotalCents":648,"discountCents":97,"totalCents":551}` |
| `checkout '[]' 15` | `{"subtotalCents":0,"discountCents":0,"totalCents":0}` |
| `checkout '[{"unitCents":199,"quantity":2},{"unitCents":250,"quantity":1}]' 0` | `{"subtotalCents":648,"discountCents":0,"totalCents":648}` |
| `checkout '[{"unitCents":199,"quantity":2},{"unitCents":250,"quantity":1}]' 100` | `{"subtotalCents":648,"discountCents":648,"totalCents":0}` |

These argument strings are illustrative; pass each JSON as one process argument using the environment's quoting rules. Use `spawnSync`/an argument array in CLI tests; assert successful process execution, exit0 and literal parsed JSON. Avoid private imports, mocks and expectations recalculated by the implementation formula.

## Workflow and evidence

1. Synthesize requirements using `to-spec`: domain vocabulary, user stories, implementation/testing decisions, out-of-scope, and agreed CLI seam. Existing Node/local process and no persistence are constraints; no new stack/hosting decision is needed.
2. Use `to-tickets` to produce the proposed vertical slices.01 subtotal and02 discount have no blockers and disjoint ownership;03 receipt is blocked by BOTH01/02. Each ticket must be independently demoable, with Do/Don't/Done when and its edges. Obtain/supply the labelled scenario approval, then publish one local file per ticket in dependency order with `ready-for-agent`.
3. Invoke `implement-spec`. Dispatch01/02 in separate branches/worktrees from the integration tip with bounded file ownership and explicit collaboration rules. For each: verify source binding/ancestry; read `tdd` and references; record one CLI tracer RED on the original stub, same tracer GREEN after minimum code, then remaining literals/full tests; commit; incorporate the latest integration tip before reporting. Tool/spawn errors do not count as behavioral RED.
4. A separate merger checks each pinned worker candidate, owned delta and evidence, merges to integration, and runs the full suite. Record the frontier initially, after only01 is merged (03 still blocked), and after both01/02 are merged and checked (03 ready). Recheck/reincorporate integration if it advances before delivery. Check03 remains clean at the seed before its gate opens; do not count this as a deliberately attempted invalid-start test.
5. Start03 from the checked integration tip. It adds the receipt through the CLI, composes completed modules, follows the same RED/GREEN and merge process, and preserves the earlier features/tests.
6. Independently rerun all10 literal CLI examples and the full suite including the existing help test. Check protected Git blobs, allowed changed files, clean branch, no remote, branch ancestry, and RED seed-module/tracer hashes/timestamps. Hash/log records support order but are not tamper-proof attestation.
7. Update/commit STATE before capturing the final candidate with the bound `scripts/review-candidate.mjs --base <seed-SHA>`. Run independent Spec/Standards review on the exact frozen diff, using core's two-round limit. Worker completion does not close a local ticket; only integrated checks and review permit verified local closure. Record final closure in ignored tracker/evidence rather than creating a post-review tracked commit. A local-only project needs no push or PR.

Record actual results, failures, fixes and limits, not just a checklist. Current coverage is local same-machine source-file invocation and a nonconflicting valid-input join; separately test human planning negotiation, conflicts, blocked/failed workers, recovery, native CLI health, remote tracker/closure, installed invocation, live Claude and other skills before claiming them.
