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
use App\Http\Controllers\TeamInvitationController;

// Controllers — HR
use App\Http\Controllers\HR\HRCandidateController;
use App\Http\Controllers\HR\HRDashboardController;
use App\Http\Controllers\HR\HRInterviewController;
use App\Http\Controllers\HR\HRLoaController;
use App\Http\Controllers\HR\HRMentorAssignmentController;
use App\Http\Controllers\HR\HRPayrollController;
use App\Http\Controllers\HR\HRScreeningController;
use App\Http\Controllers\HR\SelectionAIController;
use App\Http\Controllers\HR\TFIDFSearchController;

// Controllers — Super Admin
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\SuperAdmin\UserController;
use App\Http\Controllers\Company\CompanyConfigController;

// Controllers — Admin
use App\Http\Controllers\Admin\TeamSyncController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login-company', [AuthController::class, 'loginCompany']);
Route::get('/vacancies/public', [VacancyController::class, 'publicIndex']);
Route::get('/c/{id_company}', [CompanyPublicController::class, 'show']);
Route::get('/c/{id_company}/vacancies', [CompanyPublicController::class, 'vacancies']);
Route::get('/invitation-codes/validate/{code}', [AuthController::class, 'validateInvitationCode']);
Route::post('/auth/activate', [AuthController::class, 'activateAccount']);
Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile',          [AuthController::class, 'profile']);
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/auth/profile',     [AuthController::class, 'profile']);
    Route::post('/auth/logout',     [AuthController::class, 'logout']);
    Route::get('/company/roles',    [AuthController::class, 'companyRoles']);

    // Invitation Codes
    Route::get('/company/invitation-codes',                  [AuthController::class, 'listInvitationCodes']);
    Route::post('/company/invitation-codes',                 [AuthController::class, 'createInvitationCode']);
    Route::patch('/company/invitation-codes/{id}/toggle',    [AuthController::class, 'toggleInvitationCode']);
    Route::delete('/company/invitation-codes/{id}',          [AuthController::class, 'deleteInvitationCode']);

    Route::post('/create-company',            [AuthController::class, 'createCompany']);
    Route::post('/create-candidate-profile',  [AuthController::class, 'createCandidateProfile']);

    // Company Config
    Route::prefix('company/config')->group(function () {
        Route::get('/roles',                   [CompanyConfigController::class, 'listRoles']);
        Route::post('/roles',                  [CompanyConfigController::class, 'storeRole']);
        Route::put('/roles/{id}',              [CompanyConfigController::class, 'updateRole']);
        Route::delete('/roles/{id}',           [CompanyConfigController::class, 'destroyRole']);
        Route::get('/divisions',               [CompanyConfigController::class, 'listDivisions']);
        Route::post('/divisions',              [CompanyConfigController::class, 'storeDivision']);
        Route::put('/divisions/{id}',          [CompanyConfigController::class, 'updateDivision']);
        Route::delete('/divisions/{id}',       [CompanyConfigController::class, 'destroyDivision']);
        Route::get('/staff-positions',         [CompanyConfigController::class, 'listStaffPositions']);
        Route::post('/staff-positions',        [CompanyConfigController::class, 'storeStaffPosition']);
        Route::put('/staff-positions/{id}',    [CompanyConfigController::class, 'updateStaffPosition']);
        Route::delete('/staff-positions/{id}', [CompanyConfigController::class, 'destroyStaffPosition']);
        Route::get('/job-levels',              [CompanyConfigController::class, 'listJobLevels']);
        Route::post('/job-levels',             [CompanyConfigController::class, 'storeJobLevel']);
        Route::put('/job-levels/{id}',         [CompanyConfigController::class, 'updateJobLevel']);
        Route::delete('/job-levels/{id}',      [CompanyConfigController::class, 'destroyJobLevel']);
    });

    Route::get('/test', fn () => response()->json(['message' => 'API Laravel berhasil']));

    // AI Proxy (Groq)
    Route::post('/ai/generate', function (Request $request) {
        try {
            if (!env('GROQ_API_KEY')) {
                return response()->json(['error' => 'API Key belum di set. Silakan masukkan GROQ_API_KEY di file .env backend Anda.'], 500);
            }
            $response = Http::withOptions(['verify' => false, 'timeout' => 30])
                ->withHeaders([
                    'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
                    'Content-Type'  => 'application/json',
                ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model'       => 'llama-3.3-70b-versatile',
                    'messages'    => [['role' => 'user', 'content' => $request->input('prompt')]],
                    'temperature' => 0.6,
                    'max_tokens'  => 200,
                ]);
            if ($response->successful()) {
                return response()->json(['response' => $response->json('choices.0.message.content')]);
            }
            return response()->json(['error' => 'Groq API error', 'details' => $response->body()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to connect to AI Service.', 'msg' => $e->getMessage()], 500);
        }
    });

    // User / Candidate self-service
    Route::get('/users/me',                       [CandidateController::class, 'getMe']);
    Route::put('/users/{id_user}',                [CandidateController::class, 'updateUser']);
    Route::post('/users/{id_user}/upload-avatar', [CandidateController::class, 'uploadAvatar']);
    Route::get('/positions',                      [CandidateController::class, 'getPositions']);
    Route::get('/certificates',                   [CandidateController::class, 'getCertificates']);

    // Candidate apply
    Route::get('/submissions',                    [SubmissionController::class, 'index']);
    Route::get('/c/{id_company}/my-submission',   [CompanyPublicController::class, 'mySubmission']);
    Route::post('/c/{id_company}/apply',          [SubmissionController::class, 'apply']);

    // Vacancies
    Route::get('/vacancies',         [VacancyController::class, 'index']);
    Route::post('/vacancies',        [VacancyController::class, 'store']);
    Route::put('/vacancies/{id}',    [VacancyController::class, 'update']);
    Route::delete('/vacancies/{id}', [VacancyController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard/stats',   [DashboardController::class, 'index']);

    // Programs
    Route::get('/programs',                               [ProgramController::class, 'index']);
    Route::get('/programs/{id_position}/competencies',    [ProgramController::class, 'getCompetencies']);
    Route::post('/programs/{id_position}/competencies',   [ProgramController::class, 'updateCompetencies']);
    Route::delete('/programs/{id_vacancy}/{id_position}', [ProgramController::class, 'destroy']);

    // Position catalog
    Route::get('/positions/catalog',          [ProgramController::class, 'getCatalog']);
    Route::post('/positions/catalog',         [ProgramController::class, 'storeCatalog']);
    Route::put('/positions/catalog/{id}',     [ProgramController::class, 'updateCatalog']);
    Route::delete('/positions/catalog/{id}',  [ProgramController::class, 'destroyCatalog']);

    // Company users
    Route::get('/company-users',         [CompanyUserController::class, 'index']);
    Route::post('/company-users',        [CompanyUserController::class, 'store']);
    Route::put('/company-users/{id}',    [CompanyUserController::class, 'update']);
    Route::delete('/company-users/{id}', [CompanyUserController::class, 'destroy']);

    // Company profile
    Route::put('/company/profile',  [CompanyController::class, 'updateProfile']);
    Route::post('/company/logo',    [CompanyController::class, 'uploadLogo']);
    Route::delete('/company/logo',  [CompanyController::class, 'removeLogo']);

});

// Super Admin Routes

Route::post('/auth/login-superadmin', function (Request $request) {
    $validated = $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    $user = \App\Models\User::where('email', $validated['email'])
                ->where('role', 'super_admin')
                ->first();

    if (!$user || !\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials or not a super admin'], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'token'   => $token,
        'user'    => [
            'id_user' => $user->id_user,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
        ],
    ]);
});

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

// Team Invitation Routes (Authenticated candidates)

Route::middleware('auth:sanctum')->group(function () {
    // Public validation (no login required for some endpoints)
    Route::get('/team-invitations/{token}/validate', [TeamInvitationController::class, 'validate']);
    Route::post('/team-invitations/{token}/join', [TeamInvitationController::class, 'join']);
    Route::get('/leader/program', [ProgramController::class, 'leaderProgramView']);
    Route::get('/leader/invitations', [TeamInvitationController::class, 'getLeaderInvitations']);


    // Protected team invitation endpoints
    Route::post('/teams',                            [TeamInvitationController::class, 'createTeam']);
    Route::post('/team-invitations',                  [TeamInvitationController::class, 'create']);
    Route::post('/team-invitations/{token}/join',    [TeamInvitationController::class, 'join']);
    Route::get('/team-invitations',                 [TeamInvitationController::class, 'getLeaderInvitations']);
    Route::get('/my-teams',                          [TeamInvitationController::class, 'listMyTeams']);
    Route::patch('/team-invitations/{id}/toggle',    [TeamInvitationController::class, 'toggle']);
    Route::delete('/team-invitations/{id}',          [TeamInvitationController::class, 'revoke']);
    Route::post('/team-invitations/{id}/regenerate', [TeamInvitationController::class, 'regenerate']);
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
    Route::get('/score-recap',              [MentorController::class, 'getScoreRecap']);
    Route::get('/certificates',             [MentorController::class, 'getCertificates']);
    Route::post('/certificates/bulk-generate', [MentorController::class, 'bulkGenerateCertificates']);
    Route::post('/certificates/bulk-send',     [MentorController::class, 'bulkSendCertificates']);

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

    Route::get('/candidates/export',                [HRCandidateController::class, 'exportCsv']);
    Route::get('/candidates/all',                   [HRCandidateController::class, 'allCandidates']);
    Route::get('/candidates',                       [HRCandidateController::class, 'index']);
    Route::patch('/candidates/{id}/accept',         [HRCandidateController::class, 'accept']);
    Route::patch('/candidates/{id}/reject',         [HRCandidateController::class, 'reject']);
    Route::patch('/candidates/{id}/stage',          [HRCandidateController::class, 'updateStage']);
    Route::patch('/candidates/{id}/notes',          [HRCandidateController::class, 'updateNotes']);
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
    Route::post('/payroll/stipend',     [HRPayrollController::class, 'updateProgramStipend']);
    Route::post('/payroll/pay',         [HRPayrollController::class, 'pay']);
    Route::post('/payroll/rollback',    [HRPayrollController::class, 'rollback']);
    Route::post('/payroll/terminate',   [HRPayrollController::class, 'terminate']);
    Route::get('/payroll/export',       [HRPayrollController::class, 'exportCsv']);

    // Mentor assignment
    Route::get('/assign-mentor',          [HRMentorAssignmentController::class, 'index']);
    Route::post('/assign-mentor',         [HRMentorAssignmentController::class, 'assign']);
    Route::post('/assign-mentor/auto',    [HRMentorAssignmentController::class, 'autoAssign']);
    Route::delete('/assign-mentor/{id}',  [HRMentorAssignmentController::class, 'unassign']);

    // TF-IDF Search (legacy)
    Route::get('candidates/tfidf-search', [TFIDFSearchController::class, 'search']);
    Route::get('candidates/index-stats', [TFIDFSearchController::class, 'indexStats']);
    Route::post('candidates/classify-batch', [TFIDFSearchController::class, 'classifyBatch']);
    Route::get('candidates/{id}/classify', [TFIDFSearchController::class, 'classify']);

    // Selection AI
    Route::prefix('selection')->group(function () {
        Route::post('/rank-stage', [SelectionAIController::class, 'rankStage']);
        Route::get('/summarize/{id}', [SelectionAIController::class, 'summarize']);
        Route::get('/suggest/{id}', [SelectionAIController::class, 'suggestDecision']);
    });
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

    // Admin Team Sync Routes (internal use only)
    Route::prefix('admin/team-sync')->group(function () {
        Route::get('/fix-team-candidates', [TeamSyncController::class, 'fixTeamCandidates']);
        Route::get('/sync-all', [TeamSyncController::class, 'syncAll']);
    });
}
