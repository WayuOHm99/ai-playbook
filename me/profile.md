# โปรไฟล์ของฉัน: วิธีทำงานกับ AI agent

> สรุปจากการวิเคราะห์ประวัติแชทของตัวเอง (ส.ค.-ก.ย. 2026) ใช้เพื่อปรับคลังนี้ให้เข้ากับวิธีทำงานจริง ไม่มีข้อมูลลับ ไม่มีชื่อบุคคลอื่น ไม่มีตัวระบุโรงพยาบาล

## 1. คุณคือใคร (ในบริบทการทำงาน)

- นักศึกษาฝึกงาน (นักศึกษาสหกิจ ปี 4) ที่ฝ่ายไอทีของโรงพยาบาล ทำระบบของโรงพยาบาลร่วมกับเพื่อนหนึ่งคน แต่ในทางปฏิบัติลงมือทำคนเดียวเป็นส่วนใหญ่
- โปรเจกต์หลัก: `D:\suth-helpdesk-assets` (ระบบจัดการครุภัณฑ์/เครื่องพิมพ์ ภายในโรงพยาบาล)
- โปรเจกต์ส่วนตัว: Run-Performance (แดชบอร์ดข้อมูลนักวิ่ง), RubricLens, CAMPBANK, วิดีโอชมรม และงานเอกสาร/สไลด์ต่างๆ
- บอกตัวเองว่า "vibe coding ไม่มีพื้นฐานโค้ด" แต่ส่งมอบแอปที่ใช้งานจริงได้หลายตัว แปลว่าจุดแข็งอยู่ที่การกำกับงาน ไม่ใช่การพิมพ์โค้ด
- ตอนนี้กำลังหางานด้าน AI/tech จึงต้องการผลงานและรายงานที่ตรวจสอบย้อนกลับได้

## 2. เครื่องมือที่ใช้

| เครื่องมือ | บทบาทจริง |
|---|---|
| Codex | เครื่องมือหลักช่วงแรก (มิ.ย.-ส.ค.) งานยาว session เดียว fork บ่อย ใช้เป็นผู้รีวิวด้วย |
| Claude Code | เป็นหลักตั้งแต่ต้น ก.ย. (เก็บประวัติได้ตั้งแต่ 2 ก.ย.) เปิด auto mode แล้ว |
| Claude Desktop/Cowork | งานทั่วไป: คุมเบราว์เซอร์, Notion, Canva, สมัครงาน |
| ChatGPT / Gemini | ที่ปรึกษา/ผู้ร่างพรอมต์, รายงานส่งมอบ แล้วคัดลอกไปวางให้ agent อื่น |
| ชุด skill ของ Matt Pocock | ใช้เป็นปุ่ม "ที่ปรึกษา" (`ask-matt`, `grill-with-docs`, `code-review`, `finish-issue`) |
| Stack | Vue + Express + MySQL + Docker (โรงพยาบาล), Next.js/Supabase/Vercel, Cloudflare (โปรเจกต์ส่วนตัว), Windows + PowerShell |

สลับเครื่องมือตามโควตา ("โควตาหมดแล้ว ทำต่อจากที่ตัวอื่นค้างไว้") และตามความพอใจต่อคุณภาพ ไม่ได้ตามบทบาทที่กำหนดไว้ล่วงหน้า

## 3. วิธีเขียนพรอมต์

- ภาษาไทยเกือบทั้งหมด สั้น เป็นคำสั่ง บางครั้งพิมพ์ต่อเนื่องไม่มีวรรคตอนหรือพูดเข้าไมค์ อังกฤษมาจากเอาต์พุต agent ที่วางต่อ
- ความยาวมัธยฐานประมาณ 50 ตัวอักษร ราว 30% เป็นคำสั้นมาก ("ทำต่อ", "ยืนยัน", "อนุมัติ", "ตามคำแนะนำ") และราว 12% เป็นข้อความยาว 600+ ตัวอักษร (วางแผน/รายงาน/ข้อความดิบจากผู้ใช้งานระบบ)
- มี 2 โหมดชัดเจน
  1. โหมดมีโครงสร้าง (ทำได้ดีที่สุด): ข้อห้ามเป็นข้อๆ ("ห้าม commit/push/merge"), ขอแผนก่อนลงมือ, กำหนดรูปแบบรายงาน (APPROVE / REQUEST CHANGES), ส่งเฉพาะ finding ที่ต้องแก้
  2. โหมดชี้นำแบบกว้าง: คำอนุมัติสั้นๆ สลับกับ wish-list ยาวที่ใช้คำระดับสูงสุด ("ระดับโลก", "ละเอียดที่สุด") ซึ่งเป็นต้นเหตุของปัญหาส่วนใหญ่ใน `pitfalls.md`
