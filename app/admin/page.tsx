"use client";
import { useState, useEffect } from "react";

const SUPABASE_URL = "https://bsetsywfkvbzckcndseh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZXRzeXdma3ZiemNrY25kc2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzI0MTQsImV4cCI6MjA5NTYwODQxNH0.Et5hbS7b_xQ5_i2SVpnEvmdUGIg8KhTLNCJLDqFDwtg";

const db = {
  async select(table: string, params: string = "") {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
      });
      return res.ok ? res.json() : [];
    } catch { return []; }
  }
};

const btn = { background: "#6d28d9", color: "#fff", border: "none", padding: "11px 20px", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Courier New', monospace", fontWeight: 700 };
const inp = { background: "#0d0d1a", border: "1px solid #16162a", color: "#c8c8d8", padding: "11px 14px", fontSize: 13, fontFamily: "'Courier New', monospace", outline: "none", width: "100%", boxSizing: "border-box" as const };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [clicks, setClicks] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  const checkPassword = () => {
    if (pwInput === "R@hul27patil") { setAuthed(true); setPwError(false); }
    else { setPwError(true); setPwInput(""); }
  };

  const loadData = async () => {
    setLoading(true);
    const [clickData, subData, submsData]: any = await Promise.all([
      db.select("affiliate_clicks", "select=tool_name,clicked_at&order=clicked_at.desc"),
      db.select("newsletter_subscribers", "select=email,subscribed_at&order=subscribed_at.desc"),
      db.select("tool_submissions", "select=name,url,category,description,status,submitted_at&order=submitted_at.desc"),
    ]);
    setClicks(Array.isArray(clickData) ? clickData : []);
    setSubs(Array.isArray(subData) ? subData : []);
    setSubmissions(Array.isArray(submsData) ? submsData : []);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { if (authed) loadData(); }, [authed]);

  const clickCounts: any = {};
  clicks.forEach((c: any) => { clickCounts[c.tool_name] = (clickCounts[c.tool_name] || 0) + 1; });
  const topTools = Object.entries(clickCounts).sort((a: any, b: any) => b[1] - a[1]);
  const maxC = topTools.length > 0 ? (topTools[0][1] as number) : 1;

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Courier New', monospace", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 48, width: 340, textAlign: "center" as const }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>&#128274;</div>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#6d28d9", marginBottom: 8 }}>// PRIVATE ADMIN</div>
        <h2 style={{ margin: "0 0 24px", fontSize: 18, color: "#fff", fontWeight: 800 }}>DevStack Dashboard</h2>
        <input type="password" placeholder="Enter password..." value={pwInput}
          onChange={(e: any) => setPwInput(e.target.value)}
          onKeyDown={(e: any) => e.key === "Enter" && checkPassword()}
          style={{ ...inp, marginBottom: 12, textAlign: "center" as const }} />
        {pwError && <div style={{ fontSize: 11, color: "#ef5350", marginBottom: 12 }}>Wrong password. Try again.</div>}
        <button onClick={checkPassword} style={{ ...btn, width: "100%" }}>UNLOCK DASHBOARD</button>
        <div style={{ fontSize: 10, color: "#333", marginTop: 16 }}>This page is private and password protected.</div>
      </div>
    </div>
  );

  const Stat = ({ label, value, sub, color }: any) => (
    <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: "24px 20px" }}>
      <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 900, color: color || "#fff" }}>{loading ? "..." : value}</div>
      {sub && <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Courier New', monospace", color: "#c8c8d8" }}>
      <nav style={{ borderBottom: "1px solid #16162a", padding: "0 32px", background: "rgba(8,8,16,0.97)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, background: "#6d28d9", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>D</div>
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", color: "#fff" }}>DEVSTACK</span>
            <span style={{ fontSize: 9, color: "#6d28d9", border: "1px solid #6d28d9", padding: "2px 6px", letterSpacing: "0.1em" }}>ADMIN</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[["overview", "OVERVIEW"], ["subscribers", "SUBSCRIBERS"], ["clicks", "CLICKS"], ["submissions", "SUBMISSIONS"]].map(([v, label]) => (
              <button key={v} onClick={() => setActiveTab(v)} style={{ background: activeTab === v ? "#16162a" : "transparent", color: activeTab === v ? "#a78bfa" : "#555", border: "none", padding: "6px 12px", fontSize: 9, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === v ? 700 : 400 }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 10, color: "#333" }}>{lastRefresh.toLocaleTimeString()}</span>
            <button onClick={loadData} style={{ ...btn, padding: "7px 14px", fontSize: 10, background: loading ? "#2a2a4a" : "#6d28d9" }}>{loading ? "..." : "REFRESH"}</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#6d28d9", marginBottom: 10 }}>// OVERVIEW</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#fff" }}>Your Dashboard</h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1, background: "#16162a", marginBottom: 1 }}>
              <Stat label="TOTAL CLICKS" value={clicks.length} sub="All time" color="#a78bfa" />
              <Stat label="SUBSCRIBERS" value={subs.length} sub="Emails collected" color="#29b6f6" />
              <Stat label="SUBMISSIONS" value={submissions.length} sub="Tools submitted" color="#ff9800" />
              <Stat label="EST. REVENUE" value={`$${(clicks.length * 12).toLocaleString()}`} sub="At avg $12/click" color="#4caf50" />
            </div>

            <div style={{ background: "#0d0d1a", border: "1px solid #16162a", padding: 24, marginTop: 1 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "#444", marginBottom: 16 }}>TOP TOOLS BY CLICKS</div>
              {topTools.length === 0 ? (
                <div style={{ color: "#444", fontSize: 12 }}>No clicks yet. Share your site!</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {topTools.slice(0, 8).map(([name, count]: any, i: number) => (
                    <div key={name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: i === 0 ? "#fff" : "#666" }}>{name}</span>
                        <span style={{ fontSize: 12, color: "#444" }}>{count} clicks · est. ${count * 12}</span>
                      </div>
                      <div style={{ height: 3, background: "#16162a" }}>
                        <div style={{ height: "100%", width: `${(count / maxC) * 100}%`, background: i === 0 ? "#6d28d9" : "#2a2a4a" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#6d28d9", marginBottom: 10 }}>// EMAIL LIST</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#fff" }}>{subs.length} Subscribers</h1>
            </div>
            <div style={{ background: "#0d0d1a", border: "1px solid #16162a" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #16162a" }}>
                    <th style={{ textAlign: "left" as const, padding: "12px 20px", fontSize: 8, letterSpacing: "0.14em", color: "#444" }}>EMAIL</th>
                    <th style={{ textAlign: "left" as const, padding: "12px 20px", fontSize: 8, letterSpacing: "0.14em", color: "#444" }}>SUBSCRIBED</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={2} style={{ padding: "20px", color: "#333", textAlign: "center" as const }}>Loading...</td></tr>
                  ) : subs.length === 0 ? (
                    <tr><td colSpan={2} style={{ padding: "20px", color: "#333", textAlign: "center" as const }}>No subscribers yet.</td></tr>
                  ) : subs.map((s: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0d0d1a" }}>
                      <td style={{ padding: "12px 20px", color: "#a0a0c0" }}>{s.email}</td>
                      <td style={{ padding: "12px 20px", color: "#444" }}>{new Date(s.subscribed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CLICKS */}
        {activeTab === "clicks" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#6d28d9", marginBottom: 10 }}>// AFFILIATE CLICKS</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#fff" }}>{clicks.length} Total Clicks</h1>
            </div>
            <div style={{ background: "#0d0d1a", border: "1px solid #16162a" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #16162a" }}>
                    <th style={{ textAlign: "left" as const, padding: "12px 20px", fontSize: 8, letterSpacing: "0.14em", color: "#444" }}>TOOL</th>
                    <th style={{ textAlign: "left" as const, padding: "12px 20px", fontSize: 8, letterSpacing: "0.14em", color: "#444" }}>CLICKED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={2} style={{ padding: "20px", color: "#333", textAlign: "center" as const }}>Loading...</td></tr>
                  ) : clicks.length === 0 ? (
                    <tr><td colSpan={2} style={{ padding: "20px", color: "#333", textAlign: "center" as const }}>No clicks yet.</td></tr>
                  ) : clicks.slice(0, 50).map((c: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0d0d1a" }}>
                      <td style={{ padding: "12px 20px", color: "#a78bfa", fontWeight: 600 }}>{c.tool_name}</td>
                      <td style={{ padding: "12px 20px", color: "#444" }}>{new Date(c.clicked_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SUBMISSIONS */}
        {activeTab === "submissions" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#6d28d9", marginBottom: 10 }}>// TOOL SUBMISSIONS</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#fff" }}>{submissions.length} Submissions</h1>
            </div>
            <div style={{ background: "#0d0d1a", border: "1px solid #16162a" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #16162a" }}>
                    {["NAME", "URL", "CATEGORY", "STATUS", "DATE"].map(h => (
                      <th key={h} style={{ textAlign: "left" as const, padding: "12px 20px", fontSize: 8, letterSpacing: "0.14em", color: "#444" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: "20px", color: "#333", textAlign: "center" as const }}>Loading...</td></tr>
                  ) : submissions.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: "20px", color: "#333", textAlign: "center" as const }}>No submissions yet.</td></tr>
                  ) : submissions.map((s: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0d0d1a" }}>
                      <td style={{ padding: "12px 20px", color: "#fff", fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: "12px 20px", color: "#6d28d9" }}><a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6d28d9" }}>{s.url}</a></td>
                      <td style={{ padding: "12px 20px", color: "#666" }}>{s.category}</td>
                      <td style={{ padding: "12px 20px" }}><span style={{ fontSize: 8, color: "#ff9800", border: "1px solid #2b1a00", padding: "2px 6px" }}>{s.status?.toUpperCase()}</span></td>
                      <td style={{ padding: "12px 20px", color: "#444" }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}