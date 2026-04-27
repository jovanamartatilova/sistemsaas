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
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id_task')->primary();
            $table->char('id_mentor', 10);
            $table->char('id_intern', 10)->nullable();
            $table->char('id_team', 10)->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'pending', 'in_progress', 'done'])->default('draft');
            $table->timestamp('deadline_at')->nullable();
            $table->timestamps();

            $table->foreign('id_mentor')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('id_intern')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('id_team')->references('id_team')->on('teams')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
