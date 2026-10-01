# House stack: ระบบเว็บภายในโรงพยาบาล (on-prem)

- **Last verified: 2026-10-01** (เวอร์ชันดึงจาก npm registry / GitHub releases เมื่อ 2026-09-30, ตรวจซ้ำอิสระ 2026-10-01)
- **ต้อง re-verify ทุกเดือน** (ดู section 10) เพราะ Node 26 จะเป็น LTS วันที่ 2026-10-28 และเวอร์ชันอื่นจะเปลี่ยน
- หลักฐานเต็ม: `research/03-stack-hospital-onprem.md` (evidence tier T1/T2/T3 อยู่ที่นั่น)
- "UNVERIFIED" ในไฟล์นี้ = ยังไม่ยืนยันจาก primary source ต้องถาม IT/DPO หรือตรวจเอง

หลักการข้อเดียว: **ใช้ stack ของ suth ต่อ ไม่ย้าย** (ADR-0007 ปฏิเสธการ rewrite ไปแล้ว) แต่ suth ยังเป็น "prototype ที่ดี" ไม่ใช่ "มาตรฐานพร้อมใช้" ต้องปิดช่องว่างใน section 2 ก่อนคัดลอกเป็น template

---

## 1. House stack (verified 2026-10-01)

| Layer | เลือกใช้ | Version | หมายเหตุ |
|---|---|---|---|
| Runtime | Node.js 24 LTS | 24.21.0 | LTS ถึง 2028-04-30; Node 26 เป็น LTS 2026-10-28 ให้รอ 2-3 เดือนก่อนย้าย; suth ยังประกาศ `>=20` (ต้องแก้) |
| Language | TypeScript | 6.0.3 | โค้ดใหม่เป็น TS; JS เดิมแปลงทีละไฟล์ตอนแตะ; **ยังไม่ใช้ TS 7.0.2** เพราะ typescript-eslint 8.71.0 ประกาศ peer `typescript >=4.8.4 <6.1.0` (npm registry, ตรวจ 2026-10-01) |
| Frontend | Vue 3 (SPA, `<script setup>`) | 3.5.43 | ไม่ใช้ Nuxt/Next: internal tool ไม่ต้องมี SSR server |
| Build | Vite | 8.3.2 | |
| Router | vue-router | 5.3.1 | |
| Server state | TanStack Vue Query | 5.104.0 | ADR-0009; Pinia เฉพาะ client-only state |
| UI primitives | reka-ui | 2.10.5 | หน้าธุรกิจเรียกผ่าน `ui/` kit เท่านั้น |
| CSS | Tailwind CSS | 4.3.3 | ใช้ semantic token (`bg-surface`) ห้ามสีดิบ (ADR-0008) |
| Thai font | `@fontsource-variable/anuphan` (self-host) | 5.3.0 | ห้ามเรียก Google Fonts CDN; `lang="th"`, line-height >= 1.5 |
| HTTP API | Express 5 | **5.2.1** | ตรวจอิสระแล้ว; async error จัดการเองใน v5 |
| Validation | zod | 4.6.5 | schema เดียวใช้ทั้ง API และ form (ใน `packages/domain`) |
| Security middleware | helmet / express-rate-limit / multer | 8.3.0 / 8.7.0 / 2.4.0 | จำกัดชนิด+ขนาด upload |
| DB | MySQL 8.4 LTS | 8.4.11 | support ถึง 2032-04-30 (T2); ไม่ใช้ innovation line; 9.7 LTS พิจารณาหลังใช้จริง 6+ เดือน |
| DB driver | mysql2 | 3.24.5 | prepared statements เสมอ |
| Query/migration | Kysely (pin exact) | 0.29.6 | pre-1.0 จึงต้อง pin; ใช้กับโค้ดใหม่ |
| Logging | pino (JSON to stdout) | 10.3.1 | ห้าม log password/token/body/ข้อมูลผู้ป่วย |
| Password | argon2 (หรือคง bcrypt แล้ว rehash ตอน login) | 0.45.1 / 6.0.0 | |
| Unit/component test | **Vitest** | **5.0.3** | รายงานวิจัยเดิมบอก 5.0.2; ตรวจอิสระเจอ 5.0.3 |
| E2E + a11y | Playwright + @axe-core/playwright | 1.63.0 / 4.13.0 | axe ทุกหน้า |
| Lint/format | ESLint (flat) / typescript-eslint / eslint-plugin-vue / Prettier | 10.11.0 / 8.71.0 / 10.11.1 / 3.9.9 | |
| Secret scan | gitleaks | 8.30.1 | pre-commit + CI (regex scanner เดิมจับ leak ได้ 1 ใน 5 ไม่พอ) |
| Container | Docker Engine / Compose | 29.8.1 / 5.5.1 | non-root, `cap_drop: [ALL]`, healthcheck, bind 127.0.0.1 |
| Reverse proxy | Caddy | 2.11.4 | TLS ด้วย CA ของโรงพยาบาลหรือ `tls internal` |
| Backup | mysqldump `--single-transaction` + restic | restic 0.19.1 | encrypted, `restic check` |
| Error tracking | Bugsink (fallback GlitchTip) + `@sentry/node` / `@sentry/vue` | 2.6.1 / 11.1.0 | self-host เท่านั้น; Bugsink รองรับ DB อะไรบ้าง = UNVERIFIED เช็ก docs ก่อน |
| Uptime | Uptime Kuma | 2.5.5 | HTTP monitor + push monitor สำหรับ backup |
| Log viewer | Dozzle | 11.1.3 | |
| Secrets | SOPS + age (หรือ env file root-only `0600` นอก repo) | 3.13.3 / 1.3.2 | |
| Dependency update | Dependabot (grouped, weekly) | - | |

