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
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statValue: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBarTrack: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statBarFill: (width, bg) => ({ height: "100%", borderRadius: "10px", width, background: bg }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  pageLayout: { display: "grid", gridTemplateColumns: "1fr", gap: "16px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"},
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: {
  padding: "12px 14px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
},

td: {
  padding: "12px 14px",
  fontSize: "13px",
  color: "#334155",
  borderBottom: "1px solid #f1f5f9",
   display: "table-cell",
},
  candidateName: {
  fontWeight: 600,
  color: "#0f172a",
  fontSize: "13px",
  display: "block",
  lineHeight: "1.2"
},

candidateEmail: {
  fontSize: "11px",
  color: "#94a3b8",
  display: "block",
  lineHeight: "1.2",
  marginTop: "2px"
},
  miniBadge: (bg, color) => ({ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  actions: { display: "flex", gap: "6px", alignItems: "center" },
  btnAction: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnGenerate: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnDownload: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  previewCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px", alignSelf: "start" },
  loaDoc: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", fontSize: "12px", lineHeight: 1.9 },
  loaTitle: { fontSize: "14px", fontWeight: 700, textAlign: "center", marginBottom: "4px", display: "block" },
  loaNo: { fontSize: "11px", color: "#94a3b8", textAlign: "center", display: "block", marginBottom: "14px" },
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const navItems = {
  menu: [{ key: "/hr/dashboard", label: "Dashboard" }],
  selection: [
    { key: "/hr/kandidate", label: "Candidates", badge: 12 },
    { key: "/hr/screening", label: "Screening" },
    { key: "/hr/wawancara", label: "Interview" },
  ],
  administration: [
    { key: "/hr/assign-mentor", label: "Assign Mentor" },
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
  { value: 31, label: "Accepted Candidates", sub: "Eligible for LoA", barColor: "#3b82f6", barWidth: "65%" },
  { value: 18, label: "LoA Generated", sub: "Already created", barColor: "#22c55e", barWidth: "40%" },
  { value: 13, label: "Pending Generation", sub: "Needs to be created", barColor: "#f59e0b", barWidth: "30%" },
];

const candidates = [
  { name: "Budi Santoso", email: "budi@gmail.com", position: "Backend Dev", program: "Regular Batch 3", type: "Team", loaStatus: "Done", loaBg: "#dcfce7", loaColor: "#166534", showPreview: true, showDownload: true },
  { name: "Dian Purnama", email: "dian@email.com", position: "Backend Dev", program: "Regular Batch 3", type: "Team", loaStatus: "Pending", loaBg: "#fef9c3", loaColor: "#92400e", showGenerate: true },
  { name: "Citra Ayu", email: "citra@gmail.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", loaStatus: "Pending", loaBg: "#fef9c3", loaColor: "#92400e", showGenerate: true },
  { name: "Nisa Rahmah", email: "nisa@email.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", loaStatus: "Done", loaBg: "#dcfce7", loaColor: "#166534", showPreview: true, showDownload: true },
  { name: "Rizki Hakim", email: "rizki@email.com", position: "Data Analyst", program: "Independent", type: "Individual", loaStatus: "In Queue", loaBg: "#dbeafe", loaColor: "#1e40af", showPreview: true },
];

// ============ PAGE ============
export default function GenerateLoAHR() {
  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.breadcrumb}>
            <span>Generate LOA</span>
          </div>
          <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Generate LoA</h1>
          <p style={s.subtitle}>Create Letter of Acceptance for accepted candidates.</p>

          <div style={s.statGrid}>
            {statCards.map((card, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statTop}><span style={s.statLabel}>{card.label}</span></div>
                <div style={s.statValue}>{card.value}</div>
                <div style={s.statBarTrack}><div style={s.statBarFill(card.barWidth, card.barColor)} /></div>
                <div style={s.statSub}>{card.sub}</div>
              </div>
            ))}
          </div>

          <div style={s.pageLayout}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardTitle}>Accepted Candidates</div>
                  <div style={s.cardSubtitle}>Select candidate to generate LoA</div>
                </div>
                <button style={s.btnPrimary}>Bulk Generate</button>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead style={s.thead}>
                    <tr>
                      <th style={s.th}>CANDIDATE</th>
                      <th style={s.th}>POSITION</th>
                      <th style={s.th}>PROGRAM</th>
                      <th style={s.th}>TYPE</th>
                      <th style={s.th}>LOA STATUS</th>
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
                        <td style={s.td}><span style={s.miniBadge(c.loaBg, c.loaColor)}>{c.loaStatus}</span></td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            {c.showPreview && <button style={s.btnAction}>Preview</button>}
                            {c.showDownload && <button style={s.btnDownload}>Download</button>}
                            {c.showGenerate && <button style={s.btnGenerate}>Generate</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
}