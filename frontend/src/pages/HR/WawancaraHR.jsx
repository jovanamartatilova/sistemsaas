import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";

// ============ STYLES ============
const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b" },
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
  logoBadge: { width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "3px", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoImage: { height: "50px", width: "auto", minWidth: "50px", objectFit: "contain", display: "block" },
  logoText: { fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: "1" },
  sidebarNav: { flex: 1, padding: "10px 8px", overflowY: "auto" },
  navSection: { marginBottom: "14px" },
  navLabel: { display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#475569", padding: "0 8px", marginBottom: "4px", textTransform: "uppercase", textAlign: "left" },
  navItem: (active) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", border: "none", background: active ? "rgba(59,130,246,0.18)" : "transparent", color: active ? "#60a5fa" : "#94a3b8", fontSize: "12.5px", borderRadius: "6px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit", textAlign: "left" }),
  navBadge: { background: "#3b82f6", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" },
  sidebarUser: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  userAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  main: { marginLeft: "172px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  topbarRight: { display: "flex", alignItems: "center", gap: "10px" },
  searchBox: { display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: "12px", color: "#334155", width: "120px", fontFamily: "inherit" },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statValue: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBarTrack: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statBarFill: (width, bg) => ({ height: "100%", borderRadius: "10px", width, background: bg }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", overflow: "hidden" },
  candidateName: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  candidateEmail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  actions: { display: "flex", gap: "6px", alignItems: "center" },
  btnAction: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnOutline: { padding: "8px 18px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnSave: { padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  resultSelect: (bg, color) => ({ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, border: `1px solid ${bg === "#f1f5f9" ? "#e2e8f0" : bg}`, background: bg, color, cursor: "pointer", outline: "none", fontFamily: "inherit" }),
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  modalSubtitle: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  modalField: { marginBottom: "14px" },
  modalLabel: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" },
  modalInput: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  modalSelect: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  modalRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" },
  emptyState: { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
  errorMsg: { padding: "8px 12px", background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#dc2626", fontSize: "12px", marginBottom: "12px" },
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
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

const resultOptions = [
  { value: "pending",  label: "Pending",  bg: "#f1f5f9", color: "#64748b" },
  { value: "continue", label: "Continue", bg: "#dbeafe", color: "#1e40af" },
  { value: "accepted", label: "Accepted", bg: "#dcfce7", color: "#166534" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
];

const mediaOptions = ["Google Meet", "Zoom", "Microsoft Teams", "Offline"];

const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" };
const modalBox = { background: "#fff", borderRadius: "14px", padding: "28px", width: "320px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" };
const modalTitle = { fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" };
const modalDesc = { fontSize: "13px", color: "#64748b", marginBottom: "24px" };
const modalActions = { display: "flex", gap: "10px", justifyContent: "flex-end" };
const btnCancel = { padding: "7px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const btnConfirmLogout = { padding: "7px 16px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <div style={modalTitle}>Konfirmasi Logout</div>
        <div style={modalDesc}>Yakin ingin keluar dari sesi ini?</div>
        <div style={modalActions}>
          <button style={btnCancel} onClick={onCancel}>Batal</button>
          <button style={btnConfirmLogout} onClick={onConfirm}>Ya, Logout</button>
        </div>
      </div>
    </div>
  );
}

const sidebarBottom = { borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" };
const userRow = { display: "flex", alignItems: "center", gap: "8px" };
const btnLogout = { width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

function SidebarHR({ user, onLogout }) {
  const location = useLocation();
  return (
    <aside style={s.sidebar}>
      <div style={s.sidebarLogo}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/assets/images/logo.png" style={s.logoImage} />
        </div>
        <span style={s.logoText}>EarlyPath</span>
      </div>
      <nav style={s.sidebarNav}>
        {Object.entries({ "MENU": navItems.menu, "SELECTION": navItems.selection, "ADMINISTRATION": navItems.administration }).map(([label, items]) => (
          <div key={label} style={s.navSection}>
            <span style={s.navLabel}>{label}</span>
            {items.map((item) => (
              <Link key={item.key} to={item.key} style={s.navItem(location.pathname === item.key)}>
                <span>{item.label}</span>
                {item.badge && <span style={s.navBadge}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={sidebarBottom}>
        <div style={userRow}>
          <div style={s.userAvatar}>HR</div>
          <div>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#e2e8f0", display: "block" }}>
              {user?.name || "Admin HR"}
            </span>
          </div>
        </div>
        <button style={btnLogout} onClick={onLogout} title="Logout">
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

// ============ PAGE ============
export default function InterviewHR() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [data, setData]         = useState({ stats: {}, interviews: [], user: {} });
  const [loading, setLoading]   = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal]   = useState(false);
  const [form, setForm]           = useState({});
  const [addForm, setAddForm]     = useState({});
  const [addError, setAddError]   = useState("");
  const [saving, setSaving]       = useState(false);

  // ── Fetch ────────────────────────────────────────────────
  const fetchInterviews = () => {
    api('/hr/interviews')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterviews(); }, []);

  // ── Helpers ──────────────────────────────────────────────
  const getResultStyle = (val) => resultOptions.find(o => o.value === val) || resultOptions[0];

  // ── Handlers ─────────────────────────────────────────────
  const openEdit = (row) => {
    setForm({ ...row });
    setEditModal(row.id_interview);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api(`/hr/interviews/${form.id_interview}`, {
        method: 'PATCH',
        body: JSON.stringify({
          interview_date: form.interview_date,
          interview_time: form.interview_time,
          media:          form.media,
          link:           form.link || null,
          notes:          form.notes || null,
        }),
      });
      setEditModal(null);
      fetchInterviews();
    } finally {
      setSaving(false);
    }
  };

  const handleResultChange = async (id, value) => {
    await api(`/hr/interviews/${id}/result`, {
      method: 'PATCH',
      body: JSON.stringify({ result: value }),
    });
    fetchInterviews();
  };

  const handleAddSchedule = async () => {
    setAddError("");
    if (!addForm.id_submission || !addForm.interview_date || !addForm.interview_time || !addForm.media) {
      setAddError("Submission ID, date, time, and media are required.");
      return;
    }
    setSaving(true);
    try {
      await api('/hr/interviews', {
        method: 'POST',
        body: JSON.stringify({
          id_submission:  addForm.id_submission,
          interview_date: addForm.interview_date,
          interview_time: addForm.interview_time,
          media:          addForm.media || "Google Meet",
          link:           addForm.link  || null,
          notes:          addForm.notes || null,
        }),
      });
      setAddModal(false);
      setAddForm({});
      fetchInterviews();
    } catch (err) {
      setAddError(err?.message || "Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  // ── Stat cards dari API ───────────────────────────────────
  const statCards = [
    { value: data.stats.today,     label: "Today's Interviews", badge: "Today", badgeBg: "#dcfce7", badgeColor: "#166534", sub: "Schedule confirmed",    barColor: "#3b82f6", barWidth: "45%" },
    { value: data.stats.pending,   label: "Pending Schedule",   badge: null,    sub: "Need to be scheduled",               barColor: "#f59e0b",        barWidth: "35%" },
    { value: data.stats.completed, label: "Completed",          badge: null,    sub: "Decision made",                      barColor: "#22c55e",        barWidth: "55%" },
  ];

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading...</div>;

  return (
    <div style={s.app}>
      {showLogoutModal && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />}
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
      <main style={s.main}>

        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.breadcrumb}><span>Interview</span></div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}><input style={s.searchInput} placeholder="Search..." /></div>
            <div style={s.topbarDate}>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={s.content}>
          <h1 style={s.h1}>Interview</h1>
          <p style={s.subtitle}>Schedule and results of candidate interviews.</p>

          {/* Stat Cards */}
          <div style={s.statGrid}>
            {statCards.map((card, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}>
                  <span style={s.statLabel}>{card.label}</span>
                  {card.badge && <span style={s.statBadge(card.badgeBg, card.badgeColor)}>{card.badge}</span>}
                </div>
                <div style={s.statValue}>{card.value ?? 0}</div>
                <div style={s.statBarTrack}><div style={s.statBarFill(card.barWidth, card.barColor)} /></div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <div style={s.cardTitle}>Interview Schedule</div>
                <div style={s.cardSubtitle}>All scheduled interview sessions</div>
              </div>
              <button style={s.btnPrimary} onClick={() => { setAddForm({ media: "Google Meet" }); setAddError(""); setAddModal(true); }}>
                + Add Schedule
              </button>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>CANDIDATE</th>
                    <th style={s.th}>POSITION</th>
                    <th style={s.th}>DATE &amp; TIME</th>
                    <th style={s.th}>INTERVIEWER</th>
                    <th style={s.th}>MEDIA</th>
                    <th style={s.th}>RESULT</th>
                    <th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.interviews.length === 0 ? (
                    <tr><td colSpan={7} style={s.emptyState}>No interviews scheduled yet.</td></tr>
                  ) : (
                    data.interviews.map((j) => {
                      const rs = getResultStyle(j.result);
                      return (
                        <tr key={j.id_interview}>
                          <td style={s.td}>
                            <span style={s.candidateName}>{j.candidate_name}</span>
                            <span style={s.candidateEmail}>{j.position}</span>
                          </td>
                          <td style={s.td}>{j.position}</td>
                          <td style={s.td}>{j.interview_date}, {j.interview_time}</td>
                          <td style={s.td}>{j.interviewer}</td>
                          <td style={s.td}>{j.media}</td>
                          <td style={s.td}>
                            <select
                              style={s.resultSelect(rs.bg, rs.color)}
                              value={j.result}
                              onChange={e => handleResultChange(j.id_interview, e.target.value)}
                            >
                              {resultOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </td>
                          <td style={s.td}>
                            <div style={s.actions}>
                              <button style={s.btnAction} onClick={() => openEdit(j)}>Edit Schedule</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ── Edit Modal ── */}
      {editModal && (
        <div style={s.modalOverlay} onClick={() => setEditModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Edit Interview Schedule</div>
            <div style={s.modalSubtitle}>{form.candidate_name} — {form.position}</div>
            <div style={s.modalRow}>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Date</label>
                <input style={s.modalInput} type="date" value={form.interview_date || ""}
                  onChange={e => setForm({ ...form, interview_date: e.target.value })} />
              </div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Time</label>
                <input style={s.modalInput} type="time" value={form.interview_time || ""}
                  onChange={e => setForm({ ...form, interview_time: e.target.value })} />
              </div>
            </div>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Interviewer</label>
              <input style={s.modalInput} value={form.interviewer || ""}
                onChange={e => setForm({ ...form, interviewer: e.target.value })}
                placeholder="Interviewer name" />
            </div>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Media</label>
              <select style={s.modalSelect} value={form.media || ""}
                onChange={e => setForm({ ...form, media: e.target.value })}>
                {mediaOptions.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            {form.media !== "Offline" && (
              <div style={s.modalField}>
                <label style={s.modalLabel}>{form.media} Link</label>
                <input style={s.modalInput} value={form.link || ""}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  placeholder={`Paste ${form.media} link here...`} />
              </div>
            )}
            <div style={s.modalField}>
              <label style={s.modalLabel}>Notes (optional)</label>
              <textarea style={{ ...s.modalInput, minHeight: "70px", resize: "vertical" }}
                value={form.notes || ""}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..." />
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnOutline} onClick={() => setEditModal(null)}>Cancel</button>
              <button style={s.btnSave} onClick={saveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Schedule Modal ── */}
      {addModal && (
        <div style={s.modalOverlay} onClick={() => setAddModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Add Interview Schedule</div>
            <div style={s.modalSubtitle}>Input data jadwal interview baru</div>

            {addError && <div style={s.errorMsg}>{addError}</div>}

            {/* Submission ID — diambil dari list kandidat yang sudah passed screening */}
            <div style={s.modalField}>
              <label style={s.modalLabel}>Submission ID</label>
              <input
                style={s.modalInput}
                value={addForm.id_submission || ""}
                onChange={e => setAddForm({ ...addForm, id_submission: e.target.value })}
                placeholder="ID submission kandidat (dari halaman Screening)"
              />
              <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                Lihat ID di halaman Screening → kolom kandidat yang sudah Pass.
              </span>
            </div>

            <div style={s.modalRow}>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Date</label>
                <input style={s.modalInput} type="date"
                  value={addForm.interview_date || ""}
                  onChange={e => setAddForm({ ...addForm, interview_date: e.target.value })} />
              </div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Time</label>
                <input style={s.modalInput} type="time"
                  value={addForm.interview_time || ""}
                  onChange={e => setAddForm({ ...addForm, interview_time: e.target.value })} />
              </div>
            </div>

            <div style={s.modalField}>
              <label style={s.modalLabel}>Media</label>
              <select style={s.modalSelect}
                value={addForm.media || "Google Meet"}
                onChange={e => setAddForm({ ...addForm, media: e.target.value, link: "" })}>
                {mediaOptions.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {(addForm.media || "Google Meet") !== "Offline" && (
              <div style={s.modalField}>
                <label style={s.modalLabel}>{addForm.media || "Google Meet"} Link</label>
                <input style={s.modalInput}
                  value={addForm.link || ""}
                  onChange={e => setAddForm({ ...addForm, link: e.target.value })}
                  placeholder={`Paste ${addForm.media || "Google Meet"} link here...`} />
              </div>
            )}

            <div style={s.modalField}>
              <label style={s.modalLabel}>Notes (optional)</label>
              <textarea style={{ ...s.modalInput, minHeight: "70px", resize: "vertical" }}
                value={addForm.notes || ""}
                onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="Additional notes..." />
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnOutline} onClick={() => setAddModal(false)}>Cancel</button>
              <button style={s.btnSave} onClick={handleAddSchedule} disabled={saving}>
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}