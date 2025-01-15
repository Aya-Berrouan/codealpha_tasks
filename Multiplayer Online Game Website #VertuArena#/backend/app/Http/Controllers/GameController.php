<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\GameUpdated;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function startGame(Request $request)
    {
        // Validate request
        $request->validate([
            'player_2_id' => 'required|exists:users,id'
        ]);

        // Create new game
        $game = Game::create([
            'player_1_id' => Auth::id(),
            'player_2_id' => $request->player_2_id,
            'game_type' => 'tic-tac-toe',
            'game_state' => [
                'board' => array_fill(0, 9, ''),
                'current_turn' => Auth::id(),
                'status' => 'active'
            ],
            'started_at' => now(),
        ]);

        // Load relationships
        $game->load(['player1', 'player2']);

        // Broadcast game creation
        broadcast(new GameUpdated($game));

        return response()->json($game);
    }

    public function makeMove(Request $request, Game $game)
    {
        try {
            DB::beginTransaction();

            // Log initial request data
            Log::info('Making move - Initial request', [
                'game_id' => $game->id,
                'user_id' => Auth::id(),
                'position' => $request->position,
                'game_state' => $game->game_state,
                'game_status' => $game->status,
                'player_1_id' => $game->player_1_id,
                'player_2_id' => $game->player_2_id,
                'current_turn' => $game->game_state['current_turn'] ?? null
            ]);

            // Validate request
            $request->validate([
                'position' => 'required|integer|min:0|max:8'
            ]);

            // Verify game exists and is loaded
            if (!$game) {
                DB::rollBack();
                Log::error('Game not found', [
                    'game_id' => $game->id,
                    'user_id' => Auth::id()
                ]);
                return response()->json([
                    'message' => 'Game not found',
                    'details' => 'The requested game could not be found'
                ], 404);
            }

            // Initialize game state if needed
            if (!$game->game_state || !is_array($game->game_state)) {
                $game->game_state = [
                    'board' => array_fill(0, 9, ''),
                    'current_turn' => $game->player_1_id,
                    'status' => 'active',
                    'moves' => [],
                    'last_move' => null,
                    'players' => [
                        $game->player_1_id => 'X',
                        $game->player_2_id => 'O'
                    ]
                ];
                $game->save();
            }

            // Verify game state exists and has required fields
            if (!isset($game->game_state['board']) || !isset($game->game_state['current_turn']) || !isset($game->game_state['status'])) {
                DB::rollBack();
                Log::error('Invalid game state structure', [
                    'game_id' => $game->id,
                    'game_state' => $game->game_state
                ]);
                return response()->json([
                    'message' => 'Invalid game state',
                    'details' => 'Game state is missing required fields'
                ], 400);
            }

            // Verify game is active
            if ($game->status !== 'active') {
                DB::rollBack();
                Log::warning('Game not active', [
                    'game_id' => $game->id,
                    'status' => $game->status,
                    'game_state' => $game->game_state
                ]);
                return response()->json([
                    'message' => 'Game is not active',
                    'details' => 'Current game status: ' . $game->status,
                    'game_state' => $game->game_state
                ], 400);
            }

            // Verify user is part of the game
            if ($game->player_1_id !== Auth::id() && $game->player_2_id !== Auth::id()) {
                DB::rollBack();
                Log::warning('Unauthorized move attempt', [
                    'game_id' => $game->id,
                    'user_id' => Auth::id(),
                    'player_1_id' => $game->player_1_id,
                    'player_2_id' => $game->player_2_id
                ]);
                return response()->json([
                    'message' => 'You are not part of this game',
                    'details' => 'Only players in the game can make moves'
                ], 403);
            }

            // Lock the game record for update
            $game = Game::lockForUpdate()->find($game->id);

            // Verify game state structure
            if (!isset($game->game_state) || !is_array($game->game_state)) {
                DB::rollBack();
                Log::error('Invalid game state structure', [
                    'game_id' => $game->id,
                    'game_state' => $game->game_state
                ]);
                return response()->json([
                    'message' => 'Invalid game state',
                    'details' => 'Game state is missing or invalid',
                    'game_state' => $game->game_state
                ], 400);
            }

            // Verify it's the player's turn
            if ($game->game_state['current_turn'] !== Auth::id()) {
                DB::rollBack();
                Log::warning('Not player\'s turn', [
                    'game_id' => $game->id,
                    'current_turn' => $game->game_state['current_turn'],
                    'user_id' => Auth::id()
                ]);
                return response()->json([
                    'message' => 'Not your turn',
                    'details' => 'Please wait for your turn',
                    'current_turn' => $game->game_state['current_turn'],
                    'your_id' => Auth::id()
                ], 403);
            }

            // Verify position is within bounds
            if (!isset($game->game_state['board'][$request->position])) {
                DB::rollBack();
                Log::error('Invalid position', [
                    'position' => $request->position,
                    'board' => $game->game_state['board']
                ]);
                return response()->json([
                    'message' => 'Invalid position',
                    'details' => 'Position must be between 0 and 8',
                    'position' => $request->position,
                    'board' => $game->game_state['board']
                ], 400);
            }

            // Verify position is empty
            if ($game->game_state['board'][$request->position] !== '') {
                DB::rollBack();
                Log::warning('Position already taken', [
                    'position' => $request->position,
                    'board' => $game->game_state['board']
                ]);
                return response()->json([
                    'message' => 'Position already taken',
                    'details' => 'Please choose an empty position',
                    'position' => $request->position,
                    'board' => $game->game_state['board']
                ], 400);
            }

            // Update game state
            $gameState = $game->game_state;
            $symbol = $gameState['players'][Auth::id()];
            $gameState['board'][$request->position] = $symbol;
            $gameState['moves'][] = [
                'position' => $request->position,
                'symbol' => $symbol,
                'player_id' => Auth::id(),
                'timestamp' => now()->toISOString()
            ];
            $gameState['last_move'] = end($gameState['moves']);

            // Check for winner
            $winnerCheck = $this->checkWinner($gameState['board']);
            if ($winnerCheck['winner']) {
                $gameState['status'] = 'completed';
                $gameState['winning_line'] = $winnerCheck['line'];
                $game->winner_id = Auth::id();
                $game->ended_at = now();
                $game->status = 'completed';

                try {
                    // Update winner's stats
                    $winner = User::with('playerStats')->find(Auth::id());
                    if (!$winner->playerStats) {
                        $winner->playerStats()->create([
                            'games_played' => 1,
                            'games_won' => 1,
                            'games_lost' => 0,
                            'current_streak' => 1
                        ]);
                    } else {
                        $winner->playerStats->games_played++;
                        $winner->playerStats->games_won++;
                        $winner->playerStats->current_streak++;
                        $winner->playerStats->save();
                    }

                    // Update loser's stats
                    $loserId = $game->player_1_id === Auth::id() ? $game->player_2_id : $game->player_1_id;
                    $loser = User::with('playerStats')->find($loserId);
                    if (!$loser->playerStats) {
                        $loser->playerStats()->create([
                            'games_played' => 1,
                            'games_won' => 0,
                            'games_lost' => 1,
                            'current_streak' => 0
                        ]);
                    } else {
                        $loser->playerStats->games_played++;
                        $loser->playerStats->games_lost++;
                        $loser->playerStats->current_streak = 0;
                        $loser->playerStats->save();
                    }

                    Log::info('Updated player stats after game completion', [
                        'winner_id' => Auth::id(),
                        'winner_stats' => $winner->playerStats->toArray(),
                        'loser_id' => $loserId,
                        'loser_stats' => $loser->playerStats->toArray()
                    ]);
                } catch (\Exception $e) {
                    Log::error('Error updating player stats', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
            // Check for draw
            elseif (!in_array('', $gameState['board'])) {
                $gameState['status'] = 'draw';
                $game->ended_at = now();
                $game->status = 'completed';

                try {
                    // Update both players' stats for draw
                    $player1 = User::with('playerStats')->find($game->player_1_id);
                    $player2 = User::with('playerStats')->find($game->player_2_id);

                    // Update or create player 1 stats
                    if (!$player1->playerStats) {
                        $player1->playerStats()->create([
                            'games_played' => 1,
                            'games_won' => 0,
                            'games_lost' => 0,
                            'current_streak' => 0
                        ]);
                    } else {
                        $player1->playerStats->games_played++;
                        $player1->playerStats->save();
                    }

                    // Update or create player 2 stats
                    if (!$player2->playerStats) {
                        $player2->playerStats()->create([
                            'games_played' => 1,
                            'games_won' => 0,
                            'games_lost' => 0,
                            'current_streak' => 0
                        ]);
                    } else {
                        $player2->playerStats->games_played++;
                        $player2->playerStats->save();
                    }

                    Log::info('Updated player stats after draw', [
                        'player1_id' => $game->player_1_id,
                        'player1_stats' => $player1->playerStats->toArray(),
                        'player2_id' => $game->player_2_id,
                        'player2_stats' => $player2->playerStats->toArray()
                    ]);
                } catch (\Exception $e) {
                    Log::error('Error updating player stats for draw', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }
            // Switch turns
            else {
                $gameState['current_turn'] = $game->player_1_id === Auth::id()
                    ? $game->player_2_id
                    : $game->player_1_id;
            }

            Log::info('Updating game state', [
                'game_id' => $game->id,
                'new_state' => $gameState,
                'old_state' => $game->game_state
            ]);

            $game->game_state = $gameState;
            $game->save();

            // Load relationships
            $game->load(['player1:id,username', 'player2:id,username']);

            // Broadcast game update
            broadcast(new GameUpdated($game));

            DB::commit();

            return response()->json([
                'id' => $game->id,
                'game_state' => $game->game_state,
                'winner_id' => $game->winner_id,
                'player_1_id' => $game->player_1_id,
                'player_2_id' => $game->player_2_id,
                'status' => $game->status,
                'player1' => [
                    'id' => $game->player1->id,
                    'username' => $game->player1->username,
                ],
                'player2' => [
                    'id' => $game->player2->id,
                    'username' => $game->player2->username,
                ],
                'winner' => $game->winner ? [
                    'id' => $game->winner->id,
                    'username' => $game->winner->username,
                ] : null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Game move error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'game_id' => $game->id,
                'user_id' => Auth::id(),
                'position' => $request->position,
                'game_state' => $game->game_state ?? null
            ]);
            return response()->json([
                'message' => 'Failed to make move',
                'error' => $e->getMessage(),
                'details' => 'An unexpected error occurred while processing your move',
                'game_state' => $game->game_state
            ], 500);
        }
    }

    public function getGame($id)
    {
        try {
            DB::beginTransaction();

            $game = Game::with(['player1:id,username', 'player2:id,username', 'winner:id,username'])
                ->findOrFail($id);

            // Check if user is part of the game
            if ($game->player_1_id !== Auth::id() && $game->player_2_id !== Auth::id()) {
                DB::rollBack();
                Log::warning('Unauthorized game access attempt', [
                    'user_id' => Auth::id(),
                    'game_id' => $id
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Log successful game retrieval
            Log::info('Game retrieved successfully', [
                'game_id' => $id,
                'user_id' => Auth::id(),
                'game_state' => $game->game_state
            ]);

            DB::commit();

            return response()->json([
                'id' => $game->id,
                'game_state' => $game->game_state,
                'winner_id' => $game->winner_id,
                'player_1_id' => $game->player_1_id,
                'player_2_id' => $game->player_2_id,
                'player1' => [
                    'id' => $game->player1->id,
                    'username' => $game->player1->username,
                ],
                'player2' => [
                    'id' => $game->player2->id,
                    'username' => $game->player2->username,
                ],
                'winner' => $game->winner ? [
                    'id' => $game->winner->id,
                    'username' => $game->winner->username,
                ] : null,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            Log::error('Game not found', [
                'game_id' => $id,
                'user_id' => Auth::id()
            ]);
            return response()->json(['message' => 'Game not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error retrieving game', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'game_id' => $id,
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to retrieve game',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getGameState(Game $game)
    {
        return response()->json([
            'game' => $game,
            'raw_state' => $game->getRawOriginal('game_state'),
            'decoded_state' => json_decode($game->getRawOriginal('game_state'), true),
            'cast_state' => $game->game_state,
        ]);
    }

    public function restartGame(Game $game)
    {
        try {
            DB::beginTransaction();

            // Verify user is part of the game
            if ($game->player_1_id !== Auth::id() && $game->player_2_id !== Auth::id()) {
                DB::rollBack();
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Create new game state
            $game->game_state = [
                'board' => array_fill(0, 9, ''),
                'current_turn' => $game->player_1_id, // First player starts
                'status' => 'active',
                'restart_request' => null,
                'players' => [
                    $game->player_1_id => 'X',
                    $game->player_2_id => 'O'
                ]
            ];
            $game->winner_id = null;
            $game->ended_at = null;
            $game->started_at = now();
            $game->save();

            // Load relationships
            $game->load(['player1:id,username', 'player2:id,username']);

            // Broadcast game update
            broadcast(new GameUpdated($game));

            DB::commit();

            return response()->json([
                'id' => $game->id,
                'game_state' => $game->game_state,
                'winner_id' => $game->winner_id,
                'player_1_id' => $game->player_1_id,
                'player_2_id' => $game->player_2_id,
                'player1' => [
                    'id' => $game->player1->id,
                    'username' => $game->player1->username,
                ],
                'player2' => [
                    'id' => $game->player2->id,
                    'username' => $game->player2->username,
                ],
                'winner' => null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Game restart error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'game_id' => $game->id,
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to restart game',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function requestRestart(Game $game)
    {
        try {
            DB::beginTransaction();

            // Verify user is part of the game
            if ($game->player_1_id !== Auth::id() && $game->player_2_id !== Auth::id()) {
                DB::rollBack();
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Update game state with restart request
            $gameState = $game->game_state;
            $gameState['restart_request'] = [
                'requested_by' => Auth::id(),
                'requested_at' => now()->toISOString(),
                'status' => 'pending'
            ];
            $game->game_state = $gameState;
            $game->save();

            // Load relationships
            $game->load(['player1:id,username', 'player2:id,username']);

            // Broadcast game update
            broadcast(new GameUpdated($game));

            DB::commit();

            return response()->json($game);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Game restart request error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'game_id' => $game->id,
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to request restart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function respondToRestart(Request $request, Game $game)
    {
        try {
            DB::beginTransaction();

            // Validate request
            $request->validate([
                'accept' => 'required|boolean'
            ]);

            // Verify user is part of the game
            if ($game->player_1_id !== Auth::id() && $game->player_2_id !== Auth::id()) {
                DB::rollBack();
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Verify there is a pending restart request
            if (
                !isset($game->game_state['restart_request']) ||
                $game->game_state['restart_request']['status'] !== 'pending' ||
                $game->game_state['restart_request']['requested_by'] === Auth::id()
            ) {
                DB::rollBack();
                return response()->json(['message' => 'No pending restart request'], 400);
            }

            if ($request->accept) {
                // Reset the game
                $game->status = 'active';
                $game->game_state = [
                    'board' => array_fill(0, 9, ''),
                    'current_turn' => $game->player_1_id,
                    'status' => 'active',
                    'restart_request' => null,
                    'players' => [
                        $game->player_1_id => 'X',
                        $game->player_2_id => 'O'
                    ]
                ];
                $game->winner_id = null;
                $game->ended_at = null;
                $game->started_at = now();
            } else {
                // Just clear the restart request
                $gameState = $game->game_state;
                $gameState['restart_request'] = null;
                $gameState['status'] = 'completed';
                $game->game_state = $gameState;
                $game->status = 'completed';
            }

            $game->save();

            // Load relationships
            $game->load(['player1:id,username', 'player2:id,username']);

            // Broadcast game update
            broadcast(new GameUpdated($game));

            DB::commit();

            return response()->json($game);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Game restart response error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'game_id' => $game->id,
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to respond to restart request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function checkWinner($board)
    {
        $winningCombos = [
            [0, 1, 2], // Top row
            [3, 4, 5], // Middle row
            [6, 7, 8], // Bottom row
            [0, 3, 6], // Left column
            [1, 4, 7], // Middle column
            [2, 5, 8], // Right column
            [0, 4, 8], // Diagonal from top-left
            [2, 4, 6]  // Diagonal from top-right
        ];

        foreach ($winningCombos as $index => $combo) {
            [$a, $b, $c] = $combo;
            if (
                $board[$a] !== '' &&
                $board[$a] === $board[$b] &&
                $board[$a] === $board[$c]
            ) {
                return [
                    'winner' => true,
                    'line' => [
                        'cells' => $combo,
                        'type' => $this->getLineType($index)
                    ]
                ];
            }
        }

        return ['winner' => false];
    }

    private function getLineType($index)
    {
        switch ($index) {
            case 0:
                return 'horizontal-top';
            case 1:
                return 'horizontal-middle';
            case 2:
                return 'horizontal-bottom';
            case 3:
                return 'vertical-left';
            case 4:
                return 'vertical-middle';
            case 5:
                return 'vertical-right';
            case 6:
                return 'diagonal-left';
            case 7:
                return 'diagonal-right';
            default:
                return '';
        }
    }

    /**
     * Get list of available players
     */
    public function getAvailablePlayers()
    {
        try {
            DB::beginTransaction();

            $availablePlayers = User::where('is_available', true)
                ->where('id', '!=', Auth::id())
                ->select('id', 'username', 'rank')
                ->get();

            DB::commit();

            return response()->json($availablePlayers);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Get available players error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to get available players',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle player's availability status
     */
    public function toggleAvailability()
    {
        try {
            DB::beginTransaction();

            // Update user availability using query builder to avoid model save issues
            DB::table('users')
                ->where('id', Auth::id())
                ->update(['is_available' => DB::raw('NOT is_available')]);

            // Get updated user data
            $user = User::find(Auth::id());

            // If user becomes unavailable, cancel any pending game requests
            if (!$user->is_available) {
                Game::where(function ($query) use ($user) {
                    $query->where('player_1_id', $user->id)
                        ->orWhere('player_2_id', $user->id);
                })
                    ->where('status', 'pending')
                    ->delete();
            }

            DB::commit();

            return response()->json([
                'is_available' => $user->is_available,
                'message' => $user->is_available ? 'You are now available for games' : 'You are no longer available for games'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Toggle availability error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to update availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request a match with another player
     */
    public function requestMatch(Request $request)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'opponent_id' => 'required|exists:users,id'
            ]);

            // Log request data
            Log::info('Match request received', [
                'user_id' => Auth::id(),
                'opponent_id' => $request->opponent_id,
                'request_data' => $request->all()
            ]);

            // Verify opponent is available
            $opponent = User::findOrFail($request->opponent_id);
            if (!$opponent->is_available) {
                DB::rollBack();
                return response()->json(['message' => 'Player is no longer available'], 400);
            }

            // Create new game with pending status
            $game = Game::create([
                'player_1_id' => Auth::id(),
                'player_2_id' => $request->opponent_id,
                'game_type' => 'tic-tac-toe',
                'status' => 'pending',
                'game_state' => [
                    'board' => array_fill(0, 9, ''),
                    'current_turn' => Auth::id(),
                    'status' => 'pending',
                    'challenge' => [
                        'challenger_id' => Auth::id(),
                        'challenged_id' => $request->opponent_id,
                        'status' => 'pending'
                    ]
                ],
                'started_at' => now(), // Set to current time since the challenge starts now
                'winner_id' => null
            ]);

            // Load relationships
            $game->load(['player1:id,username', 'player2:id,username']);

            // Broadcast game creation
            broadcast(new GameUpdated($game));

            DB::commit();

            Log::info('Game challenge created successfully', [
                'game_id' => $game->id,
                'player_1_id' => Auth::id(),
                'player_2_id' => $request->opponent_id
            ]);

            return response()->json([
                'id' => $game->id,
                'game_state' => $game->game_state,
                'winner_id' => $game->winner_id,
                'player_1_id' => $game->player_1_id,
                'player_2_id' => $game->player_2_id,
                'player1' => [
                    'id' => $game->player1->id,
                    'username' => $game->player1->username,
                ],
                'player2' => [
                    'id' => $game->player2->id,
                    'username' => $game->player2->username,
                ],
                'winner' => null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Game challenge creation error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'opponent_id' => $request->opponent_id ?? null
            ]);
            return response()->json([
                'message' => 'Failed to create game challenge',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Respond to a game challenge
     */
    public function respondToChallenge(Request $request, Game $game)
    {
        try {
            DB::beginTransaction();

            // Validate request
            $request->validate([
                'accept' => 'required|boolean'
            ]);

            // Verify user is part of the game
            if ($game->player_2_id !== Auth::id()) {
                DB::rollBack();
                Log::warning('Unauthorized challenge response', [
                    'game_id' => $game->id,
                    'user_id' => Auth::id(),
                    'player_2_id' => $game->player_2_id
                ]);
                return response()->json([
                    'message' => 'Unauthorized',
                    'details' => 'Only the challenged player can respond'
                ], 403);
            }

            // Verify game is in pending state
            if ($game->status !== 'pending') {
                DB::rollBack();
                Log::warning('Invalid game state for challenge response', [
                    'game_id' => $game->id,
                    'status' => $game->status,
                    'game_state' => $game->game_state
                ]);
                return response()->json([
                    'message' => 'Invalid game state',
                    'details' => 'Game must be in pending state'
                ], 400);
            }

            if ($request->accept) {
                // Accept the challenge
                $game->status = 'active';
                $game->started_at = now();
                $game->game_state = [
                    'board' => array_fill(0, 9, ''),
                    'current_turn' => $game->player_1_id,
                    'status' => 'active',
                    'moves' => [],
                    'last_move' => null,
                    'players' => [
                        $game->player_1_id => 'X',
                        $game->player_2_id => 'O'
                    ]
                ];

                Log::info('Challenge accepted', [
                    'game_id' => $game->id,
                    'player_1_id' => $game->player_1_id,
                    'player_2_id' => $game->player_2_id,
                    'game_state' => $game->game_state
                ]);
            } else {
                // Reject the challenge
                $game->status = 'rejected';
                $game->game_state = [
                    'status' => 'rejected',
                    'rejected_at' => now()->toISOString(),
                    'rejected_by' => Auth::id()
                ];

                Log::info('Challenge rejected', [
                    'game_id' => $game->id,
                    'rejected_by' => Auth::id()
                ]);
            }

            // Save the game
            $game->save();

            // Load relationships
            $game->load(['player1:id,username', 'player2:id,username']);

            // Broadcast game update to both players
            broadcast(new GameUpdated($game));

            DB::commit();

            Log::info('Game challenge response processed', [
                'game_id' => $game->id,
                'response' => $request->accept ? 'accepted' : 'rejected',
                'responder_id' => Auth::id(),
                'final_state' => $game->game_state,
                'status' => $game->status
            ]);

            return response()->json([
                'id' => $game->id,
                'game_state' => $game->game_state,
                'winner_id' => $game->winner_id,
                'player_1_id' => $game->player_1_id,
                'player_2_id' => $game->player_2_id,
                'status' => $game->status,
                'player1' => [
                    'id' => $game->player1->id,
                    'username' => $game->player1->username,
                ],
                'player2' => [
                    'id' => $game->player2->id,
                    'username' => $game->player2->username,
                ],
                'winner' => null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Game challenge response error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'game_id' => $game->id,
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to process challenge response',
                'error' => $e->getMessage(),
                'details' => 'An unexpected error occurred while processing your response'
            ], 500);
        }
    }

    /**
     * Get pending challenges for the authenticated user
     */
    public function getPendingChallenges()
    {
        try {
            $pendingChallenges = Game::with(['player1:id,username', 'player2:id,username'])
                ->where('player_2_id', Auth::id())
                ->where('status', 'pending')
                ->get();

            return response()->json($pendingChallenges);
        } catch (\Exception $e) {
            Log::error('Get pending challenges error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Failed to get pending challenges',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}