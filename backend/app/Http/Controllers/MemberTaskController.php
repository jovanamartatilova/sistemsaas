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
            \Log::info("[MEMBER TASKS] Fetching tasks for user: {$user->id_user} ({$user->email})");

            $tasks = Task::where('id_intern', $user->id_user)
                ->whereHas('mentor')
                ->where('status', '!=', 'draft')
                ->with(['mentor', 'parentTask.parentTask', 'parentTask.subTasks.intern'])
                ->get();

            \Log::info("[MEMBER TASKS] Found {$tasks->count()} tasks");
            foreach ($tasks as $t) {
                \Log::info("[MEMBER TASKS] Task: {$t->id_task} | Title: {$t->title} | Approved: " . ($t->logbook_approved ? 'YES' : 'NO'));
            }

            // Ambil data candidate & submission sekali aja
            $candidate = \App\Models\Candidate::where('id_user', $user->id_user)->first();
            $submission = \App\Models\Submission::where('id_user', $user->id_user)
                ->where('status', 'accepted')
                ->with(['position', 'vacancy.company'])
                ->first();

            // Ambil competencies dari task competency_ids
            $allCompetencyIds = $tasks->pluck('competency_ids')->flatten()->filter()->unique()->values();

            // Jika tidak ada competency_ids di tasks, ambil dari position intern
            if ($allCompetencyIds->isEmpty() && $submission?->id_position) {
                $competencies = \App\Models\Competency::whereHas('positions', function($q) use ($submission) {
                    $q->where('positions.id_position', $submission->id_position);
                })->get(['id_competency', 'name', 'description', 'learning_hours']);
            } else {
                $competencies = \App\Models\Competency::whereIn('id_competency', $allCompetencyIds)
                    ->get(['id_competency', 'name', 'description', 'learning_hours']);
            }

// Get member's mentor = leader's mentor (for team members) or own mentor (for individuals)
            $leadersMentorName = 'Mentor';
            if ($tasks->isNotEmpty()) {
                $firstTask = $tasks->first();
                $teamId = $firstTask?->id_team;

                if ($teamId) {
                    // Team member: get leader's mentor
                    $teamLeader = \App\Models\TeamMember::where('id_team', $teamId)
                        ->where('role', 'leader')
                        ->with('user')
                        ->first();

                    if ($teamLeader) {
                        $leaderTask = Task::where('id_intern', $teamLeader->id_user)
                            ->where('id_team', $teamId)
                            ->with('mentor')
                            ->first();
                        if ($leaderTask?->mentor) {
                            $leadersMentorName = $leaderTask->mentor->name;
                        }
                    }
                } else {
                    // Individual applicant: get own mentor from first task
                    if ($firstTask?->mentor) {
                        $leadersMentorName = $firstTask->mentor->name;
                    }
                }
            }

            $companyName = $submission?->vacancy?->company?->name
                ?? $submission?->vacancy?->title
                ?? \App\Models\Company::where('id_company', $submission?->position?->id_company)->value('name')
                ?? null;

            $internInfo = [
                'institution'     => $candidate?->institution,
                'education_level' => $candidate?->education_level,
                'major'           => $candidate?->major,
                'position'        => $submission?->position?->name,
                'company'         => $companyName,
                'mentor_name'     => $leadersMentorName,
            ];

            $mapped = $tasks->map(function($task) {
                // Check approval from task itself or any parent in hierarchy
                $directApproved = (bool)$task->logbook_approved;
                $parentApproved = $task->parentTask ? (bool)$task->parentTask->logbook_approved : false;
                $grandparentApproved = $task->parentTask?->parentTask ? (bool)$task->parentTask->parentTask->logbook_approved : false;
                $isApproved = $directApproved || $parentApproved || $grandparentApproved;

                \Log::info("[MEMBER TASKS] Task {$task->id_task}: direct=" . ($directApproved ? 'YES' : 'NO') .
                    " | parent=" . ($parentApproved ? 'YES' : 'NO') .
                    " | grandparent=" . ($grandparentApproved ? 'YES' : 'NO') .
                    " | FINAL=" . ($isApproved ? 'YES' : 'NO'));

                return [
                    'id'               => $task->id_task,
                    'id_task'          => $task->id_task,
                    'title'            => $task->title ?? 'Task',
                    'description'      => $task->description ?? '',
                    'status'           => $task->status ?? 'pending',
                    'assignedBy'       => $task->mentor?->name ?? 'Mentor',
                    'deadline'         => $task->deadline_at,
                    'feedback_notes'        => $task->feedback_notes,
                    'parent_feedback_notes' => $task->parentTask?->feedback_notes ?? $task->parentTask?->parentTask?->feedback_notes ?? null,
                    'parent_task'           => $task->parentTask ? [
                        'id_task'     => $task->parentTask->id_task,
                        'title'       => $task->parentTask->title,
                        'description' => $task->parentTask->description,
                        'logbook_approved' => (bool)$task->parentTask->logbook_approved,
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
                    'logbook_approved'  => $isApproved,
                    'created_at'        => $task->created_at,
                    'updated_at'        => $task->updated_at,
                    'competency_ids'    => $task->competency_ids ?? [],
                ];
            });

            \Log::info("[MEMBER TASKS] Response has " . $mapped->count() . " mapped tasks with approvals: " . $mapped->pluck('logbook_approved')->toJson());

            return response()->json([
                'message' => 'Tasks retrieved successfully',
                'data'    => $mapped,
                'intern_info'  => $internInfo,
                'competencies' => $competencies,
            ], 200);

        } catch (\Exception $e) {
            \Log::error("[MEMBER TASKS] Error: " . $e->getMessage());
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

            // Ambil submission & assessment candidate
            $submission = \App\Models\Submission::where('id_user', $user->id_user)
                ->where('status', 'accepted')
                ->first();

            $assessmentData = null;
            if ($submission) {
                $assessment = \App\Models\Assessment::where('id_submission', $submission->id_submission)
                    ->first();

                if ($assessment && $assessment->scores_data) {
                    $scores = $assessment->scores_data;
                    $scoredItems = array_filter($scores, fn($s) => isset($s['score']) && $s['score'] !== null && $s['score'] !== '');
                    $avg = count($scoredItems) > 0
                        ? round(array_sum(array_column(array_values($scoredItems), 'score')) / count($scoredItems), 1)
                        : null;

                    // Ambil nama competency
                    $compIds = array_column($scores, 'id_competency');
                    $competencies = \App\Models\Competency::whereIn('id_competency', $compIds)
                        ->get(['id_competency', 'name'])
                        ->keyBy('id_competency');

                    $assessmentData = [
                        'average_score'    => $avg,
                        'total_competencies' => count($scores),
                        'scored_competencies' => count($scoredItems),
                        'narrative'        => $assessment->narrative,
                        'evaluation_status' => $assessment->evaluation_status,
                        'scores'           => array_map(fn($s) => [
                            'id_competency'          => $s['id_competency'],
                            'competency_name'        => $competencies[$s['id_competency']]->name ?? $s['id_competency'],
                            'score'                  => $s['score'] ?? null,
                            'status'                 => $s['status'] ?? 'pending',
                            'achievement_description' => $s['achievement_description'] ?? null,
                        ], array_values($scores)),
                    ];
                }
            }

            return response()->json([
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'tasksCount'      => $tasks->count(),
                    'tasksCompleted'  => $tasks->where('status', 'done')->count(),
                    'tasksInProgress' => $tasks->where('status', 'in_progress')->count(),
                    'tasksPending'    => $tasks->where('status', 'pending')->count(),
                    'assessment'      => $assessmentData,
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
