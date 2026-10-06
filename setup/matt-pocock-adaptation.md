# ใช้ Matt เป็นโครงหลัก แล้วเติมกติกาของผู้ใช้จุดเดียว

ตัดสินใจ: 2026-10-06 ตามขอบเขตล่าสุดของผู้ใช้ แผนลดเหลือห้าสกิลเดิมถูกแทนที่ทั้งหมด ใช้ 27 main skills ของ Matt ใน `skills/engineering/` และ `skills/productivity/` เป็นชุดหลัก เก็บ 11 experimental/misc เป็น source อ้างอิงเท่านั้น ดู [snapshot record](skills-lock.md)

## เหตุผลและผลที่เห็นได้

Matt มี flow ต่อเนื่องตั้งแต่คำถาม → spec → tickets → implementation → review → PR → retro และมีวิธีจัด phase/context อยู่แล้ว การใช้ชื่อเดิมช่วยให้เอกสารต้นทาง การเรียกสกิล และคำแนะนำของ `ask-matt` ตรงกัน จึงเลิกใช้ `new-request`, `choose-stack`, `ship`, `handoff-pack` เป็นทางเข้าหลัก ไม่สร้าง router หรือ implementation loop แข่งกับ Matt

สูตร stack, feasibility gate, release/restore และ handover ยังมีประโยชน์ จึงเก็บเป็น references ใน [stacks](../stacks/README.md), [prompts](../prompts/README.md) และ [templates](../templates/project/README.md) แต่ละโปรเจกต์ตัดสินใจว่าจะใช้ส่วนไหนตามขอบเขตและระดับงาน

กฎของผู้ใช้อยู่ใน [core](../instructions/core.md) และ [working style](../instructions/working-style.md) จากบทสนทนานี้: พูดไทยธรรมดา เห็นด้วยหรือค้านได้พร้อมเหตุผล ตรวจข้อเท็จจริง ทดสอบตามงาน แสดงหลักฐาน และทำต่อเองภายในสิทธิ์ที่ให้แล้ว ข้อความในสกิลแต่ละตัวเพิ่มเฉพาะ pointer และ adjustment ที่จำเป็น ไม่คัดกฎยาวลงทุกสกิล

## สิทธิ์การเรียกคงตาม Matt ทั้ง 27 ตัว

**User** = ผู้ใช้เรียกเอง: Claude `/name`, Codex `$name` (`disable-model-invocation: true` / `allow_implicit_invocation: false`) **Model** = agent ใช้ตามบริบทได้ รวมทั้งผู้ใช้เรียกตรง ชื่อและ invocation role ไม่ถูกลดเป็น manual ทั้งหมดเพื่อประหยัด listing budget

| Skill | Role | สิ่งที่ใช้จาก Matt / ค่าตั้งต้นในคลังนี้ |
|---|---|---|
| `ask-matt` | User | router หลัก ให้เส้นทางตามสถานการณ์; ใช้ phase boundaries ของ Matt |
| `grill-with-docs` | User | ซักถามใน repo พร้อมปรับ `GLOSSARY.md`/ADR; ข้อเท็จจริงค้นได้ไม่ถามผู้ใช้แทนการตรวจ |
| `triage` | User | issue role state machine สำหรับ incoming issues; ไม่ triage tickets ที่สร้างพร้อมทำแล้วซ้ำ |
| `improve-codebase-architecture` | User | เสนอ deepening opportunities เป็น HTML แล้วเลือกหนึ่งเรื่อง; ไม่แก้ทุกเรื่องที่พบเอง |
| `setup-matt-pocock-skills` | User | ตั้ง issue tracker/labels/domain layout; ใช้ [คำตอบตั้งต้น](matt-pocock-setup-answers.md) แบบมีเงื่อนไขต่อ repo |
| `to-spec` | User | แปลงบทสนทนาเป็น spec ที่ครบ; draft/publish ตามสิทธิ์ที่มี |
| `to-tickets` | User | tracer-bullet tickets พร้อม blocking edges; tracker จริงหรือ local ตามที่ repo เลือก |
| `implement` | User | ทำ ticket/spec ใน session แล้ว `tdd` → commit verified candidate → `code-review`; ใช้ worktree และหลักฐานตาม core |
| `implement-spec` | User | task graph, ready frontier, implementer subagents, integration branch; ownership ชัดและไม่ทับงานคนอื่น |
| `wayfinder` | User | decision map สำหรับงานใหญ่ที่ยังคลุมเครือ; กลับเข้า `to-spec` ก่อน build |
| `retro` | User | เสนอปรับ environment หลังงานจากหลักฐานที่อนุญาต; ไม่อ่านประวัติจริงหรือ private notes อัตโนมัติ |
| `prototype` | Model | ต้นแบบเล็กตอบคำถามเดียว เก็บเป็น primary source; ใช้ข้อมูลสังเคราะห์และฐาน local |
| `diagnosing-bugs` | Model | feedback loop → minimise → hypothesis → instrument → fix → regression; fix ภายใน scope ที่ให้แล้ว |
| `research` | Model | background research จาก primary sources เป็นไฟล์มี citation/date; privacy ตาม core |
| `tdd` | Model | red-green-refactor ทีละ vertical slice ผ่าน interface; seam มาจาก spec/ticket ที่ตกลง |
| `domain-modeling` | Model | ทำคำศัพท์ให้คมและบันทึก ADR; repo ใหม่ใช้ `GLOSSARY.md` |
| `codebase-design` | Model | vocabulary ของ deep modules/interfaces/seams; ไม่กำหนด stack ตายตัว |
| `code-review` | Model | review Standards + Spec เป็น subagents เทียบ fixed base; ใช้ candidate SHA และรอบแก้ตาม core |
| `pr` | Model | summary ที่เล็กพอ + evidence + merge danger; ชื่อสกิลไม่ได้ให้สิทธิ์ merge/deploy |
| `wizard` | Model | ช่วยอธิบายขั้นที่ต้องให้มนุษย์ทำ; การรันที่แตะ secret/infra/CI ใช้สิทธิ์เฉพาะตาม core |
| `grill-me` | User | ซักถามเมื่อไม่มี repo; ไม่บันทึก domain docs เอง |
| `handoff` | User | ส่งต่อ context แบบอ้าง artifact ที่มีอยู่และ redact ข้อมูล; checkpoint ของ repo ต้อง commit ตาม core |
| `teach` | User | สอนหลาย session ใน workspace ของบทเรียน; ไทยธรรมดาตาม working style |
| `to-questionnaire` | User | ร่างคำถามสำหรับคนที่มีข้อมูล; ไม่ส่งข้อความภายนอกโดยไม่ได้สั่ง |
| `wait-what` | User | อธิบายใหม่เมื่อไม่เข้าใจ โดยใช้คำใน `GLOSSARY.md`; ไทยธรรมดาในบทสนทนากับผู้ใช้ |
| `grilling` | Model | primitive ซักถามภายใต้ named skills; ถามการตัดสินใจของคน ตรวจ facts เอง |
| `writing-for-agents` | Model | เขียนกฎและเอกสารให้อ่านเท่าที่ต้องใช้; ชี้กฎกลาง ไม่ทำสำเนากติกาหลายชุด |

