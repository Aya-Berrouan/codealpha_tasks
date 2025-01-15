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
        Schema::create('connect_four_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('player_1_id')->constrained('users');
            $table->foreignId('player_2_id')->constrained('users');
            $table->json('board_state')->default('[]');
            $table->string('current_turn');
            $table->string('status')->default('active');
            $table->foreignId('winner_id')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connect_four_games');
    }
};
