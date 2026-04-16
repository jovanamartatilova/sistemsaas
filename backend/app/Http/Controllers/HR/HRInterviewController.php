<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HRInterviewController extends Controller
{
    /**
     * GET /hr/interviews
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;

        // Get scheduled interviews
        $interviews = Interview::whereHas('submission.vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->with(['submission.user', 'submission.position', 'interviewer'])
         ->orderBy('interview_date')
         ->orderBy('interview_time')
         ->get()
         ->map(fn($i) => $this->formatInterview($i));

        // Get submissions ready for interview (status='interview' but no Interview record yet)
        $readyForInterview = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->where('status', 'interview')
         ->with(['user', 'position', 'vacancy'])
         ->whereDoesntHave('interview')
         ->orderByDesc('submitted_at')
         ->get()
         ->map(fn($s) => [
             'id_submission'  => $s->id_submission,
             'candidate_name' => $s->user?->name,
             'position'       => $s->position?->name,
             'type'           => 'pending_schedule',
             'submitted_at'   => $s->submitted_at,
             'screening_status' => $s->screening_status,
         ]);

        $today = now()->toDateString();

        // Stats (only count Interview records)
        $base = Interview::whereHas('submission.vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );

        // Stats for ready-for-interview submissions
        $readyCount = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->where('status', 'interview')
         ->whereDoesntHave('interview')
         ->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'today'     => (clone $base)->whereDate('interview_date', $today)->count(),
                    'pending'   => (clone $base)->where('result', 'pending')->count(),
                    'completed' => (clone $base)->whereIn('result', ['accepted', 'rejected', 'continue'])->count(),
                    'ready_for_schedule' => $readyCount,
                ],
                'interviews' => $interviews,
                'ready_for_interview' => $readyForInterview,
            ],
        ]);
    }

    /**
     * POST /hr/interviews
     * Tambah jadwal interview baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_submission'    => 'required|string|exists:submissions,id_submission',
            'interview_date'   => 'required|date',
            'interview_time'   => 'required|date_format:H:i',
            'media'            => 'required|in:Google Meet,Zoom,Microsoft Teams,Offline',
            'link'             => 'nullable|url',
            'notes'            => 'nullable|string|max:500',
        ]);

        // Pastikan submission milik company ini
        $submission = Submission::where('id_submission', $request->id_submission)
            ->whereHas('vacancy', fn($q) =>
                $q->where('id_company', $request->user()->id_company)
            )->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
        }

        $interview = Interview::create([
            'id_interview'   => 'INT' . strtoupper(Str::random(7)),
            'id_submission'  => $request->id_submission,
            'id_interviewer' => $request->user()->id_user,
            'interview_date' => $request->interview_date,
            'interview_time' => $request->interview_time,
            'media'          => $request->media,
            'link'           => $request->link,
            'notes'          => $request->notes,
            'result'         => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Interview scheduled',
            'data'    => $this->formatInterview($interview->load(['submission.user', 'submission.position', 'interviewer'])),
        ], 201);
    }

    /**
     * PATCH /hr/interviews/{id}
     * Edit jadwal interview
     */
    public function update(Request $request, string $id)
    {
        $interview = $this->findInterview($id, $request->user()->id_company);

        if (!$interview) {
            return response()->json(['success' => false, 'message' => 'Interview not found'], 404);
        }

        $request->validate([
            'interview_date' => 'sometimes|date',
            'interview_time' => 'sometimes|date_format:H:i',
            'media'          => 'sometimes|in:Google Meet,Zoom,Microsoft Teams,Offline',
            'link'           => 'nullable|url',
            'notes'          => 'nullable|string|max:500',
            'id_interviewer' => 'sometimes|string|exists:users,id_user',
        ]);

        $interview->update($request->only([
            'interview_date', 'interview_time',
            'media', 'link', 'notes', 'id_interviewer',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Interview updated',
            'data'    => $this->formatInterview($interview->fresh(['submission.user', 'submission.position', 'interviewer'])),
        ]);
    }

    /**
     * PATCH /hr/interviews/{id}/result
     * Update hasil interview
     */
    public function updateResult(Request $request, string $id)
    {
        $request->validate([
            'result' => 'required|in:pending,continue,accepted,rejected',
        ]);

        $interview = $this->findInterview($id, $request->user()->id_company);

        if (!$interview) {
            return response()->json(['success' => false, 'message' => 'Interview not found'], 404);
        }

        $interview->update(['result' => $request->result]);

        // Kalau accepted, update status submission juga
        if ($request->result === 'accepted') {
            $interview->submission->update(['status' => 'accepted']);
        } elseif ($request->result === 'rejected') {
            $interview->submission->update(['status' => 'rejected']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Result updated',
            'data'    => $this->formatInterview($interview->fresh(['submission.user', 'submission.position', 'interviewer'])),
        ]);
    }

    // ── HELPERS ─────────────────────────────────────────────

    private function findInterview(string $id, string $companyId): ?Interview
    {
        return Interview::where('id_interview', $id)
            ->whereHas('submission.vacancy', fn($q) =>
                $q->where('id_company', $companyId)
            )->with(['submission.user', 'submission.position', 'interviewer'])
            ->first();
    }

    private function formatInterview(Interview $i): array
    {
        // Handle date - may be string or Carbon instance
        $date = $i->interview_date;
        if ($date && !is_string($date)) {
            $date = $date->format('Y-m-d');
        }

        // Handle time - may be string or Carbon instance
        $time = $i->interview_time;
        if ($time && !is_string($time)) {
            $time = $time->format('H:i');
        }

        return [
            'id_interview'   => $i->id_interview,
            'candidate_name' => $i->submission?->user?->name,
            'position'       => $i->submission?->position?->name,
            'interview_date' => $date ?? '',
            'interview_time' => $time ?? '',
            'id_interviewer' => $i->id_interviewer,
            'interviewer'    => $i->interviewer?->name,
            'media'          => $i->media,
            'link'           => $i->link,
            'notes'          => $i->notes,
            'result'         => $i->result,
        ];
    }
}
