<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CompanyUserController extends Controller
{
    /**
     * Get users for the authenticated company
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $companyId = $user->id_company;

        if (!$companyId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $type = $request->query('type', 'all'); // 'team', 'candidate', or 'all'

        $query = User::where('id_company', $companyId);

        if ($type === 'team') {
            $query->whereIn('role', ['admin', 'hr', 'mentor', 'staff']);
        } elseif ($type === 'candidate') {
            $query->where('role', 'candidate');
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return response()->json($users);
    }

    /**
     * Invite/Create new staff member
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();
        $companyId = $currentUser->id_company;

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,hr,mentor,staff',
        ]);

        // Generate custom id_user like USRXXXX
        do {
            $id = 'USR' . strtoupper(substr(uniqid(), -7));
        } while (User::where('id_user', $id)->exists());

        $user = User::create([
            'id_user' => $id,
            'id_company' => $companyId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => false,
            'activation_token' => Str::random(32),
            'password' => Hash::make(Str::random(16)), // Dummy password until activation
        ]);

        return response()->json([
            'message' => 'User successfully invited',
            'user' => $user
        ], 201);
    }

    /**
     * Update user details
     */
    public function update(Request $request, $id)
    {
        $currentUser = $request->user();
        $user = User::where('id_user', $id)
            ->where('id_company', $currentUser->id_company)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:50',
            'role' => 'sometimes|in:admin,hr,mentor,staff,candidate',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Remove user from company
     */
    public function destroy(Request $request, $id)
    {
        $currentUser = $request->user();
        $user = User::where('id_user', $id)
            ->where('id_company', $currentUser->id_company)
            ->firstOrFail();

        // Don't allow self-deletion
        if ($user->id_user === $currentUser->id_user) {
            return response()->json(['message' => 'You cannot delete yourself'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
