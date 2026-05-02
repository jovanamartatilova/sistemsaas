<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Using raw SQL for ENUM updates is safer and doesn't require doctrine/dbal
        DB::statement("ALTER TABLE tasks MODIFY COLUMN frequency ENUM('daily', 'weekly', 'bi-weekly', 'monthly') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE tasks MODIFY COLUMN frequency ENUM('daily', 'weekly', 'monthly') NULL");
    }
};
