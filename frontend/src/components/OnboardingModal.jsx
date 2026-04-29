import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function OnboardingModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [choice, setChoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const [step, setStep] = useState("choice");

  if (!isOpen) return null;

  const handleChoice = (selected) => {
    setChoice(selected);
    setStep(`${selected}_form`);
  };

  const handleBack = () => {
    setStep("choice");
    setChoice(null);
    setErrorMsg("");
  };

  const handleClose = () => {
    setStep("choice");
    setChoice(null);
    setErrorMsg("");
    setCompanyForm({ name: "", phone: "", address: "", password: "" });
    setCandidateForm({ phone: "", institution: "", education_level: "", major: "" });
    onClose();
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (companyForm.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/create-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: companyForm.name,
          phone: companyForm.phone,
          address: companyForm.address,
          password: companyForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) throw new Error(Object.values(data.errors).flat().join(", "));
        throw new Error(data.message || "Failed to create company");
      }

      localStorage.setItem("company", JSON.stringify(data.company));
      localStorage.setItem("user_type", "admin");
      localStorage.setItem("is_new_user", "false");

      useAuthStore.setState({ company: data.company });

      handleClose();
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8000/api/create-candidate-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: candidateForm.phone,
          institution: candidateForm.institution,
          education_level: candidateForm.education_level,
          major: candidateForm.major,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) throw new Error(Object.values(data.errors).flat().join(", "));
        throw new Error(data.message || "Failed to create candidate profile");
      }

      localStorage.setItem("candidate_profile", JSON.stringify(data.candidate_profile));
      localStorage.setItem("user_type", "candidate");
      localStorage.setItem("is_new_user", "false");

      useAuthStore.setState({ candidate_profile: data.candidate_profile });

      handleClose();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-2">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 rounded-lg transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
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

          <h2 className="text-xl font-bold text-white text-center">
            {step === "choice" && "Choose Your Path"}
            {step === "company_form" && "Start a Company"}
            {step === "candidate_form" && "Start an Internship"}
          </h2>
          <p className="text-xs text-center mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {step === "choice" && `Hello ${user?.name || "User"}! Choose one of the options below`}
            {step === "company_form" && "Fill in your company details to get started"}
            {step === "candidate_form" && "Complete your profile as a candidate"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
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
                onClick={() => handleChoice("company")}
                className="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(74,158,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(74,158,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
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
                  <h3 className="text-white font-semibold">Start a Company</h3>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Register your company, manage internships, recruit talents
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                onClick={() => handleChoice("candidate")}
                className="w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(74,158,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(74,158,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
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
                  <h3 className="text-white font-semibold">Start an Internship</h3>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Find companies, apply for internship positions
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Step: Company Form */}
          {step === "company_form" && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Company Password
                </label>
                <input
                  type="password"
                  value={companyForm.password}
                  onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e) => Object.assign(e.target.style, inputBase)}
                />
                <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  A separate password for company dashboard login
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.1)",
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
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
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Education Level
                  </label>
                  <select
                    value={candidateForm.education_level}
                    onChange={(e) => setCandidateForm({ ...candidateForm, education_level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-200"
                    style={{
                      ...inputBase,
                      color: candidateForm.education_level === "" ? "#9ca3af" : "white",
                    }}
                    onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                    onBlur={(e) => Object.assign(e.target.style, inputBase)}
                  >
                    <option value="" style={{ background: "#0d1f3c", color: "#9ca3af" }}>Select level</option>
                    <option value="High School" style={{ background: "#0d1f3c", color: "white" }}>High School</option>
                    <option value="D3" style={{ background: "#0d1f3c", color: "white" }}>D3</option>
                    <option value="Bachelor" style={{ background: "#0d1f3c", color: "white" }}>Bachelor</option>
                    <option value="Master" style={{ background: "#0d1f3c", color: "white" }}>Master</option>
                    <option value="PhD" style={{ background: "#0d1f3c", color: "white" }}>PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
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
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.1)",
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