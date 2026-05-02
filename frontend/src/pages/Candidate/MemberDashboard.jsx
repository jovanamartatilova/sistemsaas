import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Link2, Upload, Plus, Trash2, ExternalLink, Info, MessageSquare, Users } from "lucide-react";

import { useAuthStore } from "../../stores/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getScopedRole } from "../../utils/roleUtils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [attachments, setAttachments] = useState([{ type: "link", label: "", value: "" }]);
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const norm = task.status?.toLowerCase().replace(" ", "_") || "pending";
  const cfg = STATUS_CONFIG[norm] || STATUS_CONFIG.pending;
  const isSubmitted = !!task.submitted_at;
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try { await onStatusChange(task.id_task, newStatus); }
    finally { setIsUpdating(false); }
  };

  const handleSyncMemberWork = () => {
    if (!task.subtasks || task.subtasks.length === 0) return alert("No member work to sync.");
    const newAttachments = [];
    task.subtasks.forEach(st => {
      if (st.work?.length > 0) {
        st.work.forEach(w => {
          newAttachments.push({ type: "link", label: `${st.assignee}: ${w.label}`, value: w.value });
        });
      }
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
      const res = await fetch(`${API_BASE_URL}/intern/tasks/${task.id_task}/work`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ attachments: valid }),
      });
      if (!res.ok) throw new Error("Submit failed");
      onWorkSubmitted(task.id_task, valid);
      setShowSubmitForm(false);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-left w-full">
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <StatusIcon status={norm} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {task.deadline && `Due ${new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            {isSubmitted && <span className="ml-2 text-emerald-500 font-bold">✓ Submitted</span>}
          </p>
        </div>
        <select
          value={norm}
          onChange={e => { e.stopPropagation(); handleStatusChange(e.target.value); }}
          onClick={e => e.stopPropagation()}
          disabled={isUpdating || (isSubmitted && !task.feedback_notes)}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none ${cfg.cls}`}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-5 bg-white">
          {task.feedback_notes && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex gap-3 items-start">
              <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Revision Feedback</p>
                <p className="text-xs text-rose-800 leading-relaxed italic mt-1">"{task.feedback_notes}"</p>
                <p className="text-[9px] text-rose-400 mt-2 font-bold uppercase underline">Please resubmit with updates</p>
              </div>
            </div>
          )}

          {task.parent_task && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <Info size={12} /> Master Task Context
              </p>
              <div>
                <p className="text-[11px] font-bold text-slate-800">{task.parent_task.title}</p>
                <p className="text-[11px] text-slate-500 italic leading-relaxed mt-1">{task.parent_task.description}</p>
              </div>

              {task.siblings?.length > 0 && (
                <div className="pt-3 border-t border-slate-200 mt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Team Collaboration Progress</p>
                  <div className="space-y-3">
                    {task.siblings.map(sib => (
                      <div key={sib.id_task} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                              {sib.assignee?.charAt(0) || "U"}
                            </div>
                            <p className="text-[11px] font-bold text-slate-800">{sib.assignee} {sib.id_user === currentUserId ? "(You)" : ""}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sib.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {sib.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block mb-2">{sib.title}</p>
                        {sib.description && (
                          <div className="mb-2 flex items-start gap-1.5 bg-slate-50/50 p-2 rounded border border-slate-100">
                            <Info size={11} className="text-slate-400 mt-0.5" />
                            <p className="text-[10px] text-slate-600 leading-relaxed italic">{sib.description}</p>
                          </div>
                        )}
                        {sib.deadline && (
                          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold text-indigo-500">
                            <Clock size={10} />
                            Due: {new Date(sib.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </div>
                        )}
                        {sib.work?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {sib.work.map((w, idx) => (
                              <a key={idx} href={w.value} target="_blank" rel="noopener noreferrer" className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 hover:underline">
                                <Link2 size={10} /> {w.label}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 border-t border-slate-50">
                          <button onClick={() => { const note = prompt("Feedback:"); if (note) onReviewSibling(sib.id_task, note); }} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"><MessageSquare size={10} /> Notes</button>
                          <div className="flex-1" />
                          {sib.status !== 'done' && (
                            <div className="flex gap-1">
                              <button onClick={() => onReviewSibling(sib.id_task, "[PEER REVISION] Needs updates")} className="text-[9px] px-2 py-1 border border-slate-200 rounded text-slate-400 hover:text-rose-600 font-bold">Revision</button>
                              <button onClick={() => onReviewSibling(sib.id_task, "[PEER APPROVED] Looks good")} className="text-[9px] px-2 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-bold">Approve</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLeader && task.subtasks?.length > 0 && (
            <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Master Control: Member Work</p>
                {!isSubmitted && (
                  <button onClick={handleSyncMemberWork} className="text-[11px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                    <Plus size={14} /> Sync All Work
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {task.subtasks.map(st => (
                  <div key={st.id} className="bg-white border border-indigo-100 rounded-lg p-2.5 flex justify-between items-center">
                    <span className="text-[11px] font-bold">{st.assignee} — <span className="font-normal text-slate-500">{st.title}</span></span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${st.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{st.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.description && (
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Task Specifics</p>
              <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {isSubmitted && task.work_attachments?.length > 0 && (
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Submitted Results</p>
              <div className="flex flex-wrap gap-2">
                {task.work_attachments.map((att, i) => (
                  <a key={i} href={att.value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600">
                    <Link2 size={11} /> {att.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {(!isSubmitted || task.feedback_notes) && (
            <div className="pt-2 border-t border-slate-100">
              {!showSubmitForm ? (
                <button onClick={() => setShowSubmitForm(true)} className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all border border-indigo-100">
                  <Plus size={14} /> {task.feedback_notes ? "Resubmit Work" : "Submit Work"}
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Your Submission</p>
                    <button onClick={() => setShowSubmitForm(false)} className="text-slate-400"><Trash2 size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    {attachments.map((att, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                        <select value={att.type} onChange={e => updateAttachment(i, "type", e.target.value)} className="text-xs border-none bg-slate-50 rounded p-1.5">
                          <option value="link">Link</option>
                          <option value="file">File</option>
                        </select>
                        <input value={att.label} onChange={e => updateAttachment(i, "label", e.target.value)} placeholder="Label" className="flex-1 text-xs border border-slate-100 rounded px-2 py-1.5 outline-none" />
                        {att.type === "link" ? (
                          <input value={att.value} onChange={e => updateAttachment(i, "value", e.target.value)} placeholder="URL" className="flex-1 text-xs border border-slate-100 rounded px-2 py-1.5 outline-none" />
                        ) : (
                          <label className="flex-1 text-center border border-dashed rounded py-1.5 text-[10px] cursor-pointer">
                            {att.value ? "✓ Uploaded" : "Upload File"}
                            <input type="file" className="hidden" onChange={e => e.target.files[0] && handleFileUpload(i, e.target.files[0])} />
                          </label>
                        )}
                        <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-400"><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setAttachments([...attachments, { type: "link", label: "", value: "" }])} className="text-[10px] font-bold text-indigo-600">+ Add line</button>
                    <button onClick={handleSubmit} disabled={submitting} className="text-xs font-bold bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md">{submitting ? "Sending..." : "Send Submission"}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {children && (
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
              {children}
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
      const res = await fetch(`${API_BASE_URL}/member/tasks`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setTasks(data.data || []);
      setInternInfo(data.intern_info || {});
      setCompetencies(data.competencies || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
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

const exportPDF = () => {
  const rows = flattenTasksForLogbook();
  if (!rows.length) return alert("No submitted tasks to export.");
  const isApproved = tasks.some(t => t.logbook_approved);
  if (!isApproved) return alert("Your logbook hasn't been approved by your mentor yet.");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

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
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text((internInfo.company || "").toUpperCase(), pageW / 2, 24, { align: "center" });

  // Info grid — 2 columns
  const boxY = 44;
  const boxH = 44;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, boxY, pageW - 28, boxH, "FD");

  const col1x = 18, col2x = pageW / 2 + 4;
  const fields = [
    ["NAME", user?.name || "-"],
    ["INSTITUTION", internInfo.institution || "-"],
    ["MAJOR", `${internInfo.education_level || ""} - ${internInfo.major || ""}`],
  ];
  const fields2 = [
    ["POSITION", internInfo.position || "-"],
    ["MENTOR", internInfo.mentor_name || user?.mentor_name || "-"],
    ["PRINTED ON", new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
  ];

  fields.forEach((f, i) => {
    const y = boxY + 9 + i * 13;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(f[0], col1x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(f[1], col1x, y + 5);
  });

  fields2.forEach((f, i) => {
    const y = boxY + 9 + i * 13;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(f[0], col2x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(f[1], col2x, y + 5);
  });

  // Activity Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("ACTIVITY LOG", 14, boxY + boxH + 10);
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(14, boxY + boxH + 12, 55, boxY + boxH + 12);

  autoTable(doc, {
    startY: boxY + boxH + 16,
    head: [["No", "Activity", "Description", "Deadline", "Submitted"]],
    body: rows.map((r, i) => [i + 1, r.title, r.description, r.deadline, r.submitted_at]),
    styles: { fontSize: 8, cellPadding: 3.5, overflow: "linebreak", textColor: [30, 41, 59] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 38 },
      2: { cellWidth: 78 },
      3: { cellWidth: 24, halign: "center" },
      4: { cellWidth: 24, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  // Competencies section (if any)
  if (competencies.length > 0) {
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("COMPETENCIES COVERED", 14, finalY);
    doc.setDrawColor(79, 70, 229);
    doc.line(14, finalY + 2, 72, finalY + 2);

    autoTable(doc, {
      startY: finalY + 6,
      head: [["Competency", "Description", "Learning Hours"]],
      body: competencies.map(c => [c.name, c.description || "-", c.learning_hours ? `${c.learning_hours} hrs` : "-"]),
      styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak", textColor: [30, 41, 59] },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.2,
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 110 },
        2: { cellWidth: 27, halign: "center" },
      },
      margin: { left: 14, right: 14 },
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
    doc.text(internInfo.company || "", 14, pageH - 3.5);
    doc.text(new Date().getFullYear().toString(), pageW - 14, pageH - 3.5, { align: "right" });
  }

  doc.save(`logbook_${user?.name || "intern"}_${new Date().toISOString().split("T")[0]}.pdf`);
};

const exportExcel = () => {
  const rows = flattenTasksForLogbook();
  if (!rows.length) return alert("No submitted tasks to export.");
  const isApproved = tasks.some(t => t.logbook_approved);
  if (!isApproved) return alert("Your logbook hasn't been approved by your mentor yet.");

  const wb = XLSX.utils.book_new();

  // Sheet 1: Intern Info
  const infoData = [
    ["INTERNSHIP LOGBOOK"],
    [],
    ["Name", user?.name || "-"],
    ["Institution", internInfo.institution || "-"],
    ["Education Level", internInfo.education_level || "-"],
    ["Major", internInfo.major || "-"],
    ["Position", internInfo.position || "-"],
    ["Company", internInfo.company || "-"],
    ["Mentor", internInfo.mentor_name || "-"],
    ["Printed On", new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  wsInfo["!cols"] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Intern Info");

  // Sheet 2: Activity Log
  const activityData = [
    ["No", "Activity", "Description", "Deadline", "Submitted At"],
    ...rows.map((r, i) => [i + 1, r.title, r.description, r.deadline, r.submitted_at]),
  ];
  const wsActivity = XLSX.utils.aoa_to_sheet(activityData);
  wsActivity["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 50 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsActivity, "Activity Log");

  // Sheet 3: Competencies
  if (competencies.length > 0) {
    const compData = [
      ["Competency", "Description", "Learning Hours"],
      ...competencies.map(c => [c.name, c.description || "-", c.learning_hours || "-"]),
    ];
    const wsComp = XLSX.utils.aoa_to_sheet(compData);
    wsComp["!cols"] = [{ wch: 30 }, { wch: 60 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsComp, "Competencies");
  }

  XLSX.writeFile(wb, `logbook_${user?.name || "intern"}_${new Date().toISOString().split("T")[0]}.xlsx`);
};

  if (loading) return <DashboardLayout company={company}><LoadingSpinner message="Loading My Tasks" /></DashboardLayout>;

  return (
    <DashboardLayout userName={user?.name} userPhoto={userPhoto || user?.photo} company={company}>
      <div className="space-y-6 w-full text-left">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              disabled={!tasks.some(t => t.logbook_approved)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
                tasks.some(t => t.logbook_approved)
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                  : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
              title={!tasks.some(t => t.logbook_approved) ? "Waiting for mentor approval" : "Download Logbook PDF"}
            >
              {tasks.some(t => t.logbook_approved) ? "Logbook (PDF)" : "🔒 Logbook (Pending Approval)"}
            </button>
            <button
              onClick={exportExcel}
              disabled={!tasks.some(t => t.logbook_approved)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
                tasks.some(t => t.logbook_approved)
                  ? "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                  : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
              }`}
              title={!tasks.some(t => t.logbook_approved) ? "Waiting for mentor approval" : "Download Logbook Excel"}
            >
              {tasks.some(t => t.logbook_approved) ? "Logbook (Excel)" : "🔒 Logbook (Pending Approval)"}
            </button>
          </div>
        </div>
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">{error}</div>}
        <div className="space-y-4">
          {(() => {
            // 1. Identify true projects (no parent)
            const rootProjects = tasks.filter(t => !t.parent_task);
            
            // 2. Identify everything else
            const nonRoot = tasks.filter(t => t.parent_task);

            // 3. Build hierarchy: Project -> Target -> Delegation
            const buildHierarchy = (items) => {
              return items.map(item => {
                // Find children for this item
                const children = nonRoot.filter(child => child.parent_task?.id_task === item.id_task);
                return {
                  ...item,
                  children: children.length > 0 ? buildHierarchy(children) : []
                };
              });
            };

            // 4. Determine orphans (tasks whose parent is NOT in our list at all)
            const orphans = nonRoot.filter(t => !tasks.find(p => p.id_task === t.parent_task.id_task));
            
            const finalDisplayList = buildHierarchy([...rootProjects, ...orphans]);

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
                {item.children && item.children.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                      {level === 0 ? "Project Targets" : "Assignments"}
                    </p>
                    {item.children.map(child => renderTaskTree(child, level + 1))}
                  </div>
                )}
              </TaskCard>
            );

            return finalDisplayList.length > 0 ? finalDisplayList.map(item => renderTaskTree(item)) : (
              <div className="p-10 bg-white border border-slate-200 rounded-xl text-center">
                <CheckCircle size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">No tasks assigned yet</p>
              </div>
            );
          })()}
        </div>
      </div>
    </DashboardLayout>
  );
}
