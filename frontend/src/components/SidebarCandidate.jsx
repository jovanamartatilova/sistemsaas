import { LayoutDashboard, BookOpen, User, Award, LogOut, Users, CheckSquare, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { getScopedRole } from "../utils/roleUtils";

export default function SidebarCandidate({ userName, userPhoto, company, onLogout }) {
  const location = useLocation();
  const { user, company: authCompany } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fallback: coba dari prop dulu, lalu authStore, lalu sessionStorage
  const resolvedCompany = company || authCompany || (() => {
    try { return JSON.parse(sessionStorage.getItem("company")); } catch { return null; }
  })();
  
  const resolvedCompanyId = resolvedCompany?.id_company;

  // Get scoped role from user object using utility function
  const scopedRole = getScopedRole(user) || "member";

  console.log("SidebarCandidate - resolved scopedRole:", scopedRole);

  // Base navigation items (common for all)
  const baseNavItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: `/c/${resolvedCompanyId}/dashboard` },
    { label: "Programs", icon: <BookOpen size={16} />, to: `/c/${resolvedCompanyId}/programs` },
    { label: "My Profile", icon: <User size={16} />, to: `/c/${resolvedCompanyId}/profile` },
    { label: "Certificates", icon: <Award size={16} />, to: `/c/${resolvedCompanyId}/certificates` },
  ];

  // Role-specific items
  const roleSpecificItems = scopedRole === "leader"
    ? [
      { label: "My Tasks", icon: <CheckSquare size={16} />, to: `/c/${resolvedCompanyId}/leader/tasks` },
      { label: "Team Management", icon: <Users size={16} />, to: `/c/${resolvedCompanyId}/leader/team` },
    ]
    : scopedRole === "member"
      ? [
        { label: "My Tasks", icon: <CheckSquare size={16} />, to: `/c/${resolvedCompanyId}/member/tasks` },
      ]
      : [];

  const navItems = [...baseNavItems, ...roleSpecificItems];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/programs')) return 'My Programs';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/certificates')) return 'Certificates';
    if (path.includes('/member/tasks')) return 'My Tasks';
    if (path.includes('/leader/tasks')) return 'My Tasks';
    if (path.includes('/leader/team')) return 'Team Management';
    if (path.includes('/leader/dashboard')) return 'Leader Dashboard';
    if (path.includes('/dashboard')) return 'Dashboard';
    return 'EarlyPath';
  };

  return (
    <>
      {/* Topbar mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-10 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(true)} className="text-slate-600 flex items-center justify-center">
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold text-slate-800">{getPageTitle()}</span>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`w-56 min-h-screen bg-[#0f1e3a] text-white flex flex-col px-4 py-6 fixed top-0 left-0 z-30 flex transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`} style={{ fontFamily: 'Poppins, sans-serif' }}>

    <button
        onClick={() => setSidebarOpen(false)}
        className="absolute top-4 right-4 md:hidden text-slate-400 hover:text-white"
      >
        <X size={18} />
      </button>

      {resolvedCompany?.logo_path && (
        <div className="flex justify-center mb-6">
          <Link to={`/c/${resolvedCompanyId}`} className="hover:opacity-80 transition-opacity">
            <img
              src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${resolvedCompany.logo_path}`}
              alt={resolvedCompany.name || "Company"}
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>
      )}

      {/* 2. EarlyPath Logo (Original Structure) */}
      <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
        <img src="/assets/images/logo.png" alt="EarlyPath" className="h-16 w-auto" />
        <span className="font-bold text-lg tracking-tight">EarlyPath</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.label} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left
                ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer: Profile Picture with info (horizontal layout) */}
      <div className="mt-auto flex items-center gap-3 px-2 py-3 border-t border-[#1a2f54]">
        {/* Photo */}
        {userPhoto ? (
          <img
            src={userPhoto.startsWith('http') ? userPhoto : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${userPhoto}`}
            alt="Candidate"
            className="w-10 h-10 rounded-full object-cover border border-indigo-500 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white border border-indigo-500 flex-shrink-0">
            {userName?.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        {/* Name and Company */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-300 font-semibold truncate">{userName || "User"}</p>
          <p className="text-[10px] text-slate-500 truncate">{resolvedCompany?.name || "Candidate"}</p>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="text-slate-500 hover:text-red-400 cursor-pointer transition-colors flex-shrink-0"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
    </>
  );
}