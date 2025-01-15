<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'coupon_code',
        'discount_type',
        'discount_percentage',
        'valid_until',
        'min_purchase',
        'max_uses',
        'description'
    ];

    protected $casts = [
        'valid_until' => 'datetime',
        'discount_percentage' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_uses' => 'integer'
    ];
}
