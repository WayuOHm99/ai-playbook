# Stack recipe: แอปมือถือ (PWA / Expo / Capacitor / LINE LIFF)

- **Last verified: 2026-10-01** (เวอร์ชันดึงจาก npm registry, expo.dev, developers.line.biz ฯลฯ วันเดียวกัน; `[S#]` ดู "แหล่งอ้างอิง" ท้ายไฟล์; "accessed" = 2026-10-01 ถ้าไม่ระบุ)
- **ต้อง re-verify ทุกเดือน** (section 9): Expo SDK 58 ยังเป็น beta, LIFF เพิ่งออกแพตช์ความปลอดภัย
- "UNVERIFIED" = ยังไม่ยืนยันจาก primary source ที่เปิดอ่านจริง ห้ามใช้ตัดสินใจ ต้องตรวจก่อน
- ต่อจาก `stacks/hospital-web.md` (เว็บ Vue/Express/MySQL เป็นตัวเลือกตั้งต้น); ตรวจ feasibility ก่อนเลือกวิธีสร้าง
- ปรับ 2026-10-06: ยกเลิกการอ้างประวัติส่วนตัวเป็นหลักฐานของ recipe นี้ ทุกโปรเจกต์ใหม่ต้องตรวจ API/data access, สิทธิ์นักศึกษา/หน่วยงาน, network และค่าใช้จ่ายจากแหล่งที่ยืนยันได้ก่อน build

หลักการข้อเดียว: **เริ่มที่ PWA บนเว็บ stack เดิมเสมอ ออกไปทางอื่นเมื่อ (1) ผ่าน feasibility gate (section 3) และ (2) พิสูจน์ได้ว่า PWA ทำข้อที่จำเป็นไม่ได้จริง** (ตรงกับ hospital-web section 8: "ต้อง push/NFC/MDM -> Native หลังพิสูจน์ว่า PWA ไม่พอ")

---

## 1. Decision guide: เลือกทางไหน (ตอบตามลำดับ ข้อแรกที่ตรงชนะ)

1. ผู้ใช้อยู่ใน LINE อยู่แล้วและไม่ยอมติดตั้งอะไร (ประชาชน/ลูกค้า) -> **LIFF** (ถ้ามีข้อมูลสุขภาพต้องผ่าน DPO ก่อน section 7)
2. ต้อง NFC / Bluetooth / background location / HealthKit / ติดตั้งแบบ managed ผ่าน MDM -> **Expo (development build)** หลัง spike บนเครื่องจริงใน gate
3. ต้องอยู่ใน App Store/Play Store จริง (ผู้ใช้ภายนอก) และมีเว็บ Vue แล้ว -> **Capacitor**; ถ้าเริ่มใหม่ไม่มีเว็บ -> **Expo**
4. นอกนั้น (เช็กอิน QR, ฟอร์มภาคสนาม, ดูข้อมูล, แจ้งเตือนเบา ๆ ภายในหน่วยงาน) -> **PWA** (ค่าเริ่มต้น)

