import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarMentor } from "../../components/SidebarMentor";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";
import { onDataRefresh } from "../../utils/dataRefresh";

const levelColorMap = {
  "Beginner": { bg: "#eff6ff", color: "#1e40af" },
  "Intermediate": { bg: "#fef9c3", color: "#92400e" },
  "Advanced": { bg: "#f5f3ff", color: "#7c3aed" },
};

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
  // intern tabs
  tabRow: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  tab: (active) => ({ padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: 500, cursor: "pointer", border: active ? "none" : "1px solid #e2e8f0", background: active ? "#8b5cf6" : "#fff", color: active ? "#fff" : "#64748b", fontFamily: "inherit" }),
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
  compName: { fontWeight: 600, color: "#0f172a", fontSize: "13px" },
  levelBadge: (lvl) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: levelColorMap[lvl]?.bg, color: levelColorMap[lvl]?.color }),
  statusBadge: (status) => ({
    display: "inline-flex", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
    background: status === "Scored" ? "#eff6ff" : "#f5f3ff",
    color: status === "Scored" ? "#1e40af" : "#7c3aed",
  }),
};

export default function CompetenciesMentor() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [interns, setInterns] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedInternName, setSelectedInternName] = useState("");
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Listen for data refresh events and refetch data
    const cleanup = onDataRefresh(() => {
      console.log('CompetenciesMentor: Data refresh event received, refetching...');
      fetchData();
    });
    
    // Also refetch when window gains focus
    const handleFocus = () => {
      console.log('CompetenciesMentor: Window focused, refetching data...');
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
      
      // If we had a selected intern, keep it and refetch their competencies
      if (selectedSubmissionId) {
        const stillExists = internsRes.data.find(i => i.id_submission === selectedSubmissionId);
        if (stillExists) {
          // Keep current selection and refetch their competencies
          fetchCompetencies(selectedSubmissionId);
        } else if (internsRes.data.length > 0) {
          // Selected intern no longer exists, switch to first
          setSelectedSubmissionId(internsRes.data[0].id_submission);
          setSelectedInternName(internsRes.data[0].name);
          fetchCompetencies(internsRes.data[0].id_submission);
        }
      } else if (internsRes.data.length > 0) {
        // No selection yet, select first
        setSelectedSubmissionId(internsRes.data[0].id_submission);
        setSelectedInternName(internsRes.data[0].name);
        fetchCompetencies(internsRes.data[0].id_submission);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencies = async (idSubmission) => {
    try {
      const res = await mentorApi.getCompetencies(idSubmission);
      setCompetencies(res.data);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    }
  };

  const handleSelectIntern = (idSubmission, name) => {
    setSelectedSubmissionId(idSubmission);
    setSelectedInternName(name);
    fetchCompetencies(idSubmission);
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

  if (loading) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogout} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span>Assessment</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Competencies</span>
            </div>
          </div>
          <div style={s.content}><p>Loading...</p></div>
        </main>
      </div>
    );
  }

  const selectedIntern = interns.find(i => i.id_submission === selectedSubmissionId);

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; }`}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogout} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Assessment</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Competencies</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Competencies</h1>
          <p style={s.subtitle}>View the competencies that must be scored for each intern, along with required learning hours and current scoring status.</p>

          <div style={s.card}>
            <div style={s.ch}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Select Intern:</label>
                <select 
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#334155", background: "#fff", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", outline: "none" }}
                  value={selectedSubmissionId || ""}
                  onChange={(e) => {
                    const selected = interns.find(i => i.id_submission === Number(e.target.value));
                    if (selected) handleSelectIntern(selected.id_submission, selected.name);
                  }}
                >
                  <option value="">Choose an intern...</option>
                  {interns.map((i) => (
                    <option key={i.id_submission} value={i.id_submission}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {selectedSubmissionId && (
              <>
                <div style={{padding: "14px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc"}}>
                  <div style={s.ct}>{selectedInternName}</div>
                  <div style={s.cs}>{competencies.filter(c => c.status !== "pending").length}/{competencies.length} competencies scored · Required for this position</div>
                </div>
                <table style={s.table}>
              <colgroup>
                <col style={{ width: "45%" }} /><col style={{ width: "25%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <thead style={s.thead}>
                <tr>
                  <th style={s.th}>COMPETENCY</th>
                  <th style={s.th}>REQUIRED HRS</th><th style={s.th}>POSITION</th>
                </tr>
              </thead>
              <tbody>
                {competencies.map((comp, i) => (
                  <tr key={i}>
                    <td style={s.td}><span style={s.compName}>{comp.name}</span></td>
                    <td style={s.td}>{comp.hours} hrs</td>
                    <td style={s.td}>{selectedIntern?.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </>
            )}
            {!selectedSubmissionId && (
              <div style={{ padding: "28px", textAlign: "center", color: "#94a3b8" }}>
                <p style={{ fontSize: "13px" }}>Select an intern to view their competencies</p>
              </div>
            )}
          </div>
        </div>

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