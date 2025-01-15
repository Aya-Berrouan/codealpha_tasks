<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'description',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log($eventType, $description, $userId = null)
    {
        return static::create([
            'event_type' => $eventType,
            'description' => $description,
            'user_id' => $userId,
        ]);
    }
}
