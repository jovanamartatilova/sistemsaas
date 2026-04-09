<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\User;
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
use App\Http\Controllers\HR\HRDashboardController;
use App\Http\Controllers\HR\HRCandidateController;
use App\Http\Controllers\HR\HRScreeningController;
use App\Http\Controllers\HR\HRInterviewController;
use App\Http\Controllers\HR\HRLoaController;
use App\Http\Controllers\HR\HRPayrollController;
use App\Http\Controllers\HR\HRMentorAssignmentController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\MentorController;

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
Route::post('/auth/register-candidate', [AuthController::class, 'registerCandidateGeneric']);
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // API Routes for React Frontend (Candidate Dashboard)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Route::get('/users/me', [CandidateController::class, 'getMe']);
    Route::put('/users/{id_user}', [CandidateController::class, 'updateUser']);
    Route::post('/users/{id_user}/upload-avatar', [CandidateController::class, 'uploadAvatar']);
    Route::get('/positions', [CandidateController::class, 'getPositions']);
    Route::get('/certificates', [CandidateController::class, 'getCertificates']);
    Route::post('/logout', [CandidateController::class, 'logout']);

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

    // Position Catalog
    Route::get('/positions/catalog', [ProgramController::class, 'getCatalog']);
    Route::post('/positions/catalog', [ProgramController::class, 'storeCatalog']);
    Route::put('/positions/catalog/{id}', [ProgramController::class, 'updateCatalog']);
    Route::delete('/positions/catalog/{id}', [ProgramController::class, 'destroyCatalog']);

    // User Management (Company Level)
    Route::get('/company-users', [CompanyUserController::class, 'index']);
    Route::post('/company-users', [CompanyUserController::class, 'store']);
    Route::put('/company-users/{id}', [CompanyUserController::class, 'update']);
    Route::delete('/company-users/{id}', [CompanyUserController::class, 'destroy']);

    // Company Management
    Route::put('/company/profile', [CompanyController::class, 'updateProfile']);
    Route::post('/company/logo', [CompanyController::class, 'uploadLogo']);
    Route::delete('/company/logo', [CompanyController::class, 'removeLogo']);
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

// Mentor — Protected routes untuk mentor yang sudah login
Route::prefix('mentor')->middleware(['auth:sanctum', 'mentorRole'])->group(function () {
    // Profile
    Route::get('/profile', [MentorController::class, 'getProfile']);

    // Dashboard
    Route::get('/dashboard', [MentorController::class, 'getDashboard']);

    // Interns Management
    Route::get('/interns', [MentorController::class, 'getInterns']);

    // Competencies
    Route::get('/interns/{id_submission}/competencies', [MentorController::class, 'getCompetencies']);

    // Scores
    Route::post('/interns/{id_submission}/scores', [MentorController::class, 'inputScores']);
    Route::get('/score-recap', [MentorController::class, 'getScoreRecap']);

    // Evaluation
    Route::get('/interns/{id_submission}/evaluation', [MentorController::class, 'getEvaluation']);
    Route::post('/interns/{id_submission}/evaluation', [MentorController::class, 'saveEvaluation']);

    // Certificates
    Route::get('/certificates', [MentorController::class, 'getCertificates']);
    Route::post('/interns/{id_submission}/generate-certificate', [MentorController::class, 'generateCertificate']);
});

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        "message" => "API Laravel berhasil"
    ]);
});

// Development: Get test token (only in development)
if (env('APP_DEBUG', false)) {
    Route::post('/dev/test-token', function (Request $request) {
        try {
            $user = User::where('role', 'hr')->first();
            if (!$user) {
                // Get or create a test company first
                $company = \App\Models\Company::first();
                if (!$company) {
                    $company = \App\Models\Company::create([
                        'id_company' => 'CMP' . strtoupper(Str::random(7)),
                        'name' => 'Test Company',
                        'slug' => 'test-company',
                        'is_active' => true,
                    ]);
                }

                // Create a test HR user with valid company
                $user = User::create([
                    'id_user' => 'USR' . strtoupper(Str::random(7)),
                    'id_company' => $company->id_company,
                    'name' => 'Test HR',
                    'email' => 'test-hr@example.com',
                    'password' => Hash::make('password'),
                    'role' => 'hr',
                    'is_active' => true,
                ]);
            }
            $token = $user->createToken('test_token')->plainTextToken;
            return response()->json([
                'token' => $token,
                'user' => $user,
                'message' => 'Test token generated',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
}

// Test endpoint for HR (no auth required for testing)
Route::get('/hr/interviews-test', function () {
    return response()->json([
        'success' => true,
        'data' => [
            'stats' => [
                'today' => 0,
                'pending' => 0,
                'completed' => 0,
            ],
            'interviews' => [],
        ]
    ]);
});

// HR
Route::middleware(['auth:sanctum'])->prefix('hr')->group(function () {

    // Dashboard
    Route::get('/dashboard', [HRDashboardController::class, 'index']);

    // Candidates
    Route::get('/candidates',                          [HRCandidateController::class, 'index']);
    Route::get('/candidates/export',                   [HRCandidateController::class, 'exportCsv']);
    Route::patch('/candidates/{id}/accept',            [HRCandidateController::class, 'accept']);
    Route::patch('/candidates/{id}/reject',            [HRCandidateController::class, 'reject']);
    Route::get('/candidates/{id}/documents/{type}',    [HRCandidateController::class, 'viewDocument']);

    // Screening
    Route::get('/screening',                           [HRScreeningController::class, 'index']);
    Route::patch('/screening/{id}/pass',               [HRScreeningController::class, 'pass']);
    Route::patch('/screening/{id}/reject',             [HRScreeningController::class, 'reject']);
    Route::post('/screening/{id}/notes',               [HRScreeningController::class, 'saveNotes']);
    Route::post('/screening/{id}/ai-check',            [HRScreeningController::class, 'aiCheck']);
    Route::get('/screening/{id}/document/{type}',      [HRScreeningController::class, 'viewDocument']);

    // Interview
    Route::get('/interviews',                          [HRInterviewController::class, 'index']);
    Route::post('/interviews',                         [HRInterviewController::class, 'store']);
    Route::patch('/interviews/{id}',                   [HRInterviewController::class, 'update']);
    Route::patch('/interviews/{id}/result',            [HRInterviewController::class, 'updateResult']);

    // LoA
    Route::get('/loa',                                 [HRLoaController::class, 'index']);
    Route::post('/loa/bulk-generate',                  [HRLoaController::class, 'bulkGenerate']);
    Route::post('/loa/{id}/generate',                  [HRLoaController::class, 'generate']);
    Route::get('/loa/{id}/download',                   [HRLoaController::class, 'download']);

    // Payroll
    Route::get('/payroll',            [HRPayrollController::class, 'index']);
    Route::post('/payroll',           [HRPayrollController::class, 'store']);
    Route::patch('/payroll/{id}/pay', [HRPayrollController::class, 'pay']);
    Route::get('/payroll/export',     [HRPayrollController::class, 'exportCsv']);

    // Mentor Assignment
    Route::get('/assign-mentor',         [HRMentorAssignmentController::class, 'index']);
    Route::post('/assign-mentor',        [HRMentorAssignmentController::class, 'assign']);
    Route::post('/assign-mentor/auto',   [HRMentorAssignmentController::class, 'autoAssign']);
    Route::delete('/assign-mentor/{id}', [HRMentorAssignmentController::class, 'unassign']);
});
