# DATA-STRUCTURE.md

โครงสร้างข้อมูลของ PV Project Dashboard — โมเดลโครงการ, การ map คอลัมน์, ระบบสถานะ, และข้อมูล ChangeLog

---

## 1. Project object (1 โครงการ = 1 object ใน `ALL`)

ตัวอย่างจริง (จาก `let ALL=[...]` บรรทัด ~881):

```js
{
  no: 9,                                  // ลำดับ/เลขโครงการ (number)
  name: "ตลาดธนบุรี (AOF)",                // ชื่อโครงการ (req)
  kwp: 1255.7,                            // ขนาดติดตั้ง kWp (number|null)
  contract: "EPC",                       // ประเภทสัญญา (EPC/PPA/EPC or PPA/O&M/Lease/-)
  location: "กทม.",                       // สถานที่/จังหวัด
  lead: "BBL",                           // Lead Sale (ผู้ดูแลการขาย)
  engineer: "มายด์",                      // วิศวกรผู้รับผิดชอบ
  status: "Win",                         // Layer 1 — Bidding|Hold|Win|Lost
  sub_status: "รอสัญญา",                  // Layer 2 — ดู SUB_STATUS_TREE
  start: null,                           // วันเริ่ม (date|null)
  end: null,                             // วันสิ้นสุด/เป้าหมาย (date|null)
  progress: 0.9,                         // ความคืบหน้า 0..1
  priority: "High",                      // Low|Medium|High
  value: 19750000,                       // มูลค่าโครงการ บาท (number|null)
  thb_w: 15.7282790475432,               // ราคาต่อวัตต์ บาท/Watt (number|null)
  region: "",                            // ภาค/โซน
  _extra: {                              // คอลัมน์อื่นที่ไม่เข้า field มาตรฐาน
    "Contact": "คุณอู๋ 061-019-4049",
    "Description": "...",
    "Next Action": "...",
    "วันที่ Follow Up": "2026-05-11"
  }
}
```

### หมายเหตุชนิดข้อมูล
- ตัวเลขที่ไม่มีค่า = `null` (แสดงผลเป็น `—`)
- `progress` เก็บเป็นเศษส่วน 0–1 (0.9 = 90%)
- `_extra` คือ map คอลัมน์เพิ่มเติมแบบไดนามิก (คีย์ = ชื่อหัวคอลัมน์เดิมจากชีต)

## 2. Field mapping — `FIELD_RULES`

เวลาอัปโหลดไฟล์/เชื่อมชีต ระบบจับคู่หัวคอลัมน์ → field มาตรฐาน ด้วย keyword หลายภาษา
(case-insensitive, fuzzy) ตารางสรุป:

| field | label | ตัวอย่าง keyword ที่จับได้ | type | req |
|-------|-------|---------------------------|------|-----|
| `no` | # | no, ลำดับ, seq, row | number | |
| `name` | ชื่อโครงการ | project name, name, โครงการ | text | ✅ |
| `kwp` | kWp | kwp, kw, ขนาด, capacity, กำลัง | number | |
| `contract` | Contract | ประเภทสัญญา, contract, type | category | |
| `location` | Location | สถานที่, จังหวัด, province | category | |
| `lead` | Lead Sale | lead, เซลล์, sale, ผู้ขาย | category | |
| `engineer` | Engineer | วิศวกร, engineer, ช่าง | category | |
| `status` | Status (L1) | สถานะหลัก, status, layer 1, stage | category | |
| `sub_status` | Sub-Status (L2) | สถานะย่อย, sub-status, layer 2 | category | |
| `start` | Start Date | start, เริ่ม, startdate | date | |
| `end` | End Date | end, สิ้นสุด, deadline, due | date | |
| `progress` | % Progress | progress, ความคืบ, complete, percent | percent | |
| `priority` | Priority | priority, ความสำคัญ, urgent | category | |
| `value` | มูลค่า (฿) | มูลค่าโครงการ, value, ราคา, amount | number | |
| `region` | Region | region, ภาค, zone, เขต | category | |
| `thb_w` | THB/Watt | thb/watt, บาท/วัตต์, price per watt | number | |

> มีแค่ `name` ที่ required — ที่เหลือ optional เพื่อรองรับชีตที่กรอกไม่ครบ
> ดูผลการ map จริงได้ในแท็บ **🔍 Schema**

## 3. ระบบสถานะ 2-Layer

