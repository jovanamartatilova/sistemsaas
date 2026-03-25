import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function LoginApplicant() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockCompany = {
        id: 999,
        name: form.username || "Guest Applicant",
        role: "applicant"
      };
      
      const mockToken = "applicant_dummy_token_12345";

      // Save token & company data
      localStorage.setItem("auth_token", mockToken);
      localStorage.setItem("company", JSON.stringify(mockCompany));

      // Update auth store so PrivateRoute sees isAuthenticated = true
      useAuthStore.setState({ isAuthenticated: true, token: mockToken, company: mockCompany });

      // Show success briefly then redirect
      setSuccessMsg("✓ Login success! Redirecting to portal...");
      setTimeout(() => {
        navigate("/applicant/portal");
      }, 500);
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left Panel: Hero ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #06101e 0%, #0d1a28 100%)",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/assets/images/bg.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(6,16,30,0.4) 0%, rgba(6,16,30,0.9) 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16 text-left">
           <div className="absolute top-8 left-8">
            <Link to="/" className="flex items-center gap-2 group text-white/60 hover:text-white transition-all" style={{ textDecoration: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Welcome Back</h2>
          <p className="text-lg text-white/60 max-w-sm">Continue your journey and track your applications on EarlyPath.</p>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: "#081828" }}
      >
        <div className="w-full max-w-md text-left">
          <div className="text-center mb-10">
            <img src="/assets/images/logo.png" alt="Logo" className="h-16 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Applicant Login</h1>
            <p className="text-white/40">Enter your credentials to access your portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-500 text-sm">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-sm font-medium text-center">
                {successMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name / Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your registered name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/70">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:bg-white/10 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  {showPassword ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-4 rounded-xl text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all mt-4"
            >
              {loading ? "Authenticating..." : "Login to Portal"}
            </button>

            <p className="text-center text-white/40 text-sm mt-6">
              Don't have an account? <Link to="/register-applicant" className="text-blue-400 font-bold hover:underline">Sign up as Applicant</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
