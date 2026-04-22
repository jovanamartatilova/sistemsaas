<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vacancy;
use App\Models\Position;
use App\Models\Submission;
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

        $search = $request->get('search');

        $vacanciesQuery = Vacancy::where('status', 'published')->where('id_company', $companyId);
        
        // Program Aktif = Total POSISI yang dibuka
        $positionsCount = $vacanciesQuery->clone()
            ->withCount('positions')
            ->get()
            ->sum('positions_count');

        // Lowongan Aktif = Total VACANCIES yang dipublish
        $vacanciesCount = $vacanciesQuery->clone()->count();

        // Submissions Query untuk stats
        $statsSubmissionsQuery = Submission::whereHas('vacancy', function ($q) use ($companyId) {
            $q->where('id_company', $companyId);
        });

        $totalApplicants = $statsSubmissionsQuery->clone()->count();
        $pendingReview = $statsSubmissionsQuery->clone()->where('status', 'pending')->count();
        
        // Recent Applicants Query
        $recentQuery = Submission::whereHas('vacancy', function ($q) use ($companyId) {
            $q->where('id_company', $companyId);
        })->with(['user', 'position', 'vacancy']);
        
        if ($search) {
            $recentQuery->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $recentApplicants = $recentQuery->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        // 1. Status Distribution
        $statusDistribution = $submissionsQuery->clone()
            ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // 2. Monthly Stats (Last 6 Months)
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $mName = now()->subMonths($i)->format('M');
            $months[$mName] = ['applied' => 0, 'accepted' => 0, 'rejected' => 0];
        }

        $monthlyRaw = $submissionsQuery->clone()
            ->where('submitted_at', '>=', $sixMonthsAgo)
            ->select(
                \Illuminate\Support\Facades\DB::raw("DATE_FORMAT(submitted_at, '%b') as month"),
                'status',
                \Illuminate\Support\Facades\DB::raw('count(*) as count')
            )
            ->groupBy('month', 'status')
            ->get();

        foreach ($monthlyRaw as $row) {
            $m = $row->month; // e.g., 'Jan'
            if (isset($months[$m])) {
                $months[$m]['applied'] += $row->count;
                if ($row->status === 'accepted') $months[$m]['accepted'] += $row->count;
                if ($row->status === 'rejected') $months[$m]['rejected'] += $row->count;
            }
        }
        
        $monthlyStats = [];
        foreach ($months as $name => $data) {
            $monthlyStats[] = array_merge(['month' => $name], $data);
        }

        // 3. Popular Programs
        $popularPrograms = \App\Models\Vacancy::where('id_company', $companyId)
            ->withCount('submissions')
            ->orderBy('submissions_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($v) => [
                'title' => $v->title,
                'count' => $v->submissions_count,
                'type' => $v->type
            ]);

        // 4. Recent Activity (Using submissions)
        $recentActivity = $submissionsQuery->clone()
            ->with(['user', 'vacancy'])
            ->orderBy('submitted_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($s) => [
                'type' => 'submission',
                'user' => $s->user?->name,
                'program' => $s->vacancy?->title,
                'status' => $s->status,
                'time' => $s->submitted_at,
            ]);

        return response()->json([
            'active_programs' => $positionsCount, 
            'active_vacancies' => $vacanciesCount,
            'total_applicants' => $totalApplicants,
            'pending_review' => $pendingReview,
            'recent_applicants' => $recentApplicants,
            'status_distribution' => $statusDistribution,
            'monthly_stats' => $monthlyStats,
            'popular_programs' => $popularPrograms,
            'recent_activity' => $recentActivity,
        ]);
    }
}