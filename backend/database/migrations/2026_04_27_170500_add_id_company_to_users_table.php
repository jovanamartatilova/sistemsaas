<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'id_company')) {
            Schema::table('users', function (Blueprint $table) {
                $table->char('id_company', 10)->nullable()->after('name');
                $table->foreign('id_company')->references('id_company')->on('companies');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'id_company')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['id_company']);
                $table->dropColumn('id_company');
            });
        }
    }
};
