import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DefaultAvatar } from '../components/DefaultAvatar';

const LeaderboardCard = ({ player, rank }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-amber-600 to-amber-700';
      default: return 'from-primary-pink to-primary-blue';
    }
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(rank)} opacity-0 group-hover:opacity-20 rounded-2xl transition-all duration-300`} />
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-2xl
          hover:border-primary-pink/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Rank */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/30 text-2xl">
              {getRankEmoji(rank)}
            </div>

            {/* Player Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10">
                {player.avatar ? (
                  <img
                    src={player.avatar}
                    alt={player.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DefaultAvatar 
                    name={player.username} 
                    size="lg" 
                    className="w-full h-full"
                  />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary-pink transition-colors duration-300">
                  {player.username}
                </h3>
                <div className="text-sm text-gray-400">
                  Level {player.level}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{player.wins}</div>
              <div className="text-sm text-gray-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{player.winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{player.score}</div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
          </div>
        </div>

        {/* Expanded Stats (visible on hover) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4"
            >
              <div className="text-center">
                <div className="text-sm text-gray-400">Games</div>
                <div className="text-lg font-bold text-white">{player.gamesPlayed}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Best Streak</div>
                <div className="text-lg font-bold text-white">{player.bestStreak}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Avg. Score</div>
                <div className="text-lg font-bold text-white">{player.avgScore}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">Rank</div>
                <div className="text-lg font-bold text-white">{player.rank}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, month, week

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/leaderboard?timeframe=${timeframe}`);
        setPlayers(response.data.players);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [timeframe]);

  const timeframeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <ParticleBackground />
      <div className="container mx-auto px-4 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            🏆 Leaderboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Top players competing for glory
          </motion.p>
        </div>

        {/* Timeframe Selection */}
        <div className="flex justify-center gap-4 mb-8">
          {timeframeOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeframe(option.value)}
              className={`px-6 py-3 rounded-xl transition-all duration-300
                ${timeframe === option.value
                  ? 'bg-gradient-to-r from-primary-pink to-primary-blue text-white shadow-lg shadow-primary-pink/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10" />
                      <div>
                        <div className="w-32 h-6 bg-white/10 rounded" />
                        <div className="w-24 h-4 bg-white/10 rounded mt-2" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="w-16 h-6 bg-white/10 rounded" />
                        <div className="w-12 h-4 bg-white/10 rounded mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            players.map((player, index) => (
              <LeaderboardCard
                key={player.id}
                player={player}
                rank={index + 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 