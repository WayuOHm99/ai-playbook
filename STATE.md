# State

Updated: 2026-10-07 (Asia/Bangkok). Branch ของงานนี้: `docs/core-thai-summary`. Base: main หลัง PR #11. Phase: เกณฑ์ข้อ 5 รอผู้ใช้อ่านและยืนยัน

## ขอบเขตที่อนุมัติอยู่ (2026-10-07)

ผู้ใช้อนุมัติเกณฑ์ "เสร็จ" 5 ข้อ เมื่อผ่านครบให้หยุดแก้ playbook จนกว่าจะเจอเหตุจริง เรื่องอื่นลง BACKLOG

| # | เกณฑ์ | ตรวจได้จาก | สถานะ |
|---|---|---|---|
| 1 | เอกสารตรงกับความจริง | STATE/README/working-style ไม่อ้างสิ่งที่ลบแล้ว และ CI ผ่าน | ผ่าน (PR #11 merged 2026-10-07, Actions ผ่าน) |
| 2 | พิสูจน์กับงานจริง 1 ชิ้น | issue จริงใน `suth-helpdesk-assets` ด้วย Claude Code จนเปิด PR บันทึกผลใน `evals/` | รอผู้ใช้เลือกงาน |
| 3 | ปิดงานเป็นห่วงโซ่ | ปิด 1 issue ด้วยข้อความจากผู้ใช้ไม่เกิน 3 ครั้ง | ยังไม่เริ่ม |
| 4 | กันความลับหลุดด้วยเครื่องมือ | ตัวสแกนความลับก่อน commit และ deny rules ใน Claude Code | ยังไม่เริ่ม ต้องขออนุมัติการติดตั้งแยก |
| 5 | ผู้ใช้อ่านกฎเองได้ | สรุป `instructions/core.md` ภาษาไทย 1 หน้า ผู้ใช้อ่านแล้วยืนยัน | ร่างแล้วที่ `instructions/core-th.md` รอผู้ใช้อ่านและยืนยัน |

ไม่ทำในขอบเขตนี้: เพิ่มสกิลจากแหล่งอื่น, merge เอง, แตะข้อมูลจริงหรือ secret, เปลี่ยน global settings นอกข้อ 4

## สภาพเครื่องจริง (ตรวจ 2026-10-07)

- `D:\ai-playbook` มี worktree เดียว ไม่มี stash ค้าง `main` ตรงกับ `origin/main` หลัง PR #11
- ผู้ใช้อนุมัติการติดตั้งเมื่อ 2026-10-06: รัน `scripts/sync.ps1` แล้ว สกิล 27 ตัวใน catalogue เป็นสำเนาจริงใน `~/.claude/skills` และเป็น junction จาก `~/.agents/skills` มาที่ checkout นี้ sub-agent 6 ไฟล์ถูกเขียนใหม่ ตัวตรวจรายงาน catalogue 27 OK และ installation drift OK
- ถอดออกจากเครื่องแล้ว: `choose-stack`, `handoff-pack`, `new-request`, `ship`, สกิล Matt กลุ่ม reference 11 ตัว และ `sandbox-sdk` รายการ `mattpocock/skills` ถูกลบออกจาก lock ของ `npx skills` แล้ว จึงห้ามใช้ `npx skills update` กับ 27 ตัวนี้ (จะเขียนทับ checkout ผ่าน junction) ให้อัปเดตด้วย `git pull` แล้ว sync
- สกิลอื่นที่ติดตั้งผ่าน `npx skills`: HyperFrames 18, Cloudflare 10, `developing-with-streamlit`, `find-skills`, `requirements-clarity` รวมทั้งเครื่อง 58 ตัวต่อ harness
- Playbook guard ยังไม่ได้ติดตั้ง เครื่องไม่มี gitleaks และ Claude Code มี deny rules 0 ข้อ (เป็นงานของเกณฑ์ข้อ 4)

## หลักฐานที่ไม่มีแล้ว

ระหว่างเคลียร์เครื่องเมื่อ 2026-10-06 ถึง 2026-10-07 ผู้ใช้อนุมัติให้ลบ worktree ใต้ `D:\wt` ทั้งหมด โฟลเดอร์ `.scratch` ของทุก worktree และโฟลเดอร์งาน Codex วันที่ 2026-10-05 ผลคือ raw trace, receipt และ fixture ที่รายงานใน `evals/*-2026-10-06.md` และ STATE รุ่นก่อนอ้างถึง (`.scratch/ci/`, `.scratch/ci-failure-probe/`, `.scratch/workflow-trial/`, `.scratch/multi-ticket/`) ตรวจย้อนไม่ได้แล้ว สิ่งที่ยังตรวจได้: commit และ PR #1 ถึง #10 บน GitHub, ผล Actions ของ PR #10 และ `main`, และตัวรายงานใน `evals/` branch เดิมทุกตัวยังอยู่ทั้งในเครื่องและบน remote

## งานที่ส่งมอบแล้ว

PR #7 สถาปัตยกรรม Matt 27 active / 11 reference · PR #8 quickstart แบบอ่านจาก repo · PR #9 ทดลองหลาย ticket · PR #10 CI บน Windows (`scripts/ci-checks.ps1`, `scripts/ci-failure-probe.mjs`, `.github/workflows/repository-checks.yml`, คู่มือ `setup/repository-ci.md`) การทดลองทั้งหมดเป็นโจทย์สังเคราะห์ใน Codex ยังไม่รับรองทุกสกิลหรือทุกสภาพแวดล้อม

## ขั้นต่อไป

ผู้ใช้อ่าน `instructions/core-th.md` แล้วยืนยันหรือขอแก้ จากนั้นเลือก issue จริงขนาดจบได้ในเซสชันเดียวใน `suth-helpdesk-assets` เพื่อเริ่มเกณฑ์ข้อ 2 ด้วย Claude Code
