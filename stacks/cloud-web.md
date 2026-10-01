# House stack: เว็บแอปส่วนตัว / side project บน cloud (ไม่ใช่ข้อมูลโรงพยาบาล)

- **Last verified: 2026-10-01** (เวอร์ชันจาก `https://registry.npmjs.org/<pkg>/latest`, nodejs.org, หน้า pricing/docs ของผู้ให้บริการ; เปิดอ่านเองวันที่ 2026-10-01 ทั้งหมด)
- **ต้อง re-verify ทุกเดือน** (section 10) เพราะ Node 26 เป็น LTS 2026-10-28 และราคา/โควตา free tier เปลี่ยนได้
- Evidence tier: T1 = เอกสาร/registry ทางการ, T2 = law firm / repo จริง, T3 = อื่นๆ; "UNVERIFIED" = ยังไม่ได้เปิดแหล่งหลัก อย่าเชื่อจนกว่าจะตรวจ
- ตัวอย่างจริงที่ใช้อ้างอิง: `D:\CAMPBANK` (Next.js + Supabase + Sentry + Vercel) และ `D:\RubricLens` (Vite + React + shadcn + Cloudflare Worker + Gemini)

**ข้อสรุปข้อเดียว:** ค่าเริ่มต้น = **Next.js + Supabase + Vercel** สำหรับแอปที่ต้อง login + เก็บข้อมูลรายผู้ใช้; ใช้ **Vite/React + Cloudflare Worker** เฉพาะแอปที่ **ไม่มี DB / ไม่มี login** (เครื่องมือ stateless, proxy ไป AI API, หน้า public). เลือกครั้งเดียวตอนเริ่ม แล้วล็อกใน `DECISIONS.md` (section 8)

---

## 1. Stack เริ่มต้น (verified 2026-10-01)

| Layer | เลือกใช้ | Version (T1 npm/nodejs.org) | License | เหตุผล |
|---|---|---|---|---|
| Runtime | Node.js 24 LTS | 24.21.0 (nodejs.org/en/about/previous-releases) | MIT | Active LTS ถึง 2028-04-30; Node 26 เป็น LTS 2026-10-28 ถึง 2029-04-30 (github.com/nodejs/Release schedule.json) รอ 2-3 เดือนค่อยย้าย; ทั้งสองโปรเจกต์ตั้ง `engines` 24 แล้ว |
| Framework | Next.js (App Router) | 16.3.8 | MIT | AI agent เขียนได้คล่อง, มี pattern Supabase SSR ทางการ, CAMPBANK ขึ้นจริงแล้ว (ตรึง 16.3.6) |
| UI | React | 19.3.0 | MIT | CAMPBANK ใช้ 19.2.8; peer ของ next รับ ^19 |
| Language | TypeScript | **6.0.3 (ตรึงไว้)** ล่าสุดคือ 7.0.2 | Apache-2.0 | `typescript-eslint` 8.71.0 ประกาศ peer `typescript >=4.8.4 <6.1.0` (npm registry) = **รับ TS 7 ไม่ได้** จึงอยู่ที่ 6.0.3 ตาม CAMPBANK/RubricLens (ตอบข้อ UNVERIFIED ใน hospital-web.md) |
| DB + Auth + Storage | Supabase (Postgres + RLS) | `@supabase/supabase-js` 2.117.2, `@supabase/ssr` 0.12.7, CLI `supabase` 2.119.0 | MIT | auth + RLS สำเร็จรูป = agent เขียนโค้ด security เองน้อยลง; CAMPBANK มี `supabase test db` แล้ว |
| Host | Vercel | Hobby (ฟรี) / Pro | - | preview deploy ต่อ PR; ดู cost ใน 1.2 |
| Styling | Tailwind CSS (+ shadcn/ui ถ้าต้องการ) | 4.3.3 / shadcn CLI 4.21.1 | MIT | ทั้งสองโปรเจกต์ใช้ |
| Validation | zod | 4.6.5 | MIT | schema เดียวทั้ง form และ API; ใช้ parse `process.env` ตอน boot ด้วย |
| Error tracking | `@sentry/nextjs` | 11.2.0 (peer next `^16.0.0-0` ผ่าน) | MIT | free: 5k errors/เดือน, 1 user, 30 วัน (sentry.io/pricing, 2026-10-01) |
| Unit/component | Vitest (+ Testing Library, jsdom) | 5.0.3 | MIT | CAMPBANK ยังอยู่ 4.1.11 อัปเกรดตอนแตะ |
| E2E | Playwright | 1.63.0 | Apache-2.0 | |
| Lint | ESLint **9.x** + `eslint-config-next` | ESLint ล่าสุด 10.11.0; config-next 16.3.8 (peer `eslint >=9`) | MIT | ตรึง 9.39.5 ตาม CAMPBANK จนกว่าทดสอบ 10 กับ plugin ครบ (UNVERIFIED) |
| Formatter | Prettier | CAMPBANK ใช้ 3.9.6 (ไม่ได้เช็ก latest วันนี้: UNVERIFIED) | MIT | |

