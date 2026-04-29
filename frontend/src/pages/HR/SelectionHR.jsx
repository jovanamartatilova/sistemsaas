import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import SidebarHR from '../../components/SidebarHR';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const IC = {
  Search: () => <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>,
  MapPin: () => <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg>,
  ChevronDown: () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='6 9 12 15 18 9'/></svg>,
  FileText: () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/></svg>,
  // ── added for DocListModal ──
  Folder: () => <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/></svg>,
  ExternalLink: () => <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/><polyline points='15 3 21 3 21 9'/><line x1='10' y1='14' x2='21' y2='3'/></svg>,
  X: () => <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>,
};

function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
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
  const [confirmAction, setConfirmAction] = useState(null);

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
                          (item.type === 'screening' ? "Tahap awal penyeleksian di mana HR akan meninjau kelengkapan berkas, Curriculum Vitae (CV), dan portofolio kandidat untuk memastikan kesesuaian dengan kualifikasi posisi." : 
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', width: '220px' }}>
                  <IC.Search />
                  <input
                    placeholder="Search candidate..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '12.5px', width: '100%', background: 'transparent', color: '#1e293b' }}
                  />
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '12px 24px', background: '#fcfcfd', borderBottom: '1px solid #f1f5f9' }}>
              {['CANDIDATE', 'UNIVERSITY', 'DOCUMENTS', 'APPLIED DATE', 'ACTION'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textAlign: 'left' }}>{h}</div>
              ))}
            </div>

            <div style={{ minHeight: '300px' }}>
              {tableLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading...</div>
              ) : candidates.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13.5px' }}>No candidates in this stage.</div>
              ) : (
                candidates.map((c, i) => {
                  // Per-row state for docModal is handled inside an inline component wrapper
                  return (
                    <CandidateRow
                      key={c.id_submission}
                      c={c}
                      index={i}
                      total={candidates.length}
                      activeTab={activeTab}
                      activeSubStageIndex={activeSubStageIndex}
                      selectionFlow={selectionFlow}
                      onPass={handlePass}
                      onReject={(c) => setConfirmAction({ type: 'reject', candidate: c })}
                      onViewDoc={viewDoc}
                    />
                  );
                })
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