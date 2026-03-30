<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Exclude super_admin from the list
        $query->where('role', '!=', 'super_admin');

        // Search by name or email
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && !empty($request->role) && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->with('company:id_company,name')
            ->select('id_user as id', 'id_company', 'name', 'email', 'phone', 'role', 'created_at')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'company' => $user->company?->name ?? null,
                    'created_at' => $user->created_at->format('Y-m-d'),
                ];
            });

        return response()->json([
            'data' => $users,
            'total' => count($users),
        ]);
    }
}
