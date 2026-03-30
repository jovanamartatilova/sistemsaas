<?php

namespace App\Services\SuperAdmin;

use App\Models\Company;
use App\Models\User;
use App\Models\Vacancy;
use App\Models\Certificate;

class DashboardService
{
    public function getStats(): array
    {
        return [
            'total_tenant'      => Company::count(),
            'active_tenant'     => Company::where('status', 'active')->count(),
            'suspended_tenant'  => Company::where('status', 'suspended')->count(),
            'inactive_tenant'   => Company::where('status', 'inactive')->count(),
            'total_user'        => User::where('role', '!=', 'super_admin')->count(),
            'new_user_7days'    => User::where('role', '!=', 'super_admin')
                                       ->where('created_at', '>=', now()->subDays(7))
                                       ->count(),
            'active_vacancies'  => Vacancy::where('status', 'publish')->count(),
            'total_certificate' => Certificate::count(),
            'growth_chart'      => $this->getGrowthChart(),
            'tenant_status'     => [
                'active'    => Company::where('status', 'active')->count(),
                'suspended' => Company::where('status', 'suspended')->count(),
                'inactive'  => Company::where('status', 'inactive')->count(),
            ],
        ];
    }

    private function getGrowthChart(): array
    {
        return collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            return [
                'month'       => $date->translatedFormat('M'),
                'new_tenant'  => Company::whereMonth('created_at', $date->month)
                                        ->whereYear('created_at', $date->year)
                                        ->count(),
                'new_user'    => User::where('role', '!=', 'super_admin')
                                     ->whereMonth('created_at', $date->month)
                                     ->whereYear('created_at', $date->year)
                                     ->count(),
                'certificate' => Certificate::whereMonth('created_at', $date->month)
                                            ->whereYear('created_at', $date->year)
                                            ->count(),
            ];
        })->values()->toArray();
    }
}
