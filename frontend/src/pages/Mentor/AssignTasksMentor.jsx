import { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import { SidebarMentor } from "../../components/SidebarMentor";
import { useAuthStore } from "../../stores/authStore";
import { CheckCircle, Clock, AlertCircle, MessageSquare, Send, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalendarPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [pos, setPos] = useState({ top: 0, left: 0, openUp: false });
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleOpen = () => {
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const calH = 310;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < calH + 8;
    setPos({ left: rect.left, top: openUp ? rect.top - calH - 6 : rect.bottom + 6, openUp });
    setOpen(true);
  };

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const pickDate = (d) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${year}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayValue = value
    ? (() => { const [y, m, d] = value.split('-'); return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m)-1]} ${y}`; })()
    : null;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);

  return (
    <>
      <div
        ref={triggerRef} onClick={handleOpen}
        style={{
          display: "flex", alignItems: "center",
          border: `1.5px solid ${open ? "#4f46e5" : "#cbd5e1"}`,
          borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "#fff",
          boxShadow: open ? "0 0 0 3px rgba(79,70,229,.12)" : "none", transition: "all .15s",
        }}
      >
        <div style={{ flex: 1, padding: "14px 18px", textAlign: "left", fontSize: 15, color: displayValue ? "#1e293b" : "#94a3b8", fontFamily: "inherit" }}>
          {displayValue || "Select date…"}
        </div>
        <div style={{ width: 46, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>
      {open && (
        <div ref={ref} style={{
          position: "fixed", top: pos.top, left: pos.left, zIndex: 9999,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,.16)", padding: 16, width: 290,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} style={{ width: 30, height: 30, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{MONTHS_FULL[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} style={{ width: 30, height: 30, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 2 }}>{DAYS_SHORT.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textAlign: "center", padding: "4px 0" }}>{d}</div>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const date = new Date(year, month, d);
              const isPast = date < now;
              const isToday = date.getTime() === now.getTime();
              const mm = String(month + 1).padStart(2, '0');
              const dd = String(d).padStart(2, '0');
              const isSel = value === `${year}-${mm}-${dd}`;
              return <div key={i} onClick={() => !isPast && pickDate(d)} style={{ fontSize: 12.5, textAlign: "center", padding: "6px 2px", borderRadius: 6, cursor: isPast ? "default" : "pointer", color: isSel ? "#fff" : isPast ? "#cbd5e1" : isToday ? "#4f46e5" : "#334155", background: isSel ? "#4f46e5" : "transparent", fontWeight: isSel || isToday ? 700 : 400, transition: "all .12s" }}>{d}</div>;
            })}
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b", gap: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", gap: 0, overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 },
  bc: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  bcSep: { color: "#cbd5e1" },
  bcActive: { color: "#1e293b", fontWeight: 600 },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px", flex: 1, overflowY: "auto", textAlign: "left" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, textAlign: "left" },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px", textAlign: "left" },

  headerInfo: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" },
  btnNew: { background: "#4f46e5", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "0.2s", fontFamily: "inherit" },

  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" },
  td: { padding: "14px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle", textAlign: "left" },
  cname: { fontWeight: 600, color: "#0f172a", display: "block" },
  cdesc: { fontSize: "12px", color: "#64748b", display: "block", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  typeBadge: (isTeam) => ({ fontSize: "12px", color: isTeam ? "#1e40af" : "#334155", background: isTeam ? "#dbeafe" : "#f1f5f9", padding: "3px 8px", borderRadius: "5px", display: "inline-block" }),
  statusBadge: (status) => {
    let bg = "#f1f5f9", clr = "#64748b";
    if (status === 'done') { bg = "#dcfce7"; clr = "#166534"; }
    else if (status === 'in_progress') { bg = "#fef9c3"; clr = "#92400e"; }
    else if (status === 'pending') { bg = "#e0e7ff"; clr = "#3730a3"; }
    return { fontSize: "12px", color: clr, background: bg, padding: "3px 8px", borderRadius: "20px", fontWeight: 500, display: "inline-block", textTransform: "capitalize" };
  },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  modal: { background: "#fff", width: "1200px", borderRadius: "24px", boxShadow: "0 25px 70px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" },
  mhead: { padding: "28px 32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
  mtitle: { fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 },
  mbody: { padding: "32px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" },
  mfoot: { padding: "24px 32px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f8fafc", borderRadius: "0 0 24px 24px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px", display: "block", textAlign: "left" },
  input: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", color: "#1e293b", outline: "none", transition: "all 0.2s", fontFamily: "inherit", background: "#fff", textAlign: "left" },
  select: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", color: "#1e293b", outline: "none", background: "#fff", fontFamily: "inherit", textAlign: "left" },
  textarea: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", color: "#1e293b", minHeight: "160px", resize: "vertical", outline: "none", fontFamily: "inherit", background: "#fff", textAlign: "left" },
  btnCancel: { background: "#fff", border: "1px solid #e2e8f0", color: "#64748b", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" },
  btnDraft: { background: "#f1f5f9", border: "none", color: "#475569", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" },
  btnSubmit: { background: "#4f46e5", border: "none", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }
};

export default function AssignTasksMentor() {
  const { user, logout } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [targets, setTargets] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [internInfo, setInternInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [noteMap, setNoteMap] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const [resTasks, resTargets] = await Promise.all([
        axios.get("http://localhost:8000/api/mentor/tasks", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/mentor/assign-targets", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTasks(resTasks.data.data || []);
      setTargets(resTargets.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const [formData, setFormData] = useState({ title: "", description: "", targetVal: "", deadline: "", competencyIds: [] });

  const handleOpenModal = () => {
    setFormData({ title: "", description: "", targetVal: "", deadline: "", competencyIds: [] });
    setInternInfo(null);
    setCompetencies([]);
    setModalOpen(true);
  };

  const handleTargetChange = async (val) => {
    setFormData(f => ({ ...f, targetVal: val, competencyIds: [] }));
    const target = targets.find(t => `${t.id_target}|${t.id_team || ''}` === val);
    if (!target) return;
    setInternInfo({ position: target.position, program: target.program });
    if (target.id_position) {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/mentor/competencies?id_position=${target.id_position}`, { headers: { Authorization: `Bearer ${token}` } });
      setCompetencies(res.data.data || []);
    }
  };

  const handleSubmit = async (status) => {
    if (!formData.title || !formData.targetVal || !formData.deadline) return alert("Please fill all required fields");
    setSubmitting(true);
    try {
      const targetObj = targets.find(t => `${t.id_target}|${t.id_team || ''}` === formData.targetVal);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      await axios.post("http://localhost:8000/api/mentor/tasks", {
        ...formData, id_target: targetObj.id_target, id_team: targetObj.id_team, deadline_at: formData.deadline, status
      }, { headers: { Authorization: `Bearer ${token}` } });
      setModalOpen(false);
      fetchData();
    } catch (e) { alert("Failed to create task"); } finally { setSubmitting(false); }
  };

  const handleUpdateTask = async (taskId, payload) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/mentor/tasks/${taskId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      alert("Task updated!");
    } catch (e) { alert("Failed to update"); }
  };

  if (loading) return (
  <div style={s.app}>
    <SidebarMentor mentor={user} onLogout={() => setLogoutModal(true)} />
    <main style={s.main}>
      <div style={s.topbar}>
        <div style={s.bc}><span>Dashboard</span><span style={s.bcSep}>/</span><span>Assessment</span><span style={s.bcSep}>/</span><span style={s.bcActive}>Assign Tasks</span></div>
      </div>
      <div style={s.content}><LoadingSpinner message="Loading Assign Tasks..." /></div>
    </main>
  </div>
);

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }`}</style>
      <SidebarMentor mentor={user} onLogout={() => setLogoutModal(true)} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}><span>Dashboard</span><span style={s.bcSep}>/</span><span>Assessment</span><span style={s.bcSep}>/</span><span style={s.bcActive}>Assign Tasks</span></div>
        </div>

        <div style={s.content}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h1 style={s.h1}>Assign Tasks</h1>
              <p style={s.subtitle}>Review intern submissions and delegate tasks.</p>
            </div>
            <button style={s.btnNew} onClick={handleOpenModal}><Plus size={16} /> New Task</button>
          </div>

          <div style={s.card}>
            <table style={s.table}>
              <colgroup><col style={{ width: "35%" }} /><col style={{ width: "20%" }} /><col style={{ width: "15%" }} /><col style={{ width: "15%" }} /><col style={{ width: "15%" }} /></colgroup>
              <thead style={s.thead}><tr><th style={s.th}>Task</th><th style={s.th}>Assigned To</th><th style={s.th}>Deadline</th><th style={s.th}>Type</th><th style={s.th}>Status</th></tr></thead>
              <tbody>
                {tasks.length === 0 ? <tr><td colSpan={5} style={{ padding: "40px", color: "#94a3b8" }}>No tasks created yet.</td></tr> : tasks.map(task => {
                  const isEx = expandedTask === task.id_task;
                  return (
                    <Fragment key={task.id_task}>
                      <tr style={{ cursor: "pointer", background: isEx ? "#f8fafc" : "transparent" }} onClick={() => setExpandedTask(isEx ? null : task.id_task)}>

                        <td style={s.td}><span style={s.cname}>{task.title}</span><span style={s.cdesc}>{task.description}</span></td>
                        <td style={s.td}><span style={{ fontWeight: 500 }}>{task.target_name}</span></td>
                        <td style={s.td}>{new Date(task.deadline_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={s.td}><span style={s.typeBadge(task.type === "Team")}>{task.type}</span></td>
                        <td style={s.td}><span style={s.statusBadge(task.status)}>{task.status.replace("_", " ")}</span></td>
                      </tr>
                      {isEx && (
                        <tr>
                          <td colSpan={5} style={{ background: "#f8fafc", padding: "20px 32px", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", textAlign: "left" }}>
                              {/* Team Progress / Subtasks */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Team Jobdesc & Progress</p>
                                {task.subtasks?.length > 0 ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {task.subtasks.map(st => (
                                      <div key={st.id} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "14px", borderRadius: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "24px", height: "24px", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#4f46e5" }}>{st.assignee.charAt(0)}</div>
                                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{st.assignee}</span>
                                          </div>
                                          <span style={s.statusBadge(st.status)}>{st.status.toUpperCase()}</span>
                                        </div>
                                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#334155", margin: "0 0 4px 0" }}>{st.title}</p>
                                        {st.description && <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 10px 0", fontStyle: "italic", lineHeight: "1.4" }}>{st.description}</p>}
                                        
                                        {st.work?.length > 0 && (
                                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "8px", borderTop: "1px solid #f8fafc" }}>
                                            {st.work.map((w, idx) => (
                                              <a key={idx} href={w.value} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", color: "#4f46e5", background: "#f0f0ff", padding: "2px 6px", borderRadius: "4px", textDecoration: "none" }}>{w.label}</a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : <p style={{ fontSize: "12px", color: "#94a3b8 italic" }}>No member breakdown yet.</p>}
                              </div>

                              {/* Leader Submission & Review */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Leader Submission</p>
                                {task.work_attachments?.length > 0 ? (
                                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px", spaceY: 4 }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      {task.work_attachments.map((att, i) => (
                                        <a key={i} href={att.value} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", background: "#f1f5f9", borderRadius: "6px", fontSize: "12px", color: "#4f46e5", textDecoration: "none", border: "1px solid #e2e8f0" }}>{att.label}</a>
                                      ))}
                                    </div>
                                    <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "10px" }}>Submitted: {new Date(task.submitted_at).toLocaleDateString()}</p>
                                    
                                    {/* Action Buttons */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                                      <div>
                                        <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "6px", display: "block" }}>Revision Note (Optional)</label>
                                        <textarea 
                                          style={{ ...s.textarea, minHeight: "80px", padding: "10px", fontSize: "13px" }}
                                          placeholder="Type notes for leader..."
                                          value={noteMap[task.id_task] || ""}
                                          onChange={e => setNoteMap({...noteMap, [task.id_task]: e.target.value})}
                                        />
                                      </div>
                                      <div style={{ display: "flex", gap: "10px" }}>
                                        <button 
                                          onClick={() => handleUpdateTask(task.id_task, { feedback_notes: noteMap[task.id_task], status: "in_progress" })}
                                          style={{ ...s.btnCancel, padding: "8px 16px", flex: 1 }}
                                        >
                                          Send Notes (Revision)
                                        </button>
                                        {task.status !== 'done' && (
                                          <button 
                                            onClick={() => handleUpdateTask(task.id_task, { status: "done" })}
                                            style={{ ...s.btnSubmit, padding: "8px 16px", flex: 1, background: "#059669" }}
                                          >
                                            Accept Task
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : <p style={{ fontSize: "12px", color: "#94a3b8 italic" }}>Waiting for leader to submit...</p>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal & Logout (reused) */}
      {modalOpen && (
        <div style={s.modalOverlay}><div style={s.modal}>
          <div style={s.mhead}><h2 style={s.mtitle}>Create New Task</h2><button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>&times;</button></div>
          <div style={s.mbody}>
            <div><label style={s.label}>Assign To (Intern / Team Leader)</label>
              <select style={s.select} value={formData.targetVal} onChange={(e) => handleTargetChange(e.target.value)}>
                <option value="" disabled>Select Target</option>
                {targets.map((t, idx) => <option key={idx} value={`${t.id_target}|${t.id_team || ''}`}>{t.type === 'Team' ? `${t.name} (Team: ${t.team_name})` : t.name}</option>)}
              </select>
            </div>
            {internInfo && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", textAlign: "left" }}>
              <div style={{ textAlign: "left" }}><label style={{ ...s.label, color: "#94a3b8", textAlign: "left" }}>Position</label><div style={{ ...s.input, background: "#f8fafc", color: "#64748b", textAlign: "left" }}>{internInfo.position || "—"}</div></div>
              <div style={{ textAlign: "left" }}><label style={{ ...s.label, color: "#94a3b8", textAlign: "left" }}>Program</label><div style={{ ...s.input, background: "#f8fafc", color: "#64748b", textAlign: "left" }}>{internInfo.program || "—"}</div></div>
            </div>}

            <div><label style={s.label}>Task Title</label><input type="text" style={s.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div><label style={s.label}>Description</label><textarea style={s.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
            {competencies.length > 0 && <div><label style={s.label}>Competencies</label><div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {competencies.map(c => (
                <button key={c.id_competency} onClick={() => setFormData(f => ({ ...f, competencyIds: f.competencyIds.includes(c.id_competency) ? f.competencyIds.filter(x => x !== c.id_competency) : [...f.competencyIds, c.id_competency] }))}
                  style={{ background: formData.competencyIds.includes(c.id_competency) ? "#4f46e5" : "#fff", color: formData.competencyIds.includes(c.id_competency) ? "#fff" : "#334155", border: "1.5px solid #cbd5e1", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", cursor: "pointer" }}>{c.name}</button>
              ))}
            </div></div>}
            <div><label style={s.label}>Deadline</label><CalendarPicker value={formData.deadline} onChange={val => setFormData({...formData, deadline: val})} /></div>
          </div>
          <div style={s.mfoot}><button style={s.btnCancel} onClick={() => setModalOpen(false)}>Cancel</button><button style={s.btnSubmit} onClick={() => handleSubmit('pending')}>Send Task</button></div>
        </div></div>
      )}
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", textAlign: "left" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px" }}>Sign Out?</h3>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>Are you sure you want to exit?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ border: "none", background: "none", color: "#64748b", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
