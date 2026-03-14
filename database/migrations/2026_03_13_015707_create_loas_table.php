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
        Schema::create('loas', function (Blueprint $table) {
    $table->char('id_loa',10)->primary();
    $table->char('id_submission',10);

    $table->string('letter_number',100);
    $table->string('file_path',255);
    $table->string('signed_by',120);
    $table->date('issued_date');

    $table->timestamp('created_at')->useCurrent();

    $table->foreign('id_submission')->references('id_submission')->on('submissions');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loas');
    }
};
