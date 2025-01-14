<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipping extends Model
{
    protected $primaryKey = 'shipping_id';
    
    protected $fillable = [
        'order_id',
        'shipping_method',
        'shipping_cost',
        'shipping_status',
        'shipped_date'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
} 