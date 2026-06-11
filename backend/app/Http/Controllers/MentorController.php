<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Assessment;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MentorController extends Controller
{
    /**
     * Get mentor profile information
     */
    public function getProfile(Request $request)
    {
        $mentor = $request->user();

        return response()->json([
            'id_user' => $mentor->id_user,
            'name' => $mentor->name,
            'email' => $mentor->email,
            'phone' => $mentor->phone ?? null,
            'role' => $mentor->role,
            'company_id' => $mentor->id_company,
        ]);
    }

    /**
     * Get dashboard statistics for mentor with detailed metrics
     */
    public function getDashboard(Request $request)
    {
        $mentorId = $request->user()->id_user;
        $this->syncMentorTeams($mentorId);

        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position', 'assessment'])
            ->get();

        $totalInterns = $submissions->count();
        $needsInput = 0;
        $passedCount = 0;
        $avgScores = [];
        $recentInterns = [];

        foreach ($submissions as $sub) {
            $assessment = $sub->assessment;

            if (!$assessment) {
                $needsInput++;
                continue;
            }

            $passedCount++;

            $scoresData = $assessment->scores_data ?? [];
            $scoredScores = array_filter($scoresData, fn($s) => $s['score'] !== null);

            $avgScore = count($scoredScores) > 0
                ? round(array_sum(array_column($scoredScores, 'score')) / count($scoredScores), 1)
                : null;

            if ($avgScore !== null) {
                $avgScores[] = $avgScore;
            }

            $recentInterns[] = [
                'id_submission' => $sub->id_submission,
                'name' => $sub->user->name,
                'email' => $sub->user->email,
                'position' => $sub->position->name ?? 'N/A',
                'avg_score' => $avgScore,
            ];
        }

        $readyForCert = $passedCount;

        $avgScore = count($avgScores) > 0
            ? round(array_sum($avgScores) / count($avgScores), 1)
            : 0;

        return response()->json([
            'total_interns' => $totalInterns,
            'needs_input' => $needsInput,
            'interns_passed' => $passedCount,
            'ready_for_certificate' => $readyForCert,
            'average_score' => $avgScore,
            'recent_interns' => collect($recentInterns)->take(5)->toArray(),
        ]);
    }

    /**
     * Get list of interns for this mentor
     */
    public function getInterns(Request $request)
    {
        $mentorId = $request->user()->id_user;
        $this->syncMentorTeams($mentorId);
        $search = $request->get('search');

        $submissionsQuery = Submission::where('id_user_mentor', $mentorId)
            ->with([
                'user',
                'position',
                'vacancy',
                'assessment'
            ]);

        if ($search) {
            $submissionsQuery->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $submissions = $submissionsQuery->get();

        $certificateSubIds = Certificate::whereIn('id_submission', $submissions->pluck('id_submission'))
            ->pluck('id_submission')
            ->toArray();

        $interns = $submissions->map(function ($sub) use ($certificateSubIds) {
            $assessment = $sub->assessment;
            $scoresData = $assessment->scores_data ?? [];
            $completedComps = 0;
            $totalComps = count($scoresData);
            $passedComps = 0;
            $failedComps = 0;

            foreach ($scoresData as $score) {
                if ($score['status'] === 'passed') {
                    $completedComps++;
                    $passedComps++;
                } elseif ($score['status'] === 'failed') {
                    $completedComps++;
                    $failedComps++;
                }
            }

            $progress = $totalComps > 0 ? round(($completedComps / $totalComps) * 100) : 0;

            $avgScore = null;
            if (!empty($scoresData)) {
                $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
                $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;
            }

            // Determine status based on Assessment existence
            $status = 'Just Started';
            $statusBg = '#f1f5f9';
            $statusColor = '#64748b';
            $dot = '#94a3b8';

            if ($assessment) {
                $status = 'Passed';
                $statusBg = '#dcfce7';
                $statusColor = '#166534';
                $dot = '#22c55e';
            } elseif ($totalComps === 0 || $avgScore === null) {
                $status = 'Just Started';
                $statusBg = '#f1f5f9';
                $statusColor = '#64748b';
                $dot = '#94a3b8';
            }

            // Get program and period from vacancy
            $program = $sub->vacancy ? ($sub->vacancy->title ?? 'Regular Batch') : 'Regular Batch';
            $period = 'Jan - Apr 2026';
            if ($sub->vacancy) {
                if ($sub->vacancy->start_date && $sub->vacancy->end_date) {
                    $start = \Carbon\Carbon::parse($sub->vacancy->start_date)->format('M');
                    $end = \Carbon\Carbon::parse($sub->vacancy->end_date)->format('M Y');
                    $period = "$start - $end";
                }
            }

            return [
                'id_submission' => $sub->id_submission,
                'name' => $sub->user->name,
                'email' => $sub->user->email,
                'position' => $sub->position->name ?? 'Backend Dev',
                'program' => $program,
                'period' => $period,
                'type' => !empty($sub->id_team) ? 'Team' : 'Individual',
                'progress' => $progress,
                'progColor' => $progress >= 75 ? '#22c55e' : ($progress >= 50 ? '#f59e0b' : '#94a3b8'),
                'avg_score' => $avgScore,
                'status' => $status,
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
                'dot' => $dot,
                'total_competencies' => $totalComps,
                'completed_competencies' => $completedComps,
                'hasScore' => $avgScore !== null,
                'has_certificate' => in_array($sub->id_submission, $certificateSubIds),
            ];
        });

        return response()->json($interns);
    }

    /**
     * Get competencies for a specific submission with scores
     */
    public function getCompetencies(Request $request, $idSubmission)
    {
        $submission = Submission::with(['position'])->findOrFail($idSubmission);

        // Get position competencies
        $positionComps = \DB::table('position_competencies')
            ->join('competencies', 'position_competencies.id_competency', '=', 'competencies.id_competency')
            ->where('position_competencies.id_position', $submission->id_position)
            ->select('competencies.*')
            ->get();

        // Get scores from Assessment (not Submission)
        $assessment = Assessment::where('id_submission', $idSubmission)->first();
        $scoresData = $assessment->scores_data ?? [];
        $scoresKeyById = [];
        foreach ($scoresData as $score) {
            $scoresKeyById[$score['id_competency']] = $score;
        }

        $competencies = $positionComps->map(function ($comp) use ($scoresKeyById) {
            $score = $scoresKeyById[$comp->id_competency] ?? null;
            return [
                'id_competency' => $comp->id_competency,
                'name' => $comp->name,
                'description' => $comp->description ?? null,
                'hours' => $comp->learning_hours,
                'score' => $score ? $score['score'] : null,
                'hours_completed' => $score ? $score['hours_completed'] : null,
                'status' => $score ? $score['status'] : 'pending',
                'notes' => $score ? $score['notes'] : null,
                'achievement_description' => $score['achievement_description'] ?? null,
                'definition' => $score['definition'] ?? null,
                'level' => $this->getCompetencyLevel($comp->learning_hours),
            ];
        });

        return response()->json($competencies);
    }

    /**
     * Input/update scores for a submission
     */
    public function inputScores(Request $request, $idSubmission)
    {
        try {
            $validated = $request->validate([
                'scores' => 'required|array',
                'scores.*.id_competency' => 'required|string',
                'scores.*.score' => 'nullable|integer|min:0|max:100',
                'scores.*.hours_completed' => 'nullable|integer|min:0',
                'scores.*.status' => 'nullable|in:pending,passed,failed,in_progress',
                'scores.*.notes' => 'nullable|string',
                'scores.*.achievement_description' => 'nullable|string',
                'scores.*.definition' => 'nullable|string',
            ]);

            $mentorId = $request->user()->id_user;

            // Verify submission belongs to this mentor
            $submission = Submission::where('id_submission', $idSubmission)
                ->where('id_user_mentor', $mentorId)
                ->with(['position'])
                ->firstOrFail();

            // Get position competencies with learning hours
            $positionComps = \DB::table('position_competencies')
                ->join('competencies', 'position_competencies.id_competency', '=', 'competencies.id_competency')
                ->where('position_competencies.id_position', $submission->id_position)
                ->select('competencies.id_competency', 'competencies.learning_hours')
                ->get()
                ->keyBy('id_competency');

            // Create or update Assessment (not Submission)
            $assessment = Assessment::firstOrCreate(
                ['id_submission' => $idSubmission],
                [
                    'id_assessment' => \Illuminate\Support\Str::random(10),
                    'id_user' => $submission->id_user,
                    'id_user_mentor' => $mentorId,
                ]
            );

            // Merge new scores with existing scores instead of replacing
            $existingScores = $assessment->scores_data ?? [];
            $existingScoresById = [];
            foreach ($existingScores as $score) {
                $existingScoresById[$score['id_competency']] = $score;
            }

            // Build complete scores data for all position competencies
            $updatedScores = [];

            // First, process all position competencies to ensure all are included
            foreach ($positionComps as $compId => $posComp) {
                $learningHours = $posComp->learning_hours;

                // Check if this competency is in the update request
                $scoreData = null;
                foreach ($validated['scores'] as $data) {
                    if ($data['id_competency'] === $compId) {
                        $scoreData = $data;
                        break;
                    }
                }

                if ($scoreData) {
                    // New data provided, use it
                    $status = $scoreData['status'] ?? $existingScoresById[$compId]['status'] ?? 'pending';
                    $hoursCompleted = 0;
                    if ($status === 'passed' || $status === 'failed') {
                        $hoursCompleted = $learningHours;
                    }

                    $updatedScores[] = [
                        'id_competency' => $compId,
                        'score' => $scoreData['score'] ?? $existingScoresById[$compId]['score'] ?? null,
                        'learning_hours' => $learningHours,
                        'hours_completed' => $hoursCompleted,
                        'status' => $status,
                        'notes' => $scoreData['notes'] ?? $existingScoresById[$compId]['notes'] ?? null,
                        'achievement_description' => $scoreData['achievement_description'] ?? $existingScoresById[$compId]['achievement_description'] ?? null,
                        'definition' => $scoreData['definition'] ?? $existingScoresById[$compId]['definition'] ?? null,
                    ];
                } else if (isset($existingScoresById[$compId])) {
                    // Preserve existing data, but update learning_hours if needed
                    $existingScore = $existingScoresById[$compId];
                    $status = $existingScore['status'] ?? 'pending';
                    $hoursCompleted = 0;
                    if ($status === 'passed' || $status === 'failed') {
                        $hoursCompleted = $learningHours;
                    }

                    $updatedScores[] = [
                        'id_competency' => $compId,
                        'score' => $existingScore['score'] ?? null,
                        'learning_hours' => $learningHours,
                        'hours_completed' => $hoursCompleted,
                        'status' => $status,
                        'notes' => $existingScore['notes'] ?? null,
                        'achievement_description' => $existingScore['achievement_description'] ?? null,
                        'definition' => $existingScore['definition'] ?? null,
                    ];
                } else {
                    // New competency, create with default pending status
                    $updatedScores[] = [
                        'id_competency' => $compId,
                        'score' => null,
                        'learning_hours' => $learningHours,
                        'hours_completed' => 0,
                        'status' => 'pending',
                        'notes' => null,
                    ];
                }
            }

            \Log::info('Updating scores for submission', [
                'submission_id' => $idSubmission,
                'mentor_id' => $mentorId,
                'scores_count' => count($updatedScores),
                'scores_data' => $updatedScores,
            ]);

            $assessment->update([
                'scores_data' => $updatedScores,
            ]);

            \Log::info('Scores updated successfully in Assessment', [
                'submission_id' => $idSubmission,
                'assessment_id' => $assessment->id_assessment,
                'scores_data' => $assessment->fresh()->scores_data,
            ]);

            return response()->json([
                'message' => 'Scores saved successfully',
                'submission_id' => $idSubmission,
                'scores_count' => count($updatedScores),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in inputScores', [
                'errors' => $e->errors(),
                'submission_id' => $idSubmission,
            ]);
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Error in inputScores', [
                'message' => $e->getMessage(),
                'submission_id' => $idSubmission,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'error' => $e->getMessage(),
                'submission_id' => $idSubmission,
            ], 500);
        }
    }

    /**
     * Get score recap across all interns
     */
    public function getScoreRecap(Request $request)
    {
        $mentorId = $request->user()->id_user;
        $this->syncMentorTeams($mentorId);
        $search = $request->get('search');

        $submissionsQuery = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position', 'assessment', 'vacancy', 'team']);

        if ($search) {
            $submissionsQuery->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $submissions = $submissionsQuery->get();

        $allScores = [];
        $passedCount = 0;
        $incompleteCount = 0;

        foreach ($submissions as $sub) {
            $assessment = $sub->assessment;
            $scoresData = $assessment->scores_data ?? [];

            foreach ($scoresData as $score) {
                if ($score['score'] !== null) {
                    $allScores[] = $score['score'];
                }
            }

            $incompletedComps = count(array_filter($scoresData, fn($s) => $s['score'] === null));
            if ($incompletedComps > 0) {
                $incompleteCount++;
            } elseif (count(array_filter($scoresData, fn($s) => $s['status'] === 'passed')) === count($scoresData) && count($scoresData) > 0) {
                $passedCount++;
            }
        }

        $overallAvg = count($allScores) > 0 ? round(array_sum($allScores) / count($allScores), 1) : 0;

        $stats = [
            ['value' => $overallAvg, 'label' => 'Overall Average', 'barColor' => '#8b5cf6', 'barWidth' => min(100, $overallAvg) . '%'],
            ['value' => $passedCount, 'label' => 'Interns Passed', 'barColor' => '#22c55e', 'barWidth' => min(100, $passedCount * 20) . '%'],
            ['value' => $incompleteCount, 'label' => 'Incomplete', 'barColor' => '#f59e0b', 'barWidth' => min(100, $incompleteCount * 20) . '%'],
        ];

        $recap = $submissions->map(function ($sub) {
            $assessment = $sub->assessment;
            $scoresData = $assessment->scores_data ?? [];
            $completedScores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($completedScores) > 0
                ? round(array_sum(array_column($completedScores, 'score')) / count($completedScores), 1)
                : null;
            $scoredCount = count($completedScores);
            $totalComps = count($scoresData);

            $competencyIds = array_column($scoresData, 'id_competency');

            $competenciesFromDb = !empty($competencyIds)
                ? \DB::table('competencies')
                    ->whereIn('id_competency', $competencyIds)
                    ->select('id_competency', 'name', 'learning_hours')
                    ->get()
                    ->keyBy('id_competency')
                : collect();

            $competencyNames = $competenciesFromDb->pluck('name')->toArray();

            $totalHours = 0;
            foreach ($scoresData as $score) {
                if (($score['status'] === 'passed' || $score['status'] === 'failed') && !empty($score['id_competency'])) {
                    $comp = $competenciesFromDb->get($score['id_competency']);
                    $totalHours += $comp ? $comp->learning_hours : ($score['learning_hours'] ?? 0);
                }
            }

            $period = 'N/A';
            if ($sub->vacancy && $sub->vacancy->start_date && $sub->vacancy->end_date) {
                $start = \Carbon\Carbon::parse($sub->vacancy->start_date)->format('M Y');
                $end = \Carbon\Carbon::parse($sub->vacancy->end_date)->format('M Y');
                $period = "$start - $end";
            }
            if ($assessment) {
                $status = 'Done';
                $statusBg = '#dcfce7';
                $statusColor = '#166534';
            } elseif ($avgScore === null) {
                $status = 'Just Started';
                $statusBg = '#f1f5f9';
                $statusColor = '#64748b';
            } else {
                $status = 'In Progress';
                $statusBg = '#fef9c3';
                $statusColor = '#92400e';
            }

            return [
                'name' => $sub->user->name,
                'position' => $sub->position->name ?? 'N/A',
                'program' => $sub->vacancy->title ?? 'Regular Batch',
                'period' => $period,                          // ← tambah ini
                'batch' => $sub->vacancy->batch ?? null,
                'type' => !empty($sub->id_team) ? 'Team' : 'Individual',
                'id_team' => $sub->id_team ?? null,           // ← untuk grouping team
                'team_name' => $sub->team->name ?? null,
                'scored' => "$scoredCount/$totalComps",
                'competency_names' => $competencyNames,
                'hours' => "$totalHours hrs",
                'avg' => $avgScore,
                'score' => $avgScore,
                'id_submission' => $sub->id_submission,
                'status' => $status,
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'recap' => $recap,
        ]);
    }

    /**
     * Get evaluation for a submission
     */
    public function getEvaluation(Request $request, $idSubmission)
    {
        $mentorId = $request->user()->id_user;

        // Verify submission belongs to this mentor
        $submission = Submission::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->firstOrFail();

        $assessment = Assessment::where('id_submission', $idSubmission)->first();

        return response()->json([
            'narrative' => $assessment->narrative ?? '',
            'status' => $assessment->evaluation_status ?? 'draft',
            'has_certificate' => Certificate::where('id_submission', $idSubmission)->exists(),
        ]);
    }

    /**
     * Save/update evaluation
     */
    public function saveEvaluation(Request $request, $idSubmission)
    {
        $request->validate([
            'narrative' => 'required|string',
        ]);

        $mentorId = $request->user()->id_user;

        $submission = Submission::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->firstOrFail();

        $assessment = Assessment::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->first();

        if ($assessment) {
            $assessment->update([
                'narrative' => $request->narrative,
                'evaluation_status' => 'reviewed',
            ]);
        } else {
            Assessment::create([
                'id_assessment' => (string) Str::uuid(),
                'id_submission' => $idSubmission,
                'id_user' => $submission->id_user,
                'id_user_mentor' => $mentorId,
                'narrative' => $request->narrative,
                'evaluation_status' => 'reviewed',
                'scores_data' => [],
            ]);
        }

        return response()->json(['message' => 'Evaluation saved successfully']);
    }

    /**
     * Get certificates list
     */
    public function getCertificates(Request $request)
    {
        $mentorId = $request->user()->id_user;
        $this->syncMentorTeams($mentorId);
        $search = $request->get('search');

        $submissionsQuery = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position', 'vacancy', 'assessment', 'certificate']);

        if ($search) {
            $submissionsQuery->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $submissions = $submissionsQuery->get();

        $passed = 0;
        $notPassed = 0;

        foreach ($submissions as $sub) {
            $assessment = $sub->assessment;
            $scoresData = $assessment->scores_data ?? [];
            $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;

            if ($avgScore !== null && $avgScore >= 75)
                $passed++;
            else
                $notPassed++;
        }

        $stats = [
            ['value' => $passed, 'label' => 'Passed', 'barColor' => '#22c55e', 'barWidth' => min(100, $passed * 20) . '%'],
            ['value' => $notPassed, 'label' => 'Not Passed', 'barColor' => '#ef4444', 'barWidth' => min(100, $notPassed * 20) . '%'],
        ];

        $certificates = $submissions->map(function ($sub) {
            $assessment = $sub->assessment;
            $scoresData = $assessment->scores_data ?? [];
            $completedScores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($completedScores) > 0
                ? round(array_sum(array_column($completedScores, 'score')) / count($completedScores), 1)
                : null;
            $scoredCount = count($completedScores);
            $totalComps = count($scoresData);

            // Get competency names and total hours
            $competencyIds = array_column($scoresData, 'id_competency');
            $competenciesFromDb = !empty($competencyIds)
                ? \DB::table('competencies')
                    ->whereIn('id_competency', $competencyIds)
                    ->select('id_competency', 'name', 'learning_hours')
                    ->get()
                    ->keyBy('id_competency')
                : collect();

            $competencyNames = $competenciesFromDb->pluck('name')->toArray();

            $totalHours = 0;
            foreach ($scoresData as $score) {
                if (($score['status'] === 'passed' || $score['status'] === 'failed') && !empty($score['id_competency'])) {
                    $comp = $competenciesFromDb->get($score['id_competency']);
                    $totalHours += $comp ? $comp->learning_hours : ($score['learning_hours'] ?? 0);
                }
            }

            $status = ($avgScore !== null && $avgScore >= 75) ? 'Passed' : 'Not Passed';
            $statusBg = $status === 'Passed' ? '#dcfce7' : '#fecaca';
            $statusColor = $status === 'Passed' ? '#166534' : '#991b1b';
            $fileUrl = null;

            $cert = $sub->certificate;
            if ($cert) {
                if ($cert->is_sent) {
                    $status = 'Sent';
                    $statusBg = '#dcfce7';
                    $statusColor = '#166534';
                } else {
                    $status = 'Generated';
                    $statusBg = '#ccfbf1';
                    $statusColor = '#0f766e';
                }
                $fileUrl = $cert->file_path ? asset('storage/' . $cert->file_path) : null;
            }

            $period = 'Jan - Apr 2026';
            if ($sub->vacancy && $sub->vacancy->start_date && $sub->vacancy->end_date) {
                $start = \Carbon\Carbon::parse($sub->vacancy->start_date)->format('M');
                $end = \Carbon\Carbon::parse($sub->vacancy->end_date)->format('M Y');
                $period = "$start - $end";
            }

            return [
                'name' => $sub->user->name,
                'position' => $sub->position->name ?? 'N/A',
                'program' => $sub->vacancy->title ?? 'Regular Batch 3',
                'type' => !empty($sub->id_team) ? 'Team' : 'Individual',
                'id_team' => $sub->id_team ?? null,
                'team_name' => $sub->team->name ?? null,
                'period' => $period,
                'scored' => "$scoredCount/$totalComps",
                'competency_names' => $competencyNames,
                'hours' => "$totalHours hrs",
                'avg' => $avgScore,
                'score' => $avgScore,
                'id_submission' => $sub->id_submission,
                'status' => $status,
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
                'file_url' => $fileUrl,
                'cert_data' => $cert ? [
                    'template_style' => $cert->template_style,
                    'background_path' => $cert->background_path ? asset('storage/' . $cert->background_path) : null,
                    'layout_settings' => $cert->layout_settings,
                    'logo_position' => $cert->logo_position,
                    'signature_layout' => $cert->signature_layout,
                    'signatory1_name' => $cert->signatory1_name,
                    'signatory1_title' => $cert->signatory1_title,
                    'signatory2_name' => $cert->signatory2_name,
                    'signatory2_title' => $cert->signatory2_title,
                    'signatory2_signature' => $cert->signatory2_signature ? asset('storage/' . $cert->signatory2_signature) : null,
                    'show_qr' => $cert->show_qr,
                    'qr_position' => $cert->qr_position,
                ] : null,
            ];
        });

        return response()->json([
            'stats' => $stats,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Generate certificate for a submission
     */
    public function generateCertificate(Request $request, $idSubmission)
    {
        try {
            $filePath = $this->generateCertificateInternal($request, $idSubmission);
            return response()->json([
                'message' => 'Certificate generated successfully',
                'file_url' => asset('storage/' . $filePath)
            ]);
        } catch (\Throwable $e) {
            \Log::error('Certificate generation failed for submission ' . $idSubmission . ': ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate certificate: ' . $e->getMessage()
            ], 500);
        }
    }

    protected function generateCertificateInternal(Request $request, $idSubmission)
    {
        $mentorId = $request->user()->id_user;
        $mentorName = $request->user()->name;

        // Verify submission belongs to this mentor
        $submission = Submission::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->with(['user', 'position', 'vacancy.company'])
            ->firstOrFail();

        // Calculate average score
        $assessment = Assessment::where('id_submission', $idSubmission)->first();

        if (!$assessment || empty($assessment->scores_data)) {
            throw new \Exception('Please save assessment scores first before generating a certificate.');
        }

        $scoresData = $assessment->scores_data ?? [];
        $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);

        if (count($scores) === 0) {
            throw new \Exception('No scores found. Please input and save scores for at least one competency.');
        }

        $avgScore = round(array_sum(array_column($scores, 'score')) / count($scores), 2);

        $positionComps = DB::table('position_competencies')
            ->join('competencies', 'position_competencies.id_competency', '=', 'competencies.id_competency')
            ->where('position_competencies.id_position', $submission->id_position)
            ->select('competencies.*')
            ->get()->keyBy('id_competency');

        $competenciesData = [];
        foreach ($scores as $s) {
            $comp = $positionComps->get($s['id_competency']);
            if ($comp) {
                $competenciesData[] = [
                    'name' => $comp->name,
                    'description' => $s['definition'] ?? $comp->description,
                    'achievement_description' => $s['achievement_description'] ?? '',
                    'hours' => $comp->learning_hours,
                    'score' => $s['score'],
                ];
            }
        }

        // Generate Certificate Number
        $certExists = Certificate::where('id_submission', $idSubmission)->first();
        if ($certExists && $certExists->certificate_number) {
            $certNumber = $certExists->certificate_number;
        } else {
            $year = now()->year;
            $count = Certificate::whereYear('issued_date', $year)->count() + 1;
            $certNumber = 'CERT/' . $year . '/' . str_pad($count, 3, '0', STR_PAD_LEFT);
        }

        $idCert = $certExists ? $certExists->id_certificate : 'CERT' . strtoupper(Str::random(6));

        // Read Customization parameters from Request or database
        $hasCustomizationParams = $request->has('template_style') || $request->has('layout_settings');

        if ($certExists && !$hasCustomizationParams) {
            $template_style = $certExists->template_style;
            $logo_position = $certExists->logo_position;
            $signature_layout = $certExists->signature_layout;
            $signatory1_name = $certExists->signatory1_name;
            $signatory1_title = $certExists->signatory1_title;
            $signatory2_name = $certExists->signatory2_name;
            $signatory2_title = $certExists->signatory2_title;
            $show_qr = (bool)$certExists->show_qr;
            $qr_position = $certExists->qr_position;
            $layout_settings = json_decode($certExists->layout_settings, true) ?: [];
            $layout_settings_json = $certExists->layout_settings;
            $background_path = $certExists->background_path;
            $signatory2_signature_path = $certExists->signatory2_signature;
        } else {
            $template_style = $request->input('template_style', 'classic');
            $logo_position = $request->input('logo_position', 'center');
            $signature_layout = $request->input('signature_layout', 'single');
            $signatory1_name = $request->input('signatory1_name', $mentorName);
            $signatory1_title = $request->input('signatory1_title', 'Mentor ' . ($submission->vacancy->company->name ?? ''));
            $signatory2_name = $request->input('signatory2_name');
            $signatory2_title = $request->input('signatory2_title');
            $show_qr = filter_var($request->input('show_qr', true), FILTER_VALIDATE_BOOLEAN);
            $qr_position = $request->input('qr_position', 'bottom-left');

            // Handle layout settings (offsets)
            $layout_settings = $request->input('layout_settings');
            if (is_array($layout_settings)) {
                $layout_settings_json = json_encode($layout_settings);
            } else {
                $layout_settings_json = $layout_settings;
                $layout_settings = json_decode($layout_settings, true) ?: [];
            }

            // Handle custom background file upload
            $background_path = null;
            if ($request->hasFile('background_file')) {
                $background_path = $request->file('background_file')->store('certificates/backgrounds', 'public');
            } elseif ($request->filled('background_path')) {
                $bgData = $request->input('background_path');
                if (str_starts_with($bgData, 'data:image')) {
                    $type = explode(';', $bgData)[0];
                    $type = explode('/', $type)[1];
                    $dataDec = explode(',', $bgData)[1];
                    $decoded = base64_decode($dataDec);

                    $bgFileName = 'certificates/backgrounds/bg_' . Str::random(10) . '.' . $type;
                    Storage::disk('public')->put($bgFileName, $decoded);
                    $background_path = $bgFileName;
                } else {
                    $background_path = preg_replace('/.*\/storage\//', '', $bgData);
                }
            }

            // Handle signatory 2 signature upload/canvas
            $signatory2_signature_path = null;
            if ($request->filled('signatory2_signature')) {
                $sigData = $request->input('signatory2_signature');
                if (str_starts_with($sigData, 'data:image')) {
                    $type = explode(';', $sigData)[0];
                    $type = explode('/', $type)[1];
                    $dataDec = explode(',', $sigData)[1];
                    $decoded = base64_decode($dataDec);

                    $sigFileName = 'signatures/sig2_' . Str::random(10) . '.' . $type;
                    Storage::disk('public')->put($sigFileName, $decoded);
                    $signatory2_signature_path = $sigFileName;
                } else {
                    $signatory2_signature_path = preg_replace('/.*\/storage\//', '', $sigData);
                }
            }
        }

        // Prepare Base64 assets
        $company = $submission->vacancy->company;
        $logo_base64 = null;
        if ($company && $company->logo_path) {
            $logoPath = storage_path('app/public/' . $company->logo_path);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logo_base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $background_base64 = null;
        if ($background_path) {
            if (Storage::disk('public')->exists($background_path)) {
                $fileContent = Storage::disk('public')->get($background_path);
                $type = pathinfo($background_path, PATHINFO_EXTENSION);
                $background_base64 = 'data:image/' . $type . ';base64,' . base64_encode($fileContent);
            }
        }

        $signature_base64 = null;
        $employee = auth()->user()->employee;
        if ($employee && $employee->signature_path) {
            if (Storage::disk('public')->exists($employee->signature_path)) {
                $fileContent = Storage::disk('public')->get($employee->signature_path);
                $type = pathinfo($employee->signature_path, PATHINFO_EXTENSION);
                $signature_base64 = 'data:image/' . $type . ';base64,' . base64_encode($fileContent);
            }
        }

        $signature2_base64 = null;
        if ($signature_layout === 'double' && $signatory2_signature_path) {
            if (Storage::disk('public')->exists($signatory2_signature_path)) {
                $fileContent = Storage::disk('public')->get($signatory2_signature_path);
                $type = pathinfo($signatory2_signature_path, PATHINFO_EXTENSION);
                $signature2_base64 = 'data:image/' . $type . ';base64,' . base64_encode($fileContent);
            }
        }

        // Generate QR code base64
        $qr_base64 = null;
        $appUrl = env('APP_URL', 'http://localhost');
        $frontendUrl = $appUrl;
        if (str_contains($appUrl, 'localhost') || str_contains($appUrl, '127.0.0.1')) {
            $frontendUrl = 'http://localhost:5173';
        }
        $verifyUrl = $frontendUrl . '/verify-certificate/' . $idCert;

        if ($show_qr) {
            try {
                $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($verifyUrl);
                $response = \Illuminate\Support\Facades\Http::withOptions(['verify' => false])->timeout(3)->get($qrUrl);
                if ($response->successful()) {
                    $qr_base64 = 'data:image/png;base64,' . base64_encode($response->body());
                } else {
                    \Log::warning('QR server returned status ' . $response->status());
                }
            } catch (\Throwable $e) {
                \Log::error('Failed to generate QR code: ' . $e->getMessage());
            }
        }

        $companyCity = 'Jakarta';
        if ($company && $company->address) {
            $parts = explode(',', $company->address);
            if (count($parts) > 1) {
                $companyCity = trim(end($parts));
            } else {
                $companyCity = $company->address;
            }
        }

        $data = [
            'submission' => $submission,
            'company' => $company,
            'mentorName' => $mentorName,
            'logo_base64' => $logo_base64,
            'background_base64' => $background_base64,
            'companyCity' => $companyCity,
            'certNumber' => $certNumber,
            'issuedDate' => now()->translatedFormat('d F Y'),
            'competencies' => $competenciesData,
            'avgScore' => $avgScore,
            'evaluation' => $assessment->narrative ?? '',
            'signature_base64' => $signature_base64,

            // Customization Options
            'template_style' => $template_style,
            'logo_position' => $logo_position,
            'signature_layout' => $signature_layout,
            'signatory1_name' => $signatory1_name,
            'signatory1_title' => $signatory1_title,
            'signatory2_name' => $signatory2_name,
            'signatory2_title' => $signatory2_title,
            'signature2_base64' => $signature2_base64,
            'show_qr' => $show_qr,
            'qr_position' => $qr_position,
            'qr_base64' => $qr_base64,
            'layout_settings' => $layout_settings,
        ];

        $filePath = 'certificates/' . $idCert . '.pdf';
        
        // Globally bypass SSL validation for file_get_contents inside DomPDF font downloads
        stream_context_set_default([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ]
        ]);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificate.template', $data)
            ->setPaper('a4', 'landscape')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);
        
        $dompdf = $pdf->getDompdf();
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ]
        ]);
        $dompdf->setHttpContext($context);
        Storage::disk('public')->put($filePath, $pdf->output());

        Certificate::updateOrCreate(
            ['id_submission' => $idSubmission],
            [
                'id_certificate' => $idCert,
                'certificate_number' => $certNumber,
                'file_path' => $filePath,
                'final_score' => $avgScore,
                'issued_date' => now(),
                'is_sent' => false,

                // Save custom layout fields
                'template_style' => $template_style,
                'background_path' => $background_path,
                'layout_settings' => $layout_settings_json,
                'logo_position' => $logo_position,
                'signature_layout' => $signature_layout,
                'signatory1_name' => $signatory1_name,
                'signatory1_title' => $signatory1_title,
                'signatory2_name' => $signatory2_name,
                'signatory2_title' => $signatory2_title,
                'signatory2_signature' => $signatory2_signature_path,
                'show_qr' => $show_qr,
                'qr_position' => $qr_position,
            ]
        );

        // Otomatis ubah status Apprentice jadi completed
        \App\Models\Apprentice::where('id_submission', $idSubmission)->update(['status' => 'completed']);

        return $filePath;
    }

    /**
     * Bulk generate certificates
     */
    public function bulkGenerateCertificates(Request $request)
    {
        $request->validate([
            'submission_ids' => 'required|array',
            'submission_ids.*' => 'string'
        ]);

        $submissionIds = $request->submission_ids;
        $results = [];

        foreach ($submissionIds as $idSubmission) {
            try {
                $this->generateCertificateInternal($request, $idSubmission);
                $results[] = ['id' => $idSubmission, 'success' => true];
            } catch (\Throwable $e) {
                \Log::error('Bulk certificate generation failed for submission ' . $idSubmission . ': ' . $e->getMessage());
                $results[] = ['id' => $idSubmission, 'success' => false, 'error' => $e->getMessage()];
            }
        }

        return response()->json([
            'message' => 'Bulk generation process completed',
            'results' => $results
        ]);
    }

    /**
     * Bulk send certificates
     */
    public function bulkSendCertificates(Request $request)
    {
        $request->validate([
            'submission_ids' => 'required|array',
            'submission_ids.*' => 'string'
        ]);

        $submissionIds = $request->submission_ids;
        $results = [];

        foreach ($submissionIds as $idSubmission) {
            try {
                $cert = Certificate::where('id_submission', $idSubmission)->first();
                if ($cert) {
                    $cert->update(['is_sent' => true]);
                    $results[] = ['id' => $idSubmission, 'success' => true];
                } else {
                    $results[] = ['id' => $idSubmission, 'success' => false, 'error' => 'Certificate not found'];
                }
            } catch (\Exception $e) {
                $results[] = ['id' => $idSubmission, 'success' => false, 'error' => $e->getMessage()];
            }
        }

        return response()->json([
            'message' => 'Bulk send process completed',
            'results' => $results
        ]);
    }

    public function previewCertificate(Request $request, $idSubmission)
    {
        try {
            $mentorId = $request->user()->id_user;
            $mentorName = $request->user()->name;

            // Verify submission belongs to this mentor
            $submission = Submission::where('id_submission', $idSubmission)
                ->where('id_user_mentor', $mentorId)
                ->with(['user', 'position', 'vacancy.company'])
                ->firstOrFail();

            // Calculate average score
            $assessment = Assessment::where('id_submission', $idSubmission)->first();
            $scoresData = $assessment->scores_data ?? [];
            $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 2) : 0;

            $positionComps = DB::table('position_competencies')
                ->join('competencies', 'position_competencies.id_competency', '=', 'competencies.id_competency')
                ->where('position_competencies.id_position', $submission->id_position)
                ->select('competencies.*')
                ->get()->keyBy('id_competency');

            $competenciesData = [];
            foreach ($scores as $s) {
                $comp = $positionComps->get($s['id_competency']);
                if ($comp) {
                    $competenciesData[] = [
                        'name' => $comp->name,
                        'description' => $s['definition'] ?? $comp->description,
                        'achievement_description' => $s['achievement_description'] ?? '',
                        'hours' => $comp->learning_hours,
                        'score' => $s['score'],
                    ];
                }
            }

            $isDummy = filter_var($request->input('is_dummy', false), FILTER_VALIDATE_BOOLEAN) || $request->input('is_dummy') === 'true';
            if ($isDummy) {
                if ($submission->user) {
                    $submission->user = clone $submission->user;
                    $submission->user->name = '[Nama Intern]';
                }
                if ($submission->position) {
                    $submission->position = clone $submission->position;
                    $submission->position->name = '[Nama Posisi]';
                }
                if ($submission->vacancy) {
                    $submission->vacancy = clone $submission->vacancy;
                    $submission->vacancy->title = '[Program Magang]';
                }
            }

            $certExists = Certificate::where('id_submission', $idSubmission)->first();
            
            // Generate Certificate Number for preview
            if ($certExists && $certExists->certificate_number) {
                $certNumber = $certExists->certificate_number;
            } else {
                $year = now()->year;
                $count = Certificate::whereYear('issued_date', $year)->count() + 1;
                $certNumber = 'CERT/' . $year . '/' . str_pad($count, 3, '0', STR_PAD_LEFT);
            }

            $hasCustomizationParams = $request->has('template_style') || $request->has('layout_settings');

            if ($certExists && !$hasCustomizationParams) {
                $template_style = $certExists->template_style;
                $logo_position = $certExists->logo_position;
                $signature_layout = $certExists->signature_layout;
                $signatory1_name = $certExists->signatory1_name;
                $signatory1_title = $certExists->signatory1_title;
                $signatory2_name = $certExists->signatory2_name;
                $signatory2_title = $certExists->signatory2_title;
                $show_qr = (bool)$certExists->show_qr;
                $qr_position = $certExists->qr_position;
                $layout_settings = json_decode($certExists->layout_settings, true) ?: [];
                $background_path = $certExists->background_path;
                $signatory2_signature_path = $certExists->signatory2_signature;
            } else {
                // Read Customization parameters from Request
                $template_style = $request->input('template_style', 'classic');
                $logo_position = $request->input('logo_position', 'center');
                $signature_layout = $request->input('signature_layout', 'single');
                $signatory1_name = $request->input('signatory1_name', $mentorName);
                $signatory1_title = $request->input('signatory1_title', 'Mentor ' . ($submission->vacancy->company->name ?? ''));
                $signatory2_name = $request->input('signatory2_name');
                $signatory2_title = $request->input('signatory2_title');
                $show_qr = filter_var($request->input('show_qr', true), FILTER_VALIDATE_BOOLEAN);
                $qr_position = $request->input('qr_position', 'bottom-left');

                $layout_settings = $request->input('layout_settings');
                if (!is_array($layout_settings)) {
                    $layout_settings = json_decode($layout_settings, true) ?: [];
                }

                // Handle custom background file upload/path
                $background_path = null;
                if ($request->hasFile('background_file')) {
                    $background_path = $request->file('background_file')->store('certificates/backgrounds', 'public');
                } elseif ($request->filled('background_path')) {
                    $background_path = preg_replace('/.*\/storage\//', '', $request->input('background_path'));
                }

                // Handle signatory 2 signature upload/canvas
                $signatory2_signature_path = null;
                if ($request->filled('signatory2_signature')) {
                    $sigData = $request->input('signatory2_signature');
                    if (str_starts_with($sigData, 'data:image')) {
                        $type = explode(';', $sigData)[0];
                        $type = explode('/', $type)[1];
                        $dataDec = explode(',', $sigData)[1];
                        $decoded = base64_decode($dataDec);

                        $sigFileName = 'signatures/sig2_temp_' . Str::random(10) . '.' . $type;
                        Storage::disk('public')->put($sigFileName, $decoded);
                        $signatory2_signature_path = $sigFileName;
                    } else {
                        $signatory2_signature_path = preg_replace('/.*\/storage\//', '', $sigData);
                    }
                }
            }

            // Prepare Base64 assets
            $company = $submission->vacancy->company;
            $logo_base64 = null;
            if ($company && $company->logo_path) {
                $logoPath = storage_path('app/public/' . $company->logo_path);
                if (file_exists($logoPath)) {
                    $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                    $data = file_get_contents($logoPath);
                    $logo_base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                }
            }

            $background_base64 = null;
            if ($background_path) {
                if (Storage::disk('public')->exists($background_path)) {
                    $fileContent = Storage::disk('public')->get($background_path);
                    $type = pathinfo($background_path, PATHINFO_EXTENSION);
                    $background_base64 = 'data:image/' . $type . ';base64,' . base64_encode($fileContent);
                }
            }

            $signature_base64 = null;
            $employee = auth()->user()->employee;
            if ($employee && $employee->signature_path) {
                if (Storage::disk('public')->exists($employee->signature_path)) {
                    $fileContent = Storage::disk('public')->get($employee->signature_path);
                    $type = pathinfo($employee->signature_path, PATHINFO_EXTENSION);
                    $signature_base64 = 'data:image/' . $type . ';base64,' . base64_encode($fileContent);
                }
            }

            $signature2_base64 = null;
            if ($signature_layout === 'double' && $signatory2_signature_path) {
                if (Storage::disk('public')->exists($signatory2_signature_path)) {
                    $fileContent = Storage::disk('public')->get($signatory2_signature_path);
                    $type = pathinfo($signatory2_signature_path, PATHINFO_EXTENSION);
                    $signature2_base64 = 'data:image/' . $type . ';base64,' . base64_encode($fileContent);
                }
            }

            // Generate QR code base64
            $qr_base64 = null;
            $appUrl = env('APP_URL', 'http://localhost');
            $frontendUrl = $appUrl;
            if (str_contains($appUrl, 'localhost') || str_contains($appUrl, '127.0.0.1')) {
                $frontendUrl = 'http://localhost:5173';
            }
            $verifyUrl = $frontendUrl . '/verify-certificate/PREVIEW';

            if ($show_qr) {
                try {
                    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' . urlencode($verifyUrl);
                    $response = \Illuminate\Support\Facades\Http::withOptions(['verify' => false])->timeout(3)->get($qrUrl);
                    if ($response->successful()) {
                        $qr_base64 = 'data:image/png;base64,' . base64_encode($response->body());
                    } else {
                        \Log::warning('QR server returned status ' . $response->status());
                    }
                } catch (\Throwable $e) {
                    \Log::error('Failed to generate QR code: ' . $e->getMessage());
                }
            }

            $companyCity = 'Jakarta';
            if ($company && $company->address) {
                $parts = explode(',', $company->address);
                if (count($parts) > 1) {
                    $companyCity = trim(end($parts));
                } else {
                    $companyCity = $company->address;
                }
            }

            $data = [
                'submission' => $submission,
                'company' => $company,
                'mentorName' => $mentorName,
                'logo_base64' => $logo_base64,
                'background_base64' => $background_base64,
                'companyCity' => $companyCity,
                'certNumber' => $certNumber,
                'issuedDate' => now()->translatedFormat('d F Y'),
                'competencies' => $competenciesData,
                'avgScore' => $avgScore,
                'evaluation' => $assessment->narrative ?? '',
                'signature_base64' => $signature_base64,

                // Customization Options
                'template_style' => $template_style,
                'logo_position' => $logo_position,
                'signature_layout' => $signature_layout,
                'signatory1_name' => $signatory1_name,
                'signatory1_title' => $signatory1_title,
                'signatory2_name' => $signatory2_name,
                'signatory2_title' => $signatory2_title,
                'signature2_base64' => $signature2_base64,
                'show_qr' => $show_qr,
                'qr_position' => $qr_position,
                'qr_base64' => $qr_base64,
                'layout_settings' => $layout_settings,
            ];

            // Globally bypass SSL validation for file_get_contents inside DomPDF font downloads
            stream_context_set_default([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ]
            ]);

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificate.template', $data)
                ->setPaper('a4', 'landscape')
                ->setOption('isRemoteEnabled', true)
                ->setOption('isHtml5ParserEnabled', true);
            
            $dompdf = $pdf->getDompdf();
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true,
                ]
            ]);
            $dompdf->setHttpContext($context);
            return @$pdf->stream('preview.pdf');
        } catch (\Throwable $e) {
            \Log::error('Certificate preview failed for submission ' . $idSubmission . ': ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return response($e->getMessage(), 500)->header('Content-Type', 'text/plain');
        }
    }

    /**
     * POST /mentor/interns/{id_submission}/send-certificate
     * Mark a certificate as sent to candidate
     */
    public function sendCertificate(Request $request, $idSubmission)
    {
        $mentorId = $request->user()->id_user;

        $submission = Submission::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
        }

        $cert = Certificate::where('id_submission', $idSubmission)->first();
        if (!$cert) {
            return response()->json(['success' => false, 'message' => 'Certificate not found'], 404);
        }

        $cert->update(['is_sent' => true]);

        return response()->json(['success' => true, 'message' => 'Certificate sent to candidate']);
    }

    /**
     * Helper: determine competency level based on hours
     */
    private function getCompetencyLevel($hours)
    {
        if ($hours <= 20)
            return 'Beginner';
        if ($hours <= 40)
            return 'Intermediate';
        return 'Advanced';
    }

    /**
     * Helper to synchronize mentor assignment for all team members
     */
    private function syncMentorTeams($mentorId)
    {
        $assignedTeams = Submission::where('id_user_mentor', $mentorId)
            ->whereNotNull('id_team')
            ->pluck('id_team')
            ->unique()
            ->toArray();

        if (!empty($assignedTeams)) {
            Submission::whereIn('id_team', $assignedTeams)
                ->where(function ($q) use ($mentorId) {
                    $q->whereNull('id_user_mentor')
                      ->orWhere('id_user_mentor', '!=', $mentorId);
                })
                ->update(['id_user_mentor' => $mentorId]);
        }
    }

    /**
     * List all custom templates for the mentor's company
     */
    public function listTemplates(Request $request)
    {
        $company = $request->user()->company;
        if (!$company) {
            return response()->json([], 404);
        }

        $templates = $company->certificate_templates ?? [];

        // Convert stored relative storage paths to full URLs for the frontend
        $formatted = array_map(function ($tpl) {
            if (!empty($tpl['background_url']) && !str_starts_with($tpl['background_url'], 'http') && !str_starts_with($tpl['background_url'], 'data:')) {
                $tpl['background_url'] = asset('storage/' . $tpl['background_url']);
            }
            if (!empty($tpl['signatory2_signature']) && !str_starts_with($tpl['signatory2_signature'], 'http') && !str_starts_with($tpl['signatory2_signature'], 'data:')) {
                $tpl['signatory2_signature'] = asset('storage/' . $tpl['signatory2_signature']);
            }
            return $tpl;
        }, $templates);

        return response()->json($formatted);
    }

    /**
     * Store a new custom template
     */
    public function storeTemplate(Request $request)
    {
        $company = $request->user()->company;
        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $request->validate([
            'name' => 'required|string',
            'template_style' => 'string',
            'logo_position' => 'string',
            'signature_layout' => 'string',
            'signatory1_name' => 'nullable|string',
            'signatory1_title' => 'nullable|string',
            'signatory2_name' => 'nullable|string',
            'signatory2_title' => 'nullable|string',
            'show_qr' => 'string', // Form data sends boolean as string
            'qr_position' => 'string',
            'layout_settings' => 'nullable|string',
        ]);

        $templates = $company->certificate_templates ?? [];

        // Prepare new template object
        $id = 'tpl_' . time() . '_' . rand(100, 999);
        $newTemplate = [
            'id' => $id,
            'name' => $request->name,
            'template_style' => $request->input('template_style', 'classic'),
            'logo_position' => $request->input('logo_position', 'center'),
            'signature_layout' => $request->input('signature_layout', 'single'),
            'signatory1_name' => $request->input('signatory1_name'),
            'signatory1_title' => $request->input('signatory1_title'),
            'signatory2_name' => $request->input('signatory2_name'),
            'signatory2_title' => $request->input('signatory2_title'),
            'show_qr' => filter_var($request->input('show_qr', true), FILTER_VALIDATE_BOOLEAN),
            'qr_position' => $request->input('qr_position', 'bottom-left'),
            'layout_settings' => json_decode($request->input('layout_settings', '{}'), true),
            'is_default' => false,
            'background_url' => null,
            'signatory2_signature' => null,
        ];

        // Handle background file upload
        if ($request->hasFile('background_file')) {
            $path = $request->file('background_file')->store('templates/backgrounds', 'public');
            $newTemplate['background_url'] = $path;
        } elseif ($request->filled('background_path')) {
            $newTemplate['background_url'] = preg_replace('/.*\/storage\//', '', $request->background_path);
        }

        // Handle signatory 2 signature upload/drawn signature
        if ($request->filled('signatory2_signature')) {
            $sigData = $request->input('signatory2_signature');
            if (str_starts_with($sigData, 'data:image')) {
                $type = explode(';', $sigData)[0];
                $type = explode('/', $type)[1];
                $dataDec = explode(',', $sigData)[1];
                $decoded = base64_decode($dataDec);

                $sigFileName = 'templates/signatures/sig2_' . Str::random(10) . '.' . $type;
                Storage::disk('public')->put($sigFileName, $decoded);
                $newTemplate['signatory2_signature'] = $sigFileName;
            } else {
                $newTemplate['signatory2_signature'] = preg_replace('/.*\/storage\//', '', $sigData);
            }
        }

        $templates[] = $newTemplate;
        $company->certificate_templates = $templates;
        $company->save();

        // Format paths to URLs for response
        if (!empty($newTemplate['background_url'])) {
            $newTemplate['background_url'] = asset('storage/' . $newTemplate['background_url']);
        }
        if (!empty($newTemplate['signatory2_signature'])) {
            $newTemplate['signatory2_signature'] = asset('storage/' . $newTemplate['signatory2_signature']);
        }

        return response()->json([
            'message' => 'Template created successfully',
            'template' => $newTemplate
        ]);
    }

    /**
     * Update an existing custom template
     */
    public function updateTemplate(Request $request, $id)
    {
        $company = $request->user()->company;
        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $request->validate([
            'name' => 'required|string',
            'template_style' => 'string',
            'logo_position' => 'string',
            'signature_layout' => 'string',
            'signatory1_name' => 'nullable|string',
            'signatory1_title' => 'nullable|string',
            'signatory2_name' => 'nullable|string',
            'signatory2_title' => 'nullable|string',
            'show_qr' => 'string',
            'qr_position' => 'string',
            'layout_settings' => 'nullable|string',
        ]);

        $templates = $company->certificate_templates ?? [];
        $foundIndex = -1;

        foreach ($templates as $index => $tpl) {
            if ($tpl['id'] === $id) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex === -1) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $existingTpl = $templates[$foundIndex];

        // Update fields
        $existingTpl['name'] = $request->name;
        $existingTpl['template_style'] = $request->input('template_style', $existingTpl['template_style'] ?? 'classic');
        $existingTpl['logo_position'] = $request->input('logo_position', $existingTpl['logo_position'] ?? 'center');
        $existingTpl['signature_layout'] = $request->input('signature_layout', $existingTpl['signature_layout'] ?? 'single');
        $existingTpl['signatory1_name'] = $request->input('signatory1_name');
        $existingTpl['signatory1_title'] = $request->input('signatory1_title');
        $existingTpl['signatory2_name'] = $request->input('signatory2_name');
        $existingTpl['signatory2_title'] = $request->input('signatory2_title');
        $existingTpl['show_qr'] = filter_var($request->input('show_qr', $existingTpl['show_qr'] ?? true), FILTER_VALIDATE_BOOLEAN);
        $existingTpl['qr_position'] = $request->input('qr_position', $existingTpl['qr_position'] ?? 'bottom-left');
        $existingTpl['layout_settings'] = json_decode($request->input('layout_settings', '{}'), true);

        // Handle custom background file upload
        if ($request->hasFile('background_file')) {
            // Delete old background file if exists
            if (!empty($existingTpl['background_url']) && !str_starts_with($existingTpl['background_url'], 'data:')) {
                $cleanPath = preg_replace('/.*\/storage\//', '', $existingTpl['background_url']);
                Storage::disk('public')->delete($cleanPath);
            }
            $path = $request->file('background_file')->store('templates/backgrounds', 'public');
            $existingTpl['background_url'] = $path;
        } elseif ($request->filled('background_path')) {
            $existingTpl['background_url'] = preg_replace('/.*\/storage\//', '', $request->background_path);
        }

        // Handle signatory 2 signature upload/drawn signature
        if ($request->filled('signatory2_signature')) {
            $sigData = $request->input('signatory2_signature');
            if (str_starts_with($sigData, 'data:image')) {
                // Delete old signature file if exists
                if (!empty($existingTpl['signatory2_signature']) && !str_starts_with($existingTpl['signatory2_signature'], 'data:')) {
                    $cleanPath = preg_replace('/.*\/storage\//', '', $existingTpl['signatory2_signature']);
                    Storage::disk('public')->delete($cleanPath);
                }
                $type = explode(';', $sigData)[0];
                $type = explode('/', $type)[1];
                $dataDec = explode(',', $sigData)[1];
                $decoded = base64_decode($dataDec);

                $sigFileName = 'templates/signatures/sig2_' . Str::random(10) . '.' . $type;
                Storage::disk('public')->put($sigFileName, $decoded);
                $existingTpl['signatory2_signature'] = $sigFileName;
            } else {
                $existingTpl['signatory2_signature'] = preg_replace('/.*\/storage\//', '', $sigData);
            }
        }

        $templates[$foundIndex] = $existingTpl;
        $company->certificate_templates = $templates;
        $company->save();

        // Format paths to URLs for response
        if (!empty($existingTpl['background_url'])) {
            $existingTpl['background_url'] = asset('storage/' . $existingTpl['background_url']);
        }
        if (!empty($existingTpl['signatory2_signature'])) {
            $existingTpl['signatory2_signature'] = asset('storage/' . $existingTpl['signatory2_signature']);
        }

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $existingTpl
        ]);
    }

    /**
     * Delete a custom template
     */
    public function destroyTemplate(Request $request, $id)
    {
        $company = $request->user()->company;
        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        $templates = $company->certificate_templates ?? [];
        $foundIndex = -1;

        foreach ($templates as $index => $tpl) {
            if ($tpl['id'] === $id) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex === -1) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $tpl = $templates[$foundIndex];

        // Delete background file
        if (!empty($tpl['background_url']) && !str_starts_with($tpl['background_url'], 'data:')) {
            $cleanPath = preg_replace('/.*\/storage\//', '', $tpl['background_url']);
            Storage::disk('public')->delete($cleanPath);
        }

        // Delete signatory2 signature file
        if (!empty($tpl['signatory2_signature']) && !str_starts_with($tpl['signatory2_signature'], 'data:')) {
            $cleanPath = preg_replace('/.*\/storage\//', '', $tpl['signatory2_signature']);
            Storage::disk('public')->delete($cleanPath);
        }

        array_splice($templates, $foundIndex, 1);
        $company->certificate_templates = $templates;
        $company->save();

        return response()->json([
            'message' => 'Template deleted successfully'
        ]);
    }
}
