"use client";
import { useState, useMemo, useEffect } from "react";

const SUPABASE_URL = "https://bsetsywfkvbzckcndseh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXRzeXdma3ZiemNrY25kc2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzI0MTQsImV4cCI6MjA5NTYwODQxNH0.Et5hbS7b_xQ5_i2SVpnEvmdUGIg8KhTLNCJLDqFDwtg";

const db = {
  async insert(table: string, data: any) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Prefer": "return=minimal" },
        body: JSON.stringify(data)
      });
      if (res.ok || res.status === 201) return { ok: true };
      const err = await res.json().catch(() => ({}));
      return { ok: false, code: err.code, message: err.message };
    } catch (e: any) { return { ok: false, message: e.message }; }
  },
  async select(table: string, params: string = "") {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
      });
      return res.ok ? res.json() : [];
    } catch { return []; }
  }
};

const TOOLS = [
  { id: 1, name: "Vercel", category: "Hosting", tags: ["frontend", "serverless", "free tier"], description: "Deploy frontend apps instantly with git-based workflows. Zero config for Next.js.", pricing: "Free+", affiliate: "https://vercel.com", badge: "Popular" },
  { id: 2, name: "Netlify", category: "Hosting", tags: ["frontend", "CI/CD", "free tier"], description: "Fastest way to build, deploy and scale modern web apps with CI/CD built-in.", pricing: "Free+", affiliate: "https://netlify.com", badge: null },
  { id: 3, name: "DigitalOcean", category: "Hosting", tags: ["cloud", "VPS", "backend"], description: "Cloud infrastructure for developers. Droplets, Kubernetes, managed databases.", pricing: "Paid", affiliate: "https://digitalocean.com", badge: "High Payout" },
  { id: 4, name: "Railway", category: "Hosting", tags: ["backend", "database", "free tier"], description: "Deploy backends, databases, cron jobs in seconds with zero config.", pricing: "Free+", affiliate: "https://railway.app", badge: null },
  { id: 5, name: "Render", category: "Hosting", tags: ["backend", "frontend", "free tier"], description: "Unified cloud for all your apps. Auto-deploys from Git, free SSL, global CDN.", pricing: "Free+", affiliate: "https://render.com", badge: null },
  { id: 6, name: "Supabase", category: "Database", tags: ["postgres", "realtime", "auth"], description: "Open source Firebase alternative. Postgres + Auth + Storage + Realtime.", pricing: "Free+", affiliate: "https://supabase.com", badge: "Popular" },
  { id: 7, name: "PlanetScale", category: "Database", tags: ["MySQL", "serverless", "scalable"], description: "Serverless MySQL platform built on Vitess. Scales like a planet.", pricing: "Free+", affiliate: "https://planetscale.com", badge: null },
  { id: 8, name: "Neon", category: "Database", tags: ["postgres", "serverless", "free tier"], description: "Serverless Postgres with autoscaling, branching, and bottomless storage.", pricing: "Free+", affiliate: "https://neon.tech", badge: "New" },
  { id: 9, name: "Upstash", category: "Database", tags: ["Redis", "serverless", "edge"], description: "Serverless Redis and Kafka. Pay-per-request, zero infra to manage.", pricing: "Free+", affiliate: "https://upstash.com", badge: null },
  { id: 10, name: "Clerk", category: "Auth", tags: ["authentication", "UI", "react"], description: "The most powerful user management platform. Drop-in auth with beautiful UI.", pricing: "Free+", affiliate: "https://clerk.com", badge: "Popular" },
  { id: 11, name: "Auth0", category: "Auth", tags: ["authentication", "enterprise", "OAuth"], description: "Secure access for everyone. Auth for web, mobile, and legacy apps.", pricing: "Free+", affiliate: "https://auth0.com", badge: null },
  { id: 12, name: "Stripe", category: "Payments", tags: ["payments", "subscriptions", "billing"], description: "The complete payments platform. Accept payments, send payouts, automate finances.", pricing: "Per-use", affiliate: "https://stripe.com", badge: "Essential" },
  { id: 13, name: "Resend", category: "Email", tags: ["email", "transactional", "developer"], description: "Email for developers. The best way to reach humans instead of spam folders.", pricing: "Free+", affiliate: "https://resend.com", badge: "New" },
  { id: 14, name: "Cloudflare", category: "CDN", tags: ["CDN", "DNS", "security", "free"], description: "DDoS protection, CDN, DNS, and zero-trust security for any app.", pricing: "Free+", affiliate: "https://cloudflare.com", badge: null },
  { id: 15, name: "GitHub Copilot", category: "AI Coding", tags: ["AI", "autocomplete", "productivity"], description: "Your AI pair programmer. Suggests code completions in real-time in your editor.", pricing: "Paid", affiliate: "https://github.com/features/copilot", badge: "High Payout" },
  { id: 16, name: "Sentry", category: "Monitoring", tags: ["errors", "performance", "debugging"], description: "Application monitoring that helps every developer diagnose and fix issues.", pricing: "Free+", affiliate: "https://sentry.io", badge: null },
  { id: 17, name: "Linear", category: "Productivity", tags: ["issues", "roadmap", "team"], description: "The issue tracking tool you will actually enjoy using. Fast and keyboard-first.", pricing: "Free+", affiliate: "https://linear.app", badge: null },
  { id: 18, name: "Postman", category: "API Testing", tags: ["API", "testing", "collaboration"], description: "The world leading API platform for building and using APIs.", pricing: "Free+", affiliate: "https://postman.com", badge: null },
];

