<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Major;
use App\Models\Submission;
use App\Models\Team;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    public function apply(Request $request, $slug)
    {
        $request->validate([
            'id_vacancy' => 'required|string',
            'id_position' => 'required|string',
            'name' => 'required|string',
            'university_name' => 'required|string',
            'major_name' => 'required|string',
            'apply_as' => 'required|in:personal,team',
            'cv_file' => 'required|file|mimes:pdf|max:2048',
            'cover_letter_file' => 'required|file|mimes:pdf|max:2048',
            'institution_letter_file' => 'required|file|mimes:pdf|max:2048',
            'portfolio_file' => 'nullable|file|mimes:pdf|max:2048',
            'motivation_message' => 'required|string',
            'linkedin_url' => 'nullable|url',
        ]);

        if ($request->apply_as === 'team') {
            $request->validate([
                'team_name' => 'required|string',
                'team_role' => 'required|in:leader,member',
            ]);
        }

        $company = Company::where('slug', $slug)->first();
        if (!$company) {
            return response()->json(['message' => 'Perusahaan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            DB::beginTransaction();

            // 1. Process University
            $university = University::where('name', $request->university_name)->first();
            if (!$university) {
                $university = University::create([
                    'id_university' => 'U' . strtoupper(Str::random(9)),
                    'name' => $request->university_name
                ]);
            }

            // 2. Process Major
            $major = Major::where('name', $request->major_name)->first();
            if (!$major) {
                $major = Major::create([
                    'id_major' => 'M' . strtoupper(Str::random(9)),
                    'name' => $request->major_name
                ]);
            }

            // 3. Process Team
            $teamId = null;
            if ($request->apply_as === 'team') {
                $teamId = 'T' . strtoupper(Str::random(9));
                $team = Team::create([
                    'id_team' => $teamId,
                    'name' => $request->team_name,
                    'team_code' => strtoupper(Str::random(6))
                ]);
                DB::table('team_members')->insert([
                    'id_team' => $teamId,
                    'id_user' => $user->id_user,
                    'role' => $request->team_role,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // 4. Update User Profile
            $user->name = $request->name;
            $user->id_university = $university->id_university;
            $user->id_major = $major->id_major;
            if ($teamId) {
                $user->id_team = $teamId;
            }
            $user->save();

            // 5. Upload Files
            $cvPath = $request->file('cv_file')->store('submissions/cv', 'public');
            $coverLetterPath = $request->file('cover_letter_file')->store('submissions/cover_letters', 'public');
            $institutionLetterPath = $request->file('institution_letter_file')->store('submissions/institution_letters', 'public');
            $portfolioPath = $request->hasFile('portfolio_file') 
                ? $request->file('portfolio_file')->store('submissions/portfolios', 'public') 
                : null;

            // 6. Create Submission
            $submissionId = 'SUB' . strtoupper(Str::random(7));
            $submission = Submission::create([
                'id_submission' => $submissionId,
                'id_user' => $user->id_user,
                'id_team' => $teamId, // can be null
                'id_vacancy' => $request->id_vacancy,
                'id_position' => $request->id_position,
                'cv_file' => $cvPath,
                'cover_letter_file' => $coverLetterPath,
                'institution_letter_file' => $institutionLetterPath,
                'portfolio_file' => $portfolioPath,
                'linkedin_url' => $request->linkedin_url,
                'motivation_message' => $request->motivation_message,
                'status' => 'pending',
                'submitted_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil dikirim!',
                'submission' => $submission
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }
}
