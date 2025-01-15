<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PlayerStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::select([
                'users.id',
                'users.username',
                'users.avatar',
                'player_stats.games_played',
                'player_stats.games_won',
                'player_stats.games_lost',
                'player_stats.rank',
                'player_stats.current_streak'
            ])
            ->leftJoin('player_stats', 'users.id', '=', 'player_stats.user_id')
            ->whereNotNull('player_stats.id')
            ->orderBy('player_stats.games_won', 'desc')
            ->orderBy('player_stats.current_streak', 'desc')
            ->limit(50);

            $players = $query->get()->map(function ($player) {
                $gamesPlayed = $player->games_played ?? 0;
                $wins = $player->games_won ?? 0;
                $winRate = $gamesPlayed > 0 ? round(($wins / $gamesPlayed) * 100, 1) : 0;

                // Calculate score components
                $winScore = $wins * 50; // 50 points per win
                $streakBonus = ($player->current_streak ?? 0) * 10; // 10 points per streak
                $winRateBonus = $winRate; // Up to 100 points for win rate
                $experienceBonus = $gamesPlayed * 5; // 5 points per game played
                
                // Total score
                $score = $winScore + $streakBonus + $winRateBonus + $experienceBonus;

                return [
                    'id' => $player->id,
                    'username' => $player->username,
                    'avatar' => $player->avatar,
                    'level' => floor($player->rank / 100) + 1,
                    'gamesPlayed' => $gamesPlayed,
                    'wins' => $wins,
                    'winRate' => $winRate,
                    'score' => $score,
                    'streak' => $player->current_streak ?? 0,
                    'scoreBreakdown' => [
                        'wins' => $winScore,
                        'streak' => $streakBonus,
                        'winRate' => $winRateBonus,
                        'experience' => $experienceBonus
                    ]
                ];
            })->sortByDesc('score')->values();

            return response()->json([
                'players' => $players,
                'scoreInfo' => [
                    'winPoints' => 50,
                    'streakPoints' => 10,
                    'winRateBonus' => 'Up to 100',
                    'experiencePoints' => 5
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Leaderboard error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch leaderboard data'
            ], 500);
        }
    }
}
