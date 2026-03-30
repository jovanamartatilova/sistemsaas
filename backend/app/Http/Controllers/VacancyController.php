<?php

namespace App\Http\Controllers;

use App\Models\Vacancy;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VacancyController extends Controller
{
    /**
     * Display a listing of published vacancies for the landing page.
     */
    public function publicIndex()
    {
        $vacancies = Vacancy::with(['company', 'positions'])
            ->where('status', 'published')
            ->get();

        return response()->json($vacancies);
    }

    /**
     * Display a listing of vacancies for the authenticated company.
     */
    public function index(Request $request)
    {
        $vacancies = Vacancy::with(['positions', 'submissions.user', 'submissions.position'])
            ->where('id_company', $request->user()->id_company)
            ->get();

        return response()->json($vacancies);
    }

    /**
     * Store a new vacancy.
     */
    public function store(Request $request)
    {
        Log::info('Storing vacancy request:', $request->all());
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            Log::info('Photo file info:', [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'error' => $file->getError(),
                'isValid' => $file->isValid(),
                'mime' => $file->getMimeType(),
            ]);
        } else if (isset($_FILES['photo'])) {
            Log::info('Raw $_FILES[photo] info:', $_FILES['photo']);
        }

        try {
            $validated = $request->validate([
                'positions' => 'required|array|min:1',
                'positions.*.name' => 'required|string|max:100',
                'positions.*.quota' => 'required|integer|min:0',
            'title' => 'required|string|max:100',
            'description' => 'required|string',
            'city' => 'required|string|max:50',
            'province' => 'required|string|max:50',
            'address' => 'required|string|max:100',
            'type' => 'required|string|max:20',
            'deadline' => 'required|string|max:30', 
            'start_date' => 'required|string|max:30',
            'end_date' => 'required|string|max:30',
            'payment_type' => 'required|string|max:15',
            'batch' => 'required|integer',
            'status' => 'required|string|in:draft,published,closed',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $photoPath = null;
        $formattedDeadline = null;
        $formattedStartDate = null;
        $formattedEndDate = null;

        // Handle Positions (create each as a row in positions table with its own quota)
        $positionIds = [];
        foreach ($validated['positions'] as $posData) {
            $posName = is_array($posData) ? ($posData['name'] ?? '') : $posData;
            $posQuota = is_array($posData) ? (int)($posData['quota'] ?? 0) : 0;
            
            $position = Position::create([
                'id_position' => 'POS' . strtoupper(Str::random(7)),
                'name' => $posName,
                'quota' => $posQuota,
            ]);
            $positionIds[] = $position->id_position;
        }

        // Handle Photo Upload
        // Handle Photo Upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            try {
                $photoPath = $request->file('photo')->store('vacancies', 'public');
                if (!$photoPath) {
                    Log::error('Photo store returned null');
                    return response()->json(['message' => 'The photo failed to upload to storage.'], 422);
                }
            } catch (\Exception $e) {
                Log::error('Photo upload exception: ' . $e->getMessage());
                return response()->json(['message' => 'The photo failed to upload: ' . $e->getMessage()], 500);
            }
        }

        // Format Dates
        try {
            $formattedDeadline = Carbon::parse($validated['deadline'])->format('Y-m-d');
            $formattedStartDate = Carbon::parse($validated['start_date'])->format('Y-m-d');
            $formattedEndDate = Carbon::parse($validated['end_date'])->format('Y-m-d');
        } catch (\Exception $e) {
            Log::error('Date parsing failed:', ['deadline' => $validated['deadline'], 'start' => $validated['start_date'], 'end' => $validated['end_date']]);
            return response()->json([
                'errors' => [
                    'dates' => ['Format tanggal tidak valid. Silakan gunakan format yang benar.']
                ]
            ], 422);
        }

        // Combine Location: (kota, provinsi, sama alamat lengkap) -> kolom lokasi
        $location = $validated['city'] . ', ' . $validated['province'] . ', ' . $validated['address'];

        $vacancy = Vacancy::create([
            'id_vacancy' => 'VAC' . strtoupper(Str::random(7)),
            'id_company' => $request->user()->id_company,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'photo' => $photoPath,
            'location' => $location,
            'type' => $validated['type'],
            'deadline' => $formattedDeadline,
            'start_date' => $formattedStartDate,
            'end_date' => $formattedEndDate,
            'payment_type' => $validated['payment_type'],
            'batch' => $validated['batch'],
            'status' => $validated['status'],
            'publish_date' => $validated['status'] === 'published' ? now() : null,
        ]);

        // Attach multiple positions to pivot table
        $vacancy->positions()->attach($positionIds);

        return response()->json($vacancy->load('positions'), 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Validation failed for vacancy store:', $e->errors());
        return response()->json(['errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        Log::error('Error storing vacancy:', ['message' => $e->getMessage()]);
        return response()->json(['error' => 'An error occurred'], 500);
    }
}

    /**
     * Update numerical status or details.
     */
    public function update(Request $request, $id)
    {
        $vacancy = Vacancy::where('id_vacancy', $id)
            ->where('id_company', $request->user()->id_company)
            ->firstOrFail();

        $validated = $request->validate([
            'positions' => 'sometimes|array',
            'positions.*.name' => 'required_with:positions|string|max:100',
            'positions.*.quota' => 'required_with:positions|integer|min:0',
            'title' => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
            'city' => 'sometimes|string|max:50',
            'province' => 'sometimes|string|max:50',
            'address' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|max:20',
            'deadline' => 'sometimes|string|max:30',
            'start_date' => 'sometimes|string|max:30',
            'end_date' => 'sometimes|string|max:30',
            'payment_type' => 'sometimes|string|max:15',
            'batch' => 'sometimes|integer',
            'status' => 'sometimes|string|in:draft,published,closed',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // Handle Photo Upload
        if ($request->hasFile('photo')) {
            if ($vacancy->photo) {
                Storage::disk('public')->delete($vacancy->photo);
            }
            $validated['photo'] = $request->file('photo')->store('vacancies', 'public');
        }

        // Handle Dates
        try {
            if (isset($validated['deadline'])) {
                $validated['deadline'] = Carbon::parse($validated['deadline'])->format('Y-m-d');
            }
            if (isset($validated['start_date'])) {
                $validated['start_date'] = Carbon::parse($validated['start_date'])->format('Y-m-d');
            }
            if (isset($validated['end_date'])) {
                $validated['end_date'] = Carbon::parse($validated['end_date'])->format('Y-m-d');
            }
        } catch (\Exception $e) {
            return response()->json([
                'errors' => [
                    'dates' => ['Format tanggal tidak valid. Silakan gunakan format yang benar.']
                ]
            ], 422);
        }

        // Handle Location
        if (isset($validated['city']) || isset($validated['province']) || isset($validated['address'])) {
            $city = $validated['city'] ?? explode(', ', $vacancy->location)[0] ?? '';
            $province = $validated['province'] ?? explode(', ', $vacancy->location)[1] ?? '';
            $address = $validated['address'] ?? explode(', ', $vacancy->location)[2] ?? '';
            $validated['location'] = $city . ', ' . $province . ', ' . $address;
        }

        // Handle Position change
        if (isset($validated['positions'])) {
            // Get old positions to cleanup
            $oldPositionIds = $vacancy->positions()->pluck('positions.id_position')->toArray();
            
            // Detach pivot
            $vacancy->positions()->detach();

            // Delete old position records if they aren't linked to other vacancies
            // (In our new logic they should only belong to this one)
            foreach ($oldPositionIds as $idPos) {
                $count = DB::table('vacancy_positions')->where('id_position', $idPos)->count();
                if ($count === 0) {
                    Position::where('id_position', $idPos)->delete();
                }
            }

            // Create new positions
            $newPositionIds = [];
            foreach ($validated['positions'] as $posData) {
                $posName = is_array($posData) ? ($posData['name'] ?? '') : $posData;
                $posQuota = is_array($posData) ? (int)($posData['quota'] ?? 0) : 0;

                $newPos = Position::create([
                    'id_position' => 'POS' . strtoupper(Str::random(7)),
                    'name' => $posName,
                    'quota' => $posQuota,
                ]);
                $newPositionIds[] = $newPos->id_position;
            }
            $vacancy->positions()->attach($newPositionIds);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && !$vacancy->publish_date) {
            $validated['publish_date'] = now();
        }

        $vacancy->update($validated);

        return response()->json($vacancy->load('positions'));
    }

    /**
     * Remove the specified vacancy.
     */
    public function destroy(Request $request, $id)
    {
        $vacancy = Vacancy::where('id_vacancy', $id)
            ->where('id_company', $request->user()->id_company)
            ->firstOrFail();

        if ($vacancy->photo) {
            Storage::disk('public')->delete($vacancy->photo);
        }

        $vacancy->delete();

        return response()->json(['message' => 'Vacancy deleted successfully']);
    }
}
