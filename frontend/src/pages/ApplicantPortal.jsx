import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
    Dashboard: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    Jobs: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
    Applications: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/>
        </svg>
    ),
    User: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    Logout: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Search: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Bell: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    CheckCircle: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    Clock: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    MapPin: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
    )
};

// ── Components ────────────────────────────────────────────────────────────────
const SideItem = ({ icon, label, active, onClick, badge }) => (
    <div
        onClick={onClick}
        style={{
            display: "flex", alignItems: "center", padding: "12px 16px", cursor: "pointer", borderRadius: "10px", margin: "2px 8px", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            background: active ? "linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 100%)" : "transparent",
            color: active ? "#fff" : "rgba(255,255,255,0.6)",
            borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
            fontWeight: active ? "600" : "500"
        }}
        onMouseEnter={e => {
            if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }
        }}
        onMouseLeave={e => {
            if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }
        }}
    >
        <span style={{ marginRight: 12, color: active ? "#3b82f6" : "inherit" }}>{icon}</span>
        <span style={{ fontSize: "13.5px", letterSpacing: "0.2px", flex: 1 }}>{label}</span>
        {badge !== undefined && badge > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                {badge}
            </span>
        )}
    </div>
);

// ── Mock Data ─────────────────────────────────────────────────────────────────
const mockUser = {
    name: "Ahmad Rizky",
    email: "ahmad.rizky@mahasiswa.university.edu",
    university: "Universitas Airlangga",
    major: "Sistem Informasi",
    semester: 6,
};

const mockCompany = {
    name: "PT Telekomunikasi Indonesia (Telkom)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Telkom_Indonesia_2013.svg/1200px-Telkom_Indonesia_2013.svg.png",
};

const mockApplications = [
    { id: 1, role: "Frontend Developer Intern", type: "Full-Time", location: "Surabaya, Hybrid", appliedDate: "20 Mar 2026", status: "menunggu", color: "#fbbf24", bg: "#fffbeb", badgeText: "Menunggu Review" },
    { id: 2, role: "UI/UX Designer", type: "Part-Time", location: "Jakarta, WFH", appliedDate: "15 Jan 2026", status: "diterima", color: "#10b981", bg: "#f0fdf4", badgeText: "Diterima" },
    { id: 3, role: "Data Analyst Intern", type: "Full-Time", location: "Bandung, Onsite", appliedDate: "10 Dec 2025", status: "ditolak", color: "#ef4444", bg: "#fef2f2", badgeText: "Ditolak" }
];

const mockVacancies = [
    { id: 101, title: "Backend Web Developer", type: "Magang MSIB", location: "Telkom Surabaya", duration: 5, closingDate: "30 Apr 2026", applicants: 120 },
    { id: 102, title: "Cloud Engineer Intern", type: "Magang MSIB", location: "Telkom Jakarta", duration: 6, closingDate: "15 Mey 2026", applicants: 85 },
    { id: 103, title: "Digital Marketing Specialist", type: "Full-Time", location: "Remote", duration: 3, closingDate: "05 Jun 2026", applicants: 210 },
];

