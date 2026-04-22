import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  layout: { display: "grid", gridTemplateColumns: "1fr", gap: "16px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cb: { padding: "24px" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" },
  select: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical", minHeight: "120px" },
  btnRow: { display: "flex", gap: "10px" },
  btnBlue: { flex: 1, padding: "9px 0", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnPurple: { flex: 1, padding: "9px 0", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  sideCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "16px" },
  sideLast: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  sideCh: { padding: "14px 18px", borderBottom: "1px solid #f8fafc" },
  sideCt: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  statusRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 18px", borderBottom: "1px solid #f8fafc", fontSize: "12px" },
  badge: (bg, color) => ({ display: "inline-flex", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, background: bg, color }),
  aiBody: { padding: "16px 18px" },
  aiBox: { background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "8px", padding: "12px" },
  aiLbl: { fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" },
  aiText: { fontSize: "12px", color: "#374151", lineHeight: 1.6 },
};

export default function EvaluationMentor() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [interns, setInterns] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedInternName, setSelectedInternName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [recommendation, setRecommendation] = useState("Recommended to Pass");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evalStatuses, setEvalStatuses] = useState([]);
  const [logoutModal, setLogoutModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Listen for data refresh events and refetch data
    const cleanup = onDataRefresh(() => {
      console.log('EvaluationMentor: Data refresh event received, refetching...');
      fetchData();
    });
    
    // Also refetch when window gains focus
    const handleFocus = () => {
      console.log('EvaluationMentor: Window focused, refetching data...');
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    
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
      setEvalStatuses(internsRes.data.map((intern, idx) => ({
        name: intern.name,
        status: idx === 0 || idx === 1 || idx === 2 ? "Done" : idx === 3 ? "Draft" : "Pending",
        bg: idx === 0 || idx === 1 || idx === 2 ? "#eff6ff" : idx === 3 ? "#f5f3ff" : "#f1f5f9",
        color: idx === 0 || idx === 1 || idx === 2 ? "#1e40af" : idx === 3 ? "#7c3aed" : "#64748b",
      })));
      if (internsRes.data.length > 0) {
        setSelectedSubmissionId(internsRes.data[0].id_submission);
        setSelectedInternName(internsRes.data[0].name);
        fetchEvaluation(internsRes.data[0].id_submission);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluation = async (idSubmission) => {
    try {
      const res = await mentorApi.getEvaluation(idSubmission);
      if (res.data) {
        setNarrative(res.data.narrative || "");
        setRecommendation(res.data.recommendation || "Recommended to Pass");
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    }
  };

  const handleInternChange = (idSubmission, name) => {
    setSelectedSubmissionId(idSubmission);
    setSelectedInternName(name);
    setNarrative("");
    setRecommendation("Recommended to Pass");
    fetchEvaluation(idSubmission);
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

  const handleSaveEvaluation = async () => {
    try {
      setSaving(true);
      await mentorApi.saveEvaluation(selectedSubmissionId, { narrative, recommendation });
      // Broadcast data refresh to notify dashboard and other pages
      broadcastDataRefresh('evaluation');
      // Refetch data after successful save to update dashboard
      await fetchData();
      setSuccessModal(true);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogout} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span>Others</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Evaluation</span>
            </div>
          </div>
          <div style={s.content}><p>Loading...</p></div>
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
            <span>Others</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Evaluation</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Evaluation</h1>
          <p style={s.subtitle}>Write final evaluation narratives and graduation recommendations for each intern.</p>

          <div style={s.layout}>
            <div style={s.card}>
              <div style={s.ch}><div style={s.ct}>Final Evaluation Form</div></div>
              <div style={s.cb}>
                <div style={s.field}>
                  <label style={s.label}>Intern</label>
                  <select style={s.select} value={selectedSubmissionId || ""} onChange={(e) => {
                    const selected = interns.find(i => i.id_submission === Number(e.target.value));
                    if (selected) handleInternChange(selected.id_submission, selected.name);
                  }}>
                    {interns.map(i => <option key={i.id_submission} value={i.id_submission}>{i.name} — {i.position}</option>)}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Evaluation Narrative</label>
                  <textarea style={s.textarea} value={narrative} onChange={(e) => setNarrative(e.target.value)} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Graduation Recommendation</label>
                  <select style={s.select} value={recommendation} onChange={(e) => setRecommendation(e.target.value)}>
                    <option>Recommended to Pass</option>
                    <option>Not Recommended</option>
                    <option>Extension Required</option>
                  </select>
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnPurple} onClick={handleSaveEvaluation} disabled={saving}>{saving ? 'Saving...' : 'Save Evaluation'}</button>
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
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Evaluation Saved</div>
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>The evaluation narrative and recommendation have been saved successfully.</div>
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