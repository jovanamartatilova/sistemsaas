import { User, LogOut, Shield, Bell, Search, Upload, ChevronDown,LayoutDashboard, BookOpen, Award } from "lucide-react";
import { useParams } from "react-router-dom";

// --- Sidebar ---
function Sidebar({ userName, onLogout }) {
  const { slug } = useParams();
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: `/c/${slug}/dashboard` },
    { label: "Programs", icon: <BookOpen size={16} />, to: `/c/${slug}/programs` },
    { label: "My Profile", icon: <User size={16} />, to: `/c/${slug}/profile`, active: true },
    { label: "Certificates", icon: <Award size={16} />, to: `/c/${slug}/certificates` },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[#0f1e3a] text-white flex flex-col px-4 py-6 fixed top-0 left-0 z-10">
      <div className="flex items-center gap-2 mb-8">
  <img src="/assets/images/logo.png" alt="EarlyPath" className="h-16 w-auto" />
  <span className="font-bold text-lg tracking-tight">EarlyPath</span>
  </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <a key={item.label} href={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${item.active ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}>
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
          {userName?.charAt(0).toUpperCase() || "R"}
        </div>
        <span className="text-sm text-slate-300 flex-1">{userName || "Riku"}</span>
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

// --- Main Content ---
function ProfileContent() {
  return (
    <div className="flex-1 w-full">
      {/* Page header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Update Your Profile</p>
      </div>

      {/* Public Profile */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-5">PUBLIC PROFILE</p>

        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-500 font-bold text-2xl">RA</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-indigo-500 transition-colors">
              <span className="text-white font-bold text-sm leading-none">+</span>
            </button>
          </div>

          {/* Name + actions */}
          <div className="flex flex-col gap-0.5">
            <p className="text-gray-900 font-bold text-lg text-left">Rizky Aditya Pratama</p>
            <p className="text-gray-500 text-sm text-left">Frontend Developer Intern</p>
            <p className="text-gray-400 text-xs mb-3 text-left">Surabaya, Jawa Timur</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
                <Upload size={12} />
                Upload New Profile Picture
              </button>
              <button className="px-4 py-1.5 border border-red-300 text-red-400 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors">
                Delete
              </button>
            </div>
            <p className="text-gray-300 text-[10px] mt-1.5 text-left">
              Format: JPG, PNG. Ukuran maks. 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Informasi Pribadi */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-5">PERSONAL INFORMATION </p>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">Full Name</label>
            <input
              defaultValue="Rizky Aditya Pratama"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">Email</label>
            <input
              defaultValue="rizky.aditya@email.com"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">No. Handphone</label>
            <input
              defaultValue="+62 812 3456 7890"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">City of Origin</label>
            <div className="relative">
              <input
                defaultValue="Surabaya, Jawa Timur"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all pr-8"
              />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">Current Education</label>
            <input
              defaultValue="S1 Teknik Informatika"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium text-left">Institution</label>
            <input
              defaultValue="Universitas Airlangga"
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all"
            />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
          <button className="px-5 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm hover:text-gray-800 hover:border-gray-400 transition-colors">
            Cancel
          </button>
          <button className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-300 mt-6">
        © 2025 EarlyPath · Platform Magang Modern
      </p>
    </div>
  );
}

// --- Page ---
export default function ProfileSettings() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userName="Rizky" onLogout={() => {}} />
      <div className="ml-56 flex-1 flex flex-col">
        <main className="p-6">
          <ProfileContent />
        </main>
      </div>
    </div>
  );
}