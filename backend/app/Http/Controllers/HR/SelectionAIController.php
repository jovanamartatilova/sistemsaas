<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * SelectionAIController
 *
 * Fitur AI untuk halaman Selection Management.
 *
 * Referensi:
 *   Manning, C. D., Raghavan, P., and Schuetze, H. (2008).
 *   Introduction to Information Retrieval. Cambridge University Press.
 *
 * Materi TKI yang diimplementasikan:
 *   - Materi 5  : TF-IDF + Vector Space Model  → rankStage()
 *   - Materi 8  : Text Classification           → suggestDecision()
 *   - Materi 9  : Automatic Text Summarization  → summarize() via TF-ISF
 *
 * Topik dari kontrak kuliah:
 *   "IMPLEMENTASI TF-ISF (TERM FREQUENCY INVERSE SENTENCE FREQUENCY) DAN
 *    TITLE OVERLAP UNTUK MENCARI KALIMAT-KALIMAT PENTING PADA SISTEM
 *    PERINGKAS DOKUMEN"
 */
class SelectionAIController extends Controller
{
    // ─── Stopwords ─────────────────────────────────────────────────────────────
    private const STOPWORDS = [
        'yang','dan','di','ke','dari','untuk','dengan','adalah','ini','itu',
        'dalam','pada','tidak','juga','lebih','seperti','sebagai','ada','saya',
        'kami','kita','mereka','akan','sudah','bisa','dapat','setelah','bahwa',
        'karena','jika','atau','tetapi','namun','maka','sehingga','hingga',
        'selama','sebelum','antara','oleh','tentang','secara','sangat','telah',
        'the','a','an','and','or','but','in','on','at','to','for','of','with',
        'as','is','was','are','were','be','been','have','has','had','do','does',
        'i','you','he','she','we','they','my','your','his','her','our','their',
        'it','its','this','that','these','those','by','so','if','no','yes',
    ];

    // ══════════════════════════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * GET /hr/selection/summarize/{id}
     *
     * Buat ringkasan singkat profil kandidat menggunakan extractive
     * summarization berbasis TF-ISF (Term Frequency–Inverse Sentence Frequency).
     *
     * TF-ISF mirip TF-IDF tapi unit dokumen = kalimat, bukan seluruh dokumen.
     * Kalimat dengan skor tertinggi = kalimat paling penting.
     *
     * Materi 9 TKI — Automatic Text Summarization
     */
    public function summarize(Request $request, string $id)
    {
        $companyId  = $request->user()->id_company;
        $submission = $this->findSubmission($id, $companyId);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        // Kumpulkan semua teks yang tersedia
        $sourceText = $this->buildSourceText($submission);

        if (strlen(trim($sourceText)) < 30) {
            return response()->json([
                'success' => true,
                'summary' => 'No profile information available to summarize yet.',
                'method'  => 'tf-isf',
                'sentence_count' => 0,
            ]);
        }

        // Jalankan TF-ISF summarization
        $summary = $this->tfisfSummarize($sourceText, summarySize: 3);

        // Metadata tambahan untuk transparansi ke HR
        $docCount = DOC_TYPES_COUNT($submission);

        return response()->json([
            'success'        => true,
            'summary'        => $summary['text'],
            'key_terms'      => $summary['key_terms'],
            'sentence_scores'=> $summary['scored_sentences'],
            'method'         => 'tf-isf',
            'source_length'  => str_word_count($sourceText),
            'summary_length' => str_word_count($summary['text']),
            'compression'    => $summary['compression_ratio'],
        ]);
    }

