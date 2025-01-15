import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const TicTacToeMatchmaking = () => {
    console.log('TicTacToeMatchmaking component rendered'); // Debug log
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [incomingChallenges, setIncomingChallenges] = useState([]);
    const [pendingChallenge, setPendingChallenge] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const echoRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }

        try {
            // Initialize Echo instance for real-time updates
            window.Pusher = Pusher;
            
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
                    }
                }
            });

            // Subscribe to user's private channel for game updates
            const channel = echoRef.current.private(`user.${user.id}`);
            
            channel.listen('.GameUpdated', (e) => {
                console.log('Game update received:', e.game);
                const game = e.game;
                
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
        } catch (err) {
            console.error('Failed to initialize WebSocket:', err);
            setError('Failed to connect to game server');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [playersResponse, challengesResponse] = await Promise.all([
                    axios.get('/api/matchmaking/tic-tac-toe/available-players'),
                    axios.get('/api/matchmaking/tic-tac-toe/challenges')
                ]);
                setAvailablePlayers(playersResponse.data);
                setIncomingChallenges(challengesResponse.data);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load available players');
            }
        };

        fetchData();

        // Set up polling for available players and challenges
        const pollInterval = setInterval(fetchData, 5000); // Poll every 5 seconds

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, []);

    const toggleAvailability = async () => {
        try {
            // First, toggle availability and get the new state
            const response = await axios.post('/api/matchmaking/tic-tac-toe/toggle-availability');
            const newIsAvailable = response.data.is_available;
            
            if (newIsAvailable) {
                setIsSearching(true);
            } else {
                setIsSearching(false);
            }
        } catch (err) {
            console.error('Failed to toggle availability:', err);
            setError('Failed to update availability');
            setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
        }
    };

    const requestMatch = async (opponentId) => {
        try {
            const response = await axios.post('/api/matchmaking/tic-tac-toe/request-match', {
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
                } else if (game.status === 'rejected') {
                    setPendingChallenge(null);
                    setError('Challenge was declined');
                    setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
                }
            });
        } catch (err) {
            console.error('Failed to request match:', err);
            setError('Failed to send challenge');
            setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
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
            console.error('Failed to respond to challenge:', err);
            setError('Failed to respond to challenge');
            setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
        }
    };

    // Add mouse move handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            setMousePosition({ x: clientX, y: clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4 relative overflow-hidden">
            {/* Interactive Animated Background */}
            <div className="absolute inset-0 bg-[#0A0F1C] overflow-hidden">
                {/* Interactive Gradient Layer */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div 
                            className="absolute w-[500px] h-[500px] bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[128px] animate-pulse transition-all duration-1000 ease-out" 
                            style={{ 
                                transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
                                animation: 'pulse 4s infinite',
                                left: '10%',
                                top: '0%'
                            }}
                        />
                        <div 
                            className="absolute w-[400px] h-[400px] bg-[#7B2FFE] rounded-full mix-blend-screen filter blur-[128px] animate-pulse transition-all duration-1000 ease-out" 
                            style={{ 
                                transform: `translate(${-mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
                                animation: 'pulse 6s infinite',
                                right: '10%',
                                top: '20%'
                            }}
                        />
                        <div 
                            className="absolute w-[600px] h-[600px] bg-[#00FF85] rounded-full mix-blend-screen filter blur-[128px] animate-pulse transition-all duration-1000 ease-out" 
                            style={{ 
                                transform: `translate(${mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
                                animation: 'pulse 5s infinite',
                                left: '20%',
                                bottom: '10%'
                            }}
                        />
                    </div>
                </div>

                {/* Interactive Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-10 transition-transform duration-1000 ease-out"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        transform: `perspective(500px) rotateX(60deg) translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`,
                        transformOrigin: 'center -100%',
                    }}
                />

                {/* Interactive Floating Orbs */}
                <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => {
                        const randomX = Math.random() * 100;
                        const randomY = Math.random() * 100;
                        return (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-white rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    left: `${randomX}%`,
                                    top: `${randomY}%`,
                                    opacity: Math.random() * 0.5 + 0.2,
                                    transform: `translate(
                                        ${mousePosition.x * 0.02 * Math.cos(i)}px, 
                                        ${mousePosition.y * 0.02 * Math.sin(i)}px
                                    )`,
                                    animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Interactive Glowing Lines */}
                <div className="absolute inset-0">
                    <div 
                        className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent transform -translate-y-1/2 transition-all duration-1000 ease-out"
                        style={{ 
                            top: '25%',
                            transform: `translateY(${mousePosition.y * 0.01}px)`
                        }}
                    />
                    <div 
                        className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#7B2FFE]/20 to-transparent transform -translate-y-1/2 transition-all duration-1000 ease-out"
                        style={{ 
                            top: '50%',
                            transform: `translateY(${-mousePosition.y * 0.01}px)`
                        }}
                    />
                    <div 
                        className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF85]/20 to-transparent transform -translate-y-1/2 transition-all duration-1000 ease-out"
                        style={{ 
                            top: '75%',
                            transform: `translateY(${mousePosition.y * 0.01}px)`
                        }}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto relative">
                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    {/* Enhanced Background Glow */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[120%] h-40 bg-gradient-to-r from-[#7B2FFE]/20 via-[#3B82F6]/20 to-[#00FF85]/20 blur-3xl -z-10 animate-pulse" />
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+4rem)] h-full">
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-0 left-[10%] w-2 h-2 bg-[#7B2FFE] rounded-full animate-ping" />
                            <div className="absolute top-[60%] right-[10%] w-2 h-2 bg-[#3B82F6] rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                            <div className="absolute bottom-0 left-[50%] w-2 h-2 bg-[#00FF85] rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>

                    {/* Title Container */}
                    <div className="relative group">
                        {/* Animated Background Effects */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7B2FFE] via-[#3B82F6] to-[#00FF85] rounded-lg blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:duration-200 animate-tilt"></div>
                        
                        {/* Animated Particles */}
                        <div className="absolute -inset-2 flex items-center justify-center">
                            <div className="w-1 h-1 bg-[#7B2FFE] rounded-full absolute animate-float-slow" style={{ left: '10%', top: '20%' }}></div>
                            <div className="w-1 h-1 bg-[#3B82F6] rounded-full absolute animate-float-slow" style={{ left: '90%', top: '40%', animationDelay: '0.5s' }}></div>
                            <div className="w-1 h-1 bg-[#00FF85] rounded-full absolute animate-float-slow" style={{ left: '20%', top: '80%', animationDelay: '1s' }}></div>
                            <div className="w-1 h-1 bg-[#7B2FFE] rounded-full absolute animate-float-slow" style={{ left: '80%', top: '60%', animationDelay: '1.5s' }}></div>
                            <div className="w-1 h-1 bg-[#3B82F6] rounded-full absolute animate-float-slow" style={{ left: '40%', top: '30%', animationDelay: '2s' }}></div>
                            <div className="w-1 h-1 bg-[#00FF85] rounded-full absolute animate-float-slow" style={{ left: '60%', top: '70%', animationDelay: '2.5s' }}></div>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl md:text-6xl font-bold relative z-10 pb-4">
                            <span className="relative inline-block px-4 py-2 group-hover:scale-105 transition-transform duration-500">
                                {/* Glowing Border */}
                                <span className="absolute inset-0 bg-gradient-to-r from-[#7B2FFE]/20 via-[#3B82F6]/20 to-[#00FF85]/20 rounded-lg -z-10"></span>
                                
                                {/* Text with Gradient and Animation */}
                                <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-[#7B2FFE] via-[#3B82F6] to-[#00FF85] animate-gradient-x">
                                    Matchmaking Arena
                                </span>

                                {/* Animated Shine Effect */}
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000"></span>
                                
                                {/* Bottom Highlight */}
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#7B2FFE] via-[#3B82F6] to-[#00FF85] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
                            </span>
                        </h1>

                        {/* Animated Corner Accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#7B2FFE] rounded-tl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#3B82F6] rounded-tr opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#3B82F6] rounded-bl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FF85] rounded-br opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                    </div>

                    <p className="text-gray-400 mt-8 text-lg relative z-10">Find your worthy opponent and prove your skills</p>
                    <button
                        onClick={toggleAvailability}
                        className={`mt-8 px-10 py-4 rounded-xl font-bold text-white relative overflow-hidden group ${
                            isSearching ? 'bg-[#FF5AAF]' : 'bg-[#3B82F6]'
                        }`}
                    >
                        <span className="relative z-10">
                            {isSearching ? 'Stop Searching' : 'Search for Players'}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                </div>

                {/* Centered Content */}
                <div className="flex flex-col items-center justify-center space-y-8 max-w-3xl mx-auto">
                    {/* Pending Challenge */}
                    {pendingChallenge && (
                        <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 via-[#7B2FFE]/10 to-[#00FF85]/10 backdrop-blur-sm border border-[#3B82F6]/20 relative group">
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-[#7B2FFE]/5 to-[#00FF85]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                            
                            <div className="relative rounded-xl bg-black/20 p-4">
                                <div className="flex items-center justify-center relative py-2">
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#7B2FFE] to-[#00FF85] mb-4">
                                            Challenge Pending
                                        </h3>
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-[#3B82F6] animate-bounce" 
                                                style={{ animationDelay: '0ms' }} />
                                            <div className="w-3 h-3 rounded-full bg-[#7B2FFE] animate-bounce" 
                                                style={{ animationDelay: '150ms' }} />
                                            <div className="w-3 h-3 rounded-full bg-[#00FF85] animate-bounce" 
                                                style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Incoming Challenges */}
                    {incomingChallenges.length > 0 && (
                        <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#FF5AAF]/10 via-[#FF8ADF]/10 to-[#FFB4E1]/10 backdrop-blur-sm border border-[#FF5AAF]/20 relative group">
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5AAF]/5 via-[#FF8ADF]/5 to-[#FFB4E1]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                            
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 items-center gap-2 rounded-full bg-[#FF5AAF]/20 px-3">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5AAF] opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF5AAF]"></span>
                                        </span>
                                        <span className="text-sm font-medium text-[#FF5AAF]">Live Challenges</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {incomingChallenges.map(challenge => (
                                    <div
                                        key={challenge.id}
                                        className="group/card relative rounded-xl bg-gradient-to-r from-[#FF5AAF]/5 to-transparent p-[1px] transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF5AAF]/20 to-transparent opacity-0 blur transition-opacity duration-300 group-hover/card:opacity-100" />
                                        
                                        <div className="relative rounded-xl bg-black/20 p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute -inset-1 animate-spin-slow rounded-xl bg-gradient-to-r from-[#FF5AAF] via-[#FF8ADF] to-[#FF5AAF] opacity-0 blur transition-opacity duration-300 group-hover/card:opacity-75" />
                                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-black font-bold text-white">
                                                            {challenge.player2.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-white">
                                                                {challenge.player2.username}
                                                            </h3>
                                                            <span className="inline-flex items-center rounded-full bg-[#FF5AAF]/10 px-2 py-0.5 text-xs font-medium text-[#FF5AAF]">
                                                                Challenger
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-sm text-white/60">
                                                            Wants to start a game with you
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => respondToChallenge(challenge.id, true)}
                                                        className="group/accept relative overflow-hidden w-12 h-12 rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-[#FF5AAF]/60 focus:ring-offset-2 focus:ring-offset-black"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF5AAF] to-[#FF8ADF] transition-all duration-300 group-hover/accept:opacity-100 group-hover/accept:animate-pulse" />
                                                        <div className="relative h-full w-full rounded-xl bg-black flex items-center justify-center transition-all duration-300 group-hover/accept:bg-opacity-90">
                                                            <svg className="w-6 h-6 text-[#FF5AAF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => respondToChallenge(challenge.id, false)}
                                                        className="w-12 h-12 rounded-xl border border-white/10 hover:border-[#FF5AAF]/20 hover:bg-[#FF5AAF]/5 
                                                            transition-all duration-300 flex items-center justify-center group/decline"
                                                    >
                                                        <svg className="w-6 h-6 text-white/60 group-hover/decline:text-[#FF5AAF] transition-colors duration-300" 
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <style jsx>{`
                                @keyframes spin-slow {
                                    from {
                                        transform: rotate(0deg);
                                    }
                                    to {
                                        transform: rotate(360deg);
                                    }
                                }
                                .animate-spin-slow {
                                    animation: spin-slow 8s linear infinite;
                                }
                            `}</style>
                        </div>
                    )}

                    {/* Available Players Section */}
                    {isSearching && (
                        <div className="w-full p-8 rounded-2xl bg-gradient-to-br from-[#3B82F6]/10 via-[#7B2FFE]/10 to-[#00FF85]/10 backdrop-blur-sm border border-[#3B82F6]/20 relative group">
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-[#7B2FFE]/5 to-[#00FF85]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                            
                            {/* Header with animated border */}
                            <div className="relative mb-8">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#7B2FFE] to-[#00FF85] inline-block">
                                    Available Players
                                </h2>
                                <div className="h-1 w-full bg-gradient-to-r from-[#3B82F6] via-[#7B2FFE] to-[#00FF85] mt-2 rounded-full opacity-50" />
                            </div>

                            <div className="space-y-4 relative">
                                {availablePlayers.length === 0 ? (
                                    <div className="text-center py-16 px-4">
                                        <div className="w-20 h-20 mx-auto mb-6 relative">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#00FF85] animate-ping opacity-20" />
                                            <div className="relative w-full h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#00FF85] flex items-center justify-center">
                                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-lg mb-3">No players available</div>
                                        <div className="text-gray-400 text-sm">Waiting for other players to join...</div>
                                    </div>
                                ) : (
                                    availablePlayers
                                        .filter(player => player.id !== user.id)
                                        .map(player => (
                                            <div
                                                key={player.id}
                                                className="p-6 rounded-xl bg-gradient-to-r from-white/[0.05] to-white/[0.1] border border-white/10 
                                                    hover:border-white/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl 
                                                    hover:shadow-[#3B82F6]/10 group/card relative overflow-hidden"
                                            >
                                                {/* Hover Glow Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/0 via-[#7B2FFE]/10 to-[#00FF85]/0 
                                                    opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                                                
                                                <div className="flex items-center justify-between relative">
                                                    <div className="flex items-center space-x-6">
                                                        {/* Avatar with animated border */}
                                                        <div className="relative group/avatar">
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6] via-[#7B2FFE] to-[#00FF85] 
                                                                rounded-full opacity-70 group-hover/avatar:opacity-100 blur-sm transition-opacity duration-300" />
                                                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#7B2FFE] to-[#00FF85] 
                                                                p-[2px] transition-transform duration-300 transform group-hover/avatar:scale-110">
                                                                <div className="w-full h-full rounded-full bg-[#0A0F1C] flex items-center justify-center 
                                                                    text-white text-xl font-bold border border-white/10">
                                                                    {player.username.charAt(0).toUpperCase()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h3 className="text-white text-lg font-semibold tracking-wide mb-1">
                                                                {player.username}
                                                            </h3>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                                <p className="text-gray-400 text-sm">Online & Ready</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => requestMatch(player.id)}
                                                        disabled={pendingChallenge !== null}
                                                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 relative group/button
                                                            ${pendingChallenge?.player2?.id === player.id || pendingChallenge !== null
                                                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-[#3B82F6] via-[#7B2FFE] to-[#00FF85] text-white hover:shadow-lg hover:shadow-[#3B82F6]/25'
                                                            }`}
                                                    >
                                                        {/* Button Shine Effect */}
                                                        {!pendingChallenge && (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent 
                                                                translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
                                                        )}
                                                        <span className="relative z-10">
                                                            {pendingChallenge?.player2?.id === player.id ? 'Challenge Sent' : 'Challenge'}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add keyframe animations */}
            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(0px) translate(
                            ${mousePosition.x * 0.02}px, 
                            ${mousePosition.y * 0.02}px
                        );
                    }
                    50% {
                        transform: translateY(-100px) translate(
                            ${mousePosition.x * 0.02}px, 
                            ${mousePosition.y * 0.02}px
                        );
                    }
                    100% {
                        transform: translateY(0px) translate(
                            ${mousePosition.x * 0.02}px, 
                            ${mousePosition.y * 0.02}px
                        );
                    }
                }
                @keyframes pulse {
                    0% {
                        opacity: 0.4;
                        transform: scale(1) translate(var(--mouse-x, 0), var(--mouse-y, 0));
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.1) translate(var(--mouse-x, 0), var(--mouse-y, 0));
                    }
                    100% {
                        opacity: 0.4;
                        transform: scale(1) translate(var(--mouse-x, 0), var(--mouse-y, 0));
                    }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(10px, -10px); }
                }
                @keyframes tilt {
                    0%, 100% { transform: rotate(-1deg); }
                    50% { transform: rotate(1deg); }
                }
                @keyframes gradient-x {
                    0% { background-size: 200% 100%; background-position: left center; }
                    50% { background-size: 200% 100%; background-position: right center; }
                    100% { background-size: 200% 100%; background-position: left center; }
                }
                .animate-float-slow {
                    animation: float-slow 3s ease-in-out infinite;
                }
                .animate-tilt {
                    animation: tilt 10s ease-in-out infinite;
                }
                .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                }
            `}</style>
        </div>
    );
};

export default TicTacToeMatchmaking; 