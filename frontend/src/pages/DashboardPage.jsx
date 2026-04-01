import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../api/authService";
import axios from "axios";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
    Dashboard: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    Users: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Program: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),
    Lowongan: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
    Laporan: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
        </svg>
    ),
    Pengaturan: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Bell: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    Search: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Plus: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    TrendUp: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    TrendDown: () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
        </svg>
    ),
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 20) return "Good evening";
    return "Good night";
}

function today() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Sidebar item ─────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, badge, onClick }) {
    const [hov, setHov] = useState(false);
    const on = active || hov;
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: "flex", alignItems: "center", gap: "11px",
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                background: active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
                border: active ? "1px solid rgba(74,158,255,0.22)" : "1px solid transparent",
                color: active ? "#4a9eff" : "rgba(255,255,255,0.6)",
                fontSize: "13.5px", fontWeight: active ? "600" : "500",
                cursor: "pointer", transition: "all 0.2s", textAlign: "left",
            }}
        >
            <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge != null && badge > 0 && (
                <span style={{ background: "#4a9eff", color: "#fff", borderRadius: "100px", fontSize: "11px", fontWeight: "700", padding: "1px 7px", minWidth: "20px", textAlign: "center" }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, trend, trendUp, barColors }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "22px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                flex: "1 1 200px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                minWidth: 0,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, fontSize: "18px" }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", letterSpacing: "-1px", marginTop: "8px" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{title}</div>

            {/* Mini bar chart */}
            {barColors && (
                <div style={{ display: "flex", gap: "3px", marginTop: "10px", alignItems: "flex-end", height: "28px" }}>
                    {barColors.map((c, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                background: c,
                                borderRadius: "3px 3px 0 0",
                                height: `${30 + Math.sin(i) * 20}%`,
                                opacity: 0.4,
                                minHeight: "4px",
                            }}
                        />
                    ))}
                </div>
            )}

            {sub && <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{sub}</div>}
        </div>
    );
}

// ── Distribution donut (pure CSS/div) ─────────────────────────────────────────
function DonutChart({ data }) {
    // data = [{label, pct, color}]
    // Since all 0 we just show empty ring
    const total = data.reduce((s, d) => s + d.pct, 0);
    const isEmpty = total === 0;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {/* Circle */}
            <div style={{ position: "relative", width: "96px", height: "96px", flexShrink: 0 }}>
                <svg width="96" height="96" viewBox="0 0 96 96">
                    {isEmpty ? (
                        <circle cx="48" cy="48" r="36" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                    ) : (
                        (() => {
                            let offset = 0;
                            const circum = 2 * Math.PI * 36;
                            return data.map((d, i) => {
                                const dash = (d.pct / 100) * circum;
                                const el = (
                                    <circle
                                        key={i}
                                        cx="48" cy="48" r="36"
                                        fill="none"
                                        stroke={d.color}
                                        strokeWidth="14"
                                        strokeDasharray={`${dash} ${circum - dash}`}
                                        strokeDashoffset={-offset}
                                        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                                    />
                                );
                                offset += dash;
                                return el;
                            });
                        })()
                    )}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>0</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "500" }}>Total</div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                            <span style={{ fontSize: "13px", color: "#64748b" }}>{d.label}</span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>0%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Mini bar sparkline ─────────────────────────────────────────────────────────
