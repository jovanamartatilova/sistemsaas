import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";

// ─── NAV ─────────────────────────────────────────────────────────────────────
const navItems = {
  menu: [{ key: "/hr/dashboard", label: "Dashboard" }],
  selection: [
    { key: "/hr/kandidate", label: "Candidates" },
    { key: "/hr/screening", label: "Screening" },
    { key: "/hr/wawancara", label: "Interview" },
  ],
  administration: [
    { key: "/hr/assign-mentor", label: "Assign Mentor" },
    { key: "/hr/generate-loa", label: "Generate LoA" },
    { key: "/hr/payroll", label: "Payroll" },
  ],
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const sb = {
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "3px", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoImage: { height: "50px", width: "auto", minWidth: "50px", objectFit: "contain", display: "block" },
  logoText: { fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: "1" },
  nav: { flex: 1, padding: "10px 8px", overflowY: "auto" },
  section: { marginBottom: "14px" },
  sectionLabel: { display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#475569", padding: "0 8px", marginBottom: "4px", textTransform: "uppercase", textAlign: "left" },
  item: (active) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", border: "none", background: active ? "rgba(59,130,246,0.18)" : "transparent", color: active ? "#60a5fa" : "#94a3b8", fontSize: "12.5px", borderRadius: "6px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit", textAlign: "left" }),
  badge: { background: "#3b82f6", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" },
  sidebarBottom: { borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" },
  userRow: { display: "flex", alignItems: "center", gap: "8px" },
  userAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  btnLogout: { width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};

const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b" },
  main: { marginLeft: "172px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
  bc: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  bcSep: { color: "#cbd5e1" },
  bcActive: { color: "#1e293b", fontWeight: 600 },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  stat: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statVal: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBar: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statFill: (w, c) => ({ height: "100%", borderRadius: "10px", width: w, background: c }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  layout: { display: "grid", gridTemplateColumns: "1fr 296px", gap: "16px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  cemail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  typeBadge: (isTeam) => ({ fontSize: "11px", color: isTeam ? "#1e40af" : "#334155", background: isTeam ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: "5px", display: "inline-block" }),
  mentorSelect: (assigned) => ({ width: "100%", padding: "6px 8px", border: `1px solid ${assigned ? "#c4b5fd" : "#e2e8f0"}`, borderRadius: "7px", fontSize: "12px", color: assigned ? "#7c3aed" : "#94a3b8", background: assigned ? "#f5f3ff" : "#f8fafc", outline: "none", fontFamily: "inherit", cursor: "pointer" }),
  btnSave: { padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "none", background: "#2563eb", color: "#fff", fontFamily: "inherit", whiteSpace: "nowrap" },
  btnSaved: { padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "1px solid #86efac", background: "#dcfce7", color: "#166534", fontFamily: "inherit", whiteSpace: "nowrap" },
  btnOutline: { padding: "7px 14px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  mentorPanel: { display: "flex", flexDirection: "column", gap: "12px" },
  mentorCard: (selected) => ({ background: "#fff", borderRadius: "12px", border: `1.5px solid ${selected ? "#8b5cf6" : "#e2e8f0"}`, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer" }),
  mentorCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" },
  mentorName: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  capacityBadge: (full) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: full ? "#fee2e2" : "#dcfce7", color: full ? "#991b1b" : "#166534" }),
  capacityBar: { height: "4px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "4px" },
  capacityFill: (pct, full) => ({ height: "100%", borderRadius: "10px", width: `${Math.min(pct, 100)}%`, background: full ? "#ef4444" : "#8b5cf6" }),
  capacityText: { fontSize: "10.5px", color: "#94a3b8" },
  // Assign confirm modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  modalSub: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  modalField: { marginBottom: "14px" },
  modalLabel: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" },
  modalNote: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", lineHeight: 1.6 },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" },
  btnCancel: { padding: "8px 18px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnConfirm: { padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  emptyState: { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
  // Logout modal
  logoutOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" },
  logoutBox: { background: "#fff", borderRadius: "14px", padding: "28px", width: "320px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
  logoutTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" },
  logoutDesc: { fontSize: "13px", color: "#64748b", marginBottom: "24px" },
  logoutActions: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  btnCancelLogout: { padding: "7px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnConfirmLogout: { padding: "7px 16px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function SidebarHR({ user, onLogout }) {
  const location = useLocation();
  return (
    <aside style={sb.sidebar}>
      <div style={sb.sidebarLogo}>
        <img src="/assets/images/logo.png" style={sb.logoImage} alt="logo" />
        <span style={sb.logoText}>EarlyPath</span>
      </div>
      <nav style={sb.nav}>
        {[["MENU", navItems.menu], ["SELECTION", navItems.selection], ["ADMINISTRATION", navItems.administration]].map(([label, items]) => (
          <div key={label} style={sb.section}>
            <span style={sb.sectionLabel}>{label}</span>
            {items.map((item) => (
              <Link key={item.key} to={item.key} style={sb.item(location.pathname === item.key)}>
                <span>{item.label}</span>
                {item.badge && <span style={sb.badge}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={sb.sidebarBottom}>
        <div style={sb.userRow}>
          <div style={sb.userAvatar}>HR</div>
          <div>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#e2e8f0", display: "block" }}>
              {user?.name || "Admin HR"}
            </span>
            
          </div>
        </div>
        <button style={sb.btnLogout} onClick={onLogout} title="Logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

// ─── LOGOUT MODAL ─────────────────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={s.logoutOverlay}>
      <div style={s.logoutBox}>
        <div style={s.logoutTitle}>Konfirmasi Logout</div>
        <div style={s.logoutDesc}>Yakin ingin keluar dari sesi ini?</div>
        <div style={s.logoutActions}>
          <button style={s.btnCancelLogout} onClick={onCancel}>Batal</button>
          <button style={s.btnConfirmLogout} onClick={onConfirm}>Ya, Logout</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AssignMentorHR() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [data, setData]       = useState({ user: {}, stats: {}, interns: [], mentors: [] });
  const [loading, setLoading] = useState(true);
  const [draft, setDraft]     = useState({});
  const [saved, setSaved]     = useState({});
  const [modal, setModal]     = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────
  const fetchData = () => {
    api('/hr/assign-mentor')
      .then(res => {
        setData(res.data);
        const initDraft = {};
        const initSaved = {};
        res.data.interns.forEach(i => {
          if (i.mentor_id) {
            initDraft[i.id_submission] = i.mentor_id;
            initSaved[i.id_submission] = true;
          }
        });
        setDraft(initDraft);
        setSaved(initSaved);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // ── Helpers ────────────────────────────────────────────
  const getMentor    = (id) => data.mentors.find(m => m.id_mentor === id);
  const mentorLoad   = (mentorId) => data.interns.filter(i => (draft[i.id_submission] || i.mentor_id) === mentorId).length;

  // ── Handlers ──────────────────────────────────────────
  const handleMentorChange = (id_submission, mentorId) => {
    setDraft(prev => ({ ...prev, [id_submission]: mentorId || null }));
    setSaved(prev => ({ ...prev, [id_submission]: false }));
  };

  const openConfirm = (intern) => {
    if (!draft[intern.id_submission]) return;
    setModal(intern);
  };

  const confirmAssign = async () => {
    const intern = modal;
    try {
      await api('/hr/assign-mentor', {
        method: 'POST',
        body: JSON.stringify({
          id_submission: intern.id_submission,
          id_mentor:     draft[intern.id_submission],
        }),
      });
      setSaved(prev => ({ ...prev, [intern.id_submission]: true }));
      setModal(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassign = async (id_submission) => {
    await api(`/hr/assign-mentor/${id_submission}`, { method: 'DELETE' });
    setDraft(prev => ({ ...prev, [id_submission]: null }));
    setSaved(prev => ({ ...prev, [id_submission]: false }));
    fetchData();
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const handleAutoAssign = async () => {
    setAutoLoading(true);
    try {
      await api('/hr/assign-mentor/auto', { method: 'POST' });
      fetchData();
    } finally {
      setAutoLoading(false);
    }
  };

  const total         = data.stats.total          ?? 0;
  const assigned      = data.stats.assigned        ?? 0;
  const unassigned    = data.stats.unassigned      ?? 0;
  const activeMentors = data.stats.active_mentors  ?? 0;

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading...</div>;

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; } select { appearance: auto; }`}</style>

      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Administration</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Assign Mentor</span>
          </div>
          <div style={s.topbarDate}>{today}</div>
        </div>

        <div style={s.content}>
          <h1 style={s.h1}>Assign Mentor</h1>
          <p style={s.subtitle}>Assign a mentor to each accepted intern. Each intern is assigned individually.</p>

          {/* Stat Cards */}
          <div style={s.grid4}>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Total Accepted</span></div>
              <div style={s.statVal}>{total}</div>
              <div style={s.statBar}><div style={s.statFill("100%", "#3b82f6")} /></div>
              <div style={s.statSub}>Ready to be assigned</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Assigned</span><span style={s.statBadge("#dcfce7", "#166534")}>Done</span></div>
              <div style={s.statVal}>{assigned}</div>
              <div style={s.statBar}><div style={s.statFill(`${total > 0 ? Math.round((assigned / total) * 100) : 0}%`, "#22c55e")} /></div>
              <div style={s.statSub}>Mentor confirmed</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Unassigned</span><span style={s.statBadge("#fef9c3", "#92400e")}>Pending</span></div>
              <div style={s.statVal}>{unassigned}</div>
              <div style={s.statBar}><div style={s.statFill(`${total > 0 ? Math.round((unassigned / total) * 100) : 0}%`, "#f59e0b")} /></div>
              <div style={s.statSub}>Needs assignment</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Active Mentors</span></div>
              <div style={s.statVal}>{activeMentors}</div>
              <div style={s.statBar}><div style={s.statFill("100%", "#8b5cf6")} /></div>
              <div style={s.statSub}>Available to assign</div>
            </div>
          </div>

          <div style={s.layout}>
            {/* Main table */}
            <div style={s.card}>
              <div style={s.ch}>
                <div>
                  <div style={s.ct}>Accepted Interns</div>
                  <div style={s.cs}>Select a mentor for each intern, then click Assign</div>
                </div>
                <button style={s.btnOutline} onClick={handleAutoAssign} disabled={autoLoading}>
                  {autoLoading ? 'Assigning...' : 'Auto-assign Unassigned'}
                </button>
              </div>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "26%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>INTERN</th>
                    <th style={s.th}>POSITION</th>
                    <th style={s.th}>PROGRAM</th>
                    <th style={s.th}>TYPE</th>
                    <th style={s.th}>ASSIGN MENTOR</th>
                    <th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.interns.length === 0 ? (
                    <tr><td colSpan={6} style={s.emptyState}>No accepted interns yet.</td></tr>
                  ) : data.interns.map((intern) => {
                    const currentDraft = draft[intern.id_submission];
                    const isSaved      = saved[intern.id_submission];
                    return (
                      <tr key={intern.id_submission}>
                        <td style={s.td}>
                          <span style={s.cname}>{intern.name}</span>
                          <span style={s.cemail}>{intern.email}</span>
                        </td>
                        <td style={s.td}>{intern.position}</td>
                        <td style={s.td}>{intern.program}</td>
                        <td style={s.td}>
                          <span style={s.typeBadge(intern.type === "team")}>
                            {intern.type === "team" ? "Team" : "Individual"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <select
                            style={s.mentorSelect(!!currentDraft)}
                            value={currentDraft || ""}
                            onChange={e => handleMentorChange(intern.id_submission, e.target.value)}
                            disabled={isSaved}
                          >
                            <option value="">— Select mentor —</option>
                            {data.mentors.map(m => {
                              const load = mentorLoad(m.id_mentor);
                              const full = load >= m.capacity;
                              return (
                                <option key={m.id_mentor} value={m.id_mentor} disabled={full && currentDraft !== m.id_mentor}>
                                  {m.name}{full ? " (Full)" : ` (${load}/${m.capacity})`}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td style={s.td}>
                          {isSaved ? (
                            <button style={s.btnSaved} onClick={() => handleUnassign(intern.id_submission)}>
                              Assigned ✓
                            </button>
                          ) : (
                            <button
                              style={{ ...s.btnSave, opacity: currentDraft ? 1 : 0.4, cursor: currentDraft ? "pointer" : "not-allowed" }}
                              onClick={() => currentDraft && openConfirm(intern)}
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mentor overview panel */}
            <div style={s.mentorPanel}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>Mentor Overview</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>Current load & capacity</div>
              {data.mentors.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "20px" }}>No mentors available.</div>
              ) : data.mentors.map(mentor => {
                const load = mentorLoad(mentor.id_mentor);
                const pct  = Math.round((load / mentor.capacity) * 100);
                const full = load >= mentor.capacity;
                return (
                  <div
                    key={mentor.id_mentor}
                    style={s.mentorCard(selectedMentor === mentor.id_mentor)}
                    onClick={() => setSelectedMentor(selectedMentor === mentor.id_mentor ? null : mentor.id_mentor)}
                  >
                    <div style={s.mentorCardTop}>
                      <div style={s.mentorName}>{mentor.name}</div>
                      <span style={s.capacityBadge(full)}>{full ? "Full" : `${load}/${mentor.capacity}`}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>{mentor.email}</div>
                    <div style={s.capacityBar}><div style={s.capacityFill(pct, full)} /></div>
                    <div style={s.capacityText}>{load} intern assigned · {mentor.capacity - load} slot remaining</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Assign confirm modal */}
      {modal && (() => {
        const mentor = getMentor(draft[modal.id_submission]);
        if (!mentor) return null;
        const load = mentorLoad(mentor.id_mentor);
        return (
          <div style={s.overlay} onClick={() => setModal(null)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalTitle}>Confirm Mentor Assignment</div>
              <div style={s.modalSub}>Please review before confirming.</div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Intern</label>
                <div style={s.modalNote}>
                  <strong>{modal.name}</strong><br />
                  {modal.position} &nbsp;·&nbsp; {modal.program} &nbsp;·&nbsp; {modal.type}
                </div>
              </div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Assigned Mentor</label>
                <div style={s.modalNote}>
                  <strong>{mentor.name}</strong><br />
                  {mentor.email}<br />
                  Current load: {load}/{mentor.capacity} interns
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 12px", lineHeight: 1.6 }}>
                Once assigned, the mentor will be able to access this intern's assessment data.
              </div>
              <div style={s.modalFooter}>
                <button style={s.btnCancel} onClick={() => setModal(null)}>Cancel</button>
                <button style={s.btnConfirm} onClick={confirmAssign}>Confirm Assignment</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}