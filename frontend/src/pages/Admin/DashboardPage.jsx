import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../api/authService";
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
function DonutChart({ data, total }) {
    const totalCount = total || data.reduce((s, d) => s + d.count, 0);
    const isEmpty = totalCount === 0;
    const size = 110; // Restored size slightly

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap", justifyContent: "center", padding: "10px 0" }}>
            <div style={{ position: "relative", width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {isEmpty ? (
                        <circle cx={size/2} cy={size/2} r={size/2 - 10} fill="none" stroke="#e2e8f0" strokeWidth="20" />
                    ) : (
                        (() => {
                            let offset = 0;
                            const r = size/2 - 10;
                            const circum = 2 * Math.PI * r;
                            return data.map((d, i) => {
                                const pct = (d.count / totalCount);
                                const dash = pct * circum;
                                const el = (
                                    <circle
                                        key={i}
                                        cx={size/2} cy={size/2} r={r}
                                        fill="none"
                                        stroke={d.color || "#e2e8f0"}
                                        strokeWidth="16"
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
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>{totalCount}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600" }}>Total</div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "120px" }}>
                {data.map((d, i) => {
                    const pct = totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0;
                    return (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                                <span style={{ fontSize: "12px", color: "#64748b", textTransform: "capitalize", fontWeight: "500" }}>{d.label}</span>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b" }}>{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Mini bar sparkline ─────────────────────────────────────────────────────────
function LineChart({ data }) {
    if (!data || data.length === 0) return null;
    const [hIdx, setHIdx] = useState(null);

    const width = 800;
    const height = 180;
    const paddingX = 40;
    const paddingY = 5; // Reduced from 25 to close gap to legend
    const chartHeight = height - 40;
    
    // Calculate max value with some headroom
    const maxVal = Math.max(...data.map(d => Math.max(d.applied, d.accepted, d.rejected, 10)), 2);
    
    const getX = (index) => (index / (data.length - 1)) * (width - paddingX * 2) + paddingX;
    const getY = (val) => chartHeight - (val / maxVal) * (chartHeight - paddingY) + paddingY;

    const categories = [
        { key: "applied", color: "#3b82f6", label: "Applied" },
        { key: "accepted", color: "#22c55e", label: "Accepted" },
        { key: "rejected", color: "#ef4444", label: "Rejected" }
    ];

    const generatePath = (key) => {
        return data.reduce((path, d, i) => {
            return path + (i === 0 ? "M" : " L") + ` ${getX(i)} ${getY(d[key])}`;
        }, "");
    };

    const generateAreaPath = (key) => {
        const baseline = chartHeight + paddingY;
        let path = `M ${getX(0)} ${baseline}`;
        data.forEach((d, i) => {
            path += ` L ${getX(i)} ${getY(d[key])}`;
        });
        path += ` L ${getX(data.length - 1)} ${baseline} Z`;
        return path;
    };

    return (
        <div style={{ width: "100%", height: "220px", marginTop: "0px", position: "relative" }}>
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                style={{ width: "100%", height: "100%", overflow: "visible" }}
                onMouseLeave={() => setHIdx(null)}
            >
                <defs>
                    {categories.map(cat => (
                        <linearGradient key={cat.key} id={`grad-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={cat.color} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={cat.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(p => (
                    <line 
                        key={p} 
                        x1={paddingX} y1={getY(p * maxVal)} 
                        x2={width - paddingX} y2={getY(p * maxVal)} 
                        stroke="#f1f5f9" strokeWidth="1" 
                    />
                ))}

                {/* Vertical Guide Line */}
                {hIdx !== null && (
                    <line 
                        x1={getX(hIdx)} y1={paddingY} 
                        x2={getX(hIdx)} y2={chartHeight + paddingY + 10} 
                        stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" 
                    />
                )}

                {/* Areas and Lines */}
                {categories.map(cat => (
                    <g key={cat.key}>
                        <path d={generateAreaPath(cat.key)} fill={`url(#grad-${cat.key})`} style={{ transition: "all 0.4s ease" }} />
                        <path 
                            d={generatePath(cat.key)} 
                            fill="none" 
                            stroke={cat.color} 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{ transition: "all 0.4s ease" }}
                        />
                        {data.map((d, i) => (
                            <circle 
                                key={i} 
                                cx={getX(i)} cy={getY(d[cat.key])} r={hIdx === i ? "6" : "4.5"} 
                                fill="#fff" stroke={cat.color} strokeWidth={hIdx === i ? "3" : "2.5"}
                                style={{ transition: "all 0.2s ease" }}
                            />
                        ))}
                    </g>
                ))}

                {/* Interaction Regions */}
                {data.map((_, i) => (
                    <rect 
                        key={i}
                        x={getX(i) - 20} y={0} width="40" height={height}
                        fill="transparent"
                        style={{ cursor: "pointer" }}
                        onPointerMove={() => setHIdx(i)}
                    />
                ))}

                {/* X-Axis Labels */}
                {data.map((d, i) => (
                    <text 
                        key={i} 
                        x={getX(i)} y={chartHeight + paddingY + 20} 
                        textAnchor="middle" 
                        style={{ fontSize: "11.5px", fill: hIdx === i ? "#1e293b" : "#94a3b8", fontWeight: "700", transition: "all 0.2s" }}
                    >
                        {d.month}
                    </text>
                ))}
            </svg>

            {/* Tooltip Box */}
            {hIdx !== null && (
                <div style={{
                    position: "absolute",
                    left: `${(getX(hIdx) / width) * 100}%`,
                    top: "10%",
                    transform: "translateX(-50%)",
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                    pointerEvents: "none",
                    zIndex: 100,
                    minWidth: "140px",
                }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#1e293b", marginBottom: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
                        {data[hIdx].month} 2026
                    </div>
                    {categories.map(cat => (
                        <div key={cat.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cat.color }} />
                                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>{cat.label}</span>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#1e293b" }}>{data[hIdx][cat.key]}</span>
                        </div>
                    ))}
                </div>
            )}
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
    const [liveStats, setLiveStats] = useState({ 
  active_programs: 0, 
  active_vacancies: 0, 
  total_applicants: 0, 
  pending_review: 0, 
  recent_applicants: [],
  status_distribution: [], 
  monthly_stats: [],           
  popular_programs: [],       
  recent_activity: []       
});
    const [search, setSearch] = useState("");          
    const [tableLoading, setTableLoading] = useState(false);

    const fetchStats = async (isSearch = false) => {
        if (isSearch) {
            setTableLoading(true);
        }
        if (!token) return;
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            const res = await axios.get(`http://localhost:8000/api/dashboard/stats?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLiveStats(res.data);
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
        } finally {
            setTableLoading(false);
        }
    };
    useEffect(() => {
    fetchStats();
    
    const stored = localStorage.getItem("company");
    if (stored) {
        try { setCompany(JSON.parse(stored)); } catch (_) { }
    }
    authService.getProfile().then((res) => {
        if (res?.company) {
        setCompany(res.company);
        localStorage.setItem("company", JSON.stringify(res.company));
        }
    }).catch(() => { });
    }, [token]);

    useEffect(() => {
    const timer = setTimeout(() => {
        fetchStats(true);  // ← true = search mode (tableLoading)
    }, 500);
    return () => clearTimeout(timer);
    }, [search]);

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
        { label: "Dashboard", icon: <IC.Dashboard />, path: "/dashboard" },
        { label: "User Management", icon: <IC.Users />, path: "/users" },
        { label: "Program Management", icon: <IC.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <IC.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Settings", icon: <IC.Pengaturan />, path: "/settings" },
    ];

    const distribColors = {
        pending: "#60a5fa",
        accepted: "#4ade80",
        rejected: "#f87171",
        screening: "#818cf8",
        interview: "#c084fc",
    };

    const finalDistrib = (liveStats.status_distribution || []).map(d => ({
        label: d.status === 'pending' ? 'Applied' : d.status,
        count: d.count,
        color: distribColors[d.status] || "#94a3b8"
    }));

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

    const SIDEBAR_W = 250;
    const TOPBAR_H = 56;

    const exportToCSV = () => {
        if (!liveStats.recent_applicants || liveStats.recent_applicants.length === 0) {
            alert("No data available to export.");
            return;
        }
        
        const headers = ["Name", "Email", "Position", "Program", "Status", "Applied At"];
        const rows = liveStats.recent_applicants.map(a => [
            (a.user?.name || "").replace(/,/g, ""),
            (a.user?.email || "").replace(/,/g, ""),
            (a.position?.name || "").replace(/,/g, ""),
            (a.vacancy?.title || "").replace(/,/g, ""),
            a.status,
            new Date(a.submitted_at).toLocaleDateString()
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `applicants_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                        onClick={() => {
                            if (n.path) navigate(n.path);
                            setActiveNav(n.label);
                        }}
                    />
                ))}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Profile at bottom */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    {company?.logo_path ? (
                        <img 
                            src={`http://127.0.0.1:8000/storage/${company.logo_path}`} 
                            alt="Logo" 
                            style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} 
                        />
                    ) : (
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                            background: "linear-gradient(135deg, #2d7dd2, #4a9eff)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: "800", color: "#fff",
                        }}>
                            {initials}
                        </div>
                    )}
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

                    {/* Export */}
                    <button 
                        onClick={exportToCSV}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px", 
                            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", 
                            padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                            color: "#1e293b", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="12" x2="12" y2="3"/></svg>
                        Export CSV
                    </button>

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
                        <div style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Candidate Statistics</p>
                                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>Last 6 months (Jan – Jun 2026)</p>
                                </div>
                                <button style={{ fontSize: "12.5px", color: "#4a9eff", background: "none", border: "none", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                    View All →
                                </button>
                            </div>

                            {/* Legend */}
                            <div style={{ display: "flex", gap: "16px", marginBottom: "4px", marginTop: "4px" }}>
                                {[{ c: "#60a5fa", l: "Applied" }, { c: "#4ade80", l: "Accepted" }, { c: "#f87171", l: "Rejected" }].map((x) => (
                                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: x.c }} />
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>{x.l}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Statistics Chart */}
                            <div style={{ marginTop: "0px" }}>
                                {liveStats.monthly_stats?.length > 0 ? (
                                    <LineChart data={liveStats.monthly_stats} />
                                ) : (
                                    <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
                                        <IC.Laporan />
                                        <p style={{ fontSize: "13px", color: "#94a3b8" }}>No statistical data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Donut: Distribusi Status */}
                        <div style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                <div>
                                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Status Distribution</p>
                                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>From total {liveStats.total_applicants} active candidates</p>
                                </div>
                                <button onClick={() => navigate("/users")} style={{ fontSize: "12.5px", color: "#4a9eff", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Details →</button>
                            </div>
                            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                                <DonutChart data={finalDistrib} total={liveStats.total_applicants} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>

                        {/* Pelamar Terbaru table */}
                        <div style={{ background: "#fff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Recent Candidates</p>
                            <p style={{ fontSize: "12px", color: "#94a3b8" }}>Candidates in the last 24 hours</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                                padding: "7px 14px", width: "240px",
                            }}>
                                <IC.Search />
                                <input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    border: "none", background: "transparent", outline: "none",
                                    fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit",
                                }}
                                />
                            </div>
                            
                            <button style={{ fontSize: "12.5px", color: "#4a9eff", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>View All →</button>
                            </div>
                        </div>

                        {/* Table header */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: "12px", padding: "8px 12px", borderRadius: "8px", background: "#f8fafc", marginBottom: "4px" }}>
                            {["NAME", "PROGRAM", "STATUS", "SUBMISSION DATE"].map((h) => (
                            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px" }}>{h}</span>
                            ))}
                        </div>

                            {/* Recent candidates list */}
                            {tableLoading ? (
                            <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                            <div style={{ 
                                display: "inline-block", 
                                width: "20px", 
                                height: "20px", 
                                border: "2px solid #e2e8f0", 
                                borderTopColor: "#3b82f6", 
                                borderRadius: "50%", 
                                animation: "spin 0.6s linear infinite" 
                            }} />
                            <div style={{ marginTop: "10px" }}>Searching...</div>
                            </div>
                        ) : liveStats.recent_applicants?.length > 0 ? (
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
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {liveStats.popular_programs?.length > 0 ? (
                                        liveStats.popular_programs.map((p, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{p.title}</span>
                                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{p.type}</span>
                                                </div>
                                                <div style={{ background: "#eff6ff", color: "#3b82f6", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>{p.count} Applicants</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: "28px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                            <div style={{ color: "#cbd5e1", width: "28px", height: "28px" }}>
                                                <IC.Laporan />
                                            </div>
                                            <p style={{ fontSize: "13px", color: "#94a3b8" }}>No programs yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "14px" }}>Recent Activity</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {liveStats.recent_activity?.length > 0 ? (
                                        liveStats.recent_activity.map((act, i) => (
                                            <div key={i} style={{ display: "flex", gap: "10px", position: "relative" }}>
                                                {/* Line connection */}
                                                {i < liveStats.recent_activity.length - 1 && <div style={{ position: "absolute", left: "11px", top: "24px", bottom: "-12px", width: "1px", background: "#f1f5f9" }} />}
                                                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: act.status === 'accepted' ? '#22c55e' : '#3b82f6' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: "12.5px", color: "#1e293b", fontWeight: "500", lineHeight: 1.4 }}>
                                                        <strong>{act.user}</strong> applied to <strong>{act.program}</strong>
                                                    </p>
                                                    <p style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>{new Date(act.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: "24px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                            <div style={{ color: "#cbd5e1", width: "28px", height: "28px" }}>
                                                <IC.Bell />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "13px", color: "#94a3b8" }}>No activity yet</p>
                                                <p style={{ fontSize: "11.5px", color: "#cbd5e1", marginTop: "2px" }}>System activity will appear here</p>
                                            </div>
                                        </div>
                                    )}
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
