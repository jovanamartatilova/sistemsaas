<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\University;
use App\Models\Major;
use App\Models\Team;
use App\Models\Vacancy;
use App\Models\Position;
use App\Models\Submission;
use App\Models\Apprentice;
use App\Models\Competency;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CandidateDashboardSeeder extends Seeder
{
    public function run(): void
    {
        // Team
        $team = Team::firstOrCreate(
            ['name' => 'Batch 1 - Q2 2026'],
            [
                'id_team' => 'T' . strtoupper(Str::random(8)),
                'name' => 'Batch 1 - Q2 2026',
                'team_code' => 'BATCH-Q2-2026',
            ]
        );

        // Company
        $company = Company::firstOrCreate(
            ['slug' => 'pt-telkom-indonesia-persero-tbk'],
            [
                'id_company' => 'C' . strtoupper(Str::random(8)),
                'name' => 'PT Telkom Indonesia (Persero) Tbk',
                'email' => 'hr@telkom.co.id',
                'address' => 'Jakarta, Indonesia',
                'phone' => '021-123456789',
                'description' => 'Perusahaan telekomunikasi terbesar di Indonesia',
                'status' => 'active',
                'password' => bcrypt('company123'),
            ]
        );

        // University
        $university = University::firstOrCreate(
            ['name' => 'Universitas Indonesia'],
            [
                'id_university' => 'U' . strtoupper(Str::random(8)),
                'name' => 'Universitas Indonesia',
            ]
        );

        // Major
        $major = Major::firstOrCreate(
            ['name' => 'Teknik Informatika'],
            [
                'id_major' => 'M' . strtoupper(Str::random(8)),
                'name' => 'Teknik Informatika',
            ]
        );

        // User (Candidate)
        $user = User::firstOrCreate(
            ['email' => 'candidate@test.com'],
            [
                'id_user' => 'U' . strtoupper(Str::random(8)),
                'name' => 'Ahmad Prasetya',
                'email' => 'candidate@test.com',
                'password' => bcrypt('password123'),
                'phone' => '081234567890',
                'role' => 'candidate',
                'id_team' => $team->id_team,
                'id_university' => $university->id_university,
                'id_major' => $major->id_major,
                'id_company' => $company->id_company,
                'is_active' => true,
            ]
        );

        // Competencies
        $competencies = [
            ['name' => 'laravel-basics', 'learning_hours' => 40],
            ['name' => 'api-development', 'learning_hours' => 50],
            ['name' => 'database-design', 'learning_hours' => 30],
        ];

        $competencyIds = [];
        foreach ($competencies as $comp) {
            $c = Competency::firstOrCreate(
                ['name' => $comp['name']],
                [
                    'id_competency' => 'C' . strtoupper(Str::random(8)),
                    'name' => $comp['name'],
                    'learning_hours' => $comp['learning_hours'],
                ]
            );
            $competencyIds[] = $c->id_competency;
        }

        // Position
        $position = Position::firstOrCreate(
            ['name' => 'Full Stack Developer'],
            [
                'id_position' => 'P' . strtoupper(Str::random(8)),
                'name' => 'Full Stack Developer',
            ]
        );
        $position->competencies()->sync($competencyIds);

        // Vacancy
        $vacancy = Vacancy::firstOrCreate(
            ['title' => 'Full Stack Developer Internship'],
            [
                'id_vacancy' => 'V' . strtoupper(Str::random(8)),
                'id_company' => $company->id_company,
                'title' => 'Full Stack Developer Internship',
                'description' => 'Mencari Full Stack Developer untuk Program Magang',
                'location' => 'Jakarta',
                'type' => 'internship',
                'deadline' => now()->addMonths(1),
                'start_date' => now()->addDays(30),
                'end_date' => now()->addDays(150),
                'payment_type' => 'monthly',
                'batch' => 1,
                'status' => 'published',
                'publish_date' => now(),
            ]
        );
        $vacancy->positions()->sync([$position->id_position]);

        // Submission (accepted)
        $submission = Submission::firstOrCreate(
            ['id_user' => $user->id_user, 'id_vacancy' => $vacancy->id_vacancy],
            [
                'id_submission' => 'S' . strtoupper(Str::random(8)),
                'id_user' => $user->id_user,
                'id_team' => $team->id_team,
                'id_vacancy' => $vacancy->id_vacancy,
                'id_position' => $position->id_position,
                'status' => 'accepted',
                'submitted_at' => now(),
                'cv_file' => 'sample-cv.pdf',
                'cover_letter_file' => 'cover-letter.pdf',
                'institution_letter_file' => 'institution-letter.pdf',
            ]
        );

        // Apprentice
        Apprentice::firstOrCreate(
            ['id_submission' => $submission->id_submission],
            [
                'id_apprentice' => 'A' . strtoupper(Str::random(8)),
                'id_submission' => $submission->id_submission,
                'start_date' => now()->addDays(30)->toDateString(),
                'end_date' => now()->addDays(150)->toDateString(),
                'status' => 'active',
            ]
        );



        $this->command->info('✓ Candidate Dashboard seeder completed!');
        $this->command->info('');
        $this->command->info('Test login dengan:');
        $this->command->info('Email: candidate@test.com');
        $this->command->info('Password: password123');
        $this->command->info('');
        $this->command->info('Akses dashboard di:');
        $this->command->info('http://localhost:5173/c/pt-telkom-indonesia-persero-tbk/dashboard');
    }
}

