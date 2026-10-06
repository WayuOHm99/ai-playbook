# ai-playbook

คลังขั้นตอนทำงานกับ AI ใช้ **27 สกิลหลักของ Matt Pocock / AI Hero** เป็นแกน แล้วเติมวิธีทำงานของผู้ใช้ใน [core policy](instructions/core.md) และ [working style](instructions/working-style.md) เริ่มที่ [00-start-here.md](00-start-here.md) หรือ `ask-matt`

สำหรับใช้จาก repo โดยไม่ติดตั้ง: [quickstart พร้อม prompt](setup/quickstart-repo.md) ตรวจ path/commit ก่อนทำงาน และมี [starter ขั้นต่ำ](templates/repo-only/README.md) สำหรับ repo ใหม่

เส้นทางหลัก: `ask-matt` → `grill-with-docs` (+ `research`/`prototype` เมื่อจำเป็น) → `to-spec` → `to-tickets` → `implement` หรือ `implement-spec` → `tdd` → `code-review` → `pr` → `retro` งานเล็กที่มีเกณฑ์พร้อมแล้วเริ่มที่ `implement` ได้

ต้นฉบับตรวจวันที่ 2026-10-06: package/release **1.3.1 พร้อม main fixes** ที่ commit `6fd947921b935b7e1e69293a200400f0fdd5c15f` เก็บ source ครบ 38 สกิล; 27 ตัวหลักอยู่ใน catalogue และ 11 experimental/misc เป็น reference เท่านั้น [หลักฐานแหล่งที่มา](upstream/matt-pocock/README.md) · [เหตุผลและผลกระทบการปรับ](setup/matt-pocock-adaptation.md) · [AI Hero](https://www.aihero.dev/skills)

| ส่วน | หน้าที่ |
|---|---|
| [skills](skills/README.md) | 27 ตัวหลัก แบ่ง Engineering/Productivity; ชื่อและสิทธิ์เรียกตาม Matt |
| [instructions](instructions/core.md) | กฎกลางและวิธีสื่อสาร อ่านเมื่อเรียกสกิลหรือขอให้ใช้; [ฉบับไทย 1 หน้าสำหรับเจ้าของงาน](instructions/core-th.md) |
| [playbook](playbook/lifecycle.md), [prompts](prompts/README.md) | คู่มือเส้นทางเดียวกับ Matt และ prompt ไทย |
| [stacks](stacks/README.md), [templates](templates/project/README.md) | constraints, feasibility, เอกสารโครงการ/ส่งมอบ ตามบริบทงาน |
| [setup](setup/matt-pocock-setup-answers.md), research | คำตอบเริ่มต้นและข้อมูลวิจัยที่มีวันที่; ข้อมูลเก่ามีป้าย historical |
| [scripts](scripts/README.md), [evals](evals/README.md) | ตรวจ source/catalogue, candidate, privacy และผลทดสอบพร้อมขอบเขต |
| agents, guardrails | ตัวช่วยที่สกิลใช้และ guard แบบเลือกเปิดเอง |

สถานะการติดตั้งบนเครื่องของผู้ใช้และงานที่อนุมัติอยู่ ดูที่ [STATE.md](STATE.md) (ติดตั้งด้วย sync เมื่อ 2026-10-06) ไฟล์ส่วนตัวเดิมเก็บครบ แต่ถูกตัดออกจากเส้นทางการอ่านและเชื่อมโยงของ workflow

เรียกใน Claude ด้วย `/ชื่อ` และ Codex ด้วย `$ชื่อ` เมื่อสกิลรุ่นนั้นถูกลงทะเบียนแล้ว การเปิด checkout นี้ไม่ได้ทำให้สกิลในเครื่องเป็นรุ่นใหม่เอง สำหรับอ่านจาก repo ให้ระบุ `Playbook root: <absolute checkout>` ใน AGENTS ของงาน แล้วขอให้อ่านสกิลตาม [catalogue](skills/catalog.json) ตัวที่ User-invoked ต้องให้ผู้ใช้เรียก; ตัว Model-invoked ใช้ตามบริบทได้ตามสิทธิ์ที่อนุมัติ

การอัปเดตสกิลในเครื่องทำด้วย `git pull` แล้วรัน [สคริปต์ sync](scripts/README.md) ซึ่งต้องเป็นงานติดตั้งที่อนุมัติแยก ตรวจผลกระทบและไฟล์ชื่อซ้ำก่อนใช้ อย่าใช้ `npx skills update` กับสกิลชุดนี้ ผลกับงานจริงอยู่ใน [real-work trial](evals/real-work-trial-2026-10-07.md) และ [chain trial](evals/chain-trial-2026-10-07.md) (ทั้งสองผ่านแบบมีข้อจำกัด) ผลทดลองสังเคราะห์ของโครงสร้างอยู่ใน [workflow trial](evals/workflow-trial-2026-10-06.md)
