import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

// ── Icons ────────────────────────────────────────────────────────
const Icon = {
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
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
    Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    Plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Cal: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    ChevronRight: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>,
    FileText: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    Sparkles: () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
};

// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [y, m, d] = dateStr.split("-");
    const month = MONTHS[parseInt(m) - 1];
    return `${parseInt(d)} ${month} ${y}`;
};

// ── Components ────────────────────────────────────────────────────
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

function SectionTitle({ children, style }) {
    return (
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "#64748b", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, ...style }}>
            {children}
            <div style={{ flex: 1, height: 1, background: "#e2e8f0", opacity: 0.7 }} />
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
                            <a href={`http://127.0.0.1:8000/storage/${sub.cv_file}`} target="_blank" rel="noopener noreferrer" style={docBtn}>
                                <Icon.FileText /> CV / Resume
                            </a>
                        )}
                        {sub.portfolio_file && (
                            <a href={`http://127.0.0.1:8000/storage/${sub.portfolio_file}`} target="_blank" rel="noopener noreferrer" style={docBtn}>
                                <Icon.FileText /> Portfolio
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SubmissionModal({ open, program, onClose }) {
    if (!open) return null;
    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.18)", margin: "auto 0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "22px 28px 18px", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Candidate List</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Viewing candidates for {program?.position_name} in program {program?.vacancy_title}.</div>
                    </div>
                    <button onClick={onClose} style={{ position: "absolute", top: 22, right: 28, width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
                </div>
                <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh" }}>
                    {(!program?.applicants || program.applicants.length === 0) ? (
                        <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                            <div style={{ width: 80, height: 80, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", marginBottom: 20 }}>
                                <Icon.Users />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>No Candidates Yet</h3>
                            <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>Currently there are no candidates for this position.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {program.applicants.map((sub, idx) => (
                                <CandidateItem key={sub.id_submission || idx} sub={sub} />
                            ))}
                        </div>
                    )}
                </div>
                <div style={{ padding: "18px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose} style={{ padding: "8px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13.5, fontWeight: 700, color: "#475569", cursor: "pointer" }}>Close</button>
                </div>
            </div>
        </div>
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
                borderTop: `3px solid ${program.vacancy_status === "published" ? "#10b981" : program.vacancy_status === "closed" ? "#ef4444" : "#94a3b8"}`,
                textAlign: "left"
            }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        >
            <div style={{ width: "100%", height: 160, background: program.vacancy_photo ? `url(http://127.0.0.1:8000/storage/${program.vacancy_photo}) center/cover` : "#e2e8f0", position: "relative" }}>
                <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#64748b", border: "1px solid rgba(0,0,0,0.1)", textTransform: "uppercase" }}>{program.vacancy_status}</div>
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(program); }} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444" }}><Icon.Trash /></button>
                </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#000", marginBottom: 4 }}>{program.position_name}</h3>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{program.vacancy_title}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" }}><Icon.Cal /><span>{formatDate(program.vacancy_start_date)} - {formatDate(program.vacancy_end_date)}</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: 8, border: "1px solid #dbeafe" }}>{program.position_quota || 0} Quota</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", padding: "4px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>{program.applicants?.length || 0} Candidates</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Position Management Specific ──────────────────────────────────────────
function CatalogItem({ item, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", background: hov ? "#f8fafc" : "transparent", transition: "background 0.2s" }}>
            <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.competencies?.length || 0} Competencies</div>
            </div>
            <div style={{ display: "flex", gap: 8, opacity: hov ? 1 : 0.6, transition: "0.2s" }}>
                <button onClick={() => onEdit(item)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Icon.Edit /> Edit</button>
                <button onClick={() => onDelete(item.id_position)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", fontSize: 12, cursor: "pointer" }}><Icon.Trash /></button>
            </div>
        </div>
    );
}

function PositionModal({ open, item, onClose, onSave }) {
    const { token } = useAuthStore();
    const [form, setForm] = useState({ name: "", competencies: [] });
    const [generatingIndex, setGeneratingIndex] = useState(null);
    useEffect(() => {
        if (open) {
            setForm({
                name: item?.name || "",
                competencies: (item?.competencies || []).map(c => ({ name: c.name, learning_hours: c.learning_hours, description: c.description }))
            });
        }
    }, [open, item]);
    if (!open) return null;

    const handleCompChange = (i, field, val) => {
        const next = [...form.competencies];
        next[i][field] = val;
        setForm({ ...form, competencies: next });
    };

    const handleGenerateAI = async (i) => {
        const compName = form.competencies[i].name;
        const posName = form.name;
        if (!compName || !posName) {
            alert("Please fill in the Position Name and Competency Name first.");
            return;
        }
        setGeneratingIndex(i);
        try {
            const prompt = `Tuliskan satu kalimat deskripsi profesional dan deskriptif (sekitar 15-25 kata) dalam bahasa Indonesia untuk kompetensi '${compName}' pada posisi pekerjaan '${posName}'. Berikan HANYA teks deskripsinya tanpa awalan, tanpa tanda kutip, dan tanpa penjelasan lain.`;
            const res = await axios.post("http://127.0.0.1:8000/api/ai/generate", {
                model: "llama3",
                prompt: prompt
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            handleCompChange(i, "description", res.data.response.trim());
        } catch (e) {
            alert(e.response?.data?.error || e.message || "Failed to connect to local Ollama on port 11434.");
            console.error(e);
        } finally {
            setGeneratingIndex(null);
        }
    };

    const inp = { textAlign: "left", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontFamily: "inherit", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", width: "100%", transition: "all .15s" };

    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 640, boxShadow: "0 20px 60px rgba(0,0,0,.18)", margin: "auto 0" }}>
                <div style={{ padding: "22px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "left" }}>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{item?.id_position ? "Edit Position" : "Add New Position"}</h2>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Enter position details and competencies.</p>
                    </div>
                    <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 18, color: "#64748b", cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ padding: 28, maxHeight: "60vh", overflowY: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ textAlign: "left" }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>NAME</label>
                            <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Frontend Developer" />
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 12 }}>COMPETENCIES</label>
                            {form.competencies.map((c, i) => (
                                <div key={i} style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", position: "relative", marginBottom: 12 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12, marginBottom: 12 }}>
                                        <input style={inp} value={c.name} onChange={e => handleCompChange(i, "name", e.target.value)} placeholder="Competency name" />
                                        <input style={inp} type="number" value={c.learning_hours} onChange={e => handleCompChange(i, "learning_hours", e.target.value)} placeholder="Hours" />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</label>
                                        <button 
                                            onClick={() => handleGenerateAI(i)}
                                            disabled={generatingIndex === i}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5,
                                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 6,
                                                padding: "5px 12px", fontSize: 10, fontWeight: 700, cursor: generatingIndex === i ? "default" : "pointer",
                                                opacity: generatingIndex === i ? 0.7 : 1, transition: "0.2s", boxShadow: "0 2px 6px rgba(99,102,241,.3)"
                                            }}
                                            onMouseEnter={e => generatingIndex !== i && (e.currentTarget.style.transform = "translateY(-1px)")}
                                            onMouseLeave={e => generatingIndex !== i && (e.currentTarget.style.transform = "translateY(0)")}
                                        >
                                            <Icon.Sparkles /> {generatingIndex === i ? "Generating..." : "Generate AI"}
                                        </button>
                                    </div>
                                    <textarea style={{ ...inp, minHeight: 80 }} value={c.description} onChange={e => handleCompChange(i, "description", e.target.value)} placeholder="Short description..." />
                                    <button onClick={() => setForm({ ...form, competencies: form.competencies.filter((_, j) => j !== i) })} style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", border: "1px solid #fee2e2", background: "#fff", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                </div>
                            ))}
                            <button onClick={() => setForm({ ...form, competencies: [...form.competencies, { name: "", learning_hours: "", description: "" }] })} style={{ width: "100%", padding: "10px", border: "1.5px dashed #e2e8f0", borderRadius: 12, background: "none", color: "#64748b", fontSize: 12.5, fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#c6cfd8"}>+ Add Competency</button>
                        </div>
                    </div>
                </div>
                <div style={{ padding: "18px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 13, color: "#64748b", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => onSave(item?.id_position, form)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#2563c4", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Save</button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function PositionsManagement() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("Positions Management");
    const { logout, token } = useAuthStore();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedProg, setSelectedProg] = useState(null);
    const [deletingProg, setDeletingProg] = useState(null);
    const [toast, setToast] = useState({ msg: "", type: "success", visible: false });
    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [isCatalogVisible, setIsCatalogVisible] = useState(false);
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [posModalOpen, setPosModalOpen] = useState(false);
    const [editingCatalogItem, setEditingCatalogItem] = useState(null);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    useEffect(() => {
        fetchPrograms();
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            setCatalogLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/positions/catalog", { headers: { Authorization: `Bearer ${token}` } });
            setCatalog(res.data);
        } catch (err) { console.error(err); } finally { setCatalogLoading(false); }
    };

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/programs", { headers: { Authorization: `Bearer ${token}` } });
            // Filter out 'draft' as it's not useful here (no candidates)
            const activeOnly = res.data.filter(p => p.vacancy_status !== "draft");
            setPrograms(activeOnly);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const showToast = (msg, type = "success") => {
        setToast({ msg, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    };

    const handleDelete = async (prog) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/programs/${prog.id_vacancy}/${prog.id_position}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Program removed."); fetchPrograms();
        } catch (err) { showToast("Failed to remove.", "error"); }
    };

    const comp = (() => { try { return JSON.parse(localStorage.getItem("company")); } catch { return null; } })();
    const companyName = comp?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();
    const SIDEBAR_W = 250;

    const navItems = [
        { label: "Dashboard", icon: <Icon.Dashboard />, path: "/dashboard", section: "MAIN MENU" },
        { label: "User Management", icon: <Icon.Users />, path: "/users" },
        { label: "Program Management", icon: <Icon.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <Icon.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Settings", icon: <Icon.Pengaturan />, path: "/settings" },
    ];

    const filtered = (programs || []).filter(p => {
        const ms = (p.position_name || "").toLowerCase().includes(search.toLowerCase()) || (p.vacancy_title || "").toLowerCase().includes(search.toLowerCase());
        const mf = filter === "all" || p.vacancy_status === filter;
        return ms && mf;
    });

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.35s ease both; }
            `}</style>

            {/* SIDEBAR */}
            <aside style={{ width: SIDEBAR_W, flexShrink: 0, background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, padding: "20px 12px", gap: "4px", overflowY: "auto", overflowX: "hidden" }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px 20px", textDecoration: "none" }}>
                    <img src="/assets/images/logo.png" alt="Logo" style={{ height: "46px" }} />
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
                </Link>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "6px 14px 4px", textTransform: "uppercase" }}>Main Menu</p>
                {navItems.map((n) => (
                    <SideItem key={n.label} icon={n.icon} label={n.label} active={activeNav === n.label} onClick={() => { if (n.path !== "/positions") navigate(n.path); }} />
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
                    {comp?.logo_path ? (
                        <img 
                            src={`http://127.0.0.1:8000/storage/${comp.logo_path}`} 
                            alt="Logo" 
                            style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }} 
                        />
                    ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, #2d7dd2, #4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#fff" }}>
                            {initials}
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyName}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>Admin</div>
                    </div>
                    <button onClick={() => setLogoutModalOpen(true)} title="Logout" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px", borderRadius: "6px", transition: "all 0.2s", display: "flex" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}>
                        <Icon.Logout />
                    </button>
                </div>
            </aside>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, position: "sticky", top: 0, zIndex: 50 }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Positions Management</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Management</span>
                    </div>
                </header>

                <main style={{ padding: 28, flex: 1, textAlign: "left" }} className="fade-in">
                    {/* Page header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Positions Management</div>
                            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Manage position catalog and program linkages.</div>
                        </div>
                        
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                                padding: "7px 14px", width: "240px",
                            }}>
                                <Icon.Search />
                                <input
                                    placeholder="Search by position or program..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        border: "none", background: "transparent", outline: "none",
                                        fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit",
                                    }}
                                />
                            </div>
                            
                            {isCatalogVisible && (
                                <button onClick={() => { setEditingCatalogItem(null); setPosModalOpen(true); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 7,
                                        background: "#2563c4", color: "#fff", border: "none", borderRadius: 8,
                                        padding: "10px 18px", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                                        cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,.3)"
                                    }}>
                                    <Icon.Plus /> Add Position
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: 40 }}>
                        <div onClick={() => setIsCatalogVisible(!isCatalogVisible)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: isCatalogVisible ? "#eff6ff" : "#fff", border: "1px solid #e2e8f0", borderRadius: 12, cursor: "pointer" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ color: "#2563c4", transform: isCatalogVisible ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s" }}><Icon.ChevronRight /></div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Existing Positions</div>
                                {!isCatalogVisible && <span style={{ fontSize: 12, color: "#94a3b8" }}>({catalog.length} positions)</span>}
                            </div>
                        </div>
                        {isCatalogVisible && (
                            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", marginTop: 12 }}>
                                {catalogLoading ? <div style={{ padding: 40, textAlign: "center" }}>Loading...</div> : catalog.length === 0 ? <div style={{ padding: 40, textAlign: "center" }}>No positions yet.</div> : (
                                    catalog.map(item => <CatalogItem key={item.id_position} item={item} onEdit={(it) => { setEditingCatalogItem(it); setPosModalOpen(true); }} onDelete={async (id) => {
                                        if (!confirm("Are you sure?")) return;
                                        try { await axios.delete(`http://127.0.0.1:8000/api/positions/catalog/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchCatalog(); showToast("Deleted."); }
                                        catch (e) { showToast(e.response?.data?.error || "Error", "error"); }
                                    }} />)
                                )}
                            </div>
                        )}
                    </div>

                    <SectionTitle style={{ marginBottom: 18 }}>Program Positions</SectionTitle>
                    <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                        {[
                            { key: "all", label: "All", count: programs.length },
                            { key: "published", label: "Published", count: programs.filter(p => p.vacancy_status === "published").length },
                            { key: "closed", label: "Closed", count: programs.filter(p => p.vacancy_status === "closed").length }
                        ].map(t => (
                            <button key={t.key} onClick={() => setFilter(t.key)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "8px 16px", borderRadius: "100px",
                                    border: `1.5px solid ${filter === t.key ? "#2563c4" : "#e2e8f0"}`,
                                    background: filter === t.key ? "#2563c4" : "#fff",
                                    color: filter === t.key ? "#fff" : "#64748b",
                                    fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all .15s"
                                }}
                            >
                                <span>{t.label}</span>
                                <span style={{
                                    background: filter === t.key ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                                    padding: "1px 7px", borderRadius: "10px", fontSize: "11px", fontWeight: "700"
                                }}>{t.count}</span>
                            </button>
                        ))}
                    </div>

                    {loading ? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : filtered.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>No programs found.</div> : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
                            {filtered.map((p, i) => <ProgramCard key={i} program={p} onEdit={(prog) => { setSelectedProg(prog); setSubmissionModalOpen(true); }} onDelete={setDeletingProg} />)}
                        </div>
                    )}
                </main>
            </div>

            <SubmissionModal open={submissionModalOpen} program={selectedProg} onClose={() => { setSubmissionModalOpen(false); setSelectedProg(null); }} />
            
            <PositionModal 
                open={posModalOpen} item={editingCatalogItem} onClose={() => { setPosModalOpen(false); setEditingCatalogItem(null); }}
                onSave={async (id, data) => {
                    const isDup = catalog.some(item => 
                        item.name.toLowerCase() === data.name.toLowerCase() && 
                        item.id_position !== id
                    );
                    if (isDup) {
                        showToast("A position with this name already exists.", "error"); return;
                    }
                    try {
                        const url = id ? `http://127.0.0.1:8000/api/positions/catalog/${id}` : "http://127.0.0.1:8000/api/positions/catalog";
                        await axios[id ? "put" : "post"](url, data, { headers: { Authorization: `Bearer ${token}` } });
                        showToast(`Position ${id ? "updated" : "created"}.`); fetchCatalog(); setPosModalOpen(false);
                    } catch (e) { showToast(e.response?.data?.error || "Error saving.", "error"); }
                }}
            />

            {deletingProg && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, textAlign: "left" }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Remove Position?</h3>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "12px 0 20px" }}>Remove <b>{deletingProg.position_name}</b> from <b>{deletingProg.vacancy_title}</b>?</p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setDeletingProg(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { handleDelete(deletingProg); setDeletingProg(null); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 320, textAlign: "left" }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Sign Out?</h3>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}
