import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { DefaultAvatar } from '../components/DefaultAvatar';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8001';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getRankFromScore = (score) => {
  if (score >= 2000) return { name: 'Diamond', icon: '💎', level: 6 };
  if (score >= 1500) return { name: 'Platinum', icon: '🌟', level: 5 };
  if (score >= 1000) return { name: 'Gold', icon: '🏆', level: 4 };
  if (score >= 500) return { name: 'Silver', icon: '⚔️', level: 3 };
  if (score >= 200) return { name: 'Bronze', icon: '🥋', level: 2 };
  return { name: 'Rookie', icon: '🎮', level: 1 };
};

const getRankObject = (rank) => {
  switch (rank) {
    case 'Diamond':
      return { name: 'Diamond', icon: '💎', level: 6 };
    case 'Platinum':
      return { name: 'Platinum', icon: '🌟', level: 5 };
    case 'Gold':
      return { name: 'Gold', icon: '🏆', level: 4 };
    case 'Silver':
      return { name: 'Silver', icon: '⚔️', level: 3 };
    case 'Bronze':
      return { name: 'Bronze', icon: '🥋', level: 2 };
    default:
      return { name: 'Rookie', icon: '🎮', level: 1 };
  }
};

const LeaderboardContent = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/leaderboard');
        if (response.data.players) {
          setPlayers(response.data.players);
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
              <div className="flex gap-4">
                <div className="h-6 bg-white/10 rounded w-16" />
                <div className="h-6 bg-white/10 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {players.map((player, index) => {
      const rank = getRankFromScore(player.score);
      return (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-pink to-primary-blue opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="relative backdrop-blur-lg bg-white/5 p-4 md:p-6 rounded-xl border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Player Avatar and Info */}
              <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10">
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
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white group-hover:text-primary-pink transition-colors duration-300">
                      {index + 1}.
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-pink transition-colors duration-300 truncate">
                      {player.username}
                    </h3>
                    {index < 3 && (
                      <span className="text-2xl">
                        {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <span>{rank.icon}</span>
                    <span>{rank.name}</span>
                    {player.streak > 0 && (
                      <span className="ml-2">🔥 {player.streak} streak</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Stats */}
              <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-between md:justify-end">
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-white">
                    {player.gamesPlayed}
                  </div>
                  <div className="text-sm text-gray-400">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-white">
                    {player.wins}
                  </div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-white">
                    {player.winRate}%
                  </div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-white">
                    {player.score}
                  </div>
                  <div className="text-sm text-gray-400">Score</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
      })}
    </div>
  );
};

const getAchievements = (stats) => {
  const achievements = [
    {
      name: 'First Victory',
      icon: '🏆',
      description: 'Win your first game',
      unlocked: stats.wins > 0,
      progress: Math.min(stats.wins, 1),
      total: 1
    },
    {
      name: 'Veteran',
      icon: '⚔️',
      description: 'Play 50 games',
      unlocked: stats.gamesPlayed >= 50,
      progress: Math.min(stats.gamesPlayed, 50),
      total: 50
    },
    {
      name: 'Win Streak',
      icon: '🔥',
      description: 'Win 5 games in a row',
      unlocked: stats.streak >= 5,
      progress: Math.min(stats.streak, 5),
      total: 5
    },
    {
      name: 'Champion',
      icon: '👑',
      description: 'Win 100 games',
      unlocked: stats.wins >= 100,
      progress: Math.min(stats.wins, 100),
      total: 100
    },
    {
      name: 'Perfectionist',
      icon: '💯',
      description: 'Achieve 70% win rate',
      unlocked: parseFloat(stats.winRate) >= 70,
      progress: Math.min(parseFloat(stats.winRate), 70),
      total: 70
    },
    {
      name: 'Elite',
      icon: '💎',
      description: 'Reach Diamond rank',
      unlocked: stats.score >= 2000,
      progress: Math.min(stats.score, 2000),
      total: 2000
    }
  ];

  return achievements;
};

const AchievementsContent = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/player-stats/my-stats');
        
        if (response.data) {
          const stats = response.data;
          const gamesPlayed = parseInt(stats.games_played) || 0;
          const wins = parseInt(stats.games_won) || 0;
          const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : 0;
          
          // Calculate score
          const winScore = wins * 50;
          const streakBonus = (stats.current_streak || 0) * 10;
          const winRateBonus = parseFloat(winRate);
          const experienceBonus = gamesPlayed * 5;
          const totalScore = winScore + streakBonus + winRateBonus + experienceBonus;

          const playerStats = {
            gamesPlayed,
            wins,
            streak: stats.current_streak || 0,
            winRate,
            score: totalScore
          };

          setAchievements(getAchievements(playerStats));
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 h-32"
          >
            <div className="flex flex-col h-full">
              <div className="h-6 bg-white/10 rounded w-1/2 mb-2" />
              <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
              <div className="mt-auto h-2 bg-white/10 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`group relative overflow-hidden backdrop-blur-lg bg-white/5 p-6 rounded-xl border ${
            achievement.unlocked ? 'border-primary-gold' : 'border-white/10'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-pink to-primary-blue opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{achievement.icon}</span>
              <h3 className={`text-lg font-bold ${
                achievement.unlocked ? 'text-primary-gold' : 'text-white'
              }`}>
                {achievement.name}
              </h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
            <div className="relative h-2 bg-white/10 rounded overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`absolute inset-0 ${
                  achievement.unlocked ? 'bg-primary-gold' : 'bg-primary-pink'
                }`}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">
              {achievement.progress}/{achievement.total}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const RANKS = [
  { name: 'Rookie', icon: '🎮', minScore: 0, color: 'gray' },
  { name: 'Bronze', icon: '🥋', minScore: 200, color: 'amber' },
  { name: 'Silver', icon: '⚔️', minScore: 500, color: 'blue' },
  { name: 'Gold', icon: '🏆', minScore: 1000, color: 'yellow' },
  { name: 'Platinum', icon: '🌟', minScore: 1500, color: 'purple' },
  { name: 'Diamond', icon: '💎', minScore: 2000, color: 'cyan' }
];

const RankCircle = ({ rank, isOpen, isCurrent, score }) => {
  const getCircleClasses = () => {
    const baseClasses =
      'w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 relative group transform hover:scale-105';

    if (isCurrent) {
      return `${baseClasses} border-4 border-primary-pink shadow-xl shadow-primary-pink/30 animate-pulse bg-gradient-to-br from-primary-pink/20 to-primary-blue/20`;
    }
    if (isOpen) {
      return `${baseClasses} border-2 border-primary-gold shadow-lg shadow-primary-gold/20 bg-gradient-to-br from-primary-gold/10 to-transparent`;
    }
    return `${baseClasses} border-2 border-white/10 bg-black/40 filter grayscale`;
  };

  const getTextClasses = () => {
    if (isCurrent) return 'text-primary-pink drop-shadow-glow';
    if (isOpen) return 'text-primary-gold';
    return 'text-white/30';
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Connecting line between circles */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 left-[-1.5rem] sm:left-[-2rem] lg:left-[-2.5rem] h-[3px] bg-gradient-to-r ${
          isOpen || isCurrent
            ? 'from-primary-pink via-primary-gold to-primary-pink'
            : 'from-transparent via-gray-600 to-transparent'
        } opacity-${isOpen || isCurrent ? '100' : '50'} rounded-full transition-all duration-300 z-[-1]
        ${
          isOpen || isCurrent
            ? 'w-8 sm:w-12 lg:w-16'
            : 'w-6 sm:w-8 lg:w-12'
        }`}
      />

      <div className={getCircleClasses()}>
        {/* Glowing background effect */}
        {isCurrent && (
          <div className="absolute inset-0 rounded-full bg-primary-pink/10 filter blur-md z-[-1]" />
        )}

        {/* Glass effect background */}
        <div className="absolute inset-0 rounded-full backdrop-blur-sm bg-black/20 z-[-1]" />

        <div className={`relative flex flex-col items-center ${getTextClasses()}`}>
          <span className="text-3xl mb-1">{isOpen ? rank.icon : '🔒'}</span>
          <span className="text-sm font-bold tracking-wider">{rank.name}</span>
        </div>

        {/* Enhanced tooltip */}
        <div className="absolute top-[-5rem] left-1/2 transform -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100 pointer-events-none z-20">
          <div className="bg-black/90 backdrop-blur-md text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-white/10">
            <div className="font-semibold mb-1">
              {isOpen ? (
                isCurrent ? '🎯 Current Rank' : '✨ Previous Rank'
              ) : (
                `🔓 Unlock at ${rank.minScore} points`
              )}
            </div>
            <div className="text-gray-400 text-[10px]">
              {isOpen
                ? isCurrent
                  ? 'Keep playing to rank up!'
                  : 'You\'ve mastered this rank'
                : `Need ${rank.minScore - score} more points`}
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="w-3 h-3 bg-black/90 transform rotate-45 absolute -bottom-[6px] left-1/2 -translate-x-1/2 border-r border-b border-white/10" />
        </div>
      </div>

      {/* Progress bar for current rank */}
      {isCurrent && (
        <div className="w-36 h-2 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-primary-pink via-primary-gold to-primary-pink animate-gradient-x"
            style={{
              width: `${Math.min(
                ((score - rank.minScore) /
                  (rank.name === 'Diamond'
                    ? 500
                    : RANKS[RANKS.findIndex((r) => r.name === rank.name) + 1]
                        .minScore - rank.minScore)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

const RankCircles = ({ score, currentRankName }) => {
  const currentRankIndex = RANKS.findIndex(rank => rank.name === currentRankName);
  
  return (
    <div className="w-full pb-8 pt-4">
      {/* Responsive wrapper for circles */}
      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 px-4 overflow-x-auto min-h-[200px] pb-12">
        {RANKS.map((rank, index) => (
          <RankCircle
            key={rank.name}
            rank={rank}
            isOpen={index <= currentRankIndex}
            isCurrent={rank.name === currentRankName}
            score={score}
          />
        ))}
      </div>
    </div>
  );
};

const RanksContent = ({ playerStats }) => {
  const [rankHistory, setRankHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankHistory = async () => {
      try {
        const response = await axios.get('/api/player-stats/my-stats');
        if (response.data && response.data.stats) {
          setRankHistory({
            current_rank: response.data.stats.rank || 0,
            peak_rank: response.data.stats.peak_rank || 0,
            current_streak: response.data.stats.current_streak || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching rank history:', error);
        toast.error('Failed to load rank history');
      } finally {
        setLoading(false);
      }
    };

    if (playerStats) {
      setRankHistory({
        current_rank: playerStats.ranks.current || 'Rookie',
        peak_rank: playerStats.ranks.peak || 'Rookie',
        current_streak: playerStats.ranks.streak || 0,
        games_played: playerStats.overview.gamesPlayed || 0,
        games_won: playerStats.overview.wins || 0,
        games_lost: playerStats.overview.losses || 0
      });
      setLoading(false);
    } else {
      fetchRankHistory();
    }
  }, [playerStats]);

  if (loading || !rankHistory) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 h-32"
            >
              <div className="h-8 bg-white/10 rounded w-1/2 mb-4" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="h-32 bg-white/5 rounded-xl" />
      </div>
    );
  }

  // Calculate score based on stats
  const score = (rankHistory.games_won * 50) + // Win points
               (rankHistory.current_streak * 10) + // Streak bonus
               (rankHistory.games_played > 0 
                 ? Math.round((rankHistory.games_won / rankHistory.games_played) * 100) 
                 : 0) + // Win rate bonus
               (rankHistory.games_played * 5); // Experience bonus

  // Get current rank from playerStats.ranks.current
  const currentRank = playerStats?.ranks?.current ? getRankObject(playerStats.ranks.current) : getRankFromScore(score);

  return (
    <div className="space-y-10 overflow-y-auto max-h-[calc(100vh-6rem)] pb-8">
      {/* Current Rank Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center rounded-full backdrop-blur-lg bg-gradient-to-br from-primary-pink/30 to-primary-blue/20 border-4 border-primary-pink shadow-lg hover:shadow-xl transition-transform hover:scale-105"
        >
          <div className="flex flex-col items-center">
            <div className="text-6xl text-primary-pink group-hover:scale-110 transition-transform">
              {currentRank.icon}
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {currentRank.name}
            </div>
            <div className="text-sm text-gray-300 mt-1">Your Current Rank</div>
          </div>
        </motion.div>
      </div>
  
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-12">
        {/* Rank Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center text-center p-4 rounded-xl backdrop-blur-md bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-primary-blue/50 shadow-md hover:shadow-lg transition-transform group hover:scale-105"
        >
          <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
            📈
          </div>
          <div className="text-xl font-bold text-white">
            {score.toLocaleString()}
          </div>
          <div className="text-sm text-gray-300">Rank Points</div>
        </motion.div>
  
        {/* Current Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center text-center p-4 rounded-xl backdrop-blur-md bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-primary-blue/50 shadow-md hover:shadow-lg transition-transform group hover:scale-105"
        >
          <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
            🔥
          </div>
          <div className="text-xl font-bold text-white">
            {rankHistory.current_streak}
          </div>
          <div className="text-sm text-gray-300">Current Streak</div>
        </motion.div>
      </div>
  
      {/* Rank Progression Section */}
      <div className="mt-6 overflow-x-auto">
        <h3 className="text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary-pink to-primary-gold tracking-wide mb-8 px-4">
          Rank Progression
        </h3>
        <RankCircles score={score} currentRankName={currentRank.name} />
      </div>
    </div>
  );
};

export const Stats = () => {
  const [currentSection, setCurrentSection] = useState('overview');
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please log in to view your statistics');
          logout();
          navigate('/auth');
          return;
        }

        const response = await axios.get('/api/player-stats/my-stats');
        console.log('API Response:', response.data); // Debug log

        if (!response.data) {
          toast.error('No statistics available');
          setLoading(false);
          return;
        }

        // Extract stats from response
        const stats = response.data;
        
        // Ensure we have valid numbers
        const gamesPlayed = parseInt(stats.games_played) || 0;
        const wins = parseInt(stats.games_won) || 0;
        const losses = parseInt(stats.games_lost) || 0;
        
        // Calculate win rate
        const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : 0;

        console.log('Win Rate:', winRate); // Debug log

        const statsData = {
          overview: {
            gamesPlayed,
            wins,
            losses,
            winRate: `${winRate}%`
          },
          ranks: {
            current: getRankFromScore(stats.score).name || 'Unranked',
            peak: getRankFromScore(stats.score).name || 'Unranked',
            streak: stats.current_streak || 0
          },
          achievements: getAchievements({
            gamesPlayed,
            wins,
            streak: stats.current_streak || 0,
            winRate,
            score: stats.score
          })
        };

        setPlayerStats(statsData);
      } catch (error) {
        console.error('Error fetching stats:', error.response?.data || error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, logout, navigate]);

  const getRankName = (rank) => {
    if (!rank) return 'Unranked';
    if (rank < 1000) return 'Bronze';
    if (rank < 2000) return 'Silver';
    if (rank < 3000) return 'Gold';
    if (rank < 4000) return 'Platinum';
    return 'Diamond';
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 'Diamond': return '💎';
      case 'Platinum': return '🌟';
      case 'Gold': return '👑';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥋';
      default: return '🎯';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">🔒</div>
          <div className="text-xl">Please Log In</div>
          <div className="text-sm mt-2">Log in to view your game statistics</div>
          <Link to="/auth" className="mt-4 inline-block px-4 py-2 bg-primary-pink text-white rounded-lg hover:bg-opacity-90 transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-pink"></div>
      </div>
    );
  }

  if (!playerStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-xl">No statistics available</div>
          <div className="text-sm mt-2">Play some games to see your stats!</div>
        </div>
      </div>
    );
  }

  const sections = {
    overview: {
      title: 'Performance Overview',
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="relative group h-[200px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-pink to-primary-blue opacity-10 rounded-xl group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-4xl">🎮</div>
                <div className="text-3xl font-bold text-white">
                  {playerStats.overview.gamesPlayed}
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-lg font-semibold text-white">Games</div>
                <div className="text-sm text-gray-400">Total games played</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group h-[200px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-primary-green opacity-10 rounded-xl group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-4xl">🏆</div>
                <div className="text-3xl font-bold text-white">
                  {playerStats.overview.wins}
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-lg font-semibold text-white">Wins</div>
                <div className="text-sm text-gray-400">Total victories</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group h-[200px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-green to-primary-gold opacity-10 rounded-xl group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-4xl">💫</div>
                <div className="text-3xl font-bold text-white">
                  {playerStats.overview.losses}
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-lg font-semibold text-white">Losses</div>
                <div className="text-sm text-gray-400">Total defeats</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group h-[200px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-gold to-primary-pink opacity-10 rounded-xl group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="text-4xl">📈</div>
                <div className="text-3xl font-bold text-white">
                  {playerStats.overview.winRate}
                </div>
              </div>
              <div className="mt-auto">
                <div className="text-lg font-semibold text-white">Win Rate</div>
                <div className="text-sm text-gray-400">Victory percentage</div>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    ranks: {
      title: 'Current Rankings',
      content: <RanksContent playerStats={playerStats} />
    },
    achievements: {
      title: 'Achievements',
      content: <AchievementsContent />
    },
    leaderboard: {
      title: 'Global Rankings',
      content: <LeaderboardContent />
    }
  };

  return (
    <div className="relative h-full flex">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-pink via-primary-blue to-primary-gold opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform-origin:0_0] scale-[1] animate-grid" />
      </div>

      {/* Sidebar Navigation */}
      <div className="relative z-10 w-24 md:w-32 bg-black/50 backdrop-blur-xl border-r border-white/10">
        <div className="h-full flex flex-col items-center justify-center gap-8">
          {Object.entries(sections).map(([id, section]) => (
            <button
              key={id}
              onClick={() => setCurrentSection(id)}
              className={`group flex flex-col items-center gap-2 p-2 w-full transition-all duration-300
                ${currentSection === id ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                ${currentSection === id ? 'bg-gradient-to-br from-primary-pink to-primary-blue' : 'bg-white/5'}`}>
                {id === 'overview' && '📊'}
                {id === 'ranks' && '👑'}
                {id === 'achievements' && '🏆'}
                {id === 'leaderboard' && '🌟'}
              </div>
              <span className="text-xs text-white opacity-60 group-hover:opacity-100">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <h2 className="text-4xl font-bold mb-8 mt-20 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
              {sections[currentSection].title}
            </h2>
            {sections[currentSection].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}; 