# 03 - House tech stack for on-prem hospital internal systems (research, as of 2026-09-30/10-01)

STATUS: complete first pass. Versions and dates were queried directly from package registries / GitHub release APIs on 2026-09-30 (T1). Legal/regulatory text that could not be machine-read is marked UNVERIFIED.

Evidence tiers: T1 = official docs, release pages, registries, statute text, regulator site. T2 = reputable secondary (endoflife.date, law-firm or trade summaries). T3 = blog, forum, my own engineering judgement, or search-snippet only. "L" = local evidence from read-only inspection of the four projects. UNVERIFIED = not confirmed from a primary source in this pass.

Assumption to confirm: "SUTH" = Suranaree University of Technology Hospital (affiliated with SUT Institute of Medicine; T3 search results, https://en.wikipedia.org/wiki/Institute_of_Medicine,_Suranaree_University_of_Technology). If right, the hospital sits under a public university (not directly MOPH), which changes which regulator/guidance binds it. UNVERIFIED; ask IT/DPO.

---

## 0. Executive recommendation

1. **Standardize on the suth stack's shape. Do not switch.** Vue 3 + Vite SPA, Tailwind 4, TanStack Query, reka-ui; Express 5 + zod; MySQL 8.4 LTS; Vitest + Playwright + axe; Docker Compose behind Caddy. Switching buys nothing measurable for one person plus agents, and ADR-0007 (L: `D:\suth-helpdesk-assets\docs\decisions\0007-improve-in-place-instead-of-rewriting.md`) already rejected a Nuxt + TS + PostgreSQL rewrite for sound reasons.
2. **But the suth repo is not yet the "house standard"; it is a good prototype with production gaps.** Observed (L): zero TypeScript files (244 .js, 87 .vue, 11 .cjs), CommonJS API, no Dockerfile for api or web (compose.yaml only runs MySQL + phpMyAdmin), no CI (GitHub Actions deliberately removed after account lock, `docs/how-to/verify-changes.md`), 15 hand-run SQL migrations guarded by a startup schema check, JWT sessions that cannot be revoked (ADR-0006), `engines.node >=20`. Close these in place (section 2 backlog) and then copy the result as the template.
3. **Language:** TypeScript for all new code (TS 7.0.2). Existing JS: `checkJs` + JSDoc on the API and `packages/domain`, `vue-tsc` on web; convert file-by-file when touched. No big-bang.
4. **DB:** MySQL 8.4 LTS (supported to 2032-04-30, T2) via `mysql2`, with **Kysely** as typed query builder + migrator for new code. PostgreSQL 18 is technically nicer (range EXCLUDE constraints, which ADR-0005 wanted) but the hospital IT team's existing skills and suth's current engine decide it; revisit only if a project needs Postgres-only features.
5. **Auth:** local accounts now (Argon2id or bcrypt, server-side sessions, RBAC in one middleware, TOTP for admins), behind a single `auth` module whose interface allows a later LDAP/AD bind (`ldapts`) or OIDC (Keycloak). Do not run an IdP as a solo developer unless 3+ apps need SSO and hospital IT agrees to co-own it.
6. **Deploy:** hospital server, Docker Engine 29 + Compose 5, Caddy in front (internal CA certs), images built in CI, pulled by the server (outbound-only), human-approved. Local `npm run verify` stays the authority because CI can be locked out (it already was).
7. **Observability (lightest viable):** self-hosted Bugsink (or GlitchTip) for errors via the Sentry SDK, pino JSON logs to stdout + Dozzle to view, Uptime Kuma for uptime and backup heartbeats. **No Sentry SaaS** for hospital systems unless DPO signs off (PDPA s.28 cross-border, stack traces carry user data).
8. **Compliance stance:** treat every hospital app as holding personal data (staff) and potentially health data (patient identifiers leak into tickets). Keep patient data out of these systems by design; if HIS integration is ever required, go through the HIS's API/HL7/FHIR interface, read-only, minimal fields, after a DPIA-style review.
9. **Cybersecurity Act 2019:** "public health" is a designated CII sector (T2). Whether SUTH itself is a designated CII organization is UNVERIFIED and must be asked of hospital management; build as if audits could come (asset inventory, logging, BCP/DR evidence).
10. **Deviate only with a written reason** (section 9): Streamlit for analyst-only tools, Cloudflare/Vercel/Supabase for non-hospital projects, PWA for phone check-in (same Vue app, not native).

---

## 1. House stack table

Versions verified 2026-09-30 from npm registry (`registry.npmjs.org/<pkg>`) or GitHub `releases/latest` API unless noted; all T1 for version+date. "Date" = publish date of that version.

### 1.1 Runtime, language, frontend

| Layer | Choice | Version (date) | License | Why | Rejected alternatives |
|---|---|---|---|---|---|
| Runtime | Node.js 24 LTS "Krypton" | 24.21.0 (2026-09-07); LTS until 2028-04-30 | MIT | LTS with the longest remaining runway; Node 26 becomes LTS 2026-10-28 (schedule.json), adopt it after its first months. Node 22.23.3 (2026-09-23) is in maintenance to 2027-04-30. Node 20 is at/after EOL (2026-04-30, T2/UNVERIFIED this pass) and suth still declares `>=20` | Bun, Deno (smaller ops/knowledge base on hospital servers) |
| Language | TypeScript | 7.0.2 (2026-07-08) | Apache-2.0 | Types are the cheapest guard rail for agent-written code. TS 7 is the native compiler; **verify `vue-tsc` (3.3.11, 2026-08-21) and typescript-eslint (8.71.0) accept it before upgrading** (UNVERIFIED); CAMPBANK runs TS 6.0.3 (L) as a safe fallback | Plain JS (current suth state) |
| Frontend framework | Vue 3 (SPA, Composition API, `<script setup>`) | 3.5.43 (2026-09-17) | MIT | Already 87 SFCs + design system (ADR-0008); SPA is enough for authenticated internal tools; no SSR server to secure | Nuxt 4.5.2 (adds Nitro server runtime, not needed); Next 16.3.7 / React 19.3.0 (larger training corpus, but Vercel-centric server model and a full rewrite); React Router 8.4.0; SvelteKit 2.70.3 / Svelte 5.57.1 (smallest corpus) |
| Build | Vite | 8.3.1 (2026-09-24) | MIT | Already used | webpack, Nuxt builder |
| Router | vue-router | 5.3.1 (2026-09-02) | MIT | Standard | none |
| Server state | TanStack Vue Query | 5.104.0 (2026-09-26) | MIT | ADR-0009 already standardizes it; avoids global store. Add Pinia 4.0.3 only for real client-only state | Pinia as data layer, axios-only fetching |
| UI primitives | reka-ui (headless, accessible) | 2.10.5 (2026-09-21) | MIT | Accessibility behaviours for free; business views must go through suth's `ui/` kit | shadcn-vue copy-paste sprawl, Nuxt UI 4.11.2 (Nuxt-first) |
| CSS | Tailwind CSS | 4.3.3 (2026-07-16) | MIT | Already used, tokens per ADR-0008 | CSS-in-JS |
| Thai fonts | `@fontsource-variable/anuphan` (body/headings) + `@fontsource/ibm-plex-mono`; self-hosted | 5.3.0 (2026-07-19) | OFL-1.1 | Self-hosted: no Google Fonts call (privacy, works offline on hospital LAN). Alternatives in same family: `@fontsource/noto-sans-thai` 5.3.0, `@fontsource/ibm-plex-sans-thai` 5.3.0. Set `lang="th"`, line-height >= 1.5 (Thai tone marks), sort with `Intl.Collator("th")` not MySQL collation | Google Fonts CDN, system fonts only |

### 1.2 Backend and data

| Layer | Choice | Version (date) | License | Why | Rejected |
|---|---|---|---|---|---|
| HTTP framework | Express 5 | 5.2.1 (2025-12-01) | MIT | Already used with a disciplined shared layer (`asyncHandler`, `validate`, `ApiError`, RFC 9457 problem details, ADR-0010). Most-known framework to models. Express 5 handles async errors natively. Stale release cadence (9 months) is acceptable for a stable core | Fastify 5.12.5 (2026-09-16, technically better: schemas, pino built in, `@fastify/rate-limit` 11.2.0; acceptable for a greenfield service but a second framework costs more than it saves); Hono 4.13.11 (edge-first, smaller ecosystem on Node); NestJS 12.1.1 (strong conventions help agents, but DI/decorator ceremony; suth's feature folders already give conventions) |
| Validation | zod | 4.6.5 (2026-09-13) | MIT | Already at 4.x; one schema for API input and form validation; put shared schemas in `packages/domain` | Joi, Ajv-only |
| Security headers / limits | helmet 8.3.0 (2026-07-12), express-rate-limit 8.7.0 (2026-08-29), multer 2.4.0 (2026-09-14) for uploads | MIT | Already used; keep, add upload type/size limits | hand-rolled |
| DB engine | MySQL 8.4 LTS | 8.4.11 (latest 8.4 per dev.mysql.com; 2026-06-30 per endoflife.date T2); premier support to 2029-04-30, extended to 2032-04-30 (T2) | GPL-2.0 (Community) | Matches suth today (ADR-0024), hospital IT skills, `utf8mb4` Thai OK. **MySQL 9.7.2 LTS also exists** (9.7 GA 2026-04-21, support to 2031/2034, T2) and MySQL now has a 26.x innovation line (26.7.0) - ignore innovation releases; consider 9.7 LTS for new DBs after 6+ months of field use | PostgreSQL 18.6 (supported to 2030-11-14, T1; PostgreSQL License) - better constraints, but second engine skills; MariaDB 13.0.2 (GPL-2.0; drift from MySQL); SQLite (no concurrent multi-user ops story) |
| Driver | mysql2 | 3.24.5 (2026-09-29) | MIT | Already used; prepared statements | mysql (legacy) |
| Query layer / migrations | Kysely (+ `kysely-codegen` 0.20.0) | 0.29.6 (2026-09-16) | MIT | SQL-first, typed, tiny, built-in migrator; fits suth's hand-written-SQL culture; models write it well. Pre-1.0: pin exact versions | Drizzle ORM 0.45.3 (2026-09-21; 1.0 still beta - fine alternative); Prisma 7.10.0 (2026-08-25; 8.0 is RC; heavier generated client, schema-first, shadow DB); TypeORM/Sequelize (legacy feel) |
| Logging | pino | 10.3.1 (2026-02-09) | MIT | JSON to stdout with request id (suth already has request ids) | winston |
| Password hashing | `argon2` 0.45.1 (2026-07-21) or keep `bcrypt` 6.0.0 (2025-05-11) | MIT | Argon2id preferred by OWASP guidance; bcrypt acceptable and already deployed - rehash on login to migrate | custom, SHA-*, MD5 |
| LDAP client (phase 2) | ldapts | 9.2.0 (2026-09-15) | MIT | Maintained, TypeScript, async | passport-ldapauth 3.0.1 (last release 2020-11-16) |
| Spreadsheet import | xlsx from `cdn.sheetjs.com` tarball 0.20.3 (suth ADR-0003) | 0.20.3 | Apache-2.0 | Vendor-only distribution; npm copy is stale/vulnerable. Mirror the tarball inside the hospital (prepare-for-production checklist) | npm `xlsx` |

### 1.3 Quality tooling

| Layer | Choice | Version (date) | License | Why | Rejected |
|---|---|---|---|---|---|
| Unit/component test | Vitest + `@vitest/coverage-v8` | 5.0.2 (2026-09-25) / 5.0.3 | MIT | One runner for web, API, domain (suth API uses `node --test`; converge opportunistically) | Jest, node:test everywhere |
| Component testing | @vue/test-utils | 2.5.1 (2026-09-16) | MIT | Standard | Cypress CT |
| E2E + a11y | Playwright + `@axe-core/playwright` | 1.63.0 (2026-09-04) / 4.13.0 (2026-08-11) | Apache-2.0 / MPL-2.0 | Already used, three projects (fixture/db/screenshots) | Cypress |
| DB integration tests | compose `db-dev` + seed (suth ADR-0032); Testcontainers (`@testcontainers/mysql` 12.2.0) optional | MIT | Real MySQL, never mocks; seeds are synthetic | SQLite stand-in |
| Lint | ESLint 10.11.0 (flat config) + typescript-eslint 8.71.0 + eslint-plugin-vue 10.11.1 | MIT | Vue SFC support is most complete here | Biome 2.5.14 (great speed; Vue SFC support partial, UNVERIFIED); oxlint 1.86.0 (RubricLens uses it; fine as a fast pre-pass, not sole linter for Vue) |
| Format | Prettier 3.9.9 (2026-09-23) | MIT | Default, zero debate | Biome formatter |
| Typecheck | `tsc --noEmit` + `vue-tsc` | see above | | | |
| Dead code / deps | knip 6.38.0 (2026-09-23) | ISC | Keeps agent-generated code lean | none |
| Git hooks | plain `core.hooksPath` (.githooks, as suth does) or lefthook 2.1.15 (2026-09-29) with lint-staged 17.6.0 | MIT | suth's hook also blocks push to `main` (L). husky 9.1.7 last released 2024-11-18 - works but dormant | husky |
| Secret scan | gitleaks 8.30.1 (2026-03-21) | MIT | pre-commit + CI | none |
| Image/dep scan | `npm audit --omit=dev` + Trivy 0.74.0 (2026-08-14; pin by digest/SHA) | Apache-2.0 | Cheap; RubricLens already gates on audit (L) | |
| Dependency updates | GitHub Dependabot (grouped, weekly) | n/a | No extra service; Renovate 44.121.4 is AGPL-3.0 (self-host burden) | Renovate |

### 1.4 Delivery and operations

| Layer | Choice | Version (date) | License | Why | Rejected |
|---|---|---|---|---|---|
| Containers | Docker Engine / Compose | 29.8.1 (2026-09-15) / 5.5.1 (2026-09-03) | Apache-2.0 | Requested deploy target. Non-root user, read-only root FS, `cap_drop: [ALL]`, memory limits, healthchecks, digest-pinned base images, ports bound to 127.0.0.1 (suth already does this for DB) | Kubernetes (overkill), Podman (fine, less agent knowledge) |
| Reverse proxy / TLS | Caddy | 2.11.4 (2026-06-03) | Apache-2.0 | ~10-line Caddyfile; HTTP security headers, gzip, HTTP->HTTPS. Certs: hospital enterprise CA files or Caddy internal CA (`tls internal`) with root pushed to staff PCs; public ACME only if a public domain + DNS-01 is allowed | nginx 1.31.6 (BSD-2; more config), Traefik 3.7.13 (MIT; label magic) |
| Secrets | SOPS + age (encrypted `.env.enc` in git) | SOPS 3.13.3 (2026-07-23, MPL-2.0); age 1.3.2 (2026-08-29, BSD-3) | | Secrets versioned with code without plaintext; decrypt on server at deploy. Minimum viable: root-owned `0600` env file outside repo | Vault (overkill), Docker Swarm secrets |
| Backup | `mysqldump --single-transaction` (+ binlog if PITR needed) → restic | restic 0.19.1 (2026-07-05) | BSD-2-Clause | Encrypted, deduplicated, verifiable (`restic check`) to a second host/NAS | Borg 1.4.5 (BSD-ish; fine), vendor backup agents |
| CI | GitHub Actions for build/test/scan; actions pinned by full commit SHA | actions/checkout 7.0.1 (2026-07-20), docker/build-push-action 7.4.0 (2026-09-15) | MIT / Apache-2.0 | No secrets or PHI in CI; synthetic seed only. Self-hosted runner (actions/runner 2.337.0) only if hospital policy forbids pulling images from GHCR - it puts a code-executing agent inside the hospital LAN | Jenkins; Forgejo/Gitea Actions (full on-prem, more ops) |

### 1.5 Auth, observability

| Layer | Choice | Version (date) | License | Why | Rejected |
|---|---|---|---|---|---|
| Identity provider (only if SSO needed) | Keycloak | 26.7.4 (2026-09-16) | Apache-2.0 | Mature LDAP/AD federation, OIDC/SAML, RBAC; clean license | authentik 2026.8.3 (2026-09-17): MIT core but `enterprise/` directory under separate license, per its LICENSE file; good UX, newer; Authelia, better-auth 1.7.6 (library, not an IdP) |
| Error tracking | **Bugsink** (default) or **GlitchTip** (fallback) via Sentry SDKs | Bugsink 2.6.1 (2026-09-25), PolyForm Shield 1.0.0; GlitchTip backend 6.2.6 tag (2026-08-07), MIT; `@sentry/node`+`@sentry/vue` 11.1.0 (2026-09-28, MIT) | see left | Both accept Sentry SDK DSNs. GlitchTip README claims runs on ~512 MB with PostgreSQL (T1 project README). Bugsink is single-container; its DB support for MySQL/SQLite is UNVERIFIED in this pass (check docs before choosing). Bugsink license is source-available, not OSI open source (fine for internal use, no competing-product clause issue) | Sentry SaaS (data leaves hospital); Sentry self-hosted 26.9.0 (FSL-1.1-Apache-2.0; large multi-service stack, footprint figures UNVERIFIED) |
| Logs | pino JSON → Docker `json-file` with `max-size`/`max-file` → Dozzle | Dozzle 11.1.3 (2026-09-29) | MIT | Live tail/search in browser, no storage tier to run | Loki 3.7.8 + Grafana 13.2.3 (both AGPL-3.0; overkill for one person), ELK |
| Uptime / heartbeats | Uptime Kuma | 2.5.5 (2026-09-16) | MIT | HTTP checks on `/api/health/live` + `/api/health`, push monitors for backup jobs, TLS-expiry alerts | Prometheus+Alertmanager (overkill) |

---

## 2. Keep vs switch (existing suth stack)

### 2.1 Decision
**Keep** Vue/Vite/Tailwind/TanStack Query/reka-ui, Express 5, zod, MySQL 8.4, Vitest/Playwright/axe. **Change in place:** add TypeScript, containerize api+web, migration runner, CI, revocable sessions, observability, backup drills. **Do not** port to Nuxt, Next or SvelteKit, and **do not** move to PostgreSQL now.

### 2.2 Honest scoring (1-5, higher is better for "one person + AI agents + on-prem + longevity")

| Option | Agent familiarity | Fewer moving parts on-prem | Existing investment | Type safety | Longevity | Verdict |
|---|---|---|---|---|---|---|
| Vue 3 SPA + Express 5 + MySQL (suth, upgraded) | 4 | 5 | 5 | 3 now, 4 after TS | 4 | **House default** |
| Nuxt 4 full-stack + Nitro + PG | 4 | 3 (extra server runtime) | 1 | 4 | 4 | Rejected; ADR-0007 already rejected the rewrite |
| Next 16 + React 19 | 5 | 2 (RSC/Vercel-centric, self-host adds work) | 1 (CAMPBANK only) | 4 | 4 | Keep for CAMPBANK; not for hospital |
| React + Vite SPA + Hono/Express | 5 | 5 | 1 | 4 | 4 | Equal in theory; loses on rewrite cost |
| SvelteKit 2 | 3 | 4 | 0 | 4 | 3 | Rejected: smallest corpus |
| Fastify 5 instead of Express 5 | 4 | 5 | 2 | 4 | 4 | Marginal gain, not worth a second framework |
| NestJS 12 | 5 | 3 | 0 | 5 | 4 | Conventions are attractive; ceremony outweighs it at this size |
| PostgreSQL 18 instead of MySQL 8.4 | 5 | 4 | 2 | - | 5 | Revisit per-project, see 2.4 |

Scores are T3 engineering judgement; inputs are the verified versions above and local evidence.

### 2.3 Why not React even though models know it best
React does have the larger corpus (T3). But the decisive facts are local: 87 Vue SFCs, a documented design system, TanStack Query conventions, and Playwright/axe suites that already pass. An agent working from `AGENTS.md` + ADRs in an existing Vue codebase is more reliable than an agent writing fresh React with no conventions. The portfolio already has three frontend stacks (Vue, Next, React+Vite); a fourth migration adds entropy. Standardize hospital work on Vue and leave CAMPBANK and RubricLens alone.

### 2.4 Database note (honest)
ADR-0005 (L) argued for PostgreSQL because of `EXCLUDE` constraints for non-overlapping location history; then ADR-0024 moved suth to MySQL 8.4 and ADR-0005 became "Deferred". That overlap rule now lives in code + tests, which ADR-0005 itself calls weaker. If a future project has real range-exclusion, row-level security, or needs Postgres-only tooling (GlitchTip needs PostgreSQL; authentik is also PostgreSQL-based - UNVERIFIED), run Postgres for that project or for the ops tools, not as a migration of suth.

### 2.5 In-place upgrade backlog for suth (recommendations only; nothing was modified)
1. `engines.node` to `>=24`; add `.nvmrc`; add multi-stage Dockerfiles for api and web (web served as static files by Caddy).
2. Compose file for prod: caddy + api + db (+ error tracker, kuma, dozzle); drop phpMyAdmin from prod or keep on 127.0.0.1 read-only as now (L: already read-only account only).
3. Migration runner with a `schema_migrations` table (Kysely Migrator, forward-only, numbered); keep the startup schema check as a safety net.
4. TypeScript: `allowJs/checkJs` + `tsc --noEmit` on api and domain, `vue-tsc` on web; new files `.ts`.
5. Sessions: replace stateless JWT with a server-side `sessions` table (opaque random id in the existing httpOnly cookie, see ADR-0006) so disabling an account, password change, and logout take effect at once.
6. CI workflow (GitHub) mirroring `npm run verify`, plus gitleaks and audit; keep local verify authoritative.
7. Backup + restore drill script and a calendar entry (section 4.5).
8. Fix production-readiness checklist items already written in `docs/how-to/prepare-for-production.md`.

---

## 3. Auth

### 3.1 Options

| Option | Fits when | Cost to a solo dev | Verdict |
|---|---|---|---|
| Local accounts (current suth) | Few users, no AD, fast start | Password resets, offboarding lag, weak-password risk, duplicate identities | **Phase 1 default**, done properly |
| Direct LDAP/AD bind (`ldapts`) | Hospital has AD/LDAP and IT will supply a read-only service account + LDAPS | Small module; group-to-role mapping; fallback when AD is down | **Phase 2 default** if AD exists |
| OIDC via Keycloak 26.7.4 (federating AD) | 3+ apps, want real SSO/MFA, IT co-owns the IdP | Runs a JVM service, DB, upgrades, backups; it is tier-0 (if it is down, everything is down) | Only with IT co-ownership |
| authentik 2026.8.3 | Same as Keycloak, prefers modern UI | Same; enterprise-licensed directory exists | Alternative |
| Hospital-provided SSO (if one exists) | IT already runs an IdP | Integration only | Best outcome; ask IT first |

Whether SUTH runs Active Directory/LDAP or an existing IdP is UNVERIFIED; it is the first question for hospital IT.

### 3.2 Rules for any option
- One `auth` module exposing `authenticate()`, `currentUser()`, `can(user, action, resource)`. Providers are plugins (local, ldap, oidc). Apps never read provider-specific claims directly.
- Sessions server-side and revocable; cookie `httpOnly`, `secure`, `SameSite=Lax` (or `Strict`), short idle timeout and absolute lifetime; CSRF protection for cookie-authenticated unsafe methods.
- Passwords: Argon2id (or bcrypt cost >= 12), length-based policy, breached-password check, rate limit + lockout with audit. No shared accounts.
- MFA (TOTP) mandatory for admin roles; consider for helpdesk agents.
- RBAC: roles stored in app DB; AD groups map to roles at login, not per request. Start with `viewer`, `staff` (requests/check-out), `technician`, `asset_admin`, `system_admin`. Deny by default; enforce on the server in one middleware plus resource-level checks (own-department data); test the role x endpoint matrix automatically (suth's `require-auth/require-admin/require-staff` is the seed, L).
- Joiner/mover/leaver: monthly review of accounts against HR list (PDPC security-measures announcement expects user registration/de-registration, provisioning, privileged-access management, and periodic review of access rights; structure confirmed from the PDF, Thai wording not machine-readable, see 6.3).

---

## 4. Tooling

### 4.1 Tests
- Pyramid: many Vitest unit tests on `packages/domain` (business rules: fiscal year, money, Thai formatting) and validators; API integration tests against a real MySQL container with synthetic seed; Playwright E2E for critical flows (login per role, check-out/check-in, ticket lifecycle) with axe on every page; screenshots suite optional.
- Rule for agents: bug fix = failing test first (suth has the `tdd` and "no .only/.skip" culture in RubricLens, L).
- Gate: `npm run verify` = lint + typecheck + tests + build + bundle budget + audit. Keep it runnable offline on the developer machine.

### 4.2 Lint/format/typecheck/pre-commit
- pre-commit: lint-staged (Prettier + ESLint on staged files) + gitleaks on staged diff. pre-push: typecheck + unit tests + block push to `main` (existing suth behaviour). Hooks are a convenience; CI and `verify` are the gate.

### 4.3 CI and on-prem deploy
Pipeline (GitHub Actions, no secrets, no PHI): checkout (SHA-pinned) → install (`npm ci`) → lint/typecheck/test → build images → Trivy/audit → push to GHCR with commit-SHA tag. Deploy: on the hospital server a script (`deploy.sh`, run by a human or a systemd timer that only pulls an approved tag) does `docker compose pull && docker compose up -d`, runs migration, waits for `/api/health`, and rolls back to the previous tag on failure. Outbound-only from the hospital network; no inbound SSH from the internet. Record each release per suth's `release-and-recovery.md`.
Fallbacks if GitHub is unavailable (as happened in suth): build on the developer machine, `docker save`, carry to the server; or self-hosted Forgejo. Decide with hospital IT whether GHCR pulls are allowed by firewall policy (UNVERIFIED).

### 4.4 Migrations and seeds
- Forward-only numbered migrations; every migration tested on a copy of production-shaped data; backup before run (suth doc already says so, L). Separate seeds: `seed_ci` (synthetic, used in dev/CI), `bootstrap-admin` (sets a locked admin password from env at install). Never load real staff data in dev.

### 4.5 Backup and restore drills
- Nightly dump (`--single-transaction --routines --triggers`, utf8mb4) plus upload directory → `restic` to a second host; weekly `restic check`; retention e.g. 14 daily / 8 weekly / 12 monthly (T3 recommendation).
- **Monthly restore drill**: restore into a scratch container, run `verify:db`-style smoke test and row-count/checksum comparison, log date + duration + result. Push a heartbeat to Uptime Kuma on success so a silent failure alerts.
- Backups contain personal data: encrypt, restrict access, include them in retention/erasure policy.

### 4.6 Reverse proxy, TLS, secrets
- Caddy terminates TLS; api/web/db only on an internal Docker network; DB not published (suth binds 127.0.0.1 only, L). HSTS once certs are stable; security headers at proxy plus helmet. Internal CA root must be installed on staff PCs and phones (required for camera/PWA features).
- Secrets: SOPS+age or root-only env file; rotate JWT/session secrets and DB passwords at each handover; never in images, logs, or compose files.

---

## 5. Observability (lightest viable for one person)

| Need | Pick | Notes |
|---|---|---|
| Errors (frontend + backend) | Bugsink or GlitchTip, self-hosted, Sentry SDK with `sendDefaultPii:false` and a `beforeSend` scrubber that drops emails, names, ticket text and request bodies | Sentry SaaS: events leave the hospital; with user context they are personal data, so cross-border rules (PDPA s.28) and DPO approval apply. Self-hosted Sentry 26.9.0 is FSL-licensed and heavy. |
| Logs | pino JSON to stdout, Docker log rotation, Dozzle for viewing; request id in every line and in audit rows (suth ADR-0035 already links them, L) | Do not log passwords, tokens, full request bodies, or patient identifiers |
| Uptime | Uptime Kuma: HTTP monitors for app, health endpoints, TLS expiry; push monitors for backup and restore-drill jobs | Alert channel: hospital email/SMTP first; chat integrations only if allowed (LINE Notify's status is UNVERIFIED, do not rely on it) |
| Audit | Application-level `audit_log` table, append-only, who/what/when/before-after of changed fields, request id (suth pattern) | Separate from operational logs; restrict read to auditor role |
| Metrics | Skip until needed | Add Prometheus/Grafana only if a recurring capacity question appears |

Footprint estimate: error tracker 1 container + DB, Dozzle 1, Kuma 1. Total under ~1.5 GB RAM (T3 estimate, UNVERIFIED).

---

## 6. Security and compliance

### 6.1 OWASP Top 10:2025 (T1, https://top10.owasp.org/2025; no release date on the page)
A01 Broken Access Control; A02 Security Misconfiguration; A03 Software Supply Chain Failures; A04 Cryptographic Failures; A05 Injection; A06 Insecure Design; A07 Authentication Failures; A08 Software or Data Integrity Failures; A09 Security Logging and Alerting Failures; A10 Mishandling of Exceptional Conditions.

How the house stack answers them:
| Item | House control |
|---|---|
| A01 | Server-side RBAC on every route, object-level checks, deny by default, role x endpoint test matrix, no second DB access path (suth AGENTS.md rule) |
| A02 | Hardened containers, headers via Caddy + helmet, no default accounts (suth bootstrap-admin), phpMyAdmin read-only/localhost, prod env checklist |
| A03 | Lockfile + `npm ci`, Dependabot, `npm audit`, Trivy, SHA-pinned Actions, mirror SheetJS tarball internally, minimal dependencies, review agent-added packages |
| A04 | TLS everywhere, Argon2id/bcrypt, no home-made crypto, encrypted backups, secrets via SOPS |
| A05 | Parameterized queries only (mysql2/Kysely), zod on all input, output encoding by Vue, validated uploads |
| A06 | ADRs + threat notes per feature, abuse cases for check-out/approval flows |
| A07 | Session management above, rate limit, lockout, MFA for admins |
| A08 | Signed/pinned images, CI-built artifacts only, import preview-before-write (ADR-0034) |
| A09 | Audit log + alerting on login failures, privilege changes, export events |
| A10 | Central error handler with problem details, no stack traces to users, fail closed, graceful degradation and health checks |

### 6.2 OWASP ASVS (T1)
Latest stable is **5.0.0, released 2025-05-30** (GitHub releases page https://github.com/OWASP/ASVS/releases; a rolling "bleeding edge" build dated 2026-09-03 is not a release). Target **Level 2** for internal hospital apps (Level 1 minimum for trivial tools). Practical ASVS essentials: authentication and session (server-side, revocable, MFA for admin), access control documented per role, input validation and output encoding, secure file upload, API security (schema validation, rate limits), logging without secrets, configuration and dependency hygiene, deployment/hardening. Chapter-level mapping of the 5.0.0 requirement IDs was not done (UNVERIFIED); pull the CSV/JSON from the release and turn L2 items into a per-project checklist.

### 6.3 Thai PDPA (B.E. 2562)
Primary text read: MDES unofficial English translation (T1 host, unofficial translation): https://www.mdes.go.th/uploads/tinymce/source/%E0%B8%AA%E0%B8%84%E0%B8%AA/Personal%20Data%20Protection%20Act%202019.pdf
- **s.26**: health data (and other sensitive categories) may not be collected without explicit consent unless an exception applies, including s.26(5)(a) for medical diagnosis, treatment, health-care management under the conditions stated. Staff IT data is ordinary personal data; patient identifiers inside tickets would turn an IT tool into a sensitive-data system. **Design rule: forbid patient data in helpdesk/asset systems; add UI warning and field-length limits on free text; periodic keyword scrub.**
- **s.37(1)** appropriate security measures, reviewed when needed, meeting the committee's minimum standard; **s.37(3)** a system to erase/destroy data at end of retention; **s.37(4)** notify the PDPC Office of a breach without delay and, where feasible, within **72 hours** unless unlikely to risk individuals; notify data subjects too if high risk.
- **s.39** record of processing activities (ROPA); **s.41** DPO for public authorities as announced, large-scale monitoring, or core sensitive-data processing. PDPC DPO announcement for state agencies: No.1 (2023-07-18) https://www.pdpc.or.th/2398/ and No.2 (2025-10-21) https://www.pdpc.or.th/18074/ (titles and dates read from the PDPC site; criteria inside the PDFs not read, UNVERIFIED whether a university hospital is covered).
- Penalties: administrative fines up to THB 3 million and THB 5 million tiers (s.82-84 region of the text) plus criminal provisions for s.26 misuse (s.79, up to 1 year imprisonment per the text). Exact tier-to-section mapping not re-read (UNVERIFIED).
- PDPC subordinate instruments found on the PDPC site (T1 for existence and dates; PDF Thai text not machine-readable so contents beyond structure UNVERIFIED):
  - Security measures of data controllers, 2022-06-20: https://www.pdpc.or.th/2971/. PDF structure confirms sections on organizational/technical/physical measures, access control (authentication, authorization, need-to-know, least privilege), user access management (registration/de-registration, provisioning, privileged access, secret authentication information, periodic review, removal), user responsibilities, **audit trails**, and privacy/security awareness. PDF: https://www.pdpc.or.th/wp-content/uploads/2024/01/announcement-pdpc-05.pdf
  - Breach notification criteria and procedure, 2022-12-15: https://www.pdpc.or.th/2405/ (classifies confidentiality/integrity/availability breaches; 72 h and 15-day late-request rule per law-firm summary T2: https://www.tilleke.com/insights/thailand-pdpc-notification-on-data-breaches/)
  - ROPA for processors: https://www.pdpc.or.th/2968/ ; data deletion/destruction standards 2024-08-13: https://www.pdpc.or.th/7020/ ; cross-border protection 2025-02-21: https://www.pdpc.or.th/10539/ ; administrative penalty criteria 2025-04-24: https://www.pdpc.or.th/11880/ ; data-subject access/copy criteria 2026-07-21: https://www.pdpc.or.th/27840/
- Effective date of main obligations 2022-06-01 (T2 common knowledge; the text I read states the operative chapters start one year after 2019-05-27 publication, later postponed by decree, not verified here).
- Retention: PDPA requires a defined period and erasure process but sets no universal number. **Proposed house defaults (T3, not legal advice; confirm with DPO):** helpdesk tickets 3 years then anonymize requester; asset history for asset life + 5 years; audit log 1 year online + archive per hospital policy; login/access logs at least 90 days (the Computer-Related Crime Act s.26 90-day traffic-log rule is UNVERIFIED here, ask IT); backups expire with their retention schedule.

### 6.4 Cybersecurity Act B.E. 2562 (2019): are Thai hospitals CII?
- The Act names **public health** among CII service sectors (T2: ThaiCERT CII page https://www.thaicert.or.th/en/cii/ lists public health as sector 07; law-firm summary https://silklegal.com/strengthening-thailands-cyber-resilience-new-list-of-critical-information-infrastructure-organizations/ says a Royal Gazette notification of 2025-09-16 names hospital operations, pharma/medical-device production, radiology/nuclear medicine and health data systems; note its claim that it replaced a "2023" classification conflicts with gazette search results showing 2564 (2021) and 2568 (2025) announcements, so treat details as UNVERIFIED). Gazette documents found but not readable: https://ratchakitcha.soc.go.th/documents/17175488.pdf (B.E. 2568 announcement) and https://www.ratchakitcha.soc.go.th/DATA/PDF/2564/E/303/T_0003.PDF.
- **Sector designation is not the same as organization designation.** The regime works through regulators identifying CII organizations within each sector; whether SUTH is one is UNVERIFIED. ThaiCERT summarizes CII obligations (T2): code of practice and standard framework, internal guidelines identifying critical processes, risk assessment at least annually (internal/external auditors), reporting significant cyber threats to NCSA and the regulator, notifying contacts within 30 days of designation.
- **Implications for this playbook:** (1) ask hospital management/DPO whether SUTH is designated and who the regulator is (MOPH vs university/MHESI route is UNVERIFIED); (2) even if not designated, hospital IT asset inventory, patching evidence, access logs and BCP/DR evidence are what auditors ask for, and the IT-asset/helpdesk systems produce exactly that evidence; (3) helpdesk/asset tools are supporting systems, but if they hold network maps, admin credentials, or device configs they are sensitive security assets: lock down, log, and back up accordingly.

### 6.5 MOPH and sector guidance
Found (T1 hosts; Thai contents not read in depth, UNVERIFIED beyond titles):
- MOPH regulation on protection and management of personal health data B.E. 2561 (ops.moph.go.th document URL from search; long URL not reproduced, search for the title in Thai).
- MOPH Personal Data Protection Guidelines, edition 1, June 2022: https://nptho.moph.go.th/web/web/documents/pdpa/PDPA_moph_Guidelines.pdf (a provincial MOPH office mirror, T2).
- Patient-data security management standard B.E. 2559, MOPH policy office: https://spd.moph.go.th/wp-content/uploads/2025/09/111111.pdf (title from search; content unread).
- MOPH Data Governance Policy/Guideline B.E. 2568 for the Digital Health Platform: https://ict.moph.go.th/th/extension/1747 (returned HTTP 403 in this pass; unread).
- HAIT Plus guideline (Thai Medical Informatics Association with NCSA), cybersecurity practice for public hospitals: https://tmi.or.th/wp-content/uploads/2023/12/HAIT_Plus_Guideline.pdf ; contains BIA, BCP, DRP, penetration test, crisis communication, CIO/CISO roles, Gantt plan (English terms in the PDF confirmed; 47 pages per trade report https://www.techtalkthai.com/hait-plus-ebook-by-tmi-and-ncsa/, T3). This is the most directly usable sector checklist even for a non-MOPH hospital.
- Hospital Accreditation (HA) standards include information management; not read in this pass.

### 6.6 Audit logs
Minimum fields: timestamp (UTC + local display), actor id + name snapshot, role, action, object type/id, changed fields before/after (only changed), request id, source IP, result. Append-only (no UPDATE/DELETE grants to the app user on the audit table), no secrets or password hashes, read access restricted, included in backups, alert on tampering gaps. suth ADR-0035 is a good template (L).

### 6.7 FHIR / HL7 (only if touching patient data or HIS)
- HL7 FHIR: R5 (5.0.0) is the current published version; R4 (4.0.1) is the long-implemented release; R6 is in ballot (T1 https://hl7.org/fhir/history.html and https://hl7.org/fhir/directory.html). Which release the hospital HIS and Thai national profiles (TH Core, MOPH) use is UNVERIFIED (web search rate-limited); assume R4 until confirmed.
- Rules: no direct DB access to HIS; use the HIS's supported interface (HL7 v2 feed, FHIR API, or vendor API); read-only scope; minimum data (e.g., HN and ward, not diagnoses); store references rather than copies; log every lookup; run a privacy review; separate service and DB schema so a helpdesk bug cannot expose clinical data; treat it as s.26 sensitive data throughout.

---

## 7. Project folder template

```
<project>/
  AGENTS.md              # rules for agents: layout, forbidden patterns, how to verify (Thai OK)
  CONTEXT.md             # domain glossary
  README.md
  CONTRIBUTING.md
  docs/
    decisions/           # ADRs (numbered, status, date)
    how-to/              # runbooks: set-up, migrations, release-and-recovery, restore-drill
    explanation/  reference/
    security/            # threat notes, ROPA entry, data-flow, ASVS L2 checklist
  apps/
    web/                 # Vue 3 + Vite + Tailwind 4; src/{ui,design,views,features,api}
    api/                 # Express 5; src/<feature>/ (no routes/ or controllers/); src/shared/
  packages/
    domain/              # pure business rules + zod schemas shared by web and api
  database/
    migrations/          # NNNN_name.ts|sql forward-only
    seeds/               # seed_ci (synthetic), bootstrap-admin
  deploy/
    compose.prod.yaml  Caddyfile  backup.sh  restore-drill.sh  deploy.sh
    env.example  secrets.enc.yaml   # SOPS-encrypted
  scripts/               # verify, bundle budget, fixtures
  .githooks/ or lefthook.yml
  .github/workflows/ci.yml  dependabot.yml  PULL_REQUEST_TEMPLATE.md
  eslint.config.js  prettier.config.js  tsconfig.base.json  .nvmrc
```

---

## 8. PDPA / security checklist (per project, before go-live)

- [ ] Data inventory: what personal data, whose (staff/patients), purpose, legal basis, retention; ROPA entry filed with DPO (s.39).
- [ ] No patient/health data collected; if unavoidable: DPO approval, s.26 basis, minimization, field-level protection.
- [ ] Privacy notice shown to staff users (what is logged, for what).
- [ ] Access: RBAC defined, least privilege, admin MFA, joiner/mover/leaver process, quarterly access review.
- [ ] Sessions revocable; cookies httpOnly/secure/SameSite; CSRF handled; rate limit + lockout.
- [ ] TLS with trusted internal CA; HSTS; DB not exposed; containers non-root; secrets not in git/images.
- [ ] Input validation (zod) on every route; parameterized SQL; upload limits and type checks; error responses leak nothing.
- [ ] Audit log covering auth events, privilege changes, data edits, exports; append-only; retained per policy.
- [ ] Logs free of secrets and personal free text; error tracker scrubbed and self-hosted.
- [ ] Backups encrypted, offsite-in-hospital, **restore drill done and dated**; backup retention matches erasure policy.
- [ ] Erasure/anonymization job for expired data tested (s.37(3)).
- [ ] Breach runbook: detect, contain, assess, notify PDPC within 72 h where required, notify individuals if high risk; owner and phone numbers documented.
- [ ] Dependency and image scans clean or risk-accepted; SheetJS tarball mirrored; `npm audit --omit=dev` clean.
- [ ] ASVS L2 checklist reviewed; OWASP Top 10:2025 mapping in `docs/security/`.
- [ ] Cybersecurity Act: CII status confirmed with management; asset inventory current; BCP/DR evidence stored.
- [ ] Sign-off record: date, reviewer, scope, exceptions.

---

## 9. When to deviate

| Situation | Deviate to | Conditions |
|---|---|---|
| Analyst-only exploration, ad hoc dashboard, data science (e.g. `D:\Run-Performance-Project`) | Python + Streamlit | No hospital personal/health data; single trusted user or localhost; if it becomes shared hospital tooling, rebuild the UI in the house stack or front it with proper auth (Streamlit login/RBAC maturity not verified here, UNVERIFIED) |
| Public, non-hospital, or personal projects (CAMPBANK on Next + Supabase + Sentry + Vercel; RubricLens on Cloudflare Workers + Gemini) | Keep Vercel/Supabase/Cloudflare | No hospital staff PII or patient data ever; no hospital credentials; DPO consulted before any hospital data crosses to a third-party cloud (PDPA cross-border rules) |
| Phone-based equipment check-in via QR | **PWA in the same Vue app** (manifest, service worker, camera via `getUserMedia`) | Needs HTTPS with a CA trusted by phones; offline queue only if Wi-Fi gaps are real; avoid storing sensitive data on devices |
| Needs push, NFC, MDM integration, background scanning | Native/React Native | Only after PWA limits are proven; adds app-store/MDM burden |
| Needs range-exclusion constraints, RLS, heavy reporting SQL | PostgreSQL 18 for that project | Hospital IT confirms they can back up/patch it |
| Needs SSO across many apps | Keycloak (IT co-owned) | SLA and ownership agreed |
| Needs HIS data | Integration service via HIS interface (HL7 v2/FHIR) | Separate repo/schema, DPO sign-off |
| Public-facing hospital page with no personal data | Static site on any host | No forms collecting personal data |

---

## 10. Sources

Local (read-only inspection, L): `D:\suth-helpdesk-assets\package.json`, `apps\web\package.json`, `apps\api\package.json`, `compose.yaml`, `AGENTS.md`, `.githooks\pre-push`, `docs\decisions\0005-database-engine.md`, `0006-session-cookie-instead-of-localstorage.md`, `0007-improve-in-place-instead-of-rewriting.md`, `0035-audit-log.md`, `docs\how-to\{verify-changes,prepare-for-production,run-migrations,release-and-recovery}.md`; `D:\CAMPBANK\package.json`; `D:\RubricLens\package.json`; `D:\Run-Performance-Project` (directory listing only; no requirements file found).

Versions/dates (T1, queried 2026-09-30): npm registry `https://registry.npmjs.org/<package>` for every npm package listed; GitHub `https://api.github.com/repos/<owner>/<repo>/releases/latest` for keycloak/keycloak, goauthentik/authentik, caddyserver/caddy, traefik/traefik, docker/compose, moby/moby, louislam/uptime-kuma, getsentry/self-hosted, bugsink/bugsink, grafana/loki, grafana/grafana, amir20/dozzle, restic/restic, borgbackup/borg, getsops/sops, FiloSottile/age, aquasecurity/trivy, gitleaks/gitleaks, renovatebot/renovate, actions/runner, actions/checkout, docker/build-push-action, nginx/nginx, MariaDB/server. GlitchTip tags: `https://gitlab.com/api/v4/projects/glitchtip%2Fglitchtip-backend/repository/tags`. Node: `https://nodejs.org/dist/index.json`, `https://raw.githubusercontent.com/nodejs/Release/main/schedule.json`. MySQL: `https://dev.mysql.com/downloads/mysql/` (T1, versions only), `https://endoflife.date/api/mysql.json` (T2, dates), `https://www.infoq.com/news/2026/05/mysql-97-lts/` (T2, search snippet). PostgreSQL: `https://www.postgresql.org/support/versioning/` (T1; PostgreSQL 19 is in beta per postgresql.org front page).
Licenses: raw LICENSE files at `https://raw.githubusercontent.com/goauthentik/authentik/main/LICENSE`, `.../bugsink/bugsink/main/LICENSE`, `.../getsentry/self-hosted/master/LICENSE.md`, `https://gitlab.com/glitchtip/glitchtip-backend/-/raw/master/LICENSE`; GlitchTip README `https://gitlab.com/glitchtip/glitchtip-backend/-/raw/master/README.md`; npm registry license fields otherwise.
Security: https://top10.owasp.org/2025 ; https://owasp.org/www-project-top-ten/ ; https://owasp.org/www-project-application-security-verification-standard/ ; https://github.com/OWASP/ASVS/releases.
Thai law/regulators: PDPA text (MDES link in 6.3); PDPC pages listed in 6.3 (https://www.pdpc.or.th/category/pdpc-law/announce/announcement-pdpc/ and numbered pages); https://www.thaicert.or.th/en/cii/ ; https://silklegal.com/strengthening-thailands-cyber-resilience-new-list-of-critical-information-infrastructure-organizations/ ; gazette links in 6.4; MOPH/TMI links in 6.5.
HL7: https://hl7.org/fhir/directory.html ; https://hl7.org/fhir/history.html.
SUTH identity: https://en.wikipedia.org/wiki/Institute_of_Medicine,_Suranaree_University_of_Technology (T3).

Not verified / gaps: exact SUTH legal status and regulator; whether SUTH is a designated CII organization; contents of MOPH 2561 regulation, MOPH data-governance 2568 and patient-data security standard 2559; Thai text of PDPC announcements and gazette CII notifications (PDF text extraction dropped Thai glyphs); PDPA penalty section mapping; Bugsink database support; self-hosted Sentry hardware requirements; vue-tsc/typescript-eslint support for TypeScript 7; Biome Vue support; Thai national FHIR profile release; Node 20 EOL date; hospital AD/LDAP existence; server OS (Linux vs Windows Server, affects Docker choice).
