<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use App\Models\User;

// Controllers — Auth & Public
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompanyPublicController;
use App\Http\Controllers\SubmissionController;

// Controllers — Company & Dashboard
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanyUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\VacancyController;

// Controllers — Users
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\MentorController;
use App\Http\Controllers\MemberTaskController;
use App\Http\Controllers\LeaderController;

// Controllers — HR
use App\Http\Controllers\HR\HRCandidateController;
use App\Http\Controllers\HR\HRDashboardController;
use App\Http\Controllers\HR\HRInterviewController;
use App\Http\Controllers\HR\HRLoaController;
use App\Http\Controllers\HR\HRMentorAssignmentController;
use App\Http\Controllers\HR\HRPayrollController;
use App\Http\Controllers\HR\HRScreeningController;

// Controllers — Super Admin
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\SuperAdmin\UserController;

// Public Routes

// Vacancy
Route::get('/vacancies/public', [VacancyController::class, 'publicIndex']);

// Company public page
Route::get('/c/{slug}',           [CompanyPublicController::class, 'show']);
Route::get('/c/{slug}/vacancies', [CompanyPublicController::class, 'vacancies']);

// Auth — general
Route::post('/auth/register',        [AuthController::class, 'register']);
Route::post('/auth/register-student', [AuthController::class, 'registerStudent']);
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/login-superadmin', [AuthController::class, 'loginSuperAdmin']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);
Route::post('/auth/reset-password-no-auto', [AuthController::class, 'resetPasswordNoAutoLogin']);

// Auth — candidate
Route::post('/auth/register-candidate/{slug}', [AuthController::class, 'registerCandidate']);
Route::post('/auth/register-candidate',        [AuthController::class, 'registerCandidateGeneric']);
Route::post('/auth/login-candidate',           [AuthController::class, 'loginCandidate']);
Route::post('/auth/forgot-password-candidate', [AuthController::class, 'forgotPasswordCandidate']);
Route::post('/auth/reset-password-candidate',  [AuthController::class, 'resetPasswordCandidate']);

// Auth — staff
Route::post('/auth/activate-account',             [AuthController::class, 'activateAccount']);
Route::post('/auth/login-staff',                  [AuthController::class, 'loginStaff']);
Route::post('/auth/forgot-password-staff',        [AuthController::class, 'forgotPasswordStaff']);
Route::post('/auth/reset-password-staff',         [AuthController::class, 'resetPasswordStaff']);
Route::get('/auth/check-activation-token/{token}', [AuthController::class, 'checkActivationToken']);

// Test
Route::get('/test', fn () => response()->json(['message' => 'API Laravel berhasil']));

// Authenticated Routes (General)

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);

    // AI Proxy (Groq)
    Route::post('/ai/generate', function (Request $request) {
        try {
            if (!env('GROQ_API_KEY')) {
                return response()->json(['error' => 'API Key belum di set. Silakan masukkan GROQ_API_KEY di file .env backend Anda.'], 500);
            }

            $response = Http::withOptions([
                'verify' => false,
                'timeout' => 30
            ])->withHeaders([
                'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => 'llama-3.3-70b-versatile',
                'messages' => [
                    ['role' => 'user', 'content' => $request->input('prompt')]
                ],
                'temperature' => 0.6,
                'max_tokens' => 200
            ]);
            
            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                return response()->json(['response' => $content]);
            }
            return response()->json(['error' => 'Groq API error', 'details' => $response->body()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to connect to AI Service.', 'msg' => $e->getMessage()], 500);
        }
    });

    // User (candidate self-service)
    Route::get('/users/me',                         [CandidateController::class, 'getMe']);
    Route::put('/users/{id_user}',                  [CandidateController::class, 'updateUser']);
    Route::post('/users/{id_user}/upload-avatar',   [CandidateController::class, 'uploadAvatar']);
    Route::get('/positions',                        [CandidateController::class, 'getPositions']);
    Route::get('/certificates',                     [CandidateController::class, 'getCertificates']);
    Route::post('/logout',                          [CandidateController::class, 'logout']);

    // Candidate — apply
    Route::get('/c/{slug}/my-submission', [CompanyPublicController::class, 'mySubmission']);
    Route::post('/c/{slug}/apply',        [SubmissionController::class, 'apply']);

    // Vacancies
    Route::get('/vacancies',        [VacancyController::class, 'index']);
    Route::post('/vacancies',       [VacancyController::class, 'store']);
    Route::put('/vacancies/{id}',   [VacancyController::class, 'update']);
    Route::delete('/vacancies/{id}', [VacancyController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);

    // Programs
    Route::get('/programs',                              [ProgramController::class, 'index']);
    Route::get('/programs/{id_position}/competencies',   [ProgramController::class, 'getCompetencies']);
    Route::post('/programs/{id_position}/competencies',  [ProgramController::class, 'updateCompetencies']);
    Route::delete('/programs/{id_vacancy}/{id_position}', [ProgramController::class, 'destroy']);

    // Position catalog
    Route::get('/positions/catalog',        [ProgramController::class, 'getCatalog']);
    Route::post('/positions/catalog',       [ProgramController::class, 'storeCatalog']);
    Route::put('/positions/catalog/{id}',   [ProgramController::class, 'updateCatalog']);
    Route::delete('/positions/catalog/{id}', [ProgramController::class, 'destroyCatalog']);

    // Company users
    Route::get('/company-users',        [CompanyUserController::class, 'index']);
    Route::post('/company-users',       [CompanyUserController::class, 'store']);
    Route::put('/company-users/{id}',   [CompanyUserController::class, 'update']);
    Route::delete('/company-users/{id}', [CompanyUserController::class, 'destroy']);

    // Company profile
    Route::put('/company/profile',   [CompanyController::class, 'updateProfile']);
    Route::post('/company/logo',     [CompanyController::class, 'uploadLogo']);
    Route::delete('/company/logo',   [CompanyController::class, 'removeLogo']);
});

