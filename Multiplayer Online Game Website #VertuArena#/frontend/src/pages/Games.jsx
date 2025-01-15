import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Games = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef(null);
  const cardWidth = 320; // Fixed card width
  const cardGap = 32; // Gap between cards (2rem)
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1540);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const games = [
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      icon: '❌',
      description: 'Classic 3x3 grid game',
      difficulty: 'Easy',
      players: '2 Players',
      timePerMove: '30 sec',
      bgColor: 'bg-[#FF5AAF]',
      accentColor: '#FF5AAF',
      available: true
    },
    {
      id: 'chess',
      name: 'Chess',
      icon: '♟️',
      description: 'Strategic board game',
      difficulty: 'Hard',
      players: '2 Players',
      timePerMove: '3 min',
      bgColor: 'bg-[#60B5FF]',
      accentColor: '#60B5FF',
      available: false
    },
    {
      id: 'connect-four',
      name: 'Connect Four',
      icon: '🔴',
      description: 'Vertical strategy game',
      difficulty: 'Medium',
      players: '2 Players',
      timePerMove: '45 sec',
      bgColor: 'bg-[#A1F55D]',
      accentColor: '#A1F55D',
      available: false
    },
    {
      id: 'battleship',
      name: 'Battleship',
      icon: '🚢',
      description: 'Naval combat game',
      difficulty: 'Medium',
      players: '2 Players',
      timePerMove: '1 min',
      bgColor: 'bg-[#FFCA2C]',
      accentColor: '#FFCA2C',
      available: false
    }
  ];

  // Calculate visible cards based on container width
  useEffect(() => {
    const updateSliderWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };

    updateSliderWidth();
    window.addEventListener('resize', updateSliderWidth);
    return () => window.removeEventListener('resize', updateSliderWidth);
  }, []);

  const getVisibleCards = () => {
    if (sliderWidth >= 1440) return 4; // Increased breakpoint for 4 cards
    if (sliderWidth >= 1024) return 3;
    if (sliderWidth >= 768) return 2;
    return 1;
  };

  const visibleCards = getVisibleCards();
  const maxSlides = Math.max(0, games.length - visibleCards);

  // Calculate the offset to center the cards
  const calculateOffset = () => {
    const totalWidth = visibleCards * cardWidth + (visibleCards - 1) * cardGap;
    const remainingSpace = sliderWidth - totalWidth;
    return Math.max(0, remainingSpace / 2);
  };

  const centerOffset = calculateOffset();

  const handleNext = () => {
    setActiveSlide(prev => Math.min(prev + 1, maxSlides));
  };

  const handlePrev = () => {
    setActiveSlide(prev => Math.max(prev - 1, 0));
  };

  const handleDotClick = (index) => {
    setActiveSlide(index);
  };

  const handlePlayGame = (gameId, e) => {
    e.stopPropagation(); // Prevent event bubbling
    const game = games.find(g => g.id === gameId);
    if (!game.available) return;
    
    switch (gameId) {
      case 'tic-tac-toe':
        navigate('/matchmaking/tic-tac-toe');
        break;
      case 'chess':
        navigate('/matchmaking/chess');
        break;
      case 'connect-four':
        navigate('/matchmaking/connect-four');
        break;
      case 'battleship':
        navigate('/matchmaking/battleship');
        break;
      default:
        navigate('/matchmaking/tic-tac-toe');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white pt-20 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_500px_at_50%_200px,#3B82F6,transparent)]" />
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(123, 47, 254, 0.15) 0%, transparent 50%)`
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF3D00] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00FF85] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#7B2FFE] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Hexagonal Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23ffffff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header with 3D effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <h1 className="text-5xl md:text-6xl font-bold relative z-10 pb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7B2FFE] via-[#3B82F6] to-[#00FF85]">
              Game Arena
          </span>
          </h1>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[120%] h-40 bg-gradient-to-r from-[#7B2FFE]/20 via-[#3B82F6]/20 to-[#00FF85]/20 blur-3xl -z-10" />
          <p className="text-gray-400 mt-4 text-lg">Choose your battlefield and prove your skills</p>
        </motion.div>

        {isLargeScreen ? (
          // Grid Layout for Large Screens
          <div className="max-w-[1520px] mx-auto grid grid-cols-4 gap-8">
            {games.map((game) => (
              <motion.div
                key={game.id}
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onHoverStart={() => setHoveredGame(game.id)}
                onHoverEnd={() => setHoveredGame(null)}
              >
                {/* Card Container */}
                <div
                  className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 
                    hover:border-white/20 transition-all duration-300 h-full shadow-lg hover:shadow-xl"
                >
                  {/* Gradient Line Top */}
                  <div className="absolute top-0 left-0 w-full h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${game.accentColor}, transparent)`
                    }}
                  />

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Game Icon */}
                    <motion.div
                      animate={{
                        y: hoveredGame === game.id ? -8 : 0,
                        scale: hoveredGame === game.id ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="relative w-24 h-24 mx-auto mb-6"
                    >
                      <div className="absolute inset-0 rounded-full opacity-30 blur-md"
                        style={{
                          background: `radial-gradient(circle at center, ${game.accentColor}, transparent)`
                        }}
                      />
                      <div className="relative flex items-center justify-center w-full h-full text-5xl bg-[#1a1a1a] rounded-full border border-white/10">
                        {game.icon}
                      </div>
                    </motion.div>

                    {/* Game Info */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2"
                        style={{ color: game.accentColor }}
                      >
                        {game.name}
                      </h3>
                      <p className="text-white/60">{game.description}</p>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-2 rounded-xl bg-black/50 border border-white/5">
                        <div className="text-xs text-white/50 mb-1">Level</div>
                        <div className="font-semibold text-white">{game.difficulty}</div>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-black/50 border border-white/5">
                        <div className="text-xs text-white/50 mb-1">Team</div>
                        <div className="font-semibold text-white">{game.players}</div>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-black/50 border border-white/5">
                        <div className="text-xs text-white/50 mb-1">Time</div>
                        <div className="font-semibold text-white">{game.timePerMove}</div>
                      </div>
                    </div>

                    {/* Play Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => handlePlayGame(game.id, e)}
                      className={`w-full py-3 rounded-xl font-bold text-white relative overflow-hidden ${!game.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{
                        background: `linear-gradient(90deg, ${game.accentColor}, ${game.accentColor})`
                      }}
                      disabled={!game.available}
                    >
                      <span className="relative z-10">{game.available ? 'Play Now' : 'Coming Soon'}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </motion.button>
                  </div>

                  {/* Gradient Line Bottom */}
                  <div className="absolute bottom-0 left-0 w-full h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${game.accentColor}, transparent)`
                    }}
                  />

                  {/* Disabled Overlay */}
                  {!game.available && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center px-8 py-6"
                      >
                        <div className="relative">
                          {/* Animated background effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 animate-gradient-x rounded-xl blur-xl" />
                          
                          {/* Content container */}
                          <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-6 overflow-hidden">
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine" />
                            
                            {/* Icon */}
                            <div className="mb-4 text-4xl animate-bounce-slow">🚀</div>
                            
                            {/* Text content */}
                            <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 text-transparent bg-clip-text">
                              Coming Soon
                            </h3>
                            <p className="text-white/80 text-sm">
                              We're crafting something amazing!
                            </p>
                            
                            {/* Progress bar */}
                            <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 animate-progress rounded-full" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
              </div>
        ) : (
          // Slider Layout for Smaller Screens
          <div className="relative max-w-[1520px] mx-auto px-12">
            {/* Cards Container */}
            <div className="overflow-hidden pt-8 pb-8" ref={sliderRef}>
              <motion.div
                className="flex justify-center"
                animate={{
                  x: centerOffset - (activeSlide * (cardWidth + cardGap)),
                }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 200,
                }}
                drag="x"
                dragConstraints={{
                  left: centerOffset - (maxSlides * (cardWidth + cardGap)),
                  right: centerOffset,
                }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  
                  if (swipe < -50) {
                    handleNext();
                  } else if (swipe > 50) {
                    handlePrev();
                  }
                }}
                style={{
                  width: `${games.length * (cardWidth + cardGap) - cardGap}px`,
                  minWidth: '100%',
                }}
              >
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    className="w-[320px] flex-shrink-0"
                    style={{ 
                      marginRight: index === games.length - 1 ? '0' : `${cardGap}px`
                    }}
                    initial={{ y: 0 }}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onHoverStart={() => setHoveredGame(game.id)}
                    onHoverEnd={() => setHoveredGame(null)}
                  >
                    {/* Card Container */}
                    <div
                      className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 
                        hover:border-white/20 transition-all duration-300 h-full shadow-lg hover:shadow-xl"
                    >
                      {/* Gradient Line Top */}
                      <div className="absolute top-0 left-0 w-full h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${game.accentColor}, transparent)`
                        }}
                      />

                      {/* Card Content */}
                      <div className="p-6">
                        {/* Game Icon */}
                        <motion.div
                          animate={{
                            y: hoveredGame === game.id ? -8 : 0,
                            scale: hoveredGame === game.id ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          className="relative w-24 h-24 mx-auto mb-6"
                        >
                          <div className="absolute inset-0 rounded-full opacity-30 blur-md"
                            style={{
                              background: `radial-gradient(circle at center, ${game.accentColor}, transparent)`
                            }}
                          />
                          <div className="relative flex items-center justify-center w-full h-full text-5xl bg-[#1a1a1a] rounded-full border border-white/10">
                            {game.icon}
                          </div>
                        </motion.div>

                        {/* Game Info */}
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold mb-2"
                            style={{ color: game.accentColor }}
                          >
                            {game.name}
                          </h3>
                          <p className="text-white/60">{game.description}</p>
                        </div>

                        {/* Game Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="text-center p-2 rounded-xl bg-black/50 border border-white/5">
                            <div className="text-xs text-white/50 mb-1">Level</div>
                            <div className="font-semibold text-white">{game.difficulty}</div>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-black/50 border border-white/5">
                            <div className="text-xs text-white/50 mb-1">Team</div>
                            <div className="font-semibold text-white">{game.players}</div>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-black/50 border border-white/5">
                            <div className="text-xs text-white/50 mb-1">Time</div>
                            <div className="font-semibold text-white">{game.timePerMove}</div>
                          </div>
                        </div>

                        {/* Play Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => handlePlayGame(game.id, e)}
                          className={`w-full py-3 rounded-xl font-bold text-white relative overflow-hidden ${!game.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{
                            background: `linear-gradient(90deg, ${game.accentColor}, ${game.accentColor})`
                          }}
                          disabled={!game.available}
                        >
                          <span className="relative z-10">{game.available ? 'Play Now' : 'Coming Soon'}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </motion.button>
                      </div>

                      {/* Gradient Line Bottom */}
                      <div className="absolute bottom-0 left-0 w-full h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${game.accentColor}, transparent)`
                        }}
                      />

                      {/* Disabled Overlay */}
                      {!game.available && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center px-8 py-6"
                          >
                            <div className="relative">
                              {/* Animated background effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 animate-gradient-x rounded-xl blur-xl" />
                              
                              {/* Content container */}
                              <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-6 overflow-hidden">
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine" />
                                
                                {/* Icon */}
                                <div className="mb-4 text-4xl animate-bounce-slow">🚀</div>
                                
                                {/* Text content */}
                                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400 text-transparent bg-clip-text">
                                  Coming Soon
                                </h3>
                                <p className="text-white/80 text-sm">
                                  We're crafting something amazing!
                                </p>
                                
                                {/* Progress bar */}
                                <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 animate-progress rounded-full" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              disabled={activeSlide === 0}
              className={`absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center
                rounded-full bg-black/50 backdrop-blur-sm border border-white/10 transition-all duration-300
                ${activeSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/30'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              disabled={activeSlide >= maxSlides}
              className={`absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center
                rounded-full bg-black/50 backdrop-blur-sm border border-white/10 transition-all duration-300
                ${activeSlide >= maxSlides ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:border-white/30'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Progress Bar */}
            <div className="mt-8 flex justify-center items-center gap-2">
              {Array.from({ length: maxSlides + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeSlide === index 
                      ? 'w-8 bg-white' 
                      : 'w-4 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Game Details Modal */}
        <AnimatePresence>
          {selectedGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center"
              onClick={() => setSelectedGame(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-md w-full mx-4"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Background */}
                <div className={`absolute inset-0 ${selectedGame.bgColor} opacity-20 rounded-3xl`} />
                
                {/* Modal Content */}
                <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/10 p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-28 h-28">
                      <div className={`absolute inset-0 ${selectedGame.bgColor} opacity-30 rounded-2xl blur-md`} />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl 
                        flex items-center justify-center text-6xl backdrop-blur-sm border border-white/10">
                        {selectedGame.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                        {selectedGame.name}
                      </h2>
                      <p className="text-white/60">{selectedGame.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5">
                      <div className="text-xs text-white/50 mb-1">Difficulty</div>
                      <div className="font-bold text-white">{selectedGame.difficulty}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5">
                      <div className="text-xs text-white/50 mb-1">Players</div>
                      <div className="font-bold text-white">{selectedGame.players}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-black/20 backdrop-blur-sm border border-white/5">
                      <div className="text-xs text-white/50 mb-1">Time/Move</div>
                      <div className="font-bold text-white">{selectedGame.timePerMove}</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedGame(null)}
                      className="flex-1 px-6 py-3 rounded-xl bg-black/30 text-white/60 border border-white/5
                        hover:bg-black/50 hover:text-white transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handlePlayGame(selectedGame.id);
                        setSelectedGame(null);
                      }}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-white relative overflow-hidden ${selectedGame.bgColor}`}
                    >
                      <span className="relative z-10">Play Now</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 