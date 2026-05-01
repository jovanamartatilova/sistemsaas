<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * 1. REGISTER UNIFIED (dari Login.jsx)
     * User daftar dengan name, email, password
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'email' => 'required|email|max:100|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            do {
                $id = 'USR' . strtoupper(substr(uniqid(), -7));
            } while (User::where('id_user', $id)->exists());

            $user = User::create([
                'id_user' => $id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'is_active' => true,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'user' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'token' => $token,
                'has_company' => false, // Belum punya company
                'has_candidate_profile' => false, // Belum punya profile candidate
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Registration failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 2. LOGIN UNIFIED
     * Login pakai email & password, deteksi user_type setelah login
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            // Cek di users
            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json(['message' => 'Email or password is incorrect'], 401);
            }

            $company = $user->company ?: $user->employee?->company ?: Company::where('email', $user->email)->first();
            $role = strtolower((string) ($user->role ?? ''));

            if (!$role) {
                if ($company) {
                    $role = 'admin';
                } elseif ($user->candidate()->exists()) {
                    $role = 'candidate';
                } else {
                    $role = 'candidate';
                }
            }

            $redirectPath = match ($role) {
                'mentor' => '/mentor/dashboard',
                'hr' => '/hr/dashboard',
                'super_admin', 'superadmin' => '/superadmin/dashboard',
                'candidate' => '/candidate/dashboard',
                'staff', 'admin' => '/dashboard',
                default => '/dashboard',
            };

            $isNewUser = $role === 'candidate' && !$company && !$user->candidate()->exists();

            $token = $user->createToken('auth_token')->plainTextToken;

            $response = [
                'message' => 'Login successful',
                'user' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role,
                    'id_company' => $user->id_company,
                ],
                'role' => $role,
                'redirect_role' => $role,
                'redirect_path' => $redirectPath,
                'user_type' => $role,
                'is_new_user' => $isNewUser,
                'token' => $token,
            ];

            if ($company) {
                $response['company'] = $company;
            }

            return response()->json($response, 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 3. CREATE COMPANY (Admin memulai company)
     * User yang sudah login (dan belum punya company) bisa membuat company
     */
    public function createCompany(Request $request)
    {
        try {
            $user = $request->user();

            // Cek apakah user sudah punya company yang dia buat
            if (Company::where('email', $user->email)->exists()) {
                return response()->json(['message' => 'You already have a company'], 400);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:companies,name',
                'phone' => 'required|string|max:13',
                'address' => 'required|string|max:255',
                'password' => 'required|string|min:8', // Password khusus untuk login admin company
            ]);

            // Generate ID company
            do {
                $idCompany = 'CMP' . strtoupper(substr(uniqid(), -7));
            } while (Company::where('id_company', $idCompany)->exists());

            DB::beginTransaction();

            try {
                // Buat company
                $company = Company::create([
                    'id_company' => $idCompany,
                    'name' => $validated['name'],
                    'email' => $user->email, // Pakai email user sebagai email company
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'password' => Hash::make($validated['password']),
                    'is_active' => true,
                ]);

                $defaultRoles = ['admin', 'hr', 'mentor'];
                foreach ($defaultRoles as $roleName) {
                    \App\Models\Role::create([
                        'id_role' => 'ROL' . strtoupper(substr(uniqid(), -7)),
                        'id_company' => $company->id_company,
                        'name' => $roleName,
                    ]);
                }

                $nameParts = explode(' ', $user->name, 2);

                do {
                    $idEmployee = 'EMP' . strtoupper(substr(uniqid(), -7));
                } while (\App\Models\Employee::where('id_employee', $idEmployee)->exists());

                \App\Models\Employee::create([
                    'id_employee' => $idEmployee,
                    'id_user' => $user->id_user,
                    'id_company' => $company->id_company,
                    'first_name' => $nameParts[0],
                    'last_name' => $nameParts[1] ?? null,
                ]);

                $user->update(['role' => 'admin']);

                $user->id_company = $company->id_company;
                $user->save();

                DB::commit();

                // Buat token khusus untuk company (opsional)
                $companyToken = $company->createToken('company_token')->plainTextToken;

                return response()->json([
                    'message' => 'Company created successfully',
                    'company' => $company,
                    'company_token' => $companyToken,
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create company', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 4. CREATE CANDIDATE PROFILE (User memulai internship)
     * User yang sudah login (dan belum punya candidate profile) bisa buat profile candidate
     */
    public function createCandidateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'phone' => 'nullable|string|max:13',
                'institution' => 'nullable|string|max:100',
                'education_level' => 'nullable|string|max:50',
                'major' => 'nullable|string|max:100',
            ]);

            // Generate id_candidate
            do {
                $idCandidate = 'CDT' . strtoupper(substr(uniqid(), -7));
            } while (\App\Models\Candidate::where('id_candidate', $idCandidate)->exists());

            // Simpan ke tabel candidates
            $candidate = \App\Models\Candidate::create([
                'id_candidate' => $idCandidate,
                'id_user' => $user->id_user,
                'phone' => $validated['phone'] ?? null,
                'institution' => $validated['institution'] ?? null,
                'education_level' => $validated['education_level'] ?? null,
                'major' => $validated['major'] ?? null,
            ]);

            // Set role jadi candidate di tabel users
            $user->update(['role' => 'candidate']);

            return response()->json([
                'message' => 'Candidate profile created successfully',
                'candidate_profile' => $candidate,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create candidate profile', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 5. LOGIN AS COMPANY (Admin login ke dashboard company)
     * Login khusus untuk admin company (pakai email company dan password company)
     */
    public function loginCompany(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            // Cari company
            $company = Company::where('email', $validated['email'])->first();

            if (!$company || !Hash::check($validated['password'], $company->password)) {
                return response()->json(['message' => 'Email or password is incorrect'], 401);
            }

            $token = $company->createToken('company_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'company' => $company,
                'token' => $token,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 6. GET CURRENT USER PROFILE
     * Mengambil data user lengkap dengan company dan candidate profile
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();

            $response = [
                'user' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ];

            // Cek company admin
            $company = Company::where('email', $user->email)->first();
            if ($company) {
                $response['company'] = $company;
                $response['user_type'] = 'admin';
            }

            // Cek candidate profile
            $candidateProfile = Candidate::where('id_user', $user->id_user)->first();
            if ($candidateProfile) {
                $response['candidate_profile'] = $candidateProfile;
                $response['user_type'] = 'candidate';
            }

            // Jika belum punya apa-apa
            if (!isset($response['user_type'])) {
                $response['user_type'] = 'new';
            }

            return response()->json($response, 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to get profile', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 7. LOGOUT
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logout successful'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Logout failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 8. VALIDATE INVITATION CODE
     * GET /api/invitation-codes/validate/{code}
     */
    public function validateInvitationCode($code)
    {
        $invitation = \App\Models\InvitationCode::where('code', $code)
            ->where('is_active', true)
            ->with(['company', 'role'])
            ->first();

        if (!$invitation) {
            return response()->json(['message' => 'Kode undangan tidak valid atau sudah tidak aktif.'], 404);
        }

        return response()->json([
            'valid' => true,
            'redirect_role' => $invitation->role?->name,
            'invitation' => $invitation,
        ]);
    }

    /**
     * 9. ACTIVATE ACCOUNT VIA INVITATION CODE
     * POST /api/auth/activate
     */
    public function activateAccount(Request $request)
    {
        try {
            $validated = $request->validate([
                'invitation_code' => 'required|string',
                'first_name' => 'required|string|max:100',
                'last_name' => 'nullable|string|max:100',
                'email' => 'required|email|max:100|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $invitation = \App\Models\InvitationCode::where('code', $validated['invitation_code'])
                ->where('is_active', true)
                ->with('company')
                ->first();

            if (!$invitation) {
                return response()->json(['message' => 'Invalid or inactive invitation code.'], 422);
            }

            // Ambil role name dari tabel roles berdasarkan id_role di invitation
            $roleName = 'employee';
            if ($invitation->id_role) {
                $role = \App\Models\Role::find($invitation->id_role);
                if ($role)
                    $roleName = $role->name; // 'hr', 'mentor', 'admin', etc
            }

            DB::beginTransaction();
            try {
                do {
                    $idUser = 'USR' . strtoupper(substr(uniqid(), -7));
                } while (User::where('id_user', $idUser)->exists());

                $user = User::create([
                    'id_user' => $idUser,
                    'name' => trim($validated['first_name'] . ' ' . ($validated['last_name'] ?? '')),
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'id_company' => $invitation->id_company,
                    'role' => $roleName, // ← pakai nama role yang beneran
                    'is_active' => true,
                ]);

                do {
                    $idEmployee = 'EMP' . strtoupper(substr(uniqid(), -7));
                } while (\App\Models\Employee::where('id_employee', $idEmployee)->exists());

                \App\Models\Employee::create([
                    'id_employee' => $idEmployee,
                    'id_user' => $user->id_user,
                    'id_company' => $invitation->id_company,
                    'id_role' => $invitation->id_role, // ← relasi ke tabel roles
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'] ?? '',
                    'department' => $invitation->division,
                    'position' => $invitation->position,
                    'employee_status' => $invitation->employee_status,
                    'schedule' => $invitation->schedule,
                    'job_level' => $invitation->job_level,
                    'joined_at' => now(),
                ]);

                DB::commit();

                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'message' => 'Account activated successfully.',
                    'token' => $token,
                    'redirect_role' => $roleName,
                    'redirect_path' => $roleName === 'mentor'
                        ? '/mentor/dashboard'
                        : ($roleName === 'hr'
                            ? '/hr/dashboard'
                            : ($roleName === 'admin' || $roleName === 'super_admin' || $roleName === 'superadmin'
                                ? '/dashboard'
                                : '/candidate/dashboard')),
                    'user' => [
                        'id_user' => $user->id_user,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'id_company' => $user->id_company,
                    ],
                    'company' => $invitation->company,
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Activation failed.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * 10. LIST INVITATION CODES (HR/Admin)
     * GET /api/company/invitation-codes
     */
    public function listInvitationCodes(Request $request)
    {
        $user = $request->user();

        $codes = \App\Models\InvitationCode::where('id_company', $user->id_company)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($codes);
    }

    /**
     * 11. CREATE INVITATION CODE (HR/Admin)
     * POST /api/company/invitation-codes
     */
    public function createInvitationCode(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:100',
            'id_role' => 'required|string', // ← tambah ini
            'division' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'employee_status' => 'nullable|string|max:50',
            'schedule' => 'nullable|string|max:50',
            'job_level' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        do {
            $code = strtoupper(Str::random(8));
        } while (\App\Models\InvitationCode::where('code', $code)->exists());

        $invitation = \App\Models\InvitationCode::create([
            'id_company' => $user->id_company,
            'id_role' => $request->id_role, // ← tambah ini
            'code' => $code,
            'label' => $request->label,
            'division' => $request->division,
            'position' => $request->position,
            'employee_status' => $request->employee_status,
            'schedule' => $request->schedule,
            'job_level' => $request->job_level,
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Invitation code created.', 'invitation' => $invitation], 201);
    }

    /**
     * 12. TOGGLE INVITATION CODE ACTIVE/NONAKTIF
     * PATCH /api/company/invitation-codes/{id}/toggle
     */
    public function toggleInvitationCode($id)
    {
        $code = \App\Models\InvitationCode::findOrFail($id);
        $code->update(['is_active' => !$code->is_active]);

        return response()->json([
            'message' => 'Status updated.',
            'is_active' => $code->is_active,
        ]);
    }

    /**
     * 13. DELETE INVITATION CODE
     * DELETE /api/company/invitation-codes/{id}
     */
    public function deleteInvitationCode($id)
    {
        \App\Models\InvitationCode::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    public function companyRoles(Request $request)
    {
        $user = $request->user();
        $roles = \App\Models\Role::where('id_company', $user->id_company)->get();
        return response()->json($roles);
    }

    /**
     * Helper: Get user type
     */
    private function getUserType($user)
    {
        if (Company::where('email', $user->email)->exists())
            return 'admin';

        $candidateProfile = Candidate::where('id_user', $user->id_user)->exists();
        if ($candidateProfile)
            return 'candidate';

        return 'new';
    }
}