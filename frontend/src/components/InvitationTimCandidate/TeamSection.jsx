import { useState, useEffect } from "react";
import { Copy, Share2, Users, User, Calendar, AlertCircle, CheckCircle, Loader, RefreshCw } from "lucide-react";

/**
 * Unified Team Section Component
 * Handles:
 * - Leader: Create and manage team invitations
 * - Member: View team information
 * - Public: Join team via invitation link (in modal)
 * - Submitted (no team): Create new team
 */
export default function TeamSection({ program, userRole = null, team = null, isPublic = false, token = null, onSuccess = null, onClose = null, hasSubmission = false, onTeamCreated = null }) {
  const [showModal, setShowModal] = useState(isPublic);
  const [loading, setLoading] = useState(isPublic);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [localTeam, setLocalTeam] = useState(team);
  const storedCompany = JSON.parse(localStorage.getItem("company") || "{}");
  const companyId = storedCompany?.id_company;

  const [formData, setFormData] = useState({
    team_name: team?.name || "",
    max_members: 5,
    expires_days: 30,
  });

  const [teamFormData, setTeamFormData] = useState({
    team_name: "",
    max_members: 5,
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");

  // Validate invitation on mount (for public join flow)
  useEffect(() => {
    if (isPublic && token) {
      validateInvitation();
    }
  }, [token, isPublic]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/team-invitations/${token}/validate`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid invitation link");
        return;
      }

      if (!data.valid) {
        setError(data.message || "This invitation is not valid");
        return;
      }

      setInvitationData(data.data);
    } catch (err) {
      setError("Failed to validate invitation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreatingTeam(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(teamFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle "already has team" error
        if (data.already_has_team) {
          setError(data.message);
          // Don't clear error immediately - keep it visible
          return;
        }
        throw new Error(data.message || "Failed to create team");
      }

      // Team created successfully
      setLocalTeam(data.data);
      setShowCreateTeamModal(false);
      setSuccess(true);
      onTeamCreated?.(data.data);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/team-invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id_team: team?.id_team,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create invitation");
      }

      setInvitationData(data.data);
      setSuccess(true);
      setShowModal(false);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!authToken) {
      sessionStorage.setItem('pendingInvitationToken', token);
      window.location.href = companyId ? `/c/${companyId}/login` : '/';

      return;
    }

    try {
      setJoining(true);
      const response = await fetch(`${API_BASE_URL}/team-invitations/${token}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id_team: invitationData?.id_team,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to join team");
        return;
      }

      setJoined(true);
      onSuccess?.(data.data);

      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err) {
      setError("Failed to join team: " + err.message);
    } finally {
      setJoining(false);
    }
  };

  const copyToClipboard = () => {
    if (invitationData?.invitation_link) {
      navigator.clipboard.writeText(invitationData.invitation_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ========== SUBMITTED (NO TEAM) - CREATE TEAM VIEW ==========
  if (hasSubmission && !localTeam && !isPublic) {
    const isTeamCreationBlocked = error && error.includes('already have a team');

    return (
      <div className="space-y-4">
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-sm font-bold">
            <CheckCircle size={16} />
            Team created successfully! You can now create an invitation link.
          </div>
        )}

        {isTeamCreationBlocked && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">Team Already Created</p>
              <p className="text-xs text-amber-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowCreateTeamModal(true)}
          disabled={isTeamCreationBlocked}
          className="w-full px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          style={{
            background: isTeamCreationBlocked ? '#e2e8f0' : '#4f46e5',
            color: isTeamCreationBlocked ? '#94a3b8' : 'white',
          }}
        >
          <Users size={16} />
          {isTeamCreationBlocked ? 'Team Already Created' : 'Create Your Team'}
        </button>

        {showCreateTeamModal && !isTeamCreationBlocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateTeamModal(false)} />
            
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Create Your Team</h3>
                
                {error && !isTeamCreationBlocked && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={teamFormData.team_name}
                      onChange={(e) => setTeamFormData({ ...teamFormData, team_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Engineering Squad"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Max Members</label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={teamFormData.max_members}
                      onChange={(e) => setTeamFormData({ ...teamFormData, max_members: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">You can invite up to this many members</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateTeamModal(false)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingTeam}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creatingTeam ? <Loader size={14} className="animate-spin" /> : <Users size={14} />}
                      Create Team
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== MEMBER VIEW ==========
  if (userRole === "member" && localTeam) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-50/50 border border-slate-200 rounded-2xl space-y-3">
        <div>
          <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Users size={16} className="text-indigo-600" />
            Your Team
          </h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div>
              <p className="text-sm font-bold text-slate-900">{localTeam.name}</p>
              <p className="text-xs text-slate-500">Team Name</p>
            </div>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md">
              {localTeam.role}
            </span>
          </div>

          {localTeam.member_count && (
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <User size={14} />
                <span className="text-xs font-medium">{localTeam.member_count} members</span>
              </div>
              <span className="text-xs text-slate-500">{localTeam.member_count}/{localTeam.max_members}</span>
            </div>
          )}

          {localTeam.leader_name && (
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <User size={14} />
                <span className="text-xs font-medium">Team Leader</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">{localTeam.leader_name}</span>
            </div>
          )}

          {program?.name && (
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} />
                <span className="text-xs font-medium">Program</span>
              </div>
              <span className="text-xs font-semibold text-slate-900">{program.name}</span>
            </div>
          )}

          {localTeam.joined_at && (
            <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} />
                <span className="text-xs font-medium">Joined</span>
              </div>
              <span className="text-xs text-slate-700">{new Date(localTeam.joined_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== LEADER VIEW ==========
  if (userRole === "leader" && localTeam) {
    // Show invitation details if created
    if (invitationData) {
      return (
        <div className="space-y-4">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-sm font-bold">
              <CheckCircle size={16} />
              Invitation created successfully!
            </div>
          )}

          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2">
              <Users size={16} />
              Team Invitation Link
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-white border border-indigo-200 rounded-xl">
                <p className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Shareable Link</p>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 truncate">
                    {invitationData?.invitation_link}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copied && <p className="text-xs text-emerald-600 font-bold mt-1.5">✓ Copied!</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold mb-1">Max Members</p>
                  <p className="text-lg font-bold text-slate-900">{invitationData?.max_members}</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold mb-1">Used</p>
                  <p className="text-lg font-bold text-slate-900">{invitationData?.used_count}/{ invitationData?.max_members}</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 font-bold mb-1">Expires</p>
                <p className="text-sm text-slate-700">{new Date(invitationData?.expires_at).toLocaleDateString()}</p>
              </div>
            </div>

            <button
              onClick={() => setInvitationData(null)}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Create New Link
            </button>
          </div>
        </div>
      );
    }

    // Show form to create invitation
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
        >
          <Share2 size={16} />
          Create Team Invitation Link
        </button>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Create Team Invitation</h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateInvitation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={formData.team_name}
                      onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter team name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Max Members</label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Invitation Expires In (days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.expires_days}
                      onChange={(e) => setFormData({ ...formData, expires_days: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader size={14} className="animate-spin" /> : <Share2 size={14} />}
                      Create Link
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== PUBLIC JOIN VIEW ==========
  if (isPublic) {
    if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center">
            <Loader className="w-10 h-10 text-indigo-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Validating invitation...</p>
          </div>
        </div>
      );
    }

    if (error && !joined) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Invalid Invitation</h3>
              <p className="text-slate-600 text-sm mb-6">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (joined) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to the Team!</h3>
              <p className="text-slate-600 text-sm mb-2">You've successfully joined</p>
              <p className="text-lg font-bold text-indigo-600 mb-6">{invitationData?.team_name}</p>
              <p className="text-xs text-slate-500">Redirecting...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Join Team</h3>
          <p className="text-slate-600 text-sm mb-6">You've been invited to join a team for a program</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {invitationData && (
            <div className="mb-6 space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-xs text-indigo-600 font-bold mb-1">Team Name</p>
                <p className="text-lg font-bold text-indigo-900">{invitationData?.team_name}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600 font-bold mb-1">Max Members</p>
                  <p className="text-sm font-bold text-slate-900">{invitationData?.max_members}</p>
                </div>
                <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600 font-bold mb-1">Available Spots</p>
                  <p className="text-sm font-bold text-slate-900">{invitationData?.max_members - (invitationData?.used_count || 0)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleJoinTeam}
              disabled={joining}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {joining ? <Loader size={14} className="animate-spin" /> : <Users size={14} />}
              Join Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
