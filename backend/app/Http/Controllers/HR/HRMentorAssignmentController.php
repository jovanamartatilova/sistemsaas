<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;

class HRMentorAssignmentController extends Controller
{
    /**
     * GET /hr/assign-mentor
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;

        $submissions = Submission::where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user', 'position', 'vacancy', 'mentor'])
            ->get()
            ->map(fn($s) => [
                'id_submission' => $s->id_submission,
                'name'          => $s->user?->name,
                'email'         => $s->user?->email,
                'position'      => $s->position?->name,
                'program'       => $s->vacancy?->title,
                'type'          => $s->vacancy?->type,
                'mentor_id'     => $s->id_user_mentor,
                'mentor_name'   => $s->mentor?->name,
                'is_assigned'   => !empty($s->id_user_mentor),
            ]);

        $mentors = User::where('id_company', $companyId)
            ->where('role', 'mentor')
            ->where('is_active', true)
            ->get()
            ->map(function ($m) {
                $activeInterns = Submission::where('id_user_mentor', $m->id_user)->count();
                return [
                    'id_mentor'      => $m->id_user,
                    'name'           => $m->name,
                    'email'          => $m->email,
                    'active_interns' => $activeInterns,
                    'capacity'       => 6,
                ];
            });

        $total      = $submissions->count();
        $assigned   = $submissions->where('is_assigned', true)->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'          => $total,
                    'assigned'       => $assigned,
                    'unassigned'     => $total - $assigned,
                    'active_mentors' => $mentors->count(),
                ],
                'interns' => $submissions,
                'mentors' => $mentors,
            ],
        ]);
    }

    /**
     * POST /hr/assign-mentor
     */
    public function assign(Request $request)
    {
        $request->validate([
            'id_submission' => 'required|string|exists:submissions,id_submission',
            'id_mentor'     => 'required|string|exists:users,id_user',
        ]);

        $companyId  = $request->user()->id_company;

        $submission = Submission::where('id_submission', $request->id_submission)
            ->where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
        }

        $mentor = User::where('id_user', $request->id_mentor)
            ->where('id_company', $companyId)
            ->where('role', 'mentor')
            ->where('is_active', true)
            ->first();

        if (!$mentor) {
            return response()->json(['success' => false, 'message' => 'Mentor not found'], 404);
        }

        $submission->update(['id_user_mentor' => $request->id_mentor]);

        return response()->json(['success' => true, 'message' => 'Mentor assigned successfully']);
    }

    /**
     * DELETE /hr/assign-mentor/{id_submission}
     */
    public function unassign(Request $request, string $id)
    {
        $companyId  = $request->user()->id_company;

        $submission = Submission::where('id_submission', $id)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
        }

        $submission->update(['id_user_mentor' => null]);

        return response()->json(['success' => true, 'message' => 'Mentor unassigned']);
    }

    /**
     * POST /hr/assign-mentor/auto
     */
    public function autoAssign(Request $request)
    {
        $companyId = $request->user()->id_company;

        $unassigned = Submission::where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->whereNull('id_user_mentor')
            ->get();

        $mentors = User::where('id_company', $companyId)
            ->where('role', 'mentor')
            ->where('is_active', true)
            ->get();

        $assigned = 0;
        foreach ($unassigned as $submission) {
            foreach ($mentors as $mentor) {
                $load = Submission::where('id_user_mentor', $mentor->id_user)->count();
                if ($load < 6) {
                    $submission->update(['id_user_mentor' => $mentor->id_user]);
                    $assigned++;
                    break;
                }
            }
        }

        return response()->json(['success' => true, 'message' => "{$assigned} interns auto-assigned"]);
    }
}