# HANDOVER — คู่มือส่งมอบ PV Dashboard (จุดเริ่มต้น)

เอกสารส่งมอบระดับ "องค์กร/เจ้าของ" — สำหรับผู้ดูแลใหม่ของบริษัทที่จะรับช่วงต่อ
(เน้น ownership + กระบวนการ; รายละเอียด "โค้ด" อยู่ใน `PV-DASHBOARD-HANDOFF.md`)

> ⚠️ repo นี้ **public** — เอกสารทั้งชุดใช้ placeholder แทนอีเมล/secret จริง

---

## 1. โปรเจกต์นี้คืออะไร (30 วินาที)
แดชบอร์ดผู้บริหารติดตามโครงการโซลาร์เซลล์ (PV) ของ PowerVault Thailand
สถานะ 2-Layer (Bidding/Hold/Win/Lost) · ดึงข้อมูลสดจาก Google Sheet · โฮสต์บน Vercel (auto-deploy จาก `main`)
ทั้งแอปคือไฟล์เดียว `index.html` (ไม่มี build/framework)

## 2. เอกสารทั้งหมด (อ่านตามลำดับ)
| ไฟล์ | เนื้อหา |
|---|---|
| **`HANDOVER.md`** (นี้) | ภาพรวมส่งมอบ + onboarding ผู้ดูแลใหม่ |
| **`MIGRATION.md`** | ขั้นตอนย้าย ownership → บริษัท (เช็คลิสต์ + สถานะ) |
| **`OWNERSHIP.md`** | ผังทรัพยากร + access matrix + env var (ชื่อ) |
| `PV-DASHBOARD-HANDOFF.md` | handoff เชิงเทคนิค (จุดเข้าโค้ด, how-to) |
| `ARCHITECTURE.md` / `DATA-STRUCTURE.md` | สถาปัตยกรรม + โมเดลข้อมูล |
| `DEPLOY-SETUP.md` | ตั้งค่าปุ่ม Deploy รายงาน (env var) |
| `DEBUGGING-LOG.md` / `CHANGELOG.md` | บั๊กที่เคยเจอ + ประวัติเวอร์ชัน |
| `CLAUDE.md` | แนวทางสำหรับ AI assistant |

## 3. Onboarding ผู้ดูแลใหม่ (เช็คลิสต์)
- [ ] ได้รับสิทธิ์: GitHub (Org Owner) · Vercel · Google Sheet/Script — ดู `OWNERSHIP.md`
- [ ] Clone repo + อ่าน `CLAUDE.md` (กฎการแก้โค้ด) + `PV-DASHBOARD-HANDOFF.md`
- [ ] เข้าใจ flow deploy: แก้ `index.html` → PR เข้า `main` → Vercel auto-deploy
- [ ] รู้วิธีตรวจ syntax (ไม่มี CI — ดู `CLAUDE.md` ข้อ 4)
- [ ] ทดลอง: กรองข้อมูล, Export, ปุ่ม Deploy รายงาน, `/exec`

## 4. งานดูแลประจำ
- แก้/เพิ่มฟีเจอร์ dashboard → แก้ `index.html` (เป็น additive, ดู banner เวอร์ชันในไฟล์)
- เปลี่ยนชีต Executive View → ค่า `EXEC_SHEET_ID` ใน `index.html`
- ปุ่ม Deploy ไม่ทำงาน → ตรวจ `VERCEL_DEPLOY_TOKEN` + โปรเจกต์รายงานต้อง public (ดู `DEBUGGING-LOG.md`)

## 5. สถานะการส่งมอบ (อัปเดตเมื่อคืบหน้า)
- ⬜ ย้าย ownership → บริษัท: **ยังไม่เริ่ม** (ดู `MIGRATION.md` สำหรับขั้นตอน/สถานะ)
- ⬜ ผู้ดูแลใหม่รับสิทธิ์ครบ
- ⬜ ถอดเจ้าของเดิม (ขั้นสุดท้าย หลังทดสอบผ่าน)

## 6. ข้อควรรู้ / ความเสี่ยง
- ไม่มี automated test — ต้องตรวจ syntax เอง + ทดสอบบนเว็บจริง
- เปิดจากไฟล์ในเครื่อง (`file://`) ฟีเจอร์เต็มไม่ทำงาน (Deploy/Google Sheet CORS)
- รายงานที่ deploy = snapshot (ไม่ live) — กด Deploy ใหม่เพื่ออัปเดต
- เอกสารทุกไฟล์ควร **อัปเดตคู่กับการเปลี่ยนแปลง** เพื่อให้ handover ใช้ได้จริงต่อไป
