<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {
        if (!Schema::hasColumn('companies', 'slug')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->string('slug')->unique()->after('name');
            });
        }
    }

    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
