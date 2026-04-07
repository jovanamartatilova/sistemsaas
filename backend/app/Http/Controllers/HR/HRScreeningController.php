<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;

class HRScreeningController extends Controller
{
    /**
     * GET /hr/screening
     * List kandidat yang perlu di-screening
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;

        $query = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->whereIn('status', ['pending', 'screening'])
         ->with(['user', 'position', 'vacancy']);

        // Filter by position
        if ($request->filled('id_position')) {
            $query->where('id_position', $request->id_position);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', fn($q) =>
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
            );
        }

        $list = $query->orderByDesc('submitted_at')->get()
            ->map(fn($s) => $this->formatScreening($s));

        // Stats
        $base = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'needs_review' => (clone $base)
                        ->whereIn('status', ['pending', 'screening'])
                        ->count(),
                    'passed'   => (clone $base)->where('screening_status', 'passed')->count(),
                    'rejected' => (clone $base)->where('screening_status', 'rejected')->count(),
                ],
                'candidates' => $list,
            ],
        ]);
    }

    /**
     * PATCH /hr/screening/{id}/pass
     * Loloskan kandidat ke tahap interview
     */
    public function pass(Request $request, string $id)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $submission->update([
            'status'           => 'interview',
            'screening_status' => 'passed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate passed to interview',
            'data'    => $this->formatScreening($submission->fresh(['user', 'position'])),
        ]);
    }

    /**
     * PATCH /hr/screening/{id}/reject
     */
    public function reject(Request $request, string $id)
    {
        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $submission->update([
            'status'           => 'rejected',
            'screening_status' => 'rejected',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidate rejected',
            'data'    => $this->formatScreening($submission->fresh(['user', 'position'])),
        ]);
    }

    /**
     * POST /hr/screening/{id}/notes
     * Simpan HR notes untuk kandidat
     */
    public function saveNotes(Request $request, string $id)
    {
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $submission = $this->findSubmission($id, $request->user()->id_company);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $submission->update(['hr_notes' => $request->notes]);

        return response()->json([
            'success' => true,
            'message' => 'Notes saved',
            'data'    => ['hr_notes' => $submission->fresh()->hr_notes],
        ]);
    }

    /**
     * GET /hr/screening/{id}/document/{type}
     * View dokumen kandidat
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

    // ── HELPERS ─────────────────────────────────────────────

    private function findSubmission(string $id, string $companyId): ?Submission
    {
        return Submission::where('id_submission', $id)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user', 'position', 'vacancy'])
            ->first();
    }

    /**
     * POST /hr/screening/{id}/ai-check
     * Gunakan Google Gemini untuk analisis kandidat (GRATIS!)
     */
    public function aiCheck(Request $request, string $id)
{
    $submission = $this->findSubmission($id, $request->user()->id_company);

    if (!$submission) {
        return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
    }

    $apiKey = env('GEMINI_API_KEY');
    if (!$apiKey) {
        return response()->json([
            'success' => false,
            'message' => 'AI service not configured. Set GEMINI_API_KEY in .env'
        ], 500);
    }

    try {
        $prompt = "You are an HR screening assistant. Analyze this candidate:\n\n" .
            "Name: {$submission->user?->name}\n" .
            "Email: {$submission->user?->email}\n" .
            "Position: {$submission->position?->name}\n" .
            "Program: {$submission->vacancy?->title}\n" .
            "Has CV: " . ($submission->cv_file ? 'Yes' : 'No') . "\n" .
            "Has Cover Letter: " . ($submission->cover_letter_file ? 'Yes' : 'No') . "\n" .
            "Has Portfolio: " . ($submission->portfolio_file ? 'Yes' : 'No') . "\n" .
            "Has Recommendation Letter: " . ($submission->institution_letter_file ? 'Yes' : 'No') . "\n" .
            "Motivation: {$submission->motivation_message}\n" .
            "HR Notes: " . ($submission->hr_notes ?? 'none') . "\n\n" .
            "Give a brief analysis (2-3 sentences) and recommend whether to proceed to interview. " .
            "Respond in JSON format: {\"summary\": \"...\", \"recommend\": true/false}";

        $client = new \GuzzleHttp\Client(['verify' => false]);
        $models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
        $text = null;

        foreach ($models as $model) {
            for ($i = 0; $i < 3; $i++) {
                try {
                    $response = $client->post(
                        "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent",
                        [
                            'query' => ['key' => $apiKey],
                            'json'  => [
                                'contents' => [
                                    ['parts' => [['text' => $prompt]]]
                                ]
                            ]
                        ]
                    );
                    $body = json_decode($response->getBody(), true);
                    $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    break 2; // sukses, keluar dari semua loop
                } catch (\GuzzleHttp\Exception\ClientException $e) {
                    if ($e->getResponse()->getStatusCode() === 429) {
                        sleep(2 * ($i + 1)); // tunggu lalu retry
                        continue;
                    }
                    break; // error lain, coba model berikutnya
                }
            }
        }

        if (!$text) {
            throw new \Exception('Semua model AI gagal, coba lagi nanti.');
        }

        // Extract JSON dari response
        preg_match('/\{.*\}/s', $text, $matches);
        $parsed = $matches ? json_decode($matches[0], true) : [
            'summary'   => $text,
            'recommend' => str_contains(strtolower($text), 'recommended') || str_contains(strtolower($text), 'yes')
        ];

        return response()->json([
            'success' => true,
            'result'  => $parsed
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'AI analysis failed: ' . $e->getMessage()
        ], 500);
    }
}

    private function formatScreening(Submission $s): array
    {
        return [
            'id_submission'          => $s->id_submission,
            'name'                   => $s->user?->name,
            'email'                  => $s->user?->email,
            'position'               => $s->position?->name,
            'status'                 => $s->status,
            'screening_status'       => $s->screening_status ?? 'pending',
            'hr_notes'               => $s->hr_notes,
            'has_cv'                 => !empty($s->cv_file),
            'has_cover_letter'       => !empty($s->cover_letter_file),
            'has_portfolio'          => !empty($s->portfolio_file),
            'has_institution_letter' => !empty($s->institution_letter_file),
        ];
    }
}