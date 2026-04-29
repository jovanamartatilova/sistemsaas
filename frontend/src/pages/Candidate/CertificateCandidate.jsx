import { useState, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, User, Award, LogOut,
  Download, Lock, CheckCircle, Clock, Search,
} from "lucide-react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";

import SidebarCandidate from "../../components/SidebarCandidate";

// --- Certificate Card (Issued) ---
function CertificateCard({ id_certificate, certificate_number, file_path, final_score, issued_date, program, position }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="flex flex-col px-5 pt-2.5 pb-3.5 gap-2">

        {/* Row 1: Issued badge + date */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
            <CheckCircle size={9} /> Issued
          </span>
          <span className="text-[10px] text-slate-400">{issued_date}</span>
        </div>

        {/* Row 2: icon + text + score + download — all horizontal */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Award size={15} className="text-emerald-500" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5 truncate">
              {program || 'Internship Program'}
            </p>
            <p className="text-sm font-bold text-slate-800 leading-snug truncate">{position || 'Internship'}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{certificate_number}</p>
          </div>

          <div className="flex-shrink-0 text-center w-14">
            <p className="text-[10px] text-slate-400 mb-0.5">Score</p>
            <p className="text-base font-extrabold text-emerald-600">{Number(final_score).toFixed(1)}</p>
          </div>

          <a
            href={file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download size={12} />
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

        {/* Progress - Removed per requirements */}
        <div className="border-t border-slate-100 py-4">
          <p className="text-xs text-slate-400 text-center">Not yet available</p>
        </div>

        {/* Locked button */}
        <div className="border-t border-slate-100 pt-4">
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-semibold px-3 py-2 rounded-lg cursor-not-allowed"
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
  const { idCompany } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null);
  const [issued, setIssued] = useState([]);
  const [locked, setLocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate(`/c/${idCompany}/dashboard`);
          return;
        }

        const userResp = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
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

        const certResp = await fetch(`${API_BASE_URL}/certificates`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!certResp.ok && certResp.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          localStorage.removeItem("company");
          localStorage.removeItem("user");
          localStorage.removeItem("candidate_user");
          navigate("/");
          return;
        }

        if (certResp.ok) {
          const certData = await certResp.json();
          const certs = certData.data || certData || [];
          const issuedCerts = certs.filter(c => c.status === 'issued');
          const lockedCerts = certs.filter(c => c.status === 'on_going');
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
  }, [idCompany, navigate]);

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
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
      setLogoutModal(false);
      navigate("/");
    }
  };

  const handleLogout = handleLogoutClick;

  const filteredIssued = filter === "Locked" ? [] : issued;
  const filteredLocked = filter === "Issued" ? [] : locked;

  const searchedIssued = filteredIssued.filter((c) =>
    (c.certificate_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.id_certificate || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.program || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>
      <SidebarCandidate 
        userName={userData?.full_name} 
        userPhoto={userData?.profile_picture || userData?.photo_url || userData?.photo_path}
        company={JSON.parse(localStorage.getItem("company"))}
        onLogout={handleLogout} 
      />

      <main className="ml-56 flex-1 px-6 py-6 space-y-5 min-w-0">
        {loading && (
          <LoadingSpinner message="Loading certificates..." />
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
                <div className="flex flex-col gap-3">
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
                <div className="flex flex-col gap-3">
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