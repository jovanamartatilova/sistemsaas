<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use App\Models\Submission;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeaderController extends Controller
{
    /**
     * Get leader dashboard - team stats and members overview
     */
    public function getDashboard(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team'
                ], 403);
            }

            // Check if user is team leader
            $teamMember = TeamMember::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json([
                    'message' => 'User is not a team leader'
                ], 403);
            }

            // Get team info
            $team = Team::find($user->id_team);
            $teamMembers = TeamMember::where('id_team', $user->id_team)->get();
            $memberCount = $teamMembers->where('role', 'member')->count();

            // Get team tasks stats
            $submissions = Submission::where('id_team', $user->id_team)->get();

            return response()->json([
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'teamName' => $team?->name ?? 'Team',
                    'teamCode' => $team?->team_code ?? '',
                    'memberCount' => $memberCount,
                    'tasksCount' => $submissions->count(),
                    'tasksCompleted' => $submissions->where('status', 'done')->count(),
                    'tasksInProgress' => $submissions->where('status', 'in_progress')->count(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get team members list
     */
    public function getTeamMembers(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team',
                    'data' => []
                ], 200);
            }

            // Check if user is team leader
            $teamMember = TeamMember::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json([
                    'message' => 'User is not a team leader'
                ], 403);
            }

            // Get all team members except leader
            $members = TeamMember::where('id_team', $user->id_team)
                ->where('role', 'member')
                ->with('user')
                ->get()
                ->map(fn($member) => [
                    'id' => $member->id_team_member,
                    'userId' => $member->id_user,
                    'name' => $member->user?->name ?? 'Unknown',
                    'email' => $member->user?->email ?? '',
                    'photo' => $member->user?->photo_path ?? null,
                    'joinedAt' => $member->joined_at,
                ]);

            return response()->json([
                'message' => 'Team members retrieved successfully',
                'data' => $members
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve team members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get leader's own tasks (assigned by mentor)
     */
    public function getTasks(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team',
                    'data' => []
                ], 200);
            }

            // Check if user is team leader
            $teamMember = TeamMember::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json([
                    'message' => 'User is not a team leader'
                ], 403);
            }

            // Get leader's tasks (submissions assigned to this leader)
            $tasks = Submission::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->get()
                ->map(fn($submission) => [
                    'id' => $submission->id_submission,
                    'title' => $submission->position?->position_title ?? $submission->title ?? 'Untitled Task',
                    'description' => $submission->description ?? null,
                    'status' => $submission->status,
                    'deadline' => $submission->deadline ?? null,
                    'created_at' => $submission->submission_date,
                    'updated_at' => $submission->updated_at,
                ]);

            return response()->json([
                'message' => 'Tasks retrieved successfully',
                'data' => $tasks
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve tasks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update leader's task status
     */
    public function updateTaskStatus(Request $request, $taskId)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,done',
            ]);

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team'
                ], 403);
            }

            // Check if user is team leader
            $teamMember = TeamMember::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json([
                    'message' => 'User is not a team leader'
                ], 403);
            }

            // Get and update the task
            $submission = Submission::where('id_submission', $taskId)
                ->where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->firstOrFail();

            $submission->status = $validated['status'];
            $submission->save();

            return response()->json([
                'message' => 'Task status updated successfully',
                'data' => [
                    'id' => $submission->id_submission,
                    'status' => $submission->status,
                    'updated_at' => $submission->updated_at,
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Task not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update task status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign task to team member
     */
    public function assignTask(Request $request)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'memberId' => 'required|string',
                'title' => 'required|string',
                'description' => 'nullable|string',
                'deadline' => 'nullable|date',
            ]);

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team'
                ], 403);
            }

            // Check if user is team leader
            $teamMember = TeamMember::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json([
                    'message' => 'User is not a team leader'
                ], 403);
            }

            // Verify member exists in team
            $member = TeamMember::where('id_team_member', $validated['memberId'])
                ->where('id_team', $user->id_team)
                ->where('role', 'member')
                ->firstOrFail();

            // Create a submission as task assignment
            // TODO: Consider creating a dedicated Tasks table for better structure
            $task = new Submission();
            $task->id_submission = (string) Str::uuid();
            $task->id_user = $member->id_user;
            $task->id_team = $user->id_team;
            $task->status = 'pending';
            $task->submission_date = now();
            $task->save();

            return response()->json([
                'message' => 'Task assigned successfully',
                'data' => [
                    'id' => $task->id_submission,
                    'memberId' => $member->id_user,
                    'status' => $task->status,
                    'assignedAt' => $task->submission_date,
                ]
            ], 201);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Team member not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to assign task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove team member
     */
    public function removeTeamMember(Request $request, $memberId)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team'
                ], 403);
            }

            // Check if user is team leader
            $teamMember = TeamMember::where('id_user', $user->id_user)
                ->where('id_team', $user->id_team)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json([
                    'message' => 'User is not a team leader'
                ], 403);
            }

            // Delete team member
            $member = TeamMember::where('id_team_member', $memberId)
                ->where('id_team', $user->id_team)
                ->where('role', 'member')
                ->firstOrFail();

            $member->delete();

            return response()->json([
                'message' => 'Team member removed successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Team member not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove team member',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
