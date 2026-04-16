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
            // Add created_at and updated_at columns if they don't exist
            if (!Schema::hasColumn('submissions', 'created_at')) {
                $table->timestamp('created_at')->nullable()->after('submitted_at');
            }
            if (!Schema::hasColumn('submissions', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            if (Schema::hasColumn('submissions', 'created_at')) {
                $table->dropColumn('created_at');
            }
            if (Schema::hasColumn('submissions', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
};