// Super Admin Routes

Route::prefix('superadmin')->middleware(['auth:sanctum', 'superadmin'])->group(function () {
    Route::get('/dashboard/stats',      [SuperAdminDashboardController::class, 'stats']);
    Route::get('/tenants',              [TenantController::class, 'index']);
    Route::get('/tenants/{id}',         [TenantController::class, 'show']);
    Route::patch('/tenants/{id}/status', [TenantController::class, 'updateStatus']);
    Route::get('/users',                [UserController::class, 'index']);
});

// Candidate Routes

Route::prefix('candidate')->middleware(['auth:sanctum', 'ensureCandidate'])->group(function () {
    Route::get('/dashboard',           [CandidateController::class, 'dashboard']);

    // Profile
    Route::get('/profile',             [CandidateController::class, 'getProfile']);
    Route::put('/profile',             [CandidateController::class, 'updateProfile']);
    Route::post('/profile/photo',      [CandidateController::class, 'uploadPhoto']);

    // Skills
    Route::get('/skills',              [CandidateController::class, 'getSkills']);
    Route::post('/skills',             [CandidateController::class, 'addSkill']);
    Route::delete('/skills/{id_skill}', [CandidateController::class, 'deleteSkill']);
});

// Member Routes (Team Member Tasks)

Route::prefix('member')->middleware(['auth:sanctum', 'ensureCandidate'])->group(function () {
    Route::get('/dashboard',      [MemberTaskController::class, 'getDashboard']);
    Route::get('/tasks',          [MemberTaskController::class, 'getTasks']);
    Route::put('/tasks/{taskId}', [MemberTaskController::class, 'updateTaskStatus']);
});

// Leader Routes (Team Leader Management)

Route::prefix('leader')->middleware(['auth:sanctum', 'ensureCandidate'])->group(function () {
    Route::get('/dashboard',                [LeaderController::class, 'getDashboard']);
    Route::get('/tasks',                    [LeaderController::class, 'getTasks']);
    Route::put('/tasks/{taskId}',           [LeaderController::class, 'updateTaskStatus']);
    Route::get('/team-members',             [LeaderController::class, 'getTeamMembers']);
    Route::post('/tasks',                   [LeaderController::class, 'assignTask']);
    Route::put('/tasks/subtask/{taskId}',   [LeaderController::class, 'updateSubTask']);
    Route::delete('/tasks/subtask/{taskId}', [LeaderController::class, 'deleteSubTask']);
    Route::post('/tasks/{taskId}/review',    [LeaderController::class, 'reviewSubTask']);

});

// Mentor Routes

Route::prefix('mentor')->middleware(['auth:sanctum', 'mentorRole'])->group(function () {
    Route::get('/profile',   [MentorController::class, 'getProfile']);
    Route::get('/dashboard', [MentorController::class, 'getDashboard']);

    // Interns
    Route::get('/interns',                                          [MentorController::class, 'getInterns']);
    Route::get('/interns/{id_submission}/competencies',             [MentorController::class, 'getCompetencies']);
    Route::post('/interns/{id_submission}/scores',                  [MentorController::class, 'inputScores']);
    Route::get('/interns/{id_submission}/evaluation',               [MentorController::class, 'getEvaluation']);
    Route::post('/interns/{id_submission}/evaluation',              [MentorController::class, 'saveEvaluation']);
    Route::post('/interns/{id_submission}/generate-certificate',    [MentorController::class, 'generateCertificate']);
    Route::get('/interns/{id_submission}/preview-certificate',      [MentorController::class, 'previewCertificate']);
    Route::post('/interns/{id_submission}/send-certificate',        [MentorController::class, 'sendCertificate']);

    // Recap & certificates
    Route::get('/score-recap',   [MentorController::class, 'getScoreRecap']);
    Route::get('/certificates',  [MentorController::class, 'getCertificates']);
    
    // Tasks
    Route::get('/assign-targets', [App\Http\Controllers\MentorTaskController::class, 'getAssignTargets']);
    Route::get('/competencies', [App\Http\Controllers\MentorTaskController::class, 'getCompetencies']);
    Route::get('/tasks',          [App\Http\Controllers\MentorTaskController::class, 'index']);
    Route::post('/tasks',         [App\Http\Controllers\MentorTaskController::class, 'store']);
    Route::put('/tasks/{id}',     [App\Http\Controllers\MentorTaskController::class, 'update']);
    Route::delete('/tasks/{id}',  [App\Http\Controllers\MentorTaskController::class, 'destroy']);
});

