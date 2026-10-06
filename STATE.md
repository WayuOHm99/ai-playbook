# State

Updated: 2026-10-07 (Asia/Bangkok, cloud session). `main` รวม PR #11 ถึง #15 แล้ว เกณฑ์ผ่านแล้ว 3 จาก 5 (1, 4, 5)

## ขอบเขตที่อนุมัติอยู่ (2026-10-07)

ผู้ใช้อนุมัติเกณฑ์ "เสร็จ" 5 ข้อ เมื่อผ่านครบให้หยุดแก้ playbook จนกว่าจะเจอเหตุจริง เรื่องอื่นลง BACKLOG

| # | เกณฑ์ | ตรวจได้จาก | สถานะ |
|---|---|---|---|
| 1 | เอกสารตรงกับความจริง | STATE/README/working-style ไม่อ้างสิ่งที่ลบแล้ว และ CI ผ่าน | ผ่าน (PR #11 merged 2026-10-07, Actions ผ่าน) |
| 2 | พิสูจน์กับงานจริง 1 ชิ้น | issue จริงใน `suth-helpdesk-assets` ด้วย Claude Code จนเปิด PR บันทึกผลใน `evals/` | **ผ่านแบบมีข้อจำกัด** (ผู้ใช้ตัดสิน 2026-10-07): issue #262 / PR #263 เป็นงานแก้เอกสาร 1 บรรทัด ทำก่อนสกิล `implement` ฉบับใหม่ ดู [บันทึก](evals/real-work-trial-2026-10-07.md) |
| 3 | ปิดงานเป็นห่วงโซ่ | ปิด 1 issue ด้วยข้อความจากผู้ใช้ไม่เกิน 3 ครั้ง | แก้สกิลแล้ว (ผู้ใช้อนุมัติแบบ 2026-10-07): `implement` ทำต่อถึง push และ PR เมื่อสั่งส่งมอบ แล้วหยุดที่ merge **ยังไม่พิสูจน์** ต้องนับข้อความจริงตอนทำข้อ 2 |
| 4 | กันความลับหลุดด้วยเครื่องมือ | (A) ตัวดักความลับที่ช่องพิมพ์ (B) deny rules ใน Claude Code (C) gitleaks ก่อน commit ใน suth และ ai-playbook | C ผ่าน: gitleaks 8.30.1 บล็อก commit ที่มี token ปลอมใน repo ทดสอบ ติดตั้ง hook แล้วทั้งสอง repo · A และ B ผ่าน: ผู้ใช้ทดสอบในเซสชันใหม่บนเครื่องจริง 2026-10-07 (ก) ข้อความที่มีรหัสผ่านติดป้ายถูกบล็อก (ข) การอ่าน `.env` ถูกปฏิเสธ ผู้ใช้รายงานผลเอง ไม่มี log แนบ · **ผ่าน** |
| 5 | ผู้ใช้อ่านกฎเองได้ | สรุป `instructions/core.md` ภาษาไทย 1 หน้า ผู้ใช้อ่านแล้วยืนยัน | ผ่าน (ผู้ใช้ยืนยัน 2026-10-07, PR #12 merged) |

ไม่ทำในขอบเขตนี้: เพิ่มสกิลจากแหล่งอื่น, merge เอง, แตะข้อมูลจริงหรือ secret, เปลี่ยน global settings นอกข้อ 4

## สภาพเครื่องจริง (ตรวจ 2026-10-07)

- `D:\ai-playbook` มี worktree เดียว ไม่มี stash ค้าง `main` ตรงกับ `origin/main` หลัง PR #11
- ผู้ใช้อนุมัติการติดตั้งเมื่อ 2026-10-06: รัน `scripts/sync.ps1` แล้ว สกิล 27 ตัวใน catalogue เป็นสำเนาจริงใน `~/.claude/skills` และเป็น junction จาก `~/.agents/skills` มาที่ checkout นี้ sub-agent 6 ไฟล์ถูกเขียนใหม่ ตัวตรวจรายงาน catalogue 27 OK และ installation drift OK
- ถอดออกจากเครื่องแล้ว: `choose-stack`, `handoff-pack`, `new-request`, `ship`, สกิล Matt กลุ่ม reference 11 ตัว และ `sandbox-sdk` รายการ `mattpocock/skills` ถูกลบออกจาก lock ของ `npx skills` แล้ว จึงห้ามใช้ `npx skills update` กับ 27 ตัวนี้ (จะเขียนทับ checkout ผ่าน junction) ให้อัปเดตด้วย `git pull` แล้ว sync
- สกิลอื่นที่ติดตั้งผ่าน `npx skills`: HyperFrames 18, Cloudflare 10, `developing-with-streamlit`, `find-skills`, `requirements-clarity` รวมทั้งเครื่อง 58 ตัวต่อ harness
- Playbook guard (`guard.mjs`) ยังไม่ได้ติดตั้ง สิ่งที่เปิดใช้แล้วใน `~/.claude/settings.json` เมื่อ 2026-10-07: hook `prompt-secret-scan.mjs` แบบ UserPromptSubmit และ deny rules 12 ข้อ (`.env` และรุ่นย่อยยกเว้น `.env.example`, `*.pem`, `*.key`, `id_rsa*`, `~/.ssh`, `secrets/`) สำรองไฟล์เดิมที่ `settings.json.bak-20261007-secretscan`
- gitleaks ก่อน commit: `D:\ai-playbook\.git\hooks\pre-commit` และ `D:\suth-helpdesk-assets\.githooks\pre-commit` ตัวหลังถูกมองข้ามผ่าน `.git/info/exclude` จึงมีผลเฉพาะเครื่องนี้ ไม่ถูก push
- ทั้งหมดในหัวข้อนี้เป็นสภาพของเครื่อง Windows ของผู้ใช้ ไม่มีใน cloud session

## หลักฐานที่ไม่มีแล้ว

ระหว่างเคลียร์เครื่องเมื่อ 2026-10-06 ถึง 2026-10-07 ผู้ใช้อนุมัติให้ลบ worktree ใต้ `D:\wt` ทั้งหมด โฟลเดอร์ `.scratch` ของทุก worktree และโฟลเดอร์งาน Codex วันที่ 2026-10-05 ผลคือ raw trace, receipt และ fixture ที่รายงานใน `evals/*-2026-10-06.md` และ STATE รุ่นก่อนอ้างถึง (`.scratch/ci/`, `.scratch/ci-failure-probe/`, `.scratch/workflow-trial/`, `.scratch/multi-ticket/`) ตรวจย้อนไม่ได้แล้ว สิ่งที่ยังตรวจได้: commit และ PR #1 ถึง #10 บน GitHub, ผล Actions ของ PR #10 และ `main`, และตัวรายงานใน `evals/` branch เดิมทุกตัวยังอยู่ทั้งในเครื่องและบน remote

## งานที่ส่งมอบแล้ว

PR #7 สถาปัตยกรรม Matt 27 active / 11 reference · PR #8 quickstart แบบอ่านจาก repo · PR #9 ทดลองหลาย ticket · PR #10 CI บน Windows (`scripts/ci-checks.ps1`, `scripts/ci-failure-probe.mjs`, `.github/workflows/repository-checks.yml`, คู่มือ `setup/repository-ci.md`) การทดลองทั้งหมดเป็นโจทย์สังเคราะห์ใน Codex ยังไม่รับรองทุกสกิลหรือทุกสภาพแวดล้อม

## ส่งต่อ (เขียน 2026-10-07 สำหรับเซสชันถัดไป รวมถึง cloud session)

ผู้รับ: อ่านไฟล์นี้กับ `instructions/core.md` ก่อน แล้วเช็ก `git log -5` และ `git status` รายงานสั้น ๆ ก่อนทำต่อ

เหลือ 2 เกณฑ์ (ข้อ 4 ปิดแล้ว):

1. ~~**ข้อ 4**~~ ผ่านแล้ว 2026-10-07 เดิม: ผู้ใช้เปิดเซสชัน Claude Code ใหม่บนเครื่อง แล้วทดสอบ (ก) พิมพ์ข้อความที่มีรหัสผ่านติดป้าย ต้องถูกบล็อกด้วยข้อความ "BLOCKED by playbook secret scan" (ข) สั่งอ่านไฟล์ `.env` ต้องถูกปฏิเสธ ในเซสชันที่เขียน settings การอ่าน `.env` ยังทำได้ จึงยังไม่รู้ว่า deny rule ทำงานหรือรูปแบบ rule ผิด cloud session ทดสอบข้อนี้ไม่ได้
2. **ข้อ 3:** คืนความสามารถปิดงานเป็นห่วงโซ่ที่ `ship` เดิมเคยให้ (`me/pitfalls.md` ข้อ 3 บันทึกว่าลดได้ราว 6 ข้อความต่อ issue) โดยไม่สร้าง router แข่งกับ Matt ทำแล้ว: เพิ่มย่อหน้าส่งมอบใน `skills/engineering/implement/SKILL.md` (Local adjustment) และอัปเดต `me/pitfalls.md` ที่ยังอ้าง `/ship` เหลือพิสูจน์ด้วยงานจริงในข้อ 2 แล้วบันทึกจำนวนข้อความใน `evals/` บนเครื่องผู้ใช้ต้อง `git pull` แล้วรัน `scripts/sync.ps1` (ต้องขออนุมัติการติดตั้ง) สกิลที่ติดตั้งจึงจะเห็นข้อความใหม่
3. **ข้อ 2:** ทำ issue จริง 1 ชิ้นใน `suth-helpdesk-assets` ด้วย Claude Code จนเปิด PR แล้วบันทึกผลใน `evals/` ผู้ใช้ยังไม่ได้เลือกงาน ตอนตรวจล่าสุด repo นั้นอยู่บน branch `docs/262-agents-md-context-md-exists` ซึ่งอาจเป็นงานที่ใช้ได้ ให้ถามผู้ใช้ก่อน

ข้อจำกัดเมื่อทำใน cloud session:
- มีแต่ไฟล์ใน repo นี้ ไม่มีสกิลที่ติดตั้งในเครื่อง ไม่มี `~/.claude/settings.json` ของผู้ใช้ ไม่มี gitleaks และไม่มี path `D:\...` ให้ใช้วิธีอ่านจาก repo ตาม `setup/quickstart-repo.md` โดยระบุ `Playbook root` เป็นตำแหน่ง checkout จริง
- สคริปต์ตรวจเป็น PowerShell สำหรับ Windows (`scripts/ci-checks.ps1`, `scripts/sync.ps1`) ถ้ารันในเครื่อง cloud ไม่ได้ ให้ใช้ผล GitHub Actions ของ PR เป็นหลักฐานแทน และบอกชัดว่าไม่ได้รันในเครื่อง ห้ามรัน sync
- `suth-helpdesk-assets` อยู่ใต้บัญชี GitHub อื่น (`saritrungj`) และเป็นระบบของโรงพยาบาล การนำ repo นั้นขึ้น cloud ต้องได้สิทธิ์จากเจ้าของ repo และผู้ใช้ต้องยืนยันว่านโยบายของหน่วยงานอนุญาต ถ้ายังไม่ชัด ให้ทำข้อ 2 บนเครื่องผู้ใช้
- สิทธิ์ที่ให้ไว้ในบทสนทนาเดิมไม่ตามมาด้วย: merge, การติดตั้ง และการแก้การตั้งค่า ต้องขอผู้ใช้ใหม่ตาม core

## ขั้นต่อไป

เหลือเกณฑ์ข้อ 3 ข้อเดียว: ผู้ใช้เปิดเซสชัน Claude Code ใหม่ใน `suth-helpdesk-assets` เลือก issue ที่มีโค้ดและเทสต์ สั่ง `/implement #N แล้วส่งมอบ` แล้วนับข้อความที่พิมพ์จนได้ลิงก์ PR (ผ่านเมื่อไม่เกิน 3) จากนั้นบันทึกผลเป็นไฟล์ใหม่ใน `evals/` พร้อมจำนวนข้อความ สกิลที่ถูกเรียก และจุดที่ติดขัด