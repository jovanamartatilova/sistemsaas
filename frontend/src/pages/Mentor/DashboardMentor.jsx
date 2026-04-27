import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";
import { useMentorStore } from "../../stores/mentorStore";
import { SidebarMentor, MentorLoadingSpinner } from "../../components/SidebarMentor";
import { onDataRefresh } from "../../utils/dataRefresh";


// ─── STYLES ───────────────────────────────────────────────────────────────────
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
  badge: (bg, color) => ({ display: "inline-flex", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  tableWrap: { overflowX: "auto" },
  typeBadge: (isTeam) => ({ fontSize: "12px", color: isTeam ? "#1e40af" : "#334155", background: isTeam ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: "5px", display: "inline-block" }),
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" },
  stat: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statVal: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBar: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statFill: (w, c) => ({ height: "100%", borderRadius: "10px", width: w, background: c }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", textAlign: "center" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  cemail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  progWrap: { width: "80px", height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" },
  progFill: (w, c) => ({ height: "100%", borderRadius: "10px", width: w, background: c }),
  acts: { display: "flex", gap: "6px" },
  btnView: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" },
  btnScore: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #c4b5fd", background: "#f5f3ff", color: "#7c3aed", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" },
  btnPrimary: { padding: "7px 16px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  btnOutline: { padding: "7px 14px", background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};

export default function DashboardMentor() {
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);
  const [search, setSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("individual");
  const [exportDropdown, setExportDropdown] = useState(false);

  // ─── USE MENTOR STORE (caching + smart fetching) ──────────────────────────
  const { mentor, dashData, interns, recapInterns, loading, error, fetchDashboard, fetchInterns, fetchRecapInterns, backgroundFetchDashboard } = useMentorStore();

// ─── EFFECTS ─────────────────────────────────────────────────────────────────
useEffect(() => {
  // Fetch data dengan caching otomatis
  // Jika cache masih valid, pakai cache. Jika tidak, fetch baru.
  fetchDashboard();

  // Background sync saat window fokus (misal, user switch tab)
  // Jika cache masih valid: skip fetch (no loading)
  // Jika cache invalid: fetch in background tanpa trigger loading state
  const handleFocus = () => {
    console.log('[Dashboard] Window focused - checking cache validity...');
    backgroundFetchDashboard(); // ← Use background fetch, tidak trigger loading
  };
  window.addEventListener('focus', handleFocus);

  const cleanup = onDataRefresh(() => {
    console.log('Dashboard: Data refresh event received, force refetching...');
    fetchDashboard(true); // force refresh
  });

  return () => {
    window.removeEventListener('focus', handleFocus);
    cleanup();
  };
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    if (!loading) {
      fetchInterns(search);
      fetchRecapInterns(search);
    }
  }, 400);
  return () => clearTimeout(timer);
}, [search]);

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

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
      useMentorStore.setState({ mentor: null, dashData: null, interns: [], stats: null });
      useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
      setLogoutModal(false);
      navigate("/login");
    }
  };

  const handleLogout = handleLogoutClick;

