<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            // Mentor user assignment
            $table->char('id_user_mentor', 10)->nullable()->after('id_user');
            $table->foreign('id_user_mentor')->references('id_user')->on('users')->onDelete('set null');

            // Competency scores in JSON format
            $table->json('scores_data')->nullable()->after('id_user_mentor');

            // Evaluation fields
            $table->text('narrative')->nullable()->after('scores_data');
            $table->string('recommendation', 100)->nullable()->after('narrative');
            $table->string('evaluation_status', 20)->default('draft')->after('recommendation'); // draft, submitted, reviewed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['id_user_mentor']);
            $table->dropColumn(['id_user_mentor', 'scores_data', 'narrative', 'recommendation', 'evaluation_status']);
        });
    }
};
