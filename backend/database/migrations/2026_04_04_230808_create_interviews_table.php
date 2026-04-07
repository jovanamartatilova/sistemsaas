<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->char('id_interview', 10)->primary();
            $table->char('id_submission', 10);
            $table->char('id_interviewer', 10); // id_user role hr/mentor

            $table->date('interview_date');
            $table->time('interview_time');
            $table->string('media', 30);
            // nilai: 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Offline'
            $table->string('link', 255)->nullable();
            $table->text('notes')->nullable();
            $table->string('result', 20)->default('pending');
            // nilai: 'pending' | 'continue' | 'accepted' | 'rejected'

            $table->timestamps();

            $table->foreign('id_submission')
                ->references('id_submission')
                ->on('submissions')
                ->onDelete('cascade');

            $table->foreign('id_interviewer')
                ->references('id_user')
                ->on('users')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};