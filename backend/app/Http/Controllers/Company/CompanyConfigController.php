<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Division;
use App\Models\StaffPosition;
use App\Models\JobLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CompanyConfigController extends Controller
{
    private function companyId(Request $request): string
    {
        return $request->user()->id_company;
    }

    // ─── Roles ────────────────────────────────────────────────────────────────

    public function listRoles(Request $request)
    {
        $roles = Role::where('id_company', $this->companyId($request))
            ->withCount('employees')
            ->orderBy('name')
            ->get()
            ->map(fn($r) => [
                'id'          => $r->id_role,
                'name'        => $r->name,
                'description' => $r->description,
                'users_count' => $r->employees_count,
            ]);

        return response()->json($roles);
    }

    public function storeRole(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $exists = Role::where('id_company', $this->companyId($request))
            ->where('name', $data['name'])->exists();
        if ($exists) {
            return response()->json(['message' => 'A role with this name already exists.'], 422);
        }

        $role = Role::create([
            'id_role'     => 'ROLE' . strtoupper(Str::random(6)),
            'id_company'  => $this->companyId($request),
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return response()->json(['id' => $role->id_role, 'name' => $role->name, 'description' => $role->description, 'users_count' => 0], 201);
    }

    public function updateRole(Request $request, string $id)
    {
        $role = Role::where('id_role', $id)
            ->where('id_company', $this->companyId($request))
            ->firstOrFail();

        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        $exists = Role::where('id_company', $this->companyId($request))
            ->where('name', $data['name'])
            ->where('id_role', '!=', $id)
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'Another role with this name already exists.'], 422);
        }

        $role->update($data);

        return response()->json(['id' => $role->id_role, 'name' => $role->name, 'description' => $role->description]);
    }

    public function destroyRole(Request $request, string $id)
    {
        $role = Role::where('id_role', $id)
            ->where('id_company', $this->companyId($request))
            ->firstOrFail();

        // Prevent deletion if users are assigned
        if ($role->employees()->count() > 0) {
            return response()->json(['message' => 'Cannot delete a role that has users assigned.'], 422);
        }

        $role->delete();
        return response()->json(['message' => 'Role deleted.']);
    }

    // ─── Divisions ────────────────────────────────────────────────────────────

    public function listDivisions(Request $request)
    {
        return response()->json(
            Division::where('id_company', $this->companyId($request))->orderBy('name')->get()
                ->map(fn($d) => ['id' => $d->id, 'name' => $d->name, 'description' => $d->description])
        );
    }

    public function storeDivision(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        if (Division::where('id_company', $this->companyId($request))->where('name', $data['name'])->exists()) {
            return response()->json(['message' => 'Division already exists.'], 422);
        }

        $div = Division::create([
            'id_company'  => $this->companyId($request),
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return response()->json(['id' => $div->id, 'name' => $div->name, 'description' => $div->description], 201);
    }

    public function updateDivision(Request $request, int $id)
    {
        $div = Division::where('id', $id)->where('id_company', $this->companyId($request))->firstOrFail();
        $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']);

        if (Division::where('id_company', $this->companyId($request))->where('name', $data['name'])->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'Another division with this name already exists.'], 422);
        }

        $div->update($data);
        return response()->json(['id' => $div->id, 'name' => $div->name, 'description' => $div->description]);
    }

    public function destroyDivision(Request $request, int $id)
    {
        Division::where('id', $id)->where('id_company', $this->companyId($request))->firstOrFail()->delete();
        return response()->json(['message' => 'Division deleted.']);
    }

    // ─── Staff Positions ──────────────────────────────────────────────────────

    public function listStaffPositions(Request $request)
    {
        return response()->json(
            StaffPosition::where('id_company', $this->companyId($request))->orderBy('name')->get()
                ->map(fn($p) => ['id' => $p->id, 'name' => $p->name, 'description' => $p->description])
        );
    }

    public function storeStaffPosition(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']);

        if (StaffPosition::where('id_company', $this->companyId($request))->where('name', $data['name'])->exists()) {
            return response()->json(['message' => 'Position already exists.'], 422);
        }

        $pos = StaffPosition::create(['id_company' => $this->companyId($request), 'name' => $data['name'], 'description' => $data['description'] ?? null]);
        return response()->json(['id' => $pos->id, 'name' => $pos->name, 'description' => $pos->description], 201);
    }

    public function updateStaffPosition(Request $request, int $id)
    {
        $pos = StaffPosition::where('id', $id)->where('id_company', $this->companyId($request))->firstOrFail();
        $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']);

        if (StaffPosition::where('id_company', $this->companyId($request))->where('name', $data['name'])->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'Another position with this name already exists.'], 422);
        }

        $pos->update($data);
        return response()->json(['id' => $pos->id, 'name' => $pos->name, 'description' => $pos->description]);
    }

    public function destroyStaffPosition(Request $request, int $id)
    {
        StaffPosition::where('id', $id)->where('id_company', $this->companyId($request))->firstOrFail()->delete();
        return response()->json(['message' => 'Position deleted.']);
    }

    // ─── Job Levels ───────────────────────────────────────────────────────────

    public function listJobLevels(Request $request)
    {
        return response()->json(
            JobLevel::where('id_company', $this->companyId($request))->orderBy('name')->get()
                ->map(fn($j) => ['id' => $j->id, 'name' => $j->name, 'description' => $j->description])
        );
    }

    public function storeJobLevel(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']);

        if (JobLevel::where('id_company', $this->companyId($request))->where('name', $data['name'])->exists()) {
            return response()->json(['message' => 'Job level already exists.'], 422);
        }

        $jl = JobLevel::create(['id_company' => $this->companyId($request), 'name' => $data['name'], 'description' => $data['description'] ?? null]);
        return response()->json(['id' => $jl->id, 'name' => $jl->name, 'description' => $jl->description], 201);
    }

    public function updateJobLevel(Request $request, int $id)
    {
        $jl = JobLevel::where('id', $id)->where('id_company', $this->companyId($request))->firstOrFail();
        $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:500']);

        if (JobLevel::where('id_company', $this->companyId($request))->where('name', $data['name'])->where('id', '!=', $id)->exists()) {
            return response()->json(['message' => 'Another job level with this name already exists.'], 422);
        }

        $jl->update($data);
        return response()->json(['id' => $jl->id, 'name' => $jl->name, 'description' => $jl->description]);
    }

    public function destroyJobLevel(Request $request, int $id)
    {
        JobLevel::where('id', $id)->where('id_company', $this->companyId($request))->firstOrFail()->delete();
        return response()->json(['message' => 'Job level deleted.']);
    }
}