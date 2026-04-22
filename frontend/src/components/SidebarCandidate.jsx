import { LayoutDashboard, BookOpen, User, Award, LogOut } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

export default function SidebarCandidate({ userName, userPhoto, company, onLogout }) {
  const { slug } = useParams();
  const location = useLocation();
  const resolvedSlug = slug || company?.slug;

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: `/c/${resolvedSlug}/dashboard` },
    { label: "Programs", icon: <BookOpen size={16} />, to: `/c/${resolvedSlug}/programs` },
    { label: "My Profile", icon: <User size={16} />, to: `/c/${resolvedSlug}/profile` },
    { label: "Certificates", icon: <Award size={16} />, to: `/c/${resolvedSlug}/certificates` },
  ];

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

      {/* 3. Footer: Profile Picture instead of Company Logo (Revised) */}
      <div className="mt-auto flex items-center gap-3 px-2">
        {userPhoto ? (
          <img
            src={userPhoto.startsWith('http') ? userPhoto : `http://localhost:8000/storage/${userPhoto}`}
            alt="Candidate"
            className="w-9 h-9 rounded-full object-cover border-2 border-[#1a2f54] shadow-sm flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border-2 border-[#1a2f54]">
            {userName?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-300 truncate font-semibold leading-tight">{userName || "User"}</p>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">{company?.name || "Candidate"}</p>
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
