# DEBUGGING-LOG.md

บันทึกปัญหาที่เคยเจอและวิธีแก้ (running log) — เพิ่มรายการใหม่ไว้บนสุด
ใช้เป็นความรู้ส่งต่อ เพื่อไม่ให้แก้ปัญหาเดิมซ้ำหรือ regress

> รูปแบบ: **อาการ → สาเหตุ → วิธีแก้ → ไฟล์/ฟังก์ชันที่เกี่ยว → สถานะ**

---

## 2026-06 — ลิงก์รายงานที่ Deploy เปิดไม่ได้ ต้องล็อกอิน Vercel
- **อาการ:** ส่งลิงก์ `pv-exec-report.vercel.app` ให้ผู้บริหารใน LINE → เปิดแล้วเด้งหน้า login Vercel
- **สาเหตุ:** โปรเจกต์ใหม่บน Vercel เปิด **Deployment Protection (Vercel Authentication)** อัตโนมัติ
- **วิธีแก้:** หลัง deploy ให้ `api/deploy.js` PATCH โปรเจกต์ `pv-exec-report`
  ตั้ง `ssoProtection:null` + `passwordProtection:null` (เปิดสาธารณะ) ทุกครั้ง;
  ถ้า PATCH ไม่สำเร็จ UI แสดงวิธีปิดเอง (Settings → Deployment Protection)
- **ไฟล์:** `api/deploy.js`, `deployExport()` ใน `index.html`
- **สถานะ:** ✅ แก้แล้ว (commit b015c28) — แก้เร็วแบบ manual: ปิด Vercel Auth ในโปรเจกต์นั้น 1 ครั้ง

## 2026-06 — ChangeLog ขึ้นแถวรก/ไม่มีชื่อผู้แก้ (B/Watt เด้งทศนิยม)
- **อาการ:** แถว B/Watt ฯลฯ ขึ้นเยอะ เช่น `15.73 → 15.72827905` แล้วเด้งกลับ และ "ใครแก้" ว่าง
- **สาเหตุ:** ค่าตัวเลขจากชีตสลับระหว่างเลขปัด 2 ตำแหน่งกับเลขเต็มความละเอียดในแต่ละรอบ sync
  → ไม่ใช่การแก้ของคนจริง Apps Script จึงไม่มี record (ไม่มีชื่อผู้แก้)
- **วิธีแก้:** เพิ่ม `_valEq()` มองค่าต่างกันใต้ 0.01 เป็นค่าเดียวกัน (ปัด ×100) ใช้ใน
  ตัว diff (`recordDataDiff`), `dedupAuditVsDiff`, และล้างประวัติเก่าครั้งเดียวใน `ensureClLoaded`
- **ไฟล์:** `index.html` — `_valEq`, `recordDataDiff`, `dedupAuditVsDiff`, `ensureClLoaded`
- **สถานะ:** ✅ แก้แล้ว (commit 9c419a8)

## 2026-06 — ChangeLog บางแถวไม่ขึ้นชื่อโครงการ (โชว์แค่ `#55`)
- **อาการ:** แถวจาก Apps Script บางแถวขึ้นแค่เลข `#55` ไม่มีชื่อโครงการ
- **สาเหตุ:** แถว audit บันทึก Row แต่ไม่มีชื่อโครงการมาด้วย
- **วิธีแก้:** `_clProjName(e)` — ถ้า project ว่าง/เป็นแค่ตัวเลข ให้ lookup ชื่อจาก `ALL` ด้วยเลขโครงการ
- **ไฟล์:** `index.html` — `_clProjName`, `renderActivity`
- **สถานะ:** ✅ แก้แล้ว (commit 618817d) + เปลี่ยนหัวคอลัมน์ "ใครแก้" → "Edited by"

## 2026-06 — ESM→CommonJS warning ตอน build serverless
- **อาการ:** Vercel build log เตือน `Node.js functions are compiled from ESM to CommonJS`
- **สาเหตุ:** `api/deploy.js` ใช้ `export default` แต่ repo ไม่ได้ประกาศ `"type":"module"`
- **วิธีแก้:** ไม่จำเป็น — Vercel แปลงให้เองและทำงานได้ปกติ (cosmetic) ถ้าจะปิด warning
  เพิ่ม `package.json` ที่มี `"type":"module"`
- **สถานะ:** ℹ️ ไม่ใช่บั๊ก (รับทราบ ปล่อยไว้ได้)

---

## ความรู้/ข้อจำกัดเชิงระบบ (ไม่ใช่บั๊ก แต่ควรรู้)

- **เปิดจาก `file://`** — ปุ่ม Deploy ใช้ไม่ได้ (ไม่มี `/api/deploy`); การ fetch Google Sheet
  อาจโดน CORS บล็อก ⇒ ฟีเจอร์เต็มต้องรันบน Vercel
- **ชื่อผู้แก้เป็น `(unknown)`** — ผู้แก้ที่ใช้ Gmail ส่วนตัว/นอก Workspace องค์กร Google
  อาจไม่เปิดเผยอีเมล (นโยบายความเป็นส่วนตัว) — ส่วน "อะไรเปลี่ยน" ยังครบ
- **รายงาน Deploy เป็น snapshot** — ฝังข้อมูล ณ ตอนกด ต้องการอัปเดตให้กด Deploy ซ้ำ
- **`pv-exec-report.vercel.app` อาจถูกใช้ชื่อซ้ำ** — ตั้ง `EXEC_REPORT_PROJECT` เป็นชื่ออื่นได้
- **HTML cache** — `vercel.json` ตั้ง no-cache ป้องกัน dashboard ค้างเวอร์ชันเก่า

## วิธี debug ที่ใช้บ่อย

```bash
# ตรวจ syntax JS ในก้อน inline ของ index.html (ดู CLAUDE.md ข้อ 4)
# ตรวจ serverless
node --check api/deploy.js
# ดูประวัติว่าฟีเจอร์ไหนมาเวอร์ชันไหน
git log --oneline
```

ใน browser: เปิด DevTools Console — โค้ดมี `console.warn(...)` ที่จุดสำคัญ
(`changelog load/save`, `recordDataDiff`, `ingestAuditCsv`, sync)
