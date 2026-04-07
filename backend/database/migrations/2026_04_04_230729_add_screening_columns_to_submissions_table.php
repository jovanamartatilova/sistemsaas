<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->text('hr_notes')->nullable()->after('motivation_message');
            $table->string('screening_status', 20)
                  ->nullable()
                  ->after('hr_notes');
            // nilai: 'pending' | 'passed' | 'rejected' | 'incomplete'
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['hr_notes', 'screening_status']);
        });
    }
};