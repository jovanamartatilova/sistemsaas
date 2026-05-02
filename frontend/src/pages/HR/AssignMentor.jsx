import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import SidebarHR from "../../components/SidebarHR";
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
  UserCheck: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Stat Card (same as dashboard) ─────────────────────────────────────────────
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
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>Yes, Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ── Generic Confirm Modal ─────────────────────────────────────────────────────
function ConfirmModal({ title, desc, confirmLabel, confirmBg = "#2563eb", onConfirm, onCancel, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px", width: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif",
      }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>{title}</div>
        {desc && <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "16px" }}>{desc}</div>}
        {children}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button onClick={onCancel} style={{
            padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: confirmBg, fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Action Button (same as dashboard) ─────────────────────────────────────────
const VARIANT = {
  green: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  red: { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  purple: { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  blue: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  gray: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

function ActionBtn({ label, variant = "blue", onClick, icon, disabled }) {
  const v = VARIANT[variant];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "5px 12px", borderRadius: "7px", fontSize: "11.5px", fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer", border: `1px solid ${v.border}`,
        background: hov && !disabled ? v.border : v.bg,
        color: v.color, whiteSpace: "nowrap", opacity: disabled ? 0.5 : 1,
        fontFamily: "'Poppins','Segoe UI',sans-serif",
        transition: "background 0.15s",
        display: "flex", alignItems: "center", gap: "5px",
      }}
    >
      {icon}{label}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AssignMentorHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [showLogout, setShowLogout] = useState(false);
  const [data, setData] = useState({ user: {}, stats: {}, interns: [], mentors: [] });
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({});
  const [saved, setSaved] = useState({});
  const [modal, setModal] = useState(null);       // assign confirm
  const [unassignTarget, setUnassignTarget] = useState(null);
  const [showAutoConfirm, setShowAutoConfirm] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [search, setSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchData = (isSearch = false) => {
    if (isSearch) {
      setTableLoading(true);   // Loading hanya untuk tabel
    } else {
      setLoading(true);        // Loading untuk seluruh halaman
    }

    const params = new URLSearchParams();
    if (search) params.set("search", search);

    api(`/hr/assign-mentor?${params}`)
      .then((res) => {
        setData(res.data);
        const initDraft = {};
        const initSaved = {};
        res.data.interns.forEach((i) => {
          if (i.mentor_id) {
            initDraft[i.id_submission] = i.mentor_id;
            initSaved[i.id_submission] = true;
          }
        });
        setDraft(initDraft);
        setSaved(initSaved);
      })
      .finally(() => {
        setLoading(false);
        setTableLoading(false);
      });
  };

  // Initial load (saat pertama kali buka halaman)
  useEffect(() => {
    fetchData();
  }, []);

  // Search debounce (hanya loading tabel)
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        fetchData(true);  // ← true = search mode
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [search]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getMentor = (id) => data.mentors.find((m) => m.id_mentor === id);
  const mentorLoad = (mentorId) => data.interns.filter((i) => (draft[i.id_submission] || i.mentor_id) === mentorId).length;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleMentorChange = (id_submission, mentorId) => {
    setDraft((prev) => ({ ...prev, [id_submission]: mentorId || null }));
    setSaved((prev) => ({ ...prev, [id_submission]: false }));
  };

  const confirmAssign = async () => {
    const intern = modal;
    try {
      await api("/hr/assign-mentor", {
        method: "POST",
        body: JSON.stringify({ id_submission: intern.id_submission, id_mentor: draft[intern.id_submission] }),
      });
      setSaved((prev) => ({ ...prev, [intern.id_submission]: true }));
      setModal(null);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleUnassign = async (id_submission) => {
    await api(`/hr/assign-mentor/${id_submission}`, { method: "DELETE" });
    setDraft((prev) => ({ ...prev, [id_submission]: null }));
    setSaved((prev) => ({ ...prev, [id_submission]: false }));
    fetchData();
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/", { replace: true });
  };

  const handleAutoAssign = async () => {
    setAutoLoading(true);
    try { await api("/hr/assign-mentor/auto", { method: "POST" }); fetchData(); }
    finally { setAutoLoading(false); }
  };

  const total = data.stats.total ?? 0;
  const assigned = data.stats.assigned ?? 0;
  const unassigned = data.stats.unassigned ?? 0;
  const activeMentors = data.stats.active_mentors ?? 0;

  const statCards = [
    {
      icon: <IC.Users />, iconBg: "#eff6ff", iconColor: "#3b82f6",
      title: "Total Accepted", value: total,
      sub: "Ready to be assigned",
      barColors: ["#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6"],
    },
    {
      icon: <IC.CheckCircle />, iconBg: "#f0fdf4", iconColor: "#16a34a",
      title: "Assigned", value: assigned,
      sub: "Mentor confirmed",
      barColors: ["#4ade80", "#86efac", "#4ade80", "#86efac", "#4ade80", "#bbf7d0", "#4ade80"],
    },
    {
      icon: <IC.Clock />, iconBg: "#fff7ed", iconColor: "#ea580c",
      title: "Unassigned", value: unassigned,
      sub: "Needs assignment",
      barColors: ["#fb923c", "#fdba74", "#fb923c", "#fdba74", "#fb923c", "#fed7aa", "#fb923c"],
    },
    {
      icon: <IC.UserCheck />, iconBg: "#f5f3ff", iconColor: "#7c3aed",
      title: "Active Mentors", value: activeMentors,
      sub: "Available to assign",
      barColors: ["#c084fc", "#a855f7", "#c084fc", "#a855f7", "#c084fc", "#ddd6fe", "#a855f7"],
    },
  ];

  if (loading) return (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
    <SidebarHR user={user} onLogout={() => setShowLogout(true)} />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner fullScreen={false} message="Loading assignment..." />
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
        .hr-fadein { animation: fadeIn 0.3s ease both; }
        .row-hover:hover { background: #f8fafc !important; }
        select { appearance: auto; }
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
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Dashboard</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 2px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Administration</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 2px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>Assign Mentor</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{todayStr()}</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }} className="hr-fadein">

          {/* Page heading */}
          <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
              Assign Mentor
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Assign a mentor to each accepted intern. Each intern is assigned individually.
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "24px" }}>
            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
          </div>

          {/* Bottom grid: table + mentor panel */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>

            {/* Interns Table */}
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
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>Accepted Interns</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Select a mentor for each intern, then click Assign</p>
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

                  <ActionBtn
                    label={autoLoading ? "Assigning..." : "Auto-assign Unassigned"}
                    variant="blue"
                    icon={<IC.Zap />}
                    disabled={unassigned === 0 || autoLoading}
                    onClick={() => setShowAutoConfirm(true)}
                  />
                </div>
              </div>

              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 0.8fr 1.8fr 1fr",
                gap: "12px", padding: "10px 24px",
                background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
              }}>
                {["INTERN", "POSITION", "PROGRAM", "TYPE", "ASSIGN MENTOR", "ACTION"].map((h) => (
                  <span key={h} style={{ fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em", textAlign: "center", display: "block" }}>
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
              ) : data.interns.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  No accepted interns yet.
                </div>
              ) : (
                data.interns.map((intern, i) => {
                  const currentDraft = draft[intern.id_submission];
                  const isSaved = saved[intern.id_submission];
                  return (
                    <div
                      key={intern.id_submission}
                      className="row-hover"
                      style={{
                        display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 0.8fr 1.8fr 1fr",
                        gap: "12px", padding: "14px 24px", alignItems: "center",
                        borderBottom: i < data.interns.length - 1 ? "1px solid #f8fafc" : "none",
                        transition: "background 0.15s",
                        background: "#fff",
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
                          {(intern.name || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{intern.name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{intern.email}</div>
                        </div>
                      </div>

                      {/* Position */}
                      <div style={{ fontSize: "13px", color: "#475569" }}>{intern.position}</div>

                      {/* Program */}
                      <div style={{ fontSize: "13px", color: "#475569" }}>{intern.program}</div>

                      {/* Type badge */}
                      <div>
                        <span style={{
                          display: "inline-flex", padding: "3px 10px", borderRadius: "20px",
                          fontSize: "11px", fontWeight: "600",
                          background: intern.type === "team" ? "#eff6ff" : "#f8fafc",
                          color: intern.type === "team" ? "#1d4ed8" : "#475569",
                          border: `1px solid ${intern.type === "team" ? "#bfdbfe" : "#e2e8f0"}`,
                        }}>
                          {intern.type === "team" ? "Team" : "Individual"}
                        </span>
                      </div>

                      {/* Mentor select */}
                      <div>
                        <select
                          value={currentDraft || ""}
                          disabled={isSaved}
                          onChange={(e) => handleMentorChange(intern.id_submission, e.target.value)}
                          style={{
                            width: "100%", padding: "6px 8px", outline: "none",
                            border: `1px solid ${currentDraft ? "#c4b5fd" : "#e2e8f0"}`,
                            borderRadius: "8px", fontSize: "12px", fontFamily: "inherit",
                            color: currentDraft ? "#6d28d9" : "#94a3b8",
                            background: currentDraft ? "#f5f3ff" : "#f8fafc",
                            cursor: isSaved ? "not-allowed" : "pointer",
                            opacity: isSaved ? 0.7 : 1,
                          }}
                        >
                          <option value="">— Select mentor —</option>
                          {data.mentors.map((m) => {
                            const load = mentorLoad(m.id_mentor);
                            const full = load >= m.capacity;
                            return (
                              <option key={m.id_mentor} value={m.id_mentor} disabled={full && currentDraft !== m.id_mentor}>
                                {m.name}{full ? " (Full)" : ` (${load}/${m.capacity})`}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Action */}
                      <div style={{ display: "flex", gap: "6px" }}>
                        {isSaved ? (
                          <ActionBtn
                            label="Assigned"
                            variant="green"
                            icon={<IC.Check />}
                            onClick={() => setUnassignTarget(intern.id_submission)}
                          />
                        ) : (
                          <ActionBtn
                            label="Assign"
                            variant="blue"
                            disabled={!currentDraft}
                            onClick={() => currentDraft && setModal(intern)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mentor Overview Panel */}
            <div style={{
              background: "#fff", borderRadius: "16px", padding: "22px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              alignSelf: "start",
            }}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "0 0 2px", textAlign: "left" }}>
                Mentor Overview
              </p>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>
                Current load & capacity
              </p>

              {data.mentors.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                  No mentors available.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data.mentors.map((mentor) => {
                    const load = mentorLoad(mentor.id_mentor);
                    const pct = Math.round((load / mentor.capacity) * 100);
                    const full = load >= mentor.capacity;
                    const selected = selectedMentor === mentor.id_mentor;
                    return (
                      <div
                        key={mentor.id_mentor}
                        onClick={() => setSelectedMentor(selected ? null : mentor.id_mentor)}
                        style={{
                          background: "#fff", borderRadius: "12px",
                          border: `1.5px solid ${selected ? "#a855f7" : "#e2e8f0"}`,
                          padding: "14px 16px", cursor: "pointer",
                          boxShadow: selected ? "0 0 0 3px rgba(168,85,247,0.08)" : "none",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{mentor.name}</div>
                          <span style={{
                            fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
                            background: full ? "#fff1f2" : "#f0fdf4",
                            color: full ? "#be123c" : "#15803d",
                            border: `1px solid ${full ? "#fecdd3" : "#bbf7d0"}`,
                          }}>
                            {full ? "Full" : `${load}/${mentor.capacity}`}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px" }}>{mentor.email}</div>
                        <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden", marginBottom: "6px" }}>
                          <div style={{
                            height: "100%", borderRadius: "99px",
                            width: `${Math.min(pct, 100)}%`,
                            background: full ? "#ef4444" : "#a855f7",
                            transition: "width 0.4s ease",
                          }} />
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                          {load} intern assigned · {mentor.capacity - load} slot remaining
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}

      {/* Assign Confirm */}
      {modal && (() => {
        const mentor = getMentor(draft[modal.id_submission]);
        if (!mentor) return null;
        const load = mentorLoad(mentor.id_mentor);
        return (
          <ConfirmModal
            title="Confirm Mentor Assignment"
            desc="Please review before confirming."
            confirmLabel="Confirm Assignment"
            confirmBg="#2563eb"
            onConfirm={confirmAssign}
            onCancel={() => setModal(null)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "4px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em", marginBottom: "6px" }}>INTERN</div>
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px",
                  fontSize: "13px", color: "#1e293b", lineHeight: 1.6,
                }}>
                  <strong>{modal.name}</strong><br />
                  <span style={{ color: "#64748b", fontSize: "12px" }}>{modal.position} · {modal.program} · {modal.type}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em", marginBottom: "6px" }}>ASSIGNED MENTOR</div>
                <div style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px",
                  fontSize: "13px", color: "#1e293b", lineHeight: 1.6,
                }}>
                  <strong>{mentor.name}</strong><br />
                  <span style={{ color: "#64748b", fontSize: "12px" }}>{mentor.email}</span><br />
                  <span style={{ color: "#64748b", fontSize: "12px" }}>Current load: {load}/{mentor.capacity} interns</span>
                </div>
              </div>
              <div style={{
                background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px",
                padding: "10px 14px", fontSize: "12px", color: "#1d4ed8", lineHeight: 1.6,
              }}>
                Once assigned, the mentor will be able to access this intern's assessment data.
              </div>
            </div>
          </ConfirmModal>
        );
      })()}

      {/* Unassign Confirm */}
      {unassignTarget && (
        <ConfirmModal
          title="Unassign Mentor?"
          desc="This intern will no longer have an assigned mentor."
          confirmLabel="Yes, Unassign"
          confirmBg="#ef4444"
          onConfirm={() => { handleUnassign(unassignTarget); setUnassignTarget(null); }}
          onCancel={() => setUnassignTarget(null)}
        />
      )}

      {/* Auto-assign Confirm */}
      {showAutoConfirm && (
        <ConfirmModal
          title="Auto-Assign All?"
          desc={`System will assign mentors to all ${unassigned} unassigned interns automatically.`}
          confirmLabel="Yes, Auto-Assign"
          confirmBg="#2563eb"
          onConfirm={() => { handleAutoAssign(); setShowAutoConfirm(false); }}
          onCancel={() => setShowAutoConfirm(false)}
        />
      )}

      {/* Logout */}
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </div>
  );
}