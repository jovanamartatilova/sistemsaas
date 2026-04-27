import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Plus, Users, ChevronDown, ChevronUp, Send, MessageSquare, CheckCircle, Clock, Info } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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
    setFormData({
      title: st.title,
      description: st.description || "",
      memberUserId: st.id_assignee,
      deadline: st.deadline || ""
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!formData.title || !formData.memberUserId) return alert("Title and Assignee are required");
    onUpdate(st.id, formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-left">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className={`mt-0.5 ${st.status === 'done' ? 'text-emerald-500' : 'text-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{st.assignee}</span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{st.title}</span>
                </div>
                {st.description && (
                  <div className="mt-1.5 flex items-start gap-1.5 bg-white/50 p-2 rounded border border-slate-100">
                    <Info size={12} className="text-slate-400 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{st.description}</p>
                  </div>
                )}
                {st.deadline && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-50/50 w-fit px-2 py-0.5 rounded border border-indigo-100">
                    <Clock size={11} />
                    Due: {new Date(st.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleStartEdit} className="text-[10px] text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded font-bold">Edit</button>
              <button onClick={() => onDelete(st.id)} className="text-[10px] text-rose-600 hover:bg-rose-50 px-1.5 py-0.5 rounded font-bold">Delete</button>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {st.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {st.work && st.work.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 mt-2">
              {st.work.map((w, i) => (
                <a key={i} href={w.value} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                  {w.label}
                </a>
              ))}
            </div>
          )}

          {st.feedback && (
            <div className="bg-amber-50 border border-amber-100 p-2 rounded text-[10px] text-amber-700 italic">
              <strong>Revision Note:</strong> {st.feedback}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!showNote ? (
              <button onClick={() => setShowNote(true)} className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1">
                <MessageSquare size={12} /> Send Feedback
              </button>
            ) : (
              <div className="flex-1 space-y-2">
                <textarea 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                  placeholder="Review teammate's work..."
                  className="w-full text-xs p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  rows="2"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNote(false)} className="text-[10px] text-slate-400">Cancel</button>
                  <button 
                    onClick={() => { onReview(st.id, note); setShowNote(false); setNote(""); }} 
                    className="text-[10px] font-semibold bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-indigo-700 transition-colors"
                  >
                    <Send size={10} /> Send Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
         <div className="border border-indigo-100 rounded-lg p-4 bg-white space-y-4">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Edit Subtask for {st.assignee}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title</label>
                <input 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instructions / Specifics</label>
                <textarea 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 col-span-2">
                <div className="flex-[2] min-w-0">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                  <select 
                    value={formData.memberUserId} onChange={e => setFormData({...formData, memberUserId: e.target.value})}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 min-h-[40px]"
                  >
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.userId}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deadline</label>
                  <CalendarPicker 
                    value={formData.deadline} 
                    onChange={val => setFormData({...formData, deadline: val})}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 px-3">Cancel</button>
              <button onClick={handleSaveEdit} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">Update Task</button>
            </div>
         </div>
      )}
    </div>
  );
}

function TaskShareCard({ task, teamMembers, onAssign, onUpdate, onDelete, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", memberUserId: "", deadline: "" });

  const handleAssign = () => {
    if (!formData.title || !formData.memberUserId) return alert("Title and Assignee are required");
    onAssign({ ...formData, parent_id: task.id_task });
    setShowAssignForm(false);
    setFormData({ title: "", description: "", memberUserId: "", deadline: "" });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left w-full">
      <div className="px-5 py-4 cursor-pointer flex justify-between items-center" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
            <p className="text-[11px] text-slate-500">Manage team delegation for this task</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 space-y-4 border-t border-slate-50">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Details</p>
            <p className="text-xs text-slate-700 leading-relaxed">{task.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teammate Delegations</p>
            {task.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-2">
                {task.subtasks.map(st => (
                  <DelegatedWorkRow 
                    key={st.id} st={st} 
                    teamMembers={teamMembers}
                    onReview={onReview} 
                    onUpdate={onUpdate} 
                    onDelete={onDelete} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No tasks shared with members yet.</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            {!showAssignForm ? (
              <button 
                onClick={() => { setFormData({title:"", description:"", memberUserId:"", deadline:""}); setShowAssignForm(true); }}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus size={14} /> Assign New Task to Member
              </button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
                <p className="text-xs font-bold text-slate-700">Assign New Subtask</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title for Member</label>
                    <input 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Drafting the ERD Diagram"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Detail / Instructions</label>
                    <textarea 
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Type specific instructions for this member..."
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                    />
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 col-span-2">
                    <div className="flex-[2] min-w-0">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign To</label>
                      <select 
                        value={formData.memberUserId} onChange={e => setFormData({...formData, memberUserId: e.target.value})}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 min-h-[40px]"
                      >
                        <option value="">Select Member</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.userId}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deadline</label>
                      <CalendarPicker 
                        value={formData.deadline} 
                        onChange={val => setFormData({...formData, deadline: val})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => { setShowAssignForm(false); }} className="text-xs text-slate-400 px-3">Cancel</button>
                  <button onClick={handleAssign} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-md">Assign Member</button>
                </div>
              </div>
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

  useEffect(() => { fetchLeaderData(); }, []);

  const fetchLeaderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const [membersRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/leader/team-members`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/leader/tasks`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (membersRes.ok) setTeamMembers((await membersRes.json()).data || []);
      if (tasksRes.ok) setTasksToShare((await tasksRes.json()).data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleAssignTask = async (data) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to assign");
      alert("Task delegated to member!");
      fetchLeaderData();
    } catch (err) { alert(err.message); }
  };

  const handleUpdateSubTask = async (taskId, data) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/subtask/${taskId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update");
      alert("Task updated!");
      fetchLeaderData();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteSubTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this subtask?")) return;
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/subtask/${taskId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("Task deleted!");
      fetchLeaderData();
    } catch (err) { alert(err.message); }
  };

  const handleReviewTask = async (subtaskId, notes) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/${subtaskId}/review`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notes, status: "in_progress" }) // Push back to in progress
      });
      if (!res.ok) throw new Error("Failed to send feedback");
      alert("Revision note sent to member!");
      fetchLeaderData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <DashboardLayout company={company}><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout userName={user?.name} userPhoto={user?.photo} company={company}>
      <div className="space-y-6 text-left w-full">
        <div className="text-left w-full">
          <h1 className="text-2xl font-bold text-slate-900 text-left">Team Management</h1>
          <p className="text-sm text-slate-500 mt-1 text-left">Share mentor tasks and review member submissions</p>
        </div>

        {error && <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm">{error}</div>}

        <div className="space-y-4 w-full">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-slate-800">Tasks to Share with Members</h2>
            <p className="text-xs text-slate-500">Review tasks from your mentor and delegate parts to your team.</p>
          </div>

          {tasksToShare.length > 0 ? (
            <div className="space-y-3 w-full">
              {tasksToShare.map(task => (
                <TaskShareCard 
                  key={task.id_task} 
                  task={task} 
                  teamMembers={[
                    { id: 'leader', userId: user?.id_user, name: user?.name + " (You)" },
                    ...teamMembers
                  ]} 
                  onAssign={handleAssignTask}
                  onUpdate={handleUpdateSubTask}
                  onDelete={handleDeleteSubTask}
                  onReview={handleReviewTask}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center w-full">
              <Plus size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-700 font-semibold text-sm">No tasks assigned from mentor yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

