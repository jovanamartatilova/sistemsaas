import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import SidebarHR from "../../components/SidebarHR";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Check: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

// ── Constants ─────────────────────────────────────────────────────────────────
const resultOptions = [
  { value: "pending",  label: "Pending",  bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
  { value: "continue", label: "Continue", bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  { value: "accepted", label: "Accepted", bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  { value: "rejected", label: "Rejected", bg: "#fff1f2", color: "#be123c", dot: "#ef4444" },
];

const mediaOptions = ["Google Meet", "Zoom", "Microsoft Teams", "Offline"];

function todayStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  const colors = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#15803d" },
    error:   { bg: "#fff1f2", border: "#fca5a5", color: "#be123c" },
    info:    { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  };
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999, pointerEvents: "none" }}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.success;
        return (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            padding: "12px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", minWidth: "240px", maxWidth: "340px",
            fontFamily: "'Poppins','Segoe UI',sans-serif",
            animation: "toastIn 0.25s ease",
          }}>
            <span style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: c.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <IC.Check />
            </span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

// ── Stat Card (sama persis style dashboard) ───────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, barColors, badge, badgeBg, badgeColor }) {
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
            fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px",
            background: badgeBg, color: badgeColor,
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
          <button onClick={onCancel} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Result Select ─────────────────────────────────────────────────────────────
function ResultSelect({ value, onChange }) {
  const opt = resultOptions.find(o => o.value === value) || resultOptions[0];
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          padding: "4px 28px 4px 10px",
          borderRadius: "20px",
          fontSize: "11.5px",
          fontWeight: 600,
          border: `1px solid ${opt.dot}33`,
          background: opt.bg,
          color: opt.color,
          cursor: "pointer",
          outline: "none",
          fontFamily: "'Poppins','Segoe UI',sans-serif",
        }}
      >
        {resultOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: "absolute", right: "8px", pointerEvents: "none", color: opt.color, display: "flex" }}>
        <IC.ChevronDown />
      </span>
    </div>
  );
}

