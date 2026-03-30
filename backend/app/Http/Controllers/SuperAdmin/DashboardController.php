<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Services\SuperAdmin\DashboardService;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $service) {}

    public function stats()
    {
        return response()->json($this->service->getStats());
    }
}
