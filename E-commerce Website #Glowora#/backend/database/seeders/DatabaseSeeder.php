<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create test categories
        $categories = [
            [
                'name' => 'Aromatherapy',
                'slug' => 'aromatherapy',
                'description' => 'Candles designed to promote relaxation and wellness',
            ],
            [
                'name' => 'Scented',
                'slug' => 'scented',
                'description' => 'Aromatic candles for every mood and occasion',
            ],
            [
                'name' => 'Seasonal',
                'slug' => 'seasonal',
                'description' => 'Candles inspired by the beauty of the seasons',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Create test products
        $products = [
            [
                'name' => 'Lavender Dreams',
                'description' => 'A soothing lavender scented candle for relaxation',
                'price' => 24.99,
                'category_id' => 1,
                'stock' => 50,
                'status' => 'active',
            ],
            [
                'name' => 'Vanilla Bliss',
                'description' => 'Sweet and comforting vanilla scented candle',
                'price' => 19.99,
                'category_id' => 2,
                'stock' => 30,
                'status' => 'active',
            ],
            [
                'name' => 'Autumn Spice',
                'description' => 'Warm and spicy fall-inspired candle',
                'price' => 29.99,
                'category_id' => 3,
                'stock' => 40,
                'status' => 'active',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
