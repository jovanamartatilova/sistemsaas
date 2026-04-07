<?php
// Quick script to check candidate data

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Submission;

$email = 'vinanuraisah69@gmail.com';
echo "=== Checking for candidate: $email ===\n\n";

$user = User::where('email', $email)->first();

if ($user) {
    echo "✓ User Found!\n";
    echo "  Name: " . $user->name . "\n";
    echo "  ID: " . $user->id_user . "\n";
    echo "  Role: " . $user->role . "\n";
    echo "  is_active: " . ($user->is_active ? "1 (active)" : "0 (inactive)") . "\n";
    echo "  Company ID: " . $user->id_company . "\n\n";
    
    $submissions = Submission::where('id_user', $user->id_user)->get();
    echo "Submissions Count: " . $submissions->count() . "\n";
    
    if ($submissions->count() > 0) {
        foreach ($submissions as $s) {
            echo "\n  Submission ID: " . $s->id_submission . "\n";
            echo "    Vacancy: " . $s->id_vacancy . "\n";
            echo "    Position: " . $s->id_position . "\n";
            echo "    Status: " . $s->status . "\n";
            echo "    Submitted: " . $s->submitted_at . "\n";
            echo "    Team: " . ($s->id_team ?? "null (individual)") . "\n";
        }
    } else {
        echo "\n✗ No submissions found for this user!\n";
    }
} else {
    echo "✗ User Not Found\n";
}

echo "\n";
?>
