import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Navbar } from './components/Navbar';
import { useAuth } from './contexts/AuthContext';
import { Leaderboard } from './pages/Leaderboard';
import { Games } from './pages/Games';
import TicTacToe from './components/game/TicTacToe';

// Import matchmaking components
import TicTacToeMatchmaking from './pages/matchmaking/TicTacToeMatchmaking';

// Import ResetPassword component
import { ResetPassword } from './pages/ResetPassword';

// Debug component
const DebugRoute = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Debug Route</h1>
        <p>This route exists!</p>
      </div>
    </div>
  );
};

// Wrapper component for TicTacToe to handle params
const TicTacToeGame = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  return <TicTacToe gameId={gameId} currentUser={user} />;
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app min-h-screen bg-black">
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/auth" state={{ from: '/profile' }} replace />} 
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/games" element={<Games />} />
        
        {/* Debug Route */}
        <Route path="/debug" element={<DebugRoute />} />
        
        {/* Game Routes */}
        <Route 
          path="/matchmaking/tic-tac-toe" 
          element={user ? <TicTacToeMatchmaking /> : <Navigate to="/auth" state={{ from: '/matchmaking/tic-tac-toe' }} replace />} 
        />
        <Route 
          path="/game/:gameId" 
          element={user ? <TicTacToeGame /> : <Navigate to="/auth" state={{ from: window.location.pathname }} replace />} 
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App; 