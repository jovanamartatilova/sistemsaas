<?php

namespace App\Http\Controllers;

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
        $mentor     = $request->user();
        $mentorId   = $mentor->id_user;
        $companyId  = $mentor->id_company;

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

        $targets        = [];
        $processedTeams = [];

        foreach ($submissions as $sub) {
            if (!$sub->user) continue;

            if ($sub->id_team) {
                if (in_array($sub->id_team, $processedTeams)) continue;
                $processedTeams[] = $sub->id_team;

                $teamName     = optional($sub->team)->name ?? 'Team';
                $leaderMember = $sub->teamMembers->firstWhere('role', 'leader');
                $leader       = $leaderMember?->user;

                if (!$leader) continue;

                // Only show team if leader's submission is also assigned to this mentor
                $leaderSubmission = Submission::where('id_user', $leader->id_user)
                    ->where('id_user_mentor', $mentorId)
                    ->first();

                if (!$leaderSubmission) continue;

                $targets[] = [
                    'type'         => 'Team',
                    'id_team'      => $sub->id_team,
                    'id_target'    => $leader->id_user,
                    'id_submission'=> $leaderSubmission->id_submission,
                    'name'         => $leader->name,
                    'team_name'    => $teamName,
                    'email'        => $leader->email,
                    'position'     => optional($leaderSubmission->position)->name,
                    'program'      => optional($leaderSubmission->vacancy)->title,
                    'id_position'  => $leaderSubmission->id_position,
                ];
            } else {
                $targets[] = [
                    'type'         => 'Individual',
                    'id_team'      => null,
                    'id_target'    => $sub->id_user,
                    'id_submission'=> $sub->id_submission,
                    'name'         => $sub->user->name,
                    'email'        => $sub->user->email,
                    'position'     => optional($sub->position)->name,
                    'program'      => optional($sub->vacancy)->title,
                    'id_position'  => $sub->id_position,
                ];
            }
        }

        return response()->json([
            'message' => 'Assign targets retrieved successfully',
            'data'    => $targets,
        ]);
    }

    public function getCompetencies(Request $request)
    {
        $idPosition = $request->query('id_position');
        if (!$idPosition) {
            return response()->json(['data' => []]);
        }

        $competencies = \App\Models\Competency::whereHas('positions', fn($q) => $q->where('positions.id_position', $idPosition))
            ->get(['id_competency', 'name', 'description']);

        return response()->json(['data' => $competencies]);
    }
    
    public function index(Request $request) 
    {
        $mentorId = $request->user()->id_user;
        
        $tasks = Task::where('id_mentor', $mentorId)
            ->whereNull('parent_id_task')
            ->with(['intern', 'team', 'subTasks.intern'])
            ->orderBy('created_at', 'desc')
            ->get()->map(function ($task) {
                $targetName = $task->intern ? $task->intern->name : 'Unknown';
                if ($task->id_team && $task->team) {
                    $targetName = "Team {$task->team->name} (Leader: {$targetName})";
                }
                return [
                    'id_task'          => $task->id_task,
                    'title'            => $task->title,
                    'description'      => $task->description,
                    'status'           => $task->status,
                    'deadline_at'      => $task->deadline_at,
                    'target_name'      => $targetName,
                    'type'             => $task->id_team ? 'Team' : 'Individual',
                    'created_at'       => $task->created_at,
                    'work_attachments' => $task->work_attachments,
                    'submitted_at'     => $task->submitted_at,
                    'feedback_notes'   => $task->feedback_notes,
                    'subtasks'         => $task->subTasks->map(fn($st) => [
                        'id'       => $st->id_task,
                        'title'    => $st->title,
                        'description' => $st->description,
                        'assignee' => $st->intern?->name ?? 'Unknown',
                        'status'   => $st->status,
                        'work'     => $st->work_attachments,
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
        
        $validated = $request->validate([
            'id_target'      => 'required|string',
            'id_team'        => 'nullable|string',
            'title'          => 'required|string',
            'description'    => 'required|string',
            'status'         => 'required|in:draft,pending',
            'deadline_at'    => 'required|date',
            'competency_ids' => 'nullable|array',
            'competency_ids.*' => 'string',
        ]);

        $task = Task::create([
            'id_task'        => (string) Str::uuid(),
            'id_mentor'      => $mentorId,
            'id_intern'      => $validated['id_target'],
            'id_team'        => $validated['id_team'] ?? null,
            'title'          => $validated['title'],
            'description'    => $validated['description'],
            'competency_ids' => $validated['competency_ids'] ?? null,
            'status'         => $validated['status'],
            'deadline_at'    => $validated['deadline_at'],
        ]);

        return response()->json([
            'message' => 'Task created successfully',
            'data'    => $task
        ], 201);
    }
    
    public function update(Request $request, $idTask)
    {
        $mentorId = $request->user()->id_user;
        $task = Task::where('id_task', $idTask)->where('id_mentor', $mentorId)->firstOrFail();
        
        $validated = $request->validate([
            'title'          => 'nullable|string',
            'description'    => 'nullable|string',
            'status'         => 'nullable|in:draft,pending,in_progress,done',
            'deadline_at'    => 'nullable|date',
            'feedback_notes' => 'nullable|string',
        ]);
        
        $task->update($validated);
        
        return response()->json([
            'message' => 'Task updated successfully',
            'data' => $task
        ]);
    }
    
    public function destroy(Request $request, $idTask) 
    {
        $mentorId = $request->user()->id_user;
        $task = Task::where('id_task', $idTask)->where('id_mentor', $mentorId)->firstOrFail();
        
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
            'attachments'           => 'required|array|min:1',
            'attachments.*.type'    => 'required|in:link,file',
            'attachments.*.label'   => 'required|string|max:200',
            'attachments.*.value'   => 'required|string',
        ]);

        $task->update([
            'work_attachments' => $validated['attachments'],
            'submitted_at'     => now(),
            'status'           => 'done',
        ]);

        return response()->json([
            'message' => 'Work submitted successfully',
            'data'    => $task,
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
            'path'    => $path,
            'url'     => asset("storage/{$path}"),
        ]);
    }
}
