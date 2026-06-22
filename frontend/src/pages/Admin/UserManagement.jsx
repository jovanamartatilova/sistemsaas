import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`;

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Dashboard:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Users:      () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Program:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Briefcase:  () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  Settings:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Search:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Link:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Copy:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Share:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Eye:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Check:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronDown:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Shield:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Layers:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Tag:        () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Logout:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  X:          () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ── Role palette ──────────────────────────────────────────────────────────────
const ROLE_PALETTES = [
  { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { color: "#2563c4", bg: "#eff6ff", border: "#bfdbfe" },
  { color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { color: "#b45309", bg: "#fff7ed", border: "#fed7aa" },
  { color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  { color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
  { color: "#c2410c", bg: "#fff7ed", border: "#fdba74" },
  { color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
  { color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
];
const getRolePalette = name => {
  if (!name) return { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" };
  const hash = String(name).toLowerCase().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ROLE_PALETTES[hash % ROLE_PALETTES.length];
};

// ── Shared input style ────────────────────────────────────────────────────────
const fieldStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", fontSize: 13.5, outline: "none",
  color: "#1e293b", background: "#fff", fontFamily: "inherit",
  transition: "border-color .15s, box-shadow .15s",
};
const focusField = e => { e.target.style.borderColor = "#2563c4"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,196,0.08)"; };
const blurField  = e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; };

// ── Stat Card (matches Dashboard) ─────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, barColors }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-1.5 min-w-0"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="text-2xl md:text-3xl font-extrabold mt-1" style={{ color: "#1e293b", letterSpacing: "-1px" }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: "#64748b" }}>{title}</div>
      {barColors && (
        <div className="flex gap-0.5 mt-2 items-end" style={{ height: 28 }}>
          {barColors.map((c, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ background: c, height: `${30 + Math.sin(i) * 20}%`, opacity: 0.4, minHeight: 4 }}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar Item (matches Dashboard exactly) ──────────────────────────────────
function SideItem({ icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all text-left border"
      style={{
        background:  active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
        borderColor: active ? "rgba(74,158,255,0.22)" : "transparent",
        color:       active ? "#4a9eff" : "rgba(255,255,255,0.6)",
        fontWeight:  active ? "600" : "500",
      }}>
      <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

// ── Searchable Dropdown ───────────────────────────────────────────────────────
function SearchSelect({ options = [], value, onChange, placeholder = "Select…", allowCreate = false, onCreateNew }) {
  const [q, setQ]       = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white rounded-lg text-sm cursor-pointer text-left transition-all"
        style={{ border: `1.5px solid ${open ? "#2563c4" : "#e2e8f0"}`, color: selected ? "#1e293b" : "#94a3b8", fontFamily: "inherit", boxShadow: open ? "0 0 0 3px rgba(37,99,196,0.08)" : "none" }}>
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span className="flex-shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          <IC.ChevronDown/>
        </span>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 z-[500] bg-white rounded-xl overflow-hidden"
          style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div className="p-2 pb-1">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <IC.Search/>
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                className="border-none bg-transparent outline-none text-xs w-full" style={{ color: "#1e293b", fontFamily: "inherit" }}/>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto px-1.5 pb-1.5">
            {filtered.length === 0 && !allowCreate && (
              <div className="py-3 text-center text-xs" style={{ color: "#94a3b8" }}>No results</div>
            )}
            {filtered.map(o => (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                className="w-full text-left px-2.5 py-2 border-none rounded-lg text-sm cursor-pointer flex items-center justify-between transition-colors"
                style={{ background: value === o.value ? "#eff6ff" : "transparent", color: value === o.value ? "#2563c4" : "#374151", fontWeight: value === o.value ? 600 : 400, fontFamily: "inherit" }}
                onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (value !== o.value) e.currentTarget.style.background = "transparent"; }}>
                {o.label}
                {value === o.value && <IC.Check/>}
              </button>
            ))}
            {allowCreate && q && !options.find(o => o.label.toLowerCase() === q.toLowerCase()) && (
              <button type="button" onClick={() => { onCreateNew?.(q); setQ(""); setOpen(false); }}
                className="w-full text-left px-2.5 py-2 border-none rounded-lg text-sm cursor-pointer flex items-center gap-1.5 transition-colors font-semibold"
                style={{ background: "transparent", color: "#2563c4", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <IC.Plus/> Add "{q}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Entity CRUD Table — responsive wrapper ────────────────────────────────────
function EntityTable({ title, icon, items, loading, onAdd, onEdit, onDelete, columns, emptyText, accentColor = "#2563c4" }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item =>
    columns.some(col => String(item[col.key] || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18`, color: accentColor }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold" style={{ color: "#0f172a" }}>{title}</div>
          <div className="text-xs" style={{ color: "#94a3b8" }}>{items.length} item{items.length !== 1 ? "s" : ""}</div>
        </div>
        {/* Search + Add — wrap on mobile */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 h-9 flex-1 sm:w-44">
            <IC.Search/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="border-none outline-none text-xs w-full bg-transparent" style={{ fontFamily: "inherit" }}/>
          </div>
          <button onClick={onAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 border-none rounded-lg text-xs font-bold text-white cursor-pointer flex-shrink-0"
            style={{ background: accentColor, boxShadow: `0 3px 10px ${accentColor}40` }}>
            <IC.Plus/> Add
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-200 rounded-full" style={{ borderTopColor: accentColor, animation: "spin .6s linear infinite" }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm" style={{ color: "#94a3b8" }}>{search ? "No results found." : emptyText}</div>
      ) : (
        /* Scrollable table on mobile */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 480 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide border-b border-slate-100" style={{ color: "#64748b" }}>{col.label}</th>
                ))}
                <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wide border-b border-slate-100" style={{ color: "#64748b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-50 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm" style={{ color: "#374151" }}>
                      {col.render ? col.render(item) : (item[col.key] || <span style={{ color: "#cbd5e1" }}>—</span>)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white cursor-pointer flex items-center justify-center transition-all"
                        style={{ color: "#64748b" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                        <IC.Edit/>
                      </button>
                      <button onClick={() => onDelete(item)}
                        className="w-8 h-8 rounded-lg border bg-white cursor-pointer flex items-center justify-center transition-all"
                        style={{ borderColor: "#fecaca", color: "#fca5a5" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#fca5a5"; }}>
                        <IC.Trash/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Modal wrapper — responsive ────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      style={{ background: "rgba(10,22,40,0.55)", backdropFilter: "blur(4px)" }}>
      <div className={`bg-white rounded-2xl w-full my-auto overflow-hidden ${wide ? "max-w-lg" : "max-w-md"}`}
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <div className="text-base font-extrabold" style={{ color: "#0f172a" }}>{title}</div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white cursor-pointer flex items-center justify-center"
            style={{ color: "#94a3b8" }}>
            <IC.X/>
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Entity Form ───────────────────────────────────────────────────────────────
function EntityForm({ item, onSave, onClose, loading, error, extraFields = [] }) {
  const [form, setForm] = useState({ name: item?.name || "", description: item?.description || "" });
  const [extra, setExtra] = useState(() => Object.fromEntries(extraFields.map(f => [f.key, item?.[f.key] || ""])));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, ...extra }); }} className="flex flex-col gap-3.5">
      {error && (
        <div className="px-3.5 py-2.5 rounded-lg text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>{error}</div>
      )}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Name <span style={{ color: "#ef4444" }}>*</span></label>
        <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          style={fieldStyle} onFocus={focusField} onBlur={blurField}/>
      </div>
      {extraFields.map(f => (
        <div key={f.key}>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>{f.label}</label>
          <input value={extra[f.key]} onChange={e => setExtra(p => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder} style={fieldStyle} onFocus={focusField} onBlur={blurField}/>
        </div>
      ))}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Description</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
          style={{ ...fieldStyle, resize: "vertical" }} onFocus={focusField} onBlur={blurField}/>
      </div>
      <div className="flex gap-2.5 mt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer"
          style={{ color: "#64748b", fontFamily: "inherit" }}>Cancel</button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl border-none text-sm font-bold text-white cursor-pointer flex items-center justify-center gap-2"
          style={{ background: loading ? "#93c5fd" : "#2563c4", fontFamily: "inherit" }}>
          {loading
            ? <><div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: "rgba(255,255,255,.4)", borderTopColor: "#fff", animation: "spin .6s linear infinite" }}/>Saving…</>
            : (item ? "Save Changes" : "Create")}
        </button>
      </div>
    </form>
  );
}

