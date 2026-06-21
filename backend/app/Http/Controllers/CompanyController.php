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

    /**
     * Get the company's stamp.
     */
    public function getStamp(Request $request)
    {
        $id_company = $request->user()->id_company;
        $company = Company::where('id_company', $id_company)->firstOrFail();

        $url = null;
        if ($company->stamp_path && Storage::disk('public')->exists($company->stamp_path)) {
            $url = asset('storage/' . $company->stamp_path);
        }

        return response()->json([
            'success' => true,
            'stamp_url' => $url,
            'stamp_path' => $company->stamp_path
        ]);
    }

    /**
     * Upload and update the company's stamp (base64 image).
     */
    public function uploadStamp(Request $request)
    {
        $request->validate([
            'stamp' => 'required|string', // Base64 encoded image
        ]);

        $id_company = $request->user()->id_company;
        $company = Company::where('id_company', $id_company)->firstOrFail();

        try {
            $base64Image = $request->input('stamp');
            
            // Extract the base64 data
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, etc.

                if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    throw new \Exception('Invalid image type.');
                }
                
                $base64Image = str_replace(' ', '+', $base64Image);
                $imageData = base64_decode($base64Image);

                if ($imageData === false) {
                    throw new \Exception('Base64 decode failed.');
                }
            } else {
                throw new \Exception('Invalid base64 format.');
            }

            // Generate unique filename
            $filename = 'stamps/' . \Illuminate\Support\Str::random(20) . '.' . $type;

            // Delete old stamp if exists
            if ($company->stamp_path && Storage::disk('public')->exists($company->stamp_path)) {
                Storage::disk('public')->delete($company->stamp_path);
            }

            // Save new stamp
            Storage::disk('public')->put($filename, $imageData);

            // Update company record
            $company->update([
                'stamp_path' => $filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stamp uploaded successfully.',
                'stamp_url' => asset('storage/' . $filename),
                'stamp_path' => $filename
            ]);
        } catch (\Exception $e) {
            Log::error('Stamp upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload stamp: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the company's stamp.
     */
    public function deleteStamp(Request $request)
    {
        $id_company = $request->user()->id_company;
        $company = Company::where('id_company', $id_company)->firstOrFail();

        try {
            if ($company->stamp_path && Storage::disk('public')->exists($company->stamp_path)) {
                Storage::disk('public')->delete($company->stamp_path);
            }

            $company->update([
                'stamp_path' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stamp deleted successfully.'
            ]);
        } catch (\Exception $e) {
            Log::error('Stamp deletion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete stamp: ' . $e->getMessage()
            ], 500);
        }
    }
}
