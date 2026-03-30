import { useState, useEffect } from "react";
import { superAdminService } from "../api/superAdminService";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("superadmin@earlypath.id");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/api/auth/login-superadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("auth_token", data.token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)", fontFamily: "'Poppins','Inter',sans-serif" }}>
      <div style={{ position: "absolute", top: "28px", left: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#fff" }}>EP</div>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
      </div>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "42px 40px", width: "100%", maxWidth: "400px", boxShadow: "0 24px 64px rgba(0,0,0,0.45)" }}>
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "5px" }}>Super Admin Login</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Enter your credentials to continue</div>
        </div>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#475569", marginBottom: "6px", letterSpacing: "0.2px" }}>EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13.5px", fontFamily: "'Poppins',sans-serif", color: "#1e293b", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: "600", color: "#475569", marginBottom: "6px", letterSpacing: "0.2px" }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 42px 10px 13px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13.5px", fontFamily: "'Poppins',sans-serif", color: "#1e293b", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "0", color: showPassword ? "#3b82f6" : "#94a3b8", display: "flex", alignItems: "center" }}>
                {showPassword
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
          </div>
          {error && <div style={{ padding: "10px 12px", background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ marginTop: "4px", padding: "12px 16px", background: loading ? "#cbd5e1" : "linear-gradient(135deg, #2d7dd2, #4a9eff)", color: "#fff", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "700", fontFamily: "'Poppins',sans-serif", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop: "20px", padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "12px", color: "#15803d", lineHeight: "1.8" }}>
          <strong>Demo Credentials:</strong><br />Email: superadmin@earlypath.id<br />Password: password123
        </div>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  Tenant: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Logout: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  TrendUp: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  ChevDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Close: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  MapPin: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Phone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── FIX: shared TH style — verticalAlign + whiteSpace supaya header tidak miring
const TH = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: "10.5px",
  fontWeight: "700",
  color: "#94a3b8",
  letterSpacing: "0.5px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

// ── Loading & Error ───────────────────────────────────────────────────────────
function LoadingPage() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <div style={{ fontSize: "13px", color: "#94a3b8" }}>Loading...</div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "14px", color: "#ef4444", marginBottom: "10px" }}>{message || "Failed to load data"}</div>
        <button onClick={onRetry} style={{ padding: "8px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#475569", cursor: "pointer" }}>Retry</button>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function TenantDetailModal({ tenant, onClose }) {
  if (!tenant) return null;
  const isActive = tenant.status === "active";
  const initials = (name) => name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() ?? "?";

  const Row = ({ icon, label, value }) => (
    <div style={{ display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f8fafc", alignItems: "flex-start" }}>
      <div style={{ color: "#94a3b8", flexShrink: 0, marginTop: "1px" }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "10.5px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.4px", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "500" }}>{value || "—"}</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800", color: "#3b82f6", flexShrink: 0 }}>
            {initials(tenant.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tenant.name}</div>
            <span style={{ background: isActive ? "#f0fdf4" : "#fff1f2", color: isActive ? "#15803d" : "#be123c", border: `1px solid ${isActive ? "#bbf7d0" : "#fecdd3"}`, borderRadius: "6px", fontSize: "11px", fontWeight: "700", padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isActive ? "#16a34a" : "#e11d48", display: "inline-block" }} />
              {isActive ? "Active" : "Suspended"}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", flexShrink: 0 }}>
            <IC.Close />
          </button>
        </div>

        {/* Company Info */}
        <div style={{ padding: "4px 24px 8px" }}>
          <Row icon={<IC.Mail />}   label="EMAIL"   value={tenant.email} />
          <Row icon={<IC.MapPin />} label="ADDRESS" value={tenant.address} />
          <Row icon={<IC.Phone />}  label="PHONE"   value={tenant.phone} />
          <div style={{ padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ fontSize: "10.5px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.4px", marginBottom: "4px" }}>DESCRIPTION</div>
            <div style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>{tenant.description || "No description provided."}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "14px 24px", background: "#f8fafc", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            { label: "Total Users",     value: tenant.users_count ?? 0,     color: "#3b82f6" },
            { label: "Total Vacancies", value: tenant.vacancies_count ?? 0,  color: "#10b981" },
            { label: "Registered",      value: tenant.created_at ?? "—",     color: "#f59e0b", small: true },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: "10px", padding: "10px 12px", border: "1px solid #f1f5f9", textAlign: "center" }}>
              <div style={{ fontSize: s.small ? "11px" : "20px", fontWeight: "800", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 12px", borderRadius: "9px", background: active ? "rgba(74,158,255,0.13)" : hov ? "rgba(255,255,255,0.05)" : "transparent", border: active ? "1px solid rgba(74,158,255,0.25)" : "1px solid transparent", color: active ? "#4a9eff" : "rgba(255,255,255,0.58)", fontSize: "13px", fontWeight: active ? "600" : "500", cursor: "pointer", transition: "all 0.18s", textAlign: "left" }}>
      <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = [
    { label: "Dashboard",         icon: <IC.Dashboard />, key: "dashboard", path: "/superadmin/dashboard" },
    { label: "Tenant Management", icon: <IC.Tenant />,    key: "tenant",    path: "/superadmin/tenants" },
    { label: "User Management",   icon: <IC.Users />,     key: "users",     path: "/superadmin/users" },
  ];
  const isActive = (path) => location.pathname.includes(path.split("/").pop());

  return (
    <aside style={{ width: "220px", flexShrink: 0, background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, padding: "18px 10px", gap: "3px", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <img src="/assets/images/logo.png" alt="Logo" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px" }} />
        <span style={{ fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
      </div>
      <p style={{ fontSize: "9.5px", fontWeight: "700", color: "rgba(255,255,255,0.22)", letterSpacing: "1.2px", padding: "0 12px 4px", textTransform: "uppercase" }}>Menu</p>
      {nav.map(n => <SideItem key={n.key} icon={n.icon} label={n.label} active={isActive(n.path)} onClick={() => navigate(n.path)} />)}
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px", display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,#2d7dd2,#4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#fff", flexShrink: 0 }}>SA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff" }}>Super Admin</div>
          <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.38)" }}>earlypath.id</div>
        </div>
        <button onClick={onLogout} title="Logout"
          style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}>
          <IC.Logout />
        </button>
      </div>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ title, sub }) {
  return (
    <header style={{ height: "54px", background: "#fff", borderBottom: "1px solid #e8edf2", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{title}</span>
        {sub && <><span style={{ fontSize: "12px", color: "#94a3b8", margin: "0 6px" }}>/</span><span style={{ fontSize: "12px", color: "#94a3b8" }}>{sub}</span></>}
      </div>
      <span style={{ fontSize: "11.5px", color: "#94a3b8", whiteSpace: "nowrap" }}>{today()}</span>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true); setError(null);
    superAdminService.getDashboardStats()
      .then(res => setData(res))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const barHeights = [28, 42, 34, 55, 40, 60, 50, 72, 58, 82, 65, 88];
  const stats = [
    { icon: <IC.Tenant />, accent: "#3b82f6", title: "Total Tenants", value: data.total_tenant?.toLocaleString() ?? "0", trend: `+${data.active_tenant ?? 0} active`, sub: `${data.active_tenant ?? 0} active · ${data.suspended_tenant ?? 0} suspended · ${data.inactive_tenant ?? 0} inactive` },
    { icon: <IC.Users />, accent: "#10b981", title: "Total Users", value: data.total_user?.toLocaleString() ?? "0", trend: `+${data.new_user_7days ?? 0}`, sub: `${data.new_user_7days ?? 0} new users in the last 7 days` },
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>, accent: "#f59e0b", title: "Active Vacancies", value: data.active_vacancies?.toLocaleString() ?? "0", trend: "+0%", sub: "Total published vacancies" },
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, accent: "#ef4444", title: "Certificates Issued", value: data.total_certificate?.toLocaleString() ?? "0", trend: "+0%", sub: "Total certificates generated" },
  ];

  const chartData = data.growth_chart ?? [];
  const maxV = Math.max(...chartData.map(d => Math.max(d.new_user ?? 0, 1)), 10);
  const chartH = 140; const bw = 16; const gap = 3; const gw = bw * 2 + gap; const colW = gw + 24;
  const total = data.total_tenant ?? 0;
  const aktif = data.tenant_status?.active ?? 0; const susp = data.tenant_status?.suspended ?? 0; const nonaktif = data.tenant_status?.inactive ?? 0;
  const C = 2 * Math.PI * 34;
  const aD = total > 0 ? (aktif / total) * C : 0; const sD = total > 0 ? (susp / total) * C : 0; const nD = total > 0 ? (nonaktif / total) * C : 0;

  return (
    <main style={{ flex: 1, padding: "26px 26px 40px", overflowY: "auto", background: "#f1f5f9" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>Good morning, Super Admin 👋</div>
        <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Here's a summary of today's platform activity.</div>
      </div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: "1 1 180px", minWidth: 0, background: "#fff", borderRadius: "13px", padding: "18px 20px", borderTop: `3px solid ${s.accent}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: `${s.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent }}>{s.icon}</div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "100px", padding: "2px 7px", display: "flex", alignItems: "center", gap: "2px" }}><IC.TrendUp /> {s.trend}</span>
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", marginTop: "3px" }}>{s.title}</div>
            <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "28px", marginTop: "12px" }}>
              {barHeights.map((h, bi) => <div key={bi} style={{ flex: 1, borderRadius: "2px 2px 0 0", background: bi >= 9 ? s.accent : `${s.accent}35`, height: `${h}%`, minHeight: "3px" }} />)}
            </div>
            <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "5px" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "18px" }}>
        <div style={{ background: "#fff", borderRadius: "13px", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Tenant & User Growth</div>
            <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>Last 6 months</div>
          </div>
          <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
            {[{ c: "#3b82f6", l: "New tenants" }, { c: "#10b981", l: "New users" }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: x.c }} />
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>{x.l}</span>
              </div>
            ))}
          </div>
          {chartData.length === 0
            ? <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "13px", border: "1px dashed #e2e8f0", borderRadius: "10px" }}>No data available</div>
            : (
              <svg width="100%" viewBox={`0 0 ${chartData.length * colW + 10} ${chartH + 28}`} style={{ overflow: "visible" }}>
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => <line key={i} x1="0" y1={chartH - p * chartH} x2={chartData.length * colW + 10} y2={chartH - p * chartH} stroke="#f1f5f9" strokeWidth="1" />)}
                {chartData.map((d, mi) => {
                  const x = mi * colW + 8;
                  const tH = Math.max(((d.new_tenant ?? 0) / (data.total_tenant || 1)) * chartH, 4);
                  const uH = Math.max(((d.new_user ?? 0) / maxV) * chartH, 4);
                  return <g key={mi}><rect x={x} y={chartH - tH} width={bw} height={tH} rx="3" fill="#3b82f6" opacity="0.85" /><rect x={x + bw + gap} y={chartH - uH} width={bw} height={uH} rx="3" fill="#10b981" opacity="0.85" /><text x={x + gw / 2} y={chartH + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">{d.month}</text></g>;
                })}
              </svg>
            )}
        </div>
        <div style={{ background: "#fff", borderRadius: "13px", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Tenant Status</div>
            <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>From {total} registered tenants</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px" }}>
              <svg width="120" height="120" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {total > 0 && <>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray={`${aD} ${C - aD}`} strokeDashoffset="0" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${sD} ${C - sD}`} strokeDashoffset={-aD} style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#94a3b8" strokeWidth="12" strokeDasharray={`${nD} ${C - nD}`} strokeDashoffset={-(aD + sD)} style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                </>}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{total}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>total</div>
              </div>
            </div>
          </div>
          {[{ l: "Active", v: aktif, c: "#3b82f6" }, { l: "Suspended", v: susp, c: "#ef4444" }, { l: "Inactive", v: nonaktif, c: "#94a3b8" }].map(item => (
            <div key={item.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: "9px", height: "9px", borderRadius: "3px", background: item.c }} />
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>{item.l}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{item.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
            {[{ l: "Uptime", v: "99.8%", c: "#16a34a" }, { l: "Avg latency", v: "142ms", c: "#3b82f6" }, { l: "AI calls/day", v: "3.2K", c: "#f59e0b" }].map(m => (
              <div key={m.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: m.c }}>{m.v}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — TENANT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
function TenantManagementPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState(null); // untuk modal Detail

  const fetchTenants = () => {
    setLoading(true); setError(null);
    superAdminService.getTenants({ search, status: statusFilter })
      .then(res => setTenants(res.data ?? []))
      .catch(() => setError("Failed to load tenant data"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchTenants(); }, [search, statusFilter]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await superAdminService.updateTenantStatus(id, newStatus);
      fetchTenants();
    } catch {
      alert("Failed to update tenant status");
    }
  };

  const initials = (name) => name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() ?? "?";
  const avatarColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
  const statusLabel = { active: "Active", suspended: "Suspended", inactive: "Inactive" };

  return (
    <main style={{ flex: 1, padding: "26px 26px 40px", overflowY: "auto", background: "#f1f5f9" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>Tenant Management</div>
        <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>All registered companies on the platform.</div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 12px", flex: "1 1 220px" }}>
          <IC.Search />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company name or email..." style={{ border: "none", background: "transparent", outline: "none", fontSize: "12.5px", color: "#64748b", width: "100%" }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ appearance: "none", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 32px 7px 12px", fontSize: "12.5px", color: "#475569", fontWeight: "500", cursor: "pointer", outline: "none" }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><IC.ChevDown /></span>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTenants} />
        ) : (
          <>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Showing <strong style={{ color: "#1e293b" }}>{tenants.length}</strong> tenants</span>
            </div>
            {/* FIX: pakai TH style + hapus tableLayout fixed */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["COMPANY", "USERS", "VACANCIES", "REGISTERED", "STATUS", "ACTION"].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map((t, i) => {
                  const ac = avatarColors[i % avatarColors.length];
                  const isActive = t.status === "active";
                  const label = statusLabel[t.status] ?? t.status;
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: ac, flexShrink: 0 }}>{initials(t.name)}</div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{t.name}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{t.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1e293b", verticalAlign: "middle" }}>{t.users_count ?? 0}</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1e293b", verticalAlign: "middle" }}>{t.vacancies_count ?? 0}</td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b", verticalAlign: "middle" }}>{t.created_at}</td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <span style={{ background: isActive ? "#f0fdf4" : "#fff1f2", color: isActive ? "#15803d" : "#be123c", border: `1px solid ${isActive ? "#bbf7d0" : "#fecdd3"}`, borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 9px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isActive ? "#16a34a" : "#e11d48", display: "inline-block" }} />
                          {label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {/* Tombol Detail — buka modal */}
                          <button onClick={() => setSelectedTenant(t)}
                            style={{ padding: "4px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "11.5px", fontWeight: "600", color: "#475569", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                            Detail
                          </button>
                          <button onClick={() => toggleStatus(t.id, t.status)}
                            style={{ padding: "4px 12px", borderRadius: "7px", border: `1px solid ${isActive ? "#fecdd3" : "#bbf7d0"}`, background: isActive ? "#fff1f2" : "#f0fdf4", fontSize: "11.5px", fontWeight: "600", color: isActive ? "#be123c" : "#15803d", cursor: "pointer" }}>
                            {isActive ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tenants.length === 0 && (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13.5px" }}>No tenants found</div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTenant && <TenantDetailModal tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />}
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
const roleStyle = {
  admin:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "Admin" },
  hr:      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0", label: "HR" },
  mentor:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Mentor" },
  peserta: { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff", label: "Participant" },
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = () => {
    setLoading(true); setError(null);
    superAdminService.getUsers({ search, role: roleFilter })
      .then(res => setUsers(res.data ?? []))
      .catch(() => setError("Failed to load user data"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const initials = (name) => name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() ?? "?";
  const avatarColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#14b8a6"];

  return (
    <main style={{ flex: 1, padding: "26px 26px 40px", overflowY: "auto", background: "#f1f5f9" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>User Management</div>
        <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>All registered users across tenants.</div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 12px", flex: "1 1 220px" }}>
          <IC.Search />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." style={{ border: "none", background: "transparent", outline: "none", fontSize: "12.5px", color: "#64748b", width: "100%" }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ appearance: "none", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 32px 7px 12px", fontSize: "12.5px", color: "#475569", fontWeight: "500", cursor: "pointer", outline: "none" }}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="mentor">Mentor</option>
            <option value="peserta">Participant</option>
          </select>
          <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><IC.ChevDown /></span>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUsers} />
        ) : (
          <>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Showing <strong style={{ color: "#1e293b" }}>{users.length}</strong> users</span>
            </div>
            {/* FIX: pakai TH style + hapus tableLayout fixed */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["USER", "ROLE", "COMPANY", "PHONE", "REGISTERED"].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Menampilkan <strong style={{ color: "#1e293b" }}>{filtered.length}</strong> dari <strong style={{ color: "#1e293b" }}>{USERS.length}</strong> user</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["USER", "ROLE", "TENANT", "NO. HP", "UNIVERSITAS", "TERDAFTAR"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const rs = roleStyle[u.role] || { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
              const ac = avatarColors[i % avatarColors.length];
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10.5px", fontWeight: "800", color: ac, flexShrink: 0 }}>{initials(u.name)}</div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{u.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 9px" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "12.5px", color: "#475569" }}>{u.tenant}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12.5px", color: "#475569", fontFamily: "'Poppins', sans-serif" }}>{u.phone}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12.5px", color: u.university === "—" ? "#cbd5e1" : "#475569" }}>{u.university}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", color: "#64748b" }}>{u.registered}</td>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const roleKey = u.role?.toLowerCase();
                  const rs = roleStyle[roleKey] ?? { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", label: u.role };
                  const ac = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "11px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10.5px", fontWeight: "800", color: ac, flexShrink: 0 }}>{initials(u.name)}</div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{u.name}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px", verticalAlign: "middle" }}>
                        <span style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 9px" }}>{rs.label}</span>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: "12.5px", color: "#475569", verticalAlign: "middle" }}>{u.company ?? "—"}</td>
                      <td style={{ padding: "11px 16px", fontSize: "12.5px", color: "#475569", fontFamily: "monospace", verticalAlign: "middle" }}>{u.phone ?? "—"}</td>
                      <td style={{ padding: "11px 16px", fontSize: "12px", color: "#64748b", verticalAlign: "middle" }}>{u.created_at}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13.5px" }}>No users found</div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function SuperAdminPages() {
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("auth_token"));

  useEffect(() => { setIsLoggedIn(!!localStorage.getItem("auth_token")); }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setLogoutModal(false);
    navigate("/superadmin/login");
  };

  const pageConfig = {
    dashboard: { title: "Dashboard",        sub: "Overview" },
    tenant:    { title: "Tenant Management", sub: "Tenant List" },
    users:     { title: "User Management",   sub: "User List" },
  };

  const DashboardLayout = ({ children, pageTitle }) => (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg); } }
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
}
      `}</style>
      <Sidebar onLogout={() => setLogoutModal(true)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar title={pageTitle.title} sub={pageTitle.sub} />
        {children}
      </div>
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}><IC.Logout /></div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Are you sure you want to sign out of the Super Admin account?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/superadmin/dashboard" replace /> : <LoginForm onLoginSuccess={() => { setIsLoggedIn(true); navigate("/superadmin/dashboard"); }} />} />
      <Route path="/"         element={isLoggedIn ? <DashboardLayout pageTitle={pageConfig.dashboard}><DashboardPage /></DashboardLayout>        : <Navigate to="/superadmin/login" replace />} />
      <Route path="/dashboard" element={isLoggedIn ? <DashboardLayout pageTitle={pageConfig.dashboard}><DashboardPage /></DashboardLayout>       : <Navigate to="/superadmin/login" replace />} />
      <Route path="/tenants"   element={isLoggedIn ? <DashboardLayout pageTitle={pageConfig.tenant}><TenantManagementPage /></DashboardLayout>   : <Navigate to="/superadmin/login" replace />} />
      <Route path="/users"     element={isLoggedIn ? <DashboardLayout pageTitle={pageConfig.users}><UserManagementPage /></DashboardLayout>      : <Navigate to="/superadmin/login" replace />} />
    </Routes>
  );
}

}

