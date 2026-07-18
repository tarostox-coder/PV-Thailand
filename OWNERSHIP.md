# OWNERSHIP & ACCESS — ผังทรัพยากรและสิทธิ์ (Living Document)

> ⚠️ **repo นี้เป็น PUBLIC** — อย่าใส่ **อีเมลจริง / token / secret / sheet id** ในไฟล์นี้
> ช่องอีเมลใช้ **placeholder** — เก็บค่าจริงใน password manager / เอกสารภายในบริษัทเท่านั้น
> อัปเดตไฟล์นี้ทุกครั้งที่สิทธิ์เปลี่ยน (เพิ่ม/ถอนคน, ออก token ใหม่)

ปรับปรุงล่าสุด: _(ใส่วันที่เมื่อแก้)_

## 1. ทรัพยากรในขอบเขต (จากการตรวจสอบโค้ด)
| ทรัพยากร | ระบุตัว | หมายเหตุ |
|---|---|---|
| GitHub repo | `tarostox-coder/PV-Thailand` | public · default branch `main` |
| Production dashboard | `pv-thailand-1hh3.vercel.app` | Vercel static + serverless |
| Executive View | `…/exec` (rewrite ใน `vercel.json`) | read-only live |
| Report project (แยก) | `pv-exec-report` → `pv-exec-report.vercel.app` | deploy จากปุ่ม Export |
| Google Sheet (data source) | `EXEC_SHEET_ID` (ค่าอยู่ใน `index.html`) | ชีตสาธารณะ Viewer |
| Google Apps Script | `apps-script/PV-ChangeLog.gs` | onEdit ChangeLog logger |
| Vercel↔GitHub | Vercel GitHub App | auto-deploy จาก `main` |

## 2. Secrets / Env Vars (ชื่อเท่านั้น — ไม่มีค่า)
| key | ที่อยู่ | ใช้ทำอะไร |
|---|---|---|
| `VERCEL_DEPLOY_TOKEN` | Vercel · โปรเจกต์หลัก → Env Vars | ให้ปุ่ม Deploy เผยแพร่รายงาน |
| `VERCEL_TEAM_ID` | Vercel · Env Vars (ออปชัน) | scope โปรเจกต์ปลายทาง (ถ้าใช้ Team) |
| `EXEC_REPORT_PROJECT` | Vercel · Env Vars (ออปชัน) | ชื่อโปรเจกต์รายงาน (default `pv-exec-report`) |

> ค่าจริงของ token ให้เก็บใน password manager — **ห้าม commit**

## 3. Access Matrix (placeholder — เติมชื่อจริงในเอกสารภายใน)
| บุคคล / บัญชี | GitHub | Vercel | Google (Sheet/Script) | สถานะ |
|---|---|---|---|---|
| Source (เจ้าของเดิม, ส่วนตัว) | Owner (เดิม) | Owner (เดิม) | Owner (เดิม) | รอถอดออกใน Phase 6 |
| **Owner A** `@powervaultthailand.com` | Org Owner *(target)* | Admin/Owner *(target)* | Editor→Owner *(target)* | ⬜ ยังไม่เพิ่ม |
| **Owner B** `@powervaultthailand.com` | Org Owner *(target)* | Admin *(target)* | Editor *(target)* | ⬜ ยังไม่เพิ่ม |
| อีเมล Claude AI | — (ไม่มีสิทธิ์) | — | — | ✅ ยืนยันไม่มีสิทธิ์บน repo |

## 4. Billing (ห้ามเปลี่ยนโดยไม่ได้รับอนุมัติ)
| บริการ | แผนปัจจุบัน | หมายเหตุ |
|---|---|---|
| GitHub Org | Free ($0) | เพียงพอสำหรับ 1 repo + 2 owner |
| Vercel | Hobby (ฟรี) | ทีมหลาย owner ต้อง Pro (มีค่าใช้จ่าย) — ตัดสินใจภายหลัง |
| Google | ตาม Workspace/Gmail ที่ใช้ | — |

## 5. ต้องทำผ่านหน้าเว็บด้วยตนเอง (AI ทำแทนไม่ได้)
สร้าง Org · Transfer repo · จัดการ Vercel/Google/DNS/billing · ออก/เพิกถอน token · ถอดสิทธิ์เจ้าของ
