<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Company;
use Illuminate\Support\Facades\Hash;

// Test masuk database
$company = Company::where('email', 'otak@example.com')->first();

if ($company) {
    echo "Company ditemukan: " . $company->name . "\n";
    echo "Password di DB (hash): " . substr($company->password, 0, 20) . "...\n";
    
    // Test password verification
    $testPassword = 'password123'; // ganti dengan password yang baru kamu set
    $isValid = Hash::check($testPassword, $company->password);
    
    echo "Test password '$testPassword': " . ($isValid ? "VALID ✓" : "INVALID ✗") . "\n";
    
    // Show full hash
    echo "\nFull hash: " . $company->password . "\n";
} else {
    echo "Company tidak ditemukan\n";
}
