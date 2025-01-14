<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        $name = $this->faker->unique()->words(3, true);
        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'category_id' => Category::factory(),
            'price' => $this->faker->randomFloat(2, 10, 200),
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'image_url' => $this->faker->imageUrl(640, 480, 'candle'),
            'sku' => 'SKU-' . $this->faker->unique()->numberBetween(1000, 9999),
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => function (array $attributes) {
                return $this->faker->dateTimeBetween($attributes['created_at'], 'now');
            },
        ];
    }
} 