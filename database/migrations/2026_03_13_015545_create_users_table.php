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
        Schema::create('users', function (Blueprint $table) {
    $table->char('id_user',10)->primary();

    $table->char('id_team',10)->nullable();
    $table->char('id_company',10)->nullable();
    $table->char('id_major',10)->nullable();
    $table->char('id_university',10)->nullable();

    $table->string('name',50);
    $table->string('email',50)->unique();
    $table->string('password',255);
    $table->string('role',30);
    $table->string('phone',13)->nullable();

    $table->timestamps();

    $table->foreign('id_team')->references('id_team')->on('teams');
    $table->foreign('id_company')->references('id_company')->on('companies');
    $table->foreign('id_major')->references('id_major')->on('majors');
    $table->foreign('id_university')->references('id_university')->on('universities');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
