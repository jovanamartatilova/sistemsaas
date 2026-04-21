<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Interview;
use Illuminate\Http\Request;

class HRDashboardController extends Controller
{
    /**
     * GET /hr/dashboard
     * Stats + recent candidates + selection pipeline
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;

        // Base query — semua submission milik company ini
        $base = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );

        // ── STAT CARDS ──────────────────────────────────────
        $totalCandidates = (clone $base)->count();

        $accepted = (clone $base)->where('status', 'accepted')->count();

        $interviewScheduled = Interview::whereHas('submission.vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        )->whereIn('result', ['pending', 'continue'])->count();

        $pendingReview = (clone $base)->where('status', 'pending')->count();

        // ── RECENT CANDIDATES ────────────────────────────────
        $search = $request->query('search');

        $recentCandidates = (clone $base)
            ->with(['user', 'position', 'vacancy'])
            ->when($search, fn($q) =>
                $q->whereHas('user', fn($u) =>
                    $u->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                )
            )
            ->orderByDesc('submitted_at')
            ->limit(10)
            ->get()
            ->map(fn($s) => [
                'id_submission' => $s->id_submission,
                'name'          => $s->user?->name,
                'email'         => $s->user?->email,
                'position'      => $s->position?->name,
                'status'        => $s->status,
                'submitted_at'  => $s->submitted_at,
                // dokumen
                'has_cv'            => !empty($s->cv_file),
                'has_cover_letter'  => !empty($s->cover_letter_file),
                'has_portfolio'     => !empty($s->portfolio_file),
                'has_institution_letter' => !empty($s->institution_letter_file),
                // screening
                'screening_status' => $s->screening_status,
                'hr_notes'         => $s->hr_notes,
            ]);

        // ── SELECTION PIPELINE ───────────────────────────────
        $statuses   = ['pending', 'screening', 'interview', 'accepted', 'rejected'];
        $counts     = (clone $base)
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