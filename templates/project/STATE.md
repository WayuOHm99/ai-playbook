<!--
TEMPLATE. Agents: update this file at the END of every session (and before any /clear or handoff).
Keep it to one screen. Overwrite sections; do not append history (git log is the history).
-->
# State

Updated: <YYYY-MM-DD HH:MM> by <agent/human>  |  Branch: `<branch>`  |  Tier: <demo|internal|production>

## Current phase
<e.g. Phase 2: import flow. One line on where the project is overall.>

## Current ticket
<#issue - title>  (<not started | in progress | in review | blocked>)
Acceptance criteria left: <list or "all done">

## Next action
<The single next concrete step, written so a fresh agent can start immediately. Include file/command.>

## Blockers / waiting on
- <who/what, since when>   <!-- or "none" -->

## Open decisions for the human
- <question, recommended answer>   <!-- or "none" -->

## Last verified commands
<!-- Paste actual results, with date. Do not write "passes" without having run it. -->
| Command | Result | When |
|---|---|---|
| `<npm run verify>` | <pass / fail (n tests)> | <YYYY-MM-DD> |
| `<npm run verify:db>` | <pass / fail / not run> | <YYYY-MM-DD> |
| App starts (RUN.md steps) | <ok / problem> | <YYYY-MM-DD> |

## Not tested / known risks
- <item>

## Session notes (only what the next session needs)
- <gotcha discovered, dead end already tried>
