<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Move assessment fields from submissions to assessments table
     */
    public function up(): void
    {
        // Step 1: Add id_user_mentor to assessments table if it doesn't exist
        if (!Schema::hasColumn('assessments', 'id_user_mentor')) {
            Schema::table('assessments', function (Blueprint $table) {
                $table->char('id_user_mentor', 10)->nullable()->after('id_user');
                $table->foreign('id_user_mentor')->references('id_user')->on('users')->onDelete('set null');
            });
        }

        // Step 2: Migrate data from submissions to assessments
        $submissions = \DB::table('submissions')
            ->whereNotNull('scores_data')
            ->get();

        foreach ($submissions as $submission) {
            $existingAssessment = \DB::table('assessments')
                ->where('id_submission', $submission->id_submission)
                ->first();

            if (!$existingAssessment) {
                \DB::table('assessments')->insert([
                    'id_assessment' => \Illuminate\Support\Str::random(10),
                    'id_submission' => $submission->id_submission,
                    'id_user' => $submission->id_user,
                    'id_user_mentor' => $submission->id_user_mentor,
                    'scores_data' => $submission->scores_data,
                    'narrative' => $submission->narrative ?? null,
                    'recommendation' => $submission->recommendation ?? null,
                    'evaluation_status' => $submission->evaluation_status ?? 'draft',
                    'created_at' => $submission->created_at ?? now(),
                    'updated_at' => $submission->updated_at ?? now(),
                ]);
            } else {
                // Update existing assessment with data from submission
                \DB::table('assessments')
                    ->where('id_submission', $submission->id_submission)
                    ->update([
                        'id_user_mentor' => $submission->id_user_mentor,
                        'scores_data' => $submission->scores_data,
                        'narrative' => $submission->narrative ?? $existingAssessment->narrative,
                        'recommendation' => $submission->recommendation ?? $existingAssessment->recommendation,
                        'evaluation_status' => $submission->evaluation_status ?? $existingAssessment->evaluation_status,
                    ]);
            }
        }

        // Step 3: Drop assessment fields from submissions table
        if (Schema::hasColumn('submissions', 'scores_data')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->dropColumn('scores_data');
            });
        }

        if (Schema::hasColumn('submissions', 'narrative')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->dropColumn('narrative');
            });
        }

        if (Schema::hasColumn('submissions', 'recommendation')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->dropColumn('recommendation');
            });
        }

        if (Schema::hasColumn('submissions', 'evaluation_status')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->dropColumn('evaluation_status');
            });
        }
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        // Recreate columns in submissions table
        if (!Schema::hasColumn('submissions', 'scores_data')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->json('scores_data')->nullable()->after('id_user_mentor');
                $table->text('narrative')->nullable()->after('scores_data');
                $table->string('recommendation', 100)->nullable()->after('narrative');
                $table->string('evaluation_status', 20)->default('draft')->after('recommendation');
            });
        }

        // Drop id_user_mentor from assessments
        if (Schema::hasColumn('assessments', 'id_user_mentor')) {
            Schema::table('assessments', function (Blueprint $table) {
                $table->dropForeign(['id_user_mentor']);
                $table->dropColumn('id_user_mentor');
            });
        }
    }
};