| เกณฑ์ | PWA | Expo / React Native | Capacitor | LINE LIFF / MINI App |
|---|---|---|---|---|
| Offline | Service worker + IndexedDB; iOS ลบ storage เว็บที่ไม่ได้ใช้ 7 วัน แต่แอปที่ Add to Home Screen นับวันแยก [S14] | ดีสุด (SQLite/ไฟล์) | เหมือน PWA + plugin | ไม่ใช่จุดแข็ง (SW ใน LIFF = UNVERIFIED) |
| กล้อง / QR | `getUserMedia` ต้อง HTTPS ที่มือถือเชื่อถือ (hospital-web 6.2); QR ใช้ polyfill ZXing [S1] | `expo-camera` `onBarcodeScanned` [S8] | plugin / เว็บ | `liff.scanCodeV2()` iOS 14.3+ ต้องขนาด Full [S17] |
| Push บน iOS | iOS 16.4+ **หลัง Add to Home Screen** และขอสิทธิ์ต้องจากการกดของผู้ใช้ [S12]; Safari 18.4 มี Declarative Web Push [S13] | ต้องมีบัญชี Apple จ่ายเงิน (APNs); Android ต้อง dev build ตั้งแต่ SDK 53 [S7] | APNs/FCM ต้องบัญชี Apple จ่ายเงิน | ไม่มี push ของแอป; ส่งผ่าน LINE OA นับโควตาข้อความ [S21] |
| App store | ไม่ต้อง | ต้อง (หรือแจก internal) | ต้อง; Apple 4.2 เตือน "repackaged website" [S11] | ไม่ต้อง; MINI App ไทยเผยแพร่แบบ unverified ได้ตั้งแต่ 2026-03-11 [S19]; verified ต้อง certified provider + รีวิว 1-2 สัปดาห์ [S20] |
| แจกภายใน / MDM | แชร์ URL; MDM ผลักไอคอน (UNVERIFIED ถาม IT) | Android แจก APK ตรง; iOS ad hoc ต้องบัญชีจ่ายเงิน <= 100 เครื่อง/ปี; ไม่จำกัดต้อง Enterprise Program [S6] | เหมือน Expo | แชร์ลิงก์ LINE |
| ค่าบัญชี | 0 | Apple $99/ปี [S9] + Google $25 ครั้งเดียว [S10] + EAS (ฟรี 15 build/OS/เดือน คิวช้า; Starter $19/เดือน) [S5] | Apple + Google เท่ากัน + cloud Mac | LINE OA: ฟรี 300 ข้อความ/เดือน; Basic 1,280 บาท/15,000; Pro 1,780 บาท/35,000 (ไม่รวม VAT) [S21] |
| Build iOS บน Windows | ไม่เกี่ยว (ทดสอบด้วยเครื่องจริง) | ได้ผ่าน **EAS Build** (macOS cloud) [S4]; ไม่มี simulator ในเครื่อง | **ไม่ได้ในเครื่อง** ต้อง macOS + Xcode >= 26 [S22]; ต้องหา cloud Mac (Appflow ปิด 2027-12-31 [S23]) | ไม่เกี่ยว |
| ใช้ stack เดิมซ้ำ | ทั้งหมด | น้อย (reuse แค่ `packages/domain` zod) | ทั้งหมด | ทั้งหมด + LINE Login channel [S16] |
| ภาระดูแล | ต่ำสุด | สูง: SDK 56 (05-21), 57 (06-30), 58 beta (09-15) [S2] = อัปทุก 1-4 เดือน | กลาง | กลาง: LIFF เก่ากว่า 2.31.1 ถูก deprecated เพราะช่องโหว่ [S19] |

เหตุผลที่ PWA เป็นค่าเริ่มต้น: ไม่มีค่าบัญชี ไม่มี review deploy ผ่าน Caddy เดิม ใช้ Vue/Playwright เดิม. ข้อจำกัดจริง: iOS push ต้อง Add to Home Screen และ Apple ห้ามใช้ push ส่งข้อมูลอ่อนไหว (4.5.4) [S11]

---

## 2. Stack ต่อแต่ละทาง (verified 2026-10-01 จาก npm registry [S1] เว้นแต่ระบุ)

### 2.1 PWA (ทางหลัก) บน hospital-web stack
| Layer | เลือกใช้ | Version | หมายเหตุ |
|---|---|---|---|
| Base | Vue 3 + Vite | 3.5.43 / 8.3.2 | hospital-web บันทึก Vite 8.3.1 ถ้าต่างกันให้ถือ registry วันตรวจ |
| PWA plugin | vite-plugin-pwa (Workbox) | 1.3.0 | peer รองรับ Vite ^8, workbox-build ^7.4.1 |
| QR/barcode | `barcode-detector` (polyfill ZXing wasm) | 3.2.2 | ไม่พึ่ง `BarcodeDetector` ของ Safari (iOS รองรับเองไหม = UNVERIFIED) |
| Web Push (server) | web-push (VAPID) | 3.6.7 | ใช้เมื่อผ่าน gate ข้อ 5 |
| E2E | Playwright | 1.63.0 | section 6 |
| Runtime | Node 24 LTS | 24.21.0 | ตาม hospital-web (ไม่ได้ตรวจซ้ำ) |