- กติกาที่ใช้บ่อย: "ห้ามเดา", "ตอบอย่างเดียวยังไม่ต้องลงมือ", "ถามฉันทันทีถ้าฉันมองข้ามอะไร", "อย่าทำนอกขอบเขต"
- เริ่มโปรเจกต์ที่ดีที่สุดแบบ "คุยก่อน": ขอให้ agent สรุปความเข้าใจและชี้ข้อติดขัดก่อนเขียนโค้ด (เคยเจอจุดเสี่ยงจริง 4 ข้อก่อนเริ่มงาน)
- มักให้ AI ตัวหนึ่งร่างพรอมต์ให้ AI อีกตัว แล้ววางต่อแบบคำต่อคำ

## 4. นิสัยการใช้ session

- Claude Code: เปิดด้วย `/clear` หรือ `/model` บ่อย หลาย session มีแค่ `/clear` + คำถามเดียว (มักเป็น "เหลืออะไรบ้าง") ใช้ `/compact` เป็นครั้งคราว
- Codex: session ยาว fork บ่อย พรอมต์เปิดเดิมถูกวางซ้ำในหลาย fork
- ถามซ้ำๆ: "ตอนนี้ต้องทำอะไรต่อ / เหลืออะไร / อยู่ตรงไหน" (มากกว่า 70 ครั้งรวมทุกโปรเจกต์), "รันโปรเจกต์ให้หน่อย" (ราว 30 ครั้ง), "ทำต่อ" (ราว 70 ครั้ง)
- คำสั่งปิดงาน (commit/push/merge/ลบ branch/เคลียร์) ราว 130 ครั้งในโปรเจกต์หลัก จนเจอมาโคร "ปิดงาน #N end-to-end" ที่ลดพรอมต์ต่อ issue ลงราว 6 ข้อความ
- ทำงานกลางคืน/เป็นช่วงสั้นๆ ระหว่างงานประจำ บางครั้งอนุมัติก่อนนอน
- พักงานด้วยไฟล์ (HANDOFF, PROJECT-STATE, next-session-scope) ซึ่งได้ผลดีเมื่อผู้รับตรวจ git จริงซ้ำ
- วางข้อความระหว่าง agent เอง (เป็นตัวส่งสาร) เป็นรูปแบบทำงานหลัก

## 5. จุดแข็ง

- เป็นเจ้าของผลิตภัณฑ์/ผู้อนุมัติที่ชัด ตัดสินใจเร็ว ถามแม้แต่ศัพท์พื้นฐาน จึงเรียนรู้เร็ว
- ตัดงานเก่งหลังเจอปัญหาจริง (ลบเอกสารบวม, ตัด CI, ตัด issue ที่กว้างเกินไป)
- สัญชาตญาณดีเรื่องความปลอดภัยข้อมูล: กันไฟล์ข้อมูลจริงออกจาก PR, ไม่อนุมัติ merge จากรายงานอย่างเดียว, ใช้ฐานข้อมูลทดสอบแยก
- ให้ agent ตัวที่สองรีวิวแบบ read-only แล้วจับบั๊กที่ตัวเขียนมองไม่เห็น
- ใช้ข้อมูลจริงยืนยัน (เทียบใบแจ้งหนี้จริงถึงหน่วยสตางค์)
- สั่งให้ agent "เห็นต่างกับฉันและบอกสิ่งที่ฉันมองข้าม" ซึ่งเป็นนิสัยที่ดี
- งานที่มีชิ้นงานจับต้องได้และเดดไลน์จริง ส่งมอบสำเร็จสม่ำเสมอ

## 6. สิ่งที่คุณต้องการจาก agent

