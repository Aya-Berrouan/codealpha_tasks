<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'type',
        'quantity',
        'price',
        'subtotal',
        'custom_details'
    ];

    protected $casts = [
        'custom_details' => 'array',
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2'
    ];

    protected $appends = ['name', 'image_url', 'formatted_details'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getNameAttribute()
    {
        if ($this->type === 'custom_candle' && $this->custom_details) {
            $details = is_string($this->custom_details)
                ? json_decode($this->custom_details, true)
                : $this->custom_details;

            $scentName = $details['scent_name'] ?? ($details['scent']['name'] ?? 'Custom Scent');
            $jarStyle = $details['jar_style'] ?? ($details['jar']['name'] ?? 'Custom Jar');
            return "Custom Candle - {$jarStyle} ({$scentName})";
        }
        return $this->product ? $this->product->name : null;
    }

    public function getImageUrlAttribute()
    {
        if ($this->type === 'custom_candle') {
            $details = is_string($this->custom_details)
                ? json_decode($this->custom_details, true)
                : $this->custom_details;

            if (!empty($details['generated_image'])) {
                return url('storage/' . $details['generated_image']);
            }

            return '/images/custom-candle.jpg';
        }

        return $this->product && $this->product->images->first()
            ? url('storage/' . $this->product->images->first()->image)
            : null;
    }

    public function getFormattedDetailsAttribute()
    {
        if ($this->type === 'custom_candle' && $this->custom_details) {
            $details = is_string($this->custom_details)
                ? json_decode($this->custom_details, true)
                : $this->custom_details;

            return [
                'scent_name' => $details['scent_name'] ?? ($details['scent']['name'] ?? 'Custom Scent'),
                'scent_description' => $details['scent']['description'] ?? null,
                'jar_style' => $details['jar_style'] ?? ($details['jar']['name'] ?? 'Custom Jar'),
                'jar_description' => $details['jar']['description'] ?? null,
                'custom_label' => $details['custom_label'] ?? null
            ];
        }
        return null;
    }

    public function getCustomDetailsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true);
        }
        return $value;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($orderItem) {
            if (!$orderItem->subtotal) {
                $orderItem->subtotal = $orderItem->price * $orderItem->quantity;
            }
        });
    }
}
