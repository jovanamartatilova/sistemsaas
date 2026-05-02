<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('id_company');
            $table->string('name', 100);
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->foreign('id_company')->references('id_company')->on('companies')->onDelete('cascade');
        });

        Schema::create('staff_positions', function (Blueprint $table) {
            $table->id();
            $table->string('id_company');
            $table->string('name', 100);
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->foreign('id_company')->references('id_company')->on('companies')->onDelete('cascade');
        });

        Schema::create('job_levels', function (Blueprint $table) {
            $table->id();
            $table->string('id_company');
            $table->string('name', 100);
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->foreign('id_company')->references('id_company')->on('companies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_levels');
        Schema::dropIfExists('staff_positions');
        Schema::dropIfExists('divisions');
    }
};