import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { api } from "../api";
import PasswordInput from "./PasswordInput";
import { validatePassword } from "../utils/passwordValidator";

const IconKey = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="16" r="3"/>
    <path d="M16 10l3-3m0 0l-3-3m3 3h-6"/>
  </svg>
);

export default function OnboardingModal({ isOpen, onClose }) {
  const isDark = localStorage.getItem("theme") !== "light";
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [step, setStep] = useState("choice"); // choice, company_form, candidate_form, invitation_input
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [inviteData, setInviteData] = useState(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    phone: "",
    address: "",
    password: "",
  });

  const [candidateForm, setCandidateForm] = useState({
    phone: "",
    institution: "",
    education_level: "",
    major: "",
  });

  if (!isOpen) return null;

  const handleBack = () => {
    setStep("choice");
    setErrorMsg("");
  };

  const handleClose = () => {
    // Just close the modal - don't navigate
    // Parent component (SignUp) will handle navigation if needed
    setStep("choice");
    setErrorMsg("");
    setInvitationCode("");
    setInviteData(null);
    setCompanyForm({ name: "", phone: "", address: "", password: "" });
    setCandidateForm({ phone: "", institution: "", education_level: "", major: "" });
    onClose();
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Validate password
    const { valid: isPasswordValid, errors: passwordErrors } = validatePassword(companyForm.password);
    if (!isPasswordValid) {
      setErrorMsg(passwordErrors[0] || "Invalid password");
      setLoading(false);
      return;
    }

    try {
      const response = await api('/create-company', {
        method: 'POST',
        data: {
          name: companyForm.name,
          phone: companyForm.phone,
          address: companyForm.address,
          password: companyForm.password,
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response || !response.message) {
        throw new Error('Failed to create company');
      }

      // Update store and localStorage with new role
      useAuthStore.setState(state => ({
        ...state,
        company: response.company || null,
        user: response.user || state.user,
      }));

      localStorage.setItem("company", JSON.stringify(response.company));
      localStorage.setItem("user_type", "admin");
      localStorage.setItem("is_new_user", "false");
      
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Close modal and navigate in sequence to avoid race conditions
      handleClose();
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } catch (err) {
      console.error('Company submit error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await api('/create-candidate-profile', {
        method: 'POST',
        data: {
          phone: candidateForm.phone,
          institution: candidateForm.institution,
          education_level: candidateForm.education_level,
          major: candidateForm.major,
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response || !response.message) {
        throw new Error('Failed to create candidate profile');
      }

      // Update store and localStorage with new role
      useAuthStore.setState(state => ({
        ...state,
        candidate_profile: response.candidate_profile || null,
        user: response.user || state.user,
      }));

      localStorage.setItem("candidate_profile", JSON.stringify(response.candidate_profile));
      localStorage.setItem("user_type", "candidate");
      localStorage.setItem("is_new_user", "false");
      
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      handleClose();
      setTimeout(() => navigate("/candidate/dashboard", { replace: true }), 100);

    } catch (err) {
      console.error('Candidate submit error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create candidate profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!invitationCode.trim()) {
      setErrorMsg("Please enter an invitation code");
      setLoading(false);
      return;
    }

    try {
      const validationRes = await api(`/invitation-codes/validate/${invitationCode.trim()}`);
      
      if (!validationRes.valid) {
        throw new Error('Invalid invitation code');
      }

      setInviteData({
        code: invitationCode,
        companyId: validationRes.invitation?.id_company,
        roleId: validationRes.invitation?.id_role,
        redirectRole: validationRes.redirect_role
      });

      const inviteRole = validationRes.redirect_role || 'candidate';
      navigate(`/activate?code=${invitationCode}`); onClose();

    } catch (err) {
      console.error('Invitation validation error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid invitation code');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
      background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
      fontSize: "14px",
      color: isDark ? "#fff" : "#1a2332",
    };

    const inputFocus = {
      border: "1px solid rgba(74,158,255,0.5)",
      background: "rgba(74,158,255,0.08)",
      color: isDark ? "#fff" : "#1a2332",
    };

  return (
  <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.4)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-32px)]"
        style={{
          background: isDark
            ? "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)"
            : "linear-gradient(160deg, #ffffff 0%, #f0f4f8 40%, #e8edf5 100%)",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-4 sm:px-6 pt-6 pb-2 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 rounded-lg transition-colors duration-200"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(30,40,60,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? "#fff" : "#1a2332")}
            onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "rgba(255,255,255,0.4)" : "rgba(30,40,60,0.4)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex justify-center mb-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,158,255,0.15)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-center" style={{ color: isDark ? "#fff" : "#1a2332" }}>
            {step === "choice" && "Choose Your Path"}
            {step === "company_form" && "Start a Company"}
            {step === "candidate_form" && "Start an Internship"}
            {step === "invitation_input" && "Enter Invitation Code"}
          </h2>
          <p className="text-xs text-center mt-1" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(30,40,60,0.55)" }}>
            {step === "choice" && `Hello ${user?.name || "User"}! Choose one of the options below`}
            {step === "company_form" && "Fill in your company details to get started"}
            {step === "candidate_form" && "Complete your profile as a candidate"}
            {step === "invitation_input" && "Provide the code you received to join"}
          </p>
        </div>

        {/* Body - Scrollable */}
        <div className="px-4 sm:px-6 py-6 overflow-y-auto flex-1"
          style={{
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain',
          }}>
          {errorMsg && (
            <div
              className="px-4 py-3 rounded-lg mb-4 text-sm border"
              style={{ background: "rgba(255,59,48,0.1)", borderColor: "rgba(255,59,48,0.3)", color: "#ff6b6b" }}
            >
              {errorMsg}
            </div>
          )}

          {/* Step: Choice */}
          {step === "choice" && (
            <div className="space-y-3">
              <button
                onClick={() => setStep("company_form")}
                className="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(74,158,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(74,158,255,0.3)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(74,158,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
                  e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
                  e.currentTarget.style.boxShadow = isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(74,158,255,0.15)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: isDark ? "#fff" : "#1a2332" }}>Start a Company</h3>
                  <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(30,40,60,0.55)" }}>
                    Register your company, manage internships, recruit talents
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => setStep("candidate_form")}
                className="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4"
              style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(74,158,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(74,158,255,0.3)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(74,158,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
                  e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
                  e.currentTarget.style.boxShadow = isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(74,158,255,0.15)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.5">
                    <path d="M12 2a10 10 0 1010 10 10 10 0 00-10-10z" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: isDark ? "#fff" : "#1a2332" }}>Start an Internship</h3>
                  <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(30,40,60,0.55)" }}>
                    Find companies, apply for internship positions
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => setStep("invitation_input")}
                className="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(245,158,11,0.1)";
                  e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,158,11,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
                  e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
                  e.currentTarget.style.boxShadow = isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(245,158,11,0.15)" }}
                >
                  <IconKey />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold" style={{ color: isDark ? "#fff" : "#1a2332" }}>I Have an Invitation Code</h3>
                  <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(30,40,60,0.55)" }}>
                    Join using your invitation code
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Step: Invitation Code Input */}
          {step === "invitation_input" && (
            <form onSubmit={handleInvitationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                  Invitation Code
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-ABC123XYZ"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl placeholder-gray-500 outline-none transition-all duration-200 font-mono tracking-wider"
                  style={{
                    ...inputBase,
                    textTransform: 'uppercase',
                    letterSpacing: '0.75px'
                  }}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
                <p className="text-xs mt-2" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(30,40,60,0.3)" }}>
                  You should have received this code from your company or team administrator
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(30,40,60,0.7)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !invitationCode.trim()}
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                  style={{
                    background: loading || !invitationCode.trim() ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
                  }}
                >
                  {loading ? "Validating..." : "Validate & Continue"}
                </button>
              </div>
            </form>
          )}

          {/* Step: Company Form */}
          {step === "company_form" && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="Your Company Name"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="0812 3456 7890"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                  Address
                </label>
                <textarea
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  placeholder="Your Company Address"
                  required
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200 resize-none"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
              </div>

              <div>
                <PasswordInput
                  value={companyForm.password}
                  onChange={(val) => setCompanyForm({ ...companyForm, password: val })}
                  label="Company Password"
                  isDark={isDark}
                  showStrength={true}
                  showRules={true}
                />
                <p className="text-xs mt-1.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(30,40,60,0.3)" }}>
                  A separate password for company dashboard login
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(30,40,60,0.7)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                  style={{
                    background: loading ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
                  }}
                >
                  {loading ? "Processing..." : "Create Company"}
                </button>
              </div>
            </form>
          )}

          {/* Step: Candidate Form */}
          {step === "candidate_form" && (
            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                  placeholder="0812 3456 7890 (optional)"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                  Institution / University
                </label>
                <input
                  type="text"
                  value={candidateForm.institution}
                  onChange={(e) => setCandidateForm({ ...candidateForm, institution: e.target.value })}
                  placeholder="University of Indonesia (optional)"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                    Education Level
                  </label>
                  <select
                    value={candidateForm.education_level}
                    onChange={(e) => setCandidateForm({ ...candidateForm, education_level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={{
                      ...inputBase,
                      color: candidateForm.education_level === "" 
                        ? (isDark ? "#6b7280" : "rgba(30,40,60,0.4)") 
                        : (isDark ? "white" : "#1a2332"),
                    }}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                  >
                    <option value="" style={{ background: isDark ? "#0d1f3c" : "#ffffff", color: isDark ? "#9ca3af" : "rgba(30,40,60,0.4)" }}>Select level</option>
                    <option value="High School" style={{ background: isDark ? "#0d1f3c" : "#ffffff", color: isDark ? "white" : "#1a2332" }}>High School</option>
                    <option value="D3" style={{ background: isDark ? "#0d1f3c" : "#ffffff", color: isDark ? "white" : "#1a2332" }}>D3</option>
                    <option value="Bachelor" style={{ background: isDark ? "#0d1f3c" : "#ffffff", color: isDark ? "white" : "#1a2332" }}>Bachelor</option>
                    <option value="Master" style={{ background: isDark ? "#0d1f3c" : "#ffffff", color: isDark ? "white" : "#1a2332" }}>Master</option>
                    <option value="PhD" style={{ background: isDark ? "#0d1f3c" : "#ffffff", color: isDark ? "white" : "#1a2332" }}>PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,40,60,0.8)" }}>
                    Major
                  </label>
                  <input
                    type="text"
                    value={candidateForm.major}
                    onChange={(e) => setCandidateForm({ ...candidateForm, major: e.target.value })}
                    placeholder="Computer Science"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                    style={inputBase}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(30,40,60,0.7)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                  style={{
                    background: loading ? "rgba(74,158,255,0.5)" : "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)",
                  }}
                >
                  {loading ? "Processing..." : "Continue"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}