# Forgot Password Email - Complete Fix & Testing Guide

## ✅ Issues Fixed

### 1. MAIL_SCHEME was 'tls' (Invalid)
- **Problem**: Laravel SMTP only accepts `'smtp'` or `'smtps'` schemes, not `'tls'`
- **Solution**: Changed to `scheme: 'smtp'` for port 587 with STARTTLS
- **Why It Matters**: Invalid scheme caused the transport layer to reject the connection silently

### 2. Silent Error Handling
- **Problem**: Mail errors were caught and logged, but API always returned 200 OK
- **Solution**: Created `PasswordResetService` with comprehensive logging and error propagation
- **Why It Matters**: Frontend never knew if email failed to send

### 3. Windows SMTP Stream Context
- **Problem**: Windows PHP SMTP needs explicit SSL stream context configuration
- **Solution**: Added `stream` context with peer verification disabled (for development)
- **Why It Matters**: Windows SMTP connections were timing out or failing silently

## Configuration Changes

### .env
```env
# BEFORE (BROKEN)
MAIL_SCHEME=tls          # ❌ Invalid scheme
MAIL_ENCRYPTION=smtps    # ❌ Wrong for port 587

# AFTER (FIXED)
MAIL_SCHEME=smtp         # ✅ Correct for STARTTLS
MAIL_ENCRYPTION=tls      # ✅ Correct for port 587
```

### config/mail.php
```php
'smtp' => [
    'scheme' => env('MAIL_SCHEME', 'smtp'),  // ✅ Default to 'smtp'
    'port' => env('MAIL_PORT', 587),         // ✅ Port 587 for STARTTLS
    'timeout' => 30,                          // ✅ Explicit timeout
    'stream' => [
        'ssl' => [
            'verify_peer' => false,           // ✅ Windows compatibility
            'verify_peer_name' => false,
            'allow_self_signed' => true,
        ],
    ],
],
```

### config/app.php
```php
'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
```

## New Files Created

### 1. `app/Services/PasswordResetService.php`
- Centralized password reset email sending logic
- Comprehensive debug logging at each step
- Automatic fallback from Mailable to Mail::raw()
- Proper exception handling (Throwable, not just Exception)

### 2. `app/Mail/PasswordResetMail.php`
- Professional Mailable class for better control
- Proper envelope, content, and error handling

### 3. `resources/views/emails/password-reset.blade.php`
- HTML email template using Laravel mail components
- Professional styling and formatting

## Modified Files

### AuthController.php
All three forgot password methods refactored to use `PasswordResetService`:
- `forgotPassword()`
- `forgotPasswordCandidate()`
- `forgotPasswordStaff()`

Benefits:
- DRY principle (no code duplication)
- Consistent error handling
- Cleaner, more maintainable code

## How to Test

### Option 1: Using Tinker (Instant Testing)
```bash
cd backend
php artisan tinker

# Inside tinker:
include('test-complete-reset-flow.php');
```

### Option 2: From Frontend
1. Go to `http://localhost:5173`
2. Click "Forgot Password"
3. Enter your email address
4. Check your inbox for the reset email
5. Click the reset link
6. Reset your password

### Option 3: Using cURL
```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com"}'
```

Expected response (200 OK):
```json
{
  "message": "If an account exists with that email, you will receive a password reset link."
}
```

### Option 4: Using Postman
1. Create POST request to `http://localhost:8000/api/auth/forgot-password`
2. Set Content-Type to `application/json`
3. Body:
```json
{
  "email": "your-email@gmail.com"
}
```

## Verify Logs

Check `storage/logs/laravel.log` for these messages:

```log
[2026-06-04 09:16:47] local.DEBUG: Password reset requested for email: your-email@gmail.com
[2026-06-04 09:16:47] local.DEBUG: Generated reset token for your-email@gmail.com: ...
[2026-06-04 09:16:47] local.DEBUG: Inserted reset token into database for your-email@gmail.com
[2026-06-04 09:16:47] local.DEBUG: Reset URL: http://localhost:5173/reset-password?token=...
[2026-06-04 09:16:52] local.INFO: Password reset email sent successfully to: your-email@gmail.com
```

## Production Deployment

### For DigitalOcean / Production

Update your DigitalOcean environment variables (or .env on server):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SCHEME=smtp
MAIL_ENCRYPTION=tls
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM_ADDRESS=your-gmail@gmail.com
MAIL_FROM_NAME=EarlyPath

FRONTEND_URL=https://yourdomain.com  # Update to your domain
```

### For Production Email

The stream context settings in `config/mail.php` should be adjusted for production:

```php
// PRODUCTION: Enable peer verification
'stream' => [
    'ssl' => [
        'verify_peer' => true,              // ✅ Enable for production
        'verify_peer_name' => true,
        'allow_self_signed' => false,
    ],
],
```

Or use environment-specific config:

```php
'stream' => [
    'ssl' => [
        'verify_peer' => env('APP_ENV') === 'production',
        'verify_peer_name' => env('APP_ENV') === 'production',
        'allow_self_signed' => env('APP_ENV') !== 'production',
    ],
],
```

## Troubleshooting

### Email Still Not Sending?

1. **Check mail configuration:**
   ```bash
   php artisan tinker
   dd(config('mail.mailers.smtp'));
   ```

2. **Test SMTP connection:**
   ```bash
   php artisan tinker
   include('test-mail-config.php');
   ```

3. **Check logs:**
   ```bash
   tail -100 storage/logs/laravel.log | grep -i "password reset\|failed\|error"
   ```

4. **Verify Gmail app password:**
   - Go to https://myaccount.google.com/apppasswords
   - Use the 16-character password, not your regular Gmail password
   - Password should be without spaces

5. **Check QUEUE_CONNECTION:**
   ```
   QUEUE_CONNECTION=sync  # Must be sync for immediate delivery
   ```

### Email Bounced / Rejected?

1. **FROM address mismatch:**
   - Ensure `MAIL_FROM_ADDRESS` matches `MAIL_USERNAME` (both should be your Gmail)

2. **SPF/DKIM/DMARC failures:**
   - This is normal for local development
   - Production should have proper DNS records

3. **Gmail security:**
   - Enable "Less secure app access" OR
   - Use App Password (recommended)

## Success Indicators

✅ **Email Successfully Sent When:**
- Password reset response returns 200 OK
- Email arrives in inbox within seconds
- Log shows "Password reset email sent successfully"
- Token appears in `password_resets` table
- Reset link works and allows password change

❌ **Something's Wrong If:**
- No email received after 5 minutes
- Log shows error with SMTP connection
- Log shows "scheme not supported"
- Response returns 500 error

## Summary of All Changes

| File | Change |
|------|--------|
| `.env` | Updated MAIL_SCHEME and MAIL_ENCRYPTION |
| `config/mail.php` | Added stream context, fixed scheme default, set timeout |
| `config/app.php` | Added frontend_url configuration |
| `app/Services/PasswordResetService.php` | **NEW** - Centralized reset logic |
| `app/Mail/PasswordResetMail.php` | **NEW** - Mailable class |
| `resources/views/emails/password-reset.blade.php` | **NEW** - Email template |
| `app/Http/Controllers/AuthController.php` | Refactored 3 forgot password methods |

## Need Help?

Check these in order:
1. Verify `.env` has correct MAIL_* settings
2. Run `test-mail-config.php` to verify configuration
3. Run `test-complete-reset-flow.php` to test end-to-end
4. Check `storage/logs/laravel.log` for detailed error messages
5. Verify Gmail App Password is correct (16 characters, no spaces)
