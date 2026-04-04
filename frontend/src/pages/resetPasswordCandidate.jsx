import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function ResetPasswordCandidate() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState("");

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/c/${slug}`, {
          headers: { "Accept": "application/json" },
        });
        if (!response.ok) throw new Error("Perusahaan tidak ditemukan");
        const data = await response.json();
        setCompany(data.company);
      } catch (err) {
        setCompanyError(err.message);
      } finally {
        setCompanyLoading(false);
      }
    };
    if (slug) fetchCompany();
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: "Lemah", color: "#ef4444" };
    if (score <= 2) return { level: 2, label: "Cukup", color: "#f97316" };
    if (score <= 3) return { level: 3, label: "Baik", color: "#eab308" };
    return { level: 4, label: "Kuat", color: "#22c55e" };
  };

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (form.password !== form.password_confirmation) {
      setErrorMsg("Password tidak cocok");
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/reset-password-candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show validation errors if available
        if (data.errors) {
          const errorDetails = Object.values(data.errors).flat().join(", ");
          throw new Error(`${data.message}: ${errorDetails}`);
        }
        throw new Error(data.message || "Gagal reset password");
      }

      setSuccessMsg("Password berhasil diubah!");
      setDone(true);

      setTimeout(() => navigate(`/c/${slug}/login`), 2500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!companyLoading && companyError) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
      >
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>{companyError}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)" }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - exact match Hero for Candidates */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #0a1a35 100%)" }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40" style={{ backgroundImage: "url('/assets/images/bg.png')" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 60%, rgba(10,22,40,0.95) 100%)" }} />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#4a9eff" }} />
        
        {/* Navigation - top left */}
        <div className="absolute top-8 left-8 flex items-center gap-4 z-50 pointer-events-auto">
          <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:border-blue-400/60 hover:bg-blue-400/10 transition-all duration-300 group bg-transparent cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to={`/c/${slug}/login`} className="text-sm font-medium hover:text-blue-300 transition-all duration-300" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
            Back to Login
          </Link>
        </div>

        <div className="relative z-10 flex flex-col justify-end p-12 pb-32">
          {company && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 self-start" style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)" }}>
              <span className="text-xs font-medium" style={{ color: "#5dd8d8" }}>{company.name}</span>
            </div>
          )}
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Secure Your Account</h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>Create a new strong password to regain access to your candidate dashboard.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}>
        {/* Mobile Nav */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-4 z-50 pointer-events-auto">
          <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Reset Password</h1>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>Set your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70 block ml-1">New Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Strength Meter */}
              {form.password && (
                <div className="px-1 mt-3">
                  <div className="flex gap-1.5 h-1.5 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{ width: strength.level >= i ? "100%" : "0%", background: strength.color }} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70 block ml-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="password_confirmation"
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none"
                  value={form.password_confirmation}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg transition-all"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    {showConfirm ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-shake">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || done}
              className="w-full py-4 rounded-xl text-white font-bold transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", boxShadow: "0 10px 25px -5px rgba(74,158,255,0.4)" }}
            >
              <span className={loading ? "opacity-0" : "opacity-100"}>Reset Password</span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
