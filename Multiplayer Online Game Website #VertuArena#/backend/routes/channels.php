<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Game;
use Illuminate\Support\Facades\Log;

// User channel
Broadcast::channel('user.{userId}', function ($user, $userId) {
    // Log the authorization attempt
    Log::info('User channel authorization attempt', [
        'channel' => 'user.' . $userId,
        'user_id' => $user->id,
        'requested_user_id' => $userId
    ]);

    return (int) $user->id === (int) $userId;
});

// Game channel
Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    try {
        // Log the authorization attempt
        Log::info('Game channel authorization attempt', [
            'channel' => 'game.' . $gameId,
            'user_id' => $user->id,
            'game_id' => $gameId
        ]);

        $game = Game::findOrFail($gameId);
        $isAuthorized = in_array($user->id, [$game->player_1_id, $game->player_2_id]);

        Log::info('Game channel authorization result', [
            'channel' => 'game.' . $gameId,
            'user_id' => $user->id,
            'game_id' => $gameId,
            'authorized' => $isAuthorized
        ]);

        return $isAuthorized;
    } catch (\Exception $e) {
        Log::error('Game channel authorization error', [
            'channel' => 'game.' . $gameId,
            'user_id' => $user->id,
            'game_id' => $gameId,
            'error' => $e->getMessage()
        ]);
        return false;
    }
});
