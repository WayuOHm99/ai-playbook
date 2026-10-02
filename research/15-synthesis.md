# 15 — สรุปรวม: วิธีทำงานกับ AI agent ของคุณควรเป็นแบบไหน (2026-10-02)

สรุปจาก `research/01` ถึง `14`, แชทของคุณ 600 กว่าเซสชัน (`_inbox/history-notes`) และผลทดสอบจริงในเครื่อง
ผลทดสอบที่ใช้ได้แก่ `/ship` กับงานการ์ด KPI, `/new-request`, `/handoff-pack` ข้ามระหว่าง Claude กับ Codex, `/retro`, `/choose-stack` และ trigger evals

แหล่งข้อมูลหลัก:
- Anthropic: docs, engineering blog, SDLC security post
- OpenAI: Codex docs, custom review rules, auto-review
- Matt Pocock: aihero.dev และ `mattpocock/skills`
- ชุมชน: superpowers, Trail of Bits, retro-skill, addyosmani/agent-skills
- มาตรฐาน: agentskills.io

ความเห็นของผมเอง (ไม่ได้มาจากแหล่งข้อมูล) ติดป้าย **[สรุปเอง]**

---

## หลัก 5 ข้อที่ทุกแหล่งเห็นตรงกัน

1. **ตรวจได้สำคัญกว่าสั่งเก่ง**
   - agent ทำงานเองได้เท่าที่มี test, typecheck, hook หรือแอปจริงคอยตรวจ (Anthropic, OpenAI, Matt)
   - คำสั่งในไฟล์เป็นแค่คำขอ ส่วน hook และสคริปต์บังคับได้จริง (Anthropic steering post, aihero hooks)
2. **สั้นและเฉพาะที่จำเป็น**
   - `CLAUDE.md` / `AGENTS.md` ควรสั้นกว่า 200 บรรทัด และควรมีเจ้าของรับผิดชอบ
   - ขั้นตอนละเอียดไปไว้ในสกิล กฎที่ต้องเกิดแน่ๆ ใช้ hook
   - สกิลยิ่งเยอะ agent ยิ่งเลือกสกิลที่ถูกได้แย่ลง (Anthropic enterprise, Matt `/init`, OpenAI nested AGENTS.md)
3. **คุยให้เข้าใจตรงกันก่อนลงมือ แล้วเขียนการตัดสินใจลงไฟล์ก่อนล้าง context**
   - ใช้ grill, spec แบบมี "ไม่ทำอะไร" และ glossary (Matt, Anthropic "interview then fresh session")
4. **คนเขียนกับคนตรวจต้องแยกกัน**
   - ใช้ reviewer ที่ไม่ได้เขียนโค้ดนั้น ถ้าเป็นคนละค่ายยิ่งดี เลือก precision ก่อน recall และจำกัดจำนวนรอบ (OpenAI review, Anthropic multi-reviewer)
5. **คุมความเสี่ยงที่ระดับ environment ไม่ใช่หวังให้โมเดลเชื่อฟัง**
   - ใช้ sandbox, egress, deny rule และแบ่งระดับความเสี่ยง (Anthropic containment, OpenAI monitoring)
   - hook ที่จับจากข้อความคำสั่งเป็นแค่ลูกระนาด เพราะ agent หลบด้วย base64 ได้

---

## แต่ละส่วนควรเป็นยังไง

