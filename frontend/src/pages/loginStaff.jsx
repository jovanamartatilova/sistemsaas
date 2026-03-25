import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function LoginStaff() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState("");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          slug,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login gagal");

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("company", JSON.stringify(data.company));

      setSuccessMsg("✓ Login berhasil!");
      setTimeout(() => navigate(`/c/${slug}/staff/dashboard`), 1500);
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const inputBase = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "14px",
  };
  const inputFocus = {
    border: "1px solid rgba(74,158,255,0.5)",
    background: "rgba(74,158,255,0.08)",
  };
  const btnLink = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

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
          <button onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", border: "none", cursor: "pointer" }}>
            Back to Home
          </button>
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
              <p className="text-xs font-medium" style={{ color: "#5dd8d8" }}>✦ Start your internship journey today</p>
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

            {/* Staff badge */}
            <div className="flex justify-center mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(74,158,255,0.12)", color: "#4a9eff", border: "1px solid rgba(74,158,255,0.2)" }}>
                HR / Mentor Portal
              </span>
            </div>

            <p className="text-sm font-medium mb-1" style={{ color: "rgba(74,158,255,0.85)" }}>Welcome back to</p>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>
              {companyLoading ? (
                <span className="inline-block w-36 h-7 rounded animate-pulse align-middle" style={{ background: "rgba(255,255,255,0.1)" }} />
              ) : (
                <span style={{ color: "#4a9eff" }}>{company?.name ?? "EarlyPath"}</span>
              )}
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Sign in to your staff account.
            </p>
          </div>

          {successMsg && (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2"
              style={{ background: "rgba(76,175,80,0.15)", borderLeft: "4px solid #4caf50", color: "#81c784" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="px-4 py-3 rounded-lg mb-4 text-sm border"
              style={{ background: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.3)", color: "#ff6b6b" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Email</label>
              <input type="email" name="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                style={inputBase}
                onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, inputBase)} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Password</label>
                <button type="button"
                  onClick={() => navigate(`/c/${slug}/staff/forgot-password`)}
                  className="text-xs transition-colors duration-200"
                  style={{ ...btnLink, color: "#4a9eff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"}
                  name="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password" required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2"
              style={{
                background: loading ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(74,158,255,0.35)",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>staff portal</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Back to company page */}
          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            <button
              onClick={() => navigate(`/c/${slug}`)}
              className="transition-colors duration-200"
              style={{ ...btnLink, color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              ← Back to {company?.name ?? "company"} page
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}