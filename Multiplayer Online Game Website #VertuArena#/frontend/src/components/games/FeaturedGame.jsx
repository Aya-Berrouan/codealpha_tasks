import { Link } from 'react-router-dom';

export const FeaturedGame = () => {
  const featuredGame = {
    title: "Chess",
    description: "Experience the ultimate battle of minds in our featured game of the week. Challenge players worldwide in real-time matches, improve your strategy, and climb the global rankings. With our advanced matchmaking system, you'll always find worthy opponents at your skill level.",
    image: "/images/games/chess-featured.jpg",
    link: "/games/chess"
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-pink/10 via-primary-blue/10 to-primary-green/10 animate-gradient" />
      
      {/* Animated Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary-pink to-transparent opacity-20"
              style={{
                top: `${20 * i}%`,
                left: '-100%',
                right: '-100%',
                animation: `moveLines ${3 + i}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 relative">
          <span className="inline-block relative">
            <span className="relative z-10 bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent">
              Game of the Week
            </span>
            {/* Spotlight Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-spotlight" />
          </span>
        </h2>

        {/* Featured Game Content */}
        <div className="grid md:grid-cols-2 gap-8 items-center backdrop-blur-lg bg-black/30 rounded-2xl p-8 border border-white/10">
          {/* Game Image */}
          <div className="relative group">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                src={featuredGame.image}
                alt={featuredGame.title}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            {/* Glowing Border */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary-pink/50 transition-colors duration-300" />
          </div>

          {/* Game Details */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white group-hover:text-primary-pink transition-colors duration-300">
              {featuredGame.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {featuredGame.description}
            </p>
            <div className="pt-4">
              <Link
                to={featuredGame.link}
                className="relative inline-flex group px-8 py-3 text-lg font-semibold text-white rounded-lg overflow-hidden bg-gradient-to-r from-primary-pink to-primary-blue hover:from-primary-blue hover:to-primary-pink transition-all duration-500"
              >
                <span className="relative z-10">Play Now</span>
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300 bg-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 