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
        Schema::table('tasks', function (Blueprint $table) {
            $table->char('parent_id_task', 36)->nullable()->after('id_team');
            $table->char('delegated_by', 10)->nullable()->after('parent_id_task');
            $table->text('feedback_notes')->nullable()->after('status');

            $table->foreign('parent_id_task')->references('id_task')->on('tasks')->onDelete('cascade');
            $table->foreign('delegated_by')->references('id_user')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['parent_id_task']);
            $table->dropForeign(['delegated_by']);
            $table->dropColumn(['parent_id_task', 'delegated_by', 'feedback_notes']);
        });
    }
};
