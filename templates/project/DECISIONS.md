<!--
TEMPLATE. Lightweight ADR log: one file, newest at the TOP. Use for small projects.
Big projects: switch to docs/decisions/NNNN-title.md (one file each) and link them here.
Write an entry when the decision is hard to reverse or deviates from the house stack. Write it at decision time.
Never edit an old entry's decision; add a new entry that supersedes it and mark the old status.
-->
# Decisions

| # | Date | Title | Status |
|---|---|---|---|
| 2 | <YYYY-MM-DD> | <title> | Accepted |
| 1 | <YYYY-MM-DD> | <title> | Accepted |

<!-- Copy the block below for each new decision. Put it under this line, newest first. -->

## <#> - <Short title>
- **Date:** <YYYY-MM-DD>   **Status:** <Proposed | Accepted | Superseded by #n>   **Decided by:** <human name> (agent proposed: <yes/no>)
- **Context:** <the problem and constraints, 2-4 lines>
- **Decision:** <what we chose, one or two sentences>
- **Options rejected:** <option: why not>
- **Consequences:** <what gets easier, what gets harder, what must be true>
- **How to reverse:** <steps and rough cost>
- **Related:** <issue/PR/ticket links>

## 1 - <Example: Use MySQL 8.4, not PostgreSQL>
- **Date:** <YYYY-MM-DD>   **Status:** Accepted   **Decided by:** <name>
- **Context:** Hospital IT already runs MySQL; house stack default.
- **Decision:** MySQL 8.4 LTS via mysql2.
- **Options rejected:** PostgreSQL 18: second engine for IT to maintain.
- **Consequences:** No range-exclusion constraints; overlap rules live in code + tests.
- **How to reverse:** Port schema and data; about <n> days.