// ── Sidebar content (shared desktop + mobile) ─────────────────────────────────
function SidebarContent({ company, companyName, initials, navItems, navigate, activeNav, onClose, onLogout }) {
  const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split("/api")[0] : "http://localhost:8000";
  return (
    <>
      <Link to="/" onClick={onClose} className="flex items-center gap-2.5 px-1.5 pb-5 no-underline">
        <img src="/assets/images/logo.png" alt="EarlyPath" className="h-11 object-contain flex-shrink-0"/>
        <span className="text-base font-extrabold text-white whitespace-nowrap tracking-tight">EarlyPath</span>
      </Link>
      <p className="text-xs font-bold px-3.5 pb-1 pt-1 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Menu</p>
      {navItems.map(n => (
        <SideItem key={n.label} icon={n.icon} label={n.label} active={n.label === activeNav}
          onClick={() => { navigate(n.path); if (onClose) onClose(); }}/>
      ))}
      <div className="h-px mx-2 my-3" style={{ background: "rgba(255,255,255,0.07)" }}/>
      <SideItem icon={<IC.Settings/>} label="Settings" active={false} onClick={() => { navigate("/settings"); if (onClose) onClose(); }}/>
      <div className="flex-1"/>
      <div className="border-t pt-3.5 flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {company?.logo_path
          ? <img src={`${apiBase}/storage/${company.logo_path}`} className="w-9 h-9 rounded-xl object-cover" alt="logo"/>
          : <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-extrabold text-white" style={{ background: "linear-gradient(135deg,#2d7dd2,#4a9eff)" }}>{initials}</div>
        }
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate" style={{ fontSize: "12.5px" }}>{companyName}</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Admin</div>
        </div>
        <button onClick={onLogout} className="bg-transparent border-none cursor-pointer p-1 rounded-md flex"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={e => { e.currentTarget.style.color="#f87171"; e.currentTarget.style.background="rgba(248,113,113,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.35)"; e.currentTarget.style.background="transparent"; }}>
          <IC.Logout/>
        </button>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const navigate = useNavigate();
  const { logout, token, user: currentUser } = useAuthStore();

  const [company, setCompany]         = useState(null);
  const [activeTab, setActiveTab]     = useState("codes");
  const [logoutModal, setLogoutModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [codes, setCodes]                   = useState([]);
  const [codesLoading, setCodesLoading]     = useState(false);
  const [codeSearch, setCodeSearch]         = useState("");
  const [codeModal, setCodeModal]           = useState(false);
  const [codeSuccess, setCodeSuccess]       = useState(false);
  const [createdCode, setCreatedCode]       = useState(null);
  const [codeForm, setCodeForm]             = useState({ label: "", id_role: "", division: "", position: "", employee_status: "intern", schedule: "", job_level: "" });
  const [codeLoading, setCodeLoading]       = useState(false);
  const [codeError, setCodeError]           = useState("");

  const [staff, setStaff]                   = useState([]);
  const [staffLoading, setStaffLoading]     = useState(false);
  const [staffSearch, setStaffSearch]       = useState("");

  const [roles, setRoles]                   = useState([]);
  const [rolesLoading, setRolesLoading]     = useState(false);
  const [roleModal, setRoleModal]           = useState(false);
  const [editingRole, setEditingRole]       = useState(null);
  const [roleFormLoading, setRoleFormLoading] = useState(false);
  const [roleFormError, setRoleFormError]   = useState("");

  const [divisions, setDivisions]           = useState([]);
  const [divsLoading, setDivsLoading]       = useState(false);
  const [divModal, setDivModal]             = useState(false);
  const [editingDiv, setEditingDiv]         = useState(null);
  const [divFormLoading, setDivFormLoading] = useState(false);
  const [divFormError, setDivFormError]     = useState("");

  const [staffPositions, setStaffPositions] = useState([]);
  const [posLoading, setPosLoading]         = useState(false);
  const [posModal, setPosModal]             = useState(false);
  const [editingPos, setEditingPos]         = useState(null);
  const [posFormLoading, setPosFormLoading] = useState(false);
  const [posFormError, setPosFormError]     = useState("");

  const [jobLevels, setJobLevels]           = useState([]);
  const [jlLoading, setJlLoading]           = useState(false);
  const [jlModal, setJlModal]               = useState(false);
  const [editingJl, setEditingJl]           = useState(null);
  const [jlFormLoading, setJlFormLoading]   = useState(false);
  const [jlFormError, setJlFormError]       = useState("");

  const hdrs = { Authorization: `Bearer ${token}` };

  const fetchCodes     = useCallback(async () => { try { setCodesLoading(true);  const r = await axios.get(`${API}/company/invitation-codes`,       { headers: hdrs }); setCodes(Array.isArray(r.data) ? r.data : []);          } catch {} finally { setCodesLoading(false);  } }, [token]);
  const fetchStaff     = useCallback(async () => { try { setStaffLoading(true);  const r = await axios.get(`${API}/company-users?type=all`,           { headers: hdrs }); setStaff(Array.isArray(r.data) ? r.data : []);          } catch {} finally { setStaffLoading(false);  } }, [token]);
  const fetchRoles     = useCallback(async () => { try { setRolesLoading(true);  const r = await axios.get(`${API}/company/config/roles`,             { headers: hdrs }); setRoles(Array.isArray(r.data) ? r.data : []);          } catch {} finally { setRolesLoading(false);  } }, [token]);
  const fetchDivisions = useCallback(async () => { try { setDivsLoading(true);   const r = await axios.get(`${API}/company/config/divisions`,         { headers: hdrs }); setDivisions(Array.isArray(r.data) ? r.data : []);     } catch {} finally { setDivsLoading(false);   } }, [token]);
  const fetchPositions = useCallback(async () => { try { setPosLoading(true);    const r = await axios.get(`${API}/company/config/staff-positions`,   { headers: hdrs }); setStaffPositions(Array.isArray(r.data) ? r.data : []); } catch {} finally { setPosLoading(false);    } }, [token]);
  const fetchJobLevels = useCallback(async () => { try { setJlLoading(true);     const r = await axios.get(`${API}/company/config/job-levels`,        { headers: hdrs }); setJobLevels(Array.isArray(r.data) ? r.data : []);     } catch {} finally { setJlLoading(false);     } }, [token]);

  useEffect(() => {
    const s = sessionStorage.getItem("company");
    if (s) { try { setCompany(JSON.parse(s)); } catch {} }
    if (token) { fetchCodes(); fetchStaff(); fetchRoles(); fetchDivisions(); fetchPositions(); fetchJobLevels(); }
  }, [token]);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Clipboard ──────────────────────────────────────────────────────────────
  const copy = t => {
    const show = () => { setCopiedToast(true); setTimeout(() => setCopiedToast(false), 2000); };
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(t).then(show).catch(() => fallbackCopy(t)); }
    else fallbackCopy(t);
  };
  const fallbackCopy = t => {
    const el = document.createElement("textarea");
    el.value = t; el.style.position = "fixed"; el.style.left = "-9999px";
    document.body.appendChild(el); el.focus(); el.select();
    try { if (document.execCommand("copy")) { setCopiedToast(true); setTimeout(() => setCopiedToast(false), 2000); } } catch {}
    document.body.removeChild(el);
  };
  const activationLink = c => `${window.location.origin}/activate?code=${c}`;

  // ── Invitation code CRUD ───────────────────────────────────────────────────
  const openCreateCode = () => { setCodeForm({ label: "", id_role: "", division: "", position: "", employee_status: "intern", schedule: "", job_level: "" }); setCodeError(""); setCodeSuccess(false); setCreatedCode(null); setCodeModal(true); };
  const handleCreateCode = async e => {
    e.preventDefault(); setCodeError("");
    try {
      setCodeLoading(true);
      const r = await axios.post(`${API}/company/invitation-codes`, codeForm, { headers: hdrs });
      setCreatedCode(r.data.invitation); setCodeSuccess(true); fetchCodes();
    } catch (err) { setCodeError(err.response?.data?.message || "Failed to create code."); }
    finally { setCodeLoading(false); }
  };
  const handleToggleCode = async id => { try { await axios.patch(`${API}/company/invitation-codes/${id}/toggle`, {}, { headers: hdrs }); fetchCodes(); } catch { alert("Failed."); } };
  const handleDeleteCode = async id => { if (!window.confirm("Delete this invitation code?")) return; try { await axios.delete(`${API}/company/invitation-codes/${id}`, { headers: hdrs }); fetchCodes(); } catch { alert("Failed."); } };

  // ── Generic CRUD factory ───────────────────────────────────────────────────
  const mkCRUD = (base, fetchFn, setLoading, setError) => ({
    save: async (item, data) => {
      setLoading(true); setError("");
      try {
        if (item) await axios.put(`${API}${base}/${item.id}`, data, { headers: hdrs });
        else      await axios.post(`${API}${base}`, data, { headers: hdrs });
        fetchFn(); return true;
      } catch (err) { setError(err.response?.data?.message || "Failed to save."); return false; }
      finally { setLoading(false); }
    },
    del: async item => {
      if (!window.confirm(`Delete "${item.name}"?`)) return;
      try { await axios.delete(`${API}${base}/${item.id}`, { headers: hdrs }); fetchFn(); }
      catch (err) { alert(err.response?.data?.message || "Failed."); }
    },
  });

  const roleCRUD = mkCRUD("/company/config/roles",          fetchRoles,     setRoleFormLoading, setRoleFormError);
  const divCRUD  = mkCRUD("/company/config/divisions",      fetchDivisions, setDivFormLoading,  setDivFormError);
  const posCRUD  = mkCRUD("/company/config/staff-positions",fetchPositions, setPosFormLoading,  setPosFormError);
  const jlCRUD   = mkCRUD("/company/config/job-levels",     fetchJobLevels, setJlFormLoading,   setJlFormError);

  const quickCreate = async (type, name) => {
    const ep = { division: `${API}/company/config/divisions`, position: `${API}/company/config/staff-positions`, job_level: `${API}/company/config/job-levels` };
    try {
      const r = await axios.post(ep[type], { name }, { headers: hdrs });
      if (type === "division")  { fetchDivisions(); setCodeForm(p => ({ ...p, division: r.data.name })); }
      if (type === "position")  { fetchPositions(); setCodeForm(p => ({ ...p, position: r.data.name })); }
      if (type === "job_level") { fetchJobLevels(); setCodeForm(p => ({ ...p, job_level: r.data.name })); }
    } catch {}
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const companyStaff    = staff.filter(u => u.id_company);
  const filteredCodes   = codes.filter(c => c.label?.toLowerCase().includes(codeSearch.toLowerCase()) || c.code?.toLowerCase().includes(codeSearch.toLowerCase()));
  const filteredStaff   = companyStaff.filter(u => u.name?.toLowerCase().includes(staffSearch.toLowerCase()) || u.email?.toLowerCase().includes(staffSearch.toLowerCase()));
  const roleOptions     = roles.map(r => ({ value: r.id, label: r.name }));
  const divOptions      = divisions.map(d => ({ value: d.name, label: d.name }));
  const posOptions      = staffPositions.map(p => ({ value: p.name, label: p.name }));
  const jlOptions       = jobLevels.map(j => ({ value: j.name, label: j.name }));
  const companyName     = company?.name || "Admin";
  const initials        = companyName.slice(0, 2).toUpperCase();

  const TABS = [
    { key: "codes", label: "Invitation Codes", icon: <IC.Link/>,    count: codes.length },
    { key: "staff", label: "Invited Staff",    icon: <IC.Users/>,   count: companyStaff.length },
    { key: "roles", label: "Roles",            icon: <IC.Shield/>,  count: roles.length },
    { key: "org",   label: "Org Structure",    icon: <IC.Layers/>,  count: divisions.length + staffPositions.length + jobLevels.length },
  ];

  const navItems = [
    { label: "Dashboard",            icon: <IC.Dashboard/>,  path: "/dashboard" },
    { label: "User Management",      icon: <IC.Users/>,      path: "/users" },
    { label: "Program Management",   icon: <IC.Briefcase/>,  path: "/programs" },
    { label: "Positions Management", icon: <IC.Program/>,    path: "/positions" },
  ];

  const statCards = [
    { label: "Total Codes",   val: codes.length,                          iconBg: "#eff6ff", iconColor: "#2563c4", icon: <IC.Link/>,    barColors: ["#2563c4","#60a5fa","#93c5fd","#2563c4","#60a5fa","#93c5fd","#2563c4"] },
    { label: "Active Codes",  val: codes.filter(c => c.is_active).length, iconBg: "#f0fdf4", iconColor: "#16a34a", icon: <IC.Check/>,   barColors: ["#4ade80","#86efac","#4ade80","#86efac","#4ade80","#bbf7d0","#4ade80"] },
    { label: "Invited Staff", val: companyStaff.length,                   iconBg: "#fffbeb", iconColor: "#d97706", icon: <IC.Users/>,   barColors: ["#fbbf24","#fde68a","#f59e0b","#fbbf24","#fde68a","#f59e0b","#fbbf24"] },
    { label: "Roles Defined", val: roles.length,                          iconBg: "#f5f3ff", iconColor: "#7c3aed", icon: <IC.Shield/>,  barColors: ["#a78bfa","#c4b5fd","#a78bfa","#c4b5fd","#a78bfa","#ddd6fe","#a78bfa"] },
    { label: "Divisions",     val: divisions.length,                      iconBg: "#ecfeff", iconColor: "#0891b2", icon: <IC.Layers/>,  barColors: ["#22d3ee","#67e8f9","#22d3ee","#67e8f9","#22d3ee","#a5f3fc","#22d3ee"] },
    { label: "Job Levels",    val: jobLevels.length,                      iconBg: "#fef3c7", iconColor: "#b45309", icon: <IC.Tag/>,     barColors: ["#f59e0b","#fcd34d","#f59e0b","#fcd34d","#f59e0b","#fde68a","#f59e0b"] },
  ];

  const sidebarProps = { company, companyName, initials, navItems, navigate, activeNav: "User Management", onLogout: () => setLogoutModal(true) };

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Poppins','Segoe UI',sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.1); border-radius: 99px; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dropIn  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .fade-in    { animation: fadeUp .3s ease both; }
        .sidebar-slide { animation: slideIn .25s ease both; }
      `}</style>

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)}>
          <aside className="sidebar-slide absolute left-0 top-0 bottom-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden p-5"
            style={{ width: 260, background: "linear-gradient(180deg,#0f1c2e,#0d1a28)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-extrabold text-white">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/50 border-none bg-transparent cursor-pointer p-1"><IC.Close/></button>
            </div>
            <SidebarContent {...sidebarProps} onClose={() => setSidebarOpen(false)}/>
          </aside>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto overflow-x-hidden gap-1 p-3"
        style={{ width: 250, background: "linear-gradient(180deg,#0f1c2e,#0d1a28)" }}>
        <SidebarContent {...sidebarProps} onClose={null}/>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-slate-600 flex-shrink-0">
            <IC.Menu/>
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold" style={{ color: "#1e293b" }}>User Management</span>
            <span className="text-xs mx-1.5" style={{ color: "#94a3b8" }}>/</span>
            <span className="text-xs hidden sm:inline" style={{ color: "#94a3b8" }}>{TABS.find(t => t.key === activeTab)?.label}</span>
          </div>
        </header>

        {/* ── PAGE BODY ───────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 pb-10 overflow-y-auto text-left fade-in">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: "#0f172a" }}>User Management</h2>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "#64748b" }}>Manage invitations, staff, roles, and your organisation structure.</p>
            </div>
            {activeTab === "codes" && (
              <button onClick={openCreateCode}
                className="flex items-center gap-2 border-none px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer flex-shrink-0"
                style={{ background: "#2563c4", boxShadow: "0 4px 12px rgba(37,99,235,.25)" }}>
                <IC.Plus/> <span className="hidden sm:inline">Create Invitation Code</span><span className="sm:hidden">New Code</span>
              </button>
            )}
          </div>

          {/* Stat cards — 2 col → 3 col (sm) → 6 col (xl) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
            {statCards.map(s => (
              <StatCard key={s.label} icon={s.icon} iconBg={s.iconBg} iconColor={s.iconColor} title={s.label} value={s.val.toString()} barColors={s.barColors}/>
            ))}
          </div>

          {/* Tabs — scrollable on mobile */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex border-b border-slate-200 mb-5 min-w-max md:min-w-0">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className="flex items-center gap-2 pb-2.5 mr-4 sm:mr-6 text-sm font-bold border-0 bg-transparent cursor-pointer transition-all whitespace-nowrap"
                  style={{ color: activeTab === t.key ? "#2563c4" : "#94a3b8", borderBottom: activeTab === t.key ? "2px solid #2563c4" : "2px solid transparent" }}>
                  <span style={{ opacity: activeTab === t.key ? 1 : 0.6 }}>{t.icon}</span>
                  {t.label}
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: activeTab === t.key ? "#eff6ff" : "#f1f5f9", color: activeTab === t.key ? "#2563c4" : "#94a3b8" }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ══ TAB: INVITATION CODES ══ */}
          {activeTab === "codes" && (
            <div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 h-9 w-full sm:w-72 mb-4">
                <IC.Search/>
                <input value={codeSearch} onChange={e => setCodeSearch(e.target.value)} placeholder="Search codes…"
                  className="border-none outline-none text-sm w-full bg-transparent" style={{ fontFamily: "inherit" }}/>
              </div>

              {codesLoading ? (
                <div className="py-16 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-slate-200 rounded-full" style={{ borderTopColor: "#2563c4", animation: "spin .6s linear infinite" }}/>
                </div>
              ) : filteredCodes.length === 0 ? (
                <div className="bg-white rounded-2xl py-16 text-center border-2 border-dashed border-slate-200 text-sm" style={{ color: "#94a3b8" }}>No invitation codes found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredCodes.map(ic => (
                    <div key={ic.id_invitation} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"}>

                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          {/* Status dot */}
                          <div className="mt-2 w-2 h-2 rounded-full flex-shrink-0" style={{ background: ic.is_active ? "#22c55e" : "#cbd5e1" }}/>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold" style={{ color: "#475569" }}>{ic.label}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md border"
                                style={{ background: ic.is_active ? "#f0fdf4" : "#f8fafc", color: ic.is_active ? "#16a34a" : "#94a3b8", borderColor: ic.is_active ? "#bbf7d0" : "#e2e8f0" }}>
                                {ic.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            {/* Code + tags — wrap on mobile */}
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="font-black text-2xl sm:text-3xl tracking-[5px] font-mono" style={{ color: ic.is_active ? "#2563c4" : "#94a3b8" }}>
                                {ic.code}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[ic.division, ic.position, ic.employee_status, ic.job_level].filter(Boolean).map((tag, i) => (
                                  <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "#f1f5f9", color: "#64748b" }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>
                              Created {new Date(ic.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-1.5 flex-shrink-0">
                            {[
                              { title: "Copy code", icon: <IC.Copy/>,   fn: () => copy(ic.code) },
                              { title: "Copy link", icon: <IC.Share/>,  fn: () => copy(activationLink(ic.code)) },
                              { title: ic.is_active ? "Deactivate" : "Activate", icon: ic.is_active ? <IC.EyeOff/> : <IC.Eye/>, fn: () => handleToggleCode(ic.id_invitation) },
                            ].map((b, i) => (
                              <button key={i} onClick={b.fn} title={b.title}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white cursor-pointer flex items-center justify-center transition-colors"
                                style={{ color: "#94a3b8" }}
                                onMouseEnter={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color="#475569"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="#fff";    e.currentTarget.style.color="#94a3b8"; }}>
                                {b.icon}
                              </button>
                            ))}
                            <button onClick={() => handleDeleteCode(ic.id_invitation)}
                              className="w-8 h-8 rounded-lg bg-white cursor-pointer flex items-center justify-center transition-colors"
                              style={{ border: "1px solid #fecaca", color: "#fca5a5" }}
                              onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#ef4444"; }}
                              onMouseLeave={e => { e.currentTarget.style.background="#fff";    e.currentTarget.style.color="#fca5a5"; }}>
                              <IC.Trash/>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* URL bar */}
                      <div className="border-t border-slate-50 px-4 sm:px-5 py-2.5 bg-slate-50 flex items-center justify-between gap-3">
                        <span className="text-xs truncate flex-1" style={{ color: "#94a3b8" }}>{activationLink(ic.code)}</span>
                        <button onClick={() => copy(activationLink(ic.code))}
                          className="text-xs font-bold border-none bg-transparent cursor-pointer whitespace-nowrap flex-shrink-0"
                          style={{ color: "#2563c4" }}>Copy URL</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: INVITED STAFF ══ */}
          {activeTab === "staff" && (
            <div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 h-9 w-full sm:w-72 mb-4">
                <IC.Search/>
                <input value={staffSearch} onChange={e => setStaffSearch(e.target.value)} placeholder="Search staff…"
                  className="border-none outline-none text-sm w-full bg-transparent" style={{ fontFamily: "inherit" }}/>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                {/* Scrollable table on mobile */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ minWidth: 560 }}>
                    <thead>
                      <tr className="border-b border-slate-200" style={{ background: "#f8fafc" }}>
                        {["Staff Info", "Role", "Status", "Joined", "Actions"].map((h, i) => (
                          <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide"
                            style={{ color: "#64748b", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {staffLoading ? (
                        <tr><td colSpan="5" className="py-12 text-center">
                          <div className="inline-block w-5 h-5 border-2 border-slate-200 rounded-full" style={{ borderTopColor: "#2563c4", animation: "spin .6s linear infinite" }}/>
                        </td></tr>
                      ) : filteredStaff.length === 0 ? (
                        <tr><td colSpan="5" className="py-12 text-center text-sm" style={{ color: "#94a3b8" }}>No staff found.</td></tr>
                      ) : filteredStaff.map(u => {
                        const rp = getRolePalette(u.role);
                        return (
                          <tr key={u.id_user} className="border-b border-slate-50 transition-colors"
                            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                                  style={{ background: "#eff6ff", color: "#3b82f6" }}>
                                  {(u.name || "?").slice(0,2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-bold truncate" style={{ color: "#1e293b" }}>{u.name}</div>
                                  <div className="text-xs truncate" style={{ color: "#94a3b8" }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold capitalize border"
                                style={{ background: rp.bg, color: rp.color, borderColor: rp.border }}>
                                <IC.Shield/>{u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-md border"
                                style={{ background: u.is_active ? "#f0fdf4" : "#fff7ed", color: u.is_active ? "#16a34a" : "#d97706", borderColor: u.is_active ? "#bbf7d0" : "#fed7aa" }}>
                                {u.is_active ? "Active" : "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>
                              {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={async () => { if (!window.confirm("Remove this user?")) return; try { await axios.delete(`${API}/company-users/${u.id_user}`, { headers: hdrs }); fetchStaff(); } catch (err) { alert(err.response?.data?.message || "Failed."); } }}
                                disabled={u.id_user === currentUser?.id_user}
                                className="w-8 h-8 rounded-lg bg-white cursor-pointer flex items-center justify-center transition-colors ml-auto"
                                style={{ border: "1px solid #fecaca", color: "#fca5a5" }}
                                onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.color="#ef4444"; }}
                                onMouseLeave={e => { e.currentTarget.style.background="#fff";    e.currentTarget.style.color="#fca5a5"; }}>
                                <IC.Trash/>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: ROLES ══ */}
          {activeTab === "roles" && (
            <div className="flex flex-col gap-4">
              <div className="px-4 py-3 rounded-xl text-sm border" style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
                <strong>Note:</strong> Roles control access levels. Assign a role when creating invitation codes. The system roles <strong>admin</strong>, <strong>hr</strong>, and <strong>mentor</strong> are built-in.
              </div>
              <EntityTable
                title="Roles & Access Levels" icon={<IC.Shield/>} accentColor="#7c3aed"
                items={roles} loading={rolesLoading}
                onAdd={() => { setEditingRole(null); setRoleFormError(""); setRoleModal(true); }}
                onEdit={item => { setEditingRole(item); setRoleFormError(""); setRoleModal(true); }}
                onDelete={async item => roleCRUD.del(item)}
                emptyText="No roles defined. Create a role to assign to team members."
                columns={[
                  { key: "name",        label: "Role Name",   render: r => <span className="font-bold" style={{ color: "#4c1d95" }}>{r.name}</span> },
                  { key: "description", label: "Description" },
                  { key: "users_count", label: "Members",     render: r => <span className="font-semibold" style={{ color: "#64748b" }}>{r.users_count ?? 0}</span> },
                ]}
              />
            </div>
          )}

          {/* ══ TAB: ORG STRUCTURE ══ */}
          {activeTab === "org" && (
            <div className="flex flex-col gap-5">
              <EntityTable
                title="Divisions / Departments" icon={<IC.Layers/>} accentColor="#0891b2"
                items={divisions} loading={divsLoading}
                onAdd={() => { setEditingDiv(null); setDivFormError(""); setDivModal(true); }}
                onEdit={item => { setEditingDiv(item); setDivFormError(""); setDivModal(true); }}
                onDelete={async item => divCRUD.del(item)}
                emptyText="No divisions defined yet."
                columns={[
                  { key: "name",        label: "Division Name", render: d => <span className="font-bold" style={{ color: "#164e63" }}>{d.name}</span> },
                  { key: "description", label: "Description" },
                ]}
              />
              <EntityTable
                title="Staff Positions / Job Titles" icon={<IC.Tag/>} accentColor="#2563c4"
                items={staffPositions} loading={posLoading}
                onAdd={() => { setEditingPos(null); setPosFormError(""); setPosModal(true); }}
                onEdit={item => { setEditingPos(item); setPosFormError(""); setPosModal(true); }}
                onDelete={async item => posCRUD.del(item)}
                emptyText="No staff positions defined yet."
                columns={[
                  { key: "name",        label: "Position Title", render: p => <span className="font-bold" style={{ color: "#1e3a8a" }}>{p.name}</span> },
                  { key: "description", label: "Description" },
                ]}
              />
              <EntityTable
                title="Job Levels / Seniority" icon={<IC.Layers/>} accentColor="#b45309"
                items={jobLevels} loading={jlLoading}
                onAdd={() => { setEditingJl(null); setJlFormError(""); setJlModal(true); }}
                onEdit={item => { setEditingJl(item); setJlFormError(""); setJlModal(true); }}
                onDelete={async item => jlCRUD.del(item)}
                emptyText="No job levels defined yet."
                columns={[
                  { key: "name",        label: "Level Name",  render: j => <span className="font-bold" style={{ color: "#78350f" }}>{j.name}</span> },
                  { key: "description", label: "Description" },
                ]}
              />
            </div>
          )}
        </main>
      </div>

      {/* ══ MODAL: CREATE INVITATION CODE ══ */}
      <Modal open={codeModal} onClose={() => setCodeModal(false)} title="Create Invitation Code" wide>
        {codeSuccess && createdCode ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
              style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#22c55e" }}>
              <IC.Check/>
            </div>
            <div className="text-lg font-extrabold mb-1.5" style={{ color: "#0f172a" }}>Code Created!</div>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Share this code or link with your team members.</p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 mb-3" style={{ background: "#f8fafc" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>Invitation Code</div>
              <div className="font-black text-3xl sm:text-4xl tracking-[7px] font-mono mb-3" style={{ color: "#2563c4" }}>{createdCode.code}</div>
              <button onClick={() => copy(createdCode.code)}
                className="text-xs font-bold px-4 py-2 rounded-lg border cursor-pointer"
                style={{ color: "#2563c4", background: "#eff6ff", borderColor: "#bfdbfe", fontFamily: "inherit" }}>
                Copy Code
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 mb-5 text-left" style={{ background: "#f8fafc" }}>
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#94a3b8" }}>Activation Link</div>
              <div className="text-xs mb-3 break-all leading-relaxed" style={{ color: "#475569" }}>{activationLink(createdCode.code)}</div>
              <button onClick={() => copy(activationLink(createdCode.code))}
                className="text-xs font-bold px-4 py-2 rounded-lg border cursor-pointer"
                style={{ color: "#2563c4", background: "#eff6ff", borderColor: "#bfdbfe", fontFamily: "inherit" }}>
                Copy Link
              </button>
            </div>

            <button onClick={() => setCodeModal(false)}
              className="w-full py-3 rounded-xl border-none text-sm font-bold text-white cursor-pointer"
              style={{ background: "#2563c4", fontFamily: "inherit" }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleCreateCode} className="flex flex-col gap-4">
            {codeError && (
              <div className="px-3.5 py-2.5 rounded-lg text-sm border" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>{codeError}</div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Code Label <span style={{ color: "#ef4444" }}>*</span></label>
              <input required value={codeForm.label} onChange={e => setCodeForm(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Intern Batch Q3 – Engineering"
                style={fieldStyle} onFocus={focusField} onBlur={blurField}/>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Role <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchSelect options={roleOptions} value={codeForm.id_role} onChange={val => setCodeForm(p => ({ ...p, id_role: val }))} placeholder="Search and select a role…"/>
              {roles.length === 0 && <p className="text-xs mt-1" style={{ color: "#f59e0b" }}>⚠ No roles defined. Go to the <strong>Roles</strong> tab first.</p>}
            </div>

            {/* Division + Position — 2-col, stacks on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Division</label>
                <SearchSelect options={divOptions} value={codeForm.division} onChange={val => setCodeForm(p => ({ ...p, division: val }))} placeholder="Select or add…" allowCreate onCreateNew={name => quickCreate("division", name)}/>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Position</label>
                <SearchSelect options={posOptions} value={codeForm.position} onChange={val => setCodeForm(p => ({ ...p, position: val }))} placeholder="Select or add…" allowCreate onCreateNew={name => quickCreate("position", name)}/>
              </div>
            </div>

            {/* Employment Status + Job Level — 2-col, stacks on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Employment Status</label>
                <select value={codeForm.employee_status} onChange={e => setCodeForm(p => ({ ...p, employee_status: e.target.value }))}
                  style={fieldStyle} onFocus={focusField} onBlur={blurField}>
                  {["intern","full_time","part_time","contract"].map(v => (
                    <option key={v} value={v}>{v.replace("_"," ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Job Level</label>
                <SearchSelect options={jlOptions} value={codeForm.job_level} onChange={val => setCodeForm(p => ({ ...p, job_level: val }))} placeholder="Select or add…" allowCreate onCreateNew={name => quickCreate("job_level", name)}/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#475569" }}>Work Schedule</label>
              <select value={codeForm.schedule} onChange={e => setCodeForm(p => ({ ...p, schedule: e.target.value }))}
                style={fieldStyle} onFocus={focusField} onBlur={blurField}>
                <option value="">— Select schedule —</option>
                <option value="wfo_fullweek">WFO – Full Week (Mon–Fri)</option>
                <option value="wfh_fullweek">WFH – Full Week (Mon–Fri)</option>
                <option value="hybrid_3_2">Hybrid – 3 WFO / 2 WFH</option>
                <option value="hybrid_2_3">Hybrid – 2 WFO / 3 WFH</option>
                <option value="shift_morning">Shift Pagi (06.00–14.00)</option>
                <option value="shift_afternoon">Shift Siang (14.00–22.00)</option>
                <option value="shift_night">Shift Malam (22.00–06.00)</option>
                <option value="flexible">Flexible Hours</option>
              </select>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={() => setCodeModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer"
                style={{ color: "#64748b", fontFamily: "inherit" }}>Cancel</button>
              <button type="submit" disabled={codeLoading}
                className="flex-1 py-3 rounded-xl border-none text-sm font-bold text-white cursor-pointer flex items-center justify-center gap-2"
                style={{ background: codeLoading ? "#93c5fd" : "#2563c4", fontFamily: "inherit" }}>
                {codeLoading
                  ? <><div className="w-3.5 h-3.5 border-2 rounded-full" style={{ borderColor: "rgba(255,255,255,.4)", borderTopColor: "#fff", animation: "spin .6s linear infinite" }}/>Creating…</>
                  : "Create Code"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ══ MODAL: ROLE / DIVISION / POSITION / JOB LEVEL ══ */}
      <Modal open={roleModal} onClose={() => setRoleModal(false)} title={editingRole ? "Edit Role" : "Create Role"}>
        <EntityForm item={editingRole} loading={roleFormLoading} error={roleFormError} onClose={() => setRoleModal(false)} onSave={async data => { const ok = await roleCRUD.save(editingRole, data); if (ok) setRoleModal(false); }}/>
      </Modal>
      <Modal open={divModal} onClose={() => setDivModal(false)} title={editingDiv ? "Edit Division" : "Create Division"}>
        <EntityForm item={editingDiv} loading={divFormLoading} error={divFormError} onClose={() => setDivModal(false)} onSave={async data => { const ok = await divCRUD.save(editingDiv, data); if (ok) setDivModal(false); }}/>
      </Modal>
      <Modal open={posModal} onClose={() => setPosModal(false)} title={editingPos ? "Edit Position" : "Create Position"}>
        <EntityForm item={editingPos} loading={posFormLoading} error={posFormError} onClose={() => setPosModal(false)} onSave={async data => { const ok = await posCRUD.save(editingPos, data); if (ok) setPosModal(false); }}/>
      </Modal>
      <Modal open={jlModal} onClose={() => setJlModal(false)} title={editingJl ? "Edit Job Level" : "Create Job Level"}>
        <EntityForm item={editingJl} loading={jlFormLoading} error={jlFormError} onClose={() => setJlModal(false)} onSave={async data => { const ok = await jlCRUD.save(editingJl, data); if (ok) setJlModal(false); }}/>
      </Modal>

      {/* ══ LOGOUT MODAL ══ */}
      {logoutModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{ background: "rgba(10,22,40,0.5)" }}>
          <div className="bg-white rounded-2xl p-6 md:p-7 w-full max-w-sm" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
            <div className="text-base font-extrabold mb-1.5" style={{ color: "#0f172a" }}>Sign Out?</div>
            <div className="text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>Are you sure you want to sign out?</div>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer"
                style={{ color: "#64748b", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={async () => { await logout(); navigate("/", { replace: true }); }}
                className="px-4 py-2.5 rounded-xl border-none text-sm font-bold text-white cursor-pointer"
                style={{ background: "#ef4444", fontFamily: "inherit" }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ COPIED TOAST ══ */}
      <div className="fixed bottom-6 left-1/2 z-[9999] pointer-events-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300"
        style={{
          transform:  `translateX(-50%) translateY(${copiedToast ? 0 : 12}px)`,
          opacity:    copiedToast ? 1 : 0,
          background: "#1e293b",
          boxShadow:  "0 8px 24px rgba(0,0,0,0.2)",
          maxWidth:   "calc(100vw - 2rem)",
        }}>
        <IC.Check/> Copied to clipboard
      </div>
    </div>
  );
}