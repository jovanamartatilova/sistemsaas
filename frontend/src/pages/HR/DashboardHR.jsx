import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import SidebarHR from "../../components/SidebarHR"; // ← import sidebar
import { LoadingSpinner } from "../../components/LoadingSpinner";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  CheckAction: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  XAction: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  FileText: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Good night";
}

function todayStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  screening: { bg: "#fefce8", color: "#92400e", border: "#fde68a" },
  interview: { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  accepted:  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  rejected:  { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
};

const PIPELINE_COLORS = {
  pending:   "#3b82f6",
  screening: "#f59e0b",
  interview: "#a855f7",
  accepted:  "#22c55e",
  rejected:  "#ef4444",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
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
      <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", letterSpacing: "-1px", marginTop: "10px", textAlign: "left" }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", textAlign: "left" }}>{title}</div>
      {barColors && (
        <div style={{ display: "flex", gap: "3px", marginTop: "10px", alignItems: "flex-end", height: "26px" }}>
          {barColors.map((c, i) => (
            <div key={i} style={{
              flex: 1, background: c, borderRadius: "3px 3px 0 0",
              height: `${28 + Math.sin(i * 1.4) * 18}%`, opacity: 0.45, minHeight: "4px",
            }} />
          ))}
        </div>
      )}
      {sub && <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px", textAlign: "left" }}>{sub}</div>}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  screening: { label: "Move to Screening?", btnBg: "#f59e0b", desc: (name) => `Move ${name} to the screening stage?` },
  interview: { label: "Schedule Interview?", btnBg: "#a855f7", desc: (name) => `Move ${name} to the interview stage?` },
  accept:    { label: "Accept Candidate?",   btnBg: "#16a34a", desc: (name) => `Accept ${name} as an intern?` },
  reject:    { label: "Reject Candidate?",   btnBg: "#ef4444", desc: (name) => `Reject ${name}'s application? This action cannot be undone.` },
};

