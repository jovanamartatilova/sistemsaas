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
            // Drop ONLY assessment narrative/recommendation/evaluation fields, KEEP scores_data and mentor assignment
            $table->dropColumn(['narrative', 'recommendation', 'evaluation_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->text('narrative')->nullable()->after('scores_data');
            $table->string('recommendation', 100)->nullable()->after('narrative');
            $table->string('evaluation_status', 20)->default('draft')->after('recommendation');
        });
    }
};
