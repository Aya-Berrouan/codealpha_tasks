<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'shipping_address',
        'billing_address',
        'payment_method',
        'payment_status',
        'status'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    public static function generateOrderNumber()
    {
        $prefix = 'GLW'; // Prefix for Glowora
        $timestamp = now()->format('ymd'); // Current date in YYMMDD format
        $lastOrder = static::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (intval(substr($lastOrder->order_number, -4)) + 1) : 1;
        $sequenceNumber = str_pad($sequence, 4, '0', STR_PAD_LEFT);

        return $prefix . $timestamp . $sequenceNumber;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot(['quantity', 'price', 'subtotal']);
    }

    public function shipping()
    {
        return $this->hasOne(Shipping::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
