<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomCandle extends Model
{
    protected $fillable = [
        'name',
        'price',
        'description',
        'image_url',
        'scent_name',
        'jar_style',
        'custom_label',
        'custom_details',
        'user_id'
    ];

    protected $casts = [
        'custom_details' => 'array',
        'price' => 'decimal:2'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(Cart::class);
    }
}
