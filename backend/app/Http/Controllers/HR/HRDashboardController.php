<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Interview;
use Illuminate\Http\Request;

class HRDashboardController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;

        // Base query
        $base = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );

        $statusFilter = $request->query('status');
        if ($statusFilter && in_array($statusFilter, ['pending', 'screening', 'interview', 'accepted', 'rejected'])) {
            $base = (clone $base)->where('status', $statusFilter);
        }

        // ── FILTER SEARCH ────────────────────────────────────
        $search = $request->query('search');

        // ── STAT CARDS ──────────────────────────────────────
        $totalBase = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );
        
        $totalCandidates = (clone $totalBase)->count();
        $accepted = (clone $totalBase)->where('status', 'accepted')->count();
        $pendingReview = (clone $totalBase)->where('status', 'pending')->count();
        
        $interviewScheduled = Interview::whereHas('submission.vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->whereIn('result', ['pending', 'continue'])->count();

        $recentQuery = (clone $base) 
            ->with(['user', 'position', 'vacancy'])
            ->when($search, fn($q) =>
                $q->whereHas('user', fn($u) =>
                    $u->where('name', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                )
            )
            ->orderByDesc('submitted_at')
            ->limit(10);

        $recentCandidates = $recentQuery->get()->map(fn($s) => [
            'id_submission' => $s->id_submission,
            'name'          => $s->user?->name,
            'email'         => $s->user?->email,
            'position'      => $s->position?->name,
            'status'        => $s->status,
            'submitted_at'  => $s->submitted_at,
            'has_cv'            => !empty($s->cv_file),
            'has_cover_letter'  => !empty($s->cover_letter_file),
            'has_portfolio'     => !empty($s->portfolio_file),
            'has_institution_letter' => !empty($s->institution_letter_file),
            'screening_status' => $s->screening_status,
            'hr_notes'         => $s->hr_notes,
        ]);

        $statuses = ['pending', 'screening', 'interview', 'accepted', 'rejected'];
        $counts = (clone $totalBase)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $pipeline = collect($statuses)->map(fn($s) => [
            'status' => $s,
            'count'  => $counts[$s] ?? 0,
            'pct'    => $totalCandidates > 0
                ? round((($counts[$s] ?? 0) / $totalCandidates) * 100) . '%'
                : '0%',
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'user' => [
                    'name'  => $request->user()->name,
                    'email' => $request->user()->email,
                    'photo' => $request->user()->photo_path,
                ],
                'stats' => [
                    'total_candidates'    => $totalCandidates,
                    'accepted'            => $accepted,
                    'interview_scheduled' => $interviewScheduled,
                    'pending_review'      => $pendingReview,
                ],
                'recent_candidates' => $recentCandidates,
                'pipeline'          => $pipeline,
            ],
        ]);
    }
}