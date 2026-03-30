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
        Schema::table('submissions', function (Blueprint $table) {
            $table->char('id_position', 10)->nullable()->after('id_vacancy');
            $table->string('linkedin_url', 255)->nullable()->after('portfolio_file');
            $table->text('motivation_message')->nullable()->after('linkedin_url');

            $table->foreign('id_position')->references('id_position')->on('positions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['id_position']);
            $table->dropColumn(['id_position', 'linkedin_url', 'motivation_message']);
        });
    }
};
