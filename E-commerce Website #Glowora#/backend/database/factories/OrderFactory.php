<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition()
    {
        $statuses = ['pending', 'processing', 'completed', 'cancelled'];
        
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-' . $this->faker->unique()->numberBetween(1000, 9999),
            'total_amount' => $this->faker->randomFloat(2, 10, 1000),
            'status' => $this->faker->randomElement($statuses),
            'shipping_address' => $this->faker->address,
            'billing_address' => $this->faker->address,
            'payment_method' => $this->faker->randomElement(['credit_card', 'paypal', 'cash']),
            'payment_status' => $this->faker->randomElement(['pending', 'paid', 'failed']),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => function (array $attributes) {
                return $this->faker->dateTimeBetween($attributes['created_at'], 'now');
            },
        ];
    }
} 