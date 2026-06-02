# Deploy Executive Report — Setup (ครั้งเดียวจบ)

ปุ่ม **☁️ Deploy & รับลิงก์แชร์** ในหน้าต่าง Export จะเผยแพร่รายงานผู้บริหาร (Executive Report)
ขึ้นเป็นเว็บออนไลน์ที่มีลิงก์ถาวร แชร์ให้ผู้บริหารผ่าน LINE ได้ทันที

- รายงานถูก deploy ไปยัง **โปรเจกต์ Vercel แยกต่างหาก** (ค่าเริ่มต้นชื่อ `pv-exec-report`)
  → **ไม่ทับ / ไม่ปนกับ dashboard หลัก** เด็ดขาด
- ทุกครั้งที่กด Deploy จะ **อัปเดตทับลิงก์เดิม** (URL เดียวคงที่ เช่น `https://pv-exec-report.vercel.app`)
- ใช้ข้อมูลตาม **ตัวกรองปัจจุบัน** บน dashboard ขณะกด Deploy

---

## ตั้งค่า 1 ครั้ง

### 1) สร้าง Vercel Access Token
1. ไปที่ <https://vercel.com/account/tokens>
2. **Create Token** → ตั้งชื่อ เช่น `pv-exec-deploy` → เลือก scope ให้ครอบคลุมการสร้าง deployment
3. คัดลอกค่า token ไว้ (จะเห็นครั้งเดียว)

### 2) ใส่ Environment Variables ในโปรเจกต์ dashboard หลัก (บน Vercel)
โปรเจกต์หลัก → **Settings → Environment Variables** เพิ่ม:

| Key | Value | จำเป็น |
|-----|-------|--------|
| `VERCEL_DEPLOY_TOKEN` | token จากขั้นที่ 1 | ✅ ใช่ |
| `VERCEL_TEAM_ID` | team id (ถ้าโปรเจกต์อยู่ใต้ Team) | ไม่ — เฉพาะกรณีใช้ Team |
| `EXEC_REPORT_PROJECT` | ชื่อโปรเจกต์ปลายทาง (ดีฟอลต์ `pv-exec-report`) | ไม่ |

> หา Team ID ได้ที่ Team → **Settings → General** (`team_xxx`)
> ถ้าชื่อ `pv-exec-report` ถูกใช้ไปแล้ว ให้ตั้ง `EXEC_REPORT_PROJECT` เป็นชื่อที่ไม่ซ้ำ
> เช่น `pv-exec-report-tarostox`

### 3) Redeploy โปรเจกต์หลัก 1 ครั้ง
เพื่อให้ Environment Variables มีผล (และให้ Vercel เห็นฟังก์ชัน `/api/deploy`)

---

## วิธีใช้
1. เปิด dashboard บนเว็บ (ที่รันบน Vercel) → กรองข้อมูลตามต้องการ
2. กด **Export** → เลือกหน้า + รูปแบบ **.HTML**
3. กด **☁️ Deploy & รับลิงก์แชร์**
4. ลิงก์จะถูกคัดลอกให้อัตโนมัติ → วางส่งใน LINE / กด **🔗 เปิดดู** เพื่อตรวจ

---

## หมายเหตุ
- ปุ่ม Deploy ทำงานได้เฉพาะตอนเปิด dashboard **ผ่านเว็บที่ deploy บน Vercel**
  (เปิดไฟล์ในเครื่อง/Google Drive จะไม่มี `/api/deploy` ให้เรียก)
- รายงานที่ deploy เป็น **snapshot** ของข้อมูล ณ เวลาที่กด — ต้องการอัปเดตให้กด Deploy ซ้ำ
- token ถูกเก็บฝั่ง server (Environment Variable) เท่านั้น — ไม่อยู่ในเบราว์เซอร์ผู้ใช้
