import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import SidebarHR from "../../components/SidebarHR";
import { LoadingSpinner } from "../../components/LoadingSpinner";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IC = {
  FileCheck: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  ),
  FilePlus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Layers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, barColors }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "16px", padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column", gap: "4px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: iconBg, display: "flex", alignItems: "center",
          justifyContent: "center", color: iconColor,
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: "28px", fontWeight: "800", color: "#1e293b",
        letterSpacing: "-1px", marginTop: "10px", textAlign: "left",
      }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", textAlign: "left" }}>{title}</div>
      {barColors && (
        <div style={{ display: "flex", gap: "3px", marginTop: "10px", alignItems: "flex-end", height: "26px" }}>
          {barColors.map((c, i) => (
            <div key={i} style={{
              flex: 1, background: c, borderRadius: "3px 3px 0 0",
              height: `${28 + Math.sin(i * 1.4) * 18}%`,
              opacity: 0.45, minHeight: "4px",
            }} />
          ))}
        </div>
      )}
      {sub && (
        <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px", textAlign: "left" }}>{sub}</div>
      )}
    </div>
  );
}

// ── Action Button ──────────────────────────────────────────────────────────────
const VARIANT = {
  green:  { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  red:    { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  blue:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  amber:  { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  ghost:  { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

function ActionBtn({ label, icon, variant = "blue", onClick, disabled, title }) {
  const v = VARIANT[variant];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "4px 10px", borderRadius: "7px", fontSize: "11.5px", fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${v.border}`,
        background: disabled ? "#f1f5f9" : hov ? v.border : v.bg,
        color: disabled ? "#94a3b8" : v.color,
        whiteSpace: "nowrap",
        fontFamily: "'Poppins','Segoe UI',sans-serif",
        transition: "background 0.15s",
        display: "flex", alignItems: "center", gap: "4px",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon && icon}
      {label}
    </button>
  );
}

// ── Logout Modal ───────────────────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)",
      zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px", width: "360px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif",
      }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>
          Are you sure you want to sign out from your HR account?
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b",
            cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: "#ef4444", fontSize: "13px", fontWeight: "700",
            color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>Yes, Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge config ────────────────────────────────────────────────────────
const LOA_STATUS = {
  generated: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Generated" },
  pending:   { bg: "#fffbeb", color: "#92400e", border: "#fde68a", label: "Pending" },
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function GenerateLoAHR() {
  const navigate = useNavigate();
  const user     = useAuthStore((state) => state.user);

  const [showLogout, setShowLogout]               = useState(false);
  const [data, setData]                           = useState({ user: {}, stats: {}, candidates: [] });
  const [pageLoading, setPageLoading]             = useState(true);
  const [loading, setLoading]                     = useState(null);
  const [bulkLoading, setBulkLoading]             = useState(false);
  const [error, setError]                         = useState("");
  const [sending, setSending]                     = useState({});
  const [regenerateSuccess, setRegenerateSuccess] = useState({});
  const [search, setSearch] = useState("");           
  const [tableLoading, setTableLoading] = useState(false); 

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchLoa = async (isSearch = false) => {
  if (isSearch) {
    setTableLoading(true);   // Loading hanya untuk tabel
  } else {
    setPageLoading(true);    // Loading untuk seluruh halaman
  }
  
  try {
    setError("");
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    
    const res = await api(`/hr/loa?${params}`);
    setData(res.data);
  } catch (err) {
    setError(err.message || "Failed to load data.");
  } finally {
    setPageLoading(false);
    setTableLoading(false);
  }
};

  // Initial load (saat pertama kali buka halaman)
  useEffect(() => { 
    fetchLoa(); 
  }, []);

  // Search debounce (hanya loading tabel)
  useEffect(() => {
    if (!pageLoading) { 
      const timer = setTimeout(() => {
        fetchLoa(true);  // ← true = search mode
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [search]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/", { replace: true });
  };

  const handleGenerate = async (id) => {
    try {
      setLoading(id);
      setError("");
      await api(`/hr/loa/${id}/generate`, { method: "POST" });
      await fetchLoa();
      setRegenerateSuccess((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setRegenerateSuccess((prev) => ({ ...prev, [id]: false })), 3000);
    } catch (err) {
      setError(err.message || "Failed to generate LoA.");
    } finally {
      setLoading(null);
    }
  };

  const handleSendLoa = async (id) => {
    try {
      setSending((prev) => ({ ...prev, [id]: true }));
      await api(`/hr/loa/${id}/send`, { method: "POST" });
      await fetchLoa();
    } catch (err) {
      setError(err.message || "Failed to send LoA.");
    } finally {
      setSending((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleBulkGenerate = async () => {
    try {
      setBulkLoading(true);
      setError("");
      await api("/hr/loa/bulk-generate", { method: "POST" });
      await fetchLoa();
    } catch (err) {
      setError(err.message || "Failed to bulk generate LoA.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handlePreview = (url) => { if (url) window.open(url, "_blank"); };

  const handleDownload = async (url, id) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed.");
      const blob    = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = blobUrl;
      a.download    = `LoA_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  // ── Stat cards ───────────────────────────────────────────────────────────────
  const statCards = [
    {
      icon: <IC.Layers />, iconBg: "#eff6ff", iconColor: "#3b82f6",
      title: "Accepted Candidates",
      value: data.stats.accepted,
      sub: "Eligible for LoA generation",
      barColors: ["#3b82f6","#60a5fa","#93c5fd","#3b82f6","#60a5fa","#93c5fd","#3b82f6"],
    },
    {
      icon: <IC.FileCheck />, iconBg: "#f0fdf4", iconColor: "#16a34a",
      title: "LoA Generated",
      value: data.stats.generated,
      sub: "Already created",
      barColors: ["#4ade80","#86efac","#4ade80","#86efac","#4ade80","#bbf7d0","#4ade80"],
    },
    {
      icon: <IC.Clock />, iconBg: "#fff7ed", iconColor: "#ea580c",
      title: "Pending Generation",
      value: data.stats.pending,
      sub: "Needs to be created",
      barColors: ["#fb923c","#fdba74","#fb923c","#fdba74","#fb923c","#fed7aa","#fb923c"],
    },
  ];

  if (pageLoading) return (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
    <SidebarHR user={user} onLogout={() => setShowLogout(true)} />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner fullScreen={false} message="Loading generate LoA..." />
    </div>
  </div>
);

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: "#f8fafc",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .loa-fadein { animation: fadeIn 0.3s ease both; }
        .row-hover:hover { background: #f8fafc; }
      `}</style>

      {/* Sidebar */}
      <SidebarHR user={user} onLogout={() => setShowLogout(true)} />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: "56px", background: "#fff", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Administration</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Generate LoA</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{todayStr()}</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }} className="loa-fadein">

          {/* Page heading */}
          <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
              Generate Letter of Acceptance
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Create and manage LoA documents for accepted candidates.
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c",
              padding: "12px 16px", borderRadius: "12px", marginBottom: "24px", fontSize: "13px",
            }}>
              <IC.AlertCircle />
              {error}
            </div>
          )}

          {/* Stat Cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px", marginBottom: "24px",
          }}>
            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
          </div>

          {/* Candidates Table Card */}
          <div style={{
            background: "#fff", borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Card header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
              flexWrap: "wrap", gap: "12px",
            }}>
              <div>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>
                  Accepted Candidates
                </p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  Select candidate to generate LoA
                </p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                  padding: "7px 14px", width: "240px",
                }}>
                  <IC.Search />
                  <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: "none", background: "transparent", outline: "none",
                      fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit",
                    }}
                  />
                </div>
                
                <button
                  onClick={handleBulkGenerate}
                  disabled={bulkLoading}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 18px", background: bulkLoading ? "#94a3b8" : "#1e293b",
                    color: "#fff", border: "none", borderRadius: "10px",
                    fontSize: "13px", fontWeight: "700", cursor: bulkLoading ? "not-allowed" : "pointer",
                    fontFamily: "'Poppins','Segoe UI',sans-serif", transition: "background 0.15s",
                  }}
                >
                  <IC.FilePlus />
                  {bulkLoading ? "Generating…" : "Bulk Generate"}
                </button>
              </div>
            </div>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1.8fr 0.7fr 1fr 1.1fr",
              gap: "12px", padding: "10px 24px",
              background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
            }}>
              {["CANDIDATE", "POSITION", "PROGRAM", "TYPE", "LOA STATUS", "ACTION"].map((h) => (
                <span key={h} style={{
                  fontSize: "10.5px", fontWeight: "700", color: "#94a3b8",
                  letterSpacing: "0.06em",
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {tableLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                <div style={{ 
                  display: "inline-block", 
                  width: "20px", 
                  height: "20px", 
                  border: "2px solid #e2e8f0", 
                  borderTopColor: "#3b82f6", 
                  borderRadius: "50%", 
                  animation: "spin 0.6s linear infinite" 
                }} />
                <div style={{ marginTop: "10px" }}>Searching...</div>
              </div>
            ) : !data.candidates || data.candidates.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                <div style={{ marginBottom: "8px", fontSize: "13px" }}>No accepted candidates yet.</div>
                <div style={{ fontSize: "12px" }}>
                  Candidates must have submissions with "accepted" status to generate LoA.
                </div>
              </div>
            ) : (
              data.candidates.map((c, i) => {
                const st = LOA_STATUS[c.loa_status] || LOA_STATUS.pending;
                const isGenerating = loading === c.id_submission;
                return (
                  <div
                    key={c.id_submission}
                    className="row-hover"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.2fr 1.8fr 0.7fr 1fr 1.1fr",
                      gap: "12px", padding: "14px 24px", alignItems: "center",
                      borderBottom: i < data.candidates.length - 1 ? "1px solid #f8fafc" : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Candidate */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                        background: "#eff6ff", color: "#3b82f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: "700",
                      }}>
                        {(c.name || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{c.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{c.email}</div>
                      </div>
                    </div>

                    {/* Position */}
                    <div style={{ fontSize: "13px", color: "#475569" }}>{c.position}</div>

                    {/* Program */}
                    <div style={{ fontSize: "13px", color: "#475569" }}>{c.program}</div>

                    {/* Type */}
                    <div style={{ fontSize: "13px", color: "#475569" }}>{c.type}</div>

                    {/* LoA Status */}
                    <div>
                      <span style={{
                        display: "inline-flex", padding: "3px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "600",
                        background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      }}>
                        {st.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {/* Preview */}
                      {c.has_file && (
                        <ActionBtn
                          icon={<IC.Eye />}
                          variant="ghost"
                          onClick={() => handlePreview(c.file_url)}
                          title="Preview LoA"
                        />
                      )}

                      {/* Send / Sent */}
                      {c.has_file && (
                        c.is_sent ? (
                          <ActionBtn label="Sent" variant="green" disabled />
                        ) : (
                          <ActionBtn
                            label={sending[c.id_submission] ? "Sending…" : "Send"}
                            variant="blue"
                            onClick={() => handleSendLoa(c.id_submission)}
                            disabled={sending[c.id_submission]}
                          />
                        )
                      )}

                      {/* Generate / Regenerate */}
                      {c.has_file ? (
                        <ActionBtn
                          icon={regenerateSuccess[c.id_submission] ? <IC.Check /> : <IC.Refresh />}
                          variant={regenerateSuccess[c.id_submission] ? "green" : "amber"}
                          onClick={() => handleGenerate(c.id_submission)}
                          disabled={isGenerating}
                          title="Regenerate LoA"
                        />
                      ) : (
                        <ActionBtn
                          icon={<IC.FilePlus />}
                          label={isGenerating ? "Generating…" : "Generate"}
                          variant="green"
                          onClick={() => handleGenerate(c.id_submission)}
                          disabled={isGenerating}
                          title="Generate LoA"
                        />
                      )}

                      {/* Download */}
                      {c.has_file && (
                        <ActionBtn
                          icon={<IC.Download />}
                          variant="blue"
                          onClick={() => handleDownload(c.file_url, c.id_submission)}
                          title="Download LoA"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
      )}
    </div>
  );
}