### 1.1 Variant B: stateless / ไม่มี DB (แบบ RubricLens)

| Layer | เลือกใช้ | Version | License |
|---|---|---|---|
| Frontend | Vite + React + Tailwind + shadcn | Vite 8.3.2 (engines `^20.19 || >=22.12`), React 19.3.0 | MIT |
| Backend | Cloudflare Worker (Hono ถ้ามีหลาย route; 1-2 route ใช้ fetch handler เปล่า) | `wrangler` 4.146.0 (MIT OR Apache-2.0, Node >=22); `hono` 4.13.12 | MIT |
| Lint | oxlint (RubricLens ใช้) | 1.86.0 | MIT |
| Error tracking | `@sentry/cloudflare` / `@sentry/react` | 11.2.0 / 11.2.0 | MIT |
| Test | Vitest 5.0.3 + Playwright 1.63.0 | | |

กฎของ variant B (จาก AGENTS.md ของ RubricLens): ให้ `wrangler.jsonc` เป็นแหล่งความจริงของ env var เสมอ ห้ามแก้ผ่าน dashboard (เคยทำ `ALLOWED_ORIGIN` ถูกเขียนทับ เว็บจริงเรียก API ไม่ได้); ทุก fetch ไป AI API ต้องมี timeout; คีย์ AI อยู่ใน Worker secret ห้ามขึ้นต้น `VITE_`

### 1.2 ต้นทุนและกับดัก free tier (อ่านก่อนเลือก)

| บริการ | Free | กับดัก | ที่มา (เปิดอ่าน 2026-10-01) |
|---|---|---|---|
| Vercel Hobby | 100 GB transfer, 1M invocations, 4 CPU-hr, 100 deploys/วัน | **ใช้ได้เฉพาะ non-commercial ส่วนตัว** (นิยาม commercial รวม "ได้เงินจากการสร้าง/ดูแล/host เว็บ" และโฆษณา; ขอ donation ไม่นับ); เกิน limit = รอ ~30 วัน (ไม่มีบิลเกิน แต่ล่ม); Spend Management ใช้ได้เฉพาะ Pro; runtime logs เก็บ 1 ชม. | vercel.com/docs/plans/hobby (updated 2026-09-14), vercel.com/docs/limits/fair-use-guidelines (2026-09-14) |
| Supabase Free | 2 active projects, 500 MB DB, 50k MAU, 1 GB storage, 5 GB egress | **pause หลังไม่มีการใช้งาน 1 สัปดาห์**; **ไม่มี backup**; โปรเจกต์ที่ 3 ต้องจ่าย; Pro เริ่ม $25/เดือน (backup รายวัน 7 วัน, spend cap เปิดเป็นค่าเริ่มต้น, ไม่ pause) | supabase.com/pricing, supabase.com/docs/guides/platform/backups |
| Cloudflare Workers Free | 100,000 req/วัน, CPU 10 ms/req, 50 subrequests | เกินแล้ว error 1027; CPU เกิน = error 1102; Paid $5/เดือน (10M req) **ไม่เห็นเอกสารเรื่อง spend cap** ให้ตั้ง CPU limit แทน | developers.cloudflare.com/workers/platform/limits, /pricing |
| Cloudflare D1 Free | 5M rows read/วัน, 100k rows written/วัน, 5 GB | Time Travel อัตโนมัติ 7 วัน (Free) / 30 วัน (Paid) | developers.cloudflare.com/d1/platform/pricing, /d1/reference/time-travel |
| Sentry Developer | 5k errors/เดือน, 1 user | เกินโควตาแล้ว event ไม่ถูกรับ (พฤติกรรมเฉพาะ Free = UNVERIFIED); Team $26/เดือน (จ่ายรายปี) | sentry.io/pricing, docs.sentry.io/pricing/quotas |

