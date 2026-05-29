import { useState, useEffect } from "react";
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
    Bell:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Search:       () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
    Plus:         () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Cal:          () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Edit:         () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash:        () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    ChevronRight: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>,
    FileText:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    Sparkles:     () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
    Lock:         () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Unlock:       () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
    Copy:         () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    Menu:         () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
    Close:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [y, m, d] = dateStr.split("-");
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
};

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ msg, type, visible }) {
    return (
        <div className="fixed bottom-6 right-4 sm:right-7 z-50 pointer-events-none flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl transition-all duration-300"
            style={{
                background: type === "success" ? "#064e3b" : "#7f1d1d",
                color: "#fff",
                transform: visible ? "translateY(0)" : "translateY(80px)",
                opacity: visible ? 1 : 0,
                maxWidth: "calc(100vw - 32px)",
            }}
        >
            {type === "success"
                ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            }
            <span className="truncate">{msg}</span>
        </div>
    );
}

function SectionTitle({ children, style }) {
    return (
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest mb-3.5" style={{ color: "#64748b", ...style }}>
            {children}
            <div className="flex-1 h-px opacity-70" style={{ background: "#e2e8f0" }} />
        </div>
    );
}

// ── SideItem ─────────────────────────────────────────────────────
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
                <span className="rounded-full text-xs font-bold px-2 py-0.5 min-w-[20px] text-center text-white" style={{ background: "#4a9eff", fontSize: "11px" }}>
                    {badge}
                </span>
            )}
        </button>
    );
}

