<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vacancy;
use App\Models\Position;
use App\Models\Submission;
use App\Models\Employee; 
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the logged in company.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $companyId = $user->id_company;

            if (!$companyId) {
                return $this->emptyResponse();
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

            $totalEmployees  = \App\Models\Employee::where('id_company', $companyId)->count();
            $activeEmployees = \App\Models\Employee::where('id_company', $companyId)
                ->where('employee_status', 'active')
                ->count();
            $recentEmployees = \App\Models\Employee::where('id_company', $companyId)
                ->with(['user', 'role'])
                ->orderByRaw('COALESCE(joined_at, created_at, updated_at) DESC')
                ->limit(5)
                ->get()
                ->map(function ($e) {
                    $roleName = $e->role?->name ?: $e->user?->role;
                    $roleDescription = $e->role?->description;
                    $prettyRoleName = $roleName ? ucwords(str_replace(['_', '-'], ' ', $roleName)) : null;

                    return [
                        'id_employee'        => $e->id_employee,
                        'full_name'          => trim($e->first_name . ' ' . $e->last_name) ?: ($e->user?->name ?? '—'),
                        'department'         => $e->department ?: ($prettyRoleName ?? '—'),
                        'position'           => $e->position ?: ($roleDescription ?: ($prettyRoleName ?? '—')),
                        'employee_status'    => $e->employee_status,
                        'employee_status_ui'  => $this->formatEmployeeStatus($e->employee_status),
                        'joined_at'          => $e->joined_at,
                        'joined_at_display'   => $e->joined_at
                            ? $e->joined_at->format('d/m/Y')
                            : ($e->created_at ? $e->created_at->format('d/m/Y') : null),
                    ];
                });
            
            // Recent Applicants Query dengan format aman
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
                ->get()
                ->map(function($s) {
                    return [
                        'id_submission' => $s->id_submission,
                        'user' => $s->user ? [
                            'name' => $s->user->name,
                            'email' => $s->user->email,
                        ] : null,
                        'position' => $s->position ? ['name' => $s->position->name] : null,
                        'vacancy' => $s->vacancy ? ['title' => $s->vacancy->title] : null,
                        'status' => $s->status,
                        'submitted_at' => $s->submitted_at,
                    ];
                });

            // 1. Status Distribution
            $statusDistribution = $statsSubmissionsQuery->clone()
                ->select('status', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
                ->whereNotNull('status')
                ->groupBy('status')
                ->get();

            if ($statusDistribution->isEmpty()) {
                $statusDistribution = collect([
                    (object) ['status' => 'pending', 'count' => 0],
                    (object) ['status' => 'accepted', 'count' => 0],
                    (object) ['status' => 'rejected', 'count' => 0],
                ]);
            }

            // 2. Monthly Stats (Last 6 Months)
            $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $mName = now()->subMonths($i)->format('M');
                $months[$mName] = ['applied' => 0, 'accepted' => 0, 'rejected' => 0];
            }

            $monthlyRaw = $statsSubmissionsQuery->clone()
                ->where('submitted_at', '>=', $sixMonthsAgo)
                ->whereNotNull('submitted_at')
                ->select(
                    \Illuminate\Support\Facades\DB::raw("DATE_FORMAT(submitted_at, '%b') as month"),
                    'status',
                    \Illuminate\Support\Facades\DB::raw('count(*) as count')
                )
                ->groupBy('month', 'status')
                ->get();

            foreach ($monthlyRaw as $row) {
                $m = $row->month;
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
            $popularPrograms = Vacancy::where('id_company', $companyId)
                ->withCount('submissions')
                ->orderBy('submissions_count', 'desc')
                ->limit(5)
                ->get()
                ->map(fn($v) => [
                    'title' => $v->title ?? 'Unknown',
                    'count' => $v->submissions_count ?? 0,
                    'type' => $v->type ?? 'program'
                ]);

            if ($popularPrograms->isEmpty()) {
                $popularPrograms = collect([]);
            }

            // 4. Recent Activity (Using submissions)
            $recentActivity = $statsSubmissionsQuery->clone()
                ->with(['user', 'vacancy'])
                ->orderBy('submitted_at', 'desc')
                ->limit(10)
                ->get()
                ->map(fn($s) => [
                    'type' => 'submission',
                    'user' => $s->user?->name ?? 'Unknown User',
                    'program' => $s->vacancy?->title ?? 'Unknown Program',
                    'status' => $s->status ?? 'pending',
                    'time' => $s->submitted_at ?? now(),
                ]);
            return response()->json([
                'active_programs' => $positionsCount, 
                'active_vacancies' => $vacanciesCount,
                'total_applicants' => $totalApplicants,
                'pending_review' => $pendingReview,
                'total_employees'    => $totalEmployees,
                'active_employees'   => $activeEmployees,
                'recent_employees'   => $recentEmployees,
                'recent_applicants' => $recentApplicants,
                'status_distribution' => $statusDistribution,
                'monthly_stats' => $monthlyStats,
                'popular_programs' => $popularPrograms,
                'recent_activity' => $recentActivity,
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return $this->emptyResponse();
        }
    }

    private function formatEmployeeStatus(?string $status): array
    {
        $normalized = strtolower(trim((string) $status));

        return match ($normalized) {
            'full_time', 'fulltime', 'permanent' => [
                'label' => 'Full Time',
                'tone' => 'success',
            ],
            'part_time', 'parttime' => [
                'label' => 'Part Time',
                'tone' => 'info',
            ],
            'contract' => [
                'label' => 'Contract',
                'tone' => 'primary',
            ],
            'probation' => [
                'label' => 'Probation',
                'tone' => 'warning',
            ],
            'inactive' => [
                'label' => 'Inactive',
                'tone' => 'muted',
            ],
            'resigned' => [
                'label' => 'Resigned',
                'tone' => 'muted',
            ],
            'terminated' => [
                'label' => 'Terminated',
                'tone' => 'danger',
            ],
            default => [
                'label' => $status ? ucwords(str_replace(['_', '-'], ' ', $status)) : 'Unknown',
                'tone' => 'muted',
            ],
        };
    }

    /**
     * Return empty response when no data or error occurs
     */
    private function emptyResponse()
    {
        return response()->json([
            'active_programs' => 0,
            'active_vacancies' => 0,
            'total_applicants' => 0,
            'pending_review' => 0,
            'total_employees'    => 0,   
            'active_employees'   => 0, 
            'recent_employees'   => [],
            'recent_applicants' => [],
            'status_distribution' => [],
            'monthly_stats' => [],
            'popular_programs' => [],
            'recent_activity' => [],
        ]);
    }
}
