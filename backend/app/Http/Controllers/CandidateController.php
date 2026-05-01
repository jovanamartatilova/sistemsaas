<?php

namespace App\Http\Controllers;

use App\Models\Apprentice;
use App\Models\Candidate;
use App\Models\Company;
use App\Models\Interview;
use App\Models\Major;
use App\Models\Submission;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CandidateController extends Controller
{
    // ═══════════════════════════════════════════════════
    // DASHBOARD — satu endpoint untuk semua section
    // GET /candidate/dashboard
    // ═══════════════════════════════════════════════════
    public function dashboard(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                \Log::warning('Dashboard: No authenticated user found');
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            try {
                $user->load(['company']);
            } catch (\Exception $e) {
                \Log::warning('Could not load relationships: ' . $e->getMessage());
            }

            // Load candidate profile for photo and other fields
            $candidate = Candidate::where('id_user', $user->id_user)->first();

            $submission = null;
            if (isset($user->id_user)) {
                $submission = Submission::where('id_user', $user->id_user)
                    ->whereIn('status', ['pending', 'accepted'])
                    ->with(['vacancy', 'position.competencies', 'mentor', 'interviews'])
                    ->latest('submitted_at')
                    ->first();
            }

            $apprentice = null;
            if ($submission && isset($submission->id_submission)) {
                $apprentice = Apprentice::where('id_submission', $submission->id_submission)->first();
            }

            $skills = [];

            $competencies = [];
            if ($submission && $submission->position && method_exists($submission->position, 'competencies')) {
                try {
                    $competencies = $submission->position->competencies->map(fn($c) => [
                        'id_competency' => $c->id_competency,
                        'name' => $c->name,
                        'learning_hours' => $c->learning_hours,
                        'description' => $c->description,
                    ])->toArray();
                } catch (\Exception $e) {
                    \Log::warning('Error fetching competencies: ' . $e->getMessage());
                    $competencies = [];
                }
            }

            $overallProgress = 0;

            // Prefer candidate photo if available
            $photoPath = $candidate && $candidate->photo_path ? $candidate->photo_path : ($user->photo_path ?? null);

            return response()->json([
                'success' => true,
                'data' => [
                    'profile' => [
                        'id_user' => $user->id_user ?? null,
                        'name' => $user->name ?? 'User',
                        'email' => $user->email ?? '',
                        'phone' => $user->phone ?? '',
                        'photo_url' => $photoPath
                            ? asset('storage/' . $photoPath)
                            : null,
                        'photo_path' => $photoPath,
                        'university' => '-',
                        'major' => '-',
                        'overall_progress' => $overallProgress,
                        'scoped_role' => $user->getScopedRoleAttribute(),
                        'is_leader' => \App\Models\TeamMember::where('id_user', $user->id_user)
                            ->where('role', 'leader')
                            ->exists(),
                    ],
                    'apprentice' => ($apprentice || $submission) ? [
                        'id_apprentice' => $apprentice->id_apprentice ?? null,
                        'position' => $submission?->position?->name ?? '-',
                        'company' => $submission?->vacancy?->company_name ?? '-',
                        'start_date' => $apprentice->start_date ?? null,
                        'end_date' => $apprentice->end_date ?? null,
                        'batch' => $submission?->vacancy?->batch ?? '-',
                        'status' => $submission?->status ?? ($apprentice->status ?? 'inactive'),
                        'mentor_name' => $submission?->mentor?->name ?? null,
                    ] : null,
                    'vacancy' => $submission ? [
                        'id_vacancy' => $submission->vacancy?->id_vacancy ?? null,
                        'type' => $submission->vacancy?->type ?? '-',
                        'location' => $submission->vacancy?->location ?? '-',
                        'start_date' => $submission->vacancy?->start_date ?? null,
                        'end_date' => $submission->vacancy?->end_date ?? null,
                    ] : null,
                    'interviews' => $submission && $submission->interviews ? $submission->interviews->map(fn($interview) => [
                        'id_interview' => $interview->id_interview,
                        'interview_date' => $interview->interview_date,
                        'interview_time' => $interview->interview_time,
                        'link' => $interview->link,
                        'status' => $interview->result ?? 'pending',
                    ])->toArray() : [],
                    'learning_progress' => [
                        'total_learning_hours' => 240,
                        'target_learning_hours' => 320,
                        'completed_modules' => 18,
                        'total_modules' => 24,
                        'submitted_assignments' => 34,
                        'total_assignments' => 40,
                        'attendance_percentage' => 92,
                    ],
                    'competencies' => $competencies,
                    'skills' => is_array($skills) ? $skills : (is_object($skills) ? $skills->toArray() : []),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Error loading dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════
    // PROFILE
    // ═══════════════════════════════════════════════════

    /** GET /candidate/profile */
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();

            // prefer candidate table fields when available
            $candidate = Candidate::where('id_user', $user->id_user)->first();

            // eager load submissions and team only
            try {
                $user->load(['submissions.vacancy', 'team']);
            } catch (\Exception $e) {
                \Log::warning('Could not eager load submissions/team: ' . $e->getMessage());
            }

            // Check if user has any submissions
            $hasSubmissions = $user->submissions->count() > 0;
            $company = null;

            if ($hasSubmissions && $user->id_company) {
                $company = Company::find($user->id_company);
            }

            $submissions = $user->submissions->map(fn($s) => [
                'id_submission' => $s->id_submission,
                'vacancy' => $s->vacancy?->description,
                'status' => $s->status,
                'submitted_at' => $s->submitted_at,
                'cv_url' => ($s->cv_file ? asset('storage/' . $s->cv_file) : null),
                'portfolio_url' => ($s->portfolio_file ? asset('storage/' . $s->portfolio_file) : null),
            ])->toArray();

            // derive profile fields preferring candidate record
            $phone = $candidate && $candidate->phone ? $candidate->phone : ($user->phone ?? null);
            $photoPath = $candidate && $candidate->photo_path ? $candidate->photo_path : ($user->photo_path ?? null);
            $universityName = $candidate && $candidate->institution ? $candidate->institution : ($user->university?->name ?? null);
            $majorName = $candidate && $candidate->major ? $candidate->major : ($user->major?->name ?? null);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $phone,
                    'photo_url' => $photoPath ? asset('storage/' . $photoPath) : null,
                    'university' => $universityName,
                    'major' => $majorName,
                    'team' => $user->team?->name,
                    'scoped_role' => $user->getScopedRoleAttribute(),
                    'is_leader' => \App\Models\TeamMember::where('id_user', $user->id_user)
                        ->where('role', 'leader')
                        ->exists(),
                    'company' => $company ? [
                        'id_company' => $company->id_company,
                        'name' => $company->name,
                    ] : null,
                    'has_submissions' => $hasSubmissions,
                    'submissions' => $submissions,
                    'bank_name' => $candidate->bank_name ?? null,
                    'bank_account_number' => $candidate->bank_account_number ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('getProfile error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** PUT /candidate/profile */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:50',
            'phone' => 'sometimes|string|max:13',
            'university_name' => 'sometimes|string|max:100',
            'major_name' => 'sometimes|string|max:100',
            'bank_name' => 'sometimes|string|max:50',
            'bank_account_number' => 'sometimes|string|max:50',
        ]);

        try {
            $user = $request->user();
            $candidate = Candidate::where('id_user', $user->id_user)->first();

            // Update user name if provided
            if ($request->filled('name')) {
                $user->name = $request->name;
                $user->save();
            }

            // Update candidate fields (phone, institution, major, photo)
            if ($candidate) {
                if ($request->filled('phone')) {
                    $candidate->phone = $request->phone;
                }
                if ($request->filled('university_name')) {
                    $candidate->institution = $request->university_name;
                }
                if ($request->filled('major_name')) {
                    $candidate->major = $request->major_name;
                }
                if ($request->has('bank_name')) {
                    $candidate->bank_name = $request->bank_name;
                }
                if ($request->has('bank_account_number')) {
                    $candidate->bank_account_number = $request->bank_account_number;
                }
                $candidate->save();
            }

            // Reload and return updated profile
            $candidate = Candidate::where('id_user', $user->id_user)->first();
            $user->refresh();

            $phone = $candidate && $candidate->phone ? $candidate->phone : ($user->phone ?? null);
            $photoPath = $candidate && $candidate->photo_path ? $candidate->photo_path : ($user->photo_path ?? null);
            $universityName = $candidate && $candidate->institution ? $candidate->institution : null;
            $majorName = $candidate && $candidate->major ? $candidate->major : null;

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id_user' => $user->id_user,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $phone,
                    'photo_url' => $photoPath ? asset('storage/' . $photoPath) : null,
                    'university' => $universityName,
                    'major' => $majorName,
                    'bank_name' => $candidate->bank_name ?? null,
                    'bank_account_number' => $candidate->bank_account_number ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('updateProfile error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** POST /candidate/profile/photo */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        try {
            $user = $request->user();
            $candidate = Candidate::where('id_user', $user->id_user)->first();

            if (!$candidate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Candidate profile not found',
                ], 404);
            }

            $path = $request->file('photo')->store('candidates/photos', 'public');
            $candidate->photo_path = $path;
            $candidate->save();

            return response()->json([
                'success' => true,
                'message' => 'Foto profil berhasil diupload',
                'photo_url' => asset('storage/' . $path),
            ]);
        } catch (\Exception $e) {
            \Log::error('uploadPhoto error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload photo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════
    // SKILLS
    // ═══════════════════════════════════════════════════

    /** GET /candidate/skills */
    public function getSkills(Request $request)
    {
        $skills = CandidateSkill::where('id_user', $request->user()->id_user)->get();
        return response()->json(['success' => true, 'data' => $skills]);
    }

    /** POST /candidate/skills */
    public function addSkill(Request $request)
    {
        $request->validate([
            'skill_name' => 'required|string|max:100',
            'level' => 'required|in:beginner,intermediate,advanced',
        ]);

        $user = $request->user();

        $exists = CandidateSkill::where('id_user', $user->id_user)
            ->where('skill_name', $request->skill_name)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Skill ini sudah ada di profilemu',
            ], 422);
        }

        $skill = CandidateSkill::create([
            'id_skill' => 'SK' . strtoupper(Str::random(8)),
            'id_user' => $user->id_user,
            'skill_name' => $request->skill_name,
            'level' => $request->level,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil ditambahkan',
            'data' => $skill,
        ], 201);
    }

    /** DELETE /candidate/skills/{id_skill} */
    public function deleteSkill(Request $request, string $id_skill)
    {
        $skill = CandidateSkill::where('id_skill', $id_skill)
            ->where('id_user', $request->user()->id_user)
            ->first();

        if (!$skill) {
            return response()->json([
                'success' => false,
                'message' => 'Skill tidak ditemukan',
            ], 404);
        }

        $skill->delete();

        return response()->json(['success' => true, 'message' => 'Skill berhasil dihapus']);
    }

    // ═══════════════════════════════════════════════════
    // NEW ENDPOINTS FOR API
    // ═══════════════════════════════════════════════════

    /** GET /api/users/me */
    public function getMe(Request $request)
    {
        try {
            $user = $request->user();
            $candidate = Candidate::where('id_user', $user->id_user)->first();

            $phone = $candidate && $candidate->phone ? $candidate->phone : ($user->phone ?? '');
            $institution = $candidate && $candidate->institution ? $candidate->institution : '';
            $major = $candidate && $candidate->major ? $candidate->major : '';
            $photoPath = $candidate && $candidate->photo_path ? $candidate->photo_path : ($user->photo_path ?? null);

            return response()->json([
                'success' => true,
                'data' => [
                    'id_user' => $user->id_user,
                    'full_name' => $user->name,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $phone,
                    'university' => $institution,
                    'university_id' => '',
                    'major' => $major,
                    'major_id' => '',
                    'profile_picture' => $photoPath ? asset('storage/' . $photoPath) : null,
                    'role' => $user->role ?? 'Apprentice',
                    'scoped_role' => $user->getScopedRoleAttribute(),
                    'is_leader' => \App\Models\TeamMember::where('id_user', $user->id_user)
                        ->where('role', 'leader')
                        ->exists(),
                    'bank_name' => $candidate->bank_name ?? '',
                    'bank_account_number' => $candidate->bank_account_number ?? '',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('getMe error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load user data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** PUT /api/users/{id_user} */
    public function updateUser(Request $request, string $id_user)
    {
        try {
            $user = $request->user();

            if ($user->id_user !== $id_user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'full_name' => 'sometimes|string|max:100',
                'email' => 'sometimes|email|unique:users,email,' . $id_user . ',id_user',
                'phone_number' => 'sometimes|string|max:20',
                'university_name' => 'sometimes|string|max:100',
                'major_name' => 'sometimes|string|max:100',
                'bank_name' => 'sometimes|string|max:50',
                'bank_account_number' => 'sometimes|string|max:50',
            ]);

            // Update user fields (name, email)
            $updateData = [];
            if (isset($validated['full_name'])) {
                $updateData['name'] = $validated['full_name'];
            }
            if (isset($validated['email'])) {
                $updateData['email'] = $validated['email'];
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            // Update candidate fields (phone, university/institution, major)
            $candidate = Candidate::where('id_user', $user->id_user)->first();
            if ($candidate) {
                if (isset($validated['phone_number'])) {
                    $candidate->phone = $validated['phone_number'];
                }
                if (!empty($validated['university_name'])) {
                    $candidate->institution = $validated['university_name'];
                }
                if (!empty($validated['major_name'])) {
                    $candidate->major = $validated['major_name'];
                }
                if (isset($validated['bank_name'])) {
                    $candidate->bank_name = $validated['bank_name'];
                }
                if (isset($validated['bank_account_number'])) {
                    $candidate->bank_account_number = $validated['bank_account_number'];
                }
                $candidate->save();
            }

            $user->refresh();
            $candidate = Candidate::where('id_user', $user->id_user)->first();

            $phone = $candidate && $candidate->phone ? $candidate->phone : ($user->phone ?? '');
            $institution = $candidate && $candidate->institution ? $candidate->institution : '';
            $major = $candidate && $candidate->major ? $candidate->major : '';
            $photoPath = $candidate && $candidate->photo_path ? $candidate->photo_path : ($user->photo_path ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => [
                    'id_user' => $user->id_user,
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $phone,
                    'university' => $institution,
                    'university_id' => '',
                    'major' => $major,
                    'major_id' => '',
                    'bank_name' => $candidate->bank_name ?? '',
                    'bank_account_number' => $candidate->bank_account_number ?? '',
                    'profile_picture' => $photoPath ? asset('storage/' . $photoPath) : null,
                    'role' => $user->role ?? 'Apprentice',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('updateUser error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /** POST /api/users/{id_user}/upload-avatar */
    public function uploadAvatar(Request $request, string $id_user)
    {
        try {
            $user = $request->user();

            if ($user->id_user !== $id_user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $request->validate(['avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048']);

            $candidate = Candidate::where('id_user', $user->id_user)->first();

            if (!$candidate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Candidate profile not found',
                ], 404);
            }

            // Delete old avatar if exists
            if ($candidate->photo_path) {
                \Storage::disk('public')->delete($candidate->photo_path);
            }

            $path = $request->file('avatar')->store('candidates/avatars', 'public');
            $candidate->photo_path = $path;
            $candidate->save();

            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'profile_picture' => asset('storage/' . $path),
            ]);
        } catch (\Exception $e) {
            \Log::error('uploadAvatar error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPositions(Request $request)
    {
        $user = $request->user();

        // Get all submissions for the candidate
        $submissions = Submission::where('id_user', $user->id_user)
            ->with(['position.competencies', 'vacancy', 'loa'])
            ->latest('submitted_at')
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No active submissions found',
                'data' => []
            ]);
        }

        $data = $submissions->map(function ($submission) {
            $position = $submission->position;
            $vacancy = $submission->vacancy;

            $competencies = [];
            if ($position) {
                $competencies = $position->competencies->map(fn($c) => [
                    'id_competency' => $c->id_competency,
                    'name' => $c->name,
                    'description' => $c->description,
                    'learning_hours' => $c->learning_hours,
                ])->toArray();
            }

            // Calculate total learning hours dynamically
            $total_learning_hours = array_reduce($competencies, function($carry, $item) {
                return $carry + ($item['learning_hours'] ?? 0);
            }, 0);

            // Fetch team details if candidate applied as team
            $teamInfo = null;
            if ($submission->id_team) {
                $teamMember = \Illuminate\Support\Facades\DB::table('team_members')
                    ->where('id_team', $submission->id_team)
                    ->where('id_user', $submission->id_user)
                    ->first();

                $team = \App\Models\Team::where('id_team', $submission->id_team)->first();

                if ($team) {
                    $teamInfo = [
                        'name' => $team->name,
                        'code' => $team->team_code,
                        'role' => $teamMember ? ucfirst($teamMember->role) : 'Member'
                    ];
                }
            }

            return [
                'id_submission' => $submission->id_submission,
                'id_position' => $position->id_position ?? null,
                'name' => $position->name ?? ($vacancy->title ?? '-'),
                'description' => $vacancy->description ?? ($position->name ?? '-'),
                'company' => $vacancy->company_name ?? '-',
                'batch' => $vacancy->batch ?? 'Batch 1',
                'quota' => $position->quota ?? null,
                // Status mapping
                'status' => $submission->status, // "pending", "accepted", "rejected"

                // Active status specifically for UI active filters (accepted means active program in progress)
                // If the user wants pending programs in Active tab, we preserve it. If rejected, it becomes inactive.
                'is_active' => in_array($submission->status, ['pending', 'accepted']),

                // Only share hours and competencies if accepted
                'learning_hours' => $submission->status === 'accepted' ? $total_learning_hours : 0,
                'competencies' => $submission->status === 'accepted' ? $competencies : [],
                'completed_hours' => 0, // Mock for now until scoring API integrates

                // LoA Mapping
                'has_loa' => $submission->loa && $submission->loa->file_path ? true : false,
                'loa_file_url' => $submission->loa && $submission->loa->file_path ? asset('storage/' . $submission->loa->file_path) : null,

                // Team Mapping
                'team' => $teamInfo,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /** GET /api/certificates */
    public function getCertificates(Request $request)
    {
        $user = $request->user();

        // Get all submissions for this candidate
        $submissions = Submission::where('id_user', $user->id_user)
            ->with(['certificate', 'vacancy', 'position'])
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $data = $submissions->map(function ($sub) {
            $cert = $sub->certificate;

            // Certificate is visible only when it has been sent (is_sent=true)
            if ($cert && $cert->is_sent) {
                return [
                    'status'             => 'issued',
                    'id_certificate'     => $cert->id_certificate,
                    'certificate_number' => $cert->certificate_number,
                    'final_score'        => $cert->final_score,
                    'issued_date'        => $cert->issued_date,
                    'file_path'          => $cert->file_path ? asset('storage/' . $cert->file_path) : null,
                    'program'            => $sub->vacancy?->title ?? '-',
                    'position'           => $sub->position?->name ?? '-',
                ];
            }

            // On-going / not yet issued
            return [
                'status'    => 'on_going',
                'batch'     => $sub->vacancy?->batch ?? 'Batch 1',
                'company'   => $sub->vacancy?->company_name ?? '-',
                'progress'  => 60,
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['success' => true, 'message' => 'Logged out successfully']);
    }
}
