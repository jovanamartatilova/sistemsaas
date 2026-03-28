import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import axios from "axios";

// ── Initial data removed - now using backend API ─────────────────────────────

const MONTHS_FULL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

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
    Location: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    Deadline: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Dot: () => <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>,
    Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Upload: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    Lock: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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
                    {value || "Pilih tanggal…"}
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
                        <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} title="Hapus"
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
                        <span>{job.startDate} - {job.endDate} ({job.durasi})</span>
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
                        {job.pelamar} Pelamar · {job.kuota} Kuota
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, editingJob, onClose, onSubmit }) {
    const [activeTab, setActiveTab] = useState("detail");
    const [form, setForm] = useState({ title: "", desc: "", kota: "", provinsi: "", alamat: "", durasi: "", batch: "", kuota: "", image: "", photoFile: null });
    const fileInpRef = useRef(null);
    const [tipe, setTipe] = useState("");
    const [payment, setPayment] = useState("");
    const [deadline, setDeadline] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [posisi, setPosisi] = useState([""]);

    useEffect(() => {
        if (open) {
            setActiveTab("detail");
            if (editingJob) {
                const cleanDurasi = (editingJob.durasi || String(editingJob.duration_months || "")).replace(" Bulan", "");
                setForm({ title: editingJob.title || editingJob.nama, desc: editingJob.desc, kota: editingJob.kota, provinsi: editingJob.provinsi, alamat: editingJob.alamat, durasi: cleanDurasi, batch: editingJob.batch, kuota: editingJob.kuota, image: editingJob.photo || editingJob.image || "", photoFile: null });
                setTipe(editingJob.tipe || editingJob.type);
                setPayment(editingJob.payment || editingJob.payment_type);
                setDeadline(editingJob.deadline);
                setStartDate(editingJob.startDate || "");
                setEndDate(editingJob.endDate || "");
                setPosisi([...(editingJob.posisi || [(editingJob.position?.name || "")])]);
            } else {
                setForm({ title: "", desc: "", kota: "", provinsi: "", alamat: "", durasi: "", batch: "", kuota: "", image: "", photoFile: null });
                setTipe(""); setPayment(""); setDeadline(""); setStartDate(""); setEndDate(""); setPosisi([""]);
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
        const filled = posisi.filter(Boolean);

        // Relaxed validation
        if (!form.title) return alert("Nama Lowongan wajib diisi.");
        if (filled.length === 0) return alert("Minimal satu posisi harus diisi.");

        // If publishing, check for other essential fields
        if (status === "published") {
            if (!form.desc || !form.kota || !form.provinsi || !form.durasi || !form.batch || !form.kuota || !startDate || !endDate || !deadline || !tipe || !payment) {
                return alert("Harap isi semua field wajib sebelum mem-publish lowongan.");
            }
        }

        onSubmit({ ...form, batch: +form.batch, kuota: +form.kuota, startDate, endDate, deadline, tipe, payment, posisi: filled, status });
    };

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
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{editingJob ? "Edit Lowongan" : "Tambah Lowongan Baru"}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Isi semua informasi lowongan magang dengan lengkap.</div>
                    </div>
                    <button onClick={onClose} style={{ position: "absolute", top: 22, right: 28, width: 34, height: 34, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
                </div>

                {editingJob && (
                    <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 28px", background: "#f8fafc" }}>
                        <button onClick={() => setActiveTab("detail")} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === "detail" ? "2.5px solid #2563c4" : "2.5px solid transparent", color: activeTab === "detail" ? "#2563c4" : "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "0.2s" }}>Detail Lowongan</button>
                        <button onClick={() => setActiveTab("pelamar")} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === "pelamar" ? "2.5px solid #2563c4" : "2.5px solid transparent", color: activeTab === "pelamar" ? "#2563c4" : "#64748b", fontWeight: 600, fontSize: 13.5, cursor: "pointer", transition: "0.2s" }}>Daftar Pelamar</button>
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
                            <FGroup label="Nama Lowongan" req style={{ marginTop: 14 }}>
                                <input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="cth. Software Engineer Intern Batch 8" onFocus={focusInp} onBlur={blurInp} />
                            </FGroup>
                            <FGroup label="Deskripsi Lowongan" req style={{ marginTop: 14 }}>
                                <textarea style={{ ...inp, minHeight: 88, resize: "vertical", lineHeight: 1.6 }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Deskripsikan program magang ini secara singkat…" onFocus={focusInp} onBlur={blurInp} />
                            </FGroup>

                            {/* Lokasi */}
                            <SectionTitle style={{ marginTop: 24 }}>Lokasi Magang</SectionTitle>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <FGroup label="Kota" req>
                                    <input style={inp} value={form.kota} onChange={e => setForm({ ...form, kota: e.target.value })} placeholder="cth. Jakarta" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                                <FGroup label="Provinsi" req>
                                    <input style={inp} value={form.provinsi} onChange={e => setForm({ ...form, provinsi: e.target.value })} placeholder="cth. DKI Jakarta" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                            </div>
                            <FGroup label="Alamat Lengkap">
                                <input style={inp} value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} placeholder="cth. Jl. Sudirman No. 1, Gedung Menara 88" onFocus={focusInp} onBlur={blurInp} />
                            </FGroup>

                            {/* Detail */}
                            <SectionTitle style={{ marginTop: 24 }}>Detail Program</SectionTitle>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <FGroup label="Tanggal Mulai" req>
                                    <CalendarPicker value={startDate} onChange={setStartDate} />
                                </FGroup>
                                <FGroup label="Tanggal Selesai" req>
                                    <CalendarPicker value={endDate} onChange={setEndDate} />
                                </FGroup>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <FGroup label="Durasi (Bulan)" req>
                                    <input style={inp} type="number" min="1" value={form.durasi} onChange={e => setForm({ ...form, durasi: e.target.value })} placeholder="cth. 3" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                                <FGroup label="Batch" req>
                                    <input style={inp} type="number" min="1" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="cth. 8" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <FGroup label="Kuota Pemagang" req>
                                    <input style={inp} type="number" min="1" value={form.kuota} onChange={e => setForm({ ...form, kuota: e.target.value })} placeholder="cth. 50" onFocus={focusInp} onBlur={blurInp} />
                                </FGroup>
                                <FGroup label="Deadline Pendaftaran" req>
                                    <CalendarPicker value={deadline} onChange={setDeadline} />
                                </FGroup>
                            </div>
                            <FGroup label="Tipe Magang" req style={{ marginBottom: 14 }}>
                                <PillGroup options={[{ value: "reguler", label: "Reguler" }, { value: "flagship", label: "Flagship" }]} value={tipe} onChange={setTipe} />
                            </FGroup>
                            <FGroup label="Payment Type" req style={{ marginBottom: 14 }}>
                                <PillGroup options={[{ value: "unpaid", label: "Unpaid" }, { value: "paid", label: "Paid" }]} value={payment} onChange={setPayment} />
                            </FGroup>

                            {/* Posisi */}
                            <SectionTitle style={{ marginTop: 24 }}>Posisi yang Dibuka</SectionTitle>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {posisi.map((p, i) => (
                                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <input style={{ ...inp, flex: 1 }} value={p} onChange={e => { const next = [...posisi]; next[i] = e.target.value; setPosisi(next); }} placeholder="cth. Frontend Developer" onFocus={focusInp} onBlur={blurInp} />
                                        <button onClick={() => posisi.length > 1 && setPosisi(posisi.filter((_, j) => j !== i))}
                                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", fontSize: 14, flexShrink: 0 }}>✕</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setPosisi([...posisi, ""])}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1.5px dashed #e2e8f0", borderRadius: 8, background: "transparent", fontFamily: "inherit", fontSize: 13, color: "#64748b", cursor: "pointer", marginTop: 8, transition: "all .15s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#2563c4"; e.currentTarget.style.background = "#eff6ff"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}>
                                <Icon.Plus /> Tambah Posisi
                            </button>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "18px 28px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Field bertanda <b style={{ color: "#ef4444" }}>*</b> wajib diisi.</div>
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
                                    <Icon.Send /> {editingJob?.status === "published" ? "Simpan" : "Publish"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "60px 28px", overflowY: "auto", maxHeight: "65vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                        <div style={{ width: 80, height: 80, background: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", marginBottom: 20 }}>
                            <Icon.Users />
                        </div>
                        {editingJob?.status === "draft" ? (
                            <>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Belum Bisa Menerima Pelamar</h3>
                                <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6, textAlign: "center" }}>Silakan <b>Publish</b> lowongan ini terlebih dahulu dengan kembali ke tab Detail, agar calon peserta dapat melihat dan melamar posisi ini.</p>
                            </>
                        ) : (
                            <>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>Belum Ada Pelamar</h3>
                                <p style={{ fontSize: 14, color: "#64748b", maxWidth: 340, lineHeight: 1.6, textAlign: "center" }}>Lowongan ini sudah dipublish, namun saat ini belum ada kandidat yang mengirimkan lamaran ke posisi manapun.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
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
export default function ManajemenLowongan() {
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
    const [toast, setToast] = useState({ msg: "", type: "success", visible: false });
    const [activeNav, setActiveNav] = useState("Manajemen Lowongan");

    useEffect(() => {
        fetchJobs();
    }, []);

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
                    startDate: j.deadline,
                    endDate: j.deadline,
                    durasi: j.duration_months + " Bulan",
                    tipe: j.type,
                    payment: j.payment_type,
                    kuota: j.quota,
                    posisi: (j.positions || []).map(p => p.name || p)
                };
            });
            setJobs(mappedJobs);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            showToast("Gagal mengambil data dari server.", "error");
        } finally {
            setLoading(false);
        }
    };

    const company = (() => { try { return JSON.parse(localStorage.getItem("company")); } catch { return null; } })();
    const companyName = company?.name || "Admin";
    const initials = companyName.slice(0, 2).toUpperCase();
    const companyRole = company?.role || "Admin Perusahaan";

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
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.desc);
            formData.append("city", data.kota);
            formData.append("province", data.provinsi);
            formData.append("address", data.alamat);
            formData.append("duration_months", parseInt(data.durasi));
            formData.append("batch", parseInt(data.batch));
            formData.append("quota", parseInt(data.kuota));
            formData.append("deadline", data.deadline);
            formData.append("type", data.tipe);
            formData.append("payment_type", data.payment);
            formData.append("status", data.status);

            data.posisi.forEach((p, i) => {
                formData.append(`positions[${i}]`, p);
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
                showToast(`Lowongan berhasil diperbarui.`);
            } else {
                await axios.post("http://127.0.0.1:8000/api/vacancies", formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                });
                showToast(`Lowongan berhasil ${data.status === "published" ? "dipublish" : "disimpan sebagai draft"}.`);
            }
            fetchJobs();
            setModalOpen(false);
            setEditingJob(null);
        } catch (err) {
            console.error("Failed to save job:", err);
            const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : null) || "Gagal menyimpan lowongan.";
            showToast(msg, "error");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus lowongan ini?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/vacancies/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast("Lowongan berhasil dihapus.");
            fetchJobs();
        } catch (err) {
            console.error("Failed to delete job:", err);
            showToast("Gagal menghapus lowongan.", "error");
        }
    };

    const handleLogout = () => { setLogoutModalOpen(true); };

    const navItems = [
        { label: "Dashboard", icon: <Icon.Dashboard />, path: "/dashboard", section: "MAIN MENU" },
        { label: "Manajemen User", icon: <Icon.Users />, path: "#", badge: 0 },
        { label: "Manajemen Program", icon: <Icon.Program />, path: "/program" },
        { label: "Manajemen Lowongan", icon: <Icon.Lowongan />, path: "/lowongan" },
    ];
    const navItems2 = [
        { label: "Laporan", icon: <Icon.Laporan />, path: "#", section: "LAINNYA" },
        { label: "Pengaturan", icon: <Icon.Pengaturan />, path: "#" },
    ];

    const SIDEBAR_W = 250;
    const TOPBAR_H = 56;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans','Inter','Segoe UI',sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.12); border-radius: 99px; }
        /* Hide number input spinners */
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
                        active={activeNav === n.label}
                        onClick={() => {
                            setActiveNav(n.label);
                            if (n.path && n.path !== "#") navigate(n.path);
                        }}
                    />
                ))}

                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "12px 8px" }} />
                <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "0px 14px 4px", textTransform: "uppercase" }}>
                    Lainnya
                </p>
                {navItems2.map((n) => (
                    <SideItem
                        key={n.label}
                        icon={n.icon}
                        label={n.label}
                        active={activeNav === n.label}
                        onClick={() => setActiveNav(n.label)}
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
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Manajemen Lowongan</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8", margin: "0 6px" }}>/</span>
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>Manajemen</span>
                    </div>

                    {/* Search */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "7px 14px", width: "220px" }}>
                        <Icon.Search />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Cari lowongan..."
                            style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%" }}
                        />
                    </div>

                    {/* Bell */}
                    <button style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", position: "relative" }}>
                        <Icon.Bell />
                    </button>
                </header>

                {/* PAGE BODY */}
                <main style={{ padding: 28, flex: 1, textAlign: "left" }}>
                    {/* Page header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>Manajemen Lowongan</div>
                            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Kelola semua lowongan magang yang tersedia di platform.</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <button onClick={() => { setEditingJob(null); setModalOpen(true); }}
                                style={{ display: "flex", alignItems: "center", gap: 7, background: "#2563c4", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,.3)" }}>
                                <Icon.Plus /> Tambah Lowongan
                            </button>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                        {[
                            { key: "all", label: "Semua", count: jobs.length },
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
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Belum ada lowongan</h3>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Tambahkan lowongan pertama kamu dengan menekan tombol <b>"Tambah Lowongan"</b> di atas.</p>
                            <button onClick={() => { setEditingJob(null); setModalOpen(true); }}
                                style={{ display: "flex", alignItems: "center", gap: 7, background: "#2563c4", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                <Icon.Plus /> Tambah Lowongan
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
            <Modal open={modalOpen} editingJob={editingJob} onClose={() => { setModalOpen(false); setEditingJob(null); }} onSubmit={handleModalSubmit} />

            {/* Delete confirm */}
            {deletingId && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,.18)", textAlign: "left" }}>
                        <div style={{ color: "#ef4444", marginBottom: 16 }}>
                            <Icon.Trash />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Hapus Lowongan?</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>Tindakan ini tidak dapat dibatalkan. Lowongan beserta semua data pelamarnya akan dihapus secara permanen.</div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setDeletingId(null)}
                                style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#334155" }}>Batal</button>
                            <button onClick={() => { handleDelete(deletingId); setDeletingId(null); }}
                                style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: "#ef4444", color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Ya, Hapus</button>
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
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Keluar Sistem?</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>Apakah Anda yakin ingin keluar dari akun perusahaan Anda?</div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => setLogoutModalOpen(false)} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Batal</button>
                            <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#ef4444", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Ya, Keluar</button>
                        </div>
                    </div>
                </div>
            )}

            <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
        </div>
    );
}