import React from 'react';

export const DefaultAvatar = ({ name, size = 'md', className = '' }) => {
  // Generate initials from name (up to 2 characters)
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Generate a consistent color based on name
  const getColorClass = (name) => {
    if (!name) return 'from-primary-pink to-primary-blue';
    
    const colorPairs = [
      'from-rose-400 to-orange-300',
      'from-cyan-400 to-blue-500',
      'from-violet-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-fuchsia-400 to-pink-500',
      'from-amber-400 to-yellow-300',
    ];
    
    // Use string charCode sum to pick a consistent color
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorPairs[sum % colorPairs.length];
  };

  // Size classes
  const sizeClasses = {
    'xs': 'w-6 h-6 text-xs',
    'sm': 'w-8 h-8 text-sm',
    'md': 'w-10 h-10 text-base',
    'lg': 'w-12 h-12 text-lg',
    'xl': 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  return (
    <div 
      className={`
        relative rounded-full flex items-center justify-center font-semibold text-white
        bg-gradient-to-br ${getColorClass(name)}
        ${sizeClasses[size] || sizeClasses.md}
        shadow-lg ring-2 ring-white/10
        ${className}
      `}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 opacity-50" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-12 transform translate-y-1/2" />
      </div>
      
      {/* Text with subtle shadow */}
      <span className="relative z-10 transform -translate-y-px text-shadow-sm">
        {getInitials(name)}
      </span>
    </div>
  );
};
