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
        // Only run if table doesn't have scores_data column
        if (!Schema::hasColumn('submissions', 'scores_data')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->json('scores_data')->nullable()->after('id_user_mentor');
                $table->text('narrative')->nullable()->after('scores_data');
                $table->string('recommendation', 100)->nullable()->after('narrative');
                $table->string('evaluation_status', 20)->default('draft')->after('recommendation');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            if (Schema::hasColumn('submissions', 'scores_data')) {
                $table->dropColumn('scores_data');
            }
            if (Schema::hasColumn('submissions', 'narrative')) {
                $table->dropColumn('narrative');
            }
            if (Schema::hasColumn('submissions', 'recommendation')) {
                $table->dropColumn('recommendation');
            }
            if (Schema::hasColumn('submissions', 'evaluation_status')) {
                $table->dropColumn('evaluation_status');
            }
        });
    }
};
