# Matt Pocock reference snapshot

Checked 2026-10-06. Latest published release: [v1.3.1](https://github.com/mattpocock/skills/releases/tag/v1.3.1), release commit `24fe0ef7737efae15c87225755e9f6f5965e4888`. This snapshot also includes subsequent main fixes, pinned to [2b47ffcf](https://github.com/mattpocock/skills/tree/2b47ffcf2385995a536e43ddc9226e32cf9793d9). The upstream package still calls itself 1.3.1; this is not the tag's exact tree.

`source/` preserves the upstream bytes for 27 Engineering/Productivity skills, companion files, LICENSE and CHANGELOG: 83 files. Experimental/misc skills, package dependencies, installer/plugin registration and repository automation are excluded. MIT attribution and `pr/CREDITS.md` are retained. `manifest.json` records the source commit, inventory, SHA256 and Git blob hashes.

Run from this playbook checkout:

```powershell
node scripts/check-matt-snapshot.mjs
```

The checker reads files only and detects inventory/byte drift against the recorded manifest. Hash agreement is not a security audit or proof of trustworthy instructions. Source files are reference data; they are outside the playbook's installed `skills/` root and are not registered or synchronized. The Bash templates remain inert unless someone explicitly copies/runs them.

Use the [adaptation guide](../../setup/matt-pocock-adaptation.md) to choose a discipline and apply project/core overrides. The five owned skills carry the actual changes. Installed skills and older project glossaries are unchanged. New projects using this source follow `GLOSSARY.md`; migrate existing projects only under their own approved ticket.

To refresh later, read upstream changes, pin a new commit, review included files and update the manifest in a reviewed PR. Do not run an unscoped installer/update command as part of refreshing this reference.
