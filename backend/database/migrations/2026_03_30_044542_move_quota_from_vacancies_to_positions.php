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
        Schema::table('positions', function (Blueprint $table) {
            $table->integer('quota')->default(0)->after('name');
        });

        // Migrate existing quota data from vacancies to the first associated position
        $vacancies = DB::table('vacancies')->get();
        foreach ($vacancies as $vacancy) {
            $firstPosition = DB::table('vacancy_positions')
                ->where('id_vacancy', $vacancy->id_vacancy)
                ->first();
            
            if ($firstPosition) {
                DB::table('positions')
                    ->where('id_position', $firstPosition->id_position)
                    ->update(['quota' => $vacancy->quota]);
            }
        }

        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropColumn('quota');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->integer('quota')->default(0)->after('batch');
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->dropColumn('quota');
        });
    }
};
