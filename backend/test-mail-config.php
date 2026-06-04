<?php
/**
 * Test Mail Configuration
 * 
 * Run in tinker:
 * include('test-mail-config.php');
 * 
 * Or run from command line:
 * php -d display_errors=1 test-mail-config.php
 */

// Get the config
$config = config('mail');

echo "=== Mail Configuration Test ===\n\n";

echo "Default Mailer: " . $config['default'] . "\n";
echo "SMTP Configuration:\n";
echo "  Host: " . ($config['mailers']['smtp']['host'] ?? 'NOT SET') . "\n";
echo "  Port: " . ($config['mailers']['smtp']['port'] ?? 'NOT SET') . "\n";
echo "  Scheme: " . ($config['mailers']['smtp']['scheme'] ?? 'NOT SET') . "\n";
echo "  Username: " . substr($config['mailers']['smtp']['username'] ?? '', 0, 5) . "***\n";
echo "  Transport: " . ($config['mailers']['smtp']['transport'] ?? 'NOT SET') . "\n\n";

echo "Frontend URL Config: " . config('app.frontend_url') . "\n\n";

// Check environment variables
echo "=== Environment Variables ===\n";
echo "MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
echo "MAIL_PORT: " . env('MAIL_PORT') . "\n";
echo "MAIL_SCHEME: " . env('MAIL_SCHEME') . "\n";
echo "MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
echo "QUEUE_CONNECTION: " . env('QUEUE_CONNECTION') . "\n";
echo "FRONTEND_URL: " . env('FRONTEND_URL') . "\n\n";

// Test SMTP connection
echo "=== SMTP Connection Test ===\n";
try {
    $host = config('mail.mailers.smtp.host');
    $port = config('mail.mailers.smtp.port');
    
    if ($socket = @fsockopen($host, $port, $errno, $errstr, 5)) {
        echo "✓ Successfully connected to {$host}:{$port}\n";
        fclose($socket);
    } else {
        echo "✗ Failed to connect to {$host}:{$port}\n";
        echo "  Error: {$errstr} ({$errno})\n";
    }
} catch (\Exception $e) {
    echo "✗ Connection test error: " . $e->getMessage() . "\n";
}

echo "\n=== Recommendations ===\n";
echo "If mail still doesn't work:\n";
echo "1. Test the full mail send from a controller\n";
echo "2. Check Laravel logs: storage/logs/laravel.log\n";
echo "3. Verify Gmail app password is correct\n";
echo "4. Enable 'Less secure app access' if needed\n";
?>
