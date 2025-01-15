<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerStats extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'games_played',
        'games_won',
        'games_lost',
        'rank',
        'peak_rank',
        'current_streak',
        'leaderboard_position'
    ];

    protected $attributes = [
        'games_played' => 0,
        'games_won' => 0,
        'games_lost' => 0,
        'rank' => 0,
        'peak_rank' => 0,
        'current_streak' => 0,
        'leaderboard_position' => null
    ];

    protected $casts = [
        'games_played' => 'integer',
        'games_won' => 'integer',
        'games_lost' => 'integer',
        'rank' => 'integer',
        'peak_rank' => 'integer',
        'current_streak' => 'integer',
        'leaderboard_position' => 'integer'
    ];

    protected $appends = ['score'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getWinRateAttribute()
    {
        if ($this->games_played === 0) {
            return 0;
        }
        return ($this->games_won / $this->games_played) * 100;
    }

    public function getScoreAttribute()
    {
        // Base score from wins (50 points per win)
        $winScore = $this->games_won * 50;
        
        // Bonus for win streak (10 points per streak)
        $streakBonus = $this->current_streak * 10;
        
        // Win rate bonus (up to 100 points for 100% win rate)
        $winRateBonus = $this->games_played > 0 
            ? round(($this->games_won / $this->games_played) * 100)
            : 0;
        
        // Experience bonus based on games played (5 points per game)
        $experienceBonus = $this->games_played * 5;
        
        // Calculate total score
        $totalScore = $winScore + $streakBonus + $winRateBonus + $experienceBonus;
        
        return $totalScore;
    }

    public function updateStats($gameResult)
    {
        $this->games_played++;
        
        if ($gameResult === 'win') {
            $this->games_won++;
            $this->current_streak++;
            // Update rank based on performance
            $this->rank += 25 + min($this->current_streak * 5, 25); // More points for streak
        } elseif ($gameResult === 'loss') {
            $this->games_lost++;
            $this->current_streak = 0;
            // Lose less rank points than gained for winning
            $this->rank = max(0, $this->rank - 15);
        }

        // Update peak rank if current rank is higher
        if ($this->rank > $this->peak_rank) {
            $this->peak_rank = $this->rank;
        }

        $this->save();
    }
}
