import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// ─── Icons ──────────────────────────────────────────────────────────────────
const IC = {
  Search:       () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Eye:          () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit:         () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  FileText:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  MapPin:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  ChevronDown:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Users:        () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  User:         () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  MessageSquare:() => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  X:            () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ExternalLink: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
  // handle dynamic stage_X
  if (status.startsWith('stage_')) {
    const n = parseInt(status.split('_')[1], 10) + 1;
    return { label: `Stage ${n}`, bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }
  return STATUS_CONFIG.pending;
}

function StatusBadge({ status }) {
  const cfg = getStatusCfg(status);
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

function DocBtn({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px',
        fontSize: '10.5px', fontWeight: '600', cursor: 'pointer', border: '1px solid #e2e8f0',
        background: hov ? '#f1f5f9' : '#fff', color: '#475569', fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      <IC.FileText />
      {label}
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
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Candidate Detail</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              {isGroup ? `Team: ${candidate.team_name}` : 'Individual Submission'}
            </p>
          </div>
          <IconBtn icon={<IC.X />} title="Close" onClick={onClose} />
        </div>

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 }}>
              {(candidate.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{candidate.name}</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>{candidate.email}</div>
              {candidate.phone && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{candidate.phone}</div>}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <StatusBadge status={candidate.status} />
            </div>
          </div>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'University', value: candidate.university || '-' },
              { label: 'Position', value: candidate.position || '-' },
              { label: 'Program', value: candidate.program || '-' },
              { label: 'Type', value: candidate.type || '-' },
              { label: 'Applied Date', value: candidate.submitted_at ? new Date(candidate.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
              { label: 'Submission Type', value: isGroup ? 'Group' : 'Individual' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Team Members (if group) */}
          {isGroup && candidate.team_members && candidate.team_members.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Team Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {candidate.team_members.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#dbeafe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0 }}>
                      {(m.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e293b' }}>{m.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.email}</div>
                    </div>
                    {m.is_leader && (
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>Leader</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Documents</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {candidate.has_cv && <DocBtn label="CV" onClick={() => onViewDoc(candidate, 'cv')} />}
              {candidate.has_cover_letter && <DocBtn label="Cover Letter" onClick={() => onViewDoc(candidate, 'cover_letter')} />}
              {candidate.has_portfolio && <DocBtn label="Portfolio" onClick={() => onViewDoc(candidate, 'portfolio')} />}
              {candidate.has_institution_letter && <DocBtn label="Institution Letter" onClick={() => onViewDoc(candidate, 'institution_letter')} />}
              {!candidate.has_cv && !candidate.has_cover_letter && !candidate.has_portfolio && !candidate.has_institution_letter && (
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>No documents uploaded</span>
              )}
            </div>
          </div>

          {/* Notes */}
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

// ─── Notes Modal ──────────────────────────────────────────────────────────────
function NotesModal({ candidate, onClose, onSave }) {
  const [note, setNote] = useState(candidate?.hr_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(candidate.id_submission, note);
    setSaving(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>HR Notes</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{candidate?.name}</p>
          </div>
          <IconBtn icon={<IC.X />} title="Close" onClick={onClose} />
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add internal notes about this candidate..."
            rows={5}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
              fontSize: '13px', fontFamily: 'inherit', color: '#1e293b', resize: 'vertical',
              outline: 'none', lineHeight: '1.6', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row Components ───────────────────────────────────────────────────────────
function GroupRow({ candidate, onDetail, onNotes, onViewDoc }) {
  const [expanded, setExpanded] = useState(false);
  const members = candidate.team_members || [];

  return (
    <>
      {/* Group Header Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.2fr 0.8fr 0.9fr', gap: '12px',
        padding: '14px 24px', alignItems: 'center', borderBottom: '1px solid #f1f5f9',
        background: expanded ? '#fafbff' : 'transparent',
      }}>
        {/* Candidate / Team Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              width: '28px', height: '28px', borderRadius: '7px', border: '1px solid #dbeafe',
              background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
            }}
          >
            {expanded ? <IC.ChevronDown /> : <IC.ChevronRight />}
          </button>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IC.Users />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {candidate.team_name || `Team ${candidate.id_team?.slice(0, 6)}`}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{members.length} members</div>
          </div>
        </div>

        {/* University (leader's) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', minWidth: 0 }}>
          <IC.MapPin />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.university || '-'}</span>
        </div>

        {/* Documents */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {candidate.has_cv && <DocBtn label="CV" onClick={() => onViewDoc(candidate, 'cv')} />}
          {candidate.has_portfolio && <DocBtn label="Porto" onClick={() => onViewDoc(candidate, 'portfolio')} />}
          {candidate.has_institution_letter && <DocBtn label="Recom" onClick={() => onViewDoc(candidate, 'institution_letter')} />}
          {!candidate.has_cv && !candidate.has_portfolio && !candidate.has_institution_letter && (
            <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>—</span>
          )}
        </div>

        {/* Notes Preview */}
        <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
          {candidate.hr_notes
            ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IC.MessageSquare /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.hr_notes}</span></span>
            : <span style={{ color: '#cbd5e1' }}>No notes</span>
          }
        </div>

        {/* Status */}
        <div><StatusBadge status={candidate.status} /></div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <IconBtn icon={<IC.Eye />} title="View Detail" onClick={() => onDetail(candidate)} />
          <IconBtn icon={<IC.Edit />} title="Edit Notes" onClick={() => onNotes(candidate)} bgHov="#fef9c3" />
        </div>
      </div>

      {/* Expanded Members */}
      {expanded && members.map((m, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.2fr 0.8fr 0.9fr', gap: '12px',
          padding: '10px 24px 10px 72px', alignItems: 'center', borderBottom: '1px solid #f8fafc',
          background: '#f8fafc',
        }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
            <IC.MapPin />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.university || '-'}</span>
          </div>
          <div /><div /><div /><div />
        </div>
      ))}
    </>
  );
}

function IndividualRow({ candidate, onDetail, onNotes, onViewDoc }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.2fr 0.8fr 0.9fr', gap: '12px',
      padding: '14px 24px', alignItems: 'center', borderBottom: '1px solid #f1f5f9',
    }}>
      {/* Candidate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
          {(candidate.name || '?').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.name}</div>
          <div style={{ fontSize: '11.5px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.email}</div>
        </div>
      </div>

      {/* University */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569', minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}><IC.MapPin /></div>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.university || '-'}</span>
      </div>

      {/* Documents */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {candidate.has_cv && <DocBtn label="CV" onClick={() => onViewDoc(candidate, 'cv')} />}
        {candidate.has_portfolio && <DocBtn label="Porto" onClick={() => onViewDoc(candidate, 'portfolio')} />}
        {candidate.has_institution_letter && <DocBtn label="Recom" onClick={() => onViewDoc(candidate, 'institution_letter')} />}
        {!candidate.has_cv && !candidate.has_portfolio && !candidate.has_institution_letter && (
          <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>—</span>
        )}
      </div>

      {/* Notes */}
      <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
        {candidate.hr_notes
          ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IC.MessageSquare /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.hr_notes}</span></span>
          : <span style={{ color: '#cbd5e1' }}>No notes</span>
        }
      </div>

      {/* Status */}
      <div><StatusBadge status={candidate.status} /></div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '5px' }}>
        <IconBtn icon={<IC.Eye />} title="View Detail" onClick={() => onDetail(candidate)} />
        <IconBtn icon={<IC.Edit />} title="Edit Notes" onClick={() => onNotes(candidate)} bgHov="#fef9c3" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'stage_0', label: 'Stage 1' },
  { value: 'stage_1', label: 'Stage 2' },
  { value: 'stage_2', label: 'Stage 3' },
  { value: 'screening', label: 'Screening' },
  { value: 'test', label: 'Test' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CandidateHR() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | individual | group
  const [statusFilter, setStatusFilter] = useState('');

  const [detailCandidate, setDetailCandidate] = useState(null);
  const [notesCandidate, setNotesCandidate] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchCandidates = (isSearch = false) => {
    if (isSearch) setTableLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter !== 'all') params.set('type', typeFilter);

    api(`/hr/candidates/all?${params}`)
      .then(res => setCandidates(res.candidates || res.data?.candidates || []))
      .catch(err => console.error(err))
      .finally(() => { setLoading(false); setTableLoading(false); });
  };

  useEffect(() => { fetchCandidates(); }, [statusFilter, typeFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(true), 500);
    return () => clearTimeout(t);
  }, [search]);

  // ── Group deduplication ───────────────────────────────────────────────
  // Group submissions: deduplicate by id_team, keeping one row per team
  const rows = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of candidates) {
      if (c.id_team) {
        if (!seen.has(c.id_team)) {
          seen.add(c.id_team);
          out.push(c);
        }
      } else {
        out.push(c);
      }
    }
    return out;
  }, [candidates]);

  // ── Actions ───────────────────────────────────────────────────────────
  const viewDoc = async (c, type) => {
    try {
      const res = await api(`/hr/candidates/${c.id_submission}/documents/${type}`);
      if (res.data?.url) window.open(res.data.url, '_blank');
    } catch { alert('Document not found'); }
  };

  const saveNotes = async (id, note) => {
    try {
      await api(`/hr/candidates/${id}/notes`, { method: 'PATCH', data: { hr_notes: note } });
      setCandidates(prev => prev.map(c => c.id_submission === id ? { ...c, hr_notes: note } : c));
    } catch { alert('Failed to save notes'); }
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate('/login');
  };

  if (loading) return <LoadingSpinner message="Loading candidates..." />;

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
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Candidates</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{todayStr()}</span>
        </header>

        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {/* Page Title */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Candidate Management</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>View and manage all applicants across individual and group submissions.</p>
          </div>

          {/* Main Card */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            
            {/* Filters Bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Type Filter */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { value: 'all',        label: 'All' },
                  { value: 'individual', label: 'Individual', icon: <IC.User /> },
                  { value: 'group',      label: 'Group',      icon: <IC.Users /> },
                ].map(({ value, label, icon }) => (
                  <FilterChip key={value} label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {icon}{label}
                    </span>
                  } active={typeFilter === value} onClick={() => setTypeFilter(value)} />
                ))}
              </div>

              <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: '#fff', fontSize: '12.5px', fontWeight: '600', color: '#475569',
                  outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* Search */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', minWidth: '220px' }}>
                <IC.Search />
                <input
                  placeholder="Search candidate..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', background: 'transparent', color: '#1e293b', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.2fr 0.8fr 0.9fr', gap: '12px', padding: '10px 24px', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9' }}>
              {['CANDIDATE', 'UNIVERSITY', 'DOCUMENTS', 'NOTES', 'STATUS', 'ACTION'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>

            {/* Table Body */}
            <div style={{ minHeight: '300px' }}>
              {tableLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading...</div>
              ) : rows.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>No candidates found.</div>
              ) : (
                rows.map((c) =>
                  c.id_team ? (
                    <GroupRow key={c.id_team} candidate={c} onDetail={setDetailCandidate} onNotes={setNotesCandidate} onViewDoc={viewDoc} />
                  ) : (
                    <IndividualRow key={c.id_submission} candidate={c} onDetail={setDetailCandidate} onNotes={setNotesCandidate} onViewDoc={viewDoc} />
                  )
                )
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {detailCandidate && (
        <DetailModal candidate={detailCandidate} onClose={() => setDetailCandidate(null)} onViewDoc={viewDoc} />
      )}

      {notesCandidate && (
        <NotesModal candidate={notesCandidate} onClose={() => setNotesCandidate(null)} onSave={saveNotes} />
      )}

      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '360px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Sign Out?</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b' }}>Are you sure you want to sign out?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}