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
}
