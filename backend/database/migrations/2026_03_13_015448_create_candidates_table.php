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
        Schema::create('candidates', function (Blueprint $table) {
            $table->char('id_candidate', 10)->primary();
            $table->char('id_user', 10);

            // Data dari modal
            $table->string('phone', 13)->nullable();
            $table->string('institution', 100)->nullable();
            $table->string('education_level', 50)->nullable();
            $table->string('major', 100)->nullable();

            // Data tambahan profile
            $table->string('photo_path')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('address')->nullable();
            $table->string('gender', 10)->nullable();
            $table->text('about')->nullable();

            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
