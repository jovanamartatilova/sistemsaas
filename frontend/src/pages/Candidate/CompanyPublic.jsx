import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
};

// ── Icons ─────────────────────────────────────────────────────────
const Icon = {
  location: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  mail: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  calendar: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  clock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  dashboard: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  bulb: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  award: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  send: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  target: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  rocket: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  handshake: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
  ),
};

// ── AnimatedCounter ───────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setCount(0); return; }
    const stepTime = Math.max(duration / end, 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count}</span>;
}

// ── StatCard ──────────────────────
function StatCard({ icon, label, value, sub, color, barColors }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "16px", padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column", gap: "4px",
      alignItems: "center",  // ← tambah ini biar semua item center
      textAlign: "center",   // ← tambah ini biar teks center
    }}>
      <div style={{
        width: "38px", height: "38px", borderRadius: "10px",
        background: `${color}15`, display: "flex", alignItems: "center",
        justifyContent: "center", color: color,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", letterSpacing: "-1px", marginTop: "10px" }}>
        <AnimatedCounter value={value} />
      </div>
      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{label}</div>
      {barColors && (
        <div style={{ display: "flex", gap: "3px", marginTop: "10px", alignItems: "flex-end", height: "26px", width: "100%" }}>
          {barColors.map((c, i) => (
            <div key={i} style={{
              flex: 1, background: c, borderRadius: "3px 3px 0 0",
              height: `${28 + Math.sin(i * 1.4) * 18}%`, opacity: 0.45, minHeight: "4px",
            }} />
          ))}
        </div>
      )}
      {sub && <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

// ── Chip ──────────────────────────────────────────────────────────
function Chip({ label, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8,
      background: `${color}12`, color, border: `1px solid ${color}25`,
      textTransform: "capitalize",
    }}>{label}</span>
  );
}

// ── PositionCard ──────────────────────────────────────────────────
function PositionCard({ position, onClick }) {
  const [hov, setHov] = useState(false);
  const vacancy = position.vacancy;
  return (
    <div
      onClick={() => onClick(position)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: hov ? "1.5px solid #2d7ff3" : "1.5px solid #e2e8f0",
        boxShadow: hov ? "0 8px 32px rgba(45,127,243,0.14)" : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer", transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        display: "flex", flexDirection: "column",
      }}
    >
      <div style={{
        height: 130,
        background: vacancy.photo
          ? `url(http://127.0.0.1:8000/storage/${vacancy.photo}) center/cover`
          : "linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)",
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {!vacancy.photo && (
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#2d7ff320", border: "1.5px solid #2d7ff340", display: "flex", alignItems: "center", justifyContent: "center", color: "#2d7ff3" }}>
            {Icon.briefcase}
          </div>
        )}
        <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: 20, letterSpacing: "0.05em" }}>
          ● OPEN
        </span>
      </div>

      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a", fontFamily: "'Poppins',sans-serif" }}>{position.name}</h3>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{vacancy.title} · Batch {vacancy.batch}</p>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#2d7ff3", background: "#eff6ff", padding: "2px 8px", borderRadius: 6, alignSelf: "flex-start", marginTop: 2 }}>
          {position.pivot?.quota || 0} Quota
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5, color: "#94a3b8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#94a3b8" }}>{Icon.calendar}</span>
            {formatDate(vacancy.start_date || vacancy.deadline)} – {formatDate(vacancy.end_date || vacancy.deadline)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444", fontWeight: 600 }}>
            <span style={{ color: "#ef4444" }}>{Icon.clock}</span>
            Closes: {formatDate(vacancy.deadline)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PositionDetailModal ───────────────────────────────────────────
const PositionDetailModal = ({ position, slug, isAuthenticated, onClose }) => {
  if (!position) return null;
  const navigate = useNavigate();
  const vacancy = position.vacancy;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 60px rgba(0,0,0,0.18)", border: "1px solid #e2e8f0" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#64748b" }}>
          {Icon.close}
        </button>
        <div style={{ width: "100%", height: 200, background: vacancy.photo ? `url(http://127.0.0.1:8000/storage/${vacancy.photo}) center/cover` : "linear-gradient(135deg,#1a5fc4,#38bdf8)", borderRadius: "24px 24px 0 0" }} />
        <div style={{ padding: "28px 32px 32px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#2d7ff3", background: "#eff6ff", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 12 }}>
            {vacancy.title} · Batch {vacancy.batch}
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 20px", fontFamily: "'Poppins',sans-serif" }}>{position.name}</h2>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#334155", margin: "0 0 8px" }}>Program Description</h4>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{vacancy.description}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, padding: 18, background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569" }}>
              <span style={{ color: "#2d7ff3" }}>{Icon.location}</span>
              {vacancy.location || "Jakarta"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#475569" }}>
              <span style={{ color: "#2d7ff3" }}>{Icon.calendar}</span>
              {formatDate(vacancy.start_date || vacancy.deadline)} – {formatDate(vacancy.end_date || vacancy.deadline)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#ef4444", fontWeight: 600 }}>
              <span style={{ color: "#ef4444" }}>{Icon.clock}</span>
              Registration Deadline: {formatDate(vacancy.deadline)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            <Chip label={vacancy.type} color="#2d7ff3" />
            <Chip label={vacancy.payment_type} color="#10b981" />
            <Chip label={`${position.pivot?.quota || 0} Quota`} color="#f59e0b" />
            <Chip label={`${vacancy.total_quota || 0} Total Quota`} color="#64748b" />
          </div>
          <button
            onClick={() => {
              if (isAuthenticated) navigate(`/c/${slug}/apply/${vacancy.id_vacancy}/${position.id_position}`);
              else navigate(`/c/${slug}/register?vacancy_id=${vacancy.id_vacancy}&position_id=${position.id_position}`);
            }}
            style={{ width: "100%", padding: 15, background: "linear-gradient(135deg,#1a5fc4,#2d7ff3)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(45,127,243,0.35)", fontFamily: "'Poppins',sans-serif" }}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DropItem ──────────────────────────────────────────────────────
function DropItem({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "9px 12px",
        background: hov ? (color ? "#fff1f2" : "#f8fafc") : "none",
        border: "none", borderRadius: 8, color: color || "#334155",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8, textAlign: "left",
        fontFamily: "inherit", transition: "0.15s",
      }}
    >
      {icon} {label}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function CompanyPublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [emailForm, setEmailForm] = useState({ name: "", email: "", message: "" });
  const [emailSent, setEmailSent] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [company, setCompany] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/c/${slug}`, { headers: { Accept: "application/json" } })
      .then(r => r.json())
      .then(data => {
        if (data.company) {
          setCompany(data.company);
          fetch(`http://localhost:8000/api/c/${slug}/vacancies`, { headers: { Accept: "application/json" } })
            .then(res => res.json())
            .then(vData => setVacancies(vData.vacancies || []))
            .catch(console.error);
        }
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const positions = vacancies.flatMap(v =>
    (v.positions || []).map(p => ({ ...p, vacancy: v }))
  );
  const totalQuota = vacancies.reduce((acc, v) => acc + (parseInt(v.total_quota) || 0), 0);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
    setEmailForm({ name: "", email: "", message: "" });
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94a3b8", fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>Loading...</p>
    </div>
  );

  if (!company) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#94a3b8", fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>Company Not Found</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins','Segoe UI',sans-serif", color: "#0f172a" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .fadein { animation: fadeUp 0.55s ease both; }
        .input-field:focus { outline: none; border-color: #2d7ff3 !important; box-shadow: 0 0 0 3px rgba(45,127,243,0.12); }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 60, padding: "0 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #e2e8f0",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: 40, width: "auto" }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px" }}>EarlyPath</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAuthenticated ? (
            <>
              <div ref={profileRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{ width: 36, height: 36, borderRadius: "50%", cursor: "pointer", background: profileOpen ? "#eff6ff" : "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
                >
                  {Icon.user}
                </button>
                {profileOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 200, padding: 6, zIndex: 200 }}>
                    <div style={{
                      padding: "10px 14px 8px",
                      borderBottom: "1px solid #f1f5f9",
                      marginBottom: "6px"
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                        {user?.name || user?.full_name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.email}
                      </div>
                    </div>
                    <DropItem icon={Icon.dashboard} label="Dashboard" onClick={() => { setProfileOpen(false); navigate(user?.role === "candidate" ? `/c/${slug}/dashboard` : "/dashboard"); }} />
                    <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                    <DropItem icon={Icon.logout} label="Logout" color="#ef4444" onClick={() => { setProfileOpen(false); setLogoutModalOpen(true); }} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => navigate(`/c/${slug}/login`)} style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: "#fff", border: "1.5px solid #e2e8f0", color: "#334155", cursor: "pointer", fontFamily: "inherit" }}>Sign In</button>
              <button onClick={() => navigate(`/c/${slug}/register`)} style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#1a5fc4,#2d7ff3)", border: "none", color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(45,127,243,0.3)", fontFamily: "inherit" }}>Register</button>
            </>
          )}
        </div>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{
          background: "linear-gradient(160deg,#0f172a 0%,#1e3a5f 55%,#0f2744 100%)",
          padding: "80px 64px 90px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,127,243,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, left: -80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }} className="fadein">

            {/* Company Identity - full width, centered */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {/* Logo */}
              <div style={{ marginBottom: 32 }}>
                {company.logo_path ? (
                  <img
                    src={`http://localhost:8000/storage/${company.logo_path}`}
                    alt={company.name}
                    style={{ width: 120, height: 120, objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 64, fontWeight: 900, color: "#fff" }}>{company.name.charAt(0)}</span>
                )}
              </div>

              <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", margin: "0 0 18px", letterSpacing: "-2px", lineHeight: 1.08 }}>
                {company.name}
              </h1>

              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: "0 0 36px", maxWidth: 600 }}>
                {company.description ||
                  `${company.name} opens internship opportunities for students and fresh graduates to gain real-world experience, develop professional skills, and grow together with our team.`}
              </p>

              {/* Info Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 40, justifyContent: "center" }}>
                {company.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 16px", borderRadius: 10 }}>
                    <span style={{ color: "#38bdf8" }}>{Icon.location}</span>
                    {company.address}
                  </div>
                )}
                {company.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 16px", borderRadius: 10 }}>
                    <span style={{ color: "#38bdf8" }}>{Icon.mail}</span>
                    {company.email}
                  </div>
                )}
              </div>

              {!isAuthenticated && (
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => navigate(`/c/${slug}/register`)} style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#2d7ff3,#38bdf8)", border: "none", color: "#fff", cursor: "pointer", boxShadow: "0 8px 24px rgba(45,127,243,0.4)", fontFamily: "inherit" }}>
                    Get Started
                  </button>
                  <button onClick={() => navigate(`/c/${slug}/login`)} style={{ padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Internship Program cards - juga di tengah */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
              <div style={{ width: "100%", maxWidth: 900, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
                <div style={{ marginBottom: 6, width: "100%", textAlign: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.25)", padding: "5px 16px", borderRadius: 20, letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-block" }}>
                    Internship Program
                  </span>
                </div>

                {[
                  { icon: Icon.target, title: "Real Experience", desc: "Work on actual projects and contribute to the company's goals directly." },
                  { icon: Icon.rocket, title: "Career Growth", desc: "Mentorship from industry professionals to boost your professional journey." },
                  { icon: Icon.handshake, title: "Collaborative Culture", desc: "Be part of a supportive team that values learning and innovation." },
                ].map((item, i) => (
                  <div key={i} style={{
                    flex: "1 1 250px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    animation: `fadeUp 0.5s ease ${0.1 + i * 0.12}s both`,
                  }}>
                    <div style={{ color: "#38bdf8", flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────── */}
        <section style={{ padding: "60px 64px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#2d7ff3", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>By The Numbers</p>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.8px" }}>Program Overview</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            <StatCard
              icon={Icon.briefcase}
              label="Active Programs"
              value={vacancies.length}
              sub="Open internship programs"
              color="#2d7ff3"
              barColors={["#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6"]}
            />
            <StatCard
              icon={Icon.users}
              label="Open Positions"
              value={positions.length}
              sub="Roles available to apply"
              color="#10b981"
              barColors={["#4ade80", "#86efac", "#4ade80", "#86efac", "#4ade80", "#bbf7d0", "#4ade80"]}
            />
            <StatCard
              icon={Icon.star}
              label="Total Quota"
              value={totalQuota}
              sub="Spots for new interns"
              color="#f59e0b"
              barColors={["#fb923c", "#fdba74", "#fb923c", "#fdba74", "#fb923c", "#fed7aa", "#fb923c"]}
            />
          </div>
        </section>

        {/* ── Why Join ─────────────────────────────────────────── */}
        <section style={{ background: "#fff", padding: "70px 64px", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#2d7ff3", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>Why Choose Us</p>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.8px" }}>Unlock Your Potential</h2>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0 auto", maxWidth: 460, lineHeight: 1.7 }}>
                Gain the skills, experience, and connections you need to launch a successful career.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
              {[
                { icon: Icon.bulb, title: "Hands-on Learning", desc: "Tackle real challenges alongside experienced professionals every day.", color: "#2d7ff3" },
                { icon: Icon.chart, title: "Skill Development", desc: "Build a portfolio with meaningful work that stands out to employers.", color: "#10b981" },
                { icon: Icon.globe, title: "Industry Network", desc: "Connect with leaders and peers across various fields and departments.", color: "#f59e0b" },
                { icon: Icon.award, title: "Official Certificate", desc: "Receive an official letter of acceptance and completion certificate.", color: "#8b5cf6" },
              ].map((item, i) => (
                <div key={i}
                  style={{ padding: "28px 24px", borderRadius: 16, border: "1.5px solid #f1f5f9", background: "#fafbfc", transition: "0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + "40"; e.currentTarget.style.boxShadow = `0 8px 24px ${item.color}14`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: item.color }}>
                    {item.icon}
                  </div>
                  <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Positions ────────────────────────────────────── */}
        <section style={{ padding: "70px 64px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              marginBottom: 36,
              textAlign: "center",  
              flexDirection: "column",  
            }}>
              <div style={{ 
                textAlign: "center",  
                width: "100%"        
              }}>
                <p style={{ 
                  fontSize: 12, 
                  fontWeight: 700, 
                  color: "#2d7ff3", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.1em", 
                  margin: "0 0 8px", 
                  justifyContent: "center"  
                }}>
                  Now Hiring
                </p>
                <h2 style={{ 
                  fontSize: 30, 
                  fontWeight: 800, 
                  color: "#0f172a", 
                  margin: "0 0 6px", 
                  letterSpacing: "-0.7px" 
                }}>
                  Open Positions
                </h2>
                <p style={{ 
                  fontSize: 13, 
                  color: "#94a3b8", 
                  margin: 0 
                }}>
                  {positions.length > 0 ? `${positions.length} position${positions.length > 1 ? "s" : ""} available` : "No open positions at this time"}
                </p>
              </div>
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate(`/c/${slug}/register`)} 
                  style={{ 
                    padding: "10px 22px", 
                    borderRadius: 10, 
                    fontSize: 13, 
                    fontWeight: 700, 
                    background: "linear-gradient(135deg,#1a5fc4,#2d7ff3)", 
                    border: "none", 
                    color: "#fff", 
                    cursor: "pointer", 
                    fontFamily: "inherit",
                    marginTop: 20  
                  }}
                >
                  Register to Apply
                </button>
              )}
            </div>
            {positions.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 18 }}>
                {positions.map((pos) => (
                  <PositionCard key={pos.id_position} position={pos} onClick={setSelectedPosition} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", borderRadius: 16, border: "1.5px dashed #e2e8f0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#94a3b8" }}>
                  {Icon.briefcase}
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#334155", margin: "0 0 6px" }}>No Positions Yet</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Open positions will appear here once they are published.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section style={{ padding: "0 64px 70px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ borderRadius: 24, background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f2744 100%)", padding: "60px 64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -60, top: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,127,243,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.8px" }}>Ready to Start Your Journey?</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.7, maxWidth: 460 }}>
                  Join {company.name}'s internship program and take the first step toward becoming a skilled professional.
                </p>
              </div>
              {!isAuthenticated ? (
                <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative", zIndex: 1 }}>
                  <button onClick={() => navigate(`/c/${slug}/register`)} style={{ padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#2d7ff3,#38bdf8)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    Apply Now
                  </button>
                  <button onClick={() => navigate(`/c/${slug}/login`)} style={{ padding: "13px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    Sign In
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate(`/c/${slug}/dashboard`)} style={{ padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#2d7ff3,#38bdf8)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Footer ── Warna Biru seperti Hero Section ─────────── */}
        <footer style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e3a5f 55%,#0f2744 100%)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 64px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 64, marginBottom: 48 }}>

              {/* Brand */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {company.logo_path ? (
                      <img src={`http://localhost:8000/storage/${company.logo_path}`} alt={company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{company.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{company.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Internship Program</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, margin: "0 0 24px", maxWidth: 280 }}>
                  {(company.description || `${company.name} opens opportunities for students and fresh graduates to grow with us.`).slice(0, 140)}...
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {company.address && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: "#38bdf8", marginTop: 1, flexShrink: 0 }}>{Icon.location}</span>
                      {company.address}
                    </div>
                  )}
                  {company.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: "#38bdf8", flexShrink: 0 }}>{Icon.mail}</span>
                      {company.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form - Styling disesuaikan untuk background gelap */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#38bdf8", textTransform: "uppercase", margin: "0 0 20px" }}>Send a Message</p>
                {emailSent ? (
                  <div style={{ padding: "20px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 14, fontSize: 14, color: "#38bdf8", fontWeight: 600, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ color: "#38bdf8" }}>{Icon.check}</span>
                    Message sent successfully!
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input
                      className="input-field"
                      placeholder="Your Name"
                      value={emailForm.name}
                      onChange={e => setEmailForm(f => ({ ...f, name: e.target.value }))}
                      required
                      style={{ padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "#fff", fontFamily: "inherit", background: "rgba(255,255,255,0.08)" }}
                    />
                    <input
                      className="input-field"
                      type="email"
                      placeholder="Your Email"
                      value={emailForm.email}
                      onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                      required
                      style={{ padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "#fff", fontFamily: "inherit", background: "rgba(255,255,255,0.08)" }}
                    />
                    <textarea
                      className="input-field"
                      placeholder="Your message..."
                      value={emailForm.message}
                      onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))}
                      required
                      rows={4}
                      style={{ padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "#fff", fontFamily: "inherit", resize: "none", gridColumn: "1 / -1", background: "rgba(255,255,255,0.08)" }}
                    />
                    <button
                      type="submit"
                      style={{ gridColumn: "1 / -1", padding: "12px 16px", borderRadius: 10, background: "linear-gradient(135deg,#2d7ff3,#38bdf8)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                      <span style={{ color: "#fff" }}>{Icon.send}</span>
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Bottom - Styling disesuaikan untuk background gelap */}
            <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>© 2026 {company.name}. All rights reserved.</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Powered by <span style={{ color: "#38bdf8", fontWeight: 600 }}>EarlyPath</span>
              </p>
            </div>
          </div>
        </footer>
      </main>

      {selectedPosition && (
        <PositionDetailModal
          position={selectedPosition}
          slug={slug}
          isAuthenticated={isAuthenticated}
          onClose={() => setSelectedPosition(null)}
        />
      )}

      {/* Logout confirm modal */}
      {logoutModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.05)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", margin: "0 auto 20px" }}>
              <div style={{ transform: "scale(2)" }}>{Icon.logout}</div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>Logout?</h3>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 28 }}>You will need to sign in again to access your dashboard.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setLogoutModalOpen(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "transparent", fontSize: 14, fontWeight: 700, color: "#64748b", cursor: "pointer", transition: "0.2s", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button
                onClick={() => { logout(); setLogoutModalOpen(false); navigate("/"); }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#ef4444", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "0.2s", boxShadow: "0 8px 20px rgba(239,68,68,0.3)", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}