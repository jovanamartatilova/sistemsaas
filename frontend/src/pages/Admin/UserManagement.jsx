import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
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
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Plus: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Link: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    ),
    Copy: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    ),
    Share: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    ),
    Eye: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    EyeOff: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    Trash: () => (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    Shield: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    Check: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
};

function today() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, badge, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                display: "flex", alignItems: "center", gap: "11px", width: "100%",
                padding: "10px 14px", borderRadius: "10px",
                background: active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
                border: active ? "1px solid rgba(74,158,255,0.22)" : "1px solid transparent",
                color: active ? "#4a9eff" : "rgba(255,255,255,0.6)",
                fontSize: "13.5px", fontWeight: active ? "600" : "500",
                cursor: "pointer", transition: "all 0.2s", textAlign: "left",
            }}>
            <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge != null && badge > 0 && (
                <span style={{ background: "#4a9eff", color: "#fff", borderRadius: "100px", fontSize: "11px", fontWeight: "700", padding: "1px 7px" }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

// ── Stat Card — same style as DashboardPage StatCard ─────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, barColors }) {
    return (
        <div style={{
            background: "#fff", borderRadius: "16px", padding: "22px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
            flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "6px", minWidth: 0,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", letterSpacing: "-1px", marginTop: "8px" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{title}</div>
            {barColors && (
                <div style={{ display: "flex", gap: "3px", marginTop: "10px", alignItems: "flex-end", height: "28px" }}>
                    {barColors.map((c, i) => (
                        <div key={i} style={{ flex: 1, background: c, borderRadius: "3px 3px 0 0", height: `${30 + Math.sin(i) * 20}%`, opacity: 0.4, minHeight: "4px" }} />
                    ))}
                </div>
            )}
            {sub && <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>{sub}</div>}
        </div>
    );
}

// ── Copied Toast ──────────────────────────────────────────────────────────────
function CopiedToast({ show }) {
    return (
        <div style={{
            position: "fixed", bottom: "28px", left: "50%", transform: `translateX(-50%) translateY(${show ? 0 : "12px"})`,
            background: "#1e293b", color: "#fff", padding: "10px 20px", borderRadius: "10px",
            fontSize: "13px", fontWeight: "600", opacity: show ? 1 : 0,
            transition: "all 0.25s ease", zIndex: 9999, pointerEvents: "none",
            display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}>
            <IC.Check /> Copied to clipboard
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagement() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();

    const [company, setCompany] = useState(null);
    const [activeTab, setActiveTab] = useState("codes"); // 'codes' | 'staff'
    const [search, setSearch] = useState("");
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [createdCode, setCreatedCode] = useState(null);
    const [copiedToast, setCopiedToast] = useState(false);

    // Data
    const [invitationCodes, setInvitationCodes] = useState([]);
    const [codesLoading, setCodesLoading] = useState(false);
    const [staffUsers, setStaffUsers] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [roles, setRoles] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        label: "", id_role: "", division: "", position: "",
        employee_status: "intern", schedule: "", job_level: "",
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchCodes = async () => {
        if (!token) return;
        try {
            setCodesLoading(true);
            const res = await axios.get("http://localhost:8000/api/company/invitation-codes", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitationCodes(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch codes:", err);
        } finally {
            setCodesLoading(false);
        }
    };

    const fetchStaff = async () => {
        if (!token) return;
        try {
            setStaffLoading(true);
            const res = await axios.get("http://localhost:8000/api/company-users?type=all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch staff:", err);
        } finally {
            setStaffLoading(false);
        }
    };

    const fetchRoles = async () => {
        if (!token) return;
        try {
            const res = await axios.get("http://localhost:8000/api/company/roles", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("company");
        if (stored) { try { setCompany(JSON.parse(stored)); } catch (_) { } }
        if (token) { fetchCodes(); fetchStaff(); fetchRoles(); }
    }, [token]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
    };

    const activationLink = (code) => `${window.location.origin}/activate?code=${code}`;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCreateCode = async (e) => {
        e.preventDefault();
        setFormError("");
        try {
            setFormLoading(true);
            const res = await axios.post("http://localhost:8000/api/company/invitation-codes", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreatedCode(res.data.invitation);
            setModalSuccess(true);
            setFormData({ label: "", id_role: "", division: "", position: "", employee_status: "intern", schedule: "", job_level: "" });
            fetchCodes();
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create invitation code.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleCode = async (id) => {
        try {
            await axios.patch(`http://localhost:8000/api/company/invitation-codes/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCodes();
        } catch (err) { alert("Failed to update status."); }
    };

    const handleDeleteCode = async (id) => {
        if (!window.confirm("Delete this invitation code?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/company/invitation-codes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCodes();
        } catch (err) { alert("Failed to delete."); }
    };

    const handleDeleteStaff = async (userId) => {
        if (!window.confirm("Remove this user?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/company-users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStaff();
        } catch (err) { alert("Failed to remove user."); }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalSuccess(false);
        setCreatedCode(null);
        setFormError("");
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const filteredStaff = staffUsers.filter(u =>
        ['admin', 'hr', 'mentor', 'staff', 'employee'].includes(u.role) &&
        (u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()))
    );
    const filteredCodes = invitationCodes.filter(c =>
        c.label?.toLowerCase().includes(search.toLowerCase()) ||
        c.code?.toLowerCase().includes(search.toLowerCase())
    );

    const activeCodes = invitationCodes.filter(c => c.is_active).length;
    const activeStaff = staffUsers.filter(u =>
        ['admin', 'hr', 'mentor', 'staff', 'employee'].includes(u.role) && u.is_active
    ).length;

    const companyName = company?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();
    const SIDEBAR_W = 250;

    const navItems = [
        { label: "Dashboard", icon: <IC.Dashboard />, path: "/dashboard" },
        { label: "User Management", icon: <IC.Users />, path: "/users" },
        { label: "Program Management", icon: <IC.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <IC.Program />, path: "/positions" },
    ];
    const navItems2 = [{ label: "Settings", icon: <IC.Pengaturan />, path: "/settings" }];

    const roleColor = (role) => {
        const m = { admin: "#7c3aed", hr: "#2563c4", mentor: "#0891b2", employee: "#16a34a", staff: "#64748b" };
        return m[role] || "#64748b";
    };
    const roleBg = (role) => {
        const m = { admin: "#f5f3ff", hr: "#eff6ff", mentor: "#ecfeff", employee: "#f0fdf4", staff: "#f8fafc" };
        return m[role] || "#f8fafc";
    };
    const roleBorder = (role) => {
        const m = { admin: "#ddd6fe", hr: "#bfdbfe", mentor: "#a5f3fc", employee: "#bbf7d0", staff: "#e2e8f0" };
        return m[role] || "#e2e8f0";
    };

    // ── Input style ───────────────────────────────────────────────────────────
    const inp = {
        width: "100%", padding: "10px 14px", borderRadius: "8px",
        border: "1.5px solid #e2e8f0", fontSize: "13.5px", outline: "none",
        color: "#1e293b", background: "#fff", fontFamily: "'Poppins', sans-serif",
        transition: "border-color 0.2s",
    };
    const inpFocus = { borderColor: "#2563c4" };
    const lbl = { display: "block", fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px" };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.3s ease both; }
                input:focus, select:focus { border-color: #2563c4 !important; box-shadow: 0 0 0 3px rgba(37,99,196,0.08); }
                .code-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
                .staff-row:hover { background: #f8fafc !important; }
                .icon-btn:hover { background: #f1f5f9 !important; color: #475569 !important; }
                .icon-btn-red:hover { background: #fef2f2 !important; color: #ef4444 !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
            <aside style={{
                width: SIDEBAR_W, flexShrink: 0,
                background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)",
                display: "flex", flexDirection: "column", height: "100vh",
                position: "sticky", top: 0, padding: "20px 12px", gap: "4px",
            }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px 20px", textDecoration: "none" }}>
                    <img src="/assets/images/logo.png" alt="Logo" style={{ height: "46px" }} />
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
                </Link>

                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 4px", textTransform: "uppercase" }}>Main Menu</p>
                {navItems.map((n) => (
                    <SideItem key={n.label} icon={n.icon} label={n.label} active={n.label === "User Management"}
                        onClick={() => { if (n.path !== "/users") navigate(n.path); }} />
                ))}

                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "12px 8px" }} />
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "0 14px 4px", textTransform: "uppercase" }}>Others</p>
                {navItems2.map((n) => (
                    <SideItem key={n.label} icon={n.icon} label={n.label} active={false} onClick={() => navigate(n.path)} />
                ))}

                <div style={{ flex: 1 }} />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    {company?.logo_path ? (
                        <img src={`http://127.0.0.1:8000/storage/${company.logo_path}`} alt="Logo"
                            style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#fff" }}>{initials}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{company?.role || "Admin"}</div>
                    </div>
                    <button onClick={() => setLogoutModalOpen(true)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px", borderRadius: "6px" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}>
                        <IC.Logout />
                    </button>
                </div>
            </aside>

            {/* ── MAIN ─────────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                {/* Topbar */}
                <header style={{ height: "56px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>User Management</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>{activeTab === "codes" ? "Invitation Codes" : "Invited Staff"}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{today()}</span>
                </header>

                {/* Body */}
                <main style={{ flex: 1, padding: "28px", overflowY: "auto" }} className="fade-in">

                    {/* Page header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
                        <div>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>User Management</h2>
                            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Manage invitation codes and monitor invited team members.</p>
                        </div>
                        {activeTab === "codes" && (
                            <button onClick={() => { setIsModalOpen(true); setModalSuccess(false); setCreatedCode(null); setFormError(""); }}
                                style={{ display: "flex", alignItems: "center", gap: "8px", background: "#2563c4", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
                                <IC.Plus /> Create Invitation Code
                            </button>
                        )}
                    </div>

                    {/* Stat Cards — same style as dashboard */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "28px" }}>
                        <StatCard
                            icon={<IC.Link />} iconBg="#eff6ff" iconColor="#3b82f6"
                            title="Total Codes" value={invitationCodes.length}
                            sub="All invitation codes created"
                            barColors={["#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6", "#60a5fa", "#93c5fd", "#3b82f6"]}
                        />
                        <StatCard
                            icon={<IC.Eye />} iconBg="#f0fdf4" iconColor="#16a34a"
                            title="Active Codes" value={activeCodes}
                            sub="Currently active & usable"
                            barColors={["#4ade80", "#86efac", "#4ade80", "#86efac", "#4ade80", "#bbf7d0", "#4ade80"]}
                        />
                        <StatCard
                            icon={<IC.Users />} iconBg="#fffbeb" iconColor="#d97706"
                            title="Invited Staff" value={staffUsers.filter(u => ['admin', 'hr', 'mentor', 'staff', 'employee'].includes(u.role)).length}
                            sub="Total team members joined"
                            barColors={["#fbbf24", "#fde68a", "#f59e0b", "#fbbf24", "#fde68a", "#f59e0b", "#fbbf24"]}
                        />
                        <StatCard
                            icon={<IC.Bell />} iconBg="#fff1f2" iconColor="#e11d48"
                            title="Active Staff" value={activeStaff}
                            sub="Active accounts in team"
                            barColors={["#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fca5a5", "#f87171", "#fca5a5"]}
                        />
                    </div>

                    {/* Dual Tab */}
                    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #e2e8f0", marginBottom: "24px" }}>
                        {[
                            { key: "codes", label: "Invitation Codes", count: invitationCodes.length, icon: <IC.Link /> },
                            { key: "staff", label: "Invited Staff", count: staffUsers.filter(u => ['admin', 'hr', 'mentor', 'staff', 'employee'].includes(u.role)).length, icon: <IC.Users /> },
                        ].map(t => (
                            <button key={t.key} onClick={() => { setActiveTab(t.key); setSearch(""); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "12px 20px 12px 0", marginRight: "20px",
                                    fontSize: "14px", fontWeight: "700", border: "none", background: "none",
                                    color: activeTab === t.key ? "#2563c4" : "#94a3b8",
                                    borderBottom: activeTab === t.key ? "2px solid #2563c4" : "2px solid transparent",
                                    cursor: "pointer", transition: "all 0.2s",
                                }}>
                                <span style={{ opacity: activeTab === t.key ? 1 : 0.6 }}>{t.icon}</span>
                                {t.label}
                                <span style={{
                                    fontSize: "11px", fontWeight: "700", padding: "1px 7px", borderRadius: "100px",
                                    background: activeTab === t.key ? "#eff6ff" : "#f1f5f9",
                                    color: activeTab === t.key ? "#2563c4" : "#94a3b8",
                                }}>{t.count}</span>
                            </button>
                        ))}
                        <div style={{ flex: 1 }} />
                        {/* Search */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 12px", height: "36px", width: "240px", marginBottom: "4px" }}>
                            <IC.Search />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder={activeTab === "codes" ? "Search codes..." : "Search staff..."}
                                style={{ border: "none", outline: "none", fontSize: "12.5px", width: "100%", background: "transparent", fontFamily: "'Poppins', sans-serif" }} />
                        </div>
                    </div>

                    {/* ── TAB: INVITATION CODES ── */}
                    {activeTab === "codes" && (
                        <div>
                            {codesLoading ? (
                                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
                                    <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2.5px solid #e2e8f0", borderTopColor: "#2563c4", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                    <p style={{ marginTop: "12px", fontSize: "13px" }}>Loading codes...</p>
                                </div>
                            ) : filteredCodes.length === 0 ? (
                                <div style={{ background: "#fff", borderRadius: "16px", padding: "60px", textAlign: "center", border: "1.5px dashed #e2e8f0" }}>
                                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#cbd5e1" }}>
                                        <IC.Link />
                                    </div>
                                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>No invitation codes yet</p>
                                    <p style={{ fontSize: "13px", color: "#94a3b8" }}>Click "Create Invitation Code" to generate your first code.</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {filteredCodes.map(ic => (
                                        <div key={ic.id_invitation} className="code-card"
                                            style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                                            <div style={{ padding: "18px 22px 14px" }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                                    {/* Active dot */}
                                                    <div style={{ marginTop: "6px", width: "8px", height: "8px", borderRadius: "50%", background: ic.is_active ? "#22c55e" : "#cbd5e1", flexShrink: 0 }} />

                                                    {/* Info */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{ic.label}</span>
                                                            <span style={{
                                                                fontSize: "11px", fontWeight: "700", padding: "2px 9px", borderRadius: "6px",
                                                                background: ic.is_active ? "#f0fdf4" : "#f8fafc",
                                                                color: ic.is_active ? "#16a34a" : "#94a3b8",
                                                                border: `1px solid ${ic.is_active ? "#bbf7d0" : "#e2e8f0"}`,
                                                            }}>{ic.is_active ? "Active" : "Inactive"}</span>
                                                        </div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                                                            <span style={{ fontSize: "28px", fontWeight: "900", color: ic.is_active ? "#2563c4" : "#94a3b8", letterSpacing: "5px", fontFamily: "monospace" }}>
                                                                {ic.code}
                                                            </span>
                                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                                {ic.division && <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#64748b", borderRadius: "6px", padding: "2px 9px", fontWeight: "600" }}>{ic.division}</span>}
                                                                {ic.position && <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#64748b", borderRadius: "6px", padding: "2px 9px", fontWeight: "600" }}>{ic.position}</span>}
                                                                {ic.employee_status && <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#64748b", borderRadius: "6px", padding: "2px 9px", fontWeight: "600", textTransform: "capitalize" }}>{ic.employee_status}</span>}
                                                                {ic.job_level && <span style={{ fontSize: "11px", background: "#f1f5f9", color: "#64748b", borderRadius: "6px", padding: "2px 9px", fontWeight: "600" }}>{ic.job_level}</span>}
                                                            </div>
                                                        </div>

                                                        <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "6px" }}>
                                                            Created {new Date(ic.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>

                                                    {/* Action buttons */}
                                                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                                        {[
                                                            { title: "Copy code", icon: <IC.Copy />, action: () => copyToClipboard(ic.code) },
                                                            { title: "Copy link", icon: <IC.Share />, action: () => copyToClipboard(activationLink(ic.code)) },
                                                            { title: ic.is_active ? "Deactivate" : "Activate", icon: ic.is_active ? <IC.EyeOff /> : <IC.Eye />, action: () => handleToggleCode(ic.id_invitation) },
                                                        ].map((btn, i) => (
                                                            <button key={i} onClick={btn.action} title={btn.title} className="icon-btn"
                                                                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                                                                {btn.icon}
                                                            </button>
                                                        ))}
                                                        <button onClick={() => handleDeleteCode(ic.id_invitation)} title="Delete" className="icon-btn-red"
                                                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fff", color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                                                            <IC.Trash />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Link bar */}
                                            <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 22px 10px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                                    <span style={{ color: "#cbd5e1", flexShrink: 0 }}><IC.Link /></span>
                                                    <span style={{ fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {activationLink(ic.code)}
                                                    </span>
                                                </div>
                                                <button onClick={() => copyToClipboard(activationLink(ic.code))}
                                                    style={{ fontSize: "12px", fontWeight: "700", color: "#2563c4", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", padding: "0 0 0 12px" }}>
                                                    Copy URL
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: INVITED STAFF ── */}
                    {activeTab === "staff" && (
                        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                        {["Staff Info", "Role", "Status", "Joined", "Actions"].map((h, i) => (
                                            <th key={h} style={{ padding: "14px 20px", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffLoading ? (
                                        <tr><td colSpan="5" style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                            <div style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTopColor: "#2563c4", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                        </td></tr>
                                    ) : filteredStaff.length === 0 ? (
                                        <tr><td colSpan="5" style={{ padding: "60px", textAlign: "center" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                                <div style={{ color: "#cbd5e1" }}><IC.Users /></div>
                                                <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>No staff members found</p>
                                                <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0 }}>Team members will appear after they activate their account.</p>
                                            </div>
                                        </td></tr>
                                    ) : filteredStaff.map((u, idx) => (
                                        <tr key={u.id_user} className="staff-row" style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                                            <td style={{ padding: "14px 20px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", flexShrink: 0 }}>
                                                        {(u.name || "?").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#1e293b" }}>{u.name}</div>
                                                        <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 20px" }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: roleBg(u.role), color: roleColor(u.role), border: `1px solid ${roleBorder(u.role)}`, padding: "3px 10px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", textTransform: "capitalize" }}>
                                                    <IC.Shield /> {u.role}
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 20px" }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 10px", borderRadius: "6px", background: u.is_active ? "#f0fdf4" : "#fff7ed", color: u.is_active ? "#16a34a" : "#d97706", border: `1px solid ${u.is_active ? "#bbf7d0" : "#fed7aa"}` }}>
                                                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
                                                    {u.is_active ? "Active" : "Pending"}
                                                </div>
                                            </td>
                                            <td style={{ padding: "14px 20px", fontSize: "12.5px", color: "#64748b" }}>
                                                {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                            </td>
                                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                                <button onClick={() => handleDeleteStaff(u.id_user)} className="icon-btn-red"
                                                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fecaca", background: "#fff", color: "#fca5a5", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                                                    <IC.Trash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>

            {/* ── MODAL: CREATE INVITATION CODE ── */}
            {isModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.55)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <div className="fade-in" style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "480px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>

                        {modalSuccess && createdCode ? (
                            // ── Success State ──
                            <div style={{ padding: "36px 32px", textAlign: "center" }}>
                                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#22c55e" }}>
                                    <IC.Check />
                                </div>
                                <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Invitation Code Created!</div>
                                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "28px" }}>
                                    Share this code or link with team members you want to invite.
                                </p>

                                {/* Code box */}
                                <div style={{ background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: "14px", padding: "24px", marginBottom: "14px" }}>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "10px" }}>Invitation Code</div>
                                    <div style={{ fontSize: "36px", fontWeight: "900", color: "#2563c4", letterSpacing: "8px", fontFamily: "monospace", marginBottom: "14px" }}>
                                        {createdCode.code}
                                    </div>
                                    <button onClick={() => copyToClipboard(createdCode.code)}
                                        style={{ fontSize: "12px", fontWeight: "700", color: "#2563c4", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "7px", padding: "7px 16px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                                        Copy Code
                                    </button>
                                </div>

                                {/* Link box */}
                                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", textAlign: "left" }}>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Activation Link</div>
                                    <div style={{ fontSize: "12px", color: "#475569", wordBreak: "break-all", marginBottom: "10px", lineHeight: 1.6 }}>
                                        {activationLink(createdCode.code)}
                                    </div>
                                    <button onClick={() => copyToClipboard(activationLink(createdCode.code))}
                                        style={{ fontSize: "12px", fontWeight: "700", color: "#2563c4", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "7px", padding: "7px 16px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                                        Copy Link
                                    </button>
                                </div>

                                {/* Tags */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginBottom: "28px" }}>
                                    {createdCode.label && <span style={{ fontSize: "12px", background: "#eff6ff", color: "#2563c4", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "3px 10px", fontWeight: "600" }}>{createdCode.label}</span>}
                                    {createdCode.division && <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "3px 10px", fontWeight: "600" }}>{createdCode.division}</span>}
                                    {createdCode.position && <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "3px 10px", fontWeight: "600" }}>{createdCode.position}</span>}
                                    {createdCode.employee_status && <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "3px 10px", fontWeight: "600", textTransform: "capitalize" }}>{createdCode.employee_status}</span>}
                                </div>

                                <button onClick={closeModal}
                                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "#2563c4", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                                    Done
                                </button>
                            </div>
                        ) : (
                            // ── Form State ──
                            <>
                                {/* Modal Header */}
                                <div style={{ padding: "24px 28px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: "18px" }}>
                                    <div style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>Create Invitation Code</div>
                                    <p style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
                                        This code can be used by multiple people — like a WhatsApp group invite link.
                                    </p>
                                </div>

                                <form onSubmit={handleCreateCode} style={{ padding: "22px 28px 28px" }}>
                                    {formError && (
                                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "11px 14px", marginBottom: "18px", fontSize: "12.5px", color: "#991b1b" }}>
                                            {formError}
                                        </div>
                                    )}

                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        {/* Label */}
                                        <div>
                                            <label style={lbl}>Code Label <span style={{ color: "#ef4444" }}>*</span></label>
                                            <input required type="text" value={formData.label}
                                                onChange={e => setFormData({ ...formData, label: e.target.value })}
                                                placeholder="e.g. Intern Batch Q3 2025 – Engineering"
                                                style={inp} />
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <label style={lbl}>Role <span style={{ color: "#ef4444" }}>*</span></label>
                                            <select required value={formData.id_role}
                                                onChange={e => setFormData({ ...formData, id_role: e.target.value })}
                                                style={{ ...inp, color: formData.id_role ? "#1e293b" : "#94a3b8" }}>
                                                <option value="">Select a role...</option>
                                                {roles.map(r => (
                                                    <option key={r.id_role} value={r.id_role} style={{ color: "#1e293b" }}>{r.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Division + Position */}
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={lbl}>Division</label>
                                                <input type="text" value={formData.division}
                                                    onChange={e => setFormData({ ...formData, division: e.target.value })}
                                                    placeholder="e.g. Engineering" style={inp} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={lbl}>Position</label>
                                                <input type="text" value={formData.position}
                                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                                    placeholder="e.g. Backend Dev" style={inp} />
                                            </div>
                                        </div>

                                        {/* Employment Status + Job Level */}
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={lbl}>Employment Status</label>
                                                <select value={formData.employee_status}
                                                    onChange={e => setFormData({ ...formData, employee_status: e.target.value })}
                                                    style={inp}>
                                                    <option value="intern">Intern</option>
                                                    <option value="full_time">Full Time</option>
                                                    <option value="part_time">Part Time</option>
                                                    <option value="contract">Contract</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={lbl}>Job Level</label>
                                                <input type="text" value={formData.job_level}
                                                    onChange={e => setFormData({ ...formData, job_level: e.target.value })}
                                                    placeholder="e.g. Junior" style={inp} />
                                            </div>
                                        </div>

                                        {/* Schedule */}
                                        <div>
                                            <label style={lbl}>Work Schedule</label>
                                            <input type="text" value={formData.schedule}
                                                onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                                placeholder="e.g. WFO Mon–Fri" style={inp} />
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                                        <button type="button" onClick={closeModal}
                                            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: "700", fontSize: "13.5px", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={formLoading}
                                            style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: formLoading ? "#93c5fd" : "#2563c4", color: "#fff", fontWeight: "700", fontSize: "13.5px", cursor: formLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'Poppins', sans-serif" }}>
                                            {formLoading ? (
                                                <>
                                                    <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                                    Creating...
                                                </>
                                            ) : "Create Code"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── LOGOUT MODAL ── */}
            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "360px", textAlign: "left", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
                        <div style={{ color: "#3b82f6", marginBottom: "16px" }}><IC.Users /></div>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
                        <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>Are you sure you want to sign out from your account?</div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Cancel</button>
                            <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Yes, Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── COPIED TOAST ── */}
            <CopiedToast show={copiedToast} />
        </div>
    );
}