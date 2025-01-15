import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ title, image, link }) => (
  <div className="relative group h-64 rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:z-10">
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
      style={{
        backgroundImage: `url(${image})`,
      }}
    />
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
    
    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-pink transition-colors duration-300">
        {title}
      </h3>
      <Link
        to={link}
        className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-primary-pink to-primary-blue opacity-0 group-hover:opacity-100 transition-all duration-300 hover:from-primary-blue hover:to-primary-pink"
      >
        Play Now
      </Link>
    </div>
  </div>
);

export const GameCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const games = [
    {
      title: "Tic Tac Toe",
      image: "/images/games/tictactoe.jpg",
      link: "/games/tictactoe"
    },
    {
      title: "Chess",
      image: "/images/games/chess.jpg",
      link: "/games/chess"
    },
    {
      title: "Connect Four",
      image: "/images/games/connect4.jpg",
      link: "/games/connect4"
    },
    {
      title: "Battleship",
      image: "/images/games/battleship.jpg",
      link: "/games/battleship"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 relative">
        <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
          Popular Games
        </span>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-pink to-primary-blue" />
      </h2>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/50 rounded-full hover:bg-primary-pink/50 transition-colors duration-300"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-black/50 rounded-full hover:bg-primary-pink/50 transition-colors duration-300"
        >
          →
        </button>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
      </div>
    </div>
  );
}; 