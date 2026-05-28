import { useState, useEffect } from "react";
import { LayoutDashboard, BookOpen, User, Award, LogOut, MapPin } from "lucide-react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getScopedRole, debugUserRole } from "../../utils/roleUtils";

const API_BASE_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`;

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
function CompetencyCard({ title, hours, score, maxScore, status }) {
  const dotColor = status === "Done" ? "bg-emerald-500" : "bg-indigo-400";

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <div>
          <p className="text-sm font-medium text-slate-700">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{hours}</p>
        </div>
      </div>
      {score !== undefined ? (
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-emerald-600 font-semibold">{score}/{maxScore}</span>
          <div className="w-16">
            <ProgressBar value={score} max={maxScore} color="bg-emerald-500" />
          </div>
        </div>
      ) : (
        <span className="text-xs text-indigo-500 font-medium">Active</span>
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

import SidebarCandidate from "../../components/SidebarCandidate";
// --- Task Card ---
function TaskItem({ title, status, deadline }) {
  const statusStyles = {
    "Done": "bg-emerald-50 text-emerald-600 border-emerald-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
    "Pending": "bg-amber-50 text-amber-600 border-amber-200",
  };
  const dotColors = {
    "Done": "bg-emerald-500",
    "In Progress": "bg-blue-500",
    "Pending": "bg-amber-400",
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[status]}`} />
        <div>
          <p className="text-sm font-medium text-slate-700">{title}</p>
          {deadline && <p className="text-xs text-slate-400 mt-0.5">Due: {deadline}</p>}
        </div>
      </div>
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border whitespace-nowrap ${statusStyles[status]}`}>
        {status}
      </span>
    </div>
  );
}

// --- Role-based Redirect Component ---
// TODO: This will work once backend provides scoped_role field and creates
// /member/tasks, /member/dashboard, /leader/dashboard, /leader/team endpoints
function CandidateDashboardWithRedirect() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // FOR NOW: Just show base dashboard
  // Backend doesn't have scoped_role field or member/leader endpoints yet
  console.log("DEBUG: Backend role detection pending - showing base dashboard");

  return <EarlyPathDashboard />;
}

// --- Main Dashboard ---
// BACKEND INTEGRATION:
// - Fetches candidate profile, apprentice status, interviews, tests, and competencies from /candidate/dashboard
// - Auto-refreshes every 10 seconds to reflect real-time updates from HR
// - Data display is conditional based on apprentice status:
//   * Screening (pending): Shows only screening hint, no tests/competencies/tasks
//   * Accepted/Active: Shows all available data (interviews, tests, competencies, tasks)
// - Interview and test links appear automatically when HR sends them
// - No manual refresh needed - system monitors changes automatically
function EarlyPathDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const { logout: globalLogout } = useAuthStore();

  useEffect(() => {
    setError(null);
    fetchDashboardData();
    // Removed auto-refresh - user can refresh manually with button instead
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
          await globalLogout();
          navigate("/", { replace: true });
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      console.log("📊 Dashboard Data from Backend:", data);
      console.log("🧪 Test Data:", data.data?.test);
      setDashboardData(data.data);
      
      // Sync role to store
      if (data.data?.profile?.scoped_role || data.data?.profile?.is_leader !== undefined) {
        useAuthStore.getState().setUser({ 
          scoped_role: data.data.profile.scoped_role,
          is_leader: data.data.profile.is_leader
        });
      }

      setError(null);
      // Fetch member tasks after dashboard loads
      const isLeader = data.data?.profile?.is_leader;
	fetchMemberTasks(isLeader);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberTasks = async (isLeader = false) => {
    try {
      setTasksLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const endpoint = isLeader ? `${API_BASE_URL}/leader/tasks` : `${API_BASE_URL}/member/tasks`;
	const response = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (isLeader && Array.isArray(data.data)) {
          const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id_user : null;
	  const leaderTasks = data.data.flatMap(t => (t.subtasks || []).flatMap(st => st.delegations || [])).filter(d => d.id_assignee === userId);
          setMemberTasks(leaderTasks);
        } else {
          setMemberTasks(data.data || []);
        }
        if (data.data?.scoped_role || data.data?.is_leader !== undefined) {
          useAuthStore.getState().setUser({ 
            scoped_role: data.data.scoped_role,
            is_leader: data.data.is_leader
          });
        }
      }
    } catch (err) {
      console.error("Error fetching member tasks:", err);
      // Don't show error, just keep empty array
    } finally {
      setTasksLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await globalLogout();
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setLogoutModal(false);
      navigate("/", { replace: true });
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
        <SidebarCandidate
          userName={userData.profile?.name}
          userPhoto={userData.profile?.photo_url || userData.profile?.photo_path}
          company={JSON.parse(localStorage.getItem("company"))}
          onLogout={handleLogout}
        />
        <main className="md:ml-56 pt-14 md:pt-0 flex-1 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <SidebarCandidate
        userName={profile?.name}
        userPhoto={profile?.photo_url || profile?.photo_path}
        company={JSON.parse(localStorage.getItem("company"))}
        onLogout={handleLogoutClick}
      />

      <main className="md:ml-56 pt-14 md:pt-0 flex-1 px-6 py-6 min-w-0 flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

        {loading && (
          <LoadingSpinner message="Loading dashboard..." />
        )}

        {!loading && (
                  <>  {apprentice && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 leading-none mb-2">Dashboard</h1>
          <p className="text-slate-500 text-sm leading-none">Track your internship progress and stay up to date.</p>
        </div>
         )}

                    {!apprentice ? (
              <div className="flex-1 flex items-center justify-center">
                {!vacancy && (
          <div>
            <div>
              <div className="flex flex-col items-center text-center gap-4">
              <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to EarlyPath!</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
              Apply for an internship program to get started. Once accepted, you'll unlock tasks, competencies, and certificates.
            </p>
            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {[
              { step: "1", label: "Apply for Program", done: false },
              { step: "2", label: "Get Accepted", done: false },
              { step: "3", label: "Start Internship", done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">{s.step}</span>
                <span className="text-[11px] font-medium text-slate-600">{s.label}</span>
              </div>
                {i < 2 && <span className="text-slate-300 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
              </div>
            ) : (
              <>

            {/* Profile Header */}
            {apprentice && <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 flex items-center gap-5 shadow-sm">
                        
            <div className="relative flex-shrink-0">
              {profile?.photo_url || profile?.photo_path ? (
                <img
                  src={profile?.photo_url || `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${profile?.photo_path}`}
                  alt={profile?.name}
                  style={{ borderRadius: '9999px', width: '64px', height: '64px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ borderRadius: '9999px', width: '64px', height: '64px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#4f46e5' }}>
                  {profile?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-800">{profile?.name || "User"}</h1>
                  {apprentice?.status && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(apprentice.status)}`}>
                      {formatStatus(apprentice.status)}
                    </span>
                  )}
                </div>
                {apprentice ? (
                  <>
                    <p className="text-sm text-slate-500 mt-1">
                      {apprentice?.position || profile?.major || "Candidate"}
                      {vacancy?.location && <> · <MapPin size={11} className="inline mb-0.5" /> {vacancy.location}</>}
                    </p>
                    {apprentice?.mentor_name && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User size={11} />
                          Mentor: <span className="font-medium text-slate-600 ml-0.5">{apprentice.mentor_name}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-[10px]">{memberTasks.length}</span>
                        <span>Tasks</span>
                      </div>
                      <span className="text-slate-200">|</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 font-bold text-[10px]">{memberTasks.filter(t => t.status === 'done').length}</span>
                        <span>Completed</span>
                      </div>
                      <span className="text-slate-200">|</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-5 h-5 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 font-bold text-[10px]">{competencyList.length}</span>
                        <span>Competencies</span>
                      </div>
                    </div>
                  </>
                  ) : (
                  <p className="text-sm text-slate-400 mt-1">
                    {profile?.university || profile?.major || "Candidate"}
                  </p>
                )}
              </div>
            </div>}

            {apprentice && <div className="flex flex-col gap-5">

            {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { label: "Total Tasks", value: memberTasks.length, color: "text-indigo-600", bg: "bg-white", border: "border-indigo-100", dot: "bg-indigo-400" },
                { label: "Completed", value: memberTasks.filter(t => t.status === 'done').length, color: "text-emerald-600", bg: "bg-white", border: "border-emerald-100", dot: "bg-emerald-400" },
                { label: "In Progress", value: memberTasks.filter(t => t.status === 'in_progress').length, color: "text-amber-500", bg: "bg-white", border: "border-amber-100", dot: "bg-amber-400" },
                { label: "Skills", value: competencyList.length, color: "text-purple-600", bg: "bg-white", border: "border-purple-100", dot: "bg-purple-400" },
              ].map((m, i) => (

                <div key={i} className={`${m.bg} border ${m.border} rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-1 shadow-sm hover:shadow-md transition-shadow`}>
                  <p className={`text-4xl font-extrabold ${m.color}`}>{m.value}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                    <p className="text-xs font-medium text-slate-500">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>

  {/* Main Grid */}
  <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-5 items-start">

    {/* Left Column */}
    <div className="flex flex-col gap-5">

      {/* Internship Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Internship Info</h2>
        {apprentice || vacancy ? (
          <div className="space-y-0">
            {[
              { label: "Type", value: vacancy?.type ? vacancy.type.charAt(0).toUpperCase() + vacancy.type.slice(1) : apprentice?.position || "-" },
              { label: "Location", value: vacancy?.location || "-" },
              { label: "Start Date", value: vacancy?.start_date ? new Date(vacancy.start_date).toLocaleDateString('en-US') : "-" },
              { label: "End Date", value: vacancy?.end_date ? new Date(vacancy.end_date).toLocaleDateString('en-US') : "-" },
              { label: "Status", value: (() => {
                const s = apprentice?.status?.toLowerCase();
                if (!s || s === 'pending') return 'Screening';
                if (s.startsWith('stage_')) return `Interview Stage ${parseInt(s.split('_')[1]) + 1}`;
                return formatStatus(apprentice?.status);
              })(), badge: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-400 font-medium">{row.label}</span>
                {row.badge ? (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(apprentice?.status)}`}>
                    ● {row.value}
                  </span>
                ) : (
                  <span className="text-slate-700 font-medium text-right max-w-[55%] leading-snug">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">📋</div>
            <p className="text-sm font-medium text-slate-500">No internship yet</p>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">Apply for a program first.<br/>HR will assign you once accepted.</p>
          </div>
        )}
      </div>

      {/* Progress Card */}
      {apprentice && memberTasks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Task Progress</h2>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-800">
              {Math.round((memberTasks.filter(t => t.status === 'done').length / memberTasks.length) * 100)}%
            </span>
            <span className="text-xs text-slate-400 mb-1">{memberTasks.filter(t => t.status === 'done').length}/{memberTasks.length} completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="bg-emerald-500 rounded-full h-2 transition-all"
              style={{ width: `${Math.round((memberTasks.filter(t => t.status === 'done').length / memberTasks.length) * 100)}%` }}
            />
          </div>
          <div className="flex gap-3">
            {[
              { label: "Done", value: memberTasks.filter(t => t.status === 'done').length, color: "bg-emerald-500" },
              { label: "On Going", value: memberTasks.filter(t => t.status === 'in_progress').length, color: "bg-amber-400" },
              { label: "Pending", value: memberTasks.filter(t => t.status !== 'done' && t.status !== 'in_progress').length, color: "bg-slate-300" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                {s.label} <span className="font-semibold text-slate-700">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screening hint */}
      {apprentice?.status === 'pending' && (!interviews || interviews.length === 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Currently in Screening</p>
              <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                Your application is being reviewed. An interview schedule will appear here once HR sets it up.
              </p>
            </div>
          </div>
      )}

      {/* Interview Section */}
      {interviews && interviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Interview Schedule</h2>
          <div className="space-y-3">
            {interviews.map((interview, idx) => {
              const interviewDateTime = interview.interview_date && interview.interview_time
                ? new Date(`${interview.interview_date}T${interview.interview_time}`).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                : 'TBD';
              const link = interview.link || interview.interview_link;
              const notes = interview.notes || interview.interview_notes;
              const isPassed = interview.status === 'passed';
              const isFailed = interview.status === 'failed';
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Interview {idx + 1}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : isFailed ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                      ● {interview.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Schedule</span>
                    <span className="text-slate-700 font-medium text-right">{interviewDateTime}</span>
                  </div>
                  {link && (
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                      <span className="text-slate-400 font-medium">Link</span>
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5">
                        🎥 Join Interview →
                      </a>
                    </div>
                  )}
                  {notes && (
                    <div className="flex justify-between items-start text-sm py-1.5">
                      <span className="text-slate-400 font-medium">Notes</span>
                      <span className="text-slate-700 font-medium text-right max-w-[60%] leading-snug">{notes}</span>
                    </div>
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

      {/* My Tasks */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">My Tasks</h2>
          {memberTasks.length > 0 && (
            <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">
              {memberTasks.length} Active
            </span>
          )}
        </div>
        {tasksLoading ? (
          <div className="py-6 text-center">
            <div className="inline-block w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading tasks...</p>
          </div>
        ) : apprentice?.status === 'pending' ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">Tasks will appear once your application is reviewed</p>
          </div>
        ) : memberTasks.length > 0 ? (
          <div>
            <div className="space-y-0">
              {memberTasks.slice(0, 5).map((task) => (
                <TaskItem
                  key={task.id_task}
                  title={task.title}
                  status={task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'Pending'}
                  deadline={task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null}
                />
              ))}
            </div>
            {memberTasks.length > 5 && (
              <button
                onClick={() => navigate(`/c/${JSON.parse(localStorage.getItem("company"))?.id_company}/member/tasks`)}
                className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-3 mt-2 border-t border-slate-100"
              >
                View all {memberTasks.length} tasks →
              </button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No tasks assigned yet</p>
            <p className="text-xs text-slate-400 mt-1">Tasks will appear once your mentor assigns you</p>
          </div>
        )}
      </div>

      {/* Competencies */}
      {apprentice?.status === 'active' || apprentice?.status === 'accepted' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Competencies</h2>
            <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">
              {competencyList.length} Skills
            </span>
          </div>
          <div>
            {competencyList.length > 0 ? (
              competencyList.map((c, i) => <CompetencyCard key={i} {...c} />)
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No competencies available</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-sm font-medium text-slate-500">Competencies locked</p>
            <p className="text-[11px] text-slate-400">Will unlock once you're accepted into a program</p>
          </div>
        </div>
      )}

      {/* Assessment */}
      {dashboardData?.test && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Assessment</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Test Name</span>
              <span className="text-slate-700 font-medium">{dashboardData.test.test_name || "Test"}</span>
            </div>
            {dashboardData.test.test_date && (
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Schedule</span>
                <span className="text-slate-700 font-medium">
                  {new Date(dashboardData.test.test_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {dashboardData.test.test_time && ` · ${dashboardData.test.test_time}`}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Score</span>
              {dashboardData.test.test_score ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  {dashboardData.test.test_score}/100
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
            {dashboardData.test.test_link && (
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Link</span>
                <a href={dashboardData.test.test_link} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5">
                  🔗 Open Test Link →
                </a>
              </div>
            )}
            {dashboardData.test.test_notes && (
              <div className="flex justify-between items-start text-sm py-1.5">
                <span className="text-slate-400 font-medium">Notes</span>
                <span className="text-slate-700 font-medium text-right max-w-[60%] leading-snug">{dashboardData.test.test_notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div> {/* End Right Column */}
  </div> {/* End Main Grid */}
</div> }{/* End Flex Wrapper */}
           <p className="text-center text-xs text-slate-400 py-2">
              © 2026 EarlyPath · All rights reserved
            </p>
              </>
            )}
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

// Export the wrapper component with redirect logic
export default CandidateDashboardWithRedirect;
