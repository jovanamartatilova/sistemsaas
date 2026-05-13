<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_codes', function (Blueprint $table) {
            $table->id('id_invitation');
            $table->string('id_company');
            $table->string('id_role')->nullable();
            $table->string('code', 20)->unique();
            $table->string('label', 100);
            $table->string('division', 100)->nullable();
            $table->string('position', 100)->nullable();
            $table->string('employee_status', 50)->nullable();
            $table->string('schedule', 50)->nullable();
            $table->string('job_level', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('id_company')->references('id_company')->on('companies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_codes');
    }
};
