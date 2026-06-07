# ARCHITECTURE.md

สถาปัตยกรรมของ PV Project Dashboard — ภาพรวมระบบ, การไหลของข้อมูล, และโครงสร้างภายใน `index.html`

---

## 1. หลักการออกแบบ

- **Single-file app** — ทั้งแอป (HTML/CSS/JS) อยู่ใน `index.html` ไฟล์เดียว
  เปิดด้วย double-click ก็ทำงานได้ (โหมดจำกัด) หรือ deploy บน Vercel (ฟีเจอร์เต็ม)
- **No build / No framework** — Vanilla JS ล้วน, dependency โหลดผ่าน CDN
- **Additive evolution** — พัฒนาเป็นเฟส (PHASE 2/3/4) และเวอร์ชัน (V24 → V28.5)
  โดยต่อยอดของเดิม ไม่ rewrite (เห็นได้จาก comment banner ในไฟล์)
- **Resilient sync** — ดึงข้อมูลไม่สำเร็จต้องไม่ทำให้ข้อมูลเดิมหาย

## 2. ส่วนประกอบระดับบนสุด

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (index.html)                                        │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Data     │→ │ Render   │→ │  Charts  │  │  Export /   │ │
│  │  layer    │  │ pipeline │  │ (Chart.js)│ │  Deploy     │ │
│  │ ALL/FILT  │  │ renderAll│  └──────────┘  └──────┬──────┘ │
│  └─────▲─────┘  └──────────┘                       │        │
│        │ sync                                       │ POST   │
└────────┼───────────────────────────────────────────┼────────┘
         │                                            │
   ┌─────┴───────┐                          ┌─────────▼─────────┐
   │ Google Sheet│                          │ /api/deploy.js    │
   │ (gviz CSV)  │                          │ (Vercel func)     │
   │ +ChangeLog  │                          │  → Vercel API     │
   │  tab        │                          │  → pv-exec-report │
   └─────────────┘                          └───────────────────┘
         ▲
   ┌─────┴────────────────┐
   │ apps-script/         │
   │ PV-ChangeLog.gs      │  onEdit → เขียนแท็บ ChangeLog (ใครแก้)
   └──────────────────────┘
```

## 3. การไหลของข้อมูล (Data flow)

### 3.1 แหล่งข้อมูล 3 แบบ — `SYNC_SOURCE_TYPE`
| ค่า | ความหมาย | กลไก |
|-----|----------|------|
| `file` | อัปโหลด Excel/CSV ครั้งเดียว | SheetJS อ่านไฟล์ |
| `autosync` | เฝ้าไฟล์ในเครื่อง (File System Access API) | poll ทุก `SYNC_POLL_MS` = 3000ms |
| `gsheet` | Google Sheet สด | fetch gviz CSV (`connectGoogleSheet`) poll เป็นรอบ |

ข้อมูลเริ่มต้น (default) ฝังอยู่ใน `let ALL=[...]` (ราว 53 โครงการ) ที่บรรทัด ~881

### 3.2 Parsing → mapping
- ไฟล์/ชีต ถูกอ่านเป็นตาราง → จับคู่หัวคอลัมน์กับ field มาตรฐานด้วย **`FIELD_RULES`**
  (fuzzy match ด้วย keyword หลายภาษา) → ได้ array ของ project object (ดู DATA-STRUCTURE.md)
- คอลัมน์ที่ไม่เข้า field มาตรฐาน → เก็บใน `_extra` map

### 3.3 State หลัก
- `ALL` — ข้อมูลทุกโครงการ (หลัง map)
- `FILTERED` — ผลลัพธ์หลังใช้ตัวกรอง (search, L1/L2 status, contract, lead, engineer, priority, province, ช่วงวันที่)
- การกรองอยู่ที่ `applyFilters()` → set `FILTERED` → `renderAll(FILTERED)`

### 3.4 Render pipeline
`renderAll(data)` เรียกลูกย่อย: KPI cards, charts (`drawCharts`), ตาราง (`renderTable`),
Gantt, Alerts, แล้ว hook `buildMetrics`/exec metrics ทำงานต่อท้าย (PHASE 4)

## 4. มุมมอง (Tabs / Views)

แท็บควบคุมด้วย `showTab(name)` (ซ่อน/แสดง `#tab-*`):

