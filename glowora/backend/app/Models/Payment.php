<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $primaryKey = 'payment_id';
    
    protected $fillable = [
        'order_id',
        'payment_date',
        'payment_method',
        'payment_amount'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
} 