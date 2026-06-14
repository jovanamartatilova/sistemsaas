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

        // Position name
        if ($submission->position) {
            $parts[] = 'Applying for: ' . $submission->position->name;
        }

        // Motivation - unique per candidate
        if ($submission->motivation_message) {
            $parts[] = 'Motivation: ' . $submission->motivation_message;
        }

        // HR notes - unique per candidate
        if ($submission->hr_notes) {
            $parts[] = 'HR Notes: ' . $submission->hr_notes;
        }

        // Auto-extract CV from storage if not passed manually
        if (empty($cvText) && !empty($submission->cv_file)) {
            try {
                $cvPath = storage_path('app/public/' . $submission->cv_file);
                if (file_exists($cvPath)) {
                    $ext = strtolower(pathinfo($cvPath, PATHINFO_EXTENSION));
                    if ($ext === 'pdf') {
                        $raw = shell_exec('pdftotext ' . escapeshellarg($cvPath) . ' -');
                        if ($raw) $cvText = $raw;
                    } elseif (in_array($ext, ['txt', 'md'])) {
                        $cvText = file_get_contents($cvPath);
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('CV extraction failed: ' . $e->getMessage());
            }
        }

        if (!empty($cvText)) {
            $parts[] = 'CV Content: ' . mb_substr($cvText, 0, 5000);
        }

        // Portfolio as signal
        if (!empty($submission->portfolio_file)) {
            $parts[] = 'Has portfolio: yes';
        }

        return mb_substr(implode("\n", $parts), 0, 8000);
    }

}