### 2.2 Expo / React Native (เมื่อ PWA ไม่พอ)
| Layer | เลือกใช้ | Version | หมายเหตุ |
|---|---|---|---|
| SDK | expo | 57.0.26 | SDK 57 (2026-06-30) = RN 0.86, React 19.2 [S3]; **ห้ามใช้ SDK 58 beta** จนเป็น stable |
| React Native | ให้ SDK กำหนด (`npx expo install`) | 0.86.x | npm `latest` ของ react-native = 0.87.1 ไม่ตรง SDK 57 ห้ามติดตั้งเอง |
| Routing / Build | expo-router / eas-cli | 57.0.24 / 24.8.0 | eas-cli ต้อง Node ^20.18.3 หรือ >=22 |
| Camera / Push | expo-camera / expo-notifications | ตาม `expo install` | push ต้อง dev build บน Android [S7]; ห้ามพึ่ง Expo Go (SDK 57 แนะนำย้ายไป dev build, Expo Go ตัวใหม่รออนุมัติ store [S3]) |
| Backend (ส่วนตัวเท่านั้น) | @supabase/supabase-js | 2.117.2 | โรงพยาบาลใช้ API ของ house stack ไม่ใช่ Supabase (hospital-web section 8) |
| E2E | Maestro CLI | 2.11.0 (2026-09-29) [S24] | ต้อง Java 17+ [S25] |

### 2.3 Capacitor (เฉพาะมีเว็บ Vue แล้วและต้องขึ้น store)
@capacitor/core + cli **8.5.2**; Node >=22, Xcode >= 26 (macOS เท่านั้น), Android Studio >= 2025.2.1 [S22]. บน Windows ทำ Android ได้ในเครื่อง ส่วน iOS ต้อง cloud Mac (ผู้ให้บริการ = UNVERIFIED ตรวจก่อนเลือก). Capacitor/Ionic Framework ยังฟรีและมีคนดูแล แต่ Appflow ปิด 2027-12-31 [S23]

### 2.4 LINE LIFF / MINI App
`@line/liff` **2.31.1** ใช้ >= 2.31.1 เท่านั้น (2.20.0-2.31.0 deprecated เพราะปัญหาความปลอดภัย [S19]); ต้องมี LINE Login channel [S16]. MINI App: 1 เว็บต่อ 1 channel, ขนาด Full อย่างเดียว [S18]. ข้อมูลผ่าน LINE -> section 7

### 2.5 ที่ปฏิเสธ
| ตัวเลือก | เหตุผล |
|---|---|
| Flutter (stable 3.47.5, 2026-09-18 [S27]) | ต้องเรียน Dart และ reuse zod/TS/Vue ไม่ได้ (ข้อสังเกตผู้เขียน ไม่ใช่ข้อเท็จจริงจากแหล่ง); คนเดียวไม่ควรดูแลสอง ecosystem |
| Ionic Framework (UI) | Capacitor ใช้ได้โดยไม่ต้องมี Ionic UI; ค่าเริ่มต้นคือ Tailwind + reka-ui ตาม hospital-web |
| Native (Swift/Kotlin) | ต้องมี Mac + สองโค้ดเบส; ใช้เมื่อพิสูจน์แล้วว่าทุกทางข้างบนไม่พอ |
| Expo Go เป็นเครื่องมือหลัก | Android push ใช้ไม่ได้ [S7]; ใช้ลองเร็วใน tier demo เท่านั้น |

---

## 3. Feasibility gate: ทำให้ครบ **ก่อน** scaffold ใด ๆ (ผลลง `docs/FEASIBILITY.md`)

หลักฐานต้องเป็นผลทดสอบหรือลิงก์ที่เปิดอ่านแล้ว ไม่ใช่ความเชื่อ (pitfalls ข้อ 8). ผลลัพธ์เป็น **GO / NO-GO / SMALLER** หนึ่งค่า; ถ้าข้อ 1-3 ไม่มีหลักฐาน = ห้ามเขียนโค้ดแอป

