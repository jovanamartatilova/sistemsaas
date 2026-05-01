import { Users, User, Calendar, LinkIcon } from "lucide-react";

/**
 * Component for members to view team information
 */
export default function MemberTeamInfoSection({ team, program }) {
  if (!team) return null;

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
            <p className="text-sm font-bold text-slate-900">{team.name}</p>
            <p className="text-xs text-slate-500">Team Name</p>
          </div>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md">
            {team.role}
          </span>
        </div>

        {team.member_count && (
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600">
              <User size={14} />
              <span className="text-xs font-medium">{team.member_count} members</span>
            </div>
            <span className="text-xs text-slate-500">{team.member_count}/{team.max_members}</span>
          </div>
        )}

        {team.leader_name && (
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600">
              <User size={14} />
              <span className="text-xs font-medium">Team Leader</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{team.leader_name}</span>
          </div>
        )}

        {program?.name && (
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600">
              <LinkIcon size={14} />
              <span className="text-xs font-medium">Program</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{program.name}</span>
          </div>
        )}

        {team.joined_at && (
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={14} />
              <span className="text-xs font-medium">Joined</span>
            </div>
            <span className="text-xs text-slate-700">
              {new Date(team.joined_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Contact your team leader for more information or support
        </p>
      </div>
    </div>
  );
}
