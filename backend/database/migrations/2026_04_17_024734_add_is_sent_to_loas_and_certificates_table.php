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
        Schema::table('loas', function (Blueprint $table) {
            $table->boolean('is_sent')->default(false)->after('issued_date');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->boolean('is_sent')->default(false)->after('issued_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->dropColumn('is_sent');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn('is_sent');
        });
    }
};