export default function ApplicantPortal() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [activeMenu, setActiveMenu] = useState("Dashboard");
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const initials = mockUser.name.split(" ").map(n => n[0]).join("").toUpperCase();

    const SIDEBAR_W = 260; // Slightly wider for elegance

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 99px; }
            `}</style>

            {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
            <aside style={{
                width: SIDEBAR_W, flexShrink: 0,
                background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)", // Deep indigo elegant gradient for applicant
                display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0,
                padding: "24px 12px 20px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 10px 30px" }}>
                    <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                        <img src="/assets/images/logo.png" alt="Logo" style={{ height: 24, objectFit: "contain" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "16px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Applicant Portal</span>
                    </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px", margin: "0 8px 24px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ width: 44, height: 44, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src={mockCompany.logo} alt="Company Logo" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 2 }}>Mendaftar Untuk</div>
                        <div style={{ fontSize: "13px", color: "#fff", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mockCompany.name}</div>
                    </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <SideItem icon={<Icon.Dashboard />} label="Dashboard" active={activeMenu === "Dashboard"} onClick={() => setActiveMenu("Dashboard")} />
                    <SideItem icon={<Icon.Jobs />} label="Lowongan Tersedia" active={activeMenu === "Lowongan Tersedia"} onClick={() => setActiveMenu("Lowongan Tersedia")} />
                    <SideItem icon={<Icon.Applications />} label="Lamaran Saya" badge={1} active={activeMenu === "Lamaran Saya"} onClick={() => setActiveMenu("Lamaran Saya")} />
                    <SideItem icon={<Icon.User />} label="Profil Saya" active={activeMenu === "Profil Saya"} onClick={() => setActiveMenu("Profil Saya")} />
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, marginTop: 20, display: "flex", alignItems: "center", gap: 12, padding: "20px 8px 0" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: 14 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mockUser.name}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mockUser.email}</div>
                    </div>
                    <button onClick={() => setLogoutModalOpen(true)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 6, borderRadius: 8, transition: "0.2s" }} onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}><Icon.Logout /></button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Topbar */}
                <header style={{ height: 72, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                        Applicant Portal <span style={{ color: "#cbd5e1" }}>/</span> <span style={{ color: "#0f172a", fontWeight: 700 }}>{activeMenu}</span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}><Icon.Search /></div>
                            <input type="text" placeholder="Cari lowongan..." style={{ width: 240, padding: "10px 16px 10px 38px", borderRadius: 99, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, outline: "none", transition: "0.2s" }} onFocus={e => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.1)"; }} onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }} />
                        </div>
                        <button style={{ position: "relative", width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}>
                            <Icon.Bell />
                            <div style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
                    
                    {activeMenu === "Dashboard" && (
                        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
                            <div style={{ marginBottom: 32 }}>
                                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Selamat datang, {mockUser.name.split(" ")[0]}! 👋</h1>
                                <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Berikut status perkembangan lamaran pada instansi <strong style={{ color: "#334155" }}>{mockCompany.name}</strong>.</p>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
                                {[
                                    { label: "Lamaran Terkirim", value: mockApplications.length, color: "#3b82f6", bg: "#eff6ff", icon: <Icon.Applications /> },
                                    { label: "Menunggu Review", value: mockApplications.filter(a => a.status === "menunggu").length, color: "#f59e0b", bg: "#fffbeb", icon: <Icon.Clock /> },
                                    { label: "Lamaran Diterima", value: mockApplications.filter(a => a.status === "diterima").length, color: "#10b981", bg: "#f0fdf4", icon: <Icon.CheckCircle /> }
                                ].map((stat, i) => (
                                    <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 24, display: "flex", alignItems: "center", gap: 20, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)" }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 14, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{stat.value}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginTop: 6 }}>{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>Status Lamaran Terbaru</h3>
                                    <button onClick={() => setActiveMenu("Lamaran Saya")} style={{ background: "transparent", border: "none", color: "#3b82f6", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Lihat Semua</button>
                                </div>
                                <div>
                                    {mockApplications.slice(0, 2).map((app, i) => (
                                        <div key={app.id} style={{ display: "flex", alignItems: "center", padding: "20px 24px", borderBottom: i === 0 ? "1px solid #f8fafc" : "none" }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                                    <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{app.role}</h4>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: app.bg, color: app.color, border: `1px solid ${app.color}20` }}>{app.badgeText}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#64748b" }}>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.MapPin /> {app.location}</span>
                                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Clock /> Dikirim {app.appliedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMenu === "Lowongan Tersedia" && (
                        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
                             <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Lowongan di {mockCompany.name}</h1>
                                    <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Temukan posisi yang cocok untuk Anda dan kembangkan karir Anda.</p>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                                {mockVacancies.map(vac => (
                                    <div key={vac.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 24, display: "flex", flexDirection: "column", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 20px -8px rgba(0,0,0,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.02)"; }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #f1f5f9", background: "#f8fafc", padding: 6 }}>
                                                <img src={mockCompany.logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>{vac.title}</h3>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", background: "#eff6ff", padding: "4px 10px", borderRadius: 6 }}>{vac.type}</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>{vac.location}</span>
                                        </div>
                                        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px dashed #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Icon.Users /> {vac.applicants} Pelamar
                                            </div>
                                            <div style={{ fontWeight: 600, color: "#475569" }}>
                                                Batas: {vac.closingDate}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeMenu === "Lamaran Saya" || activeMenu === "Profil Saya") && (
                        <div style={{ animation: "fadeIn 0.4s ease-out", display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", textAlign: "center", color: "#64748b" }}>
                            <div style={{ width: 80, height: 80, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: "#94a3b8" }}>
                                <Icon.Applications />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Halaman Sedang Dalam Pengembangan</h2>
                            <p style={{ fontSize: 14, maxWidth: 400, margin: 0, lineHeight: 1.6 }}>Teman sejawat sedang menangani bagian ini di sisi sistem backend. Fitur ini akan segera tersedia untuk dicoba langsung.</p>
                        </div>
                    )}

                </div>
            </main>

            {/* Logout Modal */}
            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setLogoutModalOpen(false)}>
                    <div style={{ background: "#fff", width: 400, borderRadius: 20, padding: 32, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0" }}>Keluar dari Portal?</h2>
                        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.6 }}>Anda harus masuk kembali menggunakan email dan kata sandi Anda untuk mengakses portal ini lagi.</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <button onClick={handleLogout} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#dc2626"} onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}>Ya, Keluar</button>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "none", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"} onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}>Batal</button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