รวม 20 Engineering + 7 Productivity = 27 primary: 16 User, 11 Model ส่วน experimental/misc 11 ตัวใน frozen source ไม่อยู่ใน active catalogue และไม่ sync/install เป็นชุดหลัก

## Narrow adjustments ที่จำเป็น

- **Scope และ approval:** ทำงานที่อนุมัติแล้วให้จบ ไม่ถามซ้ำทุกขั้น Draft issue/label ก่อนการเผยแพร่ที่ยังไม่ได้สั่ง; production, merge/main, migration, secrets, dependencies/CI/hooks และข้อมูลส่วนตัวใช้กฎกลาง การเผยแพร่ทุกชนิดยึดสิทธิ์ที่ระบุจริง
- **Verified candidate:** ตรวจรับที่ commit SHA ชัดเจน พร้อมผลคำสั่ง/acceptance evidence ถ้า diff เปลี่ยน SHA หลังตรวจ ต้องเช็กใหม่ตามผลกระทบ ก่อน push เช็ก HEAD และสถานะจริง; ไม่ส่งงานที่เพียงเชื่อคำกล่าวว่าเขียว
- **Handoff:** คงสกิล `handoff` ของ Matt และเนื้อหาที่กระชับ/portable เพิ่ม committed checkpoint (`STATE.md` + `HANDOFF.md`, ขอบเขต/หลักฐาน/สิทธิ์/next step) เพื่อข้าม harness ได้ ผู้รับ revalidate repo; temp handoff ของต้นทางไม่พอเป็น state ถาวร
- **Privacy:** เก็บ private-note files ทั้งหมดเดิมโดยไม่แก้ ไม่ลบ และไม่อ่านเพื่อดึง traits ตัดลิงก์ภายนอกและ automatic reads ออกทั้งหมด Retro และ research ใช้หลักฐานของงานที่ได้รับอนุญาต ไม่ค้นจริงในประวัติการสนทนาหรือบันทึกส่วนตัวโดยปริยาย
- **Project constraints:** templates เติม tier, hosting, data access, verification และ handover ตามที่ยืนยันจริง ไม่ย้ายกฎโรงพยาบาลไปใช้กับทุกโปรเจกต์โดยอัตโนมัติ

## ขอบเขตของการเปลี่ยนครั้งนี้

เป็น repo-only snapshot และ documentation/catalogue refactor: pinned latest upstream commit `6fd947921b935b7e1e69293a200400f0fdd5c15f`, package/release `1.3.1` พร้อม main fixes ที่ commit นี้มี ไม่ใช้เลข package เป็นหลักฐานว่า source ทุกไฟล์ตรง release tag

ไม่มีการติดตั้ง อัปเดต installed lock ย้าย installed folders เปลี่ยน dependencies/CI/hooks/global settings อ่าน real histories หรืออัปเดต local main การ sync/install และการย้าย domain docs ของโปรเจกต์อื่นเป็นอีกงานหนึ่ง ห้ามสั่ง migration ข้าม repo ตามเอกสารนี้เอง

ผลทดสอบใหม่และข้อจำกัดรายงานใน [workflow trial 2026-10-06](../evals/workflow-trial-2026-10-06.md) เทียบกับ legacy evals อย่างชัดเจน เอกสารวิจัยเก่าคงวันที่/ข้อเท็จจริงที่พบตอนนั้น พร้อมป้ายเลิกใช้คำสั่งเก่า ไม่ใช้ประวัติรุ่นห้าสกิลเป็น proof ของ 27-skill flow
