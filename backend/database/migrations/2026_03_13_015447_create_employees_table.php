<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->char('id_employee', 10)->primary();
            $table->char('id_user', 10);
            $table->char('id_company', 10);
            $table->char('id_role', 10)->nullable();

            // Informasi Pribadi
            $table->string('first_name', 50);
            $table->string('last_name', 50)->nullable();
            $table->string('phone', 13)->nullable();
            $table->string('nik', 20)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('address')->nullable();
            $table->string('photo_path')->nullable();

            // Informasi Pekerjaan
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->date('joined_at')->nullable();
            $table->string('job_level')->nullable();
            $table->string('employee_status')->nullable();
            $table->string('schedule')->nullable();

            // Kontak Darurat
            $table->string('emergency_name')->nullable();
            $table->string('emergency_phone', 13)->nullable();

            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('users');
            $table->foreign('id_company')->references('id_company')->on('companies');
            $table->foreign('id_role')->references('id_role')->on('roles');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};