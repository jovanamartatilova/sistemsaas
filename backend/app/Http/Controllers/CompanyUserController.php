<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CompanyUserController extends Controller
{
    /**
     * Get users for the authenticated company
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        $companyId = $currentUser->employee?->id_company;

        if (!$companyId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $type = $request->query('type', 'all');

        // Query user yang punya employee di company ini
        $query = User::whereHas('employee', fn($q) => $q->where('id_company', $companyId));

        if ($type === 'team') {
            $query->whereIn('role', ['admin', 'hr', 'mentor', 'staff']);
        } elseif ($type === 'candidate') {
            $query->where('role', 'candidate');
        }

        $users = $query->with(['employee', 'submissions'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($u) {
                $latestSub = $u->submissions->sortByDesc('submitted_at')->first();
                $u->submission_status = $latestSub ? $latestSub->status : 'registered';
                return $u;
            });

        return response()->json($users);
    }

    /**
     * Invite/Create new staff member
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();
        $companyId = $currentUser->employee?->id_company; // ambil dari employee, bukan user

        if (!$companyId) {
            return response()->json(['message' => 'Company not found'], 403);
        }

        $validated = $request->validate([
            'name'  => 'required|string|max:50',
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:admin,hr,mentor,staff',
        ]);

        // Generate id_user
        do {
            $id = 'USR' . strtoupper(substr(uniqid(), -7));
        } while (User::where('id_user', $id)->exists());

        $activationToken = Str::random(32);

        // 1. Insert ke tabel users (TANPA id_company)
        $user = User::create([
            'id_user'          => $id,
            'name'             => $validated['name'],
            'email'            => $validated['email'],
            'role'             => $validated['role'],
            'is_active'        => false,
            'activation_token' => $activationToken,
            'password'         => Hash::make(Str::random(16)),
        ]);

        // 2. Generate id_employee
        do {
            $idEmployee = 'EMP' . strtoupper(substr(uniqid(), -7));
        } while (\App\Models\Employee::where('id_employee', $idEmployee)->exists());

        // 3. Split nama jadi first_name & last_name
        $nameParts = explode(' ', $validated['name'], 2);

        // 4. Insert ke tabel employees
        \App\Models\Employee::create([
            'id_employee' => $idEmployee,
            'id_user'     => $id,
            'id_company'  => $companyId,
            'first_name'  => $nameParts[0],
            'last_name'   => $nameParts[1] ?? null,
        ]);

        // Kirim email aktivasi
        $activationUrl = env('FRONTEND_URL', 'http://localhost:5173')
            . '/activate?token=' . $activationToken;

        try {
            Mail::raw(
                "Hello {$validated['name']},\n\n" .
                "You have been invited as a {$validated['role']}.\n\n" .
                "Activate your account here:\n{$activationUrl}\n\n" .
                "Link expires in 24 hours.\n\nEarlyPath Team",
                function ($message) use ($validated) {
                    $message->to($validated['email'])
                        ->subject('Account Activation Invitation - EarlyPath');
                }
            );
        } catch (\Exception $e) {
            \Log::warning('Email send failed: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => 'User successfully invited',
            'user'       => $user->load('employee'),
            'email_sent' => true,
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
