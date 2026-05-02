import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// ─── Icons ───────────────────────────────────────────────────────────────────
const IC = {
  Search:        () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Eye:           () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit:          () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  FileText:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  MapPin:        () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  ChevronDown:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Users:         () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  User:          () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  MessageSquare: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  X:             () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ExternalLink:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Folder:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Cpu:           () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  BarChart:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Filter:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Zap:           () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Info:          () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Hash:          () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
};

// ─── Constants ────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
  stage_0:   { label: 'Stage 1',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  stage_1:   { label: 'Stage 2',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  stage_2:   { label: 'Stage 3',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  stage_3:   { label: 'Stage 4',   bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  screening: { label: 'Screening', bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' },
  test:      { label: 'Test',      bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  interview: { label: 'Interview', bg: '#fefce8', color: '#a16207', border: '#fde68a' },
  accepted:  { label: 'Accepted',  bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  rejected:  { label: 'Rejected',  bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

function getStatusCfg(status) {
  if (!status) return STATUS_CONFIG.pending;
  if (STATUS_CONFIG[status]) return STATUS_CONFIG[status];
  if (status.startsWith('stage_')) {
    const n = parseInt(status.split('_')[1], 10) + 1;
    return { label: `Stage ${n}`, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }
  return STATUS_CONFIG.pending;
}

const CLASSIFICATION_CONFIG = {
  strong:  { label: 'Strong',  bg: '#f0fdf4', color: '#15803d', border: '#86efac', dot: '#16a34a' },
  average: { label: 'Average', bg: '#fefce8', color: '#a16207', border: '#fde68a', dot: '#ca8a04' },
  weak:    { label: 'Weak',    bg: '#fff1f2', color: '#be123c', border: '#fecdd3', dot: '#dc2626' },
};

const DOC_TYPES = [
  { key: 'has_cv',                 label: 'CV',                  type: 'cv' },
  { key: 'has_cover_letter',       label: 'Cover Letter',        type: 'cover_letter' },
  { key: 'has_portfolio',          label: 'Portfolio',           type: 'portfolio' },
  { key: 'has_institution_letter', label: 'Institution Letter',  type: 'institution_letter' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending',   label: 'Pending' },
  { value: 'stage_0',   label: 'Stage 1' },
  { value: 'stage_1',   label: 'Stage 2' },
  { value: 'stage_2',   label: 'Stage 3' },
  { value: 'screening', label: 'Screening' },
  { value: 'test',      label: 'Test' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted',  label: 'Accepted' },
  { value: 'rejected',  label: 'Rejected' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = getStatusCfg(status);
  return (
    <span style={{
      fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

function ClassificationBadge({ classification }) {
  if (!classification) return null;
  const cfg = CLASSIFICATION_CONFIG[classification] || CLASSIFICATION_CONFIG.weak;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

/**
 * Relevance Score Bar — ditampilkan hanya saat IR search aktif (Materi 5 & 7)
 */
function RelevanceBar({ percent, rank, matchedTerms = [] }) {
  const color = percent >= 70 ? '#16a34a' : percent >= 40 ? '#ca8a04' : '#64748b';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color }}>
          {percent.toFixed(1)}%
        </span>
        {rank && (
          <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
            #{rank}
          </span>
        )}
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '2px', background: color,
          width: `${Math.min(100, percent)}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {matchedTerms.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
          {matchedTerms.slice(0, 3).map((t, i) => (
            <span key={i} style={{
              fontSize: '9.5px', padding: '1px 5px', borderRadius: '4px',
              background: '#eff6ff', color: '#3b82f6', fontWeight: '600',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Search Mode Toggle — mode pencarian kandidat yang mudah dipahami
 */
function SearchModeToggle({ mode, onChange }) {
  return (
    <div style={{
      display: 'flex', borderRadius: '8px', border: '1px solid #e2e8f0',
      overflow: 'hidden', background: '#f8fafc',
    }}>
      {[
        { value: 'tfidf',   label: 'Smart Search',  icon: <IC.Cpu />,    title: 'Authomatically find the best matches' },
        { value: 'boolean', label: 'Keyword Search',        icon: <IC.Filter />, title: 'Search candidates based on keywords you type' },
      ].map(({ value, label, icon, title }) => (
        <button
          key={value}
          title={title}
          onClick={() => onChange(value)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', border: 'none', cursor: 'pointer',
            fontSize: '11.5px', fontWeight: '700', fontFamily: 'inherit',
            background: mode === value ? '#1e293b' : 'transparent',
            color: mode === value ? '#fff' : '#64748b',
            transition: 'all 0.15s',
          }}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Ringkasan hasil pencarian kandidat
 */
function EvalMetricsPanel({ metrics, totalCorpus, totalResults, query }) {
  if (!metrics) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px', padding: '14px 18px', marginBottom: '16px',
      display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
        <IC.BarChart />
        <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Summary Search Results
        </span>
      </div>

      {[
        { label: 'Query', value: `"${query}"`, mono: true },
        { label: 'Corpus', value: `${totalCorpus} docs` },
        { label: 'Retrieved', value: `${totalResults} results` },
        { label: 'P@5', value: `${metrics.precision_at_5}%`, highlight: true },
        { label: 'P@10', value: `${metrics.precision_at_10}%`, highlight: true },
        { label: 'Relevant', value: `${metrics.total_relevant}` },
      ].map(({ label, value, mono, highlight }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </span>
          <span style={{
            fontSize: '13px', fontWeight: '700',
            color: highlight ? '#34d399' : '#e2e8f0',
            fontFamily: mono ? 'monospace' : 'inherit',
          }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Bantuan singkat untuk pencarian kata kunci
 */
function BooleanHelperTooltip({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200,
      background: '#1e293b', borderRadius: '10px', padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minWidth: '280px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
        How to Use Keyword Search
      </div>
      {[
        { example: 'python machine learning',     desc: 'matches candidates who have all these terms' },
        { example: 'NOT java',                    desc: 'excludes results containing this term' },
        { example: 'design portfolio',            desc: 'matches candidates with these keywords' },
      ].map(({ example, desc }) => (
        <div key={example} style={{ marginBottom: '6px' }}>
          <code style={{ fontSize: '11px', background: '#0f172a', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
            {example}
          </code>
          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>{desc}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Icon & Doc Helpers ───────────────────────────────────────────────────────

function IconBtn({ icon, title, onClick, color = '#475569', bgHov = '#f1f5f9' }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
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

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
        cursor: 'pointer', border: `1px solid ${active ? '#bfdbfe' : '#e2e8f0'}`,
        background: active ? '#eff6ff' : '#fff', color: active ? '#1d4ed8' : '#64748b',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

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
          ) : available.map((d) => (
            <DocItem key={d.type} label={d.label} onView={() => { onViewDoc(candidate, d.type); onClose(); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DocItem({ label, onView }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
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

function DocsIconBtn({ candidate, onOpen, hasAny }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={hasAny ? 'View documents' : 'No documents'}
      onClick={hasAny ? onOpen : undefined}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
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

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ candidate, onClose, onViewDoc }) {
  if (!candidate) return null;
  const isGroup = !!candidate.id_team;
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Candidate Detail</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{isGroup ? `Team: ${candidate.team_name}` : 'Individual Submission'}</p>
          </div>
          <IconBtn icon={<IC.X />} title="Close" onClick={onClose} />
        </div>
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 }}>
              {(candidate.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{candidate.name}</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>{candidate.email}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <StatusBadge status={candidate.status} />
              {candidate._classification && <ClassificationBadge classification={candidate._classification} />}
            </div>
          </div>

          {/* Relevance info jika dari IR search */}
          {candidate.relevance_percent !== undefined && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 16px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>IR Relevance Score</div>
              <RelevanceBar percent={candidate.relevance_percent} rank={candidate.rank} matchedTerms={candidate.matched_terms} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'University', value: candidate.university || '-' },
              { label: 'Position',   value: candidate.position || '-' },
              { label: 'Applied',    value: candidate.submitted_at ? new Date(candidate.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
              { label: 'Type',       value: isGroup ? 'Team' : 'Individual' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Documents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DOC_TYPES.filter(d => candidate[d.key]).map(d => (
                <DocItem key={d.type} label={d.label} onView={() => onViewDoc(candidate, d.type)} />
              ))}
              {!DOC_TYPES.some(d => candidate[d.key]) && (
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>No documents uploaded</span>
              )}
            </div>
          </div>

          {candidate.hr_notes && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>HR Notes</div>
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px', fontSize: '12.5px', color: '#713f12', lineHeight: '1.6' }}>
                {candidate.hr_notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotesModal({ candidate, onClose, onSave }) {
  const [note, setNote] = useState(candidate?.hr_notes || '');
  const [saving, setSaving] = useState(false);
  const handleSave = async () => { setSaving(true); await onSave(candidate.id_submission, note); setSaving(false); onClose(); };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>HR Notes</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{candidate?.name}</p>
          </div>
          <IconBtn icon={<IC.X />} title="Close" onClick={onClose} />
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal notes..." rows={5}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'inherit', color: '#1e293b', background: '#fff', resize: 'vertical', outline: 'none', lineHeight: '1.6', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#64748b', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row Components ───────────────────────────────────────────────────────────

/**
 * IR-enhanced Individual Row
 * Menampilkan kolom Relevance Score saat IR search aktif
 */
function IndividualRow({ candidate, onDetail, onNotes, onViewDoc, irActive }) {
  const [docModal, setDocModal] = useState(false);
  const hasAnyDoc = candidate.has_cv || candidate.has_cover_letter || candidate.has_portfolio || candidate.has_institution_letter;

  const gridCols = irActive
    ? '1.8fr 0.9fr 0.8fr 1.2fr 1fr 0.8fr 0.9fr'
    : '1.8fr 1fr 0.8fr 1.2fr 0.8fr 0.9fr';

  return (
    <>
      <div style={{
        display: 'grid', gridTemplateColumns: gridCols, gap: '12px',
        padding: '14px 24px', alignItems: 'center', borderBottom: '1px solid #f1f5f9',
        background: candidate.relevance_percent >= 70 ? 'rgba(16,185,129,0.02)' : 'transparent',
      }}>
        {/* Candidate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
            {(candidate.name || '?').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.name}</span>
              {candidate._classification && <ClassificationBadge classification={candidate._classification} />}
            </div>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.email}</div>
          </div>
        </div>

        {/* University */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}><IC.MapPin /></div>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.university || '-'}</span>
        </div>

        {/* Documents */}
        <div>
          <DocsIconBtn candidate={candidate} hasAny={hasAnyDoc} onOpen={() => setDocModal(true)} />
        </div>

        {/* Notes */}
        <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {candidate.hr_notes
            ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IC.MessageSquare /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.hr_notes}</span></span>
            : <span style={{ color: '#cbd5e1' }}>No notes</span>}
        </div>

        {/* ── Relevance Score (hanya saat IR aktif) ── */}
        {irActive && (
          <div>
            <RelevanceBar
              percent={candidate.relevance_percent ?? 0}
              rank={candidate.rank}
              matchedTerms={candidate.matched_terms ?? []}
            />
          </div>
        )}

        {/* Status */}
        <div><StatusBadge status={candidate.status} /></div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <IconBtn icon={<IC.Eye />} title="View Detail" onClick={() => onDetail(candidate)} />
          <IconBtn icon={<IC.Edit />} title="Edit Notes" onClick={() => onNotes(candidate)} bgHov="#fef9c3" />
        </div>
      </div>

      {docModal && (
        <DocListModal candidate={candidate} onClose={() => setDocModal(false)} onViewDoc={onViewDoc} />
      )}
    </>
  );
}

function GroupRow({ candidate, onDetail, onNotes, onViewDoc, irActive }) {
  const [expanded, setExpanded] = useState(false);
  const [docModal, setDocModal] = useState(false);
  const members = candidate.team_members || [];
  const hasAnyDoc = candidate.has_cv || candidate.has_cover_letter || candidate.has_portfolio || candidate.has_institution_letter;

  const gridCols = irActive
    ? '1.8fr 0.9fr 0.8fr 1.2fr 1fr 0.8fr 0.9fr'
    : '1.8fr 1fr 0.8fr 1.2fr 0.8fr 0.9fr';

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px', padding: '14px 24px', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: expanded ? '#fafbff' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setExpanded(v => !v)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
            {expanded ? <IC.ChevronDown /> : <IC.ChevronRight />}
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IC.Users /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.team_name || `Team ${candidate.id_team?.slice(0, 6)}`}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{members.length} members</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', minWidth: 0 }}><IC.MapPin /><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.university || '-'}</span></div>
        <div><DocsIconBtn candidate={candidate} hasAny={hasAnyDoc} onOpen={() => setDocModal(true)} /></div>
        <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {candidate.hr_notes ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IC.MessageSquare /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.hr_notes}</span></span> : <span style={{ color: '#cbd5e1' }}>No notes</span>}
        </div>
        {irActive && <div><RelevanceBar percent={candidate.relevance_percent ?? 0} rank={candidate.rank} matchedTerms={candidate.matched_terms ?? []} /></div>}
        <div><StatusBadge status={candidate.status} /></div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <IconBtn icon={<IC.Eye />} title="View Detail" onClick={() => onDetail(candidate)} />
          <IconBtn icon={<IC.Edit />} title="Edit Notes" onClick={() => onNotes(candidate)} bgHov="#fef9c3" />
        </div>
      </div>

      {expanded && members.map((m, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px', padding: '10px 24px 10px 72px', alignItems: 'center', borderBottom: '1px solid #f8fafc', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
              {(m.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {m.name}
                {m.is_leader && <span style={{ fontSize: '9.5px', fontWeight: '600', padding: '1px 6px', borderRadius: '20px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>Leader</span>}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}><IC.MapPin /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.university || '-'}</span></div>
          <div /><div />{irActive && <div />}<div /><div />
        </div>
      ))}

      {docModal && <DocListModal candidate={candidate} onClose={() => setDocModal(false)} onViewDoc={onViewDoc} />}
    </>
  );
}

// ─── Boolean Operator Toggle ──────────────────────────────────────────────────
function BoolOpToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>Operator:</span>
      {['AND', 'OR'].map(op => (
        <button key={op} onClick={() => onChange(op)}
          style={{
            padding: '3px 10px', borderRadius: '6px', border: `1px solid ${value === op ? '#3b82f6' : '#e2e8f0'}`,
            background: value === op ? '#eff6ff' : '#fff', color: value === op ? '#1d4ed8' : '#64748b',
            fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
          }}>
          {op}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CandidateHR() {
  const navigate  = useNavigate();
  const user      = useAuthStore((state) => state.user);
  const logout    = useAuthStore((state) => state.logout);

  const [loading,          setLoading]          = useState(true);
  const [candidates,       setCandidates]       = useState([]);
  const [tableLoading,     setTableLoading]     = useState(false);
  const [irLoading,        setIrLoading]        = useState(false);

  // Search state
  const [search,           setSearch]           = useState('');
  const [searchMode,       setSearchMode]       = useState('tfidf');   // 'tfidf' | 'boolean'
  const [boolOp,           setBoolOp]           = useState('AND');
  const [showBoolHelper,   setShowBoolHelper]   = useState(false);
  const boolHelperRef = useRef(null);

  // Filter state
  const [typeFilter,       setTypeFilter]       = useState('all');
  const [statusFilter,     setStatusFilter]     = useState('');

  // IR result state
  const [irResults,        setIrResults]        = useState(null);   // null = not searching
  const [irMetrics,        setIrMetrics]        = useState(null);
  const [irMeta,           setIrMeta]           = useState(null);

  // Classification cache [id_submission → classificationObj]
  const [classifyCache,    setClassifyCache]    = useState({});
  const [classifyLoading,  setClassifyLoading]  = useState(false);

  // Modal state
  const [detailCandidate,  setDetailCandidate]  = useState(null);
  const [notesCandidate,   setNotesCandidate]   = useState(null);
  const [showLogoutModal,  setShowLogoutModal]  = useState(false);

  // ── Close bool helper on outside click ────────────────────────────────────
  useEffect(() => {
    const fn = (e) => { if (boolHelperRef.current && !boolHelperRef.current.contains(e.target)) setShowBoolHelper(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // ── Fetch regular candidates ───────────────────────────────────────────────
  const fetchCandidates = (isSearch = false) => {
    if (isSearch) setTableLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter !== 'all') params.set('type', typeFilter);

    api(`/hr/candidates/all?${params}`)
      .then(res => setCandidates(res.candidates || res.data?.candidates || []))
      .catch(err => console.error(err))
      .finally(() => { setLoading(false); setTableLoading(false); });
  };

  useEffect(() => { fetchCandidates(); }, [statusFilter, typeFilter]);

  // ── IR Search (debounced) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!search || search.length < 2) {
      setIrResults(null);
      setIrMetrics(null);
      setIrMeta(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIrLoading(true);
      try {
        const params = new URLSearchParams({
          q:        search,
          mode:     searchMode,
          bool_op:  boolOp,
          top_k:    '50',
        });
        const res = await api(`/hr/candidates/tfidf-search?${params}`);
        if (res.success) {
          setIrResults(res.results || []);
          setIrMetrics(res.evaluation);
          setIrMeta({ totalCorpus: res.total_corpus, totalResults: res.total_results });
        }
      } catch (err) {
        console.error('IR search error:', err);
      } finally {
        setIrLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, searchMode, boolOp]);

  // ── Batch Classify ────────────────────────────────────────────────────────
  const runBatchClassify = async () => {
    setClassifyLoading(true);
    try {
      const res = await api('/hr/candidates/classify-batch', { method: 'POST', data: {} });
      if (res.success) {
        const cache = {};
        (res.data || []).forEach(r => { cache[r.id_submission] = r; });
        setClassifyCache(cache);
      }
    } catch (err) {
      console.error('Classify error:', err);
    } finally {
      setClassifyLoading(false);
    }
  };

  // ── Merge IR results with classification cache ─────────────────────────────
  const enrichedIrResults = useMemo(() => {
    if (!irResults) return null;
    return irResults.map(r => ({
      ...r,
      _classification: classifyCache[r.id_submission]?.classification ?? null,
    }));
  }, [irResults, classifyCache]);

  const enrichedCandidates = useMemo(() => {
    return candidates.map(c => ({
      ...c,
      _classification: classifyCache[c.id_submission]?.classification ?? null,
    }));
  }, [candidates, classifyCache]);

  // ── Deduplication ─────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const source = (irResults !== null ? enrichedIrResults : enrichedCandidates) ?? [];
    const seen = new Set();
    const out = [];
    for (const c of source) {
      if (c.id_team) {
        if (!seen.has(c.id_team)) { seen.add(c.id_team); out.push(c); }
      } else {
        out.push(c);
      }
    }
    return out;
  }, [irResults, enrichedIrResults, enrichedCandidates]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const viewDoc = async (c, type) => {
    try {
      const directUrlMap = { cv: c.cv_url, cover_letter: c.cover_letter_url, portfolio: c.portfolio_url, institution_letter: c.institution_letter_url };
      if (directUrlMap[type]) { window.open(directUrlMap[type], '_blank'); return; }
      const res = await api(`/hr/candidates/${c.id_submission}/documents/${type}`);
      const url = res.url || res.data?.url;
      if (url) window.open(url, '_blank');
    } catch { alert('Document not found'); }
  };

  const saveNotes = async (id, note) => {
    try {
      await api(`/hr/candidates/${id}/notes`, { method: 'PATCH', data: { hr_notes: note } });
      setCandidates(prev => prev.map(c => c.id_submission === id ? { ...c, hr_notes: note } : c));
    } catch { alert('Failed to save notes'); }
  };

  const handleLogout = async () => { await logout(); navigate('/', { replace: true }); };

  if (loading) return <LoadingSpinner message="Loading candidates..." />;

  const irActive = irResults !== null;

  // Table header columns — tambah kolom "Relevance" saat IR aktif
  const headerCols  = irActive
    ? ['CANDIDATE', 'UNIVERSITY', 'DOCUMENTS', 'NOTES', 'RELEVANCE', 'STATUS', 'ACTION']
    : ['CANDIDATE', 'UNIVERSITY', 'DOCUMENTS', 'NOTES', 'STATUS', 'ACTION'];
  const gridCols = irActive
    ? '1.8fr 0.9fr 0.8fr 1.2fr 1fr 0.8fr 0.9fr'
    : '1.8fr 1fr 0.8fr 1.2fr 0.8fr 0.9fr';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif" }}>
      <SidebarHR user={user} onLogout={() => setShowLogoutModal(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ height: '56px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Dashboard</span>
            <span style={{ fontSize: '13px', color: '#94a3b8', margin: '0 6px' }}>/</span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Candidates</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{todayStr()}</span>
        </header>

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

          {/* Page Title + Classify Batch */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Candidate Management</h1>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                View and manage all applicants. Cari kandidat terbaik atau cari berdasarkan kata kunci.
              </p>
            </div>

            {/* Batch Classify Button */}
            <button
              onClick={runBatchClassify}
              disabled={classifyLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: Object.keys(classifyCache).length > 0 ? '#f0fdf4' : '#fff',
                color: Object.keys(classifyCache).length > 0 ? '#15803d' : '#475569',
                fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s', opacity: classifyLoading ? 0.7 : 1,
              }}
              title="Mengelompokkan kandidat secara otomatis berdasarkan kelengkapan data dan kecocokan profil"
            >
              <IC.Cpu />
              {classifyLoading
                ? 'Mengelompokkan...'
                : Object.keys(classifyCache).length > 0
                  ? `Sudah dikelompokkan (${Object.keys(classifyCache).length})`
                  : 'Kelompokkan Kandidat'}
            </button>
          </div>

          {/* IR Evaluation Metrics — Materi 7 */}
          {irActive && irMetrics && irMeta && (
            <EvalMetricsPanel
              metrics={irMetrics}
              totalCorpus={irMeta.totalCorpus}
              totalResults={irMeta.totalResults}
              query={search}
            />
          )}

          {/* Main Card */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>

            {/* Filters Bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

              {/* Type Filter */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'individual', label: 'Individual', icon: <IC.User /> },
                  { value: 'group', label: 'Team', icon: <IC.Users /> },
                ].map(({ value, label, icon }) => (
                  <FilterChip key={value} label={<span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{icon}{label}</span>} active={typeFilter === value} onClick={() => setTypeFilter(value)} />
                ))}
              </div>

              <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

              {/* Status Filter — disable saat IR aktif */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                disabled={irActive}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: irActive ? '#f8fafc' : '#fff', fontSize: '12.5px', fontWeight: '600', color: irActive ? '#94a3b8' : '#475569', outline: 'none', cursor: irActive ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* IR Search section */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

                {/* Search Mode Toggle */}
                <SearchModeToggle mode={searchMode} onChange={(m) => { setSearchMode(m); setSearch(''); setIrResults(null); }} />

                {/* Boolean Operator + Helper */}
                {searchMode === 'boolean' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BoolOpToggle value={boolOp} onChange={setBoolOp} />
                    <div ref={boolHelperRef} style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowBoolHelper(v => !v)}
                        style={{ display: 'flex', alignItems: 'center', padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        title="Query syntax help"
                      >
                        <IC.Info />
                      </button>
                      <BooleanHelperTooltip visible={showBoolHelper} />
                    </div>
                  </div>
                )}

                {/* Search Input */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', background: irActive ? '#f0fdf4' : '#f8fafc', border: `1px solid ${irActive ? '#86efac' : '#e2e8f0'}`, borderRadius: '8px', padding: '6px 12px', minWidth: '240px', transition: 'all 0.2s' }}>
                  {irLoading
                    ? <div style={{ width: '15px', height: '15px', border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
                    : <IC.Search />
                  }
                  <input
                    placeholder={searchMode === 'tfidf' ? 'Cari kandidat terbaik...' : 'Cari dengan kata kunci, mis. python NOT java...'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', background: 'transparent', color: '#1e293b', fontFamily: 'inherit' }}
                  />
                  {search && (
                    <button onClick={() => { setSearch(''); setIrResults(null); setIrMetrics(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                      <IC.X />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* IR Mode Banner */}
            {irActive && (
              <div style={{ padding: '10px 20px', background: 'linear-gradient(90deg, #eff6ff, #f0fdf4)', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IC.Zap />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                  {searchMode === 'tfidf' ? 'Pencarian Pintar' : 'Pencarian Kata Kunci'} aktif
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  — {rows.length} kandidat ditemukan dari {irMeta?.totalCorpus ?? 0} data
                  {searchMode === 'boolean' && ` (operator: ${boolOp})`}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IC.Hash /> Diurutkan berdasarkan kecocokan
                </span>
              </div>
            )}

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px', padding: '10px 24px', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9' }}>
              {headerCols.map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: h === 'RELEVANCE' ? '#3b82f6' : '#94a3b8', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {h === 'RELEVANCE' && <IC.BarChart />}
                  {h}
                </div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ minHeight: '300px' }}>
              {(tableLoading || irLoading) ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  {irLoading ? 'Calculating Smart Search similarity...' : 'Loading...'}
                </div>
              ) : rows.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13.5px', color: '#94a3b8' }}>
                    {irActive ? `No candidates found matching the keywords "${search}"` : 'No candidates found.'}
                  </div>
                  {irActive && (
                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>
                      Try changing the keywords or switch the search method to "Smart Search" for better results.
                    </div>
                  )}
                </div>
              ) : (
                rows.map((c) =>
                  c.id_team ? (
                    <GroupRow key={c.id_team} candidate={c} onDetail={setDetailCandidate} onNotes={setNotesCandidate} onViewDoc={viewDoc} irActive={irActive} />
                  ) : (
                    <IndividualRow key={c.id_submission} candidate={c} onDetail={setDetailCandidate} onNotes={setNotesCandidate} onViewDoc={viewDoc} irActive={irActive} />
                  )
                )
              )}
            </div>
          </div>

          {/* Legend */}
          {Object.keys(classifyCache).length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Classification:</span>
              {Object.entries(CLASSIFICATION_CONFIG).map(([key, cfg]) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: cfg.color, fontWeight: '600' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.dot }} />
                  {cfg.label}
                </span>
              ))}
              <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '4px' }}>(Text Classification — Materi 8 TKI)</span>
            </div>
          )}

        </main>
      </div>

      {/* ── Modals ── */}
      {detailCandidate && <DetailModal candidate={detailCandidate} onClose={() => setDetailCandidate(null)} onViewDoc={viewDoc} />}
      {notesCandidate && <NotesModal candidate={notesCandidate} onClose={() => setNotesCandidate(null)} onSave={saveNotes} />}

      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: "'Poppins','Segoe UI',sans-serif" }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>Sign Out?</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>Are you sure you want to sign out from your HR account?</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ padding: '9px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleLogout} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: '#ef4444', fontSize: '13px', fontWeight: '700', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}