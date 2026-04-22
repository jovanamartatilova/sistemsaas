<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Submission;
use Illuminate\Http\Request;

class MemberTaskController extends Controller
{
    /**
     * Get all tasks assigned to the authenticated member
     * A task is an assigned submission to a team member
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

            // Get submissions for this user's team
            $tasks = Submission::where('id_team', $user->id_team)
                ->where('id_user', $user->id_user)
                ->with(['vacancy', 'user'])
                ->get()
                ->map(fn($task) => [
                    'id' => $task->id_submission,
                    'title' => $task->vacancy?->position_title ?? 'Task',
                    'description' => $task->vacancy?->description ?? '',
                    'status' => $task->status ?? 'pending',
                    'assignedBy' => $task->vacancy?->company?->name ?? 'Team Leader',
                    'deadline' => $task->deadline_at ?? $task->vacancy?->deadline ?? null,
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
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
     * Update task status (pending, in_progress, done)
     */
    public function updateTaskStatus(Request $request, $taskId)
    {
        try {
            $user = $request->user();
            $validated = $request->validate([
                'status' => 'required|in:pending,in_progress,done'
            ]);

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team'
                ], 403);
            }

            $task = Submission::where('id_submission', $taskId)
                ->where('id_team', $user->id_team)
                ->where('id_user', $user->id_user)
                ->firstOrFail();

            $task->status = $validated['status'];
            $task->save();

            return response()->json([
                'message' => 'Task status updated successfully',
                'data' => [
                    'id' => $task->id_submission,
                    'status' => $task->status,
                    'updated_at' => $task->updated_at,
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
     * Get member dashboard info (summary)
     */
    public function getDashboard(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !$user->id_team) {
                return response()->json([
                    'message' => 'User is not part of a team',
                    'data' => [
                        'tasksCount' => 0,
                        'tasksCompleted' => 0,
                        'tasksInProgress' => 0,
                    ]
                ], 200);
            }

            $tasks = Submission::where('id_team', $user->id_team)
                ->where('id_user', $user->id_user)
                ->get();

            return response()->json([
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'tasksCount' => $tasks->count(),
                    'tasksCompleted' => $tasks->where('status', 'done')->count(),
                    'tasksInProgress' => $tasks->where('status', 'in_progress')->count(),
                    'tasksPending' => $tasks->where('status', 'pending')->count(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
