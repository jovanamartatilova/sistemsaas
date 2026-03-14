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
Schema::create('position_competencies', function (Blueprint $table) {
    $table->char('id_position',10);
    $table->char('id_competency',10);

    $table->primary(['id_position','id_competency']);

    $table->foreign('id_position')->references('id_position')->on('positions')->onDelete('cascade');
    $table->foreign('id_competency')->references('id_competency')->on('competencies')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('position_competencies');
    }
};
