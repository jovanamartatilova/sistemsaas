import { useState } from "react";
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
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "24px" },
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
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", overflow: "hidden" },
  candidateName: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  candidateEmail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  actions: { display: "flex", gap: "6px", alignItems: "center" },
  btnAction: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#334155", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnLoa: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", whiteSpace: "nowrap", fontFamily: "inherit" },
  btnPrimary: { padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  resultSelect: (bg, color) => ({ padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, border: `1px solid ${bg === "#f1f5f9" ? "#e2e8f0" : bg}`, background: bg, color, cursor: "pointer", outline: "none", fontFamily: "inherit" }),
  // Edit modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "480px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  modalSubtitle: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  modalField: { marginBottom: "14px" },
  modalLabel: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "5px" },
  modalInput: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  modalSelect: { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  modalRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" },
  btnOutline: { padding: "8px 18px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnSave: { padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
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
  { value: 5, label: "Today's Interviews", badge: "Today", badgeBg: "#dcfce7", badgeColor: "#166534", sub: "Schedule confirmed", barColor: "#3b82f6", barWidth: "45%" },
  { value: 7, label: "Pending Schedule", badge: null, sub: "Need to be scheduled", barColor: "#f59e0b", barWidth: "35%" },
  { value: 12, label: "Completed", badge: null, sub: "Decision made", barColor: "#22c55e", barWidth: "55%" },
];

const initialSchedule = [
  { id: 1, name: "Sari Dewi", position: "UI Designer", date: "17 Mar 2026", time: "10:00", interviewer: "Mr. Eko", media: "Google Meet", link: "meet.google.com/abc-xyz", result: "pending", showLoa: false },
  { id: 2, name: "Andi Pratama", position: "Frontend Dev", date: "17 Mar 2026", time: "13:00", interviewer: "Ms. Rini", media: "Zoom", link: "zoom.us/j/12345", result: "pending", showLoa: false },
  { id: 3, name: "Hendra Wijaya", position: "Backend Dev", date: "18 Mar 2026", time: "09:00", interviewer: "Mr. Eko", media: "Offline", link: "", result: "pending", showLoa: false },
  { id: 4, name: "Nisa Rahmah", position: "UI Designer", date: "16 Mar 2026", time: "14:00", interviewer: "Ms. Rini", media: "Google Meet", link: "meet.google.com/def-uvw", result: "continue", showLoa: false },
  { id: 5, name: "Putri Ayu", position: "UI Designer", date: "18 Mar 2026", time: "14:00", interviewer: "Ms. Rini", media: "Zoom", link: "zoom.us/j/67890", result: "pending", showLoa: false },
  { id: 6, name: "Rizki Hakim", position: "Data Analyst", date: "15 Mar 2026", time: "11:00", interviewer: "Mr. Eko", media: "Offline", link: "", result: "accepted", showLoa: true },
];

const resultOptions = [
  { value: "pending", label: "Pending", bg: "#f1f5f9", color: "#64748b" },
  { value: "continue", label: "Continue", bg: "#dbeafe", color: "#1e40af" },
  { value: "accepted", label: "Accepted", bg: "#dcfce7", color: "#166534" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
];

const mediaOptions = ["Google Meet", "Zoom", "Microsoft Teams", "Offline"];

// ============ PAGE ============
export default function InterviewHR() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (row) => { setForm({ ...row }); setEditModal(row.id); };
  const saveEdit = () => { setSchedule((prev) => prev.map((j) => j.id === editModal ? { ...form } : j)); setEditModal(null); };
  const handleResultChange = (id, value) => {
    setSchedule((prev) => prev.map((j) => j.id === id ? { ...j, result: value, showLoa: value === "accepted" } : j));
  };
  const getResultStyle = (val) => resultOptions.find((o) => o.value === val) || resultOptions[0];

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarHR />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.breadcrumb}>
            <span>Interview</span>
          </div>
          <div style={s.topbarRight}>
            <div style={s.searchBox}><input style={s.searchInput} placeholder="Search..." /></div>
            <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
          </div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Interview</h1>
          <p style={s.subtitle}>Schedule and results of candidate interviews.</p>

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
                <div style={s.cardTitle}>Interview Schedule</div>
                <div style={s.cardSubtitle}>All scheduled interview sessions</div>
              </div>
              <button style={s.btnPrimary}>+ Add Schedule</button>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>CANDIDATE</th>
                    <th style={s.th}>POSITION</th>
                    <th style={s.th}>DATE &amp; TIME</th>
                    <th style={s.th}>INTERVIEWER</th>
                    <th style={s.th}>MEDIA</th>
                    <th style={s.th}>RESULT</th>
                    <th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((j) => {
                    const rs = getResultStyle(j.result);
                    return (
                      <tr key={j.id}>
                        <td style={s.td}><span style={s.candidateName}>{j.name}</span><span style={s.candidateEmail}>{j.position}</span></td>
                        <td style={s.td}>{j.position}</td>
                        <td style={s.td}>{j.date}, {j.time}</td>
                        <td style={s.td}>{j.interviewer}</td>
                        <td style={s.td}>{j.media}</td>
                        <td style={s.td}>
                          <select style={s.resultSelect(rs.bg, rs.color)} value={j.result} onChange={(e) => handleResultChange(j.id, e.target.value)}>
                            {resultOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button style={s.btnAction} onClick={() => openEdit(j)}>Edit Schedule</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editModal && (
        <div style={s.modalOverlay} onClick={() => setEditModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Edit Interview Schedule</div>
            <div style={s.modalSubtitle}>{form.name} — {form.position}</div>
            <div style={s.modalRow}>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Date</label>
                <input style={s.modalInput} type="date" onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={s.modalField}>
                <label style={s.modalLabel}>Time</label>
                <input style={s.modalInput} type="time" value={form.time || ""} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Interviewer</label>
              <input style={s.modalInput} value={form.interviewer || ""} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} placeholder="Interviewer name" />
            </div>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Media</label>
              <select style={s.modalSelect} value={form.media || ""} onChange={(e) => setForm({ ...form, media: e.target.value })}>
                {mediaOptions.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            {form.media !== "Offline" && (
              <div style={s.modalField}>
                <label style={s.modalLabel}>{form.media} Link</label>
                <input style={s.modalInput} value={form.link || ""} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder={`Paste ${form.media} link here...`} />
              </div>
            )}
            <div style={s.modalField}>
              <label style={s.modalLabel}>Notes (optional)</label>
              <textarea style={{ ...s.modalInput, minHeight: "70px", resize: "vertical" }} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnOutline} onClick={() => setEditModal(null)}>Cancel</button>
              <button style={s.btnSave} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}