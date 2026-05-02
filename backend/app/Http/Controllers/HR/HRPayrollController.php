<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Submission;
use App\Models\Apprentice;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HRPayrollController extends Controller
{
    /**
     * GET /hr/payroll
     * Menampilkan semua intern aktif dari program PAID, digabung dengan status pembayaran bulan ini.
     */
    public function index(Request $request)
    {
        $companyId = $request->user()->id_company;
        $period    = $request->get('period', now()->format('Y-m'));
        $search    = $request->get('search');

        $appStatus = $request->get('app_status'); // 'active', 'completed', or empty for all

        // 1. Ambil semua Apprentice aktif/completed dari vacancy tipe 'paid'
        $query = Apprentice::whereHas('submission.vacancy', function($q) use ($companyId) {
                $q->where('id_company', $companyId)
                  ->where('payment_type', 'paid');
            })
            ->with(['submission.user.candidate', 'submission.position', 'submission.vacancy']);

        // Filter status intern (active/completed)
        if ($appStatus) {
            $query->where('status', $appStatus);
        } else {
            // Default: Tampilkan aktif dan completed yang masih "segar" (misal end_date belum lewat 2 bulan)
            $query->where(function($q) {
                $q->where('status', 'active')
                  ->orWhere(function($sq) {
                      $sq->where('status', 'completed')
                         ->where(function($ssq) {
                             $ssq->whereNull('end_date')
                                 ->orWhere('end_date', '>=', now()->subMonths(2)->toDateString());
                         });
                  });
            });
        }

        if ($search) {
            $query->whereHas('submission.user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $apprentices = $query->get();

        // 2. Ambil data payroll untuk periode ini
        $payrolls = Payroll::where('period', $period)
            ->whereHas('submission.vacancy', fn($q) => $q->where('id_company', $companyId))
            ->get()
            ->keyBy('id_submission');

        // 3. Gabungkan data
        $results = $apprentices->map(function($a) use ($payrolls, $period) {
            $s = $a->submission;
            $p = $payrolls->get($s->id_submission);
            $candidate = $s->user?->candidate;

            return [
                'id_apprentice'  => $a->id_apprentice,
                'id_submission'  => $s->id_submission,
                'name'           => $s->user?->name,
                'email'          => $s->user?->email,
                'position'       => $s->position?->name,
                'program'        => $s->vacancy?->title,
                'id_vacancy'     => $s->vacancy?->id_vacancy,
                
                // Bank info dari Profile Intern
                'bank_name'      => $p->bank_name ?? ($candidate?->bank_name ?? '-'),
                'bank_account'   => $p->bank_account ?? ($candidate?->bank_account_number ?? '-'),
                'account_holder' => $p->account_holder ?? ($s->user?->name ?? '-'),
                'intern_status'  => $a->status,
                
                // Payroll info
                'id_payroll'     => $p->id_payroll ?? null,
                'stipend_amount' => $p->stipend_amount ?? ($s->vacancy?->stipend_amount ?? 0),
                'stipend_formatted' => 'Rp ' . number_format($p->stipend_amount ?? ($s->vacancy?->stipend_amount ?? 0), 0, ',', '.'),
                'period'         => $period,
                'status'         => $p->status ?? 'unprocessed', // unprocessed, pending, paid
                'paid_at'        => $p->paid_at ?? null,
            ];
        });

        // Stats
        $paidCount = $results->where('status', 'paid')->count();
        $pendingCount = $results->where('status', 'pending')->count();
        $totalDisbursed = $results->where('status', 'paid')->sum('stipend_amount');

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total_interns'    => $results->count(),
                    'paid_this_month'  => $paidCount,
                    'pending_payment'  => $pendingCount,
                    'total_disbursed'  => $totalDisbursed,
                    'total_disbursed_formatted' => 'Rp ' . number_format($totalDisbursed / 1000000, 1) . 'M',
                ],
                'period'   => $period,
                'payrolls' => $results,
                'programs' => Vacancy::where('id_company', $companyId)
                                ->where('payment_type', 'paid')
                                ->get(['id_vacancy', 'title', 'stipend_amount'])
            ],
        ]);
    }

    /**
     * POST /hr/payroll
     * Digunakan untuk update stipend amount per program (Vacancy)
     */
    public function updateProgramStipend(Request $request)
    {
        $request->validate([
            'id_vacancy'     => 'required|string|exists:vacancies,id_vacancy',
            'stipend_amount' => 'required|integer|min:0',
        ]);

        $vacancy = Vacancy::where('id_vacancy', $request->id_vacancy)
            ->where('id_company', $request->user()->id_company)
            ->first();

        if (!$vacancy) {
            return response()->json(['success' => false, 'message' => 'Program not found'], 404);
        }

        $vacancy->update(['stipend_amount' => $request->stipend_amount]);

        return response()->json([
            'success' => true,
            'message' => 'Program stipend updated successfully',
        ]);
    }

    /**
     * PATCH /hr/payroll/pay
     * Proses pembayaran (create payroll record if not exists)
     */
    public function pay(Request $request)
    {
        $request->validate([
            'id_submission' => 'required|string|exists:submissions,id_submission',
            'period'        => 'required|string|size:7',
        ]);

        $companyId = $request->user()->id_company;
        $submission = Submission::where('id_submission', $request->id_submission)
            ->whereHas('vacancy', fn($q) => $q->where('id_company', $companyId))
            ->with(['user.candidate', 'vacancy'])
            ->first();

        if (!$submission) {
            return response()->json(['success' => false, 'message' => 'Submission not found'], 404);
        }

        $payroll = Payroll::where('id_submission', $request->id_submission)
            ->where('period', $request->period)
            ->first();

        if ($payroll && $payroll->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Already paid for this month'], 422);
        }

        $candidate = $submission->user?->candidate;
        $bankName = $candidate?->bank_name;
        $bankAcc  = $candidate?->bank_account_number;

        if (!$bankName || !$bankAcc || $bankName === '-' || $bankAcc === '-') {
            return response()->json([
                'success' => false, 
                'message' => 'Cannot pay: Intern has not filled bank information in their profile.'
            ], 422);
        }

        if (!$payroll) {
            // Buat record baru
            $payroll = Payroll::create([
                'id_payroll'     => 'PAY' . strtoupper(Str::random(7)),
                'id_submission'  => $submission->id_submission,
                'stipend_amount' => $submission->vacancy?->stipend_amount ?? 0,
                'bank_name'      => $bankName,
                'bank_account'   => $bankAcc,
                'account_holder' => $submission->user?->name ?? '-',
                'period'         => $request->period,
                'status'         => 'paid',
                'paid_at'        => now(),
            ]);
        } else {
            $payroll->update([
                'bank_name'    => $bankName,
                'bank_account' => $bankAcc,
                'status'       => 'paid',
                'paid_at'      => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment successful',
            'data'    => $payroll
        ]);
    }

    /**
     * POST /hr/payroll/rollback
     * Membatalkan pembayaran (hapus record payroll)
     */
    public function rollback(Request $request)
    {
        $request->validate([
            'id_submission' => 'required|string',
            'period'        => 'required|string|size:7',
        ]);

        $payroll = Payroll::where('id_submission', $request->id_submission)
            ->where('period', $request->period)
            ->first();

        if (!$payroll) {
            return response()->json(['success' => false, 'message' => 'Payroll record not found'], 404);
        }

        $payroll->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment has been rolled back successfully',
        ]);
    }

    /**
     * POST /hr/payroll/terminate
     * Mengakhiri magang (set status inactive agar tidak muncul di payroll lagi)
     */
    public function terminate(Request $request)
    {
        $request->validate([
            'id_apprentice' => 'required|string|exists:apprentices,id_apprentice',
        ]);

        $apprentice = Apprentice::where('id_apprentice', $request->id_apprentice)
            ->whereHas('submission.vacancy', fn($q) => $q->where('id_company', $request->user()->id_company))
            ->first();

        if (!$apprentice) {
            return response()->json(['success' => false, 'message' => 'Apprentice not found'], 404);
        }

        $apprentice->update(['status' => 'inactive']);

        return response()->json([
            'success' => true,
            'message' => 'Internship has been ended. Intern will no longer appear in payroll.',
        ]);
    }

    /**
     * GET /hr/payroll/export
     */
    public function exportCsv(Request $request)
    {
        // Reuse logic from index to get the same unified list
        $response = $this->index($request)->getData();
        $payrolls = $response->data->payrolls;

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"payroll-{$response->data->period}.csv\"",
        ];

        $callback = function () use ($payrolls) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Name', 'Email', 'Position', 'Program', 'Stipend', 'Bank', 'Account', 'Status', 'Paid At']);
            foreach ($payrolls as $p) {
                fputcsv($file, [
                    $p->name,
                    $p->email,
                    $p->position,
                    $p->program,
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
}