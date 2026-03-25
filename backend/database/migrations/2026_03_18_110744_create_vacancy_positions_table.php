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
        Schema::create('vacancy_positions', function (Blueprint $table) {
            $table->char('id_vacancy', 10);
            $table->char('id_position', 10);
            
            $table->primary(['id_vacancy', 'id_position']);
            
            $table->foreign('id_vacancy')->references('id_vacancy')->on('vacancies')->onDelete('cascade');
            $table->foreign('id_position')->references('id_position')->on('positions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vacancy_positions');
    }
};
