<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fix positions that don't belong to their vacancy's company
     */
    public function up(): void
    {
        // Get all position_vacancy linkages
        $linkages = DB::table('vacancy_positions')->get();

        foreach ($linkages as $link) {
            $vacancy = DB::table('vacancies')->where('id_vacancy', $link->id_vacancy)->first();
            $position = DB::table('positions')->where('id_position', $link->id_position)->first();

            if ($vacancy && $position) {
                // If position's company doesn't match vacancy's company, update it
                if ($position->id_company !== $vacancy->id_company) {
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
        // We can't safely reverse this without knowing the original company assignments
        // This is an intentional data fix migration
    }
};
