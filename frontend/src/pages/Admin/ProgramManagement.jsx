import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useHRToast, HRToastStack } from "../../components/HRToast";
import axios from "axios";

// ── Date helpers ───────────────────────────────────────────────────────────────
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const formatDateToFrontend = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]} ${y}`;
};

const formatDateToBackend = (dateStr) => {
    if (!dateStr) return "";
    const parts = String(dateStr).split(" ");
    if (parts.length !== 3) return dateStr;
    const [d, mStr, y] = parts;
    const m  = MONTHS_SHORT.indexOf(mStr) + 1;
    const mm = m  < 10 ? `0${m}`           : m;
    const dd = parseInt(d) < 10 ? `0${parseInt(d)}` : d;
    return `${y}-${mm}-${dd}`;
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
    Dashboard: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
    ),
    Users: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    Briefcase: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
    ),
    Book: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
    ),
    Settings: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    ),
    Logout: () => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    Menu: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    ),
    Close: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    ),
    Search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    Plus:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Save:   () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    Send:   () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    Cal:    () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Location: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Deadline: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Dot:    () => <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg>,
    Edit:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Trash:  () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    Upload: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    Lock:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    ChevronRight: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    FileText: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    Sparkles: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M7 5H3"/></svg>,
};

// ── Sidebar Item (matches Dashboard exactly) ──────────────────────────────────
function SideItem({ icon, label, active, badge, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all text-left border"
            style={{
                background:   active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
                borderColor:  active ? "rgba(74,158,255,0.22)" : "transparent",
                color:        active ? "#4a9eff" : "rgba(255,255,255,0.6)",
                fontWeight:   active ? "600" : "500",
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

// ── Calendar Picker ────────────────────────────────────────────────────────────
function CalendarPicker({ value, onChange }) {
    const [open, setOpen]   = useState(false);
    const [year, setYear]   = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const ref = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const now = new Date(); now.setHours(0,0,0,0);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay  = new Date(year, month, 1).getDay();

    const pickDate = (d) => { onChange(`${d} ${MONTHS_SHORT[month]} ${year}`); setOpen(false); };

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => setOpen(!open)}
                className="flex items-center border rounded-lg overflow-hidden cursor-pointer bg-white transition-all"
                style={{ borderColor: open ? "#3b82f6" : "#e2e8f0", boxShadow: open ? "0 0 0 3px rgba(59,130,246,.12)" : "none" }}
            >
                <div className="flex-1 px-3 py-2 text-left text-sm" style={{ color: value ? "#0f172a" : "#cbd5e1" }}>
                    {value || "Select date…"}
                </div>
                <div className="w-10 flex items-center justify-center" style={{ color: "#64748b" }}>
                    <IC.Cal />
                </div>
            </div>

            {open && (
                <div className="absolute z-[400] bg-white border border-slate-200 rounded-xl p-4 top-[calc(100%+6px)] left-0 w-72"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,.14)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => { month === 0 ? (setMonth(11), setYear(y=>y-1)) : setMonth(m=>m-1); }}
                            className="w-7 h-7 border border-slate-200 rounded-md bg-white cursor-pointer text-sm flex items-center justify-center" style={{ color: "#64748b" }}>‹</button>
                        <span className="text-sm font-bold" style={{ color: "#0f172a" }}>{MONTHS_FULL[month]} {year}</span>
                        <button onClick={() => { month === 11 ? (setMonth(0), setYear(y=>y+1)) : setMonth(m=>m+1); }}
                            className="w-7 h-7 border border-slate-200 rounded-md bg-white cursor-pointer text-sm flex items-center justify-center" style={{ color: "#64748b" }}>›</button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {DAYS_SHORT.map(d => <div key={d} className="text-center text-xs font-bold py-1" style={{ color: "#94a3b8", fontSize: "10px" }}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                        {days.map((d, i) => {
                            if (!d) return <div key={i}/>;
                            const date   = new Date(year, month, d);
                            const isPast = false;
                            const isToday= date.getTime() === now.getTime();
                            const dateStr= `${d} ${MONTHS_SHORT[month]} ${year}`;
                            const isSel  = value === dateStr;
                            return (
                                <div key={i} onClick={() => !isPast && pickDate(d)}
                                    className="text-center rounded-md py-1.5 text-xs transition-all"
                                    style={{
                                        cursor:     isPast ? "default" : "pointer",
                                        color:      isSel ? "#fff" : isPast ? "#cbd5e1" : isToday ? "#3b82f6" : "#334155",
                                        background: isSel ? "#3b82f6" : "transparent",
                                        fontWeight: isSel || isToday ? 700 : 400,
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

// ── Pill Group ─────────────────────────────────────────────────────────────────
function PillGroup({ options, value, onChange }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {options.map(opt => {
                const sel = value === opt.value;
                return (
                    <div key={opt.value} onClick={() => onChange(opt.value)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer text-sm font-medium transition-all select-none"
                        style={{
                            borderColor: sel ? "#2563c4" : "#e2e8f0",
                            color:       sel ? "#1e4d8c" : "#64748b",
                            background:  sel ? "#eff6ff" : "#fff",
                            fontWeight:  sel ? 600 : 500,
                        }}>
                        <div className="w-2 h-2 rounded-full border-2 transition-all" style={{ borderColor: "currentColor", background: sel ? "#2563c4" : "transparent" }}/>
                        {opt.label}
                    </div>
                );
            })}
        </div>
    );
}



// ── Section Title (modal helper) ───────────────────────────────────────────────
function SectionTitle({ children }) {
    return (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3.5" style={{ color: "#64748b" }}>
            {children}
            <div className="flex-1 h-px" style={{ background: "#e2e8f0" }}/>
        </div>
    );
}

// ── Form Group ─────────────────────────────────────────────────────────────────
function FGroup({ label, req, children }) {
    return (
        <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold" style={{ color: "#334155" }}>
                {label} {req && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            {children}
        </div>
    );
}

// ── Shared input style ─────────────────────────────────────────────────────────
const inpStyle = {
    textAlign: "left", border: "1.5px solid #e2e8f0", borderRadius: 8,
    padding: "9px 13px", fontFamily: "inherit", fontSize: 13.5,
    color: "#0f172a", background: "#fff", outline: "none", width: "100%", transition: "border-color .15s, box-shadow .15s",
};
const focusInp = (e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"; };
const blurInp  = (e) => { e.target.style.borderColor = "#e2e8f0";  e.target.style.boxShadow = "none"; };

// ── Position Searchable Dropdown ───────────────────────────────────────────────
function PositionDropdown({ value, idValue, onChange, catalog }) {
    const [open, setOpen]     = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const filtered = catalog.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={ref} className="relative">
            <div onClick={() => setOpen(!open)}
                className="flex items-center justify-between cursor-pointer bg-white rounded-lg border transition-all"
                style={{ ...inpStyle, padding: "9px 13px", borderColor: open ? "#3b82f6" : "#e2e8f0" }}>
                <span style={{ color: value ? "#0f172a" : "#cbd5e1" }}>{value || "Select position..."}</span>
                <IC.ChevronRight/>
            </div>
            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl overflow-hidden z-[300]"
                    style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                    <div className="p-2 border-b border-slate-100">
                        <input autoFocus placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm outline-none bg-white" style={{ color: "#475569" }}/>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0
                            ? <div className="p-3 text-xs text-center" style={{ color: "#94a3b8" }}>No positions found.</div>
                            : filtered.map(c => (
                                <div key={c.id_position} onClick={() => { onChange(c); setOpen(false); }}
                                    className="px-3.5 py-2.5 text-sm cursor-pointer transition-colors"
                                    style={{ background: idValue === c.id_position ? "#eff6ff" : "transparent", color: "#475569" }}
                                    onMouseEnter={e => { if (idValue !== c.id_position) e.currentTarget.style.background = "#f8fafc"; }}
                                    onMouseLeave={e => { if (idValue !== c.id_position) e.currentTarget.style.background = "transparent"; }}>
                                    {c.name}
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Job Card ───────────────────────────────────────────────────────────────────
function JobCard({ job, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);

    const statusBadge = {
        published: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "rgba(59,130,246,0.2)", label: "PUBLISHED" },
        draft:     { bg: "rgba(255,255,255,0.9)",  color: "#64748b", border: "rgba(0,0,0,0.1)",       label: "DRAFT"      },
        closed:    { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", border: "rgba(239,68,68,0.2)",   label: "CLOSED"     },
    }[job.status] || { bg: "rgba(255,255,255,0.9)", color: "#64748b", border: "rgba(0,0,0,0.1)", label: job.status?.toUpperCase() };

    return (
        <div
            onClick={() => onEdit(job.id)}
            className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden cursor-pointer transition-all duration-200"
            style={{ boxShadow: hov ? "0 12px 32px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.06)" }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {/* Poster */}
            <div className="w-full relative bg-slate-100 overflow-hidden" style={{ height: 220 }}>
                {(job.photo || job.image) && (
                    <img
                        src={job.photo
                            ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${job.photo}`
                            : job.image}
                        alt="poster"
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Status badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
                    style={{ background: statusBadge.bg, color: statusBadge.color, border: `1px solid ${statusBadge.border}` }}>
                    {statusBadge.label}
                </div>
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(job.id); }} title="Edit"
                        className="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all"
                        style={{ background: "rgba(255,255,255,0.9)", color: "#334155", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#3b82f6"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#334155"; }}>
                        <IC.Edit/>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} title="Delete"
                        className="w-8 h-8 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all"
                        style={{ background: "rgba(255,255,255,0.9)", color: "#334155", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.color = "#334155"; }}>
                        <IC.Trash/>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-extrabold mb-3" style={{ color: "#0f172a" }}>
                    {job.nama} — Batch {job.batch}
                </h3>

                <p className="text-xs font-medium italic mb-1.5" style={{ color: "#475569" }}>Positions:</p>
                <div className="flex flex-col gap-1 mb-4">
                    {job.posisi.slice(0, 4).map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-sm" style={{ color: "#0f172a" }}>
                            <IC.Dot/><span>{p}</span>
                        </div>
                    ))}
                    {job.posisi.length > 4 && (
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: "#0f172a" }}>
                            <IC.Dot/><span>+{job.posisi.length - 4} more…</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm italic" style={{ color: "#9ca3af" }}>
                        <IC.Cal/><span>{job.startDate} — {job.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#0f172a" }}>
                        <IC.Location/><span>{job.kota}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm italic" style={{ color: "#ef4444" }}>
                        <IC.Deadline/><span>Deadline: {job.deadline}</span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md"
                        style={{ background: job.tipe === "flagship" ? "#fef3c7" : "#eff6ff", color: job.tipe === "flagship" ? "#d97706" : "#1e4d8c" }}>
                        {job.tipe === "flagship" ? "Flagship" : "Reguler"}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md"
                        style={{ background: job.payment === "paid" ? "#ecfdf5" : "#f8fafc", color: job.payment === "paid" ? "#059669" : "#64748b" }}>
                        {job.payment === "paid" ? "Paid" : "Unpaid"}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md ml-auto" style={{ background: "#f8fafc", color: "#64748b" }}>
                        {job.pelamar} Applicants · {job.kuota} Quota
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Candidate Item (inside modal) ──────────────────────────────────────────────
function CandidateItem({ sub }) {
    const [expanded, setExpanded] = useState(false);
    const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000";
    const docLink = { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", transition: "all .15s", textDecoration: "none" };

    const statusStyle = {
        accepted: { bg: "#ecfdf5", color: "#059669", border: "#10b98133" },
        rejected: { bg: "#fef2f2", color: "#dc2626", border: "#ef444433" },
    }[sub.status] || { bg: "#fff7ed", color: "#c2410c", border: "#f9731633" };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all" style={{ background: expanded ? "#f8fafc" : "#fff" }}>
            <div onClick={() => setExpanded(!expanded)} className="px-5 py-3.5 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold" style={{ background: "#eff6ff", color: "#3b82f6" }}>
                        {(sub.user?.name || "U").slice(0,1).toUpperCase()}
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold" style={{ color: "#0f172a" }}>{sub.user?.name}</div>
                        <div className="text-xs" style={{ color: "#64748b" }}>Applied for: <span style={{ color: "#2563c4", fontWeight: 600 }}>{sub.position?.name || "Unknown"}</span></div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-md capitalize border"
                        style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}>
                        {sub.status || "Pending"}
                    </span>
                    <div style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "0.2s", color: "#64748b" }}><IC.ChevronRight/></div>
                </div>
            </div>
            {expanded && (
                <div className="px-5 pb-5 text-left">
                    <div className="h-px mb-4" style={{ background: "#e2e8f0" }}/>
                    <div className="text-xs font-bold uppercase tracking-wide mb-2.5" style={{ color: "#64748b" }}>Documents</div>
                    <div className="flex flex-wrap gap-2">
                        {sub.cv_file && (
                            <a href={`${apiBase}/storage/${sub.cv_file}`} target="_blank" rel="noopener noreferrer" style={docLink}>
                                <IC.FileText/> CV / Resume
                            </a>
                        )}
                        {(sub.supporting_document_file || sub.cover_letter_file || sub.institution_letter_file) && (
                            <a href={`${apiBase}/storage/${sub.supporting_document_file || sub.cover_letter_file || sub.institution_letter_file}`} target="_blank" rel="noopener noreferrer" style={docLink}>
                                <IC.FileText/> Supporting Document
                            </a>
                        )}
                        {sub.portfolio_file && (
                            <a href={`${apiBase}/storage/${sub.portfolio_file}`} target="_blank" rel="noopener noreferrer" style={docLink}>
                                <IC.FileText/> Portfolio
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ open, editingJob, onClose, onSubmit, catalog }) {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState("detail");
    const [form, setForm]           = useState({ title: "", desc: "", kota: "", provinsi: "", alamat: "", batch: "", image: "", photoFile: null });
    const [tipe, setTipe]           = useState("");
    const [payment, setPayment]     = useState("");
    const [deadline, setDeadline]   = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate]     = useState("");
    const [posisi, setPosisi]       = useState([{ id_position: "", name: "", quota: "" }]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const fileInpRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        setActiveTab("detail");
        if (editingJob) {
            setForm({ title: editingJob.title || editingJob.nama, desc: editingJob.desc, kota: editingJob.kota, provinsi: editingJob.provinsi, alamat: editingJob.alamat, batch: editingJob.batch, image: editingJob.photo || editingJob.image || "", photoFile: null });
            setTipe(editingJob.tipe || editingJob.type);
            setPayment(editingJob.payment || editingJob.payment_type);
            setDeadline(editingJob.deadline);
            setStartDate(editingJob.startDate || "");
            setEndDate(editingJob.endDate || "");
            const mapped = (editingJob.positions || []).map(p => ({ id_position: p.id_position || "", name: p.name || "", quota: p.quota || p.pivot?.quota || 0 }));
            setPosisi(mapped.length > 0 ? mapped : [{ id_position: "", name: "", quota: "" }]);
        } else {
            setForm({ title: "", desc: "", kota: "", provinsi: "", alamat: "", batch: "", image: "", photoFile: null });
            setTipe(""); setPayment(""); setDeadline(""); setStartDate(""); setEndDate("");
            setPosisi([{ id_position: "", name: "", quota: "" }]);
        }
    }, [open, editingJob]);

    const handleGenerateAIDesc = async () => {
        if (!form.title) { showToast("Please fill in the Program Name first.", "error"); return; }
        setIsGeneratingAI(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/ai/generate`, {
                model: "llama3",
                prompt: `Tuliskan satu paragraf deskripsi profesional dan menarik (sekitar 30-50 kata) dalam bahasa Indonesia untuk program magang '${form.title}'. Berikan HANYA teks deskripsinya tanpa awalan, tanpa tanda kutip, dan tanpa penjelasan lain.`
            }, { headers: { Authorization: `Bearer ${token}` } });
            setForm(f => ({ ...f, desc: res.data.response.trim() }));
        } catch (e) {
            showToast(e.response?.data?.error || e.message || "Failed to connect to AI.", "error");
        } finally { setIsGeneratingAI(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setForm(f => ({ ...f, image: URL.createObjectURL(file), photoFile: file }));
    };

    const handleSubmit = (status) => {
        const filled = posisi.filter(p => p.name.trim());
        if (!form.title)             return showToast("Program Name is required.", "error");
        if (filled.length === 0)     return showToast("At least one position must be filled.", "error");
        if (status === "published") {
            if (!form.desc || !form.kota || !form.provinsi || !form.batch || !startDate || !endDate || !deadline || !tipe || !payment)
                return showToast("Please fill in all required fields before publishing.", "error");
            if (filled.some(p => !p.quota || p.quota <= 0))
                return showToast("All positions must have a quota.", "error");
        }
        onSubmit({ ...form, batch: +form.batch, startDate, endDate, deadline, tipe, payment, posisi: filled, status });
    };

    if (!open) return null;

    return (
        /* Backdrop */
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-3 sm:p-6"
            style={{ background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)" }}
        >
            {/* Modal container — responsive width */}
            <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col my-auto" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>

                {/* Header */}
                <div className="flex items-center justify-center px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-slate-200 relative">
                    <div className="text-center">
                        <div className="text-base sm:text-lg font-extrabold" style={{ color: "#0f172a" }}>{editingJob ? "Edit Program" : "Add New Program"}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>Fill in all internship program information.</div>
                    </div>
                    <button onClick={onClose}
                        className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer text-base"
                        style={{ color: "#64748b" }}>✕</button>
                </div>

                {/* Tabs (only when editing) */}
                {editingJob && (
                    <div className="flex border-b border-slate-200 px-5 sm:px-7 bg-slate-50">
                        {["detail", "pelamar"].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className="px-4 py-3 bg-transparent border-t-0 border-x-0 text-sm font-semibold cursor-pointer transition-all"
                                style={{
                                    borderBottom: activeTab === tab ? "2.5px solid #2563c4" : "2.5px solid transparent",
                                    color: activeTab === tab ? "#2563c4" : "#64748b",
                                }}>
                                {tab === "detail" ? "Program Detail" : "Candidate List"}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                {activeTab === "detail" ? (
                    <>
                        <div className="px-5 sm:px-7 py-5 sm:py-6 overflow-y-auto space-y-5" style={{ maxHeight: "62vh" }}>

                            {/* Basic Info */}
                            <SectionTitle>Basic Info</SectionTitle>
                            <FGroup label="Upload Poster (Optional)">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => fileInpRef.current.click()}
                                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer text-sm font-semibold"
                                        style={{ color: "#475569" }}>
                                        <IC.Upload/> Choose File
                                    </button>
                                    <input type="file" ref={fileInpRef} hidden accept="image/*" onChange={handleFileChange}/>
                                    {form.image && <span className="text-xs font-semibold" style={{ color: "#10b981" }}>Selected ✓</span>}
                                </div>
                            </FGroup>

                            <FGroup label="Program Name" req>
                                <input style={inpStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Software Engineer Intern Batch 8" onFocus={focusInp} onBlur={blurInp}/>
                            </FGroup>

                            <div className="text-left">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-semibold" style={{ color: "#334155" }}>
                                        Description <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <button onClick={(e) => { e.preventDefault(); handleGenerateAIDesc(); }} disabled={isGeneratingAI}
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-md border-none text-xs font-bold cursor-pointer transition-all"
                                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", opacity: isGeneratingAI ? 0.7 : 1 }}>
                                        <IC.Sparkles/> {isGeneratingAI ? "Generating…" : "Generate AI"}
                                    </button>
                                </div>
                                <textarea style={{ ...inpStyle, minHeight: 88, resize: "vertical", lineHeight: 1.6 }}
                                    value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                                    placeholder="Briefly describe this internship program…" onFocus={focusInp} onBlur={blurInp}/>
                            </div>

                            {/* Location */}
                            <div>
                                <SectionTitle>Internship Location</SectionTitle>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                                    <FGroup label="City" req>
                                        <input style={inpStyle} value={form.kota} onChange={e => setForm(f => ({ ...f, kota: e.target.value }))} placeholder="e.g. Jakarta" onFocus={focusInp} onBlur={blurInp}/>
                                    </FGroup>
                                    <FGroup label="Province" req>
                                        <input style={inpStyle} value={form.provinsi} onChange={e => setForm(f => ({ ...f, provinsi: e.target.value }))} placeholder="e.g. DKI Jakarta" onFocus={focusInp} onBlur={blurInp}/>
                                    </FGroup>
                                </div>
                                <FGroup label="Full Address">
                                    <input style={inpStyle} value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="e.g. Jl. Sudirman No. 1" onFocus={focusInp} onBlur={blurInp}/>
                                </FGroup>
                            </div>

                            {/* Program Detail */}
                            <div>
                                <SectionTitle>Program Detail</SectionTitle>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                                    <FGroup label="Start Date" req><CalendarPicker value={startDate} onChange={setStartDate}/></FGroup>
                                    <FGroup label="End Date"   req><CalendarPicker value={endDate}   onChange={setEndDate}/></FGroup>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                                    <FGroup label="Batch" req>
                                        <input style={inpStyle} type="number" min="1" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="e.g. 8" onFocus={focusInp} onBlur={blurInp}/>
                                    </FGroup>
                                    <FGroup label="Application Deadline" req><CalendarPicker value={deadline} onChange={setDeadline}/></FGroup>
                                </div>
                                <FGroup label="Internship Type" req>
                                    <PillGroup options={[{ value:"reguler", label:"Reguler" }, { value:"flagship", label:"Flagship" }]} value={tipe} onChange={setTipe}/>
                                </FGroup>
                                <div className="mt-3.5">
                                    <FGroup label="Payment Type" req>
                                        <PillGroup options={[{ value:"unpaid", label:"Unpaid" }, { value:"paid", label:"Paid" }]} value={payment} onChange={setPayment}/>
                                    </FGroup>
                                </div>
                            </div>

                            {/* Positions */}
                            <div>
                                <SectionTitle>Open Positions</SectionTitle>
                                <div className="flex flex-col gap-3">
                                    {posisi.map((p, i) => (
                                        <div key={i} className="flex gap-2 items-end">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold mb-1.5 text-left" style={{ color: "#64748b" }}>Position {i+1}</div>
                                                <PositionDropdown value={p.name} idValue={p.id_position} catalog={catalog}
                                                    onChange={(c) => { const next = [...posisi]; next[i] = { ...next[i], id_position: c.id_position, name: c.name }; setPosisi(next); }}/>
                                            </div>
                                            {/* Quota — narrower on mobile */}
                                            <div className="w-20 sm:w-24 flex-shrink-0">
                                                <div className="text-xs font-bold mb-1.5 text-left" style={{ color: "#64748b" }}>Quota</div>
                                                <input style={inpStyle} type="number" min="1" value={p.quota}
                                                    onChange={e => { const next = [...posisi]; next[i] = { ...next[i], quota: e.target.value }; setPosisi(next); }}
                                                    placeholder="0" onFocus={focusInp} onBlur={blurInp}/>
                                            </div>
                                            <button onClick={() => posisi.length > 1 && setPosisi(posisi.filter((_,j)=>j!==i))}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 self-end mb-0.5"
                                                style={{ border: "1px solid #fca5a5", background: "#fff1f2", color: "#ef4444", fontSize: 14 }}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setPosisi([...posisi, { id_position: "", name: "", quota: "" }])}
                                    className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 rounded-lg text-sm cursor-pointer transition-all"
                                    style={{ border: "1.5px dashed #e2e8f0", background: "transparent", color: "#64748b" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.color="#2563c4"; e.currentTarget.style.background="#eff6ff"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#64748b"; e.currentTarget.style.background="transparent"; }}>
                                    <IC.Plus/> Add Position
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 sm:px-7 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="text-xs" style={{ color: "#64748b" }}>Fields marked <b style={{ color: "#ef4444" }}>*</b> are required.</div>
                            <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
                                <button onClick={() => handleSubmit("draft")}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold cursor-pointer transition-all"
                                    style={{ color: "#475569" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.color="#2563c4"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}>
                                    <IC.Save/> Draft
                                </button>
                                {editingJob?.status === "published" && (
                                    <button onClick={() => handleSubmit("closed")}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-none text-sm font-bold text-white cursor-pointer"
                                        style={{ background: "#ef4444" }}
                                        onMouseEnter={e => { e.currentTarget.style.background="#dc2626"; }}
                                        onMouseLeave={e => { e.currentTarget.style.background="#ef4444"; }}>
                                        <IC.Lock/> Close
                                    </button>
                                )}
                                <button onClick={() => handleSubmit("published")}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-none text-sm font-bold text-white cursor-pointer"
                                    style={{ background: "#2563c4", boxShadow: "0 2px 6px rgba(37,99,235,.25)" }}
                                    onMouseEnter={e => { e.currentTarget.style.background="#1d4ed8"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background="#2563c4"; }}>
                                    <IC.Send/> {editingJob?.status === "published" ? "Save" : "Publish"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Candidate list tab */
                    <div className="px-5 sm:px-7 py-5 overflow-y-auto" style={{ maxHeight: "62vh" }}>
                        {(!editingJob?.submissions || editingJob.submissions.length === 0) ? (
                            <div className="py-12 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#f1f5f9", color: "#94a3b8" }}>
                                    <IC.Users/>
                                </div>
                                {editingJob?.status === "draft" ? (
                                    <>
                                        <div className="text-base font-extrabold" style={{ color: "#0f172a" }}>Cannot Receive Candidates</div>
                                        <p className="text-sm max-w-xs" style={{ color: "#64748b", lineHeight: 1.6 }}>Publish this program first so candidates can apply.</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-base font-extrabold" style={{ color: "#0f172a" }}>No Candidates Yet</div>
                                        <p className="text-sm max-w-xs" style={{ color: "#64748b", lineHeight: 1.6 }}>No one has applied to this program yet.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {editingJob.submissions.map((sub, idx) => <CandidateItem key={sub.id_submission || idx} sub={sub}/>)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Sidebar content shared between desktop sticky + mobile overlay ─────────────
function SidebarContent({ company, companyName, companyRole, initials, activeNav, setActiveNav, navItems, navItems2, navigate, onClose, onLogout }) {
    const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000";
    return (
        <>
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5 px-1.5 pb-5 no-underline">
                <img src="/assets/images/logo.png" alt="EarlyPath" className="h-11 object-contain flex-shrink-0"/>
                <span className="text-base font-extrabold text-white whitespace-nowrap tracking-tight">EarlyPath</span>
            </Link>

            <p className="text-xs font-bold px-3.5 pb-1 pt-1.5 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Main Menu</p>
            {navItems.map(n => (
                <SideItem key={n.label} icon={n.icon} label={n.label} badge={n.badge} active={activeNav === n.label}
                    onClick={() => { setActiveNav(n.label); if (n.path) navigate(n.path); if (onClose) onClose(); }}/>
            ))}

            <div className="h-px mx-2 my-3" style={{ background: "rgba(255,255,255,0.07)" }}/>
            <p className="text-xs font-bold px-3.5 pb-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Others</p>
            {navItems2.map(n => (
                <SideItem key={n.label} icon={n.icon} label={n.label} active={activeNav === n.label}
                    onClick={() => { navigate(n.path); setActiveNav(n.label); if (onClose) onClose(); }}/>
            ))}

            <div className="flex-1"/>

            {/* Profile */}
            <div className="border-t pt-3.5 flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {company?.logo_path ? (
                    <img src={`${apiBase}/storage/${company.logo_path}`} alt="Logo" className="w-9 h-9 rounded-xl object-cover"/>
                ) : (
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white" style={{ background: "linear-gradient(135deg,#2d7dd2,#4a9eff)" }}>
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate" style={{ fontSize: "12.5px" }}>{companyName}</div>
                    <div className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{companyRole}</div>
                </div>
                <button onClick={onLogout} title="Logout"
                    className="bg-transparent border-none cursor-pointer p-1 rounded-md flex transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={e => { e.currentTarget.style.color="#f87171"; e.currentTarget.style.background="rgba(248,113,113,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.35)"; e.currentTarget.style.background="transparent"; }}>
                    <IC.Logout/>
                </button>
            </div>
        </>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProgramManagement() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();

    const [jobs, setJobs]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [filter, setFilter]         = useState("all");
    const [search, setSearch]         = useState("");
    const [modalOpen, setModalOpen]   = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [logoutModal, setLogoutModal] = useState(false);
    const [activeNav, setActiveNav]   = useState("Program Management");
    const [catalog, setCatalog]       = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, jobId: null });
    const { toasts, pushToast, removeToast } = useHRToast();

    const comp = (() => { try { return JSON.parse(localStorage.getItem("company")); } catch { return null; } })();
    const companyName = comp?.name || "Admin";
    const companyRole = comp?.role  || "Admin";
    const initials    = companyName.slice(0,2).toUpperCase();

    useEffect(() => { fetchJobs(); fetchCatalog(); }, []);

    // Close mobile sidebar on desktop resize
    useEffect(() => {
        const fn = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const fetchCatalog = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog`, { headers: { Authorization: `Bearer ${token}` } });
            setCatalog(res.data);
        } catch (err) { console.error("Catalog fetch failed:", err); }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/vacancies`, { headers: { Authorization: `Bearer ${token}` } });
            const mapped = res.data.map(j => {
                const locParts = (j.location || "").split(", ");
                return {
                    ...j,
                    id:         j.id_vacancy,
                    nama:       j.title,
                    desc:       j.description,
                    kota:       locParts[0] || "",
                    provinsi:   locParts[1] || "",
                    alamat:     locParts[2] || "",
                    deadline:   formatDateToFrontend(j.deadline),
                    startDate:  formatDateToFrontend(j.start_date || j.deadline),
                    endDate:    formatDateToFrontend(j.end_date   || j.deadline),
                    tipe:       j.type,
                    payment:    j.payment_type,
                    kuota:      j.total_quota || 0,
                    posisi:     (j.positions || []).map(p => p.name || p),
                    submissions: j.submissions || [],
                };
            });
            setJobs(mapped);
        } catch (err) {
            console.error("Jobs fetch failed:", err);
            showToast("Failed to fetch data from server.", "error");
        } finally { setLoading(false); }
    };

    const showToast = (msg, type = "success") => {
        pushToast(msg, type, 3200);
    };

    const filtered = jobs.filter(j => {
        const mf = filter === "all" || j.status === filter;
        const ms = j.nama?.toLowerCase().includes(search.toLowerCase()) || j.kota?.toLowerCase().includes(search.toLowerCase());
        return mf && ms;
    });

    const handleModalSubmit = async (data) => {
        if (data.status === "published" && data.deadline) {
            const dDate = new Date(data.deadline);
            const today = new Date(); today.setHours(0,0,0,0);
            if (dDate < today) { showToast("Deadline must be in the future to publish.", "error"); return; }
        }
        try {
            const fd = new FormData();
            fd.append("title", data.title);
            fd.append("description", data.desc);
            fd.append("city", data.kota);
            fd.append("province", data.provinsi);
            fd.append("address", data.alamat || "");
            fd.append("batch", parseInt(data.batch));
            fd.append("deadline",   formatDateToBackend(data.deadline));
            fd.append("start_date", formatDateToBackend(data.startDate));
            fd.append("end_date",   formatDateToBackend(data.endDate));
            fd.append("type", data.tipe);
            fd.append("payment_type", data.payment);
            fd.append("status", data.status);
            data.posisi.forEach((p, i) => {
                if (p.id_position) fd.append(`positions[${i}][id_position]`, p.id_position);
                fd.append(`positions[${i}][name]`,  p.name);
                fd.append(`positions[${i}][quota]`, p.quota);
            });
            if (data.photoFile) fd.append("photo", data.photoFile);

            const base = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/vacancies`;
            const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };

            if (editingJob) {
                fd.append("_method", "PUT");
                await axios.post(`${base}/${editingJob.id}`, fd, { headers });
                showToast("Program updated successfully.");
            } else {
                await axios.post(base, fd, { headers });
                showToast(`Program ${data.status === "published" ? "published" : "saved as draft"}.`);
            }
            fetchJobs();
            setModalOpen(false);
            setEditingJob(null);
        } catch (err) {
            console.error("Save failed:", err);
            const errors = err.response?.data?.errors;
            const msg = err.response?.data?.message || (errors ? Object.values(errors).flat()[0] : null) || "Failed to save program.";
            showToast(msg, "error");
        }
    };

    const handleDelete = async (id) => {
        setDeleteConfirm({ open: true, jobId: id });
    };

    const confirmDelete = async (id) => {
        setDeleteConfirm({ open: false, jobId: null });
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/vacancies/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Program deleted successfully.");
            fetchJobs();
        } catch (err) {
            console.error("Delete failed:", err);
            showToast("Failed to delete program.", "error");
        }
    };

    const navItems  = [
        { label: "Dashboard",           icon: <IC.Dashboard/>, path: "/dashboard" },
        { label: "User Management",     icon: <IC.Users/>,     path: "/users",     badge: 0 },
        { label: "Program Management",  icon: <IC.Briefcase/>, path: "/programs" },
        { label: "Positions Management",icon: <IC.Book/>,      path: "/positions" },
    ];
    const navItems2 = [{ label: "Settings", icon: <IC.Settings/>, path: "/settings" }];

    const sidebarSharedProps = { company: comp, companyName, companyRole, initials, activeNav, setActiveNav, navItems, navItems2, navigate, onLogout: () => setLogoutModal(true) };

    // Filter counts
    const counts = {
        all:       jobs.length,
        published: jobs.filter(j => j.status === "published").length,
        draft:     jobs.filter(j => j.status === "draft").length,
        closed:    jobs.filter(j => j.status === "closed").length,
    };

    return (
        <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins','Segoe UI',sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .fade-in { animation: fadeIn .35s ease both; }
                @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
                .sidebar-slide { animation: slideIn .25s ease both; }
            `}</style>

            {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)}>
                    <aside
                        className="sidebar-slide absolute left-0 top-0 bottom-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden p-5"
                        style={{ width: 260, background: "linear-gradient(180deg,#0f1c2e 0%,#0d1a28 100%)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-base font-extrabold text-white">Menu</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-white/50 border-none bg-transparent cursor-pointer p-1"><IC.Close/></button>
                        </div>
                        <SidebarContent {...sidebarSharedProps} onClose={() => setSidebarOpen(false)}/>
                    </aside>
                </div>
            )}

            {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto overflow-x-hidden gap-1 p-3"
                style={{ width: 250, background: "linear-gradient(180deg,#0f1c2e 0%,#0d1a28 100%)" }}>
                <SidebarContent {...sidebarSharedProps} onClose={null}/>
            </aside>

            {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* ── TOPBAR ─────────────────────────────────────────────────── */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
                    {/* Hamburger */}
                    <button onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-slate-600 flex-shrink-0">
                        <IC.Menu/>
                    </button>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold" style={{ color: "#1e293b" }}>Program Management</span>
                        <span className="text-xs mx-1.5" style={{ color: "#94a3b8" }}>/</span>
                        <span className="text-xs hidden sm:inline" style={{ color: "#94a3b8" }}>Management</span>
                    </div>
                </header>

                {/* ── PAGE BODY ──────────────────────────────────────────────── */}
                <main className="flex-1 p-4 md:p-6 lg:p-7 pb-10 text-left fade-in">

                    {/* Page header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-lg sm:text-xl font-extrabold" style={{ color: "#0f172a", lineHeight: 1.2 }}>Program Management</div>
                            <div className="text-xs sm:text-sm mt-0.5" style={{ color: "#64748b" }}>Manage all internship programs available on the platform.</div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                            {/* Search */}
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-56">
                                <IC.Search/>
                                <input
                                    placeholder="Search by name or city…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-none bg-transparent outline-none text-xs w-full"
                                    style={{ color: "#64748b", fontFamily: "inherit" }}
                                />
                            </div>
                            {/* Add button */}
                            <button onClick={() => { setEditingJob(null); setModalOpen(true); }}
                                className="flex items-center justify-center gap-2 border-none rounded-xl px-4 py-2 text-sm font-semibold text-white cursor-pointer flex-shrink-0 transition-colors"
                                style={{ background: "#2563c4", boxShadow: "0 2px 8px rgba(37,99,235,.3)" }}
                                onMouseEnter={e => { e.currentTarget.style.background="#1d4ed8"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="#2563c4"; }}>
                                <IC.Plus/> Add Program
                            </button>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {[
                            { key: "all",       label: "All"       },
                            { key: "published", label: "Published" },
                            { key: "draft",     label: "Draft"     },
                            { key: "closed",    label: "Closed"    },
                        ].map(t => (
                            <button key={t.key} onClick={() => setFilter(t.key)}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all"
                                style={{
                                    borderColor: filter === t.key ? "#2563c4" : "#e2e8f0",
                                    background:  filter === t.key ? "#2563c4" : "#fff",
                                    color:       filter === t.key ? "#fff"    : "#64748b",
                                }}>
                                {t.label}
                                <span className="rounded-full px-1.5 py-0.5 text-xs"
                                    style={{ background: filter===t.key ? "rgba(255,255,255,.25)" : "#f8fafc", color: filter===t.key ? "#fff" : "#64748b" }}>
                                    {counts[t.key]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
                                    <div className="h-56 bg-slate-100"/>
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-slate-100 rounded w-3/4"/>
                                        <div className="h-3 bg-slate-100 rounded w-1/2"/>
                                        <div className="h-3 bg-slate-100 rounded w-2/3"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="mb-4" style={{ color: "#cbd5e1" }}><IC.Briefcase/></div>
                            <div className="text-lg font-bold mb-2" style={{ color: "#0f172a" }}>No programs yet</div>
                            <p className="text-sm mb-6 max-w-xs" style={{ color: "#64748b" }}>Add your first program by pressing the <b>"Add Program"</b> button.</p>
                            <button onClick={() => { setEditingJob(null); setModalOpen(true); }}
                                className="flex items-center gap-2 border-none rounded-xl px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
                                style={{ background: "#2563c4" }}>
                                <IC.Plus/> Add Program
                            </button>
                        </div>
                    )}

                    {/* Cards grid — 1 col → 2 col (sm) → 3 col (xl) */}
                    {!loading && filtered.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                            {filtered.map(j => (
                                <JobCard key={j.id} job={j}
                                    onEdit={(id) => { setEditingJob(jobs.find(x => x.id === id) || null); setModalOpen(true); }}
                                    onDelete={(id) => setDeletingId(id)}/>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* ── MODAL ─────────────────────────────────────────────────────── */}
            <Modal open={modalOpen} editingJob={editingJob} onClose={() => { setModalOpen(false); setEditingJob(null); }} onSubmit={handleModalSubmit} catalog={catalog}/>

            {/* ── DELETE CONFIRM ─────────────────────────────────────────────── */}
            {deletingId && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,.5)" }}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                        <div className="mb-4" style={{ color: "#ef4444" }}><IC.Trash/></div>
                        <div className="text-base font-extrabold mb-1.5" style={{ color: "#0f172a" }}>Delete Program?</div>
                        <div className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>This action cannot be undone. The program and all its data will be permanently deleted.</div>
                        <div className="flex gap-2.5 justify-end">
                            <button onClick={() => setDeletingId(null)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer" style={{ color: "#334155" }}>
                                Cancel
                            </button>
                            <button onClick={() => { handleDelete(deletingId); setDeletingId(null); }}
                                className="px-4 py-2.5 rounded-xl border-none text-sm font-bold text-white cursor-pointer" style={{ background: "#ef4444" }}>
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LOGOUT CONFIRM ─────────────────────────────────────────────── */}
            {logoutModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,.5)" }}>
                    <div className="bg-white rounded-2xl p-6 md:p-7 w-full max-w-sm" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                        <div className="mb-4" style={{ color: "#3b82f6" }}><IC.Users/></div>
                        <div className="text-base font-extrabold mb-1.5" style={{ color: "#0f172a" }}>Sign Out?</div>
                        <div className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>Are you sure you want to sign out from your company account?</div>
                        <div className="flex gap-2.5 justify-end">
                            <button onClick={() => setLogoutModal(false)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer" style={{ color: "#64748b" }}>
                                Cancel
                            </button>
                            <button onClick={async () => { await logout(); navigate("/", { replace: true }); }}
                                className="px-4 py-2.5 rounded-xl border-none text-sm font-bold text-white cursor-pointer" style={{ background: "#ef4444" }}>
                                Yes, Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <HRToastStack toasts={toasts} onDismiss={removeToast}/>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-left" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                        <h3 className="text-base font-extrabold m-0" style={{ color: "#0f172a" }}>Delete Program?</h3>
                        <p className="text-sm leading-relaxed my-4" style={{ color: "#64748b" }}>Are you sure you want to delete this program? This action cannot be undone.</p>
                        <div className="flex gap-2.5 justify-end">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, jobId: null })}
                                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold cursor-pointer"
                                style={{ color: "#64748b", fontFamily: "inherit" }}
                            >Cancel</button>
                            <button
                                onClick={() => confirmDelete(deleteConfirm.jobId)}
                                className="px-4 py-2 rounded-xl border-none text-xs font-bold text-white cursor-pointer"
                                style={{ background: "#ef4444", fontFamily: "inherit" }}
                            >Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}