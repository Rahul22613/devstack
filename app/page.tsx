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
    } catch (e) { return { ok: false, message: e.message }; }
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
  { id: 7, name: "PlanetScale", category: "Database", tags: ["MySQL", "serverless", "scalable"], description: "Serverless MySQL platform built on Vitess — scales like a planet.", pricing: "Free+", affiliate: "https://planetscale.com", badge: null },
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
  { id: 18, name: "Postman", category: "API Testing", tags: ["API", "testing", "collaboration"], description: "The world's leading API platform for building and using APIs.", pricing: "Free+", affiliate: "https://postman.com", badge: null },
];

const CATEGORIES = ["All", ...Array.from(new Set(TOOLS.map(t => t.category)))];
const BADGE_STYLE = {
  "Popular":     { bg: "#0d2b0d", color: "#4caf50" },
  "High Payout": { bg: "#2b1a00", color: "#ff9800" },
  "New":         { bg: "#001a2b", color: "#29b6f6" },
  "Essential":   { bg: "#2b0000", color: "#ef5350" },
};

const S = {
  page:  { minHeight: "100vh", background: "#080810", fontFamily: "'Courier New', monospace", color: "#c8c8d8" },
  input: { background: "#0d0d1a", border: "1px solid #16162a", color: "#c8c8d8", padding: "11px 14px", fontSize: 13, fontFamily: "'Courier New', monospace", outline: "none", width: "100%", boxSizing: "border-box" },
  btn:   { background: "#6d28d9", color: "#fff", border: "none", padding: "11px 20px", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: 700 },
  sec:   { fontSize: 9, letterSpacing: "0.2em", color: "#6d28d9", marginBottom: 8 },
};

// ── Tool Card ──────────────────────────────────────────────────────────────────
function ToolCard({ tool, onVisit }) {
  const [hov, setHov] = useState(false);
  const bs = tool.badge ? BADGE_STYLE[tool.badge] : null;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#0d0d1a" : "#080810", padding: "20px", transition: "background 0.15s", display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{tool.name}</span>
            {bs && <span style={{ fontSize: 8, padding: "2px 5px", background: bs.bg, color: bs.color, fontWeight: 700 }}>{tool.badge.toUpperCase()}</span>}
          </div>
          <div style={{ fontSize: 8, color: "#333", letterSpacing: "0.12em", marginTop: 2 }}>{tool.category.toUpperCase()}</div>
        </div>
        <span style={{ fontSize: 9, color: "#444", whiteSpace: "nowrap" }}>{tool.pricing}</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "#666", lineHeight: 1.7 }}>{tool.description}</p>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {tool.tags.map(tag => <span key={tag} style={{ fontSize: 8, color: "#333", border: "1px solid #16162a", padding: "1px 5px" }}>{tag}</span>)}
      </div>
      <a href={tool.affiliate} target="_blank" rel="noopener noreferrer" onClick={() => onVisit(tool.name)}
        style={{ display: "inline-block", background: hov ? "#6d28d9" : "transparent", color: hov ? "#fff" : "#444", border: `1px solid ${hov ? "#6d28d9" : "#16162a"}`, padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em", textDecoration: "none", fontFamily: "inherit", fontWeight: 600, transition: "all 0.15s", alignSelf: "flex-start" }}>
        VISIT SITE →
      </a>
    </div>
  );
}

