<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchmakingQueue extends Model
{
    use HasFactory;

    protected $table = 'matchmaking_queue';

    protected $fillable = [
        'user_id',
        'game_type',
        'rank',
        'queued_at',
    ];

    protected $casts = [
        'queued_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
