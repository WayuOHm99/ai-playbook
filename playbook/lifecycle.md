# วงจรงานหลักของ Matt: จากไอเดียถึง PR

ใช้ `/ask-matt` เมื่อไม่แน่ใจว่าจะเริ่มตรงไหน ใน Codex ใช้ `$ask-matt` ชื่อสกิลและสิทธิ์การเรียกตาม Matt; กฎเรื่องขอบเขต การอนุมัติ หลักฐาน และข้อมูลส่วนตัวอยู่ที่ [core](../instructions/core.md) กับ [working style](../instructions/working-style.md)

```text
ask-matt → grill-with-docs → to-spec → to-tickets
                     ↑ research / prototype ช่วยตอบคำถาม
          → implement ทีละ ticket หรือ implement-spec ทั้ง task graph
          → tdd → code-review → pr → retro
```

งานที่จบใน session เดียวไปจากการซักถามสู่ `implement` ได้ ไม่ต้องสร้าง spec และ tickets เพื่อทำให้ขั้นตอนครบ งานหลาย session ใช้ `to-spec` แล้ว `to-tickets` เพื่อให้แต่ละ ticket ทำต่อจากไฟล์ได้เอง

| ช่วงงาน | ใช้สกิล | ผ่านเมื่อ |
|---|---|---|
| ตั้งค่า repo ครั้งแรก | `setup-matt-pocock-skills` + [คำตอบตั้งต้น](../setup/matt-pocock-setup-answers.md) | ตกลง issue tracker, triage labels และที่เก็บ domain docs แล้ว; แสดงร่างก่อนเขียนหรือเผยแพร่ |
| หาเส้นทาง | `ask-matt` | รู้คำถามที่ต้องตอบและ flow ที่เหมาะ โดยยังไม่ขยายขอบเขต |
| ทำความต้องการให้ชัด | `grill-with-docs` ใน repo, `grill-me` เมื่อนอก repo | ความหมายตรงกัน ขอบเขตชัด มี `GLOSSARY.md`/ADR ตามที่จำเป็น; ตรวจ feasibility ก่อนออกแบบ |
| ตอบคำถามที่ค้นได้ | `research` | สรุปจากแหล่งหลักพร้อม URL/วันที่; ข้อที่ยังยืนยันไม่ได้ติด UNVERIFIED |
| ตอบคำถามที่ต้องเห็นหรือรัน | `prototype` | ตอบคำถามเดียวด้วยต้นแบบเล็ก ข้อมูลสังเคราะห์; เก็บต้นแบบเป็นหลักฐาน ไม่ยกโค้ดทดลองเป็นระบบจริงทันที |
| ตกลงงานหลาย session | `to-spec` | มีผลลัพธ์ ขอบเขต สิ่งที่ไม่ทำ เกณฑ์รับงาน และวิธีตรวจ; การเผยแพร่ตามสิทธิ์ที่ผู้ใช้ให้ |
| แบ่งงาน | `to-tickets` | ticket เป็นแนวตั้ง ตรวจได้เอง และระบุ blocking edges; tickets ชุดนี้ไม่ต้องผ่าน triage ซ้ำ |
| ลงมือ | `implement` ทีละ ticket หรือ `implement-spec` ทั้ง spec | ทำใน worktree/feature branch ตามขอบเขต; `implement-spec` แบ่ง ownership ให้ implementers และรวมบน integration branch |
| พิสูจน์พฤติกรรม | `tdd` และการตรวจในแอปตาม ticket | test แดงเพราะพฤติกรรมที่ขาด แล้วเขียวหลังแก้; เกณฑ์รับงานมีผลจริง ไม่สร้างเทสที่เพียงคัดลอก implementation |
| ตรวจ diff | `code-review` | ตรวจ Standards + Spec เทียบฐานที่ระบุ; แก้ข้อขวางและรันเช็กอีกครั้งเมื่อมี diff ใหม่ |
| ส่งให้ตรวจ | `pr` | PR มีภาพรวมที่เล็กพอ หลักฐาน before/after และ merge danger; ระบุ SHA ที่ตรวจจริงและเช็ก HEAD/สถานะก่อน push ตาม core |
| เรียนรู้หลังงาน | `retro` | ได้ข้อเสนอปรับสภาพแวดล้อมจากหลักฐานของงานนี้; การแก้เครื่องมือ กฎส่วนกลาง หรือ hooks ต้องมีสิทธิ์ตาม core |