- [ ] 1. **Data/API access:** เรียกแหล่งข้อมูลจริง 1 ครั้งด้วยสิทธิ์ที่โปรเจกต์จะใช้จริง (บันทึกคำสั่ง+ผล); อ่าน ToS ว่าอนุญาตกรณีของเรา (นักศึกษา/ส่วนตัว/โรงพยาบาล); ห้ามออกแบบที่ต้องเก็บรหัสผ่านของคนอื่น
- [ ] 2. **ผู้ใช้และเครื่อง:** สัดส่วน iOS/Android, OS ต่ำสุด (PWA push iOS >= 16.4 [S12]); มีเครื่องจริงอย่างน้อย 1 เครื่องต่อ OS
- [ ] 3. **ทำไมไม่ใช่ PWA:** ระบุสิ่งที่ PWA ทำไม่ได้ + spike 1 วันบนเครื่องจริงพิสูจน์; ตอบไม่ได้ = SMALLER (ทำ PWA)
- [ ] 4. **Store accounts:** ต้องขึ้น store ไหม? Apple $99/ปี (บุคคลใช้ชื่อตามกฎหมาย, องค์กรต้องมี D-U-N-S) [S9]; Google $25 และ personal account ใหม่มีข้อกำหนดทดสอบก่อนเผยแพร่ [S10]; **บัญชีเป็นของใคร** (แอปโรงพยาบาลห้ามผูกบัญชีส่วนตัว -> ถาม IT/ผู้บริหาร)
- [ ] 5. **Push:** ใครส่ง ส่งอะไร ถี่แค่ไหน; iOS PWA ต้อง Add to Home Screen; ห้ามข้อมูลอ่อนไหวใน push [S11]; LIFF ผ่าน OA มีโควตา [S21]
- [ ] 6. **Device APIs:** กล้อง/QR, location, NFC, Bluetooth, background: spike บนเครื่องจริงผ่าน HTTPS ที่มือถือเชื่อถือ (internal CA ลงมือถือได้ไหม: hospital-web section 9 ข้อ 4)
- [ ] 7. **เครือข่าย:** มือถือเข้า server ได้จากไหน (Wi-Fi โรงพยาบาลเท่านั้น/4G/VPN); store app คุยกับ intranet ต้องถาม IT
- [ ] 8. **แจกภายใน/MDM:** ถาม IT ว่ามี MDM อะไร ยอมติดตั้ง APK นอก Play ไหม Apple Business Manager custom apps ใช้ได้ไหม (UNVERIFIED ยังไม่ได้อ่านเอกสาร Apple)
- [ ] 9. **Build บน Windows:** iOS = EAS Build/cloud Mac เท่านั้น; รับได้ไหมที่ iOS test ต้องใช้เครื่องจริงและคิวฟรีช้า
- [ ] 10. **ต้นทุน+ภาระ/เดือน:** บัญชี + EAS/LINE OA + เวลาอัป SDK; เจ้าของระบบหลังฝึกงานจบคือใคร
- [ ] 11. **ทางที่เล็กกว่า 10 เท่า:** responsive web / PWA / LINE OA ข้อความธรรมดา ทำได้ไหม เขียนเหตุผลที่ไม่เลือก
- [ ] 12. **ข้อมูลบนอุปกรณ์:** ไม่มีข้อมูลผู้ป่วย/สุขภาพถ้าไม่ผ่าน DPO (section 7)

---

## 4. Tier: demo / ใช้ภายใน / ใช้จริง (ต่อยอด hospital-web section 3; ทำเท่าที่ tier ต้องการ)

### Tier 1: demo (ผู้ใช้ 1-3 คน, ข้อมูล synthetic)
- [ ] ผ่าน gate section 3 ข้อ 1-3 (ทุก tier)
- [ ] PWA: LAN/localhost; Expo: dev build หรือ Expo Go บนเครื่องตัวเอง; LIFF: channel ทดสอบ
- [ ] ป้าย "DEMO / ข้อมูลทดสอบ"; `RUN.md` ใช้ได้ใน 10 นาที; test เขียว; key/`.env` ไม่ commit
- ไม่ต้องมี: store account, push จริง, backup, offline เต็มรูปแบบ

