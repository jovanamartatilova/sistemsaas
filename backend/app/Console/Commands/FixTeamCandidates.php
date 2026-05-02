<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Submission;
use App\Models\TeamMember;
use App\Models\Team;

class FixTeamCandidates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:team-candidates {--detail}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Fix team candidates that are still showing as Individual (Tania, Asri, etc)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $verbose = $this->option('detail');

        $fixed = 0;
        $skipped = 0;

        // Find all candidates yang ada di team_members tapi submission mereka belum ter-update
        $teamMembers = TeamMember::where('role', 'member')->get();

        foreach ($teamMembers as $member) {
            $user = $member->user;
            $submission = $user->submissions()->first();

            if (!$submission) {
                if ($verbose) {
                    $this->warn("✗ {$user->name} has no submission - skipped");
                }
                $skipped++;
                continue;
            }

            // Get team leader's submission to get the correct id_team and mentor
            $leaderMember = TeamMember::where('id_team', $member->id_team)
                ->where('role', 'leader')
                ->first();

            if (!$leaderMember) {
                if ($verbose) {
                    $this->warn("✗ Team {$member->id_team} has no leader - skipped");
                }
                $skipped++;
                continue;
            }

            $leaderSubmission = $leaderMember->user->submissions()->first();

            if (!$leaderSubmission) {
                if ($verbose) {
                    $this->warn("✗ Team leader {$leaderMember->user->name} has no submission - skipped");
                }
                $skipped++;
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

                $this->info("✓ Fixed: {$user->name}");
                $this->line("  From: Team={$oldTeam}, Mentor=" . ($oldMentor ? substr($oldMentor, 0, 8) : 'NULL'));
                $this->line("  To:   Team={$leaderSubmission->id_team} ({$teamName}), Mentor=" . ($leaderSubmission->id_user_mentor ? substr($leaderSubmission->id_user_mentor, 0, 8) : 'NULL'));
            } else {
                if ($verbose) {
                    $this->line("→ {$user->name} already correct");
                }
            }
        }

        $this->newLine();
        $this->info("========== FIX COMPLETE ==========");
        $this->info("✓ Fixed: {$fixed} candidates");
        if ($skipped > 0) {
            $this->warn("⊘ Skipped: {$skipped}");
        }
        $this->info("==================================");
        $this->newLine();

        return Command::SUCCESS;
    }
}
