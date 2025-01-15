<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_1_id',
        'player_2_id',
        'game_type',
        'game_state',
        'winner_id',
        'started_at',
        'ended_at',
        'status'
    ];

    protected $casts = [
        'game_state' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending'
    ];

    protected $with = ['player1', 'player2', 'winner'];

    public function player1()
    {
        return $this->belongsTo(User::class, 'player_1_id');
    }

    public function player2()
    {
        return $this->belongsTo(User::class, 'player_2_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }
}
