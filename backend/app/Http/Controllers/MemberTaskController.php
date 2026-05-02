<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use Illuminate\Http\Request;

class MemberTaskController extends Controller
{
    public function getTasks(Request $request)
{
    try {
        $user = $request->user();

        $tasks = Task::where('id_intern', $user->id_user)
            ->whereHas('mentor')
            ->where('status', '!=', 'draft')
            ->with(['mentor', 'parentTask.subTasks.intern'])
            ->get();

        // Ambil data candidate & submission sekali aja
        $candidate = \App\Models\Candidate::where('id_user', $user->id_user)->first();
        $submission = \App\Models\Submission::where('id_user', $user->id_user)
            ->where('status', 'accepted')
            ->with(['position', 'vacancy.company'])
            ->first();

        // Ambil competencies dari task competency_ids
        $allCompetencyIds = $tasks->pluck('competency_ids')->flatten()->filter()->unique()->values();
        $competencies = \App\Models\Competency::whereIn('id_competency', $allCompetencyIds)
            ->get(['id_competency', 'name', 'description', 'learning_hours']);

        $internInfo = [
            'institution'     => $candidate?->institution,
            'education_level' => $candidate?->education_level,
            'major'           => $candidate?->major,
            'position'        => $submission?->position?->name,
            'company'         => $submission?->vacancy?->company?->name ?? $submission?->vacancy?->title,
            'mentor_name'     => $tasks->first()?->mentor?->name,
        ];

        $mapped = $tasks->map(fn($task) => [
            'id'               => $task->id_task,
            'id_task'          => $task->id_task,
            'title'            => $task->title ?? 'Task',
            'description'      => $task->description ?? '',
            'status'           => $task->status ?? 'pending',
            'assignedBy'       => $task->mentor?->name ?? 'Mentor',
            'deadline'         => $task->deadline_at,
            'feedback_notes'   => $task->feedback_notes,
            'parent_task'      => $task->parentTask ? [
                'id_task'     => $task->parentTask->id_task,
                'title'       => $task->parentTask->title,
                'description' => $task->parentTask->description,
                'siblings'    => $task->parentTask->subTasks
                    ->where('id_task', '!=', $task->id_task)
                    ->map(fn($st) => [
                        'id'             => $st->id_task,
                        'id_task'        => $st->id_task,
                        'title'          => $st->title,
                        'description'    => $st->description,
                        'assignee'       => $st->intern?->name ?? 'Unknown',
                        'status'         => $st->status,
                        'deadline'       => $st->deadline_at,
                        'work'           => $st->work_attachments,
                        'feedback_notes' => $st->feedback_notes,
                    ])->values()
            ] : null,
            'work_attachments'  => $task->work_attachments ?? [],
            'submitted_at'      => $task->submitted_at,
            'logbook_approved'  => $task->logbook_approved ?? false,
            'created_at'        => $task->created_at,
            'updated_at'        => $task->updated_at,
            'competency_ids'    => $task->competency_ids ?? [],
        ]);

        return response()->json([
            'message' => 'Tasks retrieved successfully',
            'data'    => $mapped,
            'intern_info'  => $internInfo,
            'competencies' => $competencies,
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to retrieve tasks',
            'error'   => $e->getMessage()
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

            // Task must be assigned to this user or this user's team
            $task = Task::where('id_task', $taskId)
                ->where('id_intern', $user->id_user)
                ->firstOrFail();

            $task->status = $validated['status'];
            $task->save();

            return response()->json([
                'message' => 'Task status updated successfully',
                'data' => [
                    'id' => $task->id_task,
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

            $tasksQuery = Task::where('id_intern', $user->id_user);

            $tasks = $tasksQuery->where('status', '!=', 'draft')->get();

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
