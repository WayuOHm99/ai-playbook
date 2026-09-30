<!--
TEMPLATE. Handover package for hospital IT when the internship ends (or at any change of maintainer).
Write for a competent sysadmin who has never seen this project. NEVER put secret values here: only WHERE they are kept.
Test it: give this file + the repo to a fresh agent acting as a new maintainer; every gap it finds is a bug in this doc.
Keep it current: review at every release and before the last week of the internship.
-->
# Handover: <System name>

Version/commit handed over: `<git sha / tag>`   Date: <YYYY-MM-DD>   Tier: <internal|production>
From: <developer>   To: <hospital IT owner name, unit>   System owner (business): <name, unit>

## 1. What this system is
<3-5 lines: purpose, who uses it, how many users, which department owns the data.>
Does it hold personal data? <staff / asset / none>. Patient data: **no** (if yes: DPO approval ref <...>).

## 2. Where everything is
| Thing | Location |
|---|---|
| Source code | <GitHub repo URL> (owner account: <who>) |
| Server | <hostname/IP, OS, location> |
| App URL | <https://...> |
| Install folder on server | <path> |
| Database | <MySQL 8.4 container `db`, volume `<name>`> |
| Backups | <path/host>, schedule <nightly HH:MM>, retention <14d/8w/12m> |
| Logs / errors / uptime | <Dozzle URL>, <Bugsink URL>, <Uptime Kuma URL> |
| Docs | `README.md`, `RUN.md`, `docs/`, `DECISIONS.md` |

## 3. Install from scratch
<!-- Numbered, copy-pasteable, tested on a clean machine. -->
1. Prerequisites: <Docker Engine x.y, Compose, git, ports 80/443 free, DNS name `<...>`>
2. Get the code / images: `<git clone ... | docker pull ...:<tag>>`
3. Configure: copy `deploy/env.example` to `<path>/.env` and fill values (see section 4)
4. Start: `<docker compose -f deploy/compose.prod.yaml up -d>`
5. Create first admin: `<npm run db:bootstrap | command>` (password set from env, change on first login)
6. Verify: open `<URL>`; `<curl -k https://.../api/health>` returns `<ok>`

## 4. Configuration
| Setting (env var) | Meaning | Where the real value is kept |
|---|---|---|
| `<DB_PASSWORD>` | MySQL app user | <password manager entry / root-only file `<path>`> |
| `<SESSION_SECRET>` | signs sessions | <...> |
| `<SMTP_*>` | alert/email | <...> |
Rotate all secrets at handover: <done on YYYY-MM-DD | TODO>.

## 5. Update / release / rollback
- Update: `<pull new tag; docker compose pull && up -d; run migrations>`; wait for `/api/health`.
- Before any migration: take a backup (section 6).
- Rollback: `<redeploy previous tag; restore DB backup if migration ran>`
- Release log: `<CHANGELOG.md / docs>`

## 6. Backup and restore
- Backup job: `<script/command>` runs `<nightly>`; output `<path>`; encrypted with `<tool>`; key kept by `<who>`.
- Restore steps (tested): 
  1. `<stop app>`  2. `<restore command>`  3. `<start app>`  4. `<smoke test>`
- **Restore drill log** (a backup never restored is not a backup):
| Date | Done by | Backup used | Time taken | Result |
|---|---|---|---|---|
| <YYYY-MM-DD> | <name> | <file> | <min> | <ok/problem> |

## 7. Accounts and access
| Account | Purpose | Owner | How to reset |
|---|---|---|---|
| App admin `<username>` | manage users | <IT owner> | <procedure> |
| Server login | deploy | <name> | <...> |
| GitHub | repo/CI | <name> | <...> |
| DB admin | emergencies only | <name> | <...> |
Review app users against the HR list every <month/quarter>. Remove departed staff the same day.

## 8. Routine tasks
| Task | How often | How |
|---|---|---|
| Check backup ran + Kuma green | daily | <...> |
| Restore drill | <monthly/once> | section 6 |
| Apply dependency/security updates | monthly | Dependabot PRs; run `<npm run verify>` |
| TLS certificate expiry | <before date> | <renewal steps> |
| Review access list | quarterly | section 7 |

## 9. Common problems
| Symptom | Likely cause | Fix |
|---|---|---|
| White screen | <API down / wrong API URL / stale cache> | see `RUN.md` |
| Cannot log in | <account disabled / clock skew / DB down> | <...> |
| Import fails | <file format> | <...> |
| Disk full | <logs/backups> | <...> |

## 10. Known issues and risks
- <issue, impact, workaround, ticket link>

## 11. Personal data and compliance
- Data held: <fields>. Retention: <policy>. ROPA entry: <ref/date>. DPO contact: <name>.
- Breach procedure: <who to call, 72-hour PDPC rule>; runbook at `<path>`.

## 12. Contacts
| Role | Name | Phone/Line/Email | When to call |
|---|---|---|---|
| Hospital IT owner | <...> | <...> | outages |
| System owner (business) | <...> | <...> | data questions |
| DPO | <...> | <...> | data incidents |
| Original developer | <...> | <...> | questions only, no SLA after <date> |
