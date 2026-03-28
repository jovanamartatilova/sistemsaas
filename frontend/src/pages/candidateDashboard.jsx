import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const MENU = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "submission",
    label: "My Submission",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    key: "schedule",
    label: "Schedule",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    key: "evaluation",
    label: "Evaluation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "certificate",
    label: "Certificate",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    key: "profile",
    label: "My Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const STATUS_CONFIG = {
  pending:  { label: "Pending Review", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
  accepted: { label: "Accepted", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  reviewed: { label: "Under Review", color: "#4a9eff", bg: "rgba(74,158,255,0.1)", border: "rgba(74,158,255,0.25)" },
};

export default function CandidateDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [company, setCompany]       = useState(null);
  const [submission, setSubmission] = useState(null);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token      = localStorage.getItem("auth_token");

    if (!storedUser || !token) {
      navigate(`/c/${slug}/login`);
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const [companyRes, submissionRes] = await Promise.all([
          fetch(`http://localhost:8000/api/c/${slug}`, {
            headers: { "Accept": "application/json" },
          }),
          fetch(`http://localhost:8000/api/c/${slug}/my-submission`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
        ]);

        if (!companyRes.ok) throw new Error("Perusahaan tidak ditemukan");
        const companyData    = await companyRes.json();
        setCompany(companyData.company);

        if (submissionRes.ok) {
          const subData = await submissionRes.json();
          setSubmission(subData.submission);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    navigate(`/c/${slug}/login`);
  };

  const statusCfg = STATUS_CONFIG[submission?.status] ?? STATUS_CONFIG.pending;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #071220 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(74,158,255,0.2)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="#4a9eff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #071220 100%)" }}>
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>{error}</p>
          <button onClick={() => navigate(`/c/${slug}/login`)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", cursor: "pointer" }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #071220 100%)" }}>

      {/* ── Sidebar ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
          style={{
            width: "240px",
            minWidth: "240px",
            background: "rgba(10,18,32,0.95)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Logo */}
          <Link to="/" className="px-5 py-5 flex items-center gap-3 decoration-none"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
            <img src="/assets/images/logo.png" alt="Logo" className="h-12 object-contain" />
            <div>
              <p className="text-xs font-semibold text-white leading-none">EarlyPath</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)", maxWidth: "130px" }}>
                {company?.name}
              </p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {MENU.map((item) => {
              const isActive = activeMenu === item.key;
              return (
                <button key={item.key}
                  onClick={() => { setActiveMenu(item.key); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150"
                  style={{
                    background: isActive ? "rgba(74,158,255,0.12)" : "transparent",
                    color: isActive ? "#4a9eff" : "rgba(255,255,255,0.5)",
                    border: isActive ? "1px solid rgba(74,158,255,0.2)" : "1px solid transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                  {item.label}
                  {item.key === "submission" && submission && (
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                      {statusCfg.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User info + logout */}
          <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: "rgba(74,158,255,0.2)", color: "#4a9eff" }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150"
              style={{ color: "rgba(255,100,100,0.7)", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,59,48,0.08)"; e.currentTarget.style.color = "#ff6b6b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,100,100,0.7)"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
          style={{
            background: "rgba(10,18,32,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div className="flex items-center gap-4">
            {/* Hamburger */}
            <button className="lg:hidden p-2 rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "white" }}
              onClick={() => setSidebarOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white">
                {MENU.find((m) => m.key === activeMenu)?.label}
              </h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {company?.name}
              </p>
            </div>
          </div>

          {/* Company logo kanan */}
          <Link to={`/c/${slug}`} className="flex items-center gap-3" style={{ textDecoration: "none" }}>
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "rgba(74,158,255,0.12)", border: "1px solid rgba(74,158,255,0.2)" }}>
              {company?.logo_path ? (
                <img src={`http://localhost:8000/storage/${company.logo_path}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold" style={{ color: "#4a9eff" }}>
                  {company?.name?.charAt(0)}
                </span>
              )}
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {activeMenu === "overview" && <OverviewTab company={company} submission={submission} user={user} statusCfg={statusCfg} />}
          {activeMenu === "submission" && <SubmissionTab submission={submission} statusCfg={statusCfg} />}
          {activeMenu !== "overview" && activeMenu !== "submission" && <ComingSoonTab menu={MENU.find(m => m.key === activeMenu)} />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────── Overview Tab ─────────────────────── */
function OverviewTab({ company, submission, user, statusCfg }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(45,125,210,0.2) 0%, rgba(74,158,255,0.08) 100%)", border: "1px solid rgba(74,158,255,0.2)" }}>
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#4a9eff" }} />
        <div className="relative z-10">
          <p className="text-xs font-medium mb-1" style={{ color: "rgba(74,158,255,0.8)" }}>Welcome back 👋</p>
          <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            You're part of the <span style={{ color: "#4a9eff" }}>{company?.name}</span> internship program.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Submission", value: submission ? "Submitted" : "—", color: "#4a9eff" },
          { label: "Status", value: submission ? statusCfg.label : "—", color: statusCfg.color },
          { label: "Position", value: submission?.vacancy?.positions?.[0]?.name ?? "—", color: "#5dd8d8" },
          { label: "Batch", value: submission?.vacancy?.batch ?? "—", color: "rgba(255,255,255,0.7)" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
            <p className="text-sm font-semibold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Company profile card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-semibold text-white">Company Profile</h3>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: company?.logo_path ? "transparent" : "rgba(74,158,255,0.12)", border: "1px solid rgba(74,158,255,0.2)" }}>
              {company?.logo_path ? (
                <img src={`http://localhost:8000/storage/${company.logo_path}`} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: "#4a9eff" }}>{company?.name?.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white mb-1">{company?.name}</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {company?.address && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(74,158,255,0.08)", color: "rgba(74,158,255,0.8)", border: "1px solid rgba(74,158,255,0.15)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    </svg>
                    {company.address}
                  </span>
                )}
                {company?.email && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {company.email}
                  </span>
                )}
              </div>
              {company?.description && (
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vacancy info */}
      {submission?.vacancy && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-semibold text-white">Your Internship Program</h3>
          </div>
          <div className="p-6">
            <h4 className="text-base font-semibold text-white mb-4">{submission.vacancy.title}</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {[
                { label: "Location", value: submission.vacancy.location, icon: "📍" },
                { label: "Duration", value: submission.vacancy.duration_months ? `${submission.vacancy.duration_months} months` : "—", icon: "⏱" },
                { label: "Type", value: submission.vacancy.type ?? "—", icon: "💼" },
                { label: "Batch", value: submission.vacancy.batch ?? "—", icon: "📋" },
                { label: "Deadline", value: submission.vacancy.deadline ?? "—", icon: "📅" },
                { label: "Payment", value: submission.vacancy.payment_type ?? "—", icon: "💳" },
              ].map((info) => (
                <div key={info.label} className="rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{info.icon} {info.label}</p>
                  <p className="text-sm font-medium text-white capitalize">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Positions */}
            {submission.vacancy.positions?.length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Available Positions</p>
                <div className="flex flex-wrap gap-2">
                  {submission.vacancy.positions.map((pos) => (
                    <span key={pos.id_position} className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: "rgba(93,216,216,0.1)", color: "#5dd8d8", border: "1px solid rgba(93,216,216,0.2)" }}>
                      {pos.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Submission Tab ─────────────────────── */
function SubmissionTab({ submission, statusCfg }) {
  if (!submission) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.15)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">No submission found</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Your submission will appear here once registered.</p>
        </div>
      </div>
    );
  }

  const files = [
    { label: "CV", key: "cv_file", icon: "📄" },
    { label: "Cover Letter", key: "cover_letter_file", icon: "✉️" },
    { label: "Institution Letter", key: "institution_letter_file", icon: "🏛️" },
    { label: "Portfolio", key: "portfolio_file", icon: "🗂️" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status banner */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${statusCfg.color}20` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={statusCfg.color} strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: statusCfg.color }}>{statusCfg.label}</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      {/* Vacancy info */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-semibold text-white">Applied Program</h3>
        </div>
        <div className="p-6">
          <h4 className="text-base font-semibold text-white mb-1">{submission.vacancy?.title ?? "—"}</h4>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Batch {submission.vacancy?.batch} · {submission.vacancy?.location}
          </p>
          {submission.vacancy?.positions?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {submission.vacancy.positions.map((pos) => (
                <span key={pos.id_position} className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(93,216,216,0.1)", color: "#5dd8d8", border: "1px solid rgba(93,216,216,0.2)" }}>
                  {pos.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Uploaded files */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-semibold text-white">Submitted Documents</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {files.map((f) => (
            <div key={f.key} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-lg">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">{f.label}</p>
                <p className="text-xs truncate" style={{ color: submission[f.key] ? "#4a9eff" : "rgba(255,255,255,0.3)" }}>
                  {submission[f.key] ? "Uploaded" : "Not provided"}
                </p>
              </div>
              {submission[f.key] && (
                <a href={`http://localhost:8000/storage/${submission[f.key]}`}
                  target="_blank" rel="noreferrer"
                  className="text-xs px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: "rgba(74,158,255,0.1)", color: "#4a9eff", border: "1px solid rgba(74,158,255,0.2)", textDecoration: "none" }}>
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Coming Soon Tab ─────────────────────── */
function ComingSoonTab({ menu }) {
  return (
    <div className="max-w-4xl">
      <div className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.08)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.12)", color: "rgba(74,158,255,0.6)" }}>
          {menu?.icon}
        </div>
        <p className="text-base font-semibold text-white mb-1">{menu?.label}</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>This feature is coming soon.</p>
      </div>
    </div>
  );
}