<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SignatureController extends Controller
{
    /**
     * Get the current user's signature path
     */
    public function getSignature(Request $request)
    {
        $employee = $request->user()->employee;
        
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found.',
                'signature_url' => null,
            ], 404);
        }

        $url = null;
        if ($employee->signature_path && Storage::disk('public')->exists($employee->signature_path)) {
            $url = asset('storage/' . $employee->signature_path);
        }

        return response()->json([
            'success' => true,
            'signature_url' => $url,
            'signature_path' => $employee->signature_path
        ]);
    }

    /**
     * Store a new signature (receives base64 image)
     */
    public function storeSignature(Request $request)
    {
        $request->validate([
            'signature' => 'required|string', // Base64 encoded image
        ]);

        $employee = $request->user()->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found. Please complete your profile first.',
            ], 404);
        }

        try {
            $base64Image = $request->input('signature');
            
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
            $filename = 'signatures/' . Str::random(20) . '.' . $type;

            // Delete old signature if exists
            if ($employee->signature_path && Storage::disk('public')->exists($employee->signature_path)) {
                Storage::disk('public')->delete($employee->signature_path);
            }

            // Save new signature
            Storage::disk('public')->put($filename, $imageData);

            // Update employee record
            $employee->update([
                'signature_path' => $filename
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signature saved successfully',
                'signature_url' => asset('storage/' . $filename),
                'signature_path' => $filename
            ]);

        } catch (\Exception $e) {
            \Log::error('Store signature error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save signature: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the current user's signature
     */
    public function deleteSignature(Request $request)
    {
        $employee = $request->user()->employee;

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee profile not found.',
            ], 404);
        }

        if ($employee->signature_path && Storage::disk('public')->exists($employee->signature_path)) {
            Storage::disk('public')->delete($employee->signature_path);
        }

        $employee->update([
            'signature_path' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Signature deleted successfully'
        ]);
    }
}
