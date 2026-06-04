<?php
/**
 * Test the new PasswordResetService
 * 
 * Run with: php artisan tinker --execute="include('test-password-reset-service.php');"
 */

echo "=== Testing PasswordResetService ===\n\n";

$service = new \App\Services\PasswordResetService();

// Test with a non-existent email (security should still return success message)
echo "Test 1: Non-existent email (should return success message for security)\n";
$result = $service->sendResetEmail('nonexistent-' . time() . '@example.com', '/reset-password');
dd($result);
