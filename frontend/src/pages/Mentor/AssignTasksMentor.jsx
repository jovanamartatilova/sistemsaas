import { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import { SidebarMentor } from "../../components/SidebarMentor";
import { useAuthStore } from "../../stores/authStore";
import { CheckCircle, Clock, AlertCircle, MessageSquare, Send, ChevronDown, ChevronUp, Plus, Edit, Trash } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setYear(d.getFullYear());
        setMonth(d.getMonth());
      }
    }
  }, [value]);

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
    ? (() => { const [y, m, d] = value.split('-'); return `${d}/${m}/${y}`; })()
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
  const [assignTargets, setAssignTargets] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [allCompetencies, setAllCompetencies] = useState([]);
  const [internInfo, setInternInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [logbookModal, setLogbookModal] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [noteMap, setNoteMap] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetVal: "",
    frequency: "daily",
    startDate: new Date().toISOString().split('T')[0],
    projectTargets: [{ title: "", description: "", competencyIds: [] }],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const [resTasks, resAssignTargets, resComp] = await Promise.all([
        axios.get("http://localhost:8000/api/mentor/tasks", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/mentor/assign-targets", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:8000/api/mentor/competencies", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTasks(resTasks.data.data || []);
      setAssignTargets(resAssignTargets.data.data || []);
      setAllCompetencies(resComp.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      targetVal: "",
      frequency: "daily",
      startDate: new Date().toISOString().split('T')[0],
      projectTargets: [{ title: "", description: "", competencyIds: [] }],
    });
    setInternInfo(null);
    setCompetencies([]);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    console.log("Debug Edit - Project:", project);
    console.log("Debug Edit - AssignTargets:", assignTargets);

    setIsEditing(true);
    setEditId(project.id_task);

    // Perbandingan ID yang lebih fleksibel (pakai String)
    const target = assignTargets.find(t =>
      String(t.id_target) === String(project.id_intern) &&
      String(t.id_team || "") === String(project.id_team || "")
    );

    const targetVal = target ? `${target.id_target}|${target.id_team || ''}` : "";

    setFormData({
      title: project.title || "",
      description: project.description || "",
      targetVal: targetVal,
      frequency: project.frequency === '-' ? 'daily' : project.frequency,
      startDate: project.created_at ? String(project.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
      projectTargets: (project.subtasks || []).map(st => ({
        id: st.id,
        title: st.title || "",
        description: st.description || "",
        competencyIds: st.competency_ids || [],
        deadlineAt: st.deadline_at ? String(st.deadline_at).split('T')[0] : null
      })),
    });

    if (target) {
      setInternInfo({ position: target.position, program: target.program });
      if (target.id_position) {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        axios.get(`http://localhost:8000/api/mentor/competencies?id_position=${target.id_position}`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => setCompetencies(res.data.data || []))
          .catch(err => console.error("Failed to load competencies for edit:", err));
      }
    }
    setModalOpen(true);
  };

  const handleTargetChange = async (val) => {
    setFormData(f => ({ ...f, targetVal: val }));
    const target = assignTargets.find(t => `${t.id_target}|${t.id_team || ''}` === val);
    if (!target) return;
    setInternInfo({ position: target.position, program: target.program });
    if (target.id_position) {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/mentor/competencies?id_position=${target.id_position}`, { headers: { Authorization: `Bearer ${token}` } });
      setCompetencies(res.data.data || []);
    }
  };

  const recalculateDeadlines = (baseDate, freq, targets) => {
    const start = new Date(baseDate);
    return targets.map((t, idx) => {
      const nextDate = new Date(start);
      const count = idx + 1;
      if (freq === 'daily') nextDate.setDate(nextDate.getDate() + count);
      else if (freq === 'weekly') nextDate.setDate(nextDate.getDate() + (count * 7));
      else if (freq === 'bi-weekly') nextDate.setDate(nextDate.getDate() + (count * 14));
      else if (freq === 'monthly') nextDate.setMonth(nextDate.getMonth() + count);
      return { ...t, deadlineAt: nextDate.toISOString().split('T')[0] };
    });
  };

  const handleFrequencyChange = (val) => {
    setFormData(prev => ({
      ...prev,
      frequency: val,
      projectTargets: recalculateDeadlines(prev.startDate, val, prev.projectTargets)
    }));
  };

  const handleStartDateChange = (val) => {
    setFormData(prev => ({
      ...prev,
      startDate: val,
      projectTargets: recalculateDeadlines(val, prev.frequency, prev.projectTargets)
    }));
  };

  const addProjectTarget = () => {
    setFormData(f => {
      const newList = [...f.projectTargets, { title: "", description: "", competencyIds: [], deadlineAt: "" }];
      return { ...f, projectTargets: recalculateDeadlines(f.startDate, f.frequency, newList) };
    });
  };

  const removeProjectTarget = (idx) => {
    if (formData.projectTargets.length <= 1) return;
    const newList = [...formData.projectTargets];
    newList.splice(idx, 1);
    setFormData(f => ({ ...f, projectTargets: newList }));
  };

  const handleProjectTargetChange = (idx, field, val) => {
    const newList = [...formData.projectTargets];
    newList[idx][field] = val;
    setFormData(f => ({ ...f, projectTargets: newList }));
  };

  const toggleTargetCompetency = (targetIdx, compId) => {
    setFormData(prev => ({
      ...prev,
      projectTargets: prev.projectTargets.map((t, idx) => {
        if (idx === targetIdx) {
          const exists = t.competencyIds.some(id => String(id) === String(compId));
          const competencyIds = exists
            ? t.competencyIds.filter(id => String(id) !== String(compId))
            : [...t.competencyIds, compId];
          return { ...t, competencyIds };
        }
        return t;
      })
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.targetVal || !formData.startDate) return alert("Please fill all required fields");
    if (formData.projectTargets.some(t => !t.title || !t.description)) return alert("Please fill all target titles and instructions");

    setSubmitting(true);
    try {
      const targetObj = assignTargets.find(t => `${t.id_target}|${t.id_team || ''}` === formData.targetVal);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

      const payload = {
        id_target: targetObj.id_target,
        id_team: targetObj.id_team,
        title: formData.title,
        description: formData.description,
        frequency: formData.frequency,
        start_date: formData.startDate,
        targets: formData.projectTargets.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          competency_ids: t.competencyIds,
          deadline_at: t.deadlineAt
        }))
      };

      if (isEditing) {
        await axios.put(`http://localhost:8000/api/mentor/tasks/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post("http://localhost:8000/api/mentor/tasks", payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      setModalOpen(false);
      fetchData();
      alert(isEditing ? "Project updated!" : "Project created!");
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to save project";
      alert(msg);
    } finally { setSubmitting(false); }
  };

  const handleUpdateTask = async (taskId, payload) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/mentor/tasks/${taskId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      alert("Success!");
    } catch (e) { alert("Failed to update"); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this project and all its targets?")) return;
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/mentor/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      alert("Project deleted!");
    } catch (e) { alert("Failed to delete project"); }
  };

  const handleApproveLogbook = async (taskId) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/mentor/tasks/${taskId}/approve-logbook`,
        { logbook_approved: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      setLogbookModal(null);
      showToast("Logbook approved! Candidate can now download their logbook.");
    } catch (e) {
      showToast("Failed to approve logbook.", "error");
    }
  };

  if (loading) return (
    <div style={s.app}>
      <SidebarMentor mentor={user} onLogout={() => setLogoutModal(true)} />
      <main style={s.main}>
        <div style={s.topbar}><div style={s.bc}><span>Dashboard</span><span style={s.bcSep}>/</span><span>Assessment</span><span style={s.bcSep}>/</span><span style={s.bcActive}>Assign Tasks</span></div></div>
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
              <p style={s.subtitle}>Create projects, set daily/weekly targets, and review intern submissions.</p>
            </div>
            <button style={s.btnNew} onClick={handleOpenModal}><Plus size={16} /> New Project</button>
          </div>

          <div style={s.card}>
            <table style={s.table}>
              <colgroup><col style={{ width: "30%" }} /><col style={{ width: "18%" }} /><col style={{ width: "13%" }} /><col style={{ width: "13%" }} /><col style={{ width: "14%" }} /><col style={{ width: "12%" }} /></colgroup>
              <thead style={s.thead}><tr><th style={s.th}>Project / Task</th><th style={s.th}>Assigned To</th><th style={s.th}>Frequency</th><th style={s.th}>Details</th><th style={s.th}>Status</th><th style={s.th}>Logbook</th></tr></thead>
              <tbody>
                {tasks.length === 0 ? <tr><td colSpan={6} style={{ padding: "40px", color: "#94a3b8" }}>No projects created yet.</td></tr> : tasks.map(project => {
                  const isEx = expandedTask === project.id_task;
                  const isIndependent = project.task_type === 'independent';
                  return (
                    <Fragment key={project.id_task}>
                      <tr style={{ cursor: "pointer", background: isEx ? "#f8fafc" : "transparent" }} onClick={() => setExpandedTask(isEx ? null : project.id_task)}>
                        <td style={s.td}>
                          <span style={s.cname}>{project.title}</span>
                          <span style={s.cdesc}>{project.description}</span>
                          {isIndependent && <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Independent Task</span>}
                        </td>
                        <td style={s.td}><span style={{ fontWeight: 500 }}>{project.target_name}</span></td>
                        <td style={s.td}><span style={{ textTransform: "capitalize", fontWeight: 600, color: isIndependent ? "#94a3b8" : "#4f46e5" }}>{project.frequency}</span></td>
                        <td style={s.td}><span style={{ fontWeight: 600 }}>{isIndependent ? "1 Submission" : `${project.subtasks.length} Targets`}</span></td>
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={s.statusBadge(project.status)}>{project.status.replace("_", " ")}</span>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={(e) => { e.stopPropagation(); handleEdit(project); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }} title="Edit Project"><Edit size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(project.id_task); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }} title="Delete Project"><Trash size={16} /></button>
                            </div>
                          </div>
                        </td>
                        <td style={s.td} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setLogbookModal(project); }}
                            style={{ background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                          >
                            See Logbook
                          </button>
                        </td>
                      </tr>
                      {isEx && (
                        <tr>
                          <td colSpan={6} style={{ background: "#f8fafc", padding: "24px 32px", borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
                              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {isIndependent ? "Task Details & Submission" : "Project Targets & Submissions"}
                              </p>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                                {isIndependent ? (
                                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> Deadline: {project.deadline_at ? new Date(project.deadline_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}</div>
                                          <span style={s.statusBadge(project.status)}>{project.status.toUpperCase()}</span>
                                        </div>
                                        <p style={{ fontSize: "13px", color: "#334155" }}>{project.description}</p>
                                      </div>
                                      <div style={{ width: "350px", borderLeft: "1px solid #f1f5f9", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Submission & Feedback</p>
                                        {project.work_attachments?.length > 0 ? (
                                          <>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                              {project.work_attachments.map((att, i) => (
                                                <a key={i} href={att.value} target="_blank" rel="noopener noreferrer" style={{ padding: "4px 10px", background: "#f8fafc", borderRadius: "6px", fontSize: "12px", color: "#4f46e5", textDecoration: "none", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "4px" }}>{att.label}</a>
                                              ))}
                                            </div>
                                            <textarea
                                              style={{ ...s.textarea, minHeight: "80px", padding: "10px", fontSize: "12px" }}
                                              placeholder="Feedback..."
                                              value={noteMap[project.id_task] || project.feedback_notes || ""}
                                              onChange={e => setNoteMap({ ...noteMap, [project.id_task]: e.target.value })}
                                            />
                                            <div style={{ display: "flex", gap: "8px" }}>
                                              <button onClick={() => handleUpdateTask(project.id_task, { feedback_notes: noteMap[project.id_task], status: "in_progress" })} style={{ ...s.btnCancel, padding: "6px 12px", flex: 1, fontSize: "12px" }}>Revision</button>
                                              {project.status !== 'done' && <button onClick={() => handleUpdateTask(project.id_task, { status: "done" })} style={{ ...s.btnSubmit, padding: "6px 12px", flex: 1, fontSize: "12px", background: "#059669" }}>Approve</button>}
                                            </div>
                                          </>
                                        ) : <div style={{ fontSize: "12px", color: "#94a3b8" }}>No submission yet</div>}
                                      </div>
                                    </div>
                                  </div>
                                ) : project.subtasks.map((st, idx) => (
                                  <div key={st.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px" }}>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                          <div style={{ width: "24px", height: "24px", background: "#eef2ff", color: "#4f46e5", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>{idx + 1}</div>
                                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>{st.title}</span>
                                        </div>
                                        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px 0", lineHeight: "1.5" }}>{st.description}</p>

                                        {st.competency_ids?.length > 0 && (
                                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                                            {st.competency_ids.map(cid => {
                                              const c = allCompetencies.find(x => x.id_competency === cid);
                                              return <span key={cid} style={{ fontSize: "10px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "99px", border: "1px solid #e2e8f0" }}>{c?.name || cid}</span>
                                            })}
                                          </div>
                                        )}

                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> Deadline:</div>
                                            <CalendarPicker 
                                              value={st.deadline_at ? String(st.deadline_at).split('T')[0] : ""} 
                                              onChange={(val) => handleUpdateTask(st.id, { deadline_at: val })}
                                            />
                                          </div>
                                          <span style={s.statusBadge(st.status)}>{st.status.toUpperCase()}</span>
                                        </div>
                                      </div>

                                      <div style={{ width: "350px", borderLeft: "1px solid #f1f5f9", paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Submission & Feedback</p>

                                        {st.work_attachments?.length > 0 ? (
                                          <>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                              {st.work_attachments.map((att, i) => (
                                                <a key={i} href={att.value} target="_blank" rel="noopener noreferrer" style={{ padding: "4px 10px", background: "#f8fafc", borderRadius: "6px", fontSize: "12px", color: "#4f46e5", textDecoration: "none", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "4px" }}>
                                                  <AlertCircle size={12} /> {att.label}
                                                </a>
                                              ))}
                                            </div>

                                            <div style={{ marginTop: "8px" }}>
                                              <textarea
                                                style={{ ...s.textarea, minHeight: "80px", padding: "10px", fontSize: "12px", borderRadius: "8px" }}
                                                placeholder="Give feedback or revision instructions..."
                                                value={noteMap[st.id] || st.feedback_notes || ""}
                                                onChange={e => setNoteMap({ ...noteMap, [st.id]: e.target.value })}
                                              />
                                              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                                                <button onClick={() => handleUpdateTask(st.id, { feedback_notes: noteMap[st.id], status: "in_progress" })} style={{ ...s.btnCancel, padding: "6px 12px", flex: 1, fontSize: "12px" }}>Revision</button>
                                                {st.status !== 'done' && <button onClick={() => handleUpdateTask(st.id, { status: "done" })} style={{ ...s.btnSubmit, padding: "6px 12px", flex: 1, fontSize: "12px", background: "#059669" }}>Approve</button>}
                                              </div>
                                            </div>
                                          </>
                                        ) : (
                                          <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                                            No submission yet
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
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

      {/* Modal */}
      {modalOpen && (
        <div style={s.modalOverlay}><div style={{ ...s.modal, width: "1000px" }}>
          <div style={s.mhead}>
            <h2 style={s.mtitle}>{isEditing ? "Edit Project Tasks" : "Assign New Project Tasks"}</h2>
            <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
          </div>
          <div style={{ ...s.mbody, display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>

            {/* Left: Project Settings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase", marginBottom: "-10px" }}>Project Header</p>
              <div><label style={s.label}>Assign To</label>
                <select style={s.select} value={formData.targetVal} onChange={(e) => handleTargetChange(e.target.value)}>
                  <option value="" disabled>Select Intern / Team</option>
                  {assignTargets.map((t, idx) => <option key={idx} value={`${t.id_target}|${t.id_team || ''}`}>{t.type === 'Team' ? `${t.name} (Team: ${t.team_name})` : t.name}</option>)}
                </select>
              </div>
              <div><label style={s.label}>Project Title</label><input type="text" style={s.input} placeholder="e.g. Website Development" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><label style={s.label}>Brief Description</label><textarea style={{ ...s.textarea, minHeight: "100px" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div><label style={s.label}>Frequency</label>
                  <select style={s.select} value={formData.frequency} onChange={e => handleFrequencyChange(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">2 Weeks (Bi-weekly)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div><label style={s.label}>Start Date</label><CalendarPicker value={formData.startDate} onChange={handleStartDateChange} /></div>
              </div>
            </div>

            {/* Right: Targets List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>Targets & Instructions</p>
                <button onClick={addProjectTarget} style={{ background: "#eef2ff", color: "#4f46e5", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Add Target</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }}>
                {formData.projectTargets.map((target, idx) => (
                  <div key={idx} style={{ padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Target #{idx + 1}</span>
                      {formData.projectTargets.length > 1 && <button onClick={() => removeProjectTarget(idx)} style={{ color: "#ef4444", background: "none", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Remove</button>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" style={{ ...s.input, padding: "10px 14px", fontSize: "14px" }} placeholder="Target Title" value={target.title} onChange={e => handleProjectTargetChange(idx, 'title', e.target.value)} />
                      <textarea style={{ ...s.textarea, minHeight: "80px", padding: "10px 14px", fontSize: "13px" }} placeholder="Instructions & Details..." value={target.description} onChange={e => handleProjectTargetChange(idx, 'description', e.target.value)} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Auto Deadline: <span style={{ fontWeight: 700, color: "#4f46e5" }}>{target.deadlineAt ? new Date(target.deadlineAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                        </div>
                      </div>

                      {competencies.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <label style={{ ...s.label, fontSize: '11px', color: '#94a3b8' }}>Relevant Competencies</label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {competencies.map(c => (
                              <button key={c.id_competency} onClick={() => toggleTargetCompetency(idx, c.id_competency)}
                                style={{
                                  background: target.competencyIds.some(id => String(id) === String(c.id_competency)) ? "#4f46e5" : "#fff",
                                  color: target.competencyIds.some(id => String(id) === String(c.id_competency)) ? "#fff" : "#334155",
                                  border: "1.5px solid #cbd5e1", borderRadius: "999px", padding: "3px 10px", fontSize: "10px", cursor: "pointer"
                                }}>{c.name}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          <div style={s.mfoot}>
            <button style={s.btnCancel} onClick={() => setModalOpen(false)}>Cancel</button>
            <button style={s.btnSubmit} disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Saving..." : (isEditing ? "Update Project" : "Assign Project & Targets")}
            </button>
          </div>
        </div></div>
      )}

      {logbookModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modal, width: "800px" }}>
            <div style={s.mhead}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2 style={s.mtitle}>Logbook — {logbookModal.target_name}</h2>
                {logbookModal.logbook_approved && (
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", background: "#dcfce7", padding: "3px 10px", borderRadius: "99px", border: "1px solid #bbf7d0" }}>
                    ✓ Approved
                  </span>
                )}
              </div>
              <button onClick={() => setLogbookModal(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>&times;</button>
            </div>
            <div style={{ ...s.mbody, gap: "12px" }}>
              {(() => {
                const submitted = (logbookModal.subtasks || []).filter(st => st.work_attachments?.length > 0);
                if (!submitted.length) return <p style={{ color: "#94a3b8", fontSize: "13px" }}>No submitted tasks yet.</p>;
                return submitted.map((st, idx) => (
                  <div key={st.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{idx + 1}. {st.title}</span>
                      <span style={s.statusBadge(st.status)}>{st.status}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{st.description}</p>
                    <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                      <span>Deadline: <b>{st.deadline_at ? new Date(st.deadline_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}</b></span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {st.work_attachments.map((att, i) => (
                        <a key={i} href={att.value} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "4px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", color: "#4f46e5", textDecoration: "none" }}>
                          🔗 {att.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div style={s.mfoot}>
              <button style={s.btnCancel} onClick={() => setLogbookModal(null)}>Close</button>
              {!logbookModal.logbook_approved ? (
                <button
                  onClick={() => handleApproveLogbook(logbookModal.id_task)}
                  style={{ ...s.btnSubmit, background: "#059669", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  ✓ Approve Logbook
                </button>
              ) : (
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                  ✓ Logbook Already Approved
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "#059669",
          color: "#fff", padding: "14px 20px", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontSize: "13px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "10px",
          animation: "slideIn 0.2s ease"
        }}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
