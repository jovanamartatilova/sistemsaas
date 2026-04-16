import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function ForgotPasswordCandidate() {
  const { slug: slugFromUrl } = useParams();
  const [slug, setSlug] = useState(slugFromUrl || "");

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(!!slugFromUrl);
  const [companyError, setCompanyError] = useState("");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState(false);

useEffect(() => {
  if (!slugFromUrl) return; // kalau tidak ada slug di URL, skip
  const fetchCompany = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/c/${slugFromUrl}`, {
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
  fetchCompany();
}, [slugFromUrl]); // ← slugFromUrl, bukan slug

  const inputBase = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "14px",
  };
  const inputFocus = {
    border: "1px solid rgba(74,158,255,0.5)",
    background: "rgba(74,158,255,0.08)",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/forgot-password-candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show validation errors if available
        if (data.errors) {
          const errorDetails = Object.values(data.errors).flat().join(", ");
          throw new Error(`${data.message}: ${errorDetails}`);
        }
        throw new Error(data.message || "Gagal mengirim email");
      }

      setSent(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Company not found ──
  if (!companyLoading && companyError) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
      >
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
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #0a1a35 100%)" }}
      >
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/bg.png')" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 60%, rgba(10,22,40,0.95) 100%)" }} />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#4a9eff" }} />
        <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: "#1a6bb5" }} />

        {/* Back to login */}
        <Link to={`/c/${slug}/login`}
          className="absolute top-8 left-8 flex items-center gap-2 group z-10"
          style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 group-hover:border-blue-400/60 group-hover:bg-blue-400/10 transition-all duration-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-300">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
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
              style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.5px" }}>
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
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
      >
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

            {/* Lock icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(74,158,255,0.12)", border: "1px solid rgba(74,158,255,0.2)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#4a9eff" strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#4a9eff" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="#4a9eff" opacity="0.8" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>Forgot Password?</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "320px", margin: "0 auto" }}>
              Enter email that is registered in{" "}
{companyLoading 
  ? "..." 
  : company 
    ? <span style={{ color: "#4a9eff" }}>{company.name}</span>
    : <span style={{ color: "rgba(255,255,255,0.6)" }}>your company</span>
}
            </p>
          </div>

          {/* Sent state */}
          {sent ? (
            <div className="text-center">
              <div className="px-5 py-4 rounded-xl mb-6 text-sm flex flex-col items-center gap-3"
                style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.25)", color: "#81c784" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="1.5" opacity="0.5" />
                  <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Email sent!</p>
                  <p style={{ color: "rgba(129,199,132,0.75)", fontSize: "13px" }}>
                    Check your inbox or spam folder at{" "}
                    <span className="font-medium text-green-300">{email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
              >
                Resend to different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tambah ini sebelum input email */}
{!slugFromUrl && (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
      Company Slug
    </label>
    <input
      type="text"
      value={slug}
      onChange={(e) => setSlug(e.target.value)}
      placeholder="contoh: pt-maju-jaya"
      required
      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
      style={inputBase}
      onFocus={(e) => Object.assign(e.target.style, inputFocus)}
      onBlur={(e) => Object.assign(e.target.style, inputBase)}
    />
    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
      Tanyakan slug perusahaan ke HR kamu
    </p>
  </div>
)}
              {errorMsg && (
                <div className="px-4 py-3 rounded-lg text-sm border"
                  style={{ background: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.3)", color: "#ff6b6b" }}>
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
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
                    Sending...
                  </span>
                ) : "Send Reset Link"}
              </button>
            </form>
          )}

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
        </div>
      </div>
    </div>
  );
}
