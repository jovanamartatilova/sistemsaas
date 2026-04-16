import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function LoginCandidate() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, company: authCompany, loading: authLoading } = useAuthStore();

    const [company, setCompany] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            if (user?.role === "candidate") {
                // For candidates: check if they have a company
                // Priority: company.slug (from response/localStorage) > user.id_company (from DB)
                if (authCompany?.slug) {
                    navigate(`/c/${authCompany.slug}`);
                } else if (slug) {
                    navigate(`/c/${slug}`);
                } else if (user?.id_company) {
                    // Fallback if company details not in store but user has id_company
                    navigate("/candidate/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                navigate("/dashboard");
            }
        }
    }, [isAuthenticated, authLoading, user, authCompany, navigate]);

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8000/api/auth/login-candidate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    slug: slug || undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login gagal");

            // Store companies_applied if user has any
            if (data.companies_applied && data.companies_applied.length > 0) {
                // If no company in response but user has companies_applied, use the first one
                if (!data.company && data.companies_applied.length > 0) {
                    data.company = data.companies_applied[0];
                }
            }

            localStorage.setItem("auth_token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // Only store company if it was returned or selected from companies_applied
            if (data.company) {
                localStorage.setItem("company", JSON.stringify(data.company));
            } else {
                localStorage.removeItem("company");
            }

            // Update auth store for reactivity
            useAuthStore.setState({ 
                isAuthenticated: true, 
                token: data.token, 
                user: data.user,
                company: data.company || null
            });

            setSuccessMsg("✓ Login berhasil!");

            setTimeout(() => {
                // Redirect based on whether candidate has company in response
                if (data.company && data.company.slug) {
                    navigate(`/c/${data.company.slug}`);
                } else if (slug) {
                    navigate(`/c/${slug}`);
                } else {
                    navigate(`/candidate/dashboard`);
                }
            }, 1500);
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
                        style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", boxShadow: "0 4px 20px rgba(74,158,255,0.3)", border: "none", cursor: "pointer" }}>
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

                {/* Navigation — top left */}
                <div className="absolute top-8 left-8 flex items-center gap-4 z-50 pointer-events-auto">
                    {/* Back to Home */}
                    <Link
                        to="/"
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:border-blue-400/60 hover:bg-blue-400/10 transition-all duration-300 group bg-transparent cursor-pointer"
                        style={{ textDecoration: "none", outline: "none" }}
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

                    {/* Switch to Register */}
                    <Link
                        to={`/c/${slug}/register`}
                        className="text-sm font-medium hover:text-blue-300 transition-colors duration-300"
                        style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}
                    >
                        Don't have an account?{" "}
                        <span className="text-blue-400 hover:underline">Sign up</span>
                    </Link>
                </div>

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
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
                style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}>

                {/* Mobile navigation */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-4 z-50 pointer-events-auto">
                    <Link
                        to="/"
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200 bg-transparent cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", outline: "none" }}
                    >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <Link
                        to={`/c/${slug}/register`}
                        className="text-sm"
                        style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
                    >
                        Don't have an account?{" "}
                        <span className="text-blue-400 underline">Sign up</span>
                    </Link>
                </div>

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
                        <p className="text-sm font-medium mb-1" style={{ color: "rgba(74,158,255,0.85)" }}>Welcome back to</p>
                        <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>
                            {companyLoading ? (
                                <span className="inline-block w-36 h-7 rounded animate-pulse align-middle" style={{ background: "rgba(255,255,255,0.1)" }} />
                            ) : (
                                <span style={{ color: "#4a9eff" }}>{company?.name ?? "EarlyPath"}</span>
                            )}
                        </h1>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Sign in to your account and continue your journey.
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
                            <input type="email" name="email" value={form.email} onChange={handleChange}
                                placeholder="john@email.com" required
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
                                    onClick={() => navigate(`/c/${slug}/forgot-password`)}
                                    className="text-xs transition-colors duration-200"
                                    style={{ ...btnLink, color: "#4a9eff" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}>
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"}
                                    name="password" value={form.password} onChange={handleChange}
                                    placeholder="Enter your password" required
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                                    style={inputBase}
                                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                                    onBlur={(e) => Object.assign(e.target.style, inputBase)} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                                    style={{ color: "rgba(255,255,255,0.4)" }}>
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

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-1">
                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>or</span>
                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                        </div>

                        {/* Google */}
                        <button type="button"
                            className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
                            style={{ background: "rgba(255,255,255,0.97)", color: "#1a1a2e" }}
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
                    </form>

                    {/* Register link */}
                    <p className="text-center mt-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Don't have an account?{" "}
                        <button
                            onClick={() => navigate(`/c/${slug}/register`)}
                            className="font-semibold transition-colors duration-200"
                            style={{ ...btnLink, color: "#4a9eff" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#7bb8ff")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#4a9eff")}
                        >
                            Sign up here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}