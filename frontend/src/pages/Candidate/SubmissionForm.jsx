import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

/* ─── Searchable Dropdown ─────────────────────────────────────── */
function SearchableSelect({ options = [], value, onChange, placeholder = "Search & select…", required }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 14px",
          background: "#fff",
          border: open ? "1.5px solid #1a56db" : "1.5px solid #d1d5db",
          borderRadius: 10,
          fontSize: 14,
          color: selected ? "#111827" : "#9ca3af",
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "border 0.15s",
          textAlign: "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
          background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12,
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)", overflow: "hidden",
          animation: "dropIn 0.12s ease",
        }}>
          <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div style={{ padding: "10px 10px 6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search role…"
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: "#111827", width: "100%", fontFamily: "inherit" }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 6px 8px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px 10px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No results found</div>
            ) : filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 12px", border: "none",
                  borderRadius: 8, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit",
                  background: value === o.value ? "#eff6ff" : "transparent",
                  color: value === o.value ? "#1a56db" : "#374151",
                  fontWeight: value === o.value ? 600 : 400,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (value !== o.value) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { if (value !== o.value) e.currentTarget.style.background = "transparent"; }}
              >
                {o.label}
                {value === o.value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── File Upload Card ───────────────────────────────────────── */
function FileCard({ label, name, required, hint, value, error, onChange }) {
  return (
    <div style={{
      background: value ? "#f0fdf4" : "#fafafa",
      border: `1.5px dashed ${error ? "#f87171" : value ? "#86efac" : "#d1d5db"}`,
      borderRadius: 12, padding: "16px 18px",
      transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: hint ? 6 : 10 }}>
        <div>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>{label}</span>
          {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </div>
        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, flexShrink: 0, marginLeft: 8 }}>PDF · Max 2 MB</span>
      </div>
      {hint && <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.5 }}>{hint}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="file" name={name} id={`file-${name}`} onChange={onChange} accept=".pdf" style={{ display: "none" }} />
        <label
          htmlFor={`file-${name}`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, cursor: "pointer",
            background: value ? "#dcfce7" : "#fff",
            border: `1px solid ${value ? "#86efac" : "#e5e7eb"}`,
            fontSize: 12.5, fontWeight: 600,
            color: value ? "#16a34a" : "#374151",
            transition: "all 0.15s",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {value ? "Replace" : "Choose File"}
        </label>
        {value && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ {value.name}</span>}
      </div>
      {error && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠ {error}</p>}
    </div>
  );
}

/* ─── Step Indicator ─────────────────────────────────────────── */
function StepIndicator({ current, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i < current ? "#1a56db" : i === current ? "#1a56db" : "#f3f4f6",
              color: i <= current ? "#fff" : "#9ca3af",
              fontSize: 12, fontWeight: 700, transition: "all 0.3s",
              boxShadow: i === current ? "0 0 0 4px rgba(26,86,219,0.15)" : "none",
            }}>
              {i < current ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === current ? 700 : 500, color: i === current ? "#1a56db" : i < current ? "#374151" : "#9ca3af", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "#1a56db" : "#e5e7eb", margin: "0 12px", transition: "background 0.3s", minWidth: 20 }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Section Wrapper ────────────────────────────────────────── */
function Section({ num, title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#1a56db,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
        }}>{num}</div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.2px" }}>{title}</h3>
      </div>
      <div style={{ paddingLeft: 0 }}>{children}</div>
    </div>
  );
}

