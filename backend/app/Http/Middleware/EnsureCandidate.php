<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureCandidate
{
    /**
     * Pastikan user yang authenticated adalah candidate/student, bukan company/staff
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Jika user tidak authenticated atau bukan dari users table (e.g. company)
        if (!$user || !method_exists($user, 'getTable') || $user->getTable() !== 'users') {
            return response()->json(['message' => 'Unauthorized - Candidate only'], 403);
        }

        // Bisa tambahkan cek role jika ada
        // if ($user->role !== 'student' && $user->role !== 'apprentice') {
        //     return response()->json(['message' => 'Unauthorized - Candidate only'], 403);
        // }

        return $next($request);
    }
}
