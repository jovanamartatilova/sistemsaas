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
        Schema::create('assessments', function (Blueprint $table) {
            $table->char('id_assessment', 10)->primary();
            $table->char('id_submission', 10);
            $table->char('id_user', 10)->nullable(); // Mentor
            $table->json('scores_data')->nullable();
            $table->text('narrative')->nullable();
            $table->string('recommendation', 100)->nullable();
            $table->string('evaluation_status', 20)->default('draft'); // draft, submitted, reviewed
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_submission')->references('id_submission')->on('submissions')->onDelete('cascade');
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