| ส่วน | ตอนนี้ | ควรเป็น | สถานะ |
|---|---|---|---|
| **กฎกลาง** (`instructions/core.md`) | ~75 บรรทัด มีการคัดแยก P0–P7, hard stop 9 ข้อ, รายงาน 8 หัวข้อ | เหมือนเดิม และเพิ่ม 1 ข้อ: **ถ้า hook, sandbox หรือ reviewer บล็อก ให้หยุดและรายงาน ห้ามหาทางอ้อม** (14 §6.8) | ⏳ เพิ่มได้เลย |
| **ขั้นตอนประจำวัน** | กระจายอยู่ในตารางสถานการณ์ | เป็น **flow เดียว** แล้วบอกว่าเมื่อสกิลซ้อนกันให้ใช้ตัวไหน (13 §6) | ⏳ เพิ่มใน `00-start-here.md` ได้เลย |
| **สกิลของคลัง** | `new-request`, `ship`, `handoff-pack`, `retro`, `choose-stack` | คงไว้ 5 ตัว ทุกตัวผ่านการทดสอบจริงแล้ว | ✅ |
| **สกิลของ Matt** | ติดตั้ง 35 ตัว ส่วนใหญ่ถูกเรียกอัตโนมัติได้ | ใช้ทุกวัน: grill-with-docs, tdd, diagnosing-bugs, wait-what <br>ใช้บางครั้ง: prototype, to-questionnaire, wizard, improve-codebase-architecture, to-spec/to-tickets, triage <br>**ปิดแบบย้อนกลับได้**: ชุดที่ข้าม 11 ตัว (13 §4) | ⏳ ต้องอนุมัติ (กฎข้อ 6) |
| **plugin** | `data:*`, `operations:*`, `cowork-*` ถูกเรียกอัตโนมัติได้ประมาณ 21 ตัว | ปิด plugin ที่ไม่เกี่ยวกับงาน | 👤 คุณกดเองในตั้งค่าแอป |
| **เลือก stack** | `/choose-stack` วิเคราะห์ + ค้นข้อมูลล่าสุด + เทียบ + ADR | ทำแล้ว ตามที่คุณขอ | ✅ ทดสอบกับระบบเช็คอินแล้ว |
| **review** | reviewer sub-agent แก้ไม่เกิน 2 รอบ | **กฎ review ชุดเดียว** ใน `playbook/review-rules.md` <br>• comment จุกจิกไม่เกิน 5 <br>• ต้องมี file:line <br>• หลังรอบแรกรายงานเฉพาะเรื่องสำคัญ <br>• กฎสำคัญ 1–2 ข้อต่อ repo <br>ใช้ทั้งใน Claude และ Codex (14 §2, §6.4) | ⏳ ทำได้เลย |
| **ระดับความเสี่ยงของ review** | ยังไม่มี | งานที่แตะข้อมูลผู้ป่วย login/สิทธิ์ หรือ migration คุณต้องอ่าน diff เองทุกครั้ง งานอื่นให้ reviewer อีกค่ายตรวจ แล้วคุณสุ่มดูบางงาน (Anthropic SDLC, OpenAI risk class) | ⏳ ทำได้เลย |
| **ความปลอดภัยบน Windows** | Claude: auto + deny + guard <br>Codex: full access + guard | Claude: เหมือนเดิม ส่วน bypass ใช้เฉพาะใน WSL2 / container <br>Codex: ทดสอบในเครื่องนี้แล้วว่า sandbox ทั้ง `read-only` และ `workspace-write` เปิด process ไม่ได้ จึง**ต้องใช้ full access ต่อไป**แล้วพึ่ง guard กับ hard stop **[สรุปเอง]** <br>ลอง `elevated` sandbox ได้ แต่ต้องใช้สิทธิ์ admin | ⏳ เขียนเอกสารได้เลย, แก้ config ต้องอนุมัติ |
| **โมเดลและโควตา** | Claude: Opus 5.5 medium <br>Codex: `gpt-6-astra` | วางแผนหรือ review เรื่องเสี่ยง: Opus high <br>ลงมือตาม ticket ที่ชัดแล้ว: Sonnet <br>ค้นหาหรืออ่าน log: Haiku <br>Codex: Sol เป็นค่าตั้งต้น (Astra บน Plus ได้แค่ 5–45 ข้อความต่อ 5 ชั่วโมง) <br>เช็ก `/usage` ทุกสัปดาห์ (14 §4) | ⏳ เขียนเอกสารได้เลย, เปลี่ยน default ต้องอนุมัติ |
| **จัดการ context** | `/handoff-pack` | เพิ่ม**ด่านเช็กก่อนเปลี่ยนช่วงงาน**: ทำต่อ → `/clear` → handoff → sub-agent → `/compact` <br>`/clear` ได้เมื่อการตัดสินใจอยู่ในไฟล์แล้ว (Matt) <br>status line แสดง context % | ⏳ ด่านเช็กทำได้เลย, status line ต้องอนุมัติ |
| **ข้อมูลลับ** | กฎห้ามวางในแชท + guard | ใช้ `/wizard` ของ Matt เวลาต้องใส่ `.env` จะพิมพ์แบบซ่อนและไม่เข้าแชท (13 §4) ต้องทดสอบบน Windows ก่อน | ⏳ ทดสอบก่อน |
| **เรียนรู้ต่อเนื่อง** | `/retro` ทุกจันทร์ + ตรวจรายเดือน | เหมือนเดิม | ✅ |
| **สิ่งที่ตัดสินใจไม่ทำ** | กระจายอยู่หลายไฟล์ | `playbook/out-of-scope.md` เดียว ระบุเงื่อนไขที่จะกลับมาพิจารณา เช่น Ralph/AFK loop, implement-spec, ติดตั้ง superpowers ทั้งชุด, ระบบความจำที่บันทึกทุกอย่าง | ⏳ ทำได้เลย |

