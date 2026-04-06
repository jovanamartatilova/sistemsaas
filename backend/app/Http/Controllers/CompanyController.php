<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CompanyController extends Controller
{
    /**
     * Update the company's profile information.
     */
    public function updateProfile(Request $request)
    {
        $id_company = $request->user()->id_company;
        $company = Company::where('id_company', $id_company)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:companies,email,' . $id_company . ',id_company',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $company->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'company' => $company
        ]);
    }

    /**
     * Upload and update the company's logo.
     */
    public function uploadLogo(Request $request)
    {
        $id_company = $request->user()->id_company;
        $company = Company::where('id_company', $id_company)->firstOrFail();

        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            // Delete old logo if it exists
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            // Store the new logo
            $path = $request->file('logo')->store('logos', 'public');
            $company->logo_path = $path;
            $company->save();

            return response()->json([
                'message' => 'Logo uploaded successfully.',
                'logo_url' => url(Storage::url($path)),
                'company' => $company
            ]);
        } catch (\Exception $e) {
            Log::error('Logo upload error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload logo.'], 500);
        }
    }

    /**
     * Remove the company's logo.
     */
    public function removeLogo(Request $request)
    {
        $id_company = $request->user()->id_company;
        $company = Company::where('id_company', $id_company)->firstOrFail();

        try {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
                $company->logo_path = null;
                $company->save();
            }

            return response()->json([
                'message' => 'Logo removed successfully.',
                'company' => $company
            ]);
        } catch (\Exception $e) {
            Log::error('Logo removal error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to remove logo.'], 500);
        }
    }
}