| Tab | id | เนื้อหา |
|-----|-----|---------|
| 📊 Overview | `tab-overview` | KPI + charts + ตารางโครงการ |
| 📅 Gantt | `tab-gantt` | Timeline (ต้องมี start/end) |
| 🚦 Alerts | `tab-alerts` | Risk monitor |
| 📝 Activity | `tab-activity` | ChangeLog (ใครแก้/อะไร/เมื่อไหร่) + badge |
| 🔍 Schema | `tab-schema` | ตรวจ mapping คอลัมน์ |
| 📂 Data | `tab-upload` | อัปโหลด/เชื่อม Google Sheet |
| ⚙️ Power BI | `tab-pbi` | สูตร DAX / คำแนะนำ Power BI |

### Executive View — `/exec`
- `vercel.json` rewrite `/exec` → `index.html`
- `isExecView()` ตรวจ path `/exec` หรือ `?view=exec` → เข้าโหมด read-only,
  ตั้ง `SYNC_SOURCE_ID = EXEC_SHEET_ID` (ชีตสาธารณะฮาร์ดโค้ด) แล้วเชื่อมสดอัตโนมัติ
- **Presentation Mode** — หมุนแท็บอัตโนมัติทุก 18s สำหรับขึ้นจอ TV

## 5. ระบบสถานะ 2-Layer (V24+)

- **Layer 1 (`status`):** `Bidding` / `Hold` / `Win` / `Lost` — สีใน `SC`
- **Layer 2 (`sub_status`):** สถานะย่อยตาม `SUB_STATUS_TREE` (เลือก L1 → L2 ออโต้)
- **Contract type สี** อยู่ใน `CC` (EPC/PPA/O&M/Lease/...)
- `classify()` คือ logic จัดกลุ่ม/normalise สถานะ

## 6. Export engine

- **`buildExportedHTML(sections, title)`** — สร้างไฟล์ HTML self-contained
  ฝังข้อมูล (`const ALL=${DJ}`) + chart + filter ลงไฟล์เดียว เปิดออฟไลน์ได้
- **PNG/JPG** — `exportImage()` ใช้ html2canvas snapshot
- **PDF** — เปิด Print dialog (`buildPrintHTML`)
- โหมด combined / separate (หลายหน้า = หลายไฟล์)
- UI อยู่ใน Export Modal (`#export-modal`), state: `EX_SECS`, `EX_FMT`, `EX_HTML_MODE`

## 7. Deploy engine (V28.5)

- ปุ่ม **☁️ Deploy & รับลิงก์แชร์** (`deployExport()`) → POST `/api/deploy` พร้อม HTML
- **`api/deploy.js`** (serverless) →
  1. เรียก Vercel API v13 สร้าง deployment ไปยังโปรเจกต์แยก `pv-exec-report`
     (target production → URL ถาวร, ทับทุกครั้ง)
  2. PATCH โปรเจกต์ปิด `ssoProtection`/`passwordProtection` → เปิดสาธารณะ
- ใช้ env vars: `VERCEL_DEPLOY_TOKEN` (จำเป็น), `VERCEL_TEAM_ID`, `EXEC_REPORT_PROJECT` (ดู DEPLOY-SETUP.md)

## 8. ChangeLog / Activity (V28.4) — ดูราย field ใน DATA-STRUCTURE.md

ทำงาน 2 ชั้น merge กัน:
1. **Client diff** — ทุกรอบ sync เทียบ snapshot ก่อนหน้า (`PV_PREV_ROWS`) → entry `src:"diff"`
   เก็บใน `localStorage["pv_changelog"]`
2. **Audit (Apps Script)** — อ่านแท็บ `ChangeLog` ผ่าน gviz → เติม "ใครแก้" → entry `src:"audit"`
- `_valEq()` กรอง noise ตัวเลข, `dedupAuditVsDiff()` กันซ้ำ, `_clProjName()` เติมชื่อโครงการที่หาย

## 9. Persistence (localStorage keys)

| key | เก็บอะไร |
|-----|---------|
| `pv_changelog` | log + snapshot ก่อนหน้า + seen markers |
| (snapshot ข้อมูล/แหล่ง) | sourceType, sourceId เพื่อ resume sync |

## 10. Deployment / hosting

- **Vercel** static + serverless (`api/`) — auto-detect ไม่ต้องตั้ง framework
- `vercel.json`: `cleanUrls`, rewrite `/exec`, header `Cache-Control: max-age=0, must-revalidate`
  (กัน HTML ค้าง cache) + security headers
