<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vacancy;
use App\Models\Position;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the logged in company.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = $user->id_company;

        $vacanciesQuery = Vacancy::where('status', 'published');
        
        // Filter by company (Restored for data isolation)
        if ($companyId) {
            $vacanciesQuery->where('id_company', $companyId);
        }

        // Program Aktif = Total POSISI yang dibuka (as requested by user)
        $positionsCount = $vacanciesQuery->clone()
            ->withCount('positions')
            ->get()
            ->sum('positions_count');

        // Lowongan Aktif = Total VACANCIES yang dipublish
        $vacanciesCount = $vacanciesQuery->clone()->count();

        return response()->json([
            'active_programs' => $positionsCount, // Positions
            'active_vacancies' => $vacanciesCount, // Vacancies
            'total_applicants' => 0,
            'pending_review' => 0,
        ]);
    }
}
