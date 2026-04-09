<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Assessment;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
     * Get dashboard statistics for mentor
     */
    public function getDashboard(Request $request)
    {
        $mentorId = $request->user()->id_user;

        // Get all submissions where this user is mentor
        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position'])
            ->get();

        $totalInterns = $submissions->count();

        // Count passed interns (evaluation_status = reviewed, recommen = pass)
        $passedCount = $submissions->where('evaluation_status', 'reviewed')
            ->where('recommendation', 'Recommended to Pass')
            ->count();

        $inProgressCount = $totalInterns - $passedCount;

        // Format recent interns
        $recentInterns = $submissions->map(function ($sub) {
            $scoresData = $sub->scores_data ?? [];
            $avgScore = null;
            if (!empty($scoresData)) {
                $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
                $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;
            }

            return [
                'id_submission' => $sub->id_submission,
                'name' => $sub->user->name,
                'email' => $sub->user->email,
                'position' => $sub->position->name ?? 'N/A',
                'avg_score' => $avgScore,
            ];
        })->take(5);

        return response()->json([
            'total_interns' => $totalInterns,
            'interns_passed' => $passedCount,
            'in_progress' => $inProgressCount,
            'recent_interns' => $recentInterns,
        ]);
    }

    /**
     * Get list of interns for this mentor
     */
    public function getInterns(Request $request)
    {
        $mentorId = $request->user()->id_user;

        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position', 'vacancy'])
            ->get();

        $interns = $submissions->map(function ($sub) {
            // Get scores from Assessment (not Submission)
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();
            $scoresData = $assessment->scores_data ?? [];
            $completedComps = 0;
            $totalComps = count($scoresData);

            foreach ($scoresData as $score) {
                if ($score['status'] === 'passed' || $score['status'] === 'failed') {
                    $completedComps++;
                }
            }

            $progress = $totalComps > 0 ? round(($completedComps / $totalComps) * 100) : 0;

            $avgScore = null;
            if (!empty($scoresData)) {
                $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
                $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;
            }

            // Determine status
            $status = 'Just Started';
            $statusBg = '#f1f5f9';
            $statusColor = '#64748b';
            $dot = '#94a3b8';

            if ($avgScore !== null) {
                if ($avgScore >= 75 && $completedComps === $totalComps) {
                    $status = 'Passed';
                    $statusBg = '#dcfce7';
                    $statusColor = '#166534';
                    $dot = '#22c55e';
                } else {
                    $status = 'In Progress';
                    $statusBg = '#fef9c3';
                    $statusColor = '#92400e';
                    $dot = '#f59e0b';
                }
            }

            // Get program and period from vacancy
            $program = $sub->vacancy ? ($sub->vacancy->title ?? 'Regular Batch') : 'Regular Batch';
            $period = 'Jan - Apr 2026'; // Default, can be updated from vacancy if date fields exist
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
                'hours' => $comp->learning_hours,
                'score' => $score ? $score['score'] : null,
                'hours_completed' => $score ? $score['hours_completed'] : null,
                'status' => $score ? $score['status'] : 'pending',
                'notes' => $score ? $score['notes'] : null,
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
            ]);

            $mentorId = $request->user()->id_user;

            // Verify submission belongs to this mentor
            $submission = Submission::where('id_submission', $idSubmission)
                ->where('id_user_mentor', $mentorId)
                ->firstOrFail();

            // Prepare scores data
            $scoresData = [];
            foreach ($validated['scores'] as $scoreData) {
                $scoresData[] = [
                    'id_competency' => $scoreData['id_competency'],
                    'score' => $scoreData['score'] ?? null,
                    'hours_completed' => $scoreData['hours_completed'] ?? 0,
                    'status' => $scoreData['status'] ?? 'pending',
                    'notes' => $scoreData['notes'] ?? null,
                ];
            }

            \Log::info('Updating scores for submission', [
                'submission_id' => $idSubmission,
                'mentor_id' => $mentorId,
                'scores_count' => count($scoresData),
                'scores_data' => $scoresData,
            ]);

            // Create or update Assessment (not Submission)
            $assessment = Assessment::firstOrCreate(
                ['id_submission' => $idSubmission],
                [
                    'id_assessment' => \Illuminate\Support\Str::random(10),
                    'id_user' => $submission->id_user,
                    'id_user_mentor' => $mentorId,
                ]
            );

            $assessment->update([
                'scores_data' => $scoresData,
            ]);

            \Log::info('Scores updated successfully in Assessment', [
                'submission_id' => $idSubmission,
                'assessment_id' => $assessment->id_assessment,
                'scores_data' => $assessment->fresh()->scores_data,
            ]);

            return response()->json([
                'message' => 'Scores saved successfully',
                'submission_id' => $idSubmission,
                'scores_count' => count($scoresData),
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

        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position'])
            ->get();

        // Create stat cards
        $allScores = [];
        $passedCount = 0;
        $incompleteCount = 0;

        foreach ($submissions as $sub) {
            // Get scores from Assessment (not Submission)
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();
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

        // Create recap data
        $recap = $submissions->map(function ($sub) {
            // Get scores from Assessment (not Submission)
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();
            $scoresData = $assessment->scores_data ?? [];
            $completedScores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($completedScores) > 0 ? round(array_sum(array_column($completedScores, 'score')) / count($completedScores), 1) : null;
            $scoredCount = count($completedScores);
            $totalComps = count($scoresData);
            $totalHours = array_sum(array_column($scoresData, 'hours_completed'));

            // Determine status
            if ($avgScore === null) {
                $status = 'Just Started';
                $statusBg = '#f1f5f9';
                $statusColor = '#64748b';
            } elseif ($avgScore >= 75) {
                $status = 'Passed';
                $statusBg = '#dcfce7';
                $statusColor = '#166534';
            } else {
                $status = 'In Progress';
                $statusBg = '#fef9c3';
                $statusColor = '#92400e';
            }

            return [
                'name' => $sub->user->name,
                'position' => $sub->position->name ?? 'N/A',
                'program' => 'Regular Batch 3',
                'type' => !empty($sub->id_team) ? 'Team' : 'Individual',
                'scored' => "$scoredCount/$totalComps",
                'hours' => "$totalHours hrs",
                'avg' => $avgScore,
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

        return response()->json([
            'narrative' => $submission->narrative ?? '',
            'recommendation' => $submission->recommendation ?? 'Recommended to Pass',
            'status' => $submission->evaluation_status ?? 'draft',
        ]);
    }

    /**
     * Save/update evaluation
     */
    public function saveEvaluation(Request $request, $idSubmission)
    {
        $request->validate([
            'narrative' => 'required|string',
            'recommendation' => 'required|in:Recommended to Pass,Not Recommended,Extension Required',
        ]);

        $mentorId = $request->user()->id_user;

        // Verify submission belongs to this mentor
        $submission = Submission::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->firstOrFail();

        $submission->update([
            'narrative' => $request->narrative,
            'recommendation' => $request->recommendation,
            'evaluation_status' => 'submitted',
        ]);

        return response()->json(['message' => 'Evaluation saved successfully']);
    }

    /**
     * Get certificates list
     */
    public function getCertificates(Request $request)
    {
        $mentorId = $request->user()->id_user;

        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position'])
            ->get();

        // Create stat cards
        $readyToGenerate = 0;
        $generated = 0;
        $inQueue = 0;

        foreach ($submissions as $sub) {
            $scoresData = $sub->scores_data ?? [];
            if (empty($scoresData)) {
                $inQueue++;
            } elseif (count(array_filter($scoresData, fn($s) => $s['score'] >= 75)) === count($scoresData)) {
                $generated++;
            } else {
                $readyToGenerate++;
            }
        }

        $stats = [
            ['value' => $readyToGenerate, 'label' => 'Ready to Generate', 'barColor' => '#22c55e', 'barWidth' => '62%'],
            ['value' => $generated, 'label' => 'Generated', 'barColor' => '#14b8a6', 'barWidth' => '37%'],
            ['value' => $inQueue, 'label' => 'In Queue', 'barColor' => '#8b5cf6', 'barWidth' => '25%'],
        ];

        // Create certificates list
        $certificates = $submissions->map(function ($sub) {
            $scoresData = $sub->scores_data ?? [];
            $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;

            $status = $avgScore === null ? 'Not Passed' : ($avgScore >= 75 ? 'Generated' : 'In Queue');

            return [
                'id_submission' => $sub->id_submission,
                'name' => $sub->user->name,
                'position' => $sub->position->name ?? 'N/A',
                'program' => 'Regular Batch 3',
                'score' => $avgScore,
                'status' => $status,
                'statusBg' => $status === 'Generated' ? '#eff6ff' : ($status === 'In Queue' ? '#f5f3ff' : '#f1f5f9'),
                'statusColor' => $status === 'Generated' ? '#1e40af' : ($status === 'In Queue' ? '#7c3aed' : '#64748b'),
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
        $mentorId = $request->user()->id_user;

        // Verify submission belongs to this mentor
        $submission = Submission::where('id_submission', $idSubmission)
            ->where('id_user_mentor', $mentorId)
            ->firstOrFail();

        // Calculate average score
        $scoresData = $submission->scores_data ?? [];
        $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
        $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 2) : 0;

        // Create or update certificate
        $certificate = Certificate::updateOrCreate(
            ['id_submission' => $idSubmission],
            [
                'id_user' => $submission->id_user,
                'final_score' => $avgScore,
                'issued_date' => now(),
                'status' => 'generated',
            ]
        );

        return response()->json(['message' => 'Certificate generated successfully']);
    }

    /**
     * Helper: determine competency level based on hours
     */
    private function getCompetencyLevel($hours)
    {
        if ($hours <= 20) return 'Beginner';
        if ($hours <= 40) return 'Intermediate';
        return 'Advanced';
    }
}
