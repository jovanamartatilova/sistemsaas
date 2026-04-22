import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Dashboard: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Candidates: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Screening: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Interview: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  AssignMentor: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  GenerateLoa: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Payroll: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ── Nav definition ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "MENU",
    items: [
      { key: "/hr/dashboard",    label: "Dashboard",     icon: <IC.Dashboard /> },
    ],
  },
  {
    label: "SELECTION",
    items: [
      { key: "/hr/kandidate",    label: "Candidates",    icon: <IC.Candidates /> },
      { key: "/hr/screening",    label: "Screening",     icon: <IC.Screening /> },
      { key: "/hr/wawancara",    label: "Interview",     icon: <IC.Interview /> },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { key: "/hr/assign-mentor", label: "Assign Mentor", icon: <IC.AssignMentor /> },
      { key: "/hr/generate-loa",  label: "Generate LoA",  icon: <IC.GenerateLoa /> },
      { key: "/hr/payroll",       label: "Payroll",        icon: <IC.Payroll /> },
    ],
  },
];

// ── SideItem ──────────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, badge, to }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "9px", textDecoration: "none",
        background: active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
        border: active ? "1px solid rgba(74,158,255,0.22)" : "1px solid transparent",
        color: active ? "#4a9eff" : "rgba(255,255,255,0.58)",
        fontSize: "13px", fontWeight: active ? "600" : "500",
        transition: "all 0.18s",
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.72, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          background: "#4a9eff", color: "#fff", borderRadius: "100px",
          fontSize: "10px", fontWeight: "700", padding: "1px 7px",
          minWidth: "20px", textAlign: "center",
        }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── SidebarHR (exported) ──────────────────────────────────────────────────────
/**
 * Props:
 *   user      — { name, avatar? }
 *   onLogout  — () => void
 */
export default function SidebarHR({ user, onLogout }) {
  const location = useLocation();
  const [logoutHov, setLogoutHov] = useState(false);

  return (
    <aside
      style={{
        width: "250px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)",
        display: "flex",
        justifyContent: "flex-start",
        textAlign: "left",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
        padding: "20px 10px",
        gap: "2px",
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px 20px", textDecoration: "none" }}>
        <img
          src="/assets/images/logo.png"
          alt="EarlyPath"
          style={{ height: "44px", objectFit: "contain", flexShrink: 0 }}
        />
        <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>
          EarlyPath
        </span>
      </Link>

      {/* Nav sections */}
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} style={{ marginBottom: "8px" }}>
          <p style={{
            fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)",
            letterSpacing: "1.2px", padding: "6px 14px 5px", textTransform: "uppercase",
            margin: 0, justifyContent: "center", display: "center", textAlign: "center",
          }}>
            {section.label}
          </p>
          {section.items.map((item) => (
            <SideItem
              key={item.key}
              to={item.key}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={location.pathname === item.key}
            />
          ))}
        </div>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User + Logout */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingTop: "14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 8px 0",
        justifyContent: "center",
        textAlign: "center",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg, #2d7dd2, #4a9eff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "800", color: "#fff",
        }}>
          HR
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "12.5px", fontWeight: "700", color: "#fff",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {user?.name || "Admin HR"}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>HR Manager</div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          onMouseEnter={() => setLogoutHov(true)}
          onMouseLeave={() => setLogoutHov(false)}
          style={{
            background: logoutHov ? "rgba(248,113,113,0.12)" : "transparent",
            border: "none",
            color: logoutHov ? "#f87171" : "rgba(255,255,255,0.32)",
            cursor: "pointer", padding: "6px", borderRadius: "7px",
            transition: "all 0.18s", display: "flex", alignItems: "center",
          }}
        >
          <IC.Logout />
        </button>
      </div>
    </aside>
  );
}