import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { LoadingSpinner } from '../../components/LoadingSpinner';

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
      background: '#fff', borderRadius: '16px', padding: '22px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: iconBg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: iconColor,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', letterSpacing: '-1px', marginTop: '10px', textAlign: 'left' }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', textAlign: 'left' }}>{title}</div>
      {barColors && (
        <div style={{ display: 'flex', gap: '3px', marginTop: '10px', alignItems: 'flex-end', height: '26px' }}>
          {barColors.map((c, i) => (
            <div key={i} style={{
              flex: 1, background: c, borderRadius: '3px 3px 0 0',
              height: `${28 + Math.sin(i * 1.4) * 18}%`, opacity: 0.45, minHeight: '4px',
            }} />
          ))}
        </div>
      )}
      {sub && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', textAlign: 'left' }}>{sub}</div>}
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
      display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.1fr 1fr 0.8fr 0.7fr', gap: '12px',
      padding: '14px 24px', alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
    }}>
      {/* Intern */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700',
        }}>
          {(intern.name || '?').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.name}</div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.email}</div>
        </div>
      </div>

      {/* University */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}><IC.MapPin /></div>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.university || '-'}</span>
      </div>

      {/* Mentor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        {intern.mentor_name ? (
          <>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
              background: '#fef9c3', color: '#854d0e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700',
            }}>
              {(intern.mentor_name || '?').slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.mentor_name}</span>
          </>
        ) : (
          <span style={{ fontSize: '11.5px', color: '#fbbf24', fontWeight: '600' }}>Unassigned</span>
        )}
      </div>

      {/* Start Date + Days */}
      <div>
        <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>{fmtDate(intern.start_date)}</div>
        {days !== null && (
          <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '1px' }}>{days}d active</div>
        )}
      </div>

      {/* Position */}
      <div style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IC.Briefcase />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.position || '-'}</span>
        </div>
      </div>

      {/* Status + Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

  const [loading, setLoading]           = useState(true);
  const [interns, setInterns]           = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [detailIntern, setDetailIntern] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchInterns = (isSearch = false) => {
    if (isSearch) setTableLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    api(`/hr/apprentices?${params}`)
      .then(res => setInterns(res.apprentices || res.data?.apprentices || []))
      .catch(err => console.error(err))
      .finally(() => { setLoading(false); setTableLoading(false); });
  };

  useEffect(() => { fetchInterns(); }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchInterns(true), 500);
    return () => clearTimeout(t);
  }, [search]);

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

  if (loading) return <LoadingSpinner message="Loading interns..." />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: '56px', background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Dashboard</span>
            <span style={{ fontSize: '13px', color: '#94a3b8', margin: '0 6px' }}>/</span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Active Intern</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{todayStr()}</span>
        </header>

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Interns</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Candidates who have been accepted and assigned a mentor.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
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
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Status tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {STATUS_OPTIONS.map(o => {
                  const active = statusFilter === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => setStatusFilter(o.value)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
                        cursor: 'pointer', border: `1px solid ${active ? '#86efac' : '#e2e8f0'}`,
                        background: active ? '#f0fdf4' : '#fff', color: active ? '#15803d' : '#64748b',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                      }}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', minWidth: '220px' }}>
                <IC.Search />
                <input
                  placeholder="Search intern or mentor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', background: 'transparent', color: '#1e293b', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.1fr 1fr 0.8fr 0.7fr', gap: '12px', padding: '10px 24px', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9' }}>
              {['INTERN', 'UNIVERSITY', 'MENTOR', 'START DATE', 'POSITION', 'STATUS'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ minHeight: '300px' }}>
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
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {detailIntern && (
        <DetailModal intern={detailIntern} onClose={() => setDetailIntern(null)} />
      )}

      {/* Logout Modal */}
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
              }}>
                Cancel
              </button>
              <button onClick={handleLogout} style={{
                padding: "9px 18px", borderRadius: "10px", border: "none",
                background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "inherit",
              }}>
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}