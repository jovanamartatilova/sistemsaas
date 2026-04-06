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
        // Auto-close vacancies past deadline
        Vacancy::closeExpired();

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
        $id_company = $request->user()->id_company;

        // Auto-close vacancies past deadline for this company
        Vacancy::closeExpired($id_company);

        $vacancies = Vacancy::with(['positions', 'submissions.user', 'submissions.position'])
            ->where('id_company', $id_company)
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

        // Handle Positions (Use existing or create if new)
        $positionPivotData = [];
        foreach ($validated['positions'] as $posData) {
            $posId = $posData['id_position'] ?? null;
            $posName = $posData['name'] ?? '';
            $posQuota = (int)($posData['quota'] ?? 0);
            
            if ($posId) {
                $position = Position::where('id_position', $posId)->first();
            } else if ($posName) {
                // Support legacy or new on-the-fly creation
                $position = Position::firstOrCreate(
                    ['name' => $posName, 'id_company' => $request->user()->id_company],
                    ['id_position' => 'POS' . strtoupper(Str::random(7)), 'quota' => 0]
                );
            }

            if (isset($position)) {
                $positionPivotData[$position->id_position] = ['quota' => $posQuota];
            }
        }

        // Handle Photo Upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            try {
                $photoPath = $request->file('photo')->store('vacancies', 'public');
            } catch (\Exception $e) {
                Log::error('Photo upload exception: ' . $e->getMessage());
            }
        }

        // Format Dates
        try {
            $formattedDeadline = Carbon::parse($validated['deadline'])->format('Y-m-d');
            $formattedStartDate = Carbon::parse($validated['start_date'])->format('Y-m-d');
            $formattedEndDate = Carbon::parse($validated['end_date'])->format('Y-m-d');

            // Validation: Cannot publish with a past deadline
            if ($validated['status'] === 'published' && Carbon::parse($formattedDeadline)->isPast() && !Carbon::parse($formattedDeadline)->isToday()) {
                return response()->json(['errors' => ['deadline' => ['Deadline cannot be in the past when publishing.']]], 422);
            }
        } catch (\Exception $e) {
            return response()->json(['errors' => ['dates' => ['Format tanggal tidak valid.']]], 422);
        }

        // Combine Location
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

        // Attach positions with pivot quota
        $vacancy->positions()->attach($positionPivotData);

        return response()->json($vacancy->load('positions'), 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
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
            'positions.*.id_position' => 'nullable|string',
            'positions.*.name' => 'sometimes|string|max:100',
            'positions.*.quota' => 'sometimes|integer|min:0',
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
            if (isset($validated['deadline'])) $validated['deadline'] = Carbon::parse($validated['deadline'])->format('Y-m-d');
            if (isset($validated['start_date'])) $validated['start_date'] = Carbon::parse($validated['start_date'])->format('Y-m-d');
            if (isset($validated['end_date'])) $validated['end_date'] = Carbon::parse($validated['end_date'])->format('Y-m-d');

            // Validation: Cannot publish with a past deadline
            $targetStatus = $validated['status'] ?? $vacancy->status;
            $targetDeadline = $validated['deadline'] ?? $vacancy->deadline;
            if ($targetStatus === 'published' && Carbon::parse($targetDeadline)->isPast() && !Carbon::parse($targetDeadline)->isToday()) {
                return response()->json(['errors' => ['deadline' => ['Deadline cannot be in the past when publishing.']]], 422);
            }
        } catch (\Exception $e) {
            return response()->json(['errors' => ['dates' => ['Format tanggal tidak valid.']]], 422);
        }

        // Handle Location
        if (isset($validated['city']) || isset($validated['province']) || isset($validated['address'])) {
            $city = $validated['city'] ?? explode(', ', $vacancy->location)[0] ?? '';
            $province = $validated['province'] ?? explode(', ', $vacancy->location)[1] ?? '';
            $address = $validated['address'] ?? explode(', ', $vacancy->location)[2] ?? '';
            $validated['location'] = $city . ', ' . $province . ', ' . $address;
        }

        // Handle Position sync with pivot quota
        if (isset($validated['positions'])) {
            $positionPivotData = [];
            foreach ($validated['positions'] as $posData) {
                $posId = $posData['id_position'] ?? null;
                $posName = $posData['name'] ?? '';
                $posQuota = (int)($posData['quota'] ?? 0);

                if ($posId) {
                    $position = Position::where('id_position', $posId)->first();
                } else if ($posName) {
                    $position = Position::firstOrCreate(
                        ['name' => $posName, 'id_company' => $request->user()->id_company],
                        ['id_position' => 'POS' . strtoupper(Str::random(7)), 'quota' => 0]
                    );
                }

                if (isset($position)) {
                    $positionPivotData[$position->id_position] = ['quota' => $posQuota];
                }
            }
            $vacancy->positions()->sync($positionPivotData);
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