/* ─── Input Field ────────────────────────────────────────────── */
function Field({ label, required, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px", fontSize: 14, color: "#111827",
  background: "#fff", border: "1.5px solid #d1d5db", borderRadius: 10,
  outline: "none", fontFamily: "inherit", transition: "border 0.15s", boxSizing: "border-box",
};

/* ─── Main Component ──────────────────────────────────────────── */
export default function SubmissionForm() {
  const { idCompany, vacancyId, positionId } = useParams();
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuthStore();

  const [company, setCompany] = useState(null);
  const [vacancy, setVacancy] = useState(null);
  const [positions, setPositions] = useState([]);   // all positions in this vacancy
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0 = personal, 1 = documents, 2 = info

  const [form, setForm] = useState({
    name: "",
    email: "",
    university_name: "",
    major_name: "",
    id_position: positionId || "",  // searchable dropdown
    cv_file: null,
    cover_letter_file: null,
    institution_letter_file: null,
    portfolio_file: null,
    linkedin_url: "",
    motivation_message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fileErrors, setFileErrors] = useState({});

  /* Pre-fill name from auth */
  useEffect(() => {
    if (user?.name && !form.name) setForm((p) => ({ ...p, name: user.name }));
  }, [user]);

  /* Auth guard */
  useEffect(() => {
    if (!authLoading && !token) {
      const t = setTimeout(() => navigate(`/c/${idCompany}/login`), 1500);
      return () => clearTimeout(t);
    }
  }, [token, authLoading]);

  /* Fetch data */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        alive && setLoading(true);
        const [profileRes, companyRes, vacanciesRes] = await Promise.all([
          token
            ? fetch("http://127.0.0.1:8000/api/auth/profile", {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
              }).catch(() => null)
            : Promise.resolve(null),
          fetch(`http://127.0.0.1:8000/api/c/${idCompany}`, { headers: { Accept: "application/json" } }),
          fetch(`http://127.0.0.1:8000/api/c/${idCompany}/vacancies`, { headers: { Accept: "application/json" } }),
        ]);

        if (!alive) return;

        if (profileRes?.ok) {
          const u = await profileRes.json();
          const p = u.company || u.user || {};
          setForm((prev) => ({ ...prev, name: p.name || "", email: p.email || "" }));
        }

        if (!companyRes.ok) throw new Error("Company not found");
        const cData = await companyRes.json();
        setCompany(cData.company);

        const vData = await vacanciesRes.json();
        const found = vData.vacancies?.find((v) => v.id_vacancy === vacancyId);
        if (found) {
          setVacancy(found);
          setPositions(found.positions || []);
        }
      } catch (err) {
        setErrorMsg(err.message || "Failed to load form data.");
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [idCompany, vacancyId]);

  const MAX_FILE = 2 * 1024 * 1024;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE) {
      setFileErrors((p) => ({ ...p, [e.target.name]: `"${file.name}" exceeds 2 MB (${(file.size / 1024 / 1024).toFixed(2)} MB)` }));
      e.target.value = "";
      return;
    }
    setFileErrors((p) => ({ ...p, [e.target.name]: null }));
    setForm((p) => ({ ...p, [e.target.name]: file }));
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* Step validation */
  const validateStep = (s) => {
    if (s === 0) {
      if (!form.name || !form.university_name || !form.major_name || !form.id_position) {
        setErrorMsg("Please complete all required fields in this section.");
        return false;
      }
    }
    if (s === 1) {
      if (!form.cv_file || !form.cover_letter_file) {
        setErrorMsg("CV and Documents are required.");
        return false;
      }
      const active = Object.values(fileErrors).filter(Boolean);
      if (active.length > 0) {
        setErrorMsg("Please fix file size errors before continuing.");
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((p) => p + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token) { setErrorMsg("You must be logged in to apply."); return; }
    if (!validateStep(2)) return;
    if (!form.motivation_message) { setErrorMsg("Please fill in your motivation."); return; }

    setSubmitting(true);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 30000);

    try {
      const fd = new FormData();
      fd.append("id_vacancy", vacancyId);
      fd.append("id_position", form.id_position);
      fd.append("name", form.name);
      fd.append("university_name", form.university_name);
      fd.append("major_name", form.major_name);
      fd.append("cv_file", form.cv_file);
      fd.append("cover_letter_file", form.cover_letter_file);
      if (form.institution_letter_file) fd.append("institution_letter_file", form.institution_letter_file);
      if (form.portfolio_file) fd.append("portfolio_file", form.portfolio_file);
      fd.append("linkedin_url", form.linkedin_url);
      fd.append("motivation_message", form.motivation_message);

      const res = await fetch(`http://127.0.0.1:8000/api/c/${idCompany}/apply`, {
        method: "POST",
        headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
        signal: ctrl.signal,
      });

      if (!res.ok) {
        let msg = "Submission failed";
        try { const d = await res.json(); msg = d.message || msg; } catch (_) {}
        throw new Error(msg);
      }

    setSuccessMsg("Application submitted successfully! 🎉");
    setTimeout(() => {
      // Cek role dari user atau langsung ke candidate dashboard
      if (user?.role === 'candidate') {
        navigate("/candidate/dashboard", { replace: true });
      } else {
        navigate(`/c/${idCompany}/dashboard`, { replace: true });
      }
    }, 2500);

    } catch (err) {
      if (err.name === "AbortError") setErrorMsg("Request timed out. Check your connection and try again.");
      else if (err.message === "Failed to fetch") setErrorMsg("Cannot connect to server. Ensure the backend is running on port 8000.");
      else setErrorMsg(err.message);
      setSubmitting(false);
    } finally {
      clearTimeout(timeout);
    }
  };

  /* Position options for dropdown */
  const positionOptions = positions.map((p) => ({ value: p.id_position, label: p.name }));

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "3px solid #e5e7eb", borderTop: "3px solid #1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: "#6b7280", fontSize: 13, fontWeight: 500 }}>Loading application form…</p>
      </div>
    </div>
  );

  /* ── Unauthed ── */
  if (!token && !authLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ padding: 40, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111827" }}>Login Required</h2>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>Redirecting you to the login page…</p>
        <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      </div>
    </div>
  );

  const STEPS = ["Personal Info", "Documents", "Final Details"];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        input:focus, textarea:focus { border-color: #1a56db !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.08); }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100, height: 58,
        padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(8,12,26,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: 40, width: "auto" }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
        </Link>
        {company && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Applying to</span>
            <span style={{
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(26,86,219,0.25)", border: "1px solid rgba(26,86,219,0.4)",
              fontSize: 12.5, fontWeight: 700, color: "#93b4ff",
            }}>{company.name}</span>
          </div>
        )}
      </header>

      <main style={{ width: "100%", margin: "0 auto", padding: "36px 24px 100px", animation: "fadeUp 0.4s ease" }}>

        {/* Back */}
        <button
          onClick={() => step > 0 ? setStep((p) => p - 1) : navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 28, transition: "color 0.15s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#111827"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          {step > 0 ? "Previous Step" : "Back"}
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 4, height: 32, background: "linear-gradient(180deg,#1a56db,#60a5fa)", borderRadius: 4 }} />
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>Application Form</h1>
          </div>
          {vacancy && (
            <p style={{ margin: "0 0 0 14px", fontSize: 13.5, color: "#6b7280" }}>
              <strong style={{ color: "#374151" }}>{vacancy.title}</strong> · Batch {vacancy.batch}
            </p>
          )}
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* Alerts */}
        {errorMsg && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "12px 16px", borderRadius: 10, marginBottom: 24, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a", padding: "12px 16px", borderRadius: 10, marginBottom: 24, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            {successMsg}
          </div>
        )}

        {/* ─────────────────────────────────────────── FORM CARD */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "36px 40px", animation: "fadeUp 0.3s ease" }}>
          <form onSubmit={handleSubmit}>

            {/* ══════ STEP 0: Personal Info ══════ */}
            {step === 0 && (
              <Section num="1" title="Applicant Information">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Full Name" required hint="Editable — changes will be saved to your profile.">
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#1a56db"} onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                  </Field>
                  <Field label="Registered Email">
                    <input value={form.email || user?.email || ""} disabled style={{ ...inputStyle, background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" }} />
                  </Field>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  <Field label="University" required>
                    <input
                      name="university_name" value={form.university_name} onChange={handleChange}
                      placeholder="e.g. University of Indonesia"
                      style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#1a56db"} onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                  </Field>
                  <Field label="Major" required>
                    <input
                      name="major_name" value={form.major_name} onChange={handleChange}
                      placeholder="e.g. Information Systems"
                      style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#1a56db"} onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                  </Field>
                </div>

                {/* ── Role / Position Dropdown ── */}
                <div style={{ marginTop: 16 }}>
                  <Field label="Role Applied For" required hint="Search by name to quickly find the position you want.">
                    <SearchableSelect
                      options={positionOptions}
                      value={form.id_position}
                      onChange={(val) => setForm((p) => ({ ...p, id_position: val }))}
                      placeholder="Search and select a role…"
                    />
                  </Field>
                </div>
              </Section>
            )}

            {/* ══════ STEP 1: Documents ══════ */}
            {step === 1 && (
              <Section num="2" title="Upload Documents">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <FileCard
                    label="CV / Resume" name="cv_file" required
                    value={form.cv_file} error={fileErrors.cv_file}
                    onChange={handleFile}
                  />
                  <FileCard
                    label="Supporting Documents" name="cover_letter_file" required
                    hint="Cover letter, campus recommendation, etc. If you have multiple files, please merge them into one PDF first."
                    value={form.cover_letter_file} error={fileErrors.cover_letter_file}
                    onChange={handleFile}
                  />
                  <FileCard
                    label="Institution Letter" name="institution_letter_file"
                    hint="Letter from your institution (optional)."
                    value={form.institution_letter_file} error={fileErrors.institution_letter_file}
                    onChange={handleFile}
                  />
                  <FileCard
                    label="Additional Portfolio" name="portfolio_file"
                    value={form.portfolio_file} error={fileErrors.portfolio_file}
                    onChange={handleFile}
                  />
                </div>
              </Section>
            )}

            {/* ══════ STEP 2: Additional Info ══════ */}
            {step === 2 && (
              <Section num="3" title="Additional Information">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="LinkedIn Profile URL">
                    <input
                      type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#1a56db"} onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                  </Field>
                  <Field label="Motivation" required>
                    <textarea
                      name="motivation_message" value={form.motivation_message} onChange={handleChange}
                      placeholder="Describe your motivation and why you are applying for this role…"
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={(e) => e.target.style.borderColor = "#1a56db"} onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                    />
                  </Field>

                  {/* Summary card */}
                  <div style={{ background: "#f0f7ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "16px 18px" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: "#1e40af" }}>Application Summary</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                      {[
                        ["Name", form.name],
                        ["University", form.university_name],
                        ["Major", form.major_name],
                        ["Role", positionOptions.find((o) => o.value === form.id_position)?.label || "—"],
                        ["CV", form.cv_file?.name || "—"],
                        ["Documents", form.cover_letter_file?.name || "—"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <span style={{ fontSize: 11, color: "#6b7280", display: "block" }}>{k}</span>
                          <span style={{ fontSize: 12.5, color: "#1e3a8a", fontWeight: 600, wordBreak: "break-all" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* ── Navigation Buttons ── */}
            <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "flex-end" }}>
              {step < 2 ? (
                <button
                  type="button" onClick={goNext}
                  style={{
                    padding: "13px 32px", background: "linear-gradient(135deg,#1a56db,#3b82f6)",
                    border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", transition: "opacity 0.2s", boxShadow: "0 4px 14px rgba(26,86,219,0.35)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              ) : (
                <button
                  type="submit" disabled={submitting}
                  style={{
                    padding: "13px 36px",
                    background: submitting ? "#9ca3af" : "linear-gradient(135deg,#1a56db,#3b82f6)",
                    border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: submitting ? "none" : "0 4px 14px rgba(26,86,219,0.35)",
                    display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
                  }}
                >
                  {submitting ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Application
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, background: i === step ? "#1a56db" : i < step ? "#93c5fd" : "#e5e7eb", transition: "all 0.3s" }} />
          ))}
        </div>
      </main>
    </div>
  );
}