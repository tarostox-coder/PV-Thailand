# PV DASHBOARD — HANDOFF

เอกสารส่งต่องาน (handoff) สำหรับผู้ดูแล/นักพัฒนาคนถัดไป หรือ AI assistant
อ่านไฟล์นี้ก่อน แล้วค่อยลงลึกที่ `ARCHITECTURE.md` / `DATA-STRUCTURE.md`

---

## 1. ภาพรวม 60 วินาที

- **คืออะไร:** แดชบอร์ดผู้บริหารติดตามโครงการโซลาร์เซลล์ (PV) — งานขาย→ติดตั้ง
  สถานะ 2-Layer (Bidding/Hold/Win/Lost), ดึงข้อมูลสดจาก Google Sheet
- **เทคโนโลยี:** ไฟล์เดียว `index.html` (HTML+CSS+Vanilla JS) — ไม่มี build, ไม่มี framework
- **โฮสต์:** Vercel (static + serverless) จาก branch `main`
- **คนใช้งานจริง:** ผู้บริหารดูผ่านลิงก์ `/exec` และลิงก์รายงานที่ deploy ส่งทาง LINE

## 2. URL / Environment สำคัญ

| รายการ | ค่า |
|--------|-----|
| Production dashboard | `https://pv-thailand-1hh3.vercel.app` |
| Executive View (read-only, live) | `…/exec` |
| รายงานที่แชร์ (โปรเจกต์แยก) | `https://pv-exec-report.vercel.app` |
| Repo | `tarostox-coder/pv-thailand` |
| Branch deploy | `main` (auto-deploy) |

### Environment Variables (ตั้งในโปรเจกต์ Vercel หลัก)
| key | จำเป็น | ใช้ทำอะไร |
|-----|--------|-----------|
| `VERCEL_DEPLOY_TOKEN` | ✅ | ให้ปุ่ม Deploy เผยแพร่รายงานได้ |
| `VERCEL_TEAM_ID` | เฉพาะถ้าใช้ Team | scope โปรเจกต์ปลายทาง |
| `EXEC_REPORT_PROJECT` | ไม่ | เปลี่ยนชื่อโปรเจกต์รายงาน (default `pv-exec-report`) |

> วิธีสร้าง token + ตั้งค่า: ดู `DEPLOY-SETUP.md`

## 3. ไฟล์ในโปรเจกต์

```
index.html                  ← ทั้งแอป (~4,400 บรรทัด)
api/deploy.js               ← serverless: เผยแพร่รายงานเป็นเว็บแยก
apps-script/PV-ChangeLog.gs ← Google Apps Script: onEdit logger (ใครแก้)
apps-script/README.md       ← วิธีติดตั้ง Apps Script
vercel.json                 ← cleanUrls, rewrite /exec, headers
DEPLOY-SETUP.md             ← ตั้งค่า Deploy ครั้งเดียว
CLAUDE.md                   ← แนวทางสำหรับ AI assistant
ARCHITECTURE.md             ← สถาปัตยกรรม + data flow
DATA-STRUCTURE.md           ← โมเดลข้อมูล + field mapping
DEBUGGING-LOG.md            ← ปัญหาที่เคยเจอ + วิธีแก้
CHANGELOG.md                ← ประวัติเวอร์ชัน
```

## 4. งานที่ทำบ่อย (How-to)

### แก้โค้ด dashboard
1. แก้ `index.html` (ค้นหาด้วยชื่อฟังก์ชัน เช่น `renderAll`, `applyFilters`, `buildExportedHTML`)
2. ตรวจ syntax (ดู `CLAUDE.md` ข้อ 4) → commit → push → PR เข้า `main` → merge
3. Vercel deploy ให้เอง (หรือ Redeploy เป็น Production)

### เพิ่ม/แก้สถานะ (Status)
- Layer 1: `const SC` (สี) + logic ใน `classify()`
- Layer 2: `SUB_STATUS_TREE`

### เพิ่มคอลัมน์ที่รองรับจากชีต
- เพิ่ม entry ใน `FIELD_RULES` (field + keyword) — คอลัมน์ที่ไม่เข้ากฎจะไปอยู่ `_extra` อัตโนมัติ

### เปลี่ยนชีตของ Executive View
- แก้ค่า `EXEC_SHEET_ID` (ต้องเป็นชีตที่แชร์ "Anyone with link = Viewer")

### ปุ่ม Deploy รายงานไม่ทำงาน / ลิงก์ต้องล็อกอิน
- ดู `DEBUGGING-LOG.md` (ต้องมี `VERCEL_DEPLOY_TOKEN`; โปรเจกต์ pv-exec-report ต้อง public)

## 5. ฟีเจอร์หลัก (จุดเข้าโค้ด)

| ฟีเจอร์ | ฟังก์ชัน/จุดเริ่ม |
|---------|-------------------|
| กรองข้อมูล | `applyFilters()` → `FILTERED` |
| เรนเดอร์ทั้งหมด | `renderAll()`, `renderTable()`, `drawCharts()` |
| สลับแท็บ | `showTab(name)` |
| เชื่อม Google Sheet | `connectGoogleSheet()` |
| Export HTML/PDF/PNG | `doExport()`, `buildExportedHTML()`, `exportImage()` |
| Deploy รายงาน | `deployExport()` → `api/deploy.js` |
| ChangeLog/Activity | `recordDataDiff()`, `loadAuditLog()`, `renderActivity()` |
| Executive View | `isExecView()`, `EXEC_SHEET_ID` |
| Presentation Mode | หมุนแท็บอัตโนมัติ (TV) |

## 6. ข้อจำกัด / ความเสี่ยงที่ควรรู้

- **ไม่มี automated test** — ต้องตรวจ syntax เอง + ทดสอบบนเว็บจริง
- **เปิดจากไฟล์ในเครื่อง (file://)** ฟีเจอร์เต็มไม่ทำงาน (Deploy/Google Sheet CORS)
- **ชื่อผู้แก้** ขึ้นกับ Apps Script + นโยบาย Google (Gmail นอกองค์กรอาจเป็น `(unknown)`)
- **รายงานที่ deploy = snapshot** ไม่ใช่ live — ต้องกด Deploy ใหม่เพื่ออัปเดต
- **ข้อมูลค้างใน localStorage** ของแต่ละเครื่อง — ปุ่ม "ล้างประวัติ"/clear storage มีให้

## 7. ติดต่อ / บริบท

- เจ้าของ/ผู้ดูแล: `tchumpakun@gmail.com`
- ข้อมูลตั้งต้น (default `ALL`) สะท้อนชุดข้อมูลจริง ~53 โครงการ ของบริษัท (PowerVault Thailand)
- การพัฒนาเน้น **เสถียร + ผู้บริหารใช้ง่าย** มากกว่าความล้ำของเทคโนโลยี — รักษาแนวนี้
