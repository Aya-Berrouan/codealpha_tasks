<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\PlayerStatsController;

// Public routes (no authentication required)
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
    Route::get('users', [AuthController::class, 'users']);
    Route::get('profile', [AuthController::class, 'profile']);
    Route::post('profile/update', [AuthController::class, 'updateProfile']);

    // Game & Matchmaking Routes
    Route::get('/matchmaking/{game_type}/available-players', [GameController::class, 'getAvailablePlayers']);
    Route::post('/matchmaking/{game_type}/toggle-availability', [GameController::class, 'toggleAvailability']);
    Route::post('/matchmaking/{game_type}/request-match', [GameController::class, 'requestMatch']);
    Route::get('/matchmaking/{game_type}/challenges', [GameController::class, 'getPendingChallenges']);

    // Game Routes
    Route::get('/games/{game}', [GameController::class, 'getGame']);
    Route::post('/games/{game}/move', [GameController::class, 'makeMove']);
    Route::post('/games/{game}/challenge/respond', [GameController::class, 'respondToChallenge']);
    Route::post('/games/{game}/restart/request', [GameController::class, 'requestRestart']);
    Route::post('/games/{game}/restart/respond', [GameController::class, 'respondToRestart']);

    // Leaderboard routes
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);

    // Player Stats routes
    Route::get('/player-stats/my-stats', [PlayerStatsController::class, 'myStats']);
    Route::get('/player-stats/{user}', [PlayerStatsController::class, 'show']);
});

// Broadcasting Authentication
Broadcast::routes(['middleware' => ['auth:sanctum']]);
