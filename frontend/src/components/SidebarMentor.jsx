import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

// Navigation items for mentor sidebar
const navItems = [
  { key: "/mentor/dashboard", label: "Dashboard", section: "MENU" },
  { key: "/mentor/interns", label: "My Interns", section: "ASSESSMENT" },
  { key: "/mentor/input-score", label: "Input Score", section: "ASSESSMENT" },
  { key: "/mentor/score-recap", label: "Score Recap", section: "ASSESSMENT" },
  { key: "/mentor/competencies", label: "Competencies", section: "ASSESSMENT" },
  { key: "/mentor/evaluation", label: "Evaluation", section: "OTHERS" },
  { key: "/mentor/certificates", label: "Certificate", section: "OTHERS" },
];

// Sidebar icons
const SidebarIcon = ({ name }) => {
  const icons = {
    Dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    "My Interns": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    "Input Score": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    "Score Recap": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12z" /><path d="M12 6v6l4 2" /></svg>,
    Competencies: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
    Evaluation: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    Certificate: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18h-2" /><path d="M12 14h-2" /><path d="M16 14h-2" /></svg>,
  };
  return icons[name] || icons.Dashboard;
};

/**
 * SidebarMentor - Consistent sidebar for all mentor pages
 * Props:
 *   mentor     — { name, email? }
 *   onLogout   — () => void
 */
export function SidebarMentor({ mentor, onLogout }) {
  const location = useLocation();
  const [logoutHov, setLogoutHov] = useState(false);

  const sections = {};
  navItems.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <aside style={{
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
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px 20px" }}>
        <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "44px", objectFit: "contain", flexShrink: 0 }} />
        <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
      </div>

      {/* Nav sections */}
      {Object.entries(sections).map(([section, items]) => (
        <div key={section} style={{ marginBottom: "8px" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 5px", textTransform: "uppercase", margin: 0, textAlign: "center" }}>
            {section}
          </p>
          {items.map((item) => {
            const isActive = location.pathname === item.key;
            const [hov, setHov] = useState(false);
            return (
              <Link
                key={item.key}
                to={item.key}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 12px", borderRadius: "9px", textDecoration: "none",
                  background: isActive ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
                  border: isActive ? "1px solid rgba(74,158,255,0.22)" : "1px solid transparent",
                  color: isActive ? "#4a9eff" : "rgba(255,255,255,0.58)",
                  fontSize: "13px", fontWeight: isActive ? "600" : "500",
                  transition: "all 0.18s",
                  fontFamily: "'Poppins', 'Segoe UI', sans-serif",
                  margin: "0 2px",
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.72, flexShrink: 0 }}><SidebarIcon name={item.label} /></span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            );
          })}
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
          {mentor?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MT'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "12.5px", fontWeight: "700", color: "#fff",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {mentor?.name || "Mentor"}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>Mentor</div>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

/**
 * MentorLoadingSpinner - Loading UI for mentor pages
 * Props:
 *   message  — Optional loading message (default: "Loading...")
 */
export function MentorLoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#f1f5f9",
      gap: "16px",
    }}>
      <div style={{
        width: "48px",
        height: "48px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #8b5cf6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
