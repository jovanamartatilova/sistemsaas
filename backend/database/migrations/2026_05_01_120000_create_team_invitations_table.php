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
        Schema::create('team_invitations', function (Blueprint $table) {
            $table->char('id_invitation', 10)->primary();
            $table->char('id_team', 10);
            $table->char('id_creator', 10);
            $table->string('token', 64)->unique();
            $table->string('team_name', 50);
            $table->integer('max_members')->default(10);
            $table->integer('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_team')->references('id_team')->on('teams')->onDelete('cascade');
            $table->foreign('id_creator')->references('id_user')->on('users')->onDelete('cascade');

            $table->index('token');
            $table->index('id_team');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_invitations');
    }
};
