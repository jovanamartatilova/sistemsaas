<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyPublicController;

// Public auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/c/{slug}/my-submission', [CompanyPublicController::class, 'mySubmission']);
});

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        "message" => "API Laravel berhasil"
    ]);
});

// Halaman publik company (tidak perlu auth)
Route::get('/c/{slug}', [CompanyPublicController::class, 'show']);
Route::get('/c/{slug}/jobs', [CompanyPublicController::class, 'jobs']);
Route::get('/c/{slug}/vacancies', [CompanyPublicController::class, 'vacancies']);

// Auth routes untuk kandidat
Route::post('/auth/register-candidate/{slug}', [AuthController::class, 'registerCandidate']);
Route::post('/auth/login-candidate', [AuthController::class, 'loginCandidate']);
Route::post('/auth/forgot-password-candidate', [AuthController::class, 'forgotPasswordCandidate']);
Route::post('/auth/reset-password-candidate', [AuthController::class, 'resetPasswordCandidate']);

// Auth routes untuk aktivasi akun dan login staff
Route::post('/auth/activate-account', [AuthController::class, 'activateAccount']);
Route::post('/auth/login-staff', [AuthController::class, 'loginStaff']);
Route::get('/auth/check-activation-token/{token}', [AuthController::class, 'checkActivationToken']);