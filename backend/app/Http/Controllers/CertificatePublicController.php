<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificatePublicController extends Controller
{
    public function verify($idCertificate)
    {
        $certificate = Certificate::with([
            'submission.user',
            'submission.position',
            'submission.vacancy.company',
            'submission.assessment'
        ])
        ->where('id_certificate', $idCertificate)
        ->first();

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Certificate not found or invalid.'
            ], 404);
        }

        $submission = $certificate->submission;
        $user = $submission->user;
        $position = $submission->position;
        $vacancy = $submission->vacancy;
        $company = $vacancy->company ?? null;

        return response()->json([
            'success' => true,
            'certificate' => [
                'id_certificate' => $certificate->id_certificate,
                'certificate_number' => $certificate->certificate_number,
                'issued_date' => \Carbon\Carbon::parse($certificate->issued_date)->translatedFormat('d F Y'),
                'final_score' => $certificate->final_score,
                'candidate_name' => $user->name ?? 'N/A',
                'position_name' => $position->name ?? 'N/A',
                'program_title' => $vacancy->title ?? 'N/A',
                'company_name' => $company->name ?? 'N/A',
                'company_logo' => $company && $company->logo_path ? asset('storage/' . $company->logo_path) : null,
                'status' => 'Verified'
            ]
        ]);
    }
}
