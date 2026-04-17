import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Reusable Sidebar Component for Super Admin Role
 */
export function SidebarSuperAdmin({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      path: "/superadmin/dashboard",
    },
    {
      label: "Tenant Management",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: "/superadmin/tenants",
    },
    {
      label: "User Management",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      path: "/superadmin/users",
    },
  ];

  const isActive = (path) => location.pathname.includes(path.split("/").pop());

  return (
    <aside
      style={{
        width: "250px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: "20px 12px",
        gap: "4px",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px 20px" }}>
        <img src="/assets/images/logo.png" alt="Logo" style={{ height: "46px", objectFit: "contain", flexShrink: 0 }} />
        <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
          EarlyPath
        </span>
      </div>

      {/* Menu Label */}
      <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "0 14px 4px", textTransform: "uppercase" }}>
        Main Menu
      </p>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={active}
            onClick={() => navigate(item.path)}
          />
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Profile Bottom */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#2d7dd2,#4a9eff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "800",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          SA
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff" }}>Super Admin</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>earlypath.id</div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            display: "flex",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.background = "rgba(248,113,113,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.35)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
 * Sidebar Item Component
 */
function SidebarItem({ icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "11px",
        width: "100%",
        padding: "10px 14px",
        borderRadius: "10px",
        background: active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
        border: active ? "1px solid rgba(74,158,255,0.22)" : "1px solid transparent",
        color: active ? "#4a9eff" : "rgba(255,255,255,0.6)",
        fontSize: "13.5px",
        fontWeight: active ? "600" : "500",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.75, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}
