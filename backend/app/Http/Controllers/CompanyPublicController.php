<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyPublicController extends Controller
{
    public function show($slug)
{
    $company = Company::where('slug', $slug)->firstOrFail();
    return response()->json(['company' => $company]);
}

public function vacancies($slug)
{
    $company = Company::where('slug', $slug)->firstOrFail();
    $vacancies = \App\Models\Vacancy::where('id_company', $company->id_company)
        ->where('status', 'active')
        ->with('positions')
        ->get();

    return response()->json(['vacancies' => $vacancies]);
}

public function mySubmission(Request $request, $slug)
{
    $company = Company::where('slug', $slug)->firstOrFail();
    $user = $request->user();

    $submission = \App\Models\Submission::where('id_user', $user->id_user)
        ->whereHas('vacancy', function($q) use ($company) {
            $q->where('id_company', $company->id_company);
        })
        ->with(['vacancy.positions'])
        ->first();

    return response()->json(['submission' => $submission]);
}
}
