# ai-playbook: คลังขั้นตอนการทำงานกับ AI Agents

คลังนี้รวมวิธีทำงานตั้งแต่ได้ requirement จนส่งมอบระบบ ใช้ร่วมกันทั้ง **Claude Code** และ **Codex**
แก้ที่นี่ที่เดียว แล้วรัน `scripts\sync.ps1` เพื่อให้ทั้งสองเครื่องมือเห็นการเปลี่ยนแปลง

👉 **เริ่มที่ [`00-start-here.md`](00-start-here.md)** ในนั้นบอกว่าเจอสถานการณ์ไหนให้ทำอะไร

## ติดตั้งแล้วอะไรบ้าง (2026-10-01)

| ส่วน | อยู่ที่ | ทำหน้าที่ |
|---|---|---|
| กฎกลาง | `instructions/core.md` → `~/.claude/CLAUDE.md` (import) และ `~/.codex/AGENTS.md` (สำเนาที่ sync สร้าง) | agent ทุกตัวคัดแยกงาน คุมขอบเขต แย้งได้ และรายงานรูปแบบเดียวกัน |
| สกิลของคลัง (`new-request`, `ship`, `handoff-pack`, `retro`) | `skills/` → **สำเนา** ใน `~/.claude/skills` (แอป Desktop ไม่แสดงสกิลแบบ junction ในเมนู "/" ดู anthropics/claude-code#68318) และ junction ใน `~/.agents/skills` สำหรับ Codex; commit ในคลังแล้ว sync ให้อัตโนมัติ (post-commit hook) | `/new-request`, `/ship`, `/handoff-pack`, `/retro` — ประวัติใน `skills/CHANGELOG.md` |
| Sub-agents | `agents/claude/*.md` → `~/.claude/agents`, `agents/codex/*.toml` → `~/.codex/agents` | reviewer, researcher, verifier (Claude: Sonnet effort high) |
| ตัวกันคำสั่งอันตราย | `guardrails/guard.mjs` → hook ใน `~/.claude/settings.json` และ `~/.codex/hooks.json` | บล็อก `rm -rf`, force push, `reset --hard`, `DROP`/`TRUNCATE`, `docker volume rm`, การเขียน `.env` |
| Claude settings | `scripts/merge-claude-settings.mjs` | auto mode, deny rules, hook (มี backup ของไฟล์เดิม) |

## โครงสร้างคลัง
```
00-start-here.md   แผนที่: สถานการณ์ → สิ่งที่ต้องทำ
instructions/      กฎกลางสำหรับ agent (ภาษาอังกฤษ)
playbook/          วงจรงาน 0–13 และกติกาคัดแยกงาน
prompts/           prompt ภาษาไทยพร้อมใช้ 31 แบบ
skills/            สกิลของคลัง
agents/            sub-agents ของ Claude และ Codex
guardrails/        ตัวกันคำสั่งอันตราย
stacks/            stack มาตรฐานสำหรับระบบโรงพยาบาล
templates/project/ ไฟล์ตั้งต้นของทุกโปรเจกต์ (AGENTS, STATE, BACKLOG, DECISIONS, HANDOVER, RUN)
me/                โปรไฟล์ จุดพลาดบ่อย และสิ่งที่ได้ผล
setup/             คำตอบ setup สำเร็จรูป และข้อเสนอคัดสกิล
research/          ข้อมูลอ้างอิงพร้อมแหล่งที่มาและวันที่
scripts/           sync.ps1, merge-claude-settings.mjs
_inbox/            ข้อมูลส่วนตัวและไฟล์ export (ไม่ขึ้น Git)
```

## ทำให้คลังไม่ล้าสมัย
- ทุกหน้าที่มีเวอร์ชันหรือข้อเท็จจริงภายนอกต้องมีวันที่ "ตรวจล่าสุด" และลิงก์แหล่งที่มา
- **เดือนละครั้ง:** สั่ง agent ว่า
  `ใช้ sub-agent researcher ตรวจ stacks/hospital-web.md และ research/02-tool-mechanics.md เทียบกับแหล่งทางการล่าสุด อัปเดตเวอร์ชันและวันที่ แล้วสรุปว่าอะไรเปลี่ยน`
- เมื่อ Claude Code หรือ Codex ออกเวอร์ชันใหม่: รัน `scripts\sync.ps1` แล้วทดสอบ guard ตาม `guardrails/README.md`
- หลังจบแต่ละโปรเจกต์: เพิ่มบทเรียนลง `me/pitfalls.md` หรือ `me/wins.md`

## ระบบดูแลคลังอัตโนมัติ (ตั้งแล้ว 2026-10-01)
| อะไร | เมื่อไหร่ | ทำอะไร |
|---|---|---|
| `ai-playbook-weekly-retro` (scheduled task ในแอป Claude) | ทุกจันทร์ 9:10 | อ่านแชทสัปดาห์ที่ผ่านมาแบบปิดบังรหัส เสนอบทเรียนไม่เกิน 3 ข้อ **ไม่แก้คลังเอง** |
| `ai-playbook-monthly-freshness` | วันที่ 1 ทุกเดือน 9:00 | ตรวจเวอร์ชัน stack, Claude Code/Codex และสกิลของ Matt เทียบแหล่งทางการ **ไม่แก้คลังเอง** |
| post-commit hook ของคลัง | ทุก commit | รัน `sync.ps1` + `lint-skills.mjs` ให้ Claude/Codex ได้ของล่าสุดและเตือนถ้าสกิลผิดรูปแบบ |

งานตั้งเวลาจะรันเมื่อแอป Claude เปิดอยู่ ถ้าปิดแอปไว้ตอนถึงเวลา จะรันตอนเปิดแอปครั้งถัดไป
ติดตั้งสกิลของคนอื่นทุกครั้ง: ตรวจตาม `setup/skill-intake.md` และบันทึกใน `setup/skills-lock.md`
