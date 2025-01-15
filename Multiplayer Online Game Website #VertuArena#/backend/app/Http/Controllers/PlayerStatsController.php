<?php

namespace App\Http\Controllers;

use App\Models\PlayerStats;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlayerStatsController extends Controller
{
    public function index()
    {
        $stats = PlayerStats::with('user')
            ->orderByDesc('rank')
            ->paginate(20);

        return response()->json($stats);
    }

    public function show(User $user)
    {
        $stats = $user->playerStats()->firstOrCreate([
            'user_id' => $user->id,
        ], [
            'games_played' => 0,
            'games_won' => 0,
            'games_lost' => 0,
            'rank' => 0,
            'peak_rank' => 0,
            'leaderboard_position' => null
        ]);

        return response()->json([
            'user' => $user,
            'stats' => $stats,
            'win_rate' => $stats->win_rate,
        ]);
    }

    public function myStats()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $stats = PlayerStats::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'games_played' => 0,
                    'games_won' => 0,
                    'games_lost' => 0,
                    'rank' => 0,
                    'peak_rank' => 0,
                    'current_streak' => 0,
                    'leaderboard_position' => null
                ]
            );

            Log::info('Retrieved player stats', [
                'user_id' => $user->id,
                'stats' => $stats->toArray()
            ]);

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Error retrieving player stats', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to retrieve stats'], 500);
        }
    }

    public function topPlayers()
    {
        $topPlayers = PlayerStats::with('user')
            ->orderByDesc('rank')
            ->take(10)
            ->get();

        return response()->json($topPlayers);
    }
}
