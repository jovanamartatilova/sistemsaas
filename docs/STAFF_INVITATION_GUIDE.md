# Staff Invitation & Account Activation Guide

## Overview
This system allows company admins to invite staff members to join their team by generating activation tokens and sending them via email. Staff members receive an email with an activation link and can set up their account by providing their password.

## Feature Flow

### 1. Admin Invites Staff Member
**Location:** Admin Dashboard → User Management → Internal Team → "+ Invite Team Member" button

**Steps:**
1. Click the "+ Invite Team Member" button
2. Fill in the form:
   - **Full Name** - Staff member's name
   - **Email Address** - Valid email where invitation will be sent
   - **Assign Role** - Select from: Staff, HR Specialist, Mentor, Administrator
3. Click "Send Invitation"

**What Happens:**
- User profile is created in the system with status "Invited"
- A unique activation token is generated (32 random characters)
- Activation email is sent to the provided email address
- Modal shows success confirmation with email preview
- User appears in the "Pending Invitations" count with "Invited" status

### 2. Staff Receives Email
**Email Content:**
- Personalized greeting
- Company/team name and role assignment
- Activation link pointing to: `{FRONTEND_URL}/activate?token={activation_token}`
- Note about 24-hour link expiration
- Team signature

**Example Email Link:**
```
http://localhost:5173/activate?token=abc123def456...
```

### 3. Staff Clicks Activation Link
**Location:** Email → Click the activation link

**What Happens:**
1. Browser navigates to `/activate?token={token}`
2. Frontend validates the token via API
3. ActivateAccount page loads with:
   - Staff member's name (pre-filled)
   - Password input field
   - Password confirmation field
   - Password strength indicator

### 4. Staff Sets Up Account
**Steps:**
1. Review pre-filled name (can edit if needed)
2. Enter password (minimum 8 characters)
3. Confirm password
4. View password strength indicator:
   - Weak (red) - Less than 3 criteria met
   - Fair (orange) - 2 criteria met
   - Good (yellow) - 3 criteria met
   - Strong (green) - 4+ criteria met
5. Click "Activate Account & Sign In"

**Password Criteria:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### 5. Account Activated
**What Happens:**
1. Authentication token is generated
2. User is logged into their account
3. User is redirected to dashboard
4. Status changes from "Invited" to "Active"
5. User can now use their email + password to login

## Admin Dashboard View

### User List Display
Each invited/active staff member shows:
- **Name & Avatar** - Staff member's name with initials
- **Email** - Contact email
- **Role** - Admin, HR Specialist, Mentor, or Staff
- **Status Badge**:
  - 🟡 "Invited" (orange) - Awaiting account activation
  - 🟢 "Active" (green) - Account activated and in use
- **Actions** - Delete button (trash icon)

### Summary Stats
Shows at top of page:
- **Total Team Members** - Active staff count
- **Total Candidates** - Candidate count
- **Pending Invitations** - Staff awaiting activation

## Email Configuration

### Environment Variables
To enable email sending, configure these in your `.env` file:

```env
FRONTEND_URL=http://localhost:5173
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@domain.com
MAIL_FROM_NAME="EarlyPath"
```

### Default Configuration
- **Default:** Log driver (emails logged to storage/logs)
- **For Production:** Configure SMTP settings as above

### Common Issues
If email not sending:
1. Check MAIL_MAILER in `.env` is set to 'smtp' or 'log'
2. Verify SMTP credentials are correct
3. Check Laravel logs: `tail -f storage/logs/laravel.log`
4. Check if email server allows connections on specified port

## Technical Details

### Database Fields (users table)
- `activation_token` - 64-character random string
- `is_active` - Boolean (false until activated)
- Other fields: id_user, id_company, name, email, role, password

### API Endpoints

#### Invite User
```
POST /api/company-users
Authorization: Bearer {company_token}

{
  "name": "John Doe",
  "email": "john@company.com",
  "role": "staff"
}

Response: {
  "message": "User successfully invited and activation email sent",
  "user": { ... },
  "email_sent": true
}
```

#### Check Activation Token
```
GET /api/auth/check-activation-token/{token}

Response: {
  "user": {
    "name": "John Doe",
    "email": "john@company.com",
    "role": "staff"
  },
  "company": { ... }
}
```

#### Activate Account
```
POST /api/auth/activate-account
{
  "token": "abc123...",
  "name": "John Doe",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}

Response: {
  "message": "Account successfully activated",
  "user": { ... },
  "company": { ... },
  "token": "auth_token_jwt"
}
```

## Frontend Pages

### UserManagement.jsx
- Main admin page for managing company users
- Displays team members and candidates in separate tabs
- "Invite Team Member" modal with form
- Loading states and error handling
- Success confirmation

### ActivateAccount.jsx
- Standalone page for staff to set up their account
- Token validation on page load
- Pre-fills name from invitation
- Password strength meter
- Auto-login on activation

## Troubleshooting

### "Activation email send failed" (but user still created)
- User is created successfully
- Email sending failed (check server logs)
- Admin can manually get activation link from database
- Or ask user to check spam folder

### Email not received
1. Check if email was sent to spam/junk folder
2. Verify email address in invitation was correct
3. Check Laravel logs for send errors
4. Verify SMTP configuration

### "Token nicht valid oder akun sudah aktif"
- Token has already been used
- Account is already active
- Token has expired (24+ hours old)
- Solution: Admin invites staff member again

### Password too weak
- Must be minimum 8 characters
- Add uppercase, numbers, special characters
- Use password manager for strong passwords

## Security Notes

1. **Token Security**
   - 32-character random tokens (192 bits entropy)
   - Tokens stored as-is in database (consider hashing in future)
   - Single-use (cleared after activation)

2. **Email Delivery**
   - Invitation sent automatically
   - Email failures don't block account creation
   - Consider implementing email resend functionality

3. **Password**
   - Must be 8+ characters
   - No password during account creation (safer than pre-set)
   - Staff sets their own secure password

4. **Account Status**
   - `is_active` flag prevents login before activation
   - Only users with valid token can activate

## Future Enhancements

1. Email resend functionality for staff who didn't receive it
2. Token expiration time tracking
3. Resend activation email from admin dashboard
4. Bulk invite multiple staff members
5. Invite link QR code
6. Welcome email after activation
7. Account activation reminders (1, 3, 7 days)