### 1.3 ทำไม A เป็นค่าเริ่มต้น และทำไมไม่ใช่ B (ตัดสินแบบตรงๆ)

- แอปส่วนใหญ่ของคุณมี user + ข้อมูลรายคน → ต้อง auth + authorization. Supabase ให้ครบในชุดเดียว; ฝั่ง Cloudflare ต้องประกอบ auth + DB เอง (D1 เป็น SQLite ไม่มี RLS) = โค้ดความปลอดภัยที่ agent ต้องเขียนเองมากกว่า (ข้อสรุปของผู้เขียน ไม่ใช่ข้อเท็จจริงจากเอกสาร)
- B ชนะเรื่อง **ต้นทุนและความเสถียรของ free tier** (ไม่ pause, Time Travel ฟรี, ไม่มีข้อห้าม commercial ในส่วนที่ตรวจ) จึงเป็นค่าเริ่มต้นของ stateless app
- ความเสี่ยงจริงของ A: Supabase ฟรี pause + ไม่มี backup + จำกัด 2 โปรเจกต์. ทางออก: demo ยอม pause ได้; ใช้งานจริง = Pro $25 หรือเลือก B; **ห้ามหา trick ping กัน pause** (ยังไม่ได้ตรวจเงื่อนไขการใช้: UNVERIFIED)
- ต้นทุนรวมถ้าใช้จริงแบบ A ≈ Supabase Pro $25 + Vercel Pro (Developer seat $20/เดือน) ≈ $45/เดือน (รวมจากราคาในตาราง; ยังไม่รวม domain)

### 1.4 ตัวเลือกที่ปฏิเสธ (ข้อสรุปผู้เขียน เว้นแต่ระบุที่มา)

| ตัวเลือก | เหตุผล |
|---|---|
| Next.js บน Cloudflare ผ่าน `@opennextjs/cloudflare` 1.20.7 | ใช้งานได้ (peer `next >=16.3.6`, `wrangler ^4.125.0`) แต่เพิ่มชั้น adapter อีกชั้นให้ debug; ยังไม่มีโปรเจกต์จริง |
| Cloudflare Pages สำหรับโปรเจกต์ใหม่ | เอกสารระบุว่า Workers "มีฟีเจอร์กว้างกว่า" (Durable Objects, Cron, Observability) และมีคู่มือย้าย Pages -> Workers; ไม่พบประกาศเลิก Pages. ใหม่ให้เริ่มด้วย Workers Static Assets (developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/); RubricLens ยังบน Pages ไม่ต้องรีบย้าย |
| Firebase, Clerk/Auth0, Neon/Turso/PlanetScale, SvelteKit/Astro/Remix | ไม่ได้ตรวจราคา/เงื่อนไขวันนี้ = UNVERIFIED; ไม่มีโปรเจกต์เดิมที่ได้ประโยชน์; เพิ่ม vendor/หนี้ความรู้โดยไม่แก้ปัญหาที่เจ็บจริง (ดู pitfalls ข้อ 11) |
| TypeScript 7.0.2 | `typescript-eslint` 8.71.0 ไม่รับ (ดูตาราง section 1) |
| ESLint 10.11.0 | ยังไม่ทดสอบกับ plugin ที่ใช้ = UNVERIFIED |