---

## 2. Upgrade backlog ของ suth (เรียงตามลำดับความสำคัญ)

ทำ in place ทีละข้อ แต่ละข้อเป็น issue + branch + PR แยก (commit ที่ย้ายไฟล์ห้ามเปลี่ยนพฤติกรรม)

1. **Dockerfile ของ api + web** (multi-stage, non-root) และ prod compose: caddy + api + db; `engines.node` เป็น `>=24` + `.nvmrc`. ตอนนี้ compose มีแค่ MySQL + phpMyAdmin. *ไม่มีข้อนี้ = deploy ซ้ำไม่ได้*
2. **Backup + restore drill script** + นัดในปฏิทิน (section 6.3). *ยังไม่มีหลักฐานว่า restore ได้จริง*
3. **Session ฝั่ง server** แทน stateless JWT (ADR-0006; ตอนนี้ logout/ปิดบัญชีไม่ตัด token ตรงกับ audit F12)
4. **Migration runner** (ตาราง `schema_migrations`, forward-only, Kysely Migrator) แทน SQL รันมือ 15 ไฟล์; เก็บ startup schema check เป็นตาข่ายนิรภัย
5. **ปิด checklist `docs/how-to/prepare-for-production.md`** ที่เขียนไว้แล้ว + F09 (HTTPS/LAN), F14, F15 จาก audit 2026-09-24
6. **Observability**: Bugsink + Dozzle + Uptime Kuma (health endpoint มีอยู่แล้ว)
7. **Lint + typecheck**: ESLint flat + `checkJs`/JSDoc บน api และ domain, `vue-tsc` บน web (ตอนนี้ไม่มี linter; TS 0 ไฟล์)
8. **CI (GitHub Actions)**: ทำซ้ำ `npm run verify` + gitleaks + `npm audit --omit=dev`; **`npm run verify` บนเครื่องยังเป็นตัวตัดสิน** เพราะ GitHub account เคยถูกล็อก billing จน CI พัง
9. **Auth phase 2**: MFA (TOTP) ให้ admin; LDAP/AD (`ldapts`) ถ้า IT มี AD
10. **Vitest convergence**: API ยังใช้ `node --test` ย้ายเมื่อแตะไฟล์นั้น (ไม่ต้องรีบ)

**ไม่ทำ:** ย้ายไป Nuxt/Next/SvelteKit, ย้ายไป PostgreSQL, เปลี่ยน Express เป็น Fastify/Nest (ได้น้อยกว่าต้นทุน)

---

## 3. Tier: demo / ใช้ภายใน / ใช้จริง

ทุกโปรเจกต์ประกาศ tier ใน `AGENTS.md` (ดู `templates/project/AGENTS.md`). **ทำเท่าที่ tier ต้องการ** ห้าม over-build: ถ้ายังเป็น demo ห้ามเสียเวลากับ Keycloak, Kubernetes, Prometheus

การเลื่อน tier ต้องเขียน ADR 1 ข้อ และ tick checklist ทั้งหมดของ tier ปลายทาง

