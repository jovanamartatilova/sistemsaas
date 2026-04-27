<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->json('work_attachments')->nullable()->after('competency_ids');
            $table->timestamp('submitted_at')->nullable()->after('work_attachments');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['work_attachments', 'submitted_at']);
        });
    }
};
