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
        Schema::create('service_tasker', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tasker_id')->constrained('taskers')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
               $table->integer('experience')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_tasker');
    }
};
