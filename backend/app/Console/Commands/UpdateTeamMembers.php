<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Submission;
use App\Models\TeamMember;
use App\Models\Team;

class UpdateTeamMembers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:team-members-submission {--verbose} {--user=}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Update team member submissions to match team leader info';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $verbose = $this->option('verbose');
        $userName = $this->option('user');

        $syncCount = 0;
        $skipCount = 0;

        // Get all team members
        $teamMembersQuery = TeamMember::where('role', 'member');

        if ($userName) {
            // Filter by specific user
            $teamMembersQuery->whereHas('user', function($q) use ($userName) {
                $q->where('name', 'like', "%{$userName}%");
            });
        }

        $teamMembers = $teamMembersQuery->get();

        if ($teamMembers->isEmpty()) {
            $this->warn("No team members found" . ($userName ? " matching '{$userName}'" : ""));
            return Command::SUCCESS;
        }

        foreach ($teamMembers as $member) {
            // Get member's user and submission
            $user = $member->user;
            $memberSubmission = $user->submissions()->first();

            if (!$memberSubmission) {
                if ($verbose) {
                    $this->warn("✗ {$user->name} has no submission");
                }
                $skipCount++;
                continue;
            }

            // Get team leader
            $leaderMember = TeamMember::where('id_team', $member->id_team)
                ->where('role', 'leader')
                ->first();

            if (!$leaderMember) {
                if ($verbose) {
                    $this->warn("✗ Team {$member->id_team} has no leader");
                }
                $skipCount++;
                continue;
            }

            // Get leader's submission
            $leaderSubmission = $leaderMember->user->submissions()->first();

            if (!$leaderSubmission) {
                if ($verbose) {
                    $this->warn("✗ Team leader {$leaderMember->user->name} has no submission");
                }
                $skipCount++;
                continue;
            }

            // Check if needs update
            $needsUpdate = false;
            $oldTeam = $memberSubmission->id_team;
            $oldMentor = $memberSubmission->id_user_mentor;

            if ($memberSubmission->id_team !== $leaderSubmission->id_team) {
                $needsUpdate = true;
            }
            if ($memberSubmission->id_user_mentor !== $leaderSubmission->id_user_mentor) {
                $needsUpdate = true;
            }

            if ($needsUpdate) {
                $memberSubmission->update([
                    'id_team' => $leaderSubmission->id_team,
                    'id_user_mentor' => $leaderSubmission->id_user_mentor,
                ]);

                $syncCount++;
                $this->info("✓ {$user->name}: team {$oldTeam}→{$leaderSubmission->id_team}, mentor " . ($oldMentor ? substr($oldMentor, 0, 8) : 'NULL') . "→" . ($leaderSubmission->id_user_mentor ? substr($leaderSubmission->id_user_mentor, 0, 8) : 'NULL'));
            } else {
                if ($verbose) {
                    $this->info("✓ {$user->name} already synced");
                }
            }
        }

        $this->newLine();
        $this->info("========== UPDATE COMPLETE ==========");
        $this->info("✓ Updated: {$syncCount} members");
        $this->info("⊘ Skipped: {$skipCount} members");
        $this->info("======================================");
        $this->newLine();

        return Command::SUCCESS;
    }
}
