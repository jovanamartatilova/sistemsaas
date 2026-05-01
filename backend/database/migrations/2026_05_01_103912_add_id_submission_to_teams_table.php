<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('id_submission')->nullable()->after('team_code');
            $table->foreign('id_submission')->references('id_submission')->on('submissions');
        });
    }

    public function down()
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropForeign(['id_submission']);
            $table->dropColumn('id_submission');
        });
    }
};
