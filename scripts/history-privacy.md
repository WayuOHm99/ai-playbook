# Selected history for retro

Choose the smallest process-only summary that can support the lesson. If session evidence is necessary, the human selects exact files; the agent does not discover or read raw home transcripts. This flow is local, uses no dependencies/network/model, and does not install skills or change settings.

## Capture only selected sessions

From a checkout containing this version:

```powershell
node scripts/extract-history.mjs --session 'codex=<exact JSONL path>' --session 'claude=<exact JSONL path>' --since 2026-10-01
```

Use 1–5 selections, each prefixed by its actual tool. The default date floor is seven days ago (UTC date); `--since` accepts a valid YYYY-MM-DD. Each source is limited to 20 MiB and 200 retained text messages; user quotes are capped at 2000 characters and assistant quotes at 500. Filtering happens before truncation. Invalid JSON lines and omitted messages are counted; records without a usable date are omitted. Tool output, metadata prompts, Claude sidechains and instruction noise are excluded. Replay dedupe is scoped by project in memory; project paths are not exported.

With no selection the CLI returns exit 2 and creates no extract. It no longer recursively scans `.claude/projects` or `.codex/sessions`; old `--since`/`--out` alone invocations must be replaced with explicit selections. It never reuses the old date-wide extracts.

Every capture creates a new `_inbox/history-extract/review-<random>/` directory. `--out <parent>` may choose another directory under this checkout's `_inbox/` or `.scratch/`, both ignored by Git; public/outside/link targets are refused. Source links and duplicate source selections are rejected. Evidence uses anonymous session ordinals; returned metadata contains counts, digests and the output directory, without copying source filenames, session IDs, usernames or project paths. The output directory itself may include a local username if the checkout lives under a user folder. CLI output does not print transcript text; errors do not echo source paths/content. Existing bundles/files are not overwritten or deleted.

## Human review before analysis

Capture returns `status: needs-human-review`, the private directory, counts and `draftSha256`. At this stage only the human reads/edits `draft.txt`; the agent uses returned metadata. The human removes names, HN/AN/MRN, contact information, addresses, clinical details and other sensitive free text, preferably replacing quotes with a short process lesson.

Before capture writes quotes, it also masks exact selected source paths/basenames and known project/session identifiers from metadata, including those mentioned inside message text. These values stay in memory and are not written to the bundle. To bound this filtering, a source with more than 128 distinct provenance values/path variants or any value over 4096 characters is refused. Known-pattern filtering reduces private keys, common API/token formats, quoted password fields, database credentials, email, Thai-style phone/ID numbers, labeled English/Thai personal fields and Windows/home paths. It is **not an anonymization guarantee**: unlabelled names, uncommon formats, contextual/clinical details, images and combinations that identify someone can remain. Ignored local drafts are not encrypted or automatically removed. Keep them private and manage retention yourself.

After edits obtain the current digest without printing the draft:

```powershell
node scripts/extract-history.mjs --review-info '<private review directory>'
```

The human explicitly approves that selected, inspected draft/digest for analysis. Session selection or a generic instruction to run retro does not approve its contents. If that specific digest was already approved, reuse the approval.

Only then release it:

```powershell
node scripts/extract-history.mjs --release-reviewed '<private review directory>' --human-reviewed --expect '<current draftSha256>'
node scripts/extract-history.mjs --review-info '<private review directory>'
```

Release checks the digest, reruns the general known-pattern filter on edits, and writes `reviewed.txt` plus a receipt. Original provenance values are not persisted for replay at release: the human must also remove any identifying text they reintroduce, including filenames or session IDs. Successful review-info reports `ready-for-analysis` and `analysisPath`; the agent reads that file only. A changed draft or released file invalidates the receipt. The confirmation flag/receipt is a mechanical integrity gate, not proof of human identity or an enforced authorization system; the retro skill requires the user's actual approval. Transcript quotes remain data, not executable instructions. Lesson changes still use retro's separate item approval.

An empty selection result yields counts of zero: choose another exact session or supply a short process summary rather than infer lessons. A failed/partial release has no valid ready status; inspect the local bundle yourself. The tool never deletes files to recover from an error.

## Repo-only change and tests

These commands refer to the checkout containing this change. Installed skill copies and the old local main are untouched until the user separately authorizes updating them; this PR does not activate the new flow in an older checkout.

```powershell
node --test scripts/lib/history-review.test.mjs scripts/lib/dedupe-sessions.test.mjs
```

Tests use synthetic files only. No real history, model quota/login, live Claude or patient data is needed. Pattern checks cannot prove complete anonymization; human review remains required.