function ConfirmModal({ action, onConfirm, onCancel }) {
  if (!action) return null;
  const cfg = ACTION_CONFIG[action.type];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px", width: "360px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif",
      }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>
          {cfg.desc(action.candidate?.name)}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer",
            fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: cfg.btnBg, fontSize: "13px", fontWeight: "700",
            color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Logout Modal ──────────────────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function DashboardHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [showLogout, setShowLogout]       = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [tableLoading, setTableLoading]   = useState(false);

  const [data, setData] = useState({
    user: {},
    stats: { total_candidates: 0, accepted: 0, interview_scheduled: 0, pending_review: 0 },
    recent_candidates: [],
    pipeline: [],
  });

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchDashboard = (isSearch = false) => {
    if (isSearch) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    api(`/hr/dashboard?${params}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => {
        setLoading(false);
        setTableLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const executeAction = async () => {
    const { type, candidate } = confirmAction;
    const map = {
      screening: `/hr/candidates/${candidate.id_submission}/screening`,
      interview: `/hr/candidates/${candidate.id_submission}/interview`,
      accept:    `/hr/candidates/${candidate.id_submission}/accept`,
      reject:    `/hr/candidates/${candidate.id_submission}/reject`,
    };
    await api(map[type], { method: "PATCH" });
    fetchDashboard();
    setConfirmAction(null);
  };

  // ── Stat cards config ─────────────────────────────────────────────────────────
  const statCards = [
    {
      icon: <IC.Users />, iconBg: "#eff6ff", iconColor: "#3b82f6",
      title: "Total Candidates",
      value: data.stats.total_candidates,
      sub: "All registered applicants",
      barColors: ["#3b82f6","#60a5fa","#93c5fd","#3b82f6","#60a5fa","#93c5fd","#3b82f6"],
    },
    {
      icon: <IC.CheckCircle />, iconBg: "#f0fdf4", iconColor: "#16a34a",
      title: "Accepted",
      value: data.stats.accepted,
      sub: "Interns confirmed",
      barColors: ["#4ade80","#86efac","#4ade80","#86efac","#4ade80","#bbf7d0","#4ade80"],
    },
    {
      icon: <IC.Calendar />, iconBg: "#f5f3ff", iconColor: "#7c3aed",
      title: "Interview Scheduled",
      value: data.stats.interview_scheduled,
      sub: "Awaiting interviews",
      barColors: ["#c084fc","#a855f7","#c084fc","#a855f7","#c084fc","#ddd6fe","#a855f7"],
    },
    {
      icon: <IC.Clock />, iconBg: "#fff7ed", iconColor: "#ea580c",
      title: "Pending Review",
      value: data.stats.pending_review,
      sub: "Needs attention",
      barColors: ["#fb923c","#fdba74","#fb923c","#fdba74","#fb923c","#fed7aa","#fb923c"],
    },
  ];
  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

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
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .hr-fadein { animation: fadeIn 0.3s ease both; }
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
          <div style={{ flex: 1, display: "flex", alignItems: "start", gap: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Dashboard</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Overview</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{todayStr()}</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }} className="hr-fadein">

          {/* Page heading */}
          <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "4px", textAlign: "left"}}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
              {getGreeting()}, {data.user?.name?.split(" ")[0] || "HR"}!
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Here's a summary of today's recruitment activity.
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px", marginBottom: "24px",
          }}>
            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
          </div>

          {/* Bottom grid: table + pipeline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", borderTop: "1px solid #f1f5f9",}}>

            {/* Recent Candidates Table */}
            <div style={{
              background: "#fff", borderRadius: "16px", overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
              }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>Recent Candidates</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Latest applicants requiring action</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                  padding: "7px 14px", width: "220px",
                }}>
                  <IC.Search />
                  <input
                    placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit" }}
                  />
                </div>
                <button
                  onClick={() => navigate("/hr/kandidate")}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    fontSize: "13px", color: "#4a9eff", background: "none", border: "none",
                    cursor: "pointer", fontWeight: "600", fontFamily: "inherit",
                  }}
                >
                  View All <IC.ArrowRight />
                </button>
              </div>
              </div>

              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1.4fr",
                gap: "12px", padding: "10px 24px",
                background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
              }}>
                {["CANDIDATE", "POSITION", "STATUS", "ACTION"].map((h) => (
                  <span key={h} style={{ fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em"}}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {tableLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  <div style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  <div style={{ marginTop: "10px" }}>Searching...</div>
                </div>
              ) : data.recent_candidates.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  No candidates yet.
                </div>
              ) : (
                data.recent_candidates.map((c, i) => (
                  <div
                    key={i}
                    className="row-hover"
                    style={{
                      display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1.4fr",
                      gap: "12px", padding: "14px 24px", alignItems: "center",
                      borderBottom: i < data.recent_candidates.length - 1 ? "1px solid #f8fafc" : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Name + email */}
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

                    {/* Status badge */}
                    <div>
                      <span style={{
                        display: "inline-flex", padding: "3px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "600",
                        background: STATUS[c.status]?.bg || "#f1f5f9",
                        color: STATUS[c.status]?.color || "#475569",
                        border: `1px solid ${STATUS[c.status]?.border || "#e2e8f0"}`,
                        textTransform: "capitalize",
                      }}>
                        {c.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {c.status === "pending" && (
                        <>
                          <ActionBtn label="Screening" variant="green" onClick={() => setConfirmAction({ type: "screening", candidate: c })} />
                          <ActionBtn label="Reject" variant="red" onClick={() => setConfirmAction({ type: "reject", candidate: c })} />
                        </>
                      )}
                      {c.status === "screening" && (
                        <>
                          <ActionBtn label="Interview" variant="purple" onClick={() => setConfirmAction({ type: "interview", candidate: c })} />
                          <ActionBtn label="Reject" variant="red" onClick={() => setConfirmAction({ type: "reject", candidate: c })} />
                        </>
                      )}
                      {c.status === "interview" && (
                        <>
                          <ActionBtn label="Accept" variant="green" onClick={() => setConfirmAction({ type: "accept", candidate: c })} />
                          <ActionBtn label="Reject" variant="red" onClick={() => setConfirmAction({ type: "reject", candidate: c })} />
                        </>
                      )}
                      {c.status === "accepted" && (
                        <ActionBtn label="Create LoA" variant="blue" onClick={() => navigate("/hr/generate-loa")} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pipeline Panel */}
            <div style={{
              background: "#fff", borderRadius: "16px", padding: "22px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "0 0 2px" }}>
                Selection Pipeline
              </p>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>
                From {data.stats.total_candidates} total candidates
              </p>

              {data.pipeline.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  No pipeline data.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {data.pipeline.map((p, i) => (
                    <div key={i}>
                      {/* Label row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: PIPELINE_COLORS[p.status] || "#94a3b8", flexShrink: 0,
                          }} />
                          <span style={{ fontSize: "13px", color: "#475569", textTransform: "capitalize" }}>{p.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{p.count}</span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", minWidth: "32px", textAlign: "right" }}>{p.pct}</span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "99px", marginBottom: "14px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: "99px",
                          background: PIPELINE_COLORS[p.status] || "#94a3b8",
                          width: p.pct || "0%", transition: "width 0.5s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// ── Action Button helper ──────────────────────────────────────────────────────
const VARIANT = {
  green:  { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  red:    { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  purple: { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  blue:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
};

function ActionBtn({ label, variant = "blue", onClick }) {
  const v = VARIANT[variant];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "4px 10px", borderRadius: "7px", fontSize: "11.5px", fontWeight: "600",
        cursor: "pointer", border: `1px solid ${v.border}`,
        background: hov ? v.border : v.bg,
        color: v.color, whiteSpace: "nowrap",
        fontFamily: "'Poppins','Segoe UI',sans-serif",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}