// Intern Task Work Routes (leader & member)
Route::middleware(['auth:sanctum'])->prefix('intern')->group(function () {
    Route::post('/tasks/{id_task}/work',        [App\Http\Controllers\MentorTaskController::class, 'submitWork']);
    Route::post('/tasks/{id_task}/upload-file', [App\Http\Controllers\MentorTaskController::class, 'uploadWorkFile']);
});

// HR Routes

Route::middleware(['auth:sanctum'])->prefix('hr')->group(function () {
    Route::get('/dashboard', [HRDashboardController::class, 'index']);

    // Candidates (export must be before {id} pattern)
    Route::get('/candidates/export',                [HRCandidateController::class, 'exportCsv']);
    Route::get('/candidates',                       [HRCandidateController::class, 'index']);
    Route::patch('/candidates/{id}/accept',         [HRCandidateController::class, 'accept']);
    Route::patch('/candidates/{id}/reject',         [HRCandidateController::class, 'reject']);
    Route::patch('/candidates/{id}/screening',      [HRCandidateController::class, 'screening']);
    Route::patch('/candidates/{id}/interview',      [HRCandidateController::class, 'interview']);
    Route::get('/candidates/{id}/documents/{type}', [HRCandidateController::class, 'viewDocument']);

    // Screening
    Route::get('/screening',                        [HRScreeningController::class, 'index']);
    Route::post('/screening/ai-rank',               [HRScreeningController::class, 'aiRank']);
    Route::patch('/screening/{id}/pass',            [HRScreeningController::class, 'pass']);
    Route::patch('/screening/{id}/reject',          [HRScreeningController::class, 'reject']);
    Route::post('/screening/{id}/notes',            [HRScreeningController::class, 'saveNotes']);
    Route::post('/screening/{id}/ai-check',         [HRScreeningController::class, 'aiCheck']);
    Route::get('/screening/{id}/document/{type}',   [HRScreeningController::class, 'viewDocument']);
    Route::get('/screening/semantic-search', [\App\Http\Controllers\HR\SemanticSearchController::class, 'search']);

    // Interviews
    Route::get('/interviews',            [HRInterviewController::class, 'index']);
    Route::post('/interviews',           [HRInterviewController::class, 'store']);
    Route::patch('/interviews/{id}',     [HRInterviewController::class, 'update']);
    Route::patch('/interviews/{id}/result', [HRInterviewController::class, 'updateResult']);

    // LoA
    Route::get('/loa',                  [HRLoaController::class, 'index']);
    Route::post('/loa/bulk-generate',   [HRLoaController::class, 'bulkGenerate']);
    Route::post('/loa/{id}/generate',   [HRLoaController::class, 'generate']);
    Route::get('/loa/{id}/download',    [HRLoaController::class, 'download']);
    Route::post('/loa/{id}/send',       [HRLoaController::class, 'sendLoa']);

    // Payroll
    Route::get('/payroll',              [HRPayrollController::class, 'index']);
    Route::post('/payroll',             [HRPayrollController::class, 'store']);
    Route::patch('/payroll/{id}/pay',   [HRPayrollController::class, 'pay']);
    Route::get('/payroll/export',       [HRPayrollController::class, 'exportCsv']);

    // Mentor assignment
    Route::get('/assign-mentor',          [HRMentorAssignmentController::class, 'index']);
    Route::post('/assign-mentor',         [HRMentorAssignmentController::class, 'assign']);
    Route::post('/assign-mentor/auto',    [HRMentorAssignmentController::class, 'autoAssign']);
    Route::delete('/assign-mentor/{id}',  [HRMentorAssignmentController::class, 'unassign']);
});

// Development-only Routes (DEBUG mode)

if (env('APP_DEBUG', false)) {

    // Quick test token for HR user
    Route::post('/dev/test-token', function (Request $request) {
        try {
            $user = User::where('role', 'hr')->first();

            if (! $user) {
                $company = \App\Models\Company::firstOr(fn () => \App\Models\Company::create([
                    'id_company' => 'CMP' . strtoupper(Str::random(7)),
                    'name'       => 'Test Company',
                    'slug'       => 'test-company',
                    'is_active'  => true,
                ]));

                $user = User::create([
                    'id_user'    => 'USR' . strtoupper(Str::random(7)),
                    'id_company' => $company->id_company,
                    'name'       => 'Test HR',
                    'email'      => 'test-hr@example.com',
                    'password'   => Hash::make('password'),
                    'role'       => 'hr',
                    'is_active'  => true,
                ]);
            }

            return response()->json([
                'token'   => $user->createToken('test_token')->plainTextToken,
                'user'    => $user,
                'message' => 'Test token generated',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    // Stub endpoint for HR interviews (no auth)
    Route::get('/hr/interviews-test', fn () => response()->json([
        'success' => true,
        'data'    => [
            'stats'      => ['today' => 0, 'pending' => 0, 'completed' => 0],
            'interviews' => [],

        ],
    ]));
}
