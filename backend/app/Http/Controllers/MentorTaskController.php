<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Task;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class MentorTaskController extends Controller
{
    public function getAssignTargets(Request $request)
    {
        $mentor = $request->user();
        $mentorId = $mentor->id_user;
        $companyId = $mentor->id_company;

        // Primary: interns directly assigned to this mentor
        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'team', 'teamMembers.user', 'position', 'vacancy'])
            ->get();

        // Fallback: all accepted interns whose vacancy belongs to the same company
        if ($submissions->isEmpty() && $companyId) {
            $submissions = Submission::where('status', 'accepted')
                ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
                ->with(['user', 'team', 'teamMembers.user', 'position', 'vacancy'])
                ->get();
        }

        $targets = [];
        $processedTeams = [];

        foreach ($submissions as $sub) {
            if (!$sub->user)
                continue;

            if ($sub->id_team) {
                if (in_array($sub->id_team, $processedTeams))
                    continue;
                $processedTeams[] = $sub->id_team;

                $teamName = optional($sub->team)->name ?? 'Team';
                $leaderMember = $sub->teamMembers->firstWhere('role', 'leader');
                $leader = $leaderMember?->user;

                if (!$leader)
                    continue;

                // Only show team if leader's submission is also assigned to this mentor
                $leaderSubmission = Submission::where('id_user', $leader->id_user)
                    ->where('id_user_mentor', $mentorId)
                    ->first();

                if (!$leaderSubmission)
                    continue;

                $targets[] = [
                    'type' => 'Team',
                    'id_team' => $sub->id_team,
                    'id_target' => $leader->id_user,
                    'id_submission' => $leaderSubmission->id_submission,
                    'name' => $leader->name,
                    'team_name' => $teamName,
                    'email' => $leader->email,
                    'position' => optional($leaderSubmission->position)->name,
                    'program' => optional($leaderSubmission->vacancy)->title,
                    'id_position' => $leaderSubmission->id_position,
                ];
            } else {
                $targets[] = [
                    'type' => 'Individual',
                    'id_team' => null,
                    'id_target' => $sub->id_user,
                    'id_submission' => $sub->id_submission,
                    'name' => $sub->user->name,
                    'email' => $sub->user->email,
                    'position' => optional($sub->position)->name,
                    'program' => optional($sub->vacancy)->title,
                    'id_position' => $sub->id_position,
                ];
            }
        }

        return response()->json([
            'message' => 'Assign targets retrieved successfully',
            'data' => $targets,
        ]);
    }

    public function getCompetencies(Request $request)
    {
        $mentor = $request->user();
        $idPosition = $request->query('id_position');

        $query = \App\Models\Competency::query();

        if ($idPosition) {
            $query->whereHas('positions', fn($q) => $q->where('positions.id_position', $idPosition));
        } elseif ($mentor->id_company) {
            // Optional: Filter by company if needed, but for now just get all competencies
            // so we can resolve names in the main table.
        }

        $competencies = $query->get(['id_competency', 'name', 'description']);

        return response()->json(['data' => $competencies]);
    }

    public function index(Request $request)
    {
        $mentorId = $request->user()->id_user;

        // Fetch projects or independent tasks (parent_id_task is null)
        $tasks = Task::where('id_mentor', $mentorId)
            ->where(function ($q) {
                $q->where('task_type', 'project')
                    ->orWhereNull('parent_id_task');
            })
            ->with(['intern', 'team', 'subTasks.intern'])
            ->orderBy('created_at', 'desc')
            ->get()->map(function ($task) {
                $targetName = $task->intern ? $task->intern->name : 'Unknown';
                if ($task->id_team && $task->team) {
                    $targetName = "Team {$task->team->name} (Leader: {$targetName})";
                }

                // If it's an old task (type null), treat it as a project with no subtasks for now
                $isProject = $task->task_type === 'project';

                return [
                    'id_task' => $task->id_task,
                    'id_intern' => $task->id_intern,
                    'id_team' => $task->id_team,
                    'title' => $task->title,
                    'description' => $task->description,
                    'status' => $task->status,
                    'frequency' => $task->frequency ?? '-',
                    'task_type' => $task->task_type ?? 'independent',
                    'target_name' => $targetName,
                    'type' => $task->id_team ? 'Team' : 'Individual',
                    'created_at' => $task->created_at->toIso8601String(),
                    'competency_ids' => $task->competency_ids,
                    'deadline_at' => $task->deadline_at,
                    'work_attachments' => $task->work_attachments,
                    'submitted_at' => $task->submitted_at,
                    'feedback_notes' => $task->feedback_notes,
                    'subtasks' => $task->subTasks->map(fn($st) => [
                        'id' => $st->id_task,
                        'title' => $st->title,
                        'description' => $st->description,
                        'assignee' => $st->intern?->name ?? 'Unknown',
                        'status' => $st->status,
                        'deadline_at' => $st->deadline_at,
                        'competency_ids' => $st->competency_ids,
                        'work_attachments' => $st->work_attachments,
                        'submitted_at' => $st->submitted_at,
                        'feedback_notes' => $st->feedback_notes,
                    ]),
                ];
            });

        return response()->json([
            'message' => 'Tasks retrieved successfully',
            'data' => $tasks
        ]);
    }

    public function store(Request $request)
    {
        $mentorId = $request->user()->id_user;

        try {
            $validated = $request->validate([
                'id_target' => 'required|string',
                'id_team' => 'nullable|string',
                'title' => 'required|string',
                'description' => 'required|string',
                'frequency' => 'required|in:daily,weekly,bi-weekly,monthly',
                'start_date' => 'required|date',
                'targets' => 'required|array|min:1',
                'targets.*.title' => 'required|string',
                'targets.*.description' => 'required|string',
                'targets.*.competency_ids' => 'nullable|array',
                'targets.*.deadline_at' => 'nullable|date',
            ]);

            // 1. Create the Main Project Task
            $projectId = (string) Str::uuid();
            $project = Task::create([
                'id_task' => $projectId,
                'id_mentor' => $mentorId,
                'id_intern' => $validated['id_target'],
                'id_team' => $validated['id_team'] ?? null,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'frequency' => $validated['frequency'],
                'task_type' => 'project',
                'status' => 'pending',
                'deadline_at' => null,
                'created_at' => Carbon::parse($validated['start_date']), // Set created_at to start_date for legacy/display consistency
            ]);

            // 2. Create Target Items (Subtasks)
            $startDate = Carbon::parse($validated['start_date']);

            foreach ($validated['targets'] as $index => $targetData) {
                if (!empty($targetData['deadline_at'])) {
                    $deadline = Carbon::parse($targetData['deadline_at']);
                } else {
                    $deadline = clone $startDate;
                    $count = $index + 1;
                    if ($validated['frequency'] === 'daily') {
                        $deadline->addDays($count);
                    } elseif ($validated['frequency'] === 'weekly') {
                        $deadline->addWeeks($count);
                    } elseif ($validated['frequency'] === 'bi-weekly') {
                        $deadline->addWeeks($count * 2);
                    } elseif ($validated['frequency'] === 'monthly') {
                        $deadline->addMonths($count);
                    }
                }

                Task::create([
                    'id_task' => (string) Str::uuid(),
                    'parent_id_task' => $projectId,
                    'id_mentor' => $mentorId,
                    'id_intern' => $validated['id_target'],
                    'id_team' => $validated['id_team'] ?? null,
                    'title' => $targetData['title'],
                    'description' => $targetData['description'],
                    'competency_ids' => $targetData['competency_ids'] ?? null,
                    'task_type' => 'target',
                    'status' => 'pending',
                    'deadline_at' => $deadline,
                ]);
            }

            return response()->json([
                'message' => 'Project and targets created successfully',
                'data' => $project->load('subTasks')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create project: ' . $e->getMessage(),
                'error' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function update(Request $request, $idTask)
    {
        $mentorId = $request->user()->id_user;
        $task = Task::where('id_task', $idTask)->where('id_mentor', $mentorId)->firstOrFail();

        // Cascade deadlines if a target date is changed directly
        if ($task->task_type === 'target' && $request->has('deadline_at')) {
            $newDeadline = \Carbon\Carbon::parse($request->input('deadline_at'));
            $task->deadline_at = $newDeadline;
            $task->save();

            $parent = Task::find($task->parent_id_task);
            if ($parent && in_array($parent->frequency, ['daily', 'weekly', 'bi-weekly', 'monthly'])) {
                $siblings = Task::where('parent_id_task', $parent->id_task)
                    ->where('task_type', 'target')
                    ->orderBy('deadline_at', 'asc')
                    ->get();
                $found = false;
                $currentDeadline = clone $newDeadline;
                foreach ($siblings as $sibling) {
                    if ($found) {
                        if ($parent->frequency === 'daily') $currentDeadline->addDay();
                        elseif ($parent->frequency === 'weekly') $currentDeadline->addWeek();
                        elseif ($parent->frequency === 'bi-weekly') $currentDeadline->addWeeks(2);
                        elseif ($parent->frequency === 'monthly') $currentDeadline->addMonth();
                        $sibling->deadline_at = clone $currentDeadline;
                        $sibling->save();
                    }
                    if ($sibling->id_task === $task->id_task) $found = true;
                }
            }
            return response()->json(['message' => 'Deadline updated with cascade']);
        }

        try {
            $validated = $request->validate([
                'title' => 'nullable|string',
                'description' => 'nullable|string',
                'status' => 'nullable|in:draft,pending,in_progress,done',
                'deadline_at' => 'nullable|date',
                'feedback_notes' => 'nullable|string',
                'frequency' => 'nullable|in:daily,weekly,bi-weekly,monthly',
                'start_date' => 'nullable|date',
                'targets' => 'nullable|array',
                'targets.*.id' => 'nullable|string',
                'targets.*.title' => 'required_with:targets|string',
                'targets.*.description' => 'required_with:targets|string',
                'targets.*.competency_ids' => 'nullable|array',
                'targets.*.deadline_at' => 'nullable|date',
            ]);

            // Manual update for created_at to bypass mass-assignment protection
            if ($request->has('start_date')) {
                $task->created_at = Carbon::parse($request->input('start_date'));
            }
            $task->task_type = 'project';
            $task->fill($request->only(['title', 'description', 'status', 'deadline_at', 'feedback_notes', 'frequency']));
            $task->save();

            // If targets are provided, update/create them
            if ($request->has('targets')) {
                $targetIds = collect($validated['targets'])->pluck('id')->filter()->toArray();

                // Delete targets that are no longer in the list
                Task::where('parent_id_task', $task->id_task)
                    ->whereNotIn('id_task', $targetIds)
                    ->delete();

                $startDate = Carbon::parse($request->input('start_date', $task->created_at));
                $frequency = $validated['frequency'] ?? $task->frequency ?? 'daily';

                foreach ($validated['targets'] as $index => $tData) {
                    // Use custom deadline if provided, else auto-calculate
                    if (!empty($tData['deadline_at'])) {
                        $deadline = Carbon::parse($tData['deadline_at']);
                    } else {
                        $deadline = clone $startDate;
                        $count = $index + 1; // Target 1 is 1 interval after start
                        if ($frequency === 'daily') {
                            $deadline->addDays($count);
                        } elseif ($frequency === 'weekly') {
                            $deadline->addWeeks($count);
                        } elseif ($frequency === 'bi-weekly') {
                            $deadline->addWeeks($count * 2);
                        } elseif ($frequency === 'monthly') {
                            $deadline->addMonths($count);
                        }
                    }

                    if (!empty($tData['id'])) {
                        // Update existing target
                        Task::where('id_task', $tData['id'])
                            ->where('parent_id_task', $task->id_task)
                            ->update([
                                'title' => $tData['title'],
                                'description' => $tData['description'],
                                'competency_ids' => $tData['competency_ids'] ?? null,
                                'deadline_at' => $deadline,
                            ]);
                    } else {
                        // Create new target
                        Task::create([
                            'id_task' => (string) Str::uuid(),
                            'parent_id_task' => $task->id_task,
                            'id_mentor' => $mentorId,
                            'id_intern' => $task->id_intern,
                            'id_team' => $task->id_team,
                            'title' => $tData['title'],
                            'description' => $tData['description'],
                            'competency_ids' => $tData['competency_ids'] ?? null,
                            'task_type' => 'target',
                            'status' => 'pending',
                            'deadline_at' => $deadline,
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'Task updated successfully',
                'data' => $task->load('subTasks')
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $idTask)
    {
        $mentorId = $request->user()->id_user;
        $task = Task::where('id_task', $idTask)->where('id_mentor', $mentorId)->firstOrFail();

        // Delete subtasks if it's a project
        if ($task->task_type === 'project') {
            Task::where('parent_id_task', $task->id_task)->delete();
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    /**
     * Intern submits work attachments for a task.
     * Called via: POST /api/intern/tasks/{id_task}/work
     */
    public function submitWork(Request $request, $idTask)
    {
        $user = $request->user();
        $task = Task::where('id_task', $idTask)
            ->where('id_intern', $user->id_user)
            ->firstOrFail();

        $validated = $request->validate([
            'attachments' => 'required|array|min:1',
            'attachments.*.type' => 'required|in:link,file',
            'attachments.*.label' => 'required|string|max:200',
            'attachments.*.value' => 'required|string',
        ]);

        $task->update([
            'work_attachments' => $validated['attachments'],
            'submitted_at' => now(),
            'status' => 'done',
        ]);

        return response()->json([
            'message' => 'Work submitted successfully',
            'data' => $task,
        ]);
    }

    /**
     * Upload a single file for task work and return its storage path.
     * Called via: POST /api/intern/tasks/{id_task}/upload-file
     */
    public function uploadWorkFile(Request $request, $idTask)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // max 50MB, any type
        ]);

        $path = $request->file('file')->store("task-works/{$idTask}", 'public');

        return response()->json([
            'message' => 'File uploaded successfully',
            'path' => $path,
            'url' => asset("storage/{$path}"),
        ]);
    }
    public function approveLogbook($id)
    {
        $task = Task::findOrFail($id);
        $task->logbook_approved = true;
        $task->save();
        return response()->json(['message' => 'Logbook approved', 'data' => $task]);
    }
}
