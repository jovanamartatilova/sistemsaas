import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  const goToLogin = (e) => {
    e.preventDefault();
    navigate("/login");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim email reset password");
      }

      setSuccessMsg("Link reset password telah dikirim ke email Anda.");
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left Panel: Hero ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #0a1a35 100%)",
        }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/images/bg.png')" }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 60%, rgba(10,22,40,0.95) 100%)",
          }}
        />

        {/* Glows */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "#4a9eff" }} />
        <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "#1a6bb5" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-32 w-full h-full">
          {/* Back to Login — top left */}
          <button
            onClick={goToLogin}
            className="absolute top-8 left-8 flex items-center gap-2 group bg-transparent border-none"
            style={{ color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 0 }}
          >
          <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 group-hover:border-blue-400/60 group-hover:bg-blue-400/10 transition-all duration-300">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="group-hover:-translate-x-0.5 transition-transform duration-300"
            >
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
            Back to{" "}
            <span className="text-blue-400 group-hover:underline">Login</span>
          </span>
        </button>

        {/* Bottom content */}
        <div>
          <h2
              className="text-4xl font-bold text-white mb-4 leading-tight text-left"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}
            >
              One Step Closer
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>
              Empowering talent and organizations to connect, collaborate, and grow together through a unified and modern platform.
            </p>

            <div className="flex gap-8 mt-10">
              {[
                { value: "10K+", label: "Companies" },
                { value: "250K+", label: "Candidates" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)",
        }}
      >
        {/* Mobile back link */}
        <button
          onClick={goToLogin}
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm bg-transparent border-none"
          style={{ color: "rgba(255,255,255,0.55)", cursor: "pointer", padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Login
        </button>

        {/* Background glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ background: "#4a9eff" }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/images/logo.png"
                alt="Logo"
                className="w-23 h-23 object-contain"
              />
            </div>

            {/* Icon kunci */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(74,158,255,0.12)", border: "1px solid rgba(74,158,255,0.2)" }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#4a9eff" strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#4a9eff" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="#4a9eff" opacity="0.8" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>
              Forgot Password?
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", maxWidth: "320px", margin: "0 auto" }}>
              Enter your registered email and we will send you a link to reset your password.
            </p>
          </div>

          {/* Success state */}
          {sent ? (
            <div className="text-center">
              <div
                className="px-5 py-4 rounded-xl mb-6 text-sm flex flex-col items-center gap-3"
                style={{
                  background: "rgba(76,175,80,0.1)",
                  border: "1px solid rgba(76,175,80,0.25)",
                  color: "#81c784",
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="1.5" opacity="0.5" />
                  <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Email sent!</p>
                  <p style={{ color: "rgba(129,199,132,0.75)", fontSize: "13px" }}>
                    Check your inbox or spam folder at <span className="font-medium text-green-300">{email}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(""); setSuccessMsg(""); }}
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
              {/* Error */}
              {errorMsg && (
                <div
                  className="px-4 py-3 rounded-lg text-sm border"
                  style={{
                    background: "rgba(255,59,48,0.1)",
                    borderColor: "rgba(255,59,48,0.3)",
                    color: "#ff6b6b",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-left" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@perusahaan.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2"
                style={{
                  background: loading
                    ? "rgba(74,158,255,0.5)"
                    : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(74,158,255,0.35)",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Remember your password?{" "}
            <button
              onClick={goToLogin}
              className="font-semibold transition-colors duration-200 bg-transparent border-none"
              style={{ color: "#4a9eff", cursor: "pointer", padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}