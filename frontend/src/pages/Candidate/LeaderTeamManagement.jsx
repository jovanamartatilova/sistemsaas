import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Plus, Users, ChevronDown, ChevronUp, Clock, MessageSquare, Send } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`;

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
    ? (() => { const [y, m, d] = value.split('-'); return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]} ${y}`; })()
    : null;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);

  return (
    <div className="relative w-full">
      <div
        ref={triggerRef} onClick={handleOpen}
        style={{
          display: "flex", alignItems: "center",
          border: `1px solid ${open ? "#4f46e5" : "#cbd5e1"}`,
          borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "#fff",
          boxShadow: open ? "0 0 0 2px rgba(79,70,229,.1)" : "none", transition: "all .15s",
          width: "100%", height: "38.5px"
        }}
      >
        <div style={{ flex: 1, padding: "0 12px", textAlign: "left", fontSize: 13, color: displayValue ? "#1e293b" : "#94a3b8", display: "flex", alignItems: "center" }}>
          {displayValue || "Select date…"}
        </div>
        <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
    </div>
  );
}

function DelegatedWorkRow({ st, teamMembers, onReview, onUpdate, onDelete }) {
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", memberUserId: "", deadline: "" });

  const handleStartEdit = () => {
    setFormData({ title: st.title, description: st.description || "", memberUserId: st.id_assignee, deadline: st.deadline || "" });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!formData.title || !formData.memberUserId) return alert("Title and Assignee are required");
    onUpdate(st.id, formData);
    setIsEditing(false);
  };

  if (isEditing) return (
    <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-4">
      <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Edit — {st.assignee}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title</label>
          <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white" />
        </div>
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instructions</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white min-h-[70px]" />
        </div>
        <div className="flex flex-col md:flex-row gap-3 col-span-2">
          <div className="flex-[2]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
            <select value={formData.memberUserId} onChange={e => setFormData({ ...formData, memberUserId: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white">
              {teamMembers.map(m => <option key={m.id} value={m.userId}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deadline</label>
            <CalendarPicker value={formData.deadline} onChange={val => setFormData({ ...formData, deadline: val })} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 px-3">Cancel</button>
        <button onClick={handleSaveEdit} className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg">Update</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Assignee header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
            {st.assignee?.charAt(0)}
          </div>
          <span className="text-xs font-bold text-slate-700">{st.assignee}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {st.status.replace('_', ' ').toUpperCase()}
          </span>
          <button onClick={handleStartEdit} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 transition-colors">Edit</button>
          <button onClick={() => onDelete(st.id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors">Delete</button>
        </div>
      </div>

      {/* Task content */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs font-bold text-slate-800">{st.title}</p>
        {st.description && <p className="text-[11px] text-slate-500 leading-relaxed">{st.description}</p>}
        {st.deadline && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 w-fit bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            <Clock size={10} /> Due {new Date(st.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
        {st.work?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {st.work.map((w, i) => (
              <a key={i} href={w.value} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 hover:underline">
                {w.label}
              </a>
            ))}
          </div>
        )}
        {st.feedback && (
          <div className="bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg text-[10px] text-amber-700">
            <span className="font-bold">Revision:</span> {st.feedback}
          </div>
        )}
      </div>

      {/* Feedback footer */}
      <div className="px-4 pb-3">
        {!showNote ? (
          <button onClick={() => setShowNote(true)} className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
            <MessageSquare size={11} /> Send Feedback
          </button>
        ) : (
          <div className="space-y-2">
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Write feedback for this member..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50" rows="2" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNote(false)} className="text-[10px] text-slate-400">Cancel</button>
              <button onClick={() => { onReview(st.id, note); setShowNote(false); setNote(""); }}
                className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Send size={10} /> Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskShareCard({ task, teamMembers, onAssign, onUpdate, onDelete, onReview }) {
  const [expanded, setExpanded] = useState(true);
  const [assigningToTarget, setAssigningToTarget] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", memberUserId: "", deadline: "" });

  const handleAssign = (targetId) => {
    if (!formData.title || !formData.memberUserId) return alert("Title and Assignee are required");
    onAssign({ ...formData, parent_id: targetId });
    setAssigningToTarget(null);
    setFormData({ title: "", description: "", memberUserId: "", deadline: "" });
  };

  console.log("user:", user);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

      {/* ── Level 1: PROJECT header ── */}
      <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Project</p>
            <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${task.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {task.description && (
            <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* ── Level 2: TARGETS ── */}
          <div className="divide-y divide-slate-100">
            {task.subtasks && task.subtasks.length > 0 ? task.subtasks.map(target => (
              <div key={target.id} className="px-6 py-5 space-y-4">

                {/* Target header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Target</p>
                      <p className="text-xs font-bold text-slate-800">{target.title}</p>
                      {target.description && <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{target.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => setAssigningToTarget(assigningToTarget === target.id ? null : target.id)}
                    className="flex-shrink-0 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={12} /> Delegate
                  </button>
                </div>

                {/* Delegate form */}
                {assigningToTarget === target.id && (
                  <div className="ml-4 bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] font-bold text-indigo-600">New delegation — {target.title}</p>
                      <button onClick={() => setAssigningToTarget(null)} className="text-slate-400 hover:text-rose-500"><Plus size={14} className="rotate-45" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Name</label>
                        <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Database Schema Design"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instructions</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Specific details for this member..."
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[60px]" />
                      </div>
                      <div className="flex flex-col md:flex-row gap-3 col-span-2">
                        <div className="flex-[2]">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                          <select value={formData.memberUserId} onChange={e => setFormData({ ...formData, memberUserId: e.target.value })}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500/20">
                            <option value="">Select Member</option>
                            {teamMembers.map(m => <option key={m.id} value={m.userId}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date</label>
                          <CalendarPicker value={formData.deadline} onChange={val => setFormData({ ...formData, deadline: val })} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setAssigningToTarget(null)} className="text-xs text-slate-400 px-3">Cancel</button>
                      <button onClick={() => handleAssign(target.id)} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-xl">Assign Member</button>
                    </div>
                  </div>
                )}

                {/* ── Level 3: DELEGATIONS ── */}
                {target.delegations && target.delegations.length > 0 ? (
                  <div className="ml-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delegations</p>
                    {target.delegations.map(st => (
                      <DelegatedWorkRow key={st.id} st={st} teamMembers={teamMembers}
                        onReview={onReview} onUpdate={onUpdate} onDelete={onDelete} />
                    ))}
                  </div>
                ) : (
                  <div className="ml-4">
                    <p className="text-[11px] text-slate-300 italic">No delegations yet for this target.</p>
                  </div>
                )}
              </div>
            )) : (
              <div className="px-6 py-6 text-center text-[11px] text-slate-400 italic">No targets defined by mentor yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaderTeamManagement() {
  const { user, company } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasksToShare, setTasksToShare] = useState([]);
  const [error, setError] = useState(null);
  const [delegatingTarget, setDelegatingTarget] = useState(null); // { id, title, task }
  const [editingTask, setEditingTask] = useState(null);
  const [submittingDelegation, setSubmittingDelegation] = useState(null);
  const [delegationAttachments, setDelegationAttachments] = useState([{ type: "link", label: "", value: "" }]);
  const [delegateForm, setDelegateForm] = useState({ title: "", description: "", memberUserId: "", deadline: "" });
  const [editForm, setEditForm] = useState({ title: "", description: "", memberUserId: "", deadline: "" });
  const [logbookDropdown, setLogbookDropdown] = useState(false);
  const [internInfo, setInternInfo] = useState({});
  const [assessment, setAssessment] = useState(null);
const [toast, setToast] = useState(null);

const showToast = (message, type = "success") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};

  useEffect(() => { fetchLeaderData(); }, []);

  useEffect(() => {
    if (editingTask) {
      setEditForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        memberUserId: editingTask.id_assignee || "",
        deadline: editingTask.deadline || "",
      });
    }
  }, [editingTask]);

  const fetchLeaderData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");
      const [membersRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/leader/team-members`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/leader/tasks`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (membersRes.ok) setTeamMembers((await membersRes.json()).data || []);
      if (tasksRes.ok) { const tasksData = await tasksRes.json(); setTasksToShare(tasksData.data || []); setInternInfo(tasksData.intern_info || {}); }
      try { const dashRes = await fetch(`${API_BASE_URL}/member/dashboard`, { headers: { "Authorization": `Bearer ${token}` } }); if (dashRes.ok) { const dashData = await dashRes.json(); setAssessment(dashData.data?.assessment || null); } } catch(_) {}
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleAssignTask = async (data) => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to assign");
showToast("Task delegated to member!")
      fetchLeaderData();
    } catch (err) { showToast(err.message, "error");}
  };

  const handleUpdateSubTask = async (taskId, data) => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/subtask/${taskId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast("Task updated!");
      fetchLeaderData();
    } catch (err) { showToast(err.message); }
  };

  const handleDeleteSubTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this subtask?")) return;
    try {
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/subtask/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Task deleted!");
      fetchLeaderData();
    } catch (err) { showToast(err.message); }
  };

  const handleReviewTask = async (subtaskId, notes) => {
    try {
      const token = sessionStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/${subtaskId}/review`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notes, status: "in_progress" }) // Push back to in progress
      });
      if (!res.ok) throw new Error("Failed to send feedback");
      showToast("Revision note sent to member!");
      fetchLeaderData();
    } catch (err) { showToast(err.message); }
  };

  const handleSubmitDelegation = async () => {
  const valid = delegationAttachments.filter(a => a.label.trim() && a.value.trim());
  if (!valid.length) return alert("Please add at least one link or file.");
  try {
    const token = sessionStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/intern/tasks/${submittingDelegation.id}/work`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ attachments: valid }),
  });
  if (!res.ok) throw new Error("Submit failed");

  await fetch(`${API_BASE_URL}/leader/tasks/subtask/${submittingDelegation.id}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ status: "done" }),
  });
  setSubmittingDelegation(null);
  setDelegationAttachments([{ type: "link", label: "", value: "" }]);
  setTimeout(() => fetchLeaderData(), 500);
    } catch (err) { alert(err.message); }
};

  const flattenTasksForLogbook = () => {
    const result = [];
    tasksToShare.forEach(task => {
      if (!task.subtasks) return;
      task.subtasks.forEach(target => {
        if (!target.delegations) return;
        target.delegations.forEach(delegation => {
          const isMyTask = delegation.assignee?.toLowerCase() === user?.name?.toLowerCase();
          if (!isMyTask) return;
          result.push({
            title: delegation.title,
            description: delegation.description || '',
            deadline: delegation.deadline ? new Date(delegation.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : '-',
            submitted_at: delegation.submitted_at ? new Date(delegation.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : '-',
            status: delegation.status,
            work: delegation.work || []
          });
        });
      });
    });
    return result;
  };

  const getCompetenciesFromTasks = () => {
    const seen = new Set();
    const result = [];
    tasksToShare.forEach(task => {
      // Competencies dari primary task
      if (task.competencies && Array.isArray(task.competencies)) {
        task.competencies.forEach(comp => {
          const compName = typeof comp === 'string' ? comp : comp.name || comp;
          if (!seen.has(compName)) {
            seen.add(compName);
            result.push({
              name: compName,
              description: typeof comp === 'object' ? (comp.description || "-") : "-",
              learning_hours: typeof comp === 'object' ? comp.learning_hours : null
            });
          }
        });
      }
      
      // Competencies dari subtasks dan delegations
      if (task.subtasks && Array.isArray(task.subtasks)) {
        task.subtasks.forEach(subtask => {
          if (subtask.competencies && Array.isArray(subtask.competencies)) {
            subtask.competencies.forEach(comp => {
              const compName = typeof comp === 'string' ? comp : comp.name || comp;
              if (!seen.has(compName)) {
                seen.add(compName);
                result.push({
                  name: compName,
                  description: typeof comp === 'object' ? (comp.description || "-") : "-",
                  learning_hours: typeof comp === 'object' ? comp.learning_hours : null
                });
              }
            });
          }
          
          // Competencies dari delegations
          if (subtask.delegations && Array.isArray(subtask.delegations)) {
            subtask.delegations.forEach(delegation => {
              if (delegation.competencies && Array.isArray(delegation.competencies)) {
                delegation.competencies.forEach(comp => {
                  const compName = typeof comp === 'string' ? comp : comp.name || comp;
                  if (!seen.has(compName)) {
                    seen.add(compName);
                    result.push({
                      name: compName,
                      description: typeof comp === 'object' ? (comp.description || "-") : "-",
                      learning_hours: typeof comp === 'object' ? comp.learning_hours : null
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    console.log("Team competencies:", result);
    return result;
  };

  const exportPDF = () => {
    const rows = flattenTasksForLogbook();
    const allCompetencies = getCompetenciesFromTasks();
    const isApproved = tasksToShare.some(t => t.logbook_approved);
    if (!rows.length) return alert("No submitted tasks to export.");
    if (!isApproved) return alert("Your logbook hasn't been approved by your mentor yet.");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const ML = 14; const MR = 14; const TW = pageW - ML - MR; const CX = pageW / 2;
    const companyName = company?.name ? company.name.toUpperCase() : "COMPANY";
    const drawHeader = () => {
      doc.setFillColor(30, 41, 59); doc.rect(0, 0, pageW, 32, "F");
      doc.setFillColor(79, 70, 229); doc.rect(0, 29, pageW, 3, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(15); doc.setFont("helvetica", "bold");
      doc.text("INTERNSHIP LOGBOOK", CX, 13, { align: "center" });
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
      doc.text(companyName, CX, 21, { align: "center" });
    };
    drawHeader();
    const CARD_Y = 38; const CARD_H = 52; const PAD = 5; const COL_W = TW / 2;
    doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
    doc.rect(ML, CARD_Y, TW, CARD_H, "FD");
    doc.line(ML + COL_W, CARD_Y + 4, ML + COL_W, CARD_Y + CARD_H - 4);
    const truncate = (str, max) => { const s = String(str || "-"); return s.length > max ? s.substring(0, max - 1) + "..." : s; };
    const leftFields = [{ label: "NAME", value: truncate(user?.name, 35) }, { label: "INSTITUTION", value: truncate(internInfo?.institution || "-", 35) }, { label: "EDUCATION", value: truncate((internInfo?.education_level || "-") + (internInfo?.major ? " (" + internInfo.major + ")" : ""), 35) }];
    const rightFields = [{ label: "POSITION", value: truncate(internInfo?.position || "-", 35) }, { label: "MENTOR", value: truncate(internInfo?.mentor_name || "-", 35) }, { label: "PRINTED ON", value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }];
    const ROW_H = 15;
    [[leftFields, ML + PAD], [rightFields, ML + COL_W + PAD]].forEach(([fields, baseX]) => { fields.forEach((f, i) => { const fy = CARD_Y + PAD + i * ROW_H; doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(107, 114, 128); doc.text(f.label, baseX, fy); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(15, 23, 42); doc.text(f.value, baseX, fy + 5); }); });
    const TABLE_Y = CARD_Y + CARD_H + 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
    doc.text("ACTIVITY LOG", CX, TABLE_Y - 2, { align: "center" });
    doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.4); doc.line(ML, TABLE_Y, ML + TW, TABLE_Y);
    autoTable(doc, { startY: TABLE_Y + 3, head: [["No", "Activity", "Description", "Deadline", "Submitted"]], body: rows.map((r, i) => [String(i + 1), String(r.title || "-"), String(r.description || "-"), r.deadline || "-", r.submitted_at || "-"]), tableWidth: TW, styles: { fontSize: 7.5, cellPadding: { top: 2, right: 2.5, bottom: 2, left: 2.5 }, overflow: "linebreak", textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.1, font: "helvetica" }, headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5, halign: "center", valign: "middle", minCellHeight: 7 }, bodyStyles: { minCellHeight: 7, valign: "top" }, alternateRowStyles: { fillColor: [248, 250, 252] }, rowPageBreak: "avoid", columnStyles: { 0: { cellWidth: TW * 0.05, halign: "center" }, 1: { cellWidth: TW * 0.20, halign: "left" }, 2: { cellWidth: TW * 0.48, halign: "left" }, 3: { cellWidth: TW * 0.135, halign: "center" }, 4: { cellWidth: TW * 0.135, halign: "center" } }, margin: { left: ML, right: MR, top: 36, bottom: 14 }, pageBreak: "auto", didDrawPage: (data) => { if (data.pageNumber > 1) drawHeader(); } });
    if (assessment?.scores?.length > 0) {
      const assessY = (doc.lastAutoTable?.finalY ?? (TABLE_Y + 60)) + 10;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
      doc.text("MENTOR ASSESSMENT", CX, assessY, { align: "center" });
      doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.4);
      doc.line(ML, assessY + 2, ML + TW, assessY + 2);
      const avgScore = assessment.average_score ?? "-";
      autoTable(doc, {
        startY: assessY + 5,
        head: [["Competency", "Score", "Status", "Achievement"]],
        body: assessment.scores.map(s => [String(s.competency_name || "-"), s.score != null ? String(s.score) : "-", s.status === "passed" ? "Passed" : s.status === "failed" ? "Failed" : "Pending", String(s.achievement_description || "-")]),
        foot: [[{ content: "Average Score: " + avgScore, colSpan: 4, styles: { halign: "right", fontStyle: "bold", textColor: [79, 70, 229] } }]],
        tableWidth: TW,
        styles: { fontSize: 7.5, cellPadding: { top: 2, right: 2.5, bottom: 2, left: 2.5 }, overflow: "linebreak", textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.1, font: "helvetica" },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5, halign: "center", valign: "middle", minCellHeight: 7 },
        footStyles: { fillColor: [248, 250, 252], fontSize: 8 },
        bodyStyles: { minCellHeight: 7, valign: "top" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: TW * 0.30 }, 1: { cellWidth: TW * 0.10, halign: "center" }, 2: { cellWidth: TW * 0.15, halign: "center" }, 3: { cellWidth: TW * 0.45 } },
        margin: { left: ML, right: MR, top: 36, bottom: 14 },
        didDrawPage: (data) => { if (data.pageNumber > 1) drawHeader(); },
      });
    }

    if (allCompetencies.length > 0) { const compY = (doc.lastAutoTable?.finalY ?? (TABLE_Y + 60)) + 10; doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 41, 59); doc.text("COMPETENCIES COVERED", CX, compY, { align: "center" }); doc.setDrawColor(79, 70, 229); doc.setLineWidth(0.4); doc.line(ML, compY + 2, ML + TW, compY + 2); autoTable(doc, { startY: compY + 5, head: [["Competency", "Description", "Learning Hours"]], body: allCompetencies.map(c => [String(c.name || "-"), String(c.description || "-"), c.learning_hours ? c.learning_hours + "h" : "-"]), tableWidth: TW, styles: { fontSize: 7.5, cellPadding: { top: 2, right: 2.5, bottom: 2, left: 2.5 }, overflow: "linebreak", textColor: [30, 41, 59], lineColor: [226, 232, 240], lineWidth: 0.1, font: "helvetica" }, headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5, halign: "center", valign: "middle", minCellHeight: 7 }, bodyStyles: { minCellHeight: 7, valign: "top" }, alternateRowStyles: { fillColor: [248, 250, 252] }, rowPageBreak: "avoid", columnStyles: { 0: { cellWidth: TW * 0.23, halign: "left" }, 1: { cellWidth: TW * 0.57, halign: "left" }, 2: { cellWidth: TW * 0.20, halign: "center" } }, margin: { left: ML, right: MR, top: 36, bottom: 14 }, pageBreak: "auto", showHead: "everyPage", didDrawPage: (data) => { if (data.pageNumber > 1) drawHeader(); } }); }
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) { doc.setPage(p); doc.setFillColor(30, 41, 59); doc.rect(0, pageH - 10, pageW, 10, "F"); doc.setTextColor(148, 163, 184); doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.text("Internship Program", ML, pageH - 3.5); doc.text("Page " + p + " of " + totalPages, CX, pageH - 3.5, { align: "center" }); doc.text(new Date().getFullYear().toString(), pageW - MR, pageH - 3.5, { align: "right" }); }
    doc.save("Team-Logbook-" + new Date().toISOString().split("T")[0] + ".pdf");
  };
  const exportCSV = () => {
    const rows = flattenTasksForLogbook();
    const isApproved = tasksToShare.some(t => t.logbook_approved);
    if (!rows.length) return alert("No submitted tasks to export.");
    if (!isApproved) return alert("Your logbook hasn't been approved by your mentor yet.");

    const headers = ["Task", "Description", "Deadline", "Submitted"];
    const csvContent = [
      headers.join(","),
      ...rows.map(r => [
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.description.replace(/"/g, '""')}"`,
        `"${r.deadline}"`,
        `"${r.submitted_at}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Team-Logbook-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <DashboardLayout company={company}><LoadingSpinner />
{toast && (
  <div style={{
    position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
    zIndex: 9999, background: toast.type === "success" ? "#059669" : "#dc2626",
    color: "#fff", padding: "12px 24px", borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontSize: "13px", fontWeight: 600,
    display: "flex", alignItems: "center", gap: "8px",
    animation: "slideUp 0.3s ease"
  }}>
    {toast.type === "success" ? "✓" : "✕"} {toast.message}
  </div>
)}
<style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
</DashboardLayout>;

  return (
    <DashboardLayout userName={user?.name} userPhoto={user?.photo} company={company}>
      <div className="space-y-6 text-left w-full">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-none mb-2">Team Management</h1>
            <p className="text-slate-500 text-sm leading-none">Share mentor tasks and review member submissions.</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setLogbookDropdown(v => !v)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
            >
              Download Logbook ▾
            </button>
            {logbookDropdown && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden", minWidth: "160px" }}>
                <button
                  onClick={() => { setLogbookDropdown(false); exportPDF(); }}
                  disabled={!tasksToShare.some(t => t.logbook_approved)}
                  style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: "13px", fontWeight: 600, textAlign: "left", background: "none", border: "none", cursor: tasksToShare.some(t => t.logbook_approved) ? "pointer" : "not-allowed", color: tasksToShare.some(t => t.logbook_approved) ? "#1e293b" : "#94a3b8" }}
                  onMouseEnter={e => { if (tasksToShare.some(t => t.logbook_approved)) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  {tasksToShare.some(t => t.logbook_approved) ? "📄 Download PDF" : "🔒 PDF"}
                </button>

              </div>
            )}
          </div>
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm">{error}</div>}

        <div className="space-y-4 w-full">

          {tasksToShare.length > 0 ? (
            <div className="space-y-6">
              {tasksToShare.map(task => (
                <div key={task.id_task} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Project header */}
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Project</p>
                      <p className="text-sm font-bold text-slate-800">{task.title}</p>
                    </div>
                  </div>
                  {/* Single unified table per project */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-y border-slate-100">
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36">Target</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignee</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {task.subtasks?.flatMap(target => {
                          const rows = target.delegations?.length > 0 ? target.delegations : [null];
                          return rows.map((st, i) => (
                            <tr key={st ? st.id : `empty-${target.id}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                              {/* Target cell — rowSpan, hanya di baris pertama */}
                              {i === 0 && (
                                <td rowSpan={rows.length} className="px-4 py-3 border-r border-slate-100 align-top">
                                  <p className="text-xs font-bold text-slate-700 leading-snug">{target.title}</p>
                                  {target.description && <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{target.description}</p>}
                                  <button
                                    onClick={() => setDelegatingTarget(target)}
                                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-100 transition-all"
                                  >
                                    <Plus size={10} /> Delegate
                                  </button>
                                </td>
                              )}
                              {st ? (
                                <>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 flex-shrink-0">
                                        {st.assignee?.charAt(0)}
                                      </div>
                                      <span className="text-xs font-medium text-slate-700">{st.assignee}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 max-w-[180px]">
                                    <p className="text-xs font-semibold text-slate-800">{st.title}</p>
                                    {st.description && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.description}</p>}
                                    {st.work?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {st.work.map((w, wi) => (
                                          <a key={wi} href={w.value} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 hover:underline">
                                            🔗 {w.label}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                    {st.feedback && (
                                      <div className="mt-1.5 bg-amber-50 border border-amber-100 px-2 py-1 rounded text-[10px] text-amber-700">
                                        <span className="font-bold">Revisi:</span> {st.feedback}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 hidden sm:table-cell text-[11px] text-slate-500 whitespace-nowrap">
                                    {st.deadline ? new Date(st.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      st.work?.length > 0 || st.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                    }`}>
                                      {st.work?.length > 0 || st.status === "done" ? "Done" : "Pending"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {(() => {
                                        const isMyTask = st.assignee?.toLowerCase() === user?.name?.toLowerCase();
                                        const needsResubmit = !!(st.feedback || task.feedback_notes);
                                        if (isMyTask && (needsResubmit || !st.work?.length)) {
                                          return (
                                            <button
                                              onClick={() => setSubmittingDelegation(st)}
                                              className={`text-[10px] font-bold px-2 py-1 rounded ${needsResubmit ? "text-rose-600 bg-rose-50 hover:bg-rose-100" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"}`}>
                                              {needsResubmit ? "Resubmit" : "Submit"}
                                            </button>
                                          );
                                        }
                                      })()}
                                      <button onClick={() => setEditingTask(st)}
                                        className="text-[10px] font-bold text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50">
                                        Edit
                                      </button>
                                      <button onClick={() => handleDeleteSubTask(st.id)}
                                        className="text-[10px] font-bold text-rose-500 px-2 py-1 rounded hover:bg-rose-50">
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <td colSpan={5} className="px-4 py-3 text-[11px] text-slate-300 italic">
                                  No delegations yet.
                                </td>
                              )}
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center w-full">
              <p className="text-slate-500 text-sm">No tasks assigned from mentor yet.</p>
            </div>
          )}
        </div>
      </div>
      {/* Delegate Modal */}
      {delegatingTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Delegate Task</p>
            <p className="text-sm font-bold text-slate-800 mb-4">Target: {delegatingTarget.title}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Name</label>
                <input value={delegateForm.title} onChange={e => setDelegateForm({ ...delegateForm, title: e.target.value })}
                  placeholder="e.g., Database Schema Design"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instructions</label>
                <textarea value={delegateForm.description} onChange={e => setDelegateForm({ ...delegateForm, description: e.target.value })}
                  placeholder="Specific details for this member..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[70px]" />
              </div>
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                  <select value={delegateForm.memberUserId} onChange={e => setDelegateForm({ ...delegateForm, memberUserId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Select Member</option>
                    {[{ id: 'leader', userId: user?.id_user, name: user?.name + " (You)" }, ...teamMembers].map(m => (
                      <option key={m.id} value={m.userId}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date</label>
                  <CalendarPicker value={delegateForm.deadline} onChange={val => setDelegateForm({ ...delegateForm, deadline: val })} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => { setDelegatingTarget(null); setDelegateForm({ title: "", description: "", memberUserId: "", deadline: "" }); }}
                className="text-xs text-slate-400 px-4 py-2">Cancel</button>
              <button onClick={() => {
                if (!delegateForm.title || !delegateForm.memberUserId) return alert("Title and Assignee are required");
                handleAssignTask({ ...delegateForm, parent_id: delegatingTarget.id });
                setDelegatingTarget(null);
                setDelegateForm({ title: "", description: "", memberUserId: "", deadline: "" });
              }} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-xl">Assign Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Edit Delegation</p>
            <p className="text-sm font-bold text-slate-800 mb-4">{editingTask.assignee}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Name</label>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instructions</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[70px]" />
              </div>
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                  <select value={editForm.memberUserId} onChange={e => setEditForm({ ...editForm, memberUserId: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20">
                    {[{ id: 'leader', userId: user?.id_user, name: user?.name + " (You)" }, ...teamMembers].map(m => (
                      <option key={m.id} value={m.userId}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date</label>
                  <CalendarPicker value={editForm.deadline} onChange={val => setEditForm({ ...editForm, deadline: val })} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setEditingTask(null)} className="text-xs text-slate-400 px-4 py-2">Cancel</button>
              <button onClick={() => {
                if (!editForm.title || !editForm.memberUserId) return alert("Title and Assignee are required");
                handleUpdateSubTask(editingTask.id, editForm);
                setEditingTask(null);
              }} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-xl">Update Task</button>
            </div>
          </div>
        </div>
      )}
{submittingDelegation && (
  <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
    <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Submit My Work</p>
        <p className="text-base font-bold text-slate-900">{submittingDelegation.title}</p>
        {submittingDelegation.description && (
          <p className="text-xs text-slate-400 mt-1">{submittingDelegation.description}</p>
        )}
        {submittingDelegation.feedback && (
        <div className="mx-6 mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3 flex gap-2 items-start">
          <span className="text-rose-500 mt-0.5 flex-shrink-0 text-xs">⚠</span>
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Revision Note</p>
            <p className="text-xs text-rose-800 italic mt-0.5">"{submittingDelegation.feedback}"</p>
          </div>
        </div>
              )}
        {submittingDelegation.deadline && (
          <p className="text-[10px] text-indigo-500 font-bold mt-2">
            Due {new Date(submittingDelegation.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attachments</p>
        {delegationAttachments.map((att, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <select value={att.type} onChange={e => {
                const next = [...delegationAttachments];
                next[i] = { ...next[i], type: e.target.value, value: "" };
                setDelegationAttachments(next);
              }} className="text-xs font-semibold border border-slate-200 bg-white rounded-lg px-2 py-1.5 outline-none text-slate-600">
                <option value="link">🔗 Link</option>
                <option value="file">📁 File</option>
              </select>
              <button onClick={() => setDelegationAttachments(prev => prev.filter((_, idx) => idx !== i))}
                className="text-[10px] text-rose-400 hover:text-rose-600 font-bold px-2 py-1 rounded hover:bg-rose-50 transition-colors">
                Remove
              </button>
            </div>
            <input
              value={att.label}
              onChange={e => {
                const next = [...delegationAttachments];
                next[i].label = e.target.value;
                setDelegationAttachments(next);
              }}
              placeholder="Label (e.g. Final Report)"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
            {att.type === "link" ? (
              <input
                value={att.value}
                onChange={e => {
                  const next = [...delegationAttachments];
                  next[i].value = e.target.value;
                  setDelegationAttachments(next);
                }}
                placeholder="https://..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
              />
            ) : (
              <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-lg py-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                <span className="text-xs text-slate-400 font-medium">
                  {att.value ? "✓ File uploaded" : "Click to upload file"}
                </span>
                <input type="file" className="hidden" onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  const token = sessionStorage.getItem("auth_token");
                  const res = await fetch(`${API_BASE_URL}/intern/tasks/${submittingDelegation.id}/upload-file`, {
                    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
                  });
                  const data = await res.json();
                  const next = [...delegationAttachments];
                  next[i].value = data.url;
                  if (!next[i].label) next[i].label = file.name;
                  setDelegationAttachments(next);
                }} />
              </label>
            )}
          </div>
        ))}
        <button
          onClick={() => setDelegationAttachments([...delegationAttachments, { type: "link", label: "", value: "" }])}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          + Add another attachment
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button
          onClick={() => { setSubmittingDelegation(null); setDelegationAttachments([{ type: "link", label: "", value: "" }]); }}
          className="text-xs font-semibold text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSubmitDelegation}
          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm">
          Submit Work
        </button>
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
}