### Tier 2: ใช้ภายใน (หน่วยงานเดียว, ข้อมูลบุคลากร/ทรัพย์สิน ไม่ใช่ผู้ป่วย)
- [ ] ครบ tier 1 + tier 2 ของ hospital-web (เจ้าของระบบ, Docker + Caddy, RBAC ฝั่ง server, backup + restore drill, audit log, ROPA)
- [ ] PWA: HTTPS ด้วย CA ที่มือถือเชื่อถือ; manifest + icon ครบ; ทดสอบ Add to Home Screen บน iOS/Android **เครื่องจริง**; Playwright mobile ผ่าน
- [ ] Expo/Capacitor: build ติดตั้งได้ (APK / ad hoc / TestFlight) + ขั้นตอนอัปเดตใน `HANDOVER.md`; keystore/credentials เก็บนอก repo และบอกว่าใครถือ
- [ ] Token ใน secure storage ของ OS (RN) หรือ cookie `httpOnly` (PWA); ไม่ใส่ข้อมูลอ่อนไหวใน push; privacy notice บอกสิทธิ์อุปกรณ์ที่ขอ

### Tier 3: ใช้จริง (หลายหน่วย / ผู้บริหารพึ่งพา / ขึ้น store)
- [ ] ครบ tier 2 + tier 3 ของ hospital-web (IT + DPO อนุมัติลายลักษณ์อักษร, MFA admin, breach runbook, sign-off)
- [ ] บัญชี Apple/Google/LINE เป็นขององค์กร ผู้ดูแล >= 2 คน; วันต่ออายุ Apple รายปีอยู่ในปฏิทิน
- [ ] ผ่าน store review (Apple 4.2, 5.1.1 privacy policy + consent [S11]) หรือ MINI App ผ่านรีวิว [S20]
- [ ] Kill switch: บังคับอัปเดต/ตัดเวอร์ชันเก่า, remote logout, แผนรับ OS/SDK ใหม่; error tracking self-host เท่านั้น

---

## 5. Folder template

```
<project>/ AGENTS.md STATE.md BACKLOG.md DECISIONS.md HANDOVER.md RUN.md docs/FEASIBILITY.md   (เหมือน hospital-web section 4)
  apps/web     Vue + vite-plugin-pwa: public/{manifest.webmanifest,icons/} src/pwa/{sw.ts,install.ts,push.ts} src/features/<feature>/
  apps/mobile  (เฉพาะ gate ผ่าน) Expo: app/ (expo-router) src/features/<feature>/ app.config.ts eas.json .maestro/*.yaml
  apps/liff    (เฉพาะ LIFF) src/liff/init.ts (liff.init, guard isInClient)
  apps/api  packages/domain (zod ใช้ร่วม web/mobile)  database/  deploy/  docs/{decisions,security,device-test.md}  e2e/
```
กฎ: logic ธุรกิจอยู่ใน `packages/domain`/`apps/api` ไม่อยู่ใน component; ฝั่ง client ใช้เฉพาะ public key (VAPID public, LIFF ID) ห้ามมี service key ในแอป

---

## 6. Testing

- **PWA:** Playwright projects `devices['iPhone 13']` (WebKit) + อุปกรณ์ Android (Chromium; ชื่อรุ่นดูจาก `playwright.devices` ในโปรเจกต์ UNVERIFIED) + axe ทุกหน้า [S26]. Offline/SW ทดสอบบน Chromium (`serviceWorkers: 'allow'`, `context.setOffline(true)`) [S26]
- **Playwright WebKit ไม่ใช่ iOS Safari จริง:** Add to Home Screen, iOS push, กล้อง, storage eviction ต้องทดสอบบนเครื่องจริง บันทึกใน `docs/device-test.md` (วันที่ + รุ่น + OS version)
- **Expo/RN:** logic ใน `packages/domain` ทดสอบด้วย Vitest; UI ด้วย Maestro flow ใน `.maestro/` (CLI 2.11.0, Java 17+) [S24][S25]; บน Windows รัน iOS simulator ไม่ได้ ใช้เครื่องจริงหรือ Maestro Cloud (ราคา UNVERIFIED) [S25]; Android emulator + Maestro บน Windows ยัง UNVERIFIED ให้ลองใน gate; push Android ทดสอบด้วย dev build [S7]
- **LIFF:** ทดสอบใน LINE จริงทั้ง iOS/Android (`scanCodeV2` ใช้ได้ใน LIFF browser ขนาด Full) [S17]; ใช้ `liff.isInClient()` แยกกรณีเปิดนอก LINE

