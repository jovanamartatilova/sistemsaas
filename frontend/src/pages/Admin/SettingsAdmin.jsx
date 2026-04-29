import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../stores/authStore";

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
    Camera: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    Map: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Trash: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
};

function SideItem({ icon, label, active, onClick, badge }) {
    const [hov, setHov] = useState(false);
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
                position: "relative",
            }}
        >
            <span style={{ opacity: active ? 1 : 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge != null && badge > 0 && (
                <span style={{ 
                    background: "#4a9eff", color: "#fff", borderRadius: "100px", 
                    fontSize: "11px", fontWeight: "700", padding: "1px 7px", 
                    minWidth: "20px", textAlign: "center" 
                }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

const Toast = ({ msg, type, visible }) => (
    <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
        opacity: visible ? 1 : 0, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: type === "error" ? "#ef4444" : "#10b981", color: "#fff",
        padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 600,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 10
    }}>
        {msg}
    </div>
);

export default function SettingsAdmin() {
    const navigate = useNavigate();
    const { token, logout, company: storeCompany } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, msg: "", type: "success" });
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const fileInpRef = useRef(null);

    const [showLogoMenu, setShowLogoMenu] = useState(false);

    const [comp, setComp] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("company")) || storeCompany || {};
        } catch { return storeCompany || {}; }
    });

    const [form, setForm] = useState({
        name: comp.name || "",
        email: comp.email || "",
        phone: comp.phone || "",
        address: comp.address || "",
        description: comp.description || "",
    });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type, visible: true });
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put("http://127.0.0.1:8000/api/company/profile", form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = res.data.company;
            localStorage.setItem("company", JSON.stringify(updated));
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
            const res = await axios.post("http://127.0.0.1:8000/api/company/logo", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            const updated = res.data.company;
            localStorage.setItem("company", JSON.stringify(updated));
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
            const res = await axios.delete("http://127.0.0.1:8000/api/company/logo", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = res.data.company;
            localStorage.setItem("company", JSON.stringify(updated));
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
    const logoUrl = comp.logo_path ? `http://127.0.0.1:8000/storage/${comp.logo_path}` : null;

    const inputStyle = {
        width: "100%", padding: "12px 14px", borderRadius: "10px",
        border: "1.5px solid #e2e8f0", fontSize: "14px", outline: "none",
        transition: "all 0.2s", fontFamily: "inherit"
    };

    const labelStyle = {
        display: "block", fontSize: "12px", fontWeight: "700",
        color: "#64748b", marginBottom: "6px", textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.35s ease both; }
                input:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; }
            `}</style>

            <aside style={{ width: "250px", flexShrink: 0, background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, padding: "20px 12px", gap: "4px" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px 20px", textDecoration: "none" }}>
                    <img src="/assets/images/logo.png" alt="Logo" style={{ height: "46px", objectFit: "contain" }} />
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
                </Link>

                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 4px", textTransform: "uppercase" }}>Main Menu</p>
                {navItems.map(n => <SideItem key={n.label} {...n} active={false} onClick={() => navigate(n.path)} />)}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "12px 8px" }} />
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "0px 14px 4px", textTransform: "uppercase" }}>Others</p>
                {navItems2.map(n => <SideItem key={n.label} {...n} active={true} onClick={() => navigate(n.path)} />)}

                <div style={{ flex: 1 }} />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#fff" }}>{initials}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyName}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>Admin</div>
                    </div>
                    <button
                        onClick={() => setLogoutModalOpen(true)}
                        title="Logout"
                        style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px", borderRadius: "6px", transition: "all 0.2s", display: "flex" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                    >
                        <IC.Logout />
                    </button>
                </div>
            </aside>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", gap: 16 }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Settings</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Company Profile</span>
                    </div>
                </header>

                <main style={{ padding: "40px 48px", flex: 1, textAlign: "left" }} className="fade-in">
                    <div style={{ maxWidth: "100%", paddingRight: "40px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "40px" }}>
                            <div style={{ flexShrink: 0 }}>
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" style={{ width: "110px", height: "110px", borderRadius: "24px", objectFit: "cover", border: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.04)" }} />
                                ) : (
                                    <div style={{ width: "110px", height: "110px", borderRadius: "24px", background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "800", color: "#fff", boxShadow: "0 8px 20px rgba(74, 158, 255, 0.2)" }}>{initials}</div>
                                )}
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                                    <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>{companyName} Profile</h2>
                                    <div style={{ position: "relative" }}>
                                        <button 
                                            onClick={() => setShowLogoMenu(!showLogoMenu)}
                                            style={{ background: "#f1f5f9", border: "none", padding: "6px 14px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "700", color: "#475569", cursor: "pointer", transition: "0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
                                        >
                                            Change Logo
                                            <span style={{ fontSize: "10px", color: "#94a3b8", transform: showLogoMenu ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }}>▼</span>
                                        </button>

                                        {showLogoMenu && (
                                            <>
                                                <div 
                                                    style={{ position: "fixed", inset: 0, zIndex: 100 }} 
                                                    onClick={() => setShowLogoMenu(false)} 
                                                />
                                                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: "200px", background: "#fff", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", padding: "6px", zIndex: 101, animation: "fadeIn 0.2s ease" }}>
                                                    <button 
                                                        onClick={() => { fileInpRef.current.click(); setShowLogoMenu(false); }}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "none", background: "none", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                                    >
                                                        <IC.Camera /> Upload Logo
                                                    </button>
                                                    <button 
                                                        onClick={() => { 
                                                            if (!logoUrl) {
                                                                showToast("No logo detected to remove", "error");
                                                            } else {
                                                                handleRemoveLogo();
                                                            }
                                                            setShowLogoMenu(false); 
                                                        }}
                                                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "none", background: "none", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                                    >
                                                        <IC.Trash /> Remove Logo
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Manage your official brand identity and profile image.</p>
                                <input type="file" ref={fileInpRef} hidden accept="image/*" onChange={handleLogoUpload} />
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>Company Name</label>
                                <input 
                                    style={{ ...inputStyle, background: "#fff" }} 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                    placeholder="e.g. Acme Corporation" 
                                    required 
                                />
                            </div>
                            <div>
                                <label style={labelStyle}><IC.Mail /> Contact Email</label>
                                <input 
                                    style={{ ...inputStyle, background: "#fff" }} 
                                    type="email" 
                                    value={form.email} 
                                    onChange={e => setForm({...form, email: e.target.value})} 
                                    placeholder="hr@company.com" 
                                    required 
                                />
                            </div>
                            <div>
                                <label style={labelStyle}><IC.Phone /> Phone Number</label>
                                <input 
                                    style={{ ...inputStyle, background: "#fff" }} 
                                    value={form.phone} 
                                    onChange={e => setForm({...form, phone: e.target.value})} 
                                    placeholder="+62..." 
                                />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}><IC.Map /> Headquarter Address</label>
                                <input 
                                    style={{ ...inputStyle, background: "#fff" }} 
                                    value={form.address} 
                                    onChange={e => setForm({...form, address: e.target.value})} 
                                    placeholder="Full address..." 
                                />
                            </div>
                            <div style={{ gridColumn: "span 2" }}>
                                <label style={labelStyle}>About Company (Bio)</label>
                                <textarea 
                                    style={{ ...inputStyle, background: "#fff", minHeight: "130px", resize: "vertical" }} 
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})} 
                                    placeholder="Brief description of your company..." 
                                />
                            </div>
                            <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-start", marginTop: "12px" }}>
                                <button 
                                    disabled={loading} 
                                    type="submit" 
                                    style={{ 
                                        padding: "12px 36px", borderRadius: "12px", border: "none", 
                                        background: "#3b82f6", color: "#fff", fontWeight: "700", 
                                        fontSize: "14px", cursor: "pointer", transition: "all 0.2s", 
                                        opacity: loading ? 0.7 : 1, boxShadow: "0 6px 16px rgba(59, 130, 246, 0.25)" 
                                    }}
                                >
                                    {loading ? "Saving Changes..." : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 320, textAlign: "left" }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Sign Out?</h3>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                            <button onClick={async () => { await logout(); navigate("/", { replace: true }); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
                        </div>
                    </div>
                </div>
            )}
            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}
