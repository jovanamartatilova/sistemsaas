<?php

namespace App\Services\HR;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    protected $apiUrl = 'http://localhost:11434/api/embeddings';
    protected $timeout = 30;
    
    public function generateEmbedding(string $text): array
    {
        // Truncate text to avoid limits
        $text = substr($text, 0, 8000);
        
        try {
            $response = Http::timeout($this->timeout)->post($this->apiUrl, [
                'model' => 'nomic-embed-text',
                'prompt' => $text,
            ]);
            
            if (!$response->successful()) {
                Log::error('Ollama API error: ' . $response->body());
                throw new \Exception('Ollama error: ' . $response->body());
            }
            
            $data = $response->json();
            
            if (!isset($data['embedding'])) {
                throw new \Exception('No embedding in response');
            }
            
            $embedding = $data['embedding'];
            
            Log::info("Embedding generated", ['text_length' => strlen($text), 'embedding_size' => count($embedding)]);
            return $embedding;
            
        } catch (\Exception $e) {
            Log::error('Ollama embedding failed: ' . $e->getMessage());
            throw new \Exception("Failed to generate embedding: " . $e->getMessage());
        }
    }
    
    public function prepareCandidateText($submission, string $cvText = ''): string
{
    $parts = [];

    // Hanya nama posisi — bukan description/requirements (shared)
    if ($submission->position) {
        $parts[] = 'Applying for: ' . $submission->position->name;
    }

    // Motivasi — ini unik per kandidat
    if ($submission->motivation_message) {
        $parts[] = 'Motivation: ' . $submission->motivation_message;
    }

    // HR notes — unik per kandidat
    if ($submission->hr_notes) {
        $parts[] = 'HR Notes: ' . $submission->hr_notes;
    }

    // CV — paling unik, paling penting
    if (!empty($cvText)) {
        $parts[] = 'CV: ' . mb_substr($cvText, 0, 6000);
    }

    return mb_substr(implode("\n", $parts), 0, 8000);
}
}