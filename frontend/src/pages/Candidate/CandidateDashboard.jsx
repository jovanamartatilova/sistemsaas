import { useState, useEffect, useRef } from "react";
import { LogOut, MapPin, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import SidebarCandidate from "../../components/SidebarCandidate";

const API_BASE_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`;

// ─── Shared Task Status Color Map ───────────────────────────────────────────
const TASK_COLORS = {
  done:        { bg: "bg-emerald-500", hex: "#10b981", label: "Done",        badge: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  in_progress: { bg: "bg-amber-400",   hex: "#fbbf24", label: "In Progress", badge: "bg-blue-50 text-blue-600 border-blue-200" },
  pending:     { bg: "bg-slate-300",   hex: "#cbd5e1", label: "Pending",     badge: "bg-amber-50 text-amber-600 border-amber-200" },
};

// ─── Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ done, inProgress, pending, total }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const R = 58;
  const strokeWidth = 22;
  const gap = 3; // degrees gap between segments

  const pct = (n) => (total > 0 ? n / total : 0);
  const segments = [
    { key: "done",        value: done,       color: TASK_COLORS.done.hex },
    { key: "in_progress", value: inProgress, color: TASK_COLORS.in_progress.hex },
    { key: "pending",     value: pending,    color: TASK_COLORS.pending.hex },
  ].filter((s) => s.value > 0);

  const circumference = 2 * Math.PI * R;
  const totalGapDeg = segments.length * gap;
  const availableDeg = 360 - totalGapDeg;

  // Build arc paths
  let currentAngle = -90;
  const arcs = segments.map((seg) => {
    const segDeg = pct(seg.value) * availableDeg;
    const startAngle = currentAngle + gap / 2;
    const endAngle = startAngle + segDeg;
    currentAngle = endAngle + gap / 2;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + R * Math.cos(toRad(startAngle));
    const y1 = cy + R * Math.sin(toRad(startAngle));
    const x2 = cx + R * Math.cos(toRad(endAngle));
    const y2 = cy + R * Math.sin(toRad(endAngle));
    const largeArc = segDeg > 180 ? 1 : 0;

    return {
      ...seg,
      d: `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
    };
  });

  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
  <div className="flex flex-row items-center gap-6 w-full">
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* background ring */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {/* segments */}
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          ) : (
            arcs.map((arc) => (
              <path
                key={arc.key}
                d={arc.d}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            ))
          )}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-slate-800 leading-none">{progressPct}%</span>
          <span className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-wide">DONE</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {[
          { key: "done",        value: done,       label: "Done" },
          { key: "in_progress", value: inProgress, label: "In Progress" },
          { key: "pending",     value: pending,    label: "Pending" },
        ].map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: TASK_COLORS[s.key].hex }}
            />
            <span className="text-xs text-slate-500 flex-1">{s.label}</span>
            <span className="text-xs font-semibold text-slate-700">
              {s.value}
              <span className="font-normal text-slate-400 ml-1">
                ({total > 0 ? Math.round((s.value / total) * 100) : 0}%)
              </span>
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-2 mt-1">
          <span className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-1">Total</span>
          <span className="text-xs font-bold text-slate-700">{total} Tasks</span>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = "bg-indigo-500", height = "h-1.5" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={`w-full bg-slate-100 rounded-full ${height}`}>
      <div className={`${color} rounded-full ${height} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Competency Card ─────────────────────────────────────────────────────────
function CompetencyCard({ title, hours, status }) {
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
      <span className="text-xs text-indigo-500 font-medium">Active</span>
    </div>
  );
}

// ─── Task Item (integrated colors from TASK_COLORS) ──────────────────────────
function TaskItem({ title, status, deadline }) {
  // status here arrives as "Done" | "In Progress" | "Pending"
  const keyMap = { "Done": "done", "In Progress": "in_progress", "Pending": "pending" };
  const key = keyMap[status] || "pending";
  const color = TASK_COLORS[key];

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        <span
          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${color.bg}`}
        />
        <div>
          <p className="text-sm font-medium text-slate-700">{title}</p>
          {deadline && <p className="text-xs text-slate-400 mt-0.5">Due: {deadline}</p>}
        </div>
      </div>
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border whitespace-nowrap ${color.badge}`}>
        {status}
      </span>
    </div>
  );
}

// ─── Role-based Redirect ─────────────────────────────────────────────────────
function CandidateDashboardWithRedirect() {
  return <EarlyPathDashboard />;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
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

  const [submissionList, setSubmissionList] = useState([]);
const [selectedSubmission, setSelectedSubmission] = useState(null);
const [submissionsLoading, setSubmissionsLoading] = useState(true);

const fetchSubmissions = async () => {
  try {
    setSubmissionsLoading(true);
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE_URL}/submissions`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    const list = (data.data || []).filter(s => s.status !== 'rejected' && s.status !== 'draft');
    setSubmissionList(list);

    // Restore pilihan sebelumnya dari localStorage
    const savedId = localStorage.getItem("selected_submission_id");
    const found = list.find(s => s.id_submission === savedId) || list[0];
    setSelectedSubmission(found || null);
  } catch (err) {
    console.error("Error fetching submissions:", err);
  } finally {
    setSubmissionsLoading(false);
  }
};

  // Ganti useEffect yang lama
