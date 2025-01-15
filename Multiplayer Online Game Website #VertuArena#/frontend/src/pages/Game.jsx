import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TicTacToe from '../components/game/TicTacToe';
import { useAuth } from '../contexts/AuthContext';
import Echo from 'laravel-echo';

const Game = () => {
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [incomingChallenges, setIncomingChallenges] = useState([]);
    const [pendingChallenge, setPendingChallenge] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const echoRef = useRef(null);
    const navigate = useNavigate();
    const { gameId } = useParams();
    const { user } = useAuth();
    const pathname = window.location.pathname;

    useEffect(() => {
        // Initialize Echo instance for real-time updates
        echoRef.current = new Echo({
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
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
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
                            callback(null, response.data);
                        })
                        .catch(error => {
                            callback(error);
                        });
                    }
                };
            }
        });

        // Subscribe to user's private channel for game updates
        const channel = echoRef.current.private(`user.${user.id}`);
        
        channel.listen('.GameUpdated', (e) => {
            console.log('Game update received:', e.game);
            const game = e.game;
            
            // Handle game updates for both players
            if (game.status === 'active' && (game.player_1_id === user.id || game.player_2_id === user.id)) {
                console.log('Game is active, redirecting to game:', game.id);
                setPendingChallenge(null);
                setIncomingChallenges(prev => prev.filter(c => c.id !== game.id));
                navigate(`/game/${game.id}`);
            } else if (game.status === 'rejected' && game.player_1_id === user.id) {
                console.log('Game was rejected');
                setPendingChallenge(null);
            }
        });

        return () => {
            if (echoRef.current) {
                channel.stopListening('.GameUpdated');
                echoRef.current.disconnect();
            }
        };
    }, [user.id, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!gameId && isSearching) {
                    // Only fetch available players if we're on the matchmaking page and searching
                    const playersResponse = await axios.get('/api/available-players');
                    setAvailablePlayers(playersResponse.data);

                    // Fetch pending challenges
                    const challengesResponse = await axios.get('/api/challenges/pending');
                    setIncomingChallenges(challengesResponse.data);
                }
            } catch (err) {
                setError('Failed to load available players');
            }
        };

        fetchData();

        // Set up polling for available players and challenges
        let pollInterval;
        if (!gameId && isSearching) {
            pollInterval = setInterval(async () => {
                try {
                    const [playersResponse, challengesResponse] = await Promise.all([
                        axios.get('/api/available-players'),
                        axios.get('/api/challenges/pending')
                    ]);
                    setAvailablePlayers(playersResponse.data);
                    setIncomingChallenges(challengesResponse.data);
                } catch (err) {
                    console.error('Failed to poll available players:', err);
                }
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [gameId, isSearching]);

    const toggleAvailability = async () => {
        try {
            // First, make the API call
            const response = await axios.post('/api/toggle-availability');
            
            // Update the local state based on the server response
            setIsSearching(response.data.is_available);
            
            // If we're now available, fetch the players
            if (response.data.is_available) {
                const [playersResponse, challengesResponse] = await Promise.all([
                    axios.get('/api/available-players'),
                    axios.get('/api/challenges/pending')
                ]);
                setAvailablePlayers(playersResponse.data);
                setIncomingChallenges(challengesResponse.data);
            } else {
                // If we're no longer available, clear the lists
                setAvailablePlayers([]);
                setIncomingChallenges([]);
            }
        } catch (err) {
            console.error('Failed to toggle availability:', err);
            setError('Failed to update availability');
            // Don't change the searching state if the API call failed
        }
    };

    const requestMatch = async (opponentId) => {
        try {
            const response = await axios.post('/api/games/request-match', {
                opponent_id: opponentId
            });
            setPendingChallenge(response.data);
            
            // Subscribe to the specific game channel for updates
            const gameChannel = echoRef.current.private(`game.${response.data.id}`);
            gameChannel.listen('.GameUpdated', (e) => {
                console.log('Game update received on specific channel:', e.game);
                const game = e.game;
                if (game.status === 'active') {
                    navigate(`/game/${game.id}`);
                }
            });
        } catch (err) {
            setError('Failed to request match');
        }
    };

    const respondToChallenge = async (gameId, accept) => {
        try {
            const response = await axios.post(`/api/games/${gameId}/challenge/respond`, {
                accept
            });
            
            // Remove the challenge from the list
            setIncomingChallenges(prev => prev.filter(challenge => challenge.id !== gameId));
            
            // If challenge is accepted, redirect both players to the game
            if (accept && response.data.status === 'active') {
                navigate(`/game/${gameId}`);
            }
        } catch (err) {
            setError('Failed to respond to challenge');
        }
    };

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-red-500 text-xl">{error}</div>
        </div>
    );

    if (gameId) {
        return <TicTacToe gameId={gameId} currentUser={user} />;
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
                        Tic Tac Toe Matchmaking
                    </h1>
                    <p className="text-gray-300 text-lg mb-8">
                        Find players and start a game of Tic Tac Toe
                    </p>
                    <button
                        onClick={toggleAvailability}
                        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                            isSearching
                                ? 'bg-primary-pink text-white hover:bg-primary-pink/90'
                                : 'bg-primary-blue text-white hover:bg-primary-blue/90'
                        }`}
                    >
                        {isSearching ? 'Stop Searching' : 'Search for Players'}
                    </button>
                </div>

                {/* Pending Challenge */}
                {pendingChallenge && (
                    <div className="mb-6 p-4 rounded-lg bg-primary-blue/20 backdrop-blur-sm">
                        <div className="text-center">
                            <p className="text-white mb-2">
                                Waiting for {pendingChallenge.player2.username} to accept your challenge...
                            </p>
                            <div className="animate-pulse text-primary-blue">⌛</div>
                        </div>
                    </div>
                )}

                {/* Incoming Challenges */}
                {incomingChallenges.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4 text-white">Incoming Challenges</h2>
                        <div className="space-y-4">
                            {incomingChallenges.map(challenge => (
                                <div key={challenge.id} className="p-4 rounded-lg bg-primary-pink/20 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-pink to-primary-blue flex items-center justify-center text-white font-bold">
                                                {challenge.player1.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">{challenge.player1.username} wants to play!</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => respondToChallenge(challenge.id, true)}
                                                className="px-4 py-2 rounded-lg bg-primary-green text-white font-semibold hover:bg-primary-green/90 transition-all duration-300"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => respondToChallenge(challenge.id, false)}
                                                className="px-4 py-2 rounded-lg bg-primary-pink text-white font-semibold hover:bg-primary-pink/90 transition-all duration-300"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Players Section */}
                <div className={`bg-black/20 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 ${
                    isSearching ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'
                }`}>
                    <h2 className="text-2xl font-semibold mb-6 text-white">Available Players</h2>
                    <div className="grid gap-4">
                        {!isSearching ? (
                            <div className="text-center py-8 text-gray-400">
                                Click "Search for Players" to find opponents
                            </div>
                        ) : availablePlayers.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                No players available at the moment
                            </div>
                        ) : (
                            availablePlayers
                                .filter(player => player.id !== user.id)
                                .map(player => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-pink to-primary-blue flex items-center justify-center text-white font-bold">
                                                {player.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">{player.username}</h3>
                                                <p className="text-gray-400 text-sm">
                                                    Rank: {player.rank || 'Unranked'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => requestMatch(player.id)}
                                            className="px-4 py-2 rounded-lg bg-primary-blue text-white font-semibold hover:bg-primary-blue/90 transition-all duration-300"
                                            disabled={pendingChallenge !== null}
                                        >
                                            Challenge
                                        </button>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm text-center">
                        <div className="text-2xl font-bold text-primary-pink">
                            {isSearching ? availablePlayers.length : 0}
                        </div>
                        <div className="text-gray-400">Players Online</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm text-center">
                        <div className="text-2xl font-bold text-primary-blue">
                            {isSearching ? availablePlayers.filter(p => p.id !== user.id).length : 0}
                        </div>
                        <div className="text-gray-400">Available to Play</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm text-center">
                        <div className="text-2xl font-bold text-primary-green">
                            {Math.floor(Math.random() * 50 + 100)}
                        </div>
                        <div className="text-gray-400">Games Today</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game; 