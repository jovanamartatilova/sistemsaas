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
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Mail: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    Shield: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    Trash: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() {
    return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Components ────────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, badge, onClick }) {
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

function SummaryCard({ title, value, sub, icon, iconBg, iconColor }) {
    return (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginTop: "2px" }}>{title}</div>
            <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "4px" }}>{sub}</div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagement() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();
    const [company, setCompany] = useState(null);
    const [activeNav, setActiveNav] = useState("User Management");
    const [activeTab, setActiveTab] = useState("team"); // 'team' or 'candidate'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", role: "staff" });
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("company");
        if (stored) {
            try { setCompany(JSON.parse(stored)); } catch (_) { }
        }
        if (token) fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8000/api/company-users?type=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Fetched users:", res.data);
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteError("");
        setInviteSuccess(false);
        
        try {
            setInviteLoading(true);
            const res = await axios.post("http://localhost:8000/api/company-users", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setInviteSuccess(true);
            setFormData({ name: "", email: "", role: "staff" });
            
            // Auto close after 3 seconds
            setTimeout(() => {
                setIsAddModalOpen(false);
                setInviteSuccess(false);
            }, 2500);
            
            fetchUsers();
        } catch (err) {
            setInviteError(err.response?.data?.message || "Failed to invite user");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this user?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/company-users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const teamUsers = users.filter(u => ['admin', 'hr', 'mentor', 'staff'].includes(u.role));
    const candidateUsers = users.filter(u => u.role === 'candidate');
    const pendingTeam = teamUsers.filter(u => !u.is_active);

    const displayUsers = activeTab === 'team' ? teamUsers : candidateUsers;
    const filteredUsers = displayUsers.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const companyName = company?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();

    const SIDEBAR_W = 250;
    const TOPBAR_H = 56;

    const navItems = [
        { label: "Dashboard", icon: <IC.Dashboard />, path: "/dashboard", section: "MAIN MENU" },
        { label: "User Management", icon: <IC.Users />, path: "/users", badge: 0 },
        { label: "Program Management", icon: <IC.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <IC.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Settings", icon: <IC.Pengaturan />, path: "/settings" },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.3s ease both; }
            `}</style>

            {/* SIDEBAR */}
            <aside style={{ width: SIDEBAR_W, flexShrink: 0, background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, padding: "20px 12px", gap: "4px" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px 20px", textDecoration: "none" }}>
                    <img src="/assets/images/logo.png" alt="Logo" style={{ height: "46px" }} />
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
                </Link>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 4px", textTransform: "uppercase" }}>Main Menu</p>
                {navItems.map((n) => (
                    <SideItem key={n.label} icon={n.icon} label={n.label} active={activeNav === n.label} onClick={() => { if (n.path !== "/users") navigate(n.path); }} />
                ))}

                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "12px 8px" }} />
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "0px 14px 4px", textTransform: "uppercase" }}>
                    Others
                </p>
                {navItems2.map((n) => (
                    <SideItem key={n.label} icon={n.icon} label={n.label} active={activeNav === n.label} onClick={() => navigate(n.path)} />
                ))}

                <div style={{ flex: 1 }} />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    {company?.logo_path ? (
                        <img 
                            src={`http://127.0.0.1:8000/storage/${company.logo_path}`} 
                            alt="Logo" 
                            style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} 
                        />
                    ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#fff" }}>{initials}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{company?.role || "Admin"}</div>
                    </div>
                    <button onClick={() => setLogoutModalOpen(true)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px" }}><IC.Logout /></button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ height: TOPBAR_H, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>User Management</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>{activeTab === 'team' ? 'Internal Team' : 'Candidates'}</span>
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>{today()}</div>
                </header>

                <main style={{ padding: "28px", flex: 1 }} className="fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
                        <div style={{ textAlign: "left" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>User Management</h2>
                            <p style={{ fontSize: "13.5px", color: "#64748b", marginTop: "4px" }}>Manage your internal team members and view candidates list.</p>
                        </div>
                        {activeTab === 'team' && (
                            <button onClick={() => setIsAddModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#2563c4", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}>
                                <IC.Plus /> Invite Team Member
                            </button>
                        )}
                    </div>

                    {/* STAT CARDS */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "32px", width: "100%" }}>
                        <SummaryCard title="Total Team Members" value={teamUsers.length} sub="HR, Mentors, and Staff" icon={<IC.Users />} iconBg="#eff6ff" iconColor="#3b82f6" />
                        <SummaryCard title="Total Candidates" value={candidateUsers.length} sub="Applicants across all programs" icon={<IC.Mail />} iconBg="#f0fdf4" iconColor="#16a34a" />
                        <SummaryCard title="Pending Invitations" value={pendingTeam.length} sub="Waiting for account activation" icon={<IC.Bell />} iconBg="#fffbeb" iconColor="#d97706" />
                    </div>

                    {/* TABS */}
                    <div style={{ display: "flex", gap: "0px", borderBottom: "1px solid #e2e8f0", marginBottom: "24px", width: "100%" }}>
                        <button onClick={() => setActiveTab('team')} style={{ padding: "12px 20px 12px 0px", fontSize: "14px", fontWeight: "700", border: "none", background: "none", color: activeTab === 'team' ? "#2563c4" : "#94a3b8", cursor: "pointer", borderBottom: activeTab === 'team' ? "2px solid #2563c4" : "2px solid transparent", transition: "0.2s" }}>Internal Team</button>
                        <button onClick={() => setActiveTab('candidate')} style={{ padding: "12px 20px", fontSize: "14px", fontWeight: "700", border: "none", background: "none", color: activeTab === 'candidate' ? "#2563c4" : "#94a3b8", cursor: "pointer", borderBottom: activeTab === 'candidate' ? "2px solid #2563c4" : "2px solid transparent", transition: "0.2s" }}>Candidates</button>
                        <div style={{ flex: 1 }} />
                        {/* Search bar specifically for the table */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0 12px", height: "36px", width: "240px", marginBottom: "8px" }}>
                            <IC.Search />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ border: "none", outline: "none", fontSize: "12.5px", width: "100%", background: "transparent" }} />
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>User Info</th>
                                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Role</th>
                                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Loading data...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No users found matching your search.</td></tr>
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id_user} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" }}>{u.name.slice(0, 2).toUpperCase()}</div>
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{u.name}</div>
                                                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: "#475569", textTransform: "capitalize" }}>
                                                <IC.Shield /> {u.role}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: u.is_active ? "#f0fdf4" : "#fff7ed", color: u.is_active ? "#16a34a" : "#d97706", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", border: `1px solid ${u.is_active ? "#bbf7d0" : "#fed7aa"}` }}>
                                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                                                {u.is_active ? "Active" : "Invited"}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                            <button onClick={() => handleDelete(u.id_user)} style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "6px", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#ef4444"} onMouseLeave={e => e.currentTarget.style.color = "#cbd5e1"}><IC.Trash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* INVITE MODAL */}
            {isAddModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                    <form onSubmit={handleInvite} className="fade-in" style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,.18)", textAlign: "left" }}>
                        {inviteSuccess ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>✓ Invitation Sent!</div>
                                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                                    Activation email has been sent to <strong>{formData.email}</strong>
                                </p>
                                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
                                    Staff will receive an email with an activation link to set their password and activate their account.
                                </p>
                                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#15803d" }}>
                                    <strong>Role:</strong> {formData.role} | <strong>Email:</strong> {formData.email}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>Invite Team Member</div>
                                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
                                    Activation email with token link will be sent to the staff member.
                                </p>

                                {inviteError && (
                                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "12px", color: "#991b1b" }}>
                                        {inviteError}
                                    </div>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Full Name</label>
                                        <input 
                                            required 
                                            type="text" 
                                            value={formData.name} 
                                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                            placeholder="Enter name" 
                                            disabled={inviteLoading}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", opacity: inviteLoading ? 0.6 : 1, cursor: inviteLoading ? "not-allowed" : "text" }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Email Address</label>
                                        <input 
                                            required 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                            placeholder="Enter email" 
                                            disabled={inviteLoading}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", opacity: inviteLoading ? 0.6 : 1, cursor: inviteLoading ? "not-allowed" : "text" }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Assign Role</label>
                                        <select 
                                            value={formData.role} 
                                            onChange={e => setFormData({ ...formData, role: e.target.value })} 
                                            disabled={inviteLoading}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", opacity: inviteLoading ? 0.6 : 1, cursor: inviteLoading ? "not-allowed" : "pointer" }}
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="hr">HR Specialist</option>
                                            <option value="mentor">Mentor</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            setInviteError("");
                                        }} 
                                        disabled={inviteLoading}
                                        style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: "700", cursor: inviteLoading ? "not-allowed" : "pointer", opacity: inviteLoading ? 0.6 : 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={inviteLoading}
                                        style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: inviteLoading ? "#94a3b8" : "#2563c4", color: "#fff", fontWeight: "700", cursor: inviteLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                    >
                                        {inviteLoading ? (
                                            <>
                                                <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid #fff", borderRadius: "50%", borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Invitation"
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            )}

            {/* Logout confirm */}
            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, textAlign: "left" }}>
                        <div style={{ color: "#3b82f6", marginBottom: 16 }}><IC.Users /></div>
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
