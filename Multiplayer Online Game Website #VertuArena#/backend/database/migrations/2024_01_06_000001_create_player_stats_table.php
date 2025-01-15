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
        Schema::create('player_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('games_played')->default(0);
            $table->integer('games_won')->default(0);
            $table->integer('games_lost')->default(0);
            $table->integer('current_streak')->default(0);
            $table->integer('rank')->default(0);
            $table->integer('peak_rank')->default(0);
            $table->integer('leaderboard_position')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_stats');
    }
};
