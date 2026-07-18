# MIGRATION — ย้าย Ownership ไปยังบริษัท (Organization + Full Handover)

> ⚠️ **repo นี้เป็น PUBLIC** — ห้ามใส่อีเมลจริง / token / secret / ID ในไฟล์นี้
> ค่าจริงทั้งหมด (อีเมลผู้ดูแล, sheet id, token) ให้เก็บใน **บันทึกส่วนตัว/password manager** เท่านั้น
> เอกสารนี้ใช้ **placeholder** — ดู `OWNERSHIP.md` สำหรับผังทรัพยากร (ก็ redacted เช่นกัน)

เป้าหมาย: ย้ายทรัพยากรจาก **บัญชีส่วนตัว (SOURCE)** → **บริษัท** โดยมีเจ้าของ 2 คน
(**Owner A**, **Owner B** — อีเมล `@powervaultthailand.com`) และถอดเจ้าของเดิมออกเป็นขั้นสุดท้าย

- **SOURCE (เดิม):** GitHub user `tarostox-coder` + Vercel/Google ใต้ Gmail ส่วนตัว
- **TARGET (ใหม่):** GitHub **Org บริษัท** (Free) + Vercel บัญชีบริษัท + Google บริษัท
- **ตัดออกจากขอบเขต:** อีเมลที่ใช้กับ Claude AI (ไม่ใช่เจ้าของทรัพยากร — ยืนยันแล้วว่าไม่มีสิทธิ์บน repo)

---

## กติกาความปลอดภัย
- ✅ ให้สิทธิ์เจ้าของใหม่ + ทดสอบให้ผ่าน **ก่อน** ถอดเจ้าของเดิม (กัน lockout)
- ✅ Secret/token = **ออกใหม่** ใต้บัญชีบริษัท ไม่ copy ค่าเดิม
- ❌ ห้ามลบ repo/project/deployment/domain/ข้อมูลเดิม
- ❌ ยังไม่แตะ DNS/billing จนกว่าจะยืนยันพร้อม

---

## Phase 0 · เตรียมบัญชี
- [ ] Owner A สมัคร GitHub → มี username (จดใน private records)
- [ ] Owner B สมัคร GitHub → มี username
- [ ] ยืนยันอีเมลบริษัททั้งสองรับเมลได้ (ใช้รับ invite Vercel/Google)

## Phase 1 · ให้สิทธิ์ก่อน (ยังไม่ถอดของเดิม)
- [ ] GitHub: เชิญ 2 username เป็น **admin collaborator** บน repo (ชั่วคราว)
- [ ] Google Sheet (`EXEC_SHEET_ID` ใน `index.html`): แชร์ 2 อีเมล = **Editor**
- [ ] Apps Script project: เพิ่ม 2 อีเมลเป็นผู้แก้ไข

## Phase 2 · GitHub Organization + Transfer  *(หน้าเว็บ — เจ้าของต้องกดยืนยันเอง)*
- [ ] สร้าง Org (Free plan) ชื่อบริษัท
- [ ] Org → People → เชิญ 2 username → role = **Owner** ทั้งคู่ → ให้กดรับเชิญ
- [ ] Repo → Settings → Danger Zone → **Transfer** → โอนเข้า Org (พิมพ์ชื่อ repo ยืนยัน)
      *(ไม่ลบอะไร · ลิงก์เดิม redirect · history/PR/issue อยู่ครบ)*
- [ ] ตรวจ Branch protection ของ `main`
- [ ] ถ้ามี Actions secrets ระดับ repo → **ตั้งค่าใหม่** (ไม่ copy)

## Phase 3 · Vercel (ฟรี — บัญชีบริษัทกลาง)  *(หน้าเว็บ)*
> Hobby (ฟรี) = บัญชีเดี่ยว เพิ่มหลาย owner ไม่ได้ → ใช้บัญชี Vercel กลางของบริษัท 1 บัญชี
> อยากได้ทีมหลาย owner จริง = ต้อง Pro (มีค่าใช้จ่าย, ตัดสินใจภายหลัง)
- [ ] เตรียมบัญชี Vercel กลางบริษัท (login ด้วยอีเมลบริษัท / ผูก Org GitHub)
- [ ] ติดตั้ง **Vercel GitHub App** บน Org
- [ ] Transfer/Import โปรเจกต์หลัก + โปรเจกต์รายงาน → ชี้ repo ใน Org
- [ ] ออก **token ใหม่** (Vercel account → tokens) — เก็บค่าไว้ที่ private records
- [ ] ตั้ง Environment Variables (ชื่อเท่านั้น — ค่าไม่อยู่ในไฟล์นี้):
      `VERCEL_DEPLOY_TOKEN` (จำเป็น) · `VERCEL_TEAM_ID` (ถ้าใช้ Team) · `EXEC_REPORT_PROJECT` (ออปชัน)
- [ ] Redeploy production 1 ครั้ง
- [ ] custom domain (ถ้ามี) — ยังไม่แตะ DNS

## Phase 4 · Google (Sheet + Apps Script)  *(หน้าเว็บ)*
- [ ] Google Sheet → เปลี่ยนเจ้าของ (Transfer ownership) → บัญชีบริษัท (คง Anyone-with-link = Viewer)
- [ ] Apps Script → ตั้งเจ้าของใหม่ + ตรวจ onEdit trigger ทำงาน

## Phase 5 · ทดสอบให้ผ่านครบ (ก่อนถอดของเก่า)
- [ ] production เปิดได้ · `/exec` แสดง live
- [ ] ปุ่ม Deploy รายงาน → สร้างลิงก์ + เปิดได้โดยไม่ต้องล็อกอิน
- [ ] แก้ Sheet → dashboard refresh + ChangeLog บันทึกผู้แก้

## Phase 6 · ถอดเจ้าของเดิม (ขั้นสุดท้ายเท่านั้น) 🔒
> ทำหลัง Phase 5 ผ่านครบเท่านั้น
- [ ] GitHub: ถอด user เดิมออกจาก collaborator/owner (repo เป็นของ Org แล้ว)
- [ ] Vercel: ถอดบัญชีเดิม + **เพิกถอน token เก่า**
- [ ] Google: ถอดบัญชีเดิมจากสิทธิ์ Sheet/Script
- [ ] ยืนยัน: ไม่มีบัญชีส่วนตัว/อีเมล Claude ค้างสิทธิ์ที่ใด

---

## สถานะการย้าย (อัปเดตทีละขั้น)
| Phase | สถานะ | ผู้ทำ | วันที่ |
|---|---|---|---|
| 0 เตรียมบัญชี | ⬜ ยังไม่เริ่ม | | |
| 1 ให้สิทธิ์ | ⬜ | | |
| 2 GitHub Org+Transfer | ⬜ | | |
| 3 Vercel | ⬜ | | |
| 4 Google | ⬜ | | |
| 5 ทดสอบ | ⬜ | | |
| 6 ถอดเจ้าของเดิม | ⬜ | | |
