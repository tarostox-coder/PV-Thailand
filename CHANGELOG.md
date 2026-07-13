# CHANGELOG

ประวัติเวอร์ชันของ PV Project Dashboard (ใหม่สุดอยู่บน)
อ้างอิงจาก git history — รูปแบบใกล้เคียง [Keep a Changelog](https://keepachangelog.com/)

---

## [V30.0] — 2026-07 · Power Vault Sidebar App-Shell + Logo (UI-only)

> **เปลี่ยนโครง layout ที่มองเห็นชัด** — จาก navigation แบบ tabs บนหัว → **sidebar ซ้าย**
> ตามภาพอ้างอิงผู้ใช้ (Data Performance / School ERP dashboards) พร้อมฝัง **โลโก้ Power Vault**
> ไม่แตะ business logic / KPI calc / filters / sync / charts / export — เป็น CSS + markup + wrapper JS ล้วน

### Added
- **Sidebar app-shell (`#pv-side`)** — แถบเมนูซ้ายแบบ fixed, พื้น gradient teal เข้าชุดโลโก้,
  รายการเมนู 7 อัน (Overview/Gantt/Alerts/Activity/Schema/Data/Power BI) เป็น mirror ของปุ่ม `.tab`
  เดิม — เรียก `showTab()` ตัวเดิม ไม่แก้ logic; active state + badge Activity ซิงก์เข้ามาด้วย
- **โลโก้ Power Vault** ฝังเป็น data-URI (inline PNG) บนหัว sidebar — ไม่มี asset ภายนอก
- Header retint เป็นโทน teal ให้อ่านเป็น chrome เดียวกับ sidebar/โลโก้

### Changed
- Desktop (≥900px): เนื้อหาเลื่อนขวาเปิดที่ให้ sidebar (`margin-left`), ซ่อน tabs บนหัว
- **Mobile (<900px): ซ่อน sidebar กลับไปใช้ tabs บนหัวเหมือนเดิมทุกอย่าง** (คงพฤติกรรมเดิมครบ)
- Exec view (`/exec`) + Presentation mode + print: ซ่อน sidebar → มุมมองเต็มความกว้าง สะอาด

### Notes
- ทุก id/class/handler เดิม + สีสถานะ (Bidding/Hold/Win/Lost) — คงไว้ครบ
- `showTab()` เดิมไม่ถูกแก้ (เพิ่มเพียง sync บรรทัดเดียว), `updateActivityBadge()` เพิ่ม mirror badge

## [V29.0–29.3] — 2026-06 · Modern SaaS UI Redesign (UI-only)

> **Visual redesign เท่านั้น** — ไม่แตะ business logic, KPI calc, filters,
> Google Sheets sync, charts/export/gantt/exec logic ทั้งสิ้น (additive CSS + markup)

### Added
- **Design system** — ฟอนต์ `Inter` (อังกฤษ/ตัวเลข) + `Noto Sans Thai` (ไทย) ผ่าน `<link>`,
  ชุด design token ใน `:root` (surface/hairline/ink/shadow/radius), เงานุ่มแบบ SaaS
- **Filter drawer** — แถบกรองเดิมกลายเป็น panel สไลด์จากขวา พับเก็บได้
  (ปุ่ม "Filters" ใน header + badge นับตัวกรองที่ใช้อยู่) — `toggleFilterDrawer()`,
  `updateFilterBtn()`; ทุก input/id/handler เดิมคงไว้ครบ

### Changed
- **KPI cards** — พื้น gradient ตามสีสถานะ (ใช้ `var(--c)` + `color-mix()`) ตัวอักษรขาว
  ตัวเลขใหญ่ขึ้น hover ยกตัว top-sheen เนียน (มี `@supports` fallback ไม่มี color-mix)
- **Header/nav** — gradient enterprise เข้มขึ้น, tabs เป็น segmented control
- **Cards/charts** — hairline + เงานุ่ม + มุม 18–22px + padding/ระยะมากขึ้น
- **Tables** — sticky header, zebra บางลง, hover นุ่ม
- พื้นหลัง `#f5f7fb`, ปรับ whitespace/typography ทุก breakpoint (mobile→TV)

### Export (V29.6)
- **Exported HTML / PDF ใช้ธีม V29 ตรงกับ live** — `buildExportedHTML()` เดิมมี CSS
  ของตัวเอง (Sarabun, พื้น #f0f4f8, KPI ขีดบน) → อัปเป็น Inter+Noto, พื้น #f5f7fb,
  KPI gradient ขาว, การ์ด hairline, ตาราง/headers เข้าชุด
- KPI value ใน export เป็น fluid `clamp()` กัน overflow + `print-color-adjust:exact`
  บน `.kpi` เพื่อให้ PDF พิมพ์ gradient + ตัวอักษรขาวได้ (กันขาวบนขาว)

### Notes
- คงความหมายสีสถานะ (Bidding/Hold/Win/Lost) ทุกจุด
- ใบ Hold (ส้ม #f59e0b) ตัวอักษรขาวต้อง darken ปลาย gradient + text-shadow เพื่อ contrast
  (สีอ่อนสุดในชุด) — ถ้าต้องการ "subtle" เต็มที่ ต้องเปลี่ยนเฉดสถานะ Hold ทั้งระบบ

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
