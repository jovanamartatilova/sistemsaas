import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { HRToastStack, useHRToast } from '../../components/HRToast';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IC = {
  Search:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Eye:         () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  MapPin:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Briefcase:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Calendar:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  User:        () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Users:       () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Award:       () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Clock:       () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ChevronDown: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  X:           () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysActive(startDate) {
  if (!startDate) return null;
  const diff = Date.now() - new Date(startDate).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

const STATUS_CFG = {
  active:    { label: 'Active',    bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  completed: { label: 'Completed', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  inactive:  { label: 'Inactive',  bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.inactive;
  return (
    <span style={{
      fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, title, value, sub, barColors }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '16px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: iconBg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: iconColor,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px', marginTop: '8px', textAlign: 'left' }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', textAlign: 'left' }}>{title}</div>
      {barColors && (
        <div style={{ display: 'flex', gap: '3px', marginTop: '8px', alignItems: 'flex-end', height: '22px' }}>
          {barColors.map((c, i) => (
            <div key={i} style={{
              flex: 1, background: c, borderRadius: '3px 3px 0 0',
              height: `${28 + Math.sin(i * 1.4) * 18}%`, opacity: 0.45, minHeight: '4px',
            }} />
          ))}
        </div>
      )}
      {sub && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', textAlign: 'left' }}>{sub}</div>}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ intern, onClose }) {
  if (!intern) return null;
  const days = daysActive(intern.start_date);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Intern Detail</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Active Internship Record</p>
          </div>
          <IconBtn icon={<IC.X />} title="Close" onClick={onClose} />
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '800',
            }}>
              {(intern.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{intern.name}</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>{intern.email}</div>
              {intern.phone && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{intern.phone}</div>}
            </div>
            <StatusBadge status={intern.status} />
          </div>

          {/* Days active banner */}
          {days !== null && intern.status === 'active' && (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '10px',
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <IC.Clock />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1d4ed8' }}>
                {days} day{days !== 1 ? 's' : ''} active
              </span>
              <span style={{ fontSize: '12px', color: '#3b82f6', marginLeft: 'auto' }}>
                Since {fmtDate(intern.start_date)}
              </span>
            </div>
          )}

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'University',      value: intern.university || '-' },
              { label: 'Position',        value: intern.position || '-' },
              { label: 'Program',         value: intern.program || '-' },
              { label: 'Type',            value: intern.type || '-' },
              { label: 'Start Date',      value: fmtDate(intern.start_date) },
              { label: 'End Date',        value: fmtDate(intern.end_date) },
              { label: 'Apprentice ID',   value: intern.id_apprentice || '-' },
              { label: 'Submission Type', value: intern.id_team ? 'Team' : 'Individual' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Mentor */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Assigned Mentor</div>
            {intern.mentor_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #fef9c3, #fde68a)', color: '#854d0e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800',
                }}>
                  {(intern.mentor_name || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{intern.mentor_name}</div>
                  {intern.mentor_email && <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{intern.mentor_email}</div>}
                </div>
              </div>
            ) : (
              <div style={{ padding: '12px 14px', background: '#fff7ed', borderRadius: '10px', border: '1px solid #fed7aa', fontSize: '12.5px', color: '#c2410c' }}>
                No mentor assigned yet
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function InternRow({ intern, onDetail, isLast }) {
  const days = daysActive(intern.start_date);

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.1fr 1fr 0.8fr 0.7fr', gap: '8px',
      padding: '10px 16px', alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
    }}>
      {/* Intern — no avatar bubble */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.name}</div>
        <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.email}</div>
      </div>

      {/* University */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#475569', minWidth: 0, justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0 }}><IC.MapPin /></div>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{intern.university || '-'}</span>
      </div>

      {/* Mentor — no avatar bubble */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, justifyContent: 'center', overflow: 'hidden' }}>
        {intern.mentor_name ? (
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{intern.mentor_name}</span>
        ) : (
          <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '600' }}>Unassigned</span>
        )}
      </div>

      {/* Start Date + Days */}
      <div style={{ textAlign: 'center', minWidth: 0 }}>
        <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: '600' }}>{fmtDate(intern.start_date)}</div>
        {days !== null && (
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{days}d active</div>
        )}
      </div>

      {/* Position */}
      <div style={{ fontSize: '11.5px', color: '#475569', overflow: 'hidden', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden' }}>
          <IC.Briefcase />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intern.position || '-'}</span>
        </div>
      </div>

      {/* Status + Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', minWidth: 0 }}>
        <StatusBadge status={intern.status} />
        <IconBtn icon={<IC.Eye />} title="View Detail" onClick={() => onDetail(intern)} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '',          label: 'All Status' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'inactive',  label: 'Inactive' },
];

export default function ActiveInternHR() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { toasts, pushToast, removeToast } = useHRToast();

  const [loading, setLoading]           = useState(true);
  const [interns, setInterns]           = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [detailIntern, setDetailIntern] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [positionFilter, setPositionFilter] = useState('');
  const [positions, setPositions]           = useState([]);

  // ── Fetch Positions ────────────────────────────────────────────────────────
  useEffect(() => {
    api('/positions/catalog')
      .then(res => {
        const dataArr = Array.isArray(res) ? res : (res.data || []);
        setPositions(dataArr);
      })
      .catch(err => console.error('Failed to fetch positions:', err));
  }, []);

  // ── Fetch Interns ─────────────────────────────────────────────────────────────
useEffect(() => {
  setTableLoading(true);
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (statusFilter) params.set('status', statusFilter);
  if (positionFilter) params.set('id_position', positionFilter);

  const t = setTimeout(() => {
    api(`/hr/apprentices?${params}`)
      .then(res => setInterns(res.apprentices || res.data?.apprentices || []))
      .catch(err => {
        console.error(err);
        pushToast(err?.message || 'Failed to load active interns', 'error');
      })
      .finally(() => { setLoading(false); setTableLoading(false); });
  }, search ? 500 : 0);

  return () => clearTimeout(t);
}, [search, statusFilter, positionFilter]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     interns.length,
    active:    interns.filter(i => i.status === 'active').length,
    completed: interns.filter(i => i.status === 'completed').length,
    noMentor:  interns.filter(i => !i.mentor_name).length,
  }), [interns]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LoadingSpinner fullScreen={false} message="Loading interns.." />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Fullscreen proportionality ── */
        .ai-main-wrap { min-width: 0; }
        .ai-main { padding: clamp(16px, 3vw, 32px); }
        .ai-topbar { padding: 0 clamp(16px, 3vw, 28px); }

        /* ── Stat grid ── */
        .ai-stat-grid { grid-template-columns: repeat(4, 1fr); gap: clamp(12px, 2vw, 20px); }
        @media (max-width: 1024px) { .ai-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px)  { .ai-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
        @media (max-width: 400px)  { .ai-stat-grid { grid-template-columns: 1fr !important; } }

        /* ── Table scroll ── */
        .ai-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .ai-table-inner  { min-width: 580px; }

        /* ── Filter bar ── */
        .ai-filter-bar { flex-wrap: wrap; }
        .ai-search-box { min-width: 160px; }

        /* ── Mobile topbar ── */
        @media (max-width: 768px) {
          .ai-main-wrap  { padding-top: 56px !important; }
          .ai-topbar     { padding: 0 12px !important; }
          .ai-topbar-date { display: none !important; }
          .ai-main       { padding: 14px 10px 28px !important; }
          .ai-filter-bar { gap: 8px !important; }
          .ai-search-box { margin-left: 0 !important; width: 100% !important; }

          /* Detail modal full-width on mobile */
          .ai-modal-box  { max-width: 100% !important; margin: 0 !important; border-radius: 16px 16px 0 0 !important; }
          .ai-modal-wrap { align-items: flex-end !important; padding: 0 !important; }
        }
      `}</style>

      <div className="ai-main-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header className="ai-topbar" style={{
          height: '56px', background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'clamp(13px, 1.5vw, 15px)', fontWeight: '700', color: '#1e293b' }}>Dashboard</span>
            <span style={{ fontSize: '13px', color: '#94a3b8', margin: '0 6px' }}>/</span>
            <span style={{ fontSize: 'clamp(12px, 1.3vw, 13px)', color: '#94a3b8' }}>Active Intern</span>
          </div>
          <span className="ai-topbar-date" style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{todayStr()}</span>
        </header>

        <main className="ai-main" style={{ flex: 1, overflowY: 'auto' }}>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Interns</h1>
            <p style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', color: '#64748b', marginTop: '4px' }}>Candidates who have been accepted and assigned a mentor.</p>
          </div>

          {/* Stats */}
          <div className="ai-stat-grid" style={{ display: 'grid', marginBottom: '20px' }}>
            <StatCard
              icon={<IC.Users />} iconBg="#eff6ff" iconColor="#3b82f6"
              title="Total Interns" value={stats.total}
              sub="All registered interns"
              barColors={['#3b82f6','#60a5fa','#93c5fd','#3b82f6','#60a5fa','#93c5fd','#3b82f6']}
            />
            <StatCard
              icon={<IC.Award />} iconBg="#f0fdf4" iconColor="#16a34a"
              title="Active" value={stats.active}
              sub="Currently interning"
              barColors={['#4ade80','#86efac','#4ade80','#86efac','#4ade80','#bbf7d0','#4ade80']}
            />
            <StatCard
              icon={<IC.Clock />} iconBg="#eff6ff" iconColor="#1d4ed8"
              title="Completed" value={stats.completed}
              sub="Internship finished"
              barColors={['#60a5fa','#93c5fd','#60a5fa','#93c5fd','#60a5fa','#bfdbfe','#60a5fa']}
            />
            <StatCard
              icon={<IC.User />}
              iconBg={stats.noMentor > 0 ? '#fff7ed' : '#f8fafc'}
              iconColor={stats.noMentor > 0 ? '#c2410c' : '#64748b'}
              title="No Mentor Yet" value={stats.noMentor}
              sub="Needs assignment"
              barColors={stats.noMentor > 0
                ? ['#fb923c','#fdba74','#fb923c','#fdba74','#fb923c','#fed7aa','#fb923c']
                : ['#cbd5e1','#e2e8f0','#cbd5e1','#e2e8f0','#cbd5e1','#f1f5f9','#cbd5e1']}
            />
          </div>

          {/* Main Card */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>

            {/* Filter Bar */}
            <div className="ai-filter-bar" style={{ padding: 'clamp(10px,1.5vw,14px) clamp(12px,2vw,20px)', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Status tabs */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(o => {
                  const active = statusFilter === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => setStatusFilter(o.value)}
                      style={{
                        padding: 'clamp(4px,0.6vw,6px) clamp(10px,1.2vw,14px)',
                        borderRadius: '8px',
                        fontSize: 'clamp(11px, 1.1vw, 12.5px)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: `1px solid ${active ? '#86efac' : '#e2e8f0'}`,
                        background: active ? '#f0fdf4' : '#fff',
                        color: active ? '#15803d' : '#64748b',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>

              {/* Position Filter */}
              <select
                value={positionFilter}
                onChange={e => setPositionFilter(e.target.value)}
                style={{ padding: 'clamp(4px,0.6vw,6px) clamp(8px,1vw,12px)', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: 'clamp(11px, 1.1vw, 12.5px)', color: '#475569', outline: 'none', cursor: 'pointer', maxWidth: '160px' }}
              >
                <option value="">All Positions</option>
                {positions.map(pos => (
                  <option key={pos.id_position} value={pos.id_position}>{pos.name}</option>
                ))}
              </select>

              {/* Search */}
              <div className="ai-search-box" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: 'clamp(4px,0.6vw,6px) clamp(8px,1vw,12px)' }}>
                <IC.Search />
                <input
                  placeholder="Search intern or mentor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: 'clamp(11px, 1.1vw, 12.5px)', width: '100%', minWidth: '120px', background: 'transparent', color: '#1e293b', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="ai-table-scroll">
            <div className="ai-table-inner">

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.1fr 1fr 0.8fr 0.7fr', gap: '8px', padding: 'clamp(8px,1vw,10px) clamp(12px,2vw,24px)', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9' }}>
              {['INTERN', 'UNIVERSITY', 'MENTOR', 'START DATE', 'POSITION', 'STATUS'].map(h => (
                <div key={h} style={{
                  fontSize: 'clamp(9px, 0.8vw, 10px)', fontWeight: '700', color: '#94a3b8',
                  letterSpacing: '0.05em',
                  textAlign: h === 'INTERN' ? 'left' : 'center',
                  display: 'flex',
                  justifyContent: h === 'INTERN' ? 'flex-start' : 'center',
                }}>{h}</div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ minHeight: '200px' }}>
              {tableLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading...</div>
              ) : interns.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>
                  No interns found{statusFilter ? ` with status "${statusFilter}"` : ''}.
                </div>
              ) : (
                interns.map((intern, i) => (
                  <InternRow
                    key={intern.id_apprentice}
                    intern={intern}
                    onDetail={setDetailIntern}
                    isLast={i === interns.length - 1}
                  />
                ))
              )}
            </div>

            </div>{/* end ai-table-inner */}
            </div>{/* end ai-table-scroll */}

          </div>{/* end Main Card */}
        </main>
      </div>

      {/* Detail Modal */}
      {detailIntern && (
        <DetailModal intern={detailIntern} onClose={() => setDetailIntern(null)} />
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: '16px' }}>
          <div style={{
            background: "#fff", borderRadius: "16px", padding: "clamp(20px,3vw,28px)",
            width: "100%", maxWidth: "360px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins','Segoe UI',sans-serif",
          }}>
            <div style={{ fontSize: "clamp(14px,1.5vw,16px)", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "clamp(12px,1.2vw,13px)", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>
              Are you sure you want to sign out from your HR account?
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowLogoutModal(false)} style={{
                padding: "8px 16px", borderRadius: "10px", border: "1px solid #e2e8f0",
                background: "#fff", fontSize: "clamp(11px,1.1vw,13px)", fontWeight: "600", color: "#64748b", cursor: "pointer", fontFamily: "inherit",
              }}>
                Cancel
              </button>
              <button onClick={handleLogout} style={{
                padding: "8px 16px", borderRadius: "10px", border: "none",
                background: "#ef4444", fontSize: "clamp(11px,1.1vw,13px)", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit",
              }}>
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <HRToastStack toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
