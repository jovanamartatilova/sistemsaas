import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import axios from "axios";

const S = {
    // sidebar
    sidebar: { width: 256, background: "#0f1c2e", minHeight: "100vh", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 100, boxShadow: "4px 0 24px rgba(0,0,0,.18)" },
    brand: { display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" },
    brandName: { fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" },
    sideLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", padding: "20px 20px 8px" },
    navItem: (active) => ({
        display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
        color: active ? "#fff" : "rgba(255,255,255,.55)", fontSize: 13.5, fontWeight: active ? 600 : 500,
        cursor: "pointer", transition: "all .18s", textDecoration: "none", margin: "1px 0",
        background: active ? "linear-gradient(90deg,rgba(59,130,246,.25) 0%,rgba(59,130,246,.08) 100%)" : "transparent",
        position: "relative", borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
    }),
    sideFooter: { marginTop: "auto", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.07)" },
    // main
    main: { marginLeft: 256, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" },
    topbar: { height: 64, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 28px", gap: 16, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,.06)" },
    // cards
    cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 18 },
};

const Icon = {
    Dashboard: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    Users: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    Program: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
    Lowongan: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></svg>,
    Laporan: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>,
    Pengaturan: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    Bell: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    Plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Filter: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    Save: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Send: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    Cal: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Logout: () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Lock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    ChevronRight: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>,
    FileText: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
};

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [y, m, d] = dateStr.split("-");
    const month = MONTHS[parseInt(m) - 1];
    return `${parseInt(d)} ${month} ${y}`;
};

function Toast({ msg, type, visible }) {
    return (
        <div style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 500,
            background: type === "success" ? "#064e3b" : "#0d1f3c",
            color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,.14)",
            transform: visible ? "translateY(0)" : "translateY(80px)",
            opacity: visible ? 1 : 0,
            transition: "all .3s cubic-bezier(.34,1.56,.64,1)",
            pointerEvents: "none",
        }}>{msg}</div>
    );
}

