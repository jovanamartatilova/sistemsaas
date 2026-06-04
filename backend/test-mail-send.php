<?php
/**
 * Quick Mail Send Test
 * 
 * Usage in tinker:
 * $email = 'test@example.com';
 * include('test-mail-send.php');
 */

try {
    echo "Sending test password reset email...\n";
    
    Mail::raw(
        "This is a test password reset email.\n" .
        "Reset URL: http://localhost:5173/reset-password?token=test123&email=" . urlencode($email) . "\n",
        function ($message) use ($email) {
            $message->to($email)
                ->subject('Test Password Reset - EarlyPath');
        }
    );
    
    echo "✓ Email sent successfully to: {$email}\n";
    
} catch (\Exception $e) {
    echo "✗ Failed to send email: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
