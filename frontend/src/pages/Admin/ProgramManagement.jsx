import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

// ── Initial data removed - now using backend API ─────────────────────────────

const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Inline styles (converted from CSS vars) ────────────────────────────────────
const S = {
    // sidebar
    sidebar: { width: 256, background: "#0a1628", minHeight: "100vh", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, zIndex: 100, boxShadow: "4px 0 24px rgba(0,0,0,.18)" },
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
    card: (status) => ({
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,.06)", position: "relative", overflow: "hidden",
        transition: "box-shadow .2s, transform .2s", cursor: "default",
        borderTop: `3px solid ${status === "published" ? "#10b981" : "#94a3b8"}`,
    }),
};

// ── Icons ─────────────────────────────────────────────────────────────────────
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
    Bell: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    Plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Filter: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    Save: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Send: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    Cal: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Location: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    Deadline: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Dot: () => <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>,
    Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Upload: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Lock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    ChevronRight: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>,
    FileText: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
};

const formatDateToFrontend = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const month = MONTHS_SHORT[parseInt(m) - 1];
    return `${parseInt(d)} ${month} ${y}`;
};

const formatDateToBackend = (dateStr) => {
    if (!dateStr) return "";
    const parts = String(dateStr).split(" ");
    if (parts.length !== 3) return dateStr;
    const [d, mStr, y] = parts;
    const m = MONTHS_SHORT.indexOf(mStr) + 1;
    const mm = m < 10 ? `0${m}` : m;
    const dd = parseInt(d) < 10 ? `0${parseInt(d)}` : d;
    return `${y}-${mm}-${dd}`;
};