    /**
     * POST /hr/selection/rank-stage
     *
     * Urutkan kandidat di satu stage berdasarkan relevansi profil mereka
     * terhadap deskripsi posisi menggunakan TF-IDF + cosine similarity.
     *
     * Body: { id_position, stage, id_submissions[] }
     *
     * Materi 5 TKI — TF-IDF & Vector Space Model
     */
    public function rankStage(Request $request)
    {
        $companyId     = $request->user()->id_company;
        $idPosition    = $request->input('id_position');
        $stage         = $request->input('stage');        // e.g. "stage_0", "pending"
        $idSubmissions = $request->input('id_submissions', []);

        if (empty($idSubmissions)) {
            return response()->json(['success' => false, 'message' => 'No candidates provided'], 400);
        }

        // Ambil posisi beserta kompetensi yang dibutuhkan
        $position    = Position::with('competencies')->find($idPosition);
        $competencies = $position?->competencies ?? collect();

        // Susun deskripsi kompetensi posisi untuk konteks LLM
        $competencyContext = "";
        if ($competencies->isNotEmpty()) {
            $competencyContext = "\n--- REQUIRED COMPETENCIES FOR THIS POSITION ---\n";
            foreach ($competencies as $comp) {
                $competencyContext .= "- {$comp->name}";
                if (!empty($comp->description)) {
                    $competencyContext .= ": {$comp->description}";
                }
                if (!empty($comp->learning_hours)) {
                    $competencyContext .= " ({$comp->learning_hours} learning hours required)";
                }
                $competencyContext .= "\n";
            }
        }

        $positionText = $position ? ($position->name . ' ' . $competencies->pluck('name')->implode(' ')) : '';

        // Ambil submissions beserta CV dan info kandidat
        $submissions = Submission::with(['user.candidate', 'position', 'vacancy'])
            ->whereIn('id_submission', $idSubmissions)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No candidates found'], 404);
        }

