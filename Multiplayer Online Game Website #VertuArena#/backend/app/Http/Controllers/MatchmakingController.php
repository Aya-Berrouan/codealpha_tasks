<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\MatchmakingQueue;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MatchmakingController extends Controller
{
    public function joinQueue(Request $request)
    {
        $request->validate([
            'game_type' => ['required', 'string', 'max:50'],
        ]);

        // Remove any existing queue entries for this user
        MatchmakingQueue::where('user_id', Auth::id())->delete();

        // Add user to queue
        $queueEntry = MatchmakingQueue::create([
            'user_id' => Auth::id(),
            'game_type' => $request->game_type,
            'rank' => Auth::user()->rank,
            'queued_at' => now(),
        ]);

        // Try to find a match
        $match = $this->findMatch($queueEntry);

        if ($match) {
            return response()->json([
                'status' => 'matched',
                'game' => $match,
            ]);
        }

        return response()->json([
            'status' => 'queued',
            'queue_entry' => $queueEntry,
        ]);
    }

    public function leaveQueue()
    {
        MatchmakingQueue::where('user_id', Auth::id())->delete();

        return response()->json(['message' => 'Left queue successfully']);
    }

    public function checkStatus()
    {
        $queueEntry = MatchmakingQueue::where('user_id', Auth::id())->first();

        if (!$queueEntry) {
            return response()->json(['status' => 'not_queued']);
        }

        $match = $this->findMatch($queueEntry);

        if ($match) {
            return response()->json([
                'status' => 'matched',
                'game' => $match,
            ]);
        }

        return response()->json([
            'status' => 'queued',
            'queue_entry' => $queueEntry,
        ]);
    }

    private function findMatch(MatchmakingQueue $queueEntry)
    {
        // Find a suitable opponent (similar rank, same game type, not the same user)
        $opponent = MatchmakingQueue::where('game_type', $queueEntry->game_type)
            ->where('user_id', '!=', $queueEntry->user_id)
            ->whereBetween('rank', [
                $queueEntry->rank - 100,
                $queueEntry->rank + 100
            ])
            ->orderBy('queued_at')
            ->first();

        if ($opponent) {
            // Create a new game
            $game = Game::create([
                'player_1_id' => $queueEntry->user_id,
                'player_2_id' => $opponent->user_id,
                'game_type' => $queueEntry->game_type,
                'game_state' => ['status' => 'started'],
                'started_at' => now(),
            ]);

            // Remove both players from queue
            MatchmakingQueue::whereIn('user_id', [$queueEntry->user_id, $opponent->user_id])->delete();

            return $game->load(['player1', 'player2']);
        }

        return null;
    }
}
