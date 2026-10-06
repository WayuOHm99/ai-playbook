# Repository CI

The [workflow](../.github/workflows/repository-checks.yml) runs repository checks for pull requests, pushes to main and manual dispatch. Actions must be enabled; a new dispatch workflow must first exist on the default branch. PR runs use GitHub's event revision (normally the proposed merge), not an assertion that an independent review approved the PR head.

Run the same entry point locally from an approved source checkout using existing Windows/PowerShell7/Node/Git:

```powershell
pwsh -NoProfile -File scripts/ci-checks.ps1
node scripts/ci-failure-probe.mjs
```

The failure probe requires the source files to be tracked (staged or committed) because it copies `git ls-files` into an owned ignored fixture. It preserves all fixtures for inspection. It excludes retained personal-note files; it neither loads them nor reads real agent histories. No dependencies or skills are installed by these commands. The probe uses the already available `pwsh` executable.

## What the checks mean

- Strict **repository-only** skill lint checks catalogue, frontmatter, invocation roles and skill document links. Installed-home drift is outside CI.
- The Matt snapshot check validates the frozen source inventory and bytes; it does not fetch, execute or upgrade upstream skills.
- Node tests are discovered only under maintained `scripts/` and `guardrails/` roots. Ignored `.scratch/` projects are excluded; newly added tests in those roots join the suite. The entry point requires one complete TAP summary with all entries passed, zero skipped/TODO/cancelled/failed and a nonempty suite. Existing guard/dedupe assertion loops appear as aggregate Node entries; a Node entry count is not a count of all internal assertions.
- Both existing Windows sync suites execute copied sync code against synthetic vaults/homes. Git/Node calls are stubbed inside the test scope; real robocopy/junction behavior is tested. This is not a call to install/sync into the user's environment.
- Diff whitespace checks inspect pending local edits/index and the committed event range using the PR base or pre-push commit. Checkout fetches history so that base exists. For local/manual runs without that base, the HEAD commit is checked; use `-Base <full-SHA>` to inspect an entire approved range. Every command's nonzero exit fails the entry point; normal workflow steps do not suppress errors.

The final probe step copies tracked source (excluding retained personal notes) into a unique `.scratch/ci-failure-probe/run-*` fixture. It first changes only the copied catalogue's invocation role; then restores that catalogue and adds a **new** synthetic skipped test. Each run of the actual entry point must exit1 with the expected diagnostic. A tool/process/timeout error or a different failure is not proof. The parent probe passes only when both expected failures are caught. A green workflow therefore means the positive suite passed **and** the failure probes passed; it is not a claim that a deliberately broken top-level Actions job was run.

## Runner and permissions

Use GitHub-hosted Windows rather than a runner on the user's machine. The workflow selects a Windows release family and the locally tested exact Node version. A hosted image still receives updates; action/Node pins do not freeze the entire OS. Inspect the setup job's runner image/version and tool versions when investigating a new failure.

Only the official GitHub checkout/setup-node actions are used, pinned to full SHAs with release comments. Checkout credentials are not persisted, package caching is disabled, and token permissions are read-only for repository contents. There are no custom secrets, package installs, agent logins, automatic skill updates, deployments or workflow write permissions. These choices limit scope; they are not a complete audit of GitHub infrastructure or the actions' bundled dependencies.

Source selection checked2026-10-06: official release refs resolved via GitHub API to the SHAs in the workflow; inspected published action definitions/inputs and release notes. These are runner dependencies, not globally installed skills. Node setup may download the selected runtime **on the hosted runner** when absent from its tool cache.

## Verification and merging

Before feature publication: run local checks/probes, commit state/code/docs, capture a frozen candidate, perform independent Spec/Standards review and use the pre-push identity gate. Then inspect the actual PR run: event/head/base/tested checkout identity, job/step results, full logs, test counts and failure-probe diagnostics. A queued, missing, cancelled, skipped or failed run is pending/failed evidence, not success. The cloud run is additional verification after the necessary reviewed feature push; final receipts and run links belong to ignored evidence and the PR body, not an unreviewed bookkeeping commit.

CI does not certify all27skills, model behavior, production, installed invocation or Claude; the synthetic human/agent workflow trials remain separate [evaluation evidence](../evals/README.md). It also does not replace frozen candidate review or authorize merge/deploy.

Adding this workflow alone does not block merges. After successful real runs, separately decide whether to configure a required check named **Windows repository checks**, with an expected GitHub Actions source and suitable branch freshness policy. Repository plan/rules support and authorization must be established before changing settings. Required checks can accept skipped/neutral statuses in GitHub, so preserve the entry point's explicit no-skips criterion and check actual steps. Enabling branch protection/rulesets is outside this implementation scope.

## Primary references

- [DORA continuous integration](https://dora.dev/capabilities/continuous-integration/): reliable fast feedback before/after integration; a workflow file alone is not the whole practice.
- [GitHub Node.js CI guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) and [hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) and [PR/dispatch event behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
- [Secure use](https://docs.github.com/en/actions/reference/security/secure-use): minimum token permissions and full-SHA action pins.
- [Checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0): selected official releases.
- [Required checks/protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

Checked2026-10-06. Sources support the design; only actual run results support repository execution claims.
