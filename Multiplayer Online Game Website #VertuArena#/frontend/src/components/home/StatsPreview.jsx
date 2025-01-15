import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import { DefaultAvatar } from '../DefaultAvatar';

const LeaderboardRow = ({ rank, username, score, avatar }) => (
  <div className="flex items-center justify-between py-2 px-4 hover:bg-white/5 rounded-lg transition-colors duration-300">
    <div className="flex items-center gap-4">
      <span className="text-white/60 w-6">{rank}</span>
      <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10">
        {avatar ? (
          <img src={avatar} alt={username} className="w-full h-full object-cover" />
        ) : (
          <DefaultAvatar 
            name={username} 
            size="sm" 
            className="w-full h-full"
          />
        )}
      </div>
      <span className="text-white font-medium">{username}</span>
    </div>
    <span className="text-white/80">{score}</span>
  </div>
);

const QueuePreview = () => {
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Simulate queue size changes
    const interval = setInterval(() => {
      setQueueSize(Math.floor(Math.random() * 10) + 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-6 rounded-xl backdrop-blur-lg bg-white/5 border border-white/10">
      <h3 className="text-xl font-bold mb-4 text-white">
        Current Matchmaking Queue
      </h3>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-300">Players in Queue:</div>
        <div className="text-2xl font-bold text-primary-pink">{queueSize}</div>
      </div>
      <Link
        to="/matchmaking"
        className="block w-full py-3 text-center text-white font-semibold rounded-lg bg-gradient-to-r from-primary-pink to-primary-blue hover:from-primary-blue hover:to-primary-pink transition-all duration-500"
      >
        Join Matchmaking
      </Link>
    </div>
  );
};

export const StatsPreview = () => {
  const topPlayers = [
    { rank: 1, username: "ProGamer123", score: 2500, avatar: "/images/avatars/1.jpg" },
    { rank: 2, username: "GameMaster", score: 2350, avatar: "/images/avatars/2.jpg" },
    { rank: 3, username: "PixelWarrior", score: 2200, avatar: "/images/avatars/3.jpg" },
    { rank: 4, username: "LegendPlayer", score: 2100, avatar: "/images/avatars/4.jpg" },
    { rank: 5, username: "VirtualHero", score: 2000, avatar: "/images/avatars/5.jpg" },
  ];

  return (
    <div className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
              Top Players
            </h2>
            <div className="space-y-2">
              {topPlayers.map((player) => (
                <LeaderboardRow key={player.rank} {...player} />
              ))}
            </div>
            <Link
              to="/leaderboard"
              className="inline-block mt-6 px-6 py-2 text-white rounded-lg border-2 border-primary-pink/50 hover:border-primary-pink transition-all duration-300"
            >
              <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
                View Full Leaderboard
              </span>
            </Link>
          </div>

          {/* Queue Preview */}
          <div>
            <QueuePreview />
          </div>
        </div>
      </div>
    </div>
  );
}; 