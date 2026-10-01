# Stack recipe: วิดีโอสั้น/คอนเทนต์ชมรมด้วย HyperFrames + AI agent

- **Last verified: 2026-10-01** (ทุกเวอร์ชัน/ตัวเลขดึงจาก registry/API เมื่อ 2026-10-01 ตามแหล่งที่อ้างในแต่ละบรรทัด)
- **ต้อง re-verify ทุกเดือน** (section 8) เพราะ HyperFrames ยังเป็น 0.x ออกรุ่นเกือบทุกวัน
- Tier: T1 = official/primary, T2 = high-adoption repo หรือ practitioner, T3 = อื่นๆ. "UNVERIFIED" = ยังไม่ได้เปิดอ่านจาก primary source
- หลักการข้อเดียว: **ล็อก "หน้าตา" และ "เสียง" ก่อน build แล้วรอบแก้เหลือรอบเดียว** (ตามบทเรียน `me/pitfalls.md` ข้อ 1, 2, 11: สไลด์/วิดีโอทำใหม่หลายรอบ, agent เคยทำ layout Canva พังและเพิ่มเพลงที่ไม่ได้ขอ)

---

## 1. Toolchain (verified 2026-10-01)

| ชิ้น | ค่า | แหล่ง (T1 ถ้าไม่ระบุ) |
|---|---|---|
| CLI package (ชื่อจริงใน npm) | `hyperframes` **0.8.105**, Apache-2.0, `engines.node >=22` | https://registry.npmjs.org/hyperframes/latest (npm registry, 2026-10-01) |
| Repo | `heygen-com/hyperframes` **55,170 stars**, 5,006 forks, สร้าง 2026-03-10, push ล่าสุด 2026-10-01, open issues 224, ไม่ archived | https://api.github.com/repos/heygen-com/hyperframes (GitHub, 2026-10-01) |
| Release ล่าสุด | **v0.8.105** เผยแพร่ 2026-10-01 14:38Z | https://github.com/heygen-com/hyperframes/releases/tag/v0.8.105 (GitHub, 2026-10-01) |
| Node.js | ใช้ **24 LTS = 24.21.0** (2026-09-07); ขั้นต่ำที่ CLI ต้องการ 22 (22.23.3 LTS); 26.10.0 ยังไม่ LTS | https://nodejs.org/dist/index.json (2026-10-01) |
| FFmpeg | **9.0.2** (2026-09-18); Windows build จาก gyan.dev หรือ BtbN | https://ffmpeg.org/download.html (2026-10-01) |
| Chrome | CLI จัดการ Chrome เวอร์ชันที่ pin ไว้เอง: `npx hyperframes browser ensure` (pixel drift ข้ามเวอร์ชัน) | `hyperframes-cli/references/doctor-browser.md` (skill ติดตั้งในเครื่อง) |
| Thai font | `@fontsource/anuphan` 5.3.0 และ `@fontsource/noto-sans-thai` 5.3.0, ทั้งคู่ OFL-1.1 | https://registry.npmjs.org/@fontsource/anuphan/latest , .../noto-sans-thai/latest (2026-10-01) |

