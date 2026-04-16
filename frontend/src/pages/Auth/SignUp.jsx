import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function SignUp() {
  const navigate = useNavigate();
  const { error } = useAuthStore();

  const [activeTab, setActiveTab] = useState("company");

  // ── Company State ──
  const [companyForm, setCompanyForm] = useState({
    name: "", email: "", address: "", password: "", password_confirmation: "",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);

  // ── Candidate State ──
  const [candidateForm, setCandidateForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", password: "", password_confirmation: "",
  });
  const [showCandidatePassword, setShowCandidatePassword] = useState(false);
  const [showCandidateConfirm, setShowCandidateConfirm] = useState(false);

  // ── Shared State ──
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMsg("");
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) { setLogo(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  // ── Company Submit ──
  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (companyForm.password !== companyForm.password_confirmation) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", companyForm.name);
      formData.append("email", companyForm.email);
      formData.append("address", companyForm.address);
      formData.append("password", companyForm.password);
      formData.append("password_confirmation", companyForm.password_confirmation);
      if (logo) formData.append("logo", logo);

      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) throw new Error(Object.values(data.errors).flat().join(", "));
        throw new Error(data.message || "Registration failed");
      }
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("company", JSON.stringify(data.company));
      localStorage.setItem("public_url", data.public_url);
      useAuthStore.setState({ isAuthenticated: true, token: data.token, company: data.company });
      alert(`Registration successful! Your company page:\n${window.location.origin}/c/${data.company.slug}`);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Candidate Submit ──
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (candidateForm.password !== candidateForm.password_confirmation) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/register-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          first_name: candidateForm.first_name,
          last_name: candidateForm.last_name,
          email: candidateForm.email,
          phone: candidateForm.phone,
          password: candidateForm.password,
          password_confirmation: candidateForm.password_confirmation,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) throw new Error(Object.values(data.errors).flat().join(", "));
        throw new Error(data.message || "Registration failed");
      }
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      useAuthStore.setState({ isAuthenticated: true, token: data.token, user: data.user, company: null });
      navigate("/candidate/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
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

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #0a1a35 100%)" }}
      >
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/images/bg.png')" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 60%, rgba(10,22,40,0.95) 100%)" }} />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#4a9eff" }} />
        <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: "#1a6bb5" }} />

        {/* Nav top left */}
        <div className="absolute top-8 left-8 flex items-center gap-4 z-50 pointer-events-auto">
          <Link to="/" className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 hover:border-blue-400/60 hover:bg-blue-400/10 transition-all duration-300 group" style={{ textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-300">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/login" className="text-sm font-medium hover:text-blue-300 transition-colors duration-300" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
            Already have an account? <span className="text-blue-400 hover:underline">Login</span>
          </Link>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.5px" }}>
            One Step Closer
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>
            Empowering talent and organizations to connect, collaborate, and grow together through a unified and modern platform.
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

      {/* ── Right Panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
      >
        {/* Mobile nav */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-4">
          <Link to="/" className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/login" className="text-sm" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
            Already have an account? <span className="text-blue-400 underline">Login</span>
          </Link>
        </div>

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ background: "#4a9eff" }} />

        <div className="w-full max-w-md relative z-10 text-left">
          {/* Logo + Title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img src="/assets/images/logo.png" alt="Logo" className="w-23 h-23 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>
              Welcome To EarlyPath
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {activeTab === "company"
                ? "Sign up your company account and start your journey with us."
                : "Create your candidate account and start exploring internship opportunities."}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 mb-6 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => handleTabSwitch("company")}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: activeTab === "company" ? "rgba(74,158,255,0.15)" : "transparent",
                color: activeTab === "company" ? "#4a9eff" : "rgba(255,255,255,0.5)",
                border: "none", cursor: "pointer",
              }}
            >
              Company
            </button>
            <button
              onClick={() => handleTabSwitch("candidate")}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: activeTab === "candidate" ? "rgba(74,158,255,0.15)" : "transparent",
                color: activeTab === "candidate" ? "#4a9eff" : "rgba(255,255,255,0.5)",
                border: "none", cursor: "pointer",
              }}
            >
              Candidate
            </button>
          </div>

          {/* Error */}
          {(errorMsg || error) && (
            <div className="px-4 py-3 rounded-lg text-sm border mb-4" style={{ background: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.3)", color: "#ff6b6b" }}>
              {errorMsg || error}
            </div>
          )}

          {/* ── COMPANY FORM ── */}
          {activeTab === "company" && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Company Name</label>
                <input type="text" name="name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="Your Company Name" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Email</label>
                <input type="email" name="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  placeholder="email@company.com" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Address</label>
                <input type="text" name="address" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  placeholder="Your Company Address" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Company Logo <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {logoPreview ? <img src={logoPreview} alt="preview" className="w-full h-full object-cover" /> : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                      </svg>
                    )}
                  </div>
                  <label htmlFor="logo-upload" className="flex-1 px-4 py-3 rounded-xl text-sm cursor-pointer text-center transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px dashed rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(74,158,255,0.4)"; e.currentTarget.style.color = "rgba(74,158,255,0.8)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                    {logo ? logo.name : "Click to upload logo"}
                    <input id="logo-upload" type="file" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleLogo} className="hidden" />
                  </label>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>JPG, PNG, or WEBP. Max 2MB.</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Password</label>
                <div className="relative">
                  <input type={showCompanyPassword ? "text" : "password"} name="password" value={companyForm.password}
                    onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                    placeholder="Minimum 6 characters" required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                  <button type="button" onClick={() => setShowCompanyPassword(!showCompanyPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {showCompanyPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Confirm Password</label>
                <input type="password" name="password_confirmation" value={companyForm.password_confirmation}
                  onChange={(e) => setCompanyForm({ ...companyForm, password_confirmation: e.target.value })}
                  placeholder="Re-enter Your Password" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms-company" required className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-blue-500" />
                <label htmlFor="terms-company" className="text-xs leading-relaxed cursor-pointer" style={{ color: "rgba(255,255,255,0.5)" }}>
                  I agree to the{" "}
                  <a href="/terms" target="_blank" style={{ color: "#4a9eff" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" style={{ color: "#4a9eff" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>Privacy Policy</a>
                </label>
              </div>

              <SubmitButton loading={loading} label="Sign Up" />
              <GoogleButton />
            </form>
          )}

          {/* ── CANDIDATE FORM ── */}
          {activeTab === "candidate" && (
            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>First Name</label>
                  <input type="text" name="first_name" value={candidateForm.first_name} onChange={(e) => setCandidateForm({ ...candidateForm, first_name: e.target.value })}
                    placeholder="John" required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Last Name</label>
                  <input type="text" name="last_name" value={candidateForm.last_name} onChange={(e) => setCandidateForm({ ...candidateForm, last_name: e.target.value })}
                    placeholder="Doe" required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Email</label>
                <input type="email" name="email" value={candidateForm.email} onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  placeholder="john@email.com" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Phone Number</label>
                <input type="tel" name="phone" value={candidateForm.phone} onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  placeholder="+62 812 3456 7890" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Password</label>
                <div className="relative">
                  <input type={showCandidatePassword ? "text" : "password"} name="password" value={candidateForm.password}
                    onChange={(e) => setCandidateForm({ ...candidateForm, password: e.target.value })}
                    placeholder="Minimum 8 characters" required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                  <button type="button" onClick={() => setShowCandidatePassword(!showCandidatePassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {showCandidatePassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Use 8+ characters with a mix of letters, numbers & symbols.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Confirm Password</label>
                <div className="relative">
                  <input type={showCandidateConfirm ? "text" : "password"} name="password_confirmation" value={candidateForm.password_confirmation}
                    onChange={(e) => setCandidateForm({ ...candidateForm, password_confirmation: e.target.value })}
                    placeholder="Re-enter your password" required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase} onFocus={(e) => Object.assign(e.target.style, inputFocus)} onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                  <button type="button" onClick={() => setShowCandidateConfirm(!showCandidateConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {showCandidateConfirm ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms-candidate" required className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-blue-500" />
                <label htmlFor="terms-candidate" className="text-xs leading-relaxed cursor-pointer" style={{ color: "rgba(255,255,255,0.5)" }}>
                  I agree to EarlyPath's{" "}
                  <a href="/terms" target="_blank" style={{ color: "#4a9eff" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" style={{ color: "#4a9eff" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>Privacy Policy</a>
                  .
                </label>
              </div>

              <SubmitButton loading={loading} label="Create Account" />
              <GoogleButton />
            </form>
          )}

          {/* Login link */}
          <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold transition-colors duration-200" style={{ color: "#4a9eff", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──
function SubmitButton({ loading, label }) {
  return (
    <>
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2"
        style={{
          background: loading ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
          boxShadow: loading ? "none" : "0 4px 20px rgba(74,158,255,0.35)",
          border: "none", cursor: loading ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Processing...
          </span>
        ) : label}
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>or</span>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
      </div>
    </>
  );
}

function GoogleButton() {
  return (
    <button type="button"
      className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.97)", color: "#1a1a2e", border: "none", cursor: "pointer" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.97)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}