function BarSparkline({ months }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px", padding: "0 4px" }}>
            {months.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "60px" }}>
                        {/* 3 bars per month: mendaftar, diterima, ditolak */}
                        {[
                            { h: 0, c: "#60a5fa" },
                            { h: 0, c: "#4ade80" },
                            { h: 0, c: "#f87171" },
                        ].map((b, j) => (
                            <div
                                key={j}
                                style={{
                                    width: "6px",
                                    height: `${Math.max(b.h, 4)}px`,
                                    background: b.c,
                                    borderRadius: "3px 3px 0 0",
                                    opacity: 0.5,
                                }}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize: "9px", color: "#94a3b8" }}>{m}</span>
                </div>
            ))}
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();
    const [company, setCompany] = useState(null);
    const [activeNav, setActiveNav] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [liveStats, setLiveStats] = useState({ active_programs: 0, active_vacancies: 0, total_applicants: 0, pending_review: 0, recent_applicants: [] });

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const res = await axios.get("http://localhost:8000/api/dashboard/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLiveStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
            }
        };
        fetchStats();

        const stored = localStorage.getItem("company");
        if (stored) {
            try { setCompany(JSON.parse(stored)); } catch (_) { }
        }
        // Also fetch fresh from API
        authService.getProfile().then((res) => {
            if (res?.company) {
                setCompany(res.company);
                localStorage.setItem("company", JSON.stringify(res.company));
            }
        }).catch(() => { });
    }, [token]);

    const handleLogout = () => {
        setLogoutModalOpen(true);
    };

    const companyName = company?.name || "Admin";
    const companyRole = company?.role || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();

    const stats = [
        {
            icon: <IC.Program />,
            iconBg: "#eff6ff",
            iconColor: "#3b82f6",
            title: "Active Positions",
            value: liveStats.active_programs.toString(),
            sub: "All currently active internship programs",
            barColors: ["#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6"],
        },
        {
            icon: <IC.Lowongan />,
            iconBg: "#f0fdf4",
            iconColor: "#16a34a",
            title: "Active Programs",
            value: liveStats.active_vacancies.toString(),
            sub: "Total positions opened",
            barColors: ["#4ade80", "#86efac", "#4ade80", "#86efac", "#4ade80", "#bbf7d0", "#4ade80"],
        },
        {
            icon: <IC.Users />,
            iconBg: "#fffbeb",
            iconColor: "#d97706",
            title: "Total Candidates",
            value: liveStats.total_applicants.toString(),
            sub: `${liveStats.total_applicants} total applicants recorded`,
            barColors: ["#fbbf24", "#fde68a", "#f59e0b", "#fbbf24", "#fde68a", "#f59e0b", "#fbbf24"],
        },
        {
            icon: <IC.Bell />,
            iconBg: "#fff1f2",
            iconColor: "#e11d48",
            title: "Pending Review",
            value: liveStats.pending_review.toString(),
            sub: "Requires immediate attention",
            barColors: ["#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fca5a5"],
        },
    ];

    const navItems = [
        { label: "Dashboard", icon: <IC.Dashboard />, path: "/dashboard", section: "MAIN MENU" },
        { label: "User Management", icon: <IC.Users />, path: "/users", badge: 0 },
        { label: "Program Management", icon: <IC.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <IC.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Reports", icon: <IC.Laporan />, path: "#", section: "OTHERS" },
        { label: "Settings", icon: <IC.Pengaturan />, path: "#" },
    ];

    const distrib = [
        { label: "Applied", pct: 0, color: "#60a5fa" },
        { label: "Accepted", pct: 0, color: "#4ade80" },
        { label: "Rejected", pct: 0, color: "#f87171" },
        { label: "Under Review", pct: 0, color: "#fbbf24" },
    ];

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

    const SIDEBAR_W = 250;
    const TOPBAR_H = 56;


    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease both; }
      `}</style>

            {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
            <aside
                style={{
                    width: `${SIDEBAR_W}px`,
                    flexShrink: 0,
                    background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "20px 12px",
                    gap: "4px",
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px 20px", textDecoration: "none" }}>
                    <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "46px", objectFit: "contain", flexShrink: 0 }} />
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>EarlyPath</span>
                </Link>

                {/* Nav */}
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 4px", textTransform: "uppercase" }}>
                    Main Menu
                </p>
                {navItems.map((n) => (
                    <SideItem
                        key={n.label}
                        icon={n.icon}
                        label={n.label}
                        badge={n.badge}
                        active={activeNav === n.label}
                        onClick={() => {
                            setActiveNav(n.label);
                            if (n.path && n.path !== "#") navigate(n.path);
                        }}
                    />
                ))}

                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "12px 8px" }} />
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "0px 14px 4px", textTransform: "uppercase" }}>
                    Others
                </p>
                {navItems2.map((n) => (
                    <SideItem
                        key={n.label}
                        icon={n.icon}
                        label={n.label}
                        active={activeNav === n.label}
                        onClick={() => setActiveNav(n.label)}
                    />
                ))}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Profile at bottom */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                        background: "linear-gradient(135deg, #2d7dd2, #4a9eff)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: "800", color: "#fff",
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyName}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{companyRole}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px", borderRadius: "6px", transition: "all 0.2s", display: "flex" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                    >
                        <IC.Logout />
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
                <header style={{
                    height: `${TOPBAR_H}px`,
                    background: "#fff",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    gap: "16px",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }}>
                    {/* Breadcrumb */}
                    <div style={{ flex: 1, textAlign: "left" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Dashboard</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Overview</span>
                    </div>

                    {/* Search */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "7px 14px", width: "220px" }}>
                        <IC.Search />
                        <input
                            placeholder="Search programs, positions, candidates..."
                            style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%" }}
                        />
                    </div>

                    {/* Bell */}
                    <button style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", position: "relative" }}>
                        <IC.Bell />
                        {/* no badge since 0 notifications */}
                    </button>

                    {/* Date */}
                    <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{today()}</span>
                </header>

                {/* ── PAGE BODY ──────────────────────────────────────────────────── */}
                <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto", textAlign: "left" }} className="fade-in">

                    {/* Page header */}
                    <div style={{ marginBottom: "28px" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                            {getGreeting()}, {companyName}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                            Here's a summary of platform activity today.
                        </div>
                    </div>

                    {/* Stat cards aligned with grid below */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                            {stats.slice(0, 3).map((s, i) => (
                                <StatCard key={i} {...s} />
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
                            {stats.slice(3, 4).map((s, i) => (
                                <StatCard key={i} {...s} />
                            ))}
                        </div>
                    </div>

                    {/* Middle row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "20px" }}>

                        {/* Bar chart: Statistik Pendaftar */}
                        <div style={{ background: "#fff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Candidate Statistics</p>
                                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>Last 6 months (Jan – Jun 2026)</p>
                                </div>
                                <button style={{ fontSize: "12.5px", color: "#4a9eff", background: "none", border: "none", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                    View All →
                                </button>
                            </div>

                            {/* Legend */}
                            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", marginTop: "8px" }}>
                                {[{ c: "#60a5fa", l: "Applied" }, { c: "#4ade80", l: "Accepted" }, { c: "#f87171", l: "Rejected" }].map((x) => (
                                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: x.c }} />
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>{x.l}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Empty state notice */}
                            <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
                                <IC.Laporan />
                                <p style={{ fontSize: "13px", color: "#94a3b8" }}>No statistical data yet</p>
                                <BarSparkline months={months} />
                            </div>
                        </div>

                        {/* Donut: Distribusi Status */}
                        <div style={{ background: "#fff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Candidate Status Distribution</p>
                                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>From total 0 active candidates</p>
                                </div>
                                <button style={{ fontSize: "12.5px", color: "#4a9eff", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Details →</button>
                            </div>
                            <DonutChart data={distrib} />
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>

                        {/* Pelamar Terbaru table */}
                        <div style={{ background: "#fff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Recent Candidates</p>
                                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>Candidates in the last 24 hours</p>
                                </div>
                                <button style={{ fontSize: "12.5px", color: "#4a9eff", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>View All →</button>
                            </div>

                            {/* Table header */}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: "12px", padding: "8px 12px", borderRadius: "8px", background: "#f8fafc", marginBottom: "4px" }}>
                                {["NAME", "PROGRAM", "STATUS", "SUBMISSION DATE"].map((h) => (
                                    <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px" }}>{h}</span>
                                ))}
                            </div>

                            {/* Recent candidates list */}
                            {liveStats.recent_applicants?.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {liveStats.recent_applicants.map((app, idx) => (
                                        <div key={idx} style={{
                                            display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: "12px",
                                            padding: "14px 12px", borderBottom: idx === liveStats.recent_applicants.length - 1 ? "none" : "1px solid #f1f5f9",
                                            alignItems: "center", transition: "background 0.2s"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>
                                                    {(app.user?.name || "U").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>{app.user?.name}</span>
                                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{app.user?.email}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>{app.vacancy?.title || "Unknown Program"}</span>
                                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{app.position?.name}</span>
                                            </div>
                                            <div>
                                                <span style={{
                                                    fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px",
                                                    background: app.status === "accepted" ? "#f0fdf4" : app.status === "rejected" ? "#fef2f2" : "#fff7ed",
                                                    color: app.status === "accepted" ? "#16a34a" : app.status === "rejected" ? "#dc2626" : "#d97706",
                                                    textTransform: "capitalize", border: `1px solid ${app.status === "accepted" ? "#bbf7d0" : app.status === "rejected" ? "#fecaca" : "#fed7aa"}`
                                                }}>
                                                    {app.status || "Pending"}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                                                {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Just now"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: "40px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                    <div style={{ color: "#cbd5e1", width: "32px", height: "32px" }}>
                                        <IC.Users />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "14px", color: "#94a3b8" }}>No new candidates yet</p>
                                        <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>Candidates will appear here after someone applies</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right column: Popular + Activity */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                            {/* Program Paling Diminati */}
                            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                    <div>
                                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Most Popular Programs</p>
                                        <p style={{ fontSize: "11.5px", color: "#94a3b8" }}>Based on number of candidates</p>
                                    </div>
                                </div>
                                <div style={{ padding: "28px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                    <div style={{ color: "#cbd5e1", width: "28px", height: "28px" }}>
                                        <IC.Laporan />
                                    </div>
                                    <p style={{ fontSize: "13px", color: "#94a3b8" }}>No programs yet</p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "14px" }}>Recent Activity</p>
                                <div style={{ padding: "24px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                    <div style={{ color: "#cbd5e1", width: "28px", height: "28px" }}>
                                        <IC.Bell />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "13px", color: "#94a3b8" }}>No activity yet</p>
                                        <p style={{ fontSize: "11.5px", color: "#cbd5e1", marginTop: "2px" }}>System activity will appear here</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Logout confirm */}
            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,.18)", textAlign: "left" }}>
                        <div style={{ color: "#3b82f6", marginBottom: 16 }}>
                            <IC.Users />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Sign Out?</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>Are you sure you want to sign out from your company account?</div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#ef4444", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
