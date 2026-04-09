import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SidebarMentor } from "./DashboardMentor";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";

const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b" },
  main: { marginLeft: "172px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
  bc: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  bcSep: { color: "#cbd5e1" },
  bcActive: { color: "#1e293b", fontWeight: 600 },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  // intern picker
  pickerRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" },
  pickerField: { display: "flex", flexDirection: "column", gap: "5px" },
  pickerLabel: { fontSize: "11px", fontWeight: 600, color: "#64748b" },
  pickerSelect: { padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#fff", outline: "none", fontFamily: "inherit" },
  // competency rows
  compRow: { borderBottom: "1px solid #f8fafc" },
  compHeader: { display: "grid", gridTemplateColumns: "1fr 90px 90px 100px 110px 90px", alignItems: "center", padding: "12px 24px", gap: "12px" },
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, internsRes] = await Promise.all([
        mentorApi.getProfile(),
        mentorApi.getInterns(),
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
          status: comp.status,
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
      const scoresArray = competencies.map(comp => ({
        id_competency: comp.id_competency,
        score: scores[comp.id_competency]?.score,
        hours_completed: scores[comp.id_competency]?.hours_completed,
        status: scores[comp.id_competency]?.status,
        notes: scores[comp.id_competency]?.notes,
      }));

      console.log('Saving scores:', {
        idSubmission: selectedSubmissionId,
        scoresArray,
      });

      const response = await mentorApi.inputScores(selectedSubmissionId, scoresArray);
      console.log('Save response:', response.data);
      
      alert('✓ Scores saved successfully!');
      // Refresh competencies to confirm save
      await fetchCompetencies(selectedSubmissionId);
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
      alert('❌ ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  // Filter interns to only show those NOT fully scored
  const unScoredInterns = interns.filter(i => i.completed_competencies < i.total_competencies || i.total_competencies === 0);
  
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
            {/* Main scoring card */}
            <div style={s.card}>
              <div style={s.ch}>
                <div style={s.ct}>Score by Competency</div>
                <div style={s.cs}>All competencies for this position must be scored individually</div>
              </div>

              {/* Intern + position picker */}
              <div style={s.pickerRow}>
                <div style={s.pickerField}>
                  <label style={s.pickerLabel}>INTERN</label>
                  <select style={s.pickerSelect} value={selectedSubmissionId || ""} onChange={(e) => handleInternChange(e.target.value)}>
                    {unScoredInterns.map(i => <option key={i.id_submission} value={i.id_submission}>{i.name}</option>)}
                  </select>
                </div>
                <div style={s.pickerField}>
                  <label style={s.pickerLabel}>POSITION & TYPE</label>
                  <div style={{ fontSize: "13px", padding: "7px 0", color: "#334155" }}>
                    {selectedIntern?.position} &nbsp;·&nbsp;
                    <span style={{ color: selectedIntern?.type === "Team" ? "#1e40af" : "#64748b", background: selectedIntern?.type === "Team" ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: "5px", fontSize: "12px" }}>{selectedIntern?.type}</span>
                  </div>
                </div>
              </div>

              {/* Column headers */}
              <div style={{ ...s.compHeader, paddingBottom: "8px", paddingTop: "14px" }}>
                <div style={s.colLabel}>Competency</div>
                <div style={s.colLabel}>Req. Hours</div>
                <div style={s.colLabel}>Score (0–100)</div>
                <div style={s.colLabel}>Learning Hrs</div>
                <div style={s.colLabel}>Status</div>
                <div style={s.colLabel}>Notes</div>
              </div>

              {/* One row per competency */}
              {competencies.map((comp) => {
                const sc = scores[comp.id_competency] || { score: "", hours_completed: "", status: "pending", notes: "" };
                return (
                  <div key={comp.id_competency} style={s.compRow}>
                    <div style={s.compHeader}>
                      <div>
                        <div style={s.compLabel}>{comp.name}</div>
                        <div style={s.compHrs}>Required {comp.hours} hrs</div>
                      </div>
                      <div style={s.compHrs}>{comp.hours} hrs</div>
                      <input
                        type="number" min="0" max="100" placeholder="0–100"
                        style={s.fieldInput}
                        value={sc.score ?? ""}
                        onChange={(e) => updateScore(comp.id_competency, "score", e.target.value === "" ? null : Number(e.target.value))}
                      />
                      <input
                        type="number" min="0" placeholder="hrs"
                        style={s.fieldInput}
                        value={sc.hours_completed || ""}
                        onChange={(e) => updateScore(comp.id_competency, "hours_completed", e.target.value === "" ? null : Number(e.target.value))}
                      />
                      <select style={s.fieldSelect} value={sc.status} onChange={(e) => updateScore(comp.id_competency, "status", e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="in_progress">In Progress</option>
                      </select>
                      <input
                        type="text" placeholder="Optional note..."
                        style={s.fieldInput}
                        value={sc.notes || ""}
                        onChange={(e) => updateScore(comp.id_competency, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Auto average footer */}
              <div style={s.avgFooter}>
                <div>
                  <div style={s.avgLabel}>Auto-calculated average score</div>
                  <div style={s.avgNote}>{scored.length}/{competencies.length} competencies scored</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={s.avgVal}>{avg !== null ? avg : "—"}</div>
                </div>
                <button style={s.btnSave} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save All Scores'}</button>
              </div>
            </div>

            {/* Side panels */}
            <div>
              {/* Score summary */}
              <div style={s.sideCard}>
                <div style={s.sideCh}><div style={s.sideCt}>Score Summary — {selectedInternName.split(" ")[0]}</div></div>
                {competencies.map((comp, i) => {
                  const sc = scores[comp.id_competency];
                  return (
                    <div key={comp.id_competency} style={{ ...s.scoreRow, borderBottom: i < competencies.length - 1 ? "1px solid #f8fafc" : "none" }}>
                      <span style={s.scoreName}>{comp.name}</span>
                      {sc?.score !== null && sc?.score !== undefined && sc?.score !== "" ? <span style={s.scoreVal}>{sc.score}</span> : <span style={s.scoreEmpty}>—</span>}
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Average</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#8b5cf6" }}>{avg !== null ? avg : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}