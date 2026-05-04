import { useState, useEffect } from "react";
import { Users, Link2, Copy, Check, Calendar, Crown, AlertCircle } from "lucide-react";

/**
 * Team History Component
 * Displays list of teams created by or joined by the candidate
 */
export default function TeamHistory({ program, onTeamSelect = null }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/my-teams`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }

        const data = await response.json();
        setTeams(data.data || []);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [authToken]);

  const copyToClipboard = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <div className="p-4 text-center text-slate-500 text-sm">Loading team history...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
        <Users size={20} className="mx-auto text-slate-300 mb-2" />
        <p className="text-xs text-slate-500">No teams created yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-3">
        <Users size={14} />
        Team History ({teams.length})
      </h4>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}

      {teams.map((team) => (
        <div key={team.id_team} className="p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
          {/* Team Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="text-sm font-bold text-slate-800 truncate">{team.name}</h5>
                {team.role === "Leader" && (
                  <Crown size={12} className="text-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500">{team.role}</p>
            </div>
            <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-md flex-shrink-0 ml-2">
              {team.member_count}/{team.max_members}
            </span>
          </div>

          {/* Team Details */}
          <div className="space-y-1.5 mb-2 text-xs text-slate-600">
            {team.creator && (
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-slate-400" />
                <span>Created by <strong>{team.creator.name}</strong></span>
              </div>
            )}
            {team.created_at && (
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-slate-400" />
                <span>{new Date(team.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Invitation Link (if active) */}
          {team.invitation && team.invitation.is_active && (
            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg mt-2">
              <p className="text-[10px] font-bold text-indigo-700 mb-1.5 uppercase tracking-wider">Invitation Link</p>
              <div className="flex gap-1.5 items-center">
                <code className="flex-1 text-[10px] font-mono text-indigo-700 bg-white p-1.5 rounded border border-indigo-200 truncate">
                  {team.invitation.invitation_link.split("/join/")[1]}
                </code>
                <button
                  onClick={() => copyToClipboard(team.invitation.invitation_link, team.id_team)}
                  className="p-1.5 hover:bg-indigo-100 rounded transition-colors text-indigo-600 flex-shrink-0"
                  title="Copy link"
                >
                  {copiedId === team.id_team ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Members Preview */}
          {team.members && team.members.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Members</p>
              <div className="flex flex-wrap gap-1">
                {team.members.slice(0, 3).map((member, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md">
                    {member.name}
                  </span>
                ))}
                {team.members.length > 3 && (
                  <span className="text-[10px] px-2 py-1 bg-slate-50 text-slate-400 border border-slate-200 rounded-md">
                    +{team.members.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
