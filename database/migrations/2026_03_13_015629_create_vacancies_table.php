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
      Schema::create('vacancies', function (Blueprint $table) {
    $table->char('id_vacancy',10)->primary();
    $table->char('id_position',10);
    $table->char('id_company',10);

    $table->string('description',255);
    $table->string('location',100);
    $table->integer('duration_months');
    $table->string('type',20);
    $table->date('deadline');
    $table->string('payment_type',15);
    $table->integer('batch');
    $table->integer('quota');
    $table->string('status',20);
    $table->date('publish_date');

    $table->foreign('id_position')->references('id_position')->on('positions');
    $table->foreign('id_company')->references('id_company')->on('companies');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vacancies');
    }
};
