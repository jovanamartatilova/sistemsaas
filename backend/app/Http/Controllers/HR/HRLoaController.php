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

            $submissions = Submission::where('status', 'accepted')
                ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
                ->with(['user', 'position', 'vacancy', 'loa'])
                ->get()
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

        // Cek kalau sudah di-generate
        if ($submission->loa) {
            return response()->json(['success' => false, 'message' => 'LoA already generated'], 422);
        }

        // Generate nomor surat — format: LOA/{YEAR}/{INCREMENT}
        $year      = now()->year;
        $lastCount = Loa::whereYear('created_at', $year)->count() + 1;
        $loaNumber = 'LOA/' . $year . '/' . str_pad($lastCount, 3, '0', STR_PAD_LEFT);

        $loa = Loa::create([
            'id_loa'        => 'LOA' . strtoupper(Str::random(7)),
            'id_submission' => $submission->id_submission,
            'letter_number' => $loaNumber,
            'signed_by'     => $request->user()->name,
            'issued_date'   => now()->toDateString(),
            'file_path'     => null, // nanti diisi setelah generate PDF
        ]);

        // TODO: generate PDF pakai barryvdh/laravel-dompdf
        // $pdf      = PDF::loadView('loa.template', compact('submission', 'loa'));
        // $filePath = 'loas/' . $loa->id_loa . '.pdf';
        // Storage::disk('public')->put($filePath, $pdf->output());
        // $loa->update(['file_path' => $filePath]);

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

        $year    = now()->year;
        $counter = Loa::whereYear('created_at', $year)->count();

        foreach ($submissions as $submission) {
            $counter++;
            $loaNumber = 'LOA/' . $year . '/' . str_pad($counter, 3, '0', STR_PAD_LEFT);

            Loa::create([
                'id_loa'        => 'LOA' . strtoupper(Str::random(7)),
                'id_submission' => $submission->id_submission,
                'letter_number' => $loaNumber,
                'signed_by'     => $request->user()->name,
                'issued_date'   => now()->toDateString(),
                'file_path'     => null,
            ]);
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

    private function formatLoa(Submission $s): array
    {
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
        ];
    }
}