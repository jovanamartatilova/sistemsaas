import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

// ── helpers ──────────────────────────────────────────────────────
 const formatDate = (dateStr) => {
   if (!dateStr) return "-";
   const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
   const parts = String(dateStr).split("-");
   if (parts.length !== 3) return dateStr;
   const [y, m, d] = parts;
   const month = MONTHS[parseInt(m) - 1];
   return `${parseInt(d)} ${month} ${y}`;
 };
const blu = "linear-gradient(135deg,#1a5fc4 0%,#2d7ff3 100%)";

function Badge({ children, color = "#2d7ff3" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      padding: "4px 10px", borderRadius: 99,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>
      {children}
    </span>
  );
}

function GlassCard({ children, style = {}, hover = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: hov ? "1px solid rgba(45,127,243,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        backdropFilter: "blur(10px)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? "0 0 0 1px rgba(45,127,243,0.2),0 12px 40px rgba(45,127,243,0.15)" : "none",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function NavBtn({ children, primary, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "8px 18px", borderRadius: 9, cursor: "pointer",
        fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
        transition: "all 0.2s",
        ...(primary ? {
          background: blu, color: "#fff", border: "none",
          boxShadow: h ? "0 8px 28px rgba(45,127,243,0.5)" : "0 4px 16px rgba(45,127,243,0.28)",
          transform: h ? "translateY(-1px)" : "none",
        } : {
          background: h ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(255,255,255,0.1)",
        }),
      }}
    >
      {children}
    </button>
  );
}

// ── PositionDetailModal ─────────────────────────────────────────────────────
const PositionDetailModal = ({ position, slug, isAuthenticated, onClose }) => {
  if (!position) return null;
  const navigate = useNavigate();
  const vacancy = position.vacancy;

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.85)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d1a28", borderRadius: "24px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#fff", fontSize: "18px" }}>✕</button>

        {/* Header Photo */}
        <div style={{ width: "100%", height: "220px", background: vacancy.photo ? `url(http://127.0.0.1:8000/storage/${vacancy.photo}) center/cover` : "rgba(255,255,255,0.05)" }}></div>

        <div style={{ padding: "32px", textAlign: "left" }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "#4a9eff", marginBottom: "8px" }}>{vacancy.title} - Batch {vacancy.batch}</p>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", margin: "0 0 16px" }}>{position.name}</h2>

          <div style={{ marginBottom: "28px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.9)", margin: "0 0 8px" }}>Deskripsi Program</h4>
            <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap" }}>{vacancy.description}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "rgba(255,255,243,0.7)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{vacancy.location || "Jakarta"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14.5px", color: "rgba(255,255,255,0.5)", fontStyle: "italic", textAlign: "left" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>{formatDate(vacancy.start_date || vacancy.deadline)} - {formatDate(vacancy.end_date || vacancy.deadline)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14.5px", color: "#fb7185", fontWeight: "600" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Pendaftaran Terakhir: {formatDate(vacancy.deadline)}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "40px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "capitalize", padding: "6px 14px", borderRadius: "8px", background: "rgba(74,158,255,0.1)", color: "#4a9eff" }}>{vacancy.type}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "capitalize", padding: "6px 14px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{vacancy.payment_type}</span>
            <span style={{ fontSize: "11px", fontWeight: "700", background: "rgba(74,158,255,0.1)", color: "#4a9eff", padding: "6px 14px", borderRadius: "8px" }}>{position.quota || 0} Kuota Posisi</span>
            <span style={{ fontSize: "11px", fontWeight: "700", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "6px 14px", borderRadius: "8px", marginLeft: "auto" }}>{vacancy.total_quota || 0} Total Kuota</span>
          </div>

          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate(`/c/${slug}/apply/${vacancy.id_vacancy}/${position.id_position}`);
              } else {
                navigate(`/c/${slug}/register?vacancy_id=${vacancy.id_vacancy}&position_id=${position.id_position}`);
              }
            }}
            style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "0.2s", boxShadow: "0 10px 15px -3px rgba(74,158,255,0.4)" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Position card ─────────────────────────────────────────────────