### Layer 1 — `status` (สี: `const SC`)
| ค่า | สี | ความหมาย |
|-----|-----|----------|
| `Bidding` | `#3b82f6` 📘 | กำลังเสนอ/ประมูล |
| `Hold` | `#f59e0b` 🟡 | ชะลอ |
| `Win` | `#22c55e` 🟢 | ชนะ/ดำเนินโครงการ |
| `Lost` | `#ef4444` 🔴 | แพ้/ยกเลิก |

### Layer 2 — `sub_status` (`SUB_STATUS_TREE`)
เลือก L1 แล้ว dropdown L2 จะแสดงเฉพาะตัวเลือกของกลุ่มนั้น:

- **Bidding:** รอนัดนำเสนอลูกค้า · รอสำรวจหน้างาน · สำรวจแล้ว—รอทำ Proposal ·
  ส่ง Proposal แล้ว—รอลูกค้า · อยู่ระหว่างแก้ไข Proposal · รอ PPA/เงื่อนไขพิเศษ
- **Hold:** ชะลอ <1 เดือน · ชะลอ 1–3 เดือน · ชะลอ 3–6 เดือน · ติดต่อไม่ได้/ไม่มีกำหนด
- **Win:** รอ PO · รอสัญญา · เซ็นสัญญาแล้ว · อยู่ระหว่างก่อสร้าง/ติดตั้ง · ส่งมอบงานแล้ว
- **Lost:** แพ้ราคา/คู่แข่ง · โครงสร้าง/ไซส์ไม่เหมาะสม · ลูกค้ายกเลิกเอง · (ฯลฯ)

### Contract type สี — `const CC`
`EPC` #3b82f6 · `PPA` #8b5cf6 · `EPC or PPA` #06b6d4 · `O&M` #14b8a6 · `Lease` #f59e0b · `-` #94a3b8

## 4. Filtered state

`FILTERED` = `ALL` ที่ผ่านตัวกรองทั้งหมดใน `applyFilters()`:
ค้นหาข้อความ, Status L1, Sub-Status L2, Contract, Lead, Engineer, Priority, Province, ช่วงวันที่ (7/30/90 วัน)

## 5. ChangeLog entry (แท็บ Activity)

`CHANGELOG` = array (ใหม่สุดก่อน, เก็บสูงสุด 500) แต่ละ entry:

```js
{
  ts: 1749000000000,        // timestamp (number, ms)
  no: 9,                    // เลขโครงการ
  project: "ตลาดธนบุรี",     // ชื่อโครงการ (เติมจาก _clProjName ถ้าหาย)
  field: "B/Watt",          // คอลัมน์ที่เปลี่ยน (label)
  from: "15.73",            // ค่าเดิม
  to: "15.72",              // ค่าใหม่
  who: "ittirak.r@...",     // ผู้แก้ ("" ถ้าเป็น diff ที่ไม่มี audit)
  src: "diff" | "audit"     // ที่มา: client-diff หรือ Apps Script
}
```

### ฟิลด์ที่ระบบเฝ้าดู — `TRACK_FIELDS`
`name, status, sub_status, contract, location, lead, engineer, value, kwp, thb_w, start, end, progress, priority, region`
(+ คอลัมน์ใน `_extra` แสดงด้วย prefix `x:`)

### Apps Script ChangeLog tab (คอลัมน์ที่อ่าน)
`Timestamp, Editor, Project, Column, Old, New, Row` (รองรับชื่อไทย/อังกฤษหลายแบบผ่าน `_pick`)

## 6. กฎการเทียบค่า — `_valEq(a, b)`

ใช้ตัดสินว่า "เปลี่ยนจริงหรือไม่":
- เท่ากันเป๊ะ → ไม่เปลี่ยน
- ทั้งคู่เป็นตัวเลข → เท่ากันถ้า `Math.round(n*100)` เท่ากัน (กรอง noise ใต้ 0.01)
  เช่น `15.73` กับ `15.72827905`, `5.34` กับ `5.3375` ถือว่าไม่เปลี่ยน

## 7. localStorage schema (`pv_changelog`)

```js
{
  log:  [ ...CHANGELOG (สูงสุด 500) ],
  prev: { [no]: rowSignature },   // snapshot รอบก่อนไว้ diff
  seen: { [auditKey]: 1 },        // กัน audit ซ้ำ
  seenTs: 1749000000000           // เวลาที่ผู้ใช้เห็นล่าสุด (สำหรับ badge)
}
```
