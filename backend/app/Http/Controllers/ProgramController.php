<?php
namespace App\Http\Controllers;
use App\Models\Vacancy;
use App\Models\Position;
use App\Models\Competency;
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
        // Fetch vacancies with their positions for the company
        $vacancies = Vacancy::with('positions')
            ->where('id_company', $id_company)
            ->get();
        $programs = [];
        foreach ($vacancies as $vacancy) {
            foreach ($vacancy->positions as $position) {
                $programs[] = [
                    'id_vacancy' => $vacancy->id_vacancy,
                    'vacancy_title' => $vacancy->title,
                    'vacancy_batch' => $vacancy->batch,
                    'vacancy_photo' => $vacancy->photo,
                    'vacancy_deadline' => $vacancy->deadline, // Using deadline as placeholder for internship dates if not specific
                    'vacancy_duration_months' => $vacancy->duration_months,
                    'id_position' => $position->id_position,
                    'position_name' => $position->name,
                    'vacancy_status' => $vacancy->status,
                ];
            }
        }
        return response()->json($programs);
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