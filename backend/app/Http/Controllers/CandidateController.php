<?php

namespace App\Http\Controllers;

use App\Models\Apprentice;
use App\Models\Major;
use App\Models\Submission;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

            // Null check - must happen FIRST before any method calls
            if (!$user) {
                \Log::warning('Dashboard: No authenticated user found');
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            // Safe load relationships - only load what exists
            try {
                $user->load(['company']);
            } catch (\Exception $e) {
                \Log::warning('Could not load relationships: ' . $e->getMessage());
            }

            // Ambil submission aktif milik user ini (status 'pending' atau 'accepted')
            $submission = null;
            if (isset($user->id_user)) {
                $submission = Submission::where('id_user', $user->id_user)
                    ->whereIn('status', ['pending', 'accepted'])
                    ->with(['vacancy', 'position.competencies'])
                    ->latest('submitted_at')
                    ->first();
            }

            // Ambil apprentice dari submission tersebut
            $apprentice = null;
            if ($submission && isset($submission->id_submission)) {
                $apprentice = Apprentice::where('id_submission', $submission->id_submission)->first();
            }

            // Skills kandidat - dengan error handling
            $skills = [];
            // Note: CandidateSkill model doesn't exist yet, so return empty array
            // TODO: Implement CandidateSkill model when needed

            // Fetch competencies untuk position yang sesuai
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

            // Hitung overall progress (dummy untuk sementara)
            $overallProgress = 0;

            return response()->json([
                'success' => true,
                'data' => [

                    // ── Profile Header ──────────────────────────
                    'profile' => [
                        'id_user'          => $user->id_user ?? null,
                        'name'             => $user->name ?? 'User',
                        'email'            => $user->email ?? '',
                        'phone'            => $user->phone ?? '',
                        'photo_url'        => (isset($user->photo_path) && $user->photo_path)
                                                ? asset('storage/' . $user->photo_path)
                                                : null,
                        'university'       => '-',
                        'major'            => '-',
                        'overall_progress' => $overallProgress,
                    ],

                    // ── Apprentice Info ──────────────────────────
                    'apprentice' => $apprentice ? [
                        'id_apprentice' => $apprentice->id_apprentice ?? null,
                        'position'      => $submission?->position?->name ?? '-',
                        'company'       => $submission?->vacancy?->company_name ?? '-',
                        'start_date'    => $apprentice->start_date ?? null,
                        'end_date'      => $apprentice->end_date ?? null,
                        'batch'         => $submission?->vacancy?->batch ?? '-',
                        'status'        => $apprentice->status ?? 'inactive',
                    ] : null,

                    // ── Learning Progress ────────────────────────
                    'learning_progress' => [
                        'total_learning_hours'  => 240,
                        'target_learning_hours' => 320,
                        'completed_modules'     => 18,
                        'total_modules'         => 24,
                        'submitted_assignments' => 34,
                        'total_assignments'     => 40,
                        'attendance_percentage' => 92,
                    ],

                    // ── Competencies ────────────────────────────────
                    'competencies' => $competencies,

                    // ── Skill Tags ───────────────────────────────
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
        $user = $request->user()->load(['university', 'major', 'team', 'submissions.vacancy']);

        return response()->json([
            'success' => true,
            'data' => [
                'id_user'    => $user->id_user,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'photo_url'  => $user->photo_path
                                    ? asset('storage/' . $user->photo_path)
                                    : null,
                'university' => $user->university?->name,
                'major'      => $user->major?->name,
                'team'       => $user->team?->name,
                'submissions' => $user->submissions->map(fn($s) => [
                    'id_submission' => $s->id_submission,
                    'vacancy'       => $s->vacancy?->description,
                    'status'        => $s->status,
                    'submitted_at'  => $s->submitted_at,
                    'cv_url'        => asset('storage/' . $s->cv_file),
                    'portfolio_url' => $s->portfolio_file
                                          ? asset('storage/' . $s->portfolio_file)
                                          : null,
                ]),
            ],
        ]);
    }

    /** PUT /candidate/profile */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'            => 'sometimes|string|max:50',
            'phone'           => 'sometimes|string|max:13',
            'university_name' => 'sometimes|string|max:100',
            'major_name'      => 'sometimes|string|max:100',
        ]);

        $user = $request->user();

        if ($request->filled('university_name')) {
            $university = University::firstOrCreate(
                ['name' => $request->university_name],
                ['id_university' => 'U' . strtoupper(Str::random(9))]
            );
            $user->id_university = $university->id_university;
        }

        if ($request->filled('major_name')) {
            $major = Major::firstOrCreate(
                ['name' => $request->major_name],
                ['id_major' => 'M' . strtoupper(Str::random(9))]
            );
            $user->id_major = $major->id_major;
        }

        $user->fill($request->only(['name', 'phone']));
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui',
            'data'    => $user->fresh(['university', 'major']),
        ]);
    }

    /** POST /candidate/profile/photo */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = $request->user();
        $path = $request->file('photo')->store('candidates/photos', 'public');

        $user->photo_path = $path;
        $user->save();

        return response()->json([
            'success'   => true,
            'message'   => 'Foto profil berhasil diupload',
            'photo_url' => asset('storage/' . $path),
        ]);
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
            'level'      => 'required|in:beginner,intermediate,advanced',
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
            'id_skill'   => 'SK' . strtoupper(Str::random(8)),
            'id_user'    => $user->id_user,
            'skill_name' => $request->skill_name,
            'level'      => $request->level,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil ditambahkan',
            'data'    => $skill,
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
}
