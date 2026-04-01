<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vacancy;
use App\Models\Position;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the logged in company.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = $user->id_company;

        if (!$companyId) {
            return response()->json([
                'active_programs' => 0,
                'active_vacancies' => 0,
                'total_applicants' => 0,
                'pending_review' => 0,
                'recent_applicants' => [],
            ]);
        }

        $vacanciesQuery = Vacancy::where('status', 'published')->where('id_company', $companyId);
        
        // Program Aktif = Total POSISI yang dibuka
        $positionsCount = $vacanciesQuery->clone()
            ->withCount('positions')
            ->get()
            ->sum('positions_count');

        // Lowongan Aktif = Total VACANCIES yang dipublish
        $vacanciesCount = $vacanciesQuery->clone()->count();

        // Submissions Query
        $submissionsQuery = \App\Models\Submission::whereHas('vacancy', function ($q) use ($companyId) {
            $q->where('id_company', $companyId);
        });

        $totalApplicants = $submissionsQuery->clone()->count();
        $pendingReview = $submissionsQuery->clone()->where('status', 'pending')->count();
        
        $recentApplicants = $submissionsQuery->clone()
            ->with(['user', 'position', 'vacancy'])
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'active_programs' => $positionsCount, 
            'active_vacancies' => $vacanciesCount,
            'total_applicants' => $totalApplicants,
            'pending_review' => $pendingReview,
            'recent_applicants' => $recentApplicants,
        ]);
    }
}
