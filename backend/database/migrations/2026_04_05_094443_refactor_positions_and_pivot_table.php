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
        // 1. Add quota to vacancy_positions pivot table
        if (!Schema::hasColumn('vacancy_positions', 'quota')) {
            Schema::table('vacancy_positions', function (Blueprint $table) {
                $table->integer('quota')->default(0)->after('id_position');
            });
        }

        // 2. Add id_company to positions table
        if (!Schema::hasColumn('positions', 'id_company')) {
            Schema::table('positions', function (Blueprint $table) {
                $table->char('id_company', 10)->nullable()->after('id_position');
                $table->foreign('id_company')->references('id_company')->on('companies')->onDelete('cascade');
            });
        }

        // 3. Data Migration: Copy quota from positions to vacancy_positions
        // and link positions to companies via their vacancies
        $linkages = DB::table('vacancy_positions')->get();
        foreach ($linkages as $link) {
            $position = DB::table('positions')->where('id_position', $link->id_position)->first();
            $vacancy = DB::table('vacancies')->where('id_vacancy', $link->id_vacancy)->first();

            if ($position) {
                // Update pivot quota
                DB::table('vacancy_positions')
                    ->where('id_vacancy', $link->id_vacancy)
                    ->where('id_position', $link->id_position)
                    ->update(['quota' => $position->quota]);

                // Update position's company if not set
                if ($vacancy && empty($position->id_company)) {
                    DB::table('positions')
                        ->where('id_position', $link->id_position)
                        ->update(['id_company' => $vacancy->id_company]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            if (Schema::hasColumn('positions', 'id_company')) {
                $table->dropForeign(['id_company']);
                $table->dropColumn('id_company');
            }
        });

        Schema::table('vacancy_positions', function (Blueprint $table) {
            if (Schema::hasColumn('vacancy_positions', 'quota')) {
                $table->dropColumn('quota');
            }
        });
    }
};
