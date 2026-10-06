# Matt Pocock source snapshot

Checked: **2026-10-06 (Asia/Bangkok)**. Repository-only source import; no installation, dependency or automation execution.

- Source: [mattpocock/skills](https://github.com/mattpocock/skills/tree/6fd947921b935b7e1e69293a200400f0fdd5c15f), commit `6fd947921b935b7e1e69293a200400f0fdd5c15f`.
- Latest published/package version checked: [v1.3.1](https://github.com/mattpocock/skills/releases/tag/v1.3.1), tag commit `24fe0ef7737efae15c87225755e9f6f5965e4888`. This snapshot includes later main fixes; it is not the release tag's exact tree.
- [AI Hero catalogue](https://www.aihero.dev/skills): 27 main skills. All 27 are active adapters under this repo's skills tree. Seven in-progress and four misc skills are reference only. The source inventory contains **38 skills / 109 files** including LICENSE/CHANGELOG and sibling references/templates.
- Source is MIT; [original notice](source/LICENSE) and original credits remain. Root installer/package dependencies/CI/plugin automation are excluded.

[manifest.json](manifest.json) records categories, commit, file bytes, Git blobs and SHA-256. `.gitattributes` disables text conversion for raw source. `node scripts/check-matt-snapshot.mjs` checks inventory/integrity without executing upstream files. Updates freeze a new reviewed commit and deliberately rebase local adjustments; do not overwrite active skills blindly.

Raw source is reference data. Only intentionally selected main adapters and their bound policy are the runtime workflow. Experimental entries may contain external messaging, provisioning or history instructions; storing their source grants no execution permission. [Adaptation reasons](../../setup/matt-pocock-adaptation.md) and [workflow evidence](../../evals/workflow-trial-2026-10-06.md) describe the local changes and their limits.
