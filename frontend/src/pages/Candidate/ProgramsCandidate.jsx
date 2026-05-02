import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, LogOut, Search, ChevronDown, ChevronUp,
  CheckCircle, Clock, Target, Copy, Check, X,
  Link2, Crown, Users, Shield, Download, Sparkles,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import SidebarCandidate from "../../components/SidebarCandidate";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const getToken = () => localStorage.getItem("auth_token") || localStorage.getItem("token");
const getStoredCompany = () => {
  try { return JSON.parse(localStorage.getItem("company") || "{}") || null; }
  catch { return null; }
};

// ── Invitation Modal ──────────────────────────────────────────────
function InvitationModal({ program, onClose, onCreated }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [teamName, setTeamName] = useState("");
  const [maxMembers, setMaxMembers] = useState(3);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [existingInvitations, setExistingInvitations] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    const load = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/team-invitations`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    const list = data.data || data || [];
    console.log("ALL INVITATIONS:", list);
    console.log("PROGRAM:", program.id_submission);
    const relevant = list.filter(
      inv => inv.id_submission === program.id_submission || inv.submission_id === program.id_submission
    );
    console.log("RELEVANT:", relevant);
    setExistingInvitations(relevant);
  } catch { /* ignore */ }
};
    load();
  }, [program.id_submission]);

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    const members = isNaN(maxMembers) || maxMembers < 1 ? 1 : maxMembers;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/team-invitations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id_submission: program.id_submission, team_name: teamName.trim(),  max_members: members }),
      });
    const data = await res.json();
    if (!res.ok) {
      if (data.already_has_team) {
        // Sudah punya tim, redirect langsung ke dashboard leader
        const updatedUser = { ...user, scoped_role: "leader" };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        const company = JSON.parse(localStorage.getItem("company") || "{}");
        const idCompany = company?.id_company;
        if (idCompany) window.location.href = `/c/${idCompany}/dashboard`;
        return;
      }
      throw new Error(data.message || "Failed");
    }
      const token = data.data?.token || data.token;
      setGeneratedLink(`${window.location.origin}/join-team/${token}`);

      // Update user object di localStorage supaya sidebar detect role leader
      const updatedUser = { ...user, scoped_role: "leader" };
      localStorage.setItem("user", JSON.stringify(updatedUser));

        // Redirect ke leader dashboard setelah 2.5 detik
      setTimeout(() => {
        const company = JSON.parse(localStorage.getItem("company") || "{}");
        const idCompany = company?.id_company;
        if (idCompany) window.location.href = `/c/${idCompany}/dashboard`;
      }, 2500);

      } catch (e) { alert(e.message); } finally { setLoading(false); }
    };

    const copyLink = async (link, idx = null) => {
      await navigator.clipboard.writeText(link);
      if (idx !== null) { setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); }
      else { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100"
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
              <Link2 size={18} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Create Team Invitation</div>
              <div className="text-[11px] text-white/70">{program.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "none" }}><X size={15} /></button>
        </div>

        <div className="p-6">
          {/* Existing active links */}
          {!loadingExisting && existingInvitations.length > 0 && (
            <div className="mb-5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Active Links</div>
              {existingInvitations.map((inv, i) => {
                const link = `${window.location.origin}/join-team/${inv.token}`;
                return (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2">
                    <div className="text-xs font-bold text-slate-700 mb-2">{inv.team_name || "Team"}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 overflow-hidden text-ellipsis whitespace-nowrap">{link}</div>
                      <button onClick={() => copyLink(link, i)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1.5 text-white border-0 transition-all"
                        style={{ background: copiedIdx === i ? "#10b981" : "#4f46e5" }}>
                        {copiedIdx === i ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-slate-100 my-4" />
            </div>
          )}

          {!generatedLink ? (
            <>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Team Name *</label>
                <input
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Team Alpha, Innovation Group..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Members</label>
                <input
                  type="number" min={1} max={20}
                  value={maxMembers}
                  onChange={e => {
                        const val = parseInt(e.target.value);
                        setMaxMembers(isNaN(val) ? 1 : val);
                    }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                />
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl mb-5 text-xs text-indigo-700"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <Sparkles size={13} className="mt-0.5 shrink-0" />
                <span>Share the generated link with other candidates. They'll automatically join your team when they open it.</span>
              </div>
              <button
                onClick={handleCreate}
                disabled={loading || !teamName.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white border-0 transition-all"
                style={{
                  background: teamName.trim() ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#e2e8f0",
                  color: teamName.trim() ? "#fff" : "#94a3b8",
                  cursor: teamName.trim() ? "pointer" : "not-allowed",
                  fontFamily: "Poppins, sans-serif"
                }}>
                {loading ? "Creating..." : "Create Invitation Link"}
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#ecfdf5" }}>
                <CheckCircle size={28} color="#10b981" />
              </div>
              <div className="text-base font-bold text-slate-800 mb-1">Link Created!</div>
              <div className="text-xs text-slate-500 mb-5">Share this link with your team members.</div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-left">
                <div className="text-[11px] font-bold text-slate-400 mb-2">INVITATION LINK</div>
                <div className="text-xs text-slate-700 break-all leading-relaxed">{generatedLink}</div>
              </div>
              <button
                onClick={() => copyLink(generatedLink)}
                className="w-full py-3 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 text-white border-0 transition-all"
                style={{ background: copied ? "#10b981" : "linear-gradient(135deg, #4f46e5, #7c3aed)", fontFamily: "Poppins, sans-serif" }}>
                {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Link</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Role Choice Modal ─────────────────────────────────────────────
function RoleChoiceModal({ program, onClose, onSelectLeader, onSelectMember }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100"
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Join as...</div>
              <div className="text-[11px] text-white/70">{program.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "none" }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <p className="text-xs text-slate-500 text-center mb-2">
            Choose your role in this program's team.
          </p>

          {/* Leader Option */}
          <button
            onClick={onSelectLeader}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer text-left"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-100 border border-yellow-200 flex items-center justify-center flex-shrink-0">
              <Crown size={20} className="text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-yellow-800">Create Team (Leader)</div>
              <div className="text-[11px] text-yellow-600 mt-0.5">
                Create a team & generate an invitation link for members.
              </div>
            </div>
          </button>

          {/* Member Option */}
          <button
            onClick={onSelectMember}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer text-left"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-green-800">Join Team (Member)</div>
              <div className="text-[11px] text-green-600 mt-0.5">
                Join an existing team using an invitation link from your leader.
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Join Team Modal (input kode) ──────────────────────────────────
function JoinTeamModal({ onClose, onJoined }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ekstrak token dari full URL atau bare token
  const extractToken = (input) => {
    try {
      const url = new URL(input);
      const parts = url.pathname.split("/");
      return parts[parts.length - 1];
    } catch {
      return input.trim();
    }
  };

  const handleJoin = async () => {
    const token = extractToken(code);
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/team-invitations/${token}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
          if (res.ok || data.already_joined) {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, scoped_role: "member" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onClose();
      onJoined?.();
    }else {
        setError(data.message || "Failed to join team.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.2)" }}>
              <Users size={18} color="#fff" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Join a Team</div>
              <div className="text-[11px] text-white/70">Paste the invitation link from your leader</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "none" }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Invitation Link or Code
            </label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="https://...join-team/xxxxx or token"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-green-400 transition-colors"
              style={{ fontFamily: "Poppins, sans-serif" }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold text-white border-0 transition-all"
            style={{
              background: code.trim() ? "linear-gradient(135deg, #10b981, #059669)" : "#e2e8f0",
              color: code.trim() ? "#fff" : "#94a3b8",
              cursor: code.trim() ? "pointer" : "not-allowed",
              fontFamily: "Poppins, sans-serif"
            }}>
            {loading ? "Joining..." : "Join Team"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Competency Item ───────────────────────────────────────────────
function CompetencyItem({ name, description, learning_hours }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl">
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600">
        <BookOpen size={14} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-semibold text-slate-700 leading-tight mb-1">{name}</p>
        {description && <p className="text-[11px] text-slate-500 line-clamp-2">{description}</p>}
      </div>
      <span className="flex-shrink-0 text-[10px] px-2 py-1 rounded-md font-bold border bg-slate-50 text-slate-600 border-slate-200">
        {learning_hours} hrs
      </span>
    </div>
  );
}

// ── Program Card ──────────────────────────────────────────────────
function ProgramCard({ program, onOpenInvitation, onChooseRole }) {
  const [expanded, setExpanded] = useState(false);
  const [invLinks, setInvLinks] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);
  const { name, description, batch, company, competencies, status, has_loa, loa_file_url, team } = program;
  const userRole = team?.role?.toLowerCase() || null;
  const isLeader = userRole === "leader";
  const isAccepted = status === "accepted";
  const isPending = status === "pending";
  const isRejected = status === "rejected";
  const isMember = userRole === "member";
  const hasTeam = !!team;

  useEffect(() => {
     console.log("ROLE:", userRole, "isLeader:", isLeader);
      if (!isLeader) return;
      const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/team-invitations`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        const list = data.data || data || [];
        console.log("TEAM-INVITATIONS RAW:", JSON.stringify(list));
        const relevant = list;
        console.log("RELEVANT:", JSON.stringify(relevant));
        setInvLinks(relevant);
      } catch { /* ignore */ }
    };
    load();
  }, [isLeader, program.id_submission]);

  const copyInvLink = async (link, token) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getStatusBadge = () => {
    if (isAccepted) return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap"><CheckCircle size={12} /> ACCEPTED</span>;
    if (isPending) return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap"><Clock size={12} /> IN REVIEW</span>;
    if (isRejected) return <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap"><AlertCircle size={12} /> NOT SELECTED</span>;
    return <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[11px] font-bold">{status}</span>;
  };

  const downloadFile = (url, fallbackName) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative transition-all">
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isAccepted ? "bg-emerald-500" : isPending ? "bg-amber-400" : isRejected ? "bg-rose-500" : "bg-slate-300"}`} />

      <div className="p-4 ml-1.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Program details */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-slate-800 break-words">{name}</h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-indigo-600 truncate">{company}</span>
            {batch && <><span className="text-slate-300">•</span><span className="text-xs font-medium text-slate-500">{batch}</span></>}
          </div>
          {description && (
            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed max-w-xl">Focus on {description}</p>
          )}

          {/* Team badge */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {hasTeam ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${isLeader ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                {isLeader ? <Crown size={11} /> : <Users size={11} />}
                {team.name || team.team_name} · as {isLeader ? "Leader" : "Member"}
              </div>
            ) : (
              isAccepted ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-500 bg-amber-50 border border-amber-200">
                  <Shield size={11} /> Not joined a team yet
                </div>
              ) : null
            )}
          </div>
        </div>
        {/* Invitation link history — hanya untuk leader */}
        {isLeader && (
          <div className="mt-3 w-full md:w-auto">
            {invLinks.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Invitation Links
                </p>
                {invLinks.map((inv, i) => {
                  const link = `${window.location.origin}/join-team/${inv.token}`;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                      <Link2 size={11} className="text-indigo-400 flex-shrink-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-indigo-700 truncate">
                          {inv.team_name || "Team"}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                           {`${window.location.origin}/join-team/${inv.token}`}
                        </span>
                      </div>
                      <button
                        onClick={() => copyInvLink(link, inv.token)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border-0 cursor-pointer transition-all flex-shrink-0"
                        style={{
                          background: copiedLink === inv.token ? "#10b981" : "#4f46e5",
                          color: "#fff",
                        }}
                      >
                        {copiedLink === inv.token ? (
                          <><Check size={10} /> Copied</>
                        ) : (
                          <><Copy size={10} /> Copy</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <Link2 size={11} className="text-amber-400 flex-shrink-0" />
                <span className="text-[11px] text-amber-600 font-semibold">
                  No invitation link yet — click <strong>Manage Team</strong> to create one
                </span>
              </div>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto shrink-0">
          <div className="flex gap-2 flex-wrap md:justify-end">
            {/* LoA */}
            <button
              disabled={!isAccepted || !has_loa}
              onClick={() => { if (has_loa && loa_file_url) downloadFile(loa_file_url, `LoA_${company}.pdf`); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-0
                ${isAccepted && has_loa
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              <Download size={13} />
              {isAccepted && has_loa ? "Download LoA" : "LoA Not Available"}
            </button>

            {/* Create / Manage Team — only accepted, not a member */}
            {isAccepted && (
            <>
              {isLeader && (
                <button
                  onClick={() => onOpenInvitation(program)}
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border transition-colors"
                  style={{ background: "#fff", borderColor: "#e2e8f0", color: "#4f46e5" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <Link2 size={13} />
                  Manage Team
                </button>
              )}
              {!hasTeam && (
                <button
                  onClick={() => onChooseRole(program)}
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border transition-colors"
                  style={{ background: "#fff", borderColor: "#e2e8f0", color: "#4f46e5" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <Link2 size={13} />
                  Join / Create Team
                </button>
              )}
            </>
          )}
          </div>

          {/* Competencies toggle */}
          {isAccepted && competencies?.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center justify-end gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
            >
              {expanded ? "Hide" : "View"} Competencies
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable competencies */}
      {expanded && isAccepted && (
        <div className="ml-1.5 px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50">
          <h4 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-1.5">
            <Target size={14} className="text-indigo-400" /> Target Competencies & Modules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {competencies.map((comp, i) => (
              <CompetencyItem key={i} {...comp} />
            ))}
            {competencies.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs font-medium text-slate-400">
                No competencies yet for this position.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProgramsPage() {
  const navigate = useNavigate();
  const { logout: globalLogout } = useAuthStore();

  const [search, setSearch] = useState("");
  const [userData, setUserData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationTarget, setInvitationTarget] = useState(null);
  const [roleChoiceTarget, setRoleChoiceTarget] = useState(null);
  const [joinModal, setJoinModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [storedCompany, setStoredCompany] = useState(getStoredCompany());

const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) { navigate("/"); return; }

        const subRes = await fetch(`${API_BASE_URL}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subRes.status === 401) { localStorage.clear(); navigate("/"); return; }
        const subData = await subRes.json();
        const raw = subData.data || subData;
        setPrograms(Array.isArray(raw) ? raw : []);

        const userRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const d = await userRes.json();
          setUserData(d.data || d);
          if (!getStoredCompany()?.id_company && d.data?.id_company) {
            const companyData = { id_company: d.data.id_company };
            localStorage.setItem("company", JSON.stringify(companyData));
            setStoredCompany(companyData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally { setLoading(false); }
    }, [navigate]);

useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = programs.filter(p => {
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.company?.toLowerCase().includes(q);
  });

  const handleChooseRole = (program) => setRoleChoiceTarget(program);
  const handleSelectLeader = () => {
    setInvitationTarget(roleChoiceTarget);
    setRoleChoiceTarget(null);
  };
  const handleSelectMember = () => {
    setRoleChoiceTarget(null);
    setJoinModal(true);
  };

  const handleLogout = () => setLogoutModal(true);
  const confirmLogout = async () => {
    try {
        await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${getToken()}` },
        });
    } catch (e) {
        // tetap logout meski request gagal
    } finally {
        localStorage.clear();
        globalLogout();
        navigate("/");
    }
};

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Poppins, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

      <SidebarCandidate
          userName={userData?.name || userData?.full_name}
          userPhoto={userData?.profile_picture || userData?.photo_url || userData?.photo_path}
          company={storedCompany}
          onLogout={handleLogout}
      />

      <div className="ml-56 flex-1 flex flex-col">
        <main className="p-6 space-y-5">
          {loading ? (
            <LoadingSpinner message="Loading programs..." />
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">Error: {error}</div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Programs</h1>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
                  Internship programs you are currently participating in and have applied for.
                </p>
              </div>

              {/* Search */}
              <div className="flex items-center justify-end gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-80 group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Search programs or companies..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {filtered.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      PROGRAMS ({filtered.length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    {filtered.map((p, i) => (
                      <ProgramCard
                        key={p.id_submission || p.id_position || i}
                        program={p}
                        onOpenInvitation={setInvitationTarget}
                        onChooseRole={handleChooseRole}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <BookOpen size={40} />
                  </div>
                  <p className="text-slate-400 font-medium">
                    No programs found. Apply for a program to get started!
                  </p>
                </div>
              )}

              <footer className="text-center text-xs text-slate-400 pt-10 pb-4">
                © 2026 EarlyPath · All rights reserved
              </footer>
            </>
          )}
        </main>
      </div>

      {roleChoiceTarget && (
        <RoleChoiceModal
          program={roleChoiceTarget}
          onClose={() => setRoleChoiceTarget(null)}
          onSelectLeader={handleSelectLeader}
          onSelectMember={handleSelectMember}
        />
      )}

      {joinModal && (
        <JoinTeamModal onClose={() => setJoinModal(false)}  onJoined={fetchData} />
      )}

      {invitationTarget && (
        <InvitationModal
          program={invitationTarget}
          onClose={() => setInvitationTarget(null)}
          onCreated={() => setInvitationTarget(null)}
        />
      )}

      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "left" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}>
              <LogOut size={20} />
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Are you sure you want to sign out of your account?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }