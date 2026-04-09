<?php
/**
 * Debug script untuk check submissions table schema dan test scores saving
 */
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\Submission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== SUBMISSIONS TABLE SCHEMA CHECK ===\n";

// Check if scores_data column exists
if (Schema::hasColumn('submissions', 'scores_data')) {
    echo "✓ scores_data column EXISTS\n";

    // Get column type
    $columns = DB::select("PRAGMA table_info(submissions)");
    foreach ($columns as $col) {
        if ($col->name === 'scores_data') {
            echo "  Type: {$col->type}\n";
            break;
        }
    }
} else {
    echo "✗ scores_data column MISSING\n";
}

// List all columns
echo "\n=== ALL COLUMNS IN SUBMISSIONS TABLE ===\n";
$columns = Schema::getColumnListing('submissions');
foreach ($columns as $col) {
    echo "- $col\n";
}

// Check for a mentor's submissions
echo "\n=== MENTOR'S SUBMISSIONS ===\n";
$mentorSubmissions = Submission::whereNotNull('id_user_mentor')->limit(3)->get();

if ($mentorSubmissions->count() === 0) {
    echo "✗ No submissions with mentor assigned found\n";
} else {
    foreach ($mentorSubmissions as $sub) {
        echo "\nSubmission ID: {$sub->id_submission}\n";
        echo "  Mentor: {$sub->id_user_mentor}\n";
        echo "  Scores Data: " . json_encode($sub->scores_data) . "\n";
        echo "  Scores Data Type: " . gettype($sub->scores_data) . "\n";
    }
}

echo "\n=== TOTAL COLUMN COUNT ===\n";
echo "Total columns: " . count($columns) . "\n";