---

## 2. ใช้เมื่อไร / ไม่ใช้เมื่อไร

**ใช้:** เว็บส่วนตัว/ทดลอง/ชุมชนเล็ก, ผู้ใช้เป็นเพื่อน/ลูกค้าส่วนตัว, ไม่มีข้อมูลโรงพยาบาล, ไม่มีเงินจริงผ่านระบบ (ถ้ามี payment ดู 2.1)

**ไม่ใช้ (ไปไฟล์อื่น):**
- ข้อมูลผู้ป่วย / บุคลากรโรงพยาบาล / credential โรงพยาบาล / ใช้งานในโรงพยาบาล -> `stacks/hospital-web.md` (ห้ามขึ้น Vercel/Supabase/Cloudflare; hospital-web section 8 ระบุไว้แล้วว่าโปรเจกต์ส่วนตัวต้องไม่มีข้อมูลเหล่านี้)
- เครื่องมือวิเคราะห์ข้อมูล / dashboard เฉพาะบุคคล -> `stacks/data-dashboard.md`
- ต้องพา user ที่ไม่ใช่ตัวเองมาทำงานจริง + มีรายได้ -> ได้ แต่ต้องย้ายขึ้น Vercel Pro (Hobby ห้าม commercial) และตัดสินใจใน `DECISIONS.md` ก่อน

### 2.1 สิ่งที่เป็น P4 (ถามก่อนทำ ตาม core.md)
เพิ่ม payment, อีเมลส่งออก, AI API ที่มีค่าใช้จ่าย, field ใหม่ที่เก็บข้อมูลส่วนบุคคลของคนอื่น

---

## 3. Tier: demo / ใช้ภายใน / ใช้จริง

ประกาศ tier ใน `AGENTS.md`; ทำเท่าที่ tier ต้องการ (pitfalls ข้อ 7: ห้าม over-build). เลื่อน tier = ADR 3 บรรทัด (ทำไมตอนนี้ / เสียอะไร / ย้อนกลับอย่างไร)

### Tier 1: demo (โชว์/ลองเอง ผู้ใช้ 1-3 คน)
- [ ] ข้อมูลสมมติเท่านั้น; ป้าย "DEMO" บนหน้าจอ
- [ ] URL ฟรี (`*.vercel.app` / `*.workers.dev`) ได้; ชื่อ/slug ล็อกแล้ว (section 8)
- [ ] `.env` ไม่ commit, มี `.env.example`, รัน gitleaks ก่อน push (ยังไม่ได้ตรวจเวอร์ชัน gitleaks: UNVERIFIED)
- [ ] ถ้ามี Supabase: **เปิด RLS ทุกตาราง** แม้เป็น demo (ตารางใน exposed schema ที่ไม่มี RLS อ่าน/เขียนได้โดยทุก role ที่มี grant)
- [ ] `npm run verify` เขียว; `RUN.md` ให้คนอื่นเปิดได้ใน 10 นาที
- ไม่ต้องมี: backup, Sentry, domain ของตัวเอง, CI, MFA

### Tier 2: ใช้ภายใน (ผู้ใช้จริงกลุ่มเล็ก ข้อมูลจริงไม่อ่อนไหว)
ครบ tier 1 และ:
- [ ] Auth จริง (Supabase Auth, ไม่มี default account), authorization ฝั่ง server + RLS policy ทุกตาราง + **pgTAP test ของ RLS** (`supabase test db`)
- [ ] Backup: Free = `supabase db dump` ตั้งเวลา เก็บนอก Supabase + **restore ลอง 1 ครั้งบันทึกวัน**; Pro = daily 7 วัน; D1 = Time Travel
- [ ] Sentry (free) + `sendDefaultPii:false`; ตั้ง alert อีเมล
- [ ] ตั้ง **แจ้งเตือนค่าใช้จ่าย/โควตา** ในแดชบอร์ด Vercel / Supabase / Cloudflare ของบัญชีที่ใช้จริง (ชื่อเมนูตรวจเองวันตั้งค่า)
- [ ] Privacy notice 1 หน้า ถ้าเก็บอีเมล/ชื่อของคนอื่น (section 5.3)
- [ ] `STATE.md` + `DECISIONS.md` ตรงความจริง

