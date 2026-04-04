import { Link, useLocation } from "react-router-dom";

// ============ STYLES ============
const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b" },
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
  logoBadge: { width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },sidebarLogo: {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  padding: "14px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.08)"
},

logoImage: {
  height: "50px",
  width: "auto",        // 🔥 jangan fixed width dulu
  minWidth: "50px",     // 🔥 biar ga jadi titik
  objectFit: "contain",
  display: "block"
},
logoText: {
  fontSize: "14px",
  fontWeight: 700,
  color: "#fff",
  lineHeight: "1"
},
  sidebarNav: { flex: 1, padding: "10px 8px", overflowY: "auto" },
  navSection: { marginBottom: "14px" },
navLabel: {
  display: "block",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: "#475569",
  padding: "0 8px",
  marginBottom: "4px",
  textTransform: "uppercase",
  textAlign: "left" // 🔥 ini yang bikin rata kiri
},
  navItem: (active) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", border: "none", background: active ? "rgba(59,130,246,0.18)" : "transparent", color: active ? "#60a5fa" : "#94a3b8", fontSize: "12.5px", borderRadius: "6px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit", textAlign: "left" }),
  navBadge: { background: "#3b82f6", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" },
  sidebarUser: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  userAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  main: { marginLeft: "172px", flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50 },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  breadcrumbSep: { color: "#cbd5e1" },
  breadcrumbActive: { color: "#1e293b", fontWeight: 600 },
  topbarRight: { display: "flex", alignItems: "center", gap: "10px" },
  searchBox: { display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: "12px", color: "#334155", width: "120px", fontFamily: "inherit" },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statValue: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBarTrack: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statBarFill: (width, bg) => ({ height: "100%", borderRadius: "10px", width, background: bg }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  headerActions: { display: "flex", gap: "8px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", overflow: "hidden" },
  candidateName: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  candidateEmail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  statusBadge: (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  statusDot: (bg) => ({ width: "6px", height: "6px", borderRadius: "50%", background: bg, flexShrink: 0 }),
  actions: { display: "flex", gap: "5px", alignItems: "center" },
  btnAction: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnAccept: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnReject: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #fca5a5", background: "#fff1f2", color: "#dc2626", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnLoa: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnOutline: { padding: "7px 14px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};

const navItems = {
  menu: [{ key: "/hr/dashboard", label: "Dashboard" }],
  selection: [
    { key: "/hr/kandidate", label: "Candidates", badge: 12 },
    { key: "/hr/screening", label: "Screening" },
    { key: "/hr/wawancara", label: "Interview" },
  ],
  administration: [
    { key: "/hr/generate-loa", label: "Generate LoA" },
    { key: "/hr/payroll", label: "Payroll" },
  ],
};

function SidebarHR() {
  const location = useLocation();
  return (
    <aside style={s.sidebar}>
<div style={s.sidebarLogo}>
  <div style={{ display: "flex", alignItems: "center" }}>
    <img src="/assets/images/logo.png" style={s.logoImage} />
  </div>
  <span style={s.logoText}>EarlyPath</span>
</div>
      <nav style={s.sidebarNav}>
        {Object.entries({ "MENU": navItems.menu, "SELECTION": navItems.selection, "ADMINISTRATION": navItems.administration }).map(([label, items]) => (
          <div key={label} style={s.navSection}>
            <span style={s.navLabel}>{label}</span>
            {items.map((item) => (
              <Link key={item.key} to={item.key} style={s.navItem(location.pathname === item.key)}>
                <span>{item.label}</span>
                {item.badge && <span style={s.navBadge}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={s.sidebarUser}>
        <div style={s.userAvatar}>HR</div>
        <div>
          <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#e2e8f0", display: "block" }}>Admin HR</span>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>earlypath.id</span>
        </div>
      </div>
    </aside>
  );
}

// ============ DATA ============
const statCards = [
  { value: 84, label: "Total Applicants", badge: "+14", badgeBg: "#dbeafe", badgeColor: "#1e40af", sub: "12 new this week", barColor: "#3b82f6", barWidth: "60%" },
  { value: 28, label: "Unprocessed", badge: null, sub: "Needs follow-up", barColor: "#f59e0b", barWidth: "34%" },
  { value: 31, label: "Accepted", badge: "+5", badgeBg: "#dcfce7", badgeColor: "#166534", sub: "Acceptance rate 36.9%", barColor: "#22c55e", barWidth: "37%" },
  { value: 18, label: "Rejected", badge: null, sub: "From total applicants", barColor: "#ef4444", barWidth: "21%" },
];

const candidates = [
  { name: "Andi Pratama", email: "andi@gmail.com", position: "Frontend Dev", program: "Regular Batch 3", type: "Individual", status: "Screening", statusBg: "#fef9c3", statusColor: "#92400e", dot: "#f59e0b", date: "14 Mar 2026", showAccept: true, showReject: true },
  { name: "Sari Dewi", email: "sari@yahoo.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", status: "Interview", statusBg: "#f3e8ff", statusColor: "#6b21a8", dot: "#a855f7", date: "13 Mar 2026", showAccept: true, showReject: true },
  { name: "Budi Santoso", email: "budi@gmail.com", position: "Backend Dev", program: "Regular Batch 3", type: "Team", status: "Accepted", statusBg: "#dcfce7", statusColor: "#166534", dot: "#22c55e", date: "12 Mar 2026", showLoa: true },
  { name: "Rizki Hakim", email: "rizki@email.com", position: "Data Analyst", program: "Independent", type: "Individual", status: "Applied", statusBg: "#dbeafe", statusColor: "#1e40af", dot: "#3b82f6", date: "15 Mar 2026", showAccept: true, showReject: true },
  { name: "Maya Lestari", email: "maya@gmail.com", position: "Product Manager", program: "Flagship Batch 2", type: "Individual", status: "Rejected", statusBg: "#fee2e2", statusColor: "#991b1b", dot: "#ef4444", date: "11 Mar 2026" },
  { name: "Dian Purnama", email: "dian@email.com", position: "Backend Dev", program: "Regular Batch 3", type: "Team", status: "Accepted", statusBg: "#dcfce7", statusColor: "#166534", dot: "#22c55e", date: "12 Mar 2026", showLoa: true },
  { name: "Fajar Nugroho", email: "fajar@email.com", position: "Frontend Dev", program: "Regular Batch 3", type: "Team", status: "Screening", statusBg: "#fef9c3", statusColor: "#92400e", dot: "#f59e0b", date: "15 Mar 2026", showAccept: true, showReject: true },
  { name: "Nisa Rahmah", email: "nisa@email.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", status: "Interview", statusBg: "#f3e8ff", statusColor: "#6b21a8", dot: "#a855f7", date: "13 Mar 2026", showAccept: true, showReject: true },
  { name: "Hendra Wijaya", email: "hendra@email.com", position: "Backend Dev", program: "Regular Batch 3", type: "Individual", status: "Applied", statusBg: "#dbeafe", statusColor: "#1e40af", dot: "#3b82f6", date: "16 Mar 2026", showAccept: true, showReject: true },
];

// ============ PAGE ============
export default function CandidatesHR() {
  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.breadcrumb}>
            <span>Candidate</span>
          </div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}><input style={s.searchInput} placeholder="Search..." /></div>
            <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
          </div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Candidates</h1>
          <p style={s.subtitle}>All applicants who have registered for active positions.</p>

          <div style={s.statGrid}>
            {statCards.map((card, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}>
                  <span style={s.statLabel}>{card.label}</span>
                  {card.badge && <span style={s.statBadge(card.badgeBg, card.badgeColor)}>{card.badge}</span>}
                </div>
                <div style={s.statValue}>{card.value}</div>
                <div style={s.statBarTrack}><div style={s.statBarFill(card.barWidth, card.barColor)} /></div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <div style={s.cardTitle}>Candidate List</div>
                <div style={s.cardSubtitle}>Click View CV to see details and documents</div>
              </div>
              <div style={s.headerActions}>
                <button style={s.btnOutline}>Export CSV</button>
              </div>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "17%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>CANDIDATE</th>
                    <th style={s.th}>POSITION</th>
                    <th style={s.th}>PROGRAM</th>
                    <th style={s.th}>TYPE</th>
                    <th style={s.th}>STATUS</th>
                    <th style={s.th}>APPLIED DATE</th>
                    <th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={i}>
                      <td style={s.td}><span style={s.candidateName}>{c.name}</span><span style={s.candidateEmail}>{c.email}</span></td>
                      <td style={s.td}>{c.position}</td>
                      <td style={s.td}>{c.program}</td>
                      <td style={s.td}>{c.type}</td>
                      <td style={s.td}>
                        <span style={s.statusBadge(c.statusBg, c.statusColor)}>
                          <span style={s.statusDot(c.dot)} />{c.status}
                        </span>
                      </td>
                      <td style={s.td}>{c.date}</td>
                      <td style={s.td}>
                        <div style={s.actions}>
                          {c.showAccept && <button style={s.btnAccept}>Accept</button>}
                          {c.showReject && <button style={s.btnReject}>Reject</button>}
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