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
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statValue: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statValueSm: { fontSize: "20px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBarTrack: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statBarFill: (width, bg) => ({ height: "100%", borderRadius: "10px", width, background: bg }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  headerActions: { display: "flex", gap: "8px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", overflow: "hidden" },
  candidateName: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  candidateEmail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  miniBadge: (bg, color) => ({ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  actions: { display: "flex", gap: "6px", alignItems: "center" },
  btnAction: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPay: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnOutline: { padding: "7px 14px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnSave: { padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  emptyState: { padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "13px" },
  // Period selector
  periodSelect: { padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", cursor: "pointer" },
  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  modalSubtitle: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  modalField: { marginBottom: "14px" },
  modalLabel: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" },
  modalInput: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  modalRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" },
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
export default function PayrollHR() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [data, setData]       = useState({ stats: {}, payrolls: [], period: '', user: {} });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState(new Date().toISOString().slice(0, 7)); // format: 2026-03
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm]   = useState({});
  const [addError, setAddError] = useState('');
  const [saving, setSaving]     = useState(false);

  // ── Fetch ─────────────────────────────────────────────
  const fetchPayroll = () => {
    api(`/hr/payroll?period=${period}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayroll(); }, [period]);

  // ── Handlers ──────────────────────────────────────────
  const handlePay = async (id) => {
    await api(`/hr/payroll/${id}/pay`, { method: 'PATCH' });
    fetchPayroll();
  };

  const handleExport = () => {
    const token = localStorage.getItem('hr_token');
    window.open(`${import.meta.env.VITE_API_URL}/hr/payroll/export?period=${period}&token=${token}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const handleAddPayroll = async () => {
    setAddError('');
    if (!addForm.id_submission || !addForm.stipend_amount || !addForm.bank_name || !addForm.bank_account || !addForm.account_holder) {
      setAddError('Semua field wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      await api('/hr/payroll', {
        method: 'POST',
        body: JSON.stringify({ ...addForm, period }),
      });
      setAddModal(false);
      setAddForm({});
      fetchPayroll();
    } catch (err) {
      setAddError(err?.message || 'Failed to add payroll.');
    } finally {
      setSaving(false);
    }
  };

  // ── Stat cards ────────────────────────────────────────
  const statCards = [
    { value: data.stats.paid_interns,            label: "Paid Interns",      badge: null,      sub: "Active paid program",      barColor: "#3b82f6", barWidth: "58%", sm: false },
    { value: data.stats.paid_this_month,         label: "Paid This Month",   badge: "Done",    badgeBg: "#dcfce7", badgeColor: "#166534", sub: "Transfer completed", barColor: "#22c55e", barWidth: "78%", sm: false },
    { value: data.stats.pending_payment,         label: "Pending Payment",   badge: "Pending", badgeBg: "#fef9c3", badgeColor: "#92400e", sub: "Needs to be processed", barColor: "#f59e0b", barWidth: "22%", sm: false },
    { value: data.stats.total_disbursed_formatted, label: "Total Disbursed", badge: null,      sub: "This month",               barColor: "#8b5cf6", barWidth: "70%", sm: true },
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
          <div style={s.breadcrumb}><span>Payroll</span></div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}>
              <input style={s.searchInput} placeholder="Search..." />
            </div>
            <div style={s.topbarDate}>{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <div style={s.content}>
          <h1 style={s.h1}>Payroll</h1>
          <p style={s.subtitle}>Manage stipend and payment for paid internship participants.</p>

          {/* Stat Cards */}
          <div style={s.statGrid}>
            {statCards.map((card, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}>
                  <span style={s.statLabel}>{card.label}</span>
                  {card.badge && <span style={s.statBadge(card.badgeBg, card.badgeColor)}>{card.badge}</span>}
                </div>
                <div style={card.sm ? s.statValueSm : s.statValue}>{card.value ?? 0}</div>
                <div style={s.statBarTrack}><div style={s.statBarFill(card.barWidth, card.barColor)} /></div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <div style={s.cardTitle}>Payroll List</div>
                <div style={s.cardSubtitle}>Paid internship participants — {period}</div>
              </div>
              <div style={s.headerActions}>
                {/* Period picker */}
                <input
                  type="month"
                  style={s.periodSelect}
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                />
                <button style={s.btnOutline} onClick={handleExport}>Export CSV</button>
                <button style={s.btnPrimary} onClick={() => { setAddForm({ period }); setAddError(''); setAddModal(true); }}>
                  + Add Payroll
                </button>
              </div>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>INTERN</th>
                    <th style={s.th}>POSITION</th>
                    <th style={s.th}>PROGRAM</th>
                    <th style={s.th}>STIPEND / MONTH</th>
                    <th style={s.th}>BANK ACCOUNT</th>
                    <th style={s.th}>STATUS</th>
                    <th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payrolls.length === 0 ? (
                    <tr><td colSpan={7} style={s.emptyState}>No payroll data for this period.</td></tr>
                  ) : (
                    data.payrolls.map((p) => (
                      <tr key={p.id_payroll}>
                        <td style={s.td}>
                          <span style={s.candidateName}>{p.name}</span>
                          <span style={s.candidateEmail}>{p.email}</span>
                        </td>
                        <td style={s.td}>{p.position}</td>
                        <td style={s.td}>{p.program}</td>
                        <td style={s.td}>{p.stipend_formatted}</td>
                        <td style={s.td}>{p.bank_name} · {p.bank_account}</td>
                        <td style={s.td}>
                          <span style={s.miniBadge(
                            p.status === 'paid' ? "#dcfce7" : "#fef9c3",
                            p.status === 'paid' ? "#166534" : "#92400e"
                          )}>
                            {p.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button style={s.btnAction}>Detail</button>
                            {p.status === 'pending' && (
                              <button style={s.btnPay} onClick={() => handlePay(p.id_payroll)}>Pay Now</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Payroll Modal */}
      {addModal && (
        <div style={s.modalOverlay} onClick={() => setAddModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Add Payroll</div>
            <div style={s.modalSubtitle}>Input data payroll untuk intern</div>

            {addError && <div style={s.errorMsg}>{addError}</div>}

            <div style={s.modalField}>
              <label style={s.modalLabel}>Submission ID</label>
              <input
                style={s.modalInput}
                value={addForm.id_submission || ''}
                onChange={e => setAddForm({ ...addForm, id_submission: e.target.value })}
                placeholder="ID submission intern yang sudah accepted"
              />
            </div>

            <div style={s.modalRow}>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Stipend (Rp)</label>
                <input
                  style={s.modalInput}
                  type="number"
                  value={addForm.stipend_amount || ''}
                  onChange={e => setAddForm({ ...addForm, stipend_amount: e.target.value })}
                  placeholder="1500000"
                />
              </div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Bank Name</label>
                <input
                  style={s.modalInput}
                  value={addForm.bank_name || ''}
                  onChange={e => setAddForm({ ...addForm, bank_name: e.target.value })}
                  placeholder="BCA, BNI, Mandiri..."
                />
              </div>
            </div>

            <div style={s.modalRow}>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Bank Account</label>
                <input
                  style={s.modalInput}
                  value={addForm.bank_account || ''}
                  onChange={e => setAddForm({ ...addForm, bank_account: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Account Holder</label>
                <input
                  style={s.modalInput}
                  value={addForm.account_holder || ''}
                  onChange={e => setAddForm({ ...addForm, account_holder: e.target.value })}
                  placeholder="Nama pemilik rekening"
                />
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnOutline} onClick={() => setAddModal(false)}>Cancel</button>
              <button style={s.btnSave} onClick={handleAddPayroll} disabled={saving}>
                {saving ? 'Saving...' : 'Save Payroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}