<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
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
            'cv_file' => 'required|file|mimes:pdf|max:2048',
            'cover_letter_file' => 'required|file|mimes:pdf|max:2048',
            'institution_letter_file' => 'nullable|file|mimes:pdf|max:2048',
            'portfolio_file' => 'nullable|file|mimes:pdf|max:2048',
            'motivation_message' => 'required|string',
            'linkedin_url' => 'nullable|url',
        ]);

        $company = Company::where('id_company', $idCompany)->first();
        if (!$company) {
            return response()->json(['message' => 'Perusahaan tidak ditemukan'], 404);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Validate vacancy and position belong to the same company
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

        // Validate position is available for this vacancy
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

            // 4. Update User Profile & Candidate Profile
            $user->name = $request->name;
            // Set the company from the vacancy being applied to
            $user->id_company = $company->id_company;

            $candidate = Candidate::firstOrNew(['id_user' => $user->id_user]);
            if (!$candidate->exists) {
                $candidate->id_candidate = 'CDT' . strtoupper(Str::random(7));
            }
            $candidate->phone = $candidate->phone ?? null;
            $candidate->institution = $request->university_name;
            $candidate->education_level = $candidate->education_level ?? null;
            $candidate->major = $request->major_name;
            $candidate->save();
          
            // 5. Upload Files
            $cvPath = $request->file('cv_file')->store('submissions/cv', 'public');
            $coverLetterPath = $request->file('cover_letter_file')->store('submissions/cover_letters', 'public');
            $institutionLetterPath = $request->hasFile('institution_letter_file') 
                ? $request->file('institution_letter_file')->store('submissions/institution_letters', 'public') 
                : '';
            $portfolioPath = $request->hasFile('portfolio_file')
                ? $request->file('portfolio_file')->store('submissions/portfolios', 'public')
                : null;

            // 6. Create Submission
            $submissionId = 'SUB' . strtoupper(Str::random(7));
            $submission = Submission::create([
                'id_submission' => $submissionId,
                'id_user' => $user->id_user,
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
