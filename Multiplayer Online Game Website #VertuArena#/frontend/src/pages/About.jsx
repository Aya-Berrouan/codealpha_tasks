import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// Main About Component
export const About = () => {
  const [text, setText] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const fullText = 'Welcome to vertuArena.';
  const { user } = useAuth();
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const sections = [
    {
      id: 'welcome',
      icon: '👋',
      title: 'Welcome',
      content: (
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent animate-glow"
          >
            {text}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300"
          >
            Where Real-Time Gaming Meets Innovation
          </motion.p>
        </div>
      )
    },
    {
      id: 'mission',
      icon: '🎯',
      title: 'Our Mission',
      content: (
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-bounce-slow">🎯</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
            Our Mission
          </h2>
          <p className="text-xl text-gray-300">
            To connect players worldwide through immersive real-time gaming, creating unforgettable competitive experiences.
          </p>
        </div>
      )
    },
    {
      id: 'vision',
      icon: '🌟',
      title: 'Our Vision',
      content: (
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6 animate-pulse">🌟</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-blue to-primary-green bg-clip-text text-transparent">
            Our Vision
          </h2>
          <p className="text-xl text-gray-300">
            To become the ultimate platform for competitive and social online gaming, where players can showcase their skills and build lasting connections.
          </p>
        </div>
      )
    },
    {
      id: 'features',
      icon: '✨',
      title: 'Features',
      content: (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
            What Makes Us Special
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: '🎮', title: 'Real-Time Gaming', desc: 'Advanced matchmaking system' },
              { icon: '📊', title: 'Statistics', desc: 'Detailed performance tracking' },
              { icon: '🏆', title: 'Leaderboards', desc: 'Global rankings' },
              { icon: '🤝', title: 'Community', desc: 'Connect with players' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 hover:border-primary-pink/50 group"
              >
                <div className="text-3xl mb-3 group-hover:animate-bounce-slow">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary-pink">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'join',
      icon: user ? '🎮' : '🚀',
      title: user ? 'Start Playing' : 'Join Us',
      content: user ? (
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">🎮</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
            Ready to Play?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Jump into a game and start your winning streak!
          </p>
          <div className="flex justify-center mt-8">
            <Link
              to="/games"
              className="px-12 py-4 text-xl font-semibold text-white rounded-lg bg-gradient-to-r from-primary-pink to-primary-blue hover:from-primary-blue hover:to-primary-pink transition-all duration-500 transform hover:scale-105"
            >
              Play Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce-slow">🚀</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
            Ready to Join the Adventure?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/auth"
              className="px-8 py-3 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-primary-pink to-primary-blue hover:from-primary-blue hover:to-primary-pink transition-all duration-500"
            >
              Get Started
            </Link>
            <Link
              to="/games"
              className="px-8 py-3 text-lg font-semibold text-white rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-500 backdrop-blur-lg border border-white/10"
            >
              Explore Games
            </Link>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relative h-full">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-pink via-primary-blue to-primary-gold opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform-origin:0_0] scale-[1] animate-grid" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {sections[currentSection].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-4 p-6">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(index)}
              className={`group flex flex-col items-center gap-2 ${
                currentSection === index ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                ${currentSection === index 
                  ? 'bg-gradient-to-r from-primary-pink to-primary-blue'
                  : 'bg-white/10 group-hover:bg-white/20'
                } transition-all duration-300`}
              >
                {section.icon}
              </div>
              <span className="text-xs text-white">{section.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 