const CATEGORIES = ["All", ...Array.from(new Set(TOOLS.map((t: any) => t.category)))];
const BADGE_STYLE: any = {
  "Popular":     { bg: "#0d2b0d", color: "#4caf50" },
  "High Payout": { bg: "#2b1a00", color: "#ff9800" },
  "New":         { bg: "#001a2b", color: "#29b6f6" },
  "Essential":   { bg: "#2b0000", color: "#ef5350" },
};

const inp = { background: "#0d0d1a", border: "1px solid #16162a", color: "#c8c8d8", padding: "11px 14px", fontSize: 13, fontFamily: "'Courier New', monospace", outline: "none", width: "100%", boxSizing: "border-box" as const };
const btn = { background: "#6d28d9", color: "#fff", border: "none", padding: "11px 20px", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: 700 };

function ToolCard({ tool, onVisit }: any) {
  const [hov, setHov] = useState(false);
  const bs = tool.badge ? BADGE_STYLE[tool.badge] : null;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#0d0d1a" : "#080810", padding: "20px", transition: "background 0.15s", display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{tool.name}</span>
            {bs && <span style={{ fontSize: 8, padding: "2px 5px", background: bs.bg, color: bs.color, fontWeight: 700 }}>{tool.badge.toUpperCase()}</span>}
          </div>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.12em", marginTop: 2 }}>{tool.category.toUpperCase()}</div>
        </div>
        <span style={{ fontSize: 9, color: "#444", whiteSpace: "nowrap" as const }}>{tool.pricing}</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "#666", lineHeight: 1.7 }}>{tool.description}</p>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
        {tool.tags.map((tag: string) => <span key={tag} style={{ fontSize: 8, color: "#333", border: "1px solid #16162a", padding: "1px 5px" }}>{tag}</span>)}
      </div>
      <a href={tool.affiliate} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(tool.name)}
        style={{ display: "inline-block", background: hov ? "#6d28d9" : "transparent", color: hov ? "#fff" : "#444", border: `1px solid ${hov ? "#6d28d9" : "#16162a"}`, padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em", textDecoration: "none", fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s", alignSelf: "flex-start" as const }}>
        VISIT SITE
      </a>
    </div>
  );
}