const handleExportCSV = (mode = "current") => {
  try {
    const isAll = mode === "all";

    if (isAll) {
      const headers = ['Type', 'Team', 'Intern', 'Position', 'Program', 'Period', 'Avg Score', 'Status'];
      const rows = recapInterns.map(row => [
        row.type,
        row.type === "Team" ? (row.team_name ?? `Team ${(row.id_team ?? '').slice(-4)}`) : '—',
        row.name, row.position, row.program, row.period ?? '',
        row.avg != null ? row.avg.toFixed(1) : '',
        row.status,
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `score-recap-all-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const isTeam = activeTab === "team";
    const filtered = recapInterns.filter(r => r.type === (isTeam ? "Team" : "Individual"));
    const headers = isTeam
      ? ['Team', 'Member', 'Position', 'Program', 'Period', 'Average Score', 'Status']
      : ['Intern', 'Position', 'Program', 'Period', 'Competencies Scored', 'Total Hours', 'Average Score', 'Status'];
    const rows = isTeam
      ? filtered.map(row => [
          row.team_name ?? `Team ${(row.id_team ?? '').slice(-4)}`,
          row.name, row.position, row.program, row.period ?? '',
          row.avg != null ? row.avg.toFixed(1) : '', row.status,
        ])
      : filtered.map(row => [
          row.name, row.position, row.program, row.period ?? '',
          row.scored, row.hours,
          row.avg != null ? row.avg.toFixed(1) : '', row.status,
        ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `score-recap-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Failed to export CSV');
  }
};

  // Use new accurate metrics from backend - keep only 4 main cards
  const avgScore = dashData?.average_score ?? 0;
  
  const statCards = [
    { value: dashData?.total_interns ?? 0, label: "My Interns", badge: "Active", badgeBg: "#f5f3ff", badgeColor: "#7c3aed", sub: "Total active", barColor: "#8b5cf6", barWidth: "80%" },
    { value: dashData?.needs_input ?? 0, label: "Needs Input", badge: "Action", badgeBg: "#ede9fe", badgeColor: "#6d28d9", sub: "Evaluation", barColor: "#a855f7", barWidth: "45%" },
    { value: dashData?.interns_passed ?? 0, label: "Passed", badge: null, sub: "Recommended", barColor: "#22c55e", barWidth: "62%" },
    { value: dashData?.ready_for_certificate ?? 0, label: "Ready for Certificate", badge: null, sub: "For issuance", barColor: "#06b6d4", barWidth: "50%" },
  ];

  if (loading) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogout} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Overview</span>
            </div>
          </div>
          <div style={s.content}>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogout} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Overview</span>
            </div>
          </div>
          <div style={s.content}>
            <h1 style={s.h1}>Dashboard Error</h1>
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "16px", borderRadius: "8px", marginTop: "16px", fontSize: "14px" }}>
              <strong>Error:</strong> {error}
            </div>
            <button onClick={() => fetchDashboard(true)} style={{ marginTop: "16px", padding: "10px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 600 }}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } @keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; }`}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogout} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Overview</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Good morning, Mentor!</h1>
          <p style={s.subtitle}>Summary of your intern supervision today.</p>

          <div style={s.grid4}>
            {statCards.map((c, i) => (
              <div key={i} style={s.stat}>
                <div style={s.statTop}>
                  <span style={s.statLabel}>{c.label}</span>
                  {c.badge && <span style={s.statBadge(c.badgeBg, c.badgeColor)}>{c.badge}</span>}
                </div>
                <div style={s.statVal}>{c.value}</div>
                <div style={s.statBar}><div style={s.statFill(c.barWidth, c.barColor)} /></div>
                <div style={s.statSub}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={{...s.ch, flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px"}}>
              <div style={s.ct}>Active Interns</div>
              <div style={s.cs}>Each intern is scored individually regardless of team enrollment</div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "3px", marginTop: "8px" }}>
                {["individual", "team"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "6px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
                      fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
                      background: activeTab === tab ? "#fff" : "transparent",
                      color: activeTab === tab ? "#0f172a" : "#64748b",
                      boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab === "individual" ? "Individual" : "Team"}
                  </button>
                ))}
              </div>

              {/* Search + Export */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                  padding: "7px 14px", width: "260px",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ position: "relative" }}>
  <button
    onClick={() => setExportDropdown(v => !v)}
    style={{ ...s.btnOutline, display: "flex", alignItems: "center", gap: "6px" }}
  >
    Export CSV
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  {exportDropdown && (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 99 }}
        onClick={() => setExportDropdown(false)}
      />
      <div style={{
        position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: "180px", overflow: "hidden",
      }}>
        <button
          onClick={() => { handleExportCSV("current"); setExportDropdown(false); }}
          style={{ width: "100%", padding: "10px 16px", border: "none", background: "transparent",
            textAlign: "left", fontSize: "13px", color: "#334155", cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          Export Current Tab
        </button>
        <div style={{ height: "1px", background: "#f1f5f9" }} />
        <button
          onClick={() => { handleExportCSV("all"); setExportDropdown(false); }}
          style={{ width: "100%", padding: "10px 16px", border: "none", background: "transparent",
            textAlign: "left", fontSize: "13px", color: "#334155", cursor: "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export All
        </button>
      </div>
    </>
  )}
</div>
              </div>
            </div>

            <div style={s.tableWrap}>
              {activeTab === "individual" ? (
                // ─── INDIVIDUAL TABLE ───────────────────────────────────────────
                <table style={s.table}>
                  <colgroup>
                    <col style={{ width: "20%" }} /><col style={{ width: "15%" }} />
                    <col style={{ width: "20%" }} /><col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} /><col style={{ width: "15%" }} />
                  </colgroup>
                  <thead style={s.thead}>
                    <tr>
                      <th style={s.th}>INTERN</th>
                      <th style={s.th}>POSITION</th>
                      <th style={s.th}>PROGRAM</th>
                      <th style={s.th}>PERIOD</th>
                      <th style={s.th}>AVG SCORE</th>
                      <th style={s.th}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recapInterns.filter(r => r.type === "Individual").length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                          No individual interns found.
                        </td>
                      </tr>
                    ) : (
                      recapInterns.filter(r => r.type === "Individual").slice(0, 4).map((row, i) => (
                        <tr key={i}>
                          <td style={{...s.td, textAlign: "left"}}><span style={s.cname}>{row.name}</span></td>
                          <td style={s.td}>{row.position}</td>
                          <td style={s.td}>{row.program}</td>
                          <td style={s.td}>{row.period}</td>
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
              ) : (
                // ─── TEAM TABLE ─────────────────────────────────────────────────
              (() => {
                const teamMap = {};
                recapInterns.filter(r => r.type === "Team").forEach(row => {
                  const key = row.id_team || "unknown";
                  if (!teamMap[key]) teamMap[key] = [];
                  teamMap[key].push(row);
                });
                const teams = Object.entries(teamMap);

                return (
                  <table style={{ ...s.table, tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "17%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "11%" }} />
                    </colgroup>
                    <thead style={s.thead}>
                      <tr>
                        <th style={s.th}>TEAM</th>
                        <th style={s.th}>MEMBER</th>
                        <th style={s.th}>POSITION</th>
                        <th style={s.th}>PROGRAM</th>
                        <th style={s.th}>PERIOD</th>      {/* ← tambah */}
                        <th style={s.th}>AVG SCORE</th>
                        <th style={s.th}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                            No team interns found.
                          </td>
                        </tr>
                      ) : (
                        teams.map(([teamId, members]) =>
                          members.map((row, j) => (
                            <tr key={`${teamId}-${j}`}>
                              {j === 0 && (
                                <td
                                  rowSpan={members.length}
                                  style={{
                                    ...s.td, textAlign: "center", verticalAlign: "middle",
                                    fontWeight: 700, color: "#1e40af", background: "#eff6ff",
                                    borderRight: "1px solid #e2e8f0",
                                  }}
                                >
                                  {/* ← pakai team_name dari backend */}
                                  <span style={{ fontSize: "12px", color: "#1e40af", background: "#dbeafe", padding: "3px 8px", borderRadius: "5px" }}>
                                    {row.team_name ?? `Team ${teamId.slice(-4)}`}
                                  </span>
                                </td>
                              )}
                              <td style={{...s.td, textAlign: "left"}}><span style={s.cname}>{row.name}</span></td>
                              <td style={s.td}>{row.position}</td>
                              <td style={s.td}>{row.program}</td>
                              <td style={s.td}>{row.period ?? '—'}</td>    {/* ← tambah */}
                              <td style={s.td}>
                                {row.avg != null
                                  ? <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{row.avg.toFixed(1)}</span>
                                  : <span style={{ color: "#94a3b8" }}>—</span>}
                              </td>
                              <td style={s.td}>
                                <span style={s.badge(row.statusBg, row.statusColor)}>{row.status}</span>
                              </td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                );
              })()
              )}
            </div>
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