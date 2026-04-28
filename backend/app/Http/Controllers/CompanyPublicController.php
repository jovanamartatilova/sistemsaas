<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyPublicController extends Controller
{
    public function show($idCompany)
    {
        $company = Company::where('id_company', $idCompany)->firstOrFail();

        // ✅ Associate candidate with company if they are logged in and don't have one yet
        if ($user = auth('sanctum')->user()) {
            if (!$user->id_company) {
                $user->id_company = $company->id_company;
                $user->save();
            }
        }

        return response()->json(['company' => $company]);
    }

    public function vacancies($idCompany)
    {
        $company = Company::where('id_company', $idCompany)->firstOrFail();
        
        // ✅ Associate candidate with company if they are logged in and don't have one yet
        if ($user = auth('sanctum')->user()) {
            if (!$user->id_company) {
                $user->id_company = $company->id_company;
                $user->save();
            }
        }

        // Auto-close vacancies past deadline
        \App\Models\Vacancy::closeExpired($company->id_company);

        $vacancies = \App\Models\Vacancy::where('id_company', $company->id_company)
            ->where('status', 'published')
            ->with('positions')
            ->get();

        return response()->json(['vacancies' => $vacancies]);
    }

    public function mySubmission(Request $request, $idCompany)
    {
        $company = Company::where('id_company', $idCompany)->firstOrFail();
        $user = $request->user();

        // ✅ Associate candidate with company if they are logged in and don't have one yet
        if ($user && !$user->id_company) {
            $user->id_company = $company->id_company;
            $user->save();
        }

        $submission = \App\Models\Submission::where('id_user', $user->id_user)
            ->whereHas('vacancy', function($q) use ($company) {
                $q->where('id_company', $company->id_company);
            })
            ->with(['vacancy.positions'])
            ->first();

        return response()->json(['submission' => $submission]);
    }
}
