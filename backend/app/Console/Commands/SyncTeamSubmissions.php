<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\TeamMember;
use App\Models\Submission;

class SyncTeamSubmissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:team-submissions {--verbose}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Sync team members submissions with team ID and mentor from team leader';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $verbose = $this->option('verbose');
        $syncCount = 0;
        $skipCount = 0;

        // Get all teams
        $teams = DB::table('teams')->get();

        foreach ($teams as $team) {
            // Get team leader
            $leaderMember = TeamMember::where('id_team', $team->id_team)
                ->where('role', 'leader')
                ->first();

            if (!$leaderMember) {
                if ($verbose) {
                    $this->info("⚠ Team {$team->id_team} ({$team->name}) has no leader");
                }
                continue;
            }

            // Get leader's submission
            $leaderSubmission = Submission::where('id_user', $leaderMember->id_user)
                ->first();

            if (!$leaderSubmission) {
                if ($verbose) {
                    $this->info("⚠ Team {$team->id_team} ({$team->name}) leader has no submission");
                }
                continue;
            }

            // Get all team members
            $members = TeamMember::where('id_team', $team->id_team)
                ->where('role', 'member')
                ->pluck('id_user')
                ->toArray();

            foreach ($members as $memberId) {
                $memberSubmission = Submission::where('id_user', $memberId)->first();

                if (!$memberSubmission) {
                    if ($verbose) {
                        $this->info("⚠ Member {$memberId} in team {$team->id_team} has no submission");
                    }
                    $skipCount++;
                    continue;
                }

                // Check if needs sync
                if ($memberSubmission->id_team !== $leaderSubmission->id_team ||
                    $memberSubmission->id_user_mentor !== $leaderSubmission->id_user_mentor) {

                    $oldTeam = $memberSubmission->id_team;
                    $oldMentor = $memberSubmission->id_user_mentor;

                    // Update
                    $memberSubmission->update([
                        'id_team' => $leaderSubmission->id_team,
                        'id_user_mentor' => $leaderSubmission->id_user_mentor,
                    ]);

                    $syncCount++;
                    if ($verbose) {
                        $this->info("✓ Synced {$memberId}: team {$oldTeam}→{$leaderSubmission->id_team}, mentor {$oldMentor}→{$leaderSubmission->id_user_mentor}");
                    }
                } else {
                    if ($verbose) {
                        $this->info("✓ Already synced: {$memberId}");
                    }
                }
            }
        }

        $this->info("\n========== SYNC COMPLETE ==========");
        $this->info("✓ Synced: {$syncCount} submissions");
        $this->info("⊘ Skipped: {$skipCount} submissions");
        $this->info("====================================\n");

        return Command::SUCCESS;
    }
}
