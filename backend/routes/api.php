<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyPublicController;
use App\Http\Controllers\VacancyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\SuperAdmin\UserController;
use App\Http\Controllers\CompanyUserController;
use App\Http\Controllers\CandidateController;

// Public vacancy
Route::get('/vacancies/public', [VacancyController::class, 'publicIndex']);

// Public auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-student', [AuthController::class, 'registerStudent']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/login-superadmin', [AuthController::class, 'loginSuperAdmin']);
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

use App\Http\Controllers\SubmissionController;

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Candidate
    Route::get('/c/{slug}/my-submission', [CompanyPublicController::class, 'mySubmission']);
    Route::post('/c/{slug}/apply', [SubmissionController::class, 'apply']);

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

    // User Management (Company Level)
    Route::get('/company-users', [CompanyUserController::class, 'index']);
    Route::post('/company-users', [CompanyUserController::class, 'store']);
    Route::put('/company-users/{id}', [CompanyUserController::class, 'update']);
    Route::delete('/company-users/{id}', [CompanyUserController::class, 'destroy']);
});
// Super Admin
Route::prefix('superadmin')->middleware(['auth:sanctum', 'superadmin'])->group(function () {
    Route::get('/dashboard/stats', [SuperAdminDashboardController::class, 'stats']);
    Route::get('/tenants', [TenantController::class, 'index']);
    Route::get('/tenants/{id}', [TenantController::class, 'show']);
    Route::patch('/tenants/{id}/status', [TenantController::class, 'updateStatus']);
    Route::get('/users', [UserController::class, 'index']);
});

// Candidate — Protected routes untuk candidate yang sudah login
Route::prefix('candidate')->middleware(['auth:sanctum', 'ensureCandidate'])->group(function () {

    // Dashboard — satu endpoint untuk semua data di halaman dashboard
    Route::get('/dashboard',            [CandidateController::class, 'dashboard']);

    // Profile
    Route::get('/profile',              [CandidateController::class, 'getProfile']);
    Route::put('/profile',              [CandidateController::class, 'updateProfile']);
    Route::post('/profile/photo',       [CandidateController::class, 'uploadPhoto']);

    // Skills
    Route::get('/skills',               [CandidateController::class, 'getSkills']);
    Route::post('/skills',              [CandidateController::class, 'addSkill']);
    Route::delete('/skills/{id_skill}', [CandidateController::class, 'deleteSkill']);
});

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        "message" => "API Laravel berhasil"
    ]);
});



