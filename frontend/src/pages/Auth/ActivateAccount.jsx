import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDashboardPathByRole } from "../../utils/roleUtils";

// ── SVG Icon Components ──────────────────────────────────────────────
const Icon = {
  Division: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  ),
  Position: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    </svg>
  ),
  Status: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
  JobLevel: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Schedule: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Role: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 12l5 5L20 7" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Cross: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  Spinner: ({ size = 16 }) => (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  SpinnerBlue: ({ size = 36 }) => (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(74,158,255,0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke="#4a9eff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  Alert: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="1.5" opacity="0.5"/>
      <path d="M12 8v4M12 16h.01" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Success: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="1.5" opacity="0.4"/>
      <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  LoggedIn: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const [step, setStep] = useState("preview");
  const [invitation, setInvitation] = useState(null);
  const [company, setCompany] = useState(null);
  const [codeLoading, setCodeLoading] = useState(true);
  const [codeError, setCodeError] = useState("");

  // User yang sudah login sebelumnya (dari localStorage, diisi saat login)
  const [existingUser, setExistingUser] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Ambil data user yang sudah login dari localStorage
    // Data ini diset saat user login via endpoint /api/auth/login
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        // Pastikan user memang punya data yang valid (sudah login)
        if (u && u.id_user && u.email) {
          setExistingUser(u);
          // Pre-fill form dari data user yang sudah ada di DB
          const nameParts = (u.name || "").split(" ");
          setForm(prev => ({
            ...prev,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            email: u.email || "",
          }));
        }
      }
    } catch {}

    if (!code) {
      setCodeError("Invitation code not found.");
      setCodeLoading(false);
      return;
    }

    const validateCode = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/invitation-codes/validate/${code}`,
          { headers: { Accept: "application/json" } }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Invalid code");
        setInvitation(data.invitation);
        setCompany(data.invitation.company ?? { name: data.invitation.id_company });
      } catch (err) {
        setCodeError(err.message);
      } finally {
        setCodeLoading(false);
      }
    };
    validateCode();
  }, [code]);

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
    if (score <= 2) return { level: 2, label: "Fair", color: "#f97316" };
    if (score <= 3) return { level: 3, label: "Good", color: "#eab308" };
    return { level: 4, label: "Strong", color: "#22c55e" };
  };

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (form.password !== form.password_confirmation) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }
    setLoading(true);
    try {
      // Kalau ada user yang sudah login, kirim token-nya
      // Backend akan pakai user existing, bukan buat baru
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const token = localStorage.getItem("auth_token");
      if (existingUser && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8000/api/auth/activate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          invitation_code: code,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Activation failed");

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("hr_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("company", JSON.stringify(data.company));

      const role = data.redirect_role || data.user?.role;
      const companyId = data.company?.id_company ?? data.user?.id_company;
      const redirectPath = data.redirect_path || getDashboardPathByRole(role, companyId);

      setDone(true);
      setTimeout(() => navigate(redirectPath, { replace: true }), 2000);
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
  const inputLocked = {
    background: "rgba(74,158,255,0.05)",
    border: "1px solid rgba(74,158,255,0.15)",
    fontSize: "14px",
    cursor: "not-allowed",
    color: "rgba(255,255,255,0.5)",
  };

  const scheduleLabel = (val) => ({
    wfo_fullweek: "WFO – Full Week",
    wfh_fullweek: "WFH – Full Week",
    hybrid_3_2: "Hybrid 3/2",
    hybrid_2_3: "Hybrid 2/3",
    shift_morning: "Shift Pagi",
    shift_afternoon: "Shift Siang",
    shift_night: "Shift Malam",
    flexible: "Flexible",
  }[val] || val);

  // ── Loading ──
  if (codeLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#0a1628 40%,#071220 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <Icon.SpinnerBlue size={36} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Verifying invitation code...</p>
        </div>
      </div>
    );
  }

  // ── Kode invalid ──
  if (codeError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#0a1628 40%,#071220 100%)" }}>
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)" }}>
              <Icon.Alert />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Code</h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>{codeError}</p>
          <button onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#2d7dd2 0%,#4a9eff 100%)", border: "none", cursor: "pointer" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // STEP: PREVIEW
  // ══════════════════════════════════════════════
  if (step === "preview") {
    const details = [
      invitation?.division       && { Icon: Icon.Division,  label: "Division",  value: invitation.division },
      invitation?.position       && { Icon: Icon.Position,  label: "Position",  value: invitation.position },
      invitation?.employee_status && { Icon: Icon.Status,   label: "Status",    value: invitation.employee_status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) },
      invitation?.job_level      && { Icon: Icon.JobLevel,  label: "Job Level", value: invitation.job_level },
      invitation?.schedule       && { Icon: Icon.Schedule,  label: "Schedule",  value: scheduleLabel(invitation.schedule) },
      invitation?.role?.name     && { Icon: Icon.Role,      label: "Role",      value: invitation.role.name },
    ].filter(Boolean);

    return (
      <div className="min-h-screen w-full flex"
        style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#0a1628 40%,#071220 100%)", fontFamily: "'Poppins','Segoe UI',sans-serif" }}>

        {/* ── Left Panel ── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2044 50%,#0a1a35 100%)" }}>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/images/bg.png')" }} />
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom,rgba(10,22,40,0.3) 0%,rgba(10,22,40,0.6) 60%,rgba(10,22,40,0.95) 100%)" }} />
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#4a9eff" }} />
          <div className="absolute bottom-32 right-10 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: "#1a6bb5" }} />
          <div className="relative z-10 flex flex-col justify-end p-12 pb-32">
            <div className="inline-flex items-center px-3 py-1 rounded-full mb-2 self-start"
              style={{ background: "rgba(93,216,216,0.1)", border: "1px solid rgba(93,216,216,0.2)" }}>
              <p className="text-xs font-medium" style={{ color: "#5dd8d8" }}>✦ You've been invited</p>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: "-0.5px" }}>
              Your Spot is<br />Reserved
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>
              Review your invitation details below, then complete your account to get started.
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
            style={{ background: "#4a9eff" }} />

          <div className="w-full max-w-md relative z-10">

            {/* Company header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#1a3a6e,#2d5ba3)", border: "1px solid rgba(74,158,255,0.2)" }}>
                {company?.logo_path
                  ? <img src={`http://localhost:8000/storage/${company.logo_path}`} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xl font-black text-white">{company?.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "1px", textTransform: "uppercase" }}>Invitation from</p>
                <h1 className="text-xl font-bold text-white">{company?.name}</h1>
              </div>
            </div>

            {/* Invitation label */}
            {invitation?.label && (
              <div className="mb-5 px-4 py-3 rounded-xl"
                style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.18)" }}>
                <p className="text-xs mb-1" style={{ color: "rgba(74,158,255,0.6)" }}>Invitation Label</p>
                <p className="text-sm font-semibold text-white">{invitation.label}</p>
              </div>
            )}

            {/* Detail rows */}
            {details.length > 0 && (
              <div className="rounded-2xl overflow-hidden mb-6"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                {details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: i < details.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <d.Icon />
                      <span className="text-sm">{d.label}</span>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background: "rgba(74,158,255,0.1)", color: "#4a9eff", border: "1px solid rgba(74,158,255,0.15)" }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Who's joining — tampil kalau user sudah login sebelumnya */}
            {existingUser && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                  {existingUser.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{existingUser.name}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{existingUser.email}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <Icon.LoggedIn />
                  Logged in
                </span>
              </div>
            )}

            <button onClick={() => setStep("form")}
              className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg,#2d7dd2 0%,#4a9eff 100%)",
                boxShadow: "0 4px 24px rgba(74,158,255,0.35)",
                border: "none", cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              Continue and Complete Your Account →
            </button>

            <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
              By continuing you agree to EarlyPath's terms & conditions
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // STEP: FORM
  // ══════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2044 50%,#0a1a35 100%)" }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/bg.png')" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom,rgba(10,22,40,0.3) 0%,rgba(10,22,40,0.6) 60%,rgba(10,22,40,0.95) 100%)" }} />
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
              <p className="text-xs font-medium" style={{ color: "#5dd8d8" }}>✦ One last step</p>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: "-0.5px" }}>
              Complete Your<br />Account
            </h2>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px" }}>
              Fill in your details to activate your account and start your journey with EarlyPath.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0d1f3c 0%,#0a1628 40%,#071220 100%)" }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ background: "#4a9eff" }} />

        <div className="w-full max-w-md relative z-10">
          {/* Back + Title */}
          <div className="mb-6">
            <button onClick={() => setStep("preview")}
              className="flex items-center gap-2 text-sm mb-5"
              style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
              <Icon.ArrowLeft />
              Back to preview
            </button>
            <div className="flex justify-center mb-4">
              {company?.logo_path
                ? <img src={`http://localhost:8000/storage/${company.logo_path}`} alt={company.name} className="w-16 h-16 object-contain rounded-2xl" />
                : <img src="/assets/images/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
              }
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-1" style={{ letterSpacing: "-0.3px" }}>
              Activate Your Account
            </h1>
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              Joining <span style={{ color: "#4a9eff" }}>{company?.name}</span>
            </p>
          </div>

          {/* Notice kalau user sudah punya akun — nama & email dikunci */}
          {existingUser && (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl mb-5"
              style={{ background: "rgba(74,158,255,0.06)", border: "1px solid rgba(74,158,255,0.12)" }}>
              <div className="mt-0.5 flex-shrink-0" style={{ color: "#4a9eff" }}>
                <Icon.Lock />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(74,158,255,0.7)" }}>
                Your name and email have been automatically filled in from your existing account and cannot be changed.
                You only need to create a new password for this account.
              </p>
            </div>
          )}

          {done ? (
            <div className="text-center">
              <div className="px-5 py-5 rounded-xl mb-6 flex flex-col items-center gap-3"
                style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.25)", color: "#81c784" }}>
                <Icon.Success />
                <div>
                  <p className="font-semibold text-base mb-1">Account activated!</p>
                  <p style={{ color: "rgba(129,199,132,0.75)", fontSize: "13px" }}>Redirecting to dashboard...</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="px-4 py-3 rounded-lg text-sm border"
                  style={{ background: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.3)", color: "#ff6b6b" }}>
                  {errorMsg}
                </div>
              )}

              {/* First & Last Name */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                    First Name
                    {existingUser && (
                      <span style={{ color: "rgba(74,158,255,0.6)" }}>
                        <Icon.Lock />
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={e => !existingUser && setForm({ ...form, first_name: e.target.value })}
                    readOnly={!!existingUser}
                    placeholder="John"
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={existingUser ? inputLocked : inputBase}
                    onFocus={e => { if (!existingUser) Object.assign(e.target.style, inputFocus); }}
                    onBlur={e => { if (!existingUser) Object.assign(e.target.style, inputBase); }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Last Name
                    {existingUser && (
                      <span style={{ color: "rgba(74,158,255,0.6)" }}>
                        <Icon.Lock />
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={e => !existingUser && setForm({ ...form, last_name: e.target.value })}
                    readOnly={!!existingUser}
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={existingUser ? inputLocked : inputBase}
                    onFocus={e => { if (!existingUser) Object.assign(e.target.style, inputFocus); }}
                    onBlur={e => { if (!existingUser) Object.assign(e.target.style, inputBase); }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Email
                  {existingUser && (
                    <span style={{ color: "rgba(74,158,255,0.6)" }}>
                      <Icon.Lock />
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => !existingUser && setForm({ ...form, email: e.target.value })}
                  readOnly={!!existingUser}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={existingUser ? inputLocked : inputBase}
                  onFocus={e => { if (!existingUser) Object.assign(e.target.style, inputFocus); }}
                  onBlur={e => { if (!existingUser) Object.assign(e.target.style, inputBase); }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBase)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                    {showPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength.level ? strength.color : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strength.color }}>Strength: {strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputBase)}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer" }}>
                    {showConfirm ? <Icon.EyeOff /> : <Icon.Eye />}
                  </button>
                  {form.password_confirmation && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      {form.password === form.password_confirmation ? <Icon.Check /> : <Icon.Cross />}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 mt-2"
                style={{
                  background: loading ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg,#2d7dd2 0%,#4a9eff 100%)",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(74,158,255,0.35)",
                  border: "none", cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <Icon.Spinner size={16} />
                      Activating account...
                    </span>
                  : "Activate Account & Login"
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}