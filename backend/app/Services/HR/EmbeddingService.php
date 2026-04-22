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
    
    public function prepareCandidateText($submission): string
    {
        $texts = [];
        
        if ($submission->user) {
            $texts[] = $submission->user->name;
            $texts[] = $submission->user->email;
        }
        
        if ($submission->position) {
            $texts[] = $submission->position->name;
            $texts[] = $submission->position->description ?? '';
        }
        
        if ($submission->vacancy) {
            $texts[] = $submission->vacancy->title;
            $texts[] = $submission->vacancy->requirements;
            $texts[] = $submission->vacancy->description;
        }
        
        $texts[] = $submission->status;
        
        if ($submission->hr_notes) {
            $texts[] = $submission->hr_notes;
        }
        
        $fullText = implode(' | ', array_filter($texts));
        return substr($fullText, 0, 8000);
    }
}