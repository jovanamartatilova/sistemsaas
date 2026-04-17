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

        // Get all submissions where this user is mentor
        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position'])
            ->get();

        $totalInterns = $submissions->count();

        // Calculate detailed metrics from Assessment table
        $needsInput = 0;  // No assessment exists
        $passedCount = 0; // Assessment exists = evaluated/passed
        $avgScores = [];
        $recentInterns = [];

        foreach ($submissions as $sub) {
            // Get assessment data
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();

            // Status is determined by Assessment existence
            if (!$assessment) {
                // No Assessment = Needs Input
                $needsInput++;
                continue;
            }

            // Assessment exists = Passed/Evaluated
            $passedCount++;

            $scoresData = $assessment->scores_data ?? [];
            $scoredScores = array_filter($scoresData, fn($s) => $s['score'] !== null);

            // Calculate avg score for this intern
            $avgScore = count($scoredScores) > 0 ? round(array_sum(array_column($scoredScores, 'score')) / count($scoredScores), 1) : null;
            if ($avgScore !== null) {
                $avgScores[] = $avgScore;
            }

            // Collect for recent interns
            $recentInterns[] = [
                'id_submission' => $sub->id_submission,
                'name' => $sub->user->name,
                'email' => $sub->user->email,
                'position' => $sub->position->name ?? 'N/A',
                'avg_score' => $avgScore,
            ];
        }

        // Ready for Certificate: Same as passed
        $readyForCert = $passedCount;

        // Calculate overall average score
        $avgScore = count($avgScores) > 0 ? round(array_sum($avgScores) / count($avgScores), 1) : 0;

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

        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position', 'vacancy'])
            ->get();

        $interns = $submissions->map(function ($sub) {
            // Get scores from Assessment (not Submission)
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();
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
            // Passed: Assessment exists
            // In Progress: No assessment but assignment ongoing
            // Just Started: No assessment and no progress
            $status = 'Just Started';
            $statusBg = '#f1f5f9';
            $statusColor = '#64748b';
            $dot = '#94a3b8';

            // If assessment exists, always show as Passed (evaluated)
            if ($assessment) {
                $status = 'Passed';
                $statusBg = '#dcfce7';
                $statusColor = '#166534';
                $dot = '#22c55e';
            } elseif ($totalComps === 0 || $avgScore === null) {
                // No assessment yet
                $status = 'Just Started';
                $statusBg = '#f1f5f9';
                $statusColor = '#64748b';
                $dot = '#94a3b8';
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

            // Calculate total hours from learning_hours of evaluated competencies (passed or failed)
            $totalHours = 0;
            foreach ($scoresData as $score) {
                if ($score['status'] === 'passed' || $score['status'] === 'failed') {
                    $totalHours += $score['learning_hours'] ?? 0;
                }
            }

            // Determine status based on Assessment existence
            if ($assessment) {
                // Assessment exists = Passed/Evaluated
                $status = 'Passed';
                $statusBg = '#dcfce7';
                $statusColor = '#166534';
            } elseif ($avgScore === null) {
                // No assessment and no scores
                $status = 'Just Started';
                $statusBg = '#f1f5f9';
                $statusColor = '#64748b';
            } else {
                // Has scores but no assessment yet
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

        // Update submission with evaluation data
        $submission->update([
            'narrative' => $request->narrative,
            'recommendation' => $request->recommendation,
            'evaluation_status' => 'reviewed',
        ]);

        // Also save/update Assessment record with evaluation data
        $assessment = Assessment::where('id_submission', $idSubmission)->first();
        if ($assessment) {
            $assessment->update([
                'narrative' => $request->narrative,
                'recommendation' => $request->recommendation,
                'evaluation_status' => 'reviewed',
            ]);
        } else {
            // Create new assessment record if doesn't exist
            Assessment::create([
                'id_assessment' => (string) Str::uuid(),
                'id_submission' => $idSubmission,
                'id_user' => $submission->id_user,
                'id_user_mentor' => $mentorId,
                'narrative' => $request->narrative,
                'recommendation' => $request->recommendation,
                'evaluation_status' => 'reviewed',
                'scores_data' => [], // Empty array, will be populated by scores submission
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

        $submissions = Submission::where('id_user_mentor', $mentorId)
            ->with(['user', 'position'])
            ->get();

        // Create stat cards
        $passed = 0;
        $notPassed = 0;

        foreach ($submissions as $sub) {
            // Get scores from Assessment (not Submission)
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();
            $scoresData = $assessment->scores_data ?? [];
            $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;

            if ($avgScore !== null && $avgScore >= 75) {
                $passed++;
            } else {
                $notPassed++;
            }
        }

        $stats = [
            ['value' => $passed, 'label' => 'Passed', 'barColor' => '#22c55e', 'barWidth' => min(100, $passed * 20) . '%'],
            ['value' => $notPassed, 'label' => 'Not Passed', 'barColor' => '#ef4444', 'barWidth' => min(100, $notPassed * 20) . '%'],
        ];

        // Create certificates list
        $certificates = $submissions->map(function ($sub) {
            // Get scores from Assessment (not Submission)
            $assessment = Assessment::where('id_submission', $sub->id_submission)->first();
            $scoresData = $assessment->scores_data ?? [];
            $scores = array_filter($scoresData, fn($s) => $s['score'] !== null);
            $avgScore = count($scores) > 0 ? round(array_sum(array_column($scores, 'score')) / count($scores), 1) : null;

            $status = ($avgScore !== null && $avgScore >= 75) ? 'Passed' : 'Not Passed';
            $statusBg = $status === 'Passed' ? '#dcfce7' : '#fecaca';
            $statusColor = $status === 'Passed' ? '#166534' : '#991b1b';
            $fileUrl = null;

            $cert = Certificate::where('id_submission', $sub->id_submission)->first();
            if ($cert) {
                $status = 'Generated';
                $statusBg = '#ccfbf1';
                $statusColor = '#0f766e';
                $fileUrl = $cert->file_path ? asset('storage/' . $cert->file_path) : null;
            }

            return [
                'id_submission' => $sub->id_submission,
                'name' => $sub->user->name,
                'position' => $sub->position->name ?? 'N/A',
                'program' => $sub->vacancy->title ?? 'N/A',
                'score' => $avgScore,
                'status' => $status,
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
                'file_url' => $fileUrl,
                'is_sent' => $cert ? (bool)$cert->is_sent : false,
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
                // Determine predicate based on score
                $predicate = 'Kurang';
                if ($s['score'] >= 85) {
                    $predicate = 'Sangat Baik';
                } elseif ($s['score'] >= 75) {
                    $predicate = 'Baik';
                } elseif ($s['score'] >= 65) {
                    $predicate = 'Cukup';
                }

                $competenciesData[] = [
                    'name' => $comp->name,
                    'description' => $comp->description,
                    'hours' => $comp->learning_hours,
                    'score' => $s['score'],
                    'predicate' => $predicate,
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

        $companyCity = 'Jakarta';
        if ($company && $company->address) {
            $parts = explode(',', $company->address);
            if (count($parts) > 1) {
                $companyCity = trim(end($parts));
            } else {
                $companyCity = $company->address;
            }
        }

        $idCert = $certExists ? $certExists->id_certificate : 'CERT' . strtoupper(Str::random(6));
        $filePath = 'certificates/' . $idCert . '.pdf';

        $data = [
            'submission' => $submission,
            'company' => $company,
            'mentorName' => $mentorName,
            'logo_base64' => $logo_base64,
            'companyCity' => $companyCity,
            'certNumber' => $certNumber,
            'issuedDate' => now()->translatedFormat('d F Y'),
            'competencies' => $competenciesData,
            'avgScore' => $avgScore,
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificate.template', $data)->setPaper('a4', 'landscape');
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
            ]
        );

        return response()->json([
            'message' => 'Certificate generated successfully',
            'file_url' => asset('storage/' . $filePath)
        ]);
    }

    public function previewCertificate(Request $request, $idSubmission)
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
                $predicate = 'Kurang';
                if ($s['score'] >= 85) $predicate = 'Sangat Baik';
                elseif ($s['score'] >= 75) $predicate = 'Baik';
                elseif ($s['score'] >= 65) $predicate = 'Cukup';

                $competenciesData[] = [
                    'name' => $comp->name,
                    'description' => $comp->description,
                    'hours' => $comp->learning_hours,
                    'score' => $s['score'],
                    'predicate' => $predicate,
                ];
            }
        }

        $certNumber = 'PREVIEW/' . now()->year . '/000';

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
            'companyCity' => $companyCity,
            'certNumber' => $certNumber,
            'issuedDate' => now()->translatedFormat('d F Y'),
            'competencies' => $competenciesData,
            'avgScore' => $avgScore,
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificate.template', $data)->setPaper('a4', 'landscape');
        return @$pdf->stream('preview.pdf');
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
        if ($hours <= 20) return 'Beginner';
        if ($hours <= 40) return 'Intermediate';
        return 'Advanced';
    }
}