---

## ข้อที่แหล่งข้อมูลขัดกัน และเราเลือกอะไร

| ประเด็น | ฝั่งหนึ่ง | อีกฝั่ง | เลือก | เหตุผล |
|---|---|---|---|---|
| รัน agent ขนานกี่ตัว | ทีม Codex 4–8 ตัว | Anthropic: งานโค้ดส่วนใหญ่ไม่เหมาะ multi-agent, Matt: อย่าขนาน | **1–2 ตัว** (sub-agent สูงสุด 4) | ทำงานคนเดียว คอขวดคือคุณที่ต้องตรวจ และเคยชนโควตาบ่อย |
| คนต้อง review ไหม | OpenAI: agent ตรวจกันเองเป็นหลัก | Anthropic: แบ่งระดับ + สุ่มตรวจ | **แบบ Anthropic แต่เข้มกว่า** | ข้อมูลโรงพยาบาล และคุณต้องรับผิดชอบ |
| สกิลที่มีผลข้างเคียงควรเรียกเองไหม | OpenAI skill-creator: ไม่จำเป็น | Anthropic, Matt: ควรเรียกเอง | **เรียกเอง** (`/ship`, `/retro`) | push และ PR ต้องตั้งใจทำ |
| migration ต้องย้อนได้ไหม | addyosmani: มี `down` ทุกครั้ง | คลัง: forward-only + backup | **forward-only** | MySQL DDL commit ทันทีอยู่แล้ว ใช้แผนกู้ข้อมูลที่ซ้อมจริงแทน |
| ขั้นวางแผนก่อนลงมือ | OpenAI: Plan Mode ดีที่สุด | Matt: เน้นคุยมากกว่า plan mode | **คุย (grill)** แล้วได้ ticket ที่มีเกณฑ์รับงาน | ใช้ได้ทั้งสองเครื่องมือ |

---

## สิ่งที่ยังไม่มีใครพิสูจน์ (อย่าเชื่อเกินหลักฐาน)

- **ตัวเลขผลผลิต** เช่น "เร็วขึ้น 4 เท่า" และ "80% ของโค้ด" มาจากการสำรวจที่ผู้เขียนเองบอกว่าน่าจะสูงเกินจริง (Anthropic) งานวิจัยของ METR บอกว่าหลักฐาน "อ่อนมาก"
- **สกิลชุดใหญ่อย่าง superpowers** มีการทดลองแบบเปิด-ปิดสกิลเพียงชุดเดียว ผลคือใช้ token เพิ่ม 1.33 เท่า และไม่ช่วยงาน debug หรือ review ที่วัดได้
- **ใน Codex สกิลของคลังไม่ถูกเรียกเองจากประโยคธรรมดา** ทดสอบไป 32 ครั้ง แต่ผลงานยังถูกต้อง เพราะกฎกลางคุมอยู่ ข้อนี้บอกว่ากฎกลางสำคัญกว่าจำนวนสกิล
