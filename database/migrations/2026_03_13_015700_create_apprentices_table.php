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
        Schema::create('apprentices', function (Blueprint $table) {
    $table->char('id_apprentice',10)->primary();
    $table->char('id_submission',10);

    $table->date('start_date');
    $table->date('end_date');
    $table->string('status',20);

    $table->foreign('id_submission')->references('id_submission')->on('submissions');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apprentices');
    }
};
