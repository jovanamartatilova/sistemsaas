import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, User, Award, LogOut,
  Download, Lock, CheckCircle, Clock, Search,
} from "lucide-react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

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

// --- Certificate Card (Issued) ---
function CertificateCard({ id_certificate, certificate_number, file_path, final_score, issued_date }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Award size={18} className="text-emerald-500" />
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
            <CheckCircle size={10} /> Issued
          </span>
        </div>

        {/* Info */}
        <div className="border-t border-slate-100 py-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Internship Certificate
          </p>
          <p className="text-sm font-bold text-slate-800 leading-snug">{certificate_number}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-1">{id_certificate}</p>
        </div>

        {/* Final Score */}
        <div className="border-t border-slate-100 py-4">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-500">Final Score</span>
            <span className="text-sm font-bold text-emerald-600">{Number(final_score).toFixed(2)}</span>
          </div>
        </div>

        {/* Date + Download */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">Issued: {issued_date}</p>
          <a
            href={file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={11} />
            Download PDF
          </a>
        </div>

      </div>
    </div>
  );
}

// --- Certificate Card (Locked) ---
function LockedCertificateCard({ batch, company, progress }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden opacity-60">
      <div className="h-1.5 bg-slate-200" />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Lock size={18} className="text-slate-400" />
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
            <Clock size={10} /> On Going
          </span>
        </div>

        {/* Info */}
        <div className="border-t border-slate-100 py-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Internship Certificate
          </p>
          <p className="text-sm font-bold text-slate-600 leading-snug">{company}</p>
          <p className="text-xs text-slate-400 mt-1">{batch}</p>
        </div>

        {/* Progress */}
        <div className="border-t border-slate-100 py-4 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Internship Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-indigo-400 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Locked button */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">Not yet available</p>
          <button
            disabled
            className="flex items-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-not-allowed"
          >
            <Lock size={11} />
            Locked
          </button>
        </div>

      </div>
    </div>
  );
}

// --- Main Page ---
export default function CertificatesPage() {
  const navigate = useNavigate();
  const { logout: globalLogout } = useAuthStore();
  const { slug } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null);
  const [issued, setIssued] = useState([]);
  const [locked, setLocked] = useState([]);
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

        const certResp = await fetch(`${API_BASE_URL}/certificates`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (certResp.ok) {
          const certData = await certResp.json();
          const certs = certData.data || certData || [];
          const issuedCerts = certs.filter(c => c.status === "issued" || c.issued_date);
          const lockedCerts = certs.filter(c => c.status === "on_going" || !c.issued_date);
          setIssued(issuedCerts);
          setLocked(lockedCerts);
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
      globalLogout();
      navigate("/");
    }
  };

  const filteredIssued = filter === "Locked" ? [] : issued;
  const filteredLocked  = filter === "Issued" ? [] : locked;

  const searchedIssued = filteredIssued.filter((c) =>
    c.certificate_number.toLowerCase().includes(search.toLowerCase()) ||
    c.id_certificate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <Sidebar userName={userData?.full_name} onLogout={handleLogout} />

      <main className="ml-56 flex-1 px-6 py-6 space-y-5 min-w-0">
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading certificates...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
            Error: {error}
          </div>
        )}
        {!loading && (
          <>
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-sm text-slate-400 mt-0.5">Internship certificates that have been issued for you</p>
        </div>

        {/* Filter Tabs + Search — 1 baris, toolbar style */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            {["All", "Issued", "Locked"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors
                  ${filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
              >
                {f}
                {f === "Issued" && (
                  <span className="ml-1.5 bg-emerald-100 text-emerald-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {issued.length}
                  </span>
                )}
                {f === "Locked" && (
                  <span className="ml-1.5 bg-slate-100 text-slate-500 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {locked.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-80">
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
              placeholder="Search certificate number or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Issued Certificates */}
        {searchedIssued.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <p className="text-xs font-semibold text-gray-400 tracking-widest">ISSUED ({searchedIssued.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchedIssued.map((cert) => (
                <CertificateCard key={cert.id_certificate} {...cert} />
            ))}
            </div>
        </div>
        )}

        {/* Locked Certificates */}
        {filteredLocked.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <p className="text-xs font-semibold text-gray-400 tracking-widest">INTERNSHIP IN PROGRESS — NOT YET ISSUED ({filteredLocked.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLocked.map((cert, i) => (
                <LockedCertificateCard key={i} {...cert} />
            ))}
            </div>
        </div>
        )}

              {/* Empty State */}
              {searchedIssued.length === 0 && filteredLocked.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No certificates found.
                </div>
              )}

              <p className="text-center text-xs text-slate-400 py-2">
                © 2025 EarlyPath · Platform Magang Modern · All rights reserved
              </p>
            </>
          )}
      </main>
    </div>
  );
}