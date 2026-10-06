# Skills source record: snapshot ใน repo และประวัติการติดตั้ง

อัปเดต 2026-10-06: ส่วนแรกเป็น **repo-only snapshot** การแก้ไฟล์นี้ไม่ได้เปลี่ยน `C:\Users\wayuo\.agents\.skill-lock.json` หรือ installed folders ใด ๆ การติดตั้ง/อัปเดตเป็นอีกงานตาม [skill intake](skill-intake.md)

## Source ของ Matt ที่ใช้ในคลังนี้

| รายการ | Pin / บทบาท |
|---|---|
| Upstream | [mattpocock/skills](https://github.com/mattpocock/skills) |
| Frozen latest source | [`6fd947921b935b7e1e69293a200400f0fdd5c15f`](https://github.com/mattpocock/skills/tree/6fd947921b935b7e1e69293a200400f0fdd5c15f) |
| Package / latest published release | `1.3.1`; release tag commit `24fe0ef7737efae15c87225755e9f6f5965e4888` |
| Main vs release | ใช้ frozen latest commit พร้อม main fixes; ไม่อ้างว่าตรง release tag ทุก byte |
| Licence | MIT; เก็บ licence/provenance กับ upstream snapshot |
| Primary catalogue | 27 skills: 20 Engineering + 7 Productivity; source names/invocation roles preserved |
| Reference only | 11 experimental/misc skills; ไม่เป็น active entries และไม่ sync/install เป็นชุดหลัก |
| Total preserved source | 38 skills ใน `upstream/matt-pocock/source/` |
| Local active skills | `skills/engineering/**`, `skills/productivity/**`; thin central policy จาก `instructions/core.md` และ `instructions/working-style.md` |
| Integrity / adaptations | manifest และ byte checker ใน repo; [adaptation rationale](matt-pocock-adaptation.md) |

ชุด primary นี้แทน owned workflows รุ่นเก่า ไม่ใช่การติดตั้ง Matt ใหม่ลงเครื่อง ค่า GLOSSARY ของ source ใหม่ใช้งานใน repo ใหม่ตาม [setup answers](matt-pocock-setup-answers.md) ไม่ migrate โปรเจกต์อื่นอัตโนมัติ

## Installed inventory ที่บันทึกไว้ก่อนหน้า (2026-10-01)

ข้อมูลนี้เป็นประวัติจากการตรวจเดิม ไม่ได้สแกนหรือเปลี่ยนเครื่องในงาน 2026-10-06 และไม่ใช้ยืนยันว่าชุด active ใหม่ติดตั้งแล้ว `npx skills` เคยเก็บ lock version 3 พร้อม folder hashes ใน path ที่กล่าวข้างต้น

| Source | จำนวนที่บันทึกครั้งก่อน | Location ครั้งก่อน | หมายเหตุครั้งก่อน |
|---|---|---|---|
| Matt Pocock | 35 | `~/.agents/skills`, Claude junctions | Reviewed 2026-10-01; CONTEXT→GLOSSARY ยัง pending ณ วันตรวจนั้น |
| HeyGen HyperFrames | 18 | `~/.agents/skills` + Claude copies | UNVERIFIED source review; 17 manual-only, hyperframes auto |
| vercel-labs/skills | 1 (`find-skills`) | `~/.agents/skills` | not reviewed |
| softaworks/agent-toolkit | 1 (`requirements-clarity`) | `~/.agents/skills` | manual-only; overlaps grilling |
| Cloudflare | 11 | Claude + agents real folders | not in npx lock; UNVERIFIED source |
| Claude/Cowork plugins | ~60 | `~/.claude/plugins` | not reviewed |
| Owned vault workflows | 5 | copies/junctions from prior sync | Legacy catalogue; replaced in repo 2026-10-06, installed state unchanged |

ประวัติการ park copies และ patches อยู่ใน [cleanup record](skills-cleanup-proposal.md) เป็นบันทึกวันที่ 2026-10-01 ห้ามรัน apply script หรือ reapply manual-only patches กับ primary Matt snapshot ใหม่นี้อัตโนมัติ การ update ครั้งถัดไปต้องตรวจ source/CHANGELOG และ invocation roles ใหม่ตาม scope ที่อนุมัติ