### Tier 3: ใช้จริง (คนนอกพึ่งพา / มีรายได้ / ล่มแล้วเสียหาย)
ครบ tier 2 และ:
- [ ] **แผนจ่ายเงิน**: Vercel Pro (ถ้า commercial) + Supabase Pro (ไม่ pause, backup, spend cap); ตั้ง Spend Management ใน Vercel
- [ ] **domain ของตัวเอง** + HTTPS + DNS ที่บัญชีเดียวกับเจ้าของโปรเจกต์ (บันทึกที่ลงทะเบียน/วันหมดอายุใน `HANDOVER`/`DECISIONS`)
- [ ] ทดสอบ restore ทุกเดือน; เก็บ dump นอกผู้ให้บริการ
- [ ] MFA เปิดบัญชี GitHub / Vercel / Supabase / Cloudflare / registrar (ยังไม่ได้เปิดหน้าตั้งค่า MFA ของแต่ละเจ้าตรวจ: UNVERIFIED)
- [ ] Rate limit บน endpoint login/AI/ส่งฟอร์ม; cap ค่าใช้จ่าย AI API ใน Worker/route
- [ ] Uptime monitor ภายนอก (เครื่องมือยังไม่ได้เลือก/ตรวจ: UNVERIFIED) + Sentry alert
- [ ] Breach runbook 1 หน้า: ใครแจ้งใคร, หมุนคีย์ที่ไหน, แจ้งผู้ใช้อย่างไร (PDPA ถ้ามีข้อมูลส่วนบุคคล)
- [ ] CI 1 workflow (verify + audit) แต่ **`npm run verify` บนเครื่องยังเป็นตัวตัดสิน** (billing lock ของ GitHub เคยทำ CI ล้ม)
- [ ] Dependabot grouped weekly; secret ถูกหมุนหลังทุกครั้งที่เคยหลุดในแชท

---

## 4. โครงสร้างโปรเจกต์

```
<slug>/ AGENTS.md CLAUDE.md STATE.md BACKLOG.md DECISIONS.md RUN.md README.md .env.example .gitattributes
  src/app/            (route + layout เท่านั้น)
  src/features/<feature>/   (component, server action, schema ของ feature นั้น)
  src/lib/{supabase/{client,server,proxy}.ts, env.ts(zod), errors.ts}
  supabase/{config.toml, migrations/, seed.sql, tests/}   (pgTAP ของ RLS)
  tests/{unit,e2e}   docs/{runbook.md, security.md, architecture.md}   scripts/{verify,backup-db}.*
```
Variant B: `src/`(Vite) `worker/src/index.ts` `shared/`(zod schema + api-contract ใช้ร่วมสองฝั่ง) `wrangler.jsonc` `.dev.vars.example` `e2e/`. Template ไฟล์กลางที่ `templates/project/`

`package.json` ต้องมี script เดียวที่ตัดสิน: `verify` = lint + typecheck + test + build (+ e2e เร็ว) (แบบ RubricLens: `npm run verify` ก่อน deploy ทุกครั้ง). Next.js 16 เปลี่ยนจาก training data: **agent ต้องอ่าน `node_modules/next/dist/docs/` ก่อนเขียน** (บล็อกนี้อยู่ใน AGENTS.md ของ CAMPBANK)

---

## 5. Auth และความปลอดภัย