### Tier 1: demo (โชว์ความคิด / ลองกับผู้ใช้ 1-3 คน บนเครื่อง dev หรือ LAN จำกัดวง)
- [ ] ข้อมูลเป็น **synthetic เท่านั้น** (ไม่มีข้อมูลผู้ป่วย/บุคลากรจริง)
- [ ] ไม่เปิดให้คนทั่วโรงพยาบาลใช้
- [ ] `RUN.md` ใช้ได้จริง (คนอื่นเปิดแอปได้ใน 10 นาที)
- [ ] `npm run verify` เขียว (test + build)
- [ ] `.env` ไม่ commit; มี `env.example`; รัน gitleaks ก่อน push
- [ ] ป้าย "DEMO / ข้อมูลทดสอบ" บนหน้าจอ
- ไม่ต้องมี: Docker prod, backup, error tracker, audit log, MFA, CI

### Tier 2: ใช้ภายใน (ผู้ใช้จริงในหน่วยงานเดียว, ข้อมูลจริงของบุคลากร/ทรัพย์สิน, ไม่ใช่ข้อมูลผู้ป่วย)
ทำครบ tier 1 (ยกเว้น synthetic) และ:
- [ ] มี **เจ้าของระบบ** ฝั่งโรงพยาบาล + ผู้ติดต่อ IT (ใน `HANDOVER.md`)
- [ ] Deploy ด้วย Docker Compose + Caddy (HTTPS); DB ไม่เปิดออกนอก host
- [ ] Login + RBAC ฝั่ง server ทุก route (deny by default); ไม่มี default account; รหัสผ่าน hash
- [ ] zod ทุก route; SQL parameterized; upload จำกัดชนิด/ขนาด
- [ ] **Backup อัตโนมัติรายคืน + restore drill ทำแล้ว 1 ครั้งและบันทึกวันที่**
- [ ] Audit log (auth, แก้ข้อมูล, export) แบบ append-only
- [ ] Health endpoint + Uptime Kuma; log หมุนไฟล์
- [ ] ROPA entry ส่ง DPO (s.39) + privacy notice ให้ผู้ใช้
- [ ] `HANDOVER.md` ครบ และทดสอบโดย agent ใหม่ที่ไม่เคยเห็นโปรเจกต์
- [ ] ADR ของการตัดสินใจที่ย้อนยาก

### Tier 3: ใช้จริง (หลายหน่วยงาน / ผู้บริหารพึ่งพา / กระทบการเงินหรือความปลอดภัย)
ทำครบ tier 2 และ:
- [ ] **hospital IT + DPO อนุมัติเป็นลายลักษณ์อักษร**; ตอบ open questions (section 9) ที่เกี่ยวข้องแล้ว
- [ ] Session revocable ฝั่ง server; cookie `httpOnly`/`secure`/`SameSite`; CSRF; rate limit + lockout
- [ ] MFA (TOTP) สำหรับ admin; ทบทวนสิทธิ์ผู้ใช้รายไตรมาส (joiner/mover/leaver)
- [ ] ASVS Level 2 ผ่าน; map OWASP Top 10:2025 ใน `docs/security/`
- [ ] Error tracker self-host + scrubber (`sendDefaultPii:false`); ไม่ใช้ Sentry SaaS
- [ ] Restore drill **ทุกเดือน** + heartbeat เข้า Kuma (เงียบ = แจ้งเตือน)
- [ ] Erasure/anonymize job สำหรับข้อมูลหมดอายุ ทดสอบแล้ว (s.37(3))
- [ ] Breach runbook (แจ้ง PDPC ภายใน 72 ชม.) มีเจ้าของ + เบอร์โทร
- [ ] Dependency + image scan สะอาดหรือมี risk-accept; Dependabot เปิด
- [ ] ทุก release มีบันทึก (ใคร/อะไร/เมื่อไร/rollback อย่างไร)
- [ ] Sign-off record: วันที่, ผู้ตรวจ, ขอบเขต, ข้อยกเว้น
- [ ] มีคนฝั่งโรงพยาบาลที่ deploy + restore เองได้ (bus factor > 1)

---

## 4. โครงสร้างโปรเจกต์ (ย่อ)

