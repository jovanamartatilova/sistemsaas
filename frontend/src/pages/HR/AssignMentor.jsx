import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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

const sb = {
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: "172px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 100 },
  logo: { display: "flex", alignItems: "center", gap: "8px", padding: "18px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logoBadge: { width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
  logoText: { fontSize: "13px", fontWeight: 700, color: "#fff" },
  nav: { flex: 1, padding: "10px 8px", overflowY: "auto" },
  section: { marginBottom: "14px" },
  sectionLabel: { display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: "#475569", padding: "0 8px", marginBottom: "4px", textTransform: "uppercase", textAlign: "left" },
  item: (active) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 8px", border: "none", background: active ? "rgba(59,130,246,0.18)" : "transparent", color: active ? "#60a5fa" : "#94a3b8", fontSize: "12.5px", borderRadius: "6px", cursor: "pointer", textDecoration: "none", fontFamily: "inherit", textAlign: "left" }),
  badge: { background: "#3b82f6", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" },
  footer: { display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  avatar: { width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 },
};

function SidebarHR() {
  const location = useLocation();
  return (
    <aside style={sb.sidebar}>
      <div style={sb.logo}>
        <div style={sb.logoBadge}>EP</div>
        <span style={sb.logoText}>EarlyPath</span>
      </div>
      <nav style={sb.nav}>
        {[["MENU", navItems.menu], ["SELECTION", navItems.selection], ["ADMINISTRATION", navItems.administration]].map(([label, items]) => (
          <div key={label} style={sb.section}>
            <span style={sb.sectionLabel}>{label}</span>
            {items.map((item) => (
              <Link key={item.key} to={item.key} style={sb.item(location.pathname === item.key)}>
                <span>{item.label}</span>
                {item.badge && <span style={sb.badge}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div style={sb.footer}>
        <div style={sb.avatar}>HR</div>
        <div>
          <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#e2e8f0", display: "block" }}>Admin HR</span>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>earlypath.id</span>
        </div>
      </div>
    </aside>
  );
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const MENTORS = [
  { id: 1, name: "Dr. Eko Prasetyo", expertise: ["Backend Dev", "Data Analyst"], activeInterns: 3, capacity: 6 },
  { id: 2, name: "Rini Handayani", expertise: ["UI Designer", "Frontend Dev"], activeInterns: 4, capacity: 6 },
  { id: 3, name: "Wahyu Nugroho", expertise: ["Backend Dev", "Frontend Dev"], activeInterns: 2, capacity: 5 },
  { id: 4, name: "Siska Amalia", expertise: ["UI Designer"], activeInterns: 1, capacity: 4 },
];

const INITIAL_ACCEPTED = [
  { id: 1, name: "Budi Santoso", email: "budi@gmail.com", position: "Backend Dev", program: "Regular Batch 3", type: "Team", mentorId: 1 },
  { id: 2, name: "Dian Purnama", email: "dian@email.com", position: "Backend Dev", program: "Regular Batch 3", type: "Team", mentorId: 1 },
  { id: 3, name: "Nisa Rahmah", email: "nisa@email.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", mentorId: 2 },
  { id: 4, name: "Rizki Hakim", email: "rizki@email.com", position: "Data Analyst", program: "Independent", type: "Individual", mentorId: null },
  { id: 5, name: "Citra Ayu", email: "citra@gmail.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", mentorId: null },
  { id: 6, name: "Hendra Wijaya", email: "hendra@email.com", position: "Backend Dev", program: "Regular Batch 3", type: "Individual", mentorId: null },
  { id: 7, name: "Sari Dewi", email: "sari@yahoo.com", position: "UI Designer", program: "Flagship Batch 2", type: "Individual", mentorId: null },
  { id: 8, name: "Fajar Nugroho", email: "fajar@email.com", position: "Frontend Dev", program: "Regular Batch 3", type: "Team", mentorId: 3 },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
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

  // stat cards
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  stat: { background: "#fff", borderRadius: "12px", padding: "18px 20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  statLabel: { fontSize: "13px", fontWeight: 600, color: "#64748b" },
  statBadge: (bg, color) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: bg, color }),
  statVal: { fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1, marginBottom: "4px" },
  statBar: { height: "3px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", margin: "8px 0" },
  statFill: (w, c) => ({ height: "100%", borderRadius: "10px", width: w, background: c }),
  statSub: { fontSize: "11px", color: "#94a3b8" },

  // layout
  layout: { display: "grid", gridTemplateColumns: "1fr 296px", gap: "16px" },

  // main table card
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  cemail: { fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" },
  typeBadge: (isTeam) => ({ fontSize: "11px", color: isTeam ? "#1e40af" : "#334155", background: isTeam ? "#dbeafe" : "#f1f5f9", padding: "2px 8px", borderRadius: "5px", display: "inline-block" }),

  // mentor select inside table
  mentorSelect: (assigned) => ({
    width: "100%", padding: "6px 8px", border: `1px solid ${assigned ? "#c4b5fd" : "#e2e8f0"}`,
    borderRadius: "7px", fontSize: "12px", color: assigned ? "#7c3aed" : "#94a3b8",
    background: assigned ? "#f5f3ff" : "#f8fafc", outline: "none", fontFamily: "inherit",
    cursor: "pointer",
  }),

  // save button per row
  btnSave: { padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "none", background: "#2563eb", color: "#fff", fontFamily: "inherit", whiteSpace: "nowrap" },
  btnSaved: { padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "default", border: "none", background: "#dcfce7", color: "#166534", fontFamily: "inherit", whiteSpace: "nowrap" },
  btnOutline: { padding: "7px 14px", background: "#fff", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },

  // right panel — mentor cards
  mentorPanel: { display: "flex", flexDirection: "column", gap: "12px" },
  mentorCard: (selected) => ({
    background: "#fff", borderRadius: "12px", border: `1.5px solid ${selected ? "#8b5cf6" : "#e2e8f0"}`,
    padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer",
    transition: "border-color .15s",
  }),
  mentorCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" },
  mentorName: { fontSize: "13px", fontWeight: 700, color: "#0f172a" },
  capacityBadge: (full) => ({ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "10px", background: full ? "#fee2e2" : "#dcfce7", color: full ? "#991b1b" : "#166534" }),
  mentorExpertise: { display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "8px" },
  expertTag: { fontSize: "10px", padding: "2px 7px", borderRadius: "5px", background: "#f1f5f9", color: "#475569" },
  capacityBar: { height: "4px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "4px" },
  capacityFill: (pct, full) => ({ height: "100%", borderRadius: "10px", width: `${pct}%`, background: full ? "#ef4444" : "#8b5cf6" }),
  capacityText: { fontSize: "10.5px", color: "#94a3b8" },

  // modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" },
  modalSub: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  modalField: { marginBottom: "14px" },
  modalLabel: { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" },
  modalSelect: { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#f8fafc", outline: "none", fontFamily: "inherit" },
  modalNote: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", lineHeight: 1.6 },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" },
  btnCancel: { padding: "8px 18px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnConfirm: { padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function AssignMentorHR() {
  const [interns, setInterns] = useState(INITIAL_ACCEPTED);
  const [saved, setSaved] = useState({}); // tracks which rows are in "saved" state
  const [selectedMentorFilter, setSelectedMentorFilter] = useState(null); // highlight mentor card
  const [modal, setModal] = useState(null); // { intern } for confirm modal
  const [pendingMentorId, setPendingMentorId] = useState(null);

  const getMentor = (id) => MENTORS.find((m) => m.id === id);

  const handleMentorChange = (internId, mentorId) => {
    setInterns((prev) => prev.map((i) => i.id === internId ? { ...i, mentorId: mentorId ? Number(mentorId) : null } : i));
    setSaved((prev) => ({ ...prev, [internId]: false }));
  };

  const openConfirm = (intern) => {
    if (!intern.mentorId) return;
    setPendingMentorId(intern.mentorId);
    setModal(intern);
  };

  const confirmAssign = () => {
    setSaved((prev) => ({ ...prev, [modal.id]: true }));
    setModal(null);
  };

  // derived stats
  const assignedCount = interns.filter((i) => i.mentorId !== null).length;
  const unassignedCount = interns.filter((i) => i.mentorId === null).length;

  // mentor load for right panel
  const mentorLoad = (mentorId) => interns.filter((i) => i.mentorId === mentorId).length;

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; } select { appearance: auto; }`}</style>
      <SidebarHR />
      <main style={s.main}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Administration</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Assign Mentor</span>
          </div>
          <div style={s.topbarDate}>Sun, 17 Mar 2026</div>
        </div>

        <div style={s.content}>
          <h1 style={s.h1}>Assign Mentor</h1>
          <p style={s.subtitle}>Assign a mentor to each accepted intern. Each intern is assigned individually — even team members can have different mentors.</p>

          {/* Stat cards */}
          <div style={s.grid4}>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Total Accepted</span></div>
              <div style={s.statVal}>{interns.length}</div>
              <div style={s.statBar}><div style={s.statFill("100%", "#3b82f6")} /></div>
              <div style={s.statSub}>Ready to be assigned</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Assigned</span><span style={s.statBadge("#dcfce7", "#166534")}>Done</span></div>
              <div style={s.statVal}>{assignedCount}</div>
              <div style={s.statBar}><div style={s.statFill(`${Math.round((assignedCount / interns.length) * 100)}%`, "#22c55e")} /></div>
              <div style={s.statSub}>Mentor confirmed</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Unassigned</span><span style={s.statBadge("#fef9c3", "#92400e")}>Pending</span></div>
              <div style={s.statVal}>{unassignedCount}</div>
              <div style={s.statBar}><div style={s.statFill(`${Math.round((unassignedCount / interns.length) * 100)}%`, "#f59e0b")} /></div>
              <div style={s.statSub}>Needs assignment</div>
            </div>
            <div style={s.stat}>
              <div style={s.statTop}><span style={s.statLabel}>Active Mentors</span></div>
              <div style={s.statVal}>{MENTORS.length}</div>
              <div style={s.statBar}><div style={s.statFill("100%", "#8b5cf6")} /></div>
              <div style={s.statSub}>Available to assign</div>
            </div>
          </div>

          <div style={s.layout}>
            {/* Main table */}
            <div style={s.card}>
              <div style={s.ch}>
                <div>
                  <div style={s.ct}>Accepted Interns</div>
                  <div style={s.cs}>Select a mentor for each intern, then click Assign to confirm</div>
                </div>
                <button style={s.btnOutline} onClick={() => {
                  // quick-assign all unassigned to first compatible mentor
                  setInterns((prev) => prev.map((intern) => {
                    if (intern.mentorId) return intern;
                    const match = MENTORS.find((m) => m.expertise.includes(intern.position) && mentorLoad(m.id) < m.capacity);
                    return match ? { ...intern, mentorId: match.id } : intern;
                  }));
                }}>
                  Auto-assign Unassigned
                </button>
              </div>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "22%" }} /><col style={{ width: "13%" }} /><col style={{ width: "16%" }} />
                  <col style={{ width: "9%" }} /><col style={{ width: "26%" }} /><col style={{ width: "14%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>INTERN</th><th style={s.th}>POSITION</th><th style={s.th}>PROGRAM</th>
                    <th style={s.th}>TYPE</th><th style={s.th}>ASSIGN MENTOR</th><th style={s.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {interns.map((intern) => {
                    const isSaved = saved[intern.id];
                    return (
                      <tr key={intern.id}>
                        <td style={s.td}><span style={s.cname}>{intern.name}</span><span style={s.cemail}>{intern.email}</span></td>
                        <td style={s.td}>{intern.position}</td>
                        <td style={s.td}>{intern.program}</td>
                        <td style={s.td}><span style={s.typeBadge(intern.type === "Team")}>{intern.type}</span></td>
                        <td style={s.td}>
                          <select
                            style={s.mentorSelect(!!intern.mentorId)}
                            value={intern.mentorId || ""}
                            onChange={(e) => handleMentorChange(intern.id, e.target.value)}
                            disabled={isSaved}
                          >
                            <option value="">— Select mentor —</option>
                            {MENTORS.map((m) => {
                              const load = mentorLoad(m.id);
                              const full = load >= m.capacity;
                              const compatible = m.expertise.includes(intern.position);
                              return (
                                <option key={m.id} value={m.id} disabled={full && intern.mentorId !== m.id}>
                                  {m.name}{compatible ? " ✓" : ""}{full ? " (Full)" : ` (${load}/${m.capacity})`}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td style={s.td}>
                          {isSaved ? (
                            <button style={s.btnSaved} onClick={() => setSaved((p) => ({ ...p, [intern.id]: false }))}>
                              Assigned
                            </button>
                          ) : (
                            <button
                              style={{ ...s.btnSave, opacity: intern.mentorId ? 1 : 0.4, cursor: intern.mentorId ? "pointer" : "not-allowed" }}
                              onClick={() => intern.mentorId && openConfirm(intern)}
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right panel — mentor cards */}
            <div style={s.mentorPanel}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>Mentor Overview</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>Current load & capacity</div>
              {MENTORS.map((mentor) => {
                const load = mentorLoad(mentor.id);
                const pct = Math.round((load / mentor.capacity) * 100);
                const full = load >= mentor.capacity;
                return (
                  <div
                    key={mentor.id}
                    style={s.mentorCard(selectedMentorFilter === mentor.id)}
                    onClick={() => setSelectedMentorFilter(selectedMentorFilter === mentor.id ? null : mentor.id)}
                  >
                    <div style={s.mentorCardTop}>
                      <div style={s.mentorName}>{mentor.name}</div>
                      <span style={s.capacityBadge(full)}>{full ? "Full" : `${load}/${mentor.capacity}`}</span>
                    </div>
                    <div style={s.mentorExpertise}>
                      {mentor.expertise.map((e) => <span key={e} style={s.expertTag}>{e}</span>)}
                    </div>
                    <div style={s.capacityBar}><div style={s.capacityFill(pct, full)} /></div>
                    <div style={s.capacityText}>{load} intern assigned · {mentor.capacity - load} slot remaining</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Confirm modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>Confirm Mentor Assignment</div>
            <div style={s.modalSub}>Please review before confirming.</div>

            <div style={s.modalField}>
              <label style={s.modalLabel}>Intern</label>
              <div style={s.modalNote}>
                <strong>{modal.name}</strong><br />
                {modal.position} &nbsp;·&nbsp; {modal.program} &nbsp;·&nbsp; {modal.type}
              </div>
            </div>

            <div style={s.modalField}>
              <label style={s.modalLabel}>Assigned Mentor</label>
              <div style={s.modalNote}>
                {(() => {
                  const m = getMentor(modal.mentorId);
                  const load = mentorLoad(m.id);
                  return (
                    <>
                      <strong>{m.name}</strong><br />
                      Expertise: {m.expertise.join(", ")}<br />
                      Current load: {load}/{m.capacity} interns
                    </>
                  );
                })()}
              </div>
            </div>

            <div style={{ fontSize: "12px", color: "#64748b", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 12px", lineHeight: 1.6 }}>
              Once assigned, the mentor will be notified and will be able to access this intern's assessment data.
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setModal(null)}>Cancel</button>
              <button style={s.btnConfirm} onClick={confirmAssign}>Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}