function DirectoryView({ onVisit }: any) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", category: "", description: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formDone, setFormDone] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filtered = useMemo(() => TOOLS.filter((t: any) => {
    const matchCat = cat === "All" || t.category === cat;
    const q = search.toLowerCase();
    return matchCat && (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((g: string) => g.includes(q)));
  }), [search, cat]);

  const askAI = async () => {
    if (!apiKey) { setShowKey(true); return; }
    if (!query.trim()) return;
    setAiLoading(true); setAiResult("");
    try {
      const list = TOOLS.map((t: any) => `${t.name} (${t.category}): ${t.description}`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 800,
          system: `You are a dev tools advisor. Directory:\n${list}\n\nRecommend 2-3 tools. Format: **Tool Name** - one sentence reason. End with one short tip.`,
          messages: [{ role: "user", content: query }]
        })
      });
      const data = await res.json();
      setAiResult(data.content?.[0]?.text || "Could not get recommendations.");
    } catch { setAiResult("Error. Check your API key."); }
    setAiLoading(false);
  };

  const handleSubscribe = async () => {
    if (!email.includes("@")) { showToast("Enter a valid email."); return; }
    setSubLoading(true);
    const result: any = await db.insert("newsletter_subscribers", { email });
    setSubLoading(false);
    if (result.ok) { setSubDone(true); showToast("Subscribed! Email saved."); }
    else if (result.code === "23505") { setSubDone(true); showToast("Already subscribed!"); }
    else { showToast("Error: " + (result.message || "Try again.")); }
  };

  const handleSubmitTool = async () => {
    if (!form.name || !form.url || !form.category || !form.description) { showToast("Fill all fields."); return; }
    setFormLoading(true);
    const result: any = await db.insert("tool_submissions", form);
    setFormLoading(false);
    if (result.ok) {
      setFormDone(true); showToast("Tool submitted!");
      setTimeout(() => { setShowSubmit(false); setFormDone(false); setForm({ name: "", url: "", category: "", description: "" }); }, 2000);
    } else { showToast("Error: " + (result.message || "Try again.")); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {toast && <div style={{ position: "fixed", bottom: 20, right: 20, background: "#6d28d9", color: "#fff", padding: "12px 18px", fontSize: 12, zIndex: 999 }}>{toast}</div>}
      {showSubmit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 32, width: "100%", maxWidth: 440, position: "relative" }}>
            <button onClick={() => setShowSubmit(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>x</button>
            {formDone ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#4caf50" }}>Tool submitted!</div>
            ) : (
              <>
                <h2 style={{ margin: "0 0 18px", fontSize: 16, color: "#fff", fontWeight: 800 }}>Submit a Tool</h2>
                {["name", "url", "category", "description"].map((field: string) => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#444", marginBottom: 5 }}>{field.toUpperCase()}</div>
                    {field === "description"
                      ? <textarea value={(form as any)[field]} onChange={(e: any) => setForm((p: any) => ({ ...p, [field]: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" as const }} />
                      : <input type="text" value={(form as any)[field]} onChange={(e: any) => setForm((p: any) => ({ ...p, [field]: e.target.value }))} style={inp} />}
                  </div>
                ))}
                <button onClick={handleSubmitTool} disabled={formLoading} style={{ ...btn, width: "100%", marginTop: 4 }}>
                  {formLoading ? "SAVING..." : "SUBMIT"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 16, marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#6d28d9", marginBottom: 14 }}>// CURATED DEV TOOLS</div>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 52px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 10px", color: "#fff", letterSpacing: "-0.025em" }}>
            Find the right tool.<br /><span style={{ color: "#6d28d9" }}>Ship faster.</span>
          </h1>
          <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{TOOLS.length} handpicked tools for developers.</p>
        </div>
        <button onClick={() => setShowSubmit(true)} style={{ ...btn, marginTop: 4 }}>+ SUBMIT TOOL</button>
      </div>

      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: "18px 20px", marginBottom: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" as const }}>
        <div style={{ flex: "1 1 180px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6d28d9", marginBottom: 4 }}>// WEEKLY NEWSLETTER</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Get new tools every week</div>
        </div>
        <div style={{ flex: "1 1 280px" }}>
          {subDone ? (
            <div style={{ padding: "10px 16px", background: "#0d2b0d", border: "1px solid #2e7d32", color: "#4caf50", fontSize: 11 }}>SUBSCRIBED!</div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" placeholder="your@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && handleSubscribe()} style={{ ...inp, flex: 1 }} />
              <button onClick={handleSubscribe} disabled={subLoading} style={{ ...btn, whiteSpace: "nowrap" as const }}>{subLoading ? "..." : "SUBSCRIBE"}</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#0d0d1a", border: "1px solid #6d28d9", padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#a78bfa", fontWeight: 700, marginBottom: 12 }}>AI TOOL RECOMMENDER</div>
        {showKey && (
          <div style={{ marginBottom: 12, padding: 12, background: "#080810", border: "1px solid #16162a" }}>
            <div style={{ fontSize: 8, color: "#444", marginBottom: 5 }}>ANTHROPIC API KEY</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={(e: any) => setApiKey(e.target.value)} style={{ ...inp, flex: 1 }} />
              <button onClick={() => setShowKey(false)} style={{ ...btn, padding: "11px 14px" }}>SET</button>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="e.g. Building SaaS with Next.js, need auth and database" value={query} onChange={(e: any) => setQuery(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && askAI()} style={{ ...inp, flex: 1 }} />
          <button onClick={askAI} disabled={aiLoading} style={{ ...btn, whiteSpace: "nowrap" as const }}>{aiLoading ? "..." : "RECOMMEND"}</button>
        </div>
        {!apiKey && !showKey && <div style={{ marginTop: 8, fontSize: 10, color: "#444" }}>
          <button onClick={() => setShowKey(true)} style={{ background: "none", border: "none", color: "#6d28d9", cursor: "pointer", fontFamily: "inherit", fontSize: 10, padding: 0, textDecoration: "underline" }}>Add API key</button> to enable
        </div>}
        {aiResult && <div style={{ marginTop: 14, padding: 14, background: "#080810", border: "1px solid #16162a", fontSize: 12, lineHeight: 1.9, color: "#a0a0c0", whiteSpace: "pre-wrap" as const }}>{aiResult}</div>}
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <input type="text" placeholder="Search tools..." value={search} onChange={(e: any) => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 34 }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 17 }}>x</button>}
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 24 }}>
        {CATEGORIES.map((c: any) => (
          <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? "#6d28d9" : "transparent", color: cat === c ? "#fff" : "#444", border: `1px solid ${cat === c ? "#6d28d9" : "#16162a"}`, padding: "4px 11px", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit", fontWeight: cat === c ? 700 : 400 }}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 14, fontSize: 9, color: "#333" }}>{filtered.length} TOOLS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "#16162a" }}>
        {filtered.map((t: any) => <ToolCard key={t.id} tool={t} onVisit={onVisit} />)}
      </div>
      <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #16162a", fontSize: 9, color: "#222" }}>
        DEVSTACK EARNS AFFILIATE COMMISSIONS ON SOME LINKS.
      </div>
    </div>
  );
}

function AnalyticsView({ liveClicks }: any) {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [clicks, setClicks] = useState([]);
  const [subs, setSubs] = useState(0);
  const [submissions, setSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const checkPassword = () => {
    if (pwInput === "R@hul27patil") { setAuthed(true); setPwError(false); }
    else { setPwError(true); setPwInput(""); }
  };

  const loadData = async () => {
    setLoading(true);
    const [clickData, subData, submsData]: any = await Promise.all([
      db.select("affiliate_clicks", "select=tool_name"),
      db.select("newsletter_subscribers", "select=id"),
      db.select("tool_submissions", "select=id"),
    ]);
    setClicks(Array.isArray(clickData) ? clickData : []);
    setSubs(Array.isArray(subData) ? subData.length : 0);
    setSubmissions(Array.isArray(submsData) ? submsData.length : 0);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { if (authed) loadData(); }, [authed]);

  if (!authed) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 40, width: 320, textAlign: "center" as const }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>&#128274;</div>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6d28d9", marginBottom: 8 }}>ANALYTICS ACCESS</div>
        <h2 style={{ margin: "0 0 20px", fontSize: 16, color: "#fff", fontWeight: 800 }}>Enter Password</h2>
        <input type="password" placeholder="Password" value={pwInput}
          onChange={(e: any) => setPwInput(e.target.value)}
          onKeyDown={(e: any) => e.key === "Enter" && checkPassword()}
          style={{ ...inp, marginBottom: 10, textAlign: "center" as const }} />
        {pwError && <div style={{ fontSize: 11, color: "#ef5350", marginBottom: 10 }}>Wrong password.</div>}
        <button onClick={checkPassword} style={{ ...btn, width: "100%" }}>UNLOCK</button>
      </div>
    </div>
  );

  const clickCounts: any = {};
  clicks.forEach((c: any) => { clickCounts[c.tool_name] = (clickCounts[c.tool_name] || 0) + 1; });
  Object.entries(liveClicks).forEach(([name, count]: any) => { clickCounts[name] = (clickCounts[name] || 0) + count; });
  const topTools = Object.entries(clickCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 6);
  const totalClicks = Object.values(clickCounts).reduce((a: any, b: any) => a + b, 0);
  const maxC = topTools.length > 0 ? (topTools[0][1] as number) : 1;

  const Stat = ({ label, value, color }: any) => (
    <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: "22px 20px" }}>
      <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: color || "#fff" }}>{loading ? "..." : value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#6d28d9", marginBottom: 8 }}>// LIVE DATABASE DASHBOARD</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#fff" }}>Analytics</h1>
          <p style={{ color: "#444", fontSize: 11, marginTop: 4 }}>Updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button onClick={loadData} style={{ ...btn, background: loading ? "#2a2a4a" : "#6d28d9" }}>{loading ? "LOADING..." : "REFRESH"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1, background: "#16162a", marginBottom: 1 }}>
        <Stat label="AFFILIATE CLICKS" value={totalClicks} color="#a78bfa" />
        <Stat label="EMAIL SUBSCRIBERS" value={subs} color="#29b6f6" />
        <Stat label="TOOL SUBMISSIONS" value={submissions} color="#ff9800" />
        <Stat label="EST. REVENUE" value={`$${(totalClicks * 12).toLocaleString()}`} color="#4caf50" />
      </div>

      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 22, marginTop: 1 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 16 }}>TOP TOOLS BY CLICKS</div>
        {topTools.length === 0 ? (
          <div style={{ color: "#444", fontSize: 12 }}>No clicks yet. Share your site to get traffic!</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topTools.map(([name, count]: any, i: number) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: i === 0 ? "#fff" : "#666" }}>{name}</span>
                  <span style={{ fontSize: 12, color: "#444" }}>{count} clicks</span>
                </div>
                <div style={{ height: 3, background: "#16162a" }}>
                  <div style={{ height: "100%", width: `${(count / maxC) * 100}%`, background: i === 0 ? "#6d28d9" : "#2a2a4a" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("directory");
  const [liveClicks, setLiveClicks] = useState({});

  const handleVisit = async (name: string) => {
    setLiveClicks((prev: any) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    await db.insert("affiliate_clicks", { tool_name: name });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Courier New', monospace", color: "#c8c8d8" }}>
      <nav style={{ borderBottom: "1px solid #16162a", padding: "0 24px", background: "rgba(8,8,16,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 22, height: 22, background: "#6d28d9", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>D</div>
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", color: "#fff" }}>DEVSTACK</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {[["directory", "DIRECTORY"], ["analytics", "ANALYTICS"]].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#16162a" : "transparent", color: view === v ? "#a78bfa" : "#555", border: "none", padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit", fontWeight: view === v ? 700 : 400 }}>
                {label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 9, color: "#333" }}>{TOOLS.length} tools</span>
        </div>
      </nav>
      {view === "directory" ? <DirectoryView onVisit={handleVisit} /> : <AnalyticsView liveClicks={liveClicks} />}
    </div>
  );
}