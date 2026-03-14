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
       Schema::create('submissions', function (Blueprint $table) {
    $table->char('id_submission',10)->primary();
    $table->char('id_team',10);
    $table->char('id_user',10);
    $table->char('id_vacancy',10);

    $table->string('cover_letter_file',255);
    $table->string('institution_letter_file',255);
    $table->string('cv_file',255);
    $table->string('portfolio_file',255)->nullable();

    $table->string('status',20);
    $table->timestamp('submitted_at');

    $table->foreign('id_team')->references('id_team')->on('teams');
    $table->foreign('id_user')->references('id_user')->on('users');
    $table->foreign('id_vacancy')->references('id_vacancy')->on('vacancies');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