// ── Directory View ─────────────────────────────────────────────────────────────
function DirectoryView({ onVisit }) {
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filtered = useMemo(() => TOOLS.filter(t => {
    const matchCat = cat === "All" || t.category === cat;
    const q = search.toLowerCase();
    return matchCat && (!q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(g => g.includes(q)));
  }), [search, cat]);

  const askAI = async () => {
    if (!apiKey) { setShowKey(true); return; }
    if (!query.trim()) return;
    setAiLoading(true); setAiResult("");
    try {
      const list = TOOLS.map(t => `${t.name} (${t.category}): ${t.description}`).join("\n");
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
    const result = await db.insert("newsletter_subscribers", { email });
    setSubLoading(false);
    if (result.ok) {
      setSubDone(true);
      showToast("Subscribed! Email saved to database.");
    } else if (result.code === "23505") {
      setSubDone(true);
      showToast("Already subscribed - you are in!");
    } else {
      showToast("DB Error: " + (result.message || "Check Supabase RLS policies"));
    }
  };

  const handleSubmitTool = async () => {
    if (!form.name || !form.url || !form.category || !form.description) { showToast("Fill all fields."); return; }
    setFormLoading(true);
    const result = await db.insert("tool_submissions", form);
    setFormLoading(false);
    if (result.ok) {
      setFormDone(true);
      showToast("Tool saved to database!");
      setTimeout(() => { setShowSubmit(false); setFormDone(false); setForm({ name: "", url: "", category: "", description: "" }); }, 2000);
    } else {
      showToast("DB Error: " + (result.message || "Check Supabase RLS policies"));
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#6d28d9", color: "#fff", padding: "12px 18px", fontSize: 12, zIndex: 999, boxShadow: "0 4px 20px rgba(109,40,217,0.5)" }}>
          {toast}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 32, width: "100%", maxWidth: 440, position: "relative" }}>
            <button onClick={() => setShowSubmit(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "#555", fontSize: 20, cursor: "pointer" }}>×</button>
            {formDone ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 32, color: "#4caf50", marginBottom: 8 }}>✓</div>
                <div style={{ color: "#4caf50", fontSize: 11, letterSpacing: "0.1em" }}>SAVED TO SUPABASE!</div>
              </div>
            ) : (
              <>
                <div style={S.sec}>// SUBMIT A TOOL</div>
                <h2 style={{ margin: "0 0 18px", fontSize: 16, color: "#fff", fontWeight: 800 }}>Add to Directory</h2>
                {["name", "url", "category", "description"].map(field => (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#444", marginBottom: 5 }}>{field.toUpperCase()}</div>
                    {field === "description"
                      ? <textarea value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} rows={3} style={{ ...S.input, resize: "vertical" }} />
                      : <input type="text" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={S.input} />}
                  </div>
                ))}
                <button onClick={handleSubmitTool} disabled={formLoading} style={{ ...S.btn, width: "100%", marginTop: 4, background: formLoading ? "#2a2a4a" : "#6d28d9" }}>
                  {formLoading ? "SAVING..." : "SUBMIT FOR REVIEW"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero + Submit btn */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
        <div>
          <div style={S.sec}>// CURATED DEV TOOLS DIRECTORY</div>
          <h1 style={{ fontSize: "clamp(26px, 4.5vw, 52px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 10px", color: "#fff", letterSpacing: "-0.025em" }}>
            Find the right tool.<br /><span style={{ color: "#6d28d9" }}>Ship faster.</span>
          </h1>
          <p style={{ color: "#555", fontSize: 12, margin: 0, lineHeight: 1.8 }}>{TOOLS.length} handpicked tools — searchable, filterable, AI-powered.</p>
        </div>
        <button onClick={() => setShowSubmit(true)} style={{ ...S.btn, marginTop: 4 }}>+ SUBMIT TOOL</button>
      </div>

      {/* ── EMAIL SIGNUP — visible at top ── */}
      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: "20px 22px", marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px" }}>
          <div style={S.sec}>// WEEKLY NEWSLETTER</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Get new tools every week</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>No spam. Unsubscribe anytime.</div>
        </div>
        <div style={{ flex: "1 1 280px" }}>
          {subDone ? (
            <div style={{ padding: "10px 16px", background: "#0d2b0d", border: "1px solid #2e7d32", color: "#4caf50", fontSize: 11, letterSpacing: "0.08em" }}>✓ SUBSCRIBED! EMAIL SAVED TO DATABASE.</div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                style={{ ...S.input, flex: 1 }} />
              <button onClick={handleSubscribe} disabled={subLoading}
                style={{ ...S.btn, whiteSpace: "nowrap", background: subLoading ? "#2a2a4a" : "#6d28d9" }}>
                {subLoading ? "SAVING..." : "SUBSCRIBE"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Recommender */}
      <div style={{ background: "#0d0d1a", border: "1px solid #6d28d9", padding: "20px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ color: "#a78bfa" }}>✦</span>
          <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#a78bfa", fontWeight: 700 }}>AI TOOL RECOMMENDER — POWERED BY CLAUDE</span>
        </div>
        {showKey && (
          <div style={{ marginBottom: 12, padding: 12, background: "#080810", border: "1px solid #16162a" }}>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#444", marginBottom: 5 }}>ANTHROPIC API KEY</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ ...S.input, flex: 1 }} />
              <button onClick={() => setShowKey(false)} style={{ ...S.btn, padding: "11px 14px" }}>SET</button>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder={'e.g. "Building SaaS with Next.js, need auth + database"'}
            value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()}
            style={{ ...S.input, flex: 1 }} />
          <button onClick={askAI} disabled={aiLoading} style={{ ...S.btn, background: aiLoading ? "#2a2a4a" : "#6d28d9", whiteSpace: "nowrap" }}>
            {aiLoading ? "THINKING..." : "RECOMMEND →"}
          </button>
        </div>
        {!apiKey && !showKey && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#444" }}>
            ⚡ <button onClick={() => setShowKey(true)} style={{ background: "none", border: "none", color: "#6d28d9", cursor: "pointer", fontFamily: "inherit", fontSize: 10, padding: 0, textDecoration: "underline" }}>Add Anthropic API key</button> to enable
          </div>
        )}
        {aiResult && (
          <div style={{ marginTop: 14, padding: 14, background: "#080810", border: "1px solid #16162a", fontSize: 12, lineHeight: 1.9, color: "#a0a0c0", whiteSpace: "pre-wrap" }}>{aiResult}</div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: 15, pointerEvents: "none" }}>⌕</span>
        <input type="text" placeholder="Search tools, tags, categories..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...S.input, paddingLeft: 34 }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 17 }}>×</button>}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? "#6d28d9" : "transparent", color: cat === c ? "#fff" : "#444", border: `1px solid ${cat === c ? "#6d28d9" : "#16162a"}`, padding: "4px 11px", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit", fontWeight: cat === c ? 700 : 400 }}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 14, fontSize: 9, color: "#333", letterSpacing: "0.1em" }}>{filtered.length} TOOLS</div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "#16162a" }}>
        {filtered.map(t => <ToolCard key={t.id} tool={t} onVisit={onVisit} />)}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#222" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>∅</div>
          <div style={{ fontSize: 9, letterSpacing: "0.15em" }}>NO RESULTS</div>
        </div>
      )}
      <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #16162a", fontSize: 9, color: "#222" }}>
        DEVSTACK EARNS AFFILIATE COMMISSIONS ON SOME LINKS. WE ONLY LIST TOOLS WE TRUST.
      </div>
    </div>
  );
}

// ── Analytics View ─────────────────────────────────────────────────────────────
function AnalyticsView({ liveClicks }) {
  const [clicks, setClicks] = useState([]);
  const [subs, setSubs] = useState(0);
  const [submissions, setSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    setLoading(true);
    const [clickData, subData, submsData] = await Promise.all([
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

  useEffect(() => { loadData(); }, []);

  const clickCounts = {};
  clicks.forEach(c => { clickCounts[c.tool_name] = (clickCounts[c.tool_name] || 0) + 1; });
  Object.entries(liveClicks).forEach(([name, count]) => { clickCounts[name] = (clickCounts[name] || 0) + count; });
  const topTools = Object.entries(clickCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalClicks = Object.values(clickCounts).reduce((a, b) => a + b, 0);
  const maxC = topTools.length > 0 ? topTools[0][1] : 1;

  const Stat = ({ label, value, sub, color }) => (
    <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: "22px 20px" }}>
      <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: color || "#fff", letterSpacing: "-0.02em" }}>
        {loading ? <span style={{ color: "#222" }}>...</span> : value}
      </div>
      {sub && <div style={{ fontSize: 9, color: "#333", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <div style={S.sec}>// LIVE DATABASE DASHBOARD</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>Analytics & Earnings</h1>
          <p style={{ color: "#444", fontSize: 11, marginTop: 6 }}>Real data from Supabase · Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button onClick={loadData} disabled={loading}
          style={{ ...S.btn, background: loading ? "#2a2a4a" : "#6d28d9" }}>
          {loading ? "LOADING..." : "↻ REFRESH"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1, background: "#16162a", marginBottom: 1 }}>
        <Stat label="AFFILIATE CLICKS" value={totalClicks} sub="Real from DB" color="#a78bfa" />
        <Stat label="EMAIL SUBSCRIBERS" value={subs} sub="Saved in Supabase" color="#29b6f6" />
        <Stat label="TOOL SUBMISSIONS" value={submissions} sub="Pending review" color="#ff9800" />
        <Stat label="EST. REVENUE" value={`$${(totalClicks * 12).toLocaleString()}`} sub="Avg $12/click" color="#4caf50" />
      </div>

      {/* Top tools */}
      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 22, marginTop: 1, marginBottom: 1 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 16 }}>TOP TOOLS BY CLICKS (LIVE FROM DATABASE)</div>
        {loading ? (
          <div style={{ color: "#333", fontSize: 12 }}>Loading from Supabase...</div>
        ) : topTools.length === 0 ? (
          <div style={{ color: "#444", fontSize: 12 }}>
            No clicks recorded yet. Go to the Directory tab and click "VISIT SITE" on any tool to test.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topTools.map(([name, count], i) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: i === 0 ? "#fff" : "#666" }}>{name}</span>
                  <span style={{ fontSize: 12, color: "#444" }}>{count} click{count !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ height: 3, background: "#16162a" }}>
                  <div style={{ height: "100%", width: `${(count / maxC) * 100}%`, background: i === 0 ? "#6d28d9" : "#2a2a4a" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DB Tables status */}
      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 22 }}>
        <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 14 }}>SUPABASE TABLES STATUS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {[
            { label: "Click Tracking", table: "affiliate_clicks", count: totalClicks },
            { label: "Email Subscribers", table: "newsletter_subscribers", count: subs },
            { label: "Tool Submissions", table: "tool_submissions", count: submissions },
          ].map(item => (
            <div key={item.table} style={{ padding: "12px 14px", background: "#080810", border: "1px solid #16162a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#888" }}>{item.label}</span>
                <span style={{ fontSize: 7, color: "#4caf50", border: "1px solid #0d2b0d", padding: "1px 5px" }}>LIVE</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{loading ? "..." : item.count}</div>
              <div style={{ fontSize: 8, color: "#333", marginTop: 2 }}>{item.table}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("directory");
  const [liveClicks, setLiveClicks] = useState({});

  const handleVisit = async (name) => {
    setLiveClicks(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    await db.insert("affiliate_clicks", { tool_name: name });
  };

  return (
    <div style={S.page}>
      <nav style={{ borderBottom: "1px solid #16162a", padding: "0 24px", background: "rgba(8,8,16,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 22, height: 22, background: "#6d28d9", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>D</div>
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", color: "#fff" }}>DEVSTACK</span>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {[["directory", "⊞ DIRECTORY"], ["analytics", "◈ ANALYTICS"]].map(([v, label]) => (
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