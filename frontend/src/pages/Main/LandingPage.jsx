import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../stores/authStore";

// ── Minimal icons as inline SVG ─────────────────────────────────────────────
const IconBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconZap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const IconCheck = ({ color = "#4a9eff" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconRobot = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M12 11V7" />
    <circle cx="12" cy="5" r="2" />
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" />
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" />
    <line x1="9" y1="19" x2="15" y2="19" />
  </svg>
);
const IconBuildingOffice = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <rect x="2" y="3" width="20" height="18" rx="1" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="2" y1="15" x2="22" y2="15" />
  </svg>
);
const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCal = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconLocation = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconDeadline = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconDot = () => (
  <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
// ── Tambahan icon yang dibutuhkan search bar ──────────────────────────────────
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconXSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLayout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconLogOut = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: <IconBriefcase />, color: "#4a9eff", title: "Smart Job Matching", desc: "AI-powered matching connects the right interns to the right companies based on skills, interests, and culture fit." },
  { icon: <IconUsers />, color: "#a78bfa", title: "Multi-Tenant Management", desc: "Manage multiple companies and cohorts in one unified dashboard. Scale your internship program with ease." },
  { icon: <IconStar />, color: "#fbbf24", title: "Intern Certification", desc: "Issue verifiable digital certificates upon completion. Boost credibility for interns and companies alike." },
  { icon: <IconZap />, color: "#34d399", title: "Automated Workflows", desc: "Automate onboarding, task assignments, evaluations, and reporting — saving hours every week." },
  { icon: <IconChart />, color: "#f87171", title: "Real-time Analytics", desc: "Track intern performance, engagement, and outcomes with intuitive dashboards and detailed reports." },
  { icon: <IconShield />, color: "#60a5fa", title: "Enterprise Security", desc: "Bank-grade encryption, role-based access control, and compliance-ready infrastructure." },
];

const processSteps = [
  { num: "01", title: "Create your company profile", desc: "Register your company and set up your workspace in minutes. Add team members and define roles with granular permissions." },
  { num: "02", title: "Post internship positions", desc: "Create detailed job listings with requirements, responsibilities, and benefits. Reach thousands of qualified candidates." },
  { num: "03", title: "AI screens & matches candidates", desc: "Our AI reviews applications, scores candidates, and surfaces the best matches for your specific needs." },
  { num: "04", title: "Manage & certify interns", desc: "Track progress, assign tasks, run evaluations, and issue certificates — all from one place." },
];

const aiFeatures = [
  { color: "#4a9eff", title: "Smart Resume Parsing", desc: "Automatically extract and analyze skills, experience, and education from resumes in seconds." },
  { color: "#34d399", title: "Culture Fit Scoring", desc: "Match candidates based on values, work style, and team dynamics — not just hard skills." },
  { color: "#a78bfa", title: "Bias-Free Screening", desc: "Objective, data-driven screening that focuses on potential and skills." },
  { color: "#fbbf24", title: "Predictive Analytics", desc: "Forecast intern success rates and identify high-potential candidates before interviews." },
];

const footerLinks = {
  Product: ["Features", "Pricing", "Security", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "API Reference", "Support", "Status"],
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
};

