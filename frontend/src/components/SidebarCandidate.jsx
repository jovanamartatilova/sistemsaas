import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

/**
 * Reusable Sidebar Component for Candidate Role
 */
export function SidebarCandidate({ userName, company, onLogout }) {
  const { slug } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const companySlug = slug || company?.slug || "";
  
  const navItems = [
    { label: "Dashboard", icon: "dashboard", to: `/c/${companySlug}/dashboard` },
    { label: "Programs", icon: "programs", to: `/c/${companySlug}/programs` },
    { label: "My Profile", icon: "profile", to: `/c/${companySlug}/profile` },
    { label: "Certificates", icon: "certificates", to: `/c/${companySlug}/certificates` },
  ];

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      programs: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      profile: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      certificates: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9h12M6 9a6 6 0 1 0 12 0M6 9v12a6 6 0 0 0 12 0V9" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  return (
    <aside style={{
      width: "224px",
      minHeight: "100vh",
      background: "#0f1e3a",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "24px 16px",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 10,
      gap: "12px",
    }}>
      {/* Logo */}
      <Link to="/" style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "24px",
        textDecoration: "none",
        opacity: 0.9,
        transition: "opacity 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}
      >
        <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "40px", width: "auto" }} />
        <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.5px" }}>EarlyPath</span>
      </Link>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                color: isActive ? "#60a5fa" : "rgba(255, 255, 255, 0.7)",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                textDecoration: "none",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                }
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile section */}
      <div style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        paddingTop: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        justifyContent: "space-between",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userName}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "2px" }}>
            Candidate
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
            e.currentTarget.style.background = "transparent";
          }}
          title="Logout"
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