// ── Calendar component ─────────────────────────────────────────────────────────
function CalendarPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const ref = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const now = new Date(); now.setHours(0, 0, 0, 0);
    const first = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = first.getDay();

    const pickDate = (d) => {
        const dateStr = `${d} ${MONTHS_SHORT[month]} ${year}`;
        onChange(dateStr);
        setOpen(false);
    };

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", border: `1.5px solid ${open ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff",
                    boxShadow: open ? "0 0 0 3px rgba(59,130,246,.12)" : "none", transition: "all .15s",
                }}
            >
                <div style={{ flex: 1, padding: "9px 13px", textAlign: "left", fontSize: 13.5, color: value ? "#0f172a" : "#cbd5e1", fontFamily: "inherit" }}>
                    {value || "Select date…"}
                </div>
                <div style={{ width: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <Icon.Cal />
                </div>
            </div>

            {open && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 400, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.14)", padding: 16, width: 280 }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
                            style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{MONTHS_FULL[month]} {year}</span>
                        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
                            style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                    </div>
                    {/* Day names */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 2 }}>
                        {DAYS_SHORT.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "center", padding: "4px 0" }}>{d}</div>)}
                    </div>
                    {/* Days */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                        {days.map((d, i) => {
                            if (!d) return <div key={i} />;
                            const date = new Date(year, month, d);
                            const isPast = date < now;
                            const isToday = date.getTime() === now.getTime();
                            const dateStr = `${d} ${MONTHS_SHORT[month]} ${year}`;
                            const isSel = value === dateStr;
                            return (
                                <div key={i} onClick={() => !isPast && pickDate(d)}
                                    style={{
                                        fontSize: 12.5, textAlign: "center", padding: "6px 2px", borderRadius: 6, cursor: isPast ? "default" : "pointer",
                                        color: isSel ? "#fff" : isPast ? "#cbd5e1" : isToday ? "#3b82f6" : "#334155",
                                        background: isSel ? "#3b82f6" : "transparent",
                                        fontWeight: isSel || isToday ? 700 : 400,
                                        transition: "all .12s",
                                    }}
                                    onMouseEnter={e => { if (!isPast && !isSel) e.currentTarget.style.background = "#eff6ff"; }}
                                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                                >{d}</div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Pill toggle ───────────────────────────────────────────────────────────────
function PillGroup({ options, value, onChange }) {
    return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {options.map(opt => {
                const sel = value === opt.value;
                return (
                    <div key={opt.value} onClick={() => onChange(opt.value)}
                        style={{
                            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                            border: `1.5px solid ${sel ? "#2563c4" : "#e2e8f0"}`, borderRadius: 20,
                            cursor: "pointer", fontSize: 13, fontWeight: sel ? 600 : 500,
                            color: sel ? "#1e4d8c" : "#64748b", background: sel ? "#eff6ff" : "#fff",
                            transition: "all .15s", userSelect: "none",
                        }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid currentColor", background: sel ? "#2563c4" : "transparent", transition: "background .15s" }} />
                        {opt.label}
                    </div>
                );
            })}
        </div>
    );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
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

function JobCard({ job, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);

    return (
        <div
            onClick={() => onEdit(job.id)}
            style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, display: "flex", flexDirection: "column",
                boxShadow: hov ? "0 12px 32px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.06)", overflow: "hidden",
                transition: "all .2s ease", cursor: "pointer", position: "relative"
            }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        >
            {/* Poster / Image Banner */}
            <div style={{ width: "100%", height: 180, background: job.photo ? `url(http://127.0.0.1:8000/storage/${job.photo}) center/cover` : (job.image ? `url(${job.image}) center/cover` : "#e2e8f0"), position: "relative" }}>
                {job.status === "draft" && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#64748b", border: "1px solid rgba(0,0,0,0.1)" }}>
                        DRAFT
                    </div>
                )}
                {job.status === "published" && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(59,130,246,0.15)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                        PUBLISHED
                    </div>
                )}
                {job.status === "closed" && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(239,68,68,0.15)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        CLOSED
                    </div>
                )}
                {/* Tipe flagships etc */}
                <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(job.id); }} title="Edit"
                            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#334155", transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#3b82f6"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#334155"; }}>
                            <Icon.Edit />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} title="Delete"
                            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#334155", transition: "0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#334155"; }}>
                            <Icon.Trash />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#000", marginBottom: 14 }}>
                    {job.nama} - Batch {job.batch}
                </h3>

                <div style={{ fontSize: 13, fontWeight: 500, color: "#000", fontStyle: "italic", marginBottom: 6 }}>
                    Positions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>
                    {job.posisi.slice(0, 4).map((p, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#000" }}>
                            <Icon.Dot />
                            <span>{p}</span>
                        </div>
                    ))}
                    {job.posisi.length > 4 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#000" }}>
                            <Icon.Dot /> <span>etc.</span>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: "#9ca3af", fontStyle: "italic" }}>
                        <Icon.Cal />
                        <span>{job.startDate} - {job.endDate}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: "#000" }}>
                        <Icon.Location />
                        <span>{job.kota}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: "#ef4444" }}>
                        <Icon.Deadline />
                        <span style={{ fontStyle: "italic" }}>Deadline: {job.deadline}</span>
                    </div>
                </div>

                {/* Tags (Flagship/Reguler & Paid/Unpaid) */}
                <div style={{ display: "flex", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: job.tipe === "flagship" ? "#fef3c7" : "#eff6ff", color: job.tipe === "flagship" ? "#d97706" : "#1e4d8c", padding: "4px 10px", borderRadius: 6 }}>
                        {job.tipe === "flagship" ? "Flagship" : "Reguler"}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: job.payment === "paid" ? "#ecfdf5" : "#f8fafc", color: job.payment === "paid" ? "#059669" : "#64748b", padding: "4px 10px", borderRadius: 6 }}>
                        {job.payment === "paid" ? "Paid" : "Unpaid"}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#f8fafc", color: "#64748b", padding: "4px 10px", borderRadius: 6, marginLeft: "auto" }}>
                        {job.pelamar} Candidates · {job.kuota} Quota
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, editingJob, onClose, onSubmit, catalog }) {
    const [activeTab, setActiveTab] = useState("detail");
    const [form, setForm] = useState({ title: "", desc: "", kota: "", provinsi: "", alamat: "", batch: "", image: "", photoFile: null });
    const fileInpRef = useRef(null);
    const [tipe, setTipe] = useState("");
    const [payment, setPayment] = useState("");
    const [deadline, setDeadline] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [posisi, setPosisi] = useState([{ id_position: "", name: "", quota: "" }]);
    const [search, setSearch] = useState("");
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setActiveTab("detail");
            if (editingJob) {
                setForm({ title: editingJob.title || editingJob.nama, desc: editingJob.desc, kota: editingJob.kota, provinsi: editingJob.provinsi, alamat: editingJob.alamat, batch: editingJob.batch, image: editingJob.photo || editingJob.image || "", photoFile: null });
                setTipe(editingJob.tipe || editingJob.type);
                setPayment(editingJob.payment || editingJob.payment_type);
                setDeadline(editingJob.deadline);
                setStartDate(editingJob.startDate || "");
                setEndDate(editingJob.endDate || "");
                
                const mappedPosArr = (editingJob.positions || []).map(p => ({
                    id_position: p.id_position || "",
                    name: p.name || "",
                    quota: p.quota || p.pivot?.quota || 0
                }));
                setPosisi(mappedPosArr.length > 0 ? mappedPosArr : [{ id_position: "", name: "", quota: "" }]);
            } else {
                setForm({ title: "", desc: "", kota: "", provinsi: "", alamat: "", batch: "", image: "", photoFile: null });
                setTipe(""); setPayment(""); setDeadline(""); setStartDate(""); setEndDate(""); setPosisi([{ id_position: "", name: "", quota: "" }]);
            }
        }
    }, [open, editingJob]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setForm({ ...form, image: url, photoFile: file });
        }
    };

    const handleSubmit = (status) => {
        const filled = posisi.filter(p => p.name.trim());

        // Relaxed validation
        if (!form.title) return alert("Program Name is required.");
        if (filled.length === 0) return alert("At least one position must be filled.");

        // If publishing, check for other essential fields
        if (status === "published") {
            if (!form.desc || !form.kota || !form.provinsi || !form.batch || !startDate || !endDate || !deadline || !tipe || !payment) {
                return alert("Please fill in all required fields before publishing the program.");
            }
            if (filled.some(p => !p.quota || p.quota <= 0)) {
                return alert("All positions must have a quota.");
            }
        }

        onSubmit({ ...form, batch: +form.batch, startDate, endDate, deadline, tipe, payment, posisi: filled, status });
    };

    // ── Position Searchable Dropdown ──────────────────────────
    function PositionDropdown({ value, idValue, onChange, catalog }) {
        const [open, setOpen] = useState(false);
        const [search, setSearch] = useState("");
        const ref = useRef(null);

        useEffect(() => {
            const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
            document.addEventListener("mousedown", fn);
            return () => document.removeEventListener("mousedown", fn);
        }, []);

        const filtered = catalog.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

        return (
            <div ref={ref} style={{ position: "relative" }}>
                <div onClick={() => setOpen(!open)} style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderColor: open ? "#3b82f6" : "#e2e8f0" }}>
                    <span style={{ color: value ? "#0f172a" : "#cbd5e1" }}>{value || "Select position..."}</span>
                    <Icon.ChevronRight style={{ transform: "rotate(90deg)", opacity: 0.5 }} />
                </div>
                {open && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 300, overflow: "hidden" }}>
                        <div style={{ padding: 8, borderBottom: "1px solid #f1f5f9", background: "#fff" }}>
                            <input autoFocus placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, outline: "none", background: "#fff", color: "#475569" }} />
                        </div>
                        <div style={{ maxHeight: 200, overflowY: "auto" }}>
                            {filtered.length === 0 && <div style={{ padding: "12px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>No positions found. Create one in Positions Management first.</div>}
                            {filtered.map(c => (
                                <div key={c.id_position} onClick={() => { onChange(c); setOpen(false); }} 
                                     style={{ padding: "10px 14px", fontSize: 13.5, cursor: "pointer", transition: "0.1s", background: idValue === c.id_position ? "#eff6ff" : "transparent", textAlign: "left", color: "#475569" }}
                                     onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                                     onMouseLeave={e => { if (idValue !== c.id_position) e.currentTarget.style.background = "transparent"; }}>
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const inp = { textAlign: "left", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 13px", fontFamily: "inherit", fontSize: 13.5, color: "#0f172a", background: "#fff", outline: "none", width: "100%", transition: "border-color .15s, box-shadow .15s" };
    const focusInp = (e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"; };
    const blurInp = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

    if (!open) return null;

    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, overflowY: "auto" }}>
            <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.18)", margin: "auto 0" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "22px 28px 18px", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{editingJob ? "Edit Program" : "Add New Program"}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Fill in all internship program information completely.</div>
                    </div>
                    <button onClick={onClose} style={{ position: "absolute", top: 22, right: 28, width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
                </div>

                {editingJob && (
                    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 28px", background: "#f8fafc" }}>
                        <button onClick={() => setActiveTab("detail")} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === "detail" ? "2.5px solid #2563c4" : "2.5px solid transparent", color: activeTab === "detail" ? "#2563c4" : "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "0.2s" }}>Program Detail</button>
                        <button onClick={() => setActiveTab("pelamar")} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === "pelamar" ? "2.5px solid #2563c4" : "2.5px solid transparent", color: activeTab === "pelamar" ? "#2563c4" : "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "0.2s" }}>Candidate List</button>
                    </div>
                )}

                {/* Body */}
                {activeTab === "detail" ? (
                    <>
                        <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh" }}>
                            {/* Section helper */}
                            {[{ title: "Info Dasar" }].map(() => null)}

                            {/* Info Dasar */}
                            <SectionTitle>Info Dasar</SectionTitle>
                            <FGroup label="Upload Poster Magang (Opsional)">
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <button onClick={() => fileInpRef.current.click()} style={{ padding: "9px 16px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
                                        <Icon.Upload /> Pilih File
                                    </button>
                                    <input type="file" ref={fileInpRef} hidden accept="image/*" onChange={handleFileChange} />
                                    {form.image && <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>Berhasil dipilih!</div>}
                                </div>
                            </FGroup>
                            <FGroup label="Program Name" req style={{ marginTop: 14 }}>
                                <input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="cth. Software Engineer Intern Batch 8" onFocus={focusInp} onBlur={blurInp} />
                            </FGroup>
                            <FGroup label="Program Description" req style={{ marginTop: 14 }}>
                                <textarea style={{ ...inp, minHeight: 88, resize: "vertical", lineHeight: 1.6 }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Briefly describe this internship program…" onFocus={focusInp} onBlur={blurInp} />
                            </FGroup>

                            {/* Internship Location */}
                            <SectionTitle style={{ marginTop: 24 }}>Internship Location</SectionTitle>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <FGroup label="City" req>
                                    <input style={inp} value={form.kota} onChange={e => setForm({ ...form, kota: e.target.value })} placeholder="e.g. Jakarta" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                                <FGroup label="Province" req>
                                    <input style={inp} value={form.provinsi} onChange={e => setForm({ ...form, provinsi: e.target.value })} placeholder="e.g. DKI Jakarta" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                            </div>
                            <FGroup label="Full Address">
                                <input style={inp} value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="e.g. Jl. Sudirman No. 1, Menara 88 Building" onFocus={focusInp} onBlur={blurInp} />
                            </FGroup>

                            {/* Program Detail */}
                            <SectionTitle style={{ marginTop: 24 }}>Program Detail</SectionTitle>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <FGroup label="Start Date" req>
                                    <CalendarPicker value={startDate} onChange={setStartDate} />
                                </FGroup>
                                <FGroup label="End Date" req>
                                    <CalendarPicker value={endDate} onChange={setEndDate} />
                                </FGroup>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <FGroup label="Batch" req>
                                    <input style={inp} type="number" min="1" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="e.g. 8" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <FGroup label="Application Deadline" req>
                                    <CalendarPicker value={deadline} onChange={setDeadline} />
                                </FGroup>
                            </div>
                            <FGroup label="Internship Type" req style={{ marginBottom: 14 }}>
                                <PillGroup options={[{ value: "reguler", label: "Reguler" }, { value: "flagship", label: "Flagship" }]} value={tipe} onChange={setTipe} />
                            </FGroup>
                            <FGroup label="Payment Type" req style={{ marginBottom: 14 }}>
                                <PillGroup options={[{ value: "unpaid", label: "Unpaid" }, { value: "paid", label: "Paid" }]} value={payment} onChange={setPayment} />
                            </FGroup>

                            {/* Open Positions */}
                            <SectionTitle style={{ marginTop: 24 }}>Open Positions</SectionTitle>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {posisi.map((p, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", marginBottom: 5, textAlign: "left" }}>Position {i + 1}</div>
                                            <PositionDropdown 
                                                value={p.name} 
                                                idValue={p.id_position} 
                                                catalog={catalog} 
                                                onChange={(c) => {
                                                    const next = [...posisi];
                                                    next[i].id_position = c.id_position;
                                                    next[i].name = c.name;
                                                    setPosisi(next);
                                                }} 
                                            />
                                        </div>
                                        <div style={{ width: 90 }}>
                                            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", marginBottom: 5, textAlign: "left" }}>Quota</div>
                                            <input style={inp} type="number" min="1" value={p.quota} onChange={e => { const next = [...posisi]; next[i].quota = e.target.value; setPosisi(next); }} placeholder="0" onFocus={focusInp} onBlur={blurInp} />
                                        </div>
                                        <button onClick={() => posisi.length > 1 && setPosisi(posisi.filter((_, j) => j !== i))}
                                            style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", fontSize: 14, flexShrink: 0 }}>✕</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setPosisi([...posisi, { id_position: "", name: "", quota: "" }])}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1.5px dashed #e2e8f0", borderRadius: 8, background: "transparent", fontFamily: "inherit", fontSize: 13, color: "#64748b", cursor: "pointer", marginTop: 8, transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; e.currentTarget.style.background = "#eff6ff"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}>
                                <Icon.Plus /> Add Position
                            </button>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "18px 28px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Fields marked with <b style={{ color: "#ef4444" }}>*</b> are required.</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                {/* Simpan sebagai Draft */}
                                <button onClick={() => handleSubmit("draft")}
                                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", color: "#475569", border: "1.2px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}>
                                    <Icon.Save /> Draft
                                </button>

                                {/* Special "Closed" button for published jobs */}
                                {editingJob?.status === "published" && (
                                    <button onClick={() => handleSubmit("closed")}
                                        style={{ display: "flex", alignItems: "center", gap: 5, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(239, 68, 68, 0.2)", transition: "all .15s" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "#ef4444"; }}>
                                        <Icon.Lock /> Closed
                                    </button>
                                )}

                                {/* Simpan or Publish */}
                                <button onClick={() => handleSubmit("published")}
                                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#2563c4", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.25)", transition: "all .15s" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "#2563c4"; }}>
                                    <Icon.Send /> {editingJob?.status === "published" ? "Save" : "Publish"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "24px 28px", overflowY: "auto", maxHeight: "65vh" }}>
                        {(!editingJob?.submissions || editingJob.submissions.length === 0) ? (
                            <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div style={{ width: 80, height: 80, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", marginBottom: 20 }}>
                                    <Icon.Users />
                                </div>
                                {editingJob?.status === "draft" ? (
                                    <>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Cannot Receive Candidates</h3>
                                        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>Please <b>Publish</b> this program first so that candidates can see and apply.</p>
                                    </>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>No Candidates Yet</h3>
                                        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6 }}>No candidates have submitted applications to any position in this program.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {editingJob.submissions.map((sub, idx) => (
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
                        <div style={{ fontSize: 12, color: "#64748b" }}>Applied for position: <span style={{ color: "#2563c4", fontWeight: 600 }}>{sub.position?.name || "Unknown position"}</span></div>
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
                                <Icon.FileText /> Portofolio
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

function SectionTitle({ children, style }) {
    return (
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".8px", textTransform: "uppercase", color: "#64748b", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, textAlign: "left", ...style }}>
            {children}
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>
    );
}

function FGroup({ label, req, children, style }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, textAlign: "left", ...style }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", textAlign: "left" }}>{label} {req && <span style={{ color: "#ef4444" }}>*</span>}</label>
            {children}
        </div>
    );
}

// ── Sidebar item ─────────────────────────────────────────────────────────────
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProgramManagement() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextId, setNextId] = useState(6);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [activeNav, setActiveNav] = useState("Program Management");
    const [catalog, setCatalog] = useState([]);
    const [toast, setToast] = useState({ msg: "", type: "success", visible: false });

    // Initial load
    useEffect(() => {
        fetchJobs();
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/positions/catalog", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCatalog(res.data);
        } catch (err) {
            console.error("Failed to fetch catalog:", err);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://127.0.0.1:8000/api/vacancies", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map the backend data to frontend field names if they differ
            const mappedJobs = res.data.map(j => {
                const locParts = (j.location || "").split(", ");
                return {
                    ...j,
                    id: j.id_vacancy,
                    nama: j.title,
                    desc: j.description, // Added this mapping
                    kota: locParts[0] || "",
                    provinsi: locParts[1] || "",
                    alamat: locParts[2] || "",
                    deadline: formatDateToFrontend(j.deadline),
                    startDate: formatDateToFrontend(j.start_date || j.deadline),
                    endDate: formatDateToFrontend(j.end_date || j.deadline),
                    tipe: j.type,
                    payment: j.payment_type,
                    kuota: j.total_quota || 0,
                    posisi: (j.positions || []).map(p => p.name || p),
                    submissions: j.submissions || []
                };
            });
            setJobs(mappedJobs);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            showToast("Failed to fetch data from the server.", "error");
        } finally {
            setLoading(false);
        }
    };

    const comp = (() => { try { return JSON.parse(localStorage.getItem("company")); } catch { return null; } })();
    const companyName = comp?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();
    const companyRole = comp?.role || "Admin";

    const showToast = (msg, type = "success") => {
        setToast({ msg, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
    };

    const filtered = jobs.filter(j => {
        const mf = filter === "all" || j.status === filter;
        const ms = j.nama.toLowerCase().includes(search.toLowerCase()) || j.kota.toLowerCase().includes(search.toLowerCase());
        return mf && ms;
    });

    const handleModalSubmit = async (data) => {
        // Validation: Cannot publish with a past deadline
        if (data.status === "published" && data.deadline) {
            const dDate = new Date(data.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dDate < today) {
                showToast("Application deadline must be in the future to publish.", "error");
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.desc);
            formData.append("city", data.kota);
            formData.append("province", data.provinsi);
            formData.append("address", data.alamat);
            formData.append("batch", parseInt(data.batch));
            formData.append("quota", parseInt(data.kuota));
            formData.append("deadline", formatDateToBackend(data.deadline));
            formData.append("start_date", formatDateToBackend(data.startDate));
            formData.append("end_date", formatDateToBackend(data.endDate));
            formData.append("type", data.tipe);
            formData.append("payment_type", data.payment);
            formData.append("status", data.status);

            data.posisi.forEach((p, i) => {
                if (p.id_position) formData.append(`positions[${i}][id_position]`, p.id_position);
                formData.append(`positions[${i}][name]`, p.name);
                formData.append(`positions[${i}][quota]`, p.quota);
            });

            if (data.photoFile) {
                formData.append("photo", data.photoFile);
            }

            if (editingJob) {
                // For PUT with files in Laravel, we use POST with _method = PUT
                formData.append("_method", "PUT");
                await axios.post(`http://127.0.0.1:8000/api/vacancies/${editingJob.id_vacancy}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                });
                showToast(`Program updated successfully.`);
            } else {
                await axios.post("http://127.0.0.1:8000/api/vacancies", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                });
                showToast(`Program successfully ${data.status === "published" ? "published" : "saved as draft"}.`);
            }
            fetchJobs();
            setModalOpen(false);
            setEditingJob(null);
        } catch (err) {
            console.error("Failed to save job:", err);
            const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : null) || "Failed to save program.";
            showToast(msg, "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/vacancies/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Program deleted successfully.");
            fetchJobs();
        } catch (err) {
            console.error("Failed to delete job:", err);
            showToast("Failed to delete program.", "error");
        }
    };

    const handleLogout = () => { setLogoutModalOpen(true); };

    const navItems = [
        { label: "Dashboard", icon: <Icon.Dashboard />, path: "/dashboard", section: "MAIN MENU" },
        { label: "User Management", icon: <Icon.Users />, path: "/users", badge: 0 },
        { label: "Program Management", icon: <Icon.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <Icon.Program />, path: "/positions" },
    ];
    const navItems2 = [
        { label: "Settings", icon: <Icon.Pengaturan />, path: "/settings" },
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
        /* Hide number input spinners */
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        
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
                    {comp.logo_path ? (
                        <img 
                            src={`http://127.0.0.1:8000/storage/${comp.logo_path}`} 
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
                        <Icon.Logout />
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
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Program Management</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Management</span>
                    </div>

                    {/* Bell */}
                    <button style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", position: "relative" }}>
                        <Icon.Bell />
                    </button>
                </header>

                {/* PAGE BODY */}
                <main style={{ padding: 28, flex: 1, textAlign: "left" }} className="fade-in">
                    {/* Page header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Program Management</div>
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Manage all internship programs available on the platform.</div>
                    </div>
                    
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                            padding: "7px 14px", width: "240px",
                        }}>
                            <Icon.Search />
                            <input
                                placeholder="Search by program name or city..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    border: "none", background: "transparent", outline: "none",
                                    fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit",
                                }}
                            />
                        </div>
                        
                        <button onClick={() => { setEditingJob(null); setModalOpen(true); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 7,
                                background: "#2563c4", color: "#fff", border: "none", borderRadius: 8,
                                padding: "10px 18px", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,.3)"
                            }}>
                            <Icon.Plus /> Add Program
                        </button>
                    </div>
                </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                        {[
                            { key: "all", label: "All", count: jobs.length },
                            { key: "published", label: "Published", count: jobs.filter(j => j.status === "published").length },
                            { key: "draft", label: "Draft", count: jobs.filter(j => j.status === "draft").length },
                            { key: "closed", label: "Closed", count: jobs.filter(j => j.status === "closed").length }
                        ].map(t => (
                            <div key={t.key} onClick={() => setFilter(t.key)}
                                style={{
                                    padding: "6px 16px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                                    border: `1.5px solid ${filter === t.key ? "#2563c4" : "#e2e8f0"}`,
                                    background: filter === t.key ? "#2563c4" : "#fff",
                                    color: filter === t.key ? "#fff" : "#64748b",
                                    transition: "all .15s",
                                }}>
                                {t.label} <span style={{ background: filter === t.key ? "rgba(255,255,255,.25)" : "#f8fafc", borderRadius: 10, padding: "1px 6px", fontSize: 11, marginLeft: 4, color: filter === t.key ? "#fff" : "#64748b" }}>{t.count}</span>
                            </div>
                        ))}
                    </div>

                    {/* Cards grid */}
                    {filtered.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 32px", textAlign: "center" }}>
                            <div style={{ color: "#cbd5e1", width: "48px", height: "48px", marginBottom: 16 }}>
                                <Icon.Lowongan />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>No programs yet</h3>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Add your first program by pressing the <b>"Add Program"</b> button above.</p>
                            <button onClick={() => { setEditingJob(null); setModalOpen(true); }}
                                style={{ display: "flex", alignItems: "center", gap: 7, background: "#2563c4", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                <Icon.Plus /> Add Program
                            </button>
                        </div>
                    ) : (
                        <div style={S.cardGrid}>
                            {filtered.map(j => (
                                <JobCard key={j.id} job={j}
                                    onEdit={(id) => { setEditingJob(jobs.find(x => x.id === id) || null); setModalOpen(true); }}
                                    onDelete={(id) => setDeletingId(id)} />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL */}
            <Modal open={modalOpen} editingJob={editingJob} onClose={() => { setModalOpen(false); setEditingJob(null); }} onSubmit={handleModalSubmit} catalog={catalog} />

            {/* Delete confirm */}
            {deletingId && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,.18)", textAlign: "left" }}>
                        <div style={{ color: "#ef4444", marginBottom: 16 }}>
                            <Icon.Trash />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Delete Program?</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>This action cannot be undone. The program and all its candidate data will be permanently deleted.</div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setDeletingId(null)}
                                style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#334155" }}>Cancel</button>
                            <button onClick={() => { handleDelete(deletingId); setDeletingId(null); }}
                                style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout confirm */}
            {logoutModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,.18)", textAlign: "left" }}>
                        <div style={{ color: "#3b82f6", marginBottom: 16 }}>
                            <Icon.Users />
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

            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}