```
<project>/ AGENTS.md CLAUDE.md STATE.md BACKLOG.md DECISIONS.md HANDOVER.md RUN.md CONTEXT.md/GLOSSARY.md
  apps/web  apps/api (src/<feature>/ ไม่มี routes/ หรือ controllers/)  packages/domain
  database/{migrations,seeds}  deploy/{compose.prod.yaml,Caddyfile,backup.sh,restore-drill.sh,deploy.sh,env.example}
  docs/{decisions,how-to,security}  scripts/  .githooks/  .github/workflows/
```
Template ไฟล์โปรเจกต์อยู่ที่ `templates/project/`. suth ใช้ ADR เต็มใน `docs/decisions/`; โปรเจกต์เล็กใช้ `DECISIONS.md` ไฟล์เดียว

---

## 5. Auth (สรุป)

- Phase 1: local accounts ทำให้ถูกต้อง (server-side session, RBAC ใน middleware เดียว, deny by default)
- Phase 2: LDAP/AD (`ldapts` 9.2.0) ถ้า IT ให้ service account read-only + LDAPS
- Keycloak 26.7.4 **เฉพาะเมื่อ** มี 3+ แอปต้อง SSO และ IT ร่วมเป็นเจ้าของ (เป็น tier-0: ล่มแล้วล่มหมด)
- ห่อทุกอย่างไว้หลัง module `auth` เดียว (`authenticate`, `currentUser`, `can`) เพื่อสลับ provider ได้ภายหลัง

---

## 6. On-prem ops

### 6.1 Docker
- multi-stage build, base image pin ด้วย digest, non-root, read-only root FS ถ้าทำได้, `cap_drop: [ALL]`, memory limit, healthcheck
- api/web/db ไม่ publish port ออกนอก; DB bind `127.0.0.1`; phpMyAdmin ไม่อยู่ใน prod (หรือ 127.0.0.1 + read-only account)
- Log: `json-file` ตั้ง `max-size`/`max-file`; ดูผ่าน Dozzle
- Windows dev: เช็ก Docker Desktop ทำงานก่อนเสมอ (`docker info`); ขั้นตอนอยู่ใน `templates/project/RUN.md`

### 6.2 Caddy
- Caddyfile ~10 บรรทัด: reverse proxy ไป api, serve static ของ web, redirect HTTP -> HTTPS, security headers
- Cert: ไฟล์จาก CA ภายในโรงพยาบาล หรือ `tls internal` แล้วติดตั้ง root CA บนเครื่องพนักงาน/มือถือ (จำเป็นสำหรับกล้อง/PWA); ACME สาธารณะเฉพาะเมื่อมี domain จริงและ IT อนุญาต DNS-01
- เปิด HSTS เมื่อ cert เสถียรแล้วเท่านั้น

### 6.3 Backup และ restore drill
- รายคืน: `mysqldump --single-transaction --routines --triggers` (utf8mb4) + โฟลเดอร์ upload -> restic ไปเครื่องอื่น/NAS (encrypted)
- Retention เริ่มต้น (T3 ข้อเสนอ ให้ DPO ยืนยัน): 14 daily / 8 weekly / 12 monthly; `restic check` รายสัปดาห์
- **Restore drill** (tier 2: ก่อนใช้งาน 1 ครั้ง; tier 3: ทุกเดือน): restore ลง container ชั่วคราว -> smoke test + เทียบจำนวนแถว -> บันทึก วันที่/เวลาที่ใช้/ผล ใน `HANDOVER.md` -> ส่ง heartbeat ไป Kuma
- **Backup ที่ไม่เคย restore = ยังไม่มี backup**
- ไฟล์ backup มีข้อมูลส่วนบุคคล: เข้ารหัส, จำกัดสิทธิ์, หมดอายุตาม retention

### 6.4 Bugsink (error tracking)
- self-host 1 container; Sentry SDK ชี้ DSN ภายใน; `sendDefaultPii:false` + `beforeSend` ลบ email/ชื่อ/ข้อความ ticket/request body
- ห้าม Sentry SaaS ถ้า DPO ไม่เซ็น (PDPA s.28 ข้ามประเทศ; stack trace มีข้อมูลผู้ใช้)
- License เป็น PolyForm Shield (source-available) ใช้ภายในได้; fallback GlitchTip (MIT, ใช้ PostgreSQL)

### 6.5 Uptime Kuma
- HTTP monitor ที่ `/api/health` (และ live), แจ้งเตือน TLS ใกล้หมดอายุ, push monitor ของ backup และ restore drill
- แจ้งเตือนผ่าน email/SMTP ของโรงพยาบาลก่อน; LINE Notify สถานะ UNVERIFIED อย่าพึ่ง

