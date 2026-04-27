<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->char('id_role', 10)->primary();
            $table->char('id_company', 10);
            $table->string('name', 50);
            $table->string('description')->nullable();
            $table->timestamps();

            $table->foreign('id_company')->references('id_company')->on('companies');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};