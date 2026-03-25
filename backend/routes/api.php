<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyPublicController;
use App\Http\Controllers\VacancyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProgramController;

// Public vacancy
Route::get('/vacancies/public', [VacancyController::class, 'publicIndex']);

// Public auth 
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-student', [AuthController::class, 'registerStudent']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public company page
Route::get('/c/{slug}', [CompanyPublicController::class, 'show']);
Route::get('/c/{slug}/vacancies', [CompanyPublicController::class, 'vacancies']);

// Candidate auth
Route::post('/auth/register-candidate/{slug}', [AuthController::class, 'registerCandidate']);
Route::post('/auth/login-candidate', [AuthController::class, 'loginCandidate']);
Route::post('/auth/forgot-password-candidate', [AuthController::class, 'forgotPasswordCandidate']);
Route::post('/auth/reset-password-candidate', [AuthController::class, 'resetPasswordCandidate']);

// Staff auth
Route::post('/auth/activate-account', [AuthController::class, 'activateAccount']);
Route::post('/auth/login-staff', [AuthController::class, 'loginStaff']);
Route::get('/auth/check-activation-token/{token}', [AuthController::class, 'checkActivationToken']);

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
  
    // Candidate
    Route::get('/c/{slug}/my-submission', [CompanyPublicController::class, 'mySubmission']);

    // Vacancy Management
    Route::get('/vacancies', [VacancyController::class, 'index']);
    Route::post('/vacancies', [VacancyController::class, 'store']);
    Route::put('/vacancies/{id}', [VacancyController::class, 'update']);
    Route::delete('/vacancies/{id}', [VacancyController::class, 'destroy']);
    // Dashboard 
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
    // Program
    Route::get('/programs', [ProgramController::class, 'index']);
    Route::get('/programs/{id_position}/competencies', [ProgramController::class, 'getCompetencies']);
    Route::post('/programs/{id_position}/competencies', [ProgramController::class, 'updateCompetencies']);
    Route::delete('/programs/{id_vacancy}/{id_position}', [ProgramController::class, 'destroy']);
  
});

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        "message" => "API Laravel berhasil"
    ]);
});


