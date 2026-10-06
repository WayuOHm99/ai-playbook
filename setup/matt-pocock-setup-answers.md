# คำตอบตั้งต้นสำหรับ `setup-matt-pocock-skills`

ใช้กับ **repo ใหม่ที่เลือกใช้ workflow นี้แล้ว** ตาม [Matt setup](../skills/engineering/setup-matt-pocock-skills/SKILL.md) คำตอบเป็น defaults สำหรับ hospital web projects; agent ตรวจ repo จริงและใช้ constraints ของโปรเจกต์ก่อน ไม่ใช่คำสั่งให้ตั้งค่าเครื่องหรือติดตั้งสกิล

Source รุ่นใหม่ใช้ **`GLOSSARY.md`** แล้ว ตั้ง repo ใหม่ด้วยชื่อนี้ โปรเจกต์เดิมที่ใช้ `CONTEXT.md` ยังใช้ชื่อนั้นได้ตาม `docs/agents/domain.md` จนมีงานย้ายที่อนุมัติ ห้ามวน `git mv` หรือ re-run setup ในโปรเจกต์อื่นอัตโนมัติ

## วิธีใช้

เรียก `/setup-matt-pocock-skills` ใน Claude หรือ `$setup-matt-pocock-skills` ใน Codex พร้อมข้อความด้านล่าง ตรวจ drafts ก่อนเขียนและเผยแพร่ตามสิทธิ์ของ session โปรเจกต์ที่ตั้งค่าแล้วแก้เฉพาะ config docs ที่เกี่ยว ไม่ตอบ setup ใหม่ทั้งหมด

```text
ตั้ง repo นี้ด้วย Matt setup โดยใช้ defaults ต่อไปนี้ ตรวจโครงสร้างจริงก่อน ถ้าไม่เข้ากับ repo ให้บอกเหตุผลและถามเฉพาะจุดที่เปลี่ยนผลลัพธ์
- Tracker: GitHub Issues via gh ถ้ามี GitHub remote และใช้งานได้; PRs as a request surface = no สำหรับ hospital internal repo ถ้าไม่มี remote ให้เสนอ local tracker แล้วให้ฉันเลือก
- Labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix
- Domain: single-context หากเป็นหนึ่ง business domain แม้เป็น monorepo; repo ใหม่ใช้ GLOSSARY.md, ADRs ที่ docs/decisions/NNNN-title.md
- Rules: AGENTS.md เป็น canonical; CLAUDE.md มี @AGENTS.md; ปรับ ## Agent skills ใน AGENTS.md จุดเดียว
- Docs: docs/agents/issue-tracker.md, triage-labels.md, domain.md จาก source templates ที่ pinned ในคลัง
- Language: ตามภาษาของทีม; ไทยธรรมดาสำหรับ hospital team และคงชื่อ label/path/commands เป็นอังกฤษ
- แสดงร่างและคำสั่งที่จะเผยแพร่ก่อนใช้สิทธิ์เปลี่ยน tracker ไม่ติดตั้ง ไม่ย้าย docs ของ repo อื่น
```

## คำตอบแยกตามส่วน

| ส่วน | Default | เงื่อนไขที่ต้องเปลี่ยน |
|---|---|---|
| Issue tracker | GitHub via `gh`, slug จาก remote ของ repo นี้ | local/GitLab/custom เมื่อ repo กำหนด; ไม่มี remote ไม่ถือเป็นเหตุให้สร้าง GitHub repo เอง |
| PR request surface | no | ทีมต้องการรับ external contributions |
| Triage labels | ห้า roles ตาม Matt | ใช้ mapping ของทีมถ้ามีอยู่แล้ว; ไม่ force ทับ label เดิม |
| Domain layout | single-context | เลือก multi-context เมื่อมี business domains แยกจริง ไม่ใช่เพราะใช้ workspaces |
| Glossary | `GLOSSARY.md` ที่ root สำหรับ repo ใหม่ | existing configured repo ใช้ path ที่ตกลงไว้; migration ต้องมี scope แยก |
| ADR | `docs/decisions/NNNN-title.md` | repo มี ADR layout ของตัวเอง; `DECISIONS.md` ใช้เฉพาะงานเล็ก ไม่เก็บคำตัดสินซ้ำสองแห่ง |
| Steering file | `AGENTS.md`; `CLAUDE.md` = `@AGENTS.md` | รักษากฎ canonical ของ repo เดิม ปรับ block เดิมแทนสร้างซ้ำ |

| Role | ความหมายสำหรับ hospital project |
|---|---|
| `needs-triage` | feedback ดิบที่ยังไม่ประเมิน |
| `needs-info` | ต้องได้ข้อมูลจากผู้รายงาน/IT/DPO |
| `ready-for-agent` | spec และสิทธิ์ครบ; ไม่มีเรื่องข้อมูลผู้ป่วย auth migration production ที่ยังรออนุมัติ |
| `ready-for-human` | รอการตัดสินใจหรือการกระทำที่ต้องใช้สิทธิ์อื่น |
| `wontfix` | ตั้งใจไม่ทำและบันทึกเหตุผล |

เก็บ synthetic examples ใน issues อย่าใส่ข้อมูลโรงพยาบาลจริงหรือข้อมูลส่วนตัว ตรวจ visibility ของ repo เมื่อเกี่ยวกับงานนี้ การสร้าง labels/issues หรือเปลี่ยนสถานะต้องอยู่ในสิทธิ์ที่ผู้ใช้ให้ ไม่ถามซ้ำถ้าได้อนุมัติ concrete change นี้แล้ว

## Draft ที่ควรได้

```markdown
## Agent skills

### Issue tracker
Issues: <GitHub owner/repo | local tracker path | custom>. See docs/agents/issue-tracker.md.

### Triage labels
Roles: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See docs/agents/triage-labels.md.

### Domain docs
Single-context: GLOSSARY.md. ADRs: docs/decisions/. See docs/agents/domain.md.
```

Source templates อยู่ใน [setup skill directory](../skills/engineering/setup-matt-pocock-skills/SKILL.md) ปรับ `domain.md` ให้ตรง paths ที่ตกลง ไม่จำเป็นต้องสร้าง glossary/ADR ก่อนมีเนื้อหาจริง `to-spec`, `to-tickets`, `triage`, `wayfinder` อ่าน `docs/agents/*.md` ของ repo

เสร็จเมื่อ drafts สอดคล้องกับ repo, `AGENTS.md` มี config block เดียว, config docs มี paths ที่ตรงจริง และ tracker changes ที่อนุมัติถูกตรวจผล ไม่อ้างว่าติดตั้งหรือ labels พร้อมใช้โดยไม่ได้ตรวจ
