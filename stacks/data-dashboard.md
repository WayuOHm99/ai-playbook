# House stack: data dashboard / analyst tool (Python + Streamlit)

- **Last verified: 2026-10-01** (เวอร์ชัน+วันที่ดึงจาก pypi.org/project/<pkg>/ วันเดียวกัน; แหล่งอ้างอิงเต็มอยู่ section 10 อ้างเป็น [S#])
- **ต้อง re-verify ทุกเดือน** (section 9) "UNVERIFIED" = ยังไม่ยืนยันจาก primary source
- Evidence tier: T1 = official/vendor docs, T2 = โปรเจกต์จริงของผู้ใช้เอง/แหล่งรอง, T3 = ข้อสรุปของผู้เขียนไฟล์นี้ (judgement ไม่ใช่ข้อเท็จจริงจากเอกสาร)
- ตัวอย่างอ้างอิง: `D:\Run-Performance-Project` (Garmin -> SQLite -> Streamlit; ข้อมูลสุขภาพนักกีฬา) [L1]

หลักการข้อเดียว: **dashboard คือหน้าจอบางๆ บน pure function ที่เทสได้** (`core/`) ไม่ใช่เว็บแอปเต็มรูป ถ้าต้องมี user หลายคน/สิทธิ์/ข้อมูลผู้อื่น ให้ออกจาก stack นี้ (section 2)

---

## 1. Recommended stack (verified 2026-10-01)

| Layer | เลือกใช้ | Version | Release | License | เหตุผล (1 บรรทัด) |
|---|---|---|---|---|---|
| Runtime | Python 3.14 | 3.14.8 | 2026-09-30 | PSF | bugfix ถึง 2030-10; 3.10 EOL วันนี้ (2026-10-01); Run-Performance ใช้ 3.14.6 อยู่แล้ว [S1][L2] |
| UI framework | Streamlit | 1.64.0 | 2026-09-15 | Apache-2.0 | script-as-app, AppTest ในตัว, `st.secrets`/`st.login` ในตัว [S2][S3] |
| DataFrame | pandas | 3.0.6 | 2026-09-17 | BSD-3 | ecosystem กว้างสุด agent เขียนถูกบ่อยสุด (T3); ต้อง Python >=3.11 [S4] |
| Charts | plotly | 7.1.0 | 2026-09-15 | MIT | interactive; **major เปลี่ยนจาก 6.9.0 ที่ Run-Performance pin** อ่าน changelog + รัน AppTest ก่อนอัปเกรด (compat กับ Streamlit 1.64 = UNVERIFIED) [S5][L3] |
| Storage | SQLite (stdlib) | - | - | public domain | Garmin->SQLite->Dashboard ใช้งานจริงแล้ว; ไฟล์เดียว backup ง่าย [L1] |
| SQL บนไฟล์ (optional) | DuckDB | 1.5.6 | 2026-09-28 | MIT | เฉพาะเมื่อต้อง query CSV/Parquet ก้อนใหญ่; ยังไม่จำเป็นถ้าข้อมูลพอดี RAM (T3) [S6] |
| Packaging | uv (commit `uv.lock`) | 0.12.21 | 2026-09-29 | MIT OR Apache-2.0 | `uv init/add/sync/run`; lockfile reproducible [S7][S8] |
| Lint + format | ruff | 0.16.9 | 2026-09-24 | MIT | เครื่องมือเดียวแทน flake8+black+isort (T3) [S9] |
| Test | pytest + Streamlit AppTest | 9.1.1 | 2026-06-19 | MIT | AppTest = headless รันสคริปต์; ดู section 7 ว่ามันพิสูจน์อะไรไม่ได้ [S10][S11] |
| Data source (ตัวอย่าง) | garminconnect | 0.3.17 | 2026-09-29 | MIT | **unofficial client**; ต้อง Python >=3.12; Run-Performance pin 0.3.11 (ล้าหลัง) [S12][L3] |

หมายเหตุ vendor risk: Astral (ผู้ทำ uv, ruff) ประกาศเข้า OpenAI/Codex team 2026-03-19 และบอกว่าจะ develop เป็น open source ต่อ; ยังไม่ยืนยันว่า deal ปิดแล้วหรือยัง (UNVERIFIED) [S13] มาตรการ: pin version + commit `uv.lock`; ถ้าทิศทางเปลี่ยน fallback เป็น pip + black ได้ (T3)

### Rejected / ไม่เลือก (เหตุผลเป็น T3 ไม่ได้ทดสอบเอง; เกณฑ์ = agent เขียนง่าย + deploy เบา + ผู้ใช้คนเดียว)

| ทางเลือก | Version (verified) | ไม่เลือกเพราะ | กลับมาดูเมื่อ |
|---|---|---|---|
| Dash | 4.4.1 (2026-07-21, MIT) [S14] | callback model เขียนยาวกว่า Streamlit สำหรับ dashboard เล็ก | ต้องคุม layout/callback ละเอียดหรือ multi-user จริง |
| Panel | 1.9.4 (2026-08-17, BSD-3) [S15] | ใหญ่เกินงาน; ตัวอย่างที่ agent เห็นน้อยกว่า | widget ซับซ้อนใน PyData stack |
| marimo | 0.25.0 (2026-09-23, Apache-2.0) [S16] | notebook-first; ไม่มีเหตุย้ายจากแอปที่ทำงานอยู่ | งาน exploration ที่ต้อง reproducible แล้วค่อยส่งเป็น app |
| Jupyter + Voila | Voila 0.5.13 (2026-09-04, BSD-3) [S17] | 1 kernel ต่อ user และต้องดูแล Jupyter stack เพิ่ม | แจก notebook อ่านอย่างเดียว |
| NiceGUI | 3.17.1 (2026-09-18, MIT) [S18] | UI toolkit ทั่วไป ไม่ใช่ data-app; ต้องออกแบบเอง | UI สำคัญกว่าข้อมูล |
| Reflex | 0.9.12 (2026-09-22, Apache-2.0; PyPI status Beta) [S19] | Beta ยังไม่ 1.0; เป็น full-stack web ซึ่งควรใช้ house stack อื่น | จะทำเว็บแอปเต็ม ให้ดู hospital-web/cloud-web ก่อน |
| Evidence | npm `@evidence-dev/evidence` 40.1.8 (MIT; วันที่ UNVERIFIED) [S20] | ต้องมี Node + Markdown/SQL ทั้งที่ข้อมูลเราผ่าน Python | รายงาน BI static จาก SQL ล้วน |
| Polars แทน pandas | 1.44.2 (2026-09-09, MIT) [S21] | เร็วกว่าในข้อมูลใหญ่ แต่โค้ด/ตัวอย่างส่วนมากยังเป็น pandas; ข้อมูล Run-Performance เล็ก | ข้อมูลหลายล้านแถว หรือ pandas ช้าจนวัดได้ |
| Poetry/pip-tools | - | uv ทำหน้าที่เดียวกันด้วยคำสั่งเดียว | uv ถูกยกเลิก/เปลี่ยน license |

---

## 2. ใช้ stack นี้เมื่อไหร่ / ไม่ใช้เมื่อไหร่

**ใช้:** dashboard/เครื่องมือวิเคราะห์ที่ผู้ใช้ 1 คน (หรือทีมเล็กใน tailnet/LAN) · ข้อมูล CSV/SQLite/API · อยากเสร็จเป็นชั่วโมง-วัน · `hospital-web.md` section 8 อนุญาต Python+Streamlit สำหรับ "วิเคราะห์ข้อมูล/dashboard เฉพาะบุคคล" โดย **ไม่มีข้อมูลส่วนบุคคล/สุขภาพของโรงพยาบาล** [L4]

| สถานการณ์ | ไปที่ |
|---|---|
| ระบบกลางโรงพยาบาล, หลาย user, login+RBAC, audit log, ข้อมูลบุคลากร/ผู้ป่วย | `stacks/hospital-web.md` (tool ส่วนตัวที่กลายเป็นเครื่องมือกลาง = rebuild ตาม [L4]) |
| เว็บสาธารณะ / SaaS / ต้อง auth+billing เอง | `stacks/cloud-web.md` |
| ต้องเขียนข้อมูลกลับ / ฟอร์ม CRUD เยอะ | web stack เต็ม ไม่ใช่ Streamlit |
| ผู้ใช้พร้อมกันมาก / ต้อง SLA | web stack เต็ม (Streamlit รันสคริปต์ใหม่ตาม interaction, T3) |
| ข้อมูลผู้ป่วยจริงของโรงพยาบาล | หยุด: ต้อง DPO/IT อนุมัติ + ใช้ hospital-web |

---

## 3. Tier: demo / ใช้ภายใน / ใช้จริง

ประกาศ tier ใน `AGENTS.md` **tier ตัดสินจากชนิดข้อมูลก่อน จำนวน user ทีหลัง**: Run-Performance มี user คนเดียว (โค้ช) แต่ถือข้อมูลสุขภาพนักกีฬา จึงเข้า tier 3 ด้านข้อมูล (T3) ทำเท่าที่ tier ต้องการ ห้าม over-build; เลื่อน tier = 1 บรรทัดใน `DECISIONS.md` + tick ครบ

### Tier 1: demo
- [ ] ข้อมูล **synthetic หรือสาธารณะเท่านั้น** (`fixtures/`), ป้าย "DEMO" บนหน้าจอ
- [ ] `uv sync && uv run streamlit run app/main.py` ใช้ได้ตาม README (คนอื่นเปิดได้ใน 10 นาที)
- [ ] `ruff check` + `pytest` เขียว; `uv.lock` commit
- [ ] `.streamlit/secrets.toml` + `.env` ใน `.gitignore`, มี `*.example`; `gatherUsageStats=false`
- ไม่ต้องมี: Docker, auth, backup, CI

### Tier 2: ใช้ภายใน (ข้อมูลจริงของตัวเอง / ข้อมูลที่ไม่ sensitive)
ครบ tier 1 (ยกเว้น synthetic) และ:
- [ ] bind `127.0.0.1` เท่านั้น; เข้าจากอุปกรณ์อื่นผ่าน tailnet/VPN ไม่เปิด port สู่ public
- [ ] dashboard เปิด DB แบบ read-only (`file:...?mode=ro`); script ที่เขียน DB แยกจากแอป
- [ ] unit test `core/` + AppTest smoke + **เปิด `streamlit run` จริงแล้วคลิกดู** (AppTest ไม่พอ, section 7)
- [ ] backup ไฟล์ DB + restore ได้จริง 1 ครั้งและบันทึกวันที่
- [ ] pin version ทุกตัว; อัปเกรด major ผ่าน branch + test

### Tier 3: ใช้จริง (คนอื่นพึ่งพา / ข้อมูลสุขภาพหรือส่วนบุคคลของผู้อื่น)
ครบ tier 2 และ:
- [ ] data inventory: ข้อมูลอะไร ของใคร เพื่ออะไร เก็บนานเท่าไร; **ฐานกฎหมาย** (สุขภาพ = s.26 ต้อง explicit consent เว้นแต่ข้อยกเว้น) [S27]
- [ ] privacy notice + ช่องทางถอน consent / ลบข้อมูลรายคน (ทดสอบแล้ว)
- [ ] authentication หน้าแอป (`st.login` OIDC หรือ proxy ที่มี auth); OIDC = ยืนยันตัวตน ไม่ใช่ authorization ต้องเช็กสิทธิ์รายคนเอง [S3]
- [ ] ไม่ใช้ host ที่ไม่ทราบ region (section 6); breach runbook แจ้ง PDPC ภายใน 72 ชม. [S27]
- [ ] restore drill เป็นรอบ; secret rotate ได้; log ไม่มีข้อมูลสุขภาพ/token
- [ ] งานโรงพยาบาล: ไม่ผ่านด่านนี้ใน stack นี้ ให้ไป `hospital-web.md`

---

## 4. โครงสร้างโปรเจกต์

```
<project>/ AGENTS.md CLAUDE.md STATE.md BACKLOG.md DECISIONS.md README.md  pyproject.toml uv.lock .python-version .gitignore
  app/   main.py (บาง: ประกอบหน้า) pages/ ui/ (charts.py, components.py)
  core/  load.py transform.py metrics.py   # pure function ห้าม import streamlit -> เทสได้เร็ว
  fixtures/ (synthetic ที่ commit ได้)     data/ (ข้อมูลจริง, gitignored)
  tests/ test_core_*.py  test_app_smoke.py (AppTest)  test_streamlit_config.py
  .streamlit/ config.toml (commit)  secrets.toml (gitignored)  secrets.toml.example
  scripts/ (sync/ingest/backup แยกจากแอป)   docs/   Dockerfile compose.yaml (เมื่อใช้ Docker, tier 2+)
```
`.streamlit/config.toml` ขั้นต่ำ: `[browser] gatherUsageStats = false` · `[server] address = "127.0.0.1"` `headless = true` (ค่าเริ่มต้น gatherUsageStats = true, headless = false [S29]) กฎ Run-Performance ที่ควรลอก: query กิจกรรมกรอง `deleted_at IS NULL`, DB คือ source of truth ของตัวเลข [L1]

---

## 5. Data และ privacy

- **ข้อมูลสุขภาพ = sensitive (PDPA s.26)**: ต้อง explicit consent ใช้ฐานอื่นแทนไม่ได้ (DLA Piper แก้ไขล่าสุด 2026-02-14); ค่าปรับทางปกครองสูงสุด 5,000,000 บาท [S27] ไม่ใช่คำแนะนำทางกฎหมาย ให้ DPO/ทนายยืนยัน (T3)
- Run-Performance ถือข้อมูลนักกีฬา + Garmin credentials [L1]; การมี consent ของนักกีฬาแต่ละคน = UNVERIFIED (ไม่พบในไฟล์ที่อ่าน) ต้องถามเจ้าของโปรเจกต์
- **Secrets:** `st.secrets` อ่านจาก `.streamlit/secrets.toml` (ใน project หรือ `~/.streamlit/`); ต้องอยู่ใน `.gitignore`; secret ระดับ root ถูกเปิดเป็น env var ด้วย ส่วน section ซ้อนไม่ถูกเปิด [S23] ใช้ `.env` + `os.environ` กับ script ที่ไม่ใช่ Streamlit; รัน `gitleaks` ก่อน push (ตาม hospital-web)
- **Garmin token:** `garminconnect` เก็บ token ที่ `~/.garminconnect/garmin_tokens.json` (mode 0600) และเตือนให้ปฏิบัติเหมือน password เพราะ refresh token เข้าบัญชีได้ถาวร [S12]; เริ่มด้วย read-only methods; ห้ามใส่ใน repo/log/screenshot
- **ข้อมูลจริงห้ามเข้า repo/fixture/prompt:** ให้ agent ทำงานกับ `fixtures/` synthetic; ข้อมูลจริงอยู่ `data/`; screenshot/ตัวอย่างที่ส่งให้ AI ต้อง mask ชื่อและตัวเลขสุขภาพ (นโยบาย AI ของโรงพยาบาล = open question ข้อ 8 ใน hospital-web)
- **Caching:** `st.cache_data` ใช้ร่วมกันทุก user/session; ตั้ง `ttl`; อย่า cache ข้อมูลรายคนด้วย `st.cache_resource`; ข้อมูลรายผู้ใช้ใช้ `st.session_state`; cache ใช้ pickle ซึ่งไม่ปลอดภัยกับข้อมูลที่ไม่น่าเชื่อถือ [S28] ถ้ามีหลายนักกีฬา ให้ `athlete_id` เป็น argument ของฟังก์ชัน cache เสมอ (T3)
- **Retention:** soft delete (`deleted_at`) ไม่ใช่การลบจริง ต้องมีงานลบจริงเมื่อนักกีฬาถอน consent (tier 3)

---

## 6. Deploy

| ทาง | ใช้เมื่อ | ข้อควรระวัง |
|---|---|---|
| Local (`127.0.0.1`) | ทุก tier เป็นค่าเริ่มต้น | เครื่อง sleep/ปิด = แอปหยุด (Run-Performance บันทึกไว้) [L5] |
| Local + Tailscale `serve` | เปิดดูจากมือถือส่วนตัว tier 2 | ใช้ `serve` (tailnet only) **ไม่ใช้ Funnel** (Funnel = เปิดสู่ public); เอกสารของโปรเจกต์เองบอกว่ายังไม่ได้ทดสอบบนมือถือจริง (30 ก.ย. 69); Personal plan = ไม่ใช่เชิงพาณิชย์ ตรวจเงื่อนไขเอง [L5] |
| On-prem Docker | tier 2-3 บนเครื่อง/เซิร์ฟเวอร์ของหน่วยงาน | Streamlit docs มีตัวอย่าง: `EXPOSE 8501`, `HEALTHCHECK ... /_stcore/health`, `--server.address=0.0.0.0` [S22] ปรับ: `COPY` แทน `git clone` ในตัวอย่าง, non-root, publish `127.0.0.1:8501:8501`, วางหลัง reverse proxy ที่มี auth+TLS (hospital-web 6.1-6.2) |
| Streamlit Community Cloud | **tier 1 เท่านั้น** (สาธารณะ/synthetic) | app สืบทอดสิทธิ์จาก GitHub repo (repo public = app public); private app ได้ทีละ 1; viewer ที่เชิญเชิญต่อได้ [S24]; secrets วางใน Advanced settings (แพลตฟอร์มเข้ารหัส) [S25]; **เอกสารไม่ระบุ cloud provider/region** [S26] จึงประเมิน s.28 (โอนออกนอกประเทศต้องมี safeguards/มาตรฐานเทียบเท่า หรือ consent) ไม่ได้ [S27] -> ห้ามใส่ข้อมูลสุขภาพ/ส่วนบุคคล |

---

## 7. Testing, lint, format

- **ด่านก่อน commit:** `uv run ruff check . && uv run ruff format --check . && uv run pytest` ต้องเขียว (ห้ามลด rule/skip เพื่อให้ผ่าน)
- **ชั้นของ test** (บทเรียนจริงของ Run-Performance [L6]): (1) unit test `core/` (2) AppTest = สคริปต์รันจบ + element ครบ **เท่านั้น** (3) test config (`config.toml` ผิดค่า = log error ทุกหน้า เจอจริง 26 ส.ค. 69) (4) บูต `streamlit run` จริง บังคับ rerun แล้วอ่าน log (5) เบราว์เซอร์จริงตรวจการเปลี่ยนหน้า (`st.switch_page` ใน callback ไม่ error แต่หน้าไม่ย้าย จับได้ชั้น 5 ชั้นเดียว: "AppTest เขียว ≠ เบราว์เซอร์ใช้ได้") tier 1 ทำชั้น 1-2 + เปิดดูเอง; tier 2+ ทำถึงชั้น 4 และดูหน้าจอจริงเอง
- AppTest: `AppTest.from_file("app/main.py").run()` แล้ว assert; จำลอง input/click ได้ ไม่ต้องมีเบราว์เซอร์ [S11] **ระวัง:** ถ้ามี `.streamlit/secrets.toml` ในโฟลเดอร์ที่รัน pytest แอปในเทสอ่าน secrets จริงได้ [S11] -> เทสต้อง mock Garmin/API ภายนอกและห้ามแตะ credential จริง (ข้อสรุปจากข้อเท็จจริงนั้น, T3)
- แตะ rerun/caching ให้วัดก่อน-หลัง (`time.perf_counter()` รอบที่ 2 เป็นต้นไป) [L6]; เทสผูกกับพฤติกรรม ไม่ใช่ข้อความในซอร์ส และห้ามลบเทสที่แดงเพื่อให้ผ่าน [L6]

---

## 8. Kickoff prompt (copy-paste ให้ agent ตอนเริ่มโปรเจกต์ใหม่)

```
เริ่มโปรเจกต์ data dashboard ใหม่ ใช้ stack ตาม D:\ai-playbook\stacks\data-dashboard.md (อ่านทั้งไฟล์ก่อน)
ชื่อ/เป้าหมาย: <ชื่อ + คำถามที่ dashboard ต้องตอบ 1-3 ข้อ>   ผู้ใช้: <ใคร กี่คน>
แหล่งข้อมูล: <CSV/SQLite/API> | ข้อมูลเป็น: <synthetic / ของตัวเอง / ของผู้อื่น / สุขภาพ / ผู้ป่วย>
Tier ที่ตั้งใจ: <1 demo / 2 ใช้ภายใน / 3 ใช้จริง>
ขั้นตอน: (1) จัดคลาสคำขอตาม triage ใน core.md แล้วบอก 1 บรรทัด
(2) ถ้าข้อมูลเป็นของผู้อื่น/สุขภาพ/ผู้ป่วย ให้หยุดและถามก่อน ห้ามเขียนโค้ด (section 5);
    ถ้าเป็นงานโรงพยาบาลให้ชี้ไป hospital-web.md
(3) เขียน scope box Do/Don't/Done when + เกณฑ์ตรวจได้ไม่เกิน 5 ข้อ ให้ฉันเห็นก่อน
(4) ยืนยันเวอร์ชันปัจจุบันจาก pypi.org ก่อน pin อย่าใช้เวอร์ชันจากความจำ
(5) สร้างโครงตาม section 4 ด้วย uv: pyproject.toml + uv.lock, core/ เป็น pure function,
    fixtures/ เป็น synthetic เท่านั้น, .gitignore ครอบ data/ .env .streamlit/secrets.toml
(6) เขียน test ของ core/ ก่อนหน้าจอ; ตั้ง gatherUsageStats=false และ bind 127.0.0.1
ห้าม: ใส่ข้อมูลจริง/secret ใน repo/prompt/log, deploy, ใช้ Community Cloud กับข้อมูลที่ไม่ใช่สาธารณะ,
เพิ่ม dependency นอกตาราง section 1 โดยไม่ถามฉัน
เสร็จเมื่อ: ruff + pytest เขียว, รัน `streamlit run` จริงแล้วอ่าน log ไม่มี error, รายงานตามรูปแบบใน core.md
(บอกชัดว่าอะไรที่ AppTest พิสูจน์ไม่ได้ และฉันต้องเปิดดูเอง)
```

---

## 9. ตรวจซ้ำรายเดือน (re-verify)

ทุกต้นเดือนให้ agent: (1) เปิด `https://pypi.org/project/<pkg>/` ทุกแถวใน section 1 อ่าน version + "Released" (2) ดู Python release table (3.10 EOL 2026-10-01; 3.15 ตาม python.org วางแผนออก 2026-10-01) (3) อ่าน release notes Streamlit/plotly/pandas เฉพาะ breaking change (4) major เปลี่ยน -> เปิด issue + ทดสอบบน branch ไม่ bump ทันที (5) อัปเดตคอลัมน์ Version/Release และบรรทัด **Last verified**
วิธีดึงข้อมูล: หน้า PyPI ของ Streamlit ตอบ "Client Challenge" ต่อเครื่องมือ fetch (จึงใช้ release notes ของ Streamlit เป็นวันที่); `upload_time` ใน JSON ที่ผ่านตัวสรุปอ่านผิดเป็นปี 2024-25 จึง**ไม่ใช้**; ถ้ามี shell ให้ `curl https://pypi.org/pypi/<pkg>/json` แล้วอ่าน `releases[ver][].upload_time_iso_8601` ตรงๆ
**ยังไม่รู้ ณ 2026-10-01:** plotly 7 กับ Streamlit 1.64 เข้ากันไหม · Astral deal ปิดแล้วหรือยัง · วันที่ release ของ Evidence · นักกีฬา Run-Performance ให้ consent แล้วหรือไม่ · `cloud-web.md` ยังไม่ถูกเขียน · garminconnect 0.3.11 -> 0.3.17 มี breaking change ไหม (ไม่ได้อ่าน changelog) · ตัวบท PDPA จากแหล่งทางการยังไม่ได้เปิด (ใช้ DLA Piper แทน)

---

## 10. แหล่งอ้างอิง (accessed 2026-10-01 ทุกรายการ ยกเว้นระบุวันที่)

**PyPI (T1, PSF)** `https://pypi.org/project/<name>/` ค่า Version/Released/License ตามที่หน้าแสดง: S4 pandas · S5 plotly · S6 duckdb · S7 uv · S9 ruff · S10 pytest · S12 garminconnect (0.3.17, 2026-09-29) · S14 dash · S15 panel · S16 marimo · S17 voila · S18 nicegui · S19 reflex · S21 polars (เทียบ version กับ `https://pypi.org/pypi/<name>/json` ของ streamlit/pandas/plotly/polars/duckdb/uv/ruff/pytest แล้วตรงกัน)
- S1 Python Software Foundation, https://www.python.org/downloads/ (3.14.8 = 2026-09-30; 3.10 EOL 2026-10-01; 3.14 support ถึง 2030-10) · T1
- S2 Streamlit, https://docs.streamlit.io/develop/quick-reference/release-notes (1.64.0 = 2026-09-15) · T1
- S3 Streamlit, https://docs.streamlit.io/develop/concepts/connections/authentication · T1
- S8 Astral, https://docs.astral.sh/uv/guides/projects/ ("uv.lock should be checked into version control") · T1
- S11 Streamlit, https://docs.streamlit.io/develop/api-reference/app-testing และ https://docs.streamlit.io/develop/concepts/app-testing/get-started · T1
- S13 Astral, https://astral.sh/blog/openai (2026-03-19) · T1
- S20 npm registry, https://registry.npmjs.org/@evidence-dev/evidence/latest (version เท่านั้น) · T1
- S22 Streamlit, https://docs.streamlit.io/deploy/tutorials/docker · T1
- S23 Streamlit, https://docs.streamlit.io/develop/concepts/connections/secrets-management · T1
- S24 Streamlit, https://docs.streamlit.io/deploy/streamlit-community-cloud/share-your-app · T1
- S25 Streamlit, https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/secrets-management · T1
- S26 Streamlit, https://docs.streamlit.io/deploy/streamlit-community-cloud/get-started/trust-and-security · T1
- S27 DLA Piper, https://www.dlapiperdataprotection.com/index.html?t=law&c=TH (แก้ไขล่าสุด 2026-02-14; สรุปกฎหมาย ไม่ใช่ตัวบท) · T2
- S28 Streamlit, https://docs.streamlit.io/develop/concepts/architecture/caching · T1
- S29 Streamlit, https://docs.streamlit.io/develop/api-reference/configuration/config.toml · T1
- Local (อ่านอย่างเดียว, T2): L1 `D:\Run-Performance-Project\CLAUDE.md`+`CONTEXT.md` · L2 `garmin\.venv\pyvenv.cfg` (Python 3.14.6) · L3 `garmin\requirements.txt` (garminconnect 0.3.11, streamlit 1.61.1, pandas 3.0.5, plotly 6.9.0) · L4 `D:\ai-playbook\stacks\hospital-web.md` section 8 · L5 `docs\PRIVATE_ACCESS.md` (30 ก.ย. 69) · L6 `CLAUDE.md` หัวข้อ "เทสเขียวไม่ได้แปลว่าใช้ได้"