หมายเหตุสำคัญ
- README ของ repo: "Node.js 22+ และ FFmpeg", render ผ่าน headless Chrome, composition ต้อง deterministic (https://github.com/heygen-com/hyperframes, 2026-10-01)
- **FFmpeg 9.x ใช้กับ HyperFrames 0.8.105 ได้ไหม = UNVERIFIED**: ตรวจด้วย `npx hyperframes doctor` (ดู Version/Node/FFmpeg/Chrome) ก่อนงานแรกของเดือน
- โปรเจกต์ `02_nai-chob-wing` ของคุณ pin `hyperframes@0.7.54` ใน `package.json` (อ่านจากไฟล์, 2026-10-01) ห่างจาก 0.8.105 หลายรุ่น. ขั้นตอนทางการ: `npx hyperframes@latest upgrade --project . --check` แล้วถ้าจะอัปเกรด `upgrade --project .` + `npx hyperframes check` และบอกเวอร์ชันเก่า/ใหม่ในรายงาน (`hyperframes/SKILL.md` § Keep the project's CLI current). **อย่าอัปเกรดกลางงานที่ approve แล้ว** เพราะ check ผ่านไม่ได้แปลว่า output เหมือนเฟรมต่อเฟรม
- ติดตั้ง skill ใหม่/อัปเดต pack = hard stop ข้อ 6 ใน `instructions/core.md`: router `/hyperframes` จะ `npx hyperframes skills update <workflow>` ให้เอง ให้อนุญาตเฉพาะ workflow ที่ใช้จริง (section 3) และจด `setup/skills-lock.md`; ก่อนติดตั้งอย่างอื่นตาม `setup/skill-intake.md`

## 2. HyperFrames vs ทางเลือก (ตอบตรงๆ)

หลักฐานจากโฟลเดอร์ของคุณ: จากไฟล์ที่ตรวจ (ไม่ครบทุกไฟล์) เห็นโปรเจกต์ HyperFrames จริงเพียง `02_nai-chob-wing` (มี `hyperframes.json`, `index.html`, render ออกมาแล้ว 2026-07-12) ส่วน `01`, `04`, `05` เป็นสายตัดต่อด้วย ffmpeg filter + ซับ `.ass` ซึ่งใช้ได้ดีกับ "ตัดฟุตเทจดิบ + ใส่ซับ"

| เครื่องมือ | เหมาะกับ | ไม่เหมาะกับ / ข้อควรระวัง |
|---|---|---|
| **HyperFrames** | งานเป็นซีรีส์/เทมเพลต (โปสเตอร์ตัวเลขประจำสัปดาห์, intro/outro, title card, สรุปผลแข่ง, motion graphic สั้น), ต้องการ agent สร้างและ render ซ้ำได้, ปรับตัวแปรแล้ว `render --batch` | ตัดต่อฟุตเทจยาวด้วยจังหวะมือ (CapCut เร็วกว่า). **ยังเป็น 0.x** (0.8.105) และ open issues 224 จึงต้อง pin เวอร์ชันต่อโปรเจกต์. star 55k ใน ~6.5 เดือนบอกความนิยม ไม่ได้บอกความเสถียร. Thai line-break/คำบรรยายยาวต้องดู snapshot เอง (UNVERIFIED ว่ารองรับดีทุกกรณี; docs index ไม่มีหน้า Thai/Windows: https://hyperframes.heygen.com/llms.txt, 2026-10-01) |
| **Remotion** (React) | ทีมที่เขียน React อยู่แล้ว. v4.0.532, 61,393 stars, push 2026-10-01 (npm + GitHub, 2026-10-01) | license: ฟรีสำหรับบุคคล, องค์กรแสวงหากำไร **<=3 คน**, องค์กรไม่แสวงหากำไร; 4 คนขึ้นไปต้องซื้อ Company License (https://raw.githubusercontent.com/remotion-dev/remotion/main/LICENSE.md, 2026-10-01). ชมรม/มหาวิทยาลัยเข้าเงื่อนไขไหม = UNVERIFIED. มีเส้นทางย้ายมา HyperFrames (`/remotion-to-hyperframes`) จึงไม่จำเป็นต้องเริ่มที่นี่ |
| **Motion Canvas** | อนิเมชันเวกเตอร์/อธิบายแนวคิดด้วยโค้ด. MIT, 19,219 stars, `@motion-canvas/core` 3.17.2, push ล่าสุด 2026-07-02 | ไม่เหมาะกับ montage รูป/คลิปจริง; push ล่าสุดเก่ากว่า 3 เดือน (GitHub API + npm, 2026-10-01) |
| **CapCut / Canva ทำมือ** | คลิปครั้งเดียวสั้นกว่า ~30 วินาที, ตัดจากมือถือ, ไม่เคยทำซ้ำ | เพลงใน CapCut: ผลค้นหา (2026-10-01) สรุปว่าไลบรารี "Sounds" ปกติใช้ส่วนตัว/ไม่ใช่เชิงพาณิชย์ งานแบรนด์/ธุรกิจต้องใช้ "Commercial Sounds" และใช้ได้เฉพาะ CapCut/TikTok (อ้าง https://www.capcut.com/clause/terms-of-service **ยังไม่ได้เปิดอ่านเอง = UNVERIFIED**). **ห้าม agent แตะไฟล์ Canva/CapCut** (เคยพัง 09-29, pitfalls ข้อ 6) |

**กฎเลือก (ข้อเดียว):** ถ้าจะ *ทำซ้ำ* ในหน้าตาเดิม หรือเป็นกราฟิก/ตัวอักษรเคลื่อนไหว -> HyperFrames. ถ้าเป็นคลิปครั้งเดียวที่ตัดจากฟุตเทจ -> CapCut ทำเอง แล้วถ้าอยากได้ overlay/ซับสวยค่อยส่งเข้า `/embedded-captions` หรือ `/talking-head-recut`. ถ้าเป็นงานเก่ากลางทาง (ffmpeg + .ass) **ไม่ต้องย้าย** (หลักเดียวกับ pitfalls ข้อ 11)

## 3. Workflow กันวนแก้ตามรสนิยม

ทุกขั้นมี "ประตู" (gate) ที่ต้องพิมพ์ว่า approve ก่อนไปขั้นต่อ. **ผู้ใช้ตัดสินใจ 3 ครั้งเท่านั้น: brief+style, storyboard, ดูพรีวิวสุดท้าย** แล้วมี feedback รอบเดียวหลัง render

| ขั้น | ทำอะไร | Skill ที่เรียก | ผลลัพธ์/ประตู |
|---|---|---|---|
| 0 Brief | คุณกรอกฟิลด์ใน section 7 ให้ครบก่อน (ข้อความหลัก 1 ประโยค, ปลายทาง, ความยาว, **เพลง: ไม่มี/มี**, ฟอนต์). ถ้ามี `BRIEF.md` skill จะ **ไม่ถามคำถาม brief ซ้ำ** (`hyperframes/SKILL.md` § 1) | `/hyperframes` (เปิดเอง; เป็นทางเข้าเดียว) | `BRIEF.md` (เขียนหลัง `npx hyperframes init` เท่านั้น เพราะ init ปฏิเสธโฟลเดอร์ที่ไม่ว่าง: `brief-format.md`) |
| 1 Style freeze | เลือก palette/ฟอนต์ไทย/ระยะขอบ แล้วตรึงเป็นสเปกดีไซน์ (`frame.md`). เปลี่ยนภายหลัง = เขียน `DECISIONS.md` 1 บรรทัด "เดิม X -> ใหม่ Y แทนข้อไหน" | `/hyperframes-creative` | `frame.md` + บรรทัดฟอนต์/สีใน `BRIEF.md` |
| 2 Storyboard | agent เสนอแผนในแชท (ตารางเฟรม) -> **sketch `storyboard.html`** เปิดดูในเบราว์เซอร์; แก้เฉพาะเฟรมที่ระบุ (`review-loop.md` § 1-2) | workflow ตาม route (ข้างล่าง) | `STORYBOARD.md` + `storyboard.html` **approve = layout/ข้อความ/สีถูกตรึง** |
| 3 Build | แต่งเฟรมที่ approve แล้ว ห้ามจัด layout ใหม่ (`review-loop.md` § 3). ค้น effect ก่อนเขียนมือ: `npx hyperframes catalog --query "<ภาษาอังกฤษ>"` | `/hyperframes-core`, `/hyperframes-animation`, `/hyperframes-registry`; เสียงเฉพาะเมื่อ brief บอก: `/hyperframes-audio`, `/media-use` | `npx hyperframes lint` ระหว่างทาง |
| 4 Check+พรีวิว | `npx hyperframes check` (lint + runtime + layout + contrast), `snapshot --at t1,t2,t3`, `preview --background` ส่ง URL `http://localhost:<port>/#project/<ชื่อ>` | `/hyperframes-cli` | **ประตู: "render เลย หรือแก้อะไร?"** |
| 5 Render | `--quality draft` -> `looks` -> `delivery` ตาม section 6; แล้ว `ffprobe` เทียบ duration/fps กับ brief | `/hyperframes-cli` | ไฟล์ใน `renders/` |
| 6 Feedback รอบเดียว | คุณส่งรายการแก้เป็นข้อเลขในข้อความเดียว; agent แก้เฉพาะข้อนั้น; ไอเดียใหม่ -> `BACKLOG.md` (P5). เกิน 1 รอบ = หยุดและเขียนว่า "เกณฑ์ข้อไหนยังไม่ผ่าน" | - | ปิดงาน + (ถ้าชอบ) freeze recipe: `media-use` -> `scripts/recipe.mjs freeze --name <ชื่อ>` เพื่อให้งานชุดเดียวกันเริ่มจากหน้าตาเดิม |

Route ที่ใช้บ่อย (ตาม `hyperframes/SKILL.md` § 2, เลือกตามชนิดงาน ไม่ใช่ตามคำ): ซับบนฟุตเทจเดิม -> `/embedded-captions`; overlay กราฟิกบนคนพูด -> `/talking-head-recut`; ภาพนิ่ง/คลิปรวม + เสียงบรรยาย -> `/general-video`; กราฟิกสั้นไม่เกิน ~10 วินาที ไม่มีเสียงพูด -> `/motion-graphics`; ตัดตามจังหวะเพลง -> `/music-to-video`

**Skill ที่ต้องพิมพ์เอง:** ตรวจ `disable-model-invocation: true` ใน SKILL.md ในเครื่อง (2026-10-01): `hyperframes-core/-animation/-keyframes/-creative/-cli/-audio/-studio/-registry`, `media-use`, `general-video`, `motion-graphics`, `music-to-video`, `faceless-explainer`, `slideshow` เป็น manual-only -> พิมพ์ `/ชื่อ`. มีแค่ `/hyperframes` ที่ agent เรียกเองได้. ดังนั้นในพรอมต์ให้เขียนชื่อ skill ที่ต้องใช้ชัดๆ

**กฎกันเหตุเดิม**
- **เพลง = ไม่มี เว้นแต่ `BRIEF.md` เขียนว่า `music: yes` + ที่มา.** ระวัง: `/media-use` มี "media opportunity pass" ที่จะเสนอ `bgm` อัตโนมัติสำหรับงานเกิน ~10 วินาที (`media-use/SKILL.md`) ให้ตอบ "none" ตาม brief และห้ามเพิ่มเอง
- **ห้ามแตะไฟล์ที่ไม่ใช่ของโปรเจกต์** (Canva, CapCut, ไฟล์ต้นฉบับใน `raw/`): `raw/` ใช้สำเนาไปทำงานเท่านั้น
- ห้าม render ก่อน approve (`hyperframes-cli/SKILL.md`: "Never render merely because checks pass")
- เกณฑ์ "เสร็จเมื่อ" (<=5 ข้อ ตรวจได้): (1) `ffprobe` ตรง aspect/ความยาว/fps ใน brief (2) `npx hyperframes check` ผ่าน (3) ข้อความบนจอตรงกับสคริปต์ที่ approve ทุกตัวอักษร (ตรวจคำสะกด/ชื่อคนภาษาไทยด้วยตา) (4) `RIGHTS.md` ครบทุกแถว (5) ดูบนมือถือขนาดจริงแล้วอ่านออก

## 4. เช็กลิสต์ลิขสิทธิ์/สิทธิ์ของสื่อ (ทำก่อน build ไม่ใช่ก่อนโพสต์)

ทุกชิ้นลง `RIGHTS.md`: ไฟล์ / ที่มา URL / license / วันที่เข้าถึง / ผู้ให้ความยินยอม

**เพลง**
- ค่าเริ่มต้น: ไม่ใส่เพลงในไฟล์ แล้วเลือกเพลงในแอปตอนโพสต์ (เพลงของแพลตฟอร์มเคลียร์เฉพาะภายในแพลตฟอร์ม; เงื่อนไขบัญชีธุรกิจ/ชมรมของคุณ = UNVERIFIED)
- ถ้าต้องฝังเพลง: Pixabay Content License ใช้เชิงพาณิชย์ได้ ไม่ต้องให้เครดิต แต่ห้ามขายเนื้อหาเดี่ยวๆ และเนื้อหาที่มีโลโก้/แบรนด์/คนที่ระบุตัวได้มีข้อจำกัด (https://pixabay.com/service/license-summary/, 2026-10-01). SFX 19 ไฟล์ที่มากับ `media-use` มาจาก Pixabay ตาม `media-use/audio/assets/sfx/CREDITS.md`
- **BGM จาก catalog ของ HeyGen ผ่าน `media-use resolve --type bgm`: เงื่อนไข license = UNVERIFIED** (ไม่พบข้อความ license ใน skill) -> อ่านเงื่อนไขของ HeyGen ก่อนใช้กับโพสต์ชมรม. และ `resolve`/TTS เรียกบริการ HeyGen (ต้องล็อกอิน `heygen`) ข้อความที่ส่ง TTS ออกนอกเครื่อง
- ห้ามใช้เพลงดัง/เสียงที่ดึงจากคลิปคนอื่น. ไฟล์ `01_training-day/audio/ReelAudio-42020.mp3` และ `05_test-lactate/audio/*.mp3` ไม่ทราบที่มา (อนุมานจากชื่อไฟล์เท่านั้น) ให้ถือว่า **ไม่มีสิทธิ์จนกว่าจะพิสูจน์ที่มา**
- Content ID ตรวจแยกต่อแพลตฟอร์ม (T3: https://www.foximusic.com/blog/youtube-content-id-for-music-guide-monetization/ ผ่านผลค้นหา 2026-10-01 ยังไม่ได้เปิดอ่านเอง) "royalty-free" ไม่เท่ากับ "ไม่โดนเคลม"

**ฟอนต์ไทย**
- ใช้ฟอนต์ OFL ที่ self-host: `Anuphan` (ใช้อยู่ใน `02_nai-chob-wing/fonts.css`), `Noto Sans Thai` ฝัง/ใช้ในวิดีโอได้ ห้ามขายตัวฟอนต์เดี่ยวๆ และห้ามใช้ Reserved Font Name กับเวอร์ชันที่แก้ (https://openfontlicense.org/open-font-license-official-text/, 2026-10-01)
- self-host เป็น `.woff2` ในโปรเจกต์ (composition ห้าม network fetch: `02_nai-chob-wing/AGENTS.md` Key Rule 6) ห้ามเรียก Google Fonts CDN
- ฟอนต์ไทย "ฟรีสำหรับส่วนตัว" จากเว็บทั่วไป, ฟอนต์ใน Canva/CapCut, ฟอนต์ที่ติดมากับเครื่อง = ถือว่า **ใช้ไม่ได้** จนกว่าจะอ่าน license ของฟอนต์นั้น
- ฟอนต์ใน `.agents/skills/embedded-captions/assets/brand/` (เช่น `CyberpunkReplica.ttf` พร้อม `CDPR-fankit-terms.txt`) เป็นฟอนต์แบรนด์เกม มีข้อกำหนดแฟนคิต **อย่านำมาใช้กับคอนเทนต์ชมรม** โดยไม่อ่านเงื่อนไข (ตรวจจากรายชื่อไฟล์ ยังไม่ได้อ่านเนื้อหา)

**ภาพ/วิดีโอสมาชิก (PDPA)**
- ภาพใบหน้าที่ระบุตัวบุคคลได้ = ข้อมูลส่วนบุคคล; ต้องขอความยินยอมก่อนถ่าย/เผยแพร่ ระบุวัตถุประสงค์เฉพาะ ไม่รวมหลายวัตถุประสงค์ในคำขอเดียว (T3: Siriraj Medical Bulletin, Chalermsuk & Wongcharoenwatana, 2025-01-01, https://he02.tci-thaijo.org/index.php/simedbull/article/view/270948; ข้อความเกี่ยวกับ guideline ของ PDPC ปี 2022 จากผลค้นหาที่อ้าง https://www.nishimura.com/en/knowledge/publications/20221003-88681 ยังไม่ได้เปิดอ่านเอง). **ยังไม่ได้เปิด guideline ต้นฉบับของ PDPC = UNVERIFIED** ให้ถาม DPO ก่อนใช้งานจริง
- ข้อมูลสุขภาพถือเป็นข้อมูลอ่อนไหว (s.26) ตาม `stacks/hospital-web.md` section 7: โฟลเดอร์ `05_test-lactate` (รูป/ผลทดสอบ) ต้องมี **ความยินยอมโดยชัดแจ้งเป็นลายลักษณ์อักษร** ต่อวัตถุประสงค์นี้ และถ้ามีผู้เยาว์ต้องขอจากผู้ปกครอง (เกณฑ์อายุ = UNVERIFIED)
- **ความเสี่ยงที่มักมองข้าม:** (1) agent อ่าน `snapshot`/contact sheet = ส่งภาพหน้าสมาชิกให้ผู้ให้บริการ AI ประมวลผล -> ขอความยินยอมให้ครอบคลุม หรือใช้ฟุตเทจแทน/เบลอระหว่าง build (2) `npx hyperframes publish` อัปโหลด HTML + assets ของโปรเจกต์ขึ้นบริการของ HeyGen และ `cloud render` ส่งโปรเจกต์ไปเรนเดอร์บนคลาวด์ (จำกัด 200 MB) (3) `feedback --file-issue` เผยแพร่ repro สาธารณะ (`hyperframes-cli/references/preview-render.md`) -> **ห้ามใช้ทั้งสามอย่างกับโปรเจกต์ที่มีหน้า/เสียงสมาชิก** ถ้าไม่ได้ถามก่อน (hard stop ข้อ 8)
- ห้ามถ่ายในพื้นที่/ชุดยูนิฟอร์ม/โลโก้โรงพยาบาลในคอนเทนต์ชมรม (คำแนะนำของผู้เขียนไฟล์นี้ ไม่ใช่ข้อกฎหมาย). เก็บ `raw/` นอก git และนอกโฟลเดอร์ซิงก์คลาวด์; ลบตามคำขอถอนความยินยอมได้
- โลโก้/แบรนด์สปอนเซอร์: `media-use resolve --type logo` ดึงจาก theSVG -> GitHub avatar -> favicon ใช้แทนไฟล์ทางการจากเจ้าของไม่ได้; ภาพสต็อกจาก `resolve --type image` license = UNVERIFIED

## 5. Folder template (หนึ่งวิดีโอ = หนึ่งโฟลเดอร์ = หนึ่ง branch)

```
Video-hyperFrames\<NN>_<slug>\        # สั้น ไม่เกิน ~30 ตัวอักษร (Windows long path)
  AGENTS.md CLAUDE.md STATE.md BACKLOG.md DECISIONS.md   # จาก templates\project\
  BRIEF.md  STORYBOARD.md  frame.md  RIGHTS.md
  hyperframes.json  package.json(pin hyperframes@x.y.z)  index.html  compositions\
  fonts\ (woff2 + fonts.css)  audio\ (เฉพาะ music: yes)  media\ (สำเนาที่ใช้จริง)
  raw\        # ต้นฉบับ อ่านอย่างเดียว ไม่ commit (.gitignore)
  renders\    # draft\ looks\ delivery\  ชื่อ: <slug>_9x16_v1.mp4
```
`STATE.md` บันทึกว่าอยู่ประตูไหน (brief/storyboard/preview/feedback) เพื่อไม่เสียรอบหลัง `/clear` (pitfalls ข้อ 4)

## 6. Render/export ตามปลายทาง

ตั้งขนาด composition ที่ **1080x1920 (9:16)** หรือ **1920x1080 (16:9)** ตั้งแต่เริ่ม; `--resolution` ใช้ supersample เท่านั้น และ aspect ต้องตรงกับ composition (HyperFrames docs: https://hyperframes.heygen.com/prompting/rendering-and-output.md, 2026-10-01). ค่า default 1920x1080, 30 fps, MP4. คำสั่งส่งมอบ:
`npx hyperframes render --quality delivery --fps 30 --output renders/delivery/<slug>_9x16_v1.mp4` แล้ว `ffprobe -v error -show_format -show_streams <file>`

| ปลายทาง | ข้อกำหนดที่ยืนยันแล้ว | ที่ยังไม่ยืนยัน |
|---|---|---|
| YouTube (ยาว) | MP4, moov atom หน้าไฟล์ (fast start), H.264 High/4:2:0, AAC-LC/Opus 48 kHz, เฟรมเรตเท่าต้นฉบับ (24-60), SDR 1080p แนะนำ 8 Mbps (24-30 fps) / 12 Mbps (48-60 fps) (https://support.google.com/youtube/answer/1722171, ไม่ระบุวันที่ในหน้า, 2026-10-01) | ไฟล์จาก HyperFrames เป็น H.264 + faststart หรือไม่ = UNVERIFIED: ตรวจด้วย ffprobe; ถ้าไม่ faststart ใช้ `ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4` (คำสั่ง ffmpeg มาตรฐาน) |
| YouTube Shorts | แนวตั้ง, ยาวได้ถึง **3 นาที**, อัปโหลดสูงสุด 1080p (https://support.google.com/youtube/answer/10059070, 2026-10-01) | ratio ตัวเลขหน้านี้ไม่ได้ระบุ ใช้ 9:16 |
| Instagram Reels | ratio ระหว่าง 1.91:1 ถึง 9:16; ควร >= 30 fps และความละเอียด >= 720 px; ปกแนะนำ 420x654 px (https://www.facebook.com/help/1038071743007909 คือบทความเดียวกับ help.instagram.com/1038071743007909, เปิดอ่านฉบับภาษาไทย 2026-10-01) | ความยาวสูงสุด/ขนาดไฟล์: หน้าทางการไม่ระบุ; แหล่ง T3 ขัดกันเอง (90 วินาที/3/15/20 นาที) = UNVERIFIED -> ตั้งเป้า <= 90 วินาที. Safe zone ตัวเลข (บน ~250/ล่าง ~350 px) มาจาก T3 เท่านั้น: เว้นขอบข้อความอย่างน้อย ~10-20% บนและล่างไว้ก่อน |
| Facebook Reels | ตั้งแต่ ก.ย. 2025 "Reels = unified video" รองรับทุกความยาวและทุก ratio (https://www.facebook.com/help/166707406722029, 2026-10-01); ตาราง video requirements ระบุ 16:9 ถึง 9:16 (https://www.facebook.com/business/m/one-sheeters/video-requirements, 2026-10-01) | 1080x1920 เป็นขนาดแนะนำจากแหล่ง T3 เท่านั้น (ไม่พบหน้า T1) = UNVERIFIED แต่ใช้ได้ปลอดภัยเพราะเป็น 9:16 |
| TikTok | ข้อกำหนดของ **โฆษณา** In-Feed: 9:16 (แนะนำ), >= 540x960, mp4/mov/mpeg/3gp/avi, <= 500 MB, <= 10 นาที, bitrate >= 516 kbps (https://ads.tiktok.com/help/article/video-ads-specifications, 2026-10-01) | **สเปก organic อัปโหลดปกติ = UNVERIFIED** (หน้า help ที่เปิดไม่มีตัวเลข). ใช้ 1080x1920 mp4 <= 500 MB ไว้ก่อน |

**ค่า default ของคุณ (ข้อเสนอ ไม่ใช่ข้อกำหนดแพลตฟอร์ม):** แนวตั้งทุกช่อง = 1080x1920, 30 fps, `--quality delivery`, ความยาวเป้า 15-60 วินาที, เสียงสเตอริโอ; export **ไฟล์เดียว** ใช้ทุกแพลตฟอร์ม แล้วเช็ก safe zone บนมือถือ. 60 fps ทำเวลา render เป็นสองเท่า ไม่คุ้มกับงานตัวอักษร/talking head. ถ้า ffmpeg/Chrome ล้มบน Windows ให้รัน `npx hyperframes doctor` ก่อน (วินิจฉัยตาม `doctor-browser.md`)

## 7. Kickoff prompt (คัดลอกไปวาง; แก้เฉพาะ [ ])

```
โปรเจกต์: Video-hyperFrames\[NN]_[slug]  branch: [video/NN-slug]   (อ่าน AGENTS.md, STATE.md ก่อน)
ใช้ /hyperframes เป็นทางเข้า. ถ้า BRIEF.md ยังไม่มี ให้สร้างหลัง `npx hyperframes init` จากฟิลด์ด้านล่าง โดยไม่ถามซ้ำ

Brief (ล็อกแล้ว ห้ามเปลี่ยนเองกลางทาง):
- message (1 ประโยค): [ผู้ชมคือใคร ควรรู้/ทำอะไร]
- ปลายทาง: [Facebook Reels / IG Reels / TikTok / YouTube Shorts]   aspect: 1080x1920   fps: 30   ความยาวเป้า: [30] วินาที
- ภาษาบนจอ: ไทย   ฟอนต์: [Anuphan] (self-host woff2, OFL)   สี: [#xxxxxx / #xxxxxx / #xxxxxx]
- เพลง: [ไม่มี]   (ห้ามเพิ่ม bgm/sfx/voice เอง แม้ media-use เสนอ)
- ฟุตเทจ/รูปที่ใช้ได้ (ผ่านความยินยอมแล้ว): [path ใน raw\ หรือ "ไม่มี"]. ห้ามใช้ไฟล์อื่น
- สคริปต์ข้อความบนจอ (ใช้ตามนี้ทุกตัวอักษร): [วางข้อความ]
- storyboard: yes   flow: automation

กติกา:
1) ลำดับ: BRIEF.md -> frame.md (/hyperframes-creative) -> STORYBOARD.md + storyboard.html -> หยุดรอฉัน approve -> build -> `check` + snapshot -> preview -> หยุดรอฉันพิมพ์ "render"
2) เรียก skill ที่ต้องพิมพ์เอง (/hyperframes-core, /hyperframes-cli ฯลฯ) ตามที่ workflow ระบุ; pin เวอร์ชัน hyperframes ใน package.json และไม่อัปเกรดกลางงาน
3) ห้าม: แตะ Canva/CapCut/ไฟล์นอกโฟลเดอร์นี้, แก้/ลบไฟล์ใน raw\, `publish`, `cloud render`, `feedback --file-issue`, ติดตั้ง skill/dependency เพิ่ม โดยไม่ถาม
4) ไอเดียใหม่ระหว่างทาง -> ต่อท้าย BACKLOG.md ไม่ทำ. Feedback หลัง render รับรอบเดียว
5) เสร็จเมื่อ: ffprobe ตรง brief / `check` ผ่าน / ข้อความตรงสคริปต์ / RIGHTS.md ครบ / อ่านออกบนมือถือ
จบด้วยรายงานภาษาไทยตามรูปแบบใน core.md และอัปเดต STATE.md
```

## 8. ตรวจซ้ำรายเดือน (re-verify)

ต้นเดือน (หรือก่อนโปรเจกต์ใหม่): (1) `npm view hyperframes version` + หน้า release https://github.com/heygen-com/hyperframes/releases (2) `npm view @fontsource/anuphan version` (3) `node -v` เทียบ https://nodejs.org/dist/index.json; FFmpeg เทียบ https://ffmpeg.org/download.html (4) `npx hyperframes doctor` (5) เปิดหน้า spec ของแพลตฟอร์มใน section 6 ใหม่ (6) อัปเดตตารางและบรรทัด **Last verified**; ถ้า major/minor ของ HyperFrames เปลี่ยน ให้ลองกับโปรเจกต์ทดลองก่อน อย่าอัปเกรดโปรเจกต์ที่ approve แล้ว

**ยังไม่รู้ ณ 2026-10-01:** FFmpeg 9.x กับ HyperFrames; ชนิด codec ของ output default (H.264? faststart?); license BGM/รูปจาก catalog ของ HeyGen; สเปก organic ของ TikTok; ความยาวสูงสุดของ IG Reels; guideline ต้นฉบับของ PDPC เรื่องภาพถ่าย; เงื่อนไข CapCut Sounds ฉบับเต็ม; Remotion license กับสถานะองค์กรของชมรม; การตัดคำไทยของ HyperFrames ในคำบรรยายยาว
