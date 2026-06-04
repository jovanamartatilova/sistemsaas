<?php
/**
 * Comprehensive Password Reset Test
 * 
 * This test demonstrates the complete password reset flow:
 * 1. Email validation
 * 2. User lookup
 * 3. Token generation and storage
 * 4. Email composition
 * 5. Error handling
 * 
 * Run with: php artisan tinker --execute="include('test-complete-reset-flow.php');"
 */

echo "\n=== Complete Password Reset Flow Test ===\n\n";

// Get a test user
$testUser = \App\Models\User::first();
if (!$testUser) {
    echo "❌ No users found in database. Create a user first.\n";
    return;
}

echo "Test User: {$testUser->email}\n";
echo "---\n\n";

// Test the service
echo "Step 1: Initialize PasswordResetService\n";
$service = new \App\Services\PasswordResetService();
echo "✓ Service initialized\n\n";

echo "Step 2: Send password reset email\n";
$result = $service->sendResetEmail($testUser->email, '/reset-password');
echo "Result: " . json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

if ($result['success']) {
    echo "✓ Email send completed\n\n";
    
    echo "Step 3: Verify token in database\n";
    $token = \DB::table('password_resets')
        ->where('email', $testUser->email)
        ->latest('created_at')
        ->first();
    
    if ($token) {
        echo "✓ Token found in password_resets table\n";
        echo "  Email: {$token->email}\n";
        echo "  Token: " . substr($token->token, 0, 20) . "...\n";
        echo "  Created: {$token->created_at}\n\n";
        
        echo "Step 4: Build reset URL\n";
        $frontendUrl = config('app.frontend_url');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token->token . '&email=' . urlencode($token->email);
        echo "Reset URL: {$resetUrl}\n\n";
        
        echo "Step 5: Check Laravel logs\n";
        echo "Look for these log messages:\n";
        echo "  - 'Password reset requested for email: {$testUser->email}'\n";
        echo "  - 'Password reset email sent successfully to: {$testUser->email}'\n";
        echo "  - 'Reset URL: {$resetUrl}'\n\n";
        
        echo "✅ Password reset flow completed successfully!\n";
    } else {
        echo "❌ Token not found in database\n";
    }
} else {
    echo "❌ Email send failed: " . ($result['error'] ?? 'Unknown error') . "\n";
    echo "Check storage/logs/laravel.log for details\n";
}
?>
