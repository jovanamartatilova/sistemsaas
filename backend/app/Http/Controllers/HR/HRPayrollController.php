<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HRPayrollController extends Controller
{
    /**
     * GET /hr/payroll
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;
        $period    = $request->get('period', now()->format('Y-m'));

        $payrolls = Payroll::where('period', $period)
            ->whereHas('submission.vacancy', fn($q) =>
                $q->where('id_company', $companyId)
            )
            ->with(['submission.user', 'submission.position', 'submission.vacancy'])
            ->get();

        $totalDisbursed = $payrolls->where('status', 'paid')->sum('stipend_amount');

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'paid_interns'     => $payrolls->count(),
                    'paid_this_month'  => $payrolls->where('status', 'paid')->count(),
                    'pending_payment'  => $payrolls->where('status', 'pending')->count(),
                    'total_disbursed'  => $totalDisbursed,
                    'total_disbursed_formatted' => 'Rp ' . number_format($totalDisbursed / 1000000, 1) . 'M',
                ],
                'period'   => $period,
                'payrolls' => $payrolls->map(fn($p) => $this->formatPayroll($p)),
            ],
        ]);
    }

    /**
     * POST /hr/payroll
     * Tambah data payroll untuk satu intern
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_submission'  => 'required|string|exists:submissions,id_submission',
            'stipend_amount' => 'required|integer|min:0',
            'bank_name'      => 'required|string|max:50',
            'bank_account'   => 'required|string|max:50',
            'account_holder' => 'required|string|max:100',
            'period'         => 'required|string|size:7', // format: 2026-03
        ]);

        $companyId  = $request->user()->id_company;
        $submission = Submission::where('id_submission', $request->id_submission)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
        }

        // Cek duplikat periode
        $exists = Payroll::where('id_submission', $request->id_submission)
            ->where('period', $request->period)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Payroll for this period already exists'], 422);
        }

        $payroll = Payroll::create([
            'id_payroll'     => 'PAY' . strtoupper(Str::random(7)),
            'id_submission'  => $request->id_submission,
            'stipend_amount' => $request->stipend_amount,
            'bank_name'      => $request->bank_name,
            'bank_account'   => $request->bank_account,
            'account_holder' => $request->account_holder,
            'period'         => $request->period,
            'status'         => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payroll created',
            'data'    => $this->formatPayroll($payroll->load(['submission.user', 'submission.position'])),
        ], 201);
    }

    /**
     * PATCH /hr/payroll/{id}/pay
     * Tandai sebagai paid
     */
    public function pay(Request $request, string $id)
    {
        $payroll = $this->findPayroll($id, $request->user()->id_company);

        if (!$payroll) {
            return response()->json(['success' => false, 'message' => 'Payroll not found'], 404);
        }

        if ($payroll->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Already paid'], 422);
        }

        $payroll->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment marked as paid',
            'data'    => $this->formatPayroll($payroll->fresh(['submission.user', 'submission.position'])),
        ]);
    }

    /**
     * GET /hr/payroll/export
     */
    public function exportCsv(Request $request)
    {
        $companyId = $request->user()->id_company;
        $period    = $request->get('period', now()->format('Y-m'));

        $payrolls = Payroll::where('period', $period)
            ->whereHas('submission.vacancy', fn($q) =>
                $q->where('id_company', $companyId)
            )
            ->with(['submission.user', 'submission.position'])
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"payroll-{$period}.csv\"",
        ];

        $callback = function () use ($payrolls) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Name', 'Email', 'Position', 'Stipend', 'Bank', 'Account', 'Status', 'Paid At']);
            foreach ($payrolls as $p) {
                fputcsv($file, [
                    $p->submission?->user?->name,
                    $p->submission?->user?->email,
                    $p->submission?->position?->name,
                    $p->stipend_amount,
                    $p->bank_name,
                    $p->bank_account,
                    $p->status,
                    $p->paid_at,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // ── Helpers ─────────────────────────────────────────────

    private function findPayroll(string $id, string $companyId): ?Payroll
    {
        return Payroll::where('id_payroll', $id)
            ->whereHas('submission.vacancy', fn($q) =>
                $q->where('id_company', $companyId)
            )
            ->with(['submission.user', 'submission.position'])
            ->first();
    }

    private function formatPayroll(Payroll $p): array
    {
        return [
            'id_payroll'     => $p->id_payroll,
            'id_submission'  => $p->id_submission,
            'name'           => $p->submission?->user?->name,
            'email'          => $p->submission?->user?->email,
            'position'       => $p->submission?->position?->name,
            'program'        => $p->submission?->vacancy?->title,
            'stipend_amount' => $p->stipend_amount,
            'stipend_formatted' => 'Rp ' . number_format($p->stipend_amount, 0, ',', '.'),
            'bank_name'      => $p->bank_name,
            'bank_account'   => $p->bank_account,
            'account_holder' => $p->account_holder,
            'period'         => $p->period,
            'status'         => $p->status,
            'paid_at'        => $p->paid_at,
        ];
    }
}