import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, User, Award, LogOut,
  Search, ChevronDown, ChevronUp, CheckCircle, Clock,
  Users, BookMarked, Target,
} from "lucide-react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";

// --- Sidebar ---
function Sidebar({ userName, onLogout }) {
  const { slug } = useParams();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard",    icon: <LayoutDashboard size={16} />, to: `/c/${slug}/dashboard` },
    { label: "Programs",     icon: <BookOpen size={16} />,        to: `/c/${slug}/programs` },
    { label: "My Profile",   icon: <User size={16} />,            to: `/c/${slug}/profile` },
    { label: "Certificates", icon: <Award size={16} />,           to: `/c/${slug}/certificates` },
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
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
          {userName?.charAt(0).toUpperCase() || "R"}
        </div>
        <span className="text-sm text-slate-300 flex-1">{userName || "User"}</span>
        <button
          onClick={onLogout}
          className="text-slate-500 hover:text-white cursor-pointer transition-colors"
          title="Logout"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

// --- Competency Item (inside program card) ---
function CompetencyItem({ name, description, learning_hours }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-slate-100">
        <BookOpen size={12} className="text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700 text-left">{name}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5 text-left">{description}</p>}
      </div>
      <span className="ml-auto flex-shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium border bg-slate-50 text-slate-500 border-slate-200 whitespace-nowrap">
        {learning_hours} jam
      </span>
    </div>
  );
}

// --- Program Card ---
function ProgramCard({ program }) {
  const [expanded, setExpanded] = useState(false);
  const { id_position, name, description, quota, batch, company, learning_hours, competencies, completed_hours } = program;

  const isActive = learning_hours === "active";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className={`h-1.5 ${isActive ? "bg-gradient-to-r from-indigo-500 to-violet-400" : "bg-slate-200"}`} />

      <div className="p-6">
        {/* Header row — id_position + name di tengah */}
<div className="flex flex-col items-center text-center gap-1 mb-4">
  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
    {id_position}
  </p>
  <h3 className="text-base font-bold text-slate-800 leading-snug">{name}</h3>
  <span className="text-xs text-slate-500">{batch} · {company}</span>
  {description && (
    <span className="text-xs text-slate-400">· {description}</span>
  )}
</div>

{/* Meta info — description sejajar sama kuota, status, jam */}
<div className="flex items-center gap-3 flex-wrap">
  <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1
    ${isActive
      ? "bg-indigo-50 text-indigo-600 border-indigo-200"
      : "bg-slate-50 text-slate-500 border-slate-200"}`}>
    {isActive ? <><CheckCircle size={10} /> Active</> : <><Clock size={10} /> Inactive</>}
  </span>
  <span className="flex items-center gap-1.5 text-xs text-slate-500">
    <Users size={12} className="text-slate-400" />
    Kuota: <span className="font-semibold text-slate-700">{quota}</span>
  </span>
  <span className="flex items-center gap-1.5 text-xs text-slate-500">
    <Target size={12} className="text-slate-400" />
    <span className="font-semibold text-slate-700">{learning_hours}</span> jam
  </span>
  <span className="text-xs text-slate-400">|</span>

</div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
            <span>Learning Hours</span>
            <span className="font-medium text-slate-600">{completed_hours} / {learning_hours} jam</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
            className={`h-1.5 rounded-full transition-all ${isActive ? "bg-indigo-500" : "bg-slate-400"}`}
            style={{ width: `${Math.round((completed_hours / learning_hours) * 100)}%` }}
            />
        </div>
        </div>

        {/* Toggle competencies */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Sembunyikan" : "Lihat"} Kompetensi
        </button>

        {/* Competency list */}
        {expanded && (
          <div className="mt-3 border border-slate-100 rounded-xl px-4 pt-1 pb-2 bg-slate-50">
            {competencies.map((comp, i) => (
              <CompetencyItem key={i} {...comp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---
export default function ProgramsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate(`/c/${slug}/dashboard`);
          return;
        }

        const userResp = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (userResp.ok) {
          const data = await userResp.json();
          setUserData(data.data || data);
        }

        const progResp = await fetch(`${API_BASE_URL}/positions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (progResp.ok) {
          const progData = await progResp.json();
          const progs = progData.data || progData || [];
          setPrograms(progs);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      navigate("/");
    }
  };

  // Fallback dummy data jika API belum tersedia
  const defaultPrograms = programs && programs.length > 0 ? programs : [
    {
      id_position: "POS-0001",
      name: "Frontend Developer",
      description: "Fokus pada pengembangan antarmuka web modern menggunakan React & TypeScript.",
      quota: 10,
      batch: "Batch 5",
      company: "PT. Teknologi Maju",
      learning_hours: "active",
      completed_hours: 45,
      competencies: [
        { name: "HTML5 & CSS3 Fundamentals",   description: "Dasar-dasar markup dan styling web.", learning_hours: "30" },
        { name: "JavaScript ES6+",             description: "Sintaks modern dan konsep JS terkini.", learning_hours: "30" },
      ],
    },
  ];

  const filtered = filter === "Active"
    ? defaultPrograms.filter((p) => p.learning_hours === "active")
    : filter === "Inactive"
    ? defaultPrograms.filter((p) => p.learning_hours === "inactive")
    : defaultPrograms;

  const searched = filtered.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id_position.toLowerCase().includes(search.toLowerCase()) ||
    (p.company && p.company.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = defaultPrograms.filter((p) => p.learning_hours === "active").length;
  const inactiveCount = defaultPrograms.filter((p) => p.learning_hours === "inactive").length;

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <Sidebar userName={userData?.full_name} onLogout={handleLogout} />

      <div className="ml-56 flex-1 flex flex-col">
        <main className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-600">Loading programs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
              Error: {error}
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                <p className="text-sm text-gray-400 mt-0.5">The internship programs You are currently undertaking and have previously completed</p>
              </div>

              {/* Filter + Search toolbar */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  {["All", "Active", "Inactive"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === f
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {f}
                      {f === "Active" && (
                        <span className="ml-1.5 bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                          {activeCount}
                        </span>
                      )}
                      {f === "Inactive" && (
                        <span className="ml-1.5 bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                          {inactiveCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-80">
                  <Search size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
                    placeholder="Search programs or companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Program list */}
              {searched.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                  <p className="text-xs font-semibold text-gray-400 tracking-widest">
                    PROGRAMS ({searched.length})
                  </p>
                  <div className="space-y-4">
                    {searched.map((program) => (
                      <ProgramCard key={program.id_position} program={program} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No programs found.
                </div>
              )}
              <p className="text-center text-xs text-slate-400 py-2">
                © 2025 EarlyPath · Platform Magang Modern · All rights reserved
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}