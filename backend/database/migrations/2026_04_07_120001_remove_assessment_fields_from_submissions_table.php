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
            // Drop foreign key first
            $table->dropForeign(['id_user_mentor']);
            // Then drop the columns
            $table->dropColumn(['id_user_mentor', 'scores_data', 'narrative', 'recommendation', 'evaluation_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->char('id_user_mentor', 10)->nullable()->after('id_user');
            $table->json('scores_data')->nullable()->after('id_user_mentor');
            $table->text('narrative')->nullable()->after('scores_data');
            $table->string('recommendation', 100)->nullable()->after('narrative');
            $table->string('evaluation_status', 20)->default('draft')->after('recommendation');

            $table->foreign('id_user_mentor')->references('id_user')->on('users')->onDelete('set null');
        });
    }
};
