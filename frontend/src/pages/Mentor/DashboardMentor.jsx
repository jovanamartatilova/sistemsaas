import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";

// ─── SHARED SIDEBAR (exported for use in all Mentor pages) ───────────────────
const navItems = {
  menu: [{ key: "/mentor/dashboard", label: "Dashboard" }],
  assessment: [
    { key: "/mentor/interns", label: "My Interns" },
    { key: "/mentor/input-score", label: "Input Score" },
    { key: "/mentor/score-recap", label: "Score Recap" },
    { key: "/mentor/competencies", label: "Competencies" },
  ],
  others: [
    { key: "/mentor/evaluation", label: "Evaluation" },
    { key: "/mentor/certificates", label: "Certificate" },
  ],
};

const sb = {
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: "8px", padding: "18px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoBadge: { width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  logoText: { fontSize: "13px", fontWeight: 700, color: "#fff" },
  nav: { flex: 1, padding: "10px 8px", overflowY: "auto" },
  section: { marginBottom: "14px" },
  sectionLabel: { display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#475569", padding: "0 8px", marginBottom: "4px", textTransform: "uppercase", textAlign: "left" },
  item: (active) => ({ display: "flex", alignItems: "center", width: "100%", padding: "7px 8px", border: "none", background: active ? "rgba(139,92,246,0.18)" : "transparent", color: active ? "#a78bfa" : "#94a3b8", fontSize: "12.5px", borderRadius: "6px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit", textAlign: "left" }),
  footer: { display: "flex", flexDirection: "column", gap: "8px", padding: "12px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  userSection: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px" },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  userInfo: { minWidth: 0, flex: 1 },
  userName: { fontSize: "11.5px", fontWeight: 600, color: "#e2e8f0", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userEmail: { fontSize: "9px", color: "#64748b", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  btnLogout: { width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "inherit", fontSize: "11px", fontWeight: 600 },
};

export function SidebarMentor({ mentor, onLogout }) {
  const location = useLocation();
  console.log('SidebarMentor rendered with mentor prop:', mentor);
  const initials = mentor?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'M';
  console.log('Calculated initials:', initials);
  
  return (
    <aside style={sb.sidebar}>
      <div style={sb.logo}>
        <img src="/assets/images/logo.png" alt="EarlyPath" style={{ height: "24px", objectFit: "contain", flexShrink: 0 }} />
        <span style={sb.logoText}>EarlyPath</span>
      </div>
      <nav style={sb.nav}>
        {[["MENU", navItems.menu], ["ASSESSMENT", navItems.assessment], ["OTHERS", navItems.others]].map(([label, items]) => (
          <div key={label} style={sb.section}>
            <span style={sb.sectionLabel}>{label}</span>
            {items.map((item) => (
              <Link key={item.key} to={item.key} style={sb.item(location.pathname === item.key)}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={sb.footer}>
        <div style={sb.userSection}>
          <div style={sb.avatar}>{initials}</div>
          <div style={sb.userInfo}>
            <span style={sb.userName}>{mentor?.name || 'Mentor'}</span>
            <span style={sb.userEmail}>{mentor?.email || 'mentor@id'}</span>
          </div>
        </div>
        <button style={sb.btnLogout} onClick={onLogout} title="Logout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
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
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
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
  th: { padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  cemail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  progWrap: { width: "80px", height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" },
  progFill: (w, c) => ({ height: "100%", borderRadius: "10px", width: w, background: c }),
  acts: { display: "flex", gap: "6px" },
  btnView: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" },
  btnScore: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #c4b5fd", background: "#f5f3ff", color: "#7c3aed", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" },
  btnPrimary: { padding: "7px 16px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
};

export default function DashboardMentor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [interns, setInterns] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting dashboard data fetch...');
      
      const [profileRes, dashRes, internsRes] = await Promise.all([
        mentorApi.getProfile(),
        mentorApi.getDashboard(),
        mentorApi.getInterns(),
      ]);
      
      console.log('Profile Response:', profileRes);
      console.log('Dashboard Response:', dashRes);
      console.log('Interns Response:', internsRes);
      
      console.log('Setting mentor data:', profileRes.data);
      setMentor(profileRes.data);
      setDashData(dashRes.data);
      setInterns(internsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMsg = 'Failed to load dashboard';
      if (error.response?.status === 403) {
        errorMsg = 'Unauthorized - You must be a mentor to access this page';
      } else if (error.response?.status === 401) {
        errorMsg = 'Session expired - Please login again';
        localStorage.clear();
        navigate('/login');
        return;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
    navigate("/login");
  };

  const statCards = [
    { value: dashData?.total_interns ?? 0, label: "My Interns", badge: "Active", badgeBg: "#f5f3ff", badgeColor: "#7c3aed", sub: "2 programs", barColor: "#8b5cf6", barWidth: "80%" },
    { value: "78.4", label: "Average Score", badge: null, sub: "Scale 0–100", barColor: "#14b8a6", barWidth: "78%" },
    { value: dashData?.in_progress ?? 0, label: "Pending Scores", badge: "Pending", badgeBg: "#fef9c3", badgeColor: "#92400e", sub: "Needs input", barColor: "#f59e0b", barWidth: "37%" },
    { value: dashData?.interns_passed ?? 0, label: "Passed", badge: null, sub: "Ready for certificate", barColor: "#22c55e", barWidth: "62%" },
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
            <button onClick={fetchDashboardData} style={{ marginTop: "16px", padding: "10px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: 600 }}>
              Try Again
            </button>
          </div>
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
            <div style={s.ch}>
              <div><div style={s.ct}>Active Interns</div><div style={s.cs}>Each intern is scored individually regardless of team enrollment</div></div>
              <Link to="/mentor/interns" style={s.btnPrimary}>View All</Link>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "26%" }} /><col style={{ width: "15%" }} /><col style={{ width: "11%" }} />
                  <col style={{ width: "30%" }} /><col style={{ width: "18%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>INTERN</th><th style={s.th}>POSITION</th><th style={s.th}>TYPE</th>
                    <th style={s.th}>AVG SCORE</th><th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {interns.slice(0, 4).map((intern, i) => (
                    <tr key={i}>
                      <td style={s.td}><span style={s.cname}>{intern.name}</span><span style={s.cemail}>{intern.email}</span></td>
                      <td style={s.td}>{intern.position}</td>
                      <td style={s.td}><span style={{ fontSize: "12px", color: intern.type === "Team" ? "#1e40af" : "#334155", background: intern.type === "Team" ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: "5px" }}>{intern.type}</span></td>
                      <td style={s.td}>{intern.avg_score !== null ? <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{Number(intern.avg_score).toFixed(1)}</span> : <span style={{ color: "#94a3b8" }}>—</span>}</td>
                      <td style={s.td}>
                        <div style={s.acts}>
                          <Link to="/mentor/interns" style={s.btnView}>Detail</Link>
                          <Link to={`/mentor/input-score?id=${intern.id_submission}`} style={s.btnScore}>Input Score</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}