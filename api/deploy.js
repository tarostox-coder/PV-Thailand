// ───────────────────────────────────────────────────────────────────────────
// Vercel Serverless Function — publish the exported Executive Report as its own
// standalone, shareable web page.
//
// WHY A SEPARATE PROJECT:
//   The report is deployed to a DISTINCT Vercel project (default "pv-exec-report"),
//   never to the main dashboard project. So the live dashboard at /exec is never
//   overwritten or mixed with the snapshot report. Each deploy overwrites the same
//   production URL (e.g. https://pv-exec-report.vercel.app) so the share link is stable.
//
// SETUP (once): add these in the MAIN project → Settings → Environment Variables
//   VERCEL_DEPLOY_TOKEN   (required)  a Vercel access token with deploy scope
//   VERCEL_TEAM_ID        (optional)  set if the project lives under a Team
//   EXEC_REPORT_PROJECT   (optional)  target project name, default "pv-exec-report"
// See DEPLOY-SETUP.md for the step-by-step guide.
// ───────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed — ใช้ POST เท่านั้น" });
    return;
  }

  const token = process.env.VERCEL_DEPLOY_TOKEN;
  if (!token) {
    res.status(500).json({
      error: "ยังไม่ได้ตั้งค่า VERCEL_DEPLOY_TOKEN ใน Environment Variables ของโปรเจกต์ (ดู DEPLOY-SETUP.md)",
    });
    return;
  }

  // Body may arrive pre-parsed (object) or as a raw JSON string depending on runtime.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  const html = body && body.html;
  if (!html || typeof html !== "string") {
    res.status(400).json({ error: "ไม่มีเนื้อหา HTML สำหรับ deploy" });
    return;
  }

  // Sanitise the target project name to a valid Vercel slug.
  const project = String(process.env.EXEC_REPORT_PROJECT || "pv-exec-report")
    .toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/^-+|-+$/g, "").slice(0, 52) || "pv-exec-report";

  const teamId = process.env.VERCEL_TEAM_ID || "";
  const q = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";

  const data = Buffer.from(html, "utf8").toString("base64");
  const payload = {
    name: project,
    target: "production",                       // keep a stable production alias per deploy
    files: [{ file: "index.html", data, encoding: "base64" }],
    projectSettings: { framework: null },       // plain static — no build step
  };

  try {
    const r = await fetch(`https://api.vercel.com/v13/deployments${q}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));

    if (!r.ok) {
      const msg = (j && j.error && j.error.message) || `Vercel API error (HTTP ${r.status})`;
      res.status(r.status >= 400 && r.status < 600 ? r.status : 502).json({ error: msg });
      return;
    }

    // Prefer a real production alias from the response; fall back to the conventional slug.
    let alias = "";
    if (Array.isArray(j.alias) && j.alias.length) {
      const vercelAliases = j.alias.filter((a) => /\.vercel\.app$/.test(a));
      alias = (vercelAliases.sort((a, b) => a.length - b.length)[0]) || j.alias[0];
    }
    if (!alias) alias = `${project}.vercel.app`;
    alias = "https://" + alias.replace(/^https?:\/\//, "");

    const deployUrl = j.url ? "https://" + String(j.url).replace(/^https?:\/\//, "") : alias;

    res.status(200).json({
      url: alias,
      deployUrl,
      project,
      state: j.readyState || j.status || null,
    });
  } catch (e) {
    res.status(502).json({ error: "เชื่อมต่อ Vercel API ไม่สำเร็จ: " + (e && e.message ? e.message : String(e)) });
  }
}
