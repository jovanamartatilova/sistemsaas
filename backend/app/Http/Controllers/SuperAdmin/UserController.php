<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use App\Models\Candidate;
use Illuminate\Http\Request;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $tab = $request->get('tab', 'employees');
        return $tab === 'candidates' ? $this->getCandidates($request) : $this->getEmployees($request);
    }

    private function getEmployees(Request $request)
    {
        $query = User::query()
            ->whereNotIn('role', ['super_admin', 'candidate'])
            ->with(['employee', 'company:id_company,name']);

        if (!empty($request->search)) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%"));
        }

        if (!empty($request->role) && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->get()->map(function ($u) {
            $emp = $u->employee;
            return [
                'id'              => $u->id_user,
                'name'            => $u->name,
                'email'           => $u->email,
                'role'            => $u->role,
                'phone'           => $emp?->phone ?? $u->phone ?? null,
                'company'         => $u->company?->name ?? '—',
                'department'      => $emp?->department ?? null,
                'position'        => $emp?->position ?? null,
                'job_level'       => $emp?->job_level ?? null,
                'employee_status' => $emp?->employee_status ?? null,
                'schedule'        => $emp?->schedule ?? null,
                'registered'      => $u->created_at->format('d M Y'),
            ];
        });

        return response()->json(['data' => $users, 'total' => $users->count()]);
    }
    private function getCandidates(Request $request)
    {
        $query = User::query()
            ->where('role', 'candidate')
            ->with([
                'candidate',
                'submissions' => function($q) {
                    $q->with([
                        'vacancy.company:id_company,name',
                        'position:id_position,name',
                        'vacancy:id_vacancy,title,id_company',
                        'team',
                    ]);
                }
            ]);

        if (!empty($request->search)) {
            $search = $request->search;
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%"));
        }

        $users = $query->latest()->get()->map(function ($u) {
            $cand       = $u->candidate;
            $submission = $u->submissions?->first();
            $company    = $submission?->vacancy?->company?->name ?? '—';
            $position   = $submission?->position?->name ?? '—';
            $program    = $submission?->vacancy?->title ?? '—';

            // Cek team type dari relasi team di submission
            $team = $submission?->team;
            if ($team) {
                // Cek apakah user ini leader atau member
                $teamMember = \App\Models\TeamMember::where('id_team', $team->id_team)
                    ->where('id_user', $u->id_user)
                    ->first();
                $teamType = $teamMember?->role === 'leader' ? 'Leader' : 'Member';
            } else {
                $teamType = 'Individu';
            }

            return [
                'id'              => $u->id_user,
                'name'            => $u->name,
                'email'           => $u->email,
                'phone'           => $cand?->phone ?? null,
                'institution'     => $cand?->institution ?? null,
                'education_level' => $cand?->education_level ?? null,
                'major'           => $cand?->major ?? null,
                'company'         => $company,
                'position'        => $position,
                'program'         => $program,
                'team_type'       => $teamType,
                'registered'      => $u->created_at->format('d M Y'),
            ];
        });

        return response()->json(['data' => $users, 'total' => $users->count()]);
    }
}
