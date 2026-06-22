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
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Download: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    Menu: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    ),
    Close: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
};

// ── Constants ─────────────────────────────────────────────────────────────────
const CANDIDATE_CATS = [
    { key: "applied",  color: "#3b82f6", label: "Applied"  },
    { key: "accepted", color: "#22c55e", label: "Accepted" },
    { key: "rejected", color: "#ef4444", label: "Rejected" },
];

const EMPLOYEE_CATS = [
    { key: "joined", color: "#7c3aed", label: "New Hires" },
];

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

// ── Tab Bar ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
    return (
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-1 flex-shrink-0">
            {tabs.map(t => (
                <button
                    key={t}
                    onClick={() => onChange(t)}
                    className="px-3 py-1.5 rounded-md border-none text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
                    style={{
                        background: active === t ? "#fff" : "transparent",
                        color: active === t ? "#1e293b" : "#94a3b8",
                        fontWeight: active === t ? "700" : "500",
                        boxShadow: active === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                >{t}</button>
            ))}
        </div>
    );
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, badge, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all text-left border"
            style={{
                background: active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
                borderColor: active ? "rgba(74,158,255,0.22)" : "transparent",
                color: active ? "#4a9eff" : "rgba(255,255,255,0.6)",
                fontWeight: active ? "600" : "500",
            }}
        >
            <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span>
            <span className="flex-1">{label}</span>
            {badge != null && badge > 0 && (
                <span className="text-white rounded-full text-xs font-bold px-1.5 py-0.5 min-w-[20px] text-center" style={{ background: "#4a9eff", fontSize: "11px" }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, barColors }) {
    return (
        <div className="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-1.5 min-w-0" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
            <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold mt-2" style={{ color: "#1e293b", letterSpacing: "-1px" }}>{value}</div>
            <div className="text-xs font-medium" style={{ color: "#64748b" }}>{title}</div>
            {barColors && (
                <div className="flex gap-0.5 mt-2 items-end" style={{ height: "28px" }}>
                    {barColors.map((c, i) => (
                        <div key={i} className="flex-1 rounded-t" style={{ background: c, height: `${30 + Math.sin(i) * 20}%`, opacity: 0.4, minHeight: "4px" }} />
                    ))}
                </div>
            )}
            {sub && <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>{sub}</div>}
        </div>
    );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ data, total }) {
    const totalCount = total || data.reduce((s, d) => s + d.count, 0);
    const isEmpty = totalCount === 0 || data.length === 0;
    const size = 110;

    return (
        <div className="flex items-center flex-wrap justify-center gap-6 md:gap-8 py-2 w-full px-2">
            <div className="relative flex-shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {isEmpty ? (
                        <circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill="none" stroke="#e2e8f0" strokeWidth="20" />
                    ) : (() => {
                        let offset = 0;
                        const r = size / 2 - 10;
                        const circum = 2 * Math.PI * r;
                        return data.map((d, i) => {
                            const pct = d.count / totalCount;
                            const dash = pct * circum;
                            const el = (
                                <circle key={i} cx={size / 2} cy={size / 2} r={r}
                                    fill="none" stroke={d.color || "#e2e8f0"} strokeWidth="16"
                                    strokeDasharray={`${dash} ${circum - dash}`}
                                    strokeDashoffset={-offset}
                                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                                />
                            );
                            offset += dash;
                            return el;
                        });
                    })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-extrabold" style={{ color: "#1e293b" }}>{totalCount}</div>
                    <div className="text-xs font-semibold" style={{ color: "#94a3b8", fontSize: "10px" }}>Total</div>
                </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1" style={{ minWidth: "110px" }}>
                {isEmpty ? (
                    <p className="text-xs" style={{ color: "#94a3b8" }}>No data available</p>
                ) : data.map((d, i) => {
                    const pct = totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0;
                    return (
                        <div key={i} className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                <span className="text-xs font-medium capitalize" style={{ color: "#64748b" }}>{d.label}</span>
                            </div>
                            <span className="text-xs font-extrabold" style={{ color: "#1e293b" }}>{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Line Chart ────────────────────────────────────────────────────────────────
function LineChart({ data, categories = CANDIDATE_CATS, idPrefix = "chart" }) {
    if (!data || data.length < 2) return (
        <div className="h-24 flex items-center justify-center flex-col gap-2 border border-dashed border-slate-200 rounded-xl">
            <IC.Laporan />
            <p className="text-xs" style={{ color: "#94a3b8" }}>No data yet</p>
        </div>
    );
    const [hIdx, setHIdx] = useState(null);
    const width = 800, height = 180, paddingX = 40, paddingY = 5, chartHeight = height - 40;
    const maxVal = Math.max(...data.map(d => Math.max(...categories.map(c => d[c.key] || 0), 1)), 2);
    const getX = (i) => (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2) + paddingX;
    const getY = (v) => chartHeight - (v / maxVal) * (chartHeight - paddingY) + paddingY;
    const genPath = (key) => data.reduce((p, d, i) => p + (i === 0 ? "M" : " L") + ` ${getX(i)} ${getY(d[key] || 0)}`, "");
    const genArea = (key) => {
        const bl = chartHeight + paddingY;
        let p = `M ${getX(0)} ${bl}`;
        data.forEach((d, i) => { p += ` L ${getX(i)} ${getY(d[key] || 0)}`; });
        p += ` L ${getX(data.length - 1)} ${bl} Z`;
        return p;
    };
    return (
        <div className="w-full relative" style={{ height: "220px" }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" onMouseLeave={() => setHIdx(null)}>
                <defs>
                    {categories.map(cat => (
                        <linearGradient key={cat.key} id={`grad-${idPrefix}-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={cat.color} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={cat.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map(p => (
                    <line key={p} x1={paddingX} y1={getY(p * maxVal)} x2={width - paddingX} y2={getY(p * maxVal)} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {hIdx !== null && (
                    <line x1={getX(hIdx)} y1={paddingY} x2={getX(hIdx)} y2={chartHeight + paddingY + 10} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                )}
                {categories.map(cat => (
                    <g key={cat.key}>
                        <path d={genArea(cat.key)} fill={`url(#grad-${idPrefix}-${cat.key})`} style={{ transition: "all 0.4s ease" }} />
                        <path d={genPath(cat.key)} fill="none" stroke={cat.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "all 0.4s ease" }} />
                        {data.map((d, i) => (
                            <circle key={i} cx={getX(i)} cy={getY(d[cat.key] || 0)} r={hIdx === i ? "6" : "4.5"}
                                fill="#fff" stroke={cat.color} strokeWidth={hIdx === i ? "3" : "2.5"}
                                style={{ transition: "all 0.2s ease" }}
                            />
                        ))}
                    </g>
                ))}
                {data.map((_, i) => (
                    <rect key={i} x={getX(i) - 20} y={0} width="40" height={height} fill="transparent" style={{ cursor: "pointer" }} onPointerMove={() => setHIdx(i)} />
                ))}
                {data.map((d, i) => (
                    <text key={i} x={getX(i)} y={chartHeight + paddingY + 20} textAnchor="middle"
                        style={{ fontSize: "11.5px", fill: hIdx === i ? "#1e293b" : "#94a3b8", fontWeight: "700", transition: "all 0.2s" }}
                    >{d.month}</text>
                ))}
            </svg>
            {hIdx !== null && (
                <div className="absolute z-50 pointer-events-none rounded-xl border border-slate-200"
                    style={{
                        left: `${(getX(hIdx) / width) * 100}%`, top: "10%",
                        transform: "translateX(-50%)", background: "#fff",
                        padding: "12px 16px", boxShadow: "0 10px 25px rgba(0,0,0,0.12)", minWidth: "140px",
                    }}
                >
                    <div className="text-xs font-extrabold pb-1.5 mb-2 border-b border-slate-100" style={{ color: "#1e293b" }}>
                        {data[hIdx].month} 2026
                    </div>
                    {categories.map(cat => (
                        <div key={cat.key} className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                                <span className="text-xs font-medium" style={{ color: "#64748b" }}>{cat.label}</span>
                            </div>
                            <span className="text-xs font-extrabold" style={{ color: "#1e293b" }}>{data[hIdx][cat.key] || 0}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Empty States ──────────────────────────────────────────────────────────────
function EmptyTable({ icon, title, sub }) {
    return (
        <div className="py-10 text-center flex flex-col items-center gap-2.5">
            <div className="text-slate-300 w-8 h-8">{icon}</div>
            <div>
                <p className="text-sm" style={{ color: "#94a3b8" }}>{title}</p>
                {sub && <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>{sub}</p>}
            </div>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="py-12 text-center text-xs" style={{ color: "#94a3b8" }}>
            <div className="inline-block w-5 h-5 border-2 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: "#3b82f6" }} />
            <div className="mt-2.5">Searching...</div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();
    const [company, setCompany] = useState(null);
    const [activeNav, setActiveNav] = useState("Dashboard");
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    // ── NEW: mobile sidebar toggle ──────────────────────────────────────────
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Tab states
    const [chartTab, setChartTab] = useState("Candidates");
    const [distribTab, setDistribTab] = useState("Candidates");
    const [tableTab, setTableTab] = useState("Candidates");

    const [liveStats, setLiveStats] = useState({
        active_programs: 0, active_vacancies: 0, total_applicants: 0, pending_review: 0,
        total_employees: 0, active_employees: 0,
        recent_employees: [], employee_status_distribution: [], employee_monthly_stats: [],
        recent_applicants: [], status_distribution: [], monthly_stats: [],
        popular_programs: [], recent_activity: [],
    });

    const [candidateSearch, setCandidateSearch] = useState("");
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [tableLoading, setTableLoading] = useState(false);

    const fetchStats = async (isSearch = false) => {
        if (isSearch) setTableLoading(true);
        if (!token) return;
        try {
            const params = new URLSearchParams();
            if (candidateSearch) params.set("search", candidateSearch);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/dashboard/stats?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
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
        const stored = sessionStorage.getItem("company");
        if (stored) { try { setCompany(JSON.parse(stored)); } catch (_) {} }
        authService.getProfile().then(res => {
            if (res?.company) { setCompany(res.company); sessionStorage.setItem("company", JSON.stringify(res.company)); }
        }).catch(() => {});
    }, [token]);

    useEffect(() => {
        const t = setTimeout(() => fetchStats(true), 500);
        return () => clearTimeout(t);
    }, [candidateSearch]);

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const companyName = company?.name || "Admin";
    const companyRole = company?.role || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();

    // ── Stat cards ─────────────────────────────────────────────────────────────
    const stats = [
        { icon: <IC.Program />, iconBg: "#eff6ff", iconColor: "#3b82f6", title: "Active Positions", value: liveStats.active_programs.toString(), sub: "Active internship positions", barColors: ["#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6"] },
        { icon: <IC.Lowongan />, iconBg: "#f0fdf4", iconColor: "#16a34a", title: "Active Programs", value: liveStats.active_vacancies.toString(), sub: "Published programs", barColors: ["#4ade80", "#86efac", "#4ade80", "#86efac", "#4ade80", "#bbf7d0", "#4ade80"] },
        { icon: <IC.Users />, iconBg: "#fffbeb", iconColor: "#d97706", title: "Total Candidates", value: liveStats.total_applicants.toString(), sub: `${liveStats.total_applicants} applicants recorded`, barColors: ["#fbbf24", "#fde68a", "#f59e0b", "#fbbf24", "#fde68a", "#f59e0b", "#fbbf24"] },
        { icon: <IC.Users />, iconBg: "#f5f3ff", iconColor: "#7c3aed", title: "Total Employees", value: liveStats.total_employees.toString(), sub: `${liveStats.active_employees} active`, barColors: ["#a78bfa", "#c4b5fd", "#7c3aed", "#a78bfa", "#c4b5fd", "#7c3aed", "#a78bfa"] },
        { icon: <IC.Bell />, iconBg: "#fff1f2", iconColor: "#e11d48", title: "Pending Review", value: liveStats.pending_review.toString(), sub: "Requires attention", barColors: ["#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fca5a5"] },
    ];

    const navItems = [
        { label: "Dashboard", icon: <IC.Dashboard />, path: "/dashboard" },
        { label: "User Management", icon: <IC.Users />, path: "/users" },
        { label: "Program Management", icon: <IC.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <IC.Program />, path: "/positions" },
    ];
    const navItems2 = [{ label: "Settings", icon: <IC.Pengaturan />, path: "/settings" }];

    // ── Distribution data ──────────────────────────────────────────────────────
    const distribColors = { pending: "#60a5fa", accepted: "#4ade80", rejected: "#f87171", screening: "#818cf8", interview: "#c084fc" };
    const empStatusColors = { active: "#4ade80", inactive: "#f87171", contract: "#60a5fa", probation: "#fbbf24", resigned: "#94a3b8", terminated: "#ef4444" };

    const candidateDistrib = (liveStats.status_distribution || []).map(d => ({
        label: d.status === "pending" ? "Applied" : d.status,
        count: d.count,
        color: distribColors[d.status] || "#94a3b8",
    }));

    const employeeDistrib = (liveStats.employee_status_distribution || []).map(d => ({
        label: d.employee_status,
        count: d.count,
        color: empStatusColors[d.employee_status] || "#94a3b8",
    }));

    const filteredEmployees = (liveStats.recent_employees || []).filter(e =>
        !employeeSearch ||
        e.full_name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.department?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.position?.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    const formatEmployeeStatus = (status) => {
        const normalized = (status || "").toString().trim().toLowerCase();
        const config = {
            full_time: { label: "Full Time", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
            fulltime:  { label: "Full Time", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
            permanent: { label: "Full Time", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
            part_time: { label: "Part Time", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
            parttime:  { label: "Part Time", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
            contract:  { label: "Contract", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
            probation: { label: "Probation", bg: "#fffbeb", color: "#d97706", border: "#fed7aa" },
            inactive:  { label: "Inactive", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
            resigned:  { label: "Resigned", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
            terminated:{ label: "Terminated", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
        }[normalized];
        if (config) return config;
        const pretty = status ? status.toString().replace(/[_-]+/g, " ") : "Full Time";
        return { label: pretty.replace(/\b\w/g, c => c.toUpperCase()), bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
    };

    // ── CSV Export ─────────────────────────────────────────────────────────────
    const exportToCSV = () => {
        const isCandidate = tableTab === "Candidates";
        const source = isCandidate ? liveStats.recent_applicants : liveStats.recent_employees;
        if (!source?.length) { alert("No data to export."); return; }
        const headers = isCandidate
            ? ["Name", "Email", "Position", "Program", "Status", "Applied At"]
            : ["Name", "Department", "Position", "Status", "Joined"];
        const rows = isCandidate
            ? source.map(a => [(a.user?.name || "").replace(/,/g, ""), (a.user?.email || "").replace(/,/g, ""), (a.position?.name || "").replace(/,/g, ""), (a.vacancy?.title || "").replace(/,/g, ""), a.status, new Date(a.submitted_at).toLocaleDateString()])
            : source.map(e => [(e.full_name || "").replace(/,/g, ""), (e.department || "").replace(/,/g, ""), (e.position || "").replace(/,/g, ""), e.employee_status, e.joined_at ? new Date(e.joined_at).toLocaleDateString() : ""]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${isCandidate ? "candidates" : "employees"}_${new Date().toISOString().split("T")[0]}.csv`;
        a.style.visibility = "hidden"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };

    // ── Sidebar component (shared between desktop sticky + mobile overlay) ─────
    const SidebarContent = ({ onClose }) => (
        <>
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5 px-1.5 pb-5 no-underline">
                <img src="/assets/images/logo.png" alt="EarlyPath" className="h-11 object-contain flex-shrink-0" />
                <span className="text-base font-extrabold text-white whitespace-nowrap tracking-tight">EarlyPath</span>
            </Link>
            <p className="text-xs font-bold px-3.5 pb-1 pt-1.5 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Main Menu</p>
            {navItems.map(n => (
                <SideItem key={n.label} icon={n.icon} label={n.label} badge={n.badge}
                    active={activeNav === n.label}
                    onClick={() => { setActiveNav(n.label); if (n.path) navigate(n.path); if (onClose) onClose(); }}
                />
            ))}
            <div className="h-px mx-2 my-3" style={{ background: "rgba(255,255,255,0.07)" }} />
            <p className="text-xs font-bold px-3.5 pb-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Others</p>
            {navItems2.map(n => (
                <SideItem key={n.label} icon={n.icon} label={n.label} active={activeNav === n.label}
                    onClick={() => { navigate(n.path); setActiveNav(n.label); if (onClose) onClose(); }}
                />
            ))}
            <div className="flex-1" />
            <div className="border-t pt-3.5 flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {company?.logo_path ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${company.logo_path}`}
                        alt="Logo" className="w-9 h-9 rounded-xl object-cover"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white" style={{ background: "linear-gradient(135deg, #2d7dd2, #4a9eff)" }}>
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate" style={{ fontSize: "12.5px" }}>{companyName}</div>
                    <div className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{companyRole}</div>
                </div>
                <button
                    onClick={() => setLogoutModalOpen(true)}
                    title="Logout"
                    className="bg-transparent border-none cursor-pointer p-1 rounded-md flex transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                ><IC.Logout /></button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.35s ease both; }
                @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                .sidebar-slide { animation: slideIn 0.25s ease both; }
            `}</style>

            {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                    onClick={() => setSidebarOpen(false)}
                >
                    <aside
                        className="sidebar-slide absolute left-0 top-0 bottom-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden p-5"
                        style={{ width: "260px", background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-base font-extrabold text-white">Menu</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-white/50 border-none bg-transparent cursor-pointer p-1">
                                <IC.Close />
                            </button>
                        </div>
                        <SidebarContent onClose={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── DESKTOP SIDEBAR (sticky, hidden on mobile) ───────────────── */}
            <aside className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto overflow-x-hidden gap-1 p-3"
                style={{ width: "250px", background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)" }}
            >
                <SidebarContent onClose={null} />
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* ── TOPBAR ──────────────────────────────────────────────── */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
                    {/* Hamburger — visible only below lg */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-slate-600 flex-shrink-0"
                    >
                        <IC.Menu />
                    </button>

                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold" style={{ color: "#1e293b" }}>Dashboard</span>
                        <span className="text-xs mx-1.5" style={{ color: "#94a3b8" }}>/</span>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>Overview</span>
                    </div>

                    {/* Export — label hidden on small screens */}
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer text-xs font-semibold transition-colors hover:bg-slate-50 hover:border-slate-300 flex-shrink-0"
                        style={{ color: "#1e293b" }}
                    >
                        <IC.Download />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    <button className="bg-slate-50 border border-slate-200 rounded-xl w-9 h-9 flex items-center justify-center cursor-pointer flex-shrink-0" style={{ color: "#64748b" }}>
                        <IC.Bell />
                    </button>

                    {/* Date — hidden on mobile */}
                    <span className="hidden md:block text-xs whitespace-nowrap flex-shrink-0" style={{ color: "#94a3b8" }}>{today()}</span>
                </header>

                {/* ── PAGE BODY ─────────────────────────────────────────────── */}
                <main className="flex-1 p-4 md:p-6 lg:p-7 pb-10 overflow-y-auto text-left fade-in">

                    {/* Page header */}
                    <div className="mb-6 md:mb-7">
                        <div className="text-lg md:text-xl font-extrabold" style={{ color: "#0f172a", lineHeight: 1.2 }}>{getGreeting()}, {companyName}</div>
                        <div className="text-xs md:text-sm mt-0.5" style={{ color: "#64748b" }}>Here's a summary of platform activity today.</div>
                    </div>

                    {/* ── STAT CARDS
                         2 cols on mobile → 3 on md → 5 on xl ──────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5 mb-5 md:mb-6">
                        {stats.map((s, i) => <StatCard key={i} {...s} />)}
                    </div>

                    {/* ── MIDDLE ROW: Chart + Distribution
                         stacked on mobile/tablet → side-by-side on lg ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-4 md:gap-5 mb-4 md:mb-5">

                        {/* Line Chart */}
                        <div className="bg-white rounded-xl p-4 md:p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                                <div>
                                    <p className="text-sm font-bold" style={{ color: "#1e293b" }}>Statistics</p>
                                    <p className="text-xs" style={{ color: "#94a3b8" }}>Last 6 months</p>
                                </div>
                                <TabBar tabs={["Candidates", "Employees"]} active={chartTab} onChange={setChartTab} />
                            </div>
                            <div className="flex gap-4 mb-1 flex-wrap">
                                {(chartTab === "Candidates" ? CANDIDATE_CATS : EMPLOYEE_CATS).map(x => (
                                    <div key={x.key} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ background: x.color }} />
                                        <span className="text-xs" style={{ color: "#64748b" }}>{x.label}</span>
                                    </div>
                                ))}
                            </div>
                            {chartTab === "Candidates"
                                ? <LineChart data={liveStats.monthly_stats} categories={CANDIDATE_CATS} idPrefix="cand" />
                                : <LineChart data={liveStats.employee_monthly_stats} categories={EMPLOYEE_CATS} idPrefix="emp" />
                            }
                        </div>

                        {/* Status Distribution */}
                        <div className="bg-white rounded-xl p-4 md:p-5 flex flex-col gap-2.5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold" style={{ color: "#1e293b" }}>Status Distribution</p>
                                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                                        {distribTab === "Candidates" ? `${liveStats.total_applicants} candidates` : `${liveStats.total_employees} employees`}
                                    </p>
                                </div>
                                <button onClick={() => navigate("/users")} className="text-xs font-semibold bg-transparent border-none cursor-pointer" style={{ color: "#4a9eff" }}>Details →</button>
                            </div>
                            <TabBar tabs={["Candidates", "Employees"]} active={distribTab} onChange={setDistribTab} />
                            <div className="flex-1 flex items-center">
                                {distribTab === "Candidates"
                                    ? <DonutChart data={candidateDistrib} total={liveStats.total_applicants} />
                                    : <DonutChart data={employeeDistrib} total={liveStats.total_employees} />
                                }
                            </div>
                        </div>
                    </div>

                    {/* ── BOTTOM ROW: Table + Right Column
                         stacked on mobile/tablet → side-by-side on lg ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-4 md:gap-5">

                        {/* ── TABLE CARD ────────────────────────────────────── */}
                        <div className="bg-white rounded-2xl p-4 md:p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            {/* Table toolbar */}
                            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                <TabBar
                                    tabs={["Candidates", "Employees"]}
                                    active={tableTab}
                                    onChange={t => { setTableTab(t); setCandidateSearch(""); setEmployeeSearch(""); }}
                                />
                                {/* Search input */}
                                <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 border border-slate-200 bg-slate-50 w-full sm:w-auto" style={{ minWidth: 0, maxWidth: "260px" }}>
                                    <IC.Search />
                                    <input
                                        placeholder={tableTab === "Candidates" ? "Search name or email..." : "Search name or dept..."}
                                        value={tableTab === "Candidates" ? candidateSearch : employeeSearch}
                                        onChange={e => tableTab === "Candidates" ? setCandidateSearch(e.target.value) : setEmployeeSearch(e.target.value)}
                                        className="border-none bg-transparent outline-none text-xs w-full"
                                        style={{ color: "#64748b", fontFamily: "inherit" }}
                                    />
                                </div>
                            </div>

                            {/* Scrollable table wrapper — prevents horizontal overflow */}
                            <div className="overflow-x-auto -mx-1 px-1">

                                {/* ── CANDIDATES TABLE ──────────────────────── */}
                                {tableTab === "Candidates" && (
                                    <div style={{ minWidth: "560px" }}>
                                        <div className="grid gap-3 px-3 py-2 rounded-lg mb-1" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr", background: "#f8fafc" }}>
                                            {["NAME", "PROGRAM", "STATUS", "APPLIED DATE"].map(h => (
                                                <span key={h} className="text-xs font-bold tracking-wide" style={{ color: "#94a3b8" }}>{h}</span>
                                            ))}
                                        </div>
                                        {tableLoading ? <LoadingSpinner />
                                            : liveStats.recent_applicants?.length > 0 ? (
                                                liveStats.recent_applicants.map((app, idx) => (
                                                    <div key={idx}
                                                        className="grid gap-3 px-3 py-3.5 items-center"
                                                        style={{
                                                            gridTemplateColumns: "2fr 2fr 1fr 1fr",
                                                            borderBottom: idx === liveStats.recent_applicants.length - 1 ? "none" : "1px solid #f1f5f9",
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#eff6ff", color: "#3b82f6" }}>
                                                                {(app.user?.name || "U").slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{app.user?.name}</div>
                                                                <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{app.user?.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{app.vacancy?.title || "Unknown"}</div>
                                                            <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{app.position?.name}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold px-2 py-1 rounded capitalize" style={{
                                                                background: app.status === "accepted" ? "#f0fdf4" : app.status === "rejected" ? "#fef2f2" : "#fff7ed",
                                                                color: app.status === "accepted" ? "#16a34a" : app.status === "rejected" ? "#dc2626" : "#d97706",
                                                                border: `1px solid ${app.status === "accepted" ? "#bbf7d0" : app.status === "rejected" ? "#fecaca" : "#fed7aa"}`,
                                                            }}>{app.status || "Pending"}</span>
                                                        </div>
                                                        <span className="text-xs" style={{ color: "#64748b" }}>
                                                            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Just now"}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : <EmptyTable icon={<IC.Users />} title="No candidates yet" sub="Candidates will appear after someone applies" />
                                        }
                                    </div>
                                )}

                                {/* ── EMPLOYEES TABLE ───────────────────────── */}
                                {tableTab === "Employees" && (
                                    <div style={{ minWidth: "600px" }}>
                                        <div className="grid gap-3 px-3 py-2 rounded-lg mb-1" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr", background: "#f8fafc" }}>
                                            {["NAME", "DEPARTMENT", "POSITION", "STATUS", "JOINED"].map(h => (
                                                <span key={h} className="text-xs font-bold tracking-wide" style={{ color: "#94a3b8" }}>{h}</span>
                                            ))}
                                        </div>
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map((emp, idx) => {
                                                const st = formatEmployeeStatus(emp.employee_status);
                                                return (
                                                    <div key={idx}
                                                        className="grid gap-3 px-3 py-3.5 items-center"
                                                        style={{
                                                            gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr",
                                                            borderBottom: idx === filteredEmployees.length - 1 ? "none" : "1px solid #f1f5f9",
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                                                                {(emp.full_name || "E").slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="text-sm font-semibold truncate" style={{ color: "#1e293b" }}>{emp.full_name || "—"}</div>
                                                        </div>
                                                        <span className="text-xs truncate" style={{ color: "#64748b" }}>{emp.department || "—"}</span>
                                                        <span className="text-xs truncate" style={{ color: "#64748b" }}>{emp.position || "—"}</span>
                                                        <div>
                                                            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                                                {st.label}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs" style={{ color: "#64748b" }}>
                                                            {emp.joined_at_display || (emp.joined_at ? new Date(emp.joined_at).toLocaleDateString() : "—")}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : <EmptyTable icon={<IC.Users />} title="No employees found" sub="Employees will appear here once added" />}
                                    </div>
                                )}
                            </div>{/* end overflow-x-auto */}
                        </div>

                        {/* ── RIGHT COLUMN ──────────────────────────────────── */}
                        <div className="flex flex-col gap-4 md:gap-5">

                            {/* Most Popular Programs */}
                            <div className="bg-white rounded-2xl p-5 md:p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                                <div className="mb-3.5">
                                    <p className="text-sm font-bold" style={{ color: "#1e293b" }}>Most Popular Programs</p>
                                    <p className="text-xs" style={{ color: "#94a3b8", fontSize: "11.5px" }}>By number of candidates</p>
                                </div>
                                {liveStats.popular_programs?.length > 0 ? (
                                    <div className="flex flex-col gap-0.5">
                                        {liveStats.popular_programs.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < liveStats.popular_programs.length - 1 ? "1px solid #f8fafc" : "none" }}>
                                                <div className="min-w-0 mr-2">
                                                    <div className="text-xs font-semibold truncate" style={{ color: "#1e293b" }}>{p.title}</div>
                                                    <div className="text-xs" style={{ color: "#94a3b8" }}>{p.type}</div>
                                                </div>
                                                <div className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: "#eff6ff", color: "#3b82f6" }}>{p.count}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <EmptyTable icon={<IC.Laporan />} title="No programs yet" />}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-2xl p-5 md:p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                                <p className="text-sm font-bold mb-3.5" style={{ color: "#1e293b" }}>Recent Activity</p>
                                {liveStats.recent_activity?.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {liveStats.recent_activity.map((act, i) => (
                                            <div key={i} className="flex gap-2.5 relative">
                                                {i < liveStats.recent_activity.length - 1 && (
                                                    <div className="absolute w-px bg-slate-100" style={{ left: "11px", top: "24px", bottom: "-12px" }} />
                                                )}
                                                <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center z-10 flex-shrink-0 bg-slate-50">
                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: act.type === "employee" ? "#7c3aed" : act.status === "accepted" ? "#22c55e" : "#3b82f6" }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium leading-snug" style={{ color: "#1e293b" }}>
                                                        <strong>{act.user}</strong>{" "}
                                                        {act.type === "employee" ? "joined" : "applied to"}{" "}
                                                        <strong>{act.program}</strong>
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        <p className="text-xs" style={{ color: "#94a3b8", fontSize: "10.5px" }}>
                                                            {act.time ? new Date(act.time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                                        </p>
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                                                            style={{
                                                                fontSize: "10px",
                                                                background: act.type === "employee" ? "#f5f3ff" : "#eff6ff",
                                                                color: act.type === "employee" ? "#7c3aed" : "#3b82f6",
                                                            }}
                                                        >{act.type === "employee" ? "Employee" : "Candidate"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <EmptyTable icon={<IC.Bell />} title="No activity yet" sub="Activity will appear here" />}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── LOGOUT MODAL ──────────────────────────────────────────────── */}
            {logoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,.5)" }}>
                    {/* p-4 on mobile ensures the modal never touches screen edges */}
                    <div className="bg-white rounded-2xl p-6 md:p-7 w-full max-w-sm" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                        <div className="mb-4" style={{ color: "#3b82f6" }}><IC.Users /></div>
                        <div className="text-base font-extrabold mb-1.5" style={{ color: "#0f172a" }}>Sign Out?</div>
                        <div className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>Are you sure you want to sign out from your company account?</div>
                        <div className="flex gap-2.5 justify-end">
                            <button
                                onClick={() => setLogoutModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold cursor-pointer"
                                style={{ color: "#64748b" }}
                            >Cancel</button>
                            <button
                                onClick={async () => { await logout(); navigate("/", { replace: true }); }}
                                className="px-4 py-2.5 rounded-xl border-none text-xs font-bold text-white cursor-pointer"
                                style={{ background: "#ef4444" }}
                            >Yes, Sign Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}