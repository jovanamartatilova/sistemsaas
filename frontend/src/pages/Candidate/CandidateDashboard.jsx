import { useState, useEffect } from "react";
import { LayoutDashboard, BookOpen, User, Award, LogOut, MapPin } from "lucide-react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// --- Progress Bar ---
function ProgressBar({ value, max, color = "bg-indigo-500", height = "h-1.5" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={`w-full bg-slate-100 rounded-full ${height}`}>
      <div className={`${color} rounded-full ${height} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// --- Competency Card ---
function CompetencyCard({ title, hours, projects, score, maxScore, status, progress }) {
  const statusColor = status === "Done" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200";
  const dotColor = status === "Done" ? "bg-emerald-500" : "bg-indigo-500";
  const barColor = status === "Done" ? "bg-emerald-500" : "bg-indigo-500";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${dotColor}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="text-xs text-slate-500">{hours} · {projects}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>{status}</span>
      </div>
      {score !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Score Evaluation</span>
            <span className="text-emerald-600 font-semibold">{score} / {maxScore}</span>
          </div>
          <ProgressBar value={score} max={maxScore} color="bg-emerald-500" />
        </div>
      )}
    </div>
  );
}

// --- Certificate Card ---
function CertificateCard({ subject, date }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Competency Certificate</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{subject}</p>
          <p className="text-xs text-slate-400 mt-0.5">Issued: {date}</p>
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
          Download PDF
        </button>
      </div>
    </div>
  );
}

// --- Sidebar ---
function Sidebar({ userName, onLogout }) {
  const { slug } = useParams();
  const company = JSON.parse(localStorage.getItem("company"));
  const resolvedSlug = slug || company?.slug;
  const location = useLocation();
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: `/c/${slug}/dashboard` },
    { label: "Programs", icon: <BookOpen size={16} />, to: `/c/${slug}/programs` },
    { label: "My Profile", icon: <User size={16} />, to: `/c/${slug}/profile` },
    { label: "Certificates", icon: <Award size={16} />, to: `/c/${slug}/certificates` },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[#0f1e3a] text-white flex flex-col px-4 py-6 fixed top-0 left-0 z-10">
      <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
        <img src="/assets/images/logo.png" alt="EarlyPath" className="h-16 w-auto" />
        <span className="font-bold text-lg tracking-tight">EarlyPath</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 px-2">
        {company?.logo_path ? (
          <img 
            src={`http://localhost:8000/storage/${company.logo_path}`} 
            alt="Company" 
            className="w-8 h-8 rounded-lg object-cover bg-white shadow-sm flex-shrink-0" 
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {company?.name?.charAt(0).toUpperCase() || "C"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-300 truncate font-medium">{company?.name || "Company"}</p>
          <p className="text-xs text-slate-400 truncate">{userName || "User"}</p>
        </div>
        <button
          onClick={onLogout}
          className="text-slate-500 hover:text-white cursor-pointer transition-colors flex-shrink-0"
          title="Logout"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

// --- Main Dashboard ---
export default function EarlyPathDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [skillFilter, setSkillFilter] = useState("Active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const { logout: globalLogout } = useAuthStore();

  useEffect(() => {
    setError(null);
    fetchDashboardData();
  }, [location.pathname]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/candidate/dashboard`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          localStorage.removeItem("company");
          localStorage.removeItem("user");
          localStorage.removeItem("candidate_user");
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("company");
      localStorage.removeItem("user");
      localStorage.removeItem("candidate_user");
      setLogoutModal(false);
      navigate("/");
    }
  };

  const handleLogout = handleLogoutClick;

  if (loading) {
    // Loading state will be shown inside main with Sidebar visible
  }

  const userData = dashboardData ? {
    profile: dashboardData.profile,
    apprentice: dashboardData.apprentice,
    vacancy: dashboardData.vacancy,
    interviews: dashboardData.interviews,
    learning_progress: dashboardData.learning_progress,
    competencies: dashboardData.competencies,
  } : { profile: null, apprentice: null, vacancy: null, interviews: [], learning_progress: null, competencies: [] };

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <Sidebar userName={userData.profile?.name} onLogout={handleLogout} />
        <main className="ml-56 flex-1 flex items-center justify-center">
          {loading ? (
            <LoadingSpinner message="Loading dashboard..." />
          ) : (
            <div className="text-center">
              <p className="text-slate-600 mb-4">{error || "Failed to load dashboard"}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Retry
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
                >
                  Back Home
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  const { profile, apprentice, vacancy, interviews, learning_progress, competencies } = userData;

  // Format status display
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Screening',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'active': 'Active',
      'inactive': 'Inactive',
    };
    return statusMap[status?.toLowerCase()] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown');
  };

  const getStatusColor = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === 'accepted' || normalized === 'active') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    } else if (normalized === 'rejected') {
      return 'bg-rose-50 text-rose-600 border-rose-200';
    }
    return 'bg-amber-50 text-amber-600 border-amber-200';
  };

  const competencyList = competencies.map((comp) => ({
    title: comp.name,
    hours: `${comp.learning_hours} learning hours`,
    projects: "0 projects",
    progress: 0,
    status: "Active",
  }));

  const filtered =
    skillFilter === "All"
      ? competencyList
      : competencyList.filter((c) => c.status === skillFilter);

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar userName={profile?.name} onLogout={handleLogoutClick} />

      <main className="ml-56 flex-1 px-6 py-6 space-y-5 min-w-0">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

        {loading && (
          <LoadingSpinner message="Loading dashboard..." />
        )}

        {!loading && (
          <>
            {/* Status Alert - Jika submissi masih pending atau apprentice belum ada */}
        {!vacancy && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center mt-0.5">
                <span className="text-white font-bold text-sm">!</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Application Under Review</h3>
                <p className="text-sm text-amber-800">
                  Thank you for applying! Your application is currently being reviewed by our HR team. We will send you an update via email. Please wait for further notification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-5 shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
              {profile?.name?.charAt(0).toUpperCase() || "R"}
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 text-left">{profile?.name || "User"}</h1>
            <p className="text-slate-500 text-sm mt-0.5 text-left">
              {apprentice?.position || "Position"} • {vacancy?.start_date ? new Date(vacancy.start_date).toLocaleDateString('en-US') : "Date"} – {vacancy?.location || "Location"}
            </p>
            {apprentice?.mentor_name && (
  <p className="text-xs text-slate-400 mt-0.5 text-left flex items-center gap-1">
    <User size={11} />
    Mentor: <span className="font-medium text-slate-600 ml-1">{apprentice.mentor_name}</span>
  </p>
)}
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={11} /> 
                {apprentice?.start_date && apprentice?.end_date
                  ? `${new Date(apprentice.start_date).toLocaleDateString('en-US')} – ${new Date(apprentice.end_date).toLocaleDateString('en-US')}`
                  : "Period not set"
                }
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                apprentice?.status === 'active'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                ● {apprentice?.status || "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex gap-6 flex-shrink-0 divide-x divide-slate-100">
            {[
              { value: `${competencies?.length || 0}`, label: "Competencies" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-6 first:pl-0 last:pr-0">
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                {stat.bar && (
                  <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-1.5 bg-indigo-500 rounded-full"
                      style={{ width: `${profile?.overall_progress || 0}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-[1fr_1.6fr] gap-5 items-start">

          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Apprentice Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Internship Info</h2>
              {apprentice || vacancy ? (
                <div className="space-y-3">
                  {[
                    { label: "Type", value: vacancy?.type || apprentice?.position || "-" },
                    { label: "Location", value: vacancy?.location || "-" },
                    { label: "Start Date", value: vacancy?.start_date ? new Date(vacancy.start_date).toLocaleDateString('en-US') : "-" },
                    { label: "End Date", value: vacancy?.end_date ? new Date(vacancy.end_date).toLocaleDateString('en-US') : "-" },
                    { label: "Status", value: formatStatus(apprentice?.status), badge: true, isStatus: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{row.label}</span>
                      {row.badge ? (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(apprentice?.status)}`}>
                          ● {row.value}
                        </span>
                      ) : (
                        <span className="text-slate-700 font-medium text-right max-w-[55%]">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-center py-4">
                  <p className="text-sm text-slate-500">No apprenticeship selected yet...</p>
                  <p className="text-xs text-slate-400">Internship data will appear once HR selects you</p>
                </div>
              )}
            </div>

            {/* Interview Section */}
            {interviews && interviews.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Interview Schedule</h2>
                <div className="space-y-4">
                  {interviews.map((interview, idx) => {
                    const interviewDateTime = interview.interview_date && interview.interview_time
                      ? new Date(`${interview.interview_date}T${interview.interview_time}`).toLocaleString('en-US')
                      : 'TBD';
                    
                    return (
                      <div key={idx} className="border border-slate-100 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Interview {idx + 1}</p>
                            <p className="text-sm font-medium text-slate-700 mt-1">Date & Time</p>
                            <p className="text-sm text-slate-600">{interviewDateTime}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border whitespace-nowrap ${
                            interview.status === 'passed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            interview.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            ● {interview.status || 'pending'}
                          </span>
                        </div>
                        {interview.link && (
                          <a
                            href={interview.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                          >
                            Join Meeting →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">
            {/* Competencies */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Competencies</h2>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                  {["All", "Active", "Completed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSkillFilter(f === "Completed" ? "Done" : f)}
                      className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                        skillFilter === (f === "Completed" ? "Done" : f) ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filtered.length > 0 ? (
                  filtered.map((c, i) => <CompetencyCard key={i} {...c} />)
                ) : (
                  <p className="text-slate-500 text-sm">No competencies available</p>
                )}
              </div>
            </div>
          </div>
        </div>



        <p className="text-center text-xs text-slate-400 py-2">
          © 2026 EarlyPath · All rights reserved
        </p>
          </>
        )}
      </main>

      {/* Logout Modal */}
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "left" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}>
              <LogOut size={20} />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Are you sure you want to sign out of your account?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}