// ── Modal shared styles ───────────────────────────────────────────────────────
const mStyle = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" },
  box: { background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif", maxHeight: "90vh", overflowY: "auto" },
  title: { fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  subtitle: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "'Poppins','Segoe UI',sans-serif", boxSizing: "border-box" },
  select: { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "'Poppins','Segoe UI',sans-serif", boxSizing: "border-box" },
  field: { marginBottom: "14px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  footer: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" },
  btnCancel: { padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" },
  btnSave: { padding: "9px 18px", borderRadius: "10px", border: "none", background: "#2563eb", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" },
  errorBox: { display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", color: "#be123c", fontSize: "12px", marginBottom: "14px" },
  hint: { fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" },
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ form, setForm, onSave, onClose, saving }) {
  return (
    <div style={mStyle.overlay} onClick={onClose}>
      <div style={mStyle.box} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={mStyle.title}>Edit Interview Schedule</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{form.candidate_name} — {form.position}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px", display: "flex" }}>
            <IC.X />
          </button>
        </div>

        <div style={mStyle.row}>
          <div style={mStyle.field}>
            <label style={mStyle.label}>Date</label>
            <input style={mStyle.input} type="date" value={form.interview_date || ""}
              onChange={e => setForm({ ...form, interview_date: e.target.value })} />
          </div>
          <div style={mStyle.field}>
            <label style={mStyle.label}>Time</label>
            <input style={mStyle.input} type="time" value={form.interview_time || ""}
              onChange={e => setForm({ ...form, interview_time: e.target.value })} />
          </div>
        </div>

        <div style={mStyle.field}>
          <label style={mStyle.label}>Interviewer</label>
          <input style={{ ...mStyle.input, background: "#f1f5f9", cursor: "not-allowed", color: "#94a3b8" }}
            value={form.interviewer || ""} disabled placeholder="Interviewer name" />
          <span style={mStyle.hint}>Set at time of scheduling</span>
        </div>

        <div style={mStyle.field}>
          <label style={mStyle.label}>Media</label>
          <select style={mStyle.select} value={form.media || ""}
            onChange={e => setForm({ ...form, media: e.target.value })}>
            {mediaOptions.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {form.media !== "Offline" && (
          <div style={mStyle.field}>
            <label style={mStyle.label}>{form.media} Link</label>
            <input style={mStyle.input} value={form.link || ""}
              onChange={e => setForm({ ...form, link: e.target.value })}
              placeholder={`Paste ${form.media} link here...`} />
          </div>
        )}

        <div style={mStyle.field}>
          <label style={mStyle.label}>Notes (optional)</label>
          <textarea style={{ ...mStyle.input, minHeight: "72px", resize: "vertical" }}
            value={form.notes || ""}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Additional notes..." />
        </div>

        <div style={mStyle.footer}>
          <button style={mStyle.btnCancel} onClick={onClose}>Cancel</button>
          <button style={{ ...mStyle.btnSave, opacity: saving ? 0.7 : 1 }} onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Modal ─────────────────────────────────────────────────────────────────
function AddModal({ form, setForm, onSave, onClose, saving, error }) {
  return (
    <div style={mStyle.overlay} onClick={onClose}>
      <div style={mStyle.box} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={mStyle.title}>Add Interview Schedule</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Enter data for new interview schedule</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "2px", display: "flex" }}>
            <IC.X />
          </button>
        </div>

        {error && (
          <div style={mStyle.errorBox}>
            <IC.AlertCircle />
            {error}
          </div>
        )}

        <div style={mStyle.field}>
          <label style={mStyle.label}>Submission ID</label>
          <input
            style={{ ...mStyle.input, ...(form.id_submission ? { background: "#f1f5f9", cursor: "not-allowed", color: "#94a3b8" } : {}) }}
            value={form.id_submission || ""}
            onChange={e => !form.id_submission && setForm({ ...form, id_submission: e.target.value })}
            disabled={!!form.id_submission}
            placeholder="Candidate ID submission (from Screening page)"
          />
          <span style={mStyle.hint}>
            {form.id_submission ? "Candidate selected" : "Click 'Schedule Interview' from candidate list above"}
          </span>
        </div>

        <div style={mStyle.row}>
          <div style={mStyle.field}>
            <label style={mStyle.label}>Date</label>
            <input style={mStyle.input} type="date"
              value={form.interview_date || ""}
              onChange={e => setForm({ ...form, interview_date: e.target.value })} />
          </div>
          <div style={mStyle.field}>
            <label style={mStyle.label}>Time</label>
            <input style={mStyle.input} type="time"
              value={form.interview_time || ""}
              onChange={e => setForm({ ...form, interview_time: e.target.value })} />
          </div>
        </div>

        <div style={mStyle.field}>
          <label style={mStyle.label}>Media</label>
          <select style={mStyle.select}
            value={form.media || "Google Meet"}
            onChange={e => setForm({ ...form, media: e.target.value, link: "" })}>
            {mediaOptions.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {(form.media || "Google Meet") !== "Offline" && (
          <div style={mStyle.field}>
            <label style={mStyle.label}>{form.media || "Google Meet"} Link</label>
            <input style={mStyle.input}
              value={form.link || ""}
              onChange={e => setForm({ ...form, link: e.target.value })}
              placeholder={`Paste ${form.media || "Google Meet"} link here...`} />
          </div>
        )}

        <div style={mStyle.field}>
          <label style={mStyle.label}>Notes (optional)</label>
          <textarea style={{ ...mStyle.input, minHeight: "72px", resize: "vertical" }}
            value={form.notes || ""}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Additional notes..." />
        </div>

        <div style={mStyle.footer}>
          <button style={mStyle.btnCancel} onClick={onClose}>Cancel</button>
          <button style={{ ...mStyle.btnSave, opacity: saving ? 0.7 : 1 }} onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InterviewHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [showLogout, setShowLogout] = useState(false);
  const [data, setData]             = useState({ stats: {}, interviews: [], ready_for_interview: [], user: {} });
  const [loading, setLoading]       = useState(true);
  const [editModal, setEditModal]   = useState(null);
  const [addModal, setAddModal]     = useState(false);
  const [form, setForm]             = useState({});
  const [addForm, setAddForm]       = useState({});
  const [addError, setAddError]     = useState("");
  const [saving, setSaving]         = useState(false);
  const [toasts, setToasts]         = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const fetchInterviews = () => {
    api("/hr/interviews")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterviews(); }, []);

  const openEdit = (row) => { setForm({ ...row }); setEditModal(row.id_interview); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api(`/hr/interviews/${form.id_interview}`, {
        method: "PATCH",
        body: JSON.stringify({
          interview_date: form.interview_date,
          interview_time: form.interview_time,
          media:          form.media,
          link:           form.link || null,
          notes:          form.notes || null,
        }),
      });
      setEditModal(null);
      showToast("Interview schedule updated successfully.");
      fetchInterviews();
    } finally {
      setSaving(false);
    }
  };

  const handleResultChange = async (id, value) => {
    await api(`/hr/interviews/${id}/result`, {
      method: "PATCH",
      body: JSON.stringify({ result: value }),
    });
    const label = resultOptions.find(o => o.value === value)?.label || value;
    showToast(`Interview result updated to "${label}"`);
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
      await api("/hr/interviews", {
        method: "POST",
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
      showToast("Interview schedule added successfully.");
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

  const statCards = [
    {
      icon: <IC.Calendar />, iconBg: "#eff6ff", iconColor: "#3b82f6",
      title: "Today's Interviews", value: data.stats.today,
      sub: "Schedule confirmed",
      badge: "Today", badgeBg: "#dcfce7", badgeColor: "#15803d",
      barColors: ["#3b82f6","#60a5fa","#93c5fd","#3b82f6","#60a5fa","#93c5fd","#3b82f6"],
    },
    {
      icon: <IC.Clock />, iconBg: "#fff7ed", iconColor: "#ea580c",
      title: "Pending Schedule", value: data.stats.pending,
      sub: "Need to be scheduled",
      barColors: ["#fb923c","#fdba74","#fb923c","#fdba74","#fb923c","#fed7aa","#fb923c"],
    },
    {
      icon: <IC.CheckCircle />, iconBg: "#f0fdf4", iconColor: "#16a34a",
      title: "Completed", value: data.stats.completed,
      sub: "Decision made",
      barColors: ["#4ade80","#86efac","#4ade80","#86efac","#4ade80","#bbf7d0","#4ade80"],
    },
    {
      icon: <IC.Users />, iconBg: "#f5f3ff", iconColor: "#7c3aed",
      title: "Ready for Schedule", value: data.stats.ready_for_schedule,
      sub: "Passed screening",
      barColors: ["#c084fc","#a855f7","#c084fc","#a855f7","#c084fc","#ddd6fe","#a855f7"],
    },
  ];

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", alignItems: "center", justifyContent: "center", fontFamily: "'Poppins','Segoe UI',sans-serif", color: "#94a3b8", fontSize: "14px" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins','Segoe UI',sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .interview-fadein { animation: fadeIn 0.3s ease both; }
        .row-hover:hover { background: #f8fafc !important; }
        .btn-action:hover { background: #f1f5f9 !important; }
      `}</style>

      <ToastContainer toasts={toasts} />

      {/* Sidebar — imported component */}
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
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Interview</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Schedule & Results</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
            padding: "7px 14px", width: "220px",
          }}>
            <IC.Search />
            <input
              placeholder="Search candidates..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit" }}
            />
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{todayStr()}</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }} className="interview-fadein">

          {/* Heading */}
          <div style={{ marginBottom: "28px", textAlign: "left" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
              Interview
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Schedule and results of candidate interviews.
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "24px" }}>
            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
          </div>

          {/* Ready for Interview */}
          {data.ready_for_interview && data.ready_for_interview.length > 0 && (
            <div style={{
              background: "#fff", borderRadius: "16px", overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: "20px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
              }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>
                    Ready for Interview Scheduling
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Candidates who passed screening</p>
                </div>
              </div>

              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr",
                gap: "12px", padding: "10px 24px",
                background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
              }}>
                {["CANDIDATE", "POSITION", "PASSED ON", "ACTION"].map(h => (
                  <span key={h} style={{ fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>

              {data.ready_for_interview.map((c, i) => (
                <div
                  key={i}
                  className="row-hover"
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 1.5fr",
                    gap: "12px", padding: "14px 24px", alignItems: "center",
                    borderBottom: i < data.ready_for_interview.length - 1 ? "1px solid #f8fafc" : "none",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                      background: "#eff6ff", color: "#3b82f6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "700",
                    }}>
                      {(c.candidate_name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{c.candidate_name}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>{c.position}</div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    {new Date(c.submitted_at).toLocaleDateString("en-GB")}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setAddForm({ id_submission: c.id_submission, media: "Google Meet" });
                        setAddError("");
                        setAddModal(true);
                      }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "7px 14px", borderRadius: "10px", border: "none",
                        background: "#2563eb", color: "#fff", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <IC.Plus />
                      Schedule Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interview Schedule Table */}
          <div style={{
            background: "#fff", borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
            }}>
              <div>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>
                  Interview Schedule
                </p>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>All scheduled interview sessions</p>
              </div>
              <button
                onClick={() => { setAddForm({ media: "Google Meet" }); setAddError(""); setAddModal(true); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px", border: "none",
                  background: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <IC.Plus />
                Add Schedule
              </button>
            </div>

            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1.4fr 1.5fr 1.2fr 1fr 1.3fr 1.4fr",
              gap: "12px", padding: "10px 24px",
              background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
            }}>
              {["CANDIDATE", "POSITION", "DATE & TIME", "INTERVIEWER", "MEDIA", "RESULT", "ACTION"].map(h => (
                <span key={h} style={{ fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>

            {data.interviews.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                No interviews scheduled yet.
              </div>
            ) : (
              data.interviews.map((j, i) => (
                <div
                  key={j.id_interview}
                  className="row-hover"
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1.4fr 1.5fr 1.2fr 1fr 1.3fr 1.4fr",
                    gap: "12px", padding: "14px 24px", alignItems: "center",
                    borderBottom: i < data.interviews.length - 1 ? "1px solid #f8fafc" : "none",
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
                      {(j.candidate_name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{j.candidate_name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{j.position}</div>
                    </div>
                  </div>

                  {/* Position */}
                  <div style={{ fontSize: "13px", color: "#475569" }}>{j.position}</div>

                  {/* Date & Time */}
                  <div>
                    <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 500 }}>{j.interview_date}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{j.interview_time}</div>
                  </div>

                  {/* Interviewer */}
                  <div style={{ fontSize: "13px", color: "#475569" }}>{j.interviewer}</div>

                  {/* Media */}
                  <div>
                    <span style={{
                      display: "inline-flex", padding: "3px 9px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: 600,
                      background: "#f1f5f9", color: "#475569",
                      border: "1px solid #e2e8f0",
                    }}>
                      {j.media}
                    </span>
                  </div>

                  {/* Result */}
                  <div>
                    <ResultSelect value={j.result} onChange={val => handleResultChange(j.id_interview, val)} />
                  </div>

                  {/* Action */}
                  <div>
                    <button
                      className="btn-action"
                      onClick={() => openEdit(j)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "6px 12px", borderRadius: "8px",
                        border: "1px solid #e2e8f0", background: "#fff",
                        color: "#475569", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "background 0.15s",
                      }}
                    >
                      <IC.Edit />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}

      {editModal && (
        <EditModal
          form={form}
          setForm={setForm}
          onSave={saveEdit}
          onClose={() => setEditModal(null)}
          saving={saving}
        />
      )}

      {addModal && (
        <AddModal
          form={addForm}
          setForm={setAddForm}
          onSave={handleAddSchedule}
          onClose={() => setAddModal(false)}
          saving={saving}
          error={addError}
        />
      )}
    </div>
  );
}