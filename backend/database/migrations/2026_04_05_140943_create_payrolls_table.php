<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->char('id_payroll', 10)->primary();
            $table->char('id_submission', 10);

            $table->integer('stipend_amount');        // nominal dalam rupiah
            $table->string('bank_name', 50);          // BCA, BNI, dll
            $table->string('bank_account', 50);       // nomor rekening
            $table->string('account_holder', 100);    // nama pemilik rekening
            $table->string('period', 7);              // format: 2026-03
            $table->string('status', 20)->default('pending'); // pending | paid
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->foreign('id_submission')
                ->references('id_submission')
                ->on('submissions')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};