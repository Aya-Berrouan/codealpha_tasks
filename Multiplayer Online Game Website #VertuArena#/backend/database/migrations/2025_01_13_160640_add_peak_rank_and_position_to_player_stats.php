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
        Schema::table('player_stats', function (Blueprint $table) {
            $table->integer('peak_rank')->default(0)->after('rank');
            $table->integer('leaderboard_position')->nullable()->after('peak_rank');
        });

        // Update peak_rank to match current rank for existing records
        DB::table('player_stats')->update([
            'peak_rank' => DB::raw('rank')
        ]);

        // Update leaderboard positions for existing records
        $players = DB::table('player_stats')
            ->orderByDesc('rank')
            ->get();
        
        foreach ($players as $index => $player) {
            DB::table('player_stats')
                ->where('id', $player->id)
                ->update(['leaderboard_position' => $index + 1]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('player_stats', function (Blueprint $table) {
            $table->dropColumn(['peak_rank', 'leaderboard_position']);
        });
    }
};
