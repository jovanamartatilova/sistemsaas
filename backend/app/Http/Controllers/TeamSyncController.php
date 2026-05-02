<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

class TeamSyncController extends Controller
{
    /**
     * Fix team candidates that are still showing as Individual
     * GET /api/admin/team-sync/fix-team-candidates
     */
    public function fixTeamCandidates(Request $request)
    {
        // Only allow from localhost or admin
        if ($request->ip() !== '127.0.0.1' && $request->ip() !== 'localhost') {
            $user = $request->user();
            if (!$user || $user->role !== 'super_admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $verbose = $request->get('verbose', false);
        $fixed = 0;
        $skipped = 0;
        $logs = [];

        // Find all candidates yang ada di team_members tapi submission mereka belum ter-update
        $teamMembers = TeamMember::where('role', 'member')->get();

        foreach ($teamMembers as $member) {
            $user = $member->user;
            $submission = $user->submissions()->first();

            if (!$submission) {
                $skipped++;
                if ($verbose) {
                    $logs[] = "✗ {$user->name} has no submission";
                }
                continue;
            }

            // Get team leader's submission to get the correct id_team and mentor
            $leaderMember = TeamMember::where('id_team', $member->id_team)
                ->where('role', 'leader')
                ->first();

            if (!$leaderMember) {
                $skipped++;
                if ($verbose) {
                    $logs[] = "✗ Team {$member->id_team} has no leader";
                }
                continue;
            }

            $leaderSubmission = $leaderMember->user->submissions()->first();

            if (!$leaderSubmission) {
                $skipped++;
                if ($verbose) {
                    $logs[] = "✗ Team leader {$leaderMember->user->name} has no submission";
                }
                continue;
            }

            // Check if member's submission is mismatched with team leader
            if ($submission->id_team !== $leaderSubmission->id_team ||
                $submission->id_user_mentor !== $leaderSubmission->id_user_mentor) {

                $oldTeam = $submission->id_team;
                $oldMentor = $submission->id_user_mentor;

                // Update member's submission
                $submission->update([
                    'id_team' => $leaderSubmission->id_team,
                    'id_user_mentor' => $leaderSubmission->id_user_mentor,
                ]);

                $fixed++;

                $team = Team::find($leaderSubmission->id_team);
                $teamName = $team->name ?? 'Unknown';

                $logs[] = "✓ {$user->name} fixed - team {$oldTeam}→{$leaderSubmission->id_team} ({$teamName})";
            }
        }

        return response()->json([
            'success' => true,
            'fixed' => $fixed,
            'skipped' => $skipped,
            'logs' => $verbose ? $logs : null,
            'message' => "Fixed {$fixed} team members"
        ]);
    }

    /**
     * Sync all teams
     * GET /api/admin/team-sync/sync-all
     */
    public function syncAll(Request $request)
    {
        // Only allow from localhost or admin
        if ($request->ip() !== '127.0.0.1' && $request->ip() !== 'localhost') {
            $user = $request->user();
            if (!$user || $user->role !== 'super_admin') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $fixed = 0;
        $teams = Team::all();

        foreach ($teams as $team) {
            // Get team leader
            $leaderMember = TeamMember::where('id_team', $team->id_team)
                ->where('role', 'leader')
                ->first();

            if (!$leaderMember) {
                continue;
            }

            // Get leader's submission
            $leaderSubmission = $leaderMember->user->submissions()->first();

            if (!$leaderSubmission) {
                continue;
            }

            // Get all team members (excluding leader)
            $members = TeamMember::where('id_team', $team->id_team)
                ->where('role', 'member')
                ->get();

            foreach ($members as $member) {
                $memberSubmission = $member->user->submissions()->first();

                if (!$memberSubmission) {
                    continue;
                }

                // Check if needs sync
                if ($memberSubmission->id_team !== $leaderSubmission->id_team ||
                    $memberSubmission->id_user_mentor !== $leaderSubmission->id_user_mentor) {

                    $memberSubmission->update([
                        'id_team' => $leaderSubmission->id_team,
                        'id_user_mentor' => $leaderSubmission->id_user_mentor,
                    ]);

                    $fixed++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'fixed' => $fixed,
            'message' => "Synced all teams, fixed {$fixed} submissions"
        ]);
    }
}
