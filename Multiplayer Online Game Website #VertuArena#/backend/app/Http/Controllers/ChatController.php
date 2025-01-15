<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index(Game $game)
    {
        $messages = $game->chats()
            ->with('user')
            ->orderBy('sent_at')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, Game $game)
    {
        $request->validate([
            'message' => ['required', 'string', 'max:500'],
        ]);

        // Verify user is part of the game
        if ($game->player1_id !== Auth::id() && $game->player2_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message = Chat::create([
            'game_id' => $game->id,
            'user_id' => Auth::id(),
            'message' => $request->message,
            'sent_at' => now(),
        ]);

        // Load the user relationship for the response
        $message->load('user');

        // Here you would typically broadcast the message via WebSocket
        // broadcast(new ChatMessageSent($message))->toPresence('game.' . $game->id);

        return response()->json($message, 201);
    }

    public function destroy(Chat $chat)
    {
        if ($chat->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $chat->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
