import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const IC = {
  Search: () => <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>,
  MapPin: () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg>,
  ChevronDown: () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='6 9 12 15 18 9'/></svg>,
  FileText: () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>,
  Video: () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='23 7 16 12 23 17 23 7'></polygon><rect x='1' y='5' width='15' height='14' rx='2' ry='2'></rect></svg>,
  // ── added for DocListModal ──
  Folder: () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/></svg>,
  ExternalLink: () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/><polyline points='15 3 21 3 21 9'/><line x1='10' y1='14' x2='21' y2='3'/></svg>,
  X: () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>,
};

function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateToFrontend(dateStr) {
    if (!dateStr) return "Select date…";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const month = MONTHS_SHORT[parseInt(m) - 1];
    return `${parseInt(d)} ${month} ${y}`;
}

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
        const mm = month + 1 < 10 ? `0${month + 1}` : month + 1;
        const dd = d < 10 ? `0${d}` : d;
        const dateStr = `${year}-${mm}-${dd}`;
        onChange(dateStr);
        setOpen(false);
    };

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);

    return (
        <div ref={ref} style={{ position: "relative", width: "220px" }}>
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", border: `1.5px solid ${open ? "#3b82f6" : "#cbd5e1"}`,
                    borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff",
                    boxShadow: open ? "0 0 0 3px rgba(59,130,246,.12)" : "none", transition: "all .15s",
                }}
            >
                <div style={{ flex: 1, padding: "9px 13px", textAlign: "left", fontSize: 13, color: value ? "#0f172a" : "#cbd5e1", fontFamily: "inherit" }}>
                    {formatDateToFrontend(value)}
                </div>
                <div style={{ width: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                     <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
            </div>

            {open && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 400, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.14)", padding: 12, width: "220px", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
                            style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{MONTHS_FULL[month]} {year}</span>
                        <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
                            style={{ width: 28, height: 28, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 2 }}>
                        {DAYS_SHORT.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "center", padding: "4px 0" }}>{d}</div>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                        {days.map((d, i) => {
                            if (!d) return <div key={i} />;
                            const date = new Date(year, month, d);
                            const isPast = date < now;
                            const isToday = date.getTime() === now.getTime();
                            const mm = month + 1 < 10 ? `0${month + 1}` : month + 1;
                            const dd = d < 10 ? `0${d}` : d;
                            const dateStr = `${year}-${mm}-${dd}`;
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



function CustomTimePicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [typedTime, setTypedTime] = useState(value || '');
    const [selectedHour, setSelectedHour] = useState('09');
    const [selectedMinute, setSelectedMinute] = useState('00');
    const [selectedPeriod, setSelectedPeriod] = useState('AM');
    const ref = useRef(null);

    useEffect(() => {
        if (value) {
            setTypedTime(value);
            const parts = value.split(':');
            if (parts.length === 2) {
                let h = parseInt(parts[0], 10);
                let m = parts[1];
                let p = 'AM';
                if (h >= 12) {
                    p = 'PM';
                    if (h > 12) h -= 12;
                }
                if (h === 0) h = 12;
                setSelectedHour(h < 10 ? `0${h}` : `${h}`);
                setSelectedMinute(m);
                setSelectedPeriod(p);
            }
        }
    }, [value]);

    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const hours = Array.from({ length: 12 }, (_, i) => {
        const h = i + 1;
        return h < 10 ? `0${h}` : `${h}`;
    });

    const minutes = Array.from({ length: 60 }, (_, i) => i < 10 ? `0${i}` : `${i}`);

    const updateTime = (h, m, p) => {
        let hour24 = parseInt(h, 10);
        if (p === 'PM' && hour24 < 12) hour24 += 12;
        if (p === 'AM' && hour24 === 12) hour24 = 0;
        const h24Str = hour24 < 10 ? `0${hour24}` : `${hour24}`;
        const newTime = `${h24Str}:${m}`;
        onChange(newTime);
    };

    return (
        <div ref={ref} style={{ position: "relative", width: "220px" }}>
            <style>{`
                .time-scroll-col::-webkit-scrollbar {
                    width: 5px;
                }
                .time-scroll-col::-webkit-scrollbar-track {
                    background: #fff;
                }
                .time-scroll-col::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .time-scroll-col::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", border: `1.5px solid ${open ? "#3b82f6" : "#cbd5e1"}`,
                    borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff",
                    boxShadow: open ? "0 0 0 3px rgba(59,130,246,.12)" : "none", transition: "all .15s",
                }}
            >
                <div style={{ flex: 1, padding: "10px 12px", textAlign: "left", fontSize: 13, color: value ? "#0f172a" : "#cbd5e1", fontFamily: "inherit" }}>
                    {value ? `${selectedHour}:${selectedMinute} ${selectedPeriod}` : "Select time…"}
                </div>
                <div style={{ width: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
            </div>

            {open && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 400, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.14)", padding: '16px', width: '220px', boxSizing: 'border-box' }}>
                    
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Hour</label>
                            <input 
                                type="text"
                                maxLength="2"
                                placeholder="09"
                                value={selectedHour}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 2) {
                                        setSelectedHour(val);
                                        const hNum = parseInt(val, 10);
                                        if (hNum >= 1 && hNum <= 12) {
                                            const hStr = hNum < 10 ? `0${hNum}` : `${hNum}`;
                                            updateTime(hStr, selectedMinute, selectedPeriod);
                                        }
                                    }
                                }}
                                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
                            />
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#cbd5e1', marginTop: '14px' }}>:</div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Minute</label>
                            <input 
                                type="text"
                                maxLength="2"
                                placeholder="00"
                                value={selectedMinute}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 2) {
                                        setSelectedMinute(val);
                                        const mNum = parseInt(val, 10);
                                        if (mNum >= 0 && mNum <= 59) {
                                            const mStr = mNum < 10 ? `0${mNum}` : `${mNum}`;
                                            updateTime(selectedHour, mStr, selectedPeriod);
                                        }
                                    }
                                }}
                                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>AM/PM</label>
                            <div 
                                onClick={() => {
                                    const nextP = selectedPeriod === 'AM' ? 'PM' : 'AM';
                                    setSelectedPeriod(nextP);
                                    updateTime(selectedHour, selectedMinute, nextP);
                                }}
                                style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#f8fafc', color: '#1e293b', cursor: 'pointer', textAlign: 'center', userSelect: 'none', marginTop: '2px' }}
                            >
                                {selectedPeriod}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', height: '180px' }}>
                        <div className="time-scroll-col" style={{ flex: 1, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '6px', background: '#fff' }}>
                            <div style={{ fontSize: '10px', fontWeight: '800', textAlign: 'center', color: '#94a3b8', padding: '4px 0', position: 'sticky', top: 0, background: '#fff' }}>HR</div>
                            {hours.map(h => {
                                const isSel = selectedHour === h;
                                return (
                                    <div key={h} onClick={() => { setSelectedHour(h); updateTime(h, selectedMinute, selectedPeriod); }}
                                        style={{ fontSize: '12px', padding: '6px 0', textAlign: 'center', cursor: 'pointer', background: isSel ? '#3b82f6' : 'transparent', color: isSel ? '#fff' : '#475569', fontWeight: isSel ? '700' : '500' }}>
                                        {h}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="time-scroll-col" style={{ flex: 1, overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '6px', background: '#fff' }}>
                            <div style={{ fontSize: '10px', fontWeight: '800', textAlign: 'center', color: '#94a3b8', padding: '4px 0', position: 'sticky', top: 0, background: '#fff' }}>MIN</div>
                            {minutes.map(m => {
                                const isSel = selectedMinute === m;
                                return (
                                    <div key={m} onClick={() => { setSelectedMinute(m); updateTime(selectedHour, m, selectedPeriod); }}
                                        style={{ fontSize: '12px', padding: '6px 0', textAlign: 'center', cursor: 'pointer', background: isSel ? '#3b82f6' : 'transparent', color: isSel ? '#fff' : '#475569', fontWeight: isSel ? '700' : '500' }}>
                                        {m}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="time-scroll-col" style={{ width: '60px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '6px', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            {['AM', 'PM'].map(p => {
                                const isSel = selectedPeriod === p;
                                return (
                                    <div key={p} onClick={() => { setSelectedPeriod(p); updateTime(selectedHour, selectedMinute, p); }}
                                        style={{ fontSize: '12px', padding: '12px 0', textAlign: 'center', cursor: 'pointer', background: isSel ? '#3b82f6' : 'transparent', color: isSel ? '#fff' : '#475569', fontWeight: isSel ? '700' : '500', borderRadius: '4px', margin: '2px' }}>
                                        {p}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const VARIANT = {
  green: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  red: { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  blue: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};

// ─── Doc Constants (same as CandidateHR) ─────────────────────────────────────
const DOC_TYPES = [
  { key: 'has_cv',                 label: 'CV',                  type: 'cv' },
  { key: 'has_cover_letter',       label: 'Cover Letter',        type: 'cover_letter' },
  { key: 'has_portfolio',          label: 'Portfolio',           type: 'portfolio' },
  { key: 'has_institution_letter', label: 'Institution Letter',  type: 'institution_letter' },
];

// ─── IconBtn (same as CandidateHR) ───────────────────────────────────────────
function IconBtn({ icon, title, onClick, color = '#475569', bgHov = '#f1f5f9' }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '7px', border: '1px solid #e2e8f0', background: hov ? bgHov : '#fff',
        color, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );
}

// ─── DocItem (same as CandidateHR) ───────────────────────────────────────────
function DocItem({ label, onView }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
        background: hov ? '#f8fafc' : '#fff', transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IC.FileText />
        </div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{label}</span>
      </div>
      <button
        onClick={onView}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px',
          fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', border: '1px solid #bfdbfe',
          background: '#eff6ff', color: '#1d4ed8', fontFamily: 'inherit', transition: 'all 0.15s',
        }}
      >
        <IC.ExternalLink /> Open
      </button>
    </div>
  );
}

// ─── DocListModal (same as CandidateHR) ──────────────────────────────────────
function DocListModal({ candidate, onClose, onViewDoc }) {
  if (!candidate) return null;
  const available = DOC_TYPES.filter(d => candidate[d.key]);
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '380px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Documents</h3>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>{candidate.name}</p>
          </div>
          <IconBtn icon={<IC.X />} title="Close" onClick={onClose} />
        </div>
        <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {available.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No documents uploaded.</p>
          ) : (
            available.map((d) => (
              <DocItem key={d.type} label={d.label} onView={() => { onViewDoc(candidate, d.type); onClose(); }} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DocsIconBtn (same as CandidateHR) ───────────────────────────────────────
function DocsIconBtn({ candidate, onOpen, hasAny }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={hasAny ? 'View documents' : 'No documents'}
      onClick={hasAny ? onOpen : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '7px', fontSize: '11.5px', fontWeight: '600',
        cursor: hasAny ? 'pointer' : 'default',
        border: `1px solid ${hasAny ? (hov ? '#93c5fd' : '#bfdbfe') : '#e2e8f0'}`,
        background: hasAny ? (hov ? '#dbeafe' : '#eff6ff') : '#f8fafc',
        color: hasAny ? '#1d4ed8' : '#cbd5e1',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      <IC.Folder />
      {hasAny ? 'See Docs' : 'None'}
    </button>
  );
}

function ActionBtn({ label, variant = 'blue', onClick }) {
  const v = VARIANT[variant];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '5px 12px', borderRadius: '7px', fontSize: '11.5px', fontWeight: '600',
        cursor: 'pointer', border: `1px solid ${v.border}`,
        background: hov ? v.border : v.bg, color: v.color, whiteSpace: 'nowrap',
        fontFamily: 'inherit', transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function SelectionHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [activePositionId, setActivePositionId] = useState('');
  
  const [activeTab, setActiveTab] = useState(null);
  const [activeSubStageIndex, setActiveSubStageIndex] = useState(null);
  const [finalStatusFilter, setFinalStatusFilter] = useState('accepted');
  const [expandedStageIndex, setExpandedStageIndex] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [tableLoading, setTableLoading] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: "reject"|"accept"|"pass", candidate, nextStageIndex }
  const [notesCandidate, setNotesCandidate] = useState(null);
  const [assignTestCandidate, setAssignTestCandidate] = useState(null);
  const [testName, setTestName] = useState('');
  const [testLink, setTestLink] = useState('');
  const [testDeadline, setTestDeadline] = useState('');
  const [testNotes, setTestNotes] = useState('');

  const [showBulkTestModal, setShowBulkTestModal] = useState(false);
  const [globalTestName, setGlobalTestName] = useState('Technical Test');
  const [globalTestLink, setGlobalTestLink] = useState('');
  const [globalTestInstructions, setGlobalTestInstructions] = useState('');
  const [globalTestDeadline, setGlobalTestDeadline] = useState('');

  // Draft Blueprints
  const [showAddTestTypeModal, setShowAddTestTypeModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [deleteTemplateConfirm, setDeleteTemplateConfirm] = useState(null);
  const [newTestName, setNewTestName] = useState('');
  const [newTestFormat, setNewTestFormat] = useState('coding_test');
  const [newTestFile, setNewTestFile] = useState(null);

  // Bulk Assign Data
  const [bulkTestId, setBulkTestId] = useState('');
  const [bulkTestLocation, setBulkTestLocation] = useState('Online');
  const [bulkTestDate, setBulkTestDate] = useState('');
  const [bulkTestTime, setBulkTestTime] = useState('');

  const [configuredTests, setConfiguredTests] = useState([
    { id: 1, name: 'Technical Coding Test', format: 'coding_test', instructions: 'Selesaikan dalam waktu 120 menit.', link: '' },
    { id: 2, name: 'Aptitude & Logical Test', format: 'aptitude_test', instructions: 'Kerjakan tanpa menggunakan kalkulator.', link: '' }
  ]);
  const [pickTestCandidate, setPickTestCandidate] = useState(null);

  const [assignInterviewCandidate, setAssignInterviewCandidate] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('Online'); 
  const [offlinePlace, setOfflinePlace] = useState('');
  const [onlinePlatform, setOnlinePlatform] = useState('Google Meet');
  const [onlineLink, setOnlineLink] = useState('');

  useEffect(() => {
    if (assignInterviewCandidate) {
      const iv = assignInterviewCandidate.interview;
      if (iv) {
        setInterviewDate(iv.interview_date || '');
        setInterviewTime(iv.interview_time || '');
        const isOffline = iv.media === 'Offline';
        setInterviewType(isOffline ? 'Offline' : 'Online');
        if (isOffline) {
          setOfflinePlace(iv.notes || '');
          setOnlinePlatform('Google Meet');
          setOnlineLink('');
        } else {
          setOnlinePlatform(iv.media || 'Google Meet');
          setOnlineLink(iv.link || '');
          setOfflinePlace('');
        }
      } else {
        setInterviewDate('');
        setInterviewTime('');
        setInterviewType('Online');
        setOfflinePlace('');
        setOnlinePlatform('Google Meet');
        setOnlineLink('');
      }
    }
  }, [assignInterviewCandidate]);

  // ── 1. Fetch Positions ──────────────────────────────────────────────
  useEffect(() => {
    api('/positions/catalog')
      .then(res => {
        const dataArr = Array.isArray(res) ? res : (res.data || []);
        if (dataArr.length > 0) {
          setPositions(dataArr);
          setActivePositionId(dataArr[0].id_position);
        }
      })
      .catch(err => console.error("Positions fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── 2. Flow Data Derivation ─────────────────────────────────────────
  const activePosition = useMemo(() => positions.find(p => p.id_position === activePositionId), [positions, activePositionId]);
  
  const selectionFlow = useMemo(() => {
    if (!activePosition || !activePosition.selection_flow) return [];
    try {
      const flow = typeof activePosition.selection_flow === 'string' ? JSON.parse(activePosition.selection_flow) : activePosition.selection_flow;
      return Array.isArray(flow) ? flow : [];
    } catch { return []; }
  }, [activePosition]);

  const visualizerStages = useMemo(() => {
    if (selectionFlow.length === 0) return [];
    const merged = [];
    selectionFlow.forEach((stage, idx) => {
      const prev = merged[merged.length - 1];
      if (prev && prev.type === stage.type) {
        prev.items.push({ ...stage, index: idx });
      } else {
        merged.push({ type: stage.type, items: [{ ...stage, index: idx }] });
      }
    });
    return merged;
  }, [selectionFlow]);

  const stageGroups = useMemo(() => {
    const groups = {};
    const order = [];
    selectionFlow.forEach((stage, i) => {
      if (!groups[stage.type]) { groups[stage.type] = []; order.push(stage.type); }
      groups[stage.type].push({ ...stage, globalIndex: i });
    });
    return order.map(t => ({ type: t, stages: groups[t] }));
  }, [selectionFlow]);
  useEffect(() => {
    if (activePosition) {
      const templates = activePosition.test_templates;
      if (Array.isArray(templates)) {
        setConfiguredTests(templates);
      } else {
        setConfiguredTests([]);
      }
    }
  }, [activePosition]);

  useEffect(() => {
    if (stageGroups.length > 0) {
      setActiveTab(stageGroups[0].type);
      setActiveSubStageIndex(stageGroups[0].stages[0].globalIndex);
    } else {
      setActiveTab('final');
      setActiveSubStageIndex(null);
    }
    setExpandedStageIndex(null);
  }, [stageGroups]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'final') {
      const group = stageGroups.find(g => g.type === tab);
      if (group && group.stages.length > 0) setActiveSubStageIndex(group.stages[0].globalIndex);
    }
  };

  // ── 3. Fetch Candidates ─────────────────────────────────────────────
  const fetchCandidates = (isSearch = false) => {
    if (!activePositionId) return;
    if (isSearch) setTableLoading(true);
    const params = new URLSearchParams();
    params.set('id_position', activePositionId);
    if (search) params.set('search', search);
    if (activeTab === 'final') {
      params.set('status', finalStatusFilter);
    } else {
      params.set('status', `stage_${activeSubStageIndex}`);
    }
    api(`/hr/candidates?${params}`)
      .then(res => setCandidates(res.candidates || res.data?.candidates || []))
      .catch(err => console.error("Candidates fetch error:", err))
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    if (activePositionId && activeTab) {
      if (activeTab === 'final' || activeSubStageIndex !== null) fetchCandidates();
    }
  }, [activePositionId, activeTab, activeSubStageIndex, finalStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) fetchCandidates(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ── 4. Actions ──────────────────────────────────────────────────────
  const handlePass = (c) => {
    const currentIdx = activeSubStageIndex;
    const isLastStage = currentIdx === selectionFlow.length - 1;
    if (isLastStage) {
      setConfirmAction({ type: 'accept', candidate: c });
    } else {
      setConfirmAction({ type: 'pass', candidate: c, nextStageIndex: currentIdx + 1 });
    }
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, candidate, nextStageIndex } = confirmAction;
    try {
      if (type === 'accept') {
        await api(`/hr/candidates/${candidate.id_submission}/accept`, { method: 'PATCH' });
      } else if (type === 'reject') {
        await api(`/hr/candidates/${candidate.id_submission}/reject`, { method: 'PATCH' });
      } else if (type === 'pass') {
        await api(`/hr/candidates/${candidate.id_submission}/stage`, {
          method: 'PATCH',
          data: { stage: `stage_${nextStageIndex}` }
        });
      }
      setConfirmAction(null);
      fetchCandidates();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  const handleSaveNotes = async (id, note) => {
    const oldCandidates = [...candidates];
    try {
      // Optimistic update
      setCandidates(prev => prev.map(c => c.id_submission === id ? { ...c, hr_notes: note } : c));
      
      await api(`/hr/candidates/${id}/notes`, { method: 'PATCH', data: { hr_notes: note } });
    } catch (err) {
      console.error("Failed to save notes:", err);
      setCandidates(oldCandidates);
      alert("Gagal menyimpan catatan: " + (err.message || err));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate('/login');
  };

  const viewDoc = async (c, type) => {
    try {
      const res = await api(`/hr/candidates/${c.id_submission}/documents/${type}`);
      const url = res.url || res.data?.url;
      if (url) window.open(url, '_blank');
    } catch { alert("Document not found"); }
  };

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner message="Loading..." />;

  const currentGroup = stageGroups.find(g => g.type === activeTab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: '56px', background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px', position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Dashboard</span>
            <span style={{ fontSize: '13px', color: '#94a3b8', margin: '0 6px' }}>/</span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Selection Flow</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{todayStr()}</span>
        </header>

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Selection Management</h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Manage candidate stages dynamically based on position requirements.</p>
            </div>
            
            {/* Position Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Position</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={activePositionId}
                  onChange={e => setActivePositionId(e.target.value)}
                  style={{
                    appearance: 'none', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px',
                    padding: '8px 36px 8px 16px', fontSize: '13.5px', fontWeight: '600', color: '#1e293b',
                    outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', minWidth: '220px'
                  }}
                >
                  {positions.map(p => <option key={p.id_position} value={p.id_position}>{p.name}</option>)}
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                  <IC.ChevronDown />
                </div>
              </div>
            </div>
          </div>

          {/* Flow Visualizer */}
          {visualizerStages.length > 0 && (
            <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginRight: '8px' }}>Stage:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {visualizerStages.map((group, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {idx > 0 && <span style={{ color: '#cbd5e1' }}>→</span>}
                      <button
                        onClick={() => setExpandedStageIndex(expandedStageIndex === idx ? null : idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none',
                          fontSize: '12.5px', fontWeight: '600', color: expandedStageIndex === idx ? '#1d4ed8' : '#3b82f6',
                          background: expandedStageIndex === idx ? '#dbeafe' : '#eff6ff', padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                          transition: 'all 0.2s', fontFamily: 'inherit'
                        }}
                      >
                        {group.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        <IC.ChevronDown />
                      </button>
                    </div>
                  ))}
                  <span style={{ color: '#cbd5e1' }}>→</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>Final</span>
                </div>
              </div>
              
              {/* Expanded Stage Details */}
              {expandedStageIndex !== null && visualizerStages[expandedStageIndex] && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginTop: '4px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {visualizerStages[expandedStageIndex].items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                        <span style={{ fontWeight: '600', color: '#475569' }}>
                          {item.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} {(() => {
                            let count = 0;
                            for (let k = 0; k <= item.index; k++) {
                              if (selectionFlow[k].type === item.type) count++;
                            }
                            return count;
                          })()} : {item.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                        {item.description || 
                          (item.type === 'screening' ? "Tahap awal penyeleksian di mana HR akan meninjau kelengkapan documents, Curriculum Vitae (CV), dan portofolio kandidat untuk memastikan kesesuaian dengan kualifikasi posisi." : 
                           item.type === 'test' ? "Tahap pengujian kemampuan teknis atau asesmen kompetensi untuk mengukur keahlian praktis kandidat sesuai kebutuhan posisi." :
                           item.type === 'interview' ? "Sesi wawancara langsung untuk menggali lebih dalam mengenai pengalaman, motivasi, pola pikir, dan culture fit kandidat." :
                           "Tahap penyeleksian kandidat untuk mengevaluasi kelayakan lanjutan.")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'test' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <div 
                onClick={() => setExpandedStageIndex(expandedStageIndex === 'test-setup' ? null : 'test-setup')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Test Types</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>{configuredTests.length} Rules Available</span>
                </div>
                <div style={{ transform: expandedStageIndex === 'test-setup' ? 'rotate(180deg)' : 'none', transition: 'all 0.2s', color: '#64748b' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
                </div>
              </div>

              {expandedStageIndex === 'test-setup' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    {configuredTests.map(t => (
                      <div key={t.id} style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', background: '#fff', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <button 
                          onClick={() => setDeleteTemplateConfirm(t)}
                          style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                          title="Delete Template"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        </button>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', paddingRight: '24px' }}>{t.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
                          Format: <strong style={{ color: '#3b82f6' }}>{
                            t.format === 'coding_test' ? 'Tes Teknis / Coding Test' :
                            t.format === 'aptitude_test' ? 'Psikotes & Logika' :
                            t.format === 'essay_project' ? 'Studi Kasus & Project' :
                            'Tes Tertulis Esai'
                          }</strong>
                        </div>
                        {t.instructions && <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>"{t.instructions}"</div>}
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                          <button 
                            onClick={() => {
                              setEditingTemplateId(t.id);
                              setNewTestName(t.name);
                              setNewTestFormat(t.format || 'coding_test');
                              setTestNotes(t.instructions || '');
                              setShowAddTestTypeModal(true);
                            }}
                            style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '600', color: '#475569', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', flex: 1 }}
                          >
                            Edit Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setEditingTemplateId(null);
                      setNewTestName('');
                      setNewTestFormat('coding_test');
                      setTestNotes('');
                      setNewTestFile(null);
                      setShowAddTestTypeModal(true);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                      background: '#fff', color: '#3b82f6', border: '1px dashed #3b82f6', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                  >
                    + Add New Test Type
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Card */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            
            {/* Tabs & Sub-filters */}
            <div style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', overflowX: 'auto', padding: '0 8px' }}>
                {stageGroups.map(g => (
                  <TabBtn key={g.type} active={activeTab === g.type} onClick={() => handleTabChange(g.type)}>
                    {g.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TabBtn>
                ))}
                <TabBtn active={activeTab === 'final'} onClick={() => handleTabChange('final')}>Final</TabBtn>
              </div>

              {/* Sub-filters row */}
              <div style={{ padding: '12px 20px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {activeTab !== 'final' && currentGroup && currentGroup.stages.length > 1 && (
                    <select
                      value={activeSubStageIndex}
                      onChange={e => setActiveSubStageIndex(Number(e.target.value))}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '600', outline: 'none' }}
                    >
                      {currentGroup.stages.map((st, sidx) => (
                        <option key={st.globalIndex} value={st.globalIndex}>
                          {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} {sidx + 1} : {st.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {activeTab === 'final' && (
                    <select
                      value={finalStatusFilter}
                      onChange={e => setFinalStatusFilter(e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '600', outline: 'none' }}
                    >
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  )}
                  {activeTab !== 'final' && currentGroup && currentGroup.stages.length === 1 && (
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                      Current Stage: <span style={{ color: '#0f172a' }}>{currentGroup.stages[0].name || currentGroup.stages[0].type}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {activeTab === 'test' && (
                    <button
                      onClick={() => setShowBulkTestModal(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                        background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 10px rgba(59,130,246,0.2)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      Bulk Assign Test
                    </button>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', width: '220px' }}>
                    <IC.Search />
                    <input
                      placeholder="Search candidate..." value={search} onChange={e => setSearch(e.target.value)}
                      style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', background: 'transparent', color: '#1e293b' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'interview' ? '1.4fr 1fr 1.5fr 1.5fr 1.2fr 1.5fr' : activeTab === 'test' ? '1.4fr 1.2fr 1fr 1.4fr 1.2fr 0.8fr 1.2fr 1.5fr' : '1.4fr 1fr 0.6fr 0.6fr 0.9fr 0.9fr 1.2fr 1.5fr', gap: '12px', padding: '12px 24px', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9' }}>
              {(activeTab === 'interview' 
                ? ['CANDIDATE', 'UNIVERSITY', 'SCHEDULE', 'LOCATION', 'NOTES', 'ACTION']
                : activeTab === 'test'
                ? ['CANDIDATE', 'UNIVERSITY', 'LOCATIONS', 'SCHEDULE', 'SUBMISSIONS', 'SCORE', 'NOTES', 'ACTION']
                : ['CANDIDATE', 'UNIVERSITY', 'CV', 'PORTO', 'DOCUMENTS', 'APPLIED DATE', 'NOTES', 'ACTION']
              ).map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textAlign: ['CANDIDATE', 'UNIVERSITY'].includes(h) ? 'left' : 'center' }}>{h}</div>
              ))}
            </div>

            <div style={{ minHeight: '300px' }}>
              {tableLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading...</div>
              ) : candidates.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>No candidates in this stage.</div>
              ) : (
                candidates.map((c, i) => (
                  <div key={c.id_submission} style={{
                    display: 'grid', gridTemplateColumns: activeTab === 'interview' ? '1.4fr 1fr 1.5fr 1.5fr 1.2fr 1.5fr' : activeTab === 'test' ? '1.4fr 1.2fr 1fr 1.4fr 1.2fr 0.8fr 1.2fr 1.5fr' : '1.4fr 1fr 0.6fr 0.6fr 0.9fr 0.9fr 1.2fr 1.5fr', gap: '12px', padding: '16px 24px', alignItems: 'center',
                    borderBottom: i < candidates.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}>
                    {/* Candidate */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                        {(c.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                      </div>
                    </div>

                    {/* University */}
                    <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: '500', textAlign: 'left', minWidth: 0 }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.university || '-'}</span>
                    </div>

                    {activeTab === 'interview' ? (
                      <>
                        {c.interview ? (
                          <>
                            <div 
                              onClick={() => setAssignInterviewCandidate(c)} 
                              style={{ fontSize: '12.5px', color: '#475569', textAlign: 'center', cursor: 'pointer', padding: '6px', borderRadius: '8px', border: '1px solid transparent', transition: 'all 0.15s' }}
                              title="Click to edit schedule"
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f0fdf4'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              {new Date(c.interview.interview_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              <br />
                              <span style={{ fontSize: '11.5px', color: '#64748b' }}>{c.interview.interview_time.substring(0, 5)} WIB</span>
                            </div>

                            <div 
                              onClick={() => setAssignInterviewCandidate(c)} 
                              style={{ fontSize: '12.5px', color: '#475569', textAlign: 'center', cursor: 'pointer', padding: '6px', borderRadius: '8px', border: '1px solid transparent', transition: 'all 0.15s' }}
                              title="Click to edit location"
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f0fdf4'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              {c.interview.media === 'Offline' ? (
                                <span title={c.interview.notes} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}><IC.MapPin /> {c.interview.notes || 'Offline Place'}</span>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center', color: '#3b82f6' }}>
                                    <IC.Video /> {c.interview.media}
                                  </span>
                                  {c.interview.link && (
                                    <a 
                                      href={c.interview.link} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      onClick={(e) => e.stopPropagation()} 
                                      style={{ fontSize: '10.5px', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '12px', textDecoration: 'none' }}
                                    >
                                      Join Meet
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => setAssignInterviewCandidate(c)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: '1px dashed #cbd5e1',
                                background: '#fff',
                                color: '#64748b',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                width: 'fit-content'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.background = '#f0f7ff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff'; }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              Assign Interview
                            </button>
                          </div>
                        )}
                      </>
                    ) : activeTab === 'test' ? (
                      <>
                        {/* Locations */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                          {c.test_location || 'Online'}
                        </div>

                        {/* Schedule */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2px' }}>
                          {c.test_date ? (
                            <>
                              <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>{formatDateToFrontend(c.test_date)}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{c.test_time || '09:00'} WIB</span>
                            </>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Not Scheduled</span>
                          )}
                        </div>

                        {/* Submission */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {c.test_link || c.test_submission ? (
                            <a href={c.test_submission || c.test_link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', background: '#eff6ff', padding: '4px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                              View
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                          )}
                        </div>

                        {/* Score */}
                        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700', textAlign: 'center' }}>
                          {c.test_score ? (
                            <span style={{ color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }} onClick={() => { setAssignTestCandidate(c); setTestName(c.test_name || ''); setTestLink(c.test_link || ''); setTestNotes(c.test_notes || ''); }}>{c.test_score}/100</span>
                          ) : (
                            <button
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', 
                                border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: '11px', 
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' 
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.background = '#f0f7ff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff'; }}
                              onClick={() => {
                                setAssignTestCandidate(c);
                                setTestName(c.test_name || '');
                                setTestLink(c.test_link || '');
                                setTestNotes(c.test_notes || '');
                              }}
                            >
                              Grade
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* CV */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {c.has_cv ? <DocBtn label="View" onClick={() => viewDoc(c, 'cv')} /> : <span style={{ fontSize: '12px', color: '#cbd5e1' }}>-</span>}
                        </div>

                        {/* Porto */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {c.has_portfolio ? <DocBtn label="View" onClick={() => viewDoc(c, 'portfolio')} /> : <span style={{ fontSize: '12px', color: '#cbd5e1' }}>-</span>}
                        </div>

                        {/* Documents */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {c.has_cover_letter ? <DocBtn label="View" onClick={() => viewDoc(c, 'cover_letter')} /> : <span style={{ fontSize: '12px', color: '#cbd5e1' }}>-</span>}
                        </div>

                        {/* Date */}
                        <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '-'}
                        </div>
                      </>
                    )}

                    {/* Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      {c.hr_notes ? (
                        <div 
                          style={{ 
                            fontSize: '12px', 
                            color: '#475569', 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            padding: '6px 10px', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            maxWidth: '200px'
                          }}
                          onClick={() => setNotesCandidate(c)}
                          title="Click to edit note"
                        >
                          {c.hr_notes}
                        </div>
                      ) : (
                        <button
                          onClick={() => setNotesCandidate(c)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px dashed #cbd5e1',
                            background: '#fff',
                            color: '#64748b',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            width: 'fit-content'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.background = '#f0f7ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#fff'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          Add Notes
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {activeTab !== 'final' && (
                        <>
                          <ActionBtn label={activeSubStageIndex === selectionFlow.length - 1 ? "Accept" : "Pass"} variant="green" onClick={() => handlePass(c)} />
                          <ActionBtn label="Reject" variant="red" onClick={() => setConfirmAction({ type: 'reject', candidate: c })} />
                        </>
                      )}
                      {activeTab === 'final' && c.status === 'accepted' && (
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>Accepted</span>
                      )}
                      {activeTab === 'final' && c.status === 'rejected' && (
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '20px' }}>Rejected</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
      </div>

      {showLogoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "28px", width: "360px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif",
          }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>
              Are you sure you want to sign out from your HR account?
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowLogoutModal(false)} style={{
                padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2e8f0",
                background: "#fff", fontSize: "13px", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit",
              }}>Cancel</button>
              <button onClick={handleLogout} style={{
                padding: "9px 18px", borderRadius: "10px", border: "none",
                background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit",
              }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {notesCandidate && (
        <div
          onClick={(e) => e.target === e.currentTarget && setNotesCandidate(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Add/Edit Notes</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{notesCandidate.name}</p>
              </div>
              <button 
                onClick={() => setNotesCandidate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <textarea
                defaultValue={notesCandidate.hr_notes || ''}
                id="hr_notes_area"
                placeholder="Add internal notes about this candidate..."
                rows={5}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: '#fff', fontSize: '13px', fontFamily: 'inherit', color: '#1e293b', resize: 'vertical',
                  outline: 'none', lineHeight: '1.6', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setNotesCandidate(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button
                  onClick={async () => {
                    const note = document.getElementById('hr_notes_area').value;
                    await handleSaveNotes(notesCandidate.id_submission, note);
                    setNotesCandidate(null);
                  }}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTestTypeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <style>{`
              .custom-file-input::file-selector-button {
                background: #f8fafc;
                color: #475569;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 6px 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
                margin-right: 10px;
                font-size: 11.5px;
              }
              .custom-file-input::file-selector-button:hover {
                background: #3b82f6;
                color: #ffffff;
                border-color: #3b82f6;
              }
            `}</style>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Create Test Template</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>Create evaluation guidelines for this position</p>
              </div>
              <button 
                onClick={() => setShowAddTestTypeModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Test Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Backend Algorithm Challenge" 
                  value={newTestName} 
                  onChange={e => setNewTestName(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Bentuk Tes (Format)</label>
                <select 
                  value={newTestFormat} 
                  onChange={e => setNewTestFormat(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                >
                  <option value="coding_test">Tes Teknis / Coding Test</option>
                  <option value="aptitude_test">Psikotes & Logika (Aptitude)</option>
                  <option value="essay_project">Studi Kasus & Project (Take-Home)</option>
                  <option value="written_test">Tes Tertulis Esai</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Attach Question File / PDF (Optional)</label>
                <input 
                  type="file" 
                  className="custom-file-input"
                  onChange={e => setNewTestFile(e.target.files[0] || null)} 
                  style={{ width: '100%', padding: '8px', fontSize: '12px', color: '#64748b', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Provisions & Instructions</label>
                <textarea 
                  placeholder="Instruksi pengerjaan..." 
                  value={testNotes} 
                  onChange={e => setTestNotes(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', background: '#fff', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  onClick={() => setShowAddTestTypeModal(false)} 
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newTestName) return alert('Nama tes wajib diisi!');
                    try {
                      const formData = new FormData();
                      formData.append('name', newTestName);
                      formData.append('format', newTestFormat);
                      formData.append('instructions', testNotes);
                      if (newTestFile) formData.append('file', newTestFile);
                      if (editingTemplateId) formData.append('template_id', editingTemplateId);

                      const res = await api(`/hr/positions/${activePositionId}/test-templates`, {
                        method: 'POST',
                        body: formData
                      });

                      if (res.success) {
                        setConfiguredTests(res.data);
                        setNewTestName('');
                        setNewTestFile(null);
                        setTestNotes('');
                        setEditingTemplateId(null);
                        setShowAddTestTypeModal(false);
                        alert(editingTemplateId ? 'Test template updated successfully!' : 'Test template created successfully!');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Failed to save template: ' + (err.message || err));
                    }
                  }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.2)' }}
                >
                  {editingTemplateId ? 'Update Template' : 'Save Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTemplateConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 310, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Delete Test Template?</h3>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
              Are you sure you want to delete the template <strong>{deleteTemplateConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteTemplateConfirm(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await api(`/hr/positions/${activePositionId}/test-templates/${deleteTemplateConfirm.id}`, {
                      method: 'DELETE'
                    });
                    if (res.success) {
                      setConfiguredTests(res.data);
                      setDeleteTemplateConfirm(null);
                      alert('Template deleted successfully');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Failed to delete template: ' + (err.message || err));
                  }
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showBulkTestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Bulk Assign Test</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>Push assessments to current applicant groups</p>
              </div>
              <button 
                onClick={() => setShowBulkTestModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Test Type</label>
                <select 
                  value={bulkTestId} 
                  onChange={e => setBulkTestId(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                >
                  <option value="">-- Choose Test Template --</option>
                  {configuredTests.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Location Type</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Online', 'Offline'].map(type => {
                    const isSel = bulkTestLocation === type;
                    return (
                      <div 
                        key={type}
                        onClick={() => setBulkTestLocation(type)}
                        style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', color: isSel ? '#1e293b' : '#64748b', fontWeight: isSel ? '600' : '500' }}
                      >
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${isSel ? '#3b82f6' : '#cbd5e1'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                          {isSel && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />}
                        </div>
                        {type}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Schedule Date</label>
                  <CalendarPicker value={bulkTestDate} onChange={setBulkTestDate} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Schedule Time</label>
                  <CustomTimePicker value={bulkTestTime} onChange={setBulkTestTime} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Deadline (Optional)</label>
                <CalendarPicker value={globalTestDeadline} onChange={setGlobalTestDeadline} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  onClick={() => setShowBulkTestModal(false)} 
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const selObj = configuredTests.find(t => String(t.id) === String(bulkTestId));
                    if (!selObj) return alert('Pilih tipe tes dulu!');
                    if (!bulkTestDate || !bulkTestTime) return alert('Tanggal dan Jam wajib diisi!');

                    try {
                      const id_submissions = candidates.map(c => c.id_submission);
                      if (id_submissions.length === 0) return alert('Tidak ada kandidat di tahap ini!');

                      const res = await api('/hr/candidates/bulk-assign-test', {
                        method: 'POST',
                        data: {
                          id_submissions,
                          test_name: selObj.name,
                          test_location: bulkTestLocation,
                          test_date: bulkTestDate,
                          test_time: bulkTestTime,
                          test_deadline: globalTestDeadline || null
                        }
                      });

                      if (res.success) {
                        alert(res.message);
                        fetchCandidates();
                        setShowBulkTestModal(false);
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Gagal mengalokasikan tes: ' + (err.message || err));
                    }
                  }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.2)' }}
                >
                  Assign Tests Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pickTestCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Assign Test</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>Select a test for {pickTestCandidate.name}</p>
              </div>
              <button onClick={() => setPickTestCandidate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {configuredTests.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No test provisions created yet. Configure them above the table first.</div>
              ) : (
                configuredTests.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => {
                      setCandidates(prev => prev.map(c => c.id_submission === pickTestCandidate.id_submission ? { ...c, test_name: t.name, test_link: t.link, test_notes: t.instructions, test_deadline: t.deadline, test_status: 'Assigned' } : c));
                      setPickTestCandidate(null);
                    }}
                    style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fcfcfd', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fcfcfd'; }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>{t.name}</div>
                    {t.deadline && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Deadline: {new Date(t.deadline).toLocaleDateString()}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {assignTestCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Assign & Grade Test</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#94a3b8' }}>{assignTestCandidate.name}</p>
              </div>
              <button 
                onClick={() => setAssignTestCandidate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Test Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Logical Reasoning, Technical Coding" 
                  value={testName} 
                  onChange={e => setTestName(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Test Link / URL</label>
                <input 
                  type="url" 
                  placeholder="e.g. https://forms.gle/... or Hackerrank Link" 
                  value={testLink} 
                  onChange={e => setTestLink(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Score / Grade (Optional)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  placeholder="e.g. 85" 
                  value={assignTestCandidate.test_score || ''} 
                  onChange={e => {
                    const val = e.target.value;
                    setAssignTestCandidate(prev => ({ ...prev, test_score: val }));
                  }} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Additional Instructions</label>
                <textarea 
                  placeholder="Give passcodes, rules, or guidelines for the test..." 
                  value={testNotes} 
                  onChange={e => setTestNotes(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', background: '#fff', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  onClick={() => setAssignTestCandidate(null)} 
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCandidates(prev => prev.map(c => c.id_submission === assignTestCandidate.id_submission ? { ...c, test_name: testName, test_link: testLink, test_score: assignTestCandidate.test_score, test_notes: testNotes } : c));
                    setAssignTestCandidate(null);
                  }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.2)' }}
                >
                  Save Test Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {assignInterviewCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '420px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Schedule Interview</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>Assign interview for <strong>{assignInterviewCandidate.name}</strong></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Date</label>
                <CalendarPicker value={interviewDate} onChange={setInterviewDate} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Time</label>
                <CustomTimePicker value={interviewTime} onChange={setInterviewTime} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Location Type</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Online', 'Offline'].map(type => {
                    const isSel = interviewType === type;
                    return (
                      <div 
                        key={type}
                        onClick={() => setInterviewType(type)}
                        style={{ 
                          fontSize: '13px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          cursor: 'pointer',
                          userSelect: 'none',
                          color: isSel ? '#1e293b' : '#64748b',
                          fontWeight: isSel ? '600' : '500'
                        }}
                      >
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          border: `2px solid ${isSel ? '#3b82f6' : '#cbd5e1'}`, 
                          background: '#fff', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          boxSizing: 'border-box'
                        }}>
                          {isSel && (
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              background: '#3b82f6' 
                            }} />
                          )}
                        </div>
                        {type}
                      </div>
                    );
                  })}
                </div>
              </div>

              {interviewType === 'Offline' ? (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Interview Place</label>
                  <textarea 
                    placeholder="e.g. Kantor Utama Lt. 3, Ruang Rapat Garuda" 
                    value={offlinePlace} 
                    onChange={e => setOfflinePlace(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', background: '#fff', color: '#1e293b', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Platform</label>
                    <select 
                      value={onlinePlatform} 
                      onChange={e => setOnlinePlatform(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Skype">Skype</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Meeting Link</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://meet.google.com/xyz-abc" 
                      value={onlineLink} 
                      onChange={e => setOnlineLink(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', color: '#1e293b', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={() => {
                  setAssignInterviewCandidate(null);
                  setInterviewDate('');
                  setInterviewTime('');
                  setOfflinePlace('');
                  setOnlineLink('');
                }} 
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!interviewDate || !interviewTime) {
                    alert('Mohon isi tanggal dan jam wawancara!');
                    return;
                  }
                  
                  const payload = {
                    interview_date: interviewDate,
                    interview_time: interviewTime,
                    media: interviewType === 'Offline' ? 'Offline' : onlinePlatform,
                    link: interviewType === 'Offline' ? null : onlineLink,
                    notes: interviewType === 'Offline' ? offlinePlace : null,
                  };

                  try {
                    await api(`/hr/candidates/${assignInterviewCandidate.id_submission}/interview`, {
                      method: 'PATCH',
                      data: payload
                    });

                    setCandidates(prev => prev.map(c => 
                      c.id_submission === assignInterviewCandidate.id_submission 
                        ? { ...c, interview: { ...payload, id_interview: c.interview?.id_interview || 'temp' } } 
                        : c
                    ));

                    setAssignInterviewCandidate(null);
                    setInterviewDate('');
                    setInterviewTime('');
                    setOfflinePlace('');
                    setOnlineLink('');
                  } catch (err) {
                    console.error("Assign interview error:", err);
                    alert("Gagal menjadwalkan interview: " + (err.message || err));
                  }
                }} 
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '360px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Confirm Action</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b' }}>
              {confirmAction.type === 'accept' ? `Accept ${confirmAction.candidate.name} as an intern?` :
               confirmAction.type === 'reject' ? `Reject ${confirmAction.candidate.name}? This cannot be undone.` :
               `Pass ${confirmAction.candidate.name} to the next stage?`}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmAction(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={executeAction} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CandidateRow — extracted so each row owns its docModal state ─────────────
function CandidateRow({ c, index, total, activeTab, activeSubStageIndex, selectionFlow, onPass, onReject, onViewDoc }) {
  const [docModal, setDocModal] = useState(false);
  const hasAnyDoc = c.has_cv || c.has_cover_letter || c.has_portfolio || c.has_institution_letter;

  return (
    <>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '16px 24px', alignItems: 'center',
        borderBottom: index < total - 1 ? '1px solid #f1f5f9' : 'none'
      }}>
        {/* Candidate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
            {(c.name || '?').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
          </div>
        </div>

        {/* University */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569', fontWeight: '500', textAlign: 'left', minWidth: 0 }}>
          <div style={{ flexShrink: 0, display: 'flex' }}><IC.MapPin /></div>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.university || '-'}</span>
        </div>

        {/* Documents — DocsIconBtn + DocListModal (same as CandidateHR) */}
        <div>
          <DocsIconBtn candidate={c} hasAny={hasAnyDoc} onOpen={() => setDocModal(true)} />
        </div>

        {/* Date */}
        <div style={{ fontSize: '12.5px', color: '#64748b', textAlign: 'left' }}>
          {c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '-'}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start' }}>
          {activeTab !== 'final' && (
            <>
              <ActionBtn label={activeSubStageIndex === selectionFlow.length - 1 ? "Accept" : "Pass Next"} variant="green" onClick={() => onPass(c)} />
              <ActionBtn label="Reject" variant="red" onClick={() => onReject(c)} />
            </>
          )}
          {activeTab === 'final' && c.status === 'accepted' && (
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>Accepted</span>
          )}
          {activeTab === 'final' && c.status === 'rejected' && (
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '20px' }}>Rejected</span>
          )}
        </div>
      </div>

      {/* DocListModal */}
      {docModal && (
        <DocListModal candidate={c} onClose={() => setDocModal(false)} onViewDoc={onViewDoc} />
      )}
    </>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 20px', border: 'none', borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
        background: 'transparent', color: active ? '#3b82f6' : '#64748b', fontSize: '13.5px', fontWeight: active ? '700' : '600',
        cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit'
      }}
    >
      {children}
    </button>
  );
}