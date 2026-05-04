import { useState } from "react";
import { Copy, RefreshCw, Share2, Lock, Users, Calendar, AlertCircle } from "lucide-react";

/**
 * Component for leaders to create and manage team invitations
 */
export default function LeaderInvitationSection({ program, onInvitationCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    team_name: program?.team?.name || "",
    max_members: 5,
    expires_days: 30,
  });

  const [invitation, setInvitation] = useState(null);
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token");

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/team-invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_team: program?.team?.id_team,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create invitation");
      }

      setInvitation(data.data);
      setSuccess(true);
      onInvitationCreated?.(data.data);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (invitation?.invitation_link) {
      navigator.clipboard.writeText(invitation.invitation_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (invitation?.invitation_link && navigator.share) {
      navigator.share({
        title: `Join ${formData.team_name}`,
        text: `Join our team for the ${program?.name} program!`,
        url: invitation.invitation_link,
      }).catch(() => {});
    }
  };

  if (!invitation) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Create Team Invitation
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
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreateInvitation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Team Name</label>
                    <input
                      type="text"
                      value={formData.team_name}
                      onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                      placeholder="e.g., Mobile Mavens"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Members</label>
                    <input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                      min="2"
                      max="100"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Expiration (Days)</label>
                    <input
                      type="number"
                      value={formData.expires_days}
                      onChange={(e) => setFormData({ ...formData, expires_days: parseInt(e.target.value) })}
                      min="1"
                      max="365"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {loading ? "Creating..." : "Create"}
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

  // Show invitation details
  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-indigo-50 to-indigo-50/50 border border-indigo-200 rounded-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Lock size={16} className="text-indigo-600" />
            Team Invitation Active
          </h4>
          <p className="text-xs text-slate-500">Share this link with your team members</p>
        </div>
        <button
          onClick={() => setInvitation(null)}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Users size={14} />
          <span>{formData.max_members} members max</span>
        </div>
        {invitation.expires_at && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar size={14} />
            <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
        <label className="text-xs font-semibold text-slate-600">Invitation Link:</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-slate-50 px-3 py-2 rounded-lg text-slate-700 font-mono overflow-auto break-all">
            {invitation.invitation_link}
          </code>
          <button
            onClick={copyToClipboard}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
              copied
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {copied ? "✓ Copied" : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {navigator.share && (
          <button
            onClick={handleShare}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={14} />
            Share
          </button>
        )}
        <button
          onClick={() => setInvitation(null)}
          className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          New Link
        </button>
      </div>

      {success && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold">
          ✓ Invitation created successfully!
        </div>
      )}
    </div>
  );
}
