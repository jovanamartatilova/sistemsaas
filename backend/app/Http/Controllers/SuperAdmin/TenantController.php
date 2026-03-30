<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::query();

        // Search by name or email
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $tenants = $query->select('id_company as id', 'name', 'email', 'status', 'created_at')
            ->withCount(['users', 'vacancies'])
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'email' => $tenant->email,
                    'status' => $tenant->status,
                    'created_at' => $tenant->created_at->format('Y-m-d'),
                    'users_count' => $tenant->users_count,
                    'vacancies_count' => $tenant->vacancies_count,
                ];
            });

        return response()->json([
            'data' => $tenants,
            'total' => count($tenants),
        ]);
    }

    public function show($id)
    {
        $tenant = Company::where('id_company', $id)
            ->with('users', 'vacancies')
            ->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        return response()->json([
            'id' => $tenant->id_company,
            'name' => $tenant->name,
            'email' => $tenant->email,
            'phone' => $tenant->phone,
            'address' => $tenant->address,
            'description' => $tenant->description,
            'status' => $tenant->status,
            'logo_path' => $tenant->logo_path,
            'users_count' => $tenant->users->count(),
            'vacancies_count' => $tenant->vacancies->count(),
            'created_at' => $tenant->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $tenant->updated_at->format('Y-m-d H:i:s'),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,suspended,inactive',
        ]);

        $tenant = Company::where('id_company', $id)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        $tenant->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Tenant status updated successfully',
            'data' => [
                'id' => $tenant->id_company,
                'status' => $tenant->status,
                'updated_at' => $tenant->updated_at,
            ],
        ]);
    }
}