// ── CandidateItem ─────────────────────────────────────────────────
function CandidateItem({ sub }) {
    const [expanded, setExpanded] = useState(false);

    const statusStyle = {
        background: sub.status === "accepted" ? "#ecfdf5" : sub.status === "rejected" ? "#fef2f2" : "#fff7ed",
        color: sub.status === "accepted" ? "#059669" : sub.status === "rejected" ? "#dc2626" : "#c2410c",
        border: `1px solid ${sub.status === "accepted" ? "#10b98133" : sub.status === "rejected" ? "#ef444433" : "#f9731633"}`,
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all" style={{ background: expanded ? "#f8fafc" : "#fff" }}>
            {/* Header row — wraps gracefully on mobile */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer flex-wrap"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0" style={{ background: "#eff6ff", color: "#3b82f6" }}>
                        {(sub.user?.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="text-left min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: "#0f172a" }}>{sub.user?.name}</div>
                        <div className="text-xs truncate" style={{ color: "#64748b" }}>
                            Email: <span className="font-semibold" style={{ color: "#2563c4" }}>{sub.user?.email || "-"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded capitalize" style={statusStyle}>
                        {sub.status || "Pending"}
                    </span>
                    <div className="transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", color: "#64748b" }}>
                        <Icon.ChevronRight />
                    </div>
                </div>
            </div>

            {/* Expanded documents */}
            {expanded && (
                <div className="px-4 pb-4 text-left">
                    <div className="h-px mb-4 opacity-50" style={{ background: "#e2e8f0" }} />
                    <div className="text-xs font-bold uppercase tracking-wide mb-2.5" style={{ color: "#64748b" }}>Candidate Documents</div>
                    <div className="flex flex-wrap gap-2">
                        {sub.cv_file && (
                            <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${sub.cv_file}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold no-underline transition-colors hover:bg-slate-50"
                                style={{ color: "#475569" }}
                            >
                                <Icon.FileText /> CV / Resume
                            </a>
                        )}
                        {sub.portfolio_file && (
                            <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${sub.portfolio_file}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold no-underline transition-colors hover:bg-slate-50"
                                style={{ color: "#475569" }}
                            >
                                <Icon.FileText /> Additional Portfolio
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── SubmissionModal ───────────────────────────────────────────────
function SubmissionModal({ open, program, onClose }) {
    if (!open) return null;
    return (
        /* Overlay — p-4 keeps modal off screen edges on phones */
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-40 flex items-start justify-center p-4 overflow-y-auto"
            style={{ background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)" }}
        >
            <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col my-auto" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                {/* Header */}
                <div className="relative flex items-center justify-center px-6 py-5 border-b border-slate-200 text-center">
                    <div>
                        <div className="text-base font-extrabold" style={{ color: "#0f172a" }}>Candidate List</div>
                        <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                            Viewing candidates for {program?.position_name} in program {program?.vacancy_title}.
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-5 w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer text-base" style={{ color: "#64748b" }}>✕</button>
                </div>

                {/* Body */}
                <div className="p-5 md:p-6 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                    {(!program?.applicants || program.applicants.length === 0) ? (
                        <div className="py-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#f1f5f9", color: "#94a3b8" }}><Icon.Users /></div>
                            <h3 className="text-lg font-extrabold mb-2" style={{ color: "#0f172a" }}>No Candidates Yet</h3>
                            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#64748b" }}>Currently there are no candidates for this position.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {program.applicants.map((sub, idx) => <CandidateItem key={sub.id_submission || idx} sub={sub} />)}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 md:px-6 py-4 border-t border-slate-200 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer" style={{ color: "#475569" }}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ── ProgramCard ───────────────────────────────────────────────────
function ProgramCard({ program, onEdit, onDelete }) {
    const [hov, setHov] = useState(false);
    const statusColor = program.vacancy_status === "published" ? "#10b981" : program.vacancy_status === "closed" ? "#ef4444" : "#94a3b8";

    return (
        <div
            onClick={() => onEdit(program)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden cursor-pointer transition-all text-left"
            style={{
                borderTop: `3px solid ${statusColor}`,
                boxShadow: hov ? "0 12px 32px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.06)",
            }}
        >
            {/* Cover image */}
            <div className="w-full relative" style={{ height: 140 }}>
                <div className="absolute inset-0"
                    style={{ background: program.vacancy_photo ? `url(${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${program.vacancy_photo}) center/cover` : "#e2e8f0" }}
                />
                {/* Status badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase border"
                    style={{ background: "rgba(255,255,255,0.9)", color: "#64748b", border: "1px solid rgba(0,0,0,0.1)", backdropFilter: "blur(4px)" }}>
                    {program.vacancy_status}
                </div>
                {/* Delete button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(program); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
                    style={{ background: "rgba(255,255,255,0.9)", color: "#ef4444" }}
                >
                    <Icon.Trash />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 md:p-5 flex flex-col gap-3">
                <div>
                    <h3 className="text-base md:text-lg font-extrabold mb-1" style={{ color: "#000" }}>{program.position_name}</h3>
                    <p className="text-xs md:text-sm" style={{ color: "#64748b" }}>{program.vacancy_title}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                        <Icon.Cal />
                        <span>{formatDate(program.vacancy_start_date)} - {formatDate(program.vacancy_end_date)}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg border" style={{ color: "#2563eb", background: "#eff6ff", border: "1px solid #dbeafe" }}>
                            {program.position_quota || 0} Quota
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200" style={{ color: "#64748b", background: "#f8fafc" }}>
                            {program.applicants?.length || 0} Candidates
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── CatalogItem ───────────────────────────────────────────────────
// FIXED: On mobile, button labels hide to show icons only, preventing overflow
function CatalogItem({ item, onEdit, onDelete, onLock, onDuplicate }) {
    const [hov, setHov] = useState(false);

    const btnBase = "flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border";

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            className="px-4 md:px-6 py-3.5 md:py-4 flex items-center justify-between border-b border-slate-50 transition-colors"
            style={{ background: hov ? "#f8fafc" : "#fff" }}
        >
            {/* Left: name + badges */}
            <div className="text-left flex flex-col gap-1 min-w-0 mr-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold truncate" style={{ color: "#0f172a" }}>{item.name}</span>
                    {item.locked && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap"
                            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                            <Icon.Lock /> Locked
                        </span>
                    )}
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                    {item.competencies?.length || 0} competencies
                </div>
            </div>

            {/* Right: action buttons
                Labels visible on md+, icon-only on mobile to prevent overflow */}
            <div className="flex gap-1.5 flex-shrink-0 transition-opacity" style={{ opacity: hov ? 1 : 0.55 }}>

                {/* Duplicate */}
                <button
                    onClick={() => onDuplicate(item)}
                    title="Duplicate this position"
                    className={`${btnBase} border-blue-200 bg-blue-50`}
                    style={{ color: "#2563c4" }}
                >
                    <Icon.Copy />
                    <span className="hidden sm:inline">Duplicate</span>
                </button>

                {/* Lock / Unlock */}
                <button
                    onClick={() => onLock(item)}
                    title={item.locked ? "Unlock this position" : "Lock this position"}
                    className={`${btnBase}`}
                    style={{
                        color: item.locked ? "#92400e" : "#475569",
                        borderColor: item.locked ? "#fde68a" : "#e2e8f0",
                        background: item.locked ? "#fffbeb" : "#fff",
                    }}
                >
                    {item.locked ? <Icon.Unlock /> : <Icon.Lock />}
                    <span className="hidden md:inline">{item.locked ? "Unlock" : "Lock"}</span>
                </button>

                {/* Edit */}
                <button
                    onClick={() => !item.locked && onEdit(item)}
                    disabled={item.locked}
                    title={item.locked ? "Unlock position to edit" : "Edit position"}
                    className={`${btnBase} border-slate-200`}
                    style={{
                        background: "#fff",
                        color: "#475569",
                        cursor: item.locked ? "not-allowed" : "pointer",
                        opacity: item.locked ? 0.4 : 1,
                    }}
                >
                    <Icon.Edit />
                    <span className="hidden sm:inline">Edit</span>
                </button>

                {/* Delete */}
                <button
                    onClick={() => !item.locked && onDelete(item.id_position)}
                    disabled={item.locked}
                    title={item.locked ? "Unlock position to delete" : "Delete position"}
                    className={`${btnBase}`}
                    style={{
                        color: item.locked ? "#cbd5e1" : "#ef4444",
                        borderColor: item.locked ? "#f1f5f9" : "#fee2e2",
                        background: "#fff",
                        cursor: item.locked ? "not-allowed" : "pointer",
                        opacity: item.locked ? 0.4 : 1,
                    }}
                >
                    <Icon.Trash />
                </button>
            </div>
        </div>
    );
}

// ── PositionModal ─────────────────────────────────────────────────
function PositionModal({ open, item, onClose, onSave }) {
    const { token } = useAuthStore();
    const [form, setForm] = useState({ name: "", competencies: [], selection_flow: [] });
    const [generatingIndex, setGeneratingIndex] = useState(null);
    const [generatingFlowIndex, setGeneratingFlowIndex] = useState(null);

    useEffect(() => {
        if (open) {
            setForm({
                name: item?.name || "",
                competencies: (item?.competencies || []).map(c => ({
                    name: c.name || "", learning_hours: c.learning_hours || 0, description: c.description || ""
                })),
                selection_flow: (item?.selection_flow || []).map(f => ({
                    type: f.type || "", name: f.name || "", description: f.description || ""
                }))
            });
        }
    }, [open, item]);

    if (!open) return null;

    const handleCompChange = (i, field, val) => {
        const next = [...form.competencies]; next[i][field] = val; setForm({ ...form, competencies: next });
    };

    const handleGenerateAI = async (i) => {
        const compName = form.competencies[i].name;
        const posName = form.name;
        if (!compName || !posName) { alert("Please fill in the Position Name and Competency Name first."); return; }
        setGeneratingIndex(i);
        try {
            const prompt = `Tuliskan satu kalimat deskripsi profesional dan deskriptif (sekitar 15-25 kata) dalam bahasa Indonesia untuk kompetensi '${compName}' pada posisi pekerjaan '${posName}'. Berikan HANYA teks deskripsinya tanpa awalan, tanpa tanda kutip, dan tanpa penjelasan lain.`;
            const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/ai/generate`, { model: "llama3", prompt }, { headers: { Authorization: `Bearer ${token}` } });
            handleCompChange(i, "description", res.data.response.trim());
        } catch (e) { alert(e.response?.data?.error || e.message || "Failed to connect to AI."); }
        finally { setGeneratingIndex(null); }
    };

    const handleFlowChange = (i, field, val) => {
        const next = [...form.selection_flow]; next[i][field] = val; setForm({ ...form, selection_flow: next });
    };

    const handleGenerateAIFlow = async (i) => {
        const flowName = form.selection_flow[i].name;
        const posName = form.name;
        if (!flowName || !posName) { alert("Please fill in the Position Name and Stage Title first."); return; }
        setGeneratingFlowIndex(i);
        try {
            const prompt = `Tuliskan satu paragraf singkat deskripsi instruksi HR untuk tahap seleksi '${flowName}' pada posisi '${posName}'. Berikan HANYA teks deskripsinya tanpa awalan, tanpa tanda kutip.`;
            const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/ai/generate`, { model: "llama3", prompt }, { headers: { Authorization: `Bearer ${token}` } });
            handleFlowChange(i, "description", res.data.response.trim());
        } catch (e) { alert(e.response?.data?.error || e.message); }
        finally { setGeneratingFlowIndex(null); }
    };

    // Shared input style — kept inline for easy override
    const inp = { textAlign: "left", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontFamily: "inherit", fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", width: "100%", transition: "all .15s" };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
            style={{ background: "rgba(10,22,40,.55)", backdropFilter: "blur(4px)" }}
        >
            <div className="bg-white rounded-2xl w-full max-w-xl my-auto" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                {/* Header */}
                <div className="px-5 md:px-7 py-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="text-left">
                        <h2 className="text-base font-extrabold m-0" style={{ color: "#0f172a" }}>
                            {item?.id_position ? "Edit Position" : "Add New Position"}
                        </h2>
                        <p className="text-xs mt-1" style={{ color: "#64748b" }}>Enter position details and competencies.</p>
                    </div>
                    <button onClick={onClose} className="border-none bg-transparent text-lg cursor-pointer" style={{ color: "#64748b" }}>✕</button>
                </div>

                {/* Scrollable body */}
                <div className="px-5 md:px-7 py-5 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>

                    {/* Position name */}
                    <div className="text-left">
                        <label className="text-xs font-bold block mb-1.5" style={{ color: "#475569" }}>NAME</label>
                        <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Frontend Developer" />
                    </div>

                    {/* ── Selection Flow ─────────────────────────────── */}
                    <div className="text-left">
                        <label className="text-xs font-bold block mb-3" style={{ color: "#475569" }}>SELECTION FLOW</label>
                        {form.selection_flow.map((f, i) => (
                            <div key={i} className="p-4 border border-slate-200 rounded-xl relative mb-3" style={{ background: "#f8fafc" }}>
                                {/* Stage type + title — stacks on mobile via flex-col sm:grid */}
                                <div className={`flex flex-col gap-3 mb-3 ${f.type !== "screening" ? "sm:grid sm:grid-cols-2" : ""}`}>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#64748b" }}>Stage Type</label>
                                        <select style={inp} value={f.type} onChange={e => {
                                            const newType = e.target.value;
                                            handleFlowChange(i, "type", newType);
                                            if (newType === "screening") { handleFlowChange(i, "name", "Screening CV & Portfolio"); handleFlowChange(i, "description", ""); }
                                            else { handleFlowChange(i, "name", ""); }
                                        }}>
                                            <option value="">-- Select Type --</option>
                                            <option value="screening">Screening (CV/Porto)</option>
                                            <option value="test">Test / Assessment</option>
                                            <option value="interview">Interview</option>
                                        </select>
                                    </div>
                                    {f.type !== "screening" && (
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#64748b" }}>Stage Title / Activity</label>
                                            <input style={inp} value={f.name} onChange={e => handleFlowChange(i, "name", e.target.value)} placeholder="e.g. Wawancara User" />
                                        </div>
                                    )}
                                </div>

                                {/* AI description for non-screening steps */}
                                {f.type !== "screening" && (
                                    <>
                                        <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                                            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>Instructions / Description</label>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateAIFlow(i)}
                                                disabled={generatingFlowIndex === i}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border-none cursor-pointer"
                                                style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", opacity: generatingFlowIndex === i ? 0.7 : 1, boxShadow: "0 2px 6px rgba(16,185,129,.3)", fontFamily: "inherit" }}
                                            >
                                                <Icon.Sparkles />
                                                {generatingFlowIndex === i ? "Generating..." : "Generate AI"}
                                            </button>
                                        </div>
                                        <textarea style={{ ...inp, minHeight: 80 }} value={f.description} onChange={e => handleFlowChange(i, "description", e.target.value)} placeholder="What HR should evaluate in this stage..." />
                                    </>
                                )}

                                {/* Remove button */}
                                <button
                                    onClick={() => setForm({ ...form, selection_flow: form.selection_flow.filter((_, j) => j !== i) })}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer text-sm"
                                    style={{ background: "#fff", color: "#ef4444", borderColor: "#fee2e2" }}
                                >✕</button>
                            </div>
                        ))}
                        <button
                            onClick={() => setForm({ ...form, selection_flow: [...form.selection_flow, { type: "", name: "", description: "" }] })}
                            className="w-full py-2.5 border-dashed border-2 border-slate-200 rounded-xl bg-transparent text-xs font-bold cursor-pointer mb-3"
                            style={{ color: "#64748b", fontFamily: "inherit" }}
                        >+ Add Selection Stage</button>
                    </div>

                    {/* ── Competencies ───────────────────────────────── */}
                    <div className="text-left">
                        <label className="text-xs font-bold block mb-3" style={{ color: "#475569" }}>COMPETENCIES</label>
                        {form.competencies.map((c, i) => (
                            <div key={i} className="p-4 border border-slate-200 rounded-xl relative mb-3" style={{ background: "#f8fafc" }}>
                                {/* Name + hours — stacks on mobile */}
                                <div className="flex flex-col sm:grid gap-3 mb-3" style={{ gridTemplateColumns: "1fr 100px" }}>
                                    <input style={inp} value={c.name} onChange={e => handleCompChange(i, "name", e.target.value)} placeholder="Competency name" />
                                    <input style={inp} type="number" value={c.learning_hours} onChange={e => handleCompChange(i, "learning_hours", e.target.value)} placeholder="Hours" />
                                </div>

                                {/* Description + AI */}
                                <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                                    <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#64748b" }}>Description</label>
                                    <button
                                        onClick={() => handleGenerateAI(i)}
                                        disabled={generatingIndex === i}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border-none cursor-pointer"
                                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", opacity: generatingIndex === i ? 0.7 : 1, boxShadow: "0 2px 6px rgba(99,102,241,.3)", fontFamily: "inherit" }}
                                    >
                                        <Icon.Sparkles />
                                        {generatingIndex === i ? "Generating..." : "Generate AI"}
                                    </button>
                                </div>
                                <textarea style={{ ...inp, minHeight: 80 }} value={c.description} onChange={e => handleCompChange(i, "description", e.target.value)} placeholder="Short description..." />

                                {/* Remove */}
                                <button
                                    onClick={() => setForm({ ...form, competencies: form.competencies.filter((_, j) => j !== i) })}
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer text-sm"
                                    style={{ background: "#fff", color: "#ef4444", borderColor: "#fee2e2" }}
                                >✕</button>
                            </div>
                        ))}
                        <button
                            onClick={() => setForm({ ...form, competencies: [...form.competencies, { name: "", learning_hours: "", description: "" }] })}
                            className="w-full py-2.5 border-dashed border-2 border-slate-200 rounded-xl bg-transparent text-xs font-bold cursor-pointer"
                            style={{ color: "#64748b", fontFamily: "inherit" }}
                        >+ Add Competency</button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-7 py-4 border-t border-slate-200 flex justify-end gap-2.5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs cursor-pointer"
                        style={{ color: "#64748b", fontFamily: "inherit" }}
                    >Cancel</button>
                    <button
                        onClick={() => {
                            const cleanedForm = { ...form, competencies: form.competencies.map(c => ({ ...c, learning_hours: parseInt(c.learning_hours, 10) || 0 })) };
                            onSave(item?.id_position, cleanedForm);
                        }}
                        className="px-5 py-2.5 rounded-xl border-none font-extrabold text-xs text-white cursor-pointer"
                        style={{ background: "#2563c4", fontFamily: "inherit" }}
                    >Save</button>
                </div>
            </div>
        </div>
    );
}

// ── ConfirmModal ──────────────────────────────────────────────────
function ConfirmModal({ open, title, message, confirmLabel, confirmColor = "#ef4444", onConfirm, onCancel }) {
    if (!open) return null;
    return (
        /* p-4 ensures modal never touches edges on phones */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,.5)" }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-left" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
                <h3 className="text-base font-extrabold m-0" style={{ color: "#0f172a" }}>{title}</h3>
                <p className="text-sm leading-relaxed my-3" style={{ color: "#64748b" }}>{message}</p>
                <div className="flex gap-2.5 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold cursor-pointer"
                        style={{ color: "#64748b", fontFamily: "inherit" }}
                    >Cancel</button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl border-none text-xs font-bold text-white cursor-pointer"
                        style={{ background: confirmColor, fontFamily: "inherit" }}
                    >{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

// ── Sidebar (shared for desktop + mobile overlay) ─────────────────
function SidebarContent({ navItems, navItems2, comp, companyName, initials, navigate, onLogout, onClose }) {
    return (
        <>
            <Link to="/" onClick={onClose} className="flex items-center gap-2.5 px-1.5 pb-5 no-underline">
                <img src="/assets/images/logo.png" alt="Logo" className="h-11 object-contain flex-shrink-0" />
                <span className="text-base font-extrabold text-white tracking-tight whitespace-nowrap">EarlyPath</span>
            </Link>
            <p className="text-xs font-bold px-3.5 pb-1 pt-1.5 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Main Menu</p>
            {navItems.map((n) => (
                <SideItem key={n.label} icon={n.icon} label={n.label} active={n.label === "Positions Management"}
                    onClick={() => { if (n.path !== "/positions") navigate(n.path); if (onClose) onClose(); }} />
            ))}
            <div className="h-px mx-2 my-3" style={{ background: "rgba(255,255,255,0.07)" }} />
            <p className="text-xs font-bold px-3.5 pb-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Others</p>
            {navItems2.map((n) => (
                <SideItem key={n.label} icon={n.icon} label={n.label} active={false}
                    onClick={() => { navigate(n.path); if (onClose) onClose(); }} />
            ))}
            <div className="flex-1" />
            <div className="border-t pt-3.5 flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {comp?.logo_path
                    ? <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000"}/storage/${comp.logo_path}`}
                        alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
                    : <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white"
                        style={{ background: "linear-gradient(135deg, #2d7dd2, #4a9eff)" }}>{initials}</div>
                }
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate" style={{ fontSize: "12.5px" }}>{companyName}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Admin</div>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-transparent border-none cursor-pointer p-1 rounded-md flex transition-colors"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                >
                    <Icon.Logout />
                </button>
            </div>
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function PositionsManagement() {
    const navigate = useNavigate();
    const { logout, token } = useAuthStore();

    const [programs, setPrograms]             = useState([]);
    const [catalog, setCatalog]               = useState([]);
    const [loading, setLoading]               = useState(true);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [isCatalogVisible, setIsCatalogVisible] = useState(true);
    const [filter, setFilter]                 = useState("all");
    const [search, setSearch]                 = useState("");
    const [sidebarOpen, setSidebarOpen]       = useState(false);

    const [selectedProg, setSelectedProg]           = useState(null);
    const [deletingProg, setDeletingProg]           = useState(null);
    const [editingCatalogItem, setEditingCatalogItem] = useState(null);

    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [posModalOpen, setPosModalOpen]     = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);

    const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", confirmLabel: "", confirmColor: "#ef4444", onConfirm: null });
    const [toast, setToast] = useState({ msg: "", type: "success", visible: false });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    };

    const showConfirm = ({ title, message, confirmLabel, confirmColor, onConfirm }) => {
        setConfirmModal({ open: true, title, message, confirmLabel, confirmColor: confirmColor || "#ef4444", onConfirm });
    };

    const closeConfirm = () => setConfirmModal(m => ({ ...m, open: false, onConfirm: null }));

    useEffect(() => { fetchPrograms(); fetchCatalog(); }, []);

    // Close sidebar on resize to desktop
    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchCatalog = async () => {
        try {
            setCatalogLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog`, { headers: { Authorization: `Bearer ${token}` } });
            setCatalog(res.data);
        } catch (err) { console.error(err); }
        finally { setCatalogLoading(false); }
    };

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/programs`, { headers: { Authorization: `Bearer ${token}` } });
            setPrograms(res.data.filter(p => p.vacancy_status !== "draft"));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLock = (item) => {
        const isLocked = item.locked;
        showConfirm({
            title: isLocked ? `Unlock "${item.name}"?` : `Lock "${item.name}"?`,
            message: isLocked
                ? "Unlocking will allow this position to be edited or deleted again."
                : "Locking will prevent any edits or deletion. You can always unlock it later.",
            confirmLabel: isLocked ? "Yes, Unlock" : "Yes, Lock",
            confirmColor: isLocked ? "#2563c4" : "#f59e0b",
            onConfirm: async () => {
                closeConfirm();
                try {
                    const action = isLocked ? "unlock" : "lock";
                    await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog/${item.id_position}/${action}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                    showToast(`Position ${action}ed successfully.`);
                    fetchCatalog();
                } catch (e) {
                    showToast(e.response?.data?.error || "Failed to update lock status.", "error");
                }
            }
        });
    };

    const handleDuplicate = (item) => {
        showConfirm({
            title: `Duplicate "${item.name}"?`,
            message: "A copy of this position will be created (unlocked) and added to your catalog. You can then modify it for a new program.",
            confirmLabel: "Yes, Duplicate",
            confirmColor: "#2563c4",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog/${item.id_position}/duplicate`, null, { headers: { Authorization: `Bearer ${token}` } });
                    showToast(`"${item.name}" duplicated successfully and added to catalog.`);
                    setIsCatalogVisible(true);
                    fetchCatalog();
                    fetchPrograms();
                } catch (e) {
                    showToast(e.response?.data?.error || "Failed to duplicate position.", "error");
                }
            }
        });
    };

    const handleDeleteCatalog = (id) => {
        showConfirm({
            title: "Delete Position?",
            message: "This will permanently remove the position from your catalog. This action cannot be undone.",
            confirmLabel: "Yes, Delete",
            confirmColor: "#ef4444",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    showToast("Position deleted.");
                    setPosModalOpen(false);
                    setEditingCatalogItem(null);
                    fetchCatalog();
                    fetchPrograms();
                } catch (e) {
                    showToast(e.response?.data?.error || "Failed to delete.", "error");
                }
            }
        });
    };

    const handleDeleteProgram = async (prog) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/programs/${prog.id_vacancy}/${prog.id_position}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Program removed.");
            fetchPrograms();
        } catch {
            showToast("Failed to remove.", "error");
        }
    };

    const comp = (() => { try { return JSON.parse(localStorage.getItem("company")); } catch { return null; } })();
    const companyName = comp?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();

    const navItems = [
        { label: "Dashboard",           icon: <Icon.Dashboard />, path: "/dashboard" },
        { label: "User Management",      icon: <Icon.Users />,    path: "/users" },
        { label: "Program Management",   icon: <Icon.Lowongan />, path: "/programs" },
        { label: "Positions Management", icon: <Icon.Program />,  path: "/positions" },
    ];
    const navItems2 = [{ label: "Settings", icon: <Icon.Pengaturan />, path: "/settings" }];

    const filtered = programs.filter(p => {
        const ms = (p.position_name || "").toLowerCase().includes(search.toLowerCase()) || (p.vacancy_title || "").toLowerCase().includes(search.toLowerCase());
        const mf = filter === "all" || p.vacancy_status === filter;
        return ms && mf;
    });

    const sidebarProps = { navItems, navItems2, comp, companyName, initials, navigate, onLogout: () => setLogoutModalOpen(true) };

    return (
        <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.35s ease both; }
                @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                .sidebar-slide { animation: slideIn 0.25s ease both; }
            `}</style>

            {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)}>
                    <aside
                        className="sidebar-slide absolute left-0 top-0 bottom-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden p-5"
                        style={{ width: "260px", background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-base font-extrabold text-white">Menu</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-white/50 border-none bg-transparent cursor-pointer p-1"><Icon.Close /></button>
                        </div>
                        <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── DESKTOP SIDEBAR ────────────────────────────────── */}
            <aside className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto overflow-x-hidden gap-1 p-3"
                style={{ width: "250px", background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)" }}>
                <SidebarContent {...sidebarProps} onClose={null} />
            </aside>

            {/* ── MAIN ───────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-slate-600 flex-shrink-0"
                    >
                        <Icon.Menu />
                    </button>
                    <div className="flex-1 text-left">
                        <span className="text-sm font-bold" style={{ color: "#1e293b" }}>Positions Management</span>
                        <span className="text-xs mx-1.5" style={{ color: "#94a3b8" }}>/</span>
                        <span className="text-xs" style={{ color: "#94a3b8" }}>Management</span>
                    </div>
                </header>

                {/* Page body */}
                <main className="p-4 md:p-6 lg:p-7 pb-12 flex-1 text-left fade-in">

                    {/* ── Page header — stacks on mobile ──────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                        <div>
                            <div className="text-lg md:text-xl font-extrabold" style={{ color: "#0f172a" }}>Positions Management</div>
                            <div className="text-xs md:text-sm mt-0.5" style={{ color: "#64748b" }}>Manage position catalog and program linkages.</div>
                        </div>
                        {/* Search + Add button row */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex-1 sm:flex-none sm:w-56">
                                <Icon.Search />
                                <input
                                    placeholder="Search position or program..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border-none bg-transparent outline-none text-xs w-full"
                                    style={{ color: "#64748b", fontFamily: "inherit" }}
                                />
                            </div>
                            {isCatalogVisible && (
                                <button
                                    onClick={() => { setEditingCatalogItem(null); setPosModalOpen(true); }}
                                    className="flex items-center gap-1.5 text-white border-none rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer flex-shrink-0"
                                    style={{ background: "#2563c4", boxShadow: "0 2px 8px rgba(37,99,235,.3)", fontFamily: "inherit" }}
                                >
                                    <Icon.Plus />
                                    <span>Add Position</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Position Catalog ─────────────────────────── */}
                    <div className="mb-10">
                        {/* Accordion toggle */}
                        <div
                            onClick={() => setIsCatalogVisible(!isCatalogVisible)}
                            className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                            style={{ background: isCatalogVisible ? "#eff6ff" : "#fff" }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="transition-transform" style={{ color: "#2563c4", transform: isCatalogVisible ? "rotate(90deg)" : "rotate(0deg)" }}>
                                    <Icon.ChevronRight />
                                </div>
                                <div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#475569" }}>Position Catalog</div>
                                {!isCatalogVisible && (
                                    <span className="text-xs" style={{ color: "#94a3b8" }}>({catalog.length} positions)</span>
                                )}
                            </div>
                            {isCatalogVisible && (
                                <div className="hidden sm:flex gap-2 text-xs" style={{ color: "#94a3b8" }}>
                                    <span>{catalog.filter(c => c.locked).length} locked</span>
                                    <span style={{ color: "#cbd5e1" }}>·</span>
                                    <span>{catalog.filter(c => !c.locked).length} unlocked</span>
                                </div>
                            )}
                        </div>

                        {/* Catalog list */}
                        {isCatalogVisible && (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-3">
                                {catalogLoading ? (
                                    <div className="py-10 text-center text-xs" style={{ color: "#94a3b8" }}>Loading positions...</div>
                                ) : catalog.length === 0 ? (
                                    <div className="py-10 text-center text-xs" style={{ color: "#94a3b8" }}>No positions yet. Add your first position.</div>
                                ) : catalog.map(item => (
                                    <CatalogItem
                                        key={item.id_position}
                                        item={item}
                                        onEdit={(it) => { setEditingCatalogItem(it); setPosModalOpen(true); }}
                                        onDelete={handleDeleteCatalog}
                                        onLock={handleLock}
                                        onDuplicate={handleDuplicate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Program Positions ────────────────────────── */}
                    <SectionTitle style={{ marginBottom: 18 }}>Program Positions</SectionTitle>

                    {/* Filter pills */}
                    <div className="flex gap-2 mb-5 flex-wrap">
                        {[
                            { key: "all",       label: "All",       count: programs.length },
                            { key: "published", label: "Published", count: programs.filter(p => p.vacancy_status === "published").length },
                            { key: "closed",    label: "Closed",    count: programs.filter(p => p.vacancy_status === "closed").length },
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setFilter(t.key)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer transition-all"
                                style={{
                                    borderColor: filter === t.key ? "#2563c4" : "#e2e8f0",
                                    background: filter === t.key ? "#2563c4" : "#fff",
                                    color: filter === t.key ? "#fff" : "#64748b",
                                    fontFamily: "inherit",
                                }}
                            >
                                <span>{t.label}</span>
                                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                                    style={{ background: filter === t.key ? "rgba(255,255,255,0.2)" : "#f1f5f9" }}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Program cards grid
                        minmax(280px) instead of 320px for better phone fit */}
                    {loading ? (
                        <div className="py-10 text-center text-xs" style={{ color: "#94a3b8" }}>Loading programs...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-xs" style={{ color: "#94a3b8" }}>No programs found.</div>
                    ) : (
                        <div className="grid gap-4 md:gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                            {filtered.map((p, i) => (
                                <ProgramCard key={i} program={p}
                                    onEdit={(prog) => { setSelectedProg(prog); setSubmissionModalOpen(true); }}
                                    onDelete={setDeletingProg}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modals ─────────────────────────────────────────── */}
            <SubmissionModal
                open={submissionModalOpen}
                program={selectedProg}
                onClose={() => { setSubmissionModalOpen(false); setSelectedProg(null); }}
            />

            <PositionModal
                open={posModalOpen}
                item={editingCatalogItem}
                onClose={() => { setPosModalOpen(false); setEditingCatalogItem(null); }}
                onSave={async (id, data) => {
                    try {
                        const url = id
                            ? `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog/${id}`
                            : `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/positions/catalog`;
                        await axios[id ? "put" : "post"](url, data, { headers: { Authorization: `Bearer ${token}` } });
                        showToast(`Position ${id ? "updated" : "created"} successfully.`);
                        fetchCatalog();
                        setPosModalOpen(false);
                        setEditingCatalogItem(null);
                    } catch (e) {
                        showToast(e.response?.data?.error || "Failed to save position.", "error");
                    }
                }}
            />

            {/* Delete program confirm */}
            {deletingProg && (
                <ConfirmModal
                    open={true}
                    title="Remove Position from Program?"
                    message={<>Remove <b>{deletingProg.position_name}</b> from <b>{deletingProg.vacancy_title}</b>? This will not delete the position from your catalog.</>}
                    confirmLabel="Yes, Remove"
                    confirmColor="#ef4444"
                    onConfirm={() => { handleDeleteProgram(deletingProg); setDeletingProg(null); }}
                    onCancel={() => setDeletingProg(null)}
                />
            )}

            {/* Generic confirm (lock/unlock/duplicate/delete catalog) */}
            <ConfirmModal
                open={confirmModal.open}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                confirmColor={confirmModal.confirmColor}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirm}
            />

            {/* Logout confirm */}
            <ConfirmModal
                open={logoutModalOpen}
                title="Sign Out?"
                message="Are you sure you want to sign out of your account?"
                confirmLabel="Sign Out"
                confirmColor="#ef4444"
                onConfirm={async () => { await logout(); navigate("/", { replace: true }); }}
                onCancel={() => setLogoutModalOpen(false)}
            />

            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}