---

## 7. Privacy / PDPA สำหรับข้อมูลจากอุปกรณ์ (ไม่ใช่คำแนะนำกฎหมาย ให้ DPO ยืนยัน; มาตราตาม hospital-web section 7)

- [ ] ทำ inventory ข้อมูลอุปกรณ์: ภาพกล้อง, ตำแหน่ง (ละเอียดแค่ไหน), push token, device ID, LINE userId -> ROPA (s.39) + วัตถุประสงค์ + retention
- [ ] ขอสิทธิ์ตอนใช้งานจริง ไม่ขอรวดเดียวตอนเปิดแอป; ข้อความขอสิทธิ์บอกเหตุผลจริง; Apple ต้องมี privacy policy ใน App Store Connect และในแอป และต้อง consent ก่อนเก็บข้อมูล [S11]
- [ ] **Push ไม่มีข้อมูลผู้ป่วย/สุขภาพ** ใช้ข้อความกลาง ("มีรายการใหม่") แล้วให้เปิดแอปดู (Apple 4.5.4 [S11]); payload ผ่าน FCM/APNs/Expo push (ต่างประเทศ) จึงต้องเบา
- [ ] มือถือหายได้: ไม่เก็บข้อมูลอ่อนไหวใน localStorage/IndexedDB/AsyncStorage; token ใน secure storage; session สั้น + remote logout; ลบ cache เมื่อ logout
- [ ] LINE/LIFF = ข้อมูลผ่านผู้ให้บริการต่างประเทศ (LY Corporation): **ห้ามใส่ข้อมูลสุขภาพ/ผู้ป่วย**จนกว่า DPO อนุมัติ (ประเด็น s.28 แบบเดียวกับ Sentry ใน hospital-web 6.4; ที่ตั้งผู้ให้บริการ = UNVERIFIED)
- [ ] SDK analytics/crash บุคคลที่สาม: ปิดโดยค่าเริ่มต้น ถ้าจำเป็นใช้ self-host (hospital-web 6.4)
- [ ] BYOD: ถาม IT ว่านโยบายอนุญาตมือถือส่วนตัวกับระบบโรงพยาบาลไหม และต้องลงทะเบียนเครื่องอย่างไร

---

## 8. Kickoff prompt (copy-paste; บังคับ feasibility ก่อนเสมอ)

```text
โปรเจกต์มือถือใหม่: <ชื่อ>. ใช้ grill-with-docs ระบุข้อจำกัด แล้วอ่าน D:\ai-playbook\stacks\mobile-pwa.md เป็น reference สำหรับ feasibility ก่อน build.
ประเภทงาน: P7 (โปรเจกต์ใหม่) = คุยก่อน ห้ามเขียนโค้ด ห้าม scaffold ห้ามติดตั้ง dependency.
เป้าหมาย: <1-2 ประโยค ใครใช้ ทำอะไร ข้อมูลอะไร> | tier: <demo / ใช้ภายใน / ใช้จริง> | อุปกรณ์: <iOS/Android/ทั้งคู่>
ทำตามลำดับ:
1) สรุปเกณฑ์ "เสร็จเมื่อ" ที่ตรวจได้ไม่เกิน 5 ข้อ ให้ฉันยืนยัน
2) รัน feasibility gate (section 3) ทีละข้อ: ข้อ 1-3 ต้องมีหลักฐานจริง (ผลเรียก API, ลิงก์ ToS ที่เปิดอ่านแล้ว, ผล spike บนเครื่องจริง) ข้อที่ตรวจไม่ได้ให้เขียน UNVERIFIED และบอกว่าฉันต้องถามใคร
3) เสนอ PWA / Expo / Capacitor / LIFF ตาม decision guide โดยเริ่มจาก PWA; บอกความเสี่ยงใหญ่สุดและทางที่เล็กกว่า 10 เท่า
4) เขียนผลลง docs/FEASIBILITY.md ลงท้ายด้วย GO / NO-GO / SMALLER หนึ่งค่า แล้วหยุดรอฉันอนุมัติ
ห้าม: ขอหรือรับรหัสผ่าน/คีย์ในแชท (ใช้ชื่อ env var), ใช้บัญชี Apple/Google/LINE โดยไม่ถามฉัน, ใช้ข้อมูลผู้ป่วยหรือข้อมูลจริงของโรงพยาบาล, เพิ่มสิ่งที่ไม่ได้ขอ (ลง BACKLOG.md แทน)
ถ้า NO-GO ให้บอกเหตุผลสั้น ๆ และเสนอทางที่ถูกกว่า ไม่ต้องหาทางอ้อม
```

