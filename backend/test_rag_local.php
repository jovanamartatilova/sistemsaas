<?php
use App\Models\User;
use App\Http\Controllers\HR\TFIDFSearchController;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get an HR user to mock request authentication
$hrUser = User::where('role', 'hr')->first();
if (!$hrUser) {
    echo "No HR user found in database. Please seed or create one first.\n";
    exit(1);
}

echo "Found HR User: {$hrUser->name} (Company: {$hrUser->id_company})\n";

// Get all candidate submissions for CMP9720806
$submissions = \App\Models\Submission::whereHas('vacancy', fn($q) => $q->where('id_company', $hrUser->id_company))->with('user.candidate', 'position')->get();
echo "Total submissions for CMP9720806: " . $submissions->count() . "\n";
foreach ($submissions as $s) {
    echo "- Sub: {$s->id_submission}, Name: {$s->user->name}, Position: {$s->position->name}, Motivation: {$s->motivation_message}\n";
}

// Mock the Request with position & status parameters
$request = Request::create('/api/hr/candidates/rag-search', 'GET', [
    'q' => 'figma',
    'retriever' => 'tfidf',
    'top_k' => 2,
    'id_position' => '', // optional position filter
    'status' => '' // optional stage filter
]);
$request->setUserResolver(function () use ($hrUser) {
    return $hrUser;
});

echo "Testing RAG Search...\n";
$controller = new TFIDFSearchController();
$response = $controller->ragSearch($request);
echo "Response Status: " . $response->getStatusCode() . "\n";
$decoded = json_decode($response->getContent(), true);
if (isset($decoded['answer'])) {
    echo "RAG Answer Preview: " . substr($decoded['answer'], 0, 150) . "...\n";
}
echo "Response Body: " . json_encode($decoded, JSON_PRETTY_PRINT) . "\n";