### 5.1 Supabase RLS (T1: supabase.com/docs/guides/database/postgres/row-level-security, อ่าน 2026-10-01)
- เปิด RLS **ทุกตาราง** ใน exposed schema; policy ไม่ถอน grant เดิม -> `revoke` ที่ไม่ใช้
- **View ข้าม RLS โดยปริยาย** -> สร้างด้วย `security_invoker = true` (Postgres 15+)
- ห้ามใช้ `user_metadata` ใน policy (user แก้เองได้) ใช้ `raw_app_meta_data`/ตาราง role แยก; JWT เก่าไม่สะท้อนสิทธิ์ที่ถอนจนกว่าจะ refresh
- `auth.uid()` เป็น `null` เมื่อไม่ login -> เช็ก `is not null` ชัดเจน; ใช้ `(select auth.uid())` เพื่อ performance; index คอลัมน์ที่ policy กรอง
- **secret/service_role key ข้าม RLS** ห้ามอยู่ในเบราว์เซอร์ ห้ามขึ้นต้น `NEXT_PUBLIC_`; ฝั่ง client ใช้ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` + `@supabase/ssr` (supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- ทุก migration ใหม่ต้องมี pgTAP test: user A อ่านของ user B ไม่ได้, anon อ่านไม่ได้

### 5.2 Secrets
- Vercel: เก็บใน Project Environment Variables (แยก Preview / Production); `.env.local` ไม่ commit; ไม่ใส่ secret ใน `NEXT_PUBLIC_*`
- Cloudflare: local ใช้ `.dev.vars` (gitignored), production ใช้ Worker secret (`wrangler secret put`) ส่วน var ที่ไม่ลับอยู่ใน `wrangler.jsonc` เท่านั้น (บทเรียน RubricLens commit `fc59089`)
- **ห้ามวาง key ลงแชท** (pitfalls ข้อ 5: เกิดแล้ว 5 ครั้ง) บอก agent แค่ชื่อ env var; ถ้าเคยวาง = หมุนทันที
- Validate input ด้วย zod ทุก route/action; error ที่ผู้ใช้เห็นห้ามมีรายละเอียดภายใน

### 5.3 PDPA (ถ้ามีข้อมูลส่วนบุคคลของคนอื่น: อีเมล ชื่อ รูป)
- เก็บเท่าที่จำเป็น, privacy notice (เก็บอะไร เพื่ออะไร เก็บนานแค่ไหน), ช่องทางลบข้อมูล, ไม่เก็บข้อมูลสุขภาพ/ข้อมูลอ่อนไหว
- **s.28 โอนข้อมูลไปต่างประเทศ:** Vercel/Supabase/Sentry/Cloudflare ประมวลผลนอกไทยได้. PDPC ประกาศหลักเกณฑ์ใน Royal Gazette 2023-12-25 มีผล 2024-03-24; ปลายทางต้องมีมาตรฐานเพียงพอ หรือมีมาตรการคุ้มครองที่เหมาะสม (SCC, BCR, ฯลฯ) (Linklaters 2024-01-26, T2: linklaters.com/en/insights/blogs/digilinks/2024/january/thailand---new-rules-for-transborder-dataflow). รายชื่อประเทศ adequacy: รายงาน T3 ว่ายังไม่มี (Lexology/Securiti) = UNVERIFIED ตรวจ PDPC เองก่อน tier 3
- ข้อยกเว้นการใช้เพื่อส่วนตัว/ครัวเรือน และ DPA ของแต่ละเจ้า: UNVERIFIED (ยังไม่ได้เปิดตัวบทกฎหมาย/DPA) นี่ไม่ใช่คำแนะนำทางกฎหมาย
- ปฏิบัติ: เลือก region ตอนสร้าง Supabase (ใกล้ไทยถ้ามี) แต่ **region ไม่ทำให้พ้น s.28**; Sentry `sendDefaultPii:false` + scrub email/body; ตำแหน่งเก็บข้อมูลของ Sentry = UNVERIFIED (หน้า docs ที่ลองเปิดไม่มี)

---

## 6. Observability

- **Sentry** `@sentry/nextjs` 11.2.0 (A) / `@sentry/cloudflare` 11.2.0 + `@sentry/react` (B); free 5k errors/เดือน, 1 user, 30 วัน -> ตั้ง `sampleRate`, ปิด session replay/tracing จนกว่าจำเป็นเพื่อไม่ให้โควตาหมด
- Vercel Hobby เก็บ runtime log แค่ 1 ชม. จึงต้องพึ่ง Sentry; Speed Insights ฟรี 10,000 events/30 วัน (CAMPBANK ติด `@vercel/speed-insights` แล้ว: tier 3 เท่านั้น)
- Tier 2: Sentry + อีเมล alert + `/api/health` 1 route. Tier 3: เพิ่ม uptime ภายนอก (UNVERIFIED เครื่องมือ)
- ห้ามสร้าง dashboard/monitoring เกิน tier (CAMPBANK เคยตรวจ Safari 5 แบบ + monitoring เกินตัว: pitfalls ข้อ 7)

---

## 7. Testing และ CI

- Test pyramid ที่พอ: Vitest (logic + schema) -> pgTAP (RLS) -> Playwright 3-5 flow หลัก; แก้บั๊กต้องมี regression test ก่อน
- `npm run verify` ต้องรันได้บนเครื่องและเป็นตัวตัดสิน; E2E เต็มรันตามสั่ง ไม่ผูก pre-push (pre-push ค้างหลายนาทีเคยเกิดที่ SUTH)
- `npm audit --omit=dev --audit-level=high` อยู่ใน verify (แบบ RubricLens)
- CI (GitHub Actions) ทำเฉพาะ tier 3 และ workflow เดียว; ห้ามแก้/ลบ/skip test เพื่อให้เขียว (core.md hard stop 7)
- ไม่ใช้ข้อมูลจริงหรือ secret จริงใน test/CI; ใช้ Supabase local (`supabase start`) สำหรับ test DB

---

## 8. ชื่อ / domain / ผู้ให้บริการ: ล็อกครั้งเดียวก่อน deploy ครั้งแรก

เหตุ: ประวัติ EQ-PROJECT 08-01/08-02 เปลี่ยนชื่อเว็บ 5 ครั้งใน 2 วัน + Netlify -> Cloudflare (pitfalls ข้อ 11). Agent เปลี่ยนชื่อ/โดเมนเองไม่ได้ ต้องผ่าน ADR

กรอกตารางนี้ใน `DECISIONS.md` **ก่อน** `vercel link` / `wrangler deploy` / สร้างโปรเจกต์ Supabase:

| ช่อง | ค่า | หมายเหตุ |
|---|---|---|
| `slug` (ตัวเล็ก-ขีด) | | ใช้ซ้ำเป็น: ชื่อ repo = package name = Vercel/Worker project = Supabase project; **เปลี่ยนไม่ได้โดยไม่ทำ ADR** |
| ชื่อแสดงผล (Thai/English) | | เปลี่ยนได้ฟรี ไม่กระทบ URL/infra |
| domain | `*.vercel.app` / `*.workers.dev` (demo) หรือ domain จริง (tier 3) | เช็กว่าว่างก่อนตั้งชื่อ; registrar ที่ไหน บัญชีไหน |
| stack variant | A หรือ B | ตามข้อสรุปต้นไฟล์ |
| tier ปัจจุบัน | 1 / 2 / 3 | |
| region + แผนจ่ายเงิน | | |
| auth provider | Supabase Auth / ไม่มี | |

กฎ: ยังไม่ได้เติมครบ = ไม่ deploy; ชื่อที่ยังไม่นิ่งให้ใช้ `slug` ชั่วคราวและ **ไม่แจก URL**; เปลี่ยน slug ได้เมื่อผ่านเช็กตัวเอง "แก้ปัญหาที่เจ็บจริง หรือแค่เบื่อตัวเก่า" + ADR 3 บรรทัด (ข้อเสนอ ไม่ใช่กฎที่ตรวจแล้ว)

---

## 9. Kickoff prompt (copy แล้วเติม [ ])

```
เริ่มโปรเจกต์ใหม่บน cloud (ไม่ใช่ข้อมูลโรงพยาบาล) ตาม D:\ai-playbook\stacks\cloud-web.md
อ่าน D:\ai-playbook\instructions\core.md, stacks\cloud-web.md, me\pitfalls.md ก่อน แล้วตอบเป็นภาษาไทย
ยังไม่เขียนโค้ด ยังไม่ deploy ยังไม่สร้างบัญชี/โปรเจกต์บน Vercel/Supabase/Cloudflare

