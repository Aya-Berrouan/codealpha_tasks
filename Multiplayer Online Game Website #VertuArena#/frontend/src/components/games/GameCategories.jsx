import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ name, icon, description, link }) => (
  <Link
    to={link}
    className="relative group flex flex-col items-center p-6 rounded-xl backdrop-blur-lg bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-primary-pink/50 min-w-[250px] mx-2"
  >
    {/* Background Glow */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-pink/20 to-primary-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Icon */}
    <div className="relative z-10 text-5xl mb-4 text-primary-pink group-hover:text-white transition-colors duration-300 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
      {icon}
    </div>
    
    {/* Content */}
    <div className="relative z-10 text-center">
      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary-pink transition-colors duration-300">
        {name}
      </h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">
        {description}
      </p>
    </div>
  </Link>
);

export const GameCategories = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  const categories = [
    {
      name: "Strategy",
      icon: "🧠",
      description: "Test your tactical skills and strategic thinking",
      link: "/games/category/strategy"
    },
    {
      name: "Arcade",
      icon: "🎮",
      description: "Fast-paced action and endless fun",
      link: "/games/category/arcade"
    },
    {
      name: "Puzzle",
      icon: "🧩",
      description: "Challenge your mind with brain teasers",
      link: "/games/category/puzzle"
    },
    {
      name: "Multiplayer",
      icon: "👥",
      description: "Compete with players worldwide",
      link: "/games/category/multiplayer"
    },
    {
      name: "Card Games",
      icon: "🃏",
      description: "Classic card games with a modern twist",
      link: "/games/category/cards"
    }
  ];

  const scroll = (direction) => {
    const container = containerRef.current;
    const scrollAmount = 300;
    const newPosition = scrollPosition + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  // Update scroll position on scroll
  useEffect(() => {
    const container = containerRef.current;
    
    const handleScroll = () => {
      setScrollPosition(container.scrollLeft);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 relative">
          <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
            Browse by Category
          </span>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-pink to-primary-blue" />
        </h2>

        {/* Categories Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/50 rounded-full hover:bg-primary-pink/50 transition-colors duration-300 transform -translate-x-1/2"
            style={{ display: scrollPosition <= 0 ? 'none' : 'block' }}
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/50 rounded-full hover:bg-primary-pink/50 transition-colors duration-300 transform translate-x-1/2"
            style={{ display: scrollPosition >= containerRef.current?.scrollWidth - containerRef.current?.clientWidth ? 'none' : 'block' }}
          >
            →
          </button>

          {/* Scrollable Container */}
          <div
            ref={containerRef}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex space-x-6 py-4">
              {categories.map((category) => (
                <CategoryCard key={category.name} {...category} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 