function ProgramCard({ program, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);

    return (
        <div
            onClick={() => onEdit(program)}
            style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, display: "flex", flexDirection: "column",
                boxShadow: hov ? "0 12px 32px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.06)", overflow: "hidden",
                transition: "all .2s ease", cursor: "pointer", position: "relative",
                borderTop: `3px solid ${program.vacancy_status === "published" ? "#10b981" : program.vacancy_status === "closed" ? "#ef4444" : "#94a3b8"}`
            }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        >
            <div style={{ width: "100%", height: 160, background: program.vacancy_photo ? `url(http://127.0.0.1:8000/storage/${program.vacancy_photo}) center/cover` : "#e2e8f0", position: "relative" }}>
                {program.vacancy_status === "draft" && <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#64748b", border: "1px solid rgba(0,0,0,0.1)" }}>DRAFT</div>}
                {program.vacancy_status === "published" && <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(59,130,246,0.15)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>PUBLISHED</div>}
                {program.vacancy_status === "closed" && <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(239,68,68,0.15)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>CLOSED</div>}
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(program); }} title="Edit"
                        style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#334155", transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#3b82f6"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#334155"; }}>
                        <Icon.Edit />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(program); }} title="Delete"
                        style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#334155", transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#334155"; }}>
                        <Icon.Trash />
                    </button>
                </div>
            </div>

            <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", textAlign: "left" }}>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: "#000", margin: 0 }}>
                    {program.position_name}
                </h3>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginTop: 4, marginBottom: 16 }}>
                    {program.vacancy_title} - Batch {program.vacancy_batch}
                </p>

                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#64748b", fontStyle: "italic" }}>
                        <Icon.Cal />
                        <span>{formatDate(program.vacancy_start_date || program.vacancy_deadline)} - {formatDate(program.vacancy_end_date || program.vacancy_deadline)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: 8, border: "1px solid #dbeafe" }}>
                            {program.position_quota || 0} Position Quota
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", padding: "4px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            {program.applicant_count || 0} Candidates
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgramModal({ open, program, onClose, onSubmit }) {
    const [activeTab, setActiveTab] = useState("detail");
    const [competencies, setCompetencies] = useState([{ name: "", learning_hours: "", description: "" }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) setActiveTab("detail");
        if (open && program) {
            fetchCompetencies();
        } else {
            setCompetencies([{ name: "", learning_hours: "", description: "" }]);
        }
    }, [open, program]);

    const fetchCompetencies = async () => {
        try {
            setLoading(true);
            const token = useAuthStore.getState().token;
            const res = await axios.get(`http://127.0.0.1:8000/api/programs/${program.id_position}/competencies`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.length > 0) {
                setCompetencies(res.data.map(c => ({ name: c.name, learning_hours: c.learning_hours, description: c.description })));
            }
        } catch (err) {
            console.error("Failed to fetch competencies:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => setCompetencies([...competencies, { name: "", learning_hours: "", description: "" }]);
    const handleRemove = (i) => setCompetencies(competencies.filter((_, idx) => idx !== i));
    const handleChange = (i, field, val) => {
        const next = [...competencies];
        next[i][field] = val;
        setCompetencies(next);
    };

    const handleSubmit = (status) => {
        const filled = competencies.filter(c => c.name && c.learning_hours);
        if (filled.length === 0) return alert("At least one competency must be filled with name and learning hours.");
        onSubmit(program.id_position, filled, status);
    };

    const inp = { textAlign: "left", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 13px", fontFamily: "inherit", fontSize: 13.5, color: "#0f172a", background: "#fff", outline: "none", width: "100%", transition: "all .15s" };
    const focusInp = (e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"; };
    const blurInp = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

    if (!open) return null;

    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.18)", margin: "auto 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "22px 28px 18px", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Edit Position Competencies</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Manage competencies, learning hours, and description for position {program?.position_name}.</div>
                    </div>
                    <button onClick={onClose} style={{ position: "absolute", top: 22, right: 28, width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
                </div>

                {program && (
                    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 28px", background: "#f8fafc" }}>
                        <button onClick={() => setActiveTab("detail")} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === "detail" ? "2.5px solid #2563c4" : "2.5px solid transparent", color: activeTab === "detail" ? "#2563c4" : "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "0.2s" }}>Competency Management</button>
                        <button onClick={() => setActiveTab("pelamar")} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === "pelamar" ? "2.5px solid #2563c4" : "2.5px solid transparent", color: activeTab === "pelamar" ? "#2563c4" : "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "0.2s" }}>Candidate List</button>
                    </div>
                )}

                {activeTab === "detail" ? (
                    <>
                        <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh", textAlign: "left" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                {competencies.map((c, i) => (
                                    <div key={i} style={{ border: "1px solid #e1e7ef", borderRadius: 12, padding: 20, position: "relative" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>Competency Name *</label>
                                                <input style={inp} value={c.name} onChange={e => handleChange(i, "name", e.target.value)} placeholder="e.g. Figma Basics" onFocus={focusInp} onBlur={blurInp} />
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>Learning Hours *</label>
                                                <input style={inp} type="number" value={c.learning_hours} onChange={e => handleChange(i, "learning_hours", e.target.value)} placeholder="e.g. 40" onFocus={focusInp} onBlur={blurInp} />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>Competency Description</label>
                                            <textarea style={{ ...inp, minHeight: 60, resize: "vertical" }} value={c.description} onChange={e => handleChange(i, "description", e.target.value)} placeholder="Provide a brief description of this competency…" onFocus={focusInp} onBlur={blurInp} />
                                        </div>
                                        <button onClick={() => competencies.length > 1 && handleRemove(i)}
                                            style={{ position: "absolute", top: -10, right: -10, width: 28, height: 28, borderRadius: "50%", border: "1px solid #fca5a5", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", fontSize: 14 }}>✕</button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleAdd}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "1.5px dashed #e2e8f0", borderRadius: 10, background: "transparent", fontFamily: "inherit", fontSize: 13, color: "#64748b", cursor: "pointer", marginTop: 24, transition: "all .15s", width: "100%", justifyContent: "center" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; e.currentTarget.style.background = "#eff6ff"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}>
                                <Icon.Plus /> Add Competency
                            </button>
                        </div>

                        <div style={{ padding: "18px 28px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Fields marked with <b style={{ color: "#ef4444" }}>*</b> are required.</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => handleSubmit("published")}
                                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#2563c4", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.25)", transition: "all .15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "#2563c4"; }}>
                                    <Icon.Save /> Save
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh" }}>
                        {(!program?.applicants || program.applicants.length === 0) ? (
                            <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div style={{ width: 80, height: 80, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", marginBottom: 20 }}>
                                    <Icon.Users />
                                </div>
                                {program?.vacancy_status === "draft" ? (
                                    <>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Cannot Receive Candidates</h3>
                                        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>Please <b>Publish</b> this program first so that candidates can see and apply for this position.</p>
                                    </>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>No Candidates Yet</h3>
                                        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>Currently there are no candidates who have submitted applications to this position.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {program.applicants.map((sub, idx) => (
                                    <CandidateItem key={sub.id_submission || idx} sub={sub} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function CandidateItem({ sub }) {
    const [expanded, setExpanded] = useState(false);
    const docBtn = { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all .15s", textDecoration: "none" };

    return (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: expanded ? "#f8fafc" : "#fff", transition: "all .2s" }}>
            <div onClick={() => setExpanded(!expanded)} style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                        {(sub.user?.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{sub.user?.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Email: <span style={{ color: "#2563c4", fontWeight: 600 }}>{sub.user?.email || "-"}</span></div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: sub.status === "accepted" ? "#ecfdf5" : sub.status === "rejected" ? "#fef2f2" : "#fff7ed", color: sub.status === "accepted" ? "#059669" : sub.status === "rejected" ? "#dc2626" : "#c2410c", border: `1px solid ${sub.status === "accepted" ? "#10b98133" : sub.status === "rejected" ? "#ef444433" : "#f9731633"}`, textTransform: "capitalize" }}>
                        {sub.status || "Pending"}
                    </span>
                    <div style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s", color: "#64748b" }}><Icon.ChevronRight /></div>
                </div>
            </div>
            {expanded && (
                <div style={{ padding: "0 20px 20px", marginTop: -4, textAlign: "left" }}>
                    <div style={{ height: 1.5, background: "#e2e8f0", marginBottom: 16, opacity: 0.5 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Candidate Documents</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {sub.cv_file && (
                            <a href={`http://127.0.0.1:8000/storage/${sub.cv_file}`} target="_blank" rel="noopener noreferrer" style={docBtn} onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                                <Icon.FileText /> CV / Resume
                            </a>
                        )}
                        {sub.portfolio_file && (
                            <a href={`http://127.0.0.1:8000/storage/${sub.portfolio_file}`} target="_blank" rel="noopener noreferrer" style={docBtn} onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                                <Icon.FileText /> Portfolio
                            </a>
                        )}
                        {sub.cover_letter_file && (
                            <a href={`http://127.0.0.1:8000/storage/${sub.cover_letter_file}`} target="_blank" rel="noopener noreferrer" style={docBtn} onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                                <Icon.FileText /> Cover Letter
                            </a>
                        )}
                        {sub.institution_letter_file && (
                            <a href={`http://127.0.0.1:8000/storage/${sub.institution_letter_file}`} target="_blank" rel="noopener noreferrer" style={docBtn} onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                                <Icon.FileText /> Reference Letter
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

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

export default function PositionsManagement() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [selectedProg, setSelectedProg] = useState(null);
    const [deletingProg, setDeletingProg] = useState(null);
    const [toast, setToast] = useState({ msg: "", type: "success", visible: false });

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/programs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrograms(res.data);
        } catch (err) {
            console.error("Failed to fetch programs:", err);
            showToast("Failed to fetch program data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const company = (() => { try { return JSON.parse(localStorage.getItem("company")); } catch { return null; } })();
    const companyName = company?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();
    const companyRole = company?.role || "Admin";

    const showToast = (msg, type = "success") => {
        setToast({ msg, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
    };

    const filtered = programs.filter(p => {
        const mf = filter === "all" || p.vacancy_status === filter;
        const ms = p.position_name.toLowerCase().includes(search.toLowerCase()) || p.vacancy_title.toLowerCase().includes(search.toLowerCase());
        return mf && ms;
    });

    const handleModalSubmit = async (id_position, competencies, status) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/programs/${id_position}/competencies`, { competencies, status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Competencies saved successfully.`);
            setModalOpen(false);
            setSelectedProg(null);
            fetchPrograms();
        } catch (err) {
            console.error("Failed to save competencies:", err);
            showToast("Failed to save competencies.", "error");
        }
    };

    const handleDelete = async (prog) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/programs/${prog.id_vacancy}/${prog.id_position}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Program successfully removed from vacancy.");
            fetchPrograms();
        } catch (err) {
            console.error("Failed to delete program:", err);
            showToast("Failed to delete program.", "error");
        }
    };

    const navItems = [
        { label: "Dashboard", icon: <Icon.Dashboard />, path: "/dashboard", section: "MAIN MENU" },
        { label: "User Management", icon: <Icon.Users />, path: "#", badge: 0 },
        { label: "Program Management", icon: <Icon.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <Icon.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Reports", icon: <Icon.Laporan />, path: "#", section: "OTHERS" },
        { label: "Settings", icon: <Icon.Pengaturan />, path: "#" },
    ];

    const SIDEBAR_W = 250;
    const TOPBAR_H = 56;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
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
                        active={n.label === "Positions Management"}
                        onClick={() => {
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
                        active={n.label === "Positions Management"}
                        onClick={() => {
                            if (n.path && n.path !== "#") navigate(n.path);
                        }}
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
                        onClick={() => setLogoutModalOpen(true)}
                        title="Logout"
                        style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px", borderRadius: "6px", transition: "all 0.2s", display: "flex" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                    >
                        <Icon.Logout />
                    </button>
                </div>
            </aside>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, position: "sticky", top: 0, zIndex: 50 }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Positions Management</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Competencies</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "7px 14px", width: 220 }}>
                        <Icon.Search />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: "100%" }} />
                    </div>
                </header>

                <main style={{ padding: 28, flex: 1, textAlign: "left" }}>
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Positions Management</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Manage competencies and learning hours for each position in active programs.</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
                        {[
                            { key: "all", label: "All", count: programs.length },
                            { key: "published", label: "Published", count: programs.filter(p => p.vacancy_status === "published").length },
                            { key: "draft", label: "Draft", count: programs.filter(p => p.vacancy_status === "draft").length },
                            { key: "closed", label: "Closed", count: programs.filter(p => p.vacancy_status === "closed").length }
                        ].map(t => (
                            <div key={t.key} onClick={() => setFilter(t.key)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${filter === t.key ? "#2563c4" : "#e2e8f0"}`, background: filter === t.key ? "#2563c4" : "#fff", color: filter === t.key ? "#fff" : "#64748b" }}>
                                {t.label} <span style={{ background: filter === t.key ? "rgba(255,255,255,.25)" : "#f8fafc", borderRadius: 10, padding: "1px 6px", fontSize: 11, marginLeft: 4 }}>{t.count}</span>
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "40px" }}>Loading programs...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <div style={{ color: "#cbd5e1", marginBottom: 16 }}><Icon.Program /></div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>No programs yet</h3>
                            <p style={{ fontSize: 13, color: "#64748b" }}>Positions you add in Program Management will automatically appear here.</p>
                        </div>
                    ) : (
                        <div style={S.cardGrid}>
                            {filtered.map((p, i) => (
                                <ProgramCard key={i} program={p} onEdit={(prog) => { setSelectedProg(prog); setModalOpen(true); }} onDelete={(prog) => setDeletingProg(prog)} />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <ProgramModal open={modalOpen} program={selectedProg} onClose={() => { setModalOpen(false); setSelectedProg(null); }} onSubmit={handleModalSubmit} />

            {deletingProg && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, textAlign: "left" }}>
                        <div style={{ color: "#ef4444", marginBottom: 16 }}><Icon.Trash /></div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Remove Position from Program?</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>This action will remove this position from the program <b>{deletingProg.vacancy_title}</b>. Global competencies for this position will remain.</div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setDeletingProg(null)} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { handleDelete(deletingProg); setDeletingProg(null); }} style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, textAlign: "left" }}>
                        <div style={{ color: "#3b82f6", marginBottom: 16 }}><Icon.Users /></div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Sign Out?</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>Are you sure you want to sign out from your company account?</div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#ef4444", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}
