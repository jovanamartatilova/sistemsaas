<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * TFIDFSearchController
 *
 * Implementasi Information Retrieval berbasis TF-IDF (Term Frequency–Inverse Document Frequency)
 * dan Vector Space Model untuk pencarian kandidat.
 *
 * Referensi:
 *   Manning, C. D., Raghavan, P., and Schuetze, H. (2008).
 *   Introduction to Information Retrieval. Cambridge University Press.
 *
 * Materi TKI yang diimplementasikan:
 *   - Materi 2  : Boolean Retrieval (filter AND/OR/NOT)
 *   - Materi 3  : Term Vocabulary & Posting Lists (buildIndex)
 *   - Materi 5  : TF-IDF Weighting & Vector Space Model (tfidf, cosineSim)
 *   - Materi 7  : Retrieval Evaluation (relevance score, precision@k)
 *   - Materi 8  : Text Classification (classifyCandidate)
 */
class TFIDFSearchController extends Controller
{
    // ─── Stopword List (Bahasa Indonesia + English) ────────────────────────────

    private const STOPWORDS = [
        // Indonesia
        'yang','dan','di','ke','dari','untuk','dengan','adalah','ini','itu',
        'dalam','pada','tidak','juga','lebih','seperti','sebagai','ada','saya',
        'kami','kita','mereka','akan','sudah','bisa','dapat','setelah','bahwa',
        'karena','jika','atau','tetapi','namun','maka','sehingga','hingga',
        'selama','sebelum','antara','oleh','tentang','secara','sangat','telah',
        // English
        'the','a','an','and','or','but','in','on','at','to','for','of','with',
        'as','is','was','are','were','be','been','have','has','had','do','does',
        'did','will','would','could','should','may','might','shall','i','you',
        'he','she','we','they','my','your','his','her','our','their',
    ];

    // ─── Public Endpoints ──────────────────────────────────────────────────────

