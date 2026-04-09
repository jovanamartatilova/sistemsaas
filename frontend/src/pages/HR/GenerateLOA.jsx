import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";

// ============ STYLES ============
const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b" },
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
  logoBadge: { width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  sidebarLogo: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  logoImage: {
    height: "50px",
    width: "auto",
    minWidth: "50px",
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
    textAlign: "left"
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
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statValue: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBarTrack: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statBarFill: (width, bg) => ({ height: "100%", borderRadius: "10px", width, background: bg }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  pageLayout: { display: "grid", gridTemplateColumns: "1fr", gap: "16px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"},
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  td: {
    padding: "12px 14px",
    fontSize: "13px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    display: "table-cell",
  },
  candidateName: {
    fontWeight: 600,
    color: "#0f172a",
    fontSize: "13px",
    display: "block",
    lineHeight: "1.2"
  },
  candidateEmail: {
    fontSize: "11px",
    color: "#94a3b8",
    display: "block",
    lineHeight: "1.2",
    marginTop: "2px"
  },
  miniBadge: (bg, color) => ({ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  actions: { display: "flex", gap: "6px", alignItems: "center" },
  btnAction: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnGenerate: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnDownload: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  previewCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px", alignSelf: "start" },
  loaDoc: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", fontSize: "12px", lineHeight: 1.9 },
  loaTitle: { fontSize: "14px", fontWeight: 700, textAlign: "center", marginBottom: "4px", display: "block" },
  loaNo: { fontSize: "11px", color: "#94a3b8", textAlign: "center", display: "block", marginBottom: "14px" },

sidebarBottom: { borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" },
userRow: { display: "flex", alignItems: "center", gap: "8px" },
btnLogout: { width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" },
modalBox: { background: "#fff", borderRadius: "14px", padding: "28px", width: "320px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
modalTitle: { fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" },
modalDesc: { fontSize: "13px", color: "#64748b", marginBottom: "24px" },
modalActions: { display: "flex", gap: "10px", justifyContent: "flex-end" },
btnCancel: { padding: "7px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
btnConfirmLogout: { padding: "7px 16px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
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

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={s.modalOverlay}>
      <div style={s.modalBox}>
        <div style={s.modalTitle}>Konfirmasi Logout</div>
        <div style={s.modalDesc}>Yakin ingin keluar dari sesi ini?</div>
        <div style={s.modalActions}>
          <button style={s.btnCancel} onClick={onCancel}>Batal</button>
          <button style={s.btnConfirmLogout} onClick={onConfirm}>Ya, Logout</button>
        </div>
      </div>
    </div>
  );
}

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
      <div style={s.sidebarBottom}>
        <div style={s.userRow}>
          <div style={s.userAvatar}>HR</div>
          <div>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#e2e8f0", display: "block" }}>
              {user?.name || "Admin HR"}
            </span>
          </div>
        </div>
        <button style={s.btnLogout} onClick={onLogout} title="Logout">
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
export default function GenerateLoAHR() {
const navigate = useNavigate();
const [showLogoutModal, setShowLogoutModal] = useState(false);
const user = useAuthStore((state) => state.user);
const [data, setData] = useState({ user: {}, stats: {}, candidates: [] });
const [loading, setLoading] = useState(false);
const [bulkLoading, setBulkLoading] = useState(false);
const [error, setError] = useState('');

// Clear old token on first load to force fresh auth
useEffect(() => {
  const stored = localStorage.getItem('hr_token');
  if (stored && stored.length < 20) { // Likely old format
    localStorage.removeItem('hr_token');
  }
}, []);

const fetchLoa = async () => {
  try {
    setError('');
    const res = await api('/hr/loa');
    setData(res.data);
  } catch (err) {
    console.error('Fetch error details:', {
      message: err.message,
      status: err.status,
      fullError: err,
    });
    setError(`Error: ${err.message || 'Unknown error'}`);
  }
};

useEffect(() => {
  fetchLoa();
}, []);

const handleGenerate = async (id) => {
  try {
    setLoading(id);
    setError('');
    await api(`/hr/loa/${id}/generate`, { method: 'POST' });
    await fetchLoa();
  } catch (err) {
    setError(err.message || 'Failed to generate LoA');
    console.error(err);
  } finally {
    setLoading(null);
  }
};

const handleBulkGenerate = async () => {
  try {
    setBulkLoading(true);
    setError('');
    await api('/hr/loa/bulk-generate', { method: 'POST' });
    await fetchLoa();
  } catch (err) {
    setError(err.message || 'Failed to generate bulk LoA');
    console.error(err);
  } finally {
    setBulkLoading(false);
  }
};

const handleDownload = (id) => {
  const token = localStorage.getItem('hr_token');
  window.open(`${import.meta.env.VITE_API_URL}/hr/loa/${id}/download?token=${token}`);
};

const statCards = [
    { value: data.stats.accepted,  label: "Accepted Candidates", sub: "Eligible for LoA",      barColor: "#3b82f6", barWidth: "65%" },
    { value: data.stats.generated, label: "LoA Generated",       sub: "Already created",        barColor: "#22c55e", barWidth: "40%" },
    { value: data.stats.pending,   label: "Pending Generation",  sub: "Needs to be created",    barColor: "#f59e0b", barWidth: "30%" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.breadcrumb}>
            <span>Generate LOA</span>
          </div>
          <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Generate LoA</h1>
          <p style={s.subtitle}>Create Letter of Acceptance for accepted candidates.</p>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <div style={s.statGrid}>
            {statCards.map((card, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}><span style={s.statLabel}>{card.label}</span></div>
                <div style={s.statValue}>{card.value}</div>
                <div style={s.statBarTrack}><div style={s.statBarFill(card.barWidth, card.barColor)} /></div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.pageLayout}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardTitle}>Accepted Candidates</div>
                  <div style={s.cardSubtitle}>Select candidate to generate LoA</div>
                </div>
                <button 
                  style={{...s.btnPrimary, opacity: bulkLoading ? 0.6 : 1, cursor: bulkLoading ? 'not-allowed' : 'pointer'}} 
                  onClick={handleBulkGenerate}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? 'Generating...' : 'Bulk Generate'}
                </button>
              </div>
              <div style={s.tableWrap}>
                {data.candidates && data.candidates.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>No accepted candidates yet</p>
                    <p style={{ fontSize: '12px' }}>Candidates must have submissions with "accepted" status to generate LoA</p>
                  </div>
                ) : (
                <table style={s.table}>
                  <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead style={s.thead}>
                    <tr>
                      <th style={s.th}>CANDIDATE</th>
                      <th style={s.th}>POSITION</th>
                      <th style={s.th}>PROGRAM</th>
                      <th style={s.th}>TYPE</th>
                      <th style={s.th}>LOA STATUS</th>
                      <th style={s.th}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.candidates.map((c, i) => (
  <tr key={c.id_submission}>
    <td style={s.td}>
      <span style={s.candidateName}>{c.name}</span>
      <span style={s.candidateEmail}>{c.email}</span>
    </td>
    <td style={s.td}>{c.position}</td>
    <td style={s.td}>{c.program}</td>
    <td style={s.td}>{c.type}</td>
    <td style={s.td}>
      <span style={s.miniBadge(
        c.loa_status === 'generated' ? "#dcfce7" : "#fef9c3",
        c.loa_status === 'generated' ? "#166534" : "#92400e"
      )}>
        {c.loa_status === 'generated' ? 'Done' : 'Pending'}
      </span>
    </td>
    <td style={s.td}>
      <div style={s.actions}>
        {c.has_file && <button style={s.btnAction} onClick={() => handleDownload(c.id_submission)}>Preview</button>}
        {c.has_file && <button style={s.btnDownload} onClick={() => handleDownload(c.id_submission)}>Download</button>}
        {c.loa_status === 'pending' && (
          <button 
            style={{...s.btnGenerate, opacity: loading === c.id_submission ? 0.6 : 1, cursor: loading === c.id_submission ? 'not-allowed' : 'pointer'}} 
            onClick={() => handleGenerate(c.id_submission)}
            disabled={loading === c.id_submission}
          >
            {loading === c.id_submission ? 'Generating...' : 'Generate'}
          </button>
        )}
      </div>
    </td>
  </tr>
))}
                  </tbody>
                </table>
                )}
              </div>
            </div>


          </div>
        </div>
      </main>
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}