เปลี่ยนทาง (PWA -> Capacitor/Expo/LIFF) ต้องเขียนเหตุผลลง `DECISIONS.md` ก่อน และ gate ข้อ 3 ต้องมีหลักฐานของความสามารถที่ PWA ไม่พอ; Expo/Supabase ส่วนตัวทำได้ แต่ห้ามมี PII/credential โรงพยาบาล (hospital-web section 8)

---

## 9. ตรวจซ้ำรายเดือน (re-verify)

ทุกต้นเดือน ให้ agent: (1) `npm view <pkg> version` ทุกแถวใน section 2 (expo, expo-router, eas-cli, vite-plugin-pwa, barcode-detector, web-push, @capacitor/core, @line/liff, @supabase/supabase-js, @playwright/test) + ดู https://expo.dev/changelog (2) ดู https://developers.line.biz/en/news/ (3) เช็กค่าบัญชี Apple/Google, ราคา EAS, LINE OA (4) อัปเดตคอลัมน์ Version + **Last verified** (5) ถ้า major เปลี่ยน เปิด issue ไม่ใช่อัปเกรดทันที; อัป Expo SDK บน branch แยกด้วย `npx expo install expo@latest --fix`
ยังไม่รู้ ณ 2026-10-01: SDK 58 stable เมื่อไร; Apple Business Manager custom apps/MDM ของโรงพยาบาล; Android emulator + Maestro บน Windows; iOS รองรับ `BarcodeDetector` เองไหม; cloud Mac สำหรับ Capacitor; LIFF 2.31.2 (ประกาศเปลี่ยนการจัดการ query วันที่ 2026-10-07) กระทบเราไหม

---

## แหล่งอ้างอิง (T1 = เอกสาร/registry ทางการ; accessed 2026-10-01 ถ้าไม่ระบุวันที่)

