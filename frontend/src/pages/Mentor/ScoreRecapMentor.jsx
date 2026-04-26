import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarMentor } from "../../components/SidebarMentor";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";
import { onDataRefresh } from "../../utils/dataRefresh";

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
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", textAlign: "center" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  badge: (bg, color) => ({ display: "inline-flex", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  typeBadge: (isTeam) => ({ fontSize: "12px", color: isTeam ? "#1e40af" : "#334155", background: isTeam ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: "5px", display: "inline-block" }),
  btnOutline: { padding: "7px 14px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};

export default function ScoreRecapMentor() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [statCards, setStatCards] = useState([]);
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const [search, setSearch] = useState("");

  // ─── INITIAL LOAD ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);

    const cleanup = onDataRefresh(() => {
      console.log('ScoreRecapMentor: Data refresh event received, refetching...');
      fetchData();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      cleanup();
    };
  }, []);

  // ─── SEARCH DEBOUNCE ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) fetchRecap(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── FETCH FUNCTIONS ──────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, recapRes] = await Promise.all([
        mentorApi.getProfile(),
        mentorApi.getScoreRecap(''),
      ]);
      setMentor(profileRes.data);
      setStatCards(recapRes.data.stats || []);
      setRecapData(recapRes.data.recap || []);
    } catch (error) {
      console.error('Error fetching score recap:', error);
      setError('Failed to load score recap: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRecap = async (searchVal) => {
    setTableLoading(true);
    try {
      const res = await mentorApi.getScoreRecap(searchVal);
      setStatCards(res.data.stats || []);
      setRecapData(res.data.recap || []);
    } catch (err) {
      console.error('Error fetching recap:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // ─── EXPORT CSV ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    try {
      const headers = ['Intern', 'Position', 'Program', 'Type', 'Competencies Scored', 'Total Hours', 'Average Score', 'Status'];
      const rows = recapData.map(row => [
        row.name, row.position, row.program, row.type, row.scored, row.hours,
        row.avg != null ? row.avg.toFixed(1) : '',
        row.status,
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `score-recap-${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const handleLogoutClick = () => setLogoutModal(true);

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:8000/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
      setLogoutModal(false);
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogoutClick} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span>Assessment</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Score Recap</span>
            </div>
          </div>
          <div style={s.content}><p>Loading...</p></div>
        </main>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } @keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; }`}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogoutClick} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Assessment</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Score Recap</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Score Recap</h1>
          <p style={s.subtitle}>Average score is auto-calculated from individual competency scores. Each intern's score is recorded independently regardless of team enrollment.</p>

          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              ❌ {error}
            </div>
          )}

          <div style={s.card}>
            {/* Card Header */}
            <div style={{ ...s.ch, flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px", justifyContent: "center" }}>
              <div style={s.ct}>Intern Score Recap</div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Search Bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                  padding: "7px 14px", width: "260px",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit" }}
                  />
                  {search && (
                    <span onClick={() => setSearch("")} style={{ cursor: "pointer", color: "#94a3b8", fontSize: "16px", lineHeight: 1 }}>×</span>
                  )}
                </div>
                <button onClick={handleExportCSV} style={s.btnOutline}>Export CSV</button>
              </div>
            </div>

            {/* Table */}
            <table style={s.table}>
              <colgroup>
                <col style={{ width: "17%" }} /><col style={{ width: "13%" }} /><col style={{ width: "17%" }} />
                <col style={{ width: "8%" }} /><col style={{ width: "12%" }} /><col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} /><col style={{ width: "12%" }} />
              </colgroup>
              <thead style={s.thead}>
                <tr>
                  <th style={s.th}>INTERN</th><th style={s.th}>POSITION</th><th style={s.th}>PROGRAM</th>
                  <th style={s.th}>TYPE</th><th style={s.th}>COMPETENCIES</th><th style={s.th}>TOTAL HRS</th>
                  <th style={s.th}>AVG SCORE</th><th style={s.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      <div style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      <div style={{ marginTop: "10px" }}>Searching...</div>
                    </td>
                  </tr>
                ) : recapData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                      {search ? `No results for "${search}"` : "No scores recorded yet."}
                    </td>
                  </tr>
                ) : (
                  recapData.map((row, i) => (
                    <tr key={i}>
                      <td style={{...s.td, textAlign: "left"}}><span style={s.cname}>{row.name}</span></td>
                      <td style={s.td}>{row.position}</td>
                      <td style={s.td}>{row.program}</td>
                      <td style={s.td}><span style={s.typeBadge(row.type === "Team")}>{row.type}</span></td>
                      <td style={s.td}>{row.scored}</td>
                      <td style={s.td}>{row.hours}</td>
                      <td style={s.td}>
                        {row.avg != null
                          ? <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{row.avg.toFixed(1)}</span>
                          : <span style={{ color: "#94a3b8" }}>—</span>}
                      </td>
                      <td style={s.td}><span style={s.badge(row.statusBg, row.statusColor)}>{row.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

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
    </div>
  );
}