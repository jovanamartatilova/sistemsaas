import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Link2, Upload, Plus, Trash2, ExternalLink, Info, MessageSquare, Users } from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getScopedRole } from "../../utils/roleUtils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}`;

const STATUS_CONFIG = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200" },
  in_progress: { label: "In Progress", cls: "bg-blue-50 text-blue-600 border-blue-200" },
  done: { label: "Done", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

function StatusIcon({ status }) {
  if (status === "done") return <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />;
  if (status === "in_progress") return <Clock size={15} className="text-blue-500 flex-shrink-0" />;
  return <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />;
}

function TaskCard({ task, onStatusChange, onWorkSubmitted, onReviewSibling, currentUserId, isLeader, children }) {
  const [expanded, setExpanded] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(!!(task.feedback_notes || task.parent_feedback_notes || task.feedback));
  const [attachments, setAttachments] = useState([{ type: "link", label: "", value: "" }]);
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const norm = task.status?.toLowerCase().replace(" ", "_") || "pending";
  const cfg = STATUS_CONFIG[norm] || STATUS_CONFIG.pending;
  const isSubmitted = !!task.submitted_at;
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
console.log("task data:", task);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try { await onStatusChange(task.id_task, newStatus); }
    finally { setIsUpdating(false); }
  };

  const handleSyncMemberWork = () => {
    if (!task.subtasks || task.subtasks.length === 0) return alert("No member work to sync.");
    const newAttachments = [];
    task.subtasks.forEach(st => {
      st.delegations?.forEach(d => {
        if (d.work?.length > 0) {
          d.work.forEach(w => {
            newAttachments.push({ type: "link", label: `${d.assignee}: ${w.label}`, value: w.value });
          });
        }
      });
    });
    if (newAttachments.length === 0) return alert("No work submitted by members yet.");
    setAttachments(newAttachments);
    setShowSubmitForm(true);
    setExpanded(true);
  };

  const updateAttachment = (i, field, val) => {
    setAttachments(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      if (field === "type") next[i].value = "";
      return next;
    });
  };

  const handleFileUpload = async (i, file) => {
    setUploading(prev => ({ ...prev, [i]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE_URL}/intern/tasks/${task.id_task}/upload-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      updateAttachment(i, "value", data.url);
      if (!attachments[i].label) updateAttachment(i, "label", file.name);
    } catch (err) { alert(err.message); }
    finally { setUploading(prev => ({ ...prev, [i]: false })); }
  };

  const handleSubmit = async () => {
    const valid = attachments.filter(a => a.label.trim() && a.value.trim());
    if (!valid.length) return alert("Please add at least one link or file.");
    setSubmitting(true);
    try {
      const workEndpoint = `${API_BASE_URL}/intern/tasks/${task.id_task}/work`;

      const res = await fetch(workEndpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ attachments: valid }),
      });
      if (!res.ok) throw new Error("Submit failed");

      const statusEndpoint = isLeader
        ? `${API_BASE_URL}/leader/tasks/${task.id_task}`
        : `${API_BASE_URL}/member/tasks/${task.id_task}`;
      const newStatus = "done";

      await fetch(statusEndpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      onWorkSubmitted(task.id_task, valid);
      setShowSubmitForm(false);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left w-full">
      {/* Project/Task header — clickable accordion */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <StatusIcon status={norm} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {task.deadline && (
              <span className="text-[11px] text-slate-400">
                Due {new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            )}
            {isSubmitted && <span className="text-[11px] text-emerald-500 font-bold">✓ Submitted</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={norm}
            onChange={e => { e.stopPropagation(); handleStatusChange(e.target.value); }}
            onClick={e => e.stopPropagation()}
            disabled={isUpdating || (isSubmitted && !(task.feedback_notes || task.parent_feedback_notes || task.feedback))}
            className={`text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none max-w-[110px] ${cfg.cls}`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {expanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* Feedback/revision banner */}
          {(task.feedback_notes || task.parent_feedback_notes || task.feedback) && (
            <div className="mx-5 mt-4 bg-rose-50 border border-rose-200 rounded-lg p-3 flex gap-3 items-start">
              <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Revision Feedback</p>
                <p className="text-xs text-rose-800 leading-relaxed italic mt-1">"{task.feedback_notes || task.parent_feedback_notes || task.feedback}"</p>
                <p className="text-[9px] text-rose-400 mt-2 font-bold uppercase underline">Please resubmit with updates</p>
              </div>
            </div>
          )}

          {/* Task description */}
          {task.description && (
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Task Specifics</p>
              <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Leader sync button */}
          {isLeader && task.subtasks?.some(st => st.delegations?.length > 0) && (
            <div className="px-5 py-3 border-t border-slate-100">
              {!isSubmitted && (() => {
                const allDelegations = task.subtasks?.flatMap(st => st.delegations || []) || [];
                const anySubmitted = allDelegations.some(d => d.work?.length > 0);
                return (
                  <button
                    onClick={handleSyncMemberWork}
                    disabled={!anySubmitted}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                      anySubmitted ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Plus size={14} /> Sync & Submit to Mentor
                  </button>
                );
              })()}
            </div>
          )}

          {/* Children: tampil sebagai tabel flat, bukan nested card */}
          {children && (
            <div className="border-t border-slate-100">
              <div className="px-5 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Subtasks</p>
              </div>
              <div className="overflow-x-auto -mx-0 sm:mx-0">
                <table className="w-full min-w-[400px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task</th>
                      <th className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Deadline</th>
                      <th className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submitted results */}
          {isSubmitted && task.work_attachments?.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submitted Results</p>
              <div className="flex flex-wrap gap-2">
                {task.work_attachments.map((att, i) => (
                  <a key={i} href={att.value} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600">
                    <Link2 size={11} /> {att.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Submit form */}
          {(!isSubmitted || task.feedback_notes || task.parent_feedback_notes || task.feedback) && (
            <div className="px-5 py-3 border-t border-slate-100">
              {!showSubmitForm ? (
                <button onClick={() => setShowSubmitForm(true)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all border border-indigo-100">
                  <Plus size={14} /> {(task.feedback_notes || task.parent_feedback_notes || task.feedback) ? "Resubmit Work" : "Submit Work"}
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Submission</p>
                    <button onClick={() => setShowSubmitForm(false)} className="text-slate-400"><Trash2 size={14} /></button>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((att, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={att.type}
                            onChange={e => updateAttachment(i, "type", e.target.value)}
                            className="text-xs text-slate-700 bg-slate-100 border border-slate-200 rounded-md px-2 py-1.5 outline-none"
                          >
                            <option value="link">🔗 Link</option>
                            <option value="file">📁 File</option>
                          </select>
                          <input
                            value={att.label}
                            onChange={e => updateAttachment(i, "label", e.target.value)}
                            placeholder="Label (e.g. Final Report)"
                            className="flex-1 min-w-0 text-xs text-slate-800 bg-white border border-slate-200 rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-rose-400 hover:text-rose-600 flex-shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {att.type === "link" ? (
                          <input
                            value={att.value}
                            onChange={e => updateAttachment(i, "value", e.target.value)}
                            placeholder="https://..."
                            className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        ) : (
                          <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-lg py-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                            <span className="text-xs text-slate-500 font-medium">
                              {att.value ? "✓ File uploaded" : "Click to upload file"}
                            </span>
                            <input type="file" className="hidden" onChange={e => e.target.files[0] && handleFileUpload(i, e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setAttachments([...attachments, { type: "link", label: "", value: "" }])} className="text-[10px] font-bold text-indigo-600">+ Add line</button>
                    <button onClick={handleSubmit} disabled={submitting} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md">
                      {submitting ? "Sending..." : "Send Submission"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MemberDashboard() {
  const { user, company } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [internInfo, setInternInfo] = useState({});
  const [competencies, setCompetencies] = useState([]);
  const [logbookDropdown, setLogbookDropdown] = useState(false);

  useEffect(() => {
    fetchMemberTasks();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/candidate/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.photo_url) {
          setUserPhoto(data.data.photo_url);
        }
        if (data.data?.scoped_role || data.data?.is_leader !== undefined) {
          useAuthStore.getState().setUser({ 
            scoped_role: data.data.scoped_role,
            is_leader: data.data.is_leader
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

const fetchMemberTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const scopedRole = getScopedRole(user);
      const endpoint = scopedRole === "leader" ? `/leader/tasks` : `/member/tasks`;
      console.log(`[LOGBOOK DEBUG] Fetching from ${endpoint} with role: ${scopedRole}`);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      console.log(`[LOGBOOK DEBUG] Response data:`, data);
      const tasksData = data.data || [];
      const hasApproved = tasksData.some(t => t.logbook_approved);
      console.log(`[LOGBOOK DEBUG] Tasks count: ${tasksData.length}, Has approved: ${hasApproved}`);
      console.log(`[LOGBOOK DEBUG] Task approval breakdown:`, tasksData.map(t => ({ 
        id: t.id_task, 
        title: t.title, 
        logbook_approved: t.logbook_approved,
        parent_logbook_approved: t.parent_task?.logbook_approved
      })));
      setTasks(tasksData);
      setInternInfo(data.intern_info || {});
      setCompetencies(data.competencies || []);
    } catch (err) { 
      console.error(`[LOGBOOK DEBUG] Error:`, err);
      setError(err.message); 
    }
    finally { setLoading(false); }
  };

  // Helper function to check if logbook is ready to download
  const isLogbookReady = () => {
    console.log("[LOGBOOK READY] Checking logbook approval status:");
    console.log("[LOGBOOK READY] Total tasks:", tasks.length);
    console.log("[LOGBOOK READY] Tasks approval status:", tasks.map(t => ({ 
      title: t.title, 
      approved: t.logbook_approved,
      parent_id: t.parent_id_task
    })));
    
    // Check if ANY task is approved (backend already includes parent hierarchy)
    const isReady = tasks.length > 0 && tasks.some(t => t.logbook_approved);
    console.log("[LOGBOOK READY] Final approval status:", isReady);
    return isReady;
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    const scopedRole = getScopedRole(user);
    const endpoint = scopedRole === "leader" ? `/leader/tasks/${taskId}` : `/member/tasks/${taskId}`;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchMemberTasks();
  };

  const handleReviewSibling = async (subtaskId, notes) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/leader/tasks/${subtaskId}/review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error("Feedback failed");
      alert("Feedback sent!");
      fetchMemberTasks();
    } catch (err) { alert(err.message); }
  };

  const handleWorkSubmitted = (taskId, valid) => {
    fetchMemberTasks();
  };

const flattenTasksForLogbook = () => {
  const rows = [];
  const traverse = (taskList) => {
    taskList.forEach(task => {
      if (task.submitted_at || task.work_attachments?.length > 0) {
        rows.push({
          title: task.title || "-",
          description: task.description || "-",
          status: task.status || "-",
          deadline: task.deadline ? new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-",
          submitted_at: task.submitted_at ? new Date(task.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-",
          attachments: task.work_attachments?.map(a => `${a.label}: ${a.value}`).join("\n") || "-",
        });
      }
      if (task.children?.length > 0) traverse(task.children);
    });
  };
  traverse(tasks);
  return rows;
};

const getCompetenciesFromTasks = () => {
  const seen = new Set();
  const result = [];
  const traverse = (taskList) => {
    taskList.forEach(task => {
      if (!seen.has(task.id_task)) {
        seen.add(task.id_task);
        result.push({
          name: task.title || "-",
          description: task.description || "-",
          learning_hours: null,
        });
      }
      if (task.children?.length > 0) traverse(task.children);
    });
  };
  traverse(tasks);
  return result;
};

const exportPDF = () => {
  const rows = flattenTasksForLogbook();
  const taskCompetencies = getCompetenciesFromTasks();
  const allCompetencies = competencies.length > 0 ? competencies : taskCompetencies;
  if (!rows.length) return alert("No submitted tasks to export.");
  
  if (!isLogbookReady()) {
    console.warn("[LOGBOOK PDF EXPORT] ❌ Download blocked: Logbook not approved");
    return alert("Your logbook hasn't been approved by your mentor yet.");
  }
  console.log("[LOGBOOK PDF EXPORT] ✅ Approval check passed, generating PDF...");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  
  // ═══════════════════════════════════════════════════════════════════════
  // MASTER LAYOUT CONTAINER - Single source of truth for all sections
  // ═══════════════════════════════════════════════════════════════════════
  const mainContainer = {
    x: 12,              // left margin
    width: pageW - 24,  // full content width (pageW - left - right margin)
  };
  mainContainer.right = mainContainer.x + mainContainer.width;

  // Header bar
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 34, pageW, 4, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INTERNSHIP LOGBOOK", pageW / 2, 16, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  const companyName = internInfo?.company ? internInfo.company.toUpperCase() : "COMPANY";
  doc.text(companyName, pageW / 2, 25, { align: "center" });

  const identityCard = {
    x: mainContainer.x,
    y: 50,
    width: mainContainer.width,
    height: 50,
    innerX: mainContainer.x + 4,   
    innerWidth: mainContainer.width - 8, // inner content width (4mm left + right padding)
  };
  identityCard.right = identityCard.x + identityCard.width;
  identityCard.innerRight = identityCard.innerX + identityCard.innerWidth;

  // Draw identity card box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(identityCard.x, identityCard.y, identityCard.width, identityCard.height, "FD");

  // 2 equal columns within identity card
  const colW = identityCard.innerWidth / 2;
  const col1x = identityCard.innerX;
  const col2x = identityCard.innerX + colW;
  
  // Left column (3 fields)
  const leftFields = [
    { label: "NAME", value: user?.name || "-" },
    { label: "INSTITUTION", value: internInfo?.institution || "-" },
    { label: "EDUCATION", value: `${internInfo?.education_level || "-"}${internInfo?.major ? ` (${internInfo.major})` : ""}` }
  ];
  
  // Right column (3 fields)
  const rightFields = [
    { label: "POSITION", value: internInfo?.position || "-" },
    { label: "MENTOR", value: internInfo?.mentor_name || "-" },
    { label: "PRINTED ON", value: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }
  ];

  // Draw left column
  const rowH = 14;
  leftFields.forEach((f, i) => {
    const y = identityCard.y + 4 + i * rowH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(f.label, col1x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    const displayVal = String(f.value).substring(0, 40);
    doc.text(displayVal, col1x, y + 4);
  });
  
  // Draw right column
  rightFields.forEach((f, i) => {
    const y = identityCard.y + 4 + i * rowH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(f.label, col2x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    const displayVal = String(f.value).substring(0, 40);
    doc.text(displayVal, col2x, y + 4);
  });

  const tableWidth = identityCard.width;
  const tableStartX = identityCard.x;
  const centerX = pageW / 2;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("ACTIVITY LOG", centerX, identityCard.y + identityCard.height + 9, { align: "center" });
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(tableStartX, identityCard.y + identityCard.height + 11, tableStartX + tableWidth, identityCard.y + identityCard.height + 11);

  autoTable(doc, {
    startY: identityCard.y + identityCard.height + 14,
    head: [["No", "Activity", "Description", "Deadline", "Submitted"]],
    body: rows.map((r, i) => [
      String(i + 1),
      String(r.title || "-"),
      String(r.description || "-"),
      r.deadline || "-",
      r.submitted_at || "-"
    ]),
    tableWidth: tableWidth,
    styles: {
      fontSize: 10,
      cellPadding: 1.2,
      overflow: "linebreak",
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
      valign: "middle",
      cellPadding: 1.2,
      minCellHeight: 7
    },
    bodyStyles: { minCellHeight: 7, valign: "top", cellPadding: 1.2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
    columnStyles: {
      0: { cellWidth: (tableWidth * 0.054), halign: "center" },
      1: { cellWidth: (tableWidth * 0.108), halign: "left" },
      2: { cellWidth: (tableWidth * 0.568), halign: "left" },
      3: { cellWidth: (tableWidth * 0.135), halign: "center" },
      4: { cellWidth: (tableWidth * 0.135), halign: "center" },
    },
        margin: { left: tableStartX, right: tableStartX, top: 0, bottom: 0 },
    pageBreak: "auto",
  });

  // Competencies section (if any) - PROPERLY CENTERED
  if (allCompetencies.length > 0) {
    const finalY = (doc.lastAutoTable?.finalY ?? (identityCard.y + identityCard.height + 80)) + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("COMPETENCIES COVERED", centerX, finalY, { align: "center" });
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
      doc.line(tableStartX, finalY + 2, tableStartX + tableWidth, finalY + 2);autoTable(doc, {
      startY: finalY + 6,
      head: [["Competency", "Description", "Learning Hours"]],
      body: allCompetencies.map(c => [
        String(c.name || "-"),
        String(c.description || "-"),
        c.learning_hours ? `${c.learning_hours}h` : "-"
      ]),
      tableWidth: tableWidth,
      styles: {
        fontSize: 10,
        cellPadding: 1.2,
        overflow: "linebreak",
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        cellPadding: 1.2,
        minCellHeight: 7
      },
      bodyStyles: { minCellHeight: 7, valign: "top", cellPadding: 1.2 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.1,
      columnStyles: {
        0: { cellWidth: (tableWidth * 0.230), halign: "left" },
        1: { cellWidth: (tableWidth * 0.570), halign: "left" },
        2: { cellWidth: (tableWidth * 0.200), halign: "center" },
      },
      margin: { left: tableStartX, right: tableStartX, top: 0, bottom: 0 },
      pageBreak: "auto",
    });
  }

  // Footer per page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(30, 41, 59);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.text(`Page ${i} of ${totalPages}`, pageW / 2, pageH - 3.5, { align: "center" });
    doc.text(internInfo?.company || "Internship Program", mainContainer.x, pageH - 3.5);
    doc.text(new Date().getFullYear().toString(), pageW - mainContainer.x, pageH - 3.5, { align: "right" });
  }

  doc.save(`logbook_${user?.name || "intern"}_${new Date().toISOString().split("T")[0]}.pdf`);
};

const exportCSV = () => {
  const rows = flattenTasksForLogbook();
  if (!rows.length) return alert("No submitted tasks to export.");
  
  if (!isLogbookReady()) {
    console.warn("[LOGBOOK CSV EXPORT] ❌ Download blocked: Logbook not approved");
    return alert("Your logbook hasn't been approved by your mentor yet.");
  }

  const headers = ["No", "Activity", "Description", "Deadline", "Submitted At", "Attachments"];
  const csvRows = [
    headers,
    ...rows.map((r, i) => [i + 1, r.title, r.description, r.deadline, r.submitted_at, r.attachments])
  ];
  const csv = csvRows.map(r => 
    r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");
  
  // BOM biar Excel auto-detect UTF-8
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `logbook_${user?.name || "intern"}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

 if (loading) return <DashboardLayout company={company}><LoadingSpinner message="Loading My Tasks" /></DashboardLayout>;

  return (
    <DashboardLayout userName={user?.name} userPhoto={userPhoto || user?.photo} company={company}>
      <div className="space-y-6 w-full text-left">
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">{error}</div>}
        {(() => {
          const rootProjects = tasks.filter(t => !t.parent_task);
          const nonRoot = tasks.filter(t => t.parent_task);
          const buildHierarchy = (items, parentFeedback = null) => {
              return items.map(item => {
                const children = nonRoot.filter(child => child.parent_task?.id_task === item.id_task);
                const inheritedFeedback = item.feedback_notes || parentFeedback;
                return {
                  ...item,
                  feedback_notes: inheritedFeedback,
                  children: children.length > 0 ? buildHierarchy(children, inheritedFeedback) : []
                };
              });
            };
          const orphans = nonRoot.filter(t => !tasks.find(p => p.id_task === t.parent_task.id_task));
          const finalDisplayList = buildHierarchy([...rootProjects, ...orphans]);

          console.log("isLeader:", getScopedRole(user), user);
          const renderTaskRow = (item) => {
            const norm = item.status?.toLowerCase().replace(" ", "_") || "pending";
            const cfg = STATUS_CONFIG[norm] || STATUS_CONFIG.pending;
            const isSubmitted = !!item.submitted_at;
            return (
              <tr key={item.id_task} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={norm} />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      {item.description && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.description}</p>}
                      {item.work_attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.work_attachments.map((att, i) => (
                            <a key={i} href={att.value} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 hover:underline">
                              <Link2 size={10} /> {att.label}
                            </a>
                          ))}
                        </div>
                      )}
                      {(item.feedback_notes || item.feedback) && (
                        <div className="mt-1.5 bg-rose-50 border border-rose-100 px-2 py-1 rounded text-[10px] text-rose-700">
                          <span className="font-bold">Revisi:</span> {item.feedback_notes || item.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-[11px] text-slate-500 whitespace-nowrap">
                  {item.deadline ? new Date(item.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${cfg.cls} border whitespace-nowrap`}>
                    {cfg.label}
                    {isSubmitted && " ✓"}
                  </span>
                </td>
              </tr>
            );
          };

      const renderTaskTree = (item, level = 0) => (
        <TaskCard
          key={item.id_task}
          task={item}
          onStatusChange={handleStatusChange}
          onWorkSubmitted={handleWorkSubmitted}
          onReviewSibling={handleReviewSibling}
          currentUserId={user?.id_user}
          isLeader={getScopedRole(user) === 'leader'}
        >
          {item.children && item.children.length > 0
            ? item.children.map(child => renderTaskRow(child))
            : null}
        </TaskCard>
      );

          if (finalDisplayList.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center text-center gap-4 max-w-lg mx-auto min-h-[70vh]">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No tasks yet</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Tasks will appear here once your mentor assigns them. Complete them to earn your certificate!
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  {[
                    { step: "1", label: "Get Accepted" },
                    { step: "2", label: "Receive Tasks" },
                    { step: "3", label: "Submit Work" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                        <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">{s.step}</span>
                        <span className="text-[11px] font-medium text-slate-600">{s.label}</span>
                      </div>
                      {i < 2 && <span className="text-slate-300 text-xs">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 leading-none mb-2">My Tasks</h1>
                  <p className="text-slate-500 text-sm leading-none">Track and submit your assigned tasks.</p>
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
                      <div style={{ padding: "4px 0", fontSize: "11px", fontWeight: 600, color: "#94a3b8", padding: "8px 16px" }}>
                        MY LOGBOOK
                      </div>
                      <button
                        onClick={() => { setLogbookDropdown(false); exportPDF(); }}
                        disabled={!isLogbookReady()}
                        style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: "13px", fontWeight: 600, textAlign: "left", background: "none", border: "none", cursor: isLogbookReady() ? "pointer" : "not-allowed", color: isLogbookReady() ? "#1e293b" : "#94a3b8" }}
                        onMouseEnter={e => { if (isLogbookReady()) e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        {isLogbookReady() ? "📄 Download PDF" : "🔒 PDF (Pending)"}
                      </button>

                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {finalDisplayList.map(item => renderTaskTree(item))}
              </div>
            </>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}