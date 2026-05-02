import { useState, useEffect } from "react";
import { Users, Loader, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Component for displaying and handling team invitation join flow
 */
export default function JoinTeamModal({ token, onSuccess, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationData, setInvitationData] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const storedCompany = JSON.parse(localStorage.getItem("company") || "{}");
  const companyId = storedCompany?.id_company;


  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");

  useEffect(() => {
    validateInvitation();
  }, [token]);

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

  const handleJoinTeam = async () => {
    if (!authToken) {
      // Redirect to login if not authenticated
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
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Invalid Invitation</h3>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Successfully Joined!</h3>
          <p className="text-slate-600 text-sm">You're now part of {invitationData?.team_name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={24} />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Join Team
          </h3>
          <p className="text-slate-600 text-sm text-center mb-6">
            You're invited to join a team for an internship program
          </p>

          {invitationData && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <p className="text-xs text-slate-500 font-semibold">TEAM NAME</p>
                  <p className="text-lg font-bold text-slate-900">{invitationData.team_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-semibold">Members</p>
                  <p className="text-sm font-bold text-slate-900">
                    {invitationData.current_members}/{invitationData.max_members}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-semibold">Leader</p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {invitationData.leader_name}
                  </p>
                </div>
              </div>

              {invitationData.expires_at && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700 font-semibold">
                    Invitation expires: {new Date(invitationData.expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
            >
              Decline
            </button>
            <button
              onClick={handleJoinTeam}
              disabled={joining}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Team"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