1. ขั้นต่อไป 1 อย่างที่ชัดเจน (คำสั่งหรือข้อความที่ต้องวาง ไม่ใช่เมนูตัวเลือก)
2. ภาษาไทยธรรมดา ศัพท์เทคนิคอังกฤษได้ แต่ต้องอธิบายสั้นๆ (เช่น worktree, ADR, deduction)
3. ห้ามเดา: ถ้าไม่รู้หรือไม่มีหลักฐาน ให้บอกตรงๆ และถาม
4. ข้อแนะนำที่มีจุดยืนพร้อมหลักฐาน ไม่ใช่รายการตัวเลือกที่เท่ากันหมด (คุณตอบ "ตามคำแนะนำ" บ่อย จึงต้องมั่นใจว่าคำแนะนำผ่านการคิดมาแล้ว)
5. ทำงานให้จบเป็นห่วงโซ่เมื่อสั่งมาโคร ไม่หยุดทุกเฟสเพื่อรอคำสั่งซ้ำ แต่หยุดที่ประตูสำคัญ (merge/push main/deploy/ลบ/ข้อมูลจริง/secret)
6. ช่วยกันความเสี่ยงที่คุณมองข้าม (โควตาฟรี, ข้อมูลอ่อนไหว, ความเป็นไปได้ของ API, ความซับซ้อนเกินตัว)
7. บันทึกสถานะลงไฟล์ให้เอง เพื่อไม่ต้องถามซ้ำหลัง `/clear`
8. รายงานตามหลักฐานเท่านั้น โดยเฉพาะเอกสารที่ส่งให้หัวหน้า/ทุน ("ใช้เฉพาะที่ระบบพิสูจน์ได้")
9. ความยาวสั้นพอเหมาะ ไม่ทำเกินที่ขอ

## 7. สถานะการตั้งค่าปัจจุบัน

- Claude Code อยู่ใน auto mode (ตัวจัดประเภทตรวจการกระทำเสี่ยงแทนการกดอนุมัติ) ควรใช้คู่กับ deny rules และ guard hooks และห้ามใช้ bypass ในรีโปที่มีข้อมูลจริง
- เปิดเก็บประวัติแชท 365 วัน (เดิมถูกลบทุก 30 วัน)

## 8. agent: how to work with this user

Reference only — not imported; instructions/core.md is the source of truth.

- The user is a Thai intern at a hospital IT team; replies in Thai. Answer in plain Thai, keep English technical terms, explain jargon in one line. Address them as "คุณ".
- Start every session by reading the project's STATE/HANDOFF file and `git status`; never ask "what were we doing" if it is on disk. Verify key handoff claims against the real repo.
- End every turn with exactly one clear next action (a command or a text to paste), or one blocking question. Do not end with an option menu.
- Give a recommendation with evidence and the main trade-off. The user often replies "as recommended", so make the recommended path safe and honest about risk.
- Never guess. If a fact is missing, say so and ask. Tag unverified claims as unverified. In reports and proposals, use only what commits/tests/issues prove.
- Default to read-only plus plan until the user says approve. Keep scope tight: one issue, one branch, one deliverable. Put extras in BACKLOG.md; do not build them.
- Treat "world-class / the best / most thorough" as a request for a concrete rubric: turn it into at most 5 checkable criteria and confirm before building.
- Before changing a requirement, check the decisions ledger, show conflicts with earlier decisions, and ask which one wins. Do not silently redesign.
- For money or data-semantics decisions, explain in 5 plain lines with one numeric example and wait for "understood" before coding.
- Do not accept blanket "approve everything" as a scope. Restate the concrete allowed list (edit, test, commit, push a feature branch and open a PR when delivering) and the always-ask list (merge, push to main/master, deploy, delete, prod DB, secrets, external accounts, sending messages). Retry a failing approach at most twice; stop after 2 review rounds with an open BLOCKER and report BLOCKED.
- Never ask the user to paste secrets. Refer to env var names only; if a secret appears in chat, say so, advise rotation, and do not echo the value.
- Reviews: one Spec + Standards reviewer pair, read-only, max 2 fix rounds; severity words BLOCKER / SHOULD-FIX / COULD-FIX; an open BLOCKER after round 2 = stop and report BLOCKED; the rest goes to the report and BACKLOG.md. Reviewers never edit.
- Put findings and handoffs in committed files (`STATE.md` + `HANDOFF.md`, commit prefix `wip: handoff`, via `/handoff-pack`), not only in chat. Do this before a handoff or before the user runs `/clear` or `/compact`.
- One agent per branch/worktree. Run `git worktree list` first. On Windows use short worktree paths and `core.longpaths`; state branch, port, and commit you actually tested.
- Before big work (new app, new integration), run a feasibility check (API access, ToS, cost, credentials) and freeze name/stack/hosting before scaffolding.
- Use the simplest process that fits a 1-2 person internal project; do not add CI, ADRs, or docs unless they prevented a real incident.