งานเข้าจากผู้ใช้ภายนอกผ่าน `triage` ก่อน: เป็น state machine ของ issue roles ไม่ใช่ router อีกตัว ดู [triage](triage.md) งานบั๊กที่หาสาเหตุยากใช้ `diagnosing-bugs` งานใหญ่ที่ยังมองเส้นทางไม่ออกใช้ `wayfinder` เพื่อทำ decision map แล้วกลับมา `to-spec` ก่อน build งานปรับสถาปัตยกรรมใช้ `improve-codebase-architecture` เพื่อเลือกเรื่องหนึ่งแล้วเข้า flow หลัก

## ขอบเขตกับระดับงาน

เลือก demo / ใช้ภายใน / ใช้จริงจากข้อมูล ผู้ใช้ ที่รัน และผู้ดูแล ตาม [hospital reference](../stacks/hospital-web.md) ระดับงานกำหนดหลักฐานที่ต้องมี เช่น backup, audit log, restore drill และเอกสารส่งมอบ ไม่ได้อนุมัติให้แตะ production หรือข้อมูลผู้ป่วย

การติดตั้ง dependency/skills การแก้ CI/hooks การเผยแพร่ issue/PR การ merge และ deploy ใช้กฎกลางและสิทธิ์ที่ให้ไว้ใน session เดิม อย่าถามซ้ำเมื่อสิทธิ์ครอบคลุมแล้ว อย่าใช้ชื่อสกิลเป็นสิทธิ์ทำเรื่องอื่น

## Context และส่งต่อ

เก็บการซักถาม → spec → tickets ในบริบทต่อเนื่องเท่าที่คุณภาพยังดี จากนั้น `implement` แต่ละ ticket เริ่มใหม่ได้ `implement-spec` ใช้ task graph และ subagents ภายใน flow ของมัน ระหว่าง phase ใช้ต้นไม้ตัดสินใจของ `ask-matt` ว่าควร continue, clear, handoff, delegate หรือ compact

เมื่อเปลี่ยน harness/directory/ผู้รับ ใช้ Matt `handoff` พร้อม [checkpoint policy ใน core](../instructions/core.md): สถานะต่อเนื่องอยู่ใน `STATE.md` และ `HANDOFF.md` ที่ commit บน branch ของงาน รายงาน SHA หลักฐาน ขอบเขต สิ่งที่ยังไม่ตรวจ และสิทธิ์ที่มี ผู้รับตรวจ repo จริงก่อนทำต่อ ดู [prompt ส่งต่อ](../prompts/07-handoff-delivery.md)

## หลัง PR

การ deploy, migration และ handover ใช้ recipes ใน [prompts/07](../prompts/07-handoff-delivery.md) กับ [templates](../templates/project/README.md) เมื่อ project ต้องการ เป็นงานปลายทางตามขอบเขต ไม่ใช่สกิล router ใหม่ Guard ของ playbook ยังไม่ได้ติดตั้ง ดู [สถานะ guard](../guardrails/README.md) ก่อนพึ่งกลไกบล็อกใด ๆ

หลักฐานการทดลอง architecture ใหม่นี้อยู่ที่ [workflow trial 2026-10-06](../evals/workflow-trial-2026-10-06.md) งานวิจัยและ eval รุ่นห้าสกิลเป็นประวัติ ไม่ใช่ผลทดสอบ flow นี้
