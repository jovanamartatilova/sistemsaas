<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class TeamInvitationController extends Controller
{
    /**
     * Create a new team invitation (Leader only)
     * POST /api/team-invitations
     */
    public function create(Request $request)
{
    try {
        $user = $request->user();

        $validated = $request->validate([
            'id_submission' => 'required|string|exists:submissions,id_submission',
            'team_name'     => 'required|string|max:50',
            'max_members'   => 'nullable|integer|min:1|max:100',
        ]);

        // Pastikan submission milik user dan accepted
        $submission = \App\Models\Submission::where('id_submission', $validated['id_submission'])
            ->where('id_user', $user->id_user)
            ->where('status', 'accepted')
            ->first();

        if (!$submission) {
            return response()->json(['message' => 'Submission tidak valid atau belum diterima'], 403);
        }
        // Cek apakah submission sudah punya tim
        if ($submission->id_team) {
            $existingInvitation = \App\Models\TeamInvitation::where('id_team', $submission->id_team)
                ->where('is_active', true)
                ->first();

            return response()->json([
                'message' => 'Kamu sudah memiliki tim untuk program ini',
                'already_has_team' => true,
                'data' => $existingInvitation ? $this->formatInvitation($existingInvitation) : null
            ], 422);
        }

        // Buat team baru
        $id_team   = 'TM' . strtoupper(Str::random(7));
        $team_code = strtoupper(Str::random(8));

        $team = \App\Models\Team::create([
            'id_team'   => $id_team,
            'name'      => $validated['team_name'],
            'team_code' => $team_code,
        ]);

        \App\Models\TeamMember::create([
            'id_team'    => $id_team,
            'id_user'    => $user->id_user,
            'role'       => 'leader',
        ]);

        $submission->id_team = $id_team;
        $submission->save();

        // Cek invitation aktif yang sudah ada
        $existing = \App\Models\TeamInvitation::where('id_team', $id_team)
            ->where('is_active', true)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Invitation sudah ada',
                'data'    => $this->formatInvitation($existing)
            ]);
        }

        // Generate token unik
        $token = Str::random(32);
        while (\App\Models\TeamInvitation::where('token', $token)->exists()) {
            $token = Str::random(32);
        }

        $invitation = \App\Models\TeamInvitation::create([
            'id_invitation' => 'INV' . strtoupper(Str::random(7)),
            'id_team'       => $id_team,
            'id_creator'    => $user->id_user,
            'token'         => $token,
            'team_name'     => $validated['team_name'],
            'max_members'   => $validated['max_members'] ?? 5,
            'expires_at'    => Carbon::now()->addDays(30),
            'is_active'     => true,
        ]);

        return response()->json([
            'message' => 'Invitation created successfully',
            'data'    => $this->formatInvitation($invitation)
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
    }
}

    public function validate(string $token)
    {
        try {
            $invitation = TeamInvitation::where('token', $token)->first();

            if (!$invitation) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Invalid invitation link'
                ], 404);
            }

            if (!$invitation->isValid()) {
                return response()->json([
                    'valid' => false,
                    'message' => 'This invitation has expired or been revoked'
                ], 410);
            }

            if ($invitation->isTeamFull()) {
                return response()->json([
                    'valid' => false,
                    'message' => 'This team is at maximum capacity'
                ], 400);
            }

            $team = $invitation->team;
            $memberCount = TeamMember::where('id_team', $invitation->id_team)->count();
            $leader = TeamMember::where('id_team', $invitation->id_team)
                ->where('role', 'leader')
                ->with('user')
                ->first();

            return response()->json([
                'valid' => true,
                'data' => [
                    'id_invitation' => $invitation->id_invitation,
                    'token' => $token,
                    'team_name' => $invitation->team_name,
                    'current_members' => $memberCount,
                    'max_members' => $invitation->max_members,
                    'expires_at' => $invitation->expires_at,
                    'leader_name' => $leader?->user?->name ?? 'Unknown',
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error validating invitation: ' . $e->getMessage()], 500);
        }
    }

    public function join(Request $request, $token)
{
    $token = trim($token);

    $invitation = DB::table('team_invitations')
        ->where('token', $token)
        ->where('is_active', true)
        ->first();

    if (
        !$invitation ||
        (isset($invitation->expires_at) && $invitation->expires_at && now()->gt($invitation->expires_at))
    ) {
        return response()->json([
            'message' => 'Link tidak valid atau sudah kadaluarsa'
        ], 404);
    }

    $user = $request->user();

    // Cek apakah sudah join tim ini
    $already = DB::table('team_members')
        ->where('id_team', $invitation->id_team)
        ->where('id_user', $user->id_user)
        ->exists();

    if ($already) {
        return response()->json([
            'message' => 'Sudah bergabung di tim ini',
            'already_joined' => true
        ]);
    }

    $alreadyInTeam = DB::table('team_members')
        ->where('id_user', $user->id_user)
        ->exists();

    if ($alreadyInTeam) {
        return response()->json([
            'message' => 'Kamu sudah tergabung dalam sebuah tim'
        ], 422);
    }

    $count = DB::table('team_members')
        ->where('id_team', $invitation->id_team)
        ->count();

    if ($count >= $invitation->max_members) {
        return response()->json(['message' => 'Tim sudah penuh'], 422);
    }

    DB::table('team_members')->insert([
        'id_team' => $invitation->id_team,
        'id_user' => $user->id_user,
        'role' => 'member',
    ]);

    $team = DB::table('teams')
        ->where('id_team', $invitation->id_team)
        ->first();

    return response()->json([
        'message' => 'Berhasil bergabung ke tim!',
        'success' => true,
        'team_name' => $team->name ?? null
    ]);
}

    public function revoke(Request $request, string $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $invitation = TeamInvitation::find($id);

            if (!$invitation) {
                return response()->json(['message' => 'Invitation not found'], 404);
            }

            // Check authorization
            $teamMember = TeamMember::where('id_team', $invitation->id_team)
                ->where('id_user', $user->id_user)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $invitation->deactivate();

            return response()->json(['message' => 'Invitation revoked successfully']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error revoking invitation: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Regenerate token for invitation
     * POST /api/team-invitations/{id}/regenerate
     */
    public function regenerate(Request $request, string $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $invitation = TeamInvitation::find($id);

            if (!$invitation) {
                return response()->json(['message' => 'Invitation not found'], 404);
            }

            // Check authorization
            $teamMember = TeamMember::where('id_team', $invitation->id_team)
                ->where('id_user', $user->id_user)
                ->first();

            if (!$teamMember || $teamMember->role !== 'leader') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Generate new unique token
            $newToken = Str::random(32);
            while (TeamInvitation::where('token', $newToken)->exists()) {
                $newToken = Str::random(32);
            }

            $invitation->update(['token' => $newToken]);

            return response()->json([
                'message' => 'Token regenerated successfully',
                'data' => $this->formatInvitation($invitation)
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error regenerating token: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a new team (for accepted candidates)
     * POST /api/teams
     */
    public function createTeam(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // STRICT RULE: Check if user already has a team (as leader or member)
            $existingTeamMember = TeamMember::where('id_user', $user->id_user)->first();
            if ($existingTeamMember) {
                return response()->json([
                    'message' => 'You already have a team. Each candidate can only create one team.',
                    'already_has_team' => true,
                    'id_team' => $existingTeamMember->id_team
                ], 422);
            }

            // Validate request
            $validated = $request->validate([
                'team_name' => 'required|string|max:50',
                'max_members' => 'nullable|integer|min:2|max:100',
            ]);

            // Generate team ID and code
            $id_team = 'TM' . strtoupper(Str::random(7));
            $team_code = strtoupper(Str::random(8));

            // Check if team code already exists (unlikely but safe)
            while (Team::where('team_code', $team_code)->exists()) {
                $team_code = strtoupper(Str::random(8));
            }

            // Create team
            $team = Team::create([
                'id_team' => $id_team,
                'name' => $validated['team_name'],
                'team_code' => $team_code,
                'created_at' => Carbon::now(),
            ]);

            // Add creator as team leader
            TeamMember::create([
                'id_team_member' => 'TMMEM' . strtoupper(Str::random(7)),
                'id_team' => $id_team,
                'id_user' => $user->id_user,
                'role' => 'leader',
                'joined_at' => Carbon::now(),
            ]);

            return response()->json([
                'message' => 'Team created successfully',
                'data' => [
                    'id_team' => $team->id_team,
                    'name' => $team->name,
                    'team_code' => $team->team_code,
                    'role' => 'leader',
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating team: ' . $e->getMessage()], 500);
        }
    }

    public function getLeaderInvitations(Request $request)
{
    try {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $teams = TeamMember::where('id_user', $user->id_user)
            ->where('role', 'leader')
            ->pluck('id_team');

        if ($teams->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $invitations = TeamInvitation::whereIn('id_team', $teams)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($inv) {
                return [
                    'id_invitation' => $inv->id_invitation,
                    'team_name' => $inv->team_name,
                    'token' => $inv->token,
                    'link' => env('APP_URL', 'http://localhost:3000') . "/join/{$inv->token}",
                    'is_active' => $inv->is_active,
                    'created_at' => $inv->created_at,
                    'expires_at' => $inv->expires_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $invitations
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Server Error',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function listMyTeams(Request $request)
    {
        try {
            $user = $request->user();

            // Get all teams user is member of
            $teamMemberships = TeamMember::where('id_user', $user->id_user)
                ->with('team')
                ->get();

            if ($teamMemberships->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => []
                ]);
            }

            $teams = $teamMemberships->map(function ($membership) {
                $team = $membership->team;

                // Get all members of the team
                $members = TeamMember::where('id_team', $team->id_team)
                    ->with('user')
                    ->get();

                // Get creator info
                $creator = $members->firstWhere('role', 'leader')->user ?? null;

                // Get active invitation for this team
                $invitation = TeamInvitation::where('id_team', $team->id_team)
                    ->where('is_active', true)
                    ->first();

                return [
                    'id_team' => $team->id_team,
                    'name' => $team->name,
                    'team_code' => $team->team_code,
                    'role' => ucfirst($membership->role),
                    'member_count' => $members->count(),
                    'max_members' => $invitation?->max_members ?? 5,
                    'creator' => $creator ? [
                        'id_user' => $creator->id_user,
                        'name' => $creator->name,
                    ] : null,
                    'members' => $members->map(fn($m) => [
                        'id_user' => $m->user->id_user,
                        'name' => $m->user->name,
                        'role' => ucfirst($m->role),
                        'joined_at' => $m->joined_at,
                    ])->toArray(),
                    'invitation' => $invitation ? [
                        'id_invitation' => $invitation->id_invitation,
                        'token' => $invitation->token,
                        'invitation_link' => url("/join/{$invitation->token}"),
                        'copy_link' => url("/join/{$invitation->token}"),
                        'is_active' => $invitation->is_active,
                        'created_at' => $invitation->created_at,
                    ] : null,
                    'created_at' => $team->created_at,
                    'joined_at' => $membership->joined_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $teams
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching teams: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Format invitation for response
     */
    private function formatInvitation(TeamInvitation $invitation): array
    {
        $appUrl = env('APP_URL', 'http://localhost:3000');

        return [
            'id_invitation' => $invitation->id_invitation,
            'team_name' => $invitation->team_name,
            'token' => $invitation->token,
            'invitation_link' => "{$appUrl}/join/{$invitation->token}",
            'max_members' => $invitation->max_members,
            'used_count' => $invitation->used_count,
            'is_active' => $invitation->is_active,
            'expires_at' => $invitation->expires_at?->format('Y-m-d H:i:s'),
            'created_at' => $invitation->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