### 6.6 Deploy
- CI build image -> push GHCR tag = commit SHA; เซิร์ฟเวอร์ดึงเอง (outbound only) โดยคนอนุมัติ: `docker compose pull && up -d` -> migrate -> รอ `/api/health` -> rollback tag เดิมถ้าล้ม
- สำรอง: build บนเครื่อง dev -> `docker save` -> ถือไปเซิร์ฟเวอร์ (เคยจำเป็นตอน GitHub ล็อก)
- ไม่มี inbound SSH จากอินเทอร์เน็ต; ไม่ใส่ข้อมูลจริง/secret ใน CI

---

## 7. PDPA / security checklist (ก่อน go-live ทุก tier 2+)

- [ ] Data inventory: ข้อมูลอะไร ของใคร วัตถุประสงค์ ฐานกฎหมาย retention; ส่ง ROPA ให้ DPO (s.39)
- [ ] **ไม่เก็บข้อมูลผู้ป่วย/สุขภาพ** (s.26 sensitive) โดยการออกแบบ: เตือนบน UI, จำกัดความยาว free text, scrub เป็นระยะ; ถ้าจำเป็นต้องเก็บ ต้อง DPO อนุมัติ
- [ ] Privacy notice ถึงผู้ใช้ (log อะไร เพื่ออะไร)
- [ ] RBAC + least privilege + admin MFA + ทบทวนสิทธิ์ + process คนเข้า/ย้าย/ออก
- [ ] Session ปลอดภัย, TLS ด้วย CA ที่เชื่อถือ, DB ไม่เปิดออกนอก, container non-root, secret ไม่อยู่ใน git/image
- [ ] zod ทุก route, SQL parameterized, upload จำกัด, error ไม่รั่วข้อมูล
- [ ] Audit log append-only (app user ไม่มีสิทธิ์ UPDATE/DELETE ตารางนี้): timestamp, actor, role, action, object, before/after, request id, IP, result
- [ ] Log และ error tracker ไม่มี secret/ข้อมูลส่วนบุคคล
- [ ] Backup เข้ารหัส + **restore drill บันทึกวันที่** + retention ตรง erasure policy
- [ ] Erasure/anonymize job ทดสอบแล้ว (s.37(3))
- [ ] Breach runbook: ตรวจพบ -> ควบคุม -> ประเมิน -> แจ้ง PDPC ภายใน 72 ชม. (s.37(4)) -> แจ้งเจ้าของข้อมูลถ้าเสี่ยงสูง
- [ ] `npm audit --omit=dev` สะอาด; SheetJS tarball (0.20.3) mirror ในโรงพยาบาล
- [ ] ASVS 5.0.0 Level 2 + OWASP Top 10:2025 map ใน `docs/security/`
- [ ] Cybersecurity Act: ยืนยันกับผู้บริหารว่า SUTH เป็น CII หรือไม่ (UNVERIFIED); asset inventory + หลักฐาน BCP/DR พร้อม
- [ ] Sign-off record

Retention เริ่มต้น (T3 ไม่ใช่คำแนะนำทางกฎหมาย ให้ DPO ยืนยัน): ticket 3 ปีแล้ว anonymize ผู้แจ้ง; ประวัติทรัพย์สิน = อายุทรัพย์สิน + 5 ปี; audit log 1 ปี online + archive; access log >= 90 วัน (ถาม IT เรื่อง พ.ร.บ.คอมพิวเตอร์).
ถ้าต้องต่อ HIS: ผ่าน API/HL7/FHIR ของ HIS เท่านั้น อ่านอย่างเดียว ข้อมูลน้อยที่สุด แยก service/schema และผ่าน DPO ก่อน

---

## 8. เมื่อไรออกนอก stack (deviate)

ต้องเขียนเหตุผลลง `DECISIONS.md` ของโปรเจกต์นั้นก่อน

