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
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('template_style')->default('classic')->after('file_path');
            $table->string('background_path')->nullable()->after('template_style');
            $table->text('layout_settings')->nullable()->after('background_path');
            $table->string('logo_position')->default('center')->after('layout_settings');
            $table->string('signature_layout')->default('single')->after('logo_position');
            $table->string('signatory1_name')->nullable()->after('signature_layout');
            $table->string('signatory1_title')->nullable()->after('signatory1_name');
            $table->string('signatory2_name')->nullable()->after('signatory1_title');
            $table->string('signatory2_title')->nullable()->after('signatory2_name');
            $table->string('signatory2_signature')->nullable()->after('signatory2_title');
            $table->boolean('show_qr')->default(true)->after('signatory2_signature');
            $table->string('qr_position')->default('bottom-left')->after('show_qr');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn([
                'template_style',
                'background_path',
                'layout_settings',
                'logo_position',
                'signature_layout',
                'signatory1_name',
                'signatory1_title',
                'signatory2_name',
                'signatory2_title',
                'signatory2_signature',
                'show_qr',
                'qr_position'
            ]);
        });
    }
};
