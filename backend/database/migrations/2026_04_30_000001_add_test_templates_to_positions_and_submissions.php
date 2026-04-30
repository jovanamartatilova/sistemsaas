<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->json('test_templates')->nullable();
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->json('test_details')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->dropColumn('test_templates');
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('test_details');
        });
    }
};
