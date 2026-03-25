import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function SignUpPerusahaan() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const navigate = useNavigate();
  const { error } = useAuthStore();
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogo = (e) => {
  const file = e.target.files[0];
  if (file) {
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (form.password !== form.password_confirmation) {
      setErrorMsg("Password did not match");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
formData.append('name', form.name);
formData.append('email', form.email);
formData.append('address', form.address);
formData.append('password', form.password);
formData.append('password_confirmation', form.password_confirmation);
if (logo) formData.append('logo', logo);

const response = await fetch("http://localhost:8000/api/auth/register", {
  method: "POST",
  headers: {
    "Accept": "application/json",
  },
  body: formData,
});

      const data = await response.json();

      if (!response.ok) {
        // Show detailed validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessages || data.message || "Validation failed");
        }
        throw new Error(data.message || "Registration failed");
      }

      // Save token & company data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("company", JSON.stringify(data.company));
      localStorage.setItem("public_url", data.public_url);
      
       useAuthStore.setState({ isAuthenticated: true, token: data.token, company: data.company });

      alert(`Registration successful! Your company page:\n${window.location.origin}/c/${data.company.slug}`);
      // Update auth store so PrivateRoute sees isAuthenticated = true
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
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
          background: "linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #0a1a35 100%)",
        }}
      >
        {/* Background image */}
        <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/bg.png')" }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,22,40,0.3) 0%, rgba(10,22,40,0.6) 60%, rgba(10,22,40,0.95) 100%)",
          }}
        />

        {/* Floating glows */}
        <div
          className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "#4a9eff" }}
        />
        <div
          className="absolute bottom-32 right-10 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: "#1a6bb5" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">

          {/* Navigation — top left */}
<div className="absolute top-8 left-8 flex items-center gap-2">
  {/* Back to Home */}
  <Link
    to="/"
    className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 hover:border-blue-400/60 hover:bg-blue-400/10 transition-all duration-300 group"
    style={{ textDecoration: "none" }}
    title="Back to Landing Page"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="group-hover:-translate-x-0.5 transition-transform duration-300"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </Link>

  {/* Login link */}
  <Link
    to="/login"
    className="text-sm font-medium hover:text-blue-300 transition-colors duration-300"
    style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
  >
    Already have an account?{" "}
    <span className="text-blue-400 hover:underline">Login</span>
  </Link>
</div>
         

          {/* Tagline */}
          <div>
            <h2
              className="text-4xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}
            >
              One Step Closer
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>
              Empowering talent and organizations to connect, collaborate, and grow together through a unified and modern platform.
            </p>

            {/* Stats row */}
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
        <Link
          to="/login"
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm"
          style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Login
        </Link>

        {/* Mobile navigation */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <Link
            to="/"
            className="p-1 text-white/50 hover:text-white"
            style={{ textDecoration: "none" }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            to="/login"
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
          >
            Already have an account?{" "}
            <span className="text-blue-400 underline">Login</span>
          </Link>
        </div>


        {/* Subtle background glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ background: "#4a9eff" }}
        />

        <div className="w-full max-w-md relative z-10 text-left">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            {/* Logo icon */}
            <div className="flex justify-center mb-4">
              <img
                src="/assets/images/logo.png"
                alt="Logo"
                className="w-23 h-23 object-contain"
                />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>
              Welcome To EarlyPath
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Sign up Your Company Account and Start Your Journey with Us
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {(errorMsg || error) && (
              <div
                className="px-4 py-3 rounded-lg text-sm border"
                style={{
                  background: "rgba(255,59,48,0.1)",
                  borderColor: "rgba(255,59,48,0.3)",
                  color: "#ff6b6b",
                }}
              >
                {errorMsg || error}
              </div>
            )}

            {/* Nama Perusahaan */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Company Name"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(74,158,255,0.5)";
                  e.target.style.background = "rgba(74,158,255,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(255,255,255,0.07)";
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@perusahaan.com"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(74,158,255,0.5)";
                  e.target.style.background = "rgba(74,158,255,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(255,255,255,0.07)";
                }}
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Your Company Address"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(74,158,255,0.5)";
                  e.target.style.background = "rgba(74,158,255,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(255,255,255,0.07)";
                }}
              />
            </div>

            {/* Logo Upload */}
<div>
  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
    Company Logo <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
  </label>
  <div className="flex items-center gap-4">
    <div
      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {logoPreview ? (
        <img src={logoPreview} alt="preview" className="w-full h-full object-cover" />
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )}
    </div>
    <label
      htmlFor="logo-upload"
      className="flex-1 px-4 py-3 rounded-xl text-sm cursor-pointer text-center transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px dashed rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(74,158,255,0.4)"; e.currentTarget.style.color = "rgba(74,158,255,0.8)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
    >
      {logo ? logo.name : "Click to upload logo"}
      <input id="logo-upload" type="file" accept="image/jpg,image/jpeg,image/png,image/webp" onChange={handleLogo} className="hidden" />
    </label>
  </div>
  <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>JPG, PNG, atau WEBP. Maks 2MB.</p>
</div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(74,158,255,0.5)";
                    e.target.style.background = "rgba(74,158,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.07)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-opacity hover:opacity-100"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
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

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Re-enter Your Password"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(74,158,255,0.5)";
                  e.target.style.background = "rgba(74,158,255,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.target.style.background = "rgba(255,255,255,0.07)";
                }}
              />
            </div>

            {/* Terms & Policy */}
<div className="flex items-start gap-3">
  <input
    type="checkbox"
    id="terms"
    required
    className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-blue-500"
  />
  <label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer" style={{ color: "rgba(255,255,255,0.5)" }}>
    I agree to the{" "}
    <a href="/terms" target="_blank" className="transition-colors duration-200" style={{ color: "#4a9eff" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}
    >
      Terms of Service
    </a>
    {" "}and{" "}
    <a href="/privacy" target="_blank" className="transition-colors duration-200" style={{ color: "#4a9eff" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}
    >
      Privacy Policy
    </a>
  </label>
</div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2 relative overflow-hidden"
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
                  Sign up...
                </span>
              ) : (
                "Sign-Up"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                or
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.97)",
                color: "#1a1a2e",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.97)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Login link (bottom, mobile-friendly alternative) */}
          <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
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