function PositionCard({ position, slug, onClick }) {
  const navigate = useNavigate();
  const vacancy = position.vacancy;

  return (
    <GlassCard hover style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div onClick={() => onClick(position)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Thumbnail placeholder */}
        <div style={{
          width: "100%", height: 140,
          background: vacancy.photo ? `url(http://127.0.0.1:8000/storage/${vacancy.photo}) center/cover` : "linear-gradient(135deg,rgba(45,127,243,0.08) 0%,rgba(45,127,243,0.03) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative"
        }}>
          {!vacancy.photo && (
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(45,127,243,0.1)", border: "1px solid rgba(45,127,243,0.18)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d7ff3" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
          )}
          <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(56,189,248,0.15)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}>
            DIBUKA
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8, flex: 1, textAlign: "left" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{position.name}</h3>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            {vacancy.title} - Batch {vacancy.batch}
          </p>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4a9eff", background: "rgba(74,158,255,0.1)", padding: "2px 8px", borderRadius: 6 }}>
              {position.quota || 0} Kuota
            </span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, textAlign: "left" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span>Periode Magang: {formatDate(vacancy.start_date || vacancy.deadline)} - {formatDate(vacancy.end_date || vacancy.deadline)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fb7185" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span style={{ fontStyle: "italic" }}>Tutup Pendaftaran: {formatDate(vacancy.deadline)}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────
function StatsBar({ vacanciesCount, positionsCount, totalQuota }) {
  const items = [
    { label: "Program", value: vacanciesCount || "0" },
    { label: "Posisi", value: positionsCount || "0" },
    { label: "Kuota Tersedia", value: totalQuota || "0" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {items.map(s => (
        <GlassCard key={s.label} style={{ padding: "16px 20px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>{s.label}</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.value}</p>
        </GlassCard>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function CompanyPublicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token, user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [company, setCompany] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    // 1. Fetch Company
    fetch(`http://localhost:8000/api/c/${slug}`, {
      headers: { Accept: "application/json" }
    })
      .then(r => r.json())
      .then(data => {
        if (data.company) {
          setCompany(data.company);
          // 2. Fetch Vacancies for this company
          fetch(`http://localhost:8000/api/c/${slug}/vacancies`, {
            headers: { Accept: "application/json" }
          })
            .then(res => res.json())
            .then(vData => setVacancies(vData.vacancies || []))
            .catch(err => console.error(err));
        }
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));

    // 3. Fetch Submission if logged in
    if (isAuthenticated && token) {
      fetch(`http://localhost:8000/api/c/${slug}/my-submission`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      })
        .then(r => r.json())
        .then(data => {
          if (data.submission) setSubmission(data.submission);
        })
        .catch(err => console.error(err));
    }
  }, [slug, isAuthenticated, token]);

  const positions = vacancies.flatMap(v =>
    (v.positions || []).map(p => ({ ...p, vacancy: v }))
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading...</p>
    </div>
  );

  if (!company) return (
    <div style={{ minHeight: "100vh", background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Perusahaan Tidak Ditemukan</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#060d1a 0%,#08101f 55%,#04080e 100%)", fontFamily: "'Poppins', sans-serif", textAlign: "left" }}>

      {/* ambient glow */}
      <div style={{ position: "fixed", top: "-8%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(45,127,243,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 60, padding: "0 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(6,13,26,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Left: EarlyPath Logo + Text */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <img src="/assets/images/logo.png" alt="EarlyPath Logo" style={{ height: "46px", width: "auto" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>EarlyPath</span>
        </Link>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isAuthenticated ? (
            <>
              {/* Profile Name/Badge */}
              <span style={{ padding: "4px 10px", background: "rgba(255,255,255,0.06)", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                {user?.role === "candidate" ? user.name : company?.name}
              </span>

              {/* Profile Icon Dropdown */}
              <div ref={profileRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
                    background: profileOpen ? "rgba(45,127,243,0.25)" : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "0.2s", color: "#fff",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {profileOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "rgba(15,25,45,0.97)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.4)", minWidth: 180,
                    padding: "6px", zIndex: 200,
                  }}>
                    <button
                      onClick={() => { 
                        setProfileOpen(false); 
                        if (user?.role === "candidate") {
                          navigate(`/c/${slug}/dashboard`);
                        } else {
                          navigate("/dashboard");
                        }
                      }}
                      style={{
                        width: "100%", padding: "10px 14px", background: "none", border: "none",
                        borderRadius: 8, color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                        transition: "0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(45,127,243,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                      Dashboard
                    </button>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />
                    <button
                      onClick={() => { 
                        setProfileOpen(false); 
                        logout(); 
                        navigate("/"); 
                      }}
                      style={{
                        width: "100%", padding: "10px 14px", background: "none", border: "none",
                        borderRadius: 8, color: "#fb7185", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                        transition: "0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(251,113,133,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavBtn onClick={() => navigate(`/c/${slug}/login`)}>Masuk</NavBtn>
              <NavBtn primary onClick={() => navigate(`/c/${slug}/register`)}>Daftar</NavBtn>
            </>
          )}
        </div>
      </header>

      <main style={{ maxWidth: "100%", margin: "0 auto", padding: "44px 64px 100px" }}>

        {/* ── Company hero card ── */}
        <div style={{
          position: "relative", borderRadius: 20, overflow: "hidden",
          marginBottom: 16, minHeight: 320,
          background: "linear-gradient(160deg,#0a1628 0%,#071020 100%)",
        }}>
          {/* bg foto — ganti URL-nya kalau company punya cover photo */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80')",
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.25,
          }} />

          {/* gradient overlay bawah */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(6,13,26,0.95) 0%, rgba(6,13,26,0.4) 50%, rgba(6,13,26,0.2) 100%)",
          }} />

          {/* content */}
          <div style={{ position: "relative", zIndex: 2, padding: "56px 48px 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {/* Logo */}
            <div style={{
              width: 72, height: 72, borderRadius: 18, marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(45,127,243,0.15)", border: "1px solid rgba(45,127,243,0.3)",
              boxShadow: "0 8px 32px rgba(45,127,243,0.2)",
            }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: "#2d7ff3" }}>{company.name.charAt(0)}</span>
            </div>

            {/* Nama company */}
            <h1 style={{ fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-1px", lineHeight: 1.1 }}>
              {company.name}
            </h1>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
              {company.address && (
                <Badge color="#2d7ff3">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {company.address}
                </Badge>
              )}
              {company.email && (
                <Badge color="#64748b">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {company.email}
                </Badge>
              )}
            </div>

            {/* Deskripsi */}
            {company.description && (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.55)", maxWidth: 580, margin: "0 0 28px" }}>
                {company.description}
              </p>
            )}

            {/* CTA kalau belum login */}
            {!isAuthenticated && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <NavBtn primary onClick={() => navigate(`/c/${slug}/register`)}>Bergabung</NavBtn>
                <NavBtn onClick={() => navigate(`/c/${slug}/login`)}>Masuk</NavBtn>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ marginBottom: 36 }}>
          <StatsBar
            vacanciesCount={vacancies.length}
            positionsCount={positions.length}
            totalQuota={vacancies.reduce((acc, v) => acc + (parseInt(v.total_quota) || 0), 0)}
          />
        </div>

        {/* ── CTA Banner with Positions ── */}
        <div style={{
          marginTop: 64, borderRadius: 20, overflow: "hidden", position: "relative",
          background: "linear-gradient(160deg,#0a1628 0%,#071020 100%)",
          padding: "64px 48px", textAlign: "center",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#2d7ff3", textTransform: "uppercase", margin: "0 0 12px" }}>Program Magang</p>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.8px", lineHeight: 1.15 }}>
            Siap memulai perjalanan<br />kariermu bersama kami?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 48px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Daftarkan dirimu sekarang dan jadilah bagian dari generasi profesional berikutnya.
          </p>

          {/* Moved Positions section inside */}
          <section style={{ textAlign: "left", marginTop: 40 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Open Positions</h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", margin: 0 }}>
                  {positions.length > 0 ? `${positions.length} posisi terbuka di perusahaan ini` : "Belum ada posisi terbuka"}
                </p>
              </div>
            </div>

            {positions.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                {positions.map((pos) => (
                  <PositionCard key={pos.id_position} position={pos} slug={slug} onClick={setSelectedPosition} />
                ))}
              </div>
            ) : (
              <GlassCard style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Belum ada posisi</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>Posisi untuk perusahaan ini akan muncul di sini.</p>
              </GlassCard>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <footer style={{ marginTop: 72, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "48px 0 32px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(45,127,243,0.15)", border: "1px solid rgba(45,127,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#2d7ff3" }}>{company.name.charAt(0)}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{company.name}</span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", margin: 0, maxWidth: 220, textAlign: "left" }}>
                {company.description?.slice(0, 100)}...
              </p>
            </div>

            {/* Product links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", margin: "0 0 16px" }}>Program</p>
              {["Tentang Program", "Open Positions", "Cara Daftar", "FAQ"].map(l => (
                <p key={l} style={{ margin: "0 0 10px" }}>
                  <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#2d7ff3"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
                    {l}
                  </a>
                </p>
              ))}
            </div>

            {/* Legal links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", margin: "0 0 16px" }}>Legal</p>
              {["Privacy Policy", "Terms of Service", "Security", "GDPR"].map(l => (
                <p key={l} style={{ margin: "0 0 10px" }}>
                  <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#2d7ff3"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
                    {l}
                  </a>
                </p>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>
              © 2025 {company.name}. All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", margin: 0 }}>
              Powered by <span style={{ color: "rgba(45,127,243,0.5)" }}>EarlyPath</span>
            </p>
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
    </div>
  );
}