    /**
     * GET /hr/candidates/tfidf-search
     * Pencarian kandidat menggunakan TF-IDF + Vector Space Model
     *
     * Query params:
     *   q        : search query (wajib, min 2 karakter)
     *   mode     : "tfidf" | "boolean" (default: tfidf)
     *   bool_op  : "AND" | "OR" (default: AND, hanya untuk mode boolean)
     *   top_k    : jumlah hasil teratas (default: 20)
     */
    public function search(Request $request)
    {
        $query     = trim($request->query('q', ''));
        $mode      = $request->query('mode', 'tfidf');
        $boolOp    = strtoupper($request->query('bool_op', 'AND'));
        $topK      = (int) $request->query('top_k', 20);
        $companyId = $request->user()->id_company;

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'error'   => 'Query terlalu pendek (minimal 2 karakter)',
                'results' => [],
            ]);
        }

        // Ambil semua submission aktif perusahaan ini
        $submissions = Submission::with(['user', 'position', 'vacancy'])
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json([
                'success'  => false,
                'error'    => 'Belum ada kandidat',
                'results'  => [],
            ]);
        }

        // Bangun korpus dokumen
        $corpus = $submissions->map(fn($s) => [
            'id'         => $s->id_submission,
            'submission' => $s,
            'text'       => $this->buildDocumentText($s),
        ])->values()->toArray();

        // ── Pilih mode retrieval ───────────────────────────────────────────────
        if ($mode === 'boolean') {
            $results = $this->booleanRetrieval($query, $corpus, $boolOp);
        } else {
            $results = $this->tfidfRetrieval($query, $corpus, $topK);
        }

        // ── Hitung metrik evaluasi (Materi 7) ────────────────────────────────
        $evaluation = $this->computeEvalMetrics($results, $query);

        Log::info('TF-IDF Search', [
            'query'      => $query,
            'mode'       => $mode,
            'corpus_n'   => count($corpus),
            'results_n'  => count($results),
        ]);

        return response()->json([
            'success'       => true,
            'query'         => $query,
            'mode'          => $mode,
            'results'       => $results,
            'total_corpus'  => count($corpus),
            'total_results' => count($results),
            'evaluation'    => $evaluation,
        ]);
    }

    /**
     * GET /hr/candidates/{id}/classify
     * Klasifikasi otomatis kandidat: Strong / Average / Weak
     * Menggunakan rule-based scoring yang diinspirasi Text Classification (Materi 8)
     */
    public function classify(Request $request, string $id)
    {
        $companyId = $request->user()->id_company;

        $submission = Submission::with(['user', 'position', 'vacancy'])
            ->where('id_submission', $id)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Kandidat tidak ditemukan'], 404);
        }

        $result = $this->classifyCandidate($submission);

        return response()->json([
            'success' => true,
            'data'    => $result,
        ]);
    }

    /**
     * POST /hr/candidates/classify-batch
     * Klasifikasi semua kandidat di stage tertentu sekaligus
     */
    public function classifyBatch(Request $request)
    {
        $companyId = $request->user()->id_company;
        $status    = $request->input('status');

        $query = Submission::with(['user', 'position', 'vacancy'])
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId));

        if ($status) {
            $query->where('status', $status);
        }

        $submissions = $query->get();

        $results = $submissions->map(fn($s) => [
            'id_submission' => $s->id_submission,
            'name'          => $s->user?->name,
            ...$this->classifyCandidate($s),
        ])->values();

        return response()->json([
            'success' => true,
            'data'    => $results,
        ]);
    }

    /**
     * GET /hr/candidates/index-stats
     * Statistik inverted index untuk debugging / visualisasi (Materi 3)
     */
    public function indexStats(Request $request)
    {
        $companyId = $request->user()->id_company;

        $submissions = Submission::with(['user', 'position', 'vacancy'])
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->get();

        $corpus = $submissions->map(fn($s) => $this->buildDocumentText($s))->toArray();
        $index  = $this->buildInvertedIndex($corpus);

        // Top 20 terms by document frequency
        $dfSorted = collect($index)
            ->map(fn($postings) => count($postings))
            ->sortDesc()
            ->take(20);

        return response()->json([
            'success'        => true,
            'total_terms'    => count($index),
            'total_docs'     => count($corpus),
            'top_terms'      => $dfSorted,
        ]);
    }

    // ─── Core IR Algorithms ────────────────────────────────────────────────────

    /**
     * TF-IDF Retrieval + Cosine Similarity (Materi 5)
     *
     * Langkah:
     *   1. Tokenisasi & preprocessing (lowercase, stopword removal, stemming sederhana)
     *   2. Bangun inverted index
     *   3. Hitung TF-IDF untuk setiap term di setiap dokumen
     *   4. Representasikan query sebagai TF-IDF vector
     *   5. Hitung cosine similarity antara query vector dan setiap doc vector
     *   6. Urutkan berdasarkan similarity (descending)
     */
    private function tfidfRetrieval(string $query, array $corpus, int $topK): array
    {
        $N = count($corpus);
        if ($N === 0) return [];

        // Step 1: Tokenisasi semua dokumen
        $tokenizedDocs = array_map(fn($doc) => $this->tokenize($doc['text']), $corpus);
        $queryTokens   = $this->tokenize($query);

        if (empty($queryTokens)) return [];

        // Step 2: Bangun inverted index → [term => [docId => termFreq]]
        $index = $this->buildInvertedIndex($tokenizedDocs);

        // Kumpulkan semua term yang relevan (union dari query tokens dan index)
        $allTerms = array_keys($index);

        // Step 3 & 4: Hitung TF-IDF
        $scores = [];

        foreach ($corpus as $i => $doc) {
            $docTokens = $tokenizedDocs[$i];
            $docLen    = count($docTokens);
            if ($docLen === 0) continue;

            $dotProduct  = 0.0;
            $docNormSq   = 0.0;
            $queryNormSq = 0.0;

            foreach ($queryTokens as $term) {
                // TF query: raw count / total query terms
                $tfQuery = substr_count(implode(' ', $queryTokens), $term) / count($queryTokens);

                // IDF: log(N / df(t) + 1)  [+1 smoothing untuk menghindari div/0]
                $df  = isset($index[$term]) ? count($index[$term]) : 0;
                $idf = log(($N + 1) / ($df + 1)) + 1; // smooth IDF

                // TF-IDF query weight
                $wtQuery = $tfQuery * $idf;

                // TF doc: term frequency di dokumen ini
                $tfDoc  = isset($index[$term][$i]) ? $index[$term][$i] / $docLen : 0;
                $wtDoc  = $tfDoc * $idf;

                $dotProduct  += $wtQuery * $wtDoc;
                $queryNormSq += $wtQuery ** 2;
                $docNormSq   += $wtDoc ** 2;
            }

            // Tambahkan semua doc terms ke norm (bukan hanya query terms)
            foreach ($docTokens as $term) {
                if (!in_array($term, $queryTokens)) {
                    $df      = isset($index[$term]) ? count($index[$term]) : 1;
                    $idf     = log(($N + 1) / ($df + 1)) + 1;
                    $tfDoc   = ($index[$term][$i] ?? 0) / $docLen;
                    $wtDoc   = $tfDoc * $idf;
                    $docNormSq += $wtDoc ** 2;
                }
            }

            $norm = sqrt($queryNormSq) * sqrt($docNormSq);
            $similarity = $norm > 0 ? $dotProduct / $norm : 0.0;

            if ($similarity > 0) {
                $scores[$i] = $similarity;
            }
        }

        arsort($scores);

        // Build result array
        $results = [];
        $rank    = 1;
        foreach (array_slice($scores, 0, $topK, true) as $i => $score) {
            $s       = $corpus[$i]['submission'];
            $results[] = array_merge(
                $this->formatCandidate($s),
                [
                    'relevance_score'   => round($score, 4),
                    'relevance_percent' => min(100, round($score * 100 * 3, 1)), // scale to 0-100%
                    'rank'              => $rank++,
                    'matched_terms'     => $this->getMatchedTerms($queryTokens, $tokenizedDocs[$i]),
                ]
            );
        }

        return $results;
    }

    /**
     * Boolean Retrieval (Materi 2)
     *
     * Mendukung operator:
     *   AND  → dokumen harus mengandung SEMUA term
     *   OR   → dokumen mengandung MINIMAL SATU term
     *   NOT  → prefix "NOT " sebelum term untuk eksklusif
     *
     * Contoh query: "python machine learning NOT java"
     *   → (has python) AND (has machine) AND (has learning) AND NOT (has java)
     */
    private function booleanRetrieval(string $query, array $corpus, string $operator = 'AND'): array
    {
        $tokenizedDocs = array_map(fn($doc) => $this->tokenize($doc['text']), $corpus);

        // Parse positive dan negative terms
        $terms      = $this->tokenize($query);
        $rawWords   = preg_split('/\s+/', strtolower(trim($query)));

        $positiveTerms = [];
        $negativeTerms = [];
        $isNegative    = false;

        foreach ($rawWords as $word) {
            if ($word === 'not') {
                $isNegative = true;
                continue;
            }
            $tok = $this->tokenize($word);
            if (empty($tok)) continue;
            if ($isNegative) {
                $negativeTerms = array_merge($negativeTerms, $tok);
                $isNegative = false;
            } else {
                $positiveTerms = array_merge($positiveTerms, $tok);
            }
        }

        if (empty($positiveTerms)) $positiveTerms = $terms;

        // Build posting lists (Materi 3)
        $index = $this->buildInvertedIndex($tokenizedDocs);

        $results = [];
        foreach ($corpus as $i => $doc) {
            $docTokenSet = array_flip($tokenizedDocs[$i]);

            // Check positive terms
            if ($operator === 'AND') {
                $matchPositive = count($positiveTerms) > 0
                    ? array_reduce($positiveTerms, fn($carry, $t) => $carry && isset($docTokenSet[$t]), true)
                    : true;
            } else { // OR
                $matchPositive = count($positiveTerms) > 0
                    ? array_reduce($positiveTerms, fn($carry, $t) => $carry || isset($docTokenSet[$t]), false)
                    : true;
            }

            // Check NOT terms
            $matchNegative = array_reduce($negativeTerms, fn($carry, $t) => $carry && !isset($docTokenSet[$t]), true);

            if ($matchPositive && $matchNegative) {
                $matched     = $this->getMatchedTerms($positiveTerms, $tokenizedDocs[$i]);
                $matchRatio  = count($positiveTerms) > 0
                    ? count($matched) / count($positiveTerms)
                    : 1.0;

                $results[] = array_merge(
                    $this->formatCandidate($doc['submission']),
                    [
                        'relevance_score'   => round($matchRatio, 4),
                        'relevance_percent' => round($matchRatio * 100, 1),
                        'rank'              => 0,
                        'matched_terms'     => $matched,
                        'boolean_match'     => true,
                    ]
                );
            }
        }

        // Urutkan by matched terms count
        usort($results, fn($a, $b) => count($b['matched_terms']) - count($a['matched_terms']));

        foreach ($results as $i => &$r) {
            $r['rank'] = $i + 1;
        }

        return $results;
    }

    // ─── Text Classification (Materi 8) ───────────────────────────────────────

    /**
     * Rule-based Text Classification untuk kandidat
     * Menentukan kategori: Strong / Average / Weak
     * berdasarkan kelengkapan dokumen, panjang motivasi, dan hr_notes
     */
    private function classifyCandidate(Submission $s): array
    {
        $score = 0;
        $reasons = [];

        // Document completeness (0-40 pts)
        if (!empty($s->cv_file))                 { $score += 15; $reasons[] = 'Has CV (+15)'; }
        if (!empty($s->cover_letter_file))        { $score += 10; $reasons[] = 'Has Cover Letter (+10)'; }
        if (!empty($s->portfolio_file))           { $score += 10; $reasons[] = 'Has Portfolio (+10)'; }
        if (!empty($s->institution_letter_file))  { $score += 5;  $reasons[] = 'Has Recommendation (+5)'; }

        // Motivation quality (0-40 pts) — panjang + keyword TF-IDF sederhana
        $motivation = $s->motivation_message ?? '';
        $motivLen   = str_word_count($motivation);

        if ($motivLen >= 100) { $score += 20; $reasons[] = 'Strong motivation (≥100 words, +20)'; }
        elseif ($motivLen >= 50) { $score += 12; $reasons[] = 'Good motivation (≥50 words, +12)'; }
        elseif ($motivLen >= 20) { $score += 6;  $reasons[] = 'Brief motivation (≥20 words, +6)'; }

        // Keyword richness in motivation
        $positiveKeywords = ['pengalaman','experience','project','internship','magang',
                             'skills','kemampuan','belajar','develop','implement','build'];
        $motivTokens  = $this->tokenize($motivation);
        $keywordHits  = count(array_intersect($motivTokens, $positiveKeywords));
        $keywordScore = min(20, $keywordHits * 4);
        if ($keywordScore > 0) { $score += $keywordScore; $reasons[] = "Keyword richness (+{$keywordScore})"; }

        // LinkedIn presence (0-10 pts)
        if (!empty($s->linkedin_url)) { $score += 10; $reasons[] = 'LinkedIn profile (+10)'; }

        // HR notes presence (+10 pts) — menunjukkan sudah diperhatikan
        if (!empty($s->hr_notes)) { $score += 10; $reasons[] = 'Has HR notes (+10)'; }

        // Klasifikasi final
        $classification = match(true) {
            $score >= 65 => 'strong',
            $score >= 35 => 'average',
            default      => 'weak',
        };

        $label = match($classification) {
            'strong'  => 'Strong',
            'average' => 'Average',
            default   => 'Weak',
        };

        $color = match($classification) {
            'strong'  => ['bg' => '#f0fdf4', 'color' => '#15803d', 'border' => '#86efac'],
            'average' => ['bg' => '#fefce8', 'color' => '#a16207', 'border' => '#fde68a'],
            default   => ['bg' => '#fff1f2', 'color' => '#be123c', 'border' => '#fecdd3'],
        };

        return [
            'classification' => $classification,
            'label'          => $label,
            'score'          => $score,
            'max_score'      => 100,
            'percentage'     => $score,
            'reasons'        => $reasons,
            'color'          => $color,
        ];
    }

    // ─── Retrieval Evaluation (Materi 7) ──────────────────────────────────────

    /**
     * Hitung metrik evaluasi sederhana:
     *   - Average Precision @ k (AP@k)
     *   - Mean coverage score
     */
    private function computeEvalMetrics(array $results, string $query): array
    {
        if (empty($results)) {
            return ['precision_at_5' => 0, 'precision_at_10' => 0, 'avg_relevance' => 0];
        }

        $scores = array_column($results, 'relevance_score');

        $topK5  = array_slice($scores, 0, 5);
        $topK10 = array_slice($scores, 0, 10);

        // Relevance threshold: score > 0.05 dianggap relevan
        $threshold = 0.05;

        $p5  = count(array_filter($topK5,  fn($s) => $s >= $threshold)) / max(1, count($topK5));
        $p10 = count(array_filter($topK10, fn($s) => $s >= $threshold)) / max(1, count($topK10));
        $avg = count($scores) > 0 ? array_sum($scores) / count($scores) : 0;

        return [
            'precision_at_5'  => round($p5 * 100, 1),
            'precision_at_10' => round($p10 * 100, 1),
            'avg_relevance'   => round($avg, 4),
            'total_relevant'  => count(array_filter($scores, fn($s) => $s >= $threshold)),
        ];
    }

    // ─── Inverted Index (Materi 3) ────────────────────────────────────────────

    /**
     * Bangun Inverted Index dari kumpulan tokenized documents
     * Return: [term => [docId => termFrequency]]
     */
    private function buildInvertedIndex(array $tokenizedDocs): array
    {
        $index = [];
        foreach ($tokenizedDocs as $docId => $tokens) {
            $termFreqs = array_count_values($tokens);
            foreach ($termFreqs as $term => $freq) {
                $index[$term][$docId] = $freq;
            }
        }
        return $index;
    }

    // ─── Text Preprocessing ───────────────────────────────────────────────────

    /**
     * Tokenisasi teks:
     *   1. Lowercase
     *   2. Hapus karakter non-alfanumerik
     *   3. Split by whitespace
     *   4. Hapus stopwords
     *   5. Minimum length 2
     */
    private function tokenize(string $text): array
    {
        $text   = mb_strtolower($text);
        $text   = preg_replace('/[^a-z0-9\s]/', ' ', $text);
        $tokens = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_filter(
            $tokens,
            fn($t) => strlen($t) >= 2 && !in_array($t, self::STOPWORDS)
        ));
    }

    /**
     * Bangun teks dokumen dari submission (untuk di-index)
     * Gabungkan semua field teks yang relevan dengan bobot berbeda
     */
    private function buildDocumentText(Submission $s): string
    {
        $parts = [
            // Tinggi bobot: nama, posisi (repeat 3x)
            str_repeat(($s->user?->name ?? '') . ' ', 3),
            str_repeat(($s->position?->name ?? '') . ' ', 3),
            // Medium: motivasi, notes
            $s->motivation_message ?? '',
            $s->hr_notes ?? '',
            // Rendah: universitas
            $s->user?->university ?? '',
            // Status metadata
            $s->status ?? '',
        ];

        return implode(' ', array_filter($parts));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function getMatchedTerms(array $queryTokens, array $docTokens): array
    {
        $docSet = array_flip($docTokens);
        return array_values(array_unique(array_filter(
            $queryTokens,
            fn($t) => isset($docSet[$t])
        )));
    }

    private function formatCandidate(Submission $s): array
    {
        return [
            'id_submission'          => $s->id_submission,
            'name'                   => $s->user?->name,
            'email'                  => $s->user?->email,
            'university'             => $s->user?->university,
            'position'               => $s->position?->name,
            'status'                 => $s->status,
            'submitted_at'           => $s->submitted_at,
            'has_cv'                 => !empty($s->cv_file),
            'has_cover_letter'       => !empty($s->cover_letter_file),
            'has_portfolio'          => !empty($s->portfolio_file),
            'has_institution_letter' => !empty($s->institution_letter_file),
            'hr_notes'               => $s->hr_notes,
            'cv_url'                 => $s->cv_file ? asset('storage/' . $s->cv_file) : null,
            'cover_letter_url'       => $s->cover_letter_file ? asset('storage/' . $s->cover_letter_file) : null,
            'portfolio_url'          => $s->portfolio_file ? asset('storage/' . $s->portfolio_file) : null,
            'institution_letter_url' => $s->institution_letter_file ? asset('storage/' . $s->institution_letter_file) : null,
        ];
    }
}