# Active Matt catalogue

The 27 Engineering/Productivity skills in [catalog.json](catalog.json) are adapted from Matt Pocock's source pinned at `6fd947921b935b7e1e69293a200400f0fdd5c15f`. Names and invocation roles match that source: **16 user-invoked, 11 model-invoked**. Engineering and Productivity are categories, not skill roots to install.

Use `ask-matt` as the router. Read the [entry map](../00-start-here.md) for flow and [adaptation record](../setup/matt-pocock-adaptation.md) for all roles and reasons. Every active skill first resolves the bound checkout and reads its policy/style; helper names resolve through its catalogue so a source-only session can avoid installed-version drift.

The upstream text is retained with small explicit adjustments: frozen committed review, user authorization, committed handoff, selected/history review, repo-only setup and Thai explanation. Raw [source](../upstream/matt-pocock/README.md) remains byte-exact. Experimental/misc source is reference-only and never discovered by lint/sync as active skills. The old five-skill backbone is retired; Git history preserves it.

MIT attribution and original credits are preserved in [LICENSE](LICENSE) and copied skill references. See [CHANGELOG](CHANGELOG.md). Run `node scripts/lint-skills.mjs --strict --repo-only` from the checkout; installing is a separate authorized task.
