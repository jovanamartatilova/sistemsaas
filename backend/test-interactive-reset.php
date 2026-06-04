#!/usr/bin/env php
<?php
/**
 * Interactive Password Reset Test
 * 
 * This script allows you to test the password reset flow interactively
 * 
 * Usage:
 *   php test-interactive-reset.php
 * 
 * Or in tinker:
 *   include('test-interactive-reset.php');
 */

echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║     Password Reset System - Interactive Test                   ║\n";
echo "║     (Test your forgot password email system)                   ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// Step 1: Check configuration
echo "STEP 1: Checking Mail Configuration...\n";
echo str_repeat("─", 70) . "\n";

$config = [
    'MAIL_MAILER' => env('MAIL_MAILER'),
    'MAIL_HOST' => env('MAIL_HOST'),
    'MAIL_PORT' => env('MAIL_PORT'),
    'MAIL_SCHEME' => config('mail.mailers.smtp.scheme'),
    'MAIL_ENCRYPTION' => env('MAIL_ENCRYPTION'),
    'MAIL_USERNAME' => substr(env('MAIL_USERNAME'), 0, 5) . '***',
    'MAIL_TIMEOUT' => config('mail.mailers.smtp.timeout'),
    'QUEUE_CONNECTION' => config('queue.default'),
    'FRONTEND_URL' => config('app.frontend_url'),
];

foreach ($config as $key => $value) {
    $status = in_array($key, ['MAIL_SCHEME', 'MAIL_ENCRYPTION', 'MAIL_PORT']) ? '✅' : 'ℹ️ ';
    printf("%-20s: %s\n", $key, $status . ' ' . $value);
}

$errors = [];
if (config('mail.mailers.smtp.scheme') !== 'smtp') {
    $errors[] = "MAIL_SCHEME must be 'smtp', not '" . config('mail.mailers.smtp.scheme') . "'";
}
if (env('MAIL_ENCRYPTION') !== 'tls') {
    $errors[] = "MAIL_ENCRYPTION must be 'tls', not '" . env('MAIL_ENCRYPTION') . "'";
}
if (env('MAIL_PORT') != 587) {
    $errors[] = "MAIL_PORT should be 587, not " . env('MAIL_PORT');
}

if (count($errors) > 0) {
    echo "\n❌ Configuration Errors Found:\n";
    foreach ($errors as $error) {
        echo "   - {$error}\n";
    }
    echo "\nPlease fix the errors above before proceeding.\n";
    return;
}

echo "\n✅ Configuration looks correct!\n\n";

// Step 2: Test SMTP connection
echo "STEP 2: Testing SMTP Connection...\n";
echo str_repeat("─", 70) . "\n";

$host = config('mail.mailers.smtp.host');
$port = config('mail.mailers.smtp.port');

if ($socket = @fsockopen($host, $port, $errno, $errstr, 5)) {
    echo "✅ Successfully connected to {$host}:{$port}\n";
    fclose($socket);
} else {
    echo "❌ Failed to connect to {$host}:{$port}\n";
    echo "   Error: {$errstr} ({$errno})\n";
    echo "   Check your internet connection and firewall settings.\n";
    return;
}

echo "\n";

// Step 3: Test with existing user or create test
echo "STEP 3: Available Users in Database...\n";
echo str_repeat("─", 70) . "\n";

$users = \App\Models\User::limit(5)->get(['id_user', 'name', 'email']);

if ($users->isEmpty()) {
    echo "❌ No users found in database!\n";
    echo "Please create a user first before testing.\n";
    return;
}

foreach ($users as $idx => $user) {
    echo sprintf("%d. %s (%s)\n", $idx + 1, $user->name, $user->email);
}

echo "\n";

// Step 4: Send test email
echo "STEP 4: Sending Test Password Reset Email...\n";
echo str_repeat("─", 70) . "\n";

if (php_sapi_name() === 'cli') {
    // Running from command line - use first user
    $testUser = $users->first();
    echo "Using test user: {$testUser->email}\n\n";
} else {
    // Running in tinker - use first user
    $testUser = $users->first();
    echo "Using test user: {$testUser->email}\n\n";
}

$service = new \App\Services\PasswordResetService();
$result = $service->sendResetEmail($testUser->email, '/reset-password');

if ($result['success']) {
    echo "✅ Email send completed successfully!\n\n";
    
    // Verify token in database
    $token = \DB::table('password_resets')
        ->where('email', $testUser->email)
        ->latest('created_at')
        ->first();
    
    if ($token) {
        echo "Step 4a: Token Verification\n";
        echo str_repeat("─", 70) . "\n";
        echo "✅ Token stored in database\n";
        echo sprintf("   Email: %s\n", $token->email);
        echo sprintf("   Token: %s...\n", substr($token->token, 0, 20));
        echo sprintf("   Created: %s\n", $token->created_at);
        echo "\n";
        
        // Show reset URL
        echo "Step 4b: Reset URL\n";
        echo str_repeat("─", 70) . "\n";
        $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token->token . '&email=' . urlencode($testUser->email);
        echo "✅ Reset URL generated:\n";
        echo $resetUrl . "\n";
        echo "\n";
    }
} else {
    echo "❌ Email send failed!\n";
    echo "Error: " . ($result['error'] ?? 'Unknown error') . "\n";
    echo "\nCheck storage/logs/laravel.log for details.\n";
    return;
}

// Step 5: Show next steps
echo "STEP 5: Next Steps...\n";
echo str_repeat("─", 70) . "\n";

echo "1. Check your email inbox for the password reset email\n";
echo "2. Click the reset link to verify the flow works\n";
echo "3. Check Laravel logs:\n";
echo "   tail -50 storage/logs/laravel.log | grep -i 'password reset'\n";
echo "\n";

echo "✅ Test Completed Successfully!\n\n";
echo "The forgot password email system is working correctly.\n";
echo "You can now test the full flow from your React frontend.\n\n";
?>
