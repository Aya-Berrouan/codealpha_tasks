import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Echo from 'laravel-echo';
import { useNavigate } from 'react-router-dom';

const TicTacToe = ({ gameId, currentUser }) => {
    const [game, setGame] = useState(null);
    const [error, setError] = useState(null);
    const [showWinAnimation, setShowWinAnimation] = useState(false);
    const [lastMove, setLastMove] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize Echo instance for real-time updates
        const echo = new Echo({
            broadcaster: 'pusher',
            key: 'e40e2d17d7e700e559c1',
            cluster: 'eu',
            forceTLS: true,
            encrypted: true,
            authEndpoint: 'http://localhost:8001/api/broadcasting/auth',
            auth: {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            },
            authorizer: (channel) => {
                return {
                    authorize: (socketId, callback) => {
                        axios.post('http://localhost:8001/api/broadcasting/auth', {
                            socket_id: socketId,
                            channel_name: channel.name
                        }, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            console.log('Channel authorization successful:', channel.name);
                            callback(null, response.data);
                        })
                        .catch(error => {
                            console.error('Channel authorization failed:', error);
                            if (error.response) {
                                console.error('Error response:', error.response.data);
                            }
                            callback(error);
                        });
                    }
                };
            }
        });

        // Subscribe to game updates using a private channel
        const channel = echo.private(`game.${gameId}`);
        
        // Debug logs for channel subscription
        console.log('Attempting to subscribe to game channel:', `game.${gameId}`);
        
        channel.subscribed(() => {
            console.log('Successfully subscribed to game channel:', `game.${gameId}`);
        }).error((error) => {
            console.error('Game channel subscription error:', error);
            setError('Failed to connect to game updates. Please refresh the page.');
        });

        // Fetch initial game state
        const fetchGame = async () => {
            try {
                const response = await axios.get(`/api/games/${gameId}`, {
                    params: { game_type: 'tic-tac-toe' }
                });
                console.log('Initial game state:', response.data);
                // Ensure winner_id and player information is properly set in initial state
                const initialGame = {
                    ...response.data,
                    winner_id: response.data.winner_id,
                    player1: {
                        id: response.data.player_1_id,
                        username: response.data.player1?.username || response.data.player1?.name
                    },
                    player2: {
                        id: response.data.player_2_id,
                        username: response.data.player2?.username || response.data.player2?.name
                    },
                    player_1_id: response.data.player_1_id,
                    player_2_id: response.data.player_2_id,
                    game_state: {
                        ...response.data.game_state,
                        winner_id: response.data.winner_id
                    }
                };

                // Ensure we have valid usernames
                if (!initialGame.player1.username) {
                    console.warn('Missing username for player 1:', response.data.player1);
                }
                if (!initialGame.player2.username) {
                    console.warn('Missing username for player 2:', response.data.player2);
                }

                console.log('Processed initial game state:', initialGame);
                setGame(initialGame);
                if (initialGame.game_state.status === 'completed' && initialGame.winner_id) {
                    setShowWinAnimation(true);
                    if (initialGame.winner_id === currentUser.id) {
                        setShowCelebration(true);
                        setTimeout(() => setShowCelebration(false), 3000);
                    }
                }
            } catch (err) {
                console.error('Failed to load game:', err);
                setError('Failed to load game');
            }
        };

        fetchGame();

        // Listen for game updates with proper event name
        channel.listen('.GameUpdated', (e) => {
            console.log('Received game update on channel:', channel.name, e);
            console.log('Current game state:', game);
            console.log('New game state:', e.game);
            console.log('Winner ID:', e.game.winner_id);
            console.log('Current User ID:', currentUser.id);
            console.log('Player 1 ID:', e.game.player_1_id);
            console.log('Player 2 ID:', e.game.player_2_id);
            
            if (e.game) {
                // Check for declined rematch before updating state
                const hadPendingRequest = game?.game_state?.restart_request?.status === 'pending';
                const requestWasCleared = !e.game.game_state.restart_request;
                const gameIsCompleted = e.game.game_state.status === 'completed';

                if (hadPendingRequest && requestWasCleared && gameIsCompleted) {
                    console.log('Rematch was declined, redirecting to matchmaking...');
                    navigate('/matchmaking/tic-tac-toe');
                    return;
                }

                // Check if the game is completed (either by win or draw)
                const isDraw = e.game.game_state.board.every(cell => cell !== '') && !e.game.winner_id;
                const isCompleted = e.game.game_state.status === 'completed' || isDraw;

                if (isCompleted) {
                    // Fetch fresh game state for completed games
                    axios.get(`/api/games/${gameId}`, {
                        params: { game_type: 'tic-tac-toe' }
                    }).then(response => {
                        const freshGame = {
                            ...response.data,
                            winner_id: response.data.winner_id,
                            player1: response.data.player1,
                            player2: response.data.player2,
                            player_1_id: response.data.player_1_id,
                            player_2_id: response.data.player_2_id,
                            game_state: {
                                ...response.data.game_state,
                                winner_id: response.data.winner_id,
                                status: 'completed'
                            }
                        };

                        console.log('Fresh game state after completion:', freshGame);
                        setGame(freshGame);
                        setShowWinAnimation(true);
                        
                        if (freshGame.winner_id === currentUser.id) {
                            setShowCelebration(true);
                            setTimeout(() => setShowCelebration(false), 3000);
                        }
                    }).catch(err => {
                        console.error('Failed to fetch fresh game state:', err);
                    });
                } else {
                    // Regular game state update for ongoing game
                    const updatedGame = {
                        ...e.game,
                        player1: {
                            id: e.game.player_1_id,
                            username: e.game.player1?.username || e.game.player1?.name || game?.player1?.username || game?.player1?.name
                        },
                        player2: {
                            id: e.game.player_2_id,
                            username: e.game.player2?.username || e.game.player2?.name || game?.player2?.username || game?.player2?.name
                        },
                        winner_id: e.game.winner_id,
                        player_1_id: e.game.player_1_id,
                        player_2_id: e.game.player_2_id,
                        game_state: {
                            ...e.game.game_state,
                            winner_id: e.game.winner_id,
                            status: isDraw ? 'completed' : e.game.game_state.status
                        }
                    };

                    console.log('Updated game state:', updatedGame);
                    setGame(updatedGame);

                    if (updatedGame.game_state.status === 'active') {
                        setShowWinAnimation(false);
                        setError(null);
                    }
                }
            }
        });

        // Cleanup subscription
        return () => {
            console.log('Cleaning up WebSocket connection...');
            channel.stopListening('.GameUpdated');
            echo.disconnect();
        };
    }, [gameId, currentUser.id, navigate]);

    useEffect(() => {
        if (game?.player1?.username) {
            setPlayer1Name(game.player1.username);
        }
        if (game?.player2?.username) {
            setPlayer2Name(game.player2.username);
        }
    }, [game?.player1?.username, game?.player2?.username]);

    const handleMove = async (position) => {
        try {
            setError(null);
            // Check game state before making move
            if (!game?.game_state?.status || game.game_state.status !== 'active') {
                setError('Game is not active');
                // Refresh game state
                const response = await axios.get(`/api/games/${gameId}`, {
                    params: { game_type: 'tic-tac-toe' }
                });
                setGame(response.data);
                return;
            }
            setLastMove(position);
            console.log('Attempting move:', {
                position,
                gameId,
                currentGameState: game?.game_state,
                isPlayerTurn: game?.game_state?.current_turn === currentUser.id
            });
            await axios.post(`/api/games/${gameId}/move`, { 
                position,
                game_type: 'tic-tac-toe'
            });
        } catch (err) {
            console.error('Move error:', err);
            console.error('Error details:', {
                response: err.response?.data,
                status: err.response?.status,
                gameState: game?.game_state,
                position,
                currentUser: currentUser?.id
            });
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to make move';
            setError(errorMessage);
            
            try {
                const response = await axios.get(`/api/games/${gameId}`, {
                    params: { game_type: 'tic-tac-toe' }
                });
                setGame(response.data);
            } catch (refreshErr) {
                console.error('Failed to refresh game state:', refreshErr);
            }
        }
    };

    const handleRestartRequest = async () => {
        try {
            setError(null);
            await axios.post(`/api/games/${gameId}/restart/request`, {
                game_type: 'tic-tac-toe'
            });
        } catch (err) {
            console.error('Restart request error:', err);
            setError('Failed to request restart');
        }
    };

    const handleRestartResponse = async (accept) => {
        try {
            setError(null);
            if (!accept) {
                // Send decline response and wait for it to complete
                const response = await axios.post(`/api/games/${gameId}/restart/respond`, { 
                    accept,
                    game_type: 'tic-tac-toe'
                });
                // Update game state to trigger WebSocket event
                setGame(response.data);
                // Redirect to matchmaking
                navigate('/matchmaking/tic-tac-toe');
            } else {
                await axios.post(`/api/games/${gameId}/restart/respond`, {
                    accept,
                    game_type: 'tic-tac-toe'
                });
            }
        } catch (err) {
            console.error('Restart response error:', err);
            setError('Failed to respond to restart request');
            try {
                const response = await axios.get(`/api/games/${gameId}`, {
                    params: { game_type: 'tic-tac-toe' }
                });
                setGame(response.data);
            } catch (refreshErr) {
                console.error('Failed to refresh game state:', refreshErr);
            }
        }
    };

    if (!game) return (
        <div className="h-screen flex items-center justify-center">
            <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary-blue/30"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-blue border-t-transparent"></div>
            </div>
        </div>
    );

    const isPlayerTurn = game.game_state.current_turn === currentUser.id;
    const playerSymbol = currentUser.id === game.player_1_id ? 'X' : 'O';
    const isGameActive = game.game_state.status === 'active';
    const moveCount = game.game_state.board.filter(cell => cell !== '').length;

    const getWinningLineStyles = (type) => {
        const baseStyles =
            "absolute bg-gradient-to-r from-primary-blue via-primary-green to-primary-pink animate-line-draw pointer-events-none";
    
        switch (type) {
            case "horizontal-top":
                return `${baseStyles} top-[17.5%] left-[4%] w-[92%] h-[2px] translate-y-[-50%]`;
            case "horizontal-middle":
                return `${baseStyles} top-[49.5%] left-[4%] w-[92%] h-[2px] translate-y-[-50%]`;
            case "horizontal-bottom":
                return `${baseStyles} top-[81.5%] left-[4%] w-[92%] h-[2px] translate-y-[-50%]`;
            case "vertical-left":
                return `${baseStyles} top-[3.8%] left-[18.2%] w-[92%] h-[2px] translate-x-[-50%] rotate-90 origin-left animate-vertical-line`;
            case "vertical-middle":
                return `${baseStyles} top-[3.8%] left-[50%] w-[92%] h-[2px] translate-x-[-50%] rotate-90 origin-left animate-vertical-line`;
            case "vertical-right":
                return `${baseStyles} top-[3.8%] left-[82%] w-[92%] h-[2px] translate-x-[-50%] rotate-90 origin-left animate-vertical-line`;
            case "diagonal-left":
                return "absolute top-[5%] left-[5%] w-[128%] h-[2px] bg-gradient-to-r from-primary-blue via-primary-green to-primary-pink transform origin-top-left animate-diagonal-line pointer-events-none";
            case "diagonal-right":
                return "absolute top-[5%] left-[95%] w-[128%] h-[2px] bg-gradient-to-r from-primary-blue via-primary-green to-primary-pink transform origin-top-left rotate-[-45deg] animate-diagonal-line-reverse pointer-events-none";

            default:
                return '';
        }
    };
    

    return (
        <div className="h-screen py-6 px-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none">
                <div className="absolute inset-0 w-full h-full opacity-20">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-blue rounded-full mix-blend-screen filter blur-xl animate-blob"></div>
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-green rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-primary-pink rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
                </div>
            </div>

            {/* Celebration Animation */}
            {showCelebration && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 animate-confetti-1">🎉</div>
                    <div className="absolute top-0 left-1/2 animate-confetti-2">🎊</div>
                    <div className="absolute top-0 right-1/4 animate-confetti-3">🎈</div>
                    <div className="absolute top-0 right-1/3 animate-confetti-4">✨</div>
                    <div className="absolute top-0 left-1/3 animate-confetti-5">🌟</div>
                </div>
            )}

            <div className="max-w-4xl mx-auto relative h-full flex flex-col mt-16">
                {/* Game Status Banner */}
                <div className={`relative mb-8 p-4 rounded-3xl text-center transform transition-all duration-500 overflow-hidden backdrop-blur-sm border border-white/10
                    ${showWinAnimation ? 'scale-105' : ''}
                    ${game.game_state.status === 'completed'
                        ? game.winner_id === currentUser.id
                            ? 'bg-gradient-to-r from-primary-green/10 to-transparent shadow-lg shadow-primary-green/20'
                            : 'bg-gradient-to-r from-primary-pink/10 to-transparent shadow-lg shadow-primary-pink/20'
                        : game.game_state.status === 'draw'
                        ? 'bg-gradient-to-r from-primary-yellow/10 to-transparent shadow-lg shadow-primary-yellow/20'
                        : 'bg-gradient-to-r from-primary-blue/10 to-transparent shadow-lg shadow-primary-blue/20'
                    }`}>
                    <h2 className="text-3xl font-bold text-white tracking-wide">
                        {game.game_state.status === 'active' ? (
                            isPlayerTurn ? '🎮🎮 Your turn!' : "⌛ Opponent's turn"
                        ) : (
                            game.game_state.status === 'completed' ? (
                                game.winner_id ? (
                                    currentUser.id === game.winner_id ? (
                                        <div className="space-y-2">
                                            <div className="text-4xl text-primary-green">🎉 Congratulations! 🏆</div>
                                            <div className="text-2xl text-primary-green/80">
                                                {currentUser.id === game.player_1_id ? 
                                                    "You've won as Player X!" : 
                                                    "You've won as Player O!"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="text-4xl text-primary-pink">Better luck next time! 💫</div>
                                            <div className="text-2xl text-primary-pink/80">
                                                {game.winner_id === game.player_1_id ? 
                                                    `${game.player1?.username} won as Player X!` : 
                                                    `${game.player2?.username} won as Player O!`}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-4xl text-primary-yellow">🤝 It's a Draw! 🤝</div>
                                        <div className="text-2xl text-primary-yellow/80">Well played by both players!</div>
                                    </div>
                                )
                            ) : null
                        )}
                    </h2>
                    {game.game_state.status !== 'active' && !game.game_state.restart_request && (
                        <button
                            onClick={handleRestartRequest}
                            className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 
                                     text-white font-medium tracking-wide transition-all duration-300 
                                     hover:bg-white/20 hover:scale-105 hover:shadow-lg hover:shadow-white/10
                                     active:scale-95 transform group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="transform transition-transform group-hover:rotate-180 duration-500">🔄</span>
                                Request Rematch
                            </span>
                        </button>
                    )}
                    {game.game_state.restart_request && game.game_state.restart_request.requested_by !== currentUser.id && (
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                                onClick={() => handleRestartResponse(true)}
                                className="px-6 py-2 rounded-full bg-primary-green/10 backdrop-blur-sm border border-primary-green/20 
                                         text-white font-medium tracking-wide transition-all duration-300 
                                         hover:bg-primary-green/20 hover:scale-105 hover:shadow-lg hover:shadow-primary-green/10
                                         active:scale-95 transform"
                            >
                                Accept Rematch
                            </button>
                            <button
                                onClick={() => handleRestartResponse(false)}
                                className="px-6 py-2 rounded-full bg-primary-pink/10 backdrop-blur-sm border border-primary-pink/20 
                                         text-white font-medium tracking-wide transition-all duration-300 
                                         hover:bg-primary-pink/20 hover:scale-105 hover:shadow-lg hover:shadow-primary-pink/10
                                         active:scale-95 transform"
                            >
                                Decline
                            </button>
                        </div>
                    )}
                    {game.game_state.restart_request && game.game_state.restart_request.requested_by === currentUser.id && (
                        <div className="mt-4 text-white/70 text-sm animate-pulse">
                            Waiting for opponent to respond...
                        </div>
                    )}
                </div>

                {/* Players Info */}
                <div className="flex justify-between items-stretch -mb-4 gap-4">
                    {/* Player 1 Card */}
                    <div className={`flex-1 relative overflow-hidden group
                        ${isGameActive && currentUser.id === game.player_1_id && isPlayerTurn
                            ? 'transform scale-105'
                            : ''
                        }`}>
                        <div className={`relative p-3 rounded-2xl border-2 transition-all duration-300 h-full
                            ${isGameActive && currentUser.id === game.player_1_id && isPlayerTurn
                                ? 'border-primary-blue shadow-lg shadow-primary-blue/30'
                                : 'border-gray-700'
                            }`}>
                            <div className="text-center">
                                <div className="font-bold text-base mb-1 text-white">Player 1</div>
                                <div className="text-4xl font-bold text-primary-blue mb-1 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">X</div>
                                <div className="text-base font-semibold text-gray-300">{player1Name || 'Loading...'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Center Stats */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-xl font-bold text-white relative">
                            <span className="relative animate-pulse">VS</span>
                        </div>
                        {isGameActive && (
                            <div className="space-y-1">
                                <div className="px-3 py-1 rounded-full border border-primary-blue/30 shadow-lg shadow-primary-blue/20 text-white text-sm font-semibold">
                                    Move {moveCount}
                                </div>
                                <div className="h-16 w-1 bg-gradient-to-b from-primary-blue/30 via-primary-blue/10 to-transparent mx-auto"></div>
                            </div>
                        )}
                    </div>

                    {/* Player 2 Card */}
                    <div className={`flex-1 relative overflow-hidden group
                        ${isGameActive && currentUser.id === game.player_2_id && isPlayerTurn
                            ? 'transform scale-105'
                            : ''
                        }`}>
                        <div className={`relative p-3 rounded-2xl border-2 transition-all duration-300 h-full
                            ${isGameActive && currentUser.id === game.player_2_id && isPlayerTurn
                                ? 'border-primary-pink shadow-lg shadow-primary-pink/30'
                                : 'border-gray-700'
                            }`}>
                            <div className="text-center">
                                <div className="font-bold text-base mb-1 text-white">Player 2</div>
                                <div className="text-4xl font-bold text-primary-pink mb-1 transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12">O</div>
                                <div className="text-base font-semibold text-gray-300">{player2Name || 'Loading...'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="relative flex-grow flex items-center perspective-1000">
                    <div className="relative grid grid-cols-3 gap-3 p-4 rounded-2xl w-full max-w-md mx-auto transform-style-3d">
                        {/* Winning Line */}
                        {game.game_state.winning_line && (
                            <div className={`absolute inset-0 z-10 pointer-events-none flex items-center justify-center ${getWinningLineStyles(game.game_state.winning_line.type)}`}>
                                <div className="absolute bg-gradient-to-r from-primary-blue via-primary-green to-primary-pink opacity-75 shadow-lg animate-line-draw" />
                            </div>
                        )}
                        
                        {game.game_state.board.map((cell, index) => (
                            <button
                                key={index}
                                onClick={() => isPlayerTurn && cell === '' && isGameActive && handleMove(index)}
                                disabled={!isPlayerTurn || cell !== '' || !isGameActive}
                                className={`
                                    aspect-square flex items-center justify-center text-5xl font-bold
                                    rounded-xl transition-all duration-300 transform
                                    ${cell === ''
                                        ? isPlayerTurn && isGameActive
                                            ? playerSymbol === 'X'
                                                ? 'hover:border-primary-blue/50 hover:shadow-primary-blue/30 border-2 border-primary-blue/30'
                                                : 'hover:border-primary-pink/50 hover:shadow-primary-pink/30 border-2 border-primary-pink/30'
                                            : 'border-2 border-gray-700/50'
                                        : cell === 'X'
                                            ? 'border-2 border-primary-blue text-primary-blue'
                                            : 'border-2 border-primary-pink text-primary-pink'
                                    }
                                    ${cell === '' ? 'bg-black/40' : 'bg-black/60'}
                                    backdrop-blur-sm
                                    ${isPlayerTurn && cell === '' && isGameActive ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : ''}
                                    ${lastMove === index ? 'animate-cell-placed' : ''}
                                    ${cell === '' && isPlayerTurn && isGameActive ? 'group' : ''}
                                `}
                            >
                                {cell}
                                {cell === '' && isPlayerTurn && isGameActive && (
                                    <span className={`absolute opacity-0 group-hover:opacity-20 text-4xl transition-opacity duration-300 ${
                                        playerSymbol === 'X' ? 'text-primary-blue' : 'text-primary-pink'
                                    }`}>
                                        {playerSymbol}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 relative overflow-hidden">
                        <div className="relative p-3 rounded-xl border-2 border-primary-pink text-primary-pink text-center font-semibold">
                            {error}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicTacToe; 