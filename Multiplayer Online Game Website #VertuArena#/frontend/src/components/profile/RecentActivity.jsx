import { useState } from 'react';

const ActivityItem = ({ activity }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'win':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'loss':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rank_up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div
      className="relative flex items-center space-x-4 p-4 rounded-lg bg-black/20 backdrop-blur-lg border border-white/10
        hover:shadow-[0_0_30px_rgba(255,90,175,0.15)] transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        p-3 rounded-full bg-gradient-to-r from-[#FF5AAF]/20 to-[#60B5FF]/20
        transition-all duration-300
        ${isHovered ? 'from-[#FF5AAF]/30 to-[#60B5FF]/30 scale-110' : ''}
      `}>
        {getIcon(activity.type)}
      </div>
      
      <div className="flex-1">
        <p className="text-white font-medium">{activity.description}</p>
        <p className="text-white/60 text-sm">{activity.time}</p>
      </div>
    </div>
  );
};

export const RecentActivity = ({ activities = [] }) => {
  // Example activities data
  const defaultActivities = [
    {
      id: 1,
      type: 'win',
      description: 'Won a match against Player123',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'rank_up',
      description: 'Ranked up to Level 5',
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'loss',
      description: 'Lost a close match against Pro456',
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'win',
      description: 'Won a tournament match',
      time: '2 days ago'
    }
  ];

  const allActivities = [...defaultActivities, ...activities];

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-8 text-center relative inline-block">
        Recent Activity
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF5AAF] to-[#60B5FF]" />
      </h2>

      <div className="space-y-4">
        {allActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}; 