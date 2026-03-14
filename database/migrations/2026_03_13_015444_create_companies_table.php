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
        Schema::create('companies', function (Blueprint $table) {
    $table->char('id_company',10)->primary();
    $table->string('name',50);
    $table->string('email',50);
    $table->string('address',100);
    $table->string('description',255)->nullable();
    $table->string('logo_path',255)->nullable();
    $table->timestamps();
});
    }
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
