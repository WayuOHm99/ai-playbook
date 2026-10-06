<!--
TEMPLATE. Agents: update this file at the END of every session (and before any /clear or handoff).
Keep it to one screen. Overwrite sections; do not append history (git log is the history).
-->
# State

Updated: <YYYY-MM-DD HH:MM> by <agent/human>  |  Branch: `<branch>`  |  Tier: <demo|internal|production>

Verified candidate SHA: `<sha>` | Checkpoint: `<HANDOFF.md path or none>`

## Approved scope / authorization
<Do / Don't / Done when. Record concrete approval already given, remote/publishing rights, and actions still requiring approval. Do not infer broader rights from a skill name.>

## Current phase
<e.g. Phase 2: import flow. One line on where the project is overall.>

## Current ticket
<#issue - title or spec/task-graph path for implement-spec>  (<not started | in progress | in review | blocked>)
Acceptance criteria left: <list or "all done">

## Next action
<The single next concrete step, written so a fresh agent can start immediately. Include file/command.>

## Blockers / waiting on
- <who/what, since when>   <!-- or "none" -->

## Open decisions for the human
- <question, recommended answer>   <!-- or "none" -->

## Last verified commands
<!-- Paste actual results, with date. Do not write "passes" without having run it. -->
| Command / criterion | Result / evidence | Candidate SHA | When |
|---|---|---|---|
| `<verify command for this scope>` | <pass / fail / evidence path> | `<sha>` | <YYYY-MM-DD> |
| `<DB-backed check if in scope>` | <pass / fail / not run> | `<sha>` | <YYYY-MM-DD> |
| App acceptance steps (if relevant) | <actual result / evidence> | `<sha>` | <YYYY-MM-DD> |

## Not tested / known risks
- <item>

## Session notes (only what the next session needs)
- <gotcha discovered, dead end already tried>
