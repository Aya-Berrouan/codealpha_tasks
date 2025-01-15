<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition()
    {
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        $quantity = $this->faker->numberBetween(1, 5);
        
        return [
            'product_id' => $product->product_id,
            'quantity' => $quantity,
            'price' => $product->price,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
} 