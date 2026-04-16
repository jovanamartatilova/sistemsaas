import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  layout: { display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" },
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

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const handleSaveEvaluation = async () => {
    try {
      setSaving(true);
      await mentorApi.saveEvaluation(selectedSubmissionId, { narrative, recommendation });
      alert('Evaluation saved successfully!');
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

            <div>
              <div style={s.sideCard}>
                <div style={s.sideCh}><div style={s.sideCt}>Evaluation Status</div></div>
                {evalStatuses.map((item, i) => (
                  <div key={i} style={{ ...s.statusRow, borderBottom: i < evalStatuses.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <span>{item.name}</span>
                    <span style={s.badge(item.bg, item.color)}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}