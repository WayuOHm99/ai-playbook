# เริ่มที่นี่

จำชื่อเดียว: **`ask-matt`** ให้ช่วยเลือกเส้นทางและขั้นถัดไปตามสถานการณ์ สกิลนี้แนะนำให้คุณเรียกสกิล User-invoked ต่อเอง

เริ่มแบบไม่ติดตั้งสกิล: ใช้ [คู่มือพร้อม prompt สำหรับแชทใหม่](setup/quickstart-repo.md) เพื่อระบุ checkout/commit ให้ถูกตัว และ [ตัวอย่างโปรเจกต์ขั้นต่ำ](templates/repo-only/README.md) เมื่อเริ่ม repo ใหม่

Claude ใช้ `/ชื่อ` และ Codex ใช้ `$ชื่อ` เมื่อรุ่นนั้นลงทะเบียนแล้ว หากใช้จาก checkout โดยตรงให้ระบุ `Playbook root: <absolute checkout>` และขอให้อ่านไฟล์จาก [catalogue](skills/catalog.json) การเปลี่ยนใน repo ไม่อัปเดตสกิลในเครื่องอัตโนมัติ

| สถานการณ์ | เส้นทางที่แนะนำ |
|---|---|
| ตั้ง repo สำหรับ Matt ครั้งแรก | `setup-matt-pocock-skills` + [คำตอบตั้งต้น](setup/matt-pocock-setup-answers.md) |
| มีไอเดียใหม่/requirement | `ask-matt` → `grill-with-docs` → `to-spec` → `to-tickets` |
| เลือก stack/ข้อเท็จจริงยังไม่ชัด | `research` → `grill-with-docs`; ใช้ [constraints/feasibility](stacks/README.md) ก่อน ADR |
| ต้องเห็นของจริงเพื่อตัดสินใจ | `prototype` ตอบคำถามเดียว แล้วนำผลกลับเข้า spec |
| ticket พร้อมทำ | `implement` ใช้ `tdd` และ `code-review`; ทั้ง spec/task graph ใช้ `implement-spec` |
| incoming bug/feedback | `triage` → brief พร้อมทำ; บั๊กยากใช้ `diagnosing-bugs` |
| ไอเดียเพิ่มกลาง ticket | append BACKLOG แล้วทำ ticket เดิมต่อ |
| งานใหญ่ยังไม่รู้ทาง | `wayfinder` → `to-spec` เมื่อ decision map ชัด |
| ตรวจ diff/จะส่ง PR | `code-review` กับ committed candidate → `pr` หลังผ่าน gate |
| เปลี่ยน agent/พักงาน | `handoff` พร้อม committed STATE/HANDOFF และสถานะ push/access |
| เรียนรู้หลังจบงาน | `retro` จาก conversation/summary ที่อนุญาต; exported history ผ่าน human review |
| อธิบายยังไม่เข้าใจ | `wait-what` |
| deploy/ส่งมอบ IT | [prompt ส่งมอบ](prompts/07-handoff-delivery.md) + [templates](templates/project/README.md); สิทธิ์ตาม core |

วิธีสื่อสารและขอบเขตการอนุมัติอยู่ที่ [core](instructions/core.md) และ [working style](instructions/working-style.md) การอนุมัติเดิมใช้ต่อในขอบเขตเดิมได้ ผลทดสอบต้องแยกสิ่งที่ผ่าน สิ่งที่ยังไม่ครบ และสิ่งที่ไม่ได้ทดสอบ

ดู [รายชื่อ 27 สกิล](skills/README.md), [วงจรงาน](playbook/lifecycle.md), [เหตุผลการย้าย](setup/matt-pocock-adaptation.md) และ [ผลทดสอบ](evals/workflow-trial-2026-10-06.md) โครงสร้างนี้คงไฟล์ส่วนตัวไว้แต่ไม่มีการอ่านหรือเชื่อมโยงจาก workflow
