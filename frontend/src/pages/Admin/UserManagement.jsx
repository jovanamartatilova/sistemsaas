import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";

const API = "http://localhost:8000/api";

const IC = {
  Dashboard: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Users: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Program: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Briefcase: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  Settings: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Link: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Copy: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Share: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Shield: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Layers: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Tag: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// STAT CARD — sama persis style Dashboard
// ─────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, barColors }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "22px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      display: "flex", flexDirection: "column", gap: 6, minWidth: 0,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", letterSpacing: "-1px", marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{title}</div>
      {barColors && (
        <div style={{ display: "flex", gap: 3, marginTop: 10, alignItems: "flex-end", height: 28 }}>
          {barColors.map((c, i) => (
            <div key={i} style={{
              flex: 1, background: c, borderRadius: "3px 3px 0 0",
              height: `${30 + Math.sin(i) * 20}%`, opacity: 0.4, minHeight: 4,
            }} />
          ))}
        </div>
      )}
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCHABLE DROPDOWN
// ─────────────────────────────────────────────────────────────
function SearchSelect({ options = [], value, onChange, placeholder = "Select…", allowCreate = false, onCreateNew }) {
  const [q, setQ] = useState("");
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
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(p => !p)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: "#fff",
        border: `1.5px solid ${open ? "#2563c4" : "#e2e8f0"}`,
        borderRadius: 8, fontSize: 13.5, color: selected ? "#1e293b" : "#94a3b8",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        boxShadow: open ? "0 0 0 3px rgba(37,99,196,0.08)" : "none",
        transition: "all 0.15s",
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <IC.ChevronDown />
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, zIndex: 500,
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden",
          animation: "dropIn 0.12s ease",
        }}>
          <div style={{ padding: "8px 8px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 10px" }}>
              <IC.Search />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
                style={{ border: "none", background: "none", outline: "none", fontSize: 12.5, color: "#1e293b", width: "100%", fontFamily: "inherit" }} />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "2px 6px 6px" }}>
            {filtered.length === 0 && !allowCreate && (
              <div style={{ padding: "10px", textAlign: "center", fontSize: 12.5, color: "#94a3b8" }}>No results</div>
            )}
            {filtered.map(o => (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", border: "none", borderRadius: 7,
                  fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                  background: value === o.value ? "#eff6ff" : "transparent",
                  color: value === o.value ? "#2563c4" : "#374151",
                  fontWeight: value === o.value ? 600 : 400,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
                onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (value !== o.value) e.currentTarget.style.background = "transparent"; }}
              >
                {o.label}
                {value === o.value && <IC.Check />}
              </button>
            ))}
            {allowCreate && q && !options.find(o => o.label.toLowerCase() === q.toLowerCase()) && (
              <button type="button" onClick={() => { onCreateNew?.(q); setQ(""); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", border: "none", borderRadius: 7,
                  fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                  background: "transparent", color: "#2563c4", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <IC.Plus /> Add "{q}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ENTITY CRUD TABLE
// ─────────────────────────────────────────────────────────────
function EntityTable({ title, icon, items, loading, onAdd, onEdit, onDelete, columns, emptyText, accentColor = "#2563c4" }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item =>
    columns.some(col => String(item[col.key] || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${accentColor}18`, color: accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{title}</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{items.length} item{items.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 10px", height: 34, width: 180 }}>
          <IC.Search />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ border: "none", outline: "none", fontSize: 12, width: "100%", background: "transparent", fontFamily: "inherit" }} />
        </div>
        <button onClick={onAdd} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          background: accentColor, color: "#fff", border: "none", borderRadius: 8,
          fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 3px 10px ${accentColor}40`,
        }}>
          <IC.Plus /> Add
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #e2e8f0", borderTopColor: accentColor, borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>{search ? "No results for your search." : emptyText}</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {columns.map(col => (
                <th key={col.key} style={{ padding: "10px 18px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "left", borderBottom: "1px solid #f1f5f9" }}>{col.label}</th>
              ))}
              <th style={{ padding: "10px 18px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right", borderBottom: "1px solid #f1f5f9" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id || i} style={{ borderBottom: "1px solid #f8fafc" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: "12px 18px", fontSize: 13, color: "#374151" }}>
                    {col.render ? col.render(item) : (item[col.key] || <span style={{ color: "#cbd5e1" }}>—</span>)}
                  </td>
                ))}
                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button onClick={() => onEdit(item)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = accentColor; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                      <IC.Edit />
                    </button>
                    <button onClick={() => onDelete(item)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fecaca", background: "#fff", color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#fca5a5"; }}>
                      <IC.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.55)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: width, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "fadeUp 0.2s ease", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: "#0f172a" }}>{title}</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            <IC.X />
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIMPLE ENTITY FORM — field bg putih semua
// ─────────────────────────────────────────────────────────────
function EntityForm({ item, onSave, onClose, loading, error, extraFields = [] }) {
  const [form, setForm] = useState({ name: item?.name || "", description: item?.description || "" });
  const [extra, setExtra] = useState(() => Object.fromEntries(extraFields.map(f => [f.key, item?.[f.key] || ""])));

  const inp = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: 13.5, outline: "none",
    color: "#1e293b", background: "#fff", fontFamily: "inherit",
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, ...extra }); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>{error}</div>}
      <div>
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Name <span style={{ color: "#ef4444" }}>*</span></label>
        <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp}
          onFocus={e => e.target.style.borderColor = "#2563c4"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
      </div>
      {extraFields.map(f => (
        <div key={f.key}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>{f.label}</label>
          <input value={extra[f.key]} onChange={e => setExtra(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp}
            onFocus={e => e.target.style.borderColor = "#2563c4"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
        </div>
      ))}
      <div>
        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Description</label>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
          style={{ ...inp, resize: "vertical" }}
          onFocus={e => e.target.style.borderColor = "#2563c4"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13.5, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
        <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: loading ? "#93c5fd" : "#2563c4", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />Saving…</> : (item ? "Save Changes" : "Create")}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR ITEM
// ─────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "9px 13px", borderRadius: 9,
      background: active ? "rgba(74,158,255,0.12)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
      border: active ? "1px solid rgba(74,158,255,0.22)" : "1px solid transparent",
      color: active ? "#4a9eff" : "rgba(255,255,255,0.6)",
      fontSize: 13.5, fontWeight: active ? 600 : 500, cursor: "pointer", textAlign: "left",
    }}>
      <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span> {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function UserManagement() {
  const navigate = useNavigate();
  const { logout, token, user: currentUser } = useAuthStore();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState("codes");
  const [logoutModal, setLogoutModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const [codes, setCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [codeModal, setCodeModal] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [codeForm, setCodeForm] = useState({ label: "", id_role: "", division: "", position: "", employee_status: "intern", schedule: "", job_level: "" });
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleModal, setRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormLoading, setRoleFormLoading] = useState(false);
  const [roleFormError, setRoleFormError] = useState("");

  const [divisions, setDivisions] = useState([]);
  const [divsLoading, setDivsLoading] = useState(false);
  const [divModal, setDivModal] = useState(false);
  const [editingDiv, setEditingDiv] = useState(null);
  const [divFormLoading, setDivFormLoading] = useState(false);
  const [divFormError, setDivFormError] = useState("");

  const [staffPositions, setStaffPositions] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [posModal, setPosModal] = useState(false);
  const [editingPos, setEditingPos] = useState(null);
  const [posFormLoading, setPosFormLoading] = useState(false);
  const [posFormError, setPosFormError] = useState("");

  const [jobLevels, setJobLevels] = useState([]);
  const [jlLoading, setJlLoading] = useState(false);
  const [jlModal, setJlModal] = useState(false);
  const [editingJl, setEditingJl] = useState(null);
  const [jlFormLoading, setJlFormLoading] = useState(false);
  const [jlFormError, setJlFormError] = useState("");

  const hdrs = { Authorization: `Bearer ${token}` };

  const fetchCodes = useCallback(async () => {
    try { setCodesLoading(true); const r = await axios.get(`${API}/company/invitation-codes`, { headers: hdrs }); setCodes(Array.isArray(r.data) ? r.data : []); } catch { } finally { setCodesLoading(false); }
  }, [token]);
  const fetchStaff = useCallback(async () => {
    try { setStaffLoading(true); const r = await axios.get(`${API}/company-users?type=all`, { headers: hdrs }); setStaff(Array.isArray(r.data) ? r.data : []); } catch { } finally { setStaffLoading(false); }
  }, [token]);
  const fetchRoles = useCallback(async () => {
    try { setRolesLoading(true); const r = await axios.get(`${API}/company/config/roles`, { headers: hdrs }); setRoles(Array.isArray(r.data) ? r.data : []); } catch { } finally { setRolesLoading(false); }
  }, [token]);
  const fetchDivisions = useCallback(async () => {
    try { setDivsLoading(true); const r = await axios.get(`${API}/company/config/divisions`, { headers: hdrs }); setDivisions(Array.isArray(r.data) ? r.data : []); } catch { } finally { setDivsLoading(false); }
  }, [token]);
  const fetchPositions = useCallback(async () => {
    try { setPosLoading(true); const r = await axios.get(`${API}/company/config/staff-positions`, { headers: hdrs }); setStaffPositions(Array.isArray(r.data) ? r.data : []); } catch { } finally { setPosLoading(false); }
  }, [token]);
  const fetchJobLevels = useCallback(async () => {
    try { setJlLoading(true); const r = await axios.get(`${API}/company/config/job-levels`, { headers: hdrs }); setJobLevels(Array.isArray(r.data) ? r.data : []); } catch { } finally { setJlLoading(false); }
  }, [token]);

  useEffect(() => {
    const s = localStorage.getItem("company");
    if (s) { try { setCompany(JSON.parse(s)); } catch { } }
    if (token) { fetchCodes(); fetchStaff(); fetchRoles(); fetchDivisions(); fetchPositions(); fetchJobLevels(); }
  }, [token]);

  const copy = t => { navigator.clipboard.writeText(t); setCopiedToast(true); setTimeout(() => setCopiedToast(false), 2000); };
  const activationLink = c => `${window.location.origin}/activate?code=${c}`;

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

  const handleToggleCode = async id => {
    try { await axios.patch(`${API}/company/invitation-codes/${id}/toggle`, {}, { headers: hdrs }); fetchCodes(); } catch { alert("Failed."); }
  };
  const handleDeleteCode = async id => {
    if (!window.confirm("Delete this invitation code?")) return;
    try { await axios.delete(`${API}/company/invitation-codes/${id}`, { headers: hdrs }); fetchCodes(); } catch { alert("Failed."); }
  };

  const mkCRUD = (base, fetchFn, setLoading, setError) => ({
    save: async (item, data) => {
      setLoading(true); setError("");
      try {
        if (item) await axios.put(`${API}${base}/${item.id}`, data, { headers: hdrs });
        else await axios.post(`${API}${base}`, data, { headers: hdrs });
        fetchFn(); return true;
      } catch (err) { setError(err.response?.data?.message || "Failed to save."); return false; }
      finally { setLoading(false); }
    },
    del: async item => {
      if (!window.confirm(`Delete "${item.name}"?`)) return;
      try { await axios.delete(`${API}${base}/${item.id}`, { headers: hdrs }); fetchFn(); } catch (err) { alert(err.response?.data?.message || "Failed."); }
    },
  });

  const roleCRUD = mkCRUD("/company/config/roles", fetchRoles, setRoleFormLoading, setRoleFormError);
  const divCRUD  = mkCRUD("/company/config/divisions", fetchDivisions, setDivFormLoading, setDivFormError);
  const posCRUD  = mkCRUD("/company/config/staff-positions", fetchPositions, setPosFormLoading, setPosFormError);
  const jlCRUD   = mkCRUD("/company/config/job-levels", fetchJobLevels, setJlFormLoading, setJlFormError);

  const quickCreate = async (type, name) => {
    const endpoint = { division: `${API}/company/config/divisions`, position: `${API}/company/config/staff-positions`, job_level: `${API}/company/config/job-levels` };
    try {
      const r = await axios.post(endpoint[type], { name }, { headers: hdrs });
      if (type === "division") { fetchDivisions(); setCodeForm(p => ({ ...p, division: r.data.name })); }
      if (type === "position") { fetchPositions(); setCodeForm(p => ({ ...p, position: r.data.name })); }
      if (type === "job_level") { fetchJobLevels(); setCodeForm(p => ({ ...p, job_level: r.data.name })); }
    } catch { }
  };

  const roleKey = u => String(u?.role || "").toLowerCase();
  const companyStaff = staff.filter(u => u.id_company);
  const filteredCodes = codes.filter(c => c.label?.toLowerCase().includes(codeSearch.toLowerCase()) || c.code?.toLowerCase().includes(codeSearch.toLowerCase()));
  const filteredStaff = companyStaff.filter(u => u.name?.toLowerCase().includes(staffSearch.toLowerCase()) || u.email?.toLowerCase().includes(staffSearch.toLowerCase()));

  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));
  const divOptions  = divisions.map(d => ({ value: d.name, label: d.name }));
  const posOptions  = staffPositions.map(p => ({ value: p.name, label: p.name }));
  const jlOptions   = jobLevels.map(j => ({ value: j.name, label: j.name }));

  const companyName = company?.name || "Admin";
  const initials = companyName.slice(0, 2).toUpperCase();

  const TABS = [
    { key: "codes", label: "Invitation Codes", icon: <IC.Link />,   count: codes.length },
    { key: "staff", label: "Invited Staff",    icon: <IC.Users />,  count: companyStaff.length },
    { key: "roles", label: "Roles",            icon: <IC.Shield />, count: roles.length },
    { key: "org",   label: "Org Structure",    icon: <IC.Layers />, count: divisions.length + staffPositions.length + jobLevels.length },
  ];

  const navItems = [
    { label: "Dashboard",            icon: <IC.Dashboard />,  path: "/dashboard" },
    { label: "User Management",      icon: <IC.Users />,      path: "/users" },
    { label: "Program Management",   icon: <IC.Briefcase />,  path: "/programs" },
    { label: "Positions Management", icon: <IC.Program />,    path: "/positions" },
  ];

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
  const hash = String(name).toLowerCase().split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ROLE_PALETTES[hash % ROLE_PALETTES.length];
};

const roleColor  = r => getRolePalette(r).color;
const roleBg     = r => getRolePalette(r).bg;
const roleBorder = r => getRolePalette(r).border;

  // ── field style helper (bg putih, teks gelap) ─────────────
  const fieldStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: 13.5, outline: "none",
    color: "#1e293b", background: "#fff", fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.1); border-radius: 99px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes dropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        input:focus, select:focus, textarea:focus { border-color: #2563c4 !important; box-shadow: 0 0 0 3px rgba(37,99,196,0.08) !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: 248, flexShrink: 0, background: "linear-gradient(180deg,#0f1c2e,#0d1a28)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, padding: "18px 11px", gap: 3 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, padding: "3px 6px 18px", textDecoration: "none" }}>
          <img src="/assets/images/logo.png" alt="" style={{ height: 44 }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>EarlyPath</span>
        </Link>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1.2px", padding: "4px 13px", textTransform: "uppercase" }}>Menu</p>
        {navItems.map(n => <SideItem key={n.label} icon={n.icon} label={n.label} active={n.label === "User Management"} onClick={() => navigate(n.path)} />)}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "10px 8px" }} />
        <SideItem icon={<IC.Settings />} label="Settings" active={false} onClick={() => navigate("/settings")} />
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
          {company?.logo_path
            ? <img src={`http://127.0.0.1:8000/storage/${company.logo_path}`} style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
            : <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#2d7dd2,#4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>{initials}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyName}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Admin</div>
          </div>
          <button onClick={() => setLogoutModal(true)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: 4, borderRadius: 6 }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}>
            <IC.Logout />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ height: 54, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1e293b" }}>User Management</span>
          <span style={{ color: "#e2e8f0", margin: "0 8px" }}>/</span>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{TABS.find(t => t.key === activeTab)?.label}</span>
        </header>

        <main style={{ flex: 1, padding: "26px 28px", overflowY: "auto", animation: "fadeUp 0.3s ease" }}>
          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>User Management</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Manage invitations, staff, roles, and your organisation structure.</p>
            </div>
            {activeTab === "codes" && (
              <button onClick={openCreateCode} style={{ display: "flex", alignItems: "center", gap: 7, background: "#2563c4", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
                <IC.Plus /> Create Invitation Code
              </button>
            )}
          </div>

          {/* ── STAT CARDS — style Dashboard ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 26 }}>
            {[
              { label: "Total Codes",   val: codes.length,                          iconBg: "#eff6ff", iconColor: "#2563c4", icon: <IC.Link />,     barColors: ["#2563c4","#60a5fa","#93c5fd","#2563c4","#60a5fa","#93c5fd","#2563c4"] },
              { label: "Active Codes",  val: codes.filter(c => c.is_active).length, iconBg: "#f0fdf4", iconColor: "#16a34a", icon: <IC.Check />,    barColors: ["#4ade80","#86efac","#4ade80","#86efac","#4ade80","#bbf7d0","#4ade80"] },
              { label: "Invited Staff", val: companyStaff.length,                   iconBg: "#fffbeb", iconColor: "#d97706", icon: <IC.Users />,    barColors: ["#fbbf24","#fde68a","#f59e0b","#fbbf24","#fde68a","#f59e0b","#fbbf24"] },
              { label: "Roles Defined", val: roles.length,                          iconBg: "#f5f3ff", iconColor: "#7c3aed", icon: <IC.Shield />,   barColors: ["#a78bfa","#c4b5fd","#a78bfa","#c4b5fd","#a78bfa","#ddd6fe","#a78bfa"] },
              { label: "Divisions",     val: divisions.length,                      iconBg: "#ecfeff", iconColor: "#0891b2", icon: <IC.Layers />,   barColors: ["#22d3ee","#67e8f9","#22d3ee","#67e8f9","#22d3ee","#a5f3fc","#22d3ee"] },
              { label: "Job Levels",    val: jobLevels.length,                      iconBg: "#fef3c7", iconColor: "#b45309", icon: <IC.Tag />,      barColors: ["#f59e0b","#fcd34d","#f59e0b","#fcd34d","#f59e0b","#fde68a","#f59e0b"] },
            ].map(s => (
              <StatCard
                key={s.label}
                icon={s.icon}
                iconBg={s.iconBg}
                iconColor={s.iconColor}
                title={s.label}
                value={s.val.toString()}
                barColors={s.barColors}
              />
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #e2e8f0", marginBottom: 22 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "10px 18px 10px 0", marginRight: 18,
                fontSize: 13.5, fontWeight: 700, border: "none", background: "none",
                color: activeTab === t.key ? "#2563c4" : "#94a3b8",
                borderBottom: activeTab === t.key ? "2px solid #2563c4" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <span style={{ opacity: activeTab === t.key ? 1 : 0.6 }}>{t.icon}</span>
                {t.label}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 100, background: activeTab === t.key ? "#eff6ff" : "#f1f5f9", color: activeTab === t.key ? "#2563c4" : "#94a3b8" }}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* ══════ TAB: INVITATION CODES ══════ */}
          {activeTab === "codes" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0 12px", height: 38, width: 280, marginBottom: 18 }}>
                <IC.Search />
                <input value={codeSearch} onChange={e => setCodeSearch(e.target.value)} placeholder="Search codes…"
                  style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent", fontFamily: "inherit" }} />
              </div>
              {codesLoading ? (
                <div style={{ padding: 60, textAlign: "center" }}><div style={{ display: "inline-block", width: 22, height: 22, border: "2px solid #e2e8f0", borderTopColor: "#2563c4", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /></div>
              ) : filteredCodes.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 14, padding: "60px", textAlign: "center", border: "1.5px dashed #e2e8f0", color: "#94a3b8", fontSize: 13 }}>No invitation codes found.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredCodes.map(ic => (
                    <div key={ic.id_invitation} style={{ background: "#fff", borderRadius: 13, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"}
                    >
                      <div style={{ padding: "16px 20px 12px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{ marginTop: 7, width: 7, height: 7, borderRadius: "50%", background: ic.is_active ? "#22c55e" : "#cbd5e1", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{ic.label}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 6, background: ic.is_active ? "#f0fdf4" : "#f8fafc", color: ic.is_active ? "#16a34a" : "#94a3b8", border: `1px solid ${ic.is_active ? "#bbf7d0" : "#e2e8f0"}` }}>
                                {ic.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 28, fontWeight: 900, color: ic.is_active ? "#2563c4" : "#94a3b8", letterSpacing: "5px", fontFamily: "monospace" }}>{ic.code}</span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {[ic.division, ic.position, ic.employee_status, ic.job_level].filter(Boolean).map((tag, i) => (
                                  <span key={i} style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", borderRadius: 6, padding: "2px 9px", fontWeight: 600 }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                            <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 5 }}>Created {new Date(ic.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {[
                              { title: "Copy code", icon: <IC.Copy />, fn: () => copy(ic.code) },
                              { title: "Copy link", icon: <IC.Share />, fn: () => copy(activationLink(ic.code)) },
                              { title: ic.is_active ? "Deactivate" : "Activate", icon: ic.is_active ? <IC.EyeOff /> : <IC.Eye />, fn: () => handleToggleCode(ic.id_invitation) },
                            ].map((b, i) => (
                              <button key={i} onClick={b.fn} title={b.title} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#94a3b8"; }}>
                                {b.icon}
                              </button>
                            ))}
                            <button onClick={() => handleDeleteCode(ic.id_invitation)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fecaca", background: "#fff", color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#fca5a5"; }}>
                              <IC.Trash />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #f8fafc", padding: "8px 20px 8px 39px", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{activationLink(ic.code)}</span>
                        <button onClick={() => copy(activationLink(ic.code))} style={{ fontSize: 12, fontWeight: 700, color: "#2563c4", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", paddingLeft: 12 }}>Copy URL</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════ TAB: INVITED STAFF ══════ */}
          {activeTab === "staff" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0 12px", height: 38, width: 280, marginBottom: 18 }}>
                <IC.Search />
                <input value={staffSearch} onChange={e => setStaffSearch(e.target.value)} placeholder="Search staff…"
                  style={{ border: "none", outline: "none", fontSize: 13, width: "100%", background: "transparent", fontFamily: "inherit" }} />
              </div>
              <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {["Staff Info","Role","Status","Joined","Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 18px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staffLoading ? (
                      <tr><td colSpan="5" style={{ padding: 50, textAlign: "center" }}><div style={{ display: "inline-block", width: 18, height: 18, border: "2px solid #e2e8f0", borderTopColor: "#2563c4", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /></td></tr>
                    ) : filteredStaff.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: "50px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>No staff found.</td></tr>
                    ) : filteredStaff.map(u => (
                      <tr key={u.id_user} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{(u.name || "?").slice(0, 2).toUpperCase()}</div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{u.name}</div>
                              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: roleBg(u.role), color: roleColor(u.role), border: `1px solid ${roleBorder(u.role)}`, padding: "3px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize" }}>
                            <IC.Shield />{u.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: u.is_active ? "#f0fdf4" : "#fff7ed", color: u.is_active ? "#16a34a" : "#d97706", border: `1px solid ${u.is_active ? "#bbf7d0" : "#fed7aa"}` }}>
                            {u.is_active ? "Active" : "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: 12.5, color: "#64748b" }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={{ padding: "12px 18px", textAlign: "right" }}>
                          <button onClick={async () => { if (!window.confirm("Remove this user?")) return; try { await axios.delete(`${API}/company-users/${u.id_user}`, { headers: hdrs }); fetchStaff(); } catch (err) { alert(err.response?.data?.message || "Failed."); } }}
                            disabled={u.id_user === currentUser?.id_user}
                            style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fecaca", background: "#fff", color: "#fca5a5", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#fca5a5"; }}>
                            <IC.Trash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════ TAB: ROLES ══════ */}
          {activeTab === "roles" && (
            <div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#92400e" }}>
                <strong>Note:</strong> Roles control access levels for your team members. Assign a role when generating invitation codes. The system roles <strong>admin</strong>, <strong>hr</strong>, and <strong>mentor</strong> are built-in.
              </div>
              <EntityTable
                title="Roles & Access Levels" icon={<IC.Shield />} accentColor="#7c3aed"
                items={roles} loading={rolesLoading}
                onAdd={() => { setEditingRole(null); setRoleFormError(""); setRoleModal(true); }}
                onEdit={item => { setEditingRole(item); setRoleFormError(""); setRoleModal(true); }}
                onDelete={async item => roleCRUD.del(item)}
                emptyText="No roles defined. Create a role to assign to team members."
                columns={[
                  { key: "name", label: "Role Name", render: r => <span style={{ fontWeight: 700, color: "#4c1d95" }}>{r.name}</span> },
                  { key: "description", label: "Description" },
                  { key: "users_count", label: "Members", render: r => <span style={{ fontWeight: 600, color: "#64748b" }}>{r.users_count ?? 0}</span> },
                ]}
              />
            </div>
          )}

          {/* ══════ TAB: ORG STRUCTURE ══════ */}
          {activeTab === "org" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <EntityTable
                title="Divisions / Departments" icon={<IC.Layers />} accentColor="#0891b2"
                items={divisions} loading={divsLoading}
                onAdd={() => { setEditingDiv(null); setDivFormError(""); setDivModal(true); }}
                onEdit={item => { setEditingDiv(item); setDivFormError(""); setDivModal(true); }}
                onDelete={async item => divCRUD.del(item)}
                emptyText="No divisions defined yet."
                columns={[
                  { key: "name", label: "Division Name", render: d => <span style={{ fontWeight: 700, color: "#164e63" }}>{d.name}</span> },
                  { key: "description", label: "Description" },
                ]}
              />
              <EntityTable
                title="Staff Positions / Job Titles" icon={<IC.Tag />} accentColor="#2563c4"
                items={staffPositions} loading={posLoading}
                onAdd={() => { setEditingPos(null); setPosFormError(""); setPosModal(true); }}
                onEdit={item => { setEditingPos(item); setPosFormError(""); setPosModal(true); }}
                onDelete={async item => posCRUD.del(item)}
                emptyText="No staff positions defined yet."
                columns={[
                  { key: "name", label: "Position Title", render: p => <span style={{ fontWeight: 700, color: "#1e3a8a" }}>{p.name}</span> },
                  { key: "description", label: "Description" },
                ]}
              />
              <EntityTable
                title="Job Levels / Seniority" icon={<IC.Layers />} accentColor="#b45309"
                items={jobLevels} loading={jlLoading}
                onAdd={() => { setEditingJl(null); setJlFormError(""); setJlModal(true); }}
                onEdit={item => { setEditingJl(item); setJlFormError(""); setJlModal(true); }}
                onDelete={async item => jlCRUD.del(item)}
                emptyText="No job levels defined yet."
                columns={[
                  { key: "name", label: "Level Name", render: j => <span style={{ fontWeight: 700, color: "#78350f" }}>{j.name}</span> },
                  { key: "description", label: "Description" },
                ]}
              />
            </div>
          )}
        </main>
      </div>

      {/* ══════ MODAL: CREATE INVITATION CODE ══════ */}
      <Modal open={codeModal} onClose={() => setCodeModal(false)} title="Create Invitation Code" width={520}>
        {codeSuccess && createdCode ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#22c55e" }}><IC.Check /></div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Code Created!</div>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Share this code or link with your team members.</p>
            <div style={{ background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: 13, padding: "20px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>Invitation Code</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: "#2563c4", letterSpacing: "7px", fontFamily: "monospace", marginBottom: 12 }}>{createdCode.code}</div>
              <button onClick={() => copy(createdCode.code)} style={{ fontSize: 12, fontWeight: 700, color: "#2563c4", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit" }}>Copy Code</button>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Activation Link</div>
              <div style={{ fontSize: 12, color: "#475569", wordBreak: "break-all", marginBottom: 8, lineHeight: 1.6 }}>{activationLink(createdCode.code)}</div>
              <button onClick={() => copy(activationLink(createdCode.code))} style={{ fontSize: 12, fontWeight: 700, color: "#2563c4", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit" }}>Copy Link</button>
            </div>
            <button onClick={() => setCodeModal(false)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "#2563c4", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleCreateCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {codeError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>{codeError}</div>}

            {/* Code Label */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Code Label <span style={{ color: "#ef4444" }}>*</span></label>
              <input required value={codeForm.label} onChange={e => setCodeForm(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Intern Batch Q3 – Engineering"
                style={fieldStyle}
                onFocus={e => { e.target.style.borderColor = "#2563c4"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,196,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </div>

            {/* Role */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Role <span style={{ color: "#ef4444" }}>*</span></label>
              <SearchSelect
                options={roleOptions} value={codeForm.id_role}
                onChange={val => setCodeForm(p => ({ ...p, id_role: val }))}
                placeholder="Search and select a role…"
              />
              {roles.length === 0 && <p style={{ fontSize: 11.5, color: "#f59e0b", marginTop: 5 }}>⚠ No roles defined. Go to the <strong>Roles</strong> tab to create one first.</p>}
            </div>

            {/* Division + Position */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Division</label>
                <SearchSelect options={divOptions} value={codeForm.division} onChange={val => setCodeForm(p => ({ ...p, division: val }))} placeholder="Select or add…" allowCreate onCreateNew={name => quickCreate("division", name)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Position</label>
                <SearchSelect options={posOptions} value={codeForm.position} onChange={val => setCodeForm(p => ({ ...p, position: val }))} placeholder="Select or add…" allowCreate onCreateNew={name => quickCreate("position", name)} />
              </div>
            </div>

            {/* Employment Status + Job Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Employment Status</label>
                <select value={codeForm.employee_status} onChange={e => setCodeForm(p => ({ ...p, employee_status: e.target.value }))}
                  style={fieldStyle}>
                  {["intern","full_time","part_time","contract"].map(v => <option key={v} value={v}>{v.replace("_"," ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Job Level</label>
                <SearchSelect options={jlOptions} value={codeForm.job_level} onChange={val => setCodeForm(p => ({ ...p, job_level: val }))} placeholder="Select or add…" allowCreate onCreateNew={name => quickCreate("job_level", name)} />
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 5 }}>Work Schedule</label>
              <select value={codeForm.schedule} onChange={e => setCodeForm(p => ({ ...p, schedule: e.target.value }))}
                style={fieldStyle}>
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

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setCodeModal(false)} style={{ flex: 1, padding: 11, borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13.5, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button type="submit" disabled={codeLoading} style={{ flex: 1, padding: 11, borderRadius: 9, border: "none", background: codeLoading ? "#93c5fd" : "#2563c4", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: codeLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {codeLoading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />Creating…</> : "Create Code"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ══════ MODAL: ROLE ══════ */}
      <Modal open={roleModal} onClose={() => setRoleModal(false)} title={editingRole ? "Edit Role" : "Create Role"}>
        <EntityForm item={editingRole} loading={roleFormLoading} error={roleFormError}
          onClose={() => setRoleModal(false)}
          onSave={async data => { const ok = await roleCRUD.save(editingRole, data); if (ok) setRoleModal(false); }} />
      </Modal>

      {/* ══════ MODAL: DIVISION ══════ */}
      <Modal open={divModal} onClose={() => setDivModal(false)} title={editingDiv ? "Edit Division" : "Create Division"}>
        <EntityForm item={editingDiv} loading={divFormLoading} error={divFormError}
          onClose={() => setDivModal(false)}
          onSave={async data => { const ok = await divCRUD.save(editingDiv, data); if (ok) setDivModal(false); }} />
      </Modal>

      {/* ══════ MODAL: STAFF POSITION ══════ */}
      <Modal open={posModal} onClose={() => setPosModal(false)} title={editingPos ? "Edit Position" : "Create Position"}>
        <EntityForm item={editingPos} loading={posFormLoading} error={posFormError}
          onClose={() => setPosModal(false)}
          onSave={async data => { const ok = await posCRUD.save(editingPos, data); if (ok) setPosModal(false); }} />
      </Modal>

      {/* ══════ MODAL: JOB LEVEL ══════ */}
      <Modal open={jlModal} onClose={() => setJlModal(false)} title={editingJl ? "Edit Job Level" : "Create Job Level"}>
        <EntityForm item={editingJl} loading={jlFormLoading} error={jlFormError}
          onClose={() => setJlModal(false)}
          onSave={async data => { const ok = await jlCRUD.save(editingJl, data); if (ok) setJlModal(false); }} />
      </Modal>

      {/* ══════ LOGOUT MODAL ══════ */}
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 26, width: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Sign Out?</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>Are you sure you want to sign out?</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={async () => { await logout(); navigate("/", { replace: true }); }} style={{ padding: "9px 16px", borderRadius: 9, border: "none", background: "#ef4444", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ COPIED TOAST ══════ */}
      <div style={{ position: "fixed", bottom: 26, left: "50%", transform: `translateX(-50%) translateY(${copiedToast ? 0 : 12}px)`, background: "#1e293b", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, opacity: copiedToast ? 1 : 0, transition: "all 0.25s ease", zIndex: 9999, pointerEvents: "none", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
        <IC.Check /> Copied to clipboard
      </div>
    </div>
  );
}