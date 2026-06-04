@component('mail::message')
# Password Reset Request

Hello {{ $userName }},

You have requested to reset your password for your EarlyPath account.

Click the button below to reset your password. This link will expire in 1 hour.

@component('mail::button', ['url' => $resetUrl])
Reset Password
@endcomponent

If you did not request a password reset, please ignore this email and take no action.

For security purposes, this link can only be used once. If you need to reset your password again, please request a new reset email.

---

**Account Email:** {{ $userEmail }}

Best regards,  
The EarlyPath Team
@endcomponent
