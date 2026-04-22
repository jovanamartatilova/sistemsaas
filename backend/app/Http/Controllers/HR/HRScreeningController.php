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

        // Search - mencari di user, position, dan vacancy
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', fn($sq) =>
                    $sq->where('name', 'like', "%$search%")
                      ->orWhere('email', 'like', "%$search%")
                  )
                  ->orWhereHas('position', fn($sq) =>
                    $sq->where('name', 'like', "%$search%")
                      ->orWhere('description', 'like', "%$search%")
                  )
                  ->orWhereHas('vacancy', fn($sq) =>
                    $sq->where('title', 'like', "%$search%")
                      ->orWhere('description', 'like', "%$search%")
                      ->orWhere('requirements', 'like', "%$search%")
                  )
                  ->orWhere('hr_notes', 'like', "%$search%");
            });
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

public function aiCheck(Request $request, string $id)
{
    $submission = $this->findSubmission($id, $request->user()->id_company);

    if (!$submission) {
        return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
    }

    if (!env('GROQ_API_KEY')) {
    return response()->json([
        'success' => false,
        'message' => 'AI service not configured. Set GROQ_API_KEY in .env'
    ], 500);
}

    // ── Ekstrak teks CV ──────────────────────────────────────────
    $cvText = 'CV tidak tersedia.';
    if (!empty($submission->cv_file)) {
        $cvPath = storage_path('app/public/' . $submission->cv_file);
        if (file_exists($cvPath)) {
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf    = $parser->parseFile($cvPath);
                $raw    = $pdf->getText();
                // Bersihkan whitespace berlebih, batas 3000 karakter biar prompt tidak meledak
                $cvText = mb_substr(preg_replace('/\s+/', ' ', trim($raw)), 0, 3000);
            } catch (\Exception $e) {
                $cvText = 'Gagal membaca CV: ' . $e->getMessage();
            }
        }
    }

    // ── Susun prompt ─────────────────────────────────────────────
    $prompt = <<<PROMPT
You are an experienced HR screening assistant. Analyze the candidate below and give an honest, concise evaluation.

--- CANDIDATE INFO ---
Name     : {$submission->user?->name}
Position : {$submission->position?->name}
Program  : {$submission->vacancy?->title}
Documents: CV={$this->yesNo($submission->cv_file)}, Cover Letter={$this->yesNo($submission->cover_letter_file)}, Portfolio={$this->yesNo($submission->portfolio_file)}, Recommendation={$this->yesNo($submission->institution_letter_file)}
LinkedIn : {$submission->linkedin_url}
Motivation: {$submission->motivation_message}
HR Notes : {$submission->hr_notes}

--- CV CONTENT ---
{$cvText}

--- TASK ---
1. Summarize the candidate's suitability in 2-3 sentences.
2. List 2 key strengths and 1 concern (one line each).
3. Decide: recommend to interview? (true/false)

Respond ONLY in valid JSON (no markdown fences):
{"summary":"...","strengths":["...","..."],"concern":"...","recommend":true}
PROMPT;

    // ── Panggil OpenRouter ───────────────────────────────────────
try {
    $client = new \GuzzleHttp\Client(['verify' => false, 'timeout' => 30]);

    $response = $client->post('https://api.groq.com/openai/v1/chat/completions', [
    'headers' => [
        'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
        'Content-Type'  => 'application/json',
    ],
    'json' => [
        'model'    => 'llama-3.3-70b-versatile',
        'messages' => [
            ['role' => 'user', 'content' => $prompt],
        ],
        'temperature' => 0.3,
        'max_tokens'  => 512,
    ],
]);

    $body = json_decode($response->getBody(), true);
    $text = $body['choices'][0]['message']['content'] ?? null;

    if (!$text) {
        throw new \Exception('Model not responding.');
    }

    // ── Parse JSON ───────────────────────────────────────────
    preg_match('/\{.*\}/s', $text, $matches);
    $parsed = $matches ? json_decode($matches[0], true) : null;

    if (empty($parsed)) {
        $parsed = [
            'summary'   => $text,
            'strengths' => [],
            'concern'   => '',
            'recommend' => str_contains(strtolower($text), '"recommend":true'),
        ];
    }

    return response()->json(['success' => true, 'result' => $parsed]);

} catch (\Exception $e) {
    return response()->json([
        'success' => false,
        'message' => 'AI analysis failed: ' . $e->getMessage()
    ], 500);
}}

private function yesNo($value): string
{
    return !empty($value) ? 'Yes' : 'No';
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

/**
 * POST /hr/screening/ai-rank
 * Rank semua kandidat sekaligus pakai AI
 */
public function aiRank(Request $request)
{
    $companyId = $request->user()->id_company;

    $submissions = Submission::whereHas('vacancy', fn($q) =>
        $q->where('id_company', $companyId)
    )->whereIn('status', ['pending', 'screening'])
     ->with(['user', 'position'])
     ->get();

    if ($submissions->isEmpty()) {
        return response()->json(['success' => true, 'rankings' => []]);
    }

    if (!env('GROQ_API_KEY')) {
        return response()->json(['success' => false, 'message' => 'AI not configured'], 500);
    }

    $candidateList = $submissions->map(fn($s) => [
        'id'                   => $s->id_submission,
        'name'                 => $s->user?->name,
        'position'             => $s->position?->name,
        'has_cv'               => !empty($s->cv_file),
        'has_cover_letter'     => !empty($s->cover_letter_file),
        'has_portfolio'        => !empty($s->portfolio_file),
        'has_recommendation'   => !empty($s->institution_letter_file),
        'motivation'           => $s->motivation_message,
        'hr_notes'             => $s->hr_notes,
    ]);

    $json = json_encode($candidateList, JSON_PRETTY_PRINT);

    $prompt = <<<PROMPT
You are a senior HR screening assistant. Evaluate and score each candidate from 0-100 based on their profile.

Candidates (JSON):
{$json}

Scoring guide:
- Has CV: +30 pts
- Has Cover Letter: +20 pts
- Has Portfolio: +20 pts
- Has Recommendation Letter: +15 pts
- Has motivation message (non-empty): +10 pts
- Quality/length of motivation: up to +5 pts

Return ONLY a valid JSON array sorted by score descending (no markdown, no explanation):
[{"id":"SUB123","score":95},{"id":"SUB456","score":72}]
PROMPT;

    try {
        $client   = new \GuzzleHttp\Client(['verify' => false, 'timeout' => 30]);
        $response = $client->post('https://api.groq.com/openai/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                'Content-Type'  => 'application/json',
                'HTTP-Referer'  => env('APP_URL', 'http://localhost'),
                'X-Title'       => 'EarlyPath HR System',
            ],
            'json' => [
                'model'       => 'llama-3.3-70b-versatile',
                'messages'    => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.1,
                'max_tokens'  => 1024,
            ],
        ]);

        $body = json_decode($response->getBody(), true);
        $text = $body['choices'][0]['message']['content'] ?? '';

        preg_match('/\[.*\]/s', $text, $matches);
        $rankings = $matches ? json_decode($matches[0], true) : [];

        if (empty($rankings)) {
            throw new \Exception('AI returned empty rankings');
        }

        usort($rankings, fn($a, $b) => $b['score'] - $a['score']);

        return response()->json(['success' => true, 'rankings' => $rankings]);

    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}
}