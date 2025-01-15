import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ParticleBackground } from '../components/ParticleBackground';
import { DefaultAvatar } from '../components/DefaultAvatar';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

// Add response interceptor for unauthorized access
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

const ProfileHero = ({ user, stats }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { login } = useAuth();
  const fileInputRef = useRef(null);

  const calculateWinRate = () => {
    const gamesPlayed = parseInt(stats?.games_played) || 0;
    const gamesWon = parseInt(stats?.games_won) || 0;
    
    if (gamesPlayed === 0) return '0%';
    const winRate = (gamesWon / gamesPlayed) * 100;
    return `${winRate.toFixed(1)}%`;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      toast.loading('Uploading avatar...', { id: 'avatarUpload' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await axios.post('/api/profile/update', { avatar: reader.result });
          if (response.data.user) {
            login({ ...response.data.user, token: user.token });
            toast.success('Avatar updated successfully!', { id: 'avatarUpload' });
          }
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to update avatar', { id: 'avatarUpload' });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process image', { id: 'avatarUpload' });
    }
  };

  return (
    <div className="relative w-full flex flex-col md:flex-row items-center justify-between gap-8 p-8">
      <div className="flex items-center gap-8">
        {/* Avatar */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`w-32 h-32 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-black transition-all duration-300
            ${isHovered ? 'ring-primary-pink shadow-[0_0_30px_rgba(236,72,153,0.5)]' : 'ring-primary-blue'}`}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <DefaultAvatar 
                name={user?.name} 
                size="2xl" 
                className="w-full h-full"
              />
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center cursor-pointer"
                onClick={handleAvatarClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* User Info */}
        <div className="text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {user?.username || 'Player'}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-4"
          >
            <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-primary-pink font-medium">Rank:</span>
              <span className="ml-2 text-white font-bold">{stats?.rank || 'Unranked'}</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <span className="text-primary-blue font-medium">Level:</span>
              <span className="ml-2 text-white font-bold">{stats?.level || 1}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-6">
        {[
          { label: 'Games', value: parseInt(stats?.games_played) || 0, icon: '🎮' },
          { label: 'Wins', value: parseInt(stats?.games_won) || 0, icon: '🏆' },
          { label: 'Win Rate', value: calculateWinRate(), icon: '📈' }
        ].map((stat, index) => (
  <motion.div
            key={stat.label}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const EditProfileSection = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/profile/update', 
        {
          username: formData.username,
          email: formData.email
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.user) {
        login({ ...response.data.user, token: user.token });
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-8 rounded-2xl backdrop-blur-lg bg-white/5 border border-white/10"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl">⚙️</span>
          Profile Settings
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl transition-all duration-300 ${
            isEditing 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={!isEditing}
            className={`mt-1 block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-gray-500 transition-all duration-300
              ${isEditing 
                ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                : 'opacity-75 cursor-not-allowed'}`}
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className={`mt-1 block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-gray-500 transition-all duration-300
              ${isEditing 
                ? 'focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                : 'opacity-75 cursor-not-allowed'}`}
            placeholder="Enter your email"
          />
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
            >
              Save Changes
            </motion.button>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

const getRankFromScore = (score) => {
  if (score >= 2000) return { name: 'Diamond', icon: '💎', level: 6 };
  if (score >= 1500) return { name: 'Platinum', icon: '🌟', level: 5 };
  if (score >= 1000) return { name: 'Gold', icon: '🏆', level: 4 };
  if (score >= 500) return { name: 'Silver', icon: '⚔️', level: 3 };
  if (score >= 200) return { name: 'Bronze', icon: '🥋', level: 2 };
  return { name: 'Rookie', icon: '🎮', level: 1 };
};

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    games_played: 0,
    games_won: 0,
    games_lost: 0,
    rank: 'Unranked',
    level: 1,
    current_streak: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/player-stats/my-stats');
        console.log('Stats response:', response.data); // Debug log
        
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
          
          // Get rank based on score
          const rank = getRankFromScore(totalScore);
          
          setStats({
            games_played: gamesPlayed,
            games_won: wins,
            games_lost: parseInt(stats.games_lost) || 0,
            win_rate: `${winRate}%`,
            rank: `${rank.icon} ${rank.name}`,
            level: rank.level,
            current_streak: stats.current_streak || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch player stats:', error.response?.data || error);
        toast.error('Failed to load player statistics');
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <ParticleBackground />
      <div className="container mx-auto px-4 py-8 mt-16">
        <ProfileHero user={user} stats={stats} />
        <EditProfileSection user={user} />
      </div>
    </div>
  );
};