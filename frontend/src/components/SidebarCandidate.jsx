import { LayoutDashboard, BookOpen, User, Award, LogOut, Users, CheckSquare } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { getScopedRole } from "../utils/roleUtils";

export default function SidebarCandidate({ userName, userPhoto, company, onLogout }) {
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const resolvedSlug = slug || company?.slug;

  // Get scoped role from user object using utility function
  const scopedRole = getScopedRole(user) || "member";
  
  console.log("SidebarCandidate - resolved scopedRole:", scopedRole);

  // Base navigation items (common for all)
  const baseNavItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: `/c/${resolvedSlug}/dashboard` },
    { label: "Programs", icon: <BookOpen size={16} />, to: `/c/${resolvedSlug}/programs` },
    { label: "My Profile", icon: <User size={16} />, to: `/c/${resolvedSlug}/profile` },
    { label: "Certificates", icon: <Award size={16} />, to: `/c/${resolvedSlug}/certificates` },
  ];

  // Role-specific items
  const roleSpecificItems = scopedRole === "leader" 
    ? [
        { label: "My Tasks", icon: <CheckSquare size={16} />, to: `/c/${resolvedSlug}/leader/tasks` },
        { label: "Team Management", icon: <Users size={16} />, to: `/c/${resolvedSlug}/leader/team` },
      ]
    : scopedRole === "member"
    ? [
        { label: "My Tasks", icon: <CheckSquare size={16} />, to: `/c/${resolvedSlug}/member/tasks` },
      ]
    : [];

  const navItems = [...baseNavItems, ...roleSpecificItems];

  return (
    <aside className="w-56 min-h-screen bg-[#0f1e3a] text-white flex flex-col px-4 py-6 fixed top-0 left-0 z-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
      
      {/* 1. Company Logo at the TOP (Added) */}
      {company?.logo_path && (
        <div className="flex justify-center mb-6">
          <Link to={`/c/${resolvedSlug}`} className="hover:opacity-80 transition-opacity">
            <img
              src={`http://localhost:8000/storage/${company.logo_path}`}
              alt={company.name || "Company"}
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer: Profile Picture with info (horizontal layout) */}
      <div className="mt-auto flex items-center gap-3 px-2 py-3 border-t border-[#1a2f54]">
        {/* Photo */}
        {userPhoto ? (
          <img
            src={userPhoto.startsWith('http') ? userPhoto : `http://localhost:8000/storage/${userPhoto}`}
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
          <p className="text-[10px] text-slate-500 truncate">{company?.name || "Candidate"}</p>
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
  );
}