        // Cek API Key Groq untuk implementasi Smart Rank cerdas via LLM
        $apiKey = env('GROQ_API_KEY') ?: config('services.groq.api_key');
        if ($apiKey) {
            try {
                // Build candidates context
                $candidatesContext = "";
                foreach ($submissions as $index => $s) {
                    $candIdx = $index + 1;
                    $cvText = $this->extractCvTextLocal($s);
                    $testScore = $s->test_details['test_score'] ?? null;
                    $candidate = $s->user?->candidate;

                    $candidatesContext .= "Candidate #{$candIdx}:\n";
                    $candidatesContext .= "- Submission ID: {$s->id_submission}\n";
                    $candidatesContext .= "- Name: " . ($s->user?->name ?? 'Unknown') . "\n";
                    $candidatesContext .= "- University/Institution: " . ($candidate?->institution ?? $s->user?->university ?? '-') . "\n";
                    $candidatesContext .= "- Major/Field: " . ($candidate?->major ?? '-') . "\n";
                    $candidatesContext .= "- Education Level: " . ($candidate?->education_level ?? '-') . "\n";
                    $candidatesContext .= "- About/Profile: " . ($candidate?->about ?? '-') . "\n";
                    $candidatesContext .= "- Motivation Message: " . ($s->motivation_message ?? '-') . "\n";
                    $candidatesContext .= "- HR Notes: " . ($s->hr_notes ?? '-') . "\n";
                    $candidatesContext .= "- Test Score: " . ($testScore ?? 'Not yet taken') . "\n";
                    $candidatesContext .= "- Has CV File: " . (!empty($s->cv_file) ? 'Yes' : 'No') . "\n";
                    $candidatesContext .= "- Has Portfolio File: " . (!empty($s->portfolio_file) ? 'Yes' : 'No') . "\n";
                    $candidatesContext .= "- Has Supporting Document: " . (!empty($s->supporting_document_file) ? 'Yes' : 'No') . "\n";
                    if (!empty($cvText)) {
                        $candidatesContext .= "- CV Text Excerpt: " . mb_substr($cvText, 0, 3000) . "\n";
                    }
                    $candidatesContext .= "--------------------------------------------------\n\n";
                }

                $prompt = <<<PROMPT
You are a professional HR assistant for EarlyPath, an Internship SaaS platform.
Your task is to evaluate and rank a list of candidates applying for a position, based strictly on how well each candidate matches the REQUIRED COMPETENCIES listed below.

--- POSITION INFO ---
Position Name: {$position->name}
{$competencyContext}
--- SELECTION STAGE ---
Current Stage: {$stage}

--- CANDIDATES DATA ---
{$candidatesContext}

--- TASK ---
Your primary evaluation criterion is the REQUIRED COMPETENCIES listed above for the position "{$position->name}".
For each candidate, evaluate:
1. How many and how well their skills/experience/CV match the required competencies (this is the MOST IMPORTANT factor).
2. Quality and relevance of their motivation message to the position.
3. HR notes and any concerns raised.
4. Document completeness (CV, portfolio, supporting docs).
5. Test score if available.

IMPORTANT: Do NOT rank candidates based on general popularity or breadth of experience. Focus ONLY on competency match. A candidate with deep relevant skills beats a broadly experienced one if they better match the required competencies.

Provide a ranked list from most suitable (Rank 1) to least suitable.

For each candidate you must determine:
1. A suitability score (0–100) based primarily on competency match.
2. A suggestion: "Pass", "Review", or "Reject".
3. A detailed reason in Bahasa Indonesia referencing SPECIFIC competencies matched or missing from their CV/profile.

--- OUTPUT FORMAT ---
JSON object with "rankings" key containing an array. Each object must have:
- "id_submission": (string) exact Submission ID
- "rank": (integer) rank starting from 1
- "score": (number) suitability score 0–100
- "suggestion": (string) exactly "Pass", "Review", or "Reject"
- "suggestion_reason": (string) reason in Bahasa Indonesia

Do NOT include any markdown or text outside the JSON.
PROMPT;

                // Try multiple models in order (fallback if rate-limited)
                // Note: smaller models have lower context limits, so we trim the prompt
                $modelsToTry = [
                    ['name' => 'llama-3.3-70b-versatile',  'max_tokens' => 2048, 'trim' => false],
                    ['name' => 'llama3-70b-8192',           'max_tokens' => 2048, 'trim' => false],
                    ['name' => 'llama-3.1-8b-instant',      'max_tokens' => 1024, 'trim' => true],
                ];

                $client = new \GuzzleHttp\Client(['verify' => false, 'timeout' => 60]);
                $body = null;
                $lastError = null;
                $usedModel = null;

                foreach ($modelsToTry as $modelConfig) {
                    $modelName  = $modelConfig['name'];
                    $maxTok     = $modelConfig['max_tokens'];
                    $trimPrompt = $modelConfig['trim'];

                    // Trim candidates context for smaller models to avoid 413
                    $activePrompt = $prompt;
                    if ($trimPrompt) {
                        // Limit candidate CV text to avoid huge payloads
                        $activePrompt = mb_substr($prompt, 0, 8000);
                    }

                    try {
                        $response = $client->post('https://api.groq.com/openai/v1/chat/completions', [
                            'headers' => [
                                'Authorization' => 'Bearer ' . $apiKey,
                                'Content-Type'  => 'application/json',
                            ],
                            'json' => [
                                'model'    => $modelName,
                                'messages' => [
                                    ['role' => 'system', 'content' => 'You are an objective HR Screening assistant. Speak Bahasa Indonesia. You must respond in a valid JSON format containing a single key "rankings" which contains an array of objects with keys "id_submission", "rank", "score", "suggestion", and "suggestion_reason".'],
                                    ['role' => 'user', 'content' => $activePrompt],
                                ],
                                'response_format' => ['type' => 'json_object'],
                                'temperature' => 0.0,
                                'max_tokens'  => $maxTok,
                            ],
                        ]);
                        $body = json_decode($response->getBody(), true);
                        $usedModel = $modelName;
                        Log::info("Smart Rank using model: {$modelName}");
                        break; // success, stop trying
                    } catch (\Exception $modelErr) {
                        $lastError = $modelErr;
                        Log::warning("Model {$modelName} failed: " . $modelErr->getMessage() . ". Trying next model.");
                        if (str_contains($modelErr->getMessage(), 'Rate limit') || str_contains($modelErr->getMessage(), '429')) {
                            sleep(1);
                        }
                    }
                }

                if (!$body) {
                    throw $lastError ?? new \Exception('All models failed');
                }

                $rawContent = $body['choices'][0]['message']['content'] ?? '';
                Log::info('Smart Rank Llama response raw: ' . $rawContent);
                $decoded = json_decode($rawContent, true);

                if (json_last_error() === JSON_ERROR_NONE && isset($decoded['rankings']) && is_array($decoded['rankings'])) {
                    $results = [];
                    foreach ($decoded['rankings'] as $item) {
                        $subId = $item['id_submission'];
                        
                        $submission = $submissions->firstWhere('id_submission', $subId);
                        if (!$submission) {
                            continue;
                        }
                        
                        $sugg = $item['suggestion'] ?? 'Review';
                        if (stripos($sugg, 'pass') !== false) {
                            $sugg = 'Pass';
                        } elseif (stripos($sugg, 'reject') !== false) {
                            $sugg = 'Reject';
                        } else {
                            $sugg = 'Review';
                        }

                        $color = [
                            'bg' => '#fefce8', 
                            'text' => '#a16207', 
                            'border' => '#fde68a'
                        ];
                        if ($sugg === 'Pass') {
                            $color = ['bg' => '#f0fdf4', 'text' => '#15803d', 'border' => '#86efac'];
                        } elseif ($sugg === 'Reject') {
                            $color = ['bg' => '#fff1f2', 'text' => '#be123c', 'border' => '#fecdd3'];
                        }

                        $results[] = [
                            'id_submission'      => $subId,
                            'rank'               => (int) ($item['rank'] ?? 1),
                            'smart_rank_score'   => (float) ($item['score'] ?? 0.0),
                            'smart_rank_percent' => (float) ($item['score'] ?? 0.0),
                            'suggestion'         => $sugg,
                            'suggestion_reason'  => $item['suggestion_reason'] ?? '',
                            'suggestion_color'   => $color,
                        ];
                    }

                    if (!empty($results)) {
                        usort($results, fn($a, $b) => $a['rank'] <=> $b['rank']);

                        return response()->json([
                            'success'  => true,
                            'stage'    => $stage,
                            'rankings' => $results,
                            'method'   => 'llama-3.3',
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Smart Rank LLM failed, falling back to TF-IDF: ' . $e->getMessage());
            }
        }

        // Fallback: TF-IDF VSM (original logic)
        $corpus = [];
        foreach ($submissions as $s) {
            $corpus[$s->id_submission] = $this->buildDocumentText($s);
        }

        $rankings = $this->rankByTfidf($positionText, $corpus);

        $results = [];
        foreach ($rankings as $rank => $item) {
            $submission = $submissions->firstWhere('id_submission', $item['id']);
            $classification = $this->classifyForStage($submission, $stage);
            $candidate = $submission?->user?->candidate;

            // Build a more informative fallback reason using actual profile data
            $fallbackReason = '';
            $parts = [];
            if (!empty($submission?->motivation_message)) {
                $motivWords = str_word_count($submission->motivation_message);
                $parts[] = "Motivasi: " . mb_substr($submission->motivation_message, 0, 120) . ($motivWords > 20 ? '...' : '');
            }
            if (!empty($submission?->hr_notes)) {
                $parts[] = "Catatan HR: " . mb_substr($submission->hr_notes, 0, 100);
            }
            if (!empty($candidate?->about)) {
                $parts[] = "Profil: " . mb_substr($candidate->about, 0, 120);
            }
            if (!empty($candidate?->major)) {
                $parts[] = "Jurusan: " . $candidate->major;
            }
            if (empty($parts)) {
                $parts[] = $classification['reason'];
            }
            $fallbackReason = implode('. ', $parts);

            $results[] = [
                'id_submission'      => $item['id'],
                'rank'               => $rank + 1,
                'smart_rank_score'   => $item['percent'],  // use percent so it shows as 0-100
                'smart_rank_percent' => $item['percent'],
                'suggestion'         => $classification['suggestion'],
                'suggestion_reason'  => '[Analisis berbasis TF-IDF] ' . $fallbackReason,
                'suggestion_color'   => $classification['color'],
            ];
        }

        return response()->json([
            'success'  => true,
            'stage'    => $stage,
            'rankings' => $results,
            'method'   => 'tfidf-vsm',
        ]);
    }

    /**
     * GET /hr/selection/suggest/{id}?stage=stage_0
     *
     * Berikan saran tindakan (Pass / Hold / Reject) untuk satu kandidat
     * berdasarkan stage saat ini.
     *
     * Materi 8 TKI — Text Classification
     */
    public function suggestDecision(Request $request, string $id)
    {
        $companyId  = $request->user()->id_company;
        $stage      = $request->query('stage', 'pending');
        $submission = $this->findSubmission($id, $companyId);

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Candidate not found'], 404);
        }

        $result = $this->classifyForStage($submission, $stage);

        return response()->json([
            'success' => true,
            'data'    => $result,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TF-ISF SUMMARIZATION (Materi 9)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Extractive summarization menggunakan TF-ISF
     *
     * Algoritma:
     *   1. Split teks menjadi kalimat (sentence segmentation)
     *   2. Tokenisasi tiap kalimat
     *   3. Hitung TF per kalimat (term frequency dalam kalimat itu)
     *   4. Hitung ISF: log(S / sf(t))  — S = total kalimat, sf = kalimat yg mengandung term
     *   5. Skor tiap kalimat = rata-rata TF-ISF semua term di dalamnya
     *   6. Pilih top-N kalimat berdasarkan skor, urutkan by posisi asli
     *
     * Berbeda dari TF-IDF: unit "dokumen" = kalimat (bukan seluruh file).
     * Ini persis metode dari topik kontrak kuliah TKI.
     */
    private function tfisfSummarize(string $text, int $summarySize = 3): array
    {
        // Step 1: Sentence segmentation
        $sentences = $this->splitSentences($text);
        $S = count($sentences);

        if ($S === 0) return ['text' => $text, 'key_terms' => [], 'scored_sentences' => [], 'compression_ratio' => 1.0];
        if ($S <= $summarySize) return ['text' => $text, 'key_terms' => [], 'scored_sentences' => [], 'compression_ratio' => 1.0];

        // Step 2 & 3: Tokenisasi + hitung TF per kalimat
        $tokenizedSentences = array_map(fn($s) => $this->tokenize($s), $sentences);

        // Step 4: Hitung SF (sentence frequency) per term — berapa kalimat mengandung term ini
        $sf = [];
        foreach ($tokenizedSentences as $tokens) {
            $uniqueTokens = array_unique($tokens);
            foreach ($uniqueTokens as $token) {
                $sf[$token] = ($sf[$token] ?? 0) + 1;
            }
        }

        // Step 5: Skor tiap kalimat
        $sentenceScores = [];
        foreach ($tokenizedSentences as $i => $tokens) {
            if (empty($tokens)) { $sentenceScores[$i] = 0; continue; }

            $score = 0.0;
            $termCount = count($tokens);
            $tfInSentence = array_count_values($tokens);

            foreach ($tfInSentence as $term => $freq) {
                $tf  = $freq / $termCount;
                $isf = log(($S + 1) / (($sf[$term] ?? 1) + 1)) + 1; // smooth ISF
                $score += $tf * $isf;
            }

            // Normalkan by panjang kalimat (hindari bias kalimat panjang)
            $sentenceScores[$i] = $score / $termCount;
        }

        // Step 6: Pilih top-N, urutkan by posisi asli
        arsort($sentenceScores);
        $topIndices = array_slice(array_keys($sentenceScores), 0, $summarySize);
        sort($topIndices);

        $summaryText = implode(' ', array_map(fn($i) => trim($sentences[$i]), $topIndices));

        // Key terms: top 5 term by TF-ISF global score
        $globalTermScore = [];
        foreach ($sf as $term => $sentFreq) {
            $isf = log(($S + 1) / ($sentFreq + 1)) + 1;
            $globalTermScore[$term] = $isf;
        }
        arsort($globalTermScore);
        $keyTerms = array_keys(array_slice($globalTermScore, 0, 5, true));

        // Scored sentences for debugging/transparency
        $scoredSentences = [];
        foreach (array_slice($sentenceScores, 0, 5, true) as $idx => $score) {
            $scoredSentences[] = [
                'sentence' => mb_substr(trim($sentences[$idx] ?? ''), 0, 80) . '...',
                'score'    => round($score, 4),
            ];
        }

        $sourceWordCount  = str_word_count($text);
        $summaryWordCount = str_word_count($summaryText);
        $compression      = $sourceWordCount > 0 ? round($summaryWordCount / $sourceWordCount, 2) : 1.0;

        return [
            'text'              => $summaryText,
            'key_terms'         => $keyTerms,
            'scored_sentences'  => $scoredSentences,
            'compression_ratio' => $compression,
        ];
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TF-IDF RANKING (Materi 5)
    // ══════════════════════════════════════════════════════════════════════════

    private function rankByTfidf(string $queryText, array $corpus): array
    {
        $N = count($corpus);
        if ($N === 0) return [];

        $queryTokens   = $this->tokenize($queryText);
        $tokenizedDocs = [];
        foreach ($corpus as $id => $text) {
            $tokenizedDocs[$id] = $this->tokenize($text);
        }

        // Bangun inverted index
        $index = [];
        foreach ($tokenizedDocs as $id => $tokens) {
            foreach (array_count_values($tokens) as $term => $freq) {
                $index[$term][$id] = $freq;
            }
        }

        $scores = [];
        foreach ($tokenizedDocs as $id => $docTokens) {
            $docLen = count($docTokens);
            if ($docLen === 0) { $scores[$id] = 0.0; continue; }

            $dot = 0.0; $qNorm = 0.0; $dNorm = 0.0;

            foreach ($queryTokens as $term) {
                $tfQ = substr_count(implode(' ', $queryTokens), $term) / max(1, count($queryTokens));
                $df  = isset($index[$term]) ? count($index[$term]) : 0;
                $idf = log(($N + 1) / ($df + 1)) + 1;
                $wtQ = $tfQ * $idf;
                $tfD = ($index[$term][$id] ?? 0) / $docLen;
                $wtD = $tfD * $idf;
                $dot += $wtQ * $wtD;
                $qNorm += $wtQ ** 2;
                $dNorm += $wtD ** 2;
            }

            $norm = sqrt($qNorm) * sqrt($dNorm);
            $scores[$id] = $norm > 0 ? $dot / $norm : 0.0;
        }

        arsort($scores);

        // Normalize ke 0-100%
        $maxScore = max(array_values($scores)) ?: 1;
        $results  = [];
        foreach ($scores as $id => $score) {
            $results[] = [
                'id'      => $id,
                'score'   => round($score, 4),
                'percent' => round(($score / $maxScore) * 100, 1),
            ];
        }

        return $results;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TEXT CLASSIFICATION / DECISION SUGGESTION (Materi 8)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Klasifikasi kandidat untuk stage tertentu dan hasilkan saran tindakan.
     *
     * Stage-aware: kriteria berbeda per jenis stage.
     *   - screening : fokus kelengkapan dokumen
     *   - test      : fokus skor tes
     *   - interview : fokus motivasi + notes
     *   - final     : evaluasi keseluruhan
     */
    private function classifyForStage(Submission $s, string $stage): array
    {
        $stageType = $this->resolveStageType($stage, $s);
        $score     = 0;
        $reasons   = [];

        // ── Dokumen ──────────────────────────────────────────────────────────
        $hasCV                = !empty($s->cv_file);
        $hasSupportingDocument = !empty($s->supporting_document_file);
        $hasPortfolio         = !empty($s->portfolio_file);

        if ($stageType === 'screening') {
            // Screening: dokumen adalah segalanya
            if ($hasCV)          { $score += 30; $reasons[] = 'CV uploaded'; }
            if ($hasSupportingDocument) { $score += 30; $reasons[] = 'Supporting document present'; }
            if ($hasPortfolio)   { $score += 20; $reasons[] = 'Portfolio attached'; }

            $motiv = $s->motivation_message ?? '';
            if (str_word_count($motiv) >= 50)  { $score += 15; $reasons[] = 'Detailed motivation'; }
            elseif (str_word_count($motiv) >= 20) { $score += 8; $reasons[] = 'Has motivation message'; }

            if (!empty($s->linkedin_url)) { $score += 5; $reasons[] = 'LinkedIn profile linked'; }

        } elseif ($stageType === 'test') {
            // Test stage: skor tes adalah faktor utama
            $testScore = (int) ($s->test_score ?? 0);
            if ($testScore >= 80)     { $score += 50; $reasons[] = "Test score: {$testScore}/100"; }
            elseif ($testScore >= 60) { $score += 30; $reasons[] = "Test score: {$testScore}/100"; }
            elseif ($testScore > 0)   { $score += 15; $reasons[] = "Test score: {$testScore}/100"; }
            else                      { $reasons[] = 'No test score yet'; }

            // Dokumen sebagai faktor pendukung
            $docScore = ($hasCV ? 15 : 0) + ($hasPortfolio ? 20 : 0) + ($hasSupportingDocument ? 15 : 0);
            $score += $docScore;
            if ($docScore > 0) $reasons[] = 'Supporting documents available';

        } elseif ($stageType === 'interview') {
            // Interview: kualitas motivasi + portfolio + HR notes
            $motiv = $s->motivation_message ?? '';
            $motivWords = str_word_count($motiv);
            if ($motivWords >= 100) { $score += 30; $reasons[] = 'Strong motivation statement'; }
            elseif ($motivWords >= 50) { $score += 18; $reasons[] = 'Good motivation statement'; }
            elseif ($motivWords >= 20) { $score += 8; }

            if ($hasPortfolio)  { $score += 25; $reasons[] = 'Portfolio available for review'; }
            if ($hasCV)         { $score += 15; $reasons[] = 'CV on file'; }

            // HR notes positif
            $notes = strtolower($s->hr_notes ?? '');
            $positiveWords = ['good','great','strong','excellent','promising','interested','recommend'];
            $negativeWords = ['weak','poor','concern','doubt','unsure','missing'];
            $posHits = count(array_filter($positiveWords, fn($w) => str_contains($notes, $w)));
            $negHits = count(array_filter($negativeWords, fn($w) => str_contains($notes, $w)));
            if ($posHits > 0) { $score += min(20, $posHits * 7); $reasons[] = 'Positive HR notes'; }
            if ($negHits > 0) { $score -= min(15, $negHits * 5); $reasons[] = 'Some concerns in notes'; }

        } else {
            // Final / general: evaluasi menyeluruh
            $score += ($hasCV ? 20 : 0) + ($hasSupportingDocument ? 15 : 0) + ($hasPortfolio ? 15 : 0);
            $motiv = $s->motivation_message ?? '';
            if (str_word_count($motiv) >= 50) { $score += 20; $reasons[] = 'Good motivation'; }
            if (!empty($s->linkedin_url))     { $score += 10; $reasons[] = 'LinkedIn linked'; }
            $testScore = (int) ($s->test_score ?? 0);
            if ($testScore > 0) { $score += min(20, $testScore / 5); $reasons[] = "Test score: {$testScore}"; }
        }

        $score = max(0, min(100, $score));

        // Suggestion decision
        if ($score >= 60) {
            return [
                'suggestion'        => 'Pass',
                'suggestion_short'  => 'Pass',
                'reason'            => implode(', ', $reasons) ?: 'Profile looks strong for this stage',
                'score'             => $score,
                'color'             => ['bg' => '#f0fdf4', 'text' => '#15803d', 'border' => '#86efac'],
            ];
        } elseif ($score >= 35) {
            return [
                'suggestion'        => 'Review',
                'suggestion_short'  => 'Review',
                'reason'            => implode(', ', $reasons) ?: 'Profile is borderline — needs manual review',
                'score'             => $score,
                'color'             => ['bg' => '#fefce8', 'text' => '#a16207', 'border' => '#fde68a'],
            ];
        } else {
            return [
                'suggestion'        => 'Reject',
                'suggestion_short'  => 'Reject',
                'reason'            => 'Profile does not meet minimum criteria for this stage',
                'score'             => $score,
                'color'             => ['bg' => '#fff1f2', 'text' => '#be123c', 'border' => '#fecdd3'],
            ];
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TEXT PREPROCESSING HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private function tokenize(string $text): array
    {
        $text   = mb_strtolower($text);
        $text   = preg_replace('/[^a-z0-9\s]/', ' ', $text);
        $tokens = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        return array_values(array_filter($tokens, fn($t) => strlen($t) >= 2 && !in_array($t, self::STOPWORDS)));
    }

    /**
     * Sentence segmentation — pisahkan teks menjadi array kalimat
     * Tangani titik, tanda seru, tanda tanya
     */
    private function splitSentences(string $text): array
    {
        // Normalisasi newline
        $text = preg_replace('/[\r\n]+/', '. ', $text);

        // Split by sentence-ending punctuation
        $sentences = preg_split('/(?<=[.!?])\s+(?=[A-Z0-9a-z])/u', $text);
        $sentences = array_filter($sentences, fn($s) => strlen(trim($s)) > 10);

        return array_values($sentences);
    }

    private function buildSourceText(Submission $s): string
    {
        $parts = array_filter([
            $s->motivation_message ?? '',
            $s->hr_notes ?? '',
            ($s->user?->name ? 'Candidate: ' . $s->user->name : ''),
            ($s->position?->name ? 'Applying for: ' . $s->position->name : ''),
            ($s->user?->university ? 'From: ' . $s->user->university : ''),
        ]);
        return implode('. ', $parts);
    }

    private function buildDocumentText(Submission $s): string
    {
        return implode(' ', array_filter([
            str_repeat(($s->user?->name ?? '') . ' ', 3),
            str_repeat(($s->position?->name ?? '') . ' ', 3),
            $s->motivation_message ?? '',
            $s->hr_notes ?? '',
            $s->user?->university ?? '',
        ]));
    }

    private function resolveStageType(string $stage, Submission $s): string
    {
        if (str_contains($stage, 'screen') || $stage === 'pending') return 'screening';
        if (str_contains($stage, 'test'))      return 'test';
        if (str_contains($stage, 'interview')) return 'interview';
        if (str_contains($stage, 'final') || in_array($stage, ['accepted', 'rejected'])) return 'final';
        // stage_0, stage_1, etc — cek dari tipe flow posisi kalau ada
        return 'screening'; // default
    }

    private function extractCvTextLocal(Submission $s): string
    {
        if (empty($s->cv_file)) return '';
        $path = storage_path('app/public/' . $s->cv_file);
        if (!file_exists($path)) return '';

        try {
            $parser = new \Smalot\PdfParser\Parser();
            $raw    = $parser->parseFile($path)->getText();
            return mb_substr(preg_replace('/\s+/', ' ', trim($raw)), 0, 4000);
        } catch (\Exception $e) {
            try {
                $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                if ($ext === 'pdf') {
                    $raw = shell_exec('pdftotext ' . escapeshellarg($path) . ' -');
                    if ($raw) return mb_substr(preg_replace('/\s+/', ' ', trim($raw)), 0, 4000);
                }
            } catch (\Exception $ex) {
                // ignore
            }
            return '';
        }
    }

    private function findSubmission(string $id, string $companyId): ?Submission
    {
        return Submission::where('id_submission', $id)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user', 'position', 'vacancy'])
            ->first();
    }
}

// ─── Helper closure (di luar class) ──────────────────────────────────────────
if (!function_exists('DOC_TYPES_COUNT')) {
    function DOC_TYPES_COUNT($s): int {
        return (int) (!empty($s->cv_file))
             + (int) (!empty($s->supporting_document_file))
             + (int) (!empty($s->portfolio_file));
    }
}