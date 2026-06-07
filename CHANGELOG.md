# CHANGELOG

ประวัติเวอร์ชันของ PV Project Dashboard (ใหม่สุดอยู่บน)
อ้างอิงจาก git history — รูปแบบใกล้เคียง [Keep a Changelog](https://keepachangelog.com/)

---

## [V28.5] — 2026-06 · Deploy & ChangeLog fixes

### Added
- **One-click Deploy** — ปุ่ม "☁️ Deploy & รับลิงก์แชร์" ในหน้าต่าง Export
  เผยแพร่รายงานผู้บริหารขึ้น **โปรเจกต์ Vercel แยก** (`pv-exec-report`) ไม่ทับ dashboard หลัก,
  ทับ URL เดิมทุกครั้ง, copy ลิงก์อัตโนมัติเพื่อส่ง LINE (`api/deploy.js`, `deployExport()`)
- `DEPLOY-SETUP.md` — คู่มือตั้งค่า env var ครั้งเดียว
- เอกสารโปรเจกต์: `CLAUDE.md`, `ARCHITECTURE.md`, `DATA-STRUCTURE.md`,
  `DEBUGGING-LOG.md`, `CHANGELOG.md`, `PV-DASHBOARD-HANDOFF.md`

### Fixed
- Deploy: ปิด **Vercel Authentication** (`ssoProtection`/`passwordProtection`) อัตโนมัติ
  → ผู้บริหารเปิดลิงก์ได้โดยไม่ต้องล็อกอิน
- ChangeLog: กรอง noise ตัวเลขเด้งทศนิยม (`_valEq`, ปัด 2 ตำแหน่ง) — เหลือแต่การแก้จริง
- ChangeLog: เติมชื่อโครงการที่หายด้วยเลขโครงการ (`_clProjName`)

### Changed
- ChangeLog: หัวคอลัมน์ "ใครแก้" → **"Edited by"**

## [V28.4] — Activity Change-Log + Manual Refresh
### Added
- แท็บ **📝 Activity** — บันทึก "ใครแก้ · อะไร · เมื่อไหร่" ทำงาน 2 ชั้น:
  client diff (อัตโนมัติ) + Apps Script `ChangeLog` tab (เติมชื่อผู้แก้)
- `apps-script/PV-ChangeLog.gs` + `apps-script/README.md` — onEdit logger
- ปุ่ม **Manual Refresh** — ดึงข้อมูลล่าสุดทันที, ดึงไม่ได้ก็คงข้อมูลเดิม ไม่หลุด sync
- Badge แดงบนแท็บบอกจำนวนรายการใหม่ + ปุ่มล้างประวัติ

## [V28.3] — Executive View `/exec`
### Added
- มุมมองผู้บริหารแบบ clean, live, read-only ที่ `/exec` (rewrite ใน `vercel.json`)
- ผูกชีตสาธารณะ `EXEC_SHEET_ID` อัตโนมัติ — deploy ครั้งเดียว เห็นข้อมูลล่าสุดตลอด

## [V28.2] — Layout + Interactive export
### Added/Changed
- Bar charts ขึ้นบน, donut แบบ side-legend, คอลัมน์ตารางพับเก็บได้, KPI กดได้
- นำ layout + interactivity ชุดเดียวกันไปใส่ใน HTML export (`buildExportedHTML`)

## [V28.1] — Header status tiles + fixes
### Changed
- ย้าย status cards ไปไว้บน header, ปรับสมดุล chart
### Fixed
- บั๊ก completeness / sync

## [V28.0] — Executive Polish & Stabilization
### Added/Changed
- Phase 4: มาตรฐานเลขเวอร์ชัน, executive metrics, predictive action panel,
  Data Quality UX, completion review, Presentation Mode
### Fixed
- Doughnut chart: canvas ล้นทับ legend, datalabels ซ้อนข้อความ (Phase H)
- คืน doughnut ทรงกลม (ปล่อยให้ Chart.js จัดการขนาด canvas)

## [V28 infra] — Vercel config
### Added
- `vercel.json`: HTML no-cache, clean URLs, security headers

---

## โครงสร้างก่อน V28 (สรุป)
- **V25** — Phase 2: Executive Monitoring Layer (Google Sheets sync, live data status,
  data age/quality/health, offline cache, enhanced toast)
- **V24** — ระบบสถานะ **2-Layer** (Bidding/Hold/Win/Lost + Sub-Status tree)
- **Phase 3** — Layout / Responsive / UX (UI only)

> หมายเหตุ: เวอร์ชันก่อนหน้าถูกพัฒนาแบบ additive ในไฟล์เดียว
> ดู comment banner `PHASE 2/3/4` และ `V2x.x` ใน `index.html` ประกอบ
> และ `git log --oneline` สำหรับไทม์ไลน์เต็ม
