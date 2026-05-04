<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    if (Schema::hasColumn('submissions', 'cover_letter_file')) {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('cover_letter_file');
        });
    }

    if (Schema::hasColumn('submissions', 'institution_letter_file')) {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn('institution_letter_file');
        });
    }

    if (!Schema::hasColumn('submissions', 'supporting_document_file')) {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('supporting_document_file')->nullable()->after('cv_file');
        });
    }
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
