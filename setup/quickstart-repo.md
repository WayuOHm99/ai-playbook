# เริ่มใช้ playbook จาก repo

คู่มือนี้ใช้กับ checkout ของ ai-playbook ที่อ่านได้จากเครื่องหรือ environment ที่ agent ทำงานอยู่ โดยอ่านสกิลจากไฟล์โดยตรง เก็บชื่อและสิทธิ์เรียกตาม [catalogue](../skills/catalog.json) การเปิดหน้า GitHub เพียงอย่างเดียวไม่ได้ทำให้ `/ชื่อ` หรือ `$ชื่อ` ลงทะเบียนในเครื่อง

## 1. ระบุสองโฟลเดอร์และรุ่น

- **Playbook:** checkout ที่มีคู่มือนี้, `instructions/core.md` และ `skills/catalog.json` ใช้ absolute path
- **Project:** repo ของงานที่จะทำ เปิดแชทในโฟลเดอร์นี้ ให้แยกจาก playbook
- **Revision:** commit ของ playbook ที่คุณเลือกใช้ บันทึก SHA เต็ม อย่าใช้ชื่อ `main` เป็น pin ที่เปลี่ยนได้

มี checkout ที่อนุมัติแล้วให้ใช้ตัวนั้น ไม่ต้อง clone เพิ่มหรืออัปเดต checkout อื่น หากยังไม่มี ให้ขอให้ agent เตรียมเฉพาะ source checkout ใน environment ที่ต้องการก่อน โดยกำหนดตำแหน่งและรุ่น ไม่มีการติดตั้ง global skills/ตั้งค่าถาวรในคู่มือนี้

ใช้ Git ที่มีอยู่แล้วตรวจรุ่นจาก path ที่เลือก เช่น PowerShell:

```powershell
$playbookPath = '<absolute playbook checkout>'
git -C $playbookPath rev-parse HEAD
git -C $playbookPath status --porcelain=v1 --untracked-files=all
```

บันทึก SHA จากคำสั่งแรก คำสั่งที่สองต้องสำเร็จและไม่มี output หากไฟล์ค้างหรือรุ่นไม่ตรง ให้เลือก checkout สะอาดที่ตรวจแล้วหรือระบุปัญหา ไม่ reset/stash/pull/sync แทนผู้ใช้ การอัปเดต playbook เป็นอีกงานหนึ่ง ไม่เปลี่ยน pin เงียบ ๆ

## 2. ส่ง prompt เริ่มต้นในแชทใหม่

แทนค่า `<...>` ทุกจุดก่อนส่ง prompt นี้ ใช้ได้ทั้ง Codex และ Claude ที่อ่านไฟล์กับ Git ได้ Claude Code ใช้กับงานจริงแล้ว 2026-10-07 (ดู [chain trial](../evals/chain-trial-2026-10-07.md)) แต่ยังไม่ได้ทดสอบโหมดอ่านจาก repo นี้กับ Claude โดยตรง

```text
เริ่มใช้ ai-playbook แบบอ่านจาก repo ในโปรเจกต์นี้
Project root: <absolute project repo>
Playbook root: <absolute playbook checkout>
Playbook revision: <full commit SHA from the selected checkout>

ขอใช้ ask-matt จากไฟล์ใน playbook ที่ระบุ เริ่มแบบอ่านอย่างเดียว:
1. ตรวจ Git HEAD ของ playbook ให้ตรง revision และตรวจว่า checkout สะอาด คำสั่งต้องสำเร็จ หาก path/รุ่นไม่ตรงหรือไฟล์ค้าง ให้รายงาน BLOCKED และหยุดก่อนแก้ไฟล์ ห้ามเปลี่ยนไปใช้สกิลที่ติดตั้งไว้แทน
2. อ่าน instructions/core.md, instructions/working-style.md, skills/catalog.json และไฟล์ ask-matt ที่ catalogue ระบุจาก checkout นี้ รวม sibling reference เมื่อเกี่ยวข้อง
3. อ่าน AGENTS.md, STATE.md และ ticket/spec ของ Project root ถ้ามี ตรวจ branch/status/worktrees ความขัดกันระหว่าง binding ใน AGENTS กับ prompt นี้ต้องให้ฉันตัดสินใจก่อนเขียน ไม่ทับกฎเดิม
4. สรุปสั้น ๆ ว่าอ่านจาก path/SHA ใด โปรเจกต์ตั้งค่า tracker/domain แล้วหรือยัง งานได้รับอนุมัติแค่ไหน และแนะนำขั้นถัดไปหนึ่งอย่าง

ตอนเริ่มยังไม่แก้ไฟล์ ไม่ติดตั้ง/sync ไม่เปลี่ยน global settings ไม่อ่าน private notes หรือ real histories และไม่ส่งอะไรไปภายนอก ชื่อสกิล User-invoked เป็นคำแนะนำให้ฉันเรียกต่อเอง
สิ่งที่อยากทำ: <goal or ticket/spec path>
```

