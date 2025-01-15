import { useState } from 'react';

const AchievementBadge = ({ achievement, unlocked }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`
        w-20 h-20 rounded-full flex items-center justify-center
        transition-all duration-300
        ${unlocked 
          ? 'bg-gradient-to-r from-[#FF5AAF]/20 to-[#60B5FF]/20 border-2 border-[#FF5AAF]/50 group-hover:shadow-[0_0_20px_rgba(255,90,175,0.3)]' 
          : 'bg-gray-800/50 border-2 border-gray-700'
        }
      `}>
        <div className="text-3xl">
          {achievement.icon}
        </div>
        
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className={`
        absolute -top-16 left-1/2 transform -translate-x-1/2 w-48
        bg-black/90 backdrop-blur-lg rounded-lg p-3 text-center
        transition-all duration-300 pointer-events-none
        ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}>
        <p className="text-white font-semibold">{achievement.name}</p>
        <p className="text-sm text-white/60">{achievement.description}</p>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90" />
      </div>
    </div>
  );
};

export const Achievements = ({ achievements = [] }) => {
  // Example achievements data
  const defaultAchievements = [
    {
      id: 1,
      name: 'First Victory',
      description: 'Win your first game',
      icon: '🏆',
      unlocked: true
    },
    {
      id: 2,
      name: 'Rising Star',
      description: 'Reach rank 10',
      icon: '⭐',
      unlocked: true
    },
    {
      id: 3,
      name: 'Champion',
      description: 'Win 100 games',
      icon: '👑',
      unlocked: false
    },
    {
      id: 4,
      name: 'Veteran',
      description: 'Play 500 games',
      icon: '🎮',
      unlocked: false
    },
    {
      id: 5,
      name: 'Legend',
      description: 'Reach the highest rank',
      icon: '🌟',
      unlocked: false
    }
  ];

  const allAchievements = [...defaultAchievements, ...achievements];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-8 text-center relative inline-block">
        Achievements
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF5AAF] to-[#60B5FF]" />
      </h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 justify-items-center">
        {allAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={achievement.unlocked}
          />
        ))}
      </div>
    </div>
  );
}; 