- [S1] T1 `registry.npmjs.org/<pkg>/latest` (npm): expo 57.0.26, expo-router 57.0.24, react-native 0.87.1, eas-cli 24.8.0, vite 8.3.2, vite-plugin-pwa 1.3.0, vue 3.5.43, @playwright/test 1.63.0, web-push 3.6.7, barcode-detector 3.2.2, @capacitor/core+cli 8.5.2, @line/liff 2.31.1, @supabase/supabase-js 2.117.2
- [S2] T1 https://expo.dev/changelog (Expo): SDK 58 beta 2026-09-15, SDK 57 2026-06-30, SDK 56 2026-05-21
- [S3] T1 https://expo.dev/changelog/sdk-57 (Expo, 2026-06-30): RN 0.86, React 19.2, Expo Go/dev build
- [S4] T1 https://docs.expo.dev/build/introduction/ (Expo): iOS builds บน macOS runners
- [S5] T1 https://expo.dev/pricing (Expo): Free 15 Android + 15 iOS/เดือน low priority; Starter $19; Production $199
- [S6] T1 https://docs.expo.dev/build/internal-distribution/ (Expo): ad hoc 100 เครื่อง/ปี, Enterprise Program, APK ตรง
- [S7] T1 https://docs.expo.dev/versions/latest/sdk/notifications/ (Expo): Android push ต้อง dev build ตั้งแต่ SDK 53; iOS ต้องบัญชี Apple จ่ายเงิน
- [S8] T1 https://docs.expo.dev/versions/latest/sdk/camera/ (Expo): barcode scanning
- [S9] T1 https://developer.apple.com/programs/enroll/ (Apple): $99/ปี, D-U-N-S สำหรับองค์กร
- [S10] T1 https://support.google.com/googleplay/android-developer/answer/6112435 (Google): $25 ครั้งเดียว
- [S11] T1 https://developer.apple.com/app-store/review/guidelines/ (Apple): 4.2, 4.5.4, 5.1.1
- [S12] T1 https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ (WebKit, 2023-02-16)
- [S13] T1 https://webkit.org/blog/16574/webkit-features-in-safari-18-4/ (WebKit): Declarative Web Push
- [S14] T1 https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/ (WebKit; ไม่เห็นวันเผยแพร่ในผลที่ดึง): 7-day cap + home screen app แยกตัวนับ
- [S16] T1 https://developers.line.biz/en/docs/liff/overview/ (LY Corporation): ต้องมี LINE Login channel
- [S17] T1 https://developers.line.biz/en/reference/liff/ (LY Corporation): `scanCodeV2` iOS 14.3+, ขนาด Full
- [S18] T1 https://developers.line.biz/en/docs/line-mini-app/discover/introduction/ (LY Corporation): unverified vs verified, 1 เว็บต่อ channel
- [S19] T1 https://developers.line.biz/en/news/2026/ (LY Corporation): ไทย/ไต้หวัน unverified ได้ตั้งแต่ 2026-03-11; LIFF 2.20.0-2.31.0 deprecated, 2.31.1 ลง Sept 30; 2.31.2 กำหนด Oct 7 (ปีของรายการตามหน้า "2026" ผ่านตัวสรุป ควรเปิดตรวจเอง)
- [S20] T1 https://developers.line.biz/en/docs/line-mini-app/submit/submission-guide/ (LY Corporation): รีวิว 1-2 สัปดาห์, ไทยต้อง certified provider สำหรับ verified
- [S21] T1 https://lineforbusiness.com/th/service/line-oa-features/broadcast-message (LINE Thailand; ไม่ระบุวันที่): Free 300 / Basic 1,280 บาท 15,000 / Pro 1,780 บาท 35,000. **ขัดกับบทความบุคคลที่สาม** (T3: ฟรี 200, Light 1,200 บาท) เชื่อหน้าทางการเพราะเจ้าของราคา แต่ราคาอาจเปลี่ยน ตรวจก่อนสัญญา
- [S22] T1 https://capacitorjs.com/docs/getting-started/environment-setup (Capacitor): Node 22+, Xcode 26+, macOS
- [S23] T1 https://ionic.io/blog/important-announcement-the-future-of-ionics-commercial-products (Ionic, 2025-02-11): Appflow ถึง 2027-12-31; Capacitor ไม่กระทบ. UNVERIFIED: "Appflow สร้างแอปใหม่ไม่ได้ตั้งแต่ 2026-10-01" มาจากผลค้นหาเท่านั้น
- [S24] T1 https://api.github.com/repos/mobile-dev-inc/Maestro/releases/latest (GitHub): cli-2.11.0, 2026-09-29
- [S25] T1 https://docs.maestro.dev (Maestro): Windows ต้อง Java 17+; iOS simulator บน Windows ไม่ได้
- [S26] T1 https://playwright.dev/docs/emulation และ /docs/service-workers (Microsoft)
- [S27] T1 https://storage.googleapis.com/flutter_infra_release/releases/releases_windows.json (Flutter): stable 3.47.5, 2026-09-18
- [S28] T1 https://developer.apple.com/support/compare-memberships/ (Apple): Personal Team ฟรี ใช้ได้ 3 เครื่อง โปรไฟล์หมด 7 วัน ไม่มี App Store Connect/TestFlight
