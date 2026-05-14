<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HRCandidateController extends Controller
{
    /**
     * GET /hr/candidates
     * List semua kandidat dengan filter & search
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;

        $query = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->with(['user', 'position', 'vacancy', 'interviews']);

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'stage_0') {
                $query->whereIn('status', ['pending', 'stage_0']);
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by position
        if ($request->filled('id_position')) {
            $query->where('id_position', $request->id_position);
        }

        // Search by name atau email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
            );
        }

        $candidates = $query->orderByDesc('submitted_at')->get()
            ->map(fn($s) => $this->formatSubmission($s));

        // Stats
        $base = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'      => (clone $base)->count(),
                    'unprocessed'=> (clone $base)->where('status', 'pending')->count(),
                    'accepted'   => (clone $base)->where('status', 'accepted')->count(),
                    'rejected'   => (clone $base)->where('status', 'rejected')->count(),
                ],
                'candidates' => $candidates,
            ],
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/accept
     */
    public function accept(Request $request, string $id)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        if ($submission->status === 'accepted') {
            return response()->json(['success' => false, 'message' => 'Already accepted'], 422);
        }

        $submission->update(['status' => 'accepted']);
        Interview::where('id_submission', $submission->id_submission)
                ->update(['result' => 'passed']);

        \App\Models\Apprentice::firstOrCreate(
            ['id_submission' => $submission->id_submission],
            [
                'id_apprentice' => 'APP' . strtoupper(\Illuminate\Support\Str::random(7)),
                'status'        => 'active',
                'start_date'    => now()->toDateString(),
                'end_date'      => null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Candidate accepted',
            'data'    => $this->formatSubmission($submission->fresh(['user', 'position', 'vacancy'])),
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/reject
     */
    public function reject(Request $request, string $id)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        if ($submission->status === 'rejected') {
            return response()->json(['success' => false, 'message' => 'Already rejected'], 422);
        }

        $submission->update(['status' => 'rejected']);
        Interview::where('id_submission', $submission->id_submission)
    ->update(['result' => 'failed']);

        return response()->json([
            'success' => true,
            'message' => 'Candidate rejected',
            'data'    => $this->formatSubmission($submission->fresh(['user', 'position', 'vacancy'])),
        ]);
    }

    /**
     * GET /hr/candidates/export
     * Export CSV semua kandidat
     */
    public function exportCsv(Request $request)
    {
        $companyId = $request->user()->id_company;

        $candidates = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->with(['user', 'position', 'vacancy'])->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="candidates.csv"',
        ];

        $callback = function () use ($candidates) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'Name', 'Email', 'Phone', 'Position',
                'Program', 'Type', 'Status', 'Applied Date',
            ]);

            foreach ($candidates as $s) {
                fputcsv($file, [
                    $s->user?->name,
                    $s->user?->email,
                    $s->user?->phone,
                    $s->position?->name,
                    $s->vacancy?->title,
                    $s->vacancy?->type,
                    $s->status,
                    $s->submitted_at,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * GET /hr/candidates/{id}/documents/{type}
     * View dokumen kandidat (cv, cover_letter, portfolio, institution_letter)
     */
    public function viewDocument(Request $request, string $id, string $type)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $column = match($type) {
            'cv'                 => 'cv_file',
            'supporting_document'=> 'supporting_document_file',
            'cover_letter'       => 'supporting_document_file',
            'portfolio'          => 'portfolio_file',
            'institution_letter' => 'supporting_document_file',
            default              => null,
        };

        if (!$column || empty($submission->$column)) {
            return response()->json(['success' => false, 'message' => 'Document not found'], 404);
        }

        return response()->json([
            'success' => true,
            'url'     => asset('storage/' . $submission->$column),
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/screening
     * Mark candidate as screening
     */
    public function screening(Request $request, string $id)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $submission->update(['status' => 'screening']);

        return response()->json([
            'success' => true,
            'message' => 'Candidate moved to screening',
            'data'    => $this->formatSubmission($submission->fresh(['user', 'position', 'vacancy'])),
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/interview
     * Mark candidate as interview
     */
    public function interview(Request $request, string $id)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $submission->update(['status' => 'interview']);

        return response()->json([
            'success' => true,
            'message' => 'Candidate moved to interview',
            'data'    => $this->formatSubmission($submission->fresh(['user.candidate', 'position', 'vacancy'])),
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/stage
     * Mark candidate dynamically based on stage index
     */
    public function updateStage(Request $request, string $id)
    {
        $request->validate(['stage' => 'required|string']);

        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

       $submission->update(['status' => $request->stage]);

        // Mark previous interview as passed when advancing stage
        Interview::where('id_submission', $submission->id_submission)
            ->where('result', 'pending')
            ->update(['result' => 'passed']);

        return response()->json([
            'success' => true,
            'message' => 'Candidate stage updated',
            'data'    => $this->formatSubmission($submission->fresh(['user.candidate', 'position', 'vacancy'])),
        ]);
    }

    // ── HELPERS ─────────────────────────────────────────────

    private function findSubmission(string $id, string $companyId): ?Submission
    {
        return Submission::where('id_submission', $id)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user.candidate', 'position', 'vacancy'])
            ->first();
    }

    private function formatSubmission(Submission $s): array
    {
        // Extract test details from JSON column
        $testData = null;
        if (!empty($s->test_details) && is_array($s->test_details)) {
            $testData = [
                'test_name' => $s->test_details['test_name'] ?? null,
                'test_link' => $s->test_details['test_link'] ?? null,
                'test_date' => $s->test_details['test_date'] ?? null,
                'test_time' => $s->test_details['test_time'] ?? null,
                'test_score' => $s->test_details['test_score'] ?? null,
                'test_notes' => $s->test_details['test_notes'] ?? null,
            ];
        }

        // Extract interview data (first/primary interview)
        $interviewData = null;
        if ($s->interviews && $s->interviews->count() > 0) {
            $interview = $s->interviews->first();
            $interviewData = [
                'id_interview' => $interview->id_interview,
                'interview_link' => $interview->link,
                'interview_date' => $interview->interview_date,
                'interview_time' => $interview->interview_time,
                'interview_notes' => $interview->notes,
                'interview_result' => $interview->result,
            ];
        }

        return [
            'id_submission'   => $s->id_submission,
            'name'            => $s->user?->name,
            'email'           => $s->user?->email,
            'phone'           => $s->user?->phone,
            'university'      => $s->user?->candidate?->institution ?? '-',
            'position'        => $s->position?->name,
            'program'         => $s->vacancy?->title,
            'type'            => $s->vacancy?->type,
            'status'          => $s->status,
            'submitted_at'    => $s->submitted_at,
            'has_cv'          => !empty($s->cv_file),
            'has_supporting_document' => !empty($s->supporting_document_file),
            'has_portfolio'   => !empty($s->portfolio_file),
            'has_cover_letter'=> !empty($s->supporting_document_file),
            'has_institution_letter' => !empty($s->supporting_document_file),
            'cv_url'          => $s->cv_file ? asset('storage/' . $s->cv_file) : null,
            'supporting_document_url' => $s->supporting_document_file ? asset('storage/' . $s->supporting_document_file) : null,
            'cover_letter_url'=> $s->supporting_document_file ? asset('storage/' . $s->supporting_document_file) : null,
            'portfolio_url'   => $s->portfolio_file ? asset('storage/' . $s->portfolio_file) : null,
            'institution_letter_url' => $s->supporting_document_file ? asset('storage/' . $s->supporting_document_file) : null,
            // Test data from JSON column
            'test_name'       => $testData['test_name'] ?? null,
            'test_link'       => $testData['test_link'] ?? null,
            'test_date'       => $testData['test_date'] ?? null,
            'test_time'       => $testData['test_time'] ?? null,
            'test_score'      => $testData['test_score'] ?? null,
            'test_notes'      => $testData['test_notes'] ?? null,
            // Interview data from Interview table
            'id_interview'    => $interviewData['id_interview'] ?? null,
            'interview_link'  => $interviewData['interview_link'] ?? null,
            'interview_date'  => $interviewData['interview_date'] ?? null,
            'interview_time'  => $interviewData['interview_time'] ?? null,
            'interview_notes' => $interviewData['interview_notes'] ?? null,
            'interview_result' => $interviewData['interview_result'] ?? null,
        ];
    }

    public function allCandidates(Request $request)
    {
        $companyId = $request->user()->id_company;

        $query = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->with([
            'user.candidate',
            'position',
            'vacancy',
            'team',
            'teamMembers.user.candidate',
        ]);

        $statusParam = $request->query('status');

        // Filter type
        if ($request->filled('type')) {
            if ($request->type === 'individual') {
                $query->whereNull('id_team');
            } elseif ($request->type === 'group') {
                $query->whereNotNull('id_team');
            }
        }

        // Search by name atau email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) =>
                    $u->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                )->orWhereHas('team', fn($t) =>
                    $t->where('name', 'like', "%$search%")
                );
            });
        }

        $submissions = $query->orderByDesc('submitted_at')->get();

        $seen     = [];
        $results  = [];

        foreach ($submissions as $s) {
            if ($s->id_team) {
                if (isset($seen[$s->id_team])) continue;
                $seen[$s->id_team] = true;
            }

            // Map status
            $status = $s->status;
            if ($status === 'pending' || $status === 'stage_0') {
                $s->mapped_status = 'screening';
            } elseif (str_starts_with($status, 'stage_')) {
                $idx = (int) str_replace('stage_', '', $status) - 1;
                $flow = $s->position?->selection_flow;
                if (is_string($flow)) $flow = json_decode($flow, true);
                if (isset($flow[$idx])) {
                    $s->mapped_status = $flow[$idx]['type'] ?? $status;
                } else {
                    $s->mapped_status = $status;
                }
            } else {
                $s->mapped_status = $status;
            }

            // Filter status
            if ($statusParam && $statusParam !== 'all' && $statusParam !== '') {
                if ($s->mapped_status !== $statusParam) {
                    continue;
                }
            }

            $results[] = $this->formatSubmissionFull($s);
        }

        return response()->json([
            'success'    => true,
            'candidates' => $results,
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/notes
     */
    public function updateNotes(Request $request, string $id)
    {
        $request->validate([
            'hr_notes' => 'nullable|string|max:2000',
        ]);

        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $submission->update(['hr_notes' => $request->hr_notes]);

        return response()->json([
            'success' => true,
            'message' => 'Notes updated',
            'data'    => ['hr_notes' => $submission->hr_notes],
        ]);
    }

    /**
     * Format lengkap untuk halaman Candidate Management.
     * Termasuk team name, team members, dan hr_notes.
     */
    private function formatSubmissionFull(Submission $s): array
    {
        $members = [];

        if ($s->id_team) {
            // Ambil semua submission dari tim ini untuk dapet id_submission masing-masing
            $teamSubmissions = \App\Models\Submission::where('id_team', $s->id_team)->with('user.candidate')->get();
            // Ambil metadata leader dari table team_members
            $teamMeta = \App\Models\TeamMember::where('id_team', $s->id_team)->get()->keyBy('id_user');

            foreach ($teamSubmissions as $ts) {
                $members[] = [
                    'id_submission' => $ts->id_submission,
                    'id_user'       => $ts->id_user,
                    'name'          => $ts->user?->name,
                    'email'         => $ts->user?->email,
                    'university'    => $ts->user?->candidate?->institution ?? '-',
                    'is_leader'     => (bool) ($teamMeta[$ts->id_user]?->is_leader ?? false),
                ];
            }
        }

        return [
            'id_submission'          => $s->id_submission,
            'id_team'                => $s->id_team,
            'team_name'              => $s->team?->name ?? null,
            'team_members'           => $members,

            'name'                   => $s->user?->name,
            'email'                  => $s->user?->email,
            'phone'                  => $s->user?->phone,
            'university'             => $s->user?->candidate?->institution ?? '-',

            'position'               => $s->position?->name,
            'program'                => $s->vacancy?->title,
            'type'                   => $s->vacancy?->type,
            'status'                 => $s->mapped_status ?? $s->status,
            'submitted_at'           => $s->submitted_at,
            'hr_notes'               => $s->hr_notes,
            'motivation'             => $s->motivation_message,

            'has_cv'                 => !empty($s->cv_file),
            'has_supporting_document' => !empty($s->supporting_document_file),
            'has_portfolio'          => !empty($s->portfolio_file),
            'has_cover_letter'       => !empty($s->supporting_document_file),
            'has_institution_letter' => !empty($s->supporting_document_file),
            'cv_url'                 => $s->cv_file ? asset('storage/' . $s->cv_file) : null,
            'supporting_document_url' => $s->supporting_document_file ? asset('storage/' . $s->supporting_document_file) : null,
            'cover_letter_url'       => $s->supporting_document_file ? asset('storage/' . $s->supporting_document_file) : null,
            'portfolio_url'          => $s->portfolio_file ? asset('storage/' . $s->portfolio_file) : null,
            'institution_letter_url' => $s->supporting_document_file ? asset('storage/' . $s->supporting_document_file) : null,
        ];
    }

    public function apprentices(Request $request)
    {
        $companyId = $request->user()->id_company;

        $query = \App\Models\Apprentice::whereHas('submission.vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->with([
            'submission.user.candidate',
            'submission.position',
            'submission.vacancy',
            'submission.mentor',   // relasi mentor via id_user_mentor di Submission
        ]);

        // Filter status apprentice
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by nama intern atau nama mentor
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('submission.user', fn($u) =>
                    $u->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                )->orWhereHas('submission.mentor', fn($m) =>
                    $m->where('name', 'like', "%$search%")
                );
            });
        }

        $apprentices = $query->orderByDesc('start_date')->get()
            ->map(fn($a) => $this->formatApprentice($a));

        return response()->json([
            'success'     => true,
            'apprentices' => $apprentices,
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/assign-test
     * Assign test to a candidate submission
     */
    public function assignTest(Request $request, string $id)
    {
        \Log::info("=== assignTest START ===");
        \Log::info("Request ID: {$id}");
        \Log::info("Request Data: " . json_encode($request->all()));

        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            \Log::warning("Submission not found for ID: {$id}");
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        \Log::info("Submission found: {$submission->id_submission}");

        $validated = $request->validate([
            'test_name' => 'nullable|string|max:255',
            'test_link' => 'nullable|url',
            'test_date' => 'nullable|date',
            'test_time' => 'nullable|date_format:H:i',
            'test_score' => 'nullable|integer|min:0|max:100',
            'test_notes' => 'nullable|string',
        ]);

        \Log::info("Validation passed: " . json_encode($validated));

        // If test_name and test_link provided, it's a new test assignment
        if ($request->filled('test_name') && $request->filled('test_link')) {
            $testDetails = [
                'test_name' => $request->test_name,
                'test_link' => $request->test_link,
                'test_date' => $request->test_date ?? null,
                'test_time' => $request->test_time ?? null,
                'test_score' => $request->test_score ?? null,
                'test_notes' => $request->test_notes ?? null,
            ];
        } else {
            // Otherwise, preserve existing test data and update only score/notes
            $testDetails = $submission->test_details ?? [];
            if ($request->filled('test_score')) {
                $testDetails['test_score'] = $request->test_score;
            }
            if ($request->filled('test_notes')) {
                $testDetails['test_notes'] = $request->test_notes;
            }
        }

        \Log::info("Test Details to save: " . json_encode($testDetails));

        $submission->update(['test_details' => $testDetails]);

        \Log::info("Submission updated. Refreshing...");
        $submission = $submission->fresh(['user', 'position', 'vacancy']);
        \Log::info("After update, test_details: " . json_encode($submission->test_details));
        \Log::info("=== assignTest END ===");

        return response()->json([
            'success' => true,
            'message' => 'Test assigned successfully',
            'data' => $this->formatSubmission($submission),
        ]);
    }

    /**
     * PATCH /hr/candidates/{id}/assign-interview
     * Assign interview link/details to a candidate submission
     */
    public function assignInterview(Request $request, string $id)
    {
        \Log::info("=== assignInterview START ===");
        \Log::info("Request ID: {$id}");
        \Log::info("Request Data: " . json_encode($request->all()));
        \Log::info("User Company: " . $request->user()->id_company);

        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            \Log::warning("Submission not found for ID: {$id}");
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        \Log::info("Submission found: {$submission->id_submission}");

        try {
            $validated = $request->validate([
                'interview_link' => 'nullable|url',
                'interview_date' => 'nullable|date',
                'interview_time' => 'nullable|date_format:H:i',
                'interview_notes' => 'nullable|string',
                'interview_result' => 'nullable|in:pending,passed,failed',
            ]);
            \Log::info("Validation passed: " . json_encode($validated));
        } catch (\Exception $e) {
            \Log::error("Validation error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Validation error: ' . $e->getMessage(), 'errors' => $e->errors() ?? []], 422);
        }

        // Create or update interview record
        $interview = $submission->interviews()->first();
        \Log::info("Existing interview found: " . ($interview ? "YES id=" . $interview->id_interview : "NO"));

        if (!$interview) {
            // Create new interview
            \Log::info("Creating new interview...");
            try {
                $interview = new \App\Models\Interview([
                    'id_interview' => 'INT' . strtoupper(\Illuminate\Support\Str::random(7)),
                    'id_submission' => $submission->id_submission,
                    'id_interviewer' => $request->user()->id_user,
                    'interview_date' => $request->interview_date,
                    'interview_time' => $request->interview_time,
                    'link' => $request->interview_link,
                    'notes' => $request->interview_notes,
                    'result' => $request->interview_result ?? 'pending',
                ]);
                \Log::info("Interview object created: " . json_encode($interview->toArray()));
                $interview->save();
                \Log::info("✅ New interview SAVED: {$interview->id_interview}");
            } catch (\Exception $e) {
                \Log::error("❌ Error creating interview: " . $e->getMessage());
                throw $e;
            }
        } else {
            // Update existing interview
            \Log::info("Updating existing interview: {$interview->id_interview}");
            try {
                $updateData = [
                    'interview_date' => $request->interview_date ?? $interview->interview_date,
                    'interview_time' => $request->interview_time ?? $interview->interview_time,
                    'link' => $request->interview_link ?? $interview->link,
                    'notes' => $request->interview_notes ?? $interview->notes,
                    'result' => $request->interview_result ?? $interview->result,
                ];
                \Log::info("Update data: " . json_encode($updateData));
                $interview->update($updateData);
                \Log::info("✅ Interview UPDATED: {$interview->id_interview}");
            } catch (\Exception $e) {
                \Log::error("❌ Error updating interview: " . $e->getMessage());
                throw $e;
            }
        }

        // Auto-advance status to stage_2 if currently at stage_1 or pending
        $oldStatus = $submission->status;
        if (in_array($submission->status, ['pending', 'stage_0', 'stage_1'])) {
            $submission->update(['status' => 'stage_2']);
            \Log::info("✅ Status auto-advanced: {$oldStatus} → stage_2");
        }

        \Log::info("Refreshing submission with interviews...");
        $submission = $submission->fresh(['user', 'position', 'vacancy', 'interviews']);
        \Log::info("Submission interviews count: " . ($submission->interviews ? $submission->interviews->count() : 0));

        if ($submission->interviews && $submission->interviews->count() > 0) {
            \Log::info("Interview data in DB: " . json_encode($submission->interviews->first()->toArray()));
        }

        \Log::info("=== assignInterview END ===");

        return response()->json([
            'success' => true,
            'message' => 'Interview assigned successfully',
            'data' => $this->formatSubmission($submission),
        ]);
    }

    // ── PRIVATE HELPER ────────────────────────────────────────────────────────────

    private function formatApprentice(\App\Models\Apprentice $a): array
    {
        $s = $a->submission;

        return [
            'id_apprentice' => $a->id_apprentice,
            'id_submission' => $a->id_submission,
            'status'        => $a->status,
            'start_date'    => $a->start_date,
            'end_date'      => $a->end_date,

            // Intern info
            'name'          => $s?->user?->name,
            'email'         => $s?->user?->email,
            'phone'         => $s?->user?->phone,
            'university'    => $s?->user?->candidate?->institution ?? '-',
            'id_team'       => $s?->id_team,
            'bank_name'     => $s?->user?->candidate?->bank_name ?? '-',
            'bank_account'  => $s?->user?->candidate?->bank_account_number ?? '-',

            // Program info
            'position'      => $s?->position?->name,
            'program'       => $s?->vacancy?->title,
            'type'          => $s?->vacancy?->type,

            // Mentor info (dari id_user_mentor di tabel submissions)
            'mentor_name'   => $s?->mentor?->name,
            'mentor_email'  => $s?->mentor?->email,
        ];
    }

    /**
     * POST /hr/candidates/bulk-assign-test
     */
    public function bulkAssignTest(Request $request)
    {
        $validated = $request->validate([
            'id_submissions' => 'required|array',
            'id_submissions.*' => 'exists:submissions,id_submission',
            'test_name'     => 'required|string',
            'test_location' => 'required|string',
            'test_date'     => 'required|date',
            'test_time'     => 'required|string',
            'test_deadline' => 'nullable|date',
        ]);

        $companyId = $request->user()->id_company;
        $count = 0;

        foreach ($validated['id_submissions'] as $id) {
            $submission = Submission::where('id_submission', $id)
                ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
                ->first();

            if ($submission) {
                $testDetails = [
                    'test_name'     => $validated['test_name'],
                    'test_location' => $validated['test_location'],
                    'test_date'     => $validated['test_date'],
                    'test_time'     => $validated['test_time'],
                    'test_deadline' => $validated['test_deadline'] ?? null,
                    'test_link'     => $request->test_link ?? null,
                    'assigned_at'   => now()->toDateTimeString(),
                ];

                $submission->update(['test_details' => $testDetails]);
                $count++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully assigned test to $count candidates.",
        ]);
    }
}
