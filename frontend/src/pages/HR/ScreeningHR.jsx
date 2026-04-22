import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
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
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  FileText: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  ChevronDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  RefreshCw: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
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
  XCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  Note: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Brain: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.66z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.66z" />
    </svg>
  ),
};

// ── helpers ───────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// ── Stat Card (matches Dashboard's StatCard exactly) ──────────────────────────
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  const colors = {
    success: { bg: "#dcfce7", border: "#86efac", color: "#166534" },
    error:   { bg: "#fee2e2", border: "#fca5a5", color: "#991b1b" },
    info:    { bg: "#dbeafe", border: "#93c5fd", color: "#1e40af" },
  };
  const icons = {
    success: <IC.Check />,
    error:   <IC.X />,
    info:    () => <span style={{ fontSize: "11px", fontWeight: 700 }}>i</span>,
  };
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999, pointerEvents: "none" }}>
      {toasts.map(toast => {
        const c = colors[toast.type] || colors.success;
        return (
          <div key={toast.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)", minWidth: "240px", maxWidth: "340px",
            animation: "fadeInToast 0.25s ease",
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
              {toast.type === "success" ? <IC.Check /> : toast.type === "error" ? <IC.X /> : "i"}
            </span>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}

// ── Confirm Modal (matches Dashboard's ConfirmModal style) ────────────────────
function ConfirmModal({ config, onClose }) {
  if (!config) return null;
  const typeMap = {
    pass:    { btnBg: "#16a34a" },
    reject:  { btnBg: "#ef4444" },
    save:    { btnBg: "#2563eb" },
    ai:      { btnBg: "#7c3aed" },
    default: { btnBg: "#334155" },
  };
  const t = typeMap[config.type] || typeMap.default;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>{config.title}</div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>{config.desc}</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button onClick={() => { config.onConfirm(); onClose(); }} style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: t.btnBg, color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
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
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "360px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Confirm Logout</div>
        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>Are you sure you want to log out of this session?</div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: "10px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Yes, Logout</button>
        </div>
      </div>
    </div>
  );
}

// ── Doc Cell ──────────────────────────────────────────────────────────────────
function DocCell({ has, submissionId, type }) {
  if (!has) return <span style={{ fontSize: "12px", color: "#cbd5e1" }}>—</span>;
  return (
    <button
      style={{ padding: "4px 10px", borderRadius: "7px", fontSize: "11.5px", fontWeight: "600", cursor: "pointer", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: "4px" }}
      onClick={() => api(`/hr/screening/${submissionId}/document/${type}`).then(res => window.open(res.url, "_blank"))}
    >
      <IC.FileText /> View
    </button>
  );
}

// ── Score Cell ────────────────────────────────────────────────────────────────
function ScoreCell({ ranking }) {
  if (!ranking) return <span style={{ fontSize: "12px", color: "#cbd5e1" }}>—</span>;
  const color = ranking.score >= 70 ? "#16a34a" : ranking.score >= 40 ? "#d97706" : "#dc2626";
  const bg    = ranking.score >= 70 ? "#f0fdf4" : ranking.score >= 40 ? "#fffbeb" : "#fff1f2";
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: bg, border: `1px solid ${color}22`, borderRadius: "8px", padding: "3px 8px", minWidth: "44px" }}>
      <span style={{ fontSize: "13px", fontWeight: "800", color, lineHeight: 1 }}>{ranking.score}</span>
      <span style={{ fontSize: "9px", color: "#94a3b8", marginTop: "1px" }}>#{ranking.rank}</span>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, hasCv }) {
  const cfg =
    status === "passed"
      ? { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "Passed" }
      : hasCv
        ? { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Pending" }
        : { bg: "#fff1f2", color: "#be123c", border: "#fecdd3", label: "Incomplete" };
  return (
    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

// ── AI Check Modal ────────────────────────────────────────────────────────────
function AiModal({ aiModal, onClose }) {
  if (!aiModal) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "2px" }}>AI Screening Result</div>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "18px" }}>{aiModal.name} — {aiModal.position}</div>

        {aiModal.error ? (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#be123c", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
              <IC.X /> Error
            </div>
            <div style={{ fontSize: "13px", color: "#991b1b" }}>{aiModal.error}</div>
          </div>
        ) : (
          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "12px", padding: "16px", marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
              <IC.Sparkles /> AI Analysis
            </div>
            {aiModal.loading ? (
              <div style={{ fontSize: "13px", color: "#6d28d9" }}>Analyzing candidate...</div>
            ) : (
              <>
                <div style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{aiModal.result?.summary || "No summary available"}</div>
                {aiModal.result?.strengths?.length > 0 && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "3px" }}>
                    {aiModal.result.strengths.map((str, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "#166534", display: "flex", alignItems: "center", gap: "5px" }}>
                        <IC.Check /> {str}
                      </div>
                    ))}
                  </div>
                )}
                {aiModal.result?.concern && (
                  <div style={{ fontSize: "12px", color: "#991b1b", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <IC.AlertTriangle /> {aiModal.result.concern}
                  </div>
                )}
                <div style={{ marginTop: "12px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                    background: aiModal.result?.recommend ? "#dcfce7" : "#fee2e2",
                    color: aiModal.result?.recommend ? "#166534" : "#991b1b",
                  }}>
                    {aiModal.result?.recommend ? <IC.Check /> : <IC.X />}
                    {aiModal.result?.recommend ? "Recommended to proceed" : "Not recommended"}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>AI analysis is advisory only.</div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ScreeningHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [data, setData] = useState({ stats: {}, candidates: [], user: {} });
  const [loading, setLoading]                 = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [aiModal, setAiModal] = useState(null);
  const [aiRanking, setAiRanking] = useState(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [search, setSearch]           = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [filterPosition, setFilterPosition] = useState("All Positions");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);

  // ── helpers ───────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const showConfirm = (config) => setConfirmModal(config);

  const fetchScreening = (isSearch = false) => {
    if (isSearch) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    api(`/hr/screening?${params}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Fetch error:", err))
      .finally(() => {
        setLoading(false);
        setTableLoading(false);
      });
  };

  useEffect(() => { fetchScreening(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchScreening(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilterDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const handlePass = (id) => {
    const candidate = data.candidates.find(c => c.id_submission === id);
    showConfirm({
      type: "pass",
      title: "Pass Candidate?",
      desc: `${candidate?.name} will be proceed to the Interview stage.`,
      confirmLabel: "Yes, Pass",
      onConfirm: async () => {
        await api(`/hr/screening/${id}/pass`, { method: "PATCH" });
        showToast(`${candidate?.name} has been passed to Interview`, "success");
        fetchScreening();
      },
    });
  };

  const handleReject = (id) => {
    const candidate = data.candidates.find(c => c.id_submission === id);
    showConfirm({
      type: "reject",
      title: "Reject Candidate?",
      desc: `${candidate?.name} will be rejected at the screening stage. This action cannot be undone.`,
      confirmLabel: "Yes, Reject",
      onConfirm: async () => {
        await api(`/hr/screening/${id}/reject`, { method: "PATCH" });
        showToast(`${candidate?.name} has been rejected`, "error");
        fetchScreening();
      },
    });
  };

  const handleSaveNotes = () => {
    if (!selectedId) return;
    const candidate = data.candidates.find(c => c.id_submission === selectedId);
    showConfirm({
      type: "save",
      title: "Save Notes?",
      desc: `Notes for ${candidate?.name} will be saved.`,
      confirmLabel: "Yes, Save",
      onConfirm: async () => {
        setSaving(true);
        await api(`/hr/screening/${selectedId}/notes`, {
          method: "POST",
          body: JSON.stringify({ notes }),
        });
        setSaving(false);
        showToast("Notes saved successfully", "success");
        fetchScreening();
      },
    });
  };

  const handleAiCheck = async (candidate) => {
    showToast("AI check is currently unavailable. Please try again later.", "error");
    setAiModal({ ...candidate, loading: true, result: null, error: null });
    try {
      const res = await api(`/hr/screening/${candidate.id_submission}/ai-check`, { method: "POST" });
      if (res.success) {
        setAiModal(prev => ({ ...prev, loading: false, result: res.result }));
      } else {
        setAiModal(prev => ({ ...prev, loading: false, error: res.message || "AI check failed" }));
      }
    } catch (err) {
      setAiModal(prev => ({ ...prev, loading: false, error: err.message || "Error analyzing candidate" }));
    }
  };

  const handleAiRank = async () => {
    setRankLoading(true);
    try {
      const res = await api("/hr/screening/ai-rank", { method: "POST" });
      if (res.success) {
        const map = {};
        res.rankings.forEach((r, idx) => { map[r.id] = { score: r.score, rank: idx + 1 }; });
        setAiRanking(map);
        showToast(`${res.rankings.length} candidates successfully ranked by AI`, "success");
      }
    } catch {
      showToast("Failed to rank candidates", "error");
    } finally {
      setRankLoading(false);
    }
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const allPositions = ["All Positions", ...new Set(data.candidates.map(c => c.position))];

  const filtered = (
    filterPosition === "All Positions"
      ? data.candidates
      : data.candidates.filter(k => k.position === filterPosition)
  ).sort((a, b) => {
    if (!aiRanking) return 0;
    return (aiRanking[b.id_submission]?.score ?? -1) - (aiRanking[a.id_submission]?.score ?? -1);
  });

  const statCards = [
    {
      icon: <IC.Clock />, iconBg: "#fffbeb", iconColor: "#d97706",
      title: "Needs Review", value: data.stats.needs_review,
      sub: "Awaiting screening",
      barColors: ["#fbbf24", "#fcd34d", "#fbbf24", "#fcd34d", "#fbbf24", "#fde68a", "#fbbf24"],
    },
    {
      icon: <IC.CheckCircle />, iconBg: "#f0fdf4", iconColor: "#16a34a",
      title: "Passed to Interview", value: data.stats.passed,
      sub: "Cleared screening",
      barColors: ["#4ade80", "#86efac", "#4ade80", "#86efac", "#4ade80", "#bbf7d0", "#4ade80"],
    },
    {
      icon: <IC.XCircle />, iconBg: "#fff1f2", iconColor: "#dc2626",
      title: "Rejected at Screening", value: data.stats.rejected,
      sub: "Did not qualify",
      barColors: ["#f87171", "#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fecdd3", "#f87171"],
    },
  ];

  if (loading) return <LoadingSpinner message="Loading screening data..." />;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInToast { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .screening-fadein { animation: fadeIn 0.3s ease both; }
        .trow:hover td { background: #f8fafc !important; }
        .trow td { transition: background 0.12s; }
      `}</style>

      {showLogoutModal && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />}
      <ToastContainer toasts={toasts} />
      <ConfirmModal config={confirmModal} onClose={() => setConfirmModal(null)} />
      <AiModal aiModal={aiModal} onClose={() => setAiModal(null)} />

      {/* Sidebar */}
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar — identical structure to Dashboard */}
        <header style={{ height: "56px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 28px", gap: "16px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Screening</span>
            <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>Candidate Review</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{todayStr()}</span>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }} className="screening-fadein">

          {/* Page heading */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2, textAlign: "left" }}>
              Screening
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              Review candidate documents before proceeding to interview.
            </div>
          </div>

          {/* Stat Cards — same grid as Dashboard */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginBottom: "24px" }}>
            {statCards.map((card, i) => <StatCard key={i} {...card} />)}
          </div>

          {/* Bottom row: table + sidebar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

            {/* ── Screening Table ── */}
            <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, textAlign: "left" }}>Screening Queue</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{filtered.length} candidates need review</p>
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "7px 14px", width: "200px" }}>
                  <IC.Search />
                  <input
                    placeholder="Search candidates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit" }}
                  />
                </div>
                  {/* AI Rank */}
                  <button
                    onClick={handleAiRank}
                    disabled={rankLoading}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "7px 14px", borderRadius: "10px", border: "1px solid #ddd6fe",
                      background: "#f5f3ff", color: "#7c3aed", fontSize: "12.5px", fontWeight: "600",
                      cursor: rankLoading ? "not-allowed" : "pointer", opacity: rankLoading ? 0.6 : 1,
                      fontFamily: "inherit",
                    }}
                  >
                    <IC.Sparkles />
                    {rankLoading ? "Ranking..." : aiRanking ? "Re-Rank" : "Rank by AI"}
                  </button>

                  {/* Reset ranking */}
                  {aiRanking && (
                    <button
                      onClick={() => { setAiRanking(null); showToast("Ranking reset", "info"); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <IC.RefreshCw /> Reset
                    </button>
                  )}

                  {/* Filter dropdown */}
                  <div ref={filterRef} style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowFilterDropdown(v => !v)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "12.5px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {filterPosition} <IC.ChevronDown />
                    </button>
                    {showFilterDropdown && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: "170px", zIndex: 100, padding: "6px 0" }}>
                        {allPositions.map(pos => (
                          <button key={pos}
                            onClick={() => { setFilterPosition(pos); setShowFilterDropdown(false); }}
                            style={{
                              display: "block", width: "100%", padding: "8px 16px", fontSize: "13px",
                              color: filterPosition === pos ? "#2563eb" : "#334155",
                              background: filterPosition === pos ? "#eff6ff" : "transparent",
                              border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                              fontWeight: filterPosition === pos ? "600" : "400",
                            }}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                  <col style={{ width: "15%" }} />  {/* CANDIDATE */}
                  <col style={{ width: "10%" }} />  {/* POSITION */}
                  <col style={{ width: "7%" }} />   {/* CV */}
                  <col style={{ width: "9%" }} />   {/* COVER LETTER */}
                  <col style={{ width: "12%" }} />  {/* RECOMMENDATION */}
                  <col style={{ width: "8%" }} />   {/* PORTFOLIO */}
                  <col style={{ width: "9%" }} />   {/* AI CHECK */}
                  <col style={{ width: "6%" }} />   {/* SCORE */}
                  <col style={{ width: "10%" }} />  {/* STATUS */}
                  <col style={{ width: "8%" }} />   {/* ACTION - perkecil jadi 8% */}
                </colgroup>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {["CANDIDATE", "POSITION", "CV / RESUME", "COVER LETTER", "RECOMMENDATION", "PORTFOLIO", "AI CHECK", "SCORE", "STATUS", "ACTION"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "center", fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableLoading ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                        <div style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        <div style={{ marginTop: "10px" }}>Searching...</div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                        No candidates found.
                      </td>
                    </tr>
                  ) : filtered.map((k) => (
                      <tr key={k.id_submission} className="trow">
                        {/* CANDIDATE */}
                        <td style={{ padding: "13px 14px", fontSize: "12px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0, background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                              {(k.name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "12.5px", display: "block" }}>{k.name}</span>
                              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" }}>{k.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* POSITION */}
                        <td style={{ padding: "13px 14px", fontSize: "12px", color: "#475569", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>{k.position}</td>

                        {/* CV */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <DocCell has={k.has_cv} submissionId={k.id_submission} type="cv" />
                        </td>

                        {/* COVER LETTER */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <DocCell has={k.has_cover_letter} submissionId={k.id_submission} type="cover_letter" />
                        </td>

                        {/* RECOMMENDATION */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <DocCell has={k.has_institution_letter} submissionId={k.id_submission} type="institution_letter" />
                        </td>

                        {/* PORTFOLIO */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <DocCell has={k.has_portfolio} submissionId={k.id_submission} type="portfolio" />
                        </td>

                        {/* AI CHECK */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <button
                            disabled={!k.has_cv}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              padding: "4px 10px", borderRadius: "7px", fontSize: "11.5px", fontWeight: "600",
                              cursor: !k.has_cv ? "not-allowed" : "pointer",
                              border: "1px solid #ddd6fe", background: "#f5f3ff", color: "#7c3aed",
                              opacity: !k.has_cv ? 0.4 : 1, fontFamily: "inherit",
                            }}
                            onClick={() => {
                              if (!k.has_cv) return;
                              showConfirm({
                                type: "ai",
                                title: "Running AI Check?",
                                desc: `AI will analyze the CV of ${k.name} for the position of ${k.position}.`,
                                confirmLabel: "Yes, Analyze",
                                onConfirm: () => handleAiCheck(k),
                              });
                            }}
                          >
                            <IC.Sparkles /> Check
                          </button>
                        </td>

                        {/* SCORE */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <ScoreCell ranking={aiRanking?.[k.id_submission]} />
                        </td>

                        {/* STATUS */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                          <StatusBadge status={k.screening_status} hasCv={k.has_cv} />
                        </td>

                        {/* ACTION */}
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                            {k.has_cv && (
                              <IconActionBtn 
                                icon={<IC.Check />} 
                                variant="green" 
                                onClick={() => handlePass(k.id_submission)}
                                title="Pass candidate"
                              />
                            )}
                            <IconActionBtn 
                              icon={<IC.X />} 
                              variant="red" 
                              onClick={() => handleReject(k.id_submission)}
                              title="Reject candidate"
                            />
                          </div>
                        </td>
                        </tr>
                        ))}
                        </tbody>
                        </table>
                        </div>
                        </div>

            {/* ── Right: HR Notes panel ── */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px", alignSelf: "start" }}>
              <div>
                <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "0 0 2px", textAlign: "left", display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ color: "#3b82f6" }}><IC.Note /></span> HR Notes
                </p>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>Attach notes to a candidate</p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Candidate</label>
                <select
                  value={selectedId || ""}
                  onChange={e => setSelectedId(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "12.5px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}
                >
                  <option value="">Select candidate…</option>
                  {data.candidates.map(k => (
                    <option key={k.id_submission} value={k.id_submission}>
                      {k.name} — {k.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Write screening notes..."
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "12.5px", color: "#334155", background: "#f8fafc", outline: "none", resize: "vertical", minHeight: "100px", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              <button
                onClick={handleSaveNotes}
                disabled={saving || !selectedId}
                style={{
                  width: "100%", padding: "10px", borderRadius: "10px", border: "none",
                  background: saving || !selectedId ? "#93c5fd" : "#2563eb",
                  color: "#fff", fontSize: "13px", fontWeight: "700", cursor: saving || !selectedId ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Action Button helper (identical to Dashboard's ActionBtn) ─────────────────
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
        background: hov ? v.border : v.bg, color: v.color,
        whiteSpace: "nowrap", fontFamily: "'Poppins','Segoe UI',sans-serif",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ── Icon Action Button ─────────────────────────────────────
function IconActionBtn({ icon, variant = "blue", onClick, disabled, title }) {
  const v = VARIANT[variant];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={title}
      style={{
        width: "32px", height: "32px", padding: 0,
        borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${v.border}`,
        background: disabled ? "#f1f5f9" : hov ? v.border : v.bg,
        color: disabled ? "#94a3b8" : v.color,
        fontFamily: "'Poppins','Segoe UI',sans-serif",
        transition: "all 0.15s",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
    </button>
  );
}