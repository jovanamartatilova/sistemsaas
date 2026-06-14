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
        if ($statusFilter && in_array($statusFilter, ['screening', 'test', 'interview', 'accepted', 'rejected'])) {
            if (in_array($statusFilter, ['accepted', 'rejected'])) {
                $base = (clone $base)->where('status', $statusFilter);
            } else {
                // For screening/test/interview, we need to match stage_N where stage type is $statusFilter
                // This is a bit complex for a direct query, so we'll handle it by checking the status string starts with 'stage_' 
                // OR we'll filter them later if needed. For now, let's just allow the filter to pass and we'll handle it in the query.
                // Actually, let's keep it simple: if it's 'screening', we look for 'screening' OR 'stage_N' where stage_N is screening.
                // But since we can't easily join on JSON selection_flow in SQL for all positions at once, 
                // we'll fetch all and filter in collection if status filter is provided for stages.
            }
        }

        // ── FILTER SEARCH ────────────────────────────────────
        $search = $request->query('search');

        // ── STAT CARDS ──────────────────────────────────────
        $totalBase = Submission::whereHas('vacancy', fn($q) =>
            $q->where('id_company', $companyId)
        );
        
        $totalCandidates = (clone $totalBase)->count();
        $accepted = (clone $totalBase)->where('status', 'accepted')->count();
        
        // Count how many are in "Test" stages vs "Interview" vs "Screening"
        $allSubmissions = (clone $totalBase)->with(['position', 'user', 'user.candidate'])->get();
        
        $mappedSubmissions = $allSubmissions->map(function($s) {
            $status = $s->status;
            $type = $status;
            if ($status === 'pending' || $status === 'stage_0') {
                $type = 'screening';
            } elseif (str_starts_with($status, 'stage_')) {
                $idx = (int) str_replace('stage_', '', $status);
                $flow = $s->position?->selection_flow;
                if (is_string($flow)) $flow = json_decode($flow, true);
                if (isset($flow[$idx])) {
                    $type = $flow[$idx]['type'] ?? $status;
                }
            }
            $s->mapped_status = $type;
            return $s;
        });

        $statsCounts = $mappedSubmissions->groupBy('mapped_status')->map->count();

        $pendingReview = $statsCounts->get('screening', 0);
        $interviewScheduled = $statsCounts->get('interview', 0);

        // ── RECENT CANDIDATES ────────────────────────────────
        $recentCandidates = $mappedSubmissions
            ->sortByDesc('submitted_at')
            ->when($statusFilter, fn($c) => $c->where('mapped_status', $statusFilter))
            ->when($search, function($c) use ($search) {
                return $c->filter(function($s) use ($search) {
                    $name = $s->user->name ?? '';
                    $email = $s->user->email ?? '';
                    return stripos($name, $search) !== false || 
                           stripos($email, $search) !== false;
                });
            })
            ->take(10)
            ->map(fn($s) => [
                'id_submission' => $s->id_submission,
                'name'          => $s->user?->name,
                'email'         => $s->user?->email,
                'position'      => $s->position?->name,
                'university'    => $s->user?->candidate?->institution ?? '-',
                'status'        => $s->mapped_status,
                'submitted_at'  => $s->submitted_at,
                'has_cv'            => !empty($s->cv_file),
                'has_cover_letter'  => !empty($s->cover_letter_file),
                'has_portfolio'     => !empty($s->portfolio_file),
                'has_institution_letter' => !empty($s->institution_letter_file),
                'screening_status' => $s->screening_status,
                'hr_notes'         => $s->hr_notes,
            ])->values();

        // ── PIPELINE ─────────────────────────────────────────
        $statuses = ['screening', 'test', 'interview', 'accepted', 'rejected'];
        $pipeline = collect($statuses)->map(fn($s) => [
            'status' => $s,
            'count'  => $statsCounts->get($s, 0),
            'pct'    => $totalCandidates > 0
                ? round(($statsCounts->get($s, 0) / $totalCandidates) * 100) . '%'
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