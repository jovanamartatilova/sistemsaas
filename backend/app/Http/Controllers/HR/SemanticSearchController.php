<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Services\HR\EmbeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SemanticSearchController extends Controller
{
    protected $embeddingService;
    
    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }
    
    public function search(Request $request)
    {
        $query = $request->query('q');
        $companyId = $request->user()->id_company;
        
        if (!$query || strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'results' => [],
                'error' => 'Query too short'
            ]);
        }
        
        try {
            // Ambil candidates - limit 15 untuk performa
            $submissions = Submission::with(['user', 'position', 'vacancy'])
                ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
                ->whereIn('status', ['pending', 'screening', 'interview'])
                ->orderByDesc('submitted_at')
                ->limit(15)
                ->get();
            
            if ($submissions->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'results' => [],
                    'error' => 'No candidates found',
                ]);
            }
            
            Log::info("Starting semantic search with Ollama", ['query' => $query, 'candidate_count' => $submissions->count()]);
            
            // Generate embedding untuk query
            $queryEmbedding = $this->embeddingService->generateEmbedding($query);
            
            $results = [];
            foreach ($submissions as $submission) {
                try {
                    $candidateText = $this->embeddingService->prepareCandidateText($submission);
                    $candidateEmbedding = $this->embeddingService->generateEmbedding($candidateText);
                    $similarity = $this->cosineSimilarity($queryEmbedding, $candidateEmbedding);
                    
                    $results[] = [
                        'id_submission' => $submission->id_submission,
                        'name' => $submission->user?->name,
                        'email' => $submission->user?->email,
                        'position' => $submission->position?->name,
                        'status' => $submission->status,
                        'similarity' => round($similarity, 4),
                        'similarity_percent' => round($similarity * 100, 1),
                        'has_cv' => !empty($submission->cv_file),
                        'has_portfolio' => !empty($submission->portfolio_file),
                        'screening_status' => $submission->screening_status,
                    ];
                } catch (\Exception $e) {
                    Log::warning("Skipping candidate {$submission->id_submission}: " . $e->getMessage());
                    continue;
                }
            }
            
            if (empty($results)) {
                return response()->json([
                    'success' => false,
                    'results' => [],
                    'error' => 'No matching candidates found',
                ]);
            }
            
            // Sort by similarity (highest first)
            usort($results, fn($a, $b) => $b['similarity'] <=> $a['similarity']);
            
            Log::info("Semantic search successful", [
                'query' => $query,
                'results_count' => count($results),
                'provider' => 'ollama'
            ]);
            
            return response()->json([
                'success' => true,
                'query' => $query,
                'results' => array_slice($results, 0, 10),
                'total_scanned' => count($submissions),
                'provider' => 'ollama',
            ]);
            
        } catch (\Exception $e) {
            Log::error('SemanticSearch Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'AI search unavailable: ' . $e->getMessage(),
                'results' => [],
            ], 500);
        }
    }
    
    private function cosineSimilarity(array $vecA, array $vecB): float
    {
        if (count($vecA) !== count($vecB)) {
            return 0;
        }
        
        $dotProduct = 0;
        $normA = 0;
        $normB = 0;
        
        for ($i = 0; $i < count($vecA); $i++) {
            $dotProduct += $vecA[$i] * $vecB[$i];
            $normA += $vecA[$i] ** 2;
            $normB += $vecB[$i] ** 2;
        }
        
        if ($normA == 0 || $normB == 0) {
            return 0;
        }
        
        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}