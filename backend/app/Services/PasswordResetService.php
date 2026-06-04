<?php

namespace App\Services;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PasswordResetService
{
    /**
     * Send password reset email to user
     * 
     * @param string $email User email address
     * @param string $resetPath Frontend path for reset (e.g., '/reset-password' or '/c/{id}/reset-password')
     * @return array ['success' => bool, 'message' => string, 'error' => string|null]
     */
    public function sendResetEmail(string $email, string $resetPath = '/reset-password'): array
    {
        $email = strtolower(trim($email));

        Log::debug('Password reset requested for email: ' . $email);

        try {
            // Check if user exists
            $user = User::where('email', $email)->first();

            if (!$user) {
                // For security, don't reveal if email exists
                Log::info('Password reset requested for non-existent email: ' . $email);
                return [
                    'success' => true,
                    'message' => 'If an account exists with that email, you will receive a password reset link.'
                ];
            }

            // Generate password reset token
            $token = Str::random(64);

            Log::debug('Generated reset token for ' . $email . ': ' . substr($token, 0, 10) . '...');

            // Delete any existing reset tokens for this email
            DB::table('password_resets')->where('email', $email)->delete();

            // Create new reset token
            DB::table('password_resets')->insert([
                'email' => $email,
                'token' => $token,
                'created_at' => now(),
            ]);

            Log::debug('Inserted reset token into database for ' . $email);

            // Build reset URL
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            $resetUrl = $frontendUrl . $resetPath . '?token=' . $token . '&email=' . urlencode($email);

            Log::debug('Reset URL: ' . $resetUrl);

            // Send email
            $this->sendEmailWithFallback($user, $resetUrl, $email);

            Log::info('Password reset email sent successfully to: ' . $email);

            return [
                'success' => true,
                'message' => 'If an account exists with that email, you will receive a password reset link.'
            ];

        } catch (Throwable $e) {
            $errorMsg = 'Failed to send password reset email to ' . $email . ': ' . $e->getMessage();
            Log::error($errorMsg);
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return [
                'success' => false,
                'message' => 'Failed to send password reset email. Please try again later.',
                'error' => $errorMsg
            ];
        }
    }

    /**
     * Send email with automatic fallback to Mail::raw if Mailable fails
     * This handles Windows compatibility issues
     */
    private function sendEmailWithFallback(User $user, string $resetUrl, string $email): void
    {
        try {
            // Try using the Mailable class first (more reliable)
            Log::debug('Attempting to send email using Mailable class...');
            Mail::send(new PasswordResetMail(
                userEmail: $email,
                resetUrl: $resetUrl,
                userName: $user->name ?? 'User'
            ));
            Log::debug('Email sent successfully using Mailable class');
        } catch (Throwable $e) {
            Log::warning('Mailable send failed, falling back to Mail::raw: ' . $e->getMessage());
            
            // Fallback to raw mail
            $this->sendRawEmail($email, $resetUrl);
        }
    }

    /**
     * Send raw text email (fallback method)
     */
    private function sendRawEmail(string $email, string $resetUrl): void
    {
        Log::debug('Sending email using Mail::raw fallback...');

        Mail::raw(
            "Password Reset Request\n" .
            "======================\n\n" .
            "You have requested to reset your password for your EarlyPath account.\n\n" .
            "Click the link below to reset your password (link expires in 1 hour):\n" .
            $resetUrl . "\n\n" .
            "If you did not request a password reset, please ignore this email.\n\n" .
            "Best regards,\n" .
            "The EarlyPath Team\n\n" .
            "---\n" .
            "Account Email: {$email}",
            function ($message) use ($email) {
                $message->to($email)
                    ->subject('Password Reset Request - EarlyPath')
                    ->from(config('mail.from.address', env('MAIL_FROM_ADDRESS')));
            }
        );

        Log::debug('Email sent successfully using Mail::raw fallback');
    }
}
