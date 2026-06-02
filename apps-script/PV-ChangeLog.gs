/**
 * ════════════════════════════════════════════════════════════════════════
 *  PV DASHBOARD — CHANGE LOGGER  (Google Apps Script)
 * ════════════════════════════════════════════════════════════════════════
 *  บันทึก "ใครแก้ · อะไร · เมื่อไหร่" ของทุกการแก้ไขในชีตนี้ ลงในแท็บชื่อ
 *  "ChangeLog" — แล้ว Dashboard จะอ่านแท็บนี้มาแสดงชื่อผู้แก้โดยอัตโนมัติ
 *
 *  ── วิธีติดตั้ง (ทำครั้งเดียว) ─────────────────────────────────────────
 *   1. เปิด Google Sheet ของโครงการ → เมนู  Extensions → Apps Script
 *   2. ลบโค้ดเดิมทั้งหมด แล้ว "วาง" โค้ดในไฟล์นี้ทั้งหมด → กด 💾 Save
 *   3. เลือกฟังก์ชัน  setup  ที่แถบบน → กด ▶ Run
 *      → กดยอมรับสิทธิ์ (Review permissions → เลือกบัญชี → Allow)
 *   4. เสร็จ! ทุกการแก้ไขจะถูกบันทึกพร้อมชื่อผู้แก้ตั้งแต่บัดนี้
 *
 *  ── ข้อควรรู้เรื่อง "ชื่อผู้แก้" ────────────────────────────────────────
 *   • ถ้าผู้แก้อยู่ใน Google Workspace องค์กรเดียวกัน → ได้อีเมลผู้แก้ครบ
 *   • ถ้าเป็น Gmail ส่วนตัว/คนนอกองค์กร Google อาจไม่เปิดเผยอีเมล
 *     → ช่องผู้แก้จะขึ้น "(unknown)" (เป็นข้อจำกัดด้านความเป็นส่วนตัวของ Google
 *       ไม่ใช่บั๊ก) ส่วน "อะไรเปลี่ยน" จะยังบันทึกครบทุกครั้ง
 *
 *  Dashboard อ่านแท็บนี้ผ่านลิงก์สาธารณะของชีต (ที่แชร์ "Anyone with link =
 *  Viewer" อยู่แล้ว) — ไม่ต้องใส่ API key ใด ๆ
 * ════════════════════════════════════════════════════════════════════════
 */

var LOG_SHEET = "ChangeLog";
var HEADERS   = ["Timestamp", "Editor", "Tab", "Row", "Project", "Column", "Old", "New"];

/** Run this ONCE to create the log sheet + install the edit trigger. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureLogSheet_(ss);
  var exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === "pvOnEdit";
  });
  if (!exists) {
    ScriptApp.newTrigger("pvOnEdit").forSpreadsheet(ss).onEdit().create();
  }
  try { SpreadsheetApp.getUi().alert("PV ChangeLog: ติดตั้งสำเร็จ ✓\nทุกการแก้ไขจะถูกบันทึกในแท็บ \"ChangeLog\""); } catch (e) {}
}

/** Create the ChangeLog tab with headers if it doesn't exist. */
function ensureLogSheet_(ss) {
  var sh = ss.getSheetByName(LOG_SHEET);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
    // NOTE: left visible on purpose so the dashboard can always read it via gviz.
    // You may move it to the far right; do NOT delete it.
  }
  return sh;
}

/** Installable onEdit trigger — logs each edited cell with the editor's identity. */
function pvOnEdit(e) {
  try {
    if (!e || !e.range) return;
    var ss    = e.source || SpreadsheetApp.getActiveSpreadsheet();
    var sheet = e.range.getSheet();
    if (sheet.getName() === LOG_SHEET) return; // never log the log itself
    var log   = ensureLogSheet_(ss);

    // Who? (works for same-domain editors / the owner; may be blank for external Gmail)
    var who = "";
    try { who = (e.user && e.user.getEmail && e.user.getEmail()) || ""; } catch (_) {}
    if (!who) { try { who = Session.getActiveUser().getEmail() || ""; } catch (_) {} }
    if (!who) { try { who = Session.getEffectiveUser().getEmail() || ""; } catch (_) {} }
    if (!who) who = "(unknown)";

    var headerRow = 1;
    var lastCol   = Math.max(sheet.getLastColumn(), 1);
    var headers   = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
    var nameCol   = findNameCol_(headers); // 1-based; 0 if not found

    var rng = e.range;
    var r0 = rng.getRow(), c0 = rng.getColumn();
    var nr = rng.getNumRows(), nc = rng.getNumColumns();
    var now = new Date();
    var out = [];

    for (var i = 0; i < nr; i++) {
      for (var j = 0; j < nc; j++) {
        var rr = r0 + i, cc = c0 + j;
        if (rr <= headerRow) continue; // skip header edits
        var colName = headers[cc - 1] || ("Col " + cc);
        var project = nameCol ? sheet.getRange(rr, nameCol).getValue() : "";
        var newVal  = sheet.getRange(rr, cc).getValue();
        var oldVal  = "";
        // Google only exposes oldValue for single-cell edits
        if (nr === 1 && nc === 1 && e.oldValue !== undefined) oldVal = e.oldValue;
        out.push([now, who, sheet.getName(), rr, project, colName, oldVal, newVal]);
      }
    }

    if (out.length) {
      log.getRange(log.getLastRow() + 1, 1, out.length, HEADERS.length).setValues(out);
      // keep the log bounded — trim oldest beyond 2000 entries
      var max = 2000;
      var n = log.getLastRow() - 1;
      if (n > max) log.deleteRows(2, n - max);
    }
  } catch (err) {
    // never block the user's edit, even on error
  }
}

/** Find the project-name column (1-based) by fuzzy header match. */
function findNameCol_(headers) {
  var kw = ["ชื่อโครงการ", "project name", "projectname", "โครงการ", "project", "name"];
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || "").toLowerCase().trim();
    if (!h) continue;
    for (var k = 0; k < kw.length; k++) {
      if (h.indexOf(kw[k]) >= 0) return i + 1;
    }
  }
  return 0;
}