| สถานการณ์ | ใช้แทน | เงื่อนไข |
|---|---|---|
| วิเคราะห์ข้อมูล/dashboard เฉพาะบุคคล | Python + Streamlit | ไม่มีข้อมูลส่วนบุคคล/สุขภาพของโรงพยาบาล; ผู้ใช้คนเดียวหรือ localhost; ถ้ากลายเป็นเครื่องมือกลาง ให้ rebuild ใน house stack |
| โปรเจกต์ส่วนตัว/สาธารณะที่ไม่ใช่โรงพยาบาล (Vercel/Supabase/Cloudflare) | คงไว้ตามเดิม | ห้ามมี PII บุคลากร/ผู้ป่วย/credential ของโรงพยาบาล |
| เช็กอินผ่านมือถือ/QR | PWA ใน Vue app เดิม | ต้อง HTTPS ที่มือถือเชื่อถือ CA; ไม่เก็บข้อมูลอ่อนไหวบนอุปกรณ์ |
| ต้อง push/NFC/MDM | Native | หลังพิสูจน์แล้วว่า PWA ไม่พอ |
| ต้อง range-exclusion, RLS, SQL รายงานหนัก | PostgreSQL 18 เฉพาะโปรเจกต์นั้น | IT ยืนยันว่า backup/patch ได้ |
| ต้อง SSO หลายแอป | Keycloak | IT เป็นเจ้าของร่วม + ตกลง SLA |
| ต้องใช้ข้อมูล HIS | integration service แยก | repo/schema แยก + DPO sign-off |
| หน้าเว็บสาธารณะไม่มีข้อมูลส่วนบุคคล | static site | ไม่มีฟอร์มเก็บข้อมูล |

---

## 9. Open questions สำหรับ hospital IT / DPO

ถามครั้งเดียวเป็นเอกสาร (skill `to-questionnaire` ช่วยร่างได้)

**IT**
1. เซิร์ฟเวอร์ OS อะไร (Linux / Windows Server)? Docker ติดตั้งได้ไหม ใครดูแล?
2. มี Active Directory/LDAP หรือ SSO อยู่แล้วไหม? ขอ service account read-only + LDAPS ได้ไหม?
3. Firewall อนุญาต outbound ไป GHCR/GitHub ไหม? ถ้าไม่ ใช้ `docker save` หรือ Forgejo ภายใน?
4. มี internal CA ไหม? ติดตั้ง root CA ลงเครื่องพนักงาน/มือถือได้ไหม?
5. ที่เก็บ backup ปลายทาง (NAS/เครื่องที่สอง) และใครถือกุญแจ restic?
6. ใครเป็นเจ้าของระบบหลังฝึกงานจบ และใครรับ `HANDOVER.md`?
7. SMTP สำหรับแจ้งเตือนใช้ตัวไหน? ช่องทางแจ้งเตือนอื่นที่อนุญาต?
8. นโยบายการส่งโค้ด/ข้อมูลไปบริการ AI ภายนอก (Claude/Codex) ของโรงพยาบาลคืออะไร?

**DPO / ผู้บริหาร**

9. SUTH อยู่ภายใต้กำกับใคร (มหาวิทยาลัย/MHESI หรือ MOPH)? (UNVERIFIED)
10. SUTH เป็น CII organization ตาม Cybersecurity Act หรือไม่? regulator คือใคร?
11. มี DPO แล้วหรือยัง? ROPA template และ retention policy ที่ใช้อยู่คืออะไร?
12. มีการใช้ Sentry SaaS/บริการนอกประเทศอยู่แล้วหรือไม่ (เรื่อง s.28)?
13. ระบบ helpdesk/asset ยอมรับข้อมูลผู้ป่วยในข้อความ ticket ได้หรือไม่ (ค่าเริ่มต้น: ห้าม)?
14. FHIR version และ vendor ของ HIS (ถ้าจะมีการเชื่อมต่อในอนาคต)?

---

## 10. ตรวจซ้ำรายเดือน (re-verify)

ทุกต้นเดือน (ตั้ง scheduled task หรือ calendar) ให้ agent: (1) `npm view <pkg> version` ทุกแถวใน section 1 (2) ดู Node release schedule (3) เช็ก security advisory ของ Express/Vue/Vite/mysql2/Caddy/Docker (4) อัปเดตคอลัมน์ Version + บรรทัด **Last verified** ด้านบน (5) ถ้า major เปลี่ยน ให้เปิด issue ไม่ใช่อัปเกรดทันที

Patch/minor ของ dependency ทำผ่าน Dependabot; major ต้องมี ADR.
ยังไม่รู้ ณ 2026-10-01: Node 26 LTS (2026-10-28), Bugsink DB support, Biome รองรับ Vue SFC เต็มไหม