// ── VacancyDetailModal ────────────────────────────────────────────────────────
const VacancyDetailModal = ({ vacancy, onClose }) => {
  if (!vacancy) return null;
  const navigate = useNavigate();
  const companyId = vacancy.company?.id_company || "";

  const handleApply = (position) => {
    if (!companyId || !position?.id_position) {
      alert("Perusahaan belum lengkap profilnya.");
      return;
    }

    onClose();
    navigate(`/c/${companyId}/apply/${vacancy.id_vacancy}/${position.id_position}`);
  };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.85)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0d1a28", borderRadius: "24px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10, color: "#fff", fontSize: "18px" }}>✕</button>
        <div style={{ width: "100%", height: "260px", background: vacancy.photo ? `url(http://127.0.0.1:8000/storage/${vacancy.photo}) center/cover` : "rgba(255,255,255,0.05)" }}></div>
        <div style={{ padding: "32px", textAlign: "left" }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "#4a9eff", marginBottom: "8px" }}>{vacancy.company?.name}</p>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", margin: "0 0 16px" }}>{vacancy.title}</h2>
          <div style={{ marginBottom: "28px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.9)", margin: "0 0 8px" }}>Deskripsi</h4>
            <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap" }}>{vacancy.description}</div>
          </div>
          <div style={{ marginBottom: "28px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "rgba(255,255,255,0.9)", margin: "0 0 8px" }}>Positions Available:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(vacancy.positions || []).map((p, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", color: "rgba(255,255,255,0.8)" }}><IconDot /> <span>{p.name || p}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#4a9eff", background: "rgba(74,158,255,0.1)", padding: "2px 8px", borderRadius: "6px" }}>{p.pivot?.quota || 0} Quota</span>
                    <button
                      onClick={() => handleApply(p)}
                      style={{ padding: "7px 12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px", padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14.5px", color: "rgba(255,255,255,0.7)" }}><IconLocation /> <span>{vacancy.location || "Jakarta"}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14.5px", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}><IconCal /> <span>{formatDate(vacancy.start_date || vacancy.deadline)} - {formatDate(vacancy.end_date || vacancy.deadline)}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14.5px", color: "#fb7185", fontWeight: "600" }}><IconDeadline /> <span>Pendaftaran Deadline: {formatDate(vacancy.deadline)}</span></div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "capitalize", padding: "6px 14px", borderRadius: "8px", background: "rgba(74,158,255,0.1)", color: "#4a9eff" }}>{vacancy.type}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "capitalize", padding: "6px 14px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{vacancy.payment_type}</span>
            <span style={{ fontSize: "11px", fontWeight: "700", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "6px 14px", borderRadius: "8px", marginLeft: "auto" }}>{vacancy.total_quota || 0} Total Quota</span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", margin: 0 }}>
            Pilih salah satu posisi di atas untuk lanjut ke submission form.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  // ── Search state ─────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = belum search
  const searchInputRef = useRef(null);

  const { isAuthenticated, logout, company: authCompany, user: authUser } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [emailForm, setEmailForm] = useState({ name: "", email: "", message: "" });
  const [emailSent, setEmailSent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
    setEmailForm({ name: "", email: "", message: "" });
  };

  // ── Boolean Retrieval Search ──────────────────────────────────────────────────
  const booleanSearch = (query, data) => {
    if (!query.trim()) return data;
    const raw = query.trim();

    const fields = (v) =>
      [v.title || "", v.company?.name || "", v.location || "", v.type || "", v.payment_type || "", v.description || "", ...(v.positions || []).map((p) => p.name || p)]
        .join(" ").toLowerCase();

    const tokenize = (q) => {
      const tokens = [];
      const re = /"[^"]*"|\(|\)|AND|OR|NOT|\S+/g;
      let m;
      while ((m = re.exec(q)) !== null) tokens.push(m[0]);
      return tokens;
    };

    const evaluate = (tokens, item) => {
      const text = fields(item);
      let i = 0;
      const parseOr = () => {
        let left = parseAnd();
        while (i < tokens.length && tokens[i].toUpperCase() === "OR") { i++; left = left || parseAnd(); }
        return left;
      };
      const parseAnd = () => {
        let left = parseNot();
        while (i < tokens.length && tokens[i].toUpperCase() === "AND") { i++; left = left && parseNot(); }
        return left;
      };
      const parseNot = () => {
        if (i < tokens.length && tokens[i].toUpperCase() === "NOT") { i++; return !parsePrimary(); }
        return parsePrimary();
      };
      const parsePrimary = () => {
        if (i >= tokens.length) return false;
        const tok = tokens[i++];
        if (tok === "(") { const result = parseOr(); if (i < tokens.length && tokens[i] === ")") i++; return result; }
        return text.includes(tok.replace(/^"|"$/g, "").toLowerCase());
      };
      return parseOr();
    };

    const tokens = tokenize(raw);
    return data.filter((item) => { try { return evaluate([...tokens], item); } catch { return fields(item).includes(raw.toLowerCase()); } });
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) { setSearchResults(null); setCurrentPage(1); return; }
    setSearchResults(booleanSearch(searchQuery, vacancies));
    setCurrentPage(1);
    setTimeout(() => document.getElementById("open-positions")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSearchReset = () => { setSearchQuery(""); setSearchResults(null); setCurrentPage(1); };

  // Vacancies yang ditampilkan: hasil search atau semua data
  const displayedVacancies = searchResults !== null ? searchResults : vacancies;

  // Dashboard link logic
  const getDashboardPath = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const company = authCompany || JSON.parse(localStorage.getItem("company"));
    const storedUserType = localStorage.getItem("user_type");
    const hasCandidateProfile = !!localStorage.getItem("candidate_profile");
    const resolvedRole = user?.role || user?.user_type || storedUserType || (hasCandidateProfile ? "candidate" : null);
    const normalizedRole = String(resolvedRole || "").trim().toLowerCase();

    if (user) {
      if ((normalizedRole === "candidate" || normalizedRole === "apprentice") && company?.id_company) return `/c/${company.id_company}/dashboard`;
      if (normalizedRole === "hr") return "/hr/dashboard";
      if (normalizedRole === "mentor") return "/mentor/dashboard";
      if (normalizedRole === "super_admin" || normalizedRole === "superadmin") return "/superadmin/dashboard";
    }
    return normalizedRole === "candidate" || normalizedRole === "apprentice" ? "/candidate/dashboard" : "/dashboard";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setActiveStep((s) => (s + 1) % processSteps.length), 3000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/vacancies/public")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || data?.error || `Request failed with ${res.status}`);
        }
        setVacancies(Array.isArray(data) ? data : (data.vacancies || []));
      })
      .catch((err) => {
        console.error("Failed to fetch vacancies:", err);
        setVacancies([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "linear-gradient(180deg, #06101e 0%, #081828 100%)", minHeight: "100vh", fontFamily: "'Poppins', sans-serif", color: "#e8eaf0", overflowX: "hidden" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(6, 16, 30, 0.92)" : "rgba(6, 16, 30, 0.55)", backdropFilter: "blur(16px)", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent", transition: "all 0.35s ease" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textDecoration: "none" }}>
          <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "46px", objectFit: "contain" }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>EarlyPath</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden-mobile">
          {["Features", "How It Works", "Open Programs"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            >{item}</a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="hidden-mobile">
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate("/login")}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(74,158,255,0.5)"; e.currentTarget.style.color = "#4a9eff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              >Sign In</button>
              <button onClick={() => navigate("/register")}
                style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 16px rgba(74,158,255,0.35)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(74,158,255,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(74,158,255,0.35)"; }}
              >Get Started</button>
            </>
          ) : (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button onClick={() => setShowDropdown(!showDropdown)}
                style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "0.2s", padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              ><IconUser /></button>
              {showDropdown && (
                <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "220px", background: "#0d1a28", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "8px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", zIndex: 1000 }}>
                  <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "6px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", marginBottom: "2px" }}>{authUser?.name || authUser?.full_name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{authUser?.email}</div>
                  </div>
                  <div onClick={() => { setShowDropdown(false); navigate(getDashboardPath()); }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", color: "#fff", fontSize: "14px", fontWeight: "500", cursor: "pointer", borderRadius: "10px", transition: "0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(74,158,255,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  ><IconLayout /> Dashboard</div>
                  <div onClick={() => { setShowDropdown(false); setLogoutModalOpen(true); }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", color: "#fb7185", fontSize: "14px", fontWeight: "500", cursor: "pointer", borderRadius: "10px", transition: "0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(251,113,133,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  ><IconLogOut /> Logout</div>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="show-mobile" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "4px", display: "none" }}
        >{mobileOpen ? <IconClose /> : <IconMenu />}</button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ position: "fixed", top: "64px", left: 0, right: 0, zIndex: 99, background: "rgba(6,16,30,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {["Features", "How It Works", "Open Programs"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileOpen(false)}
              style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: "15px", fontWeight: "500" }}
            >{item}</a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            {!isAuthenticated ? (
              <>
                <button onClick={() => navigate("/login")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>Sign In</button>
                <button onClick={() => navigate("/register")} style={{ background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", border: "none", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Get Started</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate(getDashboardPath())} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}><IconLayout /> Dashboard</button>
                <button onClick={() => { setLogoutModalOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.3)", color: "#fb7185", padding: "10px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}><IconLogOut size={16} /> Logout</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 80px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/assets/images/bg.png')", backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", opacity: 0.25 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,16,30,0.5) 0%, rgba(6,16,30,0.3) 40%, rgba(6,16,30,0.85) 100%)" }} />
        <div style={{ position: "absolute", top: "20%", left: "10%", width: "480px", height: "480px", borderRadius: "50%", background: "rgba(74,158,255,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "8%", width: "360px", height: "360px", borderRadius: "50%", background: "rgba(167,139,250,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "780px", width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.25)", borderRadius: "100px", padding: "6px 16px", fontSize: "13px", color: "#4a9eff", fontWeight: "600", marginBottom: "28px", letterSpacing: "0.5px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4a9eff", display: "inline-block", boxShadow: "0 0 8px #4a9eff" }} />
            AI-Powered Internship Management Platform
          </div>

          <h1 style={{ fontSize: "clamp(38px, 6vw, 72px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-2px", color: "#fff", margin: "0 0 24px" }}>
            Build Better,{" "}
            <span style={{ background: "linear-gradient(135deg, #4a9eff 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Internship Program
            </span>
          </h1>

          <p style={{ fontSize: "17px", lineHeight: "1.75", color: "rgba(255,255,255,0.6)", maxWidth: "540px", margin: "0 auto 36px" }}>
            EarlyPath streamlines your entire internship lifecycle — from posting programs to certifying talent — powered by intelligent automation and real insights.
          </p>

          {/* ── SEARCH BAR ── */}
          <div style={{ maxWidth: "640px", margin: "0 auto 44px", position: "relative" }}>
            <form onSubmit={handleSearch}>
              <div
                style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", overflow: "hidden", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", transition: "border-color 0.25s" }}
                onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(74,158,255,0.5)"}
                onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
              >
                <div style={{ padding: "0 14px 0 18px", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <IconSearch />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) { setSearchResults(null); setCurrentPage(1); }
                  }}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", padding: "16px 8px", fontFamily: "'Poppins', sans-serif", minWidth: 0 }}
                />
                {searchQuery && (
                  <button type="button" onClick={handleSearchReset}
                    style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "0 8px", display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
                  ><IconXSmall /></button>
                )}
                <button type="submit"
                  style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", color: "#fff", padding: "12px 22px", margin: "6px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", flexShrink: 0, transition: "box-shadow 0.2s, transform 0.2s", boxShadow: "0 4px 14px rgba(74,158,255,0.35)", display: "flex", alignItems: "center", gap: "6px" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(74,158,255,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(74,158,255,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <IconSearch />Cari
                </button>
              </div>
            </form>
          </div>
          {/* ── END SEARCH BAR ── */}

          {/* Stat badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", marginBottom: "44px" }}>
            {[{ value: "10K+", label: "Companies" }, { value: "250K+", label: "Candidates" }, { value: "1.2M", label: "Applications" }, { value: "98%", label: "Satisfaction" }].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px", fontWeight: "500" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {!isAuthenticated && (
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/register")}
                style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", color: "#fff", padding: "14px 36px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 32px rgba(74,158,255,0.4)", transition: "all 0.25s", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(74,158,255,0.55)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(74,158,255,0.4)"; }}
              >Start for Free <IconArrow /></button>
              <button onClick={() => navigate("/login")}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "14px 36px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.25s", backdropFilter: "blur(8px)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >Sign In</button>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES SECTION ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a9eff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>Platform Features</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px", margin: "0 0 16px" }}>
              Everything you need,{" "}<span style={{ color: "rgba(255,255,255,0.45)" }}>nothing you don't</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "480px", margin: "0 auto" }}>A complete suite of tools built specifically for modern internship management.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {features.map((f, i) => (
              <div key={i}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px", transition: "all 0.3s", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = `${f.color}30`; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: "18px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#fff", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", lineHeight: "1.7", color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION ─────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "80px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a9eff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>How It Works</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px", margin: "0 0 40px", lineHeight: "1.2" }}>
              From sign-up to{" "}<span style={{ color: "#4a9eff" }}>certified Intern</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {processSteps.map((step, i) => (
                <div key={i} onClick={() => setActiveStep(i)}
                  style={{ padding: "20px 22px", borderRadius: "14px", border: activeStep === i ? "1px solid rgba(74,158,255,0.3)" : "1px solid rgba(255,255,255,0.06)", background: activeStep === i ? "rgba(74,158,255,0.08)" : "transparent", cursor: "pointer", transition: "all 0.3s" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: activeStep === i ? "#4a9eff" : "rgba(255,255,255,0.25)", minWidth: "28px", marginTop: "2px" }}>{step.num}</span>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: activeStep === i ? "#fff" : "rgba(255,255,255,0.6)", marginBottom: "6px" }}>{step.title}</p>
                      {activeStep === i && <p style={{ fontSize: "13px", lineHeight: "1.65", color: "rgba(255,255,255,0.5)", margin: 0 }}>{step.desc}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: "1 1 340px", maxWidth: "460px" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                {["#ff5f57", "#ffbd2e", "#28c940"].map((c) => (<div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />))}
                <span style={{ flex: 1, textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>EarlyPath Dashboard</span>
              </div>
              <div style={{ padding: "22px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>Active Positions</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["Frontend Dev", "UI/UX", "Data Science"].map((r) => (
                      <span key={r} style={{ fontSize: "11px", background: "rgba(74,158,255,0.15)", border: "1px solid rgba(74,158,255,0.25)", borderRadius: "6px", padding: "4px 10px", color: "#4a9eff", fontWeight: "600" }}>{r}</span>
                    ))}
                  </div>
                </div>
                {[{ name: "Alicia M.", score: 94, tag: "Top Match" }, { name: "Dean K.", score: 88, tag: "Strong" }, { name: "Sara L.", score: 81, tag: "Good" }].map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${c.score * 2},60%,40%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#fff", fontWeight: "700" }}>{c.name[0]}</div>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>{c.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{c.tag}</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: c.score > 90 ? "#34d399" : c.score > 85 ? "#fbbf24" : "#94a3b8" }}>{c.score}%</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "16px", padding: "12px 14px", background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: "10px", fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
                  <span style={{ color: "#4a9eff", fontWeight: "700" }}>AI Insight: </span>
                  Alicia M. shows 94% compatibility with your Frontend Dev role based on her portfolio and skill assessment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI SECTION ──────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", background: "rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "80px", alignItems: "center", flexWrap: "wrap-reverse" }}>
          <div style={{ flex: "1 1 340px", maxWidth: "460px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(74,158,255,0.15)", border: "1px solid rgba(74,158,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a9eff" }}><IconRobot /></div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>EarlyPath AI Assistant</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Active · Analyzing applications</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {[{ label: "Resume Analysis", value: "100%", color: "#4a9eff" }, { label: "Culture Fit Score", value: "87%", color: "#34d399" }, { label: "Skill Match", value: "92%", color: "#a78bfa" }].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                      <span style={{ color: "rgba(255,255,255,0.55)" }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: "700" }}>{item.value}</span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: item.value, background: item.color, borderRadius: "99px", boxShadow: `0 0 8px ${item.color}60` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "10px", padding: "14px", fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: "1.65" }}>
                <span style={{ color: "#34d399", fontWeight: "700" }}>✓ Recommendation: </span>
                This candidate is highly recommended. Proceed to technical interview stage.
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 360px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#34d399", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>AI-Powered</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px", margin: "0 0 20px", lineHeight: "1.2" }}>
              AI does the{" "}<span style={{ color: "#34d399" }}>heavy lifting</span>
            </h2>
            <p style={{ fontSize: "15px", lineHeight: "1.75", color: "rgba(255,255,255,0.5)", marginBottom: "32px" }}>
              Let our intelligent engine handle the tedious screening process while you focus on making meaningful connections with top candidates.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {aiFeatures.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: f.color, marginTop: "7px", flexShrink: 0, boxShadow: `0 0 8px ${f.color}80` }} />
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "3px" }}>{f.title}</p>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: "1.6", margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OPEN POSITIONS SECTION ─────────────────────────────────────── */}
      <section id="open-positions" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#a78bfa", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              Live Opportunities
            </p>
            {/* Header dinamis berdasarkan search */}
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "800", color: "#fff", letterSpacing: "-1px", margin: 0 }}>
              {searchResults !== null
                ? <><span>Result </span><span style={{ color: "#a78bfa" }}>&ldquo;{searchQuery}&rdquo;</span></>
                : "Open Programs"
              }
            </h2>
            {searchResults !== null && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "14px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>
                  {searchResults.length === 0 ? "No job vacancies match your search." : `${searchResults.length} job vacancies found`}
                </span>
                <button onClick={handleSearchReset}
                  style={{ fontSize: "12px", fontWeight: "700", color: "#4a9eff", background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.25)", borderRadius: "8px", padding: "5px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(74,158,255,0.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(74,158,255,0.1)"}
                >
                  <IconXSmall /> Show All
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", justifyContent: "center" }}>
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>Memuat lowongan...</div>
            ) : displayedVacancies.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.4 }}>🔍</div>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
                  {searchResults !== null ? "No job vacancies found" : "There are currently no published job vacancies."}
                </p>
                {searchResults !== null && (
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Try changing the keyword or use the OR operator to broaden your search</p>
                )}
              </div>
            ) : (
              displayedVacancies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((pos, i) => (
                <div key={i} onClick={() => setSelectedVacancy(pos)}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", cursor: "pointer", position: "relative" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ width: "100%", height: "180px", position: "relative", overflow: "hidden", background: pos.photo ? `url(http://127.0.0.1:8000/storage/${pos.photo}) center/cover` : "rgba(255,255,255,0.05)" }} />
                  <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#4a9eff", marginBottom: "4px" }}>{pos.company?.name}</p>
                    <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#fff", margin: "0 0 14px", lineHeight: "1.3" }}>{pos.title} - Batch {pos.batch}</h3>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: "6px" }}>Positions:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "18px" }}>
                      {(pos.positions || []).slice(0, 3).map((p, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}><IconDot /> <span>{p.name || p}</span></div>
                      ))}
                      {(pos.positions || []).length > 3 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}><IconDot /> <span>etc.</span></div>
                      )}
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14.5px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}><IconCal /> <span>Period: {formatDate(pos.start_date || pos.deadline)} - {formatDate(pos.end_date || pos.deadline)}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14.5px", color: "rgba(255,255,255,0.5)" }}><IconLocation /> <span>{pos.location?.split(",")[0]}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14.5px", color: "#fb7185", fontWeight: "600" }}><IconDeadline /> <span style={{ fontStyle: "italic" }}>Deadline: {formatDate(pos.deadline)}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px", background: "rgba(74,158,255,0.1)", color: "#4a9eff" }}>{pos.type}</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{pos.payment_type}</span>
                      <span style={{ fontSize: "10px", fontWeight: "700", marginLeft: "auto", color: "rgba(255,255,255,0.4)" }}>{pos.total_quota || 0} Quota</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination — menggunakan displayedVacancies */}
          {!loading && displayedVacancies.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "48px" }}>
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "#fff", cursor: currentPage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                onMouseEnter={e => currentPage !== 1 && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => currentPage !== 1 && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              >←</button>
              {Array.from({ length: Math.ceil(displayedVacancies.length / itemsPerPage) }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = currentPage === pageNum;
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                    style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", background: isActive ? "linear-gradient(135deg, #1e40af, #3b82f6)" : "rgba(255,255,255,0.03)", color: "#fff", fontWeight: "700", cursor: "pointer", transition: "0.2s", boxShadow: isActive ? "0 4px 12px rgba(30,64,175,0.3)" : "none" }}
                    onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    onMouseLeave={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  >{pageNum}</button>
                );
              })}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(displayedVacancies.length / itemsPerPage)))} disabled={currentPage === Math.ceil(displayedVacancies.length / itemsPerPage)}
                style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: currentPage === Math.ceil(displayedVacancies.length / itemsPerPage) ? "rgba(255,255,255,0.2)" : "#fff", cursor: currentPage === Math.ceil(displayedVacancies.length / itemsPerPage) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}
                onMouseEnter={e => currentPage !== Math.ceil(displayedVacancies.length / itemsPerPage) && (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => currentPage !== Math.ceil(displayedVacancies.length / itemsPerPage) && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              >→</button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center", background: "linear-gradient(135deg, rgba(74,158,255,0.06) 0%, rgba(167,139,250,0.06) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "28px", padding: "72px 48px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(74,158,255,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(167,139,250,0.06)", filter: "blur(60px)", pointerEvents: "none" }} />
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#4a9eff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>Get Started Today</p>
            <h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: "800", color: "#fff", letterSpacing: "-1.5px", lineHeight: "1.1", margin: "0 0 18px" }}>
              Ready to transform your{" "}
              <span style={{ background: "linear-gradient(135deg, #4a9eff, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>internship program?</span>
            </h2>
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: "1.7", maxWidth: "500px", margin: "0 auto 40px" }}>
              Join thousands of companies already using EarlyPath to find, manage, and certify exceptional intern talent.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/register")}
                style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", color: "#fff", padding: "14px 40px", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 32px rgba(74,158,255,0.4)", transition: "all 0.25s", display: "flex", alignItems: "center", gap: "8px" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(74,158,255,0.55)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(74,158,255,0.4)"; }}
              >Start Now <IconArrow /></button>
              <button onClick={() => navigate("/login")}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "14px 32px", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >Sign In</button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "36px", flexWrap: "wrap" }}>
              {["No credit card required", "Free 14-day trial", "Cancel anytime"].map((txt) => (
                <div key={txt} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                  <IconCheck color="rgba(74,158,255,0.8)" />{txt}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "linear-gradient(160deg,#0a1628 0%,#0d1a2f 55%,#081424 100%)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 24px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: "64px", marginBottom: "64px" }} className="footer-grid">
            <div className="fadein" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "48px", objectFit: "contain" }} />
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px" }}>EarlyPath</span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: "1.8", margin: "0 0 32px", maxWidth: "320px" }}>
                Empowering talent and organizations to connect, collaborate, and grow together through AI-driven internship management.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ color: "#4a9eff" }}><IconLocation /></span>Surabaya, Indonesia
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ color: "#4a9eff" }}><IconMail /></span>support@earlypath.com
                </div>
              </div>
            </div>

            <div className="fadein">
              <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", color: "#4a9eff", textTransform: "uppercase", margin: "0 0 24px" }}>Send us a Message</p>
              {emailSent ? (
                <div style={{ padding: "24px", background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: "16px", fontSize: "14px", color: "#4a9eff", fontWeight: "600", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <IconCheck color="#4a9eff" />Thank you! Your message has been sent.
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <input placeholder="Your Name" value={emailForm.name} onChange={e => setEmailForm(f => ({ ...f, name: e.target.value }))} className="footer-input" required style={{ padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "13px", fontFamily: "inherit", outline: "none", transition: "0.2s" }} />
                  <input type="email" placeholder="Your Email" value={emailForm.email} onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))} className="footer-input" required style={{ padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "13px", fontFamily: "inherit", outline: "none", transition: "0.2s" }} />
                  <textarea placeholder="How can we help you?" value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} className="footer-input" required rows={4}
                    style={{ padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "13px", fontFamily: "inherit", resize: "none", gridColumn: "1 / -1", outline: "none", transition: "0.2s" }} />
                  <button type="submit"
                    style={{ gridColumn: "1 / -1", padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg,#1e40af,#3b82f6)", border: "none", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 8px 24px rgba(30,64,175,0.3)", transition: "0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(30,64,175,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(30,64,175,0.3)"; }}
                  ><IconSend />Send Message</button>
                </form>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>© 2026 EarlyPath. All rights reserved.</p>
              <div style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.1)", display: "flex" }} className="hidden-mobile" />
              <div style={{ display: "flex", gap: "20px" }} className="hidden-mobile">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                  <a key={l} href="#" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                  >{l}</a>
                ))}
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Built with <span style={{ color: "rgba(248,113,113,0.8)" }}>♥</span> in Indonesia</p>
          </div>
        </div>
      </footer>

      {/* Vacancy Detail Modal */}
      <VacancyDetailModal
        vacancy={selectedVacancy}
        onClose={() => setSelectedVacancy(null)}
      />

      {/* Responsive CSS */}
      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>

      {/* Logout confirm modal */}
      {logoutModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#1a1f2e", borderRadius: 24, padding: 32, width: "100%", maxWidth: 380, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(251,113,133,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fb7185", margin: "0 auto 20px" }}>
              <IconLogOut size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#fff" }}>Logout?</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 28 }}>You will need to sign in again to access your dashboard.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setLogoutModalOpen(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >Cancel</button>
              <button onClick={() => { logout(); setLogoutModalOpen(false); navigate("/"); }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "#fb7185", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", transition: "0.2s", boxShadow: "0 8px 20px rgba(251,113,133,0.3)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}