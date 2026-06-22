import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../stores/authStore";

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
    Lowongan: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
    Program: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),
    Pengaturan: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Camera: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
        </svg>
    ),
    Mail: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    Phone: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    Map: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Trash: () => (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
    Building: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V8"/><path d="M16 21V8"/><path d="M2 12h20"/>
        </svg>
    ),
};

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, onClick, badge }) {
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
            <span style={{ opacity: active ? 1 : 0.75, display: "flex", alignItems: "center" }}>{icon}</span>
            <span className="flex-1">{label}</span>
            {badge != null && badge > 0 && (
                <span className="text-white rounded-full text-xs font-bold px-1.5 py-0.5 min-w-[20px] text-center" style={{ background: "#4a9eff", fontSize: "11px" }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, visible }) => (
    <div style={{
        position: "fixed", bottom: 24, left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        opacity: visible ? 1 : 0, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: type === "error" ? "#ef4444" : "#10b981", color: "#fff",
        padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 600,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 10, maxWidth: "90vw",
    }}>
        {msg}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function SettingsAdmin() {
    const navigate = useNavigate();
    const { token, logout, company: storeCompany } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, msg: "", type: "success" });
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const fileInpRef = useRef(null);
    const [showLogoMenu, setShowLogoMenu] = useState(false);

    const [comp, setComp] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem("company")) || storeCompany || {}; }
        catch { return storeCompany || {}; }
    });

    const [form, setForm] = useState({
        name: comp.name || "",
        email: comp.email || "",
        phone: comp.phone || "",
        address: comp.address || "",
        description: comp.description || "",
    });

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/company/profile`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updated = res.data.company;
            sessionStorage.setItem("company", JSON.stringify(updated));
            setComp(updated);
            showToast("Profile updated successfully!");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to update profile", "error");
        } finally { setLoading(false); }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("logo", file);
        setLoading(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/company/logo`,
                formData,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );
            const updated = res.data.company;
            sessionStorage.setItem("company", JSON.stringify(updated));
            setComp(updated);
            showToast("Logo updated successfully!");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to upload logo", "error");
        } finally { setLoading(false); }
    };

    const handleRemoveLogo = async () => {
        if (!confirm("Are you sure you want to remove the company logo?")) return;
        setLoading(true);
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/company/logo`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updated = res.data.company;
            sessionStorage.setItem("company", JSON.stringify(updated));
            setComp(updated);
            showToast("Logo removed successfully!");
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to remove logo", "error");
        } finally { setLoading(false); }
    };

    const navItems = [
        { label: "Dashboard", icon: <IC.Dashboard />, path: "/dashboard" },
        { label: "User Management", icon: <IC.Users />, path: "/users" },
        { label: "Program Management", icon: <IC.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <IC.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Settings", icon: <IC.Pengaturan />, path: "/settings" },
    ];

    const companyName = comp.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();
    const logoUrl = comp.logo_path
        ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${comp.logo_path}`
        : null;

    // ── Sidebar content (shared between desktop + mobile overlay) ─────────────
    const SidebarContent = ({ onClose }) => (
        <>
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5 px-1.5 pb-5 no-underline">
                <img src="/assets/images/logo.png" alt="EarlyPath" className="h-11 object-contain flex-shrink-0" />
                <span className="text-base font-extrabold text-white whitespace-nowrap tracking-tight">EarlyPath</span>
            </Link>

            <p className="text-xs font-bold px-3.5 pb-1 pt-1.5 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Main Menu</p>
            {navItems.map(n => (
                <SideItem key={n.label} icon={n.icon} label={n.label}
                    active={false}
                    onClick={() => { navigate(n.path); if (onClose) onClose(); }}
                />
            ))}

            <div className="h-px mx-2 my-3" style={{ background: "rgba(255,255,255,0.07)" }} />
            <p className="text-xs font-bold px-3.5 pb-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Others</p>
            {navItems2.map(n => (
                <SideItem key={n.label} icon={n.icon} label={n.label}
                    active={true}
                    onClick={() => { navigate(n.path); if (onClose) onClose(); }}
                />
            ))}

            <div className="flex-1" />

            <div className="border-t pt-3.5 flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                ) : (
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white"
                        style={{ background: "linear-gradient(135deg, #2d7dd2, #4a9eff)" }}>
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate" style={{ fontSize: "12.5px" }}>{companyName}</div>
                    <div className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Admin</div>
                </div>
                <button
                    onClick={() => setLogoutModalOpen(true)}
                    title="Logout"
                    className="bg-transparent border-none cursor-pointer p-1 rounded-md flex transition-colors flex-shrink-0"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                >
                    <IC.Logout />
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.35s ease both; }
                @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                .sidebar-slide { animation: slideIn 0.25s ease both; }
                .settings-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.1) !important; outline: none; }
                .logo-menu-item:hover { background: #f8fafc; }
            `}</style>

            {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────────────── */}
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

            {/* ── DESKTOP SIDEBAR ───────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto overflow-x-hidden gap-1 p-3"
                style={{ width: "250px", background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)" }}
            >
                <SidebarContent onClose={null} />
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* ── TOPBAR ─────────────────────────────────────────────── */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-slate-600 flex-shrink-0"
                    >
                        <IC.Menu />
                    </button>

                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold" style={{ color: "#1e293b" }}>Settings</span>
                        <span className="text-xs mx-1.5" style={{ color: "#94a3b8" }}>/</span>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>Company Profile</span>
                    </div>
                </header>

                {/* ── PAGE BODY ─────────────────────────────────────────── */}
                <main className="flex-1 p-4 md:p-6 lg:p-7 pb-10 overflow-y-auto text-left fade-in">

                    {/* ── PAGE HEADER ──────────────────────────────────── */}
                    <div className="mb-6 md:mb-7">
                        <div className="text-lg md:text-xl font-extrabold" style={{ color: "#0f172a", lineHeight: 1.2 }}>Company Settings</div>
                        <div className="text-xs md:text-sm mt-0.5" style={{ color: "#64748b" }}>Manage your brand identity and company profile information.</div>
                    </div>

                    {/* ── LOGO CARD ─────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 mb-4 md:mb-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            <p className="text-sm font-bold mb-4" style={{ color: "#1e293b" }}>Brand Identity</p>

                            {/* Logo row — stacks on mobile, side-by-side on sm+ */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                                {/* Avatar / Logo */}
                                <div className="flex-shrink-0">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo"
                                            className="rounded-2xl object-cover border border-slate-200"
                                            style={{ width: "90px", height: "90px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)" }}
                                        />
                                    ) : (
                                        <div className="rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
                                            style={{ width: "90px", height: "90px", background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", boxShadow: "0 8px 20px rgba(74,158,255,0.2)" }}>
                                            {initials}
                                        </div>
                                    )}
                                </div>

                                {/* Info + actions */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-extrabold mb-1" style={{ color: "#0f172a", fontSize: "16px" }}>{companyName}</div>
                                    <p className="text-xs mb-3" style={{ color: "#64748b" }}>
                                        Recommended: square image, at least 256×256px. PNG or JPG.
                                    </p>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => fileInpRef.current.click()}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs font-semibold transition-colors hover:bg-slate-100"
                                            style={{ color: "#475569" }}
                                        >
                                            <IC.Camera /> Upload Logo
                                        </button>
                                        {logoUrl && (
                                            <button
                                                onClick={handleRemoveLogo}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-semibold transition-colors"
                                                style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#dc2626" }}
                                                onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                                                onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
                                            >
                                                <IC.Trash /> Remove Logo
                                            </button>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInpRef} hidden accept="image/*" onChange={handleLogoUpload} />
                                </div>
                            </div>
                        </div>

                        {/* ── PROFILE FORM CARD ─────────────────────────────── */}
                        <div className="bg-white rounded-2xl p-4 md:p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            <p className="text-sm font-bold mb-5" style={{ color: "#1e293b" }}>Profile Information</p>

                            <form onSubmit={handleProfileUpdate}>
                                {/* Grid: 1 col on mobile, 2 cols on md+ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

                                    {/* Company Name — full width */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#64748b" }}>
                                            Company Name
                                        </label>
                                        <input
                                            className="settings-input w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white transition-all"
                                            style={{ fontFamily: "inherit", color: "#1e293b" }}
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Acme Corporation"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#64748b" }}>
                                            <IC.Mail /> Contact Email
                                        </label>
                                        <input
                                            className="settings-input w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white transition-all"
                                            style={{ fontFamily: "inherit", color: "#1e293b" }}
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="hr@company.com"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#64748b" }}>
                                            <IC.Phone /> Phone Number
                                        </label>
                                        <input
                                            className="settings-input w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white transition-all"
                                            style={{ fontFamily: "inherit", color: "#1e293b" }}
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="+62..."
                                        />
                                    </div>

                                    {/* Address — full width */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="flex items-center gap-1.5 text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#64748b" }}>
                                            <IC.Map /> Headquarter Address
                                        </label>
                                        <input
                                            className="settings-input w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white transition-all"
                                            style={{ fontFamily: "inherit", color: "#1e293b" }}
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="Full address..."
                                        />
                                    </div>

                                    {/* Description — full width */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#64748b" }}>
                                            About Company (Bio)
                                        </label>
                                        <textarea
                                            className="settings-input w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white transition-all resize-vertical"
                                            style={{ fontFamily: "inherit", color: "#1e293b", minHeight: "120px" }}
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Brief description of your company..."
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full sm:w-auto px-6 py-3 rounded-xl border-none text-white text-sm font-bold cursor-pointer transition-all"
                                        style={{
                                            background: "#3b82f6",
                                            opacity: loading ? 0.7 : 1,
                                            boxShadow: "0 6px 16px rgba(59,130,246,0.25)",
                                        }}
                                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
                                        onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}
                                    >
                                        {loading ? "Saving Changes..." : "Update Profile"}
                                    </button>
                                    {loading && (
                                        <span className="text-xs" style={{ color: "#94a3b8" }}>Please wait...</span>
                                    )}
                                </div>
                            </form>
                        </div>

                </main>
            </div>

            {/* ── LOGOUT MODAL ─────────────────────────────────────────────── */}
            {logoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,.5)" }}>
                    <div className="bg-white rounded-2xl p-6 md:p-7 w-full max-w-sm" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                        <div className="mb-1" style={{ color: "#3b82f6" }}><IC.Users /></div>
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

            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}