1. ไอเดีย 1-2 ประโยค: [..]  ผู้ใช้: [ใคร กี่คน]  tier เป้าหมาย: [1/2/3]
2. ข้อมูลที่เก็บ: [ไม่มี / อีเมล / อื่นๆ]  มีข้อมูลโรงพยาบาลหรือไม่: [ไม่]  มี payment/AI API ที่มีค่าใช้จ่ายหรือไม่: [..]
3. ให้คุณ: (ก) เลือก variant A หรือ B ตาม section 1.3 พร้อมเหตุผล 2 บรรทัด
   (ข) ตรวจ go/no-go: ข้อมูล/สิทธิ์/ToS/ค่าใช้จ่ายต่อเดือน (ตาราง 1.2) ที่แอปนี้พึ่ง
   (ค) เขียนเกณฑ์ "เสร็จเมื่อ" ไม่เกิน 5 ข้อที่ตรวจได้ และ scope box ทำ/ไม่ทำ/เสร็จเมื่อ
   (ง) เติมตาราง section 8 (slug/ชื่อ/domain/variant/tier/region/auth) ให้ฉันยืนยัน แล้วเขียนลง DECISIONS.md
   (จ) เสนอ walking skeleton: ของที่กดได้ภายใน 3 task แรก
4. ถ้าเห็นต่างหรือมีสิ่งที่ฉันมองข้าม บอกก่อนเริ่ม ห้ามเดา ตรวจได้ให้ตรวจ
5. ฉันจะไม่วาง secret ในแชท ให้บอกเป็นชื่อ env var เท่านั้น
รอฉันตอบ "ตามนี้" ก่อนสร้างโปรเจกต์
```

---

## 10. ตรวจซ้ำรายเดือน (re-verify)

ต้นเดือน ให้ agent: (1) `npm view <pkg> version` ทุกแถวใน section 1 / 1.1 (2) ดู Node schedule (github.com/nodejs/Release) (3) เปิดหน้า pricing/limits ของ Vercel Hobby, Supabase, Cloudflare Workers/D1, Sentry เทียบตาราง 1.2 (4) เช็ก security advisory ของ Next/Supabase/Vite/Wrangler (5) อัปเดตคอลัมน์ Version + บรรทัด **Last verified**; major เปลี่ยน = เปิด issue ไม่อัปเกรดทันที

ค้างตรวจ ณ 2026-10-01: Node 26 LTS (2026-10-28); `typescript-eslint` รับ TS 7 เมื่อไร (ตอนนี้ peer `<6.1.0`); ESLint 10 กับ plugin; พฤติกรรม Sentry free เมื่อเกินโควตา + data region; เงื่อนไข keepalive ของ Supabase free; ชื่อเมนู spend alert ของแต่ละเจ้า; ขั้น MFA; PDPC adequacy list; ข้อยกเว้นใช้ส่วนตัวของ PDPA; Prettier/gitleaks เวอร์ชันล่าสุด

**ความต่างระหว่างแหล่ง:** CAMPBANK/RubricLens ตรึงเวอร์ชันต่ำกว่า registry วันนี้ (เช่น next 16.3.6 vs 16.3.8, vitest 4.1.11 vs 5.0.3, supabase-js 2.112.3 vs 2.117.2). ตารางนี้เชื่อ registry (T1) ส่วนโปรเจกต์เดิมอัปเดตตอนแตะ ไม่ใช่งานแยก (ไม่งั้นผิดกฎ P6)
