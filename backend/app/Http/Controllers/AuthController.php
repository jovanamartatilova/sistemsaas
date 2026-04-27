<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
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

            $company = Company::where('email', $user->email)->first();
            $userType = $company ? 'admin' : 'candidate';
            $isNewUser = !$company;

            $token = $user->createToken('auth_token')->plainTextToken;

            $response = [
                'message' => 'Login successful',
                'user' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'user_type' => $userType,
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

            // Generate slug dari nama company
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (Company::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

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
                    'slug' => $slug,
                    'email' => $user->email, // Pakai email user sebagai email company
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'password' => Hash::make($validated['password']),
                    'is_active' => true,
                ]);

                // Buat default roles untuk company ini
                $defaultRoles = ['admin', 'hr', 'mentor'];
                foreach ($defaultRoles as $roleName) {
                    \App\Models\Role::create([
                        'id_role' => 'ROL' . strtoupper(substr(uniqid(), -7)),
                        'id_company' => $company->id_company,
                        'name' => $roleName,
                    ]);
                }

                DB::commit();

                // Buat token khusus untuk company (opsional)
                $companyToken = $company->createToken('company_token')->plainTextToken;

                return response()->json([
                    'message' => 'Company created successfully',
                    'company' => $company,
                    'company_token' => $companyToken,
                    'public_url' => '/c/' . $slug,
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

            return response()->json([
                'message' => 'Candidate profile created successfully',
                'candidate_profile' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $validated['phone'] ?? null,
                    'institution' => $validated['institution'] ?? null,
                    'education_level' => $validated['education_level'] ?? null,
                    'major' => $validated['major'] ?? null,
                ],
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
                'slug' => 'nullable|string',
            ]);

            // Cari company
            $query = Company::where('email', $validated['email']);
            if (!empty($validated['slug'])) {
                $query->where('slug', $validated['slug']);
            }
            $company = $query->first();

            if (!$company || !Hash::check($validated['password'], $company->password)) {
                return response()->json(['message' => 'Email or password is incorrect'], 401);
            }

            // Cek apakah ada user yang terhubung sebagai admin company ini
            $companyAdmin = CompanyAdmin::where('id_company', $company->id_company)->first();
            
            $token = $company->createToken('company_token')->plainTextToken;

            $response = [
                'message' => 'Login successful',
                'company' => $company,
                'token' => $token,
            ];

            if ($companyAdmin) {
                $user = User::find($companyAdmin->id_user);
                if ($user) {
                    $response['admin_user'] = [
                        'id_user' => $user->id_user,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }
            }

            return response()->json($response, 200);

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
            $companyAdmin = CompanyAdmin::where('id_user', $user->id_user)->first();
            if ($companyAdmin) {
                $company = Company::find($companyAdmin->id_company);
                if ($company) {
                    $response['company'] = $company;
                    $response['user_type'] = 'admin';
                }
            }

            // Cek candidate profile
            $candidateProfile = CandidateProfile::where('id_user', $user->id_user)->first();
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
     * Helper: Get user type
     */
    private function getUserType($user)
    {
        $companyAdmin = CompanyAdmin::where('id_user', $user->id_user)->exists();
        if ($companyAdmin) return 'admin';
        
        $candidateProfile = CandidateProfile::where('id_user', $user->id_user)->exists();
        if ($candidateProfile) return 'candidate';
        
        return 'new';
    }
}