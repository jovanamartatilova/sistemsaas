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

// ── Stat Card (same pattern as Dashboard) ────────────────────────────────────
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

// ── Toast ─────────────────────────────────────────────────────────────────────
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
          <div key={toast.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: "240px", maxWidth: "340px",
            animation: "slideIn 0.25s ease",
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          }}>
            <span style={{
              width: "22px", height: "22px", borderRadius: "50%",
              background: c.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
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

// ── Confirm Modal (same aesthetics as Dashboard ConfirmModal) ─────────────────
function ConfirmModal({ config, onClose }) {
  if (!config) return null;

  const typeStyles = {
    pay:     { accent: "#16a34a", iconBg: "#f0fdf4", iconBorder: "#86efac", btnBg: "#16a34a" },
    export:  { accent: "#2563eb", iconBg: "#eff6ff", iconBorder: "#93c5fd", btnBg: "#2563eb" },
    add:     { accent: "#2563eb", iconBg: "#eff6ff", iconBorder: "#93c5fd", btnBg: "#2563eb" },
    default: { accent: "#334155", iconBg: "#f8fafc", iconBorder: "#e2e8f0", btnBg: "#334155" },
  };

  const IconMap = {
    pay:    IC.Send,
    export: IC.Download,
    add:    IC.Plus,
  };

  const t = typeStyles[config.type] || typeStyles.default;
  const IconComp = IconMap[config.type] || IC.AlertCircle;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px", width: "360px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif",
      }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: t.iconBg, border: `1px solid ${t.iconBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "16px", color: t.accent,
        }}>
          <IconComp />
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>{config.title}</div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>{config.desc}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={() => { config.onConfirm(); onClose(); }} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: t.btnBg, fontSize: "13px", fontWeight: "700",
            color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>
            {config.confirmLabel || "Yes, Continue"}
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
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: "9px 18px", borderRadius: "10px", border: "none",
            background: "#ef4444", fontSize: "13px", fontWeight: "700",
            color: "#fff", cursor: "pointer", fontFamily: "inherit",
          }}>
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    paid:    { bg: "#f0fdf4", color: "#15803d", border: "#86efac", label: "Paid" },
    pending: { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Pending" },
  };
  const s = map[status] || map.pending;
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

// ── Add Payroll Modal ─────────────────────────────────────────────────────────
function AddPayrollModal({ period, onClose, onSave }) {
  const [form, setForm] = useState({ period });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!form.id_submission || !form.stipend_amount || !form.bank_name || !form.bank_account || !form.account_holder) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save payroll data.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    border: "1px solid #e2e8f0", borderRadius: "10px",
    fontSize: "13px", color: "#334155", background: "#f8fafc",
    outline: "none", fontFamily: "'Poppins','Segoe UI',sans-serif",
    boxSizing: "border-box",
  };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "5px" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px", width: "480px",
        maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        fontFamily: "'Poppins','Segoe UI',sans-serif",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" }}>Add Payroll</div>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>Input payroll data for intern</div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 12px", background: "#fff1f2", border: "1px solid #fca5a5",
            borderRadius: "10px", color: "#dc2626", fontSize: "12px", marginBottom: "14px",
          }}>
            <IC.AlertCircle /> {error}
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Submission ID</label>
          <input style={inputStyle} value={form.id_submission || ""}
            onChange={e => setForm({ ...form, id_submission: e.target.value })}
            placeholder="Submission ID of the accepted intern" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Stipend (Rp)</label>
            <input style={inputStyle} type="number" value={form.stipend_amount || ""}
              onChange={e => setForm({ ...form, stipend_amount: e.target.value })}
              placeholder="1500000" />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Bank Name</label>
            <input style={inputStyle} value={form.bank_name || ""}
              onChange={e => setForm({ ...form, bank_name: e.target.value })}
              placeholder="BCA, BNI, Mandiri..." />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Bank Account</label>
            <input style={inputStyle} value={form.bank_account || ""}
              onChange={e => setForm({ ...form, bank_account: e.target.value })}
              placeholder="1234567890" />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Account Holder</label>
            <input style={inputStyle} value={form.account_holder || ""}
              onChange={e => setForm({ ...form, account_holder: e.target.value })}
              placeholder="Name of account holder" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
          <button onClick={onClose} style={{
            padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "9px 20px", borderRadius: "10px", border: "none",
            background: "#2563eb", fontSize: "13px", fontWeight: "700",
            color: "#fff", cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving..." : "Save Payroll"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ data, onClose }) {
  if (!data) return null;

  const fields = [
    ["Position",       data.position],
    ["Program",        data.program],
    ["Stipend",        data.stipend_formatted],
    ["Period",         data.period],
    ["Bank",           data.bank_name],
    ["Account Number", data.bank_account],
    ["Account Holder", data.account_holder],
    ["Status",         data.status === "paid" ? "Paid" : "Pending"],
    ["Paid At",        data.paid_at ?? "-"],
  ];

  const statusColors = {
    paid:    { bg: "#f0fdf4", color: "#15803d" },
    pending: { bg: "#fefce8", color: "#92400e" },
  };
  const sc = statusColors[data.status] || statusColors.pending;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "28px", width: "480px",
        maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        fontFamily: "'Poppins','Segoe UI',sans-serif",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "#eff6ff", color: "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700", flexShrink: 0,
          }}>
            {(data.name || "?").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{data.name}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>{data.email}</div>
          </div>
          <span style={{
            marginLeft: "auto", padding: "4px 12px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "600",
            background: sc.bg, color: sc.color,
          }}>
            {data.status === "paid" ? "Paid" : "Pending"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "18px" }}>
          {fields.map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>{label}</div>
              <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: "500" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "22px" }}>
          <button onClick={onClose} style={{
            padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
            background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PayrollHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [data, setData]       = useState({ stats: {}, payrolls: [], period: "", user: {} });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState(new Date().toISOString().slice(0, 7));
  const [addModal, setAddModal]     = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");      
  const [tableLoading, setTableLoading] = useState(false); 

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const showConfirm = (config) => setConfirmModal(config);

  const fetchPayroll = (isSearch = false) => {
  if (isSearch) {
    setTableLoading(true);   // Loading hanya untuk tabel
  } else {
    setLoading(true);        // Loading untuk seluruh halaman
  }
  
  const params = new URLSearchParams();
  params.set("period", period);
  if (search) params.set("search", search);
  
  api(`/hr/payroll?${params}`)
    .then(res => setData(res.data))
    .finally(() => {
      setLoading(false);
      setTableLoading(false);
    });
};

  // Initial load (saat pertama kali buka halaman)
useEffect(() => { 
  fetchPayroll(); 
}, [period]);

// Search debounce (hanya loading tabel)
useEffect(() => {
  if (!loading) { 
    const timer = setTimeout(() => {
      fetchPayroll(true);  // ← true = search mode
    }, 500);
    return () => clearTimeout(timer);
  }
}, [search, period]); 

  const handlePay = (id) => {
    const intern = data.payrolls.find(p => p.id_payroll === id);
    showConfirm({
      type: "pay",
      title: "Confirm Payment?",
      desc: `Stipend ${intern?.stipend_formatted} will be transferred to ${intern?.name} (${intern?.bank_name} · ${intern?.bank_account}). This action cannot be undone.`,
      confirmLabel: "Yes, Pay Now",
      onConfirm: async () => {
        await api(`/hr/payroll/${id}/pay`, { method: "PATCH" });
        showToast(`Payment for ${intern?.name} processed successfully`, "success");
        fetchPayroll();
      },
    });
  };

  const handleExport = () => {
    showConfirm({
      type: "export",
      title: "Export CSV?",
      desc: `Data payroll periode ${period} will be downloaded as a CSV file.`,
      confirmLabel: "Yes, Export",
      onConfirm: async () => {
        try {
          const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
          const token = localStorage.getItem("hr_token") || localStorage.getItem("auth_token");
          const res = await fetch(`${BASE_URL}/hr/payroll/export?period=${period}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!res.ok) throw new Error(`Export failed: ${res.status}`);
          const blob = await res.blob();
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement("a");
          a.href = url; a.download = `payroll-${period}.csv`;
          document.body.appendChild(a); a.click(); a.remove();
          URL.revokeObjectURL(url);
          showToast("Export CSV successful", "info");
        } catch (err) {
          showToast("Failed to export CSV", "error");
          console.error(err);
        }
      },
    });
  };

  const handleAddSave = async (form) => {
    showConfirm({
      type: "add",
      title: "Add Payroll?",
      desc: `Data payroll for submission ID ${form.id_submission} with stipend Rp ${Number(form.stipend_amount).toLocaleString("id-ID")} will be saved.`,
      confirmLabel: "Yes, Save",
      onConfirm: async () => {
        await api("/hr/payroll", { method: "POST", body: JSON.stringify({ ...form, period }) });
        showToast("New Payroll successfully added", "success");
        fetchPayroll();
      },
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const statCards = [
    {
      icon: <IC.Users />, iconBg: "#eff6ff", iconColor: "#3b82f6",
      title: "Paid Interns",
      value: data.stats.paid_interns,
      sub: "Active paid program",
      barColors: ["#3b82f6","#60a5fa","#93c5fd","#3b82f6","#60a5fa","#93c5fd","#3b82f6"],
    },
    {
      icon: <IC.CheckCircle />, iconBg: "#f0fdf4", iconColor: "#16a34a",
      title: "Paid This Month",
      value: data.stats.paid_this_month,
      sub: "Transfer completed",
      badge: "Done", badgeBg: "#dcfce7", badgeColor: "#166534",
      barColors: ["#4ade80","#86efac","#4ade80","#86efac","#4ade80","#bbf7d0","#4ade80"],
    },
    {
      icon: <IC.Clock />, iconBg: "#fff7ed", iconColor: "#ea580c",
      title: "Pending Payment",
      value: data.stats.pending_payment,
      sub: "Needs to be processed",
      badge: "Pending", badgeBg: "#fef9c3", badgeColor: "#92400e",
      barColors: ["#fb923c","#fdba74","#fb923c","#fdba74","#fb923c","#fed7aa","#fb923c"],
    },
    {
      icon: <IC.DollarSign />, iconBg: "#f5f3ff", iconColor: "#7c3aed",
      title: "Total Disbursed",
      value: data.stats.total_disbursed_formatted,
      sub: "This month",
      barColors: ["#c084fc","#a855f7","#c084fc","#a855f7","#c084fc","#ddd6fe","#a855f7"],
    },
  ];

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
        .pr-fadein { animation: fadeIn 0.3s ease both; }
        .row-hover:hover { background: #f8fafc; }
        .btn-action:hover { background: #f1f5f9; }
        .btn-pay:hover { background: #dcfce7; }
      `}</style>

      <ToastContainer toasts={toasts} />
      <ConfirmModal config={confirmModal} onClose={() => setConfirmModal(null)} />
      {showLogoutModal && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />}
      {addModal && <AddPayrollModal period={period} onClose={() => setAddModal(false)} onSave={handleAddSave} />}
      <DetailModal data={detailModal} onClose={() => setDetailModal(null)} />

      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: "56px", background: "#fff", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Payroll</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Overview</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{todayStr()}</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }} className="pr-fadein">

          {/* Page heading */}
          <div style={{ marginBottom: "28px", textAlign: "left" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>Payroll</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Manage stipend and payment for paid internship participants.
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px", marginBottom: "28px",
          }}>
            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
          </div>

          {/* Table Card */}
          <div style={{
            background: "#fff", borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>

            {/* Card Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
              flexWrap: "wrap", gap: "12px",  
            }}>
              <div>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>Payroll List</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  Paid internship participants — {period}
                </p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
                
                <input
                  type="month"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  style={{
                    padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: "10px",
                    fontSize: "13px", color: "#334155", background: "#f8fafc",
                    outline: "none", fontFamily: "inherit", cursor: "pointer",
                  }}
                />
                <button
                  onClick={handleExport}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 16px", background: "#fff", color: "#334155",
                    border: "1px solid #e2e8f0", borderRadius: "10px",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <IC.Download /> Export CSV
                </button>
                <button
                  onClick={() => setAddModal(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 16px", background: "#2563eb", color: "#fff",
                    border: "none", borderRadius: "10px",
                    fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <IC.Plus /> Add Payroll
                </button>
              </div>
            </div>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1.4fr 1.2fr 1.6fr 0.8fr 0.8fr",
              gap: "12px", padding: "10px 24px",
              background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
            }}>
              {["INTERN", "POSITION", "PROGRAM", "STIPEND / MONTH", "BANK ACCOUNT", "STATUS", "ACTION"].map(h => (
                <span key={h} style={{ fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em" }}>{h}</span>
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
            ) : loading ? (
              <LoadingSpinner fullScreen={false} message="Loading payroll data..." />
            ) : data.payrolls.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                No payroll data for this period.
              </div>
            ) : (
              data.payrolls.map((p, i) => (
                <div
                  key={p.id_payroll}
                  className="row-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.2fr 1.4fr 1.2fr 1.6fr 0.8fr 0.8fr",
                    gap: "12px", padding: "14px 24px", alignItems: "center",
                    borderBottom: i < data.payrolls.length - 1 ? "1px solid #f8fafc" : "none",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Intern */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                      background: "#eff6ff", color: "#3b82f6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "700",
                    }}>
                      {(p.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{p.email}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#475569" }}>{p.position}</div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>{p.program}</div>
                  <div style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>{p.stipend_formatted}</div>

                  {/* Bank */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", color: "#475569" }}>
                    <IC.CreditCard />
                    <span>{p.bank_name} · {p.bank_account}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <StatusBadge status={p.status} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      className="btn-action"
                      onClick={() => setDetailModal(p)}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "5px 10px", borderRadius: "8px", fontSize: "12px",
                        fontWeight: "600", cursor: "pointer",
                        border: "1px solid #e2e8f0", background: "#fff", color: "#334155",
                        fontFamily: "inherit", transition: "background 0.15s",
                      }}
                    >
                      <IC.Eye />
                    </button>
                    {p.status === "pending" && (
                      <button
                        className="btn-pay"
                        onClick={() => handlePay(p.id_payroll)}
                        style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          padding: "5px 10px", borderRadius: "8px", fontSize: "12px",
                          fontWeight: "600", cursor: "pointer",
                          border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a",
                          fontFamily: "inherit", transition: "background 0.15s",
                        }}
                      >
                        <IC.Send />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}