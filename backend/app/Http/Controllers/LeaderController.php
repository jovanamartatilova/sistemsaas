<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use App\Models\Task;
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
            $tasks = Task::where('id_team', $user->id_team)->where('status', '!=', 'draft')->get();

            return response()->json([
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'teamName' => $team?->name ?? 'Team',
                    'teamCode' => $team?->team_code ?? '',
                    'memberCount' => $memberCount,
                    'tasksCount' => $tasks->count(),
                    'tasksCompleted' => $tasks->where('status', 'done')->count(),
                    'tasksInProgress' => $tasks->where('status', 'in_progress')->count(),
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
     * Get leader's own tasks (assigned by mentor) and their delegated subtasks
     */
    public function getTasks(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->id_team) {
                return response()->json(['message' => 'User is not part of a team', 'data' => []], 200);
            }

            // Get leader's tasks (primary tasks assigned to this leader/team)
            $tasks = Task::where('id_team', $user->id_team)
                ->whereNull('parent_id_task')
                ->where('status', '!=', 'draft')
                ->with(['mentor', 'subTasks.intern'])
                ->get()
                ->map(function ($task) {
                    $competencyNames = [];
                    if (!empty($task->competency_ids)) {
                        $competencyNames = \App\Models\Competency::whereIn('id_competency', $task->competency_ids)
                            ->pluck('name')->toArray();
                    }
                    return [
                        'id'               => $task->id_task,
                        'id_task'          => $task->id_task,
                        'title'            => $task->title,
                        'description'      => $task->description,
                        'status'           => $task->status,
                        'assignedBy'       => $task->mentor?->name ?? 'Mentor',
                        'deadline'         => $task->deadline_at,
                        'competencies'     => $competencyNames,
                        'work_attachments' => $task->work_attachments ?? [],
                        'submitted_at'     => $task->submitted_at,
                        'feedback_notes'   => $task->feedback_notes,
                        'subtasks'         => $task->subTasks->map(fn($st) => [
                            'id'           => $st->id_task,
                            'title'        => $st->title,
                            'description'  => $st->description,
                            'assignee'     => $st->intern?->name ?? 'Unknown',
                            'id_assignee'  => $st->id_intern,
                            'deadline'     => $st->deadline_at,
                            'status'       => $st->status,
                            'work'         => $st->work_attachments,
                            'submitted_at' => $st->submitted_at,
                            'feedback'     => $st->feedback_notes,
                        ]),
                    ];
                });

            return response()->json(['message' => 'Tasks retrieved successfully', 'data' => $tasks], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to retrieve tasks', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Assign task to team member (optionally as a subtask)
     */
    public function assignTask(Request $request)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'memberUserId'  => 'required|string',
                'parent_id'     => 'nullable|string',
                'title'         => 'required|string',
                'description'   => 'nullable|string',
                'deadline'      => 'nullable|date',
            ]);

            $task = Task::create([
                'id_task'        => (string) Str::uuid(),
                'id_mentor'      => $user->id_user,
                'id_intern'      => $validated['memberUserId'],
                'id_team'        => $user->id_team,
                'parent_id_task' => $validated['parent_id'] ?? null,
                'delegated_by'   => $user->id_user,
                'title'          => $validated['title'],
                'description'    => $validated['description'],
                'status'         => 'pending',
                'deadline_at'    => $validated['deadline'] ?? null
            ]);

            return response()->json(['message' => 'Task assigned successfully', 'data' => $task], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to assign task', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing subtask (Leader can edit details)
     */
    public function updateSubTask(Request $request, $taskId)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'memberUserId'  => 'required|string',
                'title'         => 'required|string',
                'description'   => 'nullable|string',
                'deadline'      => 'nullable|date',
            ]);

            $task = Task::where('id_task', $taskId)
                ->where('delegated_by', $user->id_user)
                ->firstOrFail();

            $task->update([
                'id_intern'   => $validated['memberUserId'],
                'title'       => $validated['title'],
                'description' => $validated['description'],
                'deadline_at' => $validated['deadline'] ?? null
            ]);

            return response()->json(['message' => 'Task updated successfully', 'data' => $task]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update task', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a subtask
     */
    public function deleteSubTask(Request $request, $taskId)
    {
        try {
            $user = $request->user();
            $task = Task::where('id_task', $taskId)
                ->where('delegated_by', $user->id_user)
                ->firstOrFail();

            $task->delete();
            return response()->json(['message' => 'Task deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete task', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Review a subtask (send feedback/notes)
     */
    public function reviewSubTask(Request $request, $taskId)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'notes'  => 'required|string',
                'status' => 'nullable|in:pending,in_progress,done'
            ]);

            // Allow review if user is the delegator (Leader) OR if they are in the same team (Peer)
            $task = Task::where('id_task', $taskId)
                ->where(function($q) use ($user) {
                    $q->where('delegated_by', $user->id_user)
                      ->orWhere('id_team', $user->id_team);
                })
                ->firstOrFail();

            $task->feedback_notes = $validated['notes'];
            
            // Only update status if status is provided AND user is the delegator (Leader)
            if (isset($validated['status']) && $task->delegated_by === $user->id_user) {
                $task->status = $validated['status'];
            }
            
            $task->save();

            return response()->json(['message' => 'Feedback sent successfully', 'data' => $task]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send feedback', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateTaskStatus(Request $request, $taskId)
    {
        // Status update for leader's own primary tasks or subtasks they manage
        try {
            $validated = $request->validate(['status' => 'required|in:pending,in_progress,done']);
            $task = Task::where('id_task', $taskId)->firstOrFail();
            $task->status = $validated['status'];
            $task->save();
            return response()->json(['message' => 'Status updated', 'data' => $task]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error', 'error' => $e->getMessage()], 500);
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
