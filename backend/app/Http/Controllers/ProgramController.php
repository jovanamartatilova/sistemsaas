<?php
namespace App\Http\Controllers;
use App\Models\Vacancy;
use App\Models\Position;
use App\Models\Competency;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class ProgramController extends Controller
{
    /**
     * Display a listing of programs (positions within vacancies).
     */
    public function index(Request $request)
    {
        $id_company = $request->user()->id_company;

        // Auto-close vacancies past deadline for this company
        Vacancy::closeExpired($id_company);

        // Fetch vacancies with their positions and submissions for the company
        $vacancies = Vacancy::with(['positions' => function($q) {
            $q->withPivot('quota');
        }, 'positions.submissions.user'])
            ->where('id_company', $id_company)
            ->get();
        $programs = [];
        foreach ($vacancies as $vacancy) {
            foreach ($vacancy->positions as $position) {
                // Determine applicants for THIS specific program and position linkage
                $linkApplicants = $position->submissions->where('id_vacancy', $vacancy->id_vacancy);
                
                $programs[] = [
                    'id_vacancy' => $vacancy->id_vacancy,
                    'vacancy_title' => $vacancy->title,
                    'vacancy_batch' => $vacancy->batch,
                    'vacancy_photo' => $vacancy->photo,
                    'vacancy_deadline' => $vacancy->deadline,
                    'vacancy_start_date' => $vacancy->start_date,
                    'vacancy_end_date' => $vacancy->end_date,
                    'id_position' => $position->id_position,
                    'position_name' => $position->name,
                    'position_quota' => $position->pivot->quota,
                    'applicant_count' => $linkApplicants->count(),
                    'applicants' => $linkApplicants->values(),
                    'vacancy_status' => $vacancy->status,
                    'vacancy_total_quota' => $vacancy->total_quota,
                ];
            }
        }
        return response()->json($programs);
    }

    /**
     * Get the position catalog for the company.
     */
    public function getCatalog(Request $request)
    {
        $id_company = $request->user()->id_company;
        $positions = Position::where('id_company', $id_company)
            ->with('competencies')
            ->get();
        return response()->json($positions);
    }

    /**
     * Store a new position in the catalog.
     */
    public function storeCatalog(Request $request)
    {
        $id_company = $request->user()->id_company;
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'competencies' => 'nullable|array',
            'competencies.*.name' => 'required|string|max:50',
            'competencies.*.learning_hours' => 'required|integer',
            'competencies.*.description' => 'nullable|string|max:255',
            'selection_flow' => 'nullable|array',
            'selection_flow.*.type' => 'required|string|max:50',
            'selection_flow.*.name' => 'required|string|max:100',
            'selection_flow.*.description' => 'nullable|string|max:1000',
        ]);

        // Check if name already exists for this company
        $exists = Position::where('id_company', $id_company)
            ->where('name', $validated['name'])
            ->exists();
        
        if ($exists) {
            return response()->json(['error' => 'A position with this name already exists in your catalog.'], 422);
        }

        try {
            DB::beginTransaction();
            $id_position = 'POS' . strtoupper(Str::random(7));
            $position = Position::create([
                'id_position' => $id_position,
                'id_company' => $id_company,
                'name' => $validated['name'],
                'quota' => 0, // Legacy field, we use pivot now
                'selection_flow' => $validated['selection_flow'] ?? [],
            ]);

            if (!empty($validated['competencies'])) {
                $compIds = [];
                foreach ($validated['competencies'] as $c) {
                    $comp = Competency::firstOrCreate(
                        ['name' => $c['name']],
                        [
                            'id_competency' => 'COMP' . strtoupper(Str::random(6)),
                            'learning_hours' => $c['learning_hours'],
                            'description' => $c['description'] ?? null
                        ]
                    );
                    $compIds[] = $comp->id_competency;
                }
                $position->competencies()->sync($compIds);
            }

            DB::commit();
            return response()->json($position->load('competencies'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an existing position in the catalog.
     */
    public function updateCatalog(Request $request, $id)
    {
        $id_company = $request->user()->id_company;
        $position = Position::where('id_position', $id)->where('id_company', $id_company)->firstOrFail();
        
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'competencies' => 'nullable|array',
            'competencies.*.name' => 'required|string|max:50',
            'competencies.*.learning_hours' => 'required|integer',
            'competencies.*.description' => 'nullable|string|max:255',
            'selection_flow' => 'nullable|array',
            'selection_flow.*.type' => 'required|string|max:50',
            'selection_flow.*.name' => 'required|string|max:100',
            'selection_flow.*.description' => 'nullable|string|max:1000',
        ]);

        // Check if name already exists for this company (excluding current position)
        $exists = Position::where('id_company', $id_company)
            ->where('name', $validated['name'])
            ->where('id_position', '!=', $id)
            ->exists();
        
        if ($exists) {
            return response()->json(['error' => 'Another position with this name already exists in your catalog.'], 422);
        }

        try {
            DB::beginTransaction();
            $position->update([
                'name' => $validated['name'],
                'selection_flow' => $validated['selection_flow'] ?? [],
            ]);

            $compIds = [];
            if (!empty($validated['competencies'])) {
                foreach ($validated['competencies'] as $c) {
                    $comp = Competency::firstOrCreate(
                        ['name' => $c['name']],
                        [
                            'id_competency' => 'COMP' . strtoupper(Str::random(6)),
                            'learning_hours' => $c['learning_hours'],
                            'description' => $c['description'] ?? null
                        ]
                    );
                    $compIds[] = $comp->id_competency;
                }
            }
            $position->competencies()->sync($compIds);

            DB::commit();
            return response()->json($position->load('competencies'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a position from the catalog.
     */
    public function destroyCatalog(Request $request, $id)
    {
        $id_company = $request->user()->id_company;
        $position = Position::where('id_position', $id)->where('id_company', $id_company)->firstOrFail();

        // Check if it's currently linked to any vacancy
        if ($position->vacancies()->count() > 0) {
            return response()->json(['error' => 'Cannot delete position that is linked to an active program.'], 422);
        }

        $position->delete();
        return response()->json(['message' => 'Position deleted successfully.']);
    }

    /**
     * Get competencies for a specific position.
     */
    public function getCompetencies($id_position)
    {
        $position = Position::with('competencies')->where('id_position', $id_position)->firstOrFail();
        return response()->json($position->competencies);
    }

    /**
     * Update/Sync competencies for a position.
     */
    public function updateCompetencies(Request $request, $id_position)
    {
        $position = Position::where('id_position', $id_position)->firstOrFail();
        $validated = $request->validate([
            'competencies' => 'required|array',
            'competencies.*.name' => 'required|string|max:50',
            'competencies.*.learning_hours' => 'required|integer',
            'competencies.*.description' => 'nullable|string|max:255',
        ]);
        try {
            DB::beginTransaction();
            $competencyIds = [];
            foreach ($validated['competencies'] as $compData) {
                // We use name as a partial key but create a new ID if it doesn't exist
                $competency = Competency::firstOrCreate(
                    ['name' => $compData['name']],
                    [
                        'id_competency' => 'COMP' . strtoupper(Str::random(6)),
                        'learning_hours' => $compData['learning_hours'],
                        'description' => $compData['description'] ?? null,
                    ]
                );

                // If it existed, update the hours/description as requested in the "edit" flow
                if (!$competency->wasRecentlyCreated) {
                    $competency->update([
                        'learning_hours' => $compData['learning_hours'],
                        'description' => $compData['description'] ?? null,
                    ]);
                }
                $competencyIds[] = $competency->id_competency;
            }
            $position->competencies()->sync($competencyIds);
            DB::commit();
            return response()->json($position->load('competencies'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating competencies: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to save competencies'], 500);
        }
    }

    /**
     * Remove a position from a vacancy.
     */
    public function destroy(Request $request, $id_vacancy, $id_position)
    {
        $vacancy = Vacancy::where('id_vacancy', $id_vacancy)
            ->where('id_company', $request->user()->id_company)
            ->firstOrFail();
        $vacancy->positions()->detach($id_position);
        return response()->json(['message' => 'Program removed successfully']);
    }
}