ขั้นนี้ผ่านเมื่อ path/SHA ตรง, checkout สะอาด, อ่าน policy/style/catalogue/ask-matt สำเร็จ และคำแนะนำอ้างงานจริง โดยยังไม่มีการแก้ไฟล์

## 3. เตรียมโปรเจกต์หรือทำ ticket ที่พร้อมแล้ว

**โปรเจกต์ใหม่:** ขอใช้ `setup-matt-pocock-skills` จาก bound catalogue เพื่อร่าง tracker, triage labels และ domain config หลังจากเลือก defaults และอนุมัติไฟล์ที่จะสร้างแล้วจึงเขียน ตัวอย่างขั้นต่ำอยู่ที่ [repo-only starter](../templates/repo-only/README.md) เป็นข้อมูลตั้งต้น ไม่ใช่คำสั่งให้คัดลอกทับทุกโปรเจกต์

**โปรเจกต์ตั้งค่าแล้ว:** เก็บ tracker/กฎ/domain paths ที่มีอยู่ ถ้า ticket ระบุขอบเขตและเกณฑ์พร้อมแล้ว ใช้ prompt ต่อไป ไม่ต้องกลับไป setup หรือซักถามข้อที่ตอบแล้ว:

```text
ขอใช้ implement จาก bound catalogue ทำ ticket <path or approved issue>
Project root: <absolute project repo>
Playbook root: <same checkout>
Playbook revision: <same full SHA>
Do: <allowed behavior/files; new tests; project STATE/bookkeeping>
Don't: <explicit exclusions>
Done when: <observable acceptance criteria and verify command>
Approval: อนุมัติ ticket และ seam ตามเกณฑ์นี้แล้ว ทำต่อเองในขอบเขต รวม local feature commits
Delivery: <local reviewed candidate only | feature push + PR to the named project remote>

ตรวจ binding/HEAD/ความสะอาดของ playbook ตาม prompt เริ่มต้นอีกครั้ง แล้วอ่าน implement/tdd/code-review จาก catalogue ของ checkout นี้โดยตรง ใช้ Skill tool เฉพาะเมื่อ registered source ตรงกับ binding
รักษางานเดิมของผู้อื่นและ existing tests ข้อมูลทดสอบเป็น synthetic ตรวจ acceptance จริง อัปเดต state แล้ว commit ทุกไฟล์ก่อน capture/review ตาม core; แก้ review ภายในสองรอบและตรวจ SHA ก่อน delivery
รายงานภาษาไทยพร้อมหลักฐานและสิ่งที่ยังไม่ทดสอบ การ merge/deploy/ติดตั้ง/global settings ต้องมีสิทธิ์เฉพาะของมัน
```

ถ้าเป็นไอเดียที่ยังไม่ตกลง ให้ใช้ `grill-with-docs` → `to-spec` → `to-tickets` ตาม `ask-matt` ก่อนถึง implement ไม่ใช้ตัวอย่าง starter แทน spec ของงานจริง

## 4. รับงานและเริ่มวันต่อไป

ตรวจผลจริงตาม ticket, ผล verify และ commit ที่ตรวจแล้ว อ่าน [core](../instructions/core.md) สำหรับ candidate/permissions/handoff ใช้ `handoff` จาก catalogue เมื่อเปลี่ยน agent หรือพักงาน บันทึก STATE/HANDOFF ที่ commit แล้วพร้อม branch/SHA/next action และสถานะ push/access

แชทใหม่อ่าน checkpoint แล้วตรวจ Git กับ fast test อีกครั้ง ก่อนทำต่อ ให้ใช้ playbook path/revision เดิม ถ้า checkout รุ่นนั้นไม่อยู่แล้ว ให้รายงานปัญหาแทนเลือกสกิลเก่าที่ติดตั้งไว้

## สิ่งที่ต้องรู้

- วิธีนี้เป็น source-only invocation ไม่พิสูจน์ว่าคำสั่ง slash/$ ถูกลงทะเบียน หรือการเลือกสกิลอัตโนมัติในเครื่องทำงาน
- Local Markdown tracker ที่ใช้ `.scratch/` เป็นข้อมูลในเครื่องและปกติถูก ignore หากเปลี่ยนเครื่อง/ผู้รับ ต้องมีวิธีส่ง spec/ticket และ evidence ที่อนุมัติไว้ หรือเลือก tracker แบบ durable ก่อนบอกว่าส่งต่อได้
- หาก environment กัน Git writes/เปิดโปรแกรมลูก ให้รายงานคำสั่งและข้อจำกัดตามจริง ห้ามปิด sandbox/ขยายสิทธิ์หรือเปลี่ยนการตั้งค่าถาวรเอง
- การรันทดสอบอาจใช้โควตา AI ตามเครื่องมือที่เลือก อย่าให้ความล้มเหลวจาก auth/limit/timeout กลายเป็น PASS
- ผลทดลองคู่มือนี้กับขอบเขตที่พิสูจน์ได้อยู่ใน [quickstart trial](../evals/quickstart-trial-2026-10-06.md)
