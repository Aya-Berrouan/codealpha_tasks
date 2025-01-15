<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PlayerStats;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test user
        $user = User::create([
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'rank' => 0,
        ]);

        // Create initial player stats for the test user
        PlayerStats::create([
            'user_id' => $user->id,
            'games_played' => 0,
            'games_won' => 0,
            'games_lost' => 0,
            'rank' => 0,
        ]);
    }
}
