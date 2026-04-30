<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Major;
use App\Models\Position;
use App\Models\Submission;
use App\Models\Team;
use App\Models\University;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    public function apply(Request $request, $idCompany)
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
            'institution_letter_file' => 'nullable|file|mimes:pdf|max:2048',
            'portfolio_file' => 'nullable|file|mimes:pdf|max:2048',
            'motivation_message' => 'required|string',
            'linkedin_url' => 'nullable|url',
        ]);

        if ($request->apply_as === 'team') {
            $request->validate([
                'team_role' => 'required|in:leader,member',
                'team_name' => 'required_if:team_role,leader|string|nullable',
                'team_code' => 'required_if:team_role,member|string|nullable',
            ]);
        }

        $company = Company::where('id_company', $idCompany)->first();
        if (!$company) {
            return response()->json(['message' => 'Perusahaan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // ✅ Validate vacancy and position belong to the same company
        $vacancy = Vacancy::where('id_vacancy', $request->id_vacancy)
            ->where('id_company', $company->id_company)
            ->first();

        if (!$vacancy) {
            return response()->json(['message' => 'Posisi atau Lowongan tidak valid untuk perusahaan ini'], 404);
        }

        $position = Position::where('id_position', $request->id_position)
            ->where('id_company', $company->id_company)
            ->first();

        if (!$position) {
            return response()->json(['message' => 'Posisi tidak valid untuk perusahaan ini'], 404);
        }

        // ✅ Validate position is available for this vacancy
        $positionInVacancy = DB::table('vacancy_positions')
            ->where('id_vacancy', $request->id_vacancy)
            ->where('id_position', $request->id_position)
            ->exists();

        if (!$positionInVacancy) {
            return response()->json(['message' => 'Posisi tidak tersedia untuk lowongan ini'], 422);
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
                if ($request->team_role === 'leader') {
                    $teamId = 'T' . strtoupper(Str::random(9));
                    $team = Team::create([
                        'id_team' => $teamId,
                        'name' => $request->team_name,
                        'team_code' => strtoupper(Str::random(6))
                    ]);
                } else if ($request->team_role === 'member') {
                    $team = Team::where('team_code', $request->team_code)->first();
                    if (!$team) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => 'Team code not found. Please make sure the code entered is valid for this program.'], 404);
                    }
                    
                    // Verify that the team belongs to a submission for the exact same id_vacancy
                    $teamSubmission = Submission::where('id_team', $team->id_team)
                                    ->where('id_vacancy', $request->id_vacancy)
                                    ->first();
                    if (!$teamSubmission) {
                        DB::rollBack();
                        return response()->json(['success' => false, 'message' => 'Team code not found. Please make sure the code entered is valid for this program.'], 404);
                    }
                    
                    $teamId = $team->id_team;
                }

                // Track user role in team members table safely
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
            // ✅ Set the company from the vacancy being applied to
            $user->id_company = $company->id_company;
            if ($teamId) {
                $user->id_team = $teamId;
            }
            $user->save();

            // 5. Upload Files
            $cvPath = $request->file('cv_file')->store('submissions/cv', 'public');
            $coverLetterPath = $request->file('cover_letter_file')->store('submissions/cover_letters', 'public');
            $institutionLetterPath = $request->hasFile('institution_letter_file') 
                ? $request->file('institution_letter_file')->store('submissions/institution_letters', 'public') 
                : null;
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