useEffect(() => {
  fetchSubmissions();
}, []);

useEffect(() => {
  if (selectedSubmission) {
    localStorage.setItem("selected_submission_id", selectedSubmission.id_submission);
    fetchDashboardData(selectedSubmission.id_submission);
  }
}, [selectedSubmission]);

  // Ubah signature fetchDashboardData
const fetchDashboardData = async (idSubmission) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (!token) { setError("No authentication token found"); setLoading(false); return; }

    const url = idSubmission
      ? `${API_BASE_URL}/candidate/dashboard?id_submission=${idSubmission}`
      : `${API_BASE_URL}/candidate/dashboard`;

    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      if (response.status === 401) { await globalLogout(); navigate("/", { replace: true }); return; }
      throw new Error("Failed to fetch dashboard data");
    }
    const data = await response.json();
    setDashboardData(data.data);
    if (data.data?.profile?.scoped_role || data.data?.profile?.is_leader !== undefined) {
      useAuthStore.getState().setUser({
        scoped_role: data.data.profile.scoped_role,
        is_leader: data.data.profile.is_leader
      });
    }
    setError(null);
    fetchMemberTasks(data.data?.profile?.is_leader);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const fetchMemberTasks = async (isLeader = false) => {
    try {
      setTasksLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const endpoint = isLeader ? `${API_BASE_URL}/leader/tasks` : `${API_BASE_URL}/member/tasks`;
      const response = await fetch(endpoint, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
      if (response.ok) {
        const data = await response.json();
        if (isLeader && Array.isArray(data.data)) {
          const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id_user : null;
          const leaderTasks = data.data.flatMap(t => (t.subtasks || []).flatMap(st => st.delegations || [])).filter(d => d.id_assignee === userId);
          setMemberTasks(leaderTasks);
        } else {
          setMemberTasks(data.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching member tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  const confirmLogout = async () => {
    try { await globalLogout(); } catch (err) { console.error(err); } finally {
      setLogoutModal(false);
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const userData = dashboardData ? {
    profile: dashboardData.profile,
    apprentice: dashboardData.apprentice,
    vacancy: dashboardData.vacancy,
    interviews: dashboardData.interviews,
    competencies: dashboardData.competencies,
  } : { profile: null, apprentice: null, vacancy: null, interviews: [], competencies: [] };

  const formatStatus = (status) => {
    const map = { pending: "Screening", accepted: "Accepted", rejected: "Rejected", active: "Active", inactive: "Inactive" };
    return map[status?.toLowerCase()] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown");
  };

  const getStatusColor = (status) => {
    const n = status?.toLowerCase();
    if (n === "accepted" || n === "active") return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (n === "rejected") return "bg-rose-50 text-rose-600 border-rose-200";
    return "bg-amber-50 text-amber-600 border-amber-200";
  };

  const competencyList = (userData.competencies || []).map((comp) => ({
    title: comp.name,
    hours: `${comp.learning_hours} learning hours`,
    status: "Active",
  }));

  const { profile, apprentice, vacancy, interviews } = userData;
  const company = JSON.parse(localStorage.getItem("company") || "{}");

  const doneTasks       = memberTasks.filter(t => t.status === "done").length;
  const inProgressTasks = memberTasks.filter(t => t.status === "in_progress").length;
  const pendingTasks    = memberTasks.filter(t => t.status !== "done" && t.status !== "in_progress").length;
  const progressPct     = memberTasks.length > 0 ? Math.round((doneTasks / memberTasks.length) * 100) : 0;

  // ── Error / Loading shell ─────────────────────────────────────────────────
  if (error || (!dashboardData && !loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
        <SidebarCandidate userName={profile?.name} userPhoto={profile?.photo_url || profile?.photo_path} company={company} onLogout={() => setLogoutModal(true)} />
        <main className="md:ml-56 pt-14 md:pt-0 flex-1 flex items-center justify-center">
          {loading ? <LoadingSpinner message="Loading dashboard..." /> : (
            <div className="text-center">
              <p className="text-slate-600 mb-4">{error || "Failed to load dashboard"}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={fetchDashboardData} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
                <button onClick={() => navigate("/")} className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400">Back Home</button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <SidebarCandidate
        userName={profile?.name}
        userPhoto={profile?.photo_url || profile?.photo_path}
        company={company}
        onLogout={() => setLogoutModal(true)}
      />

      <main className="md:ml-56 pt-14 md:pt-0 flex-1 px-6 py-6 min-w-0 flex flex-col gap-5">

        {loading && <LoadingSpinner message="Loading dashboard..." />}

        {!loading && (
          <>
            {/* ── No apprentice: welcome state ── */}
            {!apprentice ? (
              <div className="flex-1 flex items-center justify-center">
                {!vacancy && (
                  <div className="flex flex-col items-center text-center gap-4">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to EarlyPath!</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                      Apply for an internship program to get started. Once accepted, you'll unlock tasks, competencies, and certificates.
                    </p>
                    <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                      {[{ step: "1", label: "Apply for Program" }, { step: "2", label: "Get Accepted" }, { step: "3", label: "Start Internship" }].map((s, i) => (
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
                )}
              </div>
            ) : (
              <>
                {/* ── Page heading ── */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-none mb-1">Dashboard</h1>
                  <p className="text-slate-500 text-sm leading-none">Track your internship progress and stay up to date.</p>
                </div>

                {/* ── Submission Switcher ── */}
{submissionList.length > 1 && (
  <div className="flex gap-2 flex-wrap">
    {submissionList.map((sub) => {
      const isActive = selectedSubmission?.id_submission === sub.id_submission;
      return (
        <button
          key={sub.id_submission}
          onClick={() => setSelectedSubmission(sub)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            isActive
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
          }`}
        >
          {sub.name} · {sub.company}
          {sub.batch && <span className={`ml-1 ${isActive ? "text-indigo-200" : "text-slate-400"}`}>· {sub.batch}</span>}
        </button>
      );
    })}
  </div>
)}

                {/* ── Hero Profile Banner ── */}
                <div
                  className="rounded-2xl px-6 py-5 flex items-center gap-5 relative overflow-hidden"
                  style={{ background: "linear-gradient(130deg, #4338ca 0%, #6366f1 55%, #818cf8 100%)" }}
                >
                  <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
                  <div className="absolute right-[60px] bottom-[-60px] w-36 h-36 rounded-full" style={{ background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

                  {/* Avatar */}
                  <div className="relative flex-shrink-0 z-10">
                    {profile?.photo_url || profile?.photo_path ? (
                      <img
                        src={profile?.photo_url || `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${profile?.photo_path}`}
                        alt={profile?.name}
                        className="w-16 h-16 rounded-full object-cover border-[3px] border-white/40"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-[3px] border-white/40 bg-white flex items-center justify-center text-xl font-extrabold text-indigo-600">
                        {profile?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-indigo-600" />
                  </div>

                  {/* Name + pills */}
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-xl font-extrabold text-white">{profile?.name || "User"}</h2>
                      {apprentice?.status && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusColor(apprentice.status)}`}>
                          {formatStatus(apprentice.status)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/75 mb-3">
                      {apprentice?.position || profile?.major || "Candidate"}
                      {vacancy?.location && <> · <MapPin size={11} className="inline mb-0.5" /> {vacancy.location}</>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {apprentice?.mentor_name && (
                        <span className="text-xs px-3 py-1 rounded-full border border-white/25 bg-white/15 text-white font-medium flex items-center gap-1.5">
                          <User size={10} /> Mentor: {apprentice.mentor_name}
                        </span>
                      )}
                      <span className="text-xs px-3 py-1 rounded-full border border-white/25 bg-white/15 text-white font-medium">
                        {memberTasks.length} Tasks · {doneTasks} Done · {competencyList.length} Skills
                      </span>
                    </div>
                  </div>

                  {/* Meta dates */}
                  <div className="flex flex-col gap-2 z-10 flex-shrink-0 text-right">
                    {vacancy?.start_date && (
                      <p className="text-xs text-white/70">Start <span className="font-semibold text-white ml-1">{new Date(vacancy.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></p>
                    )}
                    {vacancy?.end_date && (
                      <p className="text-xs text-white/70">End <span className="font-semibold text-white ml-1">{new Date(vacancy.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></p>
                    )}
                    {vacancy?.type && (
                      <p className="text-xs text-white/70">Type <span className="font-semibold text-white ml-1">{vacancy.type.charAt(0).toUpperCase() + vacancy.type.slice(1)}</span></p>
                    )}
                  </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Total Tasks", value: memberTasks.length, numColor: "text-indigo-600", dot: "bg-indigo-400", accent: "bg-indigo-500", border: "border-indigo-100" },
                    { label: "Completed",   value: doneTasks,          numColor: "text-emerald-600", dot: "bg-emerald-400", accent: "bg-emerald-500", border: "border-emerald-100" },
                    { label: "In Progress", value: inProgressTasks,    numColor: "text-amber-500",  dot: "bg-amber-400",   accent: "bg-amber-500",   border: "border-amber-100" },
                    { label: "Skills",      value: competencyList.length, numColor: "text-purple-600", dot: "bg-purple-400", accent: "bg-purple-500", border: "border-purple-100" },
                  ].map((m, i) => (
                    <div key={i} className={`bg-white border ${m.border} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
                      <div className={`h-1 ${m.accent}`} />
                      <div className="px-5 py-4 flex flex-col items-center text-center gap-1">
                        <p className={`text-4xl font-extrabold ${m.numColor}`}>{m.value}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                          <p className="text-xs font-medium text-slate-500">{m.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Main 2-col grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

                  {/* ══ LEFT COLUMN ══ */}
                  <div className="flex flex-col gap-5">

                    {/* Internship Info */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Internship Info</h2>
                      {[
                        { label: "Type",       value: vacancy?.type ? vacancy.type.charAt(0).toUpperCase() + vacancy.type.slice(1) : apprentice?.position || "-" },
                        { label: "Location",   value: vacancy?.location || "-" },
                        { label: "Start Date", value: vacancy?.start_date ? new Date(vacancy.start_date).toLocaleDateString("en-US") : "-" },
                        { label: "End Date",   value: vacancy?.end_date   ? new Date(vacancy.end_date).toLocaleDateString("en-US")   : "-" },
                        {
                          label: "Status", badge: true, value: (() => {
                            const s = apprentice?.status?.toLowerCase();
                            if (!s || s === "pending") return "Screening";
                            if (s.startsWith("stage_")) return `Interview Stage ${parseInt(s.split("_")[1]) + 1}`;
                            return formatStatus(apprentice?.status);
                          })()
                        },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center text-sm py-2.5 border-b border-slate-50 last:border-0">
                          <span className="text-slate-400 font-medium">{row.label}</span>
                          {row.badge ? (
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getStatusColor(apprentice?.status)}`}>● {row.value}</span>
                          ) : (
                            <span className="text-slate-700 font-medium text-right max-w-[55%] leading-snug">{row.value}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* ── Task Progress — DONUT CHART ── */}
                    {memberTasks.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Task Progress</h2>
                        <div className="flex items-center justify-center">
                          <DonutChart
                            done={doneTasks}
                            inProgress={inProgressTasks}
                            pending={pendingTasks}
                            total={memberTasks.length}
                          />
                        </div>
                      </div>
                    )}

                    {/* Screening hint */}
                    {apprentice?.status === "pending" && (!interviews || interviews.length === 0) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-sm font-semibold text-blue-800">Currently in Screening</p>
                        <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                          Your application is being reviewed. An interview schedule will appear here once HR sets it up.
                        </p>
                      </div>
                    )}

                    {/* Interview Schedule */}
                    {interviews && interviews.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Interview Schedule</h2>
                        <div className="space-y-3">
                          {interviews.map((interview, idx) => {
                            const interviewDateTime = interview.interview_date && interview.interview_time
                              ? new Date(`${interview.interview_date}T${interview.interview_time}`).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
                              : "TBD";
                            const link  = interview.link  || interview.interview_link;
                            const notes = interview.notes || interview.interview_notes;
                            const isPassed = interview.status === "passed";
                            const isFailed = interview.status === "failed";
                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                                  <span className="text-slate-400 font-medium">Interview {idx + 1}</span>
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${isPassed ? "bg-emerald-50 text-emerald-600 border-emerald-200" : isFailed ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                                    ● {interview.status || "pending"}
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

                    {/* Assessment */}
                    {dashboardData?.test && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Assessment</h2>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                            <span className="text-slate-400 font-medium">Test Name</span>
                            <span className="text-slate-700 font-medium">{dashboardData.test.test_name || "Test"}</span>
                          </div>
                          {dashboardData.test.test_date && (
                            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                              <span className="text-slate-400 font-medium">Schedule</span>
                              <span className="text-slate-700 font-medium">
                                {new Date(dashboardData.test.test_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                {dashboardData.test.test_time && ` · ${dashboardData.test.test_time}`}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                            <span className="text-slate-400 font-medium">Score</span>
                            {dashboardData.test.test_score ? (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">{dashboardData.test.test_score}/100</span>
                            ) : (
                              <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">Pending</span>
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
                  </div>

                  {/* ══ RIGHT COLUMN ══ */}
                  <div className="flex flex-col gap-5">

                    {/* My Tasks — colors from TASK_COLORS (same as donut) */}
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
                          <div className="inline-block w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                          <p className="text-xs text-slate-400 mt-2">Loading tasks...</p>
                        </div>
                      ) : apprentice?.status === "pending" ? (
                        <div className="py-8 text-center">
                          <p className="text-sm text-slate-400">Tasks will appear once your application is reviewed</p>
                        </div>
                      ) : memberTasks.length > 0 ? (
                        <div>
                          {memberTasks.slice(0, 7).map((task) => (
                            <TaskItem
                              key={task.id_task}
                              title={task.title}
                              status={task.status === "in_progress" ? "In Progress" : task.status === "done" ? "Done" : "Pending"}
                              deadline={task.deadline ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null}
                            />
                          ))}
                          {memberTasks.length > 7 && (
                            <button
                              onClick={() => navigate(`/c/${company?.id_company}/member/tasks`)}
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
                    {(apprentice?.status === "active" || apprentice?.status === "accepted") ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Competencies</h2>
                          <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">
                            {competencyList.length} Skills
                          </span>
                        </div>
                        {competencyList.length > 0 ? (
                          competencyList.map((c, i) => <CompetencyCard key={i} {...c} />)
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-4">No competencies available</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                        <p className="text-sm font-medium text-slate-500">Competencies locked</p>
                        <p className="text-[11px] text-slate-400 mt-1">Will unlock once you're accepted into a program</p>
                      </div>
                    )}

                  </div>
                </div>

                <p className="text-center text-xs text-slate-400 py-2">© 2026 EarlyPath · All rights reserved</p>
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

export default CandidateDashboardWithRedirect;