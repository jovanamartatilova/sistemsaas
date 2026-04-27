import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SidebarMentor } from "../../components/SidebarMentor";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";
import { broadcastDataRefresh, onDataRefresh } from "../../utils/dataRefresh";

const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b", gap: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", gap: 0, overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 },
  bc: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  bcSep: { color: "#cbd5e1" },
  bcActive: { color: "#1e293b", fontWeight: 600 },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px", flex: 1, overflowY: "auto" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  layout: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "0", minHeight: "calc(100vh - 120px)", alignItems: "start" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  // intern picker
  pickerRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
compHeader: { display: "grid", gridTemplateColumns: "1fr 80px 80px 90px 80px 160px", alignItems: "center", padding: "10px 24px", gap: "10px" },
  pickerField: { display: "flex", flexDirection: "column", gap: "5px" },
  pickerLabel: { fontSize: "11px", fontWeight: 600, color: "#64748b" },
  pickerSelect: { padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#fff", outline: "none", fontFamily: "inherit" },
  // competency rows
  compRow: { borderBottom: "1px solid #f8fafc" },
  compHeader: { display: "grid", gridTemplateColumns: "1fr 90px 90px 100px 90px", alignItems: "center", padding: "12px 24px", gap: "12px" },
  compLabel: { fontSize: "12px", fontWeight: 600, color: "#0f172a" },
  compHrs: { fontSize: "11px", color: "#94a3b8" },
  fieldInput: { width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  fieldSelect: { width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  colLabel: { fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" },
  // avg footer
  avgFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", gap: "12px" },
  avgLabel: { fontSize: "13px", color: "#64748b" },
  avgVal: { fontSize: "22px", fontWeight: 800, color: "#8b5cf6" },
  avgNote: { fontSize: "11px", color: "#94a3b8" },
  btnSave: { padding: "9px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  sideCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "16px" },
  sideCh: { padding: "14px 18px", borderBottom: "1px solid #f8fafc" },
  sideCt: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  scoreRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", fontSize: "12px" },
  scoreName: { color: "#334155", flex: 1 },
  scoreVal: { fontWeight: 700, color: "#8b5cf6", marginLeft: "8px" },
  scoreEmpty: { color: "#94a3b8", marginLeft: "8px" },
};

export default function InputScoreMentor() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [interns, setInterns] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedInternName, setSelectedInternName] = useState("");
  const [competencies, setCompetencies] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Setup background sync
    const cacheRef = { lastFetchTime: null };
    const cacheDuration = 5 * 60 * 1000;
    
    const handleFocus = async () => {
      if (!cacheRef.lastFetchTime) return;
      const elapsed = Date.now() - cacheRef.lastFetchTime;
      if (elapsed < cacheDuration) return;
      try {
        await fetchData();
        cacheRef.lastFetchTime = Date.now();
      } catch (error) {
        console.error('[InputScoreMentor] Background sync error:', error);
      }
    };
    
    const cleanup = onDataRefresh((eventName) => {
      if (eventName === 'scores') {
        fetchData().then(() => { cacheRef.lastFetchTime = Date.now(); });
      }
    });
    
    window.addEventListener('focus', handleFocus);
    cacheRef.lastFetchTime = Date.now();
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      cleanup();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, internsRes] = await Promise.all([
        mentorApi.getProfile(),
        mentorApi.getInterns(''),
      ]);
      
      setMentor(profileRes.data);
      setInterns(internsRes.data);
      
      // Filter to only unscored interns
      const unscored = internsRes.data.filter(i => i.completed_competencies < i.total_competencies || i.total_competencies === 0);
      if (unscored.length > 0) {
        setSelectedSubmissionId(unscored[0].id_submission);
        setSelectedInternName(unscored[0].name);
        fetchCompetencies(unscored[0].id_submission);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencies = async (idSubmission) => {
    try {
      const res = await mentorApi.getCompetencies(idSubmission);
      setCompetencies(res.data);
      
      const newScores = {};
      res.data.forEach(comp => {
        newScores[comp.id_competency] = {
          score: comp.score,
          hours_completed: comp.hours_completed,
          status: comp.status || 'pending', // Ensure status always has a value
          notes: comp.notes,
        };
      });
      setScores(newScores);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    }
  };

  const handleInternChange = (idSubmission) => {
    const selected = interns.find(i => i.id_submission === idSubmission);
    if (selected) {
      setSelectedSubmissionId(idSubmission);
      setSelectedInternName(selected.name);
      setScores({});
      fetchCompetencies(idSubmission);
    }
  };

  const updateScore = (compId, field, value) => {
    setScores(prev => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const scoresArray = competencies.map(comp => {
        const compScore = scores[comp.id_competency];
        let status = compScore?.status ?? 'pending';
        
        // Auto-set status based on score if not explicitly set
        if (compScore?.score !== null && compScore?.score !== undefined && compScore?.score !== '') {
          // If score was entered but no explicit status, determine based on score
          if (!compScore?.status) {
            status = compScore.score >= 75 ? 'passed' : 'failed';
          }
        }
        
        // If passed, use required hours; otherwise use existing hours_completed or 0
        const hoursCompleted = status === 'passed' ? comp.hours : (compScore?.hours_completed ?? 0);
        
        return {
          id_competency: comp.id_competency,
          score: compScore?.score,
          hours_completed: hoursCompleted,
          status: status,
          notes: compScore?.notes,
          achievement_description: compScore?.achievement_description ?? null,
        };
      });

      console.log('DEBUG - Saving scores:', {
        idSubmission: selectedSubmissionId,
        scoresArray,
        competenciesCount: competencies.length,
        scoresStateKeys: Object.keys(scores),
      });
      console.log('DEBUG - Individual scores state:', scores);

      const response = await mentorApi.inputScores(selectedSubmissionId, scoresArray);
      console.log('Save response:', response.data);
      
      // Broadcast data refresh to notify dashboard and other pages
      broadcastDataRefresh('scores');
      
      setSuccessModal(true);
      // Refresh competencies to confirm save
      await fetchCompetencies(selectedSubmissionId);
      setScores({});
    } catch (error) {
      console.error('Error saving scores:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Build detailed error message
      let errorMsg = 'Failed to save scores';
      if (error.response?.status === 422) {
        // Validation error
        const errors = error.response?.data?.errors;
        if (errors) {
          errorMsg = 'Validation Error: ' + Object.values(errors).flat().join(', ');
        }
      } else if (error.response?.status === 404) {
        errorMsg = 'Submission not found or you don\'t have access';
      } else if (error.response?.status === 403) {
        errorMsg = 'Unauthorized - You don\'t have permission to edit this intern\'s scores';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => setLogoutModal(true);

  const confirmLogout = async () => {
    try {
      await mentorApi.logout();
    } finally {
      localStorage.clear();
      useAuthStore.setState({ isAuthenticated: false, mentor: null });
      setLogoutModal(false);
      navigate("/login");
    }
  };

  const handleLogout = handleLogoutClick;

  // Filter interns to only show those NOT fully scored and NOT already passed
  const unScoredInterns = interns.filter(i => {
    // Exclude if recommendation is "Recommended to Pass" (already evaluated/passed)
    if (i.recommendation === "Recommended to Pass") return false;
    // Include if not fully scored
    return i.completed_competencies < i.total_competencies || i.total_competencies === 0;
  });
  
  const selectedIntern = interns.find(i => i.id_submission === selectedSubmissionId);
  const scored = competencies.filter(c => scores[c.id_competency]?.score !== null && scores[c.id_competency]?.score !== undefined && scores[c.id_competency]?.score !== "");
  const avg = scored.length > 0 ? (scored.reduce((sum, c) => sum + Number(scores[c.id_competency].score), 0) / scored.length).toFixed(1) : null;

  if (loading) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogout} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span>Assessment</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Input Score</span>
            </div>
          </div>
          <div style={s.content}><p>Loading...</p></div>
        </main>
      </div>
    );
  }

  // Show empty state if no unscored interns
  if (unScoredInterns.length === 0) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogout} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span>Assessment</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Input Score</span>
            </div>
          </div>
          <div style={s.content}>
            <h1 style={s.h1}>Input Score</h1>
            <p style={s.subtitle}>All assigned interns have been scored already.</p>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
              ✓ All interns have been scored. Check <Link to="/mentor/score-recap" style={{color: "#15803d", fontWeight: 600}}>Score Recap</Link> for details or <Link to="/mentor/evaluation" style={{color: "#15803d", fontWeight: 600}}>Evaluation</Link> to proceed.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogout} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Assessment</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Input Score</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Input Score</h1>
          <p style={s.subtitle}>Select an intern to input scores for each of their competencies. The average is calculated automatically.</p>
          
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}

        <div style={s.layout}>
          {/* ── PANEL KIRI: Daftar Intern ── */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", overflow: "hidden", position: "sticky", top: "80px" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={s.ct}>Daftar Intern</div>
              <div style={{ ...s.cs, marginTop: "4px" }}>{unScoredInterns.length} intern belum dinilai</div>
            </div>

            {/* Search box */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Cari intern..."
                  style={{ width: "100%", padding: "7px 10px 7px 32px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  readOnly
                />
              </div>
            </div>

            {/* Intern list */}
            <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 280px)" }}>
              {unScoredInterns.map((intern) => {
                const isSelected = intern.id_submission === selectedSubmissionId;
                const completedRatio = intern.total_competencies > 0 ? intern.completed_competencies / intern.total_competencies : 0;
                const isFullyScored = completedRatio === 1;
                return (
                  <div
                key={intern.id_submission}
                onClick={() => handleInternChange(intern.id_submission)}
                style={{
                  padding: "9px 16px",
                  borderBottom: "1px solid #f8fafc",
                  cursor: "pointer",
                  background: isSelected ? "#faf5ff" : "#fff",
                  borderLeft: isSelected ? "3px solid #8b5cf6" : "3px solid transparent",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {/* Avatar initials */}
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: isSelected ? "#ede9fe" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: isSelected ? "#7c3aed" : "#64748b", flexShrink: 0 }}>
                  {intern.name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                </div>

                {/* Name + position in one line each */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#7c3aed" : "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{intern.name}</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{intern.position} · {intern.completed_competencies}/{intern.total_competencies}</div>
                </div>

                {/* Scored check or pending dot */}
                {isFullyScored
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  : <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e2e8f0", flexShrink: 0 }} />
                }
              </div>
                );
              })}
            </div>
          </div>

          {/* ── PANEL KANAN: Detail Scoring ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            {/* Header intern terpilih */}
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{selectedIntern?.name || selectedInternName}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{selectedIntern?.position}</div>
                <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#8b5cf6", background: "#ede9fe", padding: "3px 10px", borderRadius: "20px" }}>
                    {competencies.filter(c => scores[c.id_competency]?.score !== null && scores[c.id_competency]?.score !== undefined && scores[c.id_competency]?.score !== "").length}/{competencies.length} kompetensi sudah dinilai
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", background: selectedIntern?.type === "Team" ? "#dbeafe" : "#f1f5f9", color: selectedIntern?.type === "Team" ? "#1e40af" : "#64748b", padding: "3px 10px", borderRadius: "20px", fontWeight: 600 }}>{selectedIntern?.type}</span>
                </div>
              </div>
              {avg !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nilai Akhir</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "#8b5cf6", lineHeight: 1.1, marginTop: "4px" }}>{avg}</div>
                </div>
              )}
            </div>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px 90px 80px 160px", alignItems: "center", padding: "10px 24px", gap: "10px", paddingBottom: "8px", paddingTop: "14px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <div style={s.colLabel}>Competency</div>
              <div style={s.colLabel}>Req. Hrs</div>
              <div style={s.colLabel}>Score (0–100)</div>
              <div style={s.colLabel}>Status</div>
              <div style={s.colLabel}>Notes</div>
              <div style={s.colLabel}>Achievement Description</div>
            </div>
            {/* Competency rows */}
            <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 340px)" }}>
              {competencies.map((comp, idx) => {
                const sc = scores[comp.id_competency] || { score: "", status: "passed", notes: "", achievement_description: "" };
                const hasScore = sc.score !== null && sc.score !== undefined && sc.score !== "";
                return (
                  <div key={comp.id_competency} style={{ ...s.compRow, background: hasScore ? "#fafffe" : "#fff" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px 90px 80px 160px", alignItems: "center", padding: "10px 24px", gap: "10px" }}>
                      <div>
                        <div style={s.compLabel}>{idx + 1}. {comp.name}</div>
                        <div style={s.compHrs}>Required {comp.hours} hrs</div>
                      </div>
                      <div style={s.compHrs}>{comp.hours} hrs</div>
                      <input
                        type="number" min="0" max="100" placeholder="0–100"
                        style={{ ...s.fieldInput, border: hasScore ? "1px solid #a7f3d0" : "1px solid #e2e8f0", background: hasScore ? "#f0fdf4" : "#f8fafc" }}
                        value={sc.score ?? ""}
                        onChange={(e) => updateScore(comp.id_competency, "score", e.target.value === "" ? null : Number(e.target.value))}
                      />
                      <select
                        style={{ ...s.fieldSelect, color: sc.status === "passed" ? "#16a34a" : "#dc2626", background: sc.status === "passed" ? "#f0fdf4" : "#fef2f2", border: sc.status === "passed" ? "1px solid #a7f3d0" : "1px solid #fecaca" }}
                        value={sc.status}
                        onChange={(e) => updateScore(comp.id_competency, "status", e.target.value)}
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                      <input
                        type="text" placeholder="Optional note..."
                        style={s.fieldInput}
                        value={sc.notes || ""}
                        onChange={(e) => updateScore(comp.id_competency, "notes", e.target.value)}
                      />

                      {/* Achievement Description — ready for AI integration */}
                      <div style={{ position: "relative" }}>
                        <textarea
                          placeholder="Describe achievement..."
                          rows={2}
                          style={{ ...s.fieldInput, resize: "none", lineHeight: "1.4", paddingRight: "26px", height: "52px", overflowY: "auto" }}
                          value={sc.achievement_description || ""}
                          onChange={(e) => updateScore(comp.id_competency, "achievement_description", e.target.value)}
                        />
                        {/* AI generate button placeholder */}
                        <button
                          title="Generate with AI"
                          style={{ position: "absolute", right: "4px", bottom: "6px", width: "20px", height: "20px", border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", borderRadius: "4px" }}
                          onClick={() => {/* AI integration hook goes here */}}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rangkuman Penilaian */}
            <div style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
             <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Assessment Summary</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ padding: "16px 24px", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Average Score</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#3b82f6", marginTop: "4px" }}>{avg ?? "—"}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>from {competencies.length} competencies</div>
              </div>
              <div style={{ padding: "16px 24px", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Required Hours</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#22c55e", marginTop: "4px" }}>
                  {competencies.reduce((sum, c) => sum + (c.hours || 0), 0)}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>hours</div>
              </div>
              <div style={{ padding: "16px 24px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Scored</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#8b5cf6", marginTop: "4px" }}>{scored.length}/{competencies.length}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>competencies</div>
              </div>
            </div>
            <div style={{ ...s.avgFooter, justifyContent: "flex-end", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div style={s.avgNote}>{scored.length}/{competencies.length} competencies filled in</div>
              </div>
              <button style={s.btnSave} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save All Scores'}
              </button>
            </div>
            </div>
          </div>
        </div>
        </div>

        {/* Success Notification Modal */}
        {successModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "left" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", marginBottom: "14px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Scores Saved</div>
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Competency scores have been saved successfully.</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={() => setSuccessModal(false)} style={{ padding: "8px 16px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Modal */}
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "left" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 3 16 13 2 13"></polyline>
              </svg>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Are you sure you want to sign out of your account?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}