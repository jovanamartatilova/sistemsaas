import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../../api";

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
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statValue: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBarTrack: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statBarFill: (width, bg) => ({ height: "100%", borderRadius: "10px", width, background: bg }),
  statSub: { fontSize: "11px", color: "#94a3b8" },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 268px", gap: "16px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
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
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" },
  pipelineCard: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "20px" },
  pipelineItem: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  pipelineDot: (bg) => ({ width: "8px", height: "8px", borderRadius: "50%", background: bg, flexShrink: 0 }),
  pipelineLabel: { flex: 1, fontSize: "13px", color: "#334155" },
  pipelineCount: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  pipelinePct: { fontSize: "12px", color: "#94a3b8", minWidth: "34px", textAlign: "right" },
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

const statusStyle = {
  pending:   { bg: "#dbeafe", color: "#1e40af" },
  screening: { bg: "#fef9c3", color: "#92400e" },
  interview: { bg: "#f3e8ff", color: "#6b21a8" },
  accepted:  { bg: "#dcfce7", color: "#166534" },
  rejected:  { bg: "#fee2e2", color: "#991b1b" },
};

const pipelineColor = {
  pending:   "#3b82f6",
  screening: "#f59e0b",
  interview: "#a855f7",
  accepted:  "#22c55e",
  rejected:  "#ef4444",
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

// ============ PAGE ============
export default function DashboardHR() {
  const [data, setData] = useState({
    stats: {
      total_candidates: 0,
      accepted: 0,
      interview_scheduled: 0,
      pending_review: 0,
    },
    recent_candidates: [],
    pipeline: [],
  });

  useEffect(() => {
    api('/hr/dashboard').then(res => setData(res.data));
  }, []);

  const handleAccept = async (id) => {
    await api(`/hr/candidates/${id}/accept`, { method: 'PATCH' });
    api('/hr/dashboard').then(res => setData(res.data));
  };

  const handleReject = async (id) => {
    await api(`/hr/candidates/${id}/reject`, { method: 'PATCH' });
    api('/hr/dashboard').then(res => setData(res.data));
  };

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.breadcrumb}>
            <span>Dashboard</span>
          </div>
          <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Good morning, HR!</h1>
          <p style={s.subtitle}>Summary of today's recruitment activity.</p>
          <div style={s.statGrid}>
  {[
    { value: data.stats.total_candidates,    label: "Total Candidates",      badgeBg: "#dbeafe", badgeColor: "#1e40af", barColor: "#3b82f6", barWidth: "60%" },
    { value: data.stats.accepted,            label: "Accepted",              badgeBg: "#dcfce7", badgeColor: "#166534", barColor: "#22c55e", barWidth: "37%" },
    { value: data.stats.interview_scheduled, label: "Interview Scheduled",   badgeBg: "#fef9c3", badgeColor: "#92400e", barColor: "#f59e0b", barWidth: "50%" },
    { value: data.stats.pending_review,      label: "Pending Review",        badgeBg: "#fee2e2", badgeColor: "#991b1b", barColor: "#ef4444", barWidth: "70%" },
  ].map((card, i) => (
    <div key={i} style={s.statCard}>
      <div style={s.statTop}>
        <span style={s.statLabel}>{card.label}</span>
        <span style={s.statBadge(card.badgeBg, card.badgeColor)}>{card.value ?? "—"}</span>
      </div>
      <div style={s.statValue}>{card.value ?? 0}</div>
      <div style={s.statBarTrack}>
        <div style={s.statBarFill(card.barWidth, card.barColor)} />
      </div>
    </div>
  ))}
</div>
          <div style={s.bottomGrid}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardTitle}>Recent Candidates</div>
                  <div style={s.cardSubtitle}>Applicants received today</div>
                </div>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "28%" }} />
                  </colgroup>
                  <thead style={s.thead}>
                    <tr>
                      <th style={s.th}>CANDIDATE</th>
                      <th style={s.th}>POSITION</th>
                      <th style={s.th}>STATUS</th>
                      <th style={s.th}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>

{data.recent_candidates.map((c, i) => (
  <tr key={i}>
    <td style={s.td}>
      <span style={s.candidateName}>{c.name}</span>
      <span style={s.candidateEmail}>{c.email}</span>
    </td>
    <td style={s.td}>{c.position}</td>
    <td style={s.td}>
      <span style={s.statusBadge(statusStyle[c.status]?.bg, statusStyle[c.status]?.color)}>
        {c.status}
      </span>
    </td>
    <td style={s.td}>
      <div style={s.actions}>
        {['pending','screening'].includes(c.status) && (
          <>
            <button style={s.btnAccept} onClick={() => handleAccept(c.id_submission)}>Accept</button>
            <button style={s.btnReject} onClick={() => handleReject(c.id_submission)}>Reject</button>
          </>
        )}
        {c.status === 'accepted' && (
          <button style={s.btnLoa}>Create LoA</button>
        )}
      </div>
    </td>
  </tr>
))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={s.pipelineCard}>
              <div style={{ ...s.cardTitle, marginBottom: "2px" }}>Selection Pipeline</div>
              <div style={{ ...s.cardSubtitle, marginBottom: "16px" }}>From {data.stats.total_candidates} total candidates</div>
              {data.pipeline.map((p, i) => (
  <div key={i} style={s.pipelineItem}>
    <span style={s.pipelineDot(pipelineColor[p.status])} />
    <span style={s.pipelineLabel}>{p.status}</span>
    <span style={s.pipelineCount}>{p.count}</span>
    <span style={s.pipelinePct}>{p.pct}</span>
  </div>
))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}