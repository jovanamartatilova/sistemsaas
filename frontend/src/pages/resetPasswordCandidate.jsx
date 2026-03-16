import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function ResetPasswordCandidate() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState("");

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const inputBase = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "14px",
  };
  const inputFocus = {
    border: "1px solid rgba(74,158,255,0.5)",
    background: "rgba(74,158,255,0.08)",
  };

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: "Lemah", color: "#ef4444" };
    if (score <= 2) return { level: 2, label: "Cukup", color: "#f97316" };
    if (score <= 3) return { level: 3, label: "Baik", color: "#eab308" };
    return { level: 4, label: "Kuat", color: "#22c55e" };
  };

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.password !== form.password_confirmation) {
      setErrorMsg("Password tidak cocok");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password minimal 8 karakter");
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

      if (!response.ok) throw new Error(data.message || "Gagal reset password");

      setDone(true);
      setTimeout(() => navigate(`/c/${slug}/login`), 2500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  // ── Company not found ──
  if (!companyLoading && companyError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}>
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="1.5" opacity="0.5" />
                <path d="M12 8v4M12 16h.01" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
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
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #0a1a35 100%)" }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/bg.png')" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 60%, rgba(10,22,40,0.95) 100%)" }} />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#4a9eff" }} />
        <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: "#1a6bb5" }} />

        <Link to={`/c/${slug}/login`}
          className="absolute top-8 left-8 flex z-10 items-center gap-2 group z-10"
          style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
          <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 group-hover:border-blue-400/60 group-hover:bg-blue-400/10 transition-all duration-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-300">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-medium group-hover:text-blue-300 z-10 transition-colors duration-300">
            Back to <span className="text-blue-400 group-hover:underline">Login</span>
          </span>
        </Link>

        <div className="relative z-10 flex flex-col justify-end p-12 pb-32">
          {company && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 self-start"
              style={{ background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
                style={{ background: "rgba(74,158,255,0.2)", color: "#4a9eff" }}>
                {company.logo_path
                  ? <img src={`http://localhost:8000/storage/${company.logo_path}`} alt="" className="w-full h-full object-cover" />
                  : company.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium" style={{ color: "#5dd8d8" }}>{company.name}</span>
            </div>
          )}
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full mb-2"
  style={{ background: "rgba(93,216,216,0.1)", border: "1px solid rgba(93,216,216,0.2)" }}>
  <p className="text-xs font-medium" style={{ color: "#5dd8d8" }}>
    ✦ Start your internship journey today
  </p>
</div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}>
              One Step Closer
            </h2>
            <p className="text-base leading-relaxed text-left" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>
              Discover internship opportunities, build real-world experience, and grow your career with EarlyPath.
            </p>
            <div className="flex gap-8 mt-10">
              {[{ value: "10K+", label: "Companies" }, { value: "250K+", label: "Candidates" }, { value: "98%", label: "Satisfaction" }].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}>
        <Link to={`/c/${slug}/login`}
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm"
          style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Login
        </Link>

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ background: "#4a9eff" }} />

        <div className="w-full max-w-md relative z-10 text-left">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {companyLoading ? (
                <div className="w-16 h-16 rounded-2xl animate-pulse" style={{ background: "rgba(74,158,255,0.1)" }} />
              ) : company?.logo_path ? (
                <img src={`http://localhost:8000/storage/${company.logo_path}`} alt={company.name} className="w-16 h-16 object-contain rounded-2xl" />
              ) : (
                <img src="/assets/images/logo.png" alt="Logo" className="w-23 h-23 object-contain" />
              )}
            </div>

            {/* Shield icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(74,158,255,0.12)", border: "1px solid rgba(74,158,255,0.2)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
                    stroke="#4a9eff" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" stroke="#4a9eff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>Reset Password</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "320px", margin: "0 auto" }}>
              Create a new password for your account at{" "}
              {companyLoading ? "..." : <span style={{ color: "#4a9eff" }}>{company?.name}</span>}.
            </p>
          </div>

          {/* Done state */}
          {done ? (
            <div className="text-center">
              <div className="px-5 py-5 rounded-xl mb-6 flex flex-col items-center gap-3"
                style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.25)", color: "#81c784" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="1.5" opacity="0.4" />
                  <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-semibold text-base mb-1">Password successfully changed!</p>
                  <p style={{ color: "rgba(129,199,132,0.75)", fontSize: "13px" }}>You will be redirected to the login page...</p>
                </div>
              </div>
              <Link to={`/c/${slug}/login`}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", boxShadow: "0 4px 20px rgba(74,158,255,0.35)" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-lg text-sm border"
                  style={{ background: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.3)", color: "#ff6b6b" }}>
                  {errorMsg}
                </div>
              )}

              {/* Password Baru */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.level ? strength.color : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    <p className="text-xs text-left" style={{ color: strength.color }}>Kekuatan: {strength.label}</p>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  {form.password_confirmation && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {form.password === form.password_confirmation ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L20 7" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2"
                style={{
                  background: loading ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(74,158,255,0.35)",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Saving...
                  </span>
                ) : "Save New Password"}
              </button>
            </form>
          )}

          {!done && (
            <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Remember your password?{" "}
              <Link to={`/c/${slug}/login`}
                className="font-semibold transition-colors duration-200"
                style={{ color: "#4a9eff", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}
              >
                Login here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}