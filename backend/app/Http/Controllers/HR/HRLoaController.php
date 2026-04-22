<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Loa;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class HRLoaController extends Controller
{
    /**
     * GET /hr/loa
     * List kandidat accepted beserta status LoA
     */
    public function index(Request $request)
{
    try {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
        }
        
        $companyId = $user->id_company;
        if (!$companyId) {
            return response()->json(['success' => false, 'message' => 'User does not have company'], 403);
        }

        $search = $request->get('search');

        $submissionsQuery = Submission::where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user', 'position', 'vacancy', 'loa']);
        
        if ($search) {
            $submissionsQuery->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $submissions = $submissionsQuery->get()
            ->map(fn($s) => $this->formatLoa($s));

        $base = Submission::where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId));

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'accepted'    => (clone $base)->count(),
                    'generated'   => (clone $base)->whereHas('loa')->count(),
                    'pending'     => (clone $base)->whereDoesntHave('loa')->count(),
                ],
                'candidates' => $submissions,
            ],
        ]);
    } catch (\Exception $e) {
        \Log::error('HRLoaController@index error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
    }
}

    /**
     * POST /hr/loa/{id_submission}/generate
     * Generate LoA untuk satu kandidat
     */
    public function generate(Request $request, string $id)
    {
        $companyId = $request->user()->id_company;

        $submission = Submission::where('id_submission', $id)
            ->where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user', 'position', 'vacancy.company'])
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found or not accepted'], 404);
        }

        $year      = now()->year;

        if ($submission->id_team) {
            $acceptedSubmissions = Submission::where('id_team', $submission->id_team)
                ->where('id_vacancy', $submission->id_vacancy)
                ->where('status', 'accepted')
                ->with(['user', 'position', 'vacancy.company', 'loa'])
                ->get();
                
            $teamMembersRoles = \Illuminate\Support\Facades\DB::table('team_members')
                ->where('id_team', $submission->id_team)
                ->pluck('role', 'id_user');

            $team_members_raw = $acceptedSubmissions->map(function($sub) use ($teamMembersRoles) {
                return [
                    'name' => $sub->user->name,
                    'position' => $sub->position ? $sub->position->name : '-',
                    'role' => $teamMembersRoles[$sub->id_user] ?? 'member',
                    'updated_at' => $sub->updated_at,
                ];
            })->toArray();

            usort($team_members_raw, function($a, $b) {
                if ($a['role'] === 'leader' && $b['role'] !== 'leader') return -1;
                if ($b['role'] === 'leader' && $a['role'] !== 'leader') return 1;
                return strtotime($a['updated_at']) - strtotime($b['updated_at']);
            });

            $team_members = $team_members_raw;

            $team = \App\Models\Team::where('id_team', $submission->id_team)->first();
            $team_name = $team ? $team->name : 'Tim Kandidat';
            
            $existingLoa = Loa::whereIn('id_submission', $acceptedSubmissions->pluck('id_submission'))
                ->whereNotNull('letter_number')
                ->first();
                
            if ($existingLoa) {
                $loaNumber = $existingLoa->letter_number;
            } else {
                $lastCount = Loa::whereYear('created_at', $year)->count() + 1;
                $loaNumber = 'LOA/' . $year . '/' . str_pad($lastCount, 3, '0', STR_PAD_LEFT);
            }
            
            $idLoa = 'LOA' . strtoupper(Str::random(7));
            $filePath = 'loas/' . $idLoa . '.pdf';
            
            $dummyLoa = new Loa([
                'id_loa'        => $idLoa,
                'letter_number' => $loaNumber,
                'signed_by'     => $request->user()->name,
                'issued_date'   => now()->toDateString(),
                'file_path'     => $filePath,
            ]);
            
            $this->generatePdfForTeamLoa($dummyLoa, $submission, $team_name, $team_members);
            
            foreach ($acceptedSubmissions as $ts) {
                if ($ts->loa) {
                    $ts->loa->update(['file_path' => $filePath, 'letter_number' => $loaNumber, 'issued_date' => now()->toDateString(), 'is_sent' => false]);
                } else {
                    Loa::create([
                        'id_loa'        => 'LOA' . strtoupper(Str::random(7)),
                        'id_submission' => $ts->id_submission,
                        'letter_number' => $loaNumber,
                        'signed_by'     => $request->user()->name,
                        'issued_date'   => now()->toDateString(),
                        'file_path'     => $filePath,
                    ]);
                }
            }
        } else {
            if ($submission->loa) {
                $loa = $submission->loa;
                $loa->update([
                    'signed_by'     => $request->user()->name,
                    'issued_date'   => now()->toDateString(),
                    'is_sent'       => false,
                ]);
            } else {
                $lastCount = Loa::whereYear('created_at', $year)->count() + 1;
                $loaNumber = 'LOA/' . $year . '/' . str_pad($lastCount, 3, '0', STR_PAD_LEFT);

                $idLoa = 'LOA' . strtoupper(Str::random(7));
                $filePath = 'loas/' . $idLoa . '.pdf';

                $loa = Loa::create([
                    'id_loa'        => $idLoa,
                    'id_submission' => $submission->id_submission,
                    'letter_number' => $loaNumber,
                    'signed_by'     => $request->user()->name,
                    'issued_date'   => now()->toDateString(),
                    'file_path'     => $filePath,
                ]);
            }

            $this->generatePdfForLoa($loa, $submission);
        }

        return response()->json([
            'success' => true,
            'message' => 'LoA generated',
            'data'    => $this->formatLoa($submission->fresh(['user', 'position', 'vacancy', 'loa'])),
        ], 201);
    }

    /**
     * POST /hr/loa/bulk-generate
     * Generate LoA untuk semua kandidat accepted yang belum punya LoA
     */
    public function bulkGenerate(Request $request)
    {
        $companyId = $request->user()->id_company;

        $submissions = Submission::where('status', 'accepted')
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->whereDoesntHave('loa')
            ->with(['user', 'position', 'vacancy'])
            ->get();

        if ($submissions->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No pending LoA to generate'], 422);
        }

        $teams = [];
        $individuals = [];
        
        foreach ($submissions as $sub) {
            if ($sub->id_team) {
                $key = $sub->id_team . '_' . $sub->id_vacancy;
                if (!isset($teams[$key])) {
                    $teams[$key] = $sub; 
                }
            } else {
                $individuals[] = $sub;
            }
        }

        $year    = now()->year;
        $counter = Loa::whereYear('created_at', $year)->count();

        // Process Individuals
        foreach ($individuals as $submission) {
            $counter++;
            $loaNumber = 'LOA/' . $year . '/' . str_pad($counter, 3, '0', STR_PAD_LEFT);

            $idLoa = 'LOA' . strtoupper(Str::random(7));
            $filePath = 'loas/' . $idLoa . '.pdf';

            $loa = Loa::create([
                'id_loa'        => $idLoa,
                'id_submission' => $submission->id_submission,
                'letter_number' => $loaNumber,
                'signed_by'     => $request->user()->name,
                'issued_date'   => now()->toDateString(),
                'file_path'     => $filePath,
            ]);

            $this->generatePdfForLoa($loa, $submission);
        }

        // Process Teams
        foreach ($teams as $teamSub) {
            $acceptedSubmissions = Submission::where('id_team', $teamSub->id_team)
                ->where('id_vacancy', $teamSub->id_vacancy)
                ->where('status', 'accepted')
                ->with(['user', 'position', 'vacancy.company', 'loa'])
                ->get();
                
            $teamMembersRoles = \Illuminate\Support\Facades\DB::table('team_members')
                ->where('id_team', $teamSub->id_team)
                ->pluck('role', 'id_user');

            $team_members_raw = $acceptedSubmissions->map(function($sub) use ($teamMembersRoles) {
                return [
                    'name' => $sub->user->name,
                    'position' => $sub->position ? $sub->position->name : '-',
                    'role' => $teamMembersRoles[$sub->id_user] ?? 'member',
                    'updated_at' => $sub->updated_at,
                ];
            })->toArray();

            usort($team_members_raw, function($a, $b) {
                if ($a['role'] === 'leader' && $b['role'] !== 'leader') return -1;
                if ($b['role'] === 'leader' && $a['role'] !== 'leader') return 1;
                return strtotime($a['updated_at']) - strtotime($b['updated_at']);
            });

            $team_members = $team_members_raw;

            $team = \App\Models\Team::where('id_team', $teamSub->id_team)->first();
            $team_name = $team ? $team->name : 'Tim Kandidat';
            
            $existingLoa = Loa::whereIn('id_submission', $acceptedSubmissions->pluck('id_submission'))
                ->whereNotNull('letter_number')
                ->first();
                
            if ($existingLoa) {
                $loaNumber = $existingLoa->letter_number;
            } else {
                $counter++;
                $loaNumber = 'LOA/' . $year . '/' . str_pad($counter, 3, '0', STR_PAD_LEFT);
            }
            
            $idLoa = 'LOA' . strtoupper(Str::random(7));
            $filePath = 'loas/' . $idLoa . '.pdf';
            
            $dummyLoa = new Loa([
                'id_loa'        => $idLoa,
                'letter_number' => $loaNumber,
                'signed_by'     => $request->user()->name,
                'issued_date'   => now()->toDateString(),
                'file_path'     => $filePath,
            ]);
            
            $this->generatePdfForTeamLoa($dummyLoa, $teamSub, $team_name, $team_members);
            
            foreach ($acceptedSubmissions as $ts) {
                if ($ts->loa) {
                    $ts->loa->update(['file_path' => $filePath, 'letter_number' => $loaNumber, 'issued_date' => now()->toDateString()]);
                } else {
                    Loa::create([
                        'id_loa'        => 'LOA' . strtoupper(Str::random(7)),
                        'id_submission' => $ts->id_submission,
                        'letter_number' => $loaNumber,
                        'signed_by'     => $request->user()->name,
                        'issued_date'   => now()->toDateString(),
                        'file_path'     => $filePath,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => $submissions->count() . ' LoA generated',
        ]);
    }

    /**
     * GET /hr/loa/{id_submission}/download
     * Download file LoA
     */
    public function download(Request $request, string $id)
    {
        $companyId = $request->user()->id_company;

        $submission = Submission::where('id_submission', $id)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with('loa')
            ->first();

        if (!$submission || !$submission->loa) {
            return response()->json(['success' => false, 'message' => 'LoA not found'], 404);
        }

        if (!$submission->loa->file_path || !Storage::disk('public')->exists($submission->loa->file_path)) {
            return response()->json(['success' => false, 'message' => 'File not yet generated'], 404);
        }

        return Storage::disk('public')->download($submission->loa->file_path);
    }

    // ── HELPERS ─────────────────────────────────────────────

    private function generatePdfForLoa(Loa $loa, Submission $submission)
    {
        $company = $submission->vacancy->company;
        
        $logo_base64 = null;
        if ($company->logo_path) {
            $logoPath = storage_path('app/public/' . $company->logo_path);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logo_base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $companyCity = 'Jakarta';
        if ($company->address) {
            $parts = explode(',', $company->address);
            if (count($parts) > 1) {
                // assume city might be the last or second last part
                $companyCity = trim(end($parts));
            } else {
                $companyCity = $company->address;
            }
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('loa.template', compact('submission', 'loa', 'company', 'logo_base64', 'companyCity'));
        
        $filePath = $loa->file_path;
        Storage::disk('public')->put($filePath, $pdf->output());
    }

    private function generatePdfForTeamLoa(Loa $loa, Submission $submission, string $team_name, array $team_members)
    {
        $company = $submission->vacancy->company;
        
        $logo_base64 = null;
        if ($company->logo_path) {
            $logoPath = storage_path('app/public/' . $company->logo_path);
            if (file_exists($logoPath)) {
                $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                $data = file_get_contents($logoPath);
                $logo_base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        }

        $companyCity = 'Jakarta';
        if ($company->address) {
            $parts = explode(',', $company->address);
            if (count($parts) > 1) {
                $companyCity = trim(end($parts));
            } else {
                $companyCity = $company->address;
            }
        }
        
        $position_name = $submission->position ? $submission->position->name : '';
        $program_title = $submission->vacancy->title;
        $internship_type = $submission->vacancy->type;
        $start_date = $submission->vacancy->start_date;
        $end_date = $submission->vacancy->end_date;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('loa.template_team', compact(
            'loa', 'company', 'logo_base64', 'companyCity',
            'team_name', 'team_members', 'position_name', 'program_title',
            'internship_type', 'start_date', 'end_date'
        ));
        
        $filePath = $loa->file_path; // should already have 'loas/...'
        Storage::disk('public')->put($filePath, $pdf->output());
    }

    private function formatLoa(Submission $s): array
    {
        $hasPending = false;
        if ($s->id_team) {
            $hasPending = Submission::where('id_team', $s->id_team)
                ->where('id_vacancy', $s->id_vacancy)
                ->whereNotIn('status', ['accepted', 'rejected'])
                ->exists();
        }

        return [
            'id_submission' => $s->id_submission,
            'name'          => $s->user?->name,
            'email'         => $s->user?->email,
            'position'      => $s->position?->name,
            'program'       => $s->vacancy?->title,
            'type'          => $s->vacancy?->type,
            'loa_status'    => $s->loa ? 'generated' : 'pending',
            'loa_number'    => $s->loa?->letter_number,
            'issued_date'   => $s->loa?->issued_date,
            'signed_by'     => $s->loa?->signed_by,
            'has_file'      => !empty($s->loa?->file_path),
            'file_url'      => $s->loa && $s->loa->file_path ? asset('storage/' . $s->loa->file_path) : null,
            'is_team'       => !empty($s->id_team),
            'has_pending_team_members' => $hasPending,
            'id_team'       => $s->id_team,
            'is_sent'       => $s->loa ? (bool)$s->loa->is_sent : false,
        ];
    }

    /**
     * POST /hr/loa/{id_submission}/send
     * Mark a LoA as sent to candidate
     */
    public function sendLoa(Request $request, string $id)
    {
        try {
            $companyId = $request->user()->id_company;

            $submission = Submission::where('id_submission', $id)
                ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
                ->with('loa')
                ->first();

            if (!$submission || !$submission->loa) {
                return response()->json(['success' => false, 'message' => 'LoA not found'], 404);
            }

            $submission->loa->update(['is_sent' => true]);

            return response()->json(['success' => true, 'message' => 'LoA sent to candidate']);
        } catch (\Exception $e) {
            \Log::error('sendLoa error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}