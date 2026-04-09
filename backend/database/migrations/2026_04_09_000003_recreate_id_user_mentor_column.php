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
        // Recreate id_user_mentor column if it doesn't exist
        if (!Schema::hasColumn('submissions', 'id_user_mentor')) {
            Schema::table('submissions', function (Blueprint $table) {
                $table->char('id_user_mentor', 10)->nullable()->after('id_user');
                $table->foreign('id_user_mentor')->references('id_user')->on('users')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            // Check before dropping
            if (Schema::hasColumn('submissions', 'id_user_mentor')) {
                $table->dropForeign(['id_user_mentor']);
                $table->dropColumn('id_user_mentor');
            }
        });
    }
};
