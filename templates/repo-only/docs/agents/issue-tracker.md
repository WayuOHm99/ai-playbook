# Issue tracker: Local Markdown

This example chooses Matt's local tracker for a small task in the same checkout. Specs live at `.scratch/<feature>/spec.md`; implementation tickets are separate files at `.scratch/<feature>/issues/<NN>-<slug>.md`, numbered from 01. Status and blocking references are recorded in each ticket. Append discussion under its Comments heading.

"Publish" means write the agreed local file, never create an external issue or send a message. Fetch the supplied ticket path directly. Preserve prior files; create or update only within authorized scope.

Local scratch files are commonly ignored. They are not durable remote state. Before a cross-machine handoff, select an approved durable tracker or an explicit transfer for the exact files, and verify receiver access. Do not claim a push transmitted ignored tickets or evidence.
