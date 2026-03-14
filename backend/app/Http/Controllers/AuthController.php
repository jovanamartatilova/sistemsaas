<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new company
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:50',
                'email' => 'required|string|email|max:50|unique:companies',
                'address' => 'required|string|max:100',
                'password' => 'required|string|min:6|confirmed',
                'phone' => 'nullable|string|max:13',
            ]);

            // Generate unique id_company
            $id_company = $this->generateCompanyId();

            $company = Company::create([
                'id_company' => $id_company,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'address' => $validated['address'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
            ]);

            $token = $company->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Company registered successfully',
                'company' => $company,
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
}
