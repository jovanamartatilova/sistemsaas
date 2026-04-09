<?php
// Test file to debug mentor profile
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;

// Find a mentor user
$mentor = User::where('role', 'mentor')->first();

if ($mentor) {
    echo "✓ Mentor found: {$mentor->name}\n";
    echo "  ID: {$mentor->id_user}\n";
    echo "  Email: {$mentor->email}\n";
    echo "  Company: {$mentor->id_company}\n";

    // Check if they have assigned interns
    $interns = $mentor->submissions_as_mentor()->count();
    echo "  Assigned interns: {$interns}\n";

    // Test API response
    $response = [
        'id_user' => $mentor->id_user,
        'name' => $mentor->name,
        'email' => $mentor->email,
        'phone' => $mentor->phone ?? null,
        'role' => $mentor->role,
        'company_id' => $mentor->id_company,
    ];

    echo "\n✓ Profile response structure:\n";
    echo json_encode($response, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "✗ No mentor found in database\n";
}
