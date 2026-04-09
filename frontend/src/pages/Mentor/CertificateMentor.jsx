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
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" },
  stat: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statVal: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBar: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statFill: (w, c) => ({ height: "100%", borderRadius: "10px", width: w, background: c }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  btnPrimary: { padding: "7px 16px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  // clean table
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  csub: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  badge: (bg, color) => ({ display: "inline-flex", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  acts: { display: "flex", gap: "6px" },
  btnView: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", fontFamily: "inherit" },
  btnDownload: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", fontFamily: "inherit" },
  btnGenerate: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", fontFamily: "inherit" },
};

const statCards = [
  { value: 5, label: "Ready to Generate", sub: "Interns have passed", barColor: "#22c55e", barWidth: "62%" },
  { value: 3, label: "Generated", sub: "Ready to download", barColor: "#14b8a6", barWidth: "37%" },
  { value: 2, label: "In Queue", sub: "Being processed", barColor: "#8b5cf6", barWidth: "25%" },
];

// Removed hardcoded certList - now loaded from API in component

export default function CertificateMentor() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [statCards, setStatCards] = useState([]);
  const [certList, setCertList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, certRes] = await Promise.all([
        mentorApi.getProfile(),
        mentorApi.getCertificates(),
      ]);
      setMentor(profileRes.data);
      setStatCards(certRes.data.stats || []);
      setCertList(certRes.data.certificates || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (idSubmission) => {
    try {
      setGenerating(prev => ({ ...prev, [idSubmission]: true }));
      await mentorApi.generateCertificate(idSubmission);
      alert('Certificate generated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setGenerating(prev => ({ ...prev, [idSubmission]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
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
              <span style={s.bcActive}>Certificate</span>
            </div>
          </div>
          <div style={s.content}><p>Loading...</p></div>
        </main>
      </div>
    );
  }
  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; }`}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogout} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Others</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Certificate</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Certificate</h1>
          <p style={s.subtitle}>Generate and manage certificates for interns who have passed all competency assessments.</p>

          <div style={s.grid3}>
            {statCards.map((c, i) => (
              <div key={i} style={s.stat}>
                <div style={s.statTop}><span style={s.statLabel}>{c.label}</span></div>
                <div style={s.statVal}>{c.value}</div>
                <div style={s.statBar}><div style={s.statFill(c.barWidth, c.barColor)} /></div>
                <div style={s.statSub}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.ch}>
              <div><div style={s.ct}>Certificate List</div><div style={s.cs}>Interns who have completed all competency assessments</div></div>
              <button style={s.btnPrimary}>Bulk Generate</button>
            </div>
            <table style={s.table}>
              <colgroup>
                <col style={{ width: "22%" }} /><col style={{ width: "18%" }} /><col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} /><col style={{ width: "14%" }} /><col style={{ width: "14%" }} />
              </colgroup>
              <thead style={s.thead}>
                <tr>
                  <th style={s.th}>INTERN</th><th style={s.th}>POSITION</th><th style={s.th}>PROGRAM</th>
                  <th style={s.th}>FINAL SCORE</th><th style={s.th}>STATUS</th><th style={s.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {certList.map((cert, i) => (
                  <tr key={i}>
                    <td style={s.td}><span style={s.cname}>{cert.name}</span></td>
                    <td style={s.td}>{cert.position}</td>
                    <td style={s.td}>{cert.program}</td>
                    <td style={s.td}>{cert.score !== null ? <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{cert.score.toFixed(1)}</span> : <span style={{ color: "#94a3b8" }}>—</span>}</td>
                    <td style={s.td}><span style={s.badge(cert.statusBg, cert.statusColor)}>{cert.status}</span></td>
                    <td style={s.td}>
                      <div style={s.acts}>
                        {cert.status === "Generated" && (
                          <>
                            <button style={s.btnView}>Preview</button>
                            <button style={s.btnDownload}>Download</button>
                          </>
                        )}
                        {cert.status === "In Queue" && (
                          <button style={s.btnGenerate} onClick={() => handleGenerateCertificate(cert.id_submission)} disabled={generating[cert.id_submission]}>
                            {generating[cert.id_submission] ? 'Generating...' : 'Generate'}
                          </button>
                        )}
                        {cert.status !== "Generated" && cert.status !== "In Queue" && <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}