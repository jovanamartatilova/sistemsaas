import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import SidebarHR from "../../components/SidebarHR";
import { LoadingSpinner } from "../../components/LoadingSpinner";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
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
  DollarSign: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  CreditCard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Send: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  RotateCcw: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  Power: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  CheckMark: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, badge, badgeBg, badgeColor, barColors }) {
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
        {badge && (
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 9px",
            borderRadius: "20px", background: badgeBg, color: badgeColor,
          }}>
            {badge}
          </span>
        )}
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

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    paid:    { bg: "#f0fdf4", color: "#15803d", border: "#86efac", label: "Paid" },
    pending: { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Pending" },
    unprocessed: { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", label: "Unprocessed" },
  };
  const s = map[status] || map.unprocessed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "4px 12px", minWidth: "72px",
      borderRadius: "999px", fontSize: "11.5px", fontWeight: "600",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textAlign: "center",
    }}>
      {s.label}
    </span>
  );
}

// ── Manage Stipend Modal ──────────────────────────────────────────────────────
function ManageStipendModal({ programs, onClose, onSave }) {
  const [form, setForm] = useState({ id_vacancy: "", stipend_amount: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleProgramChange = (id) => {
    const p = programs.find(x => x.id_vacancy === id);
    setForm({
      id_vacancy: id,
      stipend_amount: p?.stipend_amount || ""
    });
  };

  const handleSave = async () => {
    if (!form.id_vacancy || !form.stipend_amount) {
      setError("Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
    borderRadius: "10px", fontSize: "13px", outline: "none", background: "#f8fafc",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>Set Program Stipend</div>
        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Define standard monthly stipend for an internship program.</div>

        {error && <div style={{ background: "#fff1f2", color: "#dc2626", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px", border: "1px solid #fca5a5" }}>{error}</div>}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Internship Program</label>
          <select style={inputStyle} value={form.id_vacancy} onChange={e => handleProgramChange(e.target.value)}>
            <option value="">-- Choose Program --</option>
            {programs.map(p => <option key={p.id_vacancy} value={p.id_vacancy}>{p.title}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Monthly Stipend (Rp)</label>
          <input type="number" style={inputStyle} value={form.stipend_amount} onChange={e => setForm({ ...form, stipend_amount: e.target.value })} placeholder="e.g. 1500000" />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#64748b", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function PayrollHR() {
  const navigate = useNavigate();
  const logoutUser = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: {}, payrolls: [], programs: [] });
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [search, setSearch] = useState("");
  const [appStatus, setAppStatus] = useState("active"); // All / active / completed
  const [showStipendModal, setShowStipendModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [period, appStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api(`/hr/payroll?period=${period}&search=${search}&app_status=${appStatus}`);
      setData(res.data);
    } catch (err) {
      addToast("Failed to fetch payroll data", "error");
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handlePay = async (item) => {
    try {
      await api("/hr/payroll/pay", {
        method: "POST",
        body: JSON.stringify({
          id_submission: item.id_submission,
          period: period
        })
      });
      addToast(`Payment processed for ${item.name}`);
      fetchData();
    } catch (err) {
      addToast(err?.message || "Payment failed", "error");
    }
  };

  const handleRollback = async (item) => {
    try {
      await api("/hr/payroll/rollback", {
        method: "POST",
        body: JSON.stringify({
          id_submission: item.id_submission,
          period: period
        })
      });
      addToast(`Payment rolled back for ${item.name}`);
      fetchData();
    } catch (err) {
      addToast(err?.message || "Rollback failed", "error");
    }
  };

  const handleTerminate = async (item) => {
    try {
      await api("/hr/payroll/terminate", {
        method: "POST",
        body: JSON.stringify({
          id_apprentice: item.id_apprentice
        })
      });
      addToast(`Internship ended for ${item.name}. They will no longer appear in payroll.`);
      fetchData();
    } catch (err) {
      addToast(err?.message || "Action failed", "error");
    }
  };

  const handleUpdateStipend = async (form) => {
    try {
      await api("/hr/payroll/stipend", {
        method: "POST",
        body: JSON.stringify(form)
      });
      addToast("Program stipend updated successfully");
      fetchData();
    } catch (err) {
      throw err;
    }
  };

  const handleExport = async () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/hr/payroll/export?period=${period}&token=${localStorage.getItem("token")}`;
    addToast("Exporting payroll data...");
  };

  if (loading && !data.payrolls.length) return (
  <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
    <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner fullScreen={false} message="Loading payroll..." />
    </div>
  </div>
);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <nav style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", display: "flex", gap: "6px" }}>
              <span>Payroll</span> <span style={{ opacity: 0.5 }}>/</span> <span style={{ color: "#2563eb", fontWeight: 600 }}>Overview</span>
            </nav>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Payroll</h1>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Manage stipend and payment for paid internship participants.</p>
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", background: "#fff", padding: "8px 16px", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            {todayStr()}
          </div>
        </header>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
          <StatCard
            icon={<IC.Users />} iconBg="#eff6ff" iconColor="#2563eb"
            title="Total Interns" value={data.stats.total_interns}
            sub="Active paid program"
            barColors={["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]}
          />
          <StatCard
            icon={<IC.CheckCircle />} iconBg="#f0fdf4" iconColor="#16a34a"
            title="Paid This Month" value={data.stats.paid_this_month}
            badge="Done" badgeBg="#dcfce7" badgeColor="#166534"
            sub="Transfer completed"
            barColors={["#22c55e", "#4ade80", "#86efac", "#bbf7d0"]}
          />
          <StatCard
            icon={<IC.Clock />} iconBg="#fff7ed" iconColor="#ea580c"
            title="Pending Payment" value={data.stats.pending_payment}
            badge="Pending" badgeBg="#ffedd5" badgeColor="#9a3412"
            sub="Needs to be processed"
            barColors={["#f97316", "#fb923c", "#fdba74", "#fed7aa"]}
          />
          <StatCard
            icon={<IC.DollarSign />} iconBg="#f5f3ff" iconColor="#7c3aed"
            title="Total Disbursed" value={data.stats.total_disbursed_formatted}
            sub="This month"
            barColors={["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"]}
          />
        </div>

        {/* List Card */}
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
          
          {/* Action & Filter Bar */}
          <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Payroll List</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Intern payroll records — {period}</div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {["active", "completed", ""].map((s) => (
                  <button
                    key={s}
                    onClick={() => setAppStatus(s)}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                      cursor: "pointer", border: `1px solid ${appStatus === s ? "#2563eb" : "#e2e8f0"}`,
                      background: appStatus === s ? "#eff6ff" : "#fff", color: appStatus === s ? "#2563eb" : "#64748b",
                      fontFamily: "inherit", transition: "all 0.15s",
                    }}
                  >
                    {s === "" ? "Show All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><IC.Search /></span>
                  <input
                    type="text"
                    placeholder="Search intern..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchData()}
                    style={{
                      padding: "9px 12px 9px 36px", borderRadius: "10px", border: "1px solid #e2e8f0",
                      background: "#f8fafc", fontSize: "13px", color: "#334155", width: "220px", outline: "none",
                    }}
                  />
                </div>

                <input
                  type="month"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0",
                    background: "#f8fafc", fontSize: "13px", color: "#334155", outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setConfirmModal({
                  type: "export",
                  title: "Export Payroll?",
                  desc: "Download payroll data for " + period + " as CSV file.",
                  confirmLabel: "Export CSV",
                  onConfirm: handleExport
                })} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "9px 16px",
                  borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff",
                  fontSize: "13px", fontWeight: "600", color: "#475569", cursor: "pointer",
                }}>
                  <IC.Download /> Export CSV
                </button>

                <button onClick={() => setShowStipendModal(true)} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px",
                  borderRadius: "10px", border: "none", background: "#2563eb",
                  fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }}>
                  <IC.Plus /> Set Program Stipend
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  <th style={thStyle}>INTERN</th>
                  <th style={thStyle}>POSITION</th>
                  <th style={thStyle}>PROGRAM</th>
                  <th style={thStyle}>STIPEND / MONTH</th>
                  <th style={thStyle}>BANK ACCOUNT</th>
                  <th style={thStyle}>STATUS</th>
                  <th style={thStyle}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {data.payrolls.length > 0 ? data.payrolls.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" }} className="table-row-hover">
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#64748b" }}>
                          {item.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>{item.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.email}</span>
                            <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "10px", background: item.intern_status === "active" ? "#f0fdf4" : "#eff6ff", color: item.intern_status === "active" ? "#166534" : "#1e40af", fontWeight: 700 }}>{item.intern_status}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "13px", color: "#475569" }}>{item.position}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "13px", color: "#475569" }}>{item.program}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b" }}>{item.stipend_formatted}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "12.5px", color: "#475569", fontWeight: 500 }}>{item.bank_name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.bank_account}</div>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={tdStyle}>
                      {item.status !== "paid" ? (
                        <button 
                          disabled={item.bank_name === "-" || item.bank_account === "-"}
                          onClick={() => setConfirmModal({
                            type: "pay",
                            title: "Confirm Payment?",
                            desc: `Process payment for ${item.name} for ${period}. Bank info: ${item.bank_name} (${item.bank_account})`,
                            confirmLabel: "Process Payment",
                            onConfirm: () => handlePay(item)
                          })}
                          style={{
                            padding: "6px 12px", borderRadius: "8px", border: `1px solid ${(item.bank_name === "-" || item.bank_account === "-") ? "#e2e8f0" : "#16a34a"}`,
                            background: "#fff", fontSize: "12px", fontWeight: "600", color: (item.bank_name === "-" || item.bank_account === "-") ? "#cbd5e1" : "#16a34a",
                            cursor: (item.bank_name === "-" || item.bank_account === "-") ? "not-allowed" : "pointer", 
                            display: "flex", alignItems: "center", gap: "6px"
                          }}
                        >
                          <IC.CreditCard /> Pay
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>
                            <IC.CheckMark /> Paid
                          </div>
                          <button 
                            onClick={() => setConfirmModal({
                              type: "rollback",
                              title: "Undo Payment?",
                              desc: `Are you sure you want to rollback the payment for ${item.name}? This will delete the payroll record for this period.`,
                              confirmLabel: "Yes, Undo",
                              onConfirm: () => handleRollback(item)
                            })}
                            style={{
                              width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #e2e8f0",
                              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#64748b", cursor: "pointer"
                            }}
                            title="Undo/Rollback Payment"
                          >
                            <IC.RotateCcw />
                          </button>
                        </div>
                      )}

                      {item.intern_status === "completed" && (
                        <div style={{ marginTop: "8px", borderTop: "1px dashed #fee2e2", paddingTop: "8px" }}>
                          <button
                            onClick={() => setConfirmModal({
                              type: "terminate",
                              title: "End Internship?",
                              desc: `This will mark ${item.name}'s internship as finished. They will be removed from future payroll lists.`,
                              confirmLabel: "End Internship",
                              onConfirm: () => handleTerminate(item)
                            })}
                            style={{
                              width: "100%", padding: "6px", borderRadius: "8px", border: "1px solid #fee2e2",
                              background: "#fff5f5", fontSize: "11px", fontWeight: "700", color: "#ef4444",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                              transition: "all 0.2s", whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; }}
                          >
                            <IC.Power /> End Program
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
                      No intern found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showStipendModal && (
        <ManageStipendModal 
          programs={data.programs} 
          onClose={() => setShowStipendModal(false)} 
          onSave={handleUpdateStipend} 
        />
      )}

      <ConfirmModal config={confirmModal} onClose={() => setConfirmModal(null)} />
      {showLogoutModal && <LogoutModal onConfirm={logoutUser} onCancel={() => setShowLogoutModal(false)} />}
      <ToastContainer toasts={toasts} />

      <style>{`
        .table-row-hover:hover { background: #f8fafc !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
      `}</style>
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────────
function ConfirmModal({ config, onClose }) {
  if (!config) return null;
  const typeStyles = {
    pay:       { accent: "#16a34a", iconBg: "#f0fdf4", iconBorder: "#86efac", btnBg: "#16a34a" },
    rollback:  { accent: "#ef4444", iconBg: "#fef2f2", iconBorder: "#fecaca", btnBg: "#ef4444" },
    terminate: { accent: "#ef4444", iconBg: "#fef2f2", iconBorder: "#fecaca", btnBg: "#ef4444" },
    export:    { accent: "#2563eb", iconBg: "#eff6ff", iconBorder: "#93c5fd", btnBg: "#2563eb" },
    default:   { accent: "#334155", iconBg: "#f8fafc", iconBorder: "#e2e8f0", btnBg: "#334155" },
  };
  const t = typeStyles[config.type] || typeStyles.default;
  const IconComp = config.type === "pay" ? IC.CreditCard : (config.type === "rollback" ? IC.RotateCcw : (config.type === "terminate" ? IC.Power : IC.Download));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: t.iconBg, border: `1px solid ${t.iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", color: t.accent }}>
          <IconComp />
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>{config.title}</div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>{config.desc}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { config.onConfirm(); onClose(); }} style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: t.btnBg, fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>{config.confirmLabel || "Yes, Continue"}</button>
        </div>
      </div>
    </div>
  );
}

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>Are you sure you want to sign out from your HR account?</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
        </div>
      </div>
    </div>
  );
}

function ToastContainer({ toasts }) {
  const colors = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#166534", Icon: IC.CheckMark },
    error:   { bg: "#fff1f2", border: "#fca5a5", color: "#991b1b", Icon: IC.X },
    info:    { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", Icon: IC.Info },
  };
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999, pointerEvents: "none" }}>
      {toasts.map(toast => {
        const c = colors[toast.type] || colors.success;
        return (
          <div key={toast.id} style={{ display: "flex", alignItems: "center", gap: "10px", background: c.bg, border: `1px solid ${c.border}`, color: c.color, padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: "240px", maxWidth: "340px", animation: "slideIn 0.25s ease" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <c.Icon />
            </span>
            {toast.message}
          </div>
        );
      })}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

const thStyle = { textAlign: "left", padding: "14px 24px", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "16px 24px", verticalAlign: "middle" };