<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new student
     */
    public function registerStudent(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:50',
                'email' => 'required|string|email|max:50|unique:users',
                'password' => 'required|string|min:6|confirmed',
            ]);

            $user = User::create([
                'id_user' => $this->generateUserId(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'student',
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Student registered successfully',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Register a new company
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'email' => 'required|email|max:50|unique:companies',
            'address' => 'required|string|max:100',
            'password' => 'required|string|min:6|confirmed',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Auto-generate slug dari nama
        $slug = Str::slug($validated['name']);
        $original = $slug;
        $i = 1;
        while (Company::where('slug', $slug)->exists()) {
            $slug = $original . '-' . $i++;
        }

        // Generate id_company
        do {
            $id = 'CMP' . strtoupper(substr(uniqid(), -7));
        } while (Company::where('id_company', $id)->exists());

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        $company = Company::create([
            'id_company' => $id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'address' => $validated['address'],
            'slug' => $slug,
            'password' => Hash::make($validated['password']),
            'logo_path' => $logoPath,
        ]);

        $token = $company->createToken('company_token')->plainTextToken;

        return response()->json([
            'message' => 'Perusahaan berhasil terdaftar',
            'company' => $company,
            'token' => $token,
            'public_url' => '/c/' . $slug, // kirim ke frontend
        ], 201);
    }

    /**
     * Register a new candidate
     */
    public function registerCandidate(Request $request, $slug)
    {
        // Cari company berdasarkan slug
        $company = Company::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'last_name' => 'required|string|max:50',
            'email' => 'required|email|max:50|unique:users',
            'phone' => 'required|string|max:13',
            'password' => 'required|string|min:8|confirmed',
        ]);

        do {
            $id = 'USR' . strtoupper(substr(uniqid(), -7));
        } while (User::where('id_user', $id)->exists());

        $user = User::create([
            'id_user' => $id,
            'id_company' => $company->id_company, // ← link ke perusahaan
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'candidate',
        ]);

        $token = $user->createToken('candidate_token')->plainTextToken;

        return response()->json([
            'message' => 'Account successfully created',
            'user' => $user,
            'company' => $company,
            'token' => $token,
        ], 201);
    }

    /**
     * Login company and get token
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'password' => 'required|string',
            ]);

            $company = Company::where('name', $validated['name'])->first();

            if (!$company || !Hash::check($validated['password'], $company->password)) {
                return response()->json([
                    'message' => 'Name or password is incorrect',
                ], 401);
            }

            $token = $company->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'company' => $company,
                'token' => $token,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * login candidate and get token
     */

    public function loginCandidate(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'slug' => 'required|string',
            ]);

            // Pastiin kandidat login ke company yang bener
            $company = Company::where('slug', $validated['slug'])->firstOrFail();

            $user = User::where('email', $validated['email'])
                ->where('id_company', $company->id_company)
                ->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json(['message' => 'Email or password is incorrect'], 401);
            }

            $token = $user->createToken('candidate_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'company' => $company,
                'token' => $token,
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Perusahaan tidak ditemukan'], 404);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get current company profile
     */
    public function profile(Request $request)
    {
        try {
            $company = $request->user();

            if (!$company) {
                return response()->json([
                    'message' => 'Company not found',
                ], 404);
            }

            return response()->json([
                'message' => 'Profile retrieved successfully',
                'company' => $company,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login SuperAdmin with email and password
     */
    public function loginSuperAdmin(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])
                ->where('role', 'super_admin')
                ->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json(['message' => 'Email or password is incorrect'], 401);
            }

            $token = $user->createToken('superadmin_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logout successful',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Forgot password - send reset email
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
            ]);

            $company = Company::where('email', $validated['email'])->first();

            if (!$company) {
                return response()->json([
                    'message' => 'Email not found',
                ], 404);
            }

            // Generate reset token
            $resetToken = \Str::random(32);

            // Store reset token in database
            \DB::table('password_resets')->where('email', $validated['email'])->delete();
            \DB::table('password_resets')->insert([
                'email' => $validated['email'],
                'token' => $resetToken,
                'created_at' => now(),
            ]);

            // Create reset URL (frontend URL)
            $resetUrl = env('APP_URL', 'http://localhost:5173') . '/reset-password?token=' . $resetToken . '&email=' . urlencode($validated['email']);

            // Send email using Laravel's Mail facade
            try {
                \Mail::raw(
                    "Hello {$company->name},\n\n" .
                    "You are receiving this email because there was a request to reset the password for your account.\n\n" .
                    "Password reset link: {$resetUrl}\n\n" .
                    "This link will expire in 1 hour.\n\n" .
                    "If you did not request a password reset, please ignore this email.\n\n" .
                    "Regards,\nEarlyPath Team",
                    function ($message) use ($validated, $company) {
                        $message->to($validated['email'])
                            ->subject('Reset Password - EarlyPath');
                    }
                );
            } catch (\Exception $e) {
                \Log::warning('Email send failed: ' . $e->getMessage());
                // Continue anyway - show success to user
            }

            return response()->json([
                'message' => 'Password reset link has been sent to your email. Please check your email.',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset password with token
     */
    public function resetPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'email' => 'required|string|email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            // Check if reset token exists and is not expired (1 hour)
            $passwordReset = \DB::table('password_resets')
                ->where('email', $validated['email'])
                ->where('token', $validated['token'])
                ->first();

            if (!$passwordReset) {
                return response()->json([
                    'message' => 'Token is not valid or has expired',
                ], 400);
            }

            // Check if token is not older than 1 hour
            if (now()->diffInMinutes($passwordReset->created_at) > 60) {
                \DB::table('password_resets')->where('email', $validated['email'])->delete();
                return response()->json([
                    'message' => 'Token has expired. Please request a new password reset.',
                ], 400);
            }

            // Find company and update password
            $company = Company::where('email', $validated['email'])->first();

            if (!$company) {
                return response()->json([
                    'message' => 'Email not found',
                ], 404);
            }

            // Update password via raw query untuk memastikan hashing bekerja dengan baik
            \DB::table('companies')
                ->where('id_company', $company->id_company)
                ->update([
                    'password' => Hash::make($validated['password']),
                    'updated_at' => now(),
                ]);

            // Delete the used token
            \DB::table('password_resets')->where('email', $validated['email'])->delete();

            return response()->json([
                'message' => 'Password successfully changed',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Reset password error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * forgot password candidate - send reset email
     */
    public function forgotPasswordCandidate(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'slug' => 'required|string',
            ]);

            // Pastiin email kandidat milik company yang bener
            $company = Company::where('slug', $validated['slug'])->firstOrFail();
            $user = User::where('email', $validated['email'])
                ->where('id_company', $company->id_company)
                ->first();

            if (!$user) {
                return response()->json(['message' => 'Email not found'], 404);
            }

            $resetToken = \Str::random(32);

            \DB::table('password_resets')->where('email', $validated['email'])->delete();
            \DB::table('password_resets')->insert([
                'email' => $validated['email'],
                'token' => $resetToken,
                'created_at' => now(),
            ]);

            $resetUrl = env('FRONTEND_URL', 'http://localhost:5173')
                . '/c/' . $validated['slug']
                . '/reset-password?token=' . $resetToken
                . '&email=' . urlencode($validated['email']);

            try {
                \Mail::raw(
                    "Hello {$user->name},\n\n" .
                    "Password reset link: {$resetUrl}\n\n" .
                    "This link will expire in 1 hour.\n\n" .
                    "Regards,\nEarlyPath Team",
                    function ($message) use ($validated, $user) {
                        $message->to($validated['email'])
                            ->subject('Reset Password - EarlyPath');
                    }
                );
            } catch (\Exception $e) {
                \Log::warning('Email send failed: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Password reset link has been sent to your email.',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Perusahaan tidak ditemukan'], 404);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    public function resetPasswordCandidate(Request $request)
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'email' => 'required|string|email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $passwordReset = \DB::table('password_resets')
                ->where('email', $validated['email'])
                ->where('token', $validated['token'])
                ->first();

            if (!$passwordReset) {
                return response()->json(['message' => 'Token is not valid or has expired'], 400);
            }

            if (now()->diffInMinutes($passwordReset->created_at) > 60) {
                \DB::table('password_resets')->where('email', $validated['email'])->delete();
                return response()->json(['message' => 'Token has expired. Please request a new one.'], 400);
            }

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json(['message' => 'Email not found'], 404);
            }

            \DB::table('users')
                ->where('id_user', $user->id_user)
                ->update([
                    'password' => Hash::make($validated['password']),
                    'updated_at' => now(),
                ]);

            \DB::table('password_resets')->where('email', $validated['email'])->delete();

            return response()->json(['message' => 'Password successfully changed'], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate unique company ID
     */
    private function generateCompanyId()
    {
        do {
            $id_company = 'CMP' . strtoupper(substr(uniqid(), -7));
        } while (Company::where('id_company', $id_company)->exists());

        return $id_company;
    }

    /**
     * Generate unique user ID
     */
    private function generateUserId()
    {
        do {
            $id_user = 'USR' . strtoupper(substr(uniqid(), -7));
        } while (User::where('id_user', $id_user)->exists());

        return $id_user;
    }

    /**
     * Activate account HR/Mentor
     */
    public function activateAccount(Request $request)
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'name' => 'required|string|max:50',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::where('activation_token', $validated['token'])
                ->where('is_active', false)
                ->first();

            if (!$user) {
                return response()->json(['message' => 'Token tidak valid atau akun sudah aktif'], 400);
            }

            \DB::table('users')
                ->where('id_user', $user->id_user)
                ->update([
                    'name' => $validated['name'],
                    'password' => Hash::make($validated['password']),
                    'is_active' => true,
                    'activation_token' => null,
                    'updated_at' => now(),
                ]);

            $user->refresh();
            $company = Company::find($user->id_company);
            $token = $user->createToken('staff_token')->plainTextToken;


            return response()->json([
                'message' => 'Account successfully activated',
                'user' => $user,
                'company' => $company,
                'token' => $token,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred', 'error' => $e->getMessage()], 500);
        }
    }



    /**
     * Login HR/Mentor
     */
    public function loginStaff(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
                'slug' => 'required|string',
            ]);

            $company = Company::where('slug', $validated['slug'])->firstOrFail();

            $user = User::where('email', $validated['email'])
                ->where('id_company', $company->id_company)
                ->whereIn('role', ['hr', 'mentor'])
                ->where('is_active', true)
                ->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json(['message' => 'Email or password is incorrect'], 401);
            }

            $token = $user->createToken('staff_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'company' => $company,
                'token' => $token,
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Perusahaan tidak ditemukan'], 404);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Check activation token validity and return user + company info for pre-filling activation form
     */
    public function checkActivationToken($token)
    {
        $user = User::where('activation_token', $token)
            ->where('is_active', false)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Token tidak valid atau sudah digunakan'], 404);
        }

        $company = Company::find($user->id_company);

        return response()->json([
            'user' => ['name' => $user->name, 'email' => $user->email, 'role' => $user->role],
            'company' => $company,
        ], 200);
    }
}
