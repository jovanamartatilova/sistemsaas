import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

// Navigation items for mentor sidebar
const navItems = [
  { key: "/mentor/dashboard", label: "Dashboard", section: "MENU" },
  { key: "/mentor/assign-tasks", label: "Assign Tasks", section: "ASSESSMENT" },
  { key: "/mentor/input-score", label: "Input Score", section: "ASSESSMENT" },
  { key: "/mentor/certificates", label: "Certificate", section: "OTHERS" },
];

// Sidebar icons
const SidebarIcon = ({ name }) => {
  const icons = {
    Dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    "Assign Tasks": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    "Input Score": <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    Certificate: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18h-2" /><path d="M12 14h-2" /><path d="M16 14h-2" /></svg>,
  };
  return icons[name] || icons.Dashboard;
};

// Menu & X icons
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SidebarLink = ({ item, isActive, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={item.key}
      onClick={onClick}
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
};

// ── Nav sections grouped ───────────────────────────────────────────────────────
function NavSections({ location, onNavClick }) {
  const sections = {};
  navItems.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <>
      {Object.entries(sections).map(([section, items]) => (
        <div key={section} style={{ marginBottom: "8px" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 5px", textTransform: "uppercase", margin: 0, textAlign: "left" }}>
            {section}
          </p>
          {items.map((item) => (
            <SidebarLink key={item.key} item={item} isActive={location.pathname === item.key} onClick={onNavClick} />
          ))}
        </div>
      ))}
    </>
  );
}

// ── User footer ────────────────────────────────────────────────────────────────
function UserFooter({ mentor, onLogout }) {
  const [logoutHov, setLogoutHov] = useState(false);
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", gap: "10px",
      padding: "14px 8px 0",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
        background: "linear-gradient(135deg, #2d7dd2, #4a9eff)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: "800", color: "#fff",
      }}>
        {(mentor?.name || "Mentor").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
        <LogoutIcon />
      </button>
    </div>
  );
}

/**
 * SidebarMentor - Consistent sidebar for all mentor pages
 * Props:
 *   mentor    — { name }
 *   onLogout  — () => void
 */
export function SidebarMentor({ mentor, onLogout }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setDrawerOpen(false);
    };
    setIsMobile(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const sidebarBg = "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)";

  // ── DESKTOP ────────────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <aside style={{
        width: "250px", flexShrink: 0,
        background: sidebarBg,
        display: "flex", flexDirection: "column",
        height: "100vh", position: "sticky", top: 0,
        overflowY: "auto", overflowX: "hidden",
        padding: "20px 10px", gap: "2px",
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        textAlign: "left",
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px 20px", textDecoration: "none" }}>
          <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "44px", objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
        </Link>
        <NavSections location={location} onNavClick={undefined} />
        <div style={{ flex: 1 }} />
        <UserFooter mentor={mentor} onLogout={onLogout} />
      </aside>
    );
  }

  // ── MOBILE: topbar + drawer ────────────────────────────────────────────────
  return (
    <>
      {/* Mobile Topbar */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "56px",
        background: "linear-gradient(90deg, #0f1c2e, #0d1a28)",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: "12px",
        zIndex: 200,
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
      }}>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          style={{
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.85)", cursor: "pointer",
            padding: "6px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.18s", flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <MenuIcon />
        </button>

        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flex: 1 }}>
          <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "32px", objectFit: "contain" }} />
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
        </Link>
      </header>

      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(5,15,30,0.6)",
          zIndex: 210,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "all" : "none",
          transition: "opacity 0.28s ease",
          backdropFilter: drawerOpen ? "blur(2px)" : "none",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: "260px",
        background: sidebarBg,
        zIndex: 220,
        display: "flex", flexDirection: "column",
        padding: "16px 10px 20px", gap: "2px",
        overflowY: "auto", overflowX: "hidden",
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: drawerOpen ? "4px 0 24px rgba(0,0,0,0.35)" : "none",
      }}>
        {/* Drawer header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", marginBottom: "4px" }}>
          <Link to="/" onClick={closeDrawer} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "36px", objectFit: "contain" }} />
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
          </Link>
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
              padding: "5px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.18s",
            }}
          >
            <XIcon />
          </button>
        </div>

        <NavSections location={location} onNavClick={closeDrawer} />

        <div style={{ flex: 1 }} />
        <UserFooter mentor={mentor} onLogout={() => { closeDrawer(); onLogout?.(); }} />
      </div>
    </>
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
