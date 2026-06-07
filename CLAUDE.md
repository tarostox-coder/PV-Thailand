# CLAUDE.md

แนวทางสำหรับ Claude Code (และ AI assistant อื่น ๆ) เมื่อทำงานในโปรเจกต์นี้
อ่านไฟล์นี้ก่อนเริ่มแก้โค้ดเสมอ

---

## 1. โปรเจกต์นี้คืออะไร

**PV Project Dashboard** — แดชบอร์ดผู้บริหารสำหรับติดตามโครงการติดตั้งโซลาร์เซลล์
(Photovoltaic / PV) ของบริษัท แสดงสถานะงานขาย–งานติดตั้งแบบ 2-Layer
(Bidding / Hold / Win / Lost) ดึงข้อมูลสดจาก Google Sheet

- **Production:** Vercel → `pv-thailand-1hh3.vercel.app` (และ `/exec` = Executive View)
- **Repo:** `tarostox-coder/pv-thailand`
- **Branch หลัก:** `main` (Vercel auto-deploy จาก branch นี้)

## 2. สถาปัตยกรรมแบบสั้น (อ่านเต็มใน ARCHITECTURE.md)

> **ทั้งแอปคือไฟล์เดียว: `index.html` (~4,400 บรรทัด)** — HTML + CSS + Vanilla JS
> **ไม่มี build step, ไม่มี framework, ไม่มี npm install**

| ไฟล์ | หน้าที่ |
|------|---------|
| `index.html` | ทั้งแอป — UI, logic, charts, export, sync, changelog |
| `api/deploy.js` | Vercel serverless — เผยแพร่รายงาน export เป็นเว็บแยก (pv-exec-report) |
| `apps-script/PV-ChangeLog.gs` | Google Apps Script — onEdit logger บันทึก "ใครแก้" |
| `vercel.json` | cleanUrls, rewrite `/exec`, security + no-cache headers |

**Libraries (โหลดผ่าน CDN ทั้งหมด):** Chart.js + datalabels, SheetJS (XLSX), html2canvas

## 3. กฎทองเวลาแก้โค้ด

1. **แก้แบบ additive** — โค้ดนี้ผ่านการแก้หลายรอบแบบ "ต่อยอด ไม่ rewrite"
   (ดู comment banner `PHASE 2/3/4`, `V28.x` ในไฟล์) ทำตามแนวเดิม อย่ารื้อใหญ่
2. **ไม่ทำลายข้อมูลผู้ใช้** — ข้อมูลจริงอยู่ใน Google Sheet + `localStorage`
   ปุ่ม/ฟีเจอร์ที่ดึงข้อมูลไม่สำเร็จ ต้อง **คงข้อมูลเดิม ไม่ทำให้หลุด sync**
3. **ตรวจ syntax ก่อน commit เสมอ** (ดูข้อ 4)
4. **ทดสอบไม่ได้แบบ end-to-end** — ไม่มี test runner; การ deploy จริง/Google Sheet
   ต้องให้เจ้าของลองเอง ให้บอกตรง ๆ ว่าอะไร verify แล้ว / อะไรยัง
5. **อย่าใส่ secret ลงไฟล์** — token ทั้งหมดอยู่ใน Vercel Environment Variables

## 4. วิธีตรวจ syntax (สำคัญ — ไม่มี CI ทดสอบ JS)

`index.html` มี inline `<script>` ก้อนใหญ่ก้อนเดียว ตรวจด้วย:

```bash
python3 - <<'PY'
import re,subprocess,tempfile,os
html=open("index.html",encoding="utf-8").read()
b=re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',html,re.S)[0]
f=tempfile.NamedTemporaryFile("w",suffix=".js",delete=False,encoding="utf-8");f.write(b);f.close()
r=subprocess.run(["node","--check",f.name],capture_output=True,text=True);os.unlink(f.name)
print("JS:", "OK" if r.returncode==0 else "FAIL\n"+r.stderr[:1200])
PY
node --check api/deploy.js   # ตรวจ serverless function
```

> หมายเหตุ: `buildExportedHTML()` มี JS ของไฟล์ export ฝังอยู่ใน template literal —
> มันถูกตรวจไปพร้อมก้อนหลักในฐานะ string จึงไม่กระทบ parser ภายนอก

## 5. Workflow git (ตามที่ environment กำหนด)

- พัฒนาบน branch `claude/clever-goodall-QecQh`
- `git push -u origin <branch>` (retry แบบ exponential backoff ถ้า network fail)
- เปิด PR เข้า `main` **เฉพาะเมื่อผู้ใช้ขอ** แล้ว merge
- หลัง merge เข้า `main` → Vercel deploy production ให้เอง (หรือ Redeploy เอง)

## 6. จุดที่ต้องระวัง (gotchas) — ดูเต็มใน DEBUGGING-LOG.md

- **ChangeLog noise:** ค่าตัวเลขเด้งทศนิยมระหว่าง sync (15.73 ↔ 15.72827905)
  ถูกกรองด้วย `_valEq()` (ปัด 2 ตำแหน่ง) — อย่าลบออก
- **Deploy ต้องตั้ง `VERCEL_DEPLOY_TOKEN`** ใน env vars ก่อนปุ่ม Deploy ทำงาน
- **โปรเจกต์ pv-exec-report ต้องเป็น public** — `api/deploy.js` ปิด Vercel Auth ให้อัตโนมัติ
- **เปิดจาก file:// ปุ่ม Deploy ใช้ไม่ได้** (ไม่มี `/api/deploy`) และ Google Sheet
  อาจโดน CORS บล็อก — ฟีเจอร์เต็มต้องรันบน Vercel
- **`/exec` ใช้ `EXEC_SHEET_ID` ฮาร์ดโค้ด** (ชีตสาธารณะ) — read-only live view

## 7. ภาษา

- UI + ข้อความผู้ใช้ = **ภาษาไทย** เป็นหลัก
- ตอบผู้ใช้ (เจ้าของ) เป็นภาษาไทย
- comment โค้ดผสมไทย/อังกฤษได้ตามของเดิม
