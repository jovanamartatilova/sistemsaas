import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, User, Award, LogOut,
  Search, ChevronDown, ChevronUp, CheckCircle, Clock,
  Users, Target, MapPin, Calendar, Briefcase, Info
} from "lucide-react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";

// --- Sidebar ---
function Sidebar({ userName, onLogout }) {
  const { slug } = useParams();
  const location = useLocation();
  const { company: authCompany } = useAuthStore();
  const company = JSON.parse(localStorage.getItem("company"));
  const resolvedSlug = slug !== "undefined" ? slug : (authCompany?.slug || "undefined");

  const navItems = [
    { label: "Dashboard",    icon: <LayoutDashboard size={16} />, to: `/c/${resolvedSlug}/dashboard` },
    { label: "Programs",     icon: <BookOpen size={16} />,        to: `/c/${resolvedSlug}/programs` },
    { label: "My Profile",   icon: <User size={16} />,            to: `/c/${resolvedSlug}/profile` },
    { label: "Certificates", icon: <Award size={16} />,           to: `/c/${resolvedSlug}/certificates` },
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

// --- Discovery Card (White Theme) ---
function DiscoveryCard({ vacancy, onApply }) {
  const [hov, setHov] = useState(false);
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const parts = String(dateStr).split("-");
    if (parts.length !== 3) return dateStr;
    return `${parseInt(parts[2])} ${MONTHS[parseInt(parts[1]) - 1]} ${parts[0]}`;
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full"
      style={{
        boxShadow: hov ? "0 12px 24px -8px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-4px)" : "none"
      }}
    >
      <div 
        className="w-full h-40 bg-slate-100 relative"
        style={{
          background: vacancy.photo ? `url(http://localhost:8000/storage/${vacancy.photo}) center/cover` : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
        }}
      >
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-indigo-600 shadow-sm uppercase tracking-wider border border-white/20">
          OPEN PROGRAM
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 text-left">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
            {vacancy.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span className="text-indigo-500 font-semibold">{vacancy.company?.name}</span>
            <span>•</span>
            <span>Batch {vacancy.batch}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mb-5">
            <div className="flex items-center gap-2 text-xs text-slate-500 text-left">
                <MapPin size={14} className="text-slate-400" />
                <span>{vacancy.location || "Jakarta"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 text-left">
                <Calendar size={14} className="text-slate-400" />
                <span>{formatDate(vacancy.start_date)} - {formatDate(vacancy.end_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-rose-500 font-medium italic text-left">
                <Clock size={14} />
                <span>Deadline: {formatDate(vacancy.deadline)}</span>
            </div>
        </div>

        <div className="mb-6 flex-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Briefcase size={10} /> Available Positions
            </p>
            <div className="flex flex-wrap gap-1.5">
                {vacancy.positions?.slice(0, 3).map((pos, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[11px] text-slate-600 font-medium">
                        {pos.name}
                    </span>
                ))}
            </div>
        </div>

        <button
          onClick={() => onApply(vacancy)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

// --- Confirmation Modal ---
function ConfirmModal({ vacancy, onConfirm, onCancel }) {
  if (!vacancy) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden">
        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Choose This Program?</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Are you sure you want to choose the program <span className="font-semibold text-slate-700">"{vacancy.title}"</span>? You will be directed to the registration page.
            </p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={onConfirm}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[98%]"
                >
                    Yes, Choose Program
                </button>
                <button
                    onClick={onCancel}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-[98%]"
                >
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- CompetencyItem ---
function CompetencyItem({ name, description, learning_hours }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600">
        <BookOpen size={14} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-slate-700 leading-tight mb-1">{name}</p>
        {description && <p className="text-[11px] text-slate-500 line-clamp-2">{description}</p>}
      </div>
      <span className="flex-shrink-0 text-[10px] px-2 py-1 rounded-md font-bold border bg-slate-50 text-slate-600 border-slate-200">
        {learning_hours} hours
      </span>
    </div>
  );
}

// --- Program Card (Redesigned Horizontal List) ---
function ProgramCard({ program }) {
  const [expanded, setExpanded] = useState(false);
  const { id_position, name, description, quota, batch, company, learning_hours, competencies, completed_hours, status, has_loa, loa_file_url, team } = program;
  const isAccepted = status === 'accepted';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  const getStatusBadge = () => {
    if (isAccepted) return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap"><CheckCircle size={12}/> ACCEPTED</span>;
    if (isPending) return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap"><Clock size={12}/> IN REVIEW</span>;
    if (isRejected) return <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap"><LogOut size={12}/> NOT SELECTED</span>;
    return <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap">{status}</span>;
  };

  const downloadFile = (url, fallbackName) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative transition-all">
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isAccepted ? "bg-emerald-500" : isPending ? "bg-amber-400" : isRejected ? "bg-rose-500" : "bg-slate-300"}`} />
      
      <div className="p-4 ml-1.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Left Side: Program Details */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-slate-800 break-words">{name}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
             <span className="text-xs font-bold text-indigo-600 truncate">{company}</span>
             <span className="text-slate-300">•</span>
             <span className="text-xs font-medium text-slate-500">{batch}</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed max-w-xl">
             Focus on {description}
          </p>

          {team && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 w-full max-w-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5"><Users size={12}/> Team: {team.name}</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded-md text-[10px] uppercase tracking-wider">{team.role}</span>
              </div>
              {team.role === 'Leader' && (
                <div className="flex justify-between items-center text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200">
                  <span>Team Code: <strong className="text-slate-800 font-mono tracking-widest">{team.code}</strong></span>
                  <button onClick={() => { navigator.clipboard.writeText(team.code); alert('Team code copied!'); }} className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Copy Code</button>
                </div>
              )}
              {team.role === 'Member' && (
                <div className="text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200 text-[10px]">
                  Join using code: <strong className="font-mono text-slate-500">{team.code}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Actions & Progress Data */}
        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0">
           {/* Progress Indicator (Only when Accepted) */}
           {isAccepted && (
              <div className="w-full md:w-48 flex flex-col gap-1.5 mb-1">
                 <div className="flex justify-between items-end text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Learning</span>
                    <span className="text-indigo-600">{completed_hours} <span className="text-slate-400 font-medium">/ {learning_hours} h</span></span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((completed_hours || 0) / (learning_hours || 1)) * 100)}%` }}
                    />
                 </div>
              </div>
           )}

           {/* LoA Actions */}
           <div className="flex gap-2 w-full md:w-auto">
             <button 
               disabled={!isAccepted || !has_loa}
               onClick={() => { if(has_loa && loa_file_url) downloadFile(loa_file_url, `LoA_${company}.pdf`) }}
               className={`flex-1 md:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 
                 ${isAccepted && has_loa ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
             >
               Download LoA
             </button>
           </div>
           
           {/* Expand Competencies */}
           {isAccepted && (
             <button
               onClick={() => setExpanded(!expanded)}
               className="mt-1 flex items-center justify-end gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
             >
               {expanded ? "Hide" : "View"} Competencies
               {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </button>
           )}
        </div>
      </div>

      {/* Expandable Section */}
      {expanded && isAccepted && (
         <div className="ml-1.5 px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50">
            <h4 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-1.5">
               <Target size={14} className="text-indigo-400" /> Target Competencies & Modules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {competencies?.map((comp, i) => (
                  <CompetencyItem key={i} {...comp} />
               ))}
               {(!competencies || competencies.length === 0) && (
                 <div className="col-span-full py-4 text-center text-xs font-medium text-slate-400">
                    No competencies yet for this position.
                 </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}

// --- Main Page ---
export default function ProgramsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const { company: authCompany, logout: globalLogout } = useAuthStore();
  
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [publicVacancies, setPublicVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  const isDiscoveryMode = slug === "undefined" && !authCompany?.slug;

  useEffect(() => {
    if (slug === "undefined" && authCompany?.slug) {
        navigate(`/c/${authCompany.slug}/programs`, { replace: true });
        return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const userResp = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        if (!userResp.ok && userResp.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          localStorage.removeItem("company");
          localStorage.removeItem("user");
          localStorage.removeItem("candidate_user");
          navigate("/");
          return;
        }
        
        if (userResp.ok) {
          const data = await userResp.json();
          setUserData(data.data || data);
        }

        if (isDiscoveryMode) {
          const resp = await fetch(`${API_BASE_URL}/vacancies/public`);
          if (resp.ok) {
            const data = await resp.json();
            setPublicVacancies(data || []);
          }
        } else {
          const progResp = await fetch(`${API_BASE_URL}/positions`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          
          if (!progResp.ok && progResp.status === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("token");
            localStorage.removeItem("company");
            localStorage.removeItem("user");
            localStorage.removeItem("candidate_user");
            navigate("/");
            return;
          }
          
          if (progResp.ok) {
            const progData = await progResp.json();
            setPrograms(progData.data || progData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, authCompany, navigate, isDiscoveryMode]);

  const handleLogout = async () => {
    localStorage.clear();
    globalLogout();
    navigate("/");
  };

  const filtered = isDiscoveryMode 
    ? publicVacancies.filter(v => 
        v.title?.toLowerCase().includes(search.toLowerCase()) || 
        v.company?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : programs.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || (p.company && p.company?.toLowerCase().includes(search.toLowerCase()));
        if (filter === "All") return matchesSearch;
        const isActive = p.is_active; // Mapped by backend: includes 'pending' and 'accepted'
        return matchesSearch && (filter === "Active" ? isActive : !isActive);
    });

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      
      <Sidebar userName={userData?.name || userData?.full_name} onLogout={handleLogout} />

      <div className="ml-56 flex-1 flex flex-col">
        <main className="p-6 space-y-5">
          {loading ? (
            <LoadingSpinner message="Loading programs..." />
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">Error: {error}</div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {isDiscoveryMode ? "Discover Programs" : "My Programs"}
                </h1>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                    {isDiscoveryMode 
                        ? "Explore various internship programs and start your career journey now." 
                        : "Internship programs you are currently participating in and have completed."}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                {!isDiscoveryMode ? (
                  <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {["All", "Active", "Inactive"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                          filter === f ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                ) : <div className="flex-1" />}
                
                <div className="relative w-full md:w-80 group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Search programs or companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {filtered.length > 0 ? (
                <>
                  {!isDiscoveryMode && (
                    <div className="flex items-center justify-center mb-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        PROGRAMS ({filtered.length})
                      </span>
                    </div>
                  )}
                  <div className={isDiscoveryMode ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4 w-full"}>
                    {isDiscoveryMode 
                      ? filtered.map(v => <DiscoveryCard key={v.id_vacancy} vacancy={v} onApply={setSelectedVacancy} />)
                      : filtered.map(p => <ProgramCard key={p.id_position} program={p} />)
                    }
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <BookOpen size={40} />
                  </div>
                  <p className="text-slate-400 font-medium">No programs found.</p>
                </div>
              )}

              <footer className="text-center text-xs text-slate-400 pt-10 pb-4">
                © 2025 EarlyPath · All rights reserved
              </footer>
            </>
          )}
        </main>
      </div>

      <ConfirmModal 
        vacancy={selectedVacancy} 
        onCancel={() => setSelectedVacancy(null)} 
        onConfirm={() => {
            const slug = selectedVacancy.company?.slug;
            navigate(`/c/${slug}`);
            setSelectedVacancy(null);
        }}
      />
    </div>
  );
}