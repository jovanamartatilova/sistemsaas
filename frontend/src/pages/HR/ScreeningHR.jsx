import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useAuthStore } from "../../stores/authStore";

// ============ STYLES ============
const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b" },
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
 logoBadge: { width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },sidebarLogo: {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.08)"
},

logoImage: {
  height: "50px",
  width: "auto",        // 🔥 jangan fixed width dulu
  minWidth: "50px",     // 🔥 biar ga jadi titik
  objectFit: "contain",
  display: "block"
},
logoText: {
  fontSize: "14px",
  fontWeight: 700,
  color: "#fff",
  lineHeight: "1"
},
  sidebarNav: { flex: 1, padding: "10px 8px", overflowY: "auto" },
  navSection: { marginBottom: "14px" },
  navLabel: {
  display: "block",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: "#475569",
  padding: "0 8px",
  marginBottom: "4px",
  textTransform: "uppercase",
  textAlign: "left" // 🔥 ini yang bikin rata kiri
},
  navItem: (active) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", border: "none", background: active ? "rgba(59,130,246,0.18)" : "transparent", color: active ? "#60a5fa" : "#94a3b8", fontSize: "12.5px", borderRadius: "6px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit", textAlign: "left" }),
  navBadge: { background: "#3b82f6", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" },
  sidebarUser: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  userAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  main: { marginLeft: "172px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  breadcrumbSep: { color: "#cbd5e1" },
  breadcrumbActive: { color: "#1e293b", fontWeight: 600 },
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
  screeningLayout: { display: "flex", gap: "16px", alignItems: "flex-start" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", flex: 1, minWidth: 0 },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  tableWrap: { overflowX: "auto" },
  // table-layout fixed — header and body columns always aligned
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 12px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden" },
  td: { padding: "11px 12px", fontSize: "12px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", overflow: "hidden" },
  candidateName: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  candidateEmail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  miniBadge: (bg, color) => ({ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color, whiteSpace: "nowrap" }),
  actions: { display: "flex", gap: "5px", alignItems: "center", flexWrap: "nowrap" },
  btnAction: { padding: "4px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPass: { padding: "4px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnReject: { padding: "4px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #fca5a5", background: "#fff1f2", color: "#dc2626", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnAiCheck: { padding: "4px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #c4b5fd", background: "#f5f3ff", color: "#7c3aed", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnSee: { padding: "4px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnOutline: { padding: "7px 14px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", position: "relative" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  notAvail: { fontSize: "12px", color: "#cbd5e1" },
  aiSidebar: { width: "272px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" },
  aiPanel: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "18px" },
  aiPanelTitle: { fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "14px" },
  field: { marginBottom: "12px" },
  fieldLabel: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" },
  fieldSelect: { width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit" },
  fieldTextarea: { width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", color: "#334155", background: "#f8fafc", outline: "none", resize: "vertical", minHeight: "80px", fontFamily: "inherit", boxSizing: "border-box" },
  btnSave: { padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" },
  // dropdown
  dropdownWrap: { position: "relative" },
  dropdown: { position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "160px", zIndex: 100, padding: "6px 0" },
  dropdownItem: (active) => ({ display: "block", width: "100%", padding: "8px 14px", fontSize: "13px", color: active ? "#2563eb" : "#334155", background: active ? "#eff6ff" : "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontWeight: active ? 600 : 400 }),
  // AI modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  modalSubtitle: { fontSize: "12px", color: "#94a3b8", marginBottom: "18px" },
  aiResultBox: { background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "10px", padding: "14px", marginBottom: "14px" },
  aiResultLabel: { fontSize: "11px", fontWeight: 700, color: "#7c3aed", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" },
  aiResultText: { fontSize: "13px", color: "#374151", lineHeight: 1.6 },
  aiRecBadge: (recommend) => ({ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: recommend ? "#dcfce7" : "#fee2e2", color: recommend ? "#166534" : "#991b1b", marginTop: "10px" }),
  modalFooter: { display: "flex", justifyContent: "flex-end", marginTop: "18px" },
  btnClose: { padding: "8px 20px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const navItems = {
  menu: [{ key: "/hr/dashboard", label: "Dashboard" }],
  selection: [
    { key: "/hr/kandidate", label: "Candidates", badge: 12 },
    { key: "/hr/screening", label: "Screening" },
    { key: "/hr/wawancara", label: "Interview" },
  ],
  administration: [
    { key: "/hr/assign-mentor", label: "Assign Mentor" },
    { key: "/hr/generate-loa", label: "Generate LoA" },
    { key: "/hr/payroll", label: "Payroll" },
  ],
};

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
export default function ScreeningHR() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState({ stats: {}, candidates: [], user: {} });
const [selectedId, setSelectedId] = useState(null);
const [saving, setSaving] = useState(false);

const fetchScreening = () => {
  api('/hr/screening').then(res => setData(res.data));
};

useEffect(() => { fetchScreening(); }, []);

const handlePass = async (id) => {
  await api(`/hr/screening/${id}/pass`, { method: 'PATCH' });
  fetchScreening();
};

const handleReject = async (id) => {
  await api(`/hr/screening/${id}/reject`, { method: 'PATCH' });
  fetchScreening();
};

const handleSaveNotes = async () => {
  if (!selectedId) return;
  setSaving(true);
  await api(`/hr/screening/${selectedId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
  setSaving(false);
  fetchScreening();
};

const handleAiCheck = async (candidate) => {
  setAiModal({ ...candidate, loading: true, result: null, error: null });

  try {
    const res = await api(`/hr/screening/${candidate.id_submission}/ai-check`, {
      method: 'POST'
    });

    if (res.success) {
      setAiModal(prev => ({ 
        ...prev, 
        loading: false, 
        result: res.result 
      }));
    } else {
      setAiModal(prev => ({ 
        ...prev, 
        loading: false, 
        error: res.message || 'AI check failed'
      }));
    }
  } catch (err) {
    setAiModal(prev => ({ 
      ...prev, 
      loading: false, 
      error: err.message || 'Error analyzing candidate'
    }));
    console.error('AI Check Error:', err);
  }
};

  const [notes, setNotes] = useState("");
  const [filterPosition, setFilterPosition] = useState("All Positions");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [aiModal, setAiModal] = useState(null);
  const filterRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  
  // Doc cell: show "See" button if doc exists, dash if not
  const DocCell = ({ has, submissionId, type }) => has
  ? (
    <button style={s.btnSee} onClick={() => {
      api(`/hr/screening/${submissionId}/document/${type}`)
        .then(res => window.open(res.url, '_blank'));
    }}>
      See
    </button>
  )
  : <span style={s.notAvail}>—</span>;

  const statCards = [
  { value: data.stats.needs_review, label: "Needs Review",          badge: "Pending", badgeBg: "#fef9c3", badgeColor: "#92400e", sub: "Awaiting screening",  barColor: "#f59e0b", barWidth: "55%" },
  { value: data.stats.passed,       label: "Passed to Interview",   badge: null,      sub: "Cleared screening",                  barColor: "#22c55e",        barWidth: "35%" },
  { value: data.stats.rejected,     label: "Rejected at Screening", badge: null,      sub: "Did not qualify",                    barColor: "#ef4444",        barWidth: "20%" },
];

const allPositions = ["All Positions", ...new Set(data.candidates.map(c => c.position))];

const filtered = filterPosition === "All Positions"
  ? data.candidates
  : data.candidates.filter(k => k.position === filterPosition);

  return (
    <div style={s.app}>
      {showLogoutModal && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />}
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.breadcrumb}>
            <span>Screening</span>
          </div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}><input style={s.searchInput} placeholder="Search..." /></div>
            <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
          </div>
        </div>

        <div style={s.content}>
          <h1 style={s.h1}>Screening</h1>
          <p style={s.subtitle}>Review candidate documents before proceeding to interview.</p>

          <div style={s.statGrid}>
            {statCards.map((card, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}>
                  <span style={s.statLabel}>{card.label}</span>
                  {card.badge && <span style={s.statBadge(card.badgeBg, card.badgeColor)}>{card.badge}</span>}
                </div>
                <div style={s.statValue}>{card.value}</div>
                <div style={s.statBarTrack}><div style={s.statBarFill(card.barWidth, card.barColor)} /></div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.screeningLayout}>
            {/* Main table */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardTitle}>Screening Queue</div>
                  <div style={s.cardSubtitle}>{filtered.length} candidates need review</div>
                </div>
                <div ref={filterRef} style={s.dropdownWrap}>
                  <button style={s.btnOutline} onClick={() => setShowFilterDropdown((v) => !v)}>
                    Filter: {filterPosition} ▾
                  </button>
                  {showFilterDropdown && (
                    <div style={s.dropdown}>
                      {allPositions.map((pos) => (
                        <button key={pos} style={s.dropdownItem(filterPosition === pos)} onClick={() => { setFilterPosition(pos); setShowFilterDropdown(false); }}>
                          {pos}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <colgroup>
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <thead style={s.thead}>
                    <tr>
                      <th style={s.th}>CANDIDATE</th>
                      <th style={s.th}>POSITION</th>
                      <th style={s.th}>CV / RESUME</th>
                      <th style={s.th}>COVER LETTER</th>
                      <th style={s.th}>RECOMMENDATION</th>
                      <th style={s.th}>PORTFOLIO</th>
                      <th style={s.th}>AI CHECK</th>
                      <th style={s.th}>STATUS</th>
                      <th style={s.th}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((k) => (
                      <tr key={k.id_submission}>
                        <td style={s.td}>
                          <span style={s.candidateName}>{k.name}</span>
                          <span style={s.candidateEmail}>{k.email}</span>
                        </td>
                        <td style={s.td}>{k.position}</td>
                        <td style={s.td}><DocCell has={k.has_cv} submissionId={k.id_submission} type="cv" /></td>
<td style={s.td}><DocCell has={k.has_cover_letter} submissionId={k.id_submission} type="cover_letter" /></td>
<td style={s.td}><DocCell has={k.has_institution_letter} submissionId={k.id_submission} type="institution_letter" /></td>
<td style={s.td}><DocCell has={k.has_portfolio} submissionId={k.id_submission} type="portfolio" /></td>
                        <td style={s.td}>
                          <button
                            style={{ ...s.btnAiCheck, opacity: !k.has_cv ? 0.4 : 1, cursor: !k.has_cv ? "not-allowed" : "pointer" }}
                            onClick={() => k.has_cv && handleAiCheck(k)}
                          >
                            Check
                          </button>
                        </td>
                        <td style={s.td}>
                          {k.screening_status === 'passed'
  ? <span style={s.miniBadge("#dcfce7", "#166534")}>Passed</span>
  : k.has_cv
    ? <span style={s.miniBadge("#fef9c3", "#92400e")}>Pending</span>
    : <span style={s.miniBadge("#fee2e2", "#991b1b")}>Incomplete</span>
}
                        </td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            {k.has_cv && <button style={s.btnPass} onClick={() => handlePass(k.id_submission)}>Pass</button>}
<button style={s.btnReject} onClick={() => handleReject(k.id_submission)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={s.aiSidebar}>
              <div style={s.aiPanel}>
                <div style={s.aiPanelTitle}>Add HR Notes</div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Candidate</label>
                  <select style={s.fieldSelect} value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)}>
                    {data.candidates.map((k) => (
  <option key={k.id_submission} value={k.id_submission}>
    {k.name} — {k.position}
  </option>
))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.fieldLabel}>Notes</label>
                  <textarea style={s.fieldTextarea} placeholder="Write screening notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <button style={s.btnSave} onClick={handleSaveNotes} disabled={saving}>
  {saving ? 'Saving...' : 'Save Notes'}
</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Check Modal */}
      {aiModal && (
  <div style={s.modalOverlay} onClick={() => setAiModal(null)}>
    <div style={s.modal} onClick={e => e.stopPropagation()}>
      <div style={s.modalTitle}>AI Screening Result</div>
      <div style={s.modalSubtitle}>{aiModal.name} — {aiModal.position}</div>
      
      {aiModal.error ? (
        <div style={{ ...s.aiResultBox, background: '#fee2e2', borderColor: '#fca5a5' }}>
          <div style={{ ...s.aiResultLabel, color: '#dc2626' }}>Error</div>
          <div style={{ ...s.aiResultText, color: '#991b1b' }}>{aiModal.error}</div>
        </div>
      ) : (
        <div style={s.aiResultBox}>
          <div style={s.aiResultLabel}>AI Analysis</div>
          {aiModal.loading
            ? <div style={s.aiResultText}>🔄 Analyzing candidate...</div>
            : <>
                <div style={s.aiResultText}>{aiModal.result?.summary || 'No summary available'}</div>
                <div style={s.aiRecBadge(aiModal.result?.recommend)}>
                  {aiModal.result?.recommend ? "✓ Recommended to proceed" : "✗ Not recommended"}
                </div>
              </>
          }
        </div>
      )}
      <div style={{ fontSize: "12px", color: "#94a3b8" }}>AI analysis is advisory only.</div>
      <div style={s.modalFooter}>
        <button style={s.btnClose} onClick={() => setAiModal(null)}>Close</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}