<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
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
        )->with(['user', 'position', 'vacancy']);

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

        \App\Models\Apprentice::firstOrCreate(
            ['id_submission' => $submission->id_submission],
            [
                'id_apprentice' => 'APP' . strtoupper(\Illuminate\Support\Str::random(7)),
                'status'        => 'active',
                'start_date'    => now()->toDateString(),
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
            'cover_letter'       => 'cover_letter_file',
            'portfolio'          => 'portfolio_file',
            'institution_letter' => 'institution_letter_file',
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
            'has_cover_letter'=> !empty($s->cover_letter_file),
            'has_portfolio'   => !empty($s->portfolio_file),
            'has_institution_letter' => !empty($s->institution_letter_file),
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
    
        // Filter status
        if ($request->filled('status')) {
            if ($request->status === 'stage_0') {
                $query->whereIn('status', ['pending', 'stage_0']);
            } else {
                $query->where('status', $request->status);
            }
        }
    
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
    
        if ($s->id_team && $s->teamMembers) {
            foreach ($s->teamMembers as $tm) {
                $members[] = [
                    'id_user'    => $tm->id_user,
                    'name'       => $tm->user?->name,
                    'email'      => $tm->user?->email,
                    'university' => $tm->user?->candidate?->institution ?? '-',
                    'is_leader'  => (bool) $tm->is_leader,
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
            'status'                 => $s->status,
            'submitted_at'           => $s->submitted_at,
            'hr_notes'               => $s->hr_notes,
    
            'has_cv'                 => !empty($s->cv_file),
            'has_cover_letter'       => !empty($s->cover_letter_file),
            'has_portfolio'          => !empty($s->portfolio_file),
            'has_institution_letter' => !empty($s->institution_letter_file),
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
    
            // Program info
            'position'      => $s?->position?->name,
            'program'       => $s?->vacancy?->title,
            'type'          => $s?->vacancy?->type,
    
            // Mentor info (dari id_user_mentor di tabel submissions)
            'mentor_name'   => $s?->mentor?->name,
            'mentor_email'  => $s?->mentor?